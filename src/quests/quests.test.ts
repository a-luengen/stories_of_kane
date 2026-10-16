import { describe, expect, it, vi } from 'vitest';
import { SANDBOX_WORLD } from '../data/world';
import { loadCatalog } from './catalog';
import { PackLoader } from './loader';
import { QuestRuntime, type QuestSaveData } from './QuestRuntime';
import { QuestSystem } from './QuestSystem';
import { loadQuestSave, saveQuests } from './save';
import type { CatalogEntry, QuestPack, SetupDef } from './types';
import { validatePack } from './validate';
import { ctx, entry, FakeWorld, memoryPacks, pack, POIS, runtime } from './testkit';

// ------------------------------------------------------------------ fixtures

// ------------------------------------------------------------------ validation

describe('pack validation', () => {
  it('a good pack passes', () => {
    const p = pack('good', {
      items: [{ id: 'letter', name: 'Letter', description: 'A letter.', shape: 'letter' }],
      npcs: [{ id: 'boss', poi: 'rattlesnake-gulch', group: 'outlaws', spawn: [0, 0] as [number, number], def: {} }],
      steps: [
        { id: 'a', type: 'collect', item: 'letter', objective: 'Find it', setup: [{ type: 'placeItem', item: 'letter', container: 'kanes-crossing:chest-porch' }] },
        { id: 'b', type: 'defeat', group: 'outlaws', objective: 'Clear the camp', setup: [{ type: 'spawn', npc: 'rattlesnake-gulch:boss' }] },
        { id: 'c', type: 'goto', poi: 'two-spurs-ranch', objective: 'Ride to the ranch' },
        { id: 'd', type: 'deliver', npc: 'kanes-crossing:gunsmith', item: 'letter', objective: 'Bring it' },
      ],
      dialogs: [{ id: 'd', npc: 'kanes-crossing:tailor', start: 'n1', nodes: [{ id: 'n1', text: 'Hi', choices: [{ text: 'Bye', do: [{ type: 'reveal', poi: 'rattlesnake-gulch' }] }] }] }],
      rewards: { money: 10, items: [{ item: 'bandage', count: 2 }] },
      fail: [{ type: 'timer', seconds: 60 }],
    });
    expect(validatePack(JSON.parse(JSON.stringify(p)), ctx, 'good')).toEqual({ ok: true, value: p });
  });

  it('a broken pack lists every problem, naming the quest and the field', () => {
    const bad = {
      formatVersion: 2,
      id: 'broken',
      title: '',
      giver: 'nowhere:tailor',
      modes: ['wave'],
      steps: [
        { id: 'a', type: 'talk', npc: 'kanes-crossing', objective: 'x' },
        { id: 'a', type: 'fly', objective: 'x' },
        { id: 'c', type: 'collect', item: 'ghost', objective: 'x' },
        { id: 'd', type: 'goto', poi: 'the-moon', objective: 'x' },
      ],
    };
    const r = validatePack(bad, ctx, 'broken');
    expect(r.ok).toBe(false);
    const errors = r.ok ? [] : r.errors;
    const expectFor = (s: string) => expect(errors.some((e) => e.startsWith('quest "broken": ') && e.includes(s)), s).toBe(true);
    expectFor('formatVersion: must be 1');
    expectFor('pack.title: missing');
    expectFor('pack.description: missing');
    expectFor('giver: unknown POI "nowhere"');
    expectFor('modes[0]: must be story or sandbox');
    expectFor('steps[0].npc: "kanes-crossing" must be "<poi>:<id>"');
    expectFor('steps[1].id: "a" is used twice');
    expectFor('steps[1].type: unknown step type "fly"');
    expectFor('steps[2].item: unknown item "ghost"');
    expectFor('steps[3].poi: unknown POI "the-moon"');
  });

  it('POI ids must exist in the current mode\'s world', () => {
    const p = pack('ridge', { steps: [{ id: 'go', type: 'goto', poi: 'the-ridge', objective: 'Ride to the Ridge' }] });
    const r = validatePack(p, ctx, 'ridge');
    expect(r.ok ? [] : r.errors).toEqual(['quest "ridge": steps[0].poi: unknown POI "the-ridge"']);
    expect(validatePack(p, { ...ctx, pois: new Set([...POIS, 'the-ridge']) }, 'ridge').ok).toBe(true);
  });

  it('the folder name must match the id; items may not clash with the game\'s', () => {
    const r = validatePack(pack('a', { items: [{ id: 'bandage', name: 'B', description: 'B', shape: 'box' }] }), ctx, 'b');
    expect(r.ok ? [] : r.errors).toEqual(['quest "a": id: must match its folder / catalog id "b"', 'quest "a": items[0].id: "bandage" clashes with an existing item']);
  });
});

// ------------------------------------------------------------------ catalog & lazy loading

/** A fake server: index.json and packs; records every URL fetched. */
function server(packs: QuestPack[], catalog: CatalogEntry[] = packs.map((p) => entry(p.id, { modes: p.modes }))) {
  const fetched: string[] = [];
  let down = false;
  const get = vi.fn(async (url: string) => {
    fetched.push(url);
    if (down) throw new Error('offline');
    if (url === '/q/index.json') return { formatVersion: 1, quests: catalog };
    const m = /^\/q\/([\w-]+)\/quest\.json\?v=\d+$/.exec(url);
    const p = m && packs.find((x) => x.id === m[1]);
    if (!p) throw new Error(`404 ${url}`);
    return JSON.parse(JSON.stringify(p));
  });
  return { get, fetched, setDown: (v: boolean) => (down = v) };
}

function system(packs: QuestPack[], opts: { catalog?: CatalogEntry[]; saved?: QuestSaveData | null; hooks?: Record<string, () => Promise<unknown>> } = {}) {
  const srv = server(packs, opts.catalog);
  const world = new FakeWorld();
  const qs = new QuestSystem({ mode: 'sandbox', world: SANDBOX_WORLD, game: world, get: srv.get, base: '/q/', saved: opts.saved ?? null, persist: false, registerItems: false, hooks: opts.hooks ?? {} });
  return { qs, srv, world };
}

describe('catalog', () => {
  it('only the current mode\'s quests, and no pack is fetched', async () => {
    const srv = server([], [entry('a', { modes: ['story'] }), entry('b', { modes: ['sandbox', 'story'] }), entry('c', { modes: ['sandbox'] })]);
    const cat = await loadCatalog(srv.get, '/q/', 'sandbox', new Set(POIS));
    expect(cat.entries.map((e) => e.id)).toEqual(['b', 'c']);
    expect((await loadCatalog(srv.get, '/q/', 'story', new Set(POIS))).entries.map((e) => e.id)).toEqual(['a', 'b']);
    expect(srv.fetched).toEqual(['/q/index.json', '/q/index.json']);
  });

  it('starting a playthrough fetches index.json and nothing else', async () => {
    const { qs, srv } = system([pack('a'), pack('b')]);
    await qs.whenReady();
    expect(srv.fetched).toEqual(['/q/index.json']);
    expect(qs.catalog.map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('a missing catalog means no quests, not a broken game', async () => {
    const srv = server([]);
    srv.setDown(true);
    const cat = await loadCatalog(srv.get, '/q/', 'sandbox', new Set(POIS));
    expect(cat.entries).toEqual([]);
    expect(cat.errors[0]).toContain("couldn't load /q/index.json");
  });
});

describe('lazy pack loading', () => {
  it('near a giver (15 units, on the giver\'s POI): the pack is prefetched once', async () => {
    const { qs, srv } = system([pack('a'), pack('b', { giver: 'two-spurs-ranch:rancher' })], { catalog: [entry('a'), entry('b', { giver: 'two-spurs-ranch:rancher' })] });
    await qs.whenReady();
    expect(qs.giversOn('kanes-crossing')).toEqual(['tailor']);
    qs.nearNpc('kanes-crossing', 'tailor');
    qs.nearNpc('kanes-crossing', 'tailor');
    await vi.waitFor(() => expect(qs.loader.isLoaded('a')).toBe(true));
    expect(srv.fetched).toEqual(['/q/index.json', '/q/a/quest.json?v=1']);
    expect(qs.loader.requests).toEqual([{ id: 'a', reason: 'proximity' }]);
  });

  it('starting a quest loads its pack', async () => {
    const { qs, srv } = system([pack('a')]);
    await qs.whenReady();
    expect(await qs.runtime!.start('a')).toBe(true);
    expect(srv.fetched).toContain('/q/a/quest.json?v=1');
    expect(qs.loader.requests).toEqual([{ id: 'a', reason: 'start' }]);
  });

  it('loading a save fetches the active quests\' packs (only those)', async () => {
    const saved = { quests: { a: { id: 'a', status: 'active' as const, step: 0, counter: 0, timers: {}, completions: 0 }, b: { id: 'b', status: 'completed' as const, step: 1, counter: 0, timers: {}, completions: 1 } }, flags: {}, pois: {}, held: {} };
    const { qs, srv } = system([pack('a'), pack('b')], { saved });
    await qs.whenReady();
    expect(srv.fetched).toEqual(['/q/index.json', '/q/a/quest.json?v=1']);
    expect(qs.loader.requests).toEqual([{ id: 'a', reason: 'save' }]);
  });

  it('on the way to a POI: its givers\' packs are fetched', async () => {
    const { qs } = system([pack('a'), pack('b', { giver: 'two-spurs-ranch:rancher' })], { catalog: [entry('a'), entry('b', { giver: 'two-spurs-ranch:rancher' })] });
    await qs.whenReady();
    qs.prefetchFor('two-spurs-ranch');
    expect(qs.loader.requests).toEqual([{ id: 'b', reason: 'travel' }]);
  });

  it('a failed fetch says so and is tried again on the next trigger', async () => {
    const { qs, srv, world } = system([pack('a')]);
    await qs.whenReady();
    srv.setDown(true);
    expect(await qs.runtime!.start('a')).toBe(false);
    expect(world.toasts).toEqual(['Couldn\'t load the quest "a" - will retry']);
    srv.setDown(false);
    expect(await qs.runtime!.start('a')).toBe(true);
    expect(qs.loader.requests.map((r) => r.reason)).toEqual(['start', 'start']);
  });

  it('a pack\'s hooks chunk is only imported with its pack', async () => {
    const importer = vi.fn(async () => ({ default: () => ({}) }));
    const { qs } = system([pack('a', { hooks: true })], { hooks: { './a/hooks.ts': importer } });
    await qs.whenReady();
    expect(importer).not.toHaveBeenCalled();
    qs.nearNpc('kanes-crossing', 'tailor');
    await vi.waitFor(() => expect(importer).toHaveBeenCalledTimes(1));
  });

  it('an invalid pack is rejected with its errors listed', async () => {
    const loader = new PackLoader({ base: '/q/', ctx, version: () => 1, get: async () => ({ ...pack('a'), steps: [] }) });
    expect(await loader.load('a', 'debug')).toBeNull();
    expect(loader.errors).toEqual(['quest "a": steps: needs at least one step']);
  });
});

// ------------------------------------------------------------------ steps

describe('step types', () => {
  it('talk: talking to the right NPC on the right POI', async () => {
    const { rt, world } = runtime([pack('a', { steps: [{ id: 't', type: 'talk', npc: 'kanes-crossing:gunsmith', objective: 'See the gunsmith' }] })]);
    await rt.start('a');
    rt.emit({ type: 'talkedTo', poi: 'kanes-crossing', npc: 'tailor' });
    expect(rt.state('a')!.status).toBe('active');
    rt.emit({ type: 'talkedTo', poi: 'kanes-crossing', npc: 'gunsmith' });
    expect(rt.state('a')!.status).toBe('completed');
    expect(world.toasts).toEqual(['Quest started: A', 'Quest complete: A']);
  });

  it('collect: a counter that follows the bags, with a toast per find', async () => {
    const { rt, world } = runtime([pack('a', { steps: [{ id: 'c', type: 'collect', item: 'poster', count: 2, label: 'Wanted poster', objective: 'Find two posters' }, { id: 't', type: 'talk', npc: 'kanes-crossing:tailor', objective: 'Talk' }] })]);
    await rt.start('a');
    world.bags.set('poster', 1);
    rt.update(0.016);
    expect(rt.state('a')!.counter).toBe(1);
    world.bags.set('poster', 2);
    rt.update(0.016);
    expect(rt.state('a')!.step).toBe(1);
    expect(world.toasts).toEqual(['Quest started: A', 'Wanted poster 1/2', 'Wanted poster 2/2', 'Next: Talk']);
  });

  it('collect: already holding them completes the step at once', async () => {
    const { rt, world } = runtime([pack('a', { steps: [{ id: 'c', type: 'collect', item: 'poster', objective: 'Find a poster' }] })]);
    world.bags.set('poster', 1);
    await rt.start('a');
    expect(rt.state('a')!.status).toBe('completed');
  });

  it('deliver: handed over (taken from the bags) only when you have it', async () => {
    const { rt, world } = runtime([pack('a', { steps: [{ id: 'd', type: 'deliver', npc: 'kanes-crossing:gunsmith', item: 'letter', objective: 'Bring the letter' }] })]);
    await rt.start('a');
    expect(rt.deliver('a')).toBe(false);
    world.bags.set('letter', 1);
    rt.update(0);
    expect(rt.deliver('a')).toBe(true);
    expect(world.countItem('letter')).toBe(0);
    expect(rt.state('a')!.status).toBe('completed');
    expect(world.toasts).toContain('Delivered: letter');
  });

  it('goto a POI: arriving there (the exit and the ride) counts', async () => {
    const { rt, world } = runtime([pack('a', { steps: [{ id: 'g', type: 'goto', poi: 'two-spurs-ranch', objective: 'Ride to the ranch' }] })]);
    await rt.start('a');
    world.poi = 'two-spurs-ranch';
    rt.emit({ type: 'poiEntered', poi: 'two-spurs-ranch' });
    expect(rt.state('a')!.status).toBe('completed');
    expect(world.toasts).toContain('Reached Two Spurs Ranch');
  });

  it('goto an area while carrying an item: only with the item', async () => {
    const { rt, world } = runtime([pack('a', { steps: [{ id: 'g', type: 'goto', area: 'kanes-crossing:saloon', carrying: 'letter', label: 'the saloon', objective: 'Take it to the saloon' }] })]);
    await rt.start('a');
    world.areas.add('kanes-crossing:saloon');
    rt.emit({ type: 'areaEntered', poi: 'kanes-crossing', area: 'saloon' });
    expect(rt.state('a')!.status).toBe('active');
    world.bags.set('letter', 1);
    rt.update(0); // (itemAdded while standing there)
    expect(rt.state('a')!.status).toBe('completed');
    expect(world.toasts).toContain('Reached the saloon');
  });

  it('defeat: listed NPCs, or N of a group, with a kill count', async () => {
    const npcs = ['a', 'b', 'c'].map((id) => ({ id: `bandit-${id}`, poi: 'rattlesnake-gulch', group: 'bandits', spawn: [0, 0] as [number, number], def: {} }));
    const { rt, world } = runtime([
      pack('g', { npcs, steps: [{ id: 'd', type: 'defeat', group: 'bandits', count: 2, label: 'Bandits', objective: 'Thin them out' }] }),
      pack('n', { steps: [{ id: 'd', type: 'defeat', npcs: ['rattlesnake-gulch:outlaw-fire', 'rattlesnake-gulch:outlaw-rifle'], objective: 'Kill the two' }] }),
    ]);
    await rt.start('g');
    await rt.start('n');
    rt.emit({ type: 'npcKilled', poi: 'rattlesnake-gulch', npc: 'bandit-a' });
    rt.emit({ type: 'npcKilled', poi: 'rattlesnake-gulch', npc: 'outlaw-fire' });
    expect(world.toasts.slice(2)).toEqual(['Bandits 1/2', 'Defeated 1/2']);
    rt.emit({ type: 'npcKilled', poi: 'rattlesnake-gulch', npc: 'bandit-c' });
    rt.emit({ type: 'npcKilled', poi: 'rattlesnake-gulch', npc: 'outlaw-rifle' });
    expect(rt.state('g')!.status).toBe('completed');
    expect(rt.state('n')!.status).toBe('completed');
    expect(rt.isDead('rattlesnake-gulch:bandit-a')).toBe(false); // (the quest is over: its data went with it)
  });

  it('steps go in order; the next objective names its POI if it\'s elsewhere and known', async () => {
    const { rt, world } = runtime([
      pack('a', {
        steps: [
          { id: '1', type: 'talk', npc: 'kanes-crossing:tailor', objective: 'Talk to the tailor' },
          { id: '2', type: 'talk', npc: 'two-spurs-ranch:rancher', objective: 'Ask the rancher' },
          { id: '3', type: 'talk', npc: 'rattlesnake-gulch:outlaw-fire', objective: 'Find the man by the fire' },
        ],
      }),
    ]);
    await rt.start('a');
    rt.emit({ type: 'talkedTo', poi: 'kanes-crossing', npc: 'rancher' }); // (not yet: step 1 first)
    expect(rt.state('a')!.step).toBe(0);
    rt.emit({ type: 'talkedTo', poi: 'kanes-crossing', npc: 'tailor' });
    expect(world.toasts.at(-1)).toBe('Next: Ask the rancher (Two Spurs Ranch)');
    world.poi = 'two-spurs-ranch';
    rt.emit({ type: 'talkedTo', poi: 'two-spurs-ranch', npc: 'rancher' });
    expect(world.toasts.at(-1)).toBe('Next: Find the man by the fire'); // (the gulch is undiscovered: never named)
  });
});

describe('events', () => {
  it('several active quests all see the same event', async () => {
    const talk = { id: 't', type: 'talk' as const, npc: 'kanes-crossing:gunsmith', objective: 'See the gunsmith' };
    const { rt } = runtime([pack('a', { steps: [talk] }), pack('b', { steps: [talk] })]);
    await rt.start('a');
    await rt.start('b');
    rt.emit({ type: 'talkedTo', poi: 'kanes-crossing', npc: 'gunsmith' });
    expect([rt.state('a')!.status, rt.state('b')!.status]).toEqual(['completed', 'completed']);
  });

  it('the same NPC id on another POI is someone else', async () => {
    const { rt } = runtime([
      pack('a', {
        steps: [{ id: 't', type: 'talk', npc: 'kanes-crossing:gunsmith', objective: 'x' }],
        npcs: [{ id: 'bandit', poi: 'rattlesnake-gulch', group: 'g', spawn: [0, 0] as [number, number], def: {} }],
      }),
      pack('b', { steps: [{ id: 'd', type: 'defeat', npcs: ['rattlesnake-gulch:bandit'], objective: 'x' }] }),
    ]);
    await rt.start('a');
    await rt.start('b');
    rt.emit({ type: 'talkedTo', poi: 'two-spurs-ranch', npc: 'gunsmith' });
    rt.emit({ type: 'npcKilled', poi: 'kanes-crossing', npc: 'bandit' });
    expect([rt.state('a')!.status, rt.state('b')!.status, rt.state('b')!.counter]).toEqual(['active', 'active', 0]);
  });
});

// ------------------------------------------------------------------ setup per POI

describe('POI-scoped step setup', () => {
  const placeLetter: SetupDef = { type: 'placeItem', item: 'letter', container: 'two-spurs-ranch:barn-chest' };
  const quest = () =>
    pack('a', {
      steps: [
        { id: 'go', type: 'talk', npc: 'kanes-crossing:tailor', objective: 'Talk' },
        { id: 'get', type: 'collect', item: 'letter', objective: 'Find the letter', setup: [placeLetter] },
      ],
    });

  it('a step that becomes current elsewhere sets up when you arrive; once, also after leaving and coming back', async () => {
    const { rt, world } = runtime([quest()]);
    await rt.start('a');
    rt.emit({ type: 'talkedTo', poi: 'kanes-crossing', npc: 'tailor' });
    expect(world.setups).toEqual([]); // (we're in town)
    world.poi = 'two-spurs-ranch';
    rt.emit({ type: 'poiEntered', poi: 'two-spurs-ranch' });
    expect(world.setups).toEqual([{ entry: placeLetter, key: 'a#0/1/0', restore: false, poi: 'two-spurs-ranch' }]);
    world.poi = 'kanes-crossing';
    rt.emit({ type: 'poiLeft', poi: 'two-spurs-ranch' });
    rt.emit({ type: 'poiEntered', poi: 'kanes-crossing' });
    world.poi = 'two-spurs-ranch';
    rt.emit({ type: 'poiEntered', poi: 'two-spurs-ranch' });
    expect(world.setups).toHaveLength(1);
  });

  it('a step that becomes current where you are sets up at once', async () => {
    const { rt, world } = runtime([quest()]);
    world.poi = 'two-spurs-ranch';
    await rt.start('a');
    rt.emit({ type: 'talkedTo', poi: 'kanes-crossing', npc: 'tailor' }); // (an old event from town)
    expect(world.setups.map((s) => s.key)).toEqual(['a#0/1/0']);
  });

  it('after a reload it is restored (the POI was rebuilt from scratch), not set up anew', async () => {
    const { rt, world } = runtime([quest()]);
    await rt.start('a');
    rt.emit({ type: 'talkedTo', poi: 'kanes-crossing', npc: 'tailor' });
    world.poi = 'two-spurs-ranch';
    rt.emit({ type: 'poiEntered', poi: 'two-spurs-ranch' });
    rt.markTaken('two-spurs-ranch', 'a#0/1/0');
    const again = new QuestRuntime({ catalog: [entry('a')], world, packs: memoryPacks([quest()]), saved: rt.save() });
    await again.restore();
    expect(world.setups.at(-1)).toEqual({ entry: placeLetter, key: 'a#0/1/0', restore: true, poi: 'two-spurs-ranch' });
    expect(again.isTaken('two-spurs-ranch', 'a#0/1/0')).toBe(true);
  });
});

// ------------------------------------------------------------------ actions, discovery, fails, rewards

describe('actions and conditions', () => {
  it('reveal actions put places and trails on the map', async () => {
    const { rt, world } = runtime([pack('a', { steps: [{ id: 't', type: 'talk', npc: 'kanes-crossing:tailor', objective: 'x', onStart: [{ type: 'reveal', poi: 'rattlesnake-gulch' }, { type: 'revealPath', path: 'town-gulch' }] }] })]);
    await rt.start('a');
    expect(world.discovery('rattlesnake-gulch')).toBe('hidden');
    expect(world.paths).toEqual(['town-gulch']);
  });

  it('conditions: quest state, items, money, flags, POI, discovery', async () => {
    const { rt, world } = runtime([pack('a')]);
    expect(rt.check({ type: 'quest', quest: 'a', status: 'available' })).toBe(true);
    await rt.start('a');
    expect(rt.check({ type: 'quest', quest: 'a', status: 'active', step: 's1' })).toBe(true);
    world.bags.set('bandage', 2);
    expect(rt.check({ type: 'hasItem', item: 'bandage', count: 2 })).toBe(true);
    expect(rt.check({ type: 'hasItem', item: 'bandage', count: 3 })).toBe(false);
    expect(rt.check({ type: 'money', atLeast: 100 })).toBe(true);
    expect(rt.check({ type: 'money', atLeast: 101 })).toBe(false);
    rt.run([{ type: 'setFlag', flag: 'met', value: 2 }], 'a');
    expect(rt.check({ type: 'flag', flag: 'met', value: 2 })).toBe(true);
    expect(rt.check({ type: 'not', cond: { type: 'flag', flag: 'other' } })).toBe(true);
    expect(rt.check({ type: 'poi', poi: 'kanes-crossing' })).toBe(true);
    expect(rt.check({ type: 'discovered', poi: 'two-spurs-ranch', state: 'known' })).toBe(true);
    expect(rt.check({ type: 'discovered', poi: 'rattlesnake-gulch', state: 'known' })).toBe(false);
  });

  it('unlock chains: a quest that needs another completed', async () => {
    const { rt } = runtime([pack('first'), pack('second')], new FakeWorld(), [entry('first'), entry('second', { requires: [{ type: 'quest', quest: 'first', status: 'completed' }] })]);
    expect(rt.available('second')).toBe(false);
    expect(await rt.start('second')).toBe(false);
    await rt.start('first');
    rt.emit({ type: 'talkedTo', poi: 'kanes-crossing', npc: 'tailor' });
    expect(rt.available('second')).toBe(true);
    expect(rt.available('first')).toBe(false); // (not repeatable)
  });
});

describe('failing, abandoning, rewards', () => {
  it('a key NPC dies on another POI: failed, with the reason; cleaned up everywhere', async () => {
    const { rt, world } = runtime([pack('a', { fail: [{ type: 'npcDies', npc: 'kanes-crossing:gunsmith', reason: 'The gunsmith is dead' }] })]);
    await rt.start('a');
    world.poi = 'kanes-crossing';
    rt.emit({ type: 'npcKilled', poi: 'kanes-crossing', npc: 'gunsmith' });
    expect(rt.state('a')).toMatchObject({ status: 'failed', failReason: 'The gunsmith is dead' });
    expect(world.toasts.at(-1)).toBe('Quest failed: A - The gunsmith is dead');
    expect(world.cleaned).toEqual(['a']);
  });

  it('a timer keeps running during the ride (update) and fails the quest', async () => {
    const { rt, world } = runtime([pack('a', { steps: [{ id: 'g', type: 'goto', poi: 'two-spurs-ranch', objective: 'Hurry', fail: [{ type: 'timer', seconds: 10, reason: 'Too slow' }] }] })]);
    await rt.start('a');
    for (let i = 0; i < 9; i++) rt.update(1); // riding
    expect(rt.timeLeft('a')).toBeCloseTo(1);
    rt.update(1.5);
    expect(rt.state('a')).toMatchObject({ status: 'failed', failReason: 'Too slow' });
    expect(world.toasts.at(-1)).toBe('Quest failed: A - Too slow');
  });

  it('losing a quest item fails it; the quest taking it does not', async () => {
    const steps = [
      { id: 'c', type: 'collect' as const, item: 'letter', objective: 'Get it' },
      { id: 'd', type: 'deliver' as const, npc: 'kanes-crossing:gunsmith', item: 'letter', objective: 'Bring it' },
    ];
    const { rt, world } = runtime([pack('a', { steps, fail: [{ type: 'itemLost', item: 'letter' }] }), pack('b', { steps, fail: [{ type: 'itemLost', item: 'letter' }] })]);
    await rt.start('a');
    world.bags.set('letter', 1);
    rt.update(0);
    expect(rt.deliver('a')).toBe(true);
    expect(rt.state('a')!.status).toBe('completed');
    await rt.start('b');
    world.bags.set('letter', 1);
    rt.update(0);
    world.bags.set('letter', 0); // dropped
    rt.update(0);
    expect(rt.state('b')).toMatchObject({ status: 'failed', failReason: 'You lost the letter' });
  });

  it('abandon: cleaned up; a restartable quest can be taken again', async () => {
    const { rt, world } = runtime([pack('a', { restartable: true }), pack('b')]);
    await rt.start('a');
    await rt.start('b');
    rt.abandon('a');
    rt.abandon('b');
    expect(world.cleaned).toEqual(['a', 'b']);
    expect(rt.available('a')).toBe(true);
    expect(rt.available('b')).toBe(false);
  });

  it('rewards: money and items; what doesn\'t fit lands at your feet', async () => {
    const world = new FakeWorld();
    world.space = 1;
    const { rt } = runtime([pack('a', { rewards: { money: 25, items: [{ item: 'bandage', count: 3 }] } })], world);
    await rt.start('a');
    rt.emit({ type: 'talkedTo', poi: 'kanes-crossing', npc: 'tailor' });
    expect(world.dollars).toBe(125);
    expect(world.countItem('bandage')).toBe(1);
    expect(world.dropped).toEqual(['bandage', 'bandage']);
    expect(world.toasts.at(-1)).toBe('Quest complete: A (+$25, bandage x3)');
  });
});

// ------------------------------------------------------------------ hooks

describe('hooks', () => {
  it('get the narrow API and their callbacks', async () => {
    const calls: string[] = [];
    const p = pack('a', { hooks: true, fail: [{ type: 'timer', seconds: 30 }], steps: [{ id: 't', type: 'talk', npc: 'kanes-crossing:tailor', objective: 'x' }, { id: 'u', type: 'talk', npc: 'kanes-crossing:gunsmith', objective: 'y' }] });
    const world = new FakeWorld();
    const packs = { get: () => ({ pack: p, hooks: (api: import('./api').QuestApi) => ({
      onStart: () => calls.push('start'),
      onStepStart: (_s: unknown, i: number) => calls.push(`step ${i}`),
      onStepComplete: (_s: unknown, i: number) => {
        calls.push(`done ${i}`);
        api.setFlag('fast', (api.timeLeft() ?? 0) > 20);
      },
      onComplete: () => calls.push('complete'),
    }) }), load: async () => packs.get() };
    const rt = new QuestRuntime({ catalog: [entry('a')], world, packs });
    await rt.start('a');
    rt.update(5);
    rt.emit({ type: 'talkedTo', poi: 'kanes-crossing', npc: 'tailor' });
    rt.emit({ type: 'talkedTo', poi: 'kanes-crossing', npc: 'gunsmith' });
    expect(calls).toEqual(['start', 'step 0', 'done 0', 'step 1', 'done 1', 'complete']);
    expect(rt.flags.fast).toBe(true);
  });
});

// ------------------------------------------------------------------ save

describe('save', () => {
  it('round trip: statuses, steps, counters, flags, timers, POI data, held quest items, where', async () => {
    const p = pack('a', {
      items: [{ id: 'letter', name: 'Letter', description: 'x', shape: 'letter' }],
      fail: [{ type: 'timer', seconds: 100 }],
      npcs: [{ id: 'boss', poi: 'rattlesnake-gulch', spawn: [0, 0] as [number, number], def: {} }],
      steps: [
        { id: 'c', type: 'collect', item: 'letter', count: 2, objective: 'x' },
        { id: 't', type: 'talk', npc: 'kanes-crossing:tailor', objective: 'y' },
      ],
    });
    const { rt, world } = runtime([p, pack('done')]);
    await rt.start('done');
    rt.emit({ type: 'talkedTo', poi: 'kanes-crossing', npc: 'tailor' });
    await rt.start('a');
    world.bags.set('letter', 1);
    rt.update(10);
    rt.run([{ type: 'setFlag', flag: 'x' }], 'a');
    rt.emit({ type: 'npcKilled', poi: 'rattlesnake-gulch', npc: 'boss' });

    const store = new Map<string, string>();
    const fake = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) };
    saveQuests('sandbox', { ...rt.save(), where: { poi: 'two-spurs-ranch', exit: 'south' } }, fake);
    expect([...store.keys()]).toEqual(['sok.quests.sandbox']);
    const back = loadQuestSave('sandbox', fake)!;
    expect(loadQuestSave('story', fake)).toBeUndefined();
    expect(back.where).toEqual({ poi: 'two-spurs-ranch', exit: 'south' });
    expect(back.held).toEqual({ letter: 1 });

    // A fresh page: empty bags.
    const world2 = new FakeWorld();
    const rt2 = new QuestRuntime({ catalog: [entry('a'), entry('done')], world: world2, packs: memoryPacks([p, pack('done')]), saved: back });
    await rt2.restore(back.held);
    expect(rt2.state('a')).toMatchObject({ status: 'active', step: 0, counter: 1 });
    expect(rt2.timeLeft('a')).toBeCloseTo(90);
    expect(rt2.state('done')!.status).toBe('completed');
    expect(rt2.flags).toEqual({ x: true });
    expect(rt2.isDead('rattlesnake-gulch:boss')).toBe(true);
    expect(world2.countItem('letter')).toBe(1);
    // Progress goes on from where it was.
    world2.bags.set('letter', 2);
    rt2.update(0);
    expect(rt2.state('a')!.step).toBe(1);
  });

  it('an outdated or broken save is ignored', () => {
    const store = new Map([['sok.quests.story', '{"v":99,"data":{}}']]);
    const fake = { getItem: (k: string) => store.get(k) ?? null, setItem: () => {}, removeItem: () => {} };
    expect(loadQuestSave('story', fake)).toBeUndefined();
    store.set('sok.quests.story', '{nope');
    expect(loadQuestSave('story', fake)).toBeUndefined();
  });
});

describe('quest NPCs spawned by actions', () => {
  const p = () =>
    pack('a', {
      npcs: [{ id: 'stranger', poi: 'two-spurs-ranch', spawn: [0, 0] }],
      steps: [{ id: 't', type: 'talk', npc: 'two-spurs-ranch:stranger', objective: 'Meet the stranger', onStart: [{ type: 'spawn', npc: 'two-spurs-ranch:stranger' }] }],
    });

  it('elsewhere: they appear when you arrive, once; and again after a reload', async () => {
    const { rt, world } = runtime([p()]);
    await rt.start('a');
    expect(world.spawned).toEqual([]);
    world.poi = 'two-spurs-ranch';
    rt.emit({ type: 'poiEntered', poi: 'two-spurs-ranch' });
    rt.emit({ type: 'poiEntered', poi: 'two-spurs-ranch' });
    expect(world.spawned).toEqual(['two-spurs-ranch:stranger']);
    const again = new QuestRuntime({ catalog: [entry('a')], world, packs: memoryPacks([p()]), saved: JSON.parse(JSON.stringify(rt.save())) });
    await again.restore();
    expect(world.spawned).toEqual(['two-spurs-ranch:stranger', 'two-spurs-ranch:stranger']);
  });

  it('despawned (or the quest over): not brought back', async () => {
    const { rt, world } = runtime([p()]);
    const despawned: string[] = [];
    world.despawn = (npc: string) => void despawned.push(npc);
    await rt.start('a');
    rt.run([{ type: 'despawn', npc: 'two-spurs-ranch:stranger' }], 'a');
    expect(despawned).toEqual(['two-spurs-ranch:stranger']);
    world.poi = 'two-spurs-ranch';
    rt.emit({ type: 'poiEntered', poi: 'two-spurs-ranch' });
    expect(world.spawned).toEqual([]);
  });
});

describe('a second playthrough in the same page', () => {
  it('loads a pack whose items an earlier playthrough already registered (restart, another mode)', async () => {
    const p = pack('reloaded', { items: [{ id: 'reloaded-letter', name: 'Letter', description: 'x', shape: 'letter' }] });
    const start = async () => {
      const srv = server([p]);
      const qs = new QuestSystem({ mode: 'sandbox', world: SANDBOX_WORLD, game: new FakeWorld(), get: srv.get, base: '/q/', saved: null, persist: false, hooks: {} });
      await qs.whenReady();
      return qs.loader.load('reloaded', 'start');
    };
    expect(await start()).not.toBeNull();
    expect(await start()).not.toBeNull(); // (the item is still registered from the first time)
  });
});
