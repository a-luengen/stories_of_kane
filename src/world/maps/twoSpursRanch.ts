import * as THREE from 'three';
import type { AnimalSpawn } from '../../data/animals';
import type { NpcDef, Vec2 } from '../../data/types';
import type { ExitDef } from '../../data/world';
import type { TargetSystem } from '../../entities/Targets';
import { boxGeo, fadeableToon, part } from '../../render/materials';
import { PAL } from '../../render/palette';
import { StaticBatch } from '../../render/StaticBatch';
import { Rng, valueNoise2 } from '../../util/math';
import { CollisionWorld } from '../Colliders';
import { ContainerSet } from '../Container';
import type { HorseState } from '../poiState';
import { buildGround, exitCorridors, fence, hitchingRail, mesas, rock, shade, shrub, trailExits, trough, wagon, type Floor, type Occluder, type WorldData } from '../props';

const HALF = 40;

/** The stream across the prairie (south of the paddock), and its plank bridge on the south trail. */
const STREAM: Vec2[] = [
  [-44, 31],
  [-30, 28.5],
  [-16, 30],
  [-5, 27.4],
  [6, 26.2],
  [18, 29],
  [30, 27],
  [44, 30],
];
const STREAM_W = 2.6;
const BRIDGE_X = 0;

/** The big paddock (minX, minZ, maxX, maxZ) the ranch horses graze in, and the small corral (the pigs' pen). */
export const PADDOCK: [number, number, number, number] = [-6, 6, 18, 22];
export const CORRAL: [number, number, number, number] = [21, -6, 29, 2];
/** The cows' pasture, west of the yard, with its gate towards the house. */
export const PASTURE: [number, number, number, number] = [-38, 4, -24, 22];
/** The chicken coop, behind the farmhouse; the hens scratch about the yard around it. */
const COOP: Vec2 = [-25, -13];

const inside = (r: readonly number[], x: number, z: number) => x > r[0] && x < r[2] && z > r[1] && z < r[3];

function distToStream(x: number, z: number): number {
  let best = Infinity;
  for (let i = 1; i < STREAM.length; i++) {
    const [ax, az] = STREAM[i - 1];
    const [bx, bz] = STREAM[i];
    const vx = bx - ax;
    const vz = bz - az;
    const t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)));
    best = Math.min(best, Math.hypot(x - ax - vx * t, z - az - vz * t));
  }
  return best;
}

/** The stream's z at x (for placing the bridge). */
function streamZ(x: number): number {
  for (let i = 1; i < STREAM.length; i++) {
    const [ax, az] = STREAM[i - 1];
    const [bx, bz] = STREAM[i];
    if (x >= ax && x <= bx) return az + ((x - ax) / (bx - ax)) * (bz - az);
  }
  return 0;
}

function groundColor(x: number, z: number, rng: Rng, first: boolean): number {
  const n = valueNoise2(x * 0.09, z * 0.09, 51) * 0.7 + valueNoise2(x * 0.3, z * 0.3, 52) * 0.3;
  // Prairie grass, in three greens with flecks of dry straw.
  let col = n < 0.33 ? 0x7a9444 : n < 0.66 ? 0x8fa851 : 0xa6b562;
  const r = rng.next();
  if (r < 0.03) col = PAL.sandLight;
  else if (r < 0.06) col = 0x6c8a3c;
  // The yard between house, barn and corral: packed dirt.
  if (x > -24 && x < 31 && z > -22 && z < 4 && valueNoise2(x * 0.2, z * 0.2, 53) > 0.35) col = n < 0.5 ? 0xb08a58 : PAL.sandDark;
  // Trampled paddock and pasture: patches of bare earth. The pig pen: mostly mud.
  if ((inside(PADDOCK, x, z) || inside(PASTURE, x, z)) && n > 0.55) col = 0x9a7a4e;
  if (inside(CORRAL, x, z) && n > 0.3) col = n > 0.6 ? PAL.brown : 0x7a5a3a;
  // The stream: water, then a darker, lusher bank.
  const d = distToStream(x, z);
  if (d < STREAM_W / 2) col = d < STREAM_W / 4 ? PAL.skyDeep : 0x6f97b0;
  else if (d < STREAM_W / 2 + 0.9) col = 0x5f7f36;
  if (Math.abs(x) > HALF + 1 || Math.abs(z) > HALF + 1) col = n < 0.5 ? 0x6c8a3c : 0x7a9444;
  void first;
  return col;
}

/**
 * A ranch house: plank walls, a gabled roof, a chimney, windows and a porch along the front (+Z).
 * Fades like the town's buildings when it hides the player. Returns its occluder (with the porch floor).
 */
function farmhouse(cw: CollisionWorld, x: number, z: number, w: number, d: number, h: number): Occluder {
  const b = new StaticBatch();
  const wall = PAL.woodPale;
  const trim = shade(wall, 0.72);
  b.box(w, h, d, wall, x, 0, z);
  for (let y = 0.5; y < h - 0.2; y += 0.5) b.box(w + 0.04, 0.06, d + 0.04, trim, x, y, z); // plank seams
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.2, h, 0.2, trim, x + (sx * w) / 2, 0, z + (sz * d) / 2);
  // Gable ends (a diamond whose lower half hides in the walls) and the roof slabs at 45°.
  b.put(new THREE.BoxGeometry(w - 0.02, d / Math.SQRT2, d / Math.SQRT2), wall, x, h, z, Math.PI / 4);
  const slab = (d / 2 + 0.45) * Math.SQRT2;
  for (const s of [-1, 1]) b.put(new THREE.BoxGeometry(w + 0.6, 0.16, slab), PAL.rust, x, h + d / 4 + 0.1, z + (s * d) / 4, (s * Math.PI) / 4);
  b.box(0.7, 1.6, 0.7, PAL.rockDark, x - w * 0.3, h + d * 0.2, z - d * 0.15); // chimney
  // Door, windows (front and sides).
  b.box(1.1, 2.0, 0.08, trim, x, 0, z + d / 2 + 0.02);
  b.box(0.9, 1.85, 0.1, PAL.darkBrown, x, 0, z + d / 2 + 0.04);
  for (const sx of [-1, 1]) {
    b.box(1.1, 1.0, 0.08, trim, x + sx * w * 0.3, 0.95, z + d / 2 + 0.02);
    b.box(0.9, 0.8, 0.1, PAL.skyDeep, x + sx * w * 0.3, 1.05, z + d / 2 + 0.04);
    b.box(0.08, 0.8, 1.0, trim, x + (sx * w) / 2 + sx * 0.02, 1.0, z);
    b.box(0.1, 0.6, 0.8, PAL.skyDeep, x + (sx * w) / 2 + sx * 0.04, 1.1, z);
  }
  // Porch with posts and a slanted awning.
  const pd = 1.9;
  b.box(w + 0.4, 0.2, pd, PAL.wood, x, 0, z + d / 2 + pd / 2);
  for (let i = 0; i < 4; i++) {
    const px = x - (w + 0.2) / 2 + (i * (w + 0.2)) / 3;
    b.box(0.16, 2.5, 0.16, trim, px, 0.2, z + d / 2 + pd - 0.12);
    cw.addCircle(px, z + d / 2 + pd - 0.12, 0.12, 2.6, 'wood');
  }
  b.put(new THREE.BoxGeometry(w + 0.6, 0.1, pd + 0.4), PAL.rust, x, 2.75, z + d / 2 + pd / 2, 0.12);
  cw.addBox(x - w / 2, z - d / 2, x + w / 2, z + d / 2, h + d / 2, 'wood');
  const mat = fadeableToon();
  const mesh = b.build(mat);
  const bb = new THREE.Box3().setFromObject(mesh);
  const floor: Floor = { minX: x - (w + 0.4) / 2, minZ: z + d / 2, maxX: x + (w + 0.4) / 2, maxZ: z + d / 2 + pd, surface: 'wood' };
  return { mesh, fade: mat.userData.uFade, minX: bb.min.x, minZ: bb.min.z, maxX: bb.max.x, maxZ: bb.max.z, height: bb.max.y, floor };
}

/**
 * The big barn: red plank walls with a wide open doorway at the front (+Z), its doors swung open,
 * a tall gabled roof, a plank floor, stalls along the back and hay inside. You can walk in; it
 * fades when it hides you.
 */
function barn(cw: CollisionWorld, x: number, z: number, w: number, d: number, h: number): Occluder {
  const b = new StaticBatch();
  const wall = PAL.red;
  const trim = PAL.cream;
  const t = 0.3;
  const door = 4.6;
  const side = (w - door) / 2;
  // Walls: back, two sides, and the front either side of the doorway.
  const walls: [number, number, number, number][] = [
    [x - w / 2, z - d / 2, x + w / 2, z - d / 2 + t],
    [x - w / 2, z - d / 2, x - w / 2 + t, z + d / 2],
    [x + w / 2 - t, z - d / 2, x + w / 2, z + d / 2],
    [x - w / 2, z + d / 2 - t, x - w / 2 + side, z + d / 2],
    [x + w / 2 - side, z + d / 2 - t, x + w / 2, z + d / 2],
  ];
  for (const [x0, z0, x1, z1] of walls) {
    b.box(x1 - x0, h, z1 - z0, wall, (x0 + x1) / 2, 0, (z0 + z1) / 2);
    cw.addBox(x0, z0, x1, z1, h, 'wood');
  }
  // Board seams and white trim.
  for (let y = 0.6; y < h; y += 0.6) b.box(w + 0.03, 0.05, d + 0.03, shade(wall, 0.8), x, y, z);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.22, h, 0.22, trim, x + (sx * w) / 2, 0, z + (sz * d) / 2);
  b.box(door + 0.3, 0.22, 0.34, trim, x, h - 0.6, z + d / 2 - 0.15); // lintel
  b.box(door - 0.2, h - 0.82, 0.12, PAL.ink, x, 0, z - d / 2 + 0.36); // the dark inside of the back wall
  // Doors swung wide open, each with a white cross brace.
  for (const s of [-1, 1]) {
    const dx = x + s * (door / 2 + 0.9);
    const dz = z + d / 2 + 0.95;
    const ry = s * 1.25;
    b.box(door / 2, h - 0.8, 0.1, wall, dx, 0, dz, ry);
    b.box(door / 2 * 1.15, 0.12, 0.12, trim, dx, (h - 0.8) / 2, dz, ry);
  }
  // Gable roof (gable ends as half-hidden diamonds, slabs at 45°) with a hay-loft door.
  b.put(new THREE.BoxGeometry(w - 0.02, d / Math.SQRT2, d / Math.SQRT2), wall, x, h, z, Math.PI / 4);
  const slab = (d / 2 + 0.5) * Math.SQRT2;
  for (const s of [-1, 1]) b.put(new THREE.BoxGeometry(w + 0.7, 0.2, slab), PAL.rust, x, h + d / 4 + 0.12, z + (s * d) / 4, (s * Math.PI) / 4);
  b.box(1.6, 1.4, 0.1, PAL.ink, x, h + 0.4, z + d / 2 + 0.02);
  b.box(1.9, 0.12, 0.12, trim, x, h + 1.8, z + d / 2 + 0.03);
  // Inside: plank floor, stalls along the back wall, hay.
  b.box(w - 2 * t, 0.06, d - 2 * t, PAL.wood, x, 0, z);
  for (let i = 0; i < 4; i++) {
    const sx = x - w / 2 + 1.8 + i * 2.6;
    b.box(0.14, 1.3, 2.4, PAL.woodLight, sx, 0, z - d / 2 + 1.5);
    cw.addBox(sx - 0.07, z - d / 2 + 0.3, sx + 0.07, z - d / 2 + 2.7, 1.3, 'wood');
  }
  const mat = fadeableToon();
  const mesh = b.build(mat);
  const bb = new THREE.Box3().setFromObject(mesh);
  const floor: Floor = { minX: x - w / 2 + t, minZ: z - d / 2 + t, maxX: x + w / 2 - t, maxZ: z + d / 2, surface: 'wood' };
  return { mesh, fade: mat.userData.uFade, minX: bb.min.x, minZ: bb.min.z, maxX: bb.max.x, maxZ: bb.max.z, height: bb.max.y, floor };
}

/** A square hay bale (low cover). */
function hayBale(b: StaticBatch, cw: CollisionWorld, x: number, z: number, ry: number, y = 0): void {
  b.box(1.1, 0.55, 0.62, 0xd8b45a, x, y, z, ry);
  b.box(1.12, 0.06, 0.64, 0xb8923e, x, y + 0.18, z, ry);
  b.box(1.12, 0.06, 0.64, 0xb8923e, x, y + 0.38, z, ry);
  if (y === 0) cw.addCircle(x, z, 0.5, 0.55, 'wood');
}

/** A windmill: lattice tower, platform, a fan of sails (turning) and a tail vane. */
function windmill(group: THREE.Group, b: StaticBatch, cw: CollisionWorld, x: number, z: number): (dt: number) => void {
  const top = 6.2;
  // A tapering lattice tower: legs from a wide base to a narrow top; each brace ring sits on the
  // legs at its height (so the rings get smaller going up).
  const base = 1.2;
  const crown = 0.42;
  const spread = (y: number) => base + (crown - base) * (y / top);
  const up = new THREE.Vector3(0, 1, 0);
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const from = new THREE.Vector3(x + sx * base, 0, z + sz * base);
    const to = new THREE.Vector3(x + sx * crown, top, z + sz * crown);
    const dir = to.clone().sub(from);
    const len = dir.length();
    const m = new THREE.Matrix4().compose(from.clone().add(to).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(up, dir.normalize()), new THREE.Vector3(1, 1, 1));
    b.add(new THREE.BoxGeometry(0.14, len, 0.14), PAL.wood, m);
  }
  for (const y of [0.9, 2.5, 4.0, 5.3]) {
    const s = spread(y);
    b.box(s * 2 + 0.12, 0.08, 0.08, PAL.woodLight, x, y, z - s);
    b.box(s * 2 + 0.12, 0.08, 0.08, PAL.woodLight, x, y, z + s);
    b.box(0.08, 0.08, s * 2 + 0.12, PAL.woodLight, x - s, y, z);
    b.box(0.08, 0.08, s * 2 + 0.12, PAL.woodLight, x + s, y, z);
  }
  b.box(crown * 2 + 0.5, 0.12, crown * 2 + 0.5, PAL.wood, x, top, z); // platform
  cw.addBox(x - base - 0.1, z - base - 0.1, x + base + 0.1, z + base + 0.1, 2, 'wood');
  // The head (not batched: it turns). Faces +X (towards the camera side).
  const head = new THREE.Group();
  head.position.set(x, top + 0.45, z);
  head.rotation.y = Math.PI / 2;
  group.add(head);
  part(boxGeo(0.25, 0.25, 0.9), PAL.metal, 0, 0, -0.2, head); // gearbox
  part(boxGeo(0.06, 0.7, 1.4), PAL.cream, 0, 0.1, -1.3, head); // tail vane
  const sails = new THREE.Group();
  sails.position.set(0, 0, 0.32);
  head.add(sails);
  for (let i = 0; i < 12; i++) {
    const blade = new THREE.Group();
    blade.rotation.z = (i / 12) * Math.PI * 2;
    sails.add(blade);
    const m = part(boxGeo(0.22, 1.25, 0.03), i % 2 ? PAL.metalLight : PAL.cream, 0, 0.85, 0, blade);
    m.rotation.y = 0.35;
  }
  part(new THREE.CylinderGeometry(0.14, 0.14, 0.16, 8), PAL.metal, 0, 0, 0.05, sails).rotation.x = Math.PI / 2;
  return (dt) => {
    sails.rotation.z += dt * 1.6;
  };
}

/** A little chicken coop on stilts: plank walls, a sloping roof, a pop hole and a ramp up to it (front = +X). */
function chickenCoop(b: StaticBatch, cw: CollisionWorld, x: number, z: number): void {
  const w = 1.6;
  const d = 2.2;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.12, 0.4, 0.12, PAL.darkBrown, x + sx * (w / 2 - 0.1), 0, z + sz * (d / 2 - 0.1));
  b.box(w, 1.0, d, PAL.woodLight, x, 0.4, z);
  for (let y = 0.6; y < 1.4; y += 0.25) b.box(w + 0.03, 0.04, d + 0.03, shade(PAL.woodLight, 0.75), x, y, z); // plank seams
  b.box(0.08, 0.5, d, PAL.woodLight, x + w / 2 - 0.04, 1.4, z); // the taller front wall
  b.put(new THREE.BoxGeometry(w + 0.5, 0.1, d + 0.4), PAL.rust, x, 1.7, z, 0, 0, 0.3); // roof, sloping to the back
  b.box(0.06, 0.38, 0.32, PAL.ink, x + w / 2 + 0.01, 0.48, z + 0.4); // pop hole
  b.put(new THREE.BoxGeometry(1.0, 0.05, 0.34), PAL.wood, x + w / 2 + 0.45, 0.22, z + 0.4, 0, 0, -0.45); // ramp
  cw.addBox(x - w / 2, z - d / 2, x + w / 2, z + d / 2, 1.6, 'wood');
}

/** Two Spurs Ranch: farmhouse, barn, paddock with horses, pig pen, cow pasture, chicken coop, windmill, the stream. */
export function buildRanchMap(_targets: TargetSystem, exits: readonly ExitDef[]): WorldData {
  const rng = new Rng(4242);
  const group = new THREE.Group();
  const batch = new StaticBatch();
  const cw = new CollisionWorld(HALF);
  group.add(buildGround(groundColor));

  // ---------------------------------------------------------------- buildings
  const house = farmhouse(cw, -14, -12, 10, 7, 3.4);
  const theBarn = barn(cw, 12, -14, 12, 10, 4.6);
  const occluders = [house, theBarn];
  for (const o of occluders) group.add(o.mesh);

  // ---------------------------------------------------------------- yard
  hitchingRail(batch, cw, -6, -4.2);
  trough(batch, cw, -6, -1.6);
  wagon(batch, cw, 25, -15, 0.35, 'covered');
  wagon(batch, cw, -19, 15, 1.2, 'intact');
  // Hay: a stack by the barn door, bales inside, a few in the paddock.
  for (const [x, z, r, y] of [[5.2, -7.6, 0.1, 0], [6.4, -7.4, -0.1, 0], [5.8, -7.5, 0, 0.55], [17, -11.2, 1.57, 0], [17, -12.4, 1.57, 0], [17, -11.8, 1.57, 0.55], [14, 18, 0.4, 0], [-2, 19, 1.2, 0]] as const) {
    hayBale(batch, cw, x, z, r, y);
  }

  // ---------------------------------------------------------------- windmill + trough, the coop
  const spin = windmill(group, batch, cw, -26, -2);
  trough(batch, cw, -23, 1.2);
  chickenCoop(batch, cw, COOP[0], COOP[1]);

  // ---------------------------------------------------------------- paddock & corral
  const [px0, pz0, px1, pz1] = PADDOCK;
  // Gate gap in the north fence (towards the yard).
  fence(batch, cw, px0, pz0, 3.5, pz0);
  fence(batch, cw, 6.5, pz0, px1, pz0);
  fence(batch, cw, px1, pz0, px1, pz1);
  fence(batch, cw, px1, pz1, px0, pz1);
  fence(batch, cw, px0, pz1, px0, pz0);
  trough(batch, cw, 8, 16);
  const [cx0, cz0, cx1, cz1] = CORRAL;
  fence(batch, cw, cx0, cz0, cx1, cz0);
  fence(batch, cw, cx1, cz0, cx1, cz1);
  fence(batch, cw, cx1, cz1, cx0, cz1);
  fence(batch, cw, cx0, cz1, cx0, cz0 + 3); // gap on the west side
  fence(batch, cw, cx0, cz0, cx0, cz0 + 1);
  trough(batch, cw, 25.5, -5.2); // the pigs' feed trough along the north fence
  // The cow pasture: a long fence, its gate (a gap) on the east side, facing the yard.
  const [qx0, qz0, qx1, qz1] = PASTURE;
  fence(batch, cw, qx0, qz0, qx1, qz0);
  fence(batch, cw, qx1, qz0, qx1, 10);
  fence(batch, cw, qx1, 13.5, qx1, qz1);
  fence(batch, cw, qx1, qz1, qx0, qz1);
  fence(batch, cw, qx0, qz1, qx0, qz0);
  trough(batch, cw, -31, 20.6);
  hayBale(batch, cw, -35, 6, 0.3);

  // ---------------------------------------------------------------- stream + bridge
  // Too deep to wade (except over the bridge): water blocks walking, not bullets.
  const bz = streamZ(BRIDGE_X);
  for (let i = 1; i < STREAM.length; i++) {
    const [ax, az] = STREAM[i - 1];
    const [bx, bz2] = STREAM[i];
    const n = Math.ceil(Math.hypot(bx - ax, bz2 - az) / 0.9);
    for (let k = 0; k <= n; k++) {
      const x = ax + ((bx - ax) * k) / n;
      const z = az + ((bz2 - az) * k) / n;
      if (Math.abs(x - BRIDGE_X) < 2.2 || Math.abs(x) > HALF) continue;
      cw.addCircle(x, z, STREAM_W / 2 - 0.15, 0.05, 'dirt', false);
    }
  }
  // Plank bridge with low rails.
  for (let i = -6; i <= 6; i++) batch.box(3.2, 0.12, 0.34, i % 2 ? PAL.woodLight : PAL.wood, BRIDGE_X, 0.05, bz + i * 0.36, 0.02 * (i % 3));
  for (const s of [-1, 1]) {
    batch.box(0.12, 0.12, 4.8, PAL.wood, BRIDGE_X + s * 1.55, 0.7, bz);
    for (const k of [-2.2, 0, 2.2]) batch.box(0.14, 0.75, 0.14, PAL.darkBrown, BRIDGE_X + s * 1.55, 0, bz + k);
    cw.addBox(BRIDGE_X + s * 1.55 - 0.08, bz - 2.4, BRIDGE_X + s * 1.55 + 0.08, bz + 2.4, 0.8, 'wood');
  }
  // Reeds along the banks.
  for (let i = 0; i < 40; i++) {
    const x = rng.range(-HALF, HALF);
    if (Math.abs(x - BRIDGE_X) < 3) continue;
    const z = streamZ(x) + (rng.next() < 0.5 ? -1 : 1) * (STREAM_W / 2 + rng.range(0.1, 0.6));
    for (let k = 0; k < 3; k++) batch.box(0.05, rng.range(0.4, 0.8), 0.05, rng.pick([PAL.cactus, PAL.cactusDark, 0x9c8f4e]), x + rng.range(-0.2, 0.2), 0, z + rng.range(-0.2, 0.2));
  }

  // ---------------------------------------------------------------- containers
  const containers = new ContainerSet(4242);
  // In the barn.
  containers.add(cw, 'crate', 7.6, -17.6, 0, 0.85);
  containers.add(cw, 'crate', 8.6, -17.5, 0, 0.75);
  containers.add(cw, 'barrel', 9.8, -17.6, 0);
  containers.add(cw, 'chest', 16.4, -16, Math.PI / 2);
  containers.add(cw, 'ammoBox', 7.8, -11.4, 0);
  // At the house (on the porch and round the back).
  containers.add(cw, 'barrel', -18.6, -7.6, 0);
  containers.add(cw, 'crate', -9.4, -7.5, 0, 0.8);
  containers.add(cw, 'barrel', -20, -16.8, 0);
  for (const c of containers.items) group.add(c.object);

  // ---------------------------------------------------------------- exits & scenery
  const exitSigns = trailExits(batch, cw, exits, HALF, rng);
  const occupied = exitCorridors(exits, HALF);
  occupied.push({ x: 0, z: -6, r: 26 }, { x: 6, z: 14, r: 14 }, { x: -26, z: 0, r: 4 }, { x: 25, z: -2, r: 6 }, { x: -31, z: 13, r: 11 }, { x: -24, z: -12, r: 5 });
  const free = (x: number, z: number, r: number) => occupied.every((o) => Math.hypot(o.x - x, o.z - z) > o.r + r) && distToStream(x, z) > STREAM_W / 2 + 1 + r;
  for (let placed = 0, tries = 0; placed < 40 && tries < 2000; tries++) {
    const x = rng.range(-HALF + 2, HALF - 2);
    const z = rng.range(-HALF + 2, HALF - 2);
    if (!free(x, z, 0.8)) continue;
    occupied.push({ x, z, r: 0.8 });
    shrub(batch, x, z, rng);
    placed++;
  }
  for (let placed = 0, tries = 0; placed < 10 && tries < 1000; tries++) {
    const x = rng.range(-HALF + 2, HALF - 2);
    const z = rng.range(-HALF + 2, HALF - 2);
    if (!free(x, z, 1.8)) continue;
    occupied.push({ x, z, r: 1.8 });
    rock(batch, cw, x, z, rng);
    placed++;
  }
  mesas(batch, rng, HALF, exits);
  group.add(batch.build());

  const first = exits[0];
  return {
    group,
    collision: cw,
    occluders,
    cover: occluders,
    half: HALF,
    playerSpawn: first ? new THREE.Vector3(first.arrive[0], 0, first.arrive[1]) : new THREE.Vector3(0, 0, 0),
    horseSpawn: null,
    horseYaw: 0,
    containers: containers.items,
    floors: [house.floor!, theBarn.floor!, { minX: BRIDGE_X - 1.6, minZ: bz - 2.4, maxX: BRIDGE_X + 1.6, maxZ: bz + 2.4, surface: 'wood' }],
    exitSigns,
    update: spin,
  };
}

// ------------------------------------------------------------------------------------------------

/** Horses: four unsaddled ones grazing in the paddock, one saddled at the hitching rail. */
export const RANCH_HORSES: HorseState[] = [
  { pos: [0, 10], yaw: 0.4, saddled: false, pen: PADDOCK },
  { pos: [9, 13], yaw: 2.1, saddled: false, pen: PADDOCK },
  { pos: [13, 9], yaw: -1.2, saddled: false, pen: PADDOCK },
  { pos: [3, 18], yaw: 3.0, saddled: false, pen: PADDOCK },
  { pos: [-6, -2.9], yaw: Math.PI / 2 },
];

/**
 * The livestock: cows in the pasture, pigs in the pen, and the hens scratching about the yard
 * between the coop and the windmill. A few wild bison graze across the stream, south-west.
 */
export const RANCH_ANIMALS: AnimalSpawn[] = [
  { species: 'cow', at: [-34, 8], yaw: 0.6, pen: PASTURE },
  { species: 'cow', at: [-29, 12], yaw: 2.4, pen: PASTURE },
  { species: 'cow', at: [-34, 16], yaw: -1.1, pen: PASTURE },
  { species: 'cow', at: [-28, 19], yaw: 1.9, pen: PASTURE },
  { species: 'pig', at: [23.5, -2.5], yaw: 1.2, pen: CORRAL },
  { species: 'pig', at: [26.5, -0.5], yaw: -2.2, pen: CORRAL },
  { species: 'pig', at: [24.5, -3.6], yaw: 0.2, pen: CORRAL },
  ...([[-22.5, -10.5], [-23.5, -8], [-21, -7.5], [-25.5, -9], [-22, -5.5], [-24.5, -6]] as Vec2[]).map((at, i): AnimalSpawn => ({ species: 'chicken', at, yaw: i * 1.3, roam: 5 })),
  ...([[-27, 35], [-22, 36], [-17, 35]] as Vec2[]).map((at, i): AnimalSpawn => ({ species: 'bison', at, yaw: 1.4 + i, roam: 5 })),
];

const RANCH_HAT = { hat: 'cowboy_hat_brown', top: 'shirt_grey', legs: 'trousers_brown', boots: 'boots_brown' };

/** The people of Two Spurs Ranch. */
export const RANCH_NPCS: NpcDef[] = [
  {
    id: 'rancher',
    name: 'Abel Spurr',
    attitude: 'friendly',
    defendsOthers: true,
    appearance: {
      body: 'male',
      skin: PAL.skin,
      hair: PAL.cream,
      hairStyle: 'short',
      beard: PAL.cream,
      clothing: { hat: 'cowboy_hat_tan', top: 'shirt_cream', outerwear: 'vest_brown', legs: 'trousers_denim', boots: 'boots_brown', belt: 'belt_leather' },
    },
    weapon: 'rifle',
    spawn: [-14, -7.4],
    routine: { kind: 'idle', at: [-14, -7.4], facing: 0 },
    lines: {
      greet: ['Welcome to Two Spurs.', 'Best horses this side of the river.', "Mind the stream, it's deeper than it looks."],
    },
    hints: [
      { poi: 'rattlesnake-gulch', line: "Outlaws hold Rattlesnake Gulch now. The canyon trail east of here runs right into 'em." },
      { poi: 'desert-plains', line: "Out west past the house are the Desert Plains. Bison, wolves - and a grizzly. Keep low near the wolves." },
    ],
  },
  {
    // Minds the pigs (and keeps a revolver for whoever bothers them).
    id: 'ranch-hand-fence',
    attitude: 'friendly',
    defendsOthers: true,
    appearance: {
      body: 'male',
      skin: PAL.skinDark,
      hair: PAL.ink,
      hairStyle: 'short',
      clothing: { ...RANCH_HAT, neck: 'bandana_red', legs: 'chaps_wood' },
    },
    weapon: 'revolver',
    spawn: [24.5, 2.6],
    // Leaning back on the corral fence.
    routine: { kind: 'lean', at: [24.5, 2.6], facing: 0 },
    lines: { greet: ["Fine animals, ain't they?", 'Boss is up at the house.'] },
  },
  {
    id: 'ranch-hand-yard',
    attitude: 'friendly',
    defendsOthers: false,
    appearance: {
      body: 'female',
      skin: PAL.skin,
      hair: PAL.woodLight,
      hairStyle: 'long',
      clothing: { hat: 'cowboy_hat_dark', top: 'shirt_denim', legs: 'trousers_brown', boots: 'boots_black' },
    },
    weapon: null,
    spawn: [10, -6],
    routine: {
      kind: 'patrol',
      points: [
        [12, -7.2],
        [5, 4.5],
        [-22, 0],
        [-8, -5],
      ],
      pause: 3,
      inspect: 0.35,
    },
    lines: { greet: ['Morning! Plenty to do.', 'Watch your step by the troughs.'] },
  },
];
