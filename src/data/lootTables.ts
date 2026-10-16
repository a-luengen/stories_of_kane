import { ClothingRegistry } from './clothing';

export type LootTableId = 'ammoOnly' | 'weaponsOnly' | 'general';

/** One possible find: an item id, its relative weight, and how many (stackables). */
export interface LootEntry {
  item: string;
  weight: number;
  /** Stack size range, inclusive (default 1). */
  qty?: [number, number];
  /** Wave mode: only from this wave on. */
  minWave?: number;
}

const clothing = Object.keys(ClothingRegistry);

/**
 * Weighted loot tables. Each container type rolls a number of entries from one table (see
 * CONTAINER_TYPES in world/Container.ts); weapons come with a random number of rounds loaded.
 */
export const LOOT_TABLES: Record<LootTableId, LootEntry[]> = {
  ammoOnly: [
    { item: 'ammo_revolver', weight: 5, qty: [6, 18] },
    { item: 'ammo_rifle', weight: 3, qty: [4, 10] },
    { item: 'ammo_shells', weight: 3, qty: [3, 8] },
    { item: 'ammo_magnum', weight: 1, qty: [4, 12], minWave: 5 },
  ],
  weaponsOnly: [
    { item: 'revolver', weight: 6 },
    { item: 'derringer', weight: 4, minWave: 2 },
    { item: 'rifle', weight: 3, minWave: 2 },
    { item: 'shotgun', weight: 2, minWave: 4 },
    { item: 'nickel_revolver', weight: 2, minWave: 3 },
    { item: 'sawed_off', weight: 1.5, minWave: 3 },
    { item: 'magnum', weight: 0.6, minWave: 5 },
  ],
  general: [
    { item: 'ammo_revolver', weight: 4, qty: [4, 14] },
    { item: 'ammo_rifle', weight: 2, qty: [3, 8] },
    { item: 'ammo_shells', weight: 2, qty: [2, 6] },
    { item: 'bandage', weight: 4, qty: [1, 2] },
    // Clothing shares a total weight of 4 across every piece.
    ...clothing.map((item) => ({ item, weight: 4 / clothing.length })),
    // A low chance of a gun.
    { item: 'revolver', weight: 0.6 },
    { item: 'derringer', weight: 0.5, minWave: 2 },
    { item: 'rifle', weight: 0.3, minWave: 2 },
    { item: 'shotgun', weight: 0.2, minWave: 4 },
    // (Guns stay under a tenth of the finds here.)
    { item: 'nickel_revolver', weight: 0.09, minWave: 3 },
    { item: 'sawed_off', weight: 0.07, minWave: 3 },
    { item: 'magnum', weight: 0.03, minWave: 5 },
    { item: 'ammo_magnum', weight: 0.4, qty: [4, 10], minWave: 5 },
  ],
};
