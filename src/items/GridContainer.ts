import { itemDef } from './ItemDef';
import { footprint, newUid, type ItemInstance } from './ItemInstance';

export interface Placement {
  item: ItemInstance;
  x: number;
  y: number;
}

/** Where an item could go: top-left cell and orientation. */
export interface Spot {
  x: number;
  y: number;
  rotated: boolean;
}

/** Something weapons reload from. */
export interface AmmoSource {
  ammoCount(ammoType: string): number;
  /** Remove up to `n` rounds; returns how many were taken. */
  takeAmmo(ammoType: string, n: number): number;
}

/** A w × h grid of cells holding rectangular items (player bags, NPC pockets, corpses). */
export class GridContainer implements AmmoSource {
  readonly placements: Placement[] = [];

  constructor(
    readonly w: number,
    readonly h: number,
  ) {}

  get items(): ItemInstance[] {
    return this.placements.map((p) => p.item);
  }

  get isEmpty(): boolean {
    return this.placements.length === 0;
  }

  find(item: ItemInstance): Placement | undefined {
    return this.placements.find((p) => p.item === item);
  }

  /** The item covering a cell, if any. */
  at(x: number, y: number): Placement | undefined {
    return this.placements.find((p) => {
      const f = footprint(p.item);
      return x >= p.x && x < p.x + f.w && y >= p.y && y < p.y + f.h;
    });
  }

  /** Items overlapping a rectangle (excluding `ignore`). */
  overlapping(x: number, y: number, w: number, h: number, ignore?: ItemInstance): Placement[] {
    return this.placements.filter((p) => {
      if (p.item === ignore) return false;
      const f = footprint(p.item);
      return x < p.x + f.w && x + w > p.x && y < p.y + f.h && y + h > p.y;
    });
  }

  inBounds(x: number, y: number, w: number, h: number): boolean {
    return x >= 0 && y >= 0 && x + w <= this.w && y + h <= this.h;
  }

  /** In bounds and not overlapping anything (except `ignore`). */
  fits(item: ItemInstance, x: number, y: number, rotated = item.rotated, ignore?: ItemInstance): boolean {
    const f = footprint(item, rotated);
    return this.inBounds(x, y, f.w, f.h) && this.overlapping(x, y, f.w, f.h, ignore).length === 0;
  }

  /** Place at a cell (setting the rotation). False if it doesn't fit. */
  place(item: ItemInstance, x: number, y: number, rotated = item.rotated): boolean {
    if (this.find(item) || !this.fits(item, x, y, rotated)) return false;
    item.rotated = rotated;
    this.placements.push({ item, x, y });
    return true;
  }

  remove(item: ItemInstance): boolean {
    const i = this.placements.findIndex((p) => p.item === item);
    if (i < 0) return false;
    this.placements.splice(i, 1);
    return true;
  }

  /** Move an item already in this grid. */
  move(item: ItemInstance, x: number, y: number, rotated = item.rotated): boolean {
    const p = this.find(item);
    if (!p || !this.fits(item, x, y, rotated, item)) return false;
    p.x = x;
    p.y = y;
    item.rotated = rotated;
    return true;
  }

  /** First free spot, scanning rows top-down; tries the current orientation, then the other. */
  findFree(item: ItemInstance): Spot | null {
    const orientations = [item.rotated, !item.rotated];
    const { w, h } = itemDef(item.defId).size;
    if (w === h) orientations.pop();
    for (const rotated of orientations) {
      for (let y = 0; y < this.h; y++) {
        for (let x = 0; x < this.w; x++) {
          if (this.fits(item, x, y, rotated)) return { x, y, rotated };
        }
      }
    }
    return null;
  }

  /** Put an item anywhere it fits (no merging). */
  placeAnywhere(item: ItemInstance): boolean {
    const s = this.findFree(item);
    return s ? this.place(item, s.x, s.y, s.rotated) : false;
  }

  /**
   * Store an item: stackables first top up existing stacks, then whatever remains is placed in a
   * free spot (either orientation). Returns the quantity that didn't fit (0 = all stored); a
   * partially stored stack keeps its reduced quantity.
   */
  add(item: ItemInstance): number {
    const def = itemDef(item.defId);
    if (def.stackable) {
      for (const p of this.placements) {
        if (item.quantity <= 0) break;
        if (p.item.defId === item.defId && p.item !== item) mergeStacks(item, p.item);
      }
      if (item.quantity <= 0) return 0;
    }
    return this.placeAnywhere(item) ? 0 : item.quantity;
  }

  /** Capture the layout; the returned function restores it (for all-or-nothing operations). */
  snapshot(): () => void {
    const saved = this.placements.map((p) => ({ ...p, rotated: p.item.rotated, quantity: p.item.quantity }));
    return () => {
      this.placements.length = 0;
      for (const s of saved) {
        s.item.rotated = s.rotated;
        s.item.quantity = s.quantity;
        this.placements.push({ item: s.item, x: s.x, y: s.y });
      }
    };
  }

  ammoCount(ammoType: string): number {
    let n = 0;
    for (const p of this.placements) if (itemDef(p.item.defId).ammoType === ammoType) n += p.item.quantity;
    return n;
  }

  /** Take rounds from matching stacks, smallest stack first; emptied stacks are removed. */
  takeAmmo(ammoType: string, n: number): number {
    const stacks = this.placements
      .filter((p) => itemDef(p.item.defId).ammoType === ammoType)
      .sort((a, b) => a.item.quantity - b.item.quantity);
    let taken = 0;
    for (const p of stacks) {
      if (taken >= n) break;
      const k = Math.min(n - taken, p.item.quantity);
      p.item.quantity -= k;
      taken += k;
      if (p.item.quantity <= 0) this.remove(p.item);
    }
    return taken;
  }
}

/** Move as much of `src` into `dst` as the stack limit allows (same item type). Returns the amount moved. */
export function mergeStacks(src: ItemInstance, dst: ItemInstance): number {
  if (src.defId !== dst.defId || src === dst) return 0;
  const def = itemDef(src.defId);
  if (!def.stackable) return 0;
  const k = Math.max(0, Math.min(src.quantity, def.maxStack - dst.quantity));
  src.quantity -= k;
  dst.quantity += k;
  return k;
}

/** Split off half a stack (rounded down) as a new, unplaced instance; null if it can't be split. */
export function splitStack(item: ItemInstance): ItemInstance | null {
  if (!itemDef(item.defId).stackable || item.quantity < 2) return null;
  const half = Math.floor(item.quantity / 2);
  item.quantity -= half;
  return { uid: newUid(), defId: item.defId, quantity: half, rotated: item.rotated };
}
