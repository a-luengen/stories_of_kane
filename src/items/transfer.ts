import type { SlotHolder, SlotKey } from './Equipment';
import { mergeStacks, splitStack, type GridContainer } from './GridContainer';
import { itemDef } from './ItemDef';
import { footprint, type ItemInstance } from './ItemInstance';

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
