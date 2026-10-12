import { describe, expect, it } from 'vitest';
import { RECIPES, SOUNDS } from '../data/sounds';
import { SAMPLES } from '../data/soundManifest';
import { Rng } from '../util/math';
import { SampleBank } from './SampleBank';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from './settings';
import { jitter, pickVariant } from './variants';
import { VoicePool, type PooledVoice } from './VoicePool';

const voice = (sound: string, gain: number, started: number, ends = Infinity): PooledVoice => ({ sound, gain, started, ends });

describe('voice pool', () => {
  it('admits freely below the limit', () => {
    const pool = new VoicePool(3);
    pool.add(voice('a', 1, 0));
    expect(pool.admit('b', 0.5, 0.1)).toEqual({ ok: true, steal: [] });
  });

  it('full: steals the quietest voice, the oldest among equals', () => {
    const pool = new VoicePool(3);
    const loud = voice('a', 0.9, 0);
    const quietOld = voice('b', 0.2, 0);
    const quietNew = voice('c', 0.2, 1);
    for (const v of [loud, quietOld, quietNew]) pool.add(v);
    const r = pool.admit('d', 0.5, 2);
    expect(r).toEqual({ ok: true, steal: [quietOld] });
  });

  it('full of louder voices: a quiet newcomer is dropped instead', () => {
    const pool = new VoicePool(2);
    pool.add(voice('a', 0.9, 0));
    pool.add(voice('b', 0.8, 0));
    expect(pool.admit('c', 0.1, 1)).toEqual({ ok: false, reason: 'busy' });
  });

  it('per-sound limit: a 4th identical footstep replaces the quietest of the 3', () => {
    const pool = new VoicePool(24);
    const steps = [voice('step', 0.5, 0), voice('step', 0.3, 0.1), voice('step', 0.6, 0.2)];
    for (const v of steps) pool.add(v);
    expect(pool.admit('step', 0.5, 0.3, { maxConcurrent: 3 })).toEqual({ ok: true, steal: [steps[1]] });
    expect(pool.admit('other', 0.5, 0.3, { maxConcurrent: 3 })).toEqual({ ok: true, steal: [] });
  });

  it('cooldown: the same sound may not restart too soon', () => {
    const pool = new VoicePool(24);
    pool.add(voice('click', 1, 1.0, 1.05));
    expect(pool.admit('click', 1, 1.02, { cooldown: 0.05 })).toEqual({ ok: false, reason: 'cooldown' });
    expect(pool.admit('click', 1, 1.06, { cooldown: 0.05 }).ok).toBe(true);
  });

  it('prunes finished voices', () => {
    const pool = new VoicePool(24);
    const done = voice('a', 1, 0, 0.5);
    const playing = voice('b', 1, 0, 2);
    pool.add(done);
    pool.add(playing);
    expect(pool.prune(1)).toEqual([done]);
    expect(pool.voices).toEqual([playing]);
  });
});

describe('variants', () => {
  it('never repeats the previous variant when there is a choice', () => {
    const rng = new Rng(1);
    let last: number | undefined;
    const seen = new Set<number>();
    for (let i = 0; i < 200; i++) {
      const v = pickVariant(3, last, () => rng.next());
      expect(v).not.toBe(last);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(3);
      seen.add(v);
      last = v;
    }
    expect(seen.size).toBe(3);
    expect(pickVariant(1, 0)).toBe(0);
  });

  it('jitter stays within ±spread', () => {
    const rng = new Rng(2);
    for (let i = 0; i < 200; i++) {
      const v = jitter(1, 0.06, () => rng.next());
      expect(v).toBeGreaterThanOrEqual(0.94);
      expect(v).toBeLessThanOrEqual(1.06);
    }
    expect(jitter(0.5, 0)).toBe(0.5);
  });
});

describe('sample bank', () => {
  const flush = () => new Promise((r) => setTimeout(r, 0));

  it('missing files: falls back, warning once per sound', async () => {
    const warnings: string[] = [];
    const bank = new SampleBank({ 'gun.x': ['a.ogg', 'b.ogg'] }, '/sounds/', () => Promise.reject(new Error('404')), (m) => warnings.push(m));
    expect(bank.resolve('gun.x').kind).toBe('fallback'); // not started yet
    bank.start();
    bank.start(); // only once
    await flush();
    expect(bank.resolve('gun.x').kind).toBe('fallback');
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('gun.x');
  });

  it('uses whatever variants loaded; a bad one is skipped', async () => {
    const bank = new SampleBank<string>(
      { 'step.dirt': ['s1.ogg', 's2.ogg', 'broken.ogg'] },
      '/base/sounds/',
      (url) => (url.endsWith('broken.ogg') ? Promise.reject(new Error('decode')) : Promise.resolve(`buf:${url}`)),
      () => {},
    );
    bank.start();
    expect(bank.resolve('step.dirt').kind).toBe('fallback'); // still loading
    await flush();
    const rng = new Rng(3);
    const files = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const r = bank.resolve('step.dirt', () => rng.next());
      expect(r.kind).toBe('sample');
      if (r.kind === 'sample') {
        files.add(r.file);
        expect(r.buffer).toBe(`buf:/base/sounds/${r.file}`);
      }
    }
    expect([...files].sort()).toEqual(['s1.ogg', 's2.ogg']);
    expect(bank.fileState('broken.ogg')).toBe('failed');
  });

  it('sounds without samples always use their recipe', () => {
    const bank = new SampleBank({}, '/', () => Promise.reject(new Error('never')));
    expect(bank.hasSamples('ui.click')).toBe(false);
    expect(bank.resolve('ui.click').kind).toBe('fallback');
  });
});

describe('sound data', () => {
  it('every sound has a recipe (so it plays without any sample files)', () => {
    for (const [id, def] of Object.entries(SOUNDS)) expect(RECIPES[def.recipe], id).toBeTruthy();
    for (const id of Object.keys(SAMPLES)) expect(SOUNDS[id], `manifest entry ${id}`).toBeTruthy();
  });
});

describe('settings', () => {
  it('round-trip through storage; bad or missing values fall back to defaults', () => {
    const store = new Map<string, string>();
    const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
    expect(loadSettings(storage)).toEqual(DEFAULT_SETTINGS);
    saveSettings({ ...DEFAULT_SETTINGS, master: 0.3, muted: true }, storage);
    expect(loadSettings(storage)).toMatchObject({ master: 0.3, muted: true });
    store.set('stories-of-kane.audio', JSON.stringify({ master: 7, effects: 'x' }));
    expect(loadSettings(storage)).toMatchObject({ master: 1, effects: DEFAULT_SETTINGS.effects });
    store.set('stories-of-kane.audio', '{nope');
    expect(loadSettings(storage)).toEqual(DEFAULT_SETTINGS);
  });
});
