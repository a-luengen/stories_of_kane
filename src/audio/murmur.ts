import { hashString, type VoiceProfile } from './voices';

/** How a line is delivered. */
export type Mood = 'greet' | 'warn' | 'hostile' | 'flee' | 'calm';

/** Vowel formants (F1, F2, F3 in Hz) for an adult male voice; scaled by VoiceProfile.formant. */
export const VOWELS: readonly [number, number, number][] = [
  [730, 1090, 2440], // a
  [530, 1840, 2480], // e
  [390, 1990, 2550], // i
  [570, 840, 2410], // o
  [440, 1020, 2240], // u
];

export interface MoodStyle {
  /** Pitch × this. */
  pitch: number;
  /** Speed × this (shorter syllables and pauses). */
  tempo: number;
  /** Loudness 0..1. */
  gain: number;
  /** Pitch movement across a phrase (fraction of the base pitch). */
  range: number;
  /** Syllable length kept (clipped delivery < 1). */
  legato: number;
  /** 0 = smooth, 1 = harsh (more buzz and breath, brighter). */
  harsh: number;
}

export const MOODS: Record<Mood, MoodStyle> = {
  greet: { pitch: 1, tempo: 1, gain: 0.75, range: 0.16, legato: 0.92, harsh: 0 },
  warn: { pitch: 1.1, tempo: 1.18, gain: 1, range: 0.2, legato: 0.62, harsh: 0.3 },
  hostile: { pitch: 0.8, tempo: 1.02, gain: 1, range: 0.12, legato: 0.8, harsh: 1 },
  flee: { pitch: 1.32, tempo: 1.5, gain: 0.85, range: 0.26, legato: 0.85, harsh: 0.2 },
  calm: { pitch: 0.94, tempo: 0.76, gain: 0.5, range: 0.09, legato: 1, harsh: 0 },
};

export interface Syllable {
  /** Seconds from the start. */
  start: number;
  dur: number;
  /** Fundamental (Hz) at the start and end of the syllable (glides between). */
  pitch0: number;
  pitch1: number;
  /** Index into VOWELS. */
  vowel: number;
  /** Relative loudness (stressed syllables are louder). */
  gain: number;
}

export interface MurmurPlan {
  syllables: Syllable[];
  /** Seconds until the last syllable ends. */
  duration: number;
  mood: Mood;
  style: MoodStyle;
  voice: VoiceProfile;
}

/** Base timings (seconds) at tempo 1. */
const SYLLABLE = 0.15;
const WORD_GAP = 0.035;
const COMMA = 0.22;
const STOP = 0.36;

/** Rough syllable count of a word: its vowel groups, 1–3. */
export function syllablesIn(word: string): number {
  const groups = word.toLowerCase().match(/[aeiouy]+/g)?.length ?? 1;
  return Math.max(1, Math.min(3, groups));
}

/** Words grouped into phrases, each ended by its punctuation ('' when the text just stops). */
export function phrases(text: string): { words: string[]; end: string }[] {
  const out: { words: string[]; end: string }[] = [];
  let words: string[] = [];
  for (const tok of text.match(/[A-Za-z0-9']+|[.,!?;:]+/g) ?? []) {
    if (/^[.,!?;:]+$/.test(tok)) {
      if (words.length) out.push({ words, end: tok });
      words = [];
    } else {
      words.push(tok);
    }
  }
  if (words.length) out.push({ words, end: '' });
  return out;
}

/**
 * Turn a line into a murmur: one syllable per vowel group, word gaps, pauses at punctuation,
 * and a pitch contour per phrase (up a little, then falling; a question rises at the end; an
 * exclamation starts higher). Deterministic for the same voice, text and mood.
 */
export function planMurmur(text: string, voice: VoiceProfile, mood: Mood): MurmurPlan {
  const style = MOODS[mood];
  const base = voice.pitch * style.pitch;
  const syl = SYLLABLE / style.tempo;
  // This voice favours some vowels over others (its timbre).
  const favour = [0, 1, 2, 3, 4].sort((a, b) => hashString(`${voice.seed}:${a}`) - hashString(`${voice.seed}:${b}`)).slice(0, 3);
  const syllables: Syllable[] = [];
  let t = 0;
  for (const ph of phrases(text)) {
    const count = ph.words.reduce((n, w) => n + syllablesIn(w), 0);
    const question = ph.end.includes('?');
    const exclaim = ph.end.includes('!');
    let i = 0;
    ph.words.forEach((w, wi) => {
      const n = syllablesIn(w);
      const h = hashString(`${voice.seed}|${w.toLowerCase()}`);
      for (let k = 0; k < n; k++, i++) {
        const x = count > 1 ? i / (count - 1) : 0; // 0..1 across the phrase
        // Contour: a gentle rise to ~30 %, then declination; questions climb over the last third.
        let c = Math.sin(Math.min(1, x / 0.3) * Math.PI * 0.5) * 0.6 - x * 0.9;
        if (question) c += Math.max(0, (x - 0.66) / 0.34) * 2.4;
        if (exclaim) c += 0.5 * (1 - x);
        const xNext = count > 1 ? Math.min(1, (i + 1) / (count - 1)) : 0;
        let cNext = Math.sin(Math.min(1, xNext / 0.3) * Math.PI * 0.5) * 0.6 - xNext * 0.9;
        if (question) cNext += Math.max(0, (xNext - 0.66) / 0.34) * 2.4;
        if (exclaim) cNext += 0.5 * (1 - xNext);
        const stressed = k === (h >>> 3) % n;
        const dur = syl * (stressed ? 1.15 : 0.9) * (k === n - 1 && wi === ph.words.length - 1 ? 1.25 : 1);
        syllables.push({
          start: t,
          dur: dur * style.legato,
          pitch0: base * (1 + c * style.range),
          pitch1: base * (1 + cNext * style.range),
          vowel: favour[(h >>> (k * 5)) % favour.length],
          gain: style.gain * (stressed ? 1 : 0.78),
        });
        t += dur;
      }
      t += WORD_GAP / style.tempo;
    });
    t += (ph.end.includes(',') || ph.end.includes(';') || ph.end.includes(':') ? COMMA : ph.end ? STOP : 0) / style.tempo;
  }
  const last = syllables[syllables.length - 1];
  return { syllables, duration: last ? last.start + last.dur : 0, mood, style, voice };
}
