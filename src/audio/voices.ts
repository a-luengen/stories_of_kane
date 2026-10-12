/** A character's voice: the same seed always gives the same voice. */
export interface VoiceProfile {
  /** Fundamental pitch (Hz). */
  pitch: number;
  /** Scales the vowel formants (smaller throats, higher formants). */
  formant: number;
  /** Seed for vowel choices and other per-voice quirks. */
  seed: number;
}

/** FNV-1a: a stable 32-bit hash of a string. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Base pitch from the body type, a per-character offset (±12 %) and formant size, from a seed. */
export function voiceFor(seed: string, body: 'male' | 'female'): VoiceProfile {
  const h = hashString(seed);
  const u = (shift: number) => ((h >>> shift) & 0xff) / 255; // 0..1 from different bits
  const base = body === 'female' ? 205 : 112;
  return {
    pitch: base * (0.88 + 0.24 * u(0)),
    formant: (body === 'female' ? 1.14 : 1) * (0.94 + 0.12 * u(8)),
    seed: h,
  };
}
