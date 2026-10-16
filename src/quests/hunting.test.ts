import { describe, expect, it } from 'vitest';
import { SANDBOX_WORLD } from '../data/world';
import { DialogRunner, dialogsFor } from './dialog';
import { QuestRuntime } from './QuestRuntime';
import { FakeWorld, pack, runtime } from './testkit';
import type { QuestCatalog, QuestPack } from './types';
import { validatePack } from './validate';
import { ANIMALS } from '../data/animals';

const PACKS = import.meta.glob<QuestPack>('../../public/quests/hunt-*/quest.json', { eager: true, import: 'default' });
const CATALOG = Object.values(import.meta.glob<QuestCatalog>('../../public/quests/index.json', { eager: true, import: 'default' }))[0];
const contract = (id: string) => Object.entries(PACKS).find(([k]) => k.includes(`/${id}/`))![1];
const ORDER = ['hunt-bison', 'hunt-wolves', 'hunt-grizzly', 'hunt-snakes'];

describe('the hunt step', () => {
  const quest = () => pack('h', { steps: [{ id: 'h', type: 'hunt', species: ['wolf'], count: 2, poi: 'desert-plains', label: 'Wolves', objective: 'Kill two wolves' }] });

  it("counts the player's kills of those species on that POI, with a message each", async () => {
    const { rt, world } = runtime([quest()]);
    await rt.start('h');
    rt.emit({ type: 'animalKilled', poi: 'desert-plains', species: 'bison', byPlayer: true }); // (not a wolf)
    rt.emit({ type: 'animalKilled', poi: 'desert-plains', species: 'wolf', byPlayer: false }); // (not the player's)
    rt.emit({ type: 'animalKilled', poi: 'rattlesnake-gulch', species: 'wolf', byPlayer: true }); // (elsewhere)
    expect(rt.state('h')!.counter).toBe(0);
    rt.emit({ type: 'animalKilled', poi: 'desert-plains', species: 'wolf', byPlayer: true });
    rt.emit({ type: 'animalKilled', poi: 'desert-plains', species: 'wolf', byPlayer: true });
    expect(rt.state('h')!.status).toBe('completed');
    expect(world.toasts.filter((t) => t.startsWith('Wolves'))).toEqual(['Wolves 1/2', 'Wolves 2/2']);
  });

  it('unknown species are caught by the validator', () => {
    const ctx = { pois: new Set(SANDBOX_WORLD.pois.map((p) => p.id)), paths: new Set<string>(), animals: new Set(Object.keys(ANIMALS)), itemExists: () => false };
    const bad = pack('h', { steps: [{ id: 'h', type: 'hunt', species: ['dragon'], objective: 'x' }] });
    const v = validatePack(bad, ctx, 'h');
    expect(v.ok ? [] : v.errors).toEqual(['quest "h": steps[0].species[0]: unknown animal "dragon"']);
  });
});

describe("the tanner's contracts", () => {
  it('four of them, all valid, sandbox only, repeatable', () => {
    const ctx = { pois: new Set(SANDBOX_WORLD.pois.map((p) => p.id)), paths: new Set(SANDBOX_WORLD.paths.map((p) => p.id)), animals: new Set(Object.keys(ANIMALS)), itemExists: () => false };
    expect(Object.values(PACKS).map((p) => p.id).sort()).toEqual([...ORDER].sort());
    for (const id of ORDER) {
      const p = contract(id);
      const v = validatePack(p, ctx, id);
      expect(v.ok ? [] : v.errors, id).toEqual([]);
      expect([p.modes, p.repeatable, p.giver]).toEqual([['sandbox'], true, 'kanes-crossing:tanner']);
    }
  });

  it('one at a time, in turn: bison, wolves, the grizzly, rattlesnakes, then bison again', async () => {
    const world = new FakeWorld();
    const packs = new Map(ORDER.map((id) => [id, { pack: contract(id), hooks: null }]));
    const rt = new QuestRuntime({ catalog: CATALOG.quests.filter((e) => e.id.startsWith('hunt-')), world, packs: { get: (id) => packs.get(id) ?? null, load: async (id) => packs.get(id) ?? null } });
    const talk = () => new DialogRunner(rt, dialogsFor(rt, 'kanes-crossing:tanner'), { npcName: 'Etta', greeting: 'Hides?', merchant: true, poi: 'kanes-crossing', openShop: () => {} });
    const say = (d: DialogRunner, text: string) => {
      const i = d.line!.choices.findIndex((c) => c.text === text);
      expect(i, `"${text}" in ${d.line!.choices.map((c) => c.text).join(' | ')}`).toBeGreaterThanOrEqual(0);
      d.pick(i);
    };
    const species: Record<string, [string, number]> = { 'hunt-bison': ['bison', 3], 'hunt-wolves': ['wolf', 3], 'hunt-grizzly': ['bear', 1], 'hunt-snakes': ['snake', 2] };
    let paid = world.dollars;
    for (const id of [...ORDER, 'hunt-bison']) {
      // Only this contract is on offer.
      expect(ORDER.filter((q) => rt.available(q)), `before ${id}`).toEqual([id]);
      const d = talk();
      say(d, contract(id).title);
      say(d, "I'll take the contract.");
      expect(rt.state(id)!.status).toBe('active');
      expect(ORDER.filter((q) => rt.available(q))).toEqual([]); // (nothing else while it runs)
      const [sp, n] = species[id];
      const poi = contract(id).steps[0].type === 'hunt' && (contract(id).steps[0] as { poi?: string }).poi ? 'desert-plains' : 'rattlesnake-gulch';
      for (let i = 0; i < n; i++) rt.emit({ type: 'animalKilled', poi, species: sp, byPlayer: true });
      const r = talk();
      say(r, contract(id).title);
      say(r, "It's done.");
      expect(rt.state(id)!.status, id).toBe('completed');
      expect(world.dollars - paid).toBe(contract(id).rewards!.money);
      paid = world.dollars;
    }
    expect(rt.state('hunt-bison')!.completions).toBe(2);
  });
});
