import { VOWELS, type MurmurPlan } from './murmur';
import { noiseBuffer } from './Synth';

/**
 * Play a murmur: a buzzy voiced source (plus breath) shaped by three formant band-passes that
 * glide from vowel to vowel, gated per syllable, then dulled by a low-pass — speech through a
 * wall: the voice, its melody and rhythm, but no words.
 */
export function playMurmur(ctx: BaseAudioContext, plan: MurmurPlan, dest: AudioNode, when: number, pitch = 1): { sources: AudioScheduledSourceNode[]; ends: number } {
  const { style, voice } = plan;
  const ends = when + plan.duration + 0.15;

  const voiced = ctx.createOscillator();
  voiced.type = 'sawtooth';
  const buzz = ctx.createOscillator(); // a slightly detuned second source: rougher when harsh
  buzz.type = 'sawtooth';
  buzz.detune.value = 9;
  const buzzGain = ctx.createGain();
  buzzGain.gain.value = 0.15 + 0.6 * style.harsh;
  const breath = ctx.createBufferSource();
  breath.buffer = noiseBuffer(ctx);
  breath.loop = true;
  const breathGain = ctx.createGain();
  breathGain.gain.value = 0.06 + 0.18 * style.harsh;

  const amp = ctx.createGain();
  amp.gain.value = 0;
  voiced.connect(amp);
  buzz.connect(buzzGain).connect(amp);
  breath.connect(breathGain).connect(amp);

  // Three formants in parallel.
  const muffle = ctx.createBiquadFilter();
  muffle.type = 'lowpass';
  muffle.frequency.value = 1150 + 900 * style.harsh;
  muffle.Q.value = 0.5;
  const makeup = ctx.createGain();
  makeup.gain.value = 2.6;
  muffle.connect(makeup).connect(dest);
  const formants = [
    { q: 5, g: 1 },
    { q: 8, g: 0.55 },
    { q: 10, g: 0.25 + 0.25 * style.harsh },
  ].map(({ q, g }) => {
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.value = g;
    amp.connect(f).connect(gain).connect(muffle);
    return f;
  });

  const first = plan.syllables[0];
  const f0 = (first?.pitch0 ?? voice.pitch) * pitch;
  for (const o of [voiced, buzz]) o.frequency.setValueAtTime(f0, when);
  if (first) VOWELS[first.vowel].forEach((hz, k) => formants[k].frequency.setValueAtTime(hz * voice.formant, when));

  const attack = style.legato < 0.8 ? 0.012 : 0.03;
  plan.syllables.forEach((s, i) => {
    const t0 = when + s.start;
    const t1 = t0 + s.dur;
    // Within a phrase the voice keeps going and only dips between syllables (a stream, not
    // beeps); it falls silent at word breaks of a clipped delivery and at pauses.
    const next = plan.syllables[i + 1];
    const gap = next ? next.start - (s.start + s.dur) : Infinity;
    const floor = gap < 0.06 ? s.gain * (style.legato < 0.8 ? 0.12 : 0.4) : 0;
    // Pitch glides through each syllable (and on into the next).
    for (const o of [voiced, buzz]) {
      o.frequency.linearRampToValueAtTime(s.pitch0 * pitch, t0);
      o.frequency.linearRampToValueAtTime(s.pitch1 * pitch, t1);
    }
    VOWELS[s.vowel].forEach((hz, k) => formants[k].frequency.setTargetAtTime(hz * voice.formant, t0, 0.03));
    amp.gain.setTargetAtTime(s.gain * 0.5, t0, attack / 3);
    amp.gain.setTargetAtTime(floor * 0.5, Math.max(t0 + attack, t1 - 0.05), floor > 0 ? 0.03 : 0.015);
  });

  for (const src of [voiced, buzz]) {
    src.start(when);
    src.stop(ends);
  }
  breath.start(when, Math.random() * 1.5);
  breath.stop(ends);
  return { sources: [voiced, buzz, breath], ends };
}
