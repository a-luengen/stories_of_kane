import type { CatalogEntry, QuestMode } from './types';
import { validateCatalog } from './validate';

/** Fetches JSON (the game passes `fetch`; tests pass a fake). Throws on failure. */
export type FetchJson = (url: string) => Promise<unknown>;

export const fetchJson: FetchJson = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
};

/** Where quest content is served from (GitHub Pages serves the game under a sub-path). */
export const questBase = (): string => `${import.meta.env.BASE_URL}quests/`;

export interface Catalog {
  entries: CatalogEntry[];
  errors: string[];
}

/**
 * The quest catalog for a mode: one small fetch when a playthrough starts. Quests for other
 * modes are dropped; packs aren't touched. A missing or broken catalog means no quests (never a
 * broken game).
 */
export async function loadCatalog(get: FetchJson, base: string, mode: QuestMode, pois: ReadonlySet<string>): Promise<Catalog> {
  let raw: unknown;
  try {
    raw = await get(`${base}index.json`);
  } catch (err) {
    return { entries: [], errors: [`quest catalog: couldn't load ${base}index.json (${String(err)})`] };
  }
  const v = validateCatalog(raw, { pois }, mode);
  if (!v.ok) {
    // Keep the entries that are fine on their own; report the rest.
    const all = (raw as { quests?: CatalogEntry[] })?.quests;
    const bad = new Set(v.errors.map((e) => /quests\[(\d+)\]/.exec(e)?.[1]).filter(Boolean).map(Number));
    const broken = v.errors.some((e) => e.includes('formatVersion') || e.includes('index'));
    const entries = !broken && Array.isArray(all) ? all.filter((e, i) => !bad.has(i) && e?.modes?.includes(mode)) : [];
    return { entries, errors: v.errors };
  }
  return { entries: v.value.quests.filter((e) => e.modes.includes(mode)), errors: [] };
}
