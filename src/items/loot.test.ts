import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NavGrid } from '../ai/NavGrid';
import { WEAPONS } from '../data/weapons';
import { CollisionWorld } from '../world/Colliders';
import { LOOT_TABLES, type LootEntry } from '../data/lootTables';
import { TargetSystem } from '../entities/Targets';
import { Rng } from '../util/math';
import { CONTAINER_TYPES, LootContainer } from '../world/Container';
import { buildSandboxMap } from '../world/maps/sandbox';
import { buildOutpostMap } from '../world/maps/waveOutpost';
import { GridContainer } from './GridContainer';
import { itemDef, weaponOf } from './ItemDef';
import { eligible, fillWithLoot, makeLoot, pickEntry } from './loot';

const container = (kind: LootContainer['kind'], seed: number, wave = Infinity) => {
  const c = new LootContainer(kind, new THREE.Vector3(), 0, seed);
  c.wave = wave;
  return c;
};

describe('loot tables', () => {
  it('picks entries in proportion to their weights', () => {
    const table: LootEntry[] = [
      { item: 'ammo_revolver', weight: 3 },
      { item: 'bandage', weight: 1 },
    ];
    const rng = new Rng(1);
    let ammo = 0;
    const n = 4000;
    for (let i = 0; i < n; i++) if (pickEntry(table, rng)!.item === 'ammo_revolver') ammo++;
    expect(ammo / n).toBeGreaterThan(0.72);
    expect(ammo / n).toBeLessThan(0.78);
  });

  it('stack sizes stay within the entry range (and the stack limit)', () => {
    const rng = new Rng(2);
    const seen = new Set<number>();
    for (let i = 0; i < 300; i++) {
      const it = makeLoot({ item: 'ammo_shells', weight: 1, qty: [3, 8] }, rng);
      expect(it.quantity).toBeGreaterThanOrEqual(3);
      expect(it.quantity).toBeLessThanOrEqual(8);
      seen.add(it.quantity);
    }
    expect(seen.size).toBe(6); // every value in 3..8 comes up
    expect(makeLoot({ item: 'ammo_shells', weight: 1, qty: [500, 500] }, rng).quantity).toBe(itemDef('ammo_shells').maxStack);
  });

  it('guns come with a random number of rounds loaded', () => {
    const rng = new Rng(3);
    const loaded = new Set<number>();
    for (let i = 0; i < 200; i++) {
      const gun = makeLoot({ item: 'revolver', weight: 1 }, rng);
      expect(gun.loadedRounds).toBeGreaterThanOrEqual(0);
      expect(gun.loadedRounds).toBeLessThanOrEqual(weaponOf(itemDef('revolver'))!.magazine);
      loaded.add(gun.loadedRounds!);
    }
    expect(loaded.size).toBeGreaterThan(4);
  });

  it('minWave keeps better guns out of early waves', () => {
    const ids = (wave: number) => eligible(LOOT_TABLES.weaponsOnly, wave).map((e) => e.item);
    expect(ids(1)).toEqual(['revolver']);
    expect(ids(2)).toEqual(['revolver', 'derringer', 'rifle']);
    expect(ids(3)).toEqual(['revolver', 'derringer', 'rifle', 'nickel_revolver', 'sawed_off']);
    expect(ids(4)).toEqual(['revolver', 'derringer', 'rifle', 'shotgun', 'nickel_revolver', 'sawed_off']);
    expect(ids(5)).toEqual([...ids(4), 'magnum']);
    expect(ids(Infinity)).toEqual(ids(5)); // sandbox: everything
    const general = eligible(LOOT_TABLES.general, 1).map((e) => e.item);
    expect(general).not.toContain('rifle');
    expect(general).toContain('bandage');
  });

  it('the general table has ammo, bandages, clothing and (rarely) guns', () => {
    const cats = new Set(LOOT_TABLES.general.map((e) => itemDef(e.item).category));
    expect([...cats].sort()).toEqual(['ammo', 'clothing', 'consumable', 'weapon']);
    const total = LOOT_TABLES.general.reduce((s, e) => s + e.weight, 0);
    const guns = LOOT_TABLES.general.filter((e) => itemDef(e.item).category === 'weapon').reduce((s, e) => s + e.weight, 0);
    expect(guns / total).toBeLessThan(0.1);
  });

  it('finds that do not fit are skipped', () => {
    const rng = new Rng(4);
    // A rifle (4×1) can never fit a 2×2 grid; a 2×2 gun (a revolver, the magnum, a sawed-off) fills it once.
    const tiny = new GridContainer(2, 2);
    const placed = fillWithLoot(tiny, 'weaponsOnly', 30, rng, Infinity);
    expect(placed.length).toBe(1);
    expect(['revolver', 'nickel_revolver', 'magnum', 'sawed_off']).toContain(tiny.items[0].defId);
    // Rotation fallback: a 4×1 grid takes a derringer (1×2) on its side, or a rifle flat.
    const flat = new GridContainer(4, 1);
    fillWithLoot(flat, 'weaponsOnly', 50, new Rng(5), 2);
    expect(flat.items.length).toBeGreaterThan(0);
    for (const it of flat.items) expect(it.defId === 'rifle' ? !it.rotated : it.defId === 'derringer' && it.rotated).toBe(true);
  });
});

describe('containers', () => {
  it('ammo boxes hold only ammo, weapon crates only weapons', () => {
    for (let seed = 1; seed < 60; seed++) {
      const ammo = container('ammoBox', seed);
      ammo.ensureLoot();
      expect(ammo.inventory.items.length).toBeGreaterThan(0);
      for (const it of ammo.inventory.items) expect(itemDef(it.defId).category).toBe('ammo');
      const guns = container('weaponCrate', seed, 1);
      guns.ensureLoot();
      expect(guns.inventory.items.length).toBeGreaterThan(0);
      for (const it of guns.inventory.items) expect(it.defId).toBe('revolver'); // wave 1: revolvers only
    }
  });

  it('roll their loot lazily, the same for the same seed, within the count range', () => {
    const a = container('chest', 42);
    expect(a.generated).toBe(false);
    expect(a.inventory.isEmpty).toBe(true);
    a.interact();
    expect(a.generated && a.opened).toBe(true);
    const b = container('chest', 42);
    b.ensureLoot();
    expect(b.inventory.items.map((i) => [i.defId, i.quantity])).toEqual(a.inventory.items.map((i) => [i.defId, i.quantity]));
    const [lo, hi] = CONTAINER_TYPES.chest.count;
    expect(a.inventory.items.length).toBeGreaterThanOrEqual(lo);
    expect(a.inventory.items.length).toBeLessThanOrEqual(hi);
  });

  it('say when they are empty, and restock (closed, new loot) between waves', () => {
    const c = container('crate', 9, 1);
    expect(c.label).toBe('Open Crate');
    c.interact();
    const first = c.inventory.items.map((i) => i.uid);
    for (const it of [...c.inventory.items]) c.inventory.remove(it);
    expect(c.label).toBe('Open Crate (empty)');
    c.restock(2);
    expect(c.opened).toBe(false);
    expect(c.generated).toBe(false);
    expect(c.label).toBe('Open Crate');
    c.interact();
    expect(c.inventory.items.length).toBeGreaterThan(0);
    expect(c.inventory.items.some((i) => first.includes(i.uid))).toBe(false);
  });

  it('both maps have them: barrels and crates, plus ammo boxes, weapon crates and chests', () => {
    const count = (cs: LootContainer[], k: LootContainer['kind']) => cs.filter((c) => c.kind === k).length;
    const sb = buildSandboxMap(new TargetSystem()).containers;
    expect(count(sb, 'barrel')).toBe(13);
    expect(count(sb, 'crate')).toBe(5);
    expect(count(sb, 'ammoBox')).toBeGreaterThanOrEqual(4);
    expect(count(sb, 'weaponCrate')).toBe(2);
    expect(count(sb, 'chest')).toBe(2);
    const wave = buildOutpostMap(new TargetSystem()).containers;
    expect(count(wave, 'crate')).toBe(12);
    expect(count(wave, 'ammoBox') + count(wave, 'weaponCrate') + count(wave, 'chest')).toBeGreaterThanOrEqual(3);
  });

  it('keep their collision and cover height', () => {
    const map = buildSandboxMap(new TargetSystem());
    for (const c of map.containers) {
      const { x, z } = c.position;
      // Something solid right at the container, as tall as its cover height.
      const hit = map.collision.raycast(x - 3, 0.3, z + 0.01, x + 3, 0.3, z + 0.01);
      expect(hit, `${c.kind} at ${x},${z}`).not.toBeNull();
    }
    expect(CONTAINER_TYPES.ammoBox.coverHeight).toBeGreaterThan(0);
    expect(CONTAINER_TYPES.weaponCrate.coverHeight).toBeGreaterThan(CONTAINER_TYPES.ammoBox.coverHeight);
  });
});

describe('breakable boxes', () => {
  /** A container standing in an empty world (collider and nav included). */
  const placed = (kind: LootContainer['kind'], seed: number) => {
    const cw = new CollisionWorld(10);
    const c = new LootContainer(kind, new THREE.Vector3(0, 0, 0), 0, seed);
    c.addCollider(cw);
    const nav = new NavGrid(cw, 10);
    c.onCollisionChanged = (box) => {
      const b = box.bounds;
      nav.refresh(cw, b.minX, b.minZ, b.maxX, b.maxZ);
    };
    return { cw, nav, c };
  };
  // (A 25-damage pistol: the Nickel Revolver. The worn revolver needs a fifth shot.)
  const revolver = WEAPONS.nickel_revolver.damage;

  it('crates and ammo boxes take 4 Nickel Revolver hits (5 of the worn revolver); the rest are indestructible', () => {
    for (const kind of ['crate', 'ammoBox'] as const) {
      const { c } = placed(kind, 5);
      for (let i = 0; i < 3; i++) expect(c.damage(revolver)).toBeNull();
      expect(c.destroyed).toBe(false);
      expect(c.damage(revolver)).not.toBeNull();
      expect(c.destroyed).toBe(true);
      expect(c.canInteract()).toBe(false);
    }
    for (const kind of ['barrel', 'chest', 'weaponCrate'] as const) {
      const { c } = placed(kind, 5);
      for (let i = 0; i < 20; i++) expect(c.damage(revolver)).toBeNull();
      expect(c.destroyed).toBe(false);
    }
  });

  it('a never-opened box spills half its loot (rounded up)', () => {
    for (let seed = 1; seed < 40; seed++) {
      const { c } = placed('crate', seed);
      const full = new LootContainer('crate', new THREE.Vector3(), 0, seed);
      full.ensureLoot(); // what was inside (same seed)
      let spilled: ReturnType<typeof c.damage> = null;
      for (let i = 0; i < 4; i++) spilled = c.damage(revolver) ?? spilled;
      const n = full.inventory.items.length;
      expect(spilled!.length).toBe(Math.ceil(n / 2));
      const inside = full.inventory.items.map((i) => `${i.defId}x${i.quantity}`);
      for (const it of spilled!) expect(inside).toContain(`${it.defId}x${it.quantity}`);
      expect(c.inventory.isEmpty).toBe(true);
    }
  });

  it('an opened box drops everything still in it (nothing stored is lost)', () => {
    const { c } = placed('crate', 3);
    c.interact();
    const left = c.inventory.items.length;
    expect(left).toBeGreaterThan(0);
    c.inventory.remove(c.inventory.items[0]); // took one
    let spilled: ReturnType<typeof c.damage> = null;
    for (let i = 0; i < 4; i++) spilled = c.damage(revolver) ?? spilled;
    expect(spilled!.length).toBe(left - 1);
  });

  it('a broken box stops blocking bullets and paths; a restock rebuilds it', () => {
    const { cw, nav, c } = placed('crate', 2);
    const shot = () => cw.raycast(-3, 0.4, 0, 3, 0.4, 0);
    expect(shot()?.collider).toBeTruthy();
    expect(nav.isFree(0, 0)).toBe(false);
    for (let i = 0; i < 4; i++) c.damage(revolver);
    expect(shot()?.collider ?? null).toBeNull();
    expect(nav.isFree(0, 0)).toBe(true);
    c.restock(3);
    expect(c.destroyed).toBe(false);
    expect(c.hp).toBe(100);
    expect(shot()?.collider).toBeTruthy();
    expect(nav.isFree(0, 0)).toBe(false);
  });
});
