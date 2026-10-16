import { describe, expect, it } from 'vitest';
import { WeaponState } from '../entities/Weapon';
import { Equipment } from '../items/Equipment';
import { GridContainer } from '../items/GridContainer';
import { ammoItemFor, itemDef, weaponOf } from '../items/ItemDef';
import { createItem } from '../items/ItemInstance';
import type { WeaponDef } from './types';
import { WEAPONS } from './weapons';

const DEG = Math.PI / 180;
const { revolver, nickel_revolver: nickel, sawed_off: sawedOff, shotgun, magnum } = WEAPONS;

describe('more guns: the stats', () => {
  it('the worn revolver is about 20% weaker: less damage, slower between shots', () => {
    expect(revolver.damage).toBe(20);
    expect(revolver.fireInterval).toBeCloseTo(0.36);
  });

  it('the Nickel Revolver has the stats the revolver had (and looks shinier)', () => {
    expect(nickel).toMatchObject({ damage: 25, fireInterval: 0.3, magazine: 6, reloadTime: 1.5, range: 46, bulletSpeed: 72, pellets: 1, falloffStart: 46, falloffMin: 1, carry: 'holster', ammoType: 'revolverAmmo', drawTime: 0.45, dualWieldable: true });
    expect(nickel.spread).toBeCloseTo(0.8 * DEG);
    expect(nickel.spreadGrowth).toBe(0.1);
    // Everything but the damage, the fire rate and the look is the revolver's.
    const strip = ({ id: _i, name: _n, damage: _d, fireInterval: _f, look: _l, ...rest }: WeaponDef) => rest;
    expect(strip(nickel)).toEqual(strip(revolver));
    expect(nickel.look.metal).not.toBe(revolver.look.metal);
  });

  it('the Sawed-Off: a one-handed shotgun with 1.5× the spread, double the reload, a shorter reach', () => {
    expect(sawedOff.spread).toBeCloseTo(shotgun.spread * 1.5);
    expect(sawedOff.reloadTime).toBeCloseTo(shotgun.reloadTime * 2);
    expect(sawedOff.range).toBeLessThan(shotgun.range);
    expect([sawedOff.damage, sawedOff.pellets, sawedOff.magazine, sawedOff.fireInterval, sawedOff.ammoType]).toEqual([shotgun.damage, shotgun.pellets, shotgun.magazine, shotgun.fireInterval, shotgun.ammoType]);
    expect([sawedOff.carry, sawedOff.look.kind, sawedOff.dualWieldable]).toEqual(['holster', 'pistol', true]);
    expect(itemDef('sawed_off').size).toEqual({ w: 2, h: 2 });
  });

  it('the Magnum: 60% more damage than the Nickel Revolver, four rounds, its own ammo, not for pairing', () => {
    expect(magnum.damage).toBeCloseTo(nickel.damage * 1.6);
    expect(magnum.magazine).toBe(4);
    expect(magnum.ammoType).toBe('magnumAmmo');
    expect(magnum.dualWieldable).toBe(false);
    expect([magnum.fireInterval, magnum.reloadTime]).toEqual([0.5, 2.0]); // (heavy: slower than the revolvers)
    expect(ammoItemFor('magnumAmmo')!.id).toBe('ammo_magnum');
    expect(itemDef('ammo_magnum')).toMatchObject({ category: 'ammo', boxQuantity: 12, stackable: true });
  });

  it('every new gun is an item that knows its weapon', () => {
    for (const id of ['nickel_revolver', 'sawed_off', 'magnum']) expect(weaponOf(itemDef(id))!.id).toBe(id);
  });
});

describe('more guns: ammo', () => {
  const reloadWith = (gun: string, ammo: string) => {
    const bag = new GridContainer(8, 4);
    bag.add(createItem(ammo, 12));
    const item = createItem(gun, 1, 0);
    const w = new WeaponState(weaponOf(itemDef(gun))!, item, bag);
    const started = w.startReload();
    w.update(10);
    return { started, loaded: w.ammo };
  };

  it('the magnum loads its own cartridges only, and nothing else takes them', () => {
    expect(reloadWith('magnum', 'ammo_magnum')).toEqual({ started: true, loaded: 4 });
    expect(reloadWith('magnum', 'ammo_revolver').started).toBe(false);
    expect(reloadWith('nickel_revolver', 'ammo_magnum').started).toBe(false);
    expect(reloadWith('revolver', 'ammo_magnum').started).toBe(false);
  });

  it('the Nickel Revolver takes revolver rounds; the Sawed-Off shotgun shells', () => {
    expect(reloadWith('nickel_revolver', 'ammo_revolver')).toEqual({ started: true, loaded: 6 });
    expect(reloadWith('sawed_off', 'ammo_shells')).toEqual({ started: true, loaded: 2 });
    expect(reloadWith('sawed_off', 'ammo_revolver').started).toBe(false);
  });
});

describe('more guns: dual wielding', () => {
  const offHandFits = (main: string, off: string) => {
    const eq = new Equipment();
    eq.put('w0', createItem(main), null);
    return eq.accepts('o0', createItem(off));
  };

  it('two Sawed-Offs, a Sawed-Off with a Nickel Revolver, two Nickel Revolvers; never the Magnum', () => {
    expect(offHandFits('sawed_off', 'sawed_off')).toBe(true);
    expect(offHandFits('sawed_off', 'nickel_revolver')).toBe(true);
    expect(offHandFits('nickel_revolver', 'sawed_off')).toBe(true);
    expect(offHandFits('nickel_revolver', 'nickel_revolver')).toBe(true);
    expect(offHandFits('nickel_revolver', 'derringer')).toBe(true);
    expect(offHandFits('magnum', 'nickel_revolver')).toBe(false);
    expect(offHandFits('nickel_revolver', 'magnum')).toBe(false);
    expect(offHandFits('shotgun', 'sawed_off')).toBe(false);
  });
});

describe('more guns: icons, sounds, looks', () => {
  it('each new gun has its own sprite; the old ones stay where they were; none overlap', async () => {
    const { GUN_SPRITES } = await import('./gunSprites');
    expect(GUN_SPRITES.revolver).toMatchObject({ x: 0, y: 0, width: 32, height: 16 });
    expect(GUN_SPRITES.rifle).toMatchObject({ x: 32, y: 0, width: 48, height: 12 });
    for (const id of ['nickel_revolver', 'magnum', 'sawed_off']) expect(GUN_SPRITES[id], id).toBeDefined();
    const boxes = Object.entries(GUN_SPRITES);
    for (const [a, s] of boxes) {
      for (const [b, t] of boxes) {
        if (a >= b) continue;
        const apart = s.x + s.width <= t.x || t.x + t.width <= s.x || s.y + s.height <= t.y || t.y + t.height <= s.y;
        expect(apart, `${a} / ${b}`).toBe(true);
      }
    }
  });

  it('the Sawed-Off sounds like a shotgun (its own, not a revolver), the Magnum like itself; the Nickel Revolver like a revolver', async () => {
    const { gunSound, reloadSound } = await import('../audio/SessionAudio');
    expect([gunSound(sawedOff), reloadSound(sawedOff)]).toEqual(['gun.sawed_off', 'reload.sawed_off']);
    expect([gunSound(magnum), reloadSound(magnum)]).toEqual(['gun.magnum', 'reload.magnum']);
    expect([gunSound(nickel), reloadSound(nickel)]).toEqual(['gun.revolver', 'reload.revolver']);
  });

  it('the reload sounds last about as long as the reloads', async () => {
    const { RECIPES } = await import('./sounds');
    const end = (r: string) => Math.max(...RECIPES[r].layers.map((l) => (l.delay ?? 0) + (l.attack ?? 0) + (l.hold ?? 0)));
    expect(end('reloadSawedOff')).toBeGreaterThan(sawedOff.reloadTime * 0.85);
    expect(end('reloadSawedOff')).toBeLessThan(sawedOff.reloadTime);
    expect(end('reloadMagnum')).toBeLessThan(magnum.reloadTime);
  });

  it('the models: the magnum bigger than the revolver, the sawed-off two barrels wide, the nickel with brass trim', async () => {
    const THREE = await import('three');
    const { buildWeaponMesh } = await import('../entities/WeaponModel');
    const size = (w: WeaponDef) => new THREE.Box3().setFromObject(buildWeaponMesh(w.look)).getSize(new THREE.Vector3());
    expect(size(magnum).x).toBeGreaterThan(size(revolver).x);
    expect(size(magnum).y).toBeGreaterThan(size(revolver).y);
    expect(size(sawedOff).x).toBeGreaterThan(size(revolver).x);
    expect(buildWeaponMesh(nickel.look).children.length).toBeGreaterThan(buildWeaponMesh(revolver.look).children.length);
  });
});

describe('more guns: where they show up', () => {
  it('the wave merchant sells them (the magnum and its cartridges later), the gunsmith from the start', async () => {
    const { SHOP, MERCHANT_SHOPS } = await import('./shop');
    const wave = (id: string) => SHOP.find((e) => e.item === id);
    expect([wave('nickel_revolver')?.unlockWave, wave('sawed_off')?.unlockWave, wave('magnum')?.unlockWave, wave('ammo_magnum')?.unlockWave]).toEqual([3, 3, 5, 5]);
    expect(wave('nickel_revolver')!.price).toBeGreaterThan(wave('revolver')!.price);
    expect(wave('magnum')!.price).toBeGreaterThan(wave('nickel_revolver')!.price);
    expect(wave('ammo_magnum')).toMatchObject({ quantity: 12 });
    const smith = MERCHANT_SHOPS.gunsmith.stock;
    for (const id of ['nickel_revolver', 'sawed_off', 'magnum', 'ammo_magnum']) expect(smith.find((e) => e.item === id), id).toMatchObject({ unlockWave: 1 });
  });

  it('loot: weapon crates and chests can hold them (the magnum rarest); magnum cartridges where the magnum can be', async () => {
    const { LOOT_TABLES } = await import('./lootTables');
    const w = (table: keyof typeof LOOT_TABLES, id: string) => LOOT_TABLES[table].find((e) => e.item === id);
    for (const table of ['weaponsOnly', 'general'] as const) {
      expect(w(table, 'nickel_revolver')?.minWave, table).toBe(3);
      expect(w(table, 'sawed_off')?.minWave, table).toBe(3);
      expect(w(table, 'magnum')?.minWave, table).toBe(5);
      const guns = LOOT_TABLES[table].filter((e) => weaponOf(itemDef(e.item)));
      expect(Math.min(...guns.map((e) => e.weight)), table).toBe(w(table, 'magnum')!.weight);
    }
    expect(w('ammoOnly', 'ammo_magnum')?.minWave).toBe(5);
    expect(w('general', 'ammo_magnum')?.minWave).toBe(5);
  });

  it('enemies: gunslingers sometimes the Nickel Revolver (wave 3+), rarely a Magnum (wave 7+); shotgunners two Sawed-Offs (wave 4+)', async () => {
    const { ENEMIES, enemyLoadout } = await import('./enemies');
    const seq = (...xs: number[]) => {
      let i = 0;
      return () => xs[i++ % xs.length];
    };
    const tally = (arch: keyof typeof ENEMIES, wave: number, dual = false) => {
      const out: Record<string, number> = {};
      for (let i = 0; i < 400; i++) {
        const l = enemyLoadout(ENEMIES[arch], wave, { dual }, seq(i / 400, 0.5));
        const key = `${l.weapon}${l.offHand ? `+${l.offHand}` : ''}`;
        out[key] = (out[key] ?? 0) + 1;
      }
      return out;
    };
    expect(Object.keys(tally('gunslinger', 2))).toEqual(['revolver']);
    expect(Object.keys(tally('gunslinger', 3)).sort()).toEqual(['nickel_revolver', 'revolver']);
    const late = tally('gunslinger', 7);
    expect(late.magnum).toBeGreaterThan(0);
    expect(late.magnum).toBeLessThan(late.nickel_revolver);
    expect(Object.keys(tally('shotgunner', 3))).toEqual(['shotgun']);
    expect(Object.keys(tally('shotgunner', 4)).sort()).toEqual(['sawed_off+sawed_off', 'shotgun']);
    // Dual wielders pair a second gun, but never with the magnum.
    const duals = tally('gunslinger', 8, true);
    expect(Object.keys(duals).filter((k) => k.startsWith('magnum'))).toEqual(['magnum']);
    expect(Object.keys(duals).some((k) => k.startsWith('nickel_revolver+'))).toBe(true);
    // Riders keep their mounted gun.
    expect(enemyLoadout(ENEMIES.shotgunner, 9, { mounted: true }, () => 0)).toEqual({ weapon: 'shotgun', offHand: null });
  });

  it("the gulch camp's leader carries the Nickel Revolver (the rest the worn one)", async () => {
    const { GULCH_NPCS } = await import('../world/maps/rattlesnakeGulch');
    expect(GULCH_NPCS.find((n) => n.id === 'outlaw-fire')!.weapon).toBe('nickel_revolver');
    expect(GULCH_NPCS.find((n) => n.id === 'outlaw-patrol')!.weapon).toBe('revolver');
  });
});
