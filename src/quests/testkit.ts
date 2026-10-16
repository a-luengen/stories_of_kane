/** Fakes for quest tests: a pack and catalog entry with defaults, the game as quests see it. */
import { QuestRuntime, type QuestWorld } from './QuestRuntime';
import type { CatalogEntry, QuestPack, SetupDef } from './types';
import type { ValidationContext } from './validate';

export const POIS = ['kanes-crossing', 'two-spurs-ranch', 'rattlesnake-gulch'];
export const ctx: ValidationContext = { pois: new Set(POIS), paths: new Set(['town-ranch', 'town-gulch', 'ranch-gulch']), itemExists: (id) => id === 'bandage' };

/** A quest pack with sensible defaults. */
export function pack(id: string, over: Partial<QuestPack> = {}): QuestPack {
  return {
    formatVersion: 1,
    id,
    title: id.toUpperCase(),
    description: 'A test quest.',
    giver: 'kanes-crossing:tailor',
    modes: ['sandbox'],
    steps: [{ id: 's1', type: 'talk', npc: 'kanes-crossing:tailor', objective: 'Talk to the tailor' }],
    ...over,
  };
}

export const entry = (id: string, over: Partial<CatalogEntry> = {}): CatalogEntry => ({ id, title: id, giver: 'kanes-crossing:tailor', modes: ['sandbox'], version: 1, ...over });

/** The game as far as quests can tell: bags, purse, POI, areas, discovery, messages. */
export class FakeWorld implements QuestWorld {
  poi = 'kanes-crossing';
  dollars = 100;
  bags = new Map<string, number>();
  /** Bag space in items (giveItem drops the rest). */
  space = Infinity;
  dropped: string[] = [];
  disc = new Map<string, 'visible' | 'hidden' | 'undiscovered'>([['kanes-crossing', 'visible'], ['two-spurs-ranch', 'hidden'], ['rattlesnake-gulch', 'undiscovered']]);
  paths: string[] = [];
  areas = new Set<string>();
  toasts: string[] = [];
  setups: { entry: SetupDef; key: string; restore: boolean; poi: string }[] = [];
  cleaned: string[] = [];
  spawned: string[] = [];
  money = () => this.dollars;
  giveMoney = (n: number) => void (this.dollars += n);
  takeMoney = (n: number) => (this.dollars >= n ? ((this.dollars -= n), true) : false);
  countItem = (id: string) => this.bags.get(id) ?? 0;
  giveItem = (id: string, n: number) => {
    const total = [...this.bags.values()].reduce((a, b) => a + b, 0);
    const fits = Math.max(0, Math.min(n, this.space - total));
    if (fits) this.bags.set(id, this.countItem(id) + fits);
    for (let i = fits; i < n; i++) this.dropped.push(id);
    return n - fits;
  };
  takeItem = (id: string, n: number) => {
    const t = Math.min(n, this.countItem(id));
    this.bags.set(id, this.countItem(id) - t);
    return t;
  };
  itemName = (id: string) => id;
  discovery = (poi: string) => this.disc.get(poi) ?? 'undiscovered';
  reveal = (poi: string) => {
    if (this.discovery(poi) === 'undiscovered') this.disc.set(poi, 'hidden');
  };
  revealPath = (p: string) => void this.paths.push(p);
  poiName = (poi: string) => ({ 'kanes-crossing': "Kane's Crossing", 'two-spurs-ranch': 'Two Spurs Ranch', 'rattlesnake-gulch': 'Rattlesnake Gulch' })[poi] ?? poi;
  toast = (t: string) => void this.toasts.push(t);
  inArea = (ref: string) => this.areas.has(ref);
  setup = (entry: SetupDef, info: { key: string; restore: boolean }) => void this.setups.push({ entry, key: info.key, restore: info.restore, poi: this.poi });
  spawn = (npc: string) => void this.spawned.push(npc);
  despawn = (_npc: string) => {};
  cleanup = (p: QuestPack) => void this.cleaned.push(p.id);
  held: string[] = [];
  heldKeys = () => this.held;
}

/** Packs served from memory (no fetching), as the PackLoader would hand them out. */
export function memoryPacks(packs: QuestPack[]) {
  const m = new Map(packs.map((p) => [p.id, { pack: p, hooks: null }]));
  return { get: (id: string) => m.get(id) ?? null, load: async (id: string) => m.get(id) ?? null };
}

export function runtime(packs: QuestPack[], world = new FakeWorld(), catalog = packs.map((p) => entry(p.id))) {
  const rt = new QuestRuntime({ catalog, world, packs: memoryPacks(packs) });
  return { rt, world };
}

