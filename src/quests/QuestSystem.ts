import type { WorldDef } from '../data/world';
import { hasItemDef, itemDef } from '../items/ItemDef';
import { ANIMALS } from '../data/animals';
import { fetchJson, loadCatalog, questBase, type FetchJson } from './catalog';
import type { QuestEvent } from './events';
import { registerQuestItems } from './items';
import { PackLoader, type LoadReason } from './loader';
import { QuestRuntime, type QuestSaveData, type QuestWorld } from './QuestRuntime';
import { clearQuestSave, loadQuestSave, saveQuests } from './save';
import { splitRef, type CatalogEntry, type QuestMode } from './types';

export interface QuestSystemOptions {
  mode: QuestMode;
  world: WorldDef;
  game: QuestWorld;
  /** Overrides for tests. */
  get?: FetchJson;
  base?: string;
  hooks?: Record<string, () => Promise<unknown>>;
  /** Start from this save instead of localStorage (undefined: read it; null: start fresh). */
  saved?: QuestSaveData | null;
  /** Persist saves (off in tests). */
  persist?: boolean;
  /** Register pack items in the game's item registry (off in tests that don't need it). */
  registerItems?: boolean;
}

/** How close (units) to a quest giver before their quest's pack is fetched. */
export const PREFETCH_RADIUS = 15;
/** Timers run every frame; the save is refreshed this often while any is running. */
const TIMER_SAVE_INTERVAL = 5;

/**
 * Quests for one playthrough: the mode's catalog (fetched at start), packs fetched lazily
 * (near a giver, on start, from a save, ahead of travel), the runtime, and its save.
 * Everything is a no-op until the catalog has arrived.
 */
export class QuestSystem {
  readonly mode: QuestMode;
  readonly loader: PackLoader;
  runtime: QuestRuntime | null = null;
  catalog: CatalogEntry[] = [];
  readonly errors: string[] = [];
  private sinceSave = 0;
  private ready: Promise<void>;

  constructor(private opts: QuestSystemOptions) {
    this.mode = opts.mode;
    const base = opts.base ?? questBase();
    const pois = new Set(opts.world.pois.map((p) => p.id));
    const paths = new Set(opts.world.paths.map((p) => p.id));
    this.loader = new PackLoader({
      base,
      get: opts.get ?? fetchJson,
      hooks: opts.hooks,
      ctx: { pois, paths, animals: new Set(Object.keys(ANIMALS)), itemExists: (id, pack) => hasItemDef(id) && (pack === undefined || itemDef(id).quest?.id !== pack) },
      version: (id) => this.catalog.find((e) => e.id === id)?.version ?? 1,
      onLoaded: (lp) => {
        if (opts.registerItems !== false) registerQuestItems(lp.pack, base);
        this.runtime?.packLoaded(lp);
      },
      onError: (id, msg) => {
        console.warn('[quests]', msg);
        const title = this.catalog.find((e) => e.id === id)?.title ?? id;
        opts.game.toast(`Couldn't load the quest "${title}" - will retry`);
      },
    });
    this.ready = this.init(opts.get ?? fetchJson, base, pois);
  }

  private async init(get: FetchJson, base: string, pois: ReadonlySet<string>): Promise<void> {
    const cat = await loadCatalog(get, base, this.mode, pois);
    this.catalog = cat.entries;
    this.errors.push(...cat.errors);
    for (const e of cat.errors) console.warn('[quests]', e);
    const saved = this.opts.saved === undefined ? loadQuestSave(this.mode) : (this.opts.saved ?? undefined);
    this.runtime = new QuestRuntime({
      catalog: this.catalog,
      world: this.opts.game,
      packs: this.loader,
      saved,
      onChange: () => this.save(),
    });
    await this.runtime.restore(saved?.held);
  }

  /** Resolves once the catalog (and a save's packs) are in. */
  whenReady(): Promise<void> {
    return this.ready;
  }

  /** All validation / load errors (catalog and packs). */
  get allErrors(): string[] {
    return [...this.errors, ...this.loader.errors];
  }

  // ------------------------------------------------------------------ triggers

  /** The player is near an NPC: prefetch the packs of the quests that NPC gives (if takeable). */
  nearNpc(poi: string, npc: string): void {
    const rt = this.runtime;
    if (!rt) return;
    for (const g of rt.giversOn(poi)) if (g.npc === npc && rt.available(g.quest)) void this.loader.load(g.quest, 'proximity');
  }

  /** Givers on this POI (for proximity checks). */
  giversOn(poi: string): string[] {
    return this.runtime?.giversOn(poi).map((g) => g.npc) ?? [];
  }

  /** On the way to a POI: fetch its givers' packs and the active quests' that happen there. */
  prefetchFor(poi: string): void {
    const rt = this.runtime;
    if (!rt) return;
    const want = new Set<string>();
    for (const g of rt.giversOn(poi)) if (rt.available(g.quest)) want.add(g.quest);
    for (const q of rt.active) if (!this.loader.isLoaded(q.id)) want.add(q.id);
    for (const id of want) void this.loader.load(id, 'travel');
  }

  load(id: string, reason: LoadReason): void {
    void this.loader.load(id, reason);
  }

  // ------------------------------------------------------------------ the game talks to quests

  emit(e: QuestEvent): void {
    this.runtime?.emit(e);
  }

  /** Notice what changed in the bags (every frame, also with a panel open: picking up counts at once). */
  sync(): void {
    this.runtime?.syncItems();
  }

  /** Time passes (play on any POI, and the travel ride). */
  update(dt: number): void {
    const rt = this.runtime;
    if (!rt) return;
    rt.update(dt);
    if (rt.active.some((q) => Object.keys(q.timers).length > 0)) {
      this.sinceSave += dt;
      if (this.sinceSave >= TIMER_SAVE_INTERVAL) this.save();
    }
  }

  /** Who the giver of a quest is (`poi` / npc id). */
  giverOf(id: string): { poi: string; id: string } | null {
    const e = this.catalog.find((x) => x.id === id);
    return e ? splitRef(e.giver) : null;
  }

  // ------------------------------------------------------------------ save

  /** Extra data the mode keeps with the quest save (story: where the player is). */
  where: QuestSaveData['where'];

  save(): void {
    this.sinceSave = 0;
    if (!this.runtime || this.opts.persist === false) return;
    saveQuests(this.mode, { ...this.runtime.save(), where: this.where });
  }

  /** Debug: forget every quest (state and save). */
  resetAll(): void {
    const rt = this.runtime;
    if (!rt) return;
    for (const id of [...rt.states.keys()]) rt.reset(id);
    rt.flags = {};
    rt.pois = {};
    if (this.opts.persist !== false) clearQuestSave(this.mode);
  }
}
