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
  type Occluder,
  type WorldData,
} from '../props';

const HALF = CONFIG.world.size / 2;

/**
 * Builds the desert town: ground, buildings, props, targets and colliders.
 *
 * Layout respects the isometric camera (looking towards -X/-Z): building fronts face +Z or +X so
 * they face the viewer, and the camera side of the main street only has low props.
 */
export function buildSandboxMap(targets: TargetSystem): WorldData {
  const rng = new Rng(CONFIG.world.seed);
  const group = new THREE.Group();
  const batch = new StaticBatch();
  const cw = new CollisionWorld(HALF);
  const occluders: Occluder[] = [];
  const occupied: { x: number; z: number; r: number }[] = [];
  const reserve = (x: number, z: number, r: number) => occupied.push({ x, z, r });
  const isFree = (x: number, z: number, r: number) => occupied.every((o) => Math.hypot(o.x - x, o.z - z) > o.r + r);

  group.add(buildGround(groundColor));

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
  for (const [kind, x, z, yaw] of extra) containers.add(cw, kind, x, z, yaw);
  for (const c of containers.items) group.add(c.object);
  // Fence lines on the camera side of the street.
  fence(batch, cw, -14, 9, -6, 9);
  fence(batch, cw, 9, 9, 19, 9);

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

  // ---------------------------------------------------------------- scattered desert props
  const blocked = (x: number, z: number) =>
    (x > -29 && x < 27 && z > -25 && z < 12) ||
    (x > 24 && x < 44 && Math.abs(z) < 14) ||
    (x > -43 && x < -27 && z > 11 && z < 29);
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
  scatter(46, 1.6, (x, z) => cactus(batch, cw, x, z, rng));
  scatter(34, 1.8, (x, z) => rock(batch, cw, x, z, rng));
  scatter(40, 0.8, (x, z) => shrub(batch, x, z, rng));
  for (const [x, z] of [[-24, 14], [25, 13], [26, -16], [-27, -18]] as const) cactus(batch, cw, x, z, rng);

  mesas(batch, rng, HALF);

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
  };
}

// ------------------------------------------------------------------------------------------------

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
  const inStreet = (Math.abs(z) < 4.6 && x > -19.5 && x < 30) || (x > -19.5 && x < -13.5 && z > -14 && z < 14);
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

