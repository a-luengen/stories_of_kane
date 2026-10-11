import * as THREE from 'three';
import { CONFIG } from '../config';
import { StaticBatch } from '../render/StaticBatch';
import { fadeableToon, vertexToon } from '../render/materials';
import { PAL } from '../render/palette';
import { Rng, valueNoise2 } from '../util/math';
import { CollisionWorld } from './Colliders';
import type { TargetSystem } from '../entities/Targets';

export interface Occluder {
  mesh: THREE.Mesh;
  fade: { value: number };
  /** Footprint incl. porch, and height incl. false front. */
  minX: number;
  minZ: number;
  maxX: number;
  maxZ: number;
  height: number;
}

export interface WorldData {
  group: THREE.Group;
  collision: CollisionWorld;
  occluders: Occluder[];
  playerSpawn: THREE.Vector3;
  horseSpawn: THREE.Vector3;
  horseYaw: number;
}

const HALF = CONFIG.world.size / 2;

function shade(hex: number, f: number): number {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l * f)));
  return c.getHex();
}

/**
 * Builds the desert town: ground, buildings, props, targets and colliders.
 *
 * Layout respects the isometric camera (looking towards -X/-Z): building fronts face +Z or +X so
 * they face the viewer, and the camera side of the main street only has low props.
 */
export function buildWorld(targets: TargetSystem): WorldData {
  const rng = new Rng(CONFIG.world.seed);
  const group = new THREE.Group();
  const batch = new StaticBatch();
  const cw = new CollisionWorld(HALF);
  const occluders: Occluder[] = [];
  const occupied: { x: number; z: number; r: number }[] = [];
  const reserve = (x: number, z: number, r: number) => occupied.push({ x, z, r });
  const isFree = (x: number, z: number, r: number) => occupied.every((o) => Math.hypot(o.x - x, o.z - z) > o.r + r);

  group.add(buildGround());

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
  for (const [x, z] of barrels) barrel(batch, cw, x, z, rng);
  for (const [x, z] of [[-11.8, 6.8], [20.8, 6.0], [24.6, -6.0], [-17.0, 4.8], [-17.6, 12.4]] as const) crate(batch, cw, x, z, rng);
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

  mesas(batch, rng);

  group.add(batch.build());

  return {
    group,
    collision: cw,
    occluders,
    playerSpawn: new THREE.Vector3(-2, 0, 1.5),
    horseSpawn: new THREE.Vector3(-6.5, 0, 2.6),
    horseYaw: Math.PI / 2,
  };
}

// ------------------------------------------------------------------------------------------------

function buildGround(): THREE.Mesh {
  const size = 200;
  const seg = 200; // 1 unit tiles
  const geo = new THREE.PlaneGeometry(size, size, seg, seg).toNonIndexed();
  geo.rotateX(-Math.PI / 2);
  geo.deleteAttribute('uv');
  const pos = geo.getAttribute('position');
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  const rng = new Rng(99);
  for (let tri = 0; tri < pos.count / 3; tri++) {
    // Tile of this triangle (two triangles per tile share colour).
    let cx = 0;
    let cz = 0;
    for (let k = 0; k < 3; k++) {
      cx += pos.getX(tri * 3 + k);
      cz += pos.getZ(tri * 3 + k);
    }
    const tx = Math.floor(cx / 3);
    const tz = Math.floor(cz / 3);
    c.setHex(groundColor(tx + 0.5, tz + 0.5, rng, tri % 2 === 0));
    for (let k = 0; k < 3; k++) colors.set([c.r, c.g, c.b], (tri * 3 + k) * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, vertexToon());
  mesh.receiveShadow = true;
  return mesh;
}

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

function building(
  cw: CollisionWorld,
  x: number,
  z: number,
  yaw: number,
  w: number,
  d: number,
  h: number,
  wall: number,
  sign: number,
  rng: Rng,
): Occluder {
  const batch = new StaticBatch();
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(x, 0, z),
    new THREE.Quaternion().setFromAxisAngle(THREE.Object3D.DEFAULT_UP, yaw),
    new THREE.Vector3(1, 1, 1),
  );
  const B = (bw: number, bh: number, bd: number, col: number, lx: number, ly: number, lz: number) =>
    batch.box(bw, bh, bd, col, lx, ly, lz, 0, m);
  const trim = shade(wall, 0.72);
  const roof = rng.pick([PAL.darkBrown, PAL.brown, PAL.rust]);
  const facadeH = 1.1 + rng.range(0, 0.7);

  B(w, h, d, wall, 0, 0, 0);
  for (let y = 0.55; y < h - 0.2; y += 0.55) B(w + 0.04, 0.08, d + 0.04, trim, 0, y, 0); // plank seams
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(0.2, h, 0.2, trim, (sx * w) / 2, 0, (sz * d) / 2);
  B(w + 0.4, 0.22, d + 0.4, roof, 0, h, 0);

  // False front with cornice and sign.
  B(w + 0.24, facadeH, 0.2, wall, 0, h, d / 2 - 0.02);
  B(w + 0.5, 0.16, 0.34, trim, 0, h + facadeH, d / 2 - 0.02);
  B(w * 0.62, 0.62, 0.08, sign, 0, h + facadeH * 0.18, d / 2 + 0.12);
  const letters = Math.floor(w * 0.9);
  for (let i = 0; i < letters; i++) {
    const lx = (i - (letters - 1) / 2) * 0.5;
    if (rng.next() < 0.85) B(0.3, 0.3, 0.04, sign === PAL.cream ? PAL.ink : PAL.cream, lx, h + facadeH * 0.18 + 0.16, d / 2 + 0.17);
  }

  // Door and windows.
  B(1.1, 2.0, 0.08, trim, 0, 0, d / 2 + 0.02);
  B(0.9, 1.85, 0.1, PAL.darkBrown, 0, 0, d / 2 + 0.04);
  for (const sx of [-1, 1]) {
    const wx = sx * Math.min(w / 2 - 1.1, 2.0);
    B(1.0, 0.95, 0.08, trim, wx, 0.95, d / 2 + 0.02);
    B(0.8, 0.75, 0.1, PAL.skyDeep, wx, 1.05, d / 2 + 0.04);
    B(0.06, 0.75, 0.12, trim, wx, 1.05, d / 2 + 0.05);
    if (h > 4.6) {
      B(0.9, 0.9, 0.08, trim, wx, 3.3, d / 2 + 0.02);
      B(0.7, 0.7, 0.1, PAL.ink, wx, 3.4, d / 2 + 0.04);
    }
  }
  // Side windows.
  for (const sx of [-1, 1]) {
    B(0.08, 0.8, 1.0, trim, (sx * w) / 2 + sx * 0.02, 1.0, 0);
    B(0.1, 0.6, 0.8, PAL.skyDeep, (sx * w) / 2 + sx * 0.04, 1.1, 0);
  }

  // Porch with awning.
  const pd = 1.9;
  B(w + 0.3, 0.2, pd, PAL.wood, 0, 0, d / 2 + pd / 2);
  for (let i = 0; i < 3; i++) {
    const px = ((i - 1) * (w + 0.1)) / 2;
    B(0.16, 2.6, 0.16, trim, px, 0.2, d / 2 + pd - 0.12);
  }
  B(w + 0.5, 0.12, pd + 0.3, roof, 0, 2.75, d / 2 + pd / 2 + 0.05);

  // Collider: body only (porch is walkable). Rotate the footprint.
  const ex = Math.abs(Math.cos(yaw)) > 0.5 ? w / 2 : d / 2;
  const ez = Math.abs(Math.cos(yaw)) > 0.5 ? d / 2 : w / 2;
  cw.addBox(x - ex, z - ez, x + ex, z + ez, h + facadeH, 'wood');
  // Porch posts.
  for (let i = 0; i < 3; i++) {
    const px = ((i - 1) * (w + 0.1)) / 2;
    const p = new THREE.Vector3(px, 0, d / 2 + pd - 0.12).applyMatrix4(m);
    cw.addCircle(p.x, p.z, 0.12, 2.8, 'wood');
  }

  const mat = fadeableToon();
  const mesh = batch.build(mat);
  const bb = new THREE.Box3().setFromObject(mesh);
  return { mesh, fade: mat.userData.uFade, minX: bb.min.x, minZ: bb.min.z, maxX: bb.max.x, maxZ: bb.max.z, height: bb.max.y };
}

/** Fence between two axis-aligned points; returns post-top positions (for bottles). */
function fence(batch: StaticBatch, cw: CollisionWorld, x0: number, z0: number, x1: number, z1: number): THREE.Vector3[] {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const n = Math.max(1, Math.round(len / 2));
  const tops: THREE.Vector3[] = [];
  const along = Math.abs(x1 - x0) > Math.abs(z1 - z0);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = x0 + (x1 - x0) * t;
    const z = z0 + (z1 - z0) * t;
    batch.box(0.2, 1.05, 0.2, PAL.wood, x, 0, z);
    batch.box(0.26, 0.06, 0.26, PAL.darkBrown, x, 1.05, z);
    tops.push(new THREE.Vector3(x, 1.11, z));
  }
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const ry = along ? 0 : Math.PI / 2;
  batch.box(len, 0.12, 0.08, PAL.woodLight, cx, 0.42, cz, ry);
  batch.box(len, 0.12, 0.08, PAL.woodLight, cx, 0.8, cz, ry);
  const t = 0.12;
  cw.addBox(Math.min(x0, x1) - t, Math.min(z0, z1) - t, Math.max(x0, x1) + t, Math.max(z0, z1) + t, 1.05, 'wood');
  return tops;
}

function barrel(batch: StaticBatch, cw: CollisionWorld, x: number, z: number, rng: Rng): void {
  const col = rng.pick([PAL.wood, PAL.woodLight, PAL.rust]);
  batch.put(new THREE.CylinderGeometry(0.36, 0.36, 1.0, 8), col, x, 0.5, z);
  batch.put(new THREE.CylinderGeometry(0.39, 0.39, 0.08, 8), PAL.metal, x, 0.22, z);
  batch.put(new THREE.CylinderGeometry(0.39, 0.39, 0.08, 8), PAL.metal, x, 0.78, z);
  batch.put(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 8), shade(col, 0.7), x, 1.01, z);
  cw.addCircle(x, z, 0.4, 1.0, 'wood');
}

function crate(batch: StaticBatch, cw: CollisionWorld, x: number, z: number, rng: Rng): void {
  const s = rng.range(0.7, 0.9);
  batch.box(s, s, s, PAL.woodPale, x, 0, z);
  batch.box(s + 0.04, 0.1, s + 0.04, PAL.wood, x, s * 0.45, z);
  cw.addBox(x - s / 2, z - s / 2, x + s / 2, z + s / 2, s, 'wood');
}

function trough(batch: StaticBatch, cw: CollisionWorld, x: number, z: number): void {
  batch.box(2.2, 0.6, 0.8, PAL.wood, x, 0, z);
  batch.box(2.0, 0.05, 0.6, PAL.skyDeep, x, 0.56, z);
  cw.addBox(x - 1.1, z - 0.4, x + 1.1, z + 0.4, 0.6, 'wood');
}

function hitchingRail(batch: StaticBatch, cw: CollisionWorld, x: number, z: number): void {
  for (const s of [-1, 1]) {
    batch.box(0.16, 1.0, 0.16, PAL.wood, x + s * 1.2, 0, z);
    cw.addCircle(x + s * 1.2, z, 0.12, 1.0, 'wood');
  }
  batch.box(2.7, 0.12, 0.12, PAL.woodLight, x, 0.9, z);
}

function well(batch: StaticBatch, cw: CollisionWorld, x: number, z: number): void {
  batch.put(new THREE.CylinderGeometry(0.85, 0.9, 0.8, 8), PAL.rock, x, 0.4, z);
  batch.put(new THREE.CylinderGeometry(0.62, 0.62, 0.05, 8), PAL.ink, x, 0.81, z);
  for (const s of [-1, 1]) batch.box(0.14, 1.9, 0.14, PAL.wood, x + s * 0.7, 0.4, z);
  batch.box(1.7, 0.12, 0.12, PAL.woodLight, x, 2.0, z);
  batch.put(new THREE.ConeGeometry(1.2, 0.6, 4), PAL.rust, x, 2.5, z, 0, Math.PI / 4, 0);
  cw.addCircle(x, z, 0.92, 1.0, 'rock');
}

function waterTower(batch: StaticBatch, cw: CollisionWorld, x: number, z: number): void {
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      batch.box(0.22, 4.2, 0.22, PAL.wood, x + sx * 1.3, 0, z + sz * 1.3);
      cw.addCircle(x + sx * 1.3, z + sz * 1.3, 0.16, 4.2, 'wood');
    }
  }
  batch.box(2.9, 0.12, 0.12, PAL.woodLight, x, 2.0, z + 1.3);
  batch.box(2.9, 0.12, 0.12, PAL.woodLight, x, 2.0, z - 1.3);
  batch.box(0.12, 0.12, 2.9, PAL.woodLight, x + 1.3, 2.0, z);
  batch.box(0.12, 0.12, 2.9, PAL.woodLight, x - 1.3, 2.0, z);
  batch.put(new THREE.CylinderGeometry(1.7, 1.7, 2.2, 10), PAL.woodLight, x, 5.3, z);
  batch.put(new THREE.CylinderGeometry(1.75, 1.75, 0.12, 10), PAL.metal, x, 4.7, z);
  batch.put(new THREE.CylinderGeometry(1.75, 1.75, 0.12, 10), PAL.metal, x, 5.8, z);
  batch.put(new THREE.ConeGeometry(1.95, 1.0, 10), PAL.rust, x, 6.9, z);
}

function cactus(batch: StaticBatch, cw: CollisionWorld, x: number, z: number, rng: Rng): void {
  const kind = rng.next();
  if (kind < 0.6) {
    // Saguaro.
    const h = rng.range(1.8, 3.0);
    const col = rng.pick([PAL.cactus, PAL.cactusDark]);
    batch.put(new THREE.CylinderGeometry(0.22, 0.27, h, 6), col, x, h / 2, z);
    batch.put(new THREE.ConeGeometry(0.22, 0.25, 6), col, x, h + 0.12, z);
    const arms = rng.int(1, 3);
    for (let i = 0; i < arms; i++) {
      const a = rng.range(0, Math.PI * 2);
      const ay = rng.range(0.8, h * 0.65);
      const reach = 0.5;
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      batch.put(new THREE.CylinderGeometry(0.13, 0.13, reach, 6), col, x + dx * (reach / 2 + 0.1), ay, z + dz * (reach / 2 + 0.1), 0, a, Math.PI / 2);
      const up = rng.range(0.5, 0.9);
      batch.put(new THREE.CylinderGeometry(0.13, 0.14, up, 6), col, x + dx * (reach + 0.12), ay + up / 2 - 0.06, z + dz * (reach + 0.12));
      batch.put(new THREE.ConeGeometry(0.13, 0.14, 6), col, x + dx * (reach + 0.12), ay + up + 0.0, z + dz * (reach + 0.12));
    }
    cw.addCircle(x, z, 0.3, h, 'cactus');
  } else if (kind < 0.8) {
    // Barrel cactus cluster.
    for (let i = 0; i < 3; i++) {
      const r = rng.range(0.2, 0.32);
      const ox = rng.range(-0.35, 0.35);
      const oz = rng.range(-0.35, 0.35);
      batch.put(new THREE.CylinderGeometry(r * 0.8, r, r * 1.6, 7), PAL.cactusLight, x + ox, r * 0.8, z + oz);
      batch.put(new THREE.ConeGeometry(r * 0.5, 0.1, 5), PAL.red, x + ox, r * 1.6 + 0.04, z + oz);
    }
    cw.addCircle(x, z, 0.5, 0.6, 'cactus');
  } else {
    // Prickly pear: flattened pads.
    for (let i = 0; i < 5; i++) {
      const s = rng.range(0.25, 0.38);
      batch.put(new THREE.CylinderGeometry(s, s, 0.1, 7), PAL.cactus, x + rng.range(-0.3, 0.3), 0.25 + i * 0.16, z + rng.range(-0.3, 0.3), Math.PI / 2, rng.range(0, Math.PI), rng.range(-0.4, 0.4));
    }
    cw.addCircle(x, z, 0.45, 1.0, 'cactus');
  }
}

function rock(batch: StaticBatch, cw: CollisionWorld, x: number, z: number, rng: Rng): void {
  const s = rng.range(0.4, 1.3);
  const col = rng.pick([PAL.rock, PAL.rockLight, PAL.sandDark, PAL.rockDark]);
  batch.put(new THREE.DodecahedronGeometry(1, 0), col, x, s * 0.35, z, rng.range(0, 3), rng.range(0, 3), rng.range(0, 3), s * rng.range(0.9, 1.3), s * 0.75, s * rng.range(0.9, 1.3));
  if (rng.next() < 0.5) {
    const s2 = s * 0.5;
    batch.put(new THREE.DodecahedronGeometry(1, 0), shade(col, 1.1), x + s * 0.9, s2 * 0.3, z + s * 0.4, rng.range(0, 3), rng.range(0, 3), 0, s2, s2 * 0.7, s2);
  }
  cw.addCircle(x, z, s * 1.05, s * 0.9, 'rock');
}

function shrub(batch: StaticBatch, x: number, z: number, rng: Rng): void {
  const col = rng.pick([PAL.cactusLight, PAL.sandDark, PAL.woodPale]);
  for (let i = 0; i < 3; i++) {
    const s = rng.range(0.15, 0.3);
    batch.put(new THREE.IcosahedronGeometry(s, 0), col, x + rng.range(-0.3, 0.3), s * 0.6, z + rng.range(-0.3, 0.3));
  }
}

/** Sandstone mesas framing the playable area (visual only; bounds are enforced separately). */
function mesas(batch: StaticBatch, rng: Rng): void {
  const ring: [number, number][] = [];
  for (let t = -HALF - 6; t <= HALF + 6; t += 5) {
    ring.push([t, -HALF - 5], [t, HALF + 5], [-HALF - 5, t], [HALF + 5, t]);
  }
  for (const [x, z] of ring) {
    const jx = x + rng.range(-2, 2);
    const jz = z + rng.range(-2, 2);
    const w = rng.range(4, 7);
    const d = rng.range(4, 7);
    const h = rng.range(2.5, 6);
    const bands = [PAL.rustLight, PAL.orange, PAL.rust, PAL.sandDark];
    let y = 0;
    let layer = 0;
    while (y < h) {
      const lh = rng.range(0.6, 1.4);
      const shrink = 1 - (y / h) * 0.25;
      batch.box(w * shrink, lh, d * shrink, bands[layer % bands.length], jx, y, jz, rng.range(-0.1, 0.1));
      y += lh;
      layer++;
    }
  }
}
