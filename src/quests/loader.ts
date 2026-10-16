import type { QuestHooksFactory } from './api';
import type { FetchJson } from './catalog';
import type { QuestPack } from './types';
import { validatePack, type ValidationContext } from './validate';

/** Lazy importers of the quests' script hooks: one chunk per quest, imported with its pack. */
export const HOOK_MODULES: Record<string, () => Promise<unknown>> = import.meta.glob('./*/hooks.ts');

export interface LoadedPack {
  pack: QuestPack;
  hooks: QuestHooksFactory | null;
}

/** Why a pack was asked for (shown in the debug panel; tests check the triggers). */
export type LoadReason = 'proximity' | 'start' | 'save' | 'travel' | 'debug';

export interface PackLoaderOptions {
  base: string;
  get: FetchJson;
  ctx: ValidationContext;
  /** Pack version from the catalog (cache-busting query). */
  version(id: string): number;
  hooks?: Record<string, () => Promise<unknown>>;
  /** A pack loaded: register its items and the like. */
  onLoaded?(p: LoadedPack): void;
  /** A pack couldn't be loaded (it's retried on the next trigger). */
  onError?(id: string, message: string): void;
}

/**
 * Fetches quest packs only when they're needed, validates them, imports their hooks, and keeps
 * them. A failed load is forgotten so the next trigger tries again; nothing ever throws into the
 * game.
 */
export class PackLoader {
  private loaded = new Map<string, LoadedPack>();
  private pending = new Map<string, Promise<LoadedPack | null>>();
  /** Every load request (for the debug panel and tests). */
  readonly requests: { id: string; reason: LoadReason }[] = [];
  /** Validation / fetch errors, newest last. */
  readonly errors: string[] = [];

  constructor(private opts: PackLoaderOptions) {}

  get(id: string): LoadedPack | null {
    return this.loaded.get(id) ?? null;
  }

  isLoaded(id: string): boolean {
    return this.loaded.has(id);
  }

  get loadedIds(): string[] {
    return [...this.loaded.keys()];
  }

  /** Load (or return) a pack. Resolves to null if it couldn't be loaded. */
  load(id: string, reason: LoadReason): Promise<LoadedPack | null> {
    const have = this.loaded.get(id);
    if (have) return Promise.resolve(have);
    const busy = this.pending.get(id);
    if (busy) return busy;
    this.requests.push({ id, reason });
    const p = this.fetchPack(id).finally(() => this.pending.delete(id));
    this.pending.set(id, p);
    return p;
  }

  private async fetchPack(id: string): Promise<LoadedPack | null> {
    const o = this.opts;
    let raw: unknown;
    try {
      raw = await o.get(`${o.base}${id}/quest.json?v=${o.version(id)}`);
    } catch (err) {
      return this.fail(id, `quest "${id}": couldn't load its pack (${String(err)})`);
    }
    const v = validatePack(raw, o.ctx, id);
    if (!v.ok) {
      this.errors.push(...v.errors);
      return this.fail(id, v.errors[0]);
    }
    let hooks: QuestHooksFactory | null = null;
    if (v.value.hooks) {
      const importer = (o.hooks ?? HOOK_MODULES)[`./${id}/hooks.ts`];
      if (!importer) return this.fail(id, `quest "${id}": hooks: true, but there's no src/quests/${id}/hooks.ts`);
      try {
        const mod = (await importer()) as { default?: QuestHooksFactory };
        if (typeof mod.default !== 'function') return this.fail(id, `quest "${id}": hooks.ts must default-export a function`);
        hooks = mod.default;
      } catch (err) {
        return this.fail(id, `quest "${id}": couldn't load its hooks (${String(err)})`);
      }
    }
    const lp = { pack: v.value, hooks };
    this.loaded.set(id, lp);
    o.onLoaded?.(lp);
    return lp;
  }

  private fail(id: string, message: string): null {
    if (!this.errors.includes(message)) this.errors.push(message);
    this.opts.onError?.(id, message);
    return null;
  }
}
