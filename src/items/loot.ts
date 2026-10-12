import { LOOT_TABLES, type LootEntry, type LootTableId } from '../data/lootTables';
import type { Rng } from '../util/math';
import type { GridContainer } from './GridContainer';
import { itemDef, weaponOf } from './ItemDef';
import { createItem, type ItemInstance } from './ItemInstance';

/** Entries available at this wave (sandbox: Infinity = everything). */
export function eligible(table: readonly LootEntry[], wave: number): LootEntry[] {
  return table.filter((e) => (e.minWave ?? 1) <= wave);
}

/** One weighted pick (null for an empty table). */
export function pickEntry(table: readonly LootEntry[], rng: Rng): LootEntry | null {
  const total = table.reduce((s, e) => s + e.weight, 0);
  if (total <= 0) return null;
  let r = rng.next() * total;
  for (const e of table) {
    r -= e.weight;
    if (r < 0) return e;
  }
  return table[table.length - 1];
}

/** A new item for an entry: stack size from its range, guns with a random number of rounds loaded. */
export function makeLoot(e: LootEntry, rng: Rng): ItemInstance {
  const def = itemDef(e.item);
  const [lo, hi] = e.qty ?? [1, 1];
  const qty = Math.min(def.maxStack, rng.int(lo, hi + 1));
  const w = weaponOf(def);
  return createItem(e.item, qty, w ? rng.int(0, w.magazine + 1) : undefined);
}

/**
 * Roll `count` finds from a table into a grid. Each one goes into the first free spot (either
 * orientation); finds that don't fit are skipped. Returns the items placed.
 */
export function fillWithLoot(grid: GridContainer, table: LootTableId, count: number, rng: Rng, wave = Infinity): ItemInstance[] {
  const pool = eligible(LOOT_TABLES[table], wave);
  const placed: ItemInstance[] = [];
  for (let i = 0; i < count; i++) {
    const e = pickEntry(pool, rng);
    if (!e) break;
    const item = makeLoot(e, rng);
    if (grid.placeAnywhere(item)) placed.push(item);
  }
  return placed;
}
