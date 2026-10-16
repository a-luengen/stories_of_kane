import * as THREE from 'three';
import type { NpcDef } from '../../data/types';
import type { ExitDef } from '../../data/world';
import type { TargetSystem } from '../../entities/Targets';
import { itemDef } from '../../items/ItemDef';
import { PAL } from '../../render/palette';
import { StaticBatch } from '../../render/StaticBatch';
import { Rng, valueNoise2 } from '../../util/math';
import { CollisionWorld } from '../Colliders';
import { ContainerSet } from '../Container';
import { building, buildGround, cactus, cliff, exitCorridors, fence, mesas, rock, shrub, trailExits, type WorldData } from '../props';

const HALF = 40;

/** Where you stand to shoot (you shoot west, towards -X, away from the camera). */
export const FIRING_LINE = 12;
/** The lanes' centres (z), and how far down the lane each target stands. */
export const LANES = [-12, -6, 0, 6, 12];
export const TARGET_DISTANCES = [10, 20, 30, 40];

/**
 * One chest per gun at the firing line: two of each gun you can pair (to try dual wielding, also
 * mixed pairs across chests), and plenty of rounds for each. They're full again every visit.
 */
export const RANGE_CHESTS: { gun: string; guns: number; ammo: string; stacks: number }[] = [
  { gun: 'revolver', guns: 2, ammo: 'ammo_revolver', stacks: 3 },
  { gun: 'nickel_revolver', guns: 2, ammo: 'ammo_revolver', stacks: 3 },
  { gun: 'derringer', guns: 2, ammo: 'ammo_revolver', stacks: 2 },
  { gun: 'sawed_off', guns: 2, ammo: 'ammo_shells', stacks: 5 },
  { gun: 'magnum', guns: 1, ammo: 'ammo_magnum', stacks: 4 },
  { gun: 'rifle', guns: 1, ammo: 'ammo_rifle', stacks: 4 },
  { gun: 'shotgun', guns: 1, ammo: 'ammo_shells', stacks: 5 },
];

function groundColor(x: number, z: number, rng: Rng): number {
  const n = valueNoise2(x * 0.08, z * 0.08, 81) * 0.7 + valueNoise2(x * 0.3, z * 0.3, 82) * 0.3;
  let col: number = n < 0.3 ? PAL.sandDark : n < 0.66 ? PAL.sand : PAL.sandLight;
  const r = rng.next();
  // The lanes: trodden dirt, with a pale chalk line between them.
  if (x > -35 && x < FIRING_LINE && Math.abs(z) < 15) {
    col = n < 0.5 ? 0xb08a58 : PAL.sandDark;
    if (LANES.some((l) => Math.abs(Math.abs(z - l) - 3) < 0.25)) col = PAL.sandPale;
  }
  // The firing line and the stand behind it.
  if (x >= FIRING_LINE && x < 24 && Math.abs(z) < 16) col = r < 0.5 ? 0x9a7c62 : 0x8e6c46;
  if (Math.abs(x - FIRING_LINE - 0.6) < 0.3 && Math.abs(z) < 15) col = PAL.cream;
  if (r < 0.02) col = PAL.sandPale;
  return col;
}

/** The gun range south of town: lanes of targets, a chest of every gun, the range master's shed. */
export function buildRangeMap(targets: TargetSystem, exits: readonly ExitDef[]): WorldData {
  const rng = new Rng(5150);
  const group = new THREE.Group();
  const batch = new StaticBatch();
  const cw = new CollisionWorld(HALF);
  group.add(buildGround((x, z, r) => groundColor(x, z, r)));

  // ---------------------------------------------------------------- the firing line
  // A low counter you shoot over, open at both ends to walk round.
  for (const z of LANES) {
    batch.box(0.7, 0.95, 4.6, PAL.wood, FIRING_LINE, 0, z);
    batch.box(0.85, 0.08, 4.8, PAL.woodLight, FIRING_LINE, 0.95, z);
    cw.addBox(FIRING_LINE - 0.35, z - 2.3, FIRING_LINE + 0.35, z + 2.3, 1.0, 'wood');
  }

  // ---------------------------------------------------------------- the targets
  // A dummy per distance, staggered across the lanes; stakes mark every ten units.
  LANES.forEach((z, i) => {
    for (const d of TARGET_DISTANCES) {
      if ((i + TARGET_DISTANCES.indexOf(d)) % 2 !== 0) continue;
      const x = FIRING_LINE - d;
      targets.addDummy(new THREE.Vector3(x, 0, z), Math.PI / 2);
      cw.addCircle(x, z, 0.3, 1.9, 'wood', false);
    }
  });
  for (const d of TARGET_DISTANCES) {
    for (const z of [-15.5, 15.5]) batch.box(0.25, 0.7, 0.25, d % 20 === 0 ? PAL.red : PAL.cream, FIRING_LINE - d, 0, z);
  }
  // Bottles along the back fence, and the bank of earth behind it that stops what misses.
  for (const p of fence(batch, cw, -32, -15, -32, 15)) if (rng.next() < 0.9) targets.addBottle(p, rng.pick([PAL.glass, PAL.glassBrown, PAL.cactus]));
  cliff(batch, cw, -36, -20, -36, 20, 2.6, rng);
  // Side fences along the lanes.
  fence(batch, cw, -32, -17, FIRING_LINE - 1, -17);
  fence(batch, cw, -32, 17, FIRING_LINE - 1, 17);

  // ---------------------------------------------------------------- the chests
  const containers = new ContainerSet(5150);
  RANGE_CHESTS.forEach((c, i) => {
    const z = -12 + i * 4;
    const kind = itemDef(c.gun).size.w >= 4 ? 'weaponCrate' : 'chest';
    const box = containers.add(cw, kind, 20.5, z, Math.PI / 2, undefined, `range-${c.gun}`);
    box.name = `${itemDef(c.gun).name} Chest`;
    const stack = itemDef(c.ammo).maxStack;
    box.stock = [...Array.from({ length: c.guns }, () => ({ item: c.gun, quantity: 1 })), ...Array.from({ length: c.stacks }, () => ({ item: c.ammo, quantity: stack }))];
    box.refills = true;
  });
  for (const c of containers.items) group.add(c.object);

  // ---------------------------------------------------------------- the range master's shed
  const shed = building(cw, 24, -27, 0, 6, 5, 3.2, PAL.woodLight, PAL.red, rng);
  group.add(shed.mesh);

  // ---------------------------------------------------------------- around
  const occupied = [{ x: -10, z: 0, r: 30 }, { x: 18, z: 0, r: 10 }, { x: 24, z: -27, r: 6 }, ...exitCorridors(exits, HALF)];
  const free = (x: number, z: number, r: number) => occupied.every((o) => Math.hypot(o.x - x, o.z - z) > o.r + r);
  const scatter = (count: number, r: number, place: (x: number, z: number) => void) => {
    for (let placed = 0, tries = 0; placed < count && tries < count * 60; tries++) {
      const x = rng.range(-HALF + 2, HALF - 2);
      const z = rng.range(-HALF + 2, HALF - 2);
      if (!free(x, z, r)) continue;
      occupied.push({ x, z, r });
      place(x, z);
      placed++;
    }
  };
  scatter(14, 1.6, (x, z) => cactus(batch, cw, x, z, rng));
  scatter(12, 1.8, (x, z) => rock(batch, cw, x, z, rng));
  scatter(16, 0.8, (x, z) => shrub(batch, x, z, rng));
  mesas(batch, rng, HALF, exits);

  const exitSigns = trailExits(batch, cw, exits, HALF, rng);
  group.add(batch.build());
  const north = exits.find((e) => e.id === 'north') ?? exits[0];
  return {
    group,
    collision: cw,
    occluders: [shed],
    cover: [shed],
    half: HALF,
    playerSpawn: north ? new THREE.Vector3(north.arrive[0], 0, north.arrive[1]) : new THREE.Vector3(16, 0, -30),
    horseSpawn: null,
    horseYaw: 0,
    containers: containers.items,
    floors: shed.floor ? [shed.floor] : [],
    exitSigns,
    areas: [{ id: 'firing-line', minX: FIRING_LINE, minZ: -15, maxX: 24, maxZ: 15 }],
  };
}

/** The range master: sells ammunition cheap, keeps an eye on the line. */
export const RANGE_NPCS: NpcDef[] = [
  {
    id: 'range-master',
    attitude: 'friendly',
    defendsOthers: false,
    shop: 'range',
    appearance: {
      body: 'male',
      skin: PAL.skinDark,
      hair: PAL.rockLight,
      hairStyle: 'short',
      beard: PAL.rockLight,
      clothing: { hat: 'cowboy_hat_tan', top: 'shirt_rust', outerwear: 'vest_brown', legs: 'trousers_brown', boots: 'boots_brown', belt: 'belt_leather' },
    },
    weapon: 'rifle',
    spawn: [24, -23.7],
    routine: { kind: 'idle', at: [24, -23.7], facing: 0.4 },
    lines: { greet: ['Shoot downrange, never across the line.', 'Every gun in the territory, in those chests. Try them all.'] },
  },
];
