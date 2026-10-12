import type { Recipe, RecipeLayer } from '../data/sounds';

const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();

/** Two seconds of white noise, shared per context (noise layers start at a random offset). */
export function noiseBuffer(ctx: BaseAudioContext): AudioBuffer {
  let b = noiseBuffers.get(ctx);
  if (!b) {
    b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    noiseBuffers.set(ctx, b);
  }
  return b;
}

/** Length of a recipe in seconds (its longest layer). */
export function recipeLength(r: Recipe): number {
  return Math.max(...r.layers.map((l) => (l.delay ?? 0) + l.attack + (l.hold ?? 0) + l.decay));
}

/**
 * Schedule a recipe into `dest` at `when`. `pitch` scales every frequency. Returns the sources
 * (so a stolen voice can be stopped early) and when it ends.
 */
export function playRecipe(ctx: BaseAudioContext, recipe: Recipe, dest: AudioNode, when: number, pitch = 1): { sources: AudioScheduledSourceNode[]; ends: number } {
  const sources: AudioScheduledSourceNode[] = [];
  let ends = when;
  for (const l of recipe.layers) {
    const t0 = when + (l.delay ?? 0);
    const len = l.attack + (l.hold ?? 0) + l.decay;
    const t1 = t0 + len;
    ends = Math.max(ends, t1);
    const src = layerSource(ctx, l, t0, len, pitch);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(l.gain, t0 + l.attack);
    env.gain.setValueAtTime(l.gain, t0 + l.attack + (l.hold ?? 0));
    env.gain.exponentialRampToValueAtTime(0.0005, t1);
    let node: AudioNode = src;
    if (l.filter) {
      const f = ctx.createBiquadFilter();
      f.type = l.filter.type;
      f.frequency.setValueAtTime(l.filter.freq * pitch, t0);
      if (l.filter.freqEnd !== undefined) f.frequency.exponentialRampToValueAtTime(Math.max(20, l.filter.freqEnd * pitch), t1);
      if (l.filter.q !== undefined) f.Q.value = l.filter.q;
      node.connect(f);
      node = f;
    }
    node.connect(env);
    env.connect(dest);
    if (src instanceof AudioBufferSourceNode) src.start(t0, Math.random() * 1.5); // noise: a random stretch
    else src.start(t0);
    src.stop(t1 + 0.02);
    sources.push(src);
  }
  return { sources, ends };
}

function layerSource(ctx: BaseAudioContext, l: RecipeLayer, t0: number, len: number, pitch: number): AudioScheduledSourceNode {
  if (l.kind === 'noise') {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuffer(ctx);
    s.loop = true;
    s.playbackRate.value = pitch;
    return s;
  }
  const o = ctx.createOscillator();
  o.type = l.wave ?? 'sine';
  const f0 = (l.freq ?? 440) * pitch;
  o.frequency.setValueAtTime(f0, t0);
  if (l.freqEnd !== undefined) o.frequency.exponentialRampToValueAtTime(Math.max(1, l.freqEnd * pitch), t0 + len);
  return o;
}
