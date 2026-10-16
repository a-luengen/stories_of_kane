import * as THREE from 'three';
import { CONFIG } from '../../config';
import type { TargetSystem } from '../../entities/Targets';
import { StaticBatch } from '../../render/StaticBatch';
import { PAL } from '../../render/palette';
import { Rng, valueNoise2 } from '../../util/math';
import { CollisionWorld } from '../Colliders';
import { ContainerSet } from '../Container';
import {
  buildGround,
  building,
  cactus,
  fence,
  hitchingRail,
  mesas,
  rock,
  shrub,
  trough,
  waterTower,
  well,
  exitCorridors,
  trailExits,
  type Occluder,
  type WorldData,
} from '../props';
import type { ExitDef } from '../../data/world';
import type { AnimalSpawn } from '../../data/animals';

const HALF = CONFIG.world.size / 2;

/** The south quarter's street (z of its middle line). */
export const SOUTH_STREET = 36;

/** Its buildings, west to east: [x, width, depth, wall height, wall colour, sign colour]. */
const SOUTH_ROW: [number, number, number, number, number, number][] = [
  [-14, 7, 7, 3.6, PAL.red, PAL.cream], // the butcher's
  [-5, 7, 7, 3.4, PAL.woodPale, PAL.darkBrown], // the tanner's
  [8.5, 8, 7, 4.2, PAL.sandDark, PAL.brass], // the sheriff's office
  [18, 6, 6, 3.2, PAL.woodLight, PAL.rust], // a house
];

const SOUTH_CONTAINERS: [Parameters<ContainerSet['add']>[1], number, number, number][] = [
  ['barrel', -18.6, SOUTH_STREET - 5.2, 0],
  ['barrel', -9.6, SOUTH_STREET - 4.6, 0],
  ['crate', -1.2, SOUTH_STREET - 5.4, 0],
  ['ammoBox', 12.9, SOUTH_STREET - 4.8, 0],
  ['barrel', 21.6, SOUTH_STREET - 4.6, 0],
];

/**
 * Builds the desert town: ground, buildings, props, targets and colliders.
 *
 * Layout respects the isometric camera (looking towards -X/-Z): building fronts face +Z or +X so
 * they face the viewer, and the camera side of the main street only has low props.
 */
export function buildSandboxMap(targets: TargetSystem, exits: readonly ExitDef[] = []): WorldData {
  const rng = new Rng(CONFIG.world.seed);
  const group = new THREE.Group();
  const batch = new StaticBatch();
  const cw = new CollisionWorld(HALF);
  const occluders: Occluder[] = [];
  const occupied: { x: number; z: number; r: number }[] = [];
  const reserve = (x: number, z: number, r: number) => occupied.push({ x, z, r });
  const isFree = (x: number, z: number, r: number) => occupied.every((o) => Math.hypot(o.x - x, o.z - z) > o.r + r);

  // (The ground reaches past the map's edge, under the rock ring.)
  group.add(buildGround(groundColor, HALF * 2 + 60));

  // ---------------------------------------------------------------- town buildings
  // [position along the row, width, depth, wall height, wall colour, sign colour]
  const north: [number, number, number, number, number, number][] = [
    [-14, 7, 7, 3.6, PAL.woodLight, PAL.cream],
    [-5, 8, 8, 5.4, PAL.wood, PAL.red],
    [3.5, 6, 7, 3.4, PAL.woodPale, PAL.darkBrown],
    [12, 7, 7, 3.8, PAL.red, PAL.cream],
    [20.5, 6, 6, 3.2, PAL.woodLight, PAL.rust],
  ];
  const west: typeof north = [
    [-10, 7, 7, 3.8, PAL.wood, PAL.cream],
    [-1, 6, 6, 3.4, PAL.sandDark, PAL.darkBrown],
    [8, 8, 8, 5.0, PAL.woodPale, PAL.rust],
  ];
  for (const [x, w, d, h, wall, sign] of north) {
    occluders.push(building(cw, x, -6.5 - d / 2, 0, w, d, h, wall, sign, rng));
  }
  for (const [z, w, d, h, wall, sign] of west) {
    occluders.push(building(cw, -19.5 - d / 2, z, Math.PI / 2, w, d, h, wall, sign, rng));
  }
  // The south quarter: a second street south of the main one, its north side built up (fronts
  // facing the street and the camera), a lane up to the main street between the tanner's and the
  // sheriff's.
  for (const [x, w, d, h, wall, sign] of SOUTH_ROW) {
    occluders.push(building(cw, x, SOUTH_STREET - 6.5 - d / 2, 0, w, d, h, wall, sign, rng));
  }
  for (const o of occluders) group.add(o.mesh);

  // Water tower behind the north row; trough and rails along the street.
  waterTower(batch, cw, 7, -21);
  trough(batch, cw, -3.5, 5.6);
  trough(batch, cw, 16, 5.6);
  hitchingRail(batch, cw, -9.5, 5.3);
  hitchingRail(batch, cw, 7.5, 5.3);
  hitchingRail(batch, cw, -15.6, -4.8);
  well(batch, cw, 1, 9.5);

  // Barrels and crates.
  const barrels: [number, number][] = [
    [-18.2, -5.0], [-9.7, -4.4], [-0.6, -5.2], [7.2, -4.3], [16.4, -5.1], [24.2, -4.6],
    [-12.8, 6.0], [-6.4, 6.4], [3.4, 6.2], [11.0, 5.9], [19.6, 6.5], [-17.2, 11.2], [-16.8, -12.3],
  ];
  // Every barrel and crate is a container (each draw keeps the map's random sequence as before).
  const containers = new ContainerSet(CONFIG.world.seed);
  for (const [x, z] of barrels) {
    containers.add(cw, 'barrel', x, z, rng.range(0, Math.PI * 2));
  }
  for (const [x, z] of [[-11.8, 6.8], [20.8, 6.0], [24.6, -6.0], [-17.0, 4.8], [-17.6, 12.4]] as const) containers.add(cw, 'crate', x, z, 0, rng.range(0.7, 0.9));
  // Ammo boxes, weapon crates and chests on the porches and beside the buildings.
  const extra: [Parameters<ContainerSet['add']>[1], number, number, number][] = [
    ['chest', -3.2, -5.65, 0],
    ['chest', -18.85, -3.2, Math.PI / 2],
    ['weaponCrate', 10.1, -5.75, 0],
    ['weaponCrate', -18.85, -8.0, Math.PI / 2],
    ['ammoBox', 8.6, -4.6, 0],
    ['ammoBox', -12.4, -5.2, 0],
    ['ammoBox', 22.4, -5.3, 0],
    ['ammoBox', -18.6, 6.3, Math.PI / 2],
    ['ammoBox', 5.3, 6.6, 0],
    ['ammoBox', 28.4, 3.2, Math.PI / 2],
  ];
  for (const [kind, x, z, yaw] of extra) {
    // The chest on the porch across the street (quests call it `kanes-crossing:chest-porch`) holds a
    // scrap of a map to the gulch.
    const porch = kind === 'chest' && x === -3.2;
    const c = containers.add(cw, kind, x, z, yaw, undefined, porch ? 'chest-porch' : undefined);
    if (porch) c.extras.push('map_scrap_gulch');
  }
  // The south quarter's barrels and crates (the butcher's back yard, the sheriff's porch).
  for (const [kind, x, z, yaw] of SOUTH_CONTAINERS) containers.add(cw, kind, x, z, yaw);
  for (const c of containers.items) group.add(c.object);
  // Fence lines on the camera side of the street.
  fence(batch, cw, -14, 9, -6, 9);
  fence(batch, cw, 9, 9, 19, 9);
  // The south street: rails and a trough on its camera side; a chicken run behind the house at its
  // east end (clear of the main street's people, who need room to step back in a fight).
  hitchingRail(batch, cw, -9, SOUTH_STREET + 4.8);
  hitchingRail(batch, cw, 12.5, SOUTH_STREET + 4.8);
  trough(batch, cw, 5, SOUTH_STREET + 5.2);
  fence(batch, cw, -18, SOUTH_STREET + 7, -10, SOUTH_STREET + 7);
  fence(batch, cw, 10, SOUTH_STREET + 7, 20, SOUTH_STREET + 7);
  fence(batch, cw, 14, 14, 24, 14);
  fence(batch, cw, 24, 14, 24, 21);

  // ---------------------------------------------------------------- shooting range (east)
  // Targets face +X (towards the camera side); shoot them from further east.
  const rangeFence = [...fence(batch, cw, 27, -9, 27, -2), ...fence(batch, cw, 27, 2, 27, 9)];
  const sideFence = fence(batch, cw, 27, -11, 41, -11);
  for (const p of [...rangeFence, ...sideFence]) {
    if (rng.next() < 0.85) targets.addBottle(p, rng.pick([PAL.glass, PAL.glassBrown, PAL.cactus]));
  }
  for (const z of [-6, -3, 3, 6]) {
    targets.addDummy(new THREE.Vector3(31, 0, z), Math.PI / 2);
    cw.addCircle(31, z, 0.3, 1.9, 'wood', false);
  }
  // Corral south-west of town with a few bottles too.
  const corral = [
    ...fence(batch, cw, -40, 14, -30, 14),
    ...fence(batch, cw, -40, 14, -40, 26),
    ...fence(batch, cw, -40, 26, -30, 26),
  ];
  corral.forEach((p, i) => i % 3 === 0 && targets.addBottle(p, rng.pick([PAL.glass, PAL.glassBrown])));

  // ---------------------------------------------------------------- exits
  // Trails out of town (kept clear of scenery), each with a signpost.
  for (const c of exitCorridors(exits, HALF)) reserve(c.x, c.z, c.r);
  const exitSigns = trailExits(batch, cw, exits, HALF, new Rng(CONFIG.world.seed + 7));

  // ---------------------------------------------------------------- scattered desert props
  const blocked = (x: number, z: number) =>
    (x > -29 && x < 27 && z > -25 && z < 12) ||
    (x > 24 && x < 44 && Math.abs(z) < 14) ||
    (x > -43 && x < -27 && z > 11 && z < 29) ||
    // The south quarter, its chicken run and the lane between the streets.
    (x > -24 && x < 26 && z > 11 && z < SOUTH_STREET + 9);
  const scatter = (count: number, r: number, place: (x: number, z: number) => void) => {
    let tries = 0;
    let placed = 0;
    while (placed < count && tries++ < count * 40) {
      const x = rng.range(-HALF + 2, HALF - 2);
      const z = rng.range(-HALF + 2, HALF - 2);
      if (blocked(x, z) || !isFree(x, z, r)) continue;
      reserve(x, z, r);
      place(x, z);
      placed++;
    }
  };
  // (Four times the ground of the old 100 × 100 town: four times the scrub.)
  scatter(170, 1.6, (x, z) => cactus(batch, cw, x, z, rng));
  scatter(130, 1.8, (x, z) => rock(batch, cw, x, z, rng));
  scatter(150, 0.8, (x, z) => shrub(batch, x, z, rng));
  for (const [x, z] of [[-24, 14], [25, 13], [26, -16], [-27, -18]] as const) cactus(batch, cw, x, z, rng);

  mesas(batch, rng, HALF, exits);

  group.add(batch.build());

  return {
    group,
    collision: cw,
    occluders,
    cover: occluders,
    half: HALF,
    playerSpawn: new THREE.Vector3(-2, 0, 1.5),
    horseSpawn: new THREE.Vector3(-6.5, 0, 2.6),
    horseYaw: Math.PI / 2,
    containers: containers.items,
    floors: occluders.flatMap((o) => (o.floor ? [o.floor] : [])),
    exitSigns,
  };
}

// ------------------------------------------------------------------------------------------------

/**
 * The town's pets: dogs roaming the main street and the corner by the side street, cats keeping to
 * the porches (each by a barrel, where the sun is warm). And a rattlesnake out in the desert
 * south-east of town.
 */
export const TOWN_ANIMALS: AnimalSpawn[] = [
  { species: 'dog', at: [-10, 1.5], yaw: 1.2, roam: 9 },
  { species: 'dog', at: [14, -1.5], yaw: -2, roam: 9 },
  { species: 'dog', at: [-15.5, -1], yaw: 0.3, roam: 5 },
  { species: 'cat', at: [-8.9, -5.2], yaw: 0.4, roam: 2.5 },
  { species: 'cat', at: [12, 6.6], yaw: 2.8, roam: 2.5 },
  { species: 'cat', at: [-16.3, 10.6], yaw: 1.6, roam: 2.5 },
  { species: 'snake', at: [30, 26], yaw: 0.8, roam: 3 },
  // The south quarter: a dog by the sheriff's, chickens in their run behind the house.
  { species: 'dog', at: [6, SOUTH_STREET + 1], yaw: 0.6, roam: 8 },
  { species: 'chicken', at: [18, 17], yaw: 0.2, roam: 3 },
  { species: 'chicken', at: [20, 18.5], yaw: 2.1, roam: 3 },
  { species: 'chicken', at: [16.5, 19], yaw: 4, roam: 3 },
];

const tileCache = new Map<string, number>();
function groundColor(x: number, z: number, rng: Rng, first: boolean): number {
  const key = `${x},${z}`;
  if (!first && tileCache.has(key)) return tileCache.get(key)!;
  const n = valueNoise2(x * 0.07, z * 0.07, 3) * 0.7 + valueNoise2(x * 0.23, z * 0.23, 7) * 0.3;
  let col: number = n < 0.3 ? PAL.sandDark : n < 0.64 ? PAL.sand : PAL.sandLight;
  const r = rng.next();
  if (r < 0.015) col = PAL.sandPale;
  else if (r < 0.03) col = PAL.sandDark;
  // Main street and wheel ruts.
  const inStreet =
    (Math.abs(z) < 4.6 && x > -19.5 && x < 30) ||
    (x > -19.5 && x < -13.5 && z > -14 && z < 14) ||
    // The south street and the lane up to the main one.
    (Math.abs(z - SOUTH_STREET) < 4.6 && x > -22 && x < 26) ||
    (x > -1 && x < 4 && z > 4 && z < SOUTH_STREET);
  if (inStreet) {
    col = n < 0.5 ? 0xb08a58 : PAL.sandDark;
    if (Math.abs(Math.abs(z) - 1.6) < 0.5 && r < 0.7) col = 0x8e6c46;
  }
  // Trail to the range.
  if (x > 26 && x < 44 && Math.abs(z) < 2 && r < 0.6) col = 0xb08a58;
  // Outside the playable area.
  if (Math.abs(x) > HALF || Math.abs(z) > HALF) col = n < 0.5 ? PAL.sandDark : PAL.sand;
  tileCache.set(key, col);
  return col;
}

