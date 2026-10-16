import { itemDef, weaponOf } from './ItemDef';

/** One concrete item (or stack) somewhere: in a grid, a slot, on a corpse or on the ground. */
export interface ItemInstance {
  uid: number;
  defId: string;
  /** Stack size (1 for non-stackables). */
  quantity: number;
  /** Footprint rotated 90° (w and h swapped). */
  rotated: boolean;
  /** Weapons: rounds in the magazine (kept when moved, dropped or looted). */
  loadedRounds?: number;
  /** Put in the world by a quest step (its setup key): picking it up is noticed. */
  questKey?: string;
}

let nextUid = 1;

export function newUid(): number {
  return nextUid++;
}

/** New instance. Weapons start fully loaded unless `loadedRounds` says otherwise. */
export function createItem(defId: string, quantity = 1, loadedRounds?: number): ItemInstance {
  const def = itemDef(defId);
  const item: ItemInstance = { uid: newUid(), defId, quantity: Math.min(quantity, def.maxStack), rotated: false };
  const weapon = weaponOf(def);
  if (weapon) item.loadedRounds = loadedRounds ?? weapon.magazine;
  return item;
}

/** Grid footprint, taking rotation into account. */
export function footprint(item: ItemInstance, rotated = item.rotated): { w: number; h: number } {
  const { w, h } = itemDef(item.defId).size;
  return rotated ? { w: h, h: w } : { w, h };
}

/** Display name, with the count for stacks. */
export function itemLabel(item: ItemInstance): string {
  const d = itemDef(item.defId);
  return d.stackable ? `${d.name} x${item.quantity}` : d.name;
}

/** An item as plain data (for saving a place's state). */
export interface ItemData {
  defId: string;
  quantity: number;
  rotated: boolean;
  loadedRounds?: number;
  questKey?: string;
}

/** An item in a grid cell, as plain data. */
export interface PlacedItemData extends ItemData {
  x: number;
  y: number;
}

export function itemToData(item: ItemInstance): ItemData {
  const d: ItemData = { defId: item.defId, quantity: item.quantity, rotated: item.rotated };
  if (item.loadedRounds !== undefined) d.loadedRounds = item.loadedRounds;
  if (item.questKey !== undefined) d.questKey = item.questKey;
  return d;
}

export function itemFromData(d: ItemData): ItemInstance {
  const item = createItem(d.defId, d.quantity, d.loadedRounds);
  item.rotated = d.rotated;
  if (d.questKey !== undefined) item.questKey = d.questKey;
  return item;
}
