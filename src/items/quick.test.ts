import { describe, expect, it } from 'vitest';
import { CONFIG } from '../config';
import { Equipment } from './Equipment';
import { GridContainer } from './GridContainer';
import { createItem } from './ItemInstance';
import { quickEquip, quickMove, quickUnequip, takeAll } from './transfer';

const REV_MAX = CONFIG.items.ammoMaxStack.revolverAmmo;

describe('double-click: move across', () => {
  it('moves an item to the first free spot on the other side', () => {
    const crate = new GridContainer(6, 4);
    const bag = new GridContainer(8, 4);
    const gun = createItem('revolver');
    crate.place(gun, 3, 2);
    bag.place(createItem('rifle'), 0, 0);
    expect(quickMove(gun, { kind: 'grid', grid: crate }, bag)).toEqual({ ok: true });
    expect(crate.isEmpty).toBe(true);
    expect(bag.find(gun)).toMatchObject({ x: 4, y: 0 });
  });

  it('tops up matching stacks first', () => {
    const crate = new GridContainer(6, 4);
    const bag = new GridContainer(8, 4);
    const mine = createItem('ammo_revolver', 10);
    bag.place(mine, 0, 0);
    const found = createItem('ammo_revolver', 12);
    crate.place(found, 0, 0);
    expect(quickMove(found, { kind: 'grid', grid: crate }, bag).ok).toBe(true);
    expect(mine.quantity).toBe(22);
    expect(bag.items).toHaveLength(1);
    expect(crate.isEmpty).toBe(true);
  });

  it('turns an item on its side when that is the only way it fits', () => {
    const bag = new GridContainer(4, 4);
    for (let x = 1; x < 4; x++) for (let y = 0; y < 4; y++) bag.place(createItem('bandage'), x, y);
    const crate = new GridContainer(6, 4);
    const rifle = createItem('rifle'); // 4×1
    crate.place(rifle, 0, 0);
    expect(quickMove(rifle, { kind: 'grid', grid: crate }, bag).ok).toBe(true);
    expect(rifle.rotated).toBe(true);
    expect(bag.find(rifle)).toMatchObject({ x: 0, y: 0 });
  });

  it('no space: nothing changes; a stack that only partly fits leaves the rest behind', () => {
    const bag = new GridContainer(2, 1);
    bag.place(createItem('ammo_revolver', REV_MAX - 5), 0, 0);
    bag.place(createItem('bandage'), 1, 0);
    const crate = new GridContainer(6, 4);
    const gun = createItem('revolver');
    crate.place(gun, 2, 1);
    expect(quickMove(gun, { kind: 'grid', grid: crate }, bag)).toEqual({ ok: false, reason: 'noSpace' });
    expect(crate.find(gun)).toMatchObject({ x: 2, y: 1 });

    const ammo = createItem('ammo_revolver', 12);
    crate.place(ammo, 0, 0);
    expect(quickMove(ammo, { kind: 'grid', grid: crate }, bag)).toEqual({ ok: true, partial: true });
    expect(ammo.quantity).toBe(7);
    expect(crate.find(ammo)).toMatchObject({ x: 0, y: 0 });
  });

  it("from a slot (a corpse's gun) into the bags", () => {
    const corpse = new Equipment();
    const gun = createItem('rifle');
    corpse.put('w0', gun, null);
    const bag = new GridContainer(8, 4);
    expect(quickMove(gun, { kind: 'slot', holder: corpse, key: 'w0' }, bag).ok).toBe(true);
    expect(corpse.get('w0')).toBeNull();
    expect(bag.find(gun)).toBeTruthy();
  });
});

describe('double-click: equip / unequip', () => {
  it('a gun goes to the first free weapon slot', () => {
    const eq = new Equipment();
    eq.put('w0', createItem('revolver'), null);
    const bag = new GridContainer(8, 4);
    const rifle = createItem('rifle');
    bag.place(rifle, 0, 0);
    expect(quickEquip(rifle, bag, eq).ok).toBe(true);
    expect(eq.get('w1')).toBe(rifle);
    expect(bag.isEmpty).toBe(true);
    eq.put('w2', createItem('shotgun'), null);
    const another = createItem('revolver');
    bag.place(another, 0, 0);
    expect(quickEquip(another, bag, eq)).toEqual({ ok: false, reason: 'noSlot' });
    expect(bag.find(another)).toBeTruthy();
  });

  it('clothing replaces what is worn there; the old piece goes to the grid', () => {
    const eq = new Equipment();
    const oldHat = createItem('cowboy_hat_tan');
    eq.put('hat', oldHat, null);
    const bag = new GridContainer(8, 4);
    const hat = createItem('cowboy_hat_black');
    bag.place(hat, 0, 0);
    expect(quickEquip(hat, bag, eq).ok).toBe(true);
    expect(eq.get('hat')).toBe(hat);
    expect(bag.find(oldHat)).toBeTruthy();
  });

  it('a dress pushes the top out to the grid as well', () => {
    const eq = new Equipment();
    const top = createItem('shirt_denim');
    const trousers = createItem('trousers_brown');
    eq.put('top', top, null);
    eq.put('legs', trousers, null);
    const bag = new GridContainer(8, 4);
    const dress = createItem('dress_blue');
    bag.place(dress, 0, 0);
    expect(quickEquip(dress, bag, eq).ok).toBe(true);
    expect(eq.get('legs')).toBe(dress);
    expect(eq.get('top')).toBeNull();
    expect(bag.find(top) && bag.find(trousers)).toBeTruthy();
  });

  it('all or nothing: no room for everything it replaces keeps it all as it was', () => {
    const eq = new Equipment();
    const top = createItem('shirt_denim'); // 2×3
    const trousers = createItem('trousers_brown'); // 2×3
    eq.put('top', top, null);
    eq.put('legs', trousers, null);
    const bag = new GridContainer(2, 4);
    const dress = createItem('dress_blue'); // 2×4: once lifted, only one 2×3 piece fits back
    bag.place(dress, 0, 0);
    expect(quickEquip(dress, bag, eq)).toEqual({ ok: false, reason: 'noSpace' });
    expect(eq.get('top')).toBe(top);
    expect(eq.get('legs')).toBe(trousers);
    expect(bag.find(dress)).toMatchObject({ x: 0, y: 0 });
    expect(bag.items).toHaveLength(1);
  });

  it('unequip goes back into the grid, or stays when the grid is full', () => {
    const eq = new Equipment();
    const gun = createItem('revolver');
    eq.put('w0', gun, null);
    const bag = new GridContainer(8, 4);
    expect(quickUnequip(eq, 'w0', bag).ok).toBe(true);
    expect(bag.find(gun)).toBeTruthy();
    eq.put('w0', createItem('rifle'), null);
    const full = new GridContainer(1, 1);
    full.place(createItem('bandage'), 0, 0);
    expect(quickUnequip(eq, 'w0', full)).toEqual({ ok: false, reason: 'noSpace' });
    expect(eq.get('w0')).toBeTruthy();
  });
});

describe('take all', () => {
  it('works for a container without slots (merging stacks)', () => {
    const crate = new GridContainer(6, 4);
    const bag = new GridContainer(8, 4);
    const mine = createItem('ammo_rifle', 4);
    bag.place(mine, 0, 0);
    crate.placeAnywhere(createItem('ammo_rifle', 6));
    crate.placeAnywhere(createItem('bandage'));
    expect(takeAll(crate, bag)).toEqual({ moved: 2, leftover: false });
    expect(mine.quantity).toBe(10);
  });
});
