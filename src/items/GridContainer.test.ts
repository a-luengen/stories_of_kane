import { describe, expect, it } from 'vitest';
import { CONFIG } from '../config';
import { Equipment } from './Equipment';
import { GridContainer, mergeStacks, splitStack } from './GridContainer';
import { createItem } from './ItemInstance';
import { beginDrag, beginSplit, canDrop, cancelDrag, dropDrag, pickup, takeAll } from './transfer';

const REV_MAX = CONFIG.items.ammoMaxStack.revolverAmmo;

describe('GridContainer', () => {
  it('places items, rejecting collisions and out-of-bounds', () => {
    const g = new GridContainer(8, 4);
    const rifle = createItem('rifle'); // 4×1
    expect(g.place(rifle, 0, 0)).toBe(true);
    expect(g.place(createItem('revolver'), 3, 0)).toBe(false); // overlaps the rifle
    expect(g.place(createItem('revolver'), 7, 0)).toBe(false); // 2 wide at x=7 → out of bounds
    expect(g.place(createItem('revolver'), 4, 0)).toBe(true);
    expect(g.at(2, 0)?.item).toBe(rifle);
    expect(g.at(2, 1)).toBeUndefined();
  });

  it('rotation swaps the footprint', () => {
    const g = new GridContainer(8, 4);
    const rifle = createItem('rifle');
    expect(g.place(rifle, 0, 0, true)).toBe(true); // 1×4 standing up
    expect(g.fits(createItem('revolver'), 1, 0)).toBe(true);
    expect(g.at(0, 3)?.item).toBe(rifle);
    expect(g.move(rifle, 2, 0, false)).toBe(true); // lay it flat again
    expect(g.at(5, 0)?.item).toBe(rifle);
  });

  it('finds free space, trying the other orientation', () => {
    const g = new GridContainer(4, 4);
    g.place(createItem('revolver'), 0, 0);
    g.place(createItem('revolver'), 2, 0);
    g.place(createItem('revolver'), 0, 2);
    // Only a 2×2 hole at (2,2): a 4×1 rifle can't fit either way.
    expect(g.findFree(createItem('rifle'))).toBeNull();
    const g2 = new GridContainer(2, 4);
    // 4 wide doesn't fit a 2-wide grid; standing (1×4) does.
    expect(g2.findFree(createItem('rifle'))).toEqual({ x: 0, y: 0, rotated: true });
  });

  it('auto-merges stacks on add, respecting the configured stack limit', () => {
    const g = new GridContainer(8, 4);
    const a = createItem('ammo_revolver', REV_MAX - 5);
    g.add(a);
    const b = createItem('ammo_revolver', 12);
    expect(g.add(b)).toBe(0);
    expect(a.quantity).toBe(REV_MAX);
    expect(b.quantity).toBe(7); // the rest became its own stack
    expect(g.items).toHaveLength(2);
    expect(createItem('ammo_shells', 99).quantity).toBe(CONFIG.items.ammoMaxStack.shotgunShells);
  });

  it('merges and splits stacks', () => {
    const a = createItem('ammo_rifle', 15);
    const b = createItem('ammo_rifle', 10);
    expect(mergeStacks(a, b)).toBe(CONFIG.items.ammoMaxStack.rifleAmmo - 10);
    const half = splitStack(createItem('ammo_rifle', 9))!;
    expect(half.quantity).toBe(4);
    expect(splitStack(createItem('revolver'))).toBeNull();
    expect(mergeStacks(createItem('ammo_rifle', 3), createItem('ammo_shells', 3))).toBe(0);
  });

  it('consumes ammo smallest stack first', () => {
    const g = new GridContainer(8, 4);
    const big = createItem('ammo_revolver', 30);
    const small = createItem('ammo_revolver', 4);
    g.placeAnywhere(big);
    g.placeAnywhere(small);
    expect(g.ammoCount('revolverAmmo')).toBe(34);
    expect(g.takeAmmo('revolverAmmo', 6)).toBe(6);
    expect(g.items).toEqual([big]); // the small stack was used up and removed
    expect(big.quantity).toBe(28);
    expect(g.takeAmmo('rifleAmmo', 5)).toBe(0);
  });
});

describe('drag & drop', () => {
  it('moves an item to empty space', () => {
    const g = new GridContainer(8, 4);
    const r = createItem('revolver');
    g.place(r, 0, 0);
    const d = beginDrag({ kind: 'grid', grid: g, x: 1, y: 1 })!;
    expect(dropDrag(d, { kind: 'grid', grid: g, x: 5, y: 2 }, null).ok).toBe(true);
    expect(g.find(r)).toMatchObject({ x: 5, y: 2 });
  });

  it('snaps back on an invalid drop', () => {
    const g = new GridContainer(8, 4);
    const r = createItem('revolver');
    g.place(r, 2, 1);
    const d = beginDrag({ kind: 'grid', grid: g, x: 2, y: 1 })!;
    d.item.rotated = true; // rotated while dragging
    expect(dropDrag(d, { kind: 'grid', grid: g, x: 7, y: 3 }, null).ok).toBe(false);
    expect(g.find(r)).toMatchObject({ x: 2, y: 1 });
    expect(r.rotated).toBe(false);
  });

  it('keeps the rotation set while dragging', () => {
    const g = new GridContainer(8, 4);
    const rifle = createItem('rifle');
    g.place(rifle, 0, 0);
    const d = beginDrag({ kind: 'grid', grid: g, x: 0, y: 0 })!;
    d.item.rotated = true;
    expect(dropDrag(d, { kind: 'grid', grid: g, x: 6, y: 0 }, null).ok).toBe(true);
    expect(rifle.rotated).toBe(true);
    expect(g.at(6, 3)?.item).toBe(rifle);
  });

  it('merges onto the same ammo type; the remainder returns', () => {
    const g = new GridContainer(8, 4);
    const a = createItem('ammo_revolver', REV_MAX - 3);
    const b = createItem('ammo_revolver', 10);
    g.place(a, 0, 0);
    g.place(b, 3, 0);
    const d = beginDrag({ kind: 'grid', grid: g, x: 3, y: 0 })!;
    expect(dropDrag(d, { kind: 'grid', grid: g, x: 0, y: 0 }, null).ok).toBe(true);
    expect(a.quantity).toBe(REV_MAX);
    expect(b.quantity).toBe(7);
    expect(g.find(b)).toMatchObject({ x: 3, y: 0 });
  });

  it('Shift-drag splits a stack in half; cancelling merges it back', () => {
    const g = new GridContainer(8, 4);
    const a = createItem('ammo_shells', 9);
    g.place(a, 0, 0);
    const d = beginSplit(g, 0, 0)!;
    expect(d.item.quantity).toBe(4);
    expect(a.quantity).toBe(5);
    expect(dropDrag(d, { kind: 'grid', grid: g, x: 4, y: 2 }, null).ok).toBe(true);
    expect(g.items).toHaveLength(2);
    const d2 = beginSplit(g, 0, 0)!;
    cancelDrag(d2);
    expect(a.quantity).toBe(5);
  });

  it('swaps with a single item when the swap fits, otherwise snaps back', () => {
    const g = new GridContainer(8, 4);
    const rev = createItem('revolver');
    const box = createItem('ammo_rifle', 5);
    g.place(rev, 0, 0);
    g.place(box, 4, 0);
    const d = beginDrag({ kind: 'grid', grid: g, x: 0, y: 0 })!;
    expect(dropDrag(d, { kind: 'grid', grid: g, x: 4, y: 0 }, null).ok).toBe(true);
    expect(g.find(rev)).toMatchObject({ x: 4, y: 0 });
    expect(g.find(box)).toMatchObject({ x: 0, y: 0 });

    // A shotgun (4×2) onto a box in a full grid: the box can't go anywhere → snap back.
    const full = new GridContainer(4, 2);
    const shells = createItem('ammo_shells', 2);
    full.place(shells, 0, 0);
    const shotgun = createItem('shotgun');
    const eq = new Equipment();
    eq.put('w0', shotgun, null);
    const d2 = beginDrag({ kind: 'slot', holder: eq, key: 'w0' })!;
    expect(dropDrag(d2, { kind: 'grid', grid: full, x: 0, y: 0 }, null).ok).toBe(false);
    expect(eq.get('w0')).toBe(shotgun);
    expect(full.find(shells)).toBeDefined();
  });

  it('weapon slots take weapons only and swap with each other', () => {
    const eq = new Equipment();
    const g = new GridContainer(8, 4);
    const rev = createItem('revolver');
    const rifle = createItem('rifle');
    eq.put('w0', rev, null);
    g.place(rifle, 0, 0);
    const shells = createItem('ammo_shells', 3);
    g.place(shells, 6, 0);
    expect(dropDrag(beginDrag({ kind: 'grid', grid: g, x: 6, y: 0 })!, { kind: 'slot', holder: eq, key: 'w1' }, g).ok).toBe(false);
    // Rifle from the grid onto the revolver's slot: revolver goes to the rifle's old spot.
    expect(dropDrag(beginDrag({ kind: 'grid', grid: g, x: 0, y: 0 })!, { kind: 'slot', holder: eq, key: 'w0' }, g).ok).toBe(true);
    expect(eq.get('w0')).toBe(rifle);
    expect(g.find(rev)).toMatchObject({ x: 0, y: 0 });
  });

  it('a dress clears the top into the grid, or is refused without room', () => {
    const eq = new Equipment();
    const g = new GridContainer(8, 4);
    eq.put('top', createItem('shirt_cream'), g);
    eq.put('legs', createItem('trousers_denim'), g);
    const dress = createItem('dress_blue');
    g.place(dress, 0, 0);
    expect(dropDrag(beginDrag({ kind: 'grid', grid: g, x: 0, y: 0 })!, { kind: 'slot', holder: eq, key: 'legs' }, g).ok).toBe(true);
    expect(eq.get('legs')).toBe(dress);
    expect(eq.get('top')).toBeNull();
    expect(g.items.map((i) => i.defId).sort()).toEqual(['shirt_cream', 'trousers_denim']);

    const eq2 = new Equipment();
    const tiny = new GridContainer(2, 4); // room for the dress's 2×4 only
    eq2.put('top', createItem('shirt_cream'), tiny);
    eq2.put('legs', createItem('trousers_denim'), tiny);
    const dress2 = createItem('dress_blue');
    tiny.place(dress2, 0, 0);
    expect(dropDrag(beginDrag({ kind: 'grid', grid: tiny, x: 0, y: 0 })!, { kind: 'slot', holder: eq2, key: 'legs' }, tiny).ok).toBe(false);
    expect(eq2.get('legs')?.defId).toBe('trousers_denim');
    expect(tiny.find(dress2)).toBeDefined();
  });

  it('clothing only goes in its own slot', () => {
    const eq = new Equipment();
    expect(eq.accepts('hat', createItem('cowboy_hat_tan'))).toBe(true);
    expect(eq.accepts('boots', createItem('cowboy_hat_tan'))).toBe(false);
    expect(eq.accepts('legs', createItem('dress_blue'))).toBe(true);
    expect(eq.accepts('top', createItem('revolver'))).toBe(false);
  });

  it('canDrop predicts the result without changing anything', () => {
    const eq = new Equipment();
    const g = new GridContainer(8, 4);
    eq.put('top', createItem('shirt_cream'), g);
    const rifle = createItem('rifle');
    const box = createItem('ammo_rifle', 4);
    g.place(rifle, 0, 0);
    g.place(box, 0, 1);
    const d = beginDrag({ kind: 'grid', grid: g, x: 0, y: 0 })!;
    expect(canDrop(d, { kind: 'grid', grid: g, x: 4, y: 2 }, g)).toBe(true);
    expect(canDrop(d, { kind: 'grid', grid: g, x: 6, y: 0 }, g)).toBe(false); // out of bounds
    expect(canDrop(d, { kind: 'slot', holder: eq, key: 'w2' }, g)).toBe(true);
    expect(canDrop(d, { kind: 'slot', holder: eq, key: 'top' }, g)).toBe(false);
    // Nothing moved: the rifle is still held, the rest untouched.
    expect(g.find(rifle)).toBeUndefined();
    expect(g.find(box)).toMatchObject({ x: 0, y: 1 });
    expect(eq.get('w2')).toBeNull();
    expect(eq.get('top')?.defId).toBe('shirt_cream');
    cancelDrag(d);
    expect(g.find(rifle)).toMatchObject({ x: 0, y: 0 });
  });

  it('dropping outside hands the item to the world', () => {
    const g = new GridContainer(8, 4);
    const box = createItem('ammo_revolver', 12);
    g.place(box, 0, 0);
    const r = dropDrag(beginDrag({ kind: 'grid', grid: g, x: 0, y: 0 })!, { kind: 'world' }, null);
    expect(r.dropped).toBe(box);
    expect(g.isEmpty).toBe(true);
  });
});

describe('pickup and take all', () => {
  it('pickup merges into existing stacks first (partial stack)', () => {
    const g = new GridContainer(1, 1);
    const a = createItem('ammo_shells', 8);
    g.place(a, 0, 0);
    const ground = createItem('ammo_shells', 10);
    expect(pickup(g, ground)).toBe(6); // 4 merged, no room for the rest
    expect(a.quantity).toBe(CONFIG.items.ammoMaxStack.shotgunShells);
    expect(ground.quantity).toBe(6);
  });

  it('pickup falls back to the rotated orientation', () => {
    const g2 = new GridContainer(3, 4);
    g2.place(createItem('revolver'), 0, 0);
    g2.place(createItem('revolver'), 0, 2);
    const rifle = createItem('rifle');
    expect(pickup(g2, rifle)).toBe(0); // only fits standing up in the last column
    expect(rifle.rotated).toBe(true);
    expect(g2.find(rifle)).toMatchObject({ x: 2, y: 0 });
  });

  it('pickup when full leaves the item', () => {
    const g = new GridContainer(2, 2);
    g.place(createItem('revolver'), 0, 0);
    const box = createItem('ammo_rifle', 5);
    expect(pickup(g, box)).toBe(5);
    expect(g.items).toHaveLength(1);
  });

  it('take all moves what fits and leaves the rest', () => {
    const corpse = new GridContainer(8, 4);
    const shotgun = createItem('shotgun');
    const shells = createItem('ammo_shells', 6);
    corpse.place(shotgun, 0, 0);
    corpse.place(shells, 4, 0);
    const eq = new Equipment();
    const rev = createItem('revolver', 1, 2);
    eq.put('w0', rev, null);

    const bag = new GridContainer(3, 2); // fits the revolver and the shells, not the 4×2 shotgun
    const r = takeAll(corpse, bag, [{ holder: eq, key: 'w0' }]);
    expect(r.leftover).toBe(true);
    expect(bag.items).toContain(rev);
    expect(rev.loadedRounds).toBe(2); // keeps its loaded rounds
    expect(bag.items).toContain(shells);
    expect(corpse.items).toEqual([shotgun]);
    expect(eq.get('w0')).toBeNull();
  });
});
