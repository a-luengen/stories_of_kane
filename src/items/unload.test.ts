import { describe, expect, it } from 'vitest';
import { CONFIG } from '../config';
import { GridContainer } from './GridContainer';
import { createItem } from './ItemInstance';
import { unloadWeapon } from './transfer';

const REV_MAX = CONFIG.items.ammoMaxStack.revolverAmmo;
const SHELL_MAX = CONFIG.items.ammoMaxStack.shotgunShells;

describe('unloading guns', () => {
  it('tops up the matching ammo stack first', () => {
    const bag = new GridContainer(8, 4);
    const stack = createItem('ammo_revolver', 10);
    bag.place(stack, 0, 0);
    const other = createItem('ammo_rifle', 3);
    bag.place(other, 1, 0);
    const gun = createItem('revolver', 1, 6);
    expect(unloadWeapon(gun, bag)).toEqual({ unloaded: 6, left: 0 });
    expect(gun.loadedRounds).toBe(0);
    expect(stack.quantity).toBe(16);
    expect(other.quantity).toBe(3);
    expect(bag.items).toHaveLength(2);
  });

  it('spills over full stacks into a new stack in a free cell', () => {
    const bag = new GridContainer(8, 4);
    const stack = createItem('ammo_revolver', REV_MAX - 2);
    bag.place(stack, 0, 0);
    const gun = createItem('revolver', 1, 5);
    expect(unloadWeapon(gun, bag)).toEqual({ unloaded: 5, left: 0 });
    expect(stack.quantity).toBe(REV_MAX);
    const fresh = bag.items.find((i) => i !== stack)!;
    expect(fresh.defId).toBe('ammo_revolver');
    expect(fresh.quantity).toBe(3);
  });

  it('partial fit: the rest stays loaded', () => {
    const bag = new GridContainer(1, 1);
    const shells = createItem('ammo_shells', SHELL_MAX - 1);
    bag.place(shells, 0, 0);
    const gun = createItem('shotgun', 1, 2);
    expect(unloadWeapon(gun, bag)).toEqual({ unloaded: 1, left: 1 });
    expect(gun.loadedRounds).toBe(1);
    expect(shells.quantity).toBe(SHELL_MAX);
  });

  it('no space at all changes nothing', () => {
    const bag = new GridContainer(1, 1);
    bag.place(createItem('bandage'), 0, 0);
    const gun = createItem('rifle', 1, 4);
    expect(unloadWeapon(gun, bag)).toEqual({ unloaded: 0, left: 4 });
    expect(gun.loadedRounds).toBe(4);
    expect(bag.items).toHaveLength(1);
  });

  it('works on a gun lying in the same grid, and ignores empty guns and non-guns', () => {
    const crate = new GridContainer(6, 4);
    const gun = createItem('revolver', 1, 3);
    crate.place(gun, 0, 0);
    expect(unloadWeapon(gun, crate)).toEqual({ unloaded: 3, left: 0 });
    expect(crate.items.find((i) => i.defId === 'ammo_revolver')?.quantity).toBe(3);
    expect(unloadWeapon(gun, crate)).toEqual({ unloaded: 0, left: 0 });
    expect(unloadWeapon(createItem('bandage'), crate)).toEqual({ unloaded: 0, left: 0 });
  });
});
