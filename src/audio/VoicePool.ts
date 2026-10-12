/** What the pool needs to know about a playing voice. */
export interface PooledVoice {
  sound: string;
  /** When it started (seconds, audio clock). */
  started: number;
  /** When it ends on its own (Infinity for loops). */
  ends: number;
  /** Effective loudness (volume × distance attenuation): the quietest is stolen first. */
  gain: number;
}

export interface VoiceRules {
  /** At most this many of this sound at once. */
  maxConcurrent?: number;
  /** Minimum seconds between starts of this sound. */
  cooldown?: number;
}

export type Admission<V> = { ok: true; steal: V[] } | { ok: false; reason: 'cooldown' | 'busy' };

/**
 * Voice bookkeeping, independent of Web Audio: a global voice limit, per-sound concurrency and
 * cooldowns. When full, the quietest voice (the oldest among equals) makes way — unless the new
 * sound would be quieter still, then the new one is dropped.
 */
export class VoicePool<V extends PooledVoice> {
  readonly voices: V[] = [];
  private lastStart = new Map<string, number>();

  constructor(public maxVoices: number) {}

  /** Forget voices that have finished by `now`. */
  prune(now: number): V[] {
    const done = this.voices.filter((v) => v.ends <= now);
    for (const v of done) this.remove(v);
    return done;
  }

  /** May `sound` start now at loudness `gain`? Lists the voices that must stop to make room. */
  admit(sound: string, gain: number, now: number, rules: VoiceRules = {}): Admission<V> {
    const last = this.lastStart.get(sound);
    if (rules.cooldown && last !== undefined && now - last < rules.cooldown) return { ok: false, reason: 'cooldown' };
    const steal: V[] = [];
    if (rules.maxConcurrent !== undefined) {
      const same = this.voices.filter((v) => v.sound === sound);
      if (same.length >= rules.maxConcurrent) {
        const victim = weakest(same);
        if (victim.gain > gain) return { ok: false, reason: 'busy' };
        steal.push(victim);
      }
    }
    if (this.voices.length - steal.length >= this.maxVoices) {
      const victim = weakest(this.voices.filter((v) => !steal.includes(v)));
      if (!victim || victim.gain > gain) return { ok: false, reason: 'busy' };
      steal.push(victim);
    }
    return { ok: true, steal };
  }

  add(v: V): void {
    this.voices.push(v);
    this.lastStart.set(v.sound, v.started);
  }

  remove(v: V): void {
    const i = this.voices.indexOf(v);
    if (i >= 0) this.voices.splice(i, 1);
  }
}

/** Quietest first; the oldest among equally quiet ones. */
function weakest<V extends PooledVoice>(list: V[]): V {
  return list.reduce((a, b) => (b.gain < a.gain - 1e-6 || (Math.abs(b.gain - a.gain) <= 1e-6 && b.started < a.started) ? b : a));
}
