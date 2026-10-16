import { afterEach, describe, expect, it, vi } from 'vitest';
import { saveQuests } from '../quests/save';
import { saveDiscovery } from '../world/discoveryStore';
import { hasStorySave, StoryMode } from './StoryMode';

/** A Map-backed localStorage for these tests. */
function storage() {
  const m = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) });
  // (No quest content is served in tests: the catalog fetch fails quietly.)
  vi.stubGlobal('fetch', async () => ({ ok: false, status: 404, statusText: 'Not Found' }));
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  return m;
}
const engine = { lowW: 342, lowH: 192 } as never;
const save = { quests: { 'the-lost-letter': { id: 'the-lost-letter', status: 'active' as const, step: 1, counter: 0, timers: {}, completions: 0 } }, flags: {}, pois: {}, held: {}, where: { poi: 'the-ridge', exit: 'west' } };

afterEach(() => vi.unstubAllGlobals());

describe('story mode: continue or start over', () => {
  it('no save: "New Game" (and nothing to continue)', () => {
    storage();
    expect(hasStorySave()).toBe(false);
    const m = new StoryMode(engine);
    expect(m.kind).toBe('story');
    expect(m.playthrough.poi).toBe('kanes-crossing');
    expect(m.purse.dollars).toBe(60);
  });

  it('continue: on the POI you were on, at the exit you came in by, with your discovery', () => {
    storage();
    saveQuests('story', save);
    saveDiscovery('story', { pois: { 'kanes-crossing': 'visible', 'the-ridge': 'visible' }, paths: ['town-ridge'] });
    expect(hasStorySave()).toBe(true);
    const m = new StoryMode(engine);
    expect([m.playthrough.poi, m.playthrough.arrivedAt]).toEqual(['the-ridge', 'west']);
    expect(m.playthrough.discovery.poi('the-ridge')).toBe('visible');
  });

  it('a new game wipes the story save (quests and map) and starts in town', () => {
    const m = storage();
    saveQuests('story', save);
    saveDiscovery('story', { pois: { 'kanes-crossing': 'visible', 'the-ridge': 'visible' }, paths: ['town-ridge'] });
    saveQuests('sandbox', save);
    const mode = new StoryMode(engine, { newGame: true });
    expect(mode.playthrough.poi).toBe('kanes-crossing');
    expect(mode.playthrough.discovery.poi('the-ridge')).toBe('undiscovered');
    expect([...m.keys()]).toEqual(['sok.quests.sandbox']); // (the sandbox's save is its own)
  });
});
