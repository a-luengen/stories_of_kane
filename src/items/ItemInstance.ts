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
