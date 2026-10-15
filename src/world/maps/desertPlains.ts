import * as THREE from 'three';
import type { AnimalSpawn } from '../../data/animals';
import type { Vec2 } from '../../data/types';
import type { ExitDef } from '../../data/world';
import type { TargetSystem } from '../../entities/Targets';
import { PAL } from '../../render/palette';
import { StaticBatch } from '../../render/StaticBatch';
import { Rng, valueNoise2 } from '../../util/math';
import { CollisionWorld } from '../Colliders';
import { ContainerSet } from '../Container';
import { buildGround, cactus, exitCorridors, mesas, rock, shrub, trailExits, wagon, type WorldData } from '../props';

const HALF = 40;

/** The waterhole the bison graze around (centre, radii). */
const WATER: { x: number; z: number; rx: number; rz: number } = { x: 2, z: 12, rx: 4.5, rz: 3 };
/** Where each wolf pack rests, and the grizzly's den among the boulders. */
const WOLVES_NORTH: Vec2 = [-22, -16];
const WOLVES_SOUTH: Vec2 = [-24, 22];
const DEN: Vec2 = [21, -28];

/** 0 at the waterhole's edge, < 0 inside it. */
function waterEdge(x: number, z: number): number {
  return Math.hypot((x - WATER.x) / WATER.rx, (z - WATER.z) / WATER.rz) - 1;
}

function groundColor(x: number, z: number, rng: Rng): number {
  const n = valueNoise2(x * 0.08, z * 0.08, 61) * 0.7 + valueNoise2(x * 0.27, z * 0.27, 62) * 0.3;
  // Dry, sun-bleached grass over sandy ground.
  let col = n < 0.33 ? 0xa79a52 : n < 0.66 ? 0xb8a960 : PAL.sandLight;
  const r = rng.next();
  if (r < 0.04) col = PAL.sand;
  else if (r < 0.06) col = 0x8a9e52;
  // The waterhole: water, then a ring of greener grass where the bison graze.
  const w = waterEdge(x, z);
  if (w < -0.35) col = PAL.skyDeep;
  else if (w < 0) col = 0x6f97b0;
  else if (w < 0.3) col = 0x7a9444;
  // Trampled earth around the den.
  if (Math.hypot(x - DEN[0], z - DEN[1]) < 6 && n > 0.4) col = PAL.sandDark;
  if (Math.abs(x) > HALF + 1 || Math.abs(z) > HALF + 1) col = n < 0.5 ? PAL.sand : 0xb8a960;
  return col;
}

/** Bleached bones: a skull, a few ribs and a long bone. */
function bones(b: StaticBatch, x: number, z: number, rng: Rng): void {
  const bone = PAL.cream;
  const yaw = rng.range(0, Math.PI * 2);
  b.box(0.3, 0.18, 0.22, bone, x, 0, z, yaw); // skull
  b.box(0.08, 0.06, 0.08, PAL.ink, x + Math.sin(yaw) * 0.05, 0.1, z + Math.cos(yaw) * 0.05, yaw); // eye socket
  for (let i = 0; i < 4; i++) b.put(new THREE.BoxGeometry(0.05, 0.05, 0.5), bone, x + 0.5 + i * 0.14, 0.06, z + 0.3, 0.6, yaw + 0.2, 0);
  b.box(0.7, 0.06, 0.07, bone, x - 0.4, 0, z - 0.5, yaw + 1.1); // long bone
}

/**
 * Desert Plains: dry open grassland west of the ranch with a waterhole where a bison herd grazes,
 * two wolf packs resting out west, and a grizzly's den among the boulders to the north-east.
 * One trail back east to the ranch.
 */
export function buildPlainsMap(_targets: TargetSystem, exits: readonly ExitDef[]): WorldData {
  const rng = new Rng(9090);
  const group = new THREE.Group();
  const batch = new StaticBatch();
  const cw = new CollisionWorld(HALF);
  group.add(buildGround((x, z, r) => groundColor(x, z, r)));

  // ---------------------------------------------------------------- waterhole
  // Too deep to wade: the water blocks walking, not bullets.
  for (let x = WATER.x - WATER.rx; x <= WATER.x + WATER.rx; x += 0.8) {
    for (let z = WATER.z - WATER.rz; z <= WATER.z + WATER.rz; z += 0.8) {
      if (waterEdge(x, z) < -0.25) cw.addCircle(x, z, 0.75, 0.05, 'dirt', false);
    }
  }
  for (let i = 0; i < 26; i++) {
    const a = rng.range(0, Math.PI * 2);
    const k = rng.range(1.02, 1.15);
    const x = WATER.x + Math.cos(a) * WATER.rx * k;
    const z = WATER.z + Math.sin(a) * WATER.rz * k;
    for (let j = 0; j < 3; j++) batch.box(0.05, rng.range(0.4, 0.8), 0.05, rng.pick([PAL.cactus, PAL.cactusDark, 0x9c8f4e]), x + rng.range(-0.2, 0.2), 0, z + rng.range(-0.2, 0.2)); // reeds
  }

  // ---------------------------------------------------------------- the den, the packs' resting places
  for (const [dx, dz] of [[-2.5, -1.5], [0, -2.8], [2.6, -1], [3.2, 1.8], [-3.2, 1.6]] as const) rock(batch, cw, DEN[0] + dx, DEN[1] + dz, rng);
  for (const [x, z] of [DEN, [DEN[0] - 4, DEN[1] + 3], WOLVES_NORTH, WOLVES_SOUTH, [WOLVES_SOUTH[0] + 3, WOLVES_SOUTH[1] - 3]] as Vec2[]) bones(batch, x + 1.5, z + 1.5, rng);

  // ---------------------------------------------------------------- an abandoned wagon (and what's left in it)
  wagon(batch, cw, -6, -8, 0.5, 'broken');
  const containers = new ContainerSet(9090);
  containers.add(cw, 'crate', -4.2, -6.6, 0, 0.8);
  for (const c of containers.items) group.add(c.object);

  // ---------------------------------------------------------------- exits & scenery
  const exitSigns = trailExits(batch, cw, exits, HALF, rng);
  const occupied = exitCorridors(exits, HALF);
  occupied.push(
    { x: WATER.x, z: WATER.z, r: WATER.rx + 2 },
    { x: DEN[0], z: DEN[1], r: 6 },
    { x: WOLVES_NORTH[0], z: WOLVES_NORTH[1], r: 5 },
    { x: WOLVES_SOUTH[0], z: WOLVES_SOUTH[1], r: 5 },
    { x: -5, z: -7.5, r: 4 },
  );
  const free = (x: number, z: number, r: number) => occupied.every((o) => Math.hypot(o.x - x, o.z - z) > o.r + r);
  const scatter = (count: number, r: number, place: (x: number, z: number) => void) => {
    for (let placed = 0, tries = 0; placed < count && tries < count * 50; tries++) {
      const x = rng.range(-HALF + 2, HALF - 2);
      const z = rng.range(-HALF + 2, HALF - 2);
      if (!free(x, z, r)) continue;
      occupied.push({ x, z, r });
      place(x, z);
      placed++;
    }
  };
  scatter(60, 0.8, (x, z) => shrub(batch, x, z, rng));
  scatter(14, 1.8, (x, z) => rock(batch, cw, x, z, rng));
  scatter(8, 1.6, (x, z) => cactus(batch, cw, x, z, rng));
  mesas(batch, rng, HALF, exits);
  group.add(batch.build());

  const first = exits[0];
  return {
    group,
    collision: cw,
    occluders: [],
    cover: [],
    half: HALF,
    playerSpawn: first ? new THREE.Vector3(first.arrive[0], 0, first.arrive[1]) : new THREE.Vector3(0, 0, 0),
    horseSpawn: null,
    horseYaw: 0,
    containers: containers.items,
    floors: [],
    exitSigns,
  };
}

// ------------------------------------------------------------------------------------------------

const wolf = (pack: string, at: Vec2, yaw: number): AnimalSpawn => ({ species: 'wolf', at, yaw, roam: 3, pack });

/**
 * The plains' wildlife: a bison herd round the waterhole, two wolf packs (four and three) resting
 * out west, and the grizzly by its den — well away from the wolves.
 */
export const PLAINS_ANIMALS: AnimalSpawn[] = [
  ...([[-6, 6], [-2, 4], [7, 6], [-5, 17], [1, 19], [7, 18]] as Vec2[]).map((at, i): AnimalSpawn => ({ species: 'bison', at, yaw: i * 1.1, roam: 9 })),
  wolf('north', [-22, -16], 0.3),
  wolf('north', [-20, -14.5], 2.1),
  wolf('north', [-23.5, -13.8], -1),
  wolf('north', [-20.5, -17.5], 1.4),
  wolf('south', [-24, 22], -0.5),
  wolf('south', [-22, 23.5], 2.6),
  wolf('south', [-25.5, 24], 1),
  { species: 'bear', at: [19, -24], yaw: 2.5, roam: 7 },
];
