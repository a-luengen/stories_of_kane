import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NavGrid } from '../ai/NavGrid';
import { ANIMALS, type AnimalSpawn } from '../data/animals';
import { ITEMS } from '../data/items';
import { MERCHANT_SHOPS } from '../data/shop';
import { SAMPLES } from '../data/soundManifest';
import { SOUNDS } from '../data/sounds';
import { WEAPONS } from '../data/weapons';
import { poiById, SANDBOX_WORLD } from '../data/world';
import { createItem } from '../items/ItemInstance';
import { Economy } from '../modes/Economy';
import { Rng } from '../util/math';
import { buildRanchMap, CORRAL, PASTURE, RANCH_ANIMALS, RANCH_NPCS } from '../world/maps/twoSpursRanch';
import type { Animal } from './Animal';
import { AnimalSystem } from './AnimalSystem';
import { Horse } from './Horse';
import { NpcSystem } from './NpcSystem';
import { TargetSystem } from './Targets';

const DT = 1 / 60;
const ranch = poiById(SANDBOX_WORLD, 'two-spurs-ranch');
const map = buildRanchMap(new TargetSystem(), ranch.exits);
const nav = new NavGrid(map.collision, map.half);

function setup(spawns: readonly AnimalSpawn[] = RANCH_ANIMALS, seed = 7) {
  const rng = new Rng(seed);
  const sys = new AnimalSystem(spawns, map.collision, nav, () => rng.next());
  const run = (seconds: number, each?: (t: number) => void) => {
    for (let t = 0; t < seconds; t += DT) {
      sys.update(DT, [], []);
      each?.(t);
    }
  };
  return { sys, run };
}

const inPen = (a: Animal) => {
  const p = a.spawn.pen!;
  return a.pos.x >= p[0] && a.pos.x <= p[2] && a.pos.z >= p[1] && a.pos.z <= p[3];
};

/** A rifle bullet into the middle of the animal, from the south. */
function shoot(a: Animal) {
  const point = new THREE.Vector3(a.pos.x, (a.def.hit.y0 + a.def.hit.y1) / 2, a.pos.z);
  return a.hit(point, new THREE.Vector3(0, 0, -1), { damage: WEAPONS.rifle.damage, shooter: null });
}

describe('animal data', () => {
  it('every species has its sounds (with a slot for recordings) and drops real items', () => {
    for (const def of Object.values(ANIMALS)) {
      for (const id of [def.sounds.call, 'animal.hit', 'animal.death']) {
        expect(SOUNDS[id], id).toBeTruthy();
        expect(SAMPLES[id], id).toBeDefined();
      }
      for (const l of def.loot) expect(ITEMS[l.item], l.item).toBeTruthy();
    }
  });

  it('the butcher buys meat, the tanner leather, pelts and feathers (the gunsmith neither)', () => {
    const buys = (shop: keyof typeof MERCHANT_SHOPS, id: string) => MERCHANT_SHOPS[shop].buys.includes(ITEMS[id].category) && (!MERCHANT_SHOPS[shop].buysOnly || MERCHANT_SHOPS[shop].buysOnly!.includes(id));
    expect(['meat', 'leather', 'pelt', 'bear_pelt', 'feathers'].map((id) => [buys('butcher', id), buys('tanner', id), buys('gunsmith', id)])).toEqual([
      [true, false, false],
      [false, true, false],
      [false, true, false],
      [false, true, false],
      [false, true, false],
    ]);
    const economy = new Economy(MERCHANT_SHOPS.tanner.stock);
    for (const id of ['meat', 'leather', 'feathers']) expect(economy.sellValue(createItem(id)), id).toBeGreaterThan(0);
    expect(economy.sellValue(createItem('meat', 4))).toBe(4 * economy.sellValue(createItem('meat')));
    expect(economy.sellValue(createItem('leather'))).toBeGreaterThan(economy.sellValue(createItem('meat', 3)));
  });
});

describe('Two Spurs Ranch livestock', () => {
  it('cows in the pasture, pigs in the pen, a flock of hens in the yard, all on open ground', () => {
    const count = (s: string) => RANCH_ANIMALS.filter((a) => a.species === s).length;
    expect(count('cow')).toBeGreaterThanOrEqual(3);
    expect(count('cow')).toBeLessThanOrEqual(5);
    expect(count('pig')).toBeGreaterThanOrEqual(2);
    expect(count('pig')).toBeLessThanOrEqual(4);
    expect(count('chicken')).toBeGreaterThanOrEqual(4);
    expect(count('chicken')).toBeLessThanOrEqual(8);
    for (const a of RANCH_ANIMALS) expect(nav.isFree(a.at[0], a.at[1]), `${a.species} at ${a.at}`).toBe(true);
    expect(RANCH_ANIMALS.filter((a) => a.species === 'cow').every((a) => a.pen === PASTURE)).toBe(true);
    expect(RANCH_ANIMALS.filter((a) => a.species === 'pig').every((a) => a.pen === CORRAL)).toBe(true);
  });

  it('penned animals never leave their pen, even bolting from gunfire', () => {
    const { sys, run } = setup();
    const penned = sys.animals.filter((a) => a.spawn.pen);
    let walked = 0;
    run(240, (t) => {
      // A shot at each pen now and then, from just outside the fence.
      if (Math.abs(t % 20) < DT) {
        sys.hearShot(new THREE.Vector3(PASTURE[2] + 2, 1, 12));
        sys.hearShot(new THREE.Vector3(CORRAL[0] - 2, 1, -2));
      }
      for (const a of penned) expect(inPen(a), `${a.def.id} at ${a.pos.x.toFixed(1)}, ${a.pos.z.toFixed(1)}`).toBe(true);
    });
    for (const a of penned) walked += a.pos.distanceTo(new THREE.Vector3(a.spawn.at[0], 0, a.spawn.at[1]));
    expect(walked).toBeGreaterThan(5); // they do move about
  });

  it('the hens stay about the yard and come back after scattering', () => {
    const { sys, run } = setup(RANCH_ANIMALS.filter((a) => a.species === 'chicken'));
    run(60);
    sys.hearShot(new THREE.Vector3(-23, 1, -8));
    expect(sys.animals.every((a) => a.mode === 'flee')).toBe(true);
    run(60);
    for (const a of sys.animals) expect(Math.hypot(a.pos.x - a.spawn.at[0], a.pos.z - a.spawn.at[1])).toBeLessThan((a.spawn.roam ?? 6) * 2.6);
    run(60);
    expect(sys.animals.some((a) => a.mode !== 'flee')).toBe(true);
  });

  it('they idle in their poses: grazing, rooting, pecking, lying down', () => {
    const { sys, run } = setup();
    const seen = new Set<string>();
    run(120, () => {
      for (const a of sys.animals) if (a.mode === 'idle') seen.add(`${a.def.id}:${a.pose}`);
    });
    for (const p of ['cow:graze', 'cow:rest', 'pig:graze', 'pig:rest', 'chicken:peck']) expect(seen, p).toContain(p);
  });

  it('a shot in earshot sends the whole herd off; far away it goes unnoticed', () => {
    const { sys } = setup();
    const cows = sys.animals.filter((a) => a.def.id === 'cow');
    sys.hearShot(new THREE.Vector3(60, 1, 60));
    expect(cows.every((c) => c.mode !== 'flee')).toBe(true);
    // Only one cow takes fright itself (someone rushing by); the rest bolt with it.
    sys.alarm(cows[0], [cows[0].pos.x + 1, cows[0].pos.z]);
    expect(cows.every((c) => c.mode === 'flee')).toBe(true);
    expect(sys.animals.filter((a) => a.def.id === 'pig').every((p) => p.mode !== 'flee')).toBe(true);
  });

  it('someone sprinting past startles them; standing still does not', () => {
    const { sys } = setup();
    const cow = sys.animals.find((a) => a.def.id === 'cow')!;
    sys.update(DT, [], [[cow.pos.x + 8, cow.pos.z]]);
    expect(cow.mode).not.toBe('flee');
    sys.update(DT, [], [[cow.pos.x + 2, cow.pos.z]]);
    expect(cow.mode).toBe('flee');
  });

  it('a cow takes three rifle bullets; its carcass holds meat and leather and can be looted', () => {
    const { sys } = setup();
    const cow = sys.animals.find((a) => a.def.id === 'cow')!;
    let looted = 0;
    cow.onLoot = () => looted++;
    expect(cow.canInteract()).toBe(false);
    shoot(cow);
    shoot(cow);
    expect(cow.alive).toBe(true);
    shoot(cow);
    expect(cow.alive).toBe(false);
    expect(cow.canInteract()).toBe(true);
    cow.interact();
    expect(looted).toBe(1);
    const ids = cow.inventory.items.map((i) => i.defId);
    expect(ids).toContain('meat');
    expect(ids).toContain('leather');
    expect(cow.label).toBe('Loot Cow');
    // Bullets pass through the carcass; it no longer blocks anyone.
    const a = new THREE.Vector3(cow.pos.x, 1, cow.pos.z + 5);
    const b = new THREE.Vector3(cow.pos.x, 1, cow.pos.z - 5);
    expect(cow.test(a, b)).toBeNull();
    expect(sys.bodies).not.toContain(cow.collider);
  });

  it('a bullet along the cow hits it anywhere from rump to head, and passes beside it', () => {
    const { sys } = setup([{ species: 'cow', at: [-30, 12], yaw: 0, pen: PASTURE }]);
    const cow = sys.animals[0];
    for (const z of [-0.8, 0, 1.0]) {
      expect(cow.test(new THREE.Vector3(-34, 1, 12 + z), new THREE.Vector3(-26, 1, 12 + z)), `z ${z}`).not.toBeNull();
    }
    expect(cow.test(new THREE.Vector3(-34, 1, 14), new THREE.Vector3(-26, 1, 14))).toBeNull();
  });

  it('a chicken is one revolver shot; it leaves meat and feathers', () => {
    const { sys } = setup();
    const hen = sys.animals.find((a) => a.def.id === 'chicken')!;
    hen.hit(hen.pos.clone().setY(0.3), new THREE.Vector3(1, 0, 0), { damage: WEAPONS.revolver.damage, shooter: null });
    expect(hen.alive).toBe(false);
    expect(hen.inventory.items.map((i) => i.defId).sort()).toEqual(['feathers', 'meat']);
  });

  it('shooting a pig in front of the ranch hand turns her hostile', () => {
    const npcs = new NpcSystem(RANCH_NPCS, map.collision, nav, map.cover);
    const hand = npcs.npcs.find((n) => n.def.id === 'ranch-hand-fence')!;
    const player = { pos: new THREE.Vector3(20, 0, 4), mounted: false, dead: false };
    npcs.onPlayerHurtAnimal(new THREE.Vector3(24, 0.5, -2), player);
    expect(hand.mode).toBe('hostile');
    // Out of everyone's sight and range (far side of the map), nobody cares.
    const calm = new NpcSystem(RANCH_NPCS, map.collision, nav, map.cover);
    calm.onPlayerHurtAnimal(new THREE.Vector3(-36, 0.5, 36), { ...player, pos: new THREE.Vector3(-36, 0, 38) });
    expect(calm.npcs.every((n) => n.mode === 'routine')).toBe(true);
  });
});

describe('dead animals lie still', () => {
  /** Every part's pose under `root`, flattened. */
  const pose = (root: THREE.Object3D) => {
    root.updateMatrixWorld(true);
    const out: number[] = [];
    root.traverse((o) => out.push(...o.matrixWorld.elements));
    return out;
  };

  it('once fallen, nothing moves any more (no breathing, glancing, tail or rattle)', () => {
    for (const species of Object.keys(ANIMALS) as (keyof typeof ANIMALS)[]) {
      const { sys } = setup([{ species, at: [-30, 12], yaw: 0, pen: PASTURE }]);
      const a = sys.animals[0];
      a.hit(a.pos, new THREE.Vector3(1, 0, 0), { damage: 1000, shooter: null });
      for (let t = 0; t < 2; t += DT) a.sync(1, DT);
      const before = pose(a.model.root);
      for (let t = 0; t < 1.3; t += DT) a.sync(1, DT);
      expect(pose(a.model.root), species).toEqual(before);
    }
    const h = new Horse();
    h.place(new THREE.Vector3(0, 0, 0), 0);
    h.hurt(1000);
    for (let t = 0; t < 2; t += DT) h.sync(1, DT);
    const before = pose(h.model.root);
    for (let t = 0; t < 1.3; t += DT) h.sync(1, DT);
    expect(pose(h.model.root), 'horse').toEqual(before);
  });
});
