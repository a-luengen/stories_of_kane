import * as THREE from 'three';
import { CONFIG } from '../config';
import { SOUNDS, type SoundDef } from '../data/sounds';
import type { WeaponDef } from '../data/types';
import type { Animal } from '../entities/Animal';
import type { Npc } from '../entities/Npc';
import type { BurstKind } from '../entities/Particles';
import type { Player } from '../entities/Player';
import type { Impact } from '../entities/Projectiles';
import type { GunSet, ShotRequest } from '../entities/Weapon';
import type { AudioEngine, Spatial, Vec3Like, Voice } from './AudioEngine';
import type { Floor } from '../world/props';
import { footSurface, type FootSurface } from './footSurface';
import { attenuation, distanceLowpass, panFor, shotDelay } from './spatial';
import { planMurmur, type Mood } from './murmur';
import { playMurmur } from './murmurSynth';
import { voiceFor, type VoiceProfile } from './voices';

/** Gun sound for a weapon: its own if defined, else by its look (inline NPC weapons). */
export function gunSound(w: WeaponDef): string {
  if (SOUNDS[`gun.${w.id}`]) return `gun.${w.id}`;
  return w.look.kind === 'pistol' ? 'gun.revolver' : w.look.barrels > 1 ? 'gun.shotgun' : 'gun.rifle';
}

export function reloadSound(w: WeaponDef): string {
  if (SOUNDS[`reload.${w.id}`]) return `reload.${w.id}`;
  return w.look.kind === 'pistol' ? 'reload.revolver' : w.look.barrels > 1 ? 'reload.shotgun' : 'reload.rifle';
}

const SURFACE_SOUND: Record<string, string> = {
  dirt: 'impact.dirt',
  wood: 'impact.wood',
  rock: 'impact.rock',
  metal: 'impact.metal',
  cactus: 'impact.cactus',
};
/** Shootable targets by what they burst into. */
const BURST_SOUND: Partial<Record<BurstKind, string>> = { blood: 'impact.flesh', glass: 'impact.glass', straw: 'impact.wood', wood: 'impact.wood' };

export type Gait = 'walk' | 'run' | 'crouch';

/** How a step sounds per gait: running is louder and brighter, crouch-walking soft and dull. */
const GAIT: Record<Gait, { volume: number; pitch: number; lowpass?: number }> = {
  walk: { volume: 1, pitch: 1 },
  run: { volume: 1.35, pitch: 1.06 },
  crouch: { volume: 0.35, pitch: 0.92, lowpass: 1600 },
};

/** A horse as far as sound cares. */
interface HorseLike {
  readonly pos: THREE.Vector3;
  readonly motor: { speed: number };
  readonly dead?: boolean;
}

/** Who carries a gun that can be drawn and reloaded (player or NPC). */
interface Gunslinger {
  readonly pos: THREE.Vector3;
  readonly weapon: GunSet | null;
  readonly drawn: boolean;
}

/**
 * A session's sounds: the listener (the player, as the camera follows them), positioned playback
 * (distance, pan, air), and the game events that make noise — shots, impacts, hits, whizzes and
 * gun handling. Gun handling is read off the guns' state each step rather than called from the
 * gameplay code.
 */
export class SessionAudio {
  readonly listener = new THREE.Vector3();
  private seen = new WeakMap<object, { reloading: boolean; drawn: boolean; reload: Voice[] }>();
  private voices = new WeakMap<object, VoiceProfile>();
  private tmp = new THREE.Vector3();
  private spatialFn = (pos: Vec3Like, def: SoundDef): Spatial => this.spatial(pos, def);
  /** Who is murmuring right now (a new line cuts the old one off). */
  private talking = new WeakMap<object, Voice>();
  /** Seconds until each standing horse snorts (or whinnies). */
  private idleHorse = new WeakMap<object, number>();
  /** Per animal: seconds until it calls, what it was doing last step, and when it last warned. */
  private animalCalls = new WeakMap<Animal, { left: number; fleeing: boolean; watching: boolean; warnLeft: number; bites: number }>();

  constructor(
    private audio: AudioEngine,
    /** The camera's right axis (world): pan is screen-space left / right of the listener. */
    private right: THREE.Vector3,
  ) {
    audio.spatializer = this.spatialFn;
  }

  dispose(): void {
    // Only if it's still ours (the next map's session may already have taken over).
    if (this.audio.spatializer === this.spatialFn) this.audio.spatializer = null;
  }

  /** A container opens (its own lid sound: creak, scrape, latch). */
  lidOpen(kind: string, pos: THREE.Vector3): void {
    this.audio.play(`lid.${kind}`, { pos });
  }

  /** A container's lid drops shut (wave mode restock). */
  lidClose(pos: THREE.Vector3): void {
    this.audio.play('lid.close', { pos, delay: Math.random() * 0.4 });
  }

  /** Picked something up off the ground. */
  pickup(pos: THREE.Vector3): void {
    this.audio.play('item.pickup', { pos });
  }

  /** Wave mode cues. */
  waveCue(cue: 'bell' | 'cleared' | 'tick' | 'tickLast'): void {
    this.audio.play(`wave.${cue}`);
  }

  setListener(p: THREE.Vector3): void {
    this.listener.set(p.x, 0, p.z);
  }

  /** Distance, pan and air for a world position (see AudioEngine.spatializer). */
  spatial(pos: Vec3Like, def: SoundDef): Spatial {
    const dx = pos.x - this.listener.x;
    const dz = pos.z - this.listener.z;
    const d = Math.hypot(dx, dz);
    const ref = def.ref ?? 4;
    const max = def.maxDistance ?? 40;
    return {
      gain: attenuation(d, ref, max),
      pan: panFor(dx * this.right.x + dz * this.right.z),
      lowpass: distanceLowpass(d, ref, max),
      distance: d,
    };
  }

  /** A shot. Far away it arrives late and muffled, followed by a rolling echo. */
  shot(s: ShotRequest): void {
    const id = gunSound(s.weapon);
    const d = Math.hypot(s.origin.x - this.listener.x, s.origin.z - this.listener.z);
    const delay = shotDelay(d);
    if (delay > 0) {
      this.audio.play(id, { pos: s.origin, delay, lowpass: 1800 });
      this.audio.play('gun.echo', { pos: s.origin, delay: delay + 0.1 });
    } else {
      this.audio.play(id, { pos: s.origin });
    }
  }

  /** A bullet landed: by surface, or by what the target is made of. */
  impact(imp: Impact, burst: BurstKind | null): void {
    const id = burst ? (BURST_SOUND[burst] ?? 'impact.dirt') : (SURFACE_SOUND[imp.surface] ?? 'impact.dirt');
    this.audio.play(id, { pos: imp.point });
  }

  /** A bullet went past the player's head. */
  whizz(point: THREE.Vector3): void {
    this.audio.play('bullet.whizz', { pos: point });
  }

  playerHurt(): void {
    this.audio.play('hurt.player');
  }

  /** An NPC was shot: a grunt in their voice, or a groan if it killed them. */
  npcHit(npc: Npc, died: boolean): void {
    const v = this.voiceOf(npc);
    this.audio.play(died ? 'npc.death' : 'npc.grunt', { pos: npc.pos, pitch: v.pitch / 120 });
  }

  crateBreak(pos: THREE.Vector3): void {
    this.audio.play('crate.break', { pos });
  }

  dryFire(pos: THREE.Vector3): void {
    this.audio.play('gun.dry', { pos });
  }

  /** An NPC says something: murmured in their voice and mood. Returns its length (seconds). */
  speak(npc: Npc, text: string, mood: Mood): number {
    // A merchant's greeting comes as their shop opens: on the UI bus, which keeps playing while
    // the panel pauses the world.
    return this.murmur(npc, npc.pos, text, this.voiceOf(npc), mood, !!npc.def.shop && mood === 'greet');
  }

  /**
   * Murmur a line at `pos` for `who` (an NPC, the wagon trader, …): planned from the text, played
   * as a formant voice. Returns how long it takes, whether or not it could be heard.
   */
  murmur(who: object, pos: THREE.Vector3, text: string, voice: VoiceProfile, mood: Mood, overUi = false): number {
    const plan = planMurmur(text, voice, mood);
    const prev = this.talking.get(who);
    if (prev) this.audio.stop(prev);
    const v = this.audio.play(overUi ? 'npc.murmur.shop' : 'npc.murmur', { pos, generate: (ctx, dest, when, pitch) => playMurmur(ctx, plan, dest, when, pitch) });
    if (v) this.talking.set(who, v);
    return plan.duration;
  }

  /** Each NPC's voice, from their name and body (the same NPC always sounds the same). */
  voiceOf(npc: Npc): VoiceProfile {
    let v = this.voices.get(npc);
    if (!v) {
      v = voiceFor(`${npc.def.id}:${npc.name}`, npc.def.appearance.body);
      this.voices.set(npc, v);
    }
    return v;
  }

  /**
   * Each simulation step: draw / holster and reload noises for everyone with a gun, from the
   * change in their gun's state (a cancelled reload goes quiet).
   */
  watchGuns(people: Iterable<Gunslinger>): void {
    for (const who of people) {
      const w = who.weapon;
      let s = this.seen.get(who);
      if (!s) {
        s = { reloading: false, drawn: who.drawn, reload: [] };
        this.seen.set(who, s);
      }
      const reloading = !!w?.reloading;
      if (reloading && !s.reloading && w) {
        s.reload = [];
        const right = this.audio.play(reloadSound(w.right.def), { pos: who.pos });
        if (right) s.reload.push(right);
        if (w.left) {
          const left = this.audio.play(reloadSound(w.left.def), { pos: who.pos, delay: 0.35 });
          if (left) s.reload.push(left);
        }
      } else if (!reloading && s.reloading) {
        for (const v of s.reload) this.audio.stop(v);
        s.reload = [];
      }
      if (w && who.drawn !== s.drawn) this.audio.play(who.drawn ? 'gun.draw' : 'gun.holster', { pos: who.pos });
      s.reloading = reloading;
      s.drawn = who.drawn;
    }
  }

  /** A foot landed (player or NPC, whose steps are quieter). Returns the surface it hit. */
  step(pos: THREE.Vector3, gait: Gait, floors: readonly Floor[], npc = false): FootSurface {
    const surface = footSurface(pos.x, pos.z, floors);
    const g = GAIT[gait];
    this.audio.play(`step.${surface}`, { pos, volume: g.volume * (npc ? 0.65 : 1), pitch: g.pitch, lowpass: g.lowpass });
    return surface;
  }

  /** A hoof landed; harder at speed, front hooves a little louder. */
  hoof(pos: THREE.Vector3, speed01: number, front: boolean): void {
    this.audio.play('hoof.dirt', { pos, volume: (0.55 + 0.55 * speed01) * (front ? 1 : 0.8), pitch: 0.95 + 0.1 * speed01 });
  }

  /** Mounting up: a snort, sometimes a whinny. */
  horseMount(pos: THREE.Vector3): void {
    this.audio.play(Math.random() < 0.3 ? 'horse.whinny' : 'horse.snort', { pos });
  }

  /** Each step: horses standing around snort now and then (rarely whinny). */
  watchHorses(dt: number, horses: Iterable<HorseLike>): void {
    for (const h of horses) {
      if (h.dead) continue;
      let t = this.idleHorse.get(h) ?? 4 + Math.random() * 12;
      if (h.motor.speed < 0.3) t -= dt;
      if (t <= 0) {
        this.audio.play(Math.random() < 0.18 ? 'horse.whinny' : 'horse.snort', { pos: h.pos });
        t = 9 + Math.random() * 14;
      }
      this.idleHorse.set(h, t);
    }
  }

  /**
   * Each step: animals call now and then (moo, oink, cluck, bark, meow, howl), cry out as they take
   * fright (a herd's stampede rumbles), a dog often barks at whoever walks up, and wild ones warn
   * (growl, roar, rattle) and attack (bite, swipe, strike) — read off their state, like the guns.
   */
  watchAnimals(dt: number, animals: Iterable<Animal>): void {
    for (const a of animals) {
      if (!a.alive) continue;
      const [lo, hi] = a.def.sounds.interval;
      let s = this.animalCalls.get(a);
      if (!s) {
        s = { left: lo + Math.random() * (hi - lo), fleeing: false, watching: false, warnLeft: 0, bites: a.bites };
        this.animalCalls.set(a, s);
      }
      const snd = a.def.sounds;
      const fleeing = a.mode === 'flee';
      if (fleeing && !s.fleeing && snd.stampede) this.audio.play(snd.stampede, { pos: a.pos });
      // Wild ones: a warning as they notice someone (repeated, for a snake's rattle), the attack as it lands.
      const warning = a.mode === 'alert' || (a.mode === 'hunt' && snd.alertEvery !== undefined);
      s.warnLeft -= dt;
      if (snd.alert && warning && (!s.watching || (snd.alertEvery !== undefined && s.warnLeft <= 0))) {
        this.audio.play(snd.alert, { pos: a.pos });
        s.warnLeft = snd.alertEvery ?? 0;
      }
      if (snd.attack && a.bites > s.bites) this.audio.play(snd.attack, { pos: a.pos });
      s.bites = a.bites;
      // Only someone walking up counts (not being petted); wild ones warn instead.
      const watching = a.def.hunts ? warning : a.lookAt !== null && a.petLeft <= 0;
      s.left -= dt;
      const startled = fleeing && !s.fleeing && !a.def.hunts && Math.random() < 0.7;
      const greets = watching && !s.watching && !a.def.hunts && Math.random() < 0.5;
      if (startled || greets || s.left <= 0) {
        this.audio.play(a.def.sounds.call, { pos: a.pos, pitch: fleeing ? 1.15 : 1, delay: fleeing ? Math.random() * 0.3 : 0 });
        s.left = lo + Math.random() * (hi - lo);
      }
      s.fleeing = fleeing;
      s.watching = watching;
    }
  }

  /** A pet is being petted: a cat purrs (a dog just wags). */
  petted(a: Animal): void {
    if (a.def.sounds.pet) this.audio.play(a.def.sounds.pet, { pos: a.pos });
  }

  /** An animal was shot: a squeal (a wolf's yelp), or its death, pitched for its size. */
  animalHit(a: Animal, died: boolean): void {
    const hurt = a.def.sounds.hurt;
    if (hurt && !died) this.audio.play(hurt, { pos: a.pos });
    else this.audio.play(died ? 'animal.death' : 'animal.hit', { pos: a.pos, pitch: a.def.sounds.pitch });
  }

  /** A horse bitten (a squeal), or brought down. */
  horseHurt(pos: THREE.Vector3, died: boolean): void {
    this.audio.play(died ? 'animal.death' : 'horse.whinny', { pos, pitch: died ? 0.6 : 1.15 });
  }

  /** A hoof landed (cows and pigs; chickens are too light to hear). */
  animalStep(a: Animal, speed01: number): void {
    const v = a.def.sounds.step;
    if (v > 0) this.audio.play('hoof.dirt', { pos: a.pos, volume: v * (0.5 + 0.7 * speed01), pitch: 1.1 + (1 - v) * 0.4 });
  }

  /** The player's ear (for whizzes): head height, on foot or in the saddle. */
  ear(p: Player): THREE.Vector3 {
    return this.tmp.set(p.pos.x, p.mounted ? 2.5 : 1.5 - CONFIG.player.crouchDrop * p.crouch, p.pos.z);
  }
}
