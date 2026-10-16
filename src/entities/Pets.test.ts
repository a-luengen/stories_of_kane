import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NavGrid } from '../ai/NavGrid';
import { CONFIG } from '../config';
import { ANIMALS, type AnimalSpawn } from '../data/animals';
import { NPCS } from '../data/npcs';
import { SAMPLES } from '../data/soundManifest';
import { SOUNDS } from '../data/sounds';
import type { Vec2 } from '../data/types';
import { angleDelta, dirToYaw, Rng } from '../util/math';
import { buildSandboxMap, TOWN_ANIMALS } from '../world/maps/sandbox';
import { AnimalSystem } from './AnimalSystem';
import { NpcSystem } from './NpcSystem';
import { Player, type PlayerInput } from './Player';
import { TargetSystem } from './Targets';

const DT = 1 / 60;
const map = buildSandboxMap(new TargetSystem());
const nav = new NavGrid(map.collision, map.half);

function setup(spawns: readonly AnimalSpawn[] = TOWN_ANIMALS, seed = 3) {
  const rng = new Rng(seed);
  const sys = new AnimalSystem(spawns, map.collision, nav, () => rng.next());
  const run = (seconds: number, player: Vec2 | null = null, rushers: Vec2[] = []) => {
    for (let t = 0; t < seconds; t += DT) sys.update(DT, [], rushers, player);
  };
  return { sys, run };
}

describe('town pets', () => {
  it('a few dogs on the streets and cats by the buildings, all on open ground', () => {
    const dogs = TOWN_ANIMALS.filter((a) => a.species === 'dog');
    const cats = TOWN_ANIMALS.filter((a) => a.species === 'cat');
    expect(dogs.length).toBeGreaterThanOrEqual(2);
    expect(dogs.length).toBeLessThanOrEqual(4); // (one more in the south quarter)
    expect(cats.length).toBeGreaterThanOrEqual(2);
    expect(cats.length).toBeLessThanOrEqual(3);
    for (const a of TOWN_ANIMALS) expect(nav.isFree(a.at[0], a.at[1]), `${a.species} at ${a.at}`).toBe(true);
    // Clear of where you and your horse start.
    for (const a of TOWN_ANIMALS) for (const p of [map.playerSpawn, map.horseSpawn!]) expect(Math.hypot(a.at[0] - p.x, a.at[1] - p.z), `${a.species} at ${a.at}`).toBeGreaterThan(2);
    // Cats keep close to a building (within a few steps of its walls) or curl up by a barrel.
    const nearBuilding = ([x, z]: Vec2) => map.occluders.some((o) => x > o.minX - 3 && x < o.maxX + 3 && z > o.minZ - 3 && z < o.maxZ + 3);
    const byBarrel = ([x, z]: Vec2) => map.containers.some((c) => c.kind === 'barrel' && Math.hypot(c.position.x - x, c.position.z - z) < 1.5);
    for (const c of cats) expect(nearBuilding(c.at) || byBarrel(c.at), `cat at ${c.at}`).toBe(true);
  });

  it('they bark, meow and purr (synthesized until recordings are added)', () => {
    for (const id of [ANIMALS.dog.sounds.call, ANIMALS.cat.sounds.call, ANIMALS.cat.sounds.pet!]) {
      expect(SOUNDS[id], id).toBeTruthy();
      expect(SAMPLES[id], id).toBeDefined();
    }
  });

  it('they stay about their home over a few minutes', () => {
    const { sys, run } = setup();
    run(180);
    for (const a of sys.animals) {
      const d = Math.hypot(a.pos.x - a.spawn.at[0], a.pos.z - a.spawn.at[1]);
      expect(d, `${a.def.id} wandered ${d.toFixed(1)}`).toBeLessThanOrEqual((a.spawn.roam ?? 6) + 0.5);
    }
  });

  it('a dog stops and turns to face you as you walk up, and does not run from a walk', () => {
    const { sys, run } = setup([{ species: 'dog', at: [-10, 1.5], yaw: Math.PI, roam: 9 }]);
    const dog = sys.animals[0];
    const player: Vec2 = [dog.pos.x + 3, dog.pos.z + 2];
    run(3, player);
    expect(dog.mode).toBe('idle');
    expect(dog.lookAt).toEqual(player);
    if (dog.pose !== 'rest') expect(Math.abs(angleDelta(dog.heading, dirToYaw(player[0] - dog.pos.x, player[1] - dog.pos.z)))).toBeLessThan(0.2);
    expect(dog.pose).not.toBe('graze'); // nose up off the ground
    // Still watching (not wandering off) while you stand there.
    run(20, player);
    expect(dog.mode).toBe('idle');
    // Far away, it goes back to its own business.
    run(30, [dog.pos.x + 30, dog.pos.z]);
    expect(dog.lookAt).toBeNull();
  });

  it('sprinting right past sends a pet running; a gunshot too', () => {
    const { sys } = setup();
    const [dog, cat] = [sys.animals.find((a) => a.def.id === 'dog')!, sys.animals.find((a) => a.def.id === 'cat')!];
    sys.update(DT, [], [[dog.pos.x + 1.5, dog.pos.z]], [dog.pos.x + 1.5, dog.pos.z]);
    expect(dog.mode).toBe('flee');
    expect(cat.mode).not.toBe('flee');
    sys.hearShot(new THREE.Vector3(cat.pos.x + 10, 1, cat.pos.z));
    expect(cat.mode).toBe('flee');
  });

  it('E pets a dog or cat: it stays put and enjoys it; a dead pet has nothing to loot', () => {
    const { sys, run } = setup();
    const dog = sys.animals.find((a) => a.def.id === 'dog')!;
    const cat = sys.animals.find((a) => a.def.id === 'cat')!;
    let petted = 0;
    dog.onPet = () => petted++;
    const player: Vec2 = [dog.pos.x + 1, dog.pos.z];
    expect(dog.canInteract()).toBe(true);
    expect(dog.label).toBe('Pet the dog');
    dog.interact();
    expect(petted).toBe(1);
    expect(dog.canInteract()).toBe(false); // already being petted
    run(CONFIG.player.petTime * 0.8, player);
    expect(dog.mode).toBe('idle');
    expect(dog.lookAt).toEqual(player);
    run(CONFIG.player.petTime * 0.4, player);
    expect(dog.canInteract()).toBe(true);

    cat.hit(cat.pos.clone().setY(0.3), new THREE.Vector3(1, 0, 0), { damage: 50, shooter: null });
    expect(cat.alive).toBe(false);
    expect(cat.canInteract()).toBe(false);
    expect(cat.inventory.isEmpty).toBe(true);
  });

  it('shooting a dog on the main street turns the porch gunman hostile', () => {
    const npcs = new NpcSystem(NPCS, map.collision, nav, map.occluders);
    const gunman = npcs.npcs.find((n) => n.def.id === 'porch-gunman')!;
    npcs.onPlayerHurtAnimal(new THREE.Vector3(-10, 0.5, 1.5), { pos: new THREE.Vector3(-8, 0, 5), mounted: false, dead: false });
    expect(gunman.mode).toBe('hostile');
  });
});

describe('petting (the player)', () => {
  const input = (over: Partial<PlayerInput> = {}): PlayerInput => ({ moveX: 0, moveZ: 0, sprint: false, fireHeld: false, reload: false, holster: false, select: null, aim: new THREE.Vector3(0, 0, 10), ...over });

  it('kneels facing the pet with the gun away; walking off or drawing stops it', () => {
    const p = new Player();
    p.setPosition(new THREE.Vector3(0, 0, 0));
    p.updateWeapon(1, input({ fireHeld: true })); // gun out
    p.pet(new THREE.Vector3(1, 0, 0));
    expect(p.petLeft).toBeGreaterThan(0);
    for (let t = 0; t < 0.5; t += DT) p.updateWeapon(DT, input());
    expect(p.drawn).toBe(false);
    expect(p.aimYaw).toBeCloseTo(dirToYaw(1, 0));
    p.updateMovement(DT, input({ moveX: 1 }), map.collision, []);
    expect(p.petLeft).toBe(0);

    p.pet(new THREE.Vector3(1, 0, 0));
    p.updateWeapon(DT, input({ fireHeld: true }));
    expect(p.petLeft).toBe(0);

    p.pet(new THREE.Vector3(1, 0, 0));
    for (let t = 0; t < CONFIG.player.petTime + 0.1; t += DT) p.update(DT);
    expect(p.petLeft).toBe(0);
  });
});
