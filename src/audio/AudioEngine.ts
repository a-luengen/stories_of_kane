import { CONFIG } from '../config';
import { SAMPLES } from '../data/soundManifest';
import { RECIPES, SOUNDS, type Bus, type SoundDef } from '../data/sounds';
import { SampleBank } from './SampleBank';
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type AudioSettings } from './settings';
import { playRecipe } from './Synth';
import { jitter } from './variants';
import { VoicePool, type PooledVoice } from './VoicePool';

export interface Vec3Like {
  x: number;
  y?: number;
  z: number;
}

/** How a positioned sound reaches the listener. */
export interface Spatial {
  /** Distance attenuation 0..1. */
  gain: number;
  /** Stereo pan −1..1. */
  pan: number;
  /** Low-pass cutoff (Hz): distant sounds are duller. */
  lowpass: number;
  /** Distance to the listener (for debugging). */
  distance: number;
}

export interface PlayOptions {
  /** Multiplies the sound's own volume. */
  volume?: number;
  /** Multiplies its pitch (after the random variation). */
  pitch?: number;
  /** Seconds from now. */
  delay?: number;
  /** World position: attenuated, panned and filtered relative to the listener. */
  pos?: Vec3Like;
  /** Fixed stereo pan for non-positioned sounds. */
  pan?: number;
  /** Extra low-pass (Hz), on top of the distance filter. */
  lowpass?: number;
  /** A sound built at play time (e.g. a murmur) instead of a sample or recipe. */
  generate?: (ctx: BaseAudioContext, dest: AudioNode, when: number, pitch: number) => { sources: AudioScheduledSourceNode[]; ends: number };
}

export interface Voice extends PooledVoice {
  id: number;
  bus: Bus;
  /** Played from a recorded sample, or the synthesized recipe. */
  source: 'sample' | 'synth';
  file?: string;
  volume: number;
  pos?: Vec3Like;
  distance?: number;
  nodes: AudioScheduledSourceNode[];
  out: GainNode;
}

type BusName = Bus | 'master';

/**
 * The game's sound: one Web Audio graph for the whole app (it outlives game sessions).
 * master ← ui, master ← world ← effects / voices / ambience. The context is created on the first
 * user gesture (browsers block audio before that); until then every `play` is a no-op.
 * Samples load in the background; anything without a ready sample plays its synth recipe.
 */
export class AudioEngine {
  ctx: AudioContext | null = null;
  settings: AudioSettings = loadSettings();
  /** Set by the session: how a world position sounds from the listener (null: not positioned). */
  spatializer: ((pos: Vec3Like, def: SoundDef) => Spatial) | null = null;
  readonly pool = new VoicePool<Voice>(CONFIG.audio.maxVoices);
  private bank: SampleBank<AudioBuffer> | null = null;
  private buses = {} as Record<BusName, GainNode>;
  private world: GainNode | null = null;
  private worldPaused = false;
  private nextId = 1;
  private warnedUnknown = new Set<string>();

  constructor(target: EventTarget = window) {
    const unlock = () => {
      this.unlock();
      if (this.ctx?.state === 'running') for (const ev of EVENTS) target.removeEventListener(ev, unlock, true);
    };
    for (const ev of EVENTS) target.addEventListener(ev, unlock, true);
  }

  get ready(): boolean {
    return this.ctx?.state === 'running';
  }

  get muted(): boolean {
    return this.settings.muted;
  }

  /** First gesture: build the graph and start loading samples. */
  unlock(): void {
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      this.ctx = ctx;
      const master = ctx.createGain();
      master.connect(ctx.destination);
      const world = ctx.createGain();
      world.connect(master);
      this.world = world;
      this.buses.master = master;
      for (const b of ['effects', 'voices', 'ambience'] as const) {
        this.buses[b] = ctx.createGain();
        this.buses[b].connect(world);
      }
      this.buses.ui = ctx.createGain();
      this.buses.ui.connect(master);
      this.applyVolumes(true);
      this.bank = new SampleBank(SAMPLES, `${import.meta.env.BASE_URL}sounds/`, (url) =>
        fetch(url)
          .then((r) => {
            if (!r.ok) throw new Error(`${r.status}`);
            return r.arrayBuffer();
          })
          .then((data) => ctx.decodeAudioData(data)),
      );
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    this.bank?.start();
  }

  // ------------------------------------------------------------------------ settings

  setVolume(bus: Exclude<BusName, 'ui'>, v: number): void {
    this.settings[bus] = Math.min(1, Math.max(0, v));
    this.applyVolumes();
    saveSettings(this.settings);
  }

  toggleMute(): boolean {
    this.settings.muted = !this.settings.muted;
    this.applyVolumes();
    saveSettings(this.settings);
    return this.settings.muted;
  }

  resetSettings(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.applyVolumes();
    saveSettings(this.settings);
  }

  private applyVolumes(instant = false): void {
    if (!this.ctx) return;
    const s = this.settings;
    const set = (g: GainNode, v: number, after = 0) => {
      g.gain.cancelScheduledValues(this.ctx!.currentTime);
      if (instant) g.gain.value = v;
      else g.gain.setTargetAtTime(v, this.ctx!.currentTime + after, 0.02);
    };
    // Muting waits a moment, so the "muted" blip is still heard.
    set(this.buses.master, s.muted ? 0 : s.master, s.muted ? 0.2 : 0);
    set(this.buses.effects, s.effects);
    set(this.buses.voices, s.voices);
    set(this.buses.ambience, s.ambience);
    set(this.buses.ui, 0.8);
  }

  /** Pause menu / inventory: world sounds fade out (and new ones are dropped); UI keeps playing. */
  setWorldPaused(paused: boolean): void {
    if (paused === this.worldPaused) return;
    this.worldPaused = paused;
    if (this.ctx && this.world) this.world.gain.setTargetAtTime(paused ? 0 : 1, this.ctx.currentTime, CONFIG.audio.pauseFade / 3);
  }

  // ------------------------------------------------------------------------ playback

  /** Play a sound by id. Returns the voice, or null when it can't / shouldn't play now. */
  play(id: string, opts: PlayOptions = {}): Voice | null {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return null;
    const def = SOUNDS[id];
    if (!def) {
      if (!this.warnedUnknown.has(id)) console.warn(`[audio] unknown sound "${id}"`);
      this.warnedUnknown.add(id);
      return null;
    }
    if (this.worldPaused && def.bus !== 'ui') return null;
    const sp: Spatial = opts.pos && this.spatializer ? this.spatializer(opts.pos, def) : { gain: 1, pan: opts.pan ?? 0, lowpass: 22050, distance: 0 };
    if (sp.gain <= 0.002) return null;
    const volume = jitter(def.volume ?? 1, def.volVar ?? 0.08) * (opts.volume ?? 1);
    const now = ctx.currentTime;
    const admit = this.pool.admit(id, volume * sp.gain, now, def);
    if (!admit.ok) return null;
    for (const v of admit.steal) this.stop(v);

    // source → out (volume × attenuation) → low-pass → pan → bus
    const out = ctx.createGain();
    out.gain.value = volume * sp.gain;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = Math.min(sp.lowpass, opts.lowpass ?? 22050);
    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.max(-1, Math.min(1, sp.pan));
    out.connect(lp).connect(pan).connect(this.buses[def.bus]);

    const when = now + Math.max(0, opts.delay ?? 0);
    const pitch = jitter(1, def.pitchVar ?? 0.05) * (opts.pitch ?? 1);
    const res = !opts.generate && this.bank?.hasSamples(id) ? this.bank.resolve(id) : ({ kind: 'fallback' } as const);
    let nodes: AudioScheduledSourceNode[];
    let ends: number;
    if (opts.generate) {
      ({ sources: nodes, ends } = opts.generate(ctx, out, when, pitch));
    } else if (res.kind === 'sample') {
      const s = ctx.createBufferSource();
      s.buffer = res.buffer;
      s.playbackRate.value = pitch;
      s.connect(out);
      s.start(when);
      nodes = [s];
      ends = when + res.buffer.duration / pitch;
    } else {
      ({ sources: nodes, ends } = playRecipe(ctx, RECIPES[def.recipe], out, when, pitch));
    }
    const voice: Voice = {
      id: this.nextId++,
      sound: id,
      bus: def.bus,
      source: res.kind === 'sample' ? 'sample' : 'synth',
      file: res.kind === 'sample' ? res.file : undefined,
      volume,
      gain: volume * sp.gain,
      started: now,
      ends,
      pos: opts.pos ? { x: opts.pos.x, y: opts.pos.y, z: opts.pos.z } : undefined,
      distance: opts.pos ? sp.distance : undefined,
      nodes,
      out,
    };
    this.pool.add(voice);
    return voice;
  }

  /** Stop a voice early (a short fade, no click). */
  stop(v: Voice): void {
    this.pool.remove(v);
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    v.out.gain.cancelScheduledValues(t);
    v.out.gain.setValueAtTime(v.out.gain.value, t);
    v.out.gain.linearRampToValueAtTime(0, t + 0.03);
    for (const n of v.nodes) {
      try {
        n.stop(t + 0.04);
      } catch {
        // already stopped
      }
    }
    setTimeout(() => v.out.disconnect(), 80);
  }

  /** Every frame: let finished voices go. */
  update(): void {
    if (!this.ctx) return;
    for (const v of this.pool.prune(this.ctx.currentTime)) setTimeout(() => v.out.disconnect(), 50);
  }

  /** Playing voices (for the sound debug view, 9). */
  get voices(): readonly Voice[] {
    return this.pool.voices;
  }

  /** Sample file states (debug). */
  sampleState(file: string): string {
    return this.bank?.fileState(file) ?? 'idle';
  }
}

const EVENTS = ['pointerdown', 'keydown', 'touchstart'];
