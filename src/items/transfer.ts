import { isDualWieldable, offHandKey, weaponKey, type Equipment, type SlotHolder, type SlotKey } from './Equipment';
import { mergeStacks, splitStack, type GridContainer } from './GridContainer';
import { ammoItemFor, clothingOf, itemDef, weaponOf } from './ItemDef';
import { createItem, footprint, type ItemInstance } from './ItemInstance';

/** A place an item can be: a grid cell (top-left) or a named slot. */
export type Loc =
  | { kind: 'grid'; grid: GridContainer; x: number; y: number }
  | { kind: 'slot'; holder: SlotHolder; key: SlotKey };

export type DropTarget = Loc | { kind: 'world' };

/** An item lifted out of its location (the game is paused while dragging). */
export interface Drag {
  item: ItemInstance;
  from: Loc;
  fromRotated: boolean;
  /** For Shift-drag splits: the stack the half came from (cancelling merges it back). */
  splitFrom: ItemInstance | null;
}

export interface DropResult {
  ok: boolean;
  /** Set when the item was dropped into the world (caller spawns it). */
  dropped?: ItemInstance;
}

/** Lift the item at a grid cell or in a slot. */
export function beginDrag(loc: Loc): Drag | null {
  if (loc.kind === 'grid') {
    const p = loc.grid.at(loc.x, loc.y);
    if (!p) return null;
    loc.grid.remove(p.item);
    return { item: p.item, from: { kind: 'grid', grid: loc.grid, x: p.x, y: p.y }, fromRotated: p.item.rotated, splitFrom: null };
  }
  const item = loc.holder.take(loc.key);
  return item ? { item, from: loc, fromRotated: item.rotated, splitFrom: null } : null;
}

/** Lift half of the stack at a grid cell (the rest stays put). Plain drag for unsplittable items. */
export function beginSplit(grid: GridContainer, x: number, y: number): Drag | null {
  const p = grid.at(x, y);
  if (!p) return null;
  const half = splitStack(p.item);
  if (!half) return beginDrag({ kind: 'grid', grid, x, y });
  return { item: half, from: { kind: 'grid', grid, x: p.x, y: p.y }, fromRotated: p.item.rotated, splitFrom: p.item };
}

/** Put the dragged item back where it came from. */
export function cancelDrag(d: Drag): void {
  if (d.splitFrom) {
    d.splitFrom.quantity += d.item.quantity;
    return;
  }
  d.item.rotated = d.fromRotated;
  if (d.from.kind === 'grid') d.from.grid.place(d.item, d.from.x, d.from.y, d.fromRotated);
  else d.from.holder.put(d.from.key, d.item, null);
}

/** Return a swapped-out item to the dragged item's origin (its old cell, else anywhere in that grid). */
function placeAtOrigin(from: Loc, item: ItemInstance, overflow: GridContainer | null): boolean {
  if (from.kind === 'grid') {
    const g = from.grid;
    return g.place(item, from.x, from.y, item.rotated) || g.place(item, from.x, from.y, !item.rotated) || g.placeAnywhere(item);
  }
  return from.holder.accepts(from.key, item) && from.holder.put(from.key, item, overflow);
}

/**
 * Drop the dragged item. Empty space → place; same stackable → merge (any remainder snaps back);
 * one other item → swap if it fits where the dragged item came from; anything invalid snaps back.
 * `overflow` takes items a slot change displaces (a dress clearing the top). All or nothing: a
 * failed drop restores every container it touched.
 */
export function dropDrag(d: Drag, target: DropTarget, overflow: GridContainer | null): DropResult {
  const item = d.item;
  if (target.kind === 'world') return { ok: true, dropped: item };

  const touched = new Set<{ snapshot(): () => void }>();
  for (const loc of [target, d.from]) touched.add(loc.kind === 'grid' ? loc.grid : loc.holder);
  if (overflow) touched.add(overflow);
  const restores = [...touched].map((t) => t.snapshot());
  const fail = (): DropResult => {
    for (const r of restores) r();
    cancelDrag(d);
    return { ok: false };
  };

  if (target.kind === 'grid') {
    const { grid, x, y } = target;
    const f = footprint(item);
    if (!grid.inBounds(x, y, f.w, f.h)) return fail();
    const over = grid.overlapping(x, y, f.w, f.h);
    if (over.length === 0) return grid.place(item, x, y) ? { ok: true } : fail();
    if (over.length > 1) return fail();
    const other = over[0];
    if (other.item.defId === item.defId && itemDef(item.defId).stackable) {
      mergeStacks(item, other.item);
      if (item.quantity > 0) cancelDrag(d);
      return { ok: true };
    }
    if (d.splitFrom) return fail();
    // Swap: the other item goes where the dragged one came from.
    grid.remove(other.item);
    if (!grid.place(item, x, y) || !placeAtOrigin(d.from, other.item, overflow)) return fail();
    return { ok: true };
  }

  const { holder, key } = target;
  if (!holder.accepts(key, item)) return fail();
  const occupant = holder.get(key);
  if (occupant) {
    if (d.splitFrom) return fail();
    holder.take(key);
  }
  if (!holder.put(key, item, overflow)) return fail();
  if (occupant && !placeAtOrigin(d.from, occupant, overflow)) return fail();
  return { ok: true };
}

/** Would this drop succeed? (Tries it for real, then restores everything; for UI highlighting.) */
export function canDrop(d: Drag, target: DropTarget, overflow: GridContainer | null): boolean {
  if (target.kind === 'world') return true;
  const touched = new Set<{ snapshot(): () => void }>();
  for (const loc of [target, d.from]) touched.add(loc.kind === 'grid' ? loc.grid : loc.holder);
  if (overflow) touched.add(overflow);
  const restores = [...touched].map((t) => t.snapshot());
  const { quantity, rotated } = d.item;
  const splitQuantity = d.splitFrom?.quantity ?? 0;
  const ok = dropDrag({ ...d }, target, overflow).ok;
  for (const r of restores) r();
  d.item.quantity = quantity;
  d.item.rotated = rotated;
  if (d.splitFrom) d.splitFrom.quantity = splitQuantity;
  return ok;
}

/**
 * Pick an item up from the ground into a grid: ammo tops up existing stacks first, the rest goes
 * in a free spot (rotated if needed). Returns how much is left over (0 = all picked up).
 */
export function pickup(grid: GridContainer, item: ItemInstance): number {
  return grid.add(item);
}

/** Move everything that fits from a container (and its slots) into `to`; the rest stays. */
export function takeAll(from: GridContainer, to: GridContainer, slots: { holder: SlotHolder; key: SlotKey }[] = []): { moved: number; leftover: boolean } {
  let moved = 0;
  for (const s of slots) {
    const item = s.holder.take(s.key);
    if (!item) continue;
    if (to.placeAnywhere(item)) moved++;
    else s.holder.put(s.key, item, null);
  }
  for (const p of [...from.placements]) {
    const { item, x, y } = p;
    const rot = item.rotated;
    const before = item.quantity;
    from.remove(item);
    const left = to.add(item);
    if (left < before) moved++;
    if (left > 0) from.place(item, x, y, rot);
  }
  const leftover = !from.isEmpty || slots.some((s) => s.holder.get(s.key));
  return { moved, leftover };
}

// ------------------------------------------------------------------------------ quick moves

/** Where an item sits, for the double-click shortcuts. */
export type Holding = { kind: 'grid'; grid: GridContainer } | { kind: 'slot'; holder: SlotHolder; key: SlotKey };

export type QuickResult = { ok: true; partial?: boolean } | { ok: false; reason: 'noSpace' | 'noSlot' };

/** Take an item out of where it is; returns a function that puts it back exactly. */
function lift(item: ItemInstance, from: Holding): (() => void) | null {
  if (from.kind === 'grid') {
    const p = from.grid.find(item);
    if (!p) return null;
    const { x, y } = p;
    const rot = item.rotated;
    from.grid.remove(item);
    return () => void from.grid.place(item, x, y, rot);
  }
  if (from.holder.get(from.key) !== item) return null;
  from.holder.take(from.key);
  return () => void from.holder.put(from.key, item, null);
}

/**
 * Double-click across the loot view: move an item into `to` — topping up matching stacks
 * first, then the first free spot (either orientation). A stack that only partly fits leaves
 * the rest where it was; nothing fitting changes nothing.
 */
export function quickMove(item: ItemInstance, from: Holding, to: GridContainer): QuickResult {
  if (from.kind === 'grid' && from.grid === to) return { ok: false, reason: 'noSpace' };
  const before = item.quantity;
  const putBack = lift(item, from);
  if (!putBack) return { ok: false, reason: 'noSpace' };
  const left = to.add(item);
  if (left === 0) return { ok: true };
  putBack();
  return left < before ? { ok: true, partial: true } : { ok: false, reason: 'noSpace' };
}

/**
 * Double-click in the inventory: a gun goes to the first free weapon slot, clothing to its slot
 * (whatever it replaces — and what a dress pushes out — goes back to the grid). All or nothing.
 */
export function quickEquip(item: ItemInstance, grid: GridContainer, eq: Equipment, active: number | null = null): QuickResult {
  const def = itemDef(item.defId);
  const p = grid.find(item);
  if (!p) return { ok: false, reason: 'noSlot' };
  let key: SlotKey | null = null;
  if (def.category === 'weapon') {
    const i = eq.weapons.findIndex((w) => w === null);
    if (active !== null && isDualWieldable(item) && isDualWieldable(eq.weapons[active]) && !eq.offHands[active]) {
      // A handgun next to the single handgun in the selected slot: dual wield.
      key = offHandKey(active);
    } else if (i < 0) return { ok: false, reason: 'noSlot' };
    else key = weaponKey(i);
  } else {
    const c = clothingOf(def);
    if (!c) return { ok: false, reason: 'noSlot' };
    key = c.slot === 'fullBody' ? 'legs' : c.slot;
  }
  const restoreGrid = grid.snapshot();
  const restoreEq = eq.snapshot();
  const fail = (): QuickResult => {
    restoreGrid();
    restoreEq();
    return { ok: false, reason: 'noSpace' };
  };
  grid.remove(item);
  const old = eq.take(key);
  if (!eq.put(key, item, grid)) return fail();
  if (old && grid.add(old) > 0) return fail();
  return { ok: true };
}

/** Double-click on something worn or slotted: back into the grid (if there's room). */
export function quickUnequip(holder: SlotHolder, key: SlotKey, grid: GridContainer): QuickResult {
  const item = holder.get(key);
  if (!item) return { ok: false, reason: 'noSlot' };
  holder.take(key);
  if (grid.add(item) === 0) return { ok: true };
  holder.put(key, item, null);
  return { ok: false, reason: 'noSpace' };
}

// ------------------------------------------------------------------------------ unloading

/**
 * Right-click on a gun: take its loaded rounds out into `into` — topping up matching ammo stacks
 * first, then new stacks in free cells. Whatever doesn't fit stays in the gun.
 */
export function unloadWeapon(item: ItemInstance, into: GridContainer): { unloaded: number; left: number } {
  const w = weaponOf(itemDef(item.defId));
  const loaded = item.loadedRounds ?? 0;
  const ammo = w ? ammoItemFor(w.ammoType) : null;
  if (!w || loaded <= 0 || !ammo) return { unloaded: 0, left: loaded };
  let left = loaded;
  for (const p of into.placements) {
    if (left <= 0) break;
    if (p.item.defId !== ammo.id) continue;
    const k = Math.min(left, ammo.maxStack - p.item.quantity);
    if (k <= 0) continue;
    p.item.quantity += k;
    left -= k;
  }
  while (left > 0) {
    const stack = createItem(ammo.id, Math.min(left, ammo.maxStack));
    if (!into.placeAnywhere(stack)) break;
    left -= stack.quantity;
  }
  item.loadedRounds = left;
  return { unloaded: loaded - left, left };
}
