import * as THREE from 'three';
import { StaticBatch } from '../render/StaticBatch';
import { fadeableToon, vertexToon } from '../render/materials';
import { PAL } from '../render/palette';
import { Rng } from '../util/math';
import type { CollisionWorld } from './Colliders';
import type { LootContainer } from './Container';
import type { ExitDef } from '../data/world';

/** Shared map-building blocks: ground, buildings and props (with their colliders). */

export interface Occluder {
  mesh: THREE.Mesh;
  fade: { value: number };
  /** Footprint incl. porch, and height incl. false front. */
  minX: number;
  minZ: number;
  maxX: number;
  maxZ: number;
  height: number;
  /** The building's walkable porch (wooden floor). */
  floor?: Floor;
}

/** A walkable area with its own footstep surface (porches, boardwalks). */
export interface Floor {
  minX: number;
  minZ: number;
  maxX: number;
  maxZ: number;
  surface: 'wood';
}


/** Everything a map hands to a game session. */
export interface WorldData {
  group: THREE.Group;
  collision: CollisionWorld;
  occluders: Occluder[];
  /** Solid footprints NPCs can take cover behind. */
  cover: { minX: number; minZ: number; maxX: number; maxZ: number }[];
  /** Half-size of the walkable square (nav grid extent). */
  half: number;
  playerSpawn: THREE.Vector3;
  /** Player horse start (null: no horse at the start). */
  horseSpawn: THREE.Vector3 | null;
  horseYaw: number;
  /** Lootable barrels, crates, chests, ammo boxes and weapon crates. */
  containers: LootContainer[];
  /** Wooden floors (footsteps); everywhere else is dirt. */
  floors: Floor[];
  /** Trail signs at the map's exits (where their labels float). */
  exitSigns: ExitSign[];
  /** Animated scenery (a windmill's sails), called every rendered frame. */
  update?: (dt: number) => void;
}

/** A trail sign at an exit zone. */
export interface ExitSign {
  exit: string;
  pos: THREE.Vector3;
}

export function shade(hex: number, f: number): number {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l * f)));
  return c.getHex();
}

/** 200×200 ground of 1-unit tiles coloured per tile (two triangles share a colour). */
export function buildGround(groundColor: (x: number, z: number, rng: Rng, first: boolean) => number): THREE.Mesh {
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

export function building(
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

  // The porch floor, in world space (yaw is a multiple of 90°).
  const corners = [
    [-(w + 0.3) / 2, d / 2],
    [(w + 0.3) / 2, d / 2 + pd],
  ].map(([lx, lz]) => new THREE.Vector3(lx, 0, lz).applyMatrix4(m));
  const floor: Floor = {
    minX: Math.min(corners[0].x, corners[1].x),
    minZ: Math.min(corners[0].z, corners[1].z),
    maxX: Math.max(corners[0].x, corners[1].x),
    maxZ: Math.max(corners[0].z, corners[1].z),
    surface: 'wood',
  };

  const mat = fadeableToon();
  const mesh = batch.build(mat);
  const bb = new THREE.Box3().setFromObject(mesh);
  return { mesh, fade: mat.userData.uFade, minX: bb.min.x, minZ: bb.min.z, maxX: bb.max.x, maxZ: bb.max.z, height: bb.max.y, floor };
}

/** Fence between two axis-aligned points; returns post-top positions (for bottles). */
export function fence(batch: StaticBatch, cw: CollisionWorld, x0: number, z0: number, x1: number, z1: number): THREE.Vector3[] {
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

export function barrel(batch: StaticBatch, cw: CollisionWorld, x: number, z: number, rng: Rng): void {
  const col = rng.pick([PAL.wood, PAL.woodLight, PAL.rust]);
  batch.put(new THREE.CylinderGeometry(0.36, 0.36, 1.0, 8), col, x, 0.5, z);
  batch.put(new THREE.CylinderGeometry(0.39, 0.39, 0.08, 8), PAL.metal, x, 0.22, z);
  batch.put(new THREE.CylinderGeometry(0.39, 0.39, 0.08, 8), PAL.metal, x, 0.78, z);
  batch.put(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 8), shade(col, 0.7), x, 1.01, z);
  cw.addCircle(x, z, 0.4, 1.0, 'wood');
}

export function crate(batch: StaticBatch, cw: CollisionWorld, x: number, z: number, rng: Rng): void {
  const s = rng.range(0.7, 0.9);
  batch.box(s, s, s, PAL.woodPale, x, 0, z);
  batch.box(s + 0.04, 0.1, s + 0.04, PAL.wood, x, s * 0.45, z);
  cw.addBox(x - s / 2, z - s / 2, x + s / 2, z + s / 2, s, 'wood');
}

export function trough(batch: StaticBatch, cw: CollisionWorld, x: number, z: number): void {
  batch.box(2.2, 0.6, 0.8, PAL.wood, x, 0, z);
  batch.box(2.0, 0.05, 0.6, PAL.skyDeep, x, 0.56, z);
  cw.addBox(x - 1.1, z - 0.4, x + 1.1, z + 0.4, 0.6, 'wood');
}

export function hitchingRail(batch: StaticBatch, cw: CollisionWorld, x: number, z: number): void {
  for (const s of [-1, 1]) {
    batch.box(0.16, 1.0, 0.16, PAL.wood, x + s * 1.2, 0, z);
    cw.addCircle(x + s * 1.2, z, 0.12, 1.0, 'wood');
  }
  batch.box(2.7, 0.12, 0.12, PAL.woodLight, x, 0.9, z);
}

export function well(batch: StaticBatch, cw: CollisionWorld, x: number, z: number): void {
  batch.put(new THREE.CylinderGeometry(0.85, 0.9, 0.8, 8), PAL.rock, x, 0.4, z);
  batch.put(new THREE.CylinderGeometry(0.62, 0.62, 0.05, 8), PAL.ink, x, 0.81, z);
  for (const s of [-1, 1]) batch.box(0.14, 1.9, 0.14, PAL.wood, x + s * 0.7, 0.4, z);
  batch.box(1.7, 0.12, 0.12, PAL.woodLight, x, 2.0, z);
  batch.put(new THREE.ConeGeometry(1.2, 0.6, 4), PAL.rust, x, 2.5, z, 0, Math.PI / 4, 0);
  cw.addCircle(x, z, 0.92, 0.82, 'rock'); // the stone wall of the well
}

export function waterTower(batch: StaticBatch, cw: CollisionWorld, x: number, z: number): void {
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

export function cactus(batch: StaticBatch, cw: CollisionWorld, x: number, z: number, rng: Rng): void {
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

export function rock(batch: StaticBatch, cw: CollisionWorld, x: number, z: number, rng: Rng): void {
  const s = rng.range(0.4, 1.3);
  const col = rng.pick([PAL.rock, PAL.rockLight, PAL.sandDark, PAL.rockDark]);
  batch.put(new THREE.DodecahedronGeometry(1, 0), col, x, s * 0.35, z, rng.range(0, 3), rng.range(0, 3), rng.range(0, 3), s * rng.range(0.9, 1.3), s * 0.75, s * rng.range(0.9, 1.3));
  if (rng.next() < 0.5) {
    const s2 = s * 0.5;
    batch.put(new THREE.DodecahedronGeometry(1, 0), shade(col, 1.1), x + s * 0.9, s2 * 0.3, z + s * 0.4, rng.range(0, 3), rng.range(0, 3), 0, s2, s2 * 0.7, s2);
  }
  cw.addCircle(x, z, s * 1.05, s * 1.1, 'rock'); // cover up to the visible top of the stone
}

export function shrub(batch: StaticBatch, x: number, z: number, rng: Rng): void {
  const col = rng.pick([PAL.cactusLight, PAL.sandDark, PAL.woodPale]);
  for (let i = 0; i < 3; i++) {
    const s = rng.range(0.15, 0.3);
    batch.put(new THREE.IcosahedronGeometry(s, 0), col, x + rng.range(-0.3, 0.3), s * 0.6, z + rng.range(-0.3, 0.3));
  }
}

/** Sandstone mesas framing the playable area (visual only; bounds are enforced separately). */
/** Mesas around the map's edge, leaving gaps where trails lead out (`exits`). */
export function mesas(batch: StaticBatch, rng: Rng, HALF: number, exits: readonly ExitDef[] = []): void {
  const ring: [number, number][] = [];
  for (let t = -HALF - 6; t <= HALF + 6; t += 5) {
    ring.push([t, -HALF - 5], [t, HALF + 5], [-HALF - 5, t], [HALF + 5, t]);
  }
  // Where each trail meets the ring.
  const gaps = exits.map((e) => {
    const [dx, dz] = exitDirection(e);
    const t = Math.min(Math.abs(dx) > 1e-6 ? (HALF + 5 - Math.sign(dx) * e.arrive[0]) / Math.abs(dx) : Infinity, Math.abs(dz) > 1e-6 ? (HALF + 5 - Math.sign(dz) * e.arrive[1]) / Math.abs(dz) : Infinity);
    return [e.arrive[0] + dx * t, e.arrive[1] + dz * t];
  });
  for (const [x, z] of ring) {
    const open = gaps.some(([gx, gz]) => Math.hypot(gx - x, gz - z) < 8);
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
      const tilt = rng.range(-0.1, 0.1); // (drawn either way, so the map's random sequence stays the same)
      if (!open) batch.box(w * shrink, lh, d * shrink, bands[layer % bands.length], jx, y, jz, tilt);
      y += lh;
      layer++;
    }
  }
}

// ------------------------------------------------------------------------------------------------
// Outpost / menu props.

/** Batch helpers in a local frame (position + yaw + optional tilt). */
function local(batch: StaticBatch, x: number, z: number, yaw: number, tiltX = 0, tiltZ = 0, lift = 0) {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(x, lift, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(tiltX, yaw, tiltZ, 'YXZ')),
    new THREE.Vector3(1, 1, 1),
  );
  const box = (w: number, h: number, d: number, col: number, lx: number, ly: number, lz: number, ry = 0) => batch.box(w, h, d, col, lx, ly, lz, ry, m);
  const put = (geo: THREE.BufferGeometry, col: number, lx: number, ly: number, lz: number, rx = 0, ry = 0, rz = 0) => {
    const g = geo.clone();
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(lx, ly, lz), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(1, 1, 1)));
    g.applyMatrix4(m);
    geo.dispose();
    batch.add(g, col, new THREE.Matrix4());
  };
  return { box, put, m };
}

/** Circles along a segment (colliders for rotated, elongated props). */
function capsuleColliders(cw: CollisionWorld, x: number, z: number, yaw: number, halfLen: number, r: number, h: number, surface: 'wood' | 'rock'): void {
  const n = Math.max(1, Math.round((halfLen * 2) / (r * 1.4)));
  for (let i = 0; i <= n; i++) {
    const t = -halfLen + (i / n) * halfLen * 2;
    cw.addCircle(x + Math.sin(yaw) * t, z + Math.cos(yaw) * t, r, h, surface);
  }
}

/** Freight wagon: intact, broken (tilted, a wheel off) or covered (canvas bonnet, the merchant's). */
export function wagon(batch: StaticBatch, cw: CollisionWorld, x: number, z: number, yaw: number, kind: 'intact' | 'broken' | 'covered'): void {
  const broken = kind === 'broken';
  const { box, put } = local(batch, x, z, yaw, broken ? 0.05 : 0, broken ? 0.16 : 0, broken ? -0.12 : 0);
  // Bed and side boards.
  box(1.5, 0.12, 3.0, PAL.wood, 0, 0.62, 0);
  for (const s of [-1, 1]) box(0.08, 0.42, 3.0, PAL.woodLight, s * 0.72, 0.74, 0);
  box(1.5, 0.42, 0.08, PAL.woodLight, 0, 0.74, -1.48);
  if (!broken) box(1.5, 0.42, 0.08, PAL.woodLight, 0, 0.74, 1.48);
  box(0.12, 0.1, 1.6, PAL.wood, 0, 0.45, 2.2); // tongue
  const wheel = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 10);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    if (broken && sx === 1 && sz === 1) continue;
    put(wheel.clone(), PAL.darkBrown, sx * 0.86, 0.5, sz * 1.0, 0, 0, Math.PI / 2);
    put(new THREE.CylinderGeometry(0.12, 0.12, 0.14, 6), PAL.metal, sx * 0.86, 0.5, sz * 1.0, 0, 0, Math.PI / 2);
  }
  wheel.dispose();
  if (broken) {
    // The lost wheel lies in the dirt beside it.
    batch.put(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 10), PAL.darkBrown, x + Math.cos(yaw) * 1.6, 0.06, z - Math.sin(yaw) * 1.6, 0, 0, 0);
  }
  if (kind === 'covered') {
    // Canvas bonnet over hoops.
    put(new THREE.CylinderGeometry(0.8, 0.8, 2.7, 10, 1, true, -Math.PI / 2, Math.PI), PAL.cream, 0, 1.0, 0, Math.PI / 2, 0, 0);
    for (const t of [-1.3, 0, 1.3]) put(new THREE.TorusGeometry(0.81, 0.04, 4, 10, Math.PI), PAL.wood, 0, 1.0, t);
    box(1.4, 0.06, 0.06, PAL.wood, 0, 1.0, 1.36);
  }
  // Cover up to the side boards (lower when wrecked), or the top of the canvas.
  capsuleColliders(cw, x, z, yaw, 1.2, 0.8, kind === 'covered' ? 1.8 : kind === 'broken' ? 1.0 : 1.15, 'wood');
}

/** A low wall of sandbags (cover), axis-aligned along X (`alongX`) or Z. */
export function sandbags(batch: StaticBatch, cw: CollisionWorld, x: number, z: number, len: number, alongX: boolean, rng: Rng): void {
  const rows = 3;
  const bag = 0.62;
  const n = Math.max(1, Math.round(len / bag));
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * bag * 0.5;
    for (let i = 0; i < n - (r % 2); i++) {
      const t = -len / 2 + bag / 2 + offset + i * bag;
      const col = rng.pick([PAL.sand, PAL.sandLight, PAL.sandDark]);
      const bx = alongX ? x + t : x;
      const bz = alongX ? z : z + t;
      batch.put(new THREE.BoxGeometry(bag * 0.96, 0.24, 0.42), col, bx, 0.12 + r * 0.23, bz, 0, alongX ? 0 : Math.PI / 2, 0, 1, 1, 1);
    }
  }
  const hx = alongX ? len / 2 : 0.24;
  const hz = alongX ? 0.24 : len / 2;
  cw.addBox(x - hx, z - hz, x + hx, z + hz, rows * 0.23 + 0.05, 'dirt');
}

/** Roofless ruin: broken plank walls of uneven height with a doorway, a few fallen boards. */
export function ruin(batch: StaticBatch, cw: CollisionWorld, x: number, z: number, w: number, d: number, rng: Rng): void {
  const wall = PAL.woodLight;
  const t = 0.18;
  batch.box(w, 0.08, d, PAL.wood, x, 0, z); // floor
  const segments: [number, number, number, number][] = [
    [x - w / 2, z - d / 2, x + w / 2, z - d / 2], // back
    [x - w / 2, z - d / 2, x - w / 2, z + d / 2], // left
    [x + w / 2, z - d / 2, x + w / 2, z + d / 2], // right
    [x - w / 2, z + d / 2, x - 0.8, z + d / 2], // front, left of the doorway
    [x + 0.8, z + d / 2, x + w / 2, z + d / 2], // front, right of it
  ];
  for (const [x0, z0, x1, z1] of segments) {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const along = Math.abs(x1 - x0) > Math.abs(z1 - z0);
    // Uneven, partly collapsed: a few chunks of different heights, some gaps.
    const chunks = Math.max(1, Math.round(len / 1.2));
    for (let i = 0; i < chunks; i++) {
      if (rng.next() < 0.18) continue;
      const a = i / chunks;
      const b = (i + 1) / chunks;
      const cx = x0 + (x1 - x0) * (a + b) / 2;
      const cz = z0 + (z1 - z0) * (a + b) / 2;
      const cl = len / chunks;
      const h = rng.range(0.9, 2.6);
      batch.box(along ? cl : t, h, along ? t : cl, rng.next() < 0.3 ? shade(wall, 0.85) : wall, cx, 0, cz);
      const hx = along ? cl / 2 : t / 2;
      const hz = along ? t / 2 : cl / 2;
      cw.addBox(cx - hx, cz - hz, cx + hx, cz + hz, h, 'wood');
    }
    for (const [px, pz] of [[x0, z0], [x1, z1]]) batch.box(0.22, 2.7, 0.22, PAL.wood, px, 0, pz);
  }
  // Fallen boards.
  for (let i = 0; i < 3; i++) {
    batch.put(new THREE.BoxGeometry(1.6, 0.06, 0.22), wall, x + rng.range(-w / 3, w / 3), 0.12, z + rng.range(-d / 3, d / 3), 0, rng.range(0, Math.PI), rng.range(-0.15, 0.15));
  }
}

/**
 * Canyon wall along an axis-aligned segment: stacked sandstone bands. `height` is the typical
 * height (keep it low on the camera side, +X / +Z, so it never hides the player).
 */
export function cliff(batch: StaticBatch, cw: CollisionWorld, x0: number, z0: number, x1: number, z1: number, height: number, rng: Rng): void {
  const along = Math.abs(x1 - x0) > Math.abs(z1 - z0);
  const len = along ? Math.abs(x1 - x0) : Math.abs(z1 - z0);
  const n = Math.max(1, Math.round(len / 2.5));
  const bands = [PAL.rustLight, PAL.orange, PAL.rust, PAL.sandDark, PAL.rockLight];
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const cx = x0 + (x1 - x0) * t + (along ? 0 : rng.range(-0.4, 0.4));
    const cz = z0 + (z1 - z0) * t + (along ? rng.range(-0.4, 0.4) : 0);
    const w = len / n + rng.range(0.4, 1.4);
    const dep = rng.range(2.2, 3.4);
    const h = height * rng.range(0.75, 1.25);
    let y = 0;
    let layer = rng.int(0, bands.length);
    while (y < h) {
      const lh = Math.min(h - y, rng.range(0.5, 1.2));
      const shrink = 1 - (y / Math.max(h, 1)) * 0.2;
      batch.box((along ? w : dep) * shrink, lh, (along ? dep : w) * shrink, bands[layer % bands.length], cx, y, cz, rng.range(-0.05, 0.05));
      y += lh;
      layer++;
    }
  }
  const half = 1.2;
  cw.addBox(Math.min(x0, x1) - (along ? 0 : half), Math.min(z0, z1) - (along ? half : 0), Math.max(x0, x1) + (along ? 0 : half), Math.max(z0, z1) + (along ? half : 0), height, 'rock');
}

// ------------------------------------------------------------------------------------------------

/** Unit direction from an exit's arrival spot out through its zone (towards the map edge). */
export function exitDirection(e: ExitDef): [number, number] {
  const dx = e.at[0] - e.arrive[0];
  const dz = e.at[1] - e.arrive[1];
  const l = Math.hypot(dx, dz) || 1;
  return [dx / l, dz / l];
}

/** Points along each exit's trail, so map builders can keep scenery off it. */
export function exitCorridors(exits: readonly ExitDef[], half: number): { x: number; z: number; r: number }[] {
  const out: { x: number; z: number; r: number }[] = [];
  for (const e of exits) {
    const [dx, dz] = exitDirection(e);
    for (let t = -6; t < half * 2; t += 2) {
      const x = e.arrive[0] + dx * t;
      const z = e.arrive[1] + dz * t;
      if (Math.abs(x) > half + 2 || Math.abs(z) > half + 2) break;
      out.push({ x, z, r: 3 });
    }
  }
  return out;
}

/**
 * The way out at each exit: a worn trail from the arrival spot to the map edge, a few stones
 * marking the zone, and a signpost beside it (its label is drawn by the HUD).
 */
export function trailExits(batch: StaticBatch, cw: CollisionWorld, exits: readonly ExitDef[], half: number, rng: Rng): ExitSign[] {
  const signs: ExitSign[] = [];
  for (const e of exits) {
    const [dx, dz] = exitDirection(e);
    const yaw = Math.atan2(dx, dz);
    // Worn trail: overlapping flat patches of packed, darker dirt with two wheel ruts.
    for (let t = -5; ; t += 1.4) {
      const x = e.arrive[0] + dx * t;
      const z = e.arrive[1] + dz * t;
      if (Math.abs(x) > half + 4 || Math.abs(z) > half + 4) break;
      batch.box(2.4 + rng.range(-0.3, 0.3), 0.012, 1.6, 0xa07a4c, x + rng.range(-0.15, 0.15), 0.004, z + rng.range(-0.15, 0.15), yaw + rng.range(-0.1, 0.1));
      for (const s of [-0.55, 0.55]) batch.box(0.22, 0.016, 1.5, 0x8e6c46, x + dz * s, 0.006, z - dx * s, yaw);
    }
    // Stones at the zone's corners.
    const [hx, hz] = e.half;
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      batch.box(0.26, 0.12, 0.22, PAL.rockDark, e.at[0] + sx * hx, 0, e.at[1] + sz * hz, rng.range(0, 3));
    }
    // Signpost beside the zone, the board's arrow pointing out along the trail.
    const side = Math.abs(dx) > Math.abs(dz) ? hz : hx;
    const px = e.at[0] - dx * 1.2 + dz * (side + 0.9);
    const pz = e.at[1] - dz * 1.2 - dx * (side + 0.9);
    batch.box(0.14, 1.7, 0.14, PAL.wood, px, 0, pz);
    batch.box(1.0, 0.3, 0.07, PAL.woodPale, px + dx * 0.35, 1.3, pz + dz * 0.35, yaw - Math.PI / 2); // long side along the trail
    batch.box(0.22, 0.22, 0.07, PAL.woodPale, px + dx * 0.88, 1.34, pz + dz * 0.88, yaw + Math.PI / 4); // arrow tip
    cw.addCircle(px, pz, 0.16, 1.7, 'wood');
    signs.push({ exit: e.id, pos: new THREE.Vector3(px, 1.75, pz) });
  }
  return signs;
}
