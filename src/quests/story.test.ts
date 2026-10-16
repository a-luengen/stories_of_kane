import { describe, expect, it, vi } from 'vitest';
import { NavGrid } from '../ai/NavGrid';
import { poiById, SANDBOX_WORLD, STORY_WORLD, validateWorld, worldOf } from '../data/world';
import { TargetSystem } from '../entities/Targets';
import { hasItemDef } from '../items/ItemDef';
import { buildRidgeMap, RIDGE_AREAS } from '../world/maps/theRidge';
import { POI_MAPS } from '../world/poiMaps';
import type { QuestHooksFactory } from './api';
import { DialogRunner, dialogsFor } from './dialog';
import { HOOK_MODULES } from './loader';
import { QuestRuntime } from './QuestRuntime';
import { QuestSystem } from './QuestSystem';
import { FakeWorld } from './testkit';
import type { CatalogEntry, QuestCatalog, QuestMode, QuestPack } from './types';
import { validateCatalog, validatePack } from './validate';

const PACKS = import.meta.glob<QuestPack>('../../public/quests/*/quest.json', { eager: true, import: 'default' });
const CATALOG = Object.values(import.meta.glob<QuestCatalog>('../../public/quests/index.json', { eager: true, import: 'default' }))[0];
const packOf = (id: string) => Object.entries(PACKS).find(([k]) => k.includes(`/${id}/`))![1];
const RAW_INDEX = Object.values(import.meta.glob<string>('../../public/quests/index.json', { eager: true, query: '?raw', import: 'default' }))[0];

const ctxFor = (mode: QuestMode) => {
  const w = worldOf(mode);
  return { pois: new Set(w.pois.map((p) => p.id)), paths: new Set(w.paths.map((p) => p.id)), itemExists: hasItemDef };
};

/** The game, for the story: the town and the Ridge. */
function storyWorld() {
  const world = new FakeWorld();
  world.disc = new Map([['kanes-crossing', 'visible'], ['the-ridge', 'undiscovered']]);
  world.poiName = (poi: string) => poiById(STORY_WORLD, poi).name;
  return world;
}

function storyRuntime(ids: string[], world = storyWorld(), hooks: Record<string, QuestHooksFactory> = {}) {
  const packs = new Map(ids.map((id) => [id, { pack: packOf(id), hooks: hooks[id] ?? null }]));
  const catalog = CATALOG.quests.filter((e) => e.modes.includes('story'));
  const rt = new QuestRuntime({ catalog, world, packs: { get: (id) => packs.get(id) ?? null, load: async (id) => packs.get(id) ?? null } });
  return { rt, world };
}

const say = (d: DialogRunner, text: string) => {
  const i = d.line!.choices.findIndex((c) => c.text === text);
  expect(i, `"${text}" in ${d.line!.choices.map((c) => c.text).join(' | ')}`).toBeGreaterThanOrEqual(0);
  d.pick(i);
};
const talk = (rt: QuestRuntime, npc: string, merchant = false) => new DialogRunner(rt, dialogsFor(rt, npc), { npcName: 'X', greeting: 'Howdy.', merchant, poi: npc.split(':')[0], openShop: () => {} });

// ------------------------------------------------------------------ the world

describe('the story world', () => {
  it('Kane\'s Crossing (start) and the Ridge (undiscovered), one trail between them; every map exists', () => {
    expect(validateWorld(STORY_WORLD, Object.keys(POI_MAPS))).toEqual([]);
    expect(STORY_WORLD.start.poi).toBe('kanes-crossing');
    const ridge = poiById(STORY_WORLD, 'the-ridge');
    expect([ridge.type, ridge.start]).toEqual(['camp', 'undiscovered']);
    expect(poiById(STORY_WORLD, 'kanes-crossing').exits.map((e) => e.id)).toEqual(['east']);
    expect(STORY_WORLD.paths.map((p) => `${p.from.poi}/${p.from.exit} > ${p.to.poi}/${p.to.exit}`)).toEqual(['kanes-crossing/east > the-ridge/west']);
  });

  it('the Ridge: camp, lookout and every quest NPC reachable from the trail; named areas and containers', () => {
    const map = buildRidgeMap(new TargetSystem(), poiById(STORY_WORLD, 'the-ridge').exits);
    const nav = new NavGrid(map.collision, map.half);
    const west = poiById(STORY_WORLD, 'the-ridge').exits[0];
    const reach = (x: number, z: number) => nav.findPath(west.arrive[0], west.arrive[1], x, z);
    expect(nav.isFree(west.arrive[0], west.arrive[1])).toBe(true);
    expect(reach(west.at[0], west.at[1])).not.toBeNull();
    for (const a of RIDGE_AREAS) expect(reach((a.minX + a.maxX) / 2, (a.minZ + a.maxZ) / 2), a.id).not.toBeNull();
    for (const id of ['bounty-on-the-ridge', 'errand-against-the-clock']) {
      for (const n of packOf(id).npcs ?? []) expect(reach(n.spawn[0], n.spawn[1]), `${id}/${n.id}`).not.toBeNull();
    }
    expect(map.areas!.map((a) => a.id)).toEqual(['camp', 'camp-entrance', 'lookout']);
    expect(map.containers.map((c) => c.id)).toEqual(['crate-camp', 'ammo-camp', 'chest-camp', 'barrel-camp']);
    expect(map.update).toBeTypeOf('function'); // (the campfire)
  });
});

// ------------------------------------------------------------------ content

describe('the quest content', () => {
  it('every pack is valid in the world of each of its modes', () => {
    expect(Object.keys(PACKS)).toHaveLength(7);
    for (const p of Object.values(PACKS)) {
      for (const mode of p.modes) {
        const v = validatePack(p, ctxFor(mode), p.id);
        expect(v.ok ? [] : v.errors, `${p.id} (${mode})`).toEqual([]);
      }
    }
  });

  it('the catalog is small, valid for both modes, and lists each pack', () => {
    expect(RAW_INDEX.length).toBeLessThan(5000);
    for (const mode of ['story', 'sandbox'] as const) expect(validateCatalog(CATALOG, ctxFor(mode), mode).ok).toBe(true);
    expect(CATALOG.quests.map((e) => e.id).sort()).toEqual(Object.values(PACKS).map((p) => p.id).sort());
    for (const e of CATALOG.quests) expect(e.modes).toEqual(packOf(e.id).modes);
  });

  it('the sandbox offers only its own quests; the story begins with the storyStart one', () => {
    const forMode = (m: QuestMode) => CATALOG.quests.filter((e: CatalogEntry) => e.modes.includes(m)).map((e) => e.id);
    expect(forMode('sandbox')).toEqual(['the-lost-letter', 'hunt-bison', 'hunt-wolves', 'hunt-grizzly', 'hunt-snakes']);
    expect(forMode('story')).toEqual(['the-lost-letter', 'bounty-on-the-ridge', 'errand-against-the-clock']);
    expect(CATALOG.quests.filter((e) => e.storyStart).map((e) => e.id)).toEqual(['the-lost-letter']);
  });

  it('a hooks chunk only for the errand, imported only when its pack loads', async () => {
    expect(Object.keys(HOOK_MODULES)).toEqual(['./errand-against-the-clock/hooks.ts']);
    const importer = vi.fn(HOOK_MODULES['./errand-against-the-clock/hooks.ts']);
    const get = vi.fn(async (url: string) => {
      if (url.endsWith('index.json')) return CATALOG;
      const id = /quests\/([\w-]+)\//.exec(url)![1];
      return packOf(id);
    });
    const qs = new QuestSystem({ mode: 'story', world: STORY_WORLD, game: storyWorld(), get, base: '/quests/', saved: null, persist: false, hooks: { './errand-against-the-clock/hooks.ts': importer } });
    await qs.whenReady();
    expect(importer).not.toHaveBeenCalled();
    await qs.loader.load('bounty-on-the-ridge', 'debug');
    expect(importer).not.toHaveBeenCalled();
    const lp = await qs.loader.load('errand-against-the-clock', 'debug');
    expect(importer).toHaveBeenCalledTimes(1);
    expect(lp?.hooks).toBeTypeOf('function');
  });
});

// ------------------------------------------------------------------ The Lost Letter (story start)

describe('The Lost Letter in the story', () => {
  it('starts by itself; the tailor\'s talk moves it on (not just saying hello); then it unlocks the other two', async () => {
    const { rt, world } = storyRuntime(['the-lost-letter', 'bounty-on-the-ridge', 'errand-against-the-clock']);
    expect(rt.available('bounty-on-the-ridge')).toBe(false);
    await rt.start('the-lost-letter');
    expect(world.toasts.at(-1)).toBe('Quest started: The Lost Letter');
    rt.emit({ type: 'talkedTo', poi: 'kanes-crossing', npc: 'tailor' });
    expect(rt.currentStep('the-lost-letter')!.id).toBe('ask'); // (hello isn't enough)
    const d = talk(rt, 'kanes-crossing:tailor', true);
    say(d, 'The Lost Letter');
    say(d, 'I can look for it.');
    expect(rt.currentStep('the-lost-letter')!.id).toBe('find');
    world.bags.set('tailors-letter', 1);
    rt.update(0);
    say(talk(rt, 'kanes-crossing:gunsmith'), 'A letter from the tailor.');
    expect(rt.state('the-lost-letter')!.status).toBe('completed');
    expect([rt.available('bounty-on-the-ridge'), rt.available('errand-against-the-clock')]).toEqual([true, true]);
  });
});

// ------------------------------------------------------------------ Bounty on the Ridge

describe('Bounty on the Ridge', () => {
  async function accepted() {
    const s = storyRuntime(['the-lost-letter', 'bounty-on-the-ridge']);
    s.rt.states.set('the-lost-letter', { id: 'the-lost-letter', status: 'completed', step: 3, counter: 0, timers: {}, completions: 1 });
    const d = talk(s.rt, 'kanes-crossing:gunsmith', true);
    say(d, 'Bounty on the Ridge');
    say(d, "Where's this Ridge?");
    say(d, "Then I'll ride.");
    return s;
  }

  it('accepting puts the Ridge (and its trail) on the map', async () => {
    const { rt, world } = await accepted();
    expect(rt.state('bounty-on-the-ridge')!.status).toBe('active');
    expect(world.discovery('the-ridge')).toBe('hidden');
    expect(world.paths).toEqual(['town-ridge']);
  });

  it('ride there, the gang turns up (0/3), kills counted, poster from the leader\'s body, back to the gunsmith', async () => {
    const { rt, world } = await accepted();
    world.poi = 'the-ridge';
    rt.emit({ type: 'poiEntered', poi: 'the-ridge' });
    expect(rt.currentStep('bounty-on-the-ridge')!.id).toBe('fight');
    expect(world.setups.map((s) => (s.entry.type === 'spawn' ? s.entry.npc : `${s.entry.item} on ${'corpse' in s.entry ? s.entry.corpse : '?'}`))).toEqual([
      'the-ridge:doyle',
      'the-ridge:gang-rifle',
      'the-ridge:gang-shotgun',
      'wanted-poster on the-ridge:doyle',
    ]);
    for (const n of ['gang-rifle', 'doyle', 'gang-shotgun']) rt.emit({ type: 'npcKilled', poi: 'the-ridge', npc: n });
    expect(world.toasts.filter((t) => t.startsWith('Bandits'))).toEqual(['Bandits 1/3', 'Bandits 2/3', 'Bandits 3/3']);
    world.bags.set('wanted-poster', 1);
    rt.update(0);
    expect(world.toasts.slice(-2)).toEqual(['Wanted poster 1/1', "Next: Bring the poster to the gunsmith (Kane's Crossing)"]);
    world.poi = 'kanes-crossing';
    rt.emit({ type: 'poiEntered', poi: 'kanes-crossing' });
    const d = talk(rt, 'kanes-crossing:gunsmith', true);
    say(d, 'Bounty on the Ridge');
    say(d, "Doyle's done. Here's the poster.");
    expect(rt.state('bounty-on-the-ridge')!.status).toBe('completed');
    expect(world.dollars).toBe(220);
  });

  it('fails if the gunsmith dies (wherever you are), and can be taken again', async () => {
    const { rt, world } = await accepted();
    world.poi = 'the-ridge';
    rt.emit({ type: 'npcKilled', poi: 'kanes-crossing', npc: 'gunsmith' });
    expect(rt.state('bounty-on-the-ridge')).toMatchObject({ status: 'failed', failReason: 'The gunsmith is dead - nobody will pay the bounty' });
    expect(world.cleaned).toEqual(['bounty-on-the-ridge']);
    expect(rt.available('bounty-on-the-ridge')).toBe(true);
  });
});

// ------------------------------------------------------------------ Errand Against the Clock

describe('Errand Against the Clock', () => {
  async function accepted() {
    const mod = (await HOOK_MODULES['./errand-against-the-clock/hooks.ts']()) as { default: QuestHooksFactory };
    const s = storyRuntime(['the-lost-letter', 'errand-against-the-clock'], storyWorld(), { 'errand-against-the-clock': mod.default });
    s.rt.states.set('the-lost-letter', { id: 'the-lost-letter', status: 'completed', step: 3, counter: 0, timers: {}, completions: 1 });
    const d = talk(s.rt, 'kanes-crossing:tailor', true);
    say(d, 'Errand Against the Clock');
    say(d, "I'll ride now.");
    s.rt.update(0);
    return s;
  }
  const reachLookout = (rt: QuestRuntime, world: FakeWorld) => {
    world.poi = 'the-ridge';
    rt.emit({ type: 'poiEntered', poi: 'the-ridge' });
    world.areas.add('the-ridge:lookout');
    rt.emit({ type: 'areaEntered', poi: 'the-ridge', area: 'lookout' });
  };

  it('quick: Eli is impressed, and adds $20 (the hooks read the time left)', async () => {
    const { rt, world } = await accepted();
    expect(world.countItem('elis-medicine')).toBe(1);
    rt.update(20); // to the exit
    rt.update(4); // the ride
    reachLookout(rt, world);
    expect(world.spawned.length + world.setups.filter((s) => s.entry.type === 'spawn').length).toBeGreaterThan(0); // (Eli turned up)
    const d = talk(rt, 'the-ridge:eli');
    expect(d.line!.text).toContain('rode like the devil');
    say(d, 'Drink up.');
    expect(rt.state('errand-against-the-clock')!.status).toBe('completed');
    expect(world.dollars).toBe(100 + 60 + 20);
    expect(world.toasts).toContain('Eli presses an extra $20 on you for the haste');
  });

  it('slow: he says so, no bonus', async () => {
    const { rt, world } = await accepted();
    rt.update(100);
    reachLookout(rt, world);
    const d = talk(rt, 'the-ridge:eli');
    expect(d.line!.text).toContain('sweet time');
    say(d, 'Here. Drink.');
    expect(world.dollars).toBe(160);
  });

  it('the clock runs during the ride; when it runs out the quest fails and the medicine is gone', async () => {
    const { rt, world } = await accepted();
    for (let t = 0; t < 151; t++) rt.update(1);
    expect(rt.state('errand-against-the-clock')).toMatchObject({ status: 'failed', failReason: 'The medicine spoiled in the heat' });
    expect(world.cleaned).toEqual(['errand-against-the-clock']);
  });
});

// ------------------------------------------------------------------ the sandbox world is untouched

describe('the sandbox', () => {
  it('its world is its own: the Ridge isn\'t one of its places', () => {
    expect(SANDBOX_WORLD.pois.map((p) => p.id)).toEqual(['kanes-crossing', 'two-spurs-ranch', 'rattlesnake-gulch', 'desert-plains', 'gun-range']);
    expect(validatePack(packOf('bounty-on-the-ridge'), ctxFor('sandbox'), 'bounty-on-the-ridge').ok).toBe(false);
  });
});
