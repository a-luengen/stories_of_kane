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

describe('story mode and the sandbox\'s places', () => {
  it("the gunsmith's directions to Two Spurs Ranch (a sandbox place) don't apply: he just greets you", async () => {
    storage();
    const { NPCS } = await import('../data/npcs');
    const { Npc } = await import('../entities/Npc');
    const def = NPCS.find((d) => d.id === 'gunsmith')!;
    const gunsmith = new Npc(def);
    const m = new StoryMode(engine);
    (m as unknown as { giveDirections(s: unknown): void }).giveDirections({ npcs: { npcs: [gunsmith] } });
    expect(() => gunsmith.interact()).not.toThrow();
    expect(def.lines!.greet).toContain(gunsmith.speech);
    expect(m.playthrough.discovery.save().pois).not.toHaveProperty('two-spurs-ranch');
  });

  it("the town's map scrap to the gulch isn't in the story's chest (the sandbox keeps it)", async () => {
    const { buildSandboxMap } = await import('../world/maps/sandbox');
    const { TargetSystem } = await import('../entities/Targets');
    const { dropForeignMapScraps } = await import('./FrontierMode');
    const { SANDBOX_WORLD, STORY_WORLD } = await import('../data/world');
    const scraps = (w: typeof SANDBOX_WORLD) => {
      const town = buildSandboxMap(new TargetSystem());
      dropForeignMapScraps(town.containers, w);
      return town.containers.flatMap((c) => c.extras);
    };
    expect(scraps(SANDBOX_WORLD)).toEqual(['map_scrap_gulch']);
    expect(scraps(STORY_WORLD)).toEqual([]);
  });

  it('discovery ignores places another mode has', async () => {
    const { Discovery } = await import('../world/Discovery');
    const { STORY_WORLD } = await import('../data/world');
    const d = new Discovery(STORY_WORLD);
    expect(d.learn('two-spurs-ranch')).toEqual([]);
    expect(d.save().pois).not.toHaveProperty('two-spurs-ranch');
  });
});
