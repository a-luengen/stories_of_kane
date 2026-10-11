export type Surface = 'wood' | 'rock' | 'cactus' | 'metal' | 'dirt';

interface ColliderBase {
  /** Extruded from y = 0 up to this height (bullets above it pass over). */
  height: number;
  surface: Surface;
  /** Static props like dummy posts block movement but bullets are handled elsewhere. */
  blocksBullets: boolean;
}
export interface CircleCollider extends ColliderBase {
  kind: 'circle';
  x: number;
  z: number;
  r: number;
}
export interface BoxCollider extends ColliderBase {
  kind: 'box';
  minX: number;
  minZ: number;
  maxX: number;
  maxZ: number;
}
export type Collider = CircleCollider | BoxCollider;

export interface Contact {
  hit: boolean;
  /** Accumulated push-out normal (unit, XZ) of the strongest contact. */
  nx: number;
  nz: number;
  /** Penetration depth of the strongest contact. */
  depth: number;
}

export interface SegmentHit {
  t: number;
  /** Surface normal (3D). */
  nx: number;
  ny: number;
  nz: number;
  surface: Surface;
  collider: Collider | null;
}

const CELL = 4;

/** Static collision world with a uniform grid broadphase. */
export class CollisionWorld {
  readonly colliders: Collider[] = [];
  private grid = new Map<number, Collider[]>();
  private stamp = new Map<Collider, number>();
  private queryId = 0;

  constructor(readonly halfSize: number) {}

  addCircle(x: number, z: number, r: number, height: number, surface: Surface, blocksBullets = true): CircleCollider {
    const c: CircleCollider = { kind: 'circle', x, z, r, height, surface, blocksBullets };
    this.insert(c, x - r, z - r, x + r, z + r);
    return c;
  }

  addBox(minX: number, minZ: number, maxX: number, maxZ: number, height: number, surface: Surface, blocksBullets = true): BoxCollider {
    const c: BoxCollider = { kind: 'box', minX, minZ, maxX, maxZ, height, surface, blocksBullets };
    this.insert(c, minX, minZ, maxX, maxZ);
    return c;
  }

  private key(cx: number, cz: number): number {
    return (cx + 1000) * 4096 + (cz + 1000);
  }

  private insert(c: Collider, x0: number, z0: number, x1: number, z1: number): void {
    this.colliders.push(c);
    for (let cx = Math.floor(x0 / CELL); cx <= Math.floor(x1 / CELL); cx++) {
      for (let cz = Math.floor(z0 / CELL); cz <= Math.floor(z1 / CELL); cz++) {
        const k = this.key(cx, cz);
        let list = this.grid.get(k);
        if (!list) this.grid.set(k, (list = []));
        list.push(c);
      }
    }
  }

  private query(x0: number, z0: number, x1: number, z1: number, out: Collider[]): Collider[] {
    out.length = 0;
    const id = ++this.queryId;
    for (let cx = Math.floor(x0 / CELL); cx <= Math.floor(x1 / CELL); cx++) {
      for (let cz = Math.floor(z0 / CELL); cz <= Math.floor(z1 / CELL); cz++) {
        const list = this.grid.get(this.key(cx, cz));
        if (!list) continue;
        for (const c of list) {
          if (this.stamp.get(c) === id) continue;
          this.stamp.set(c, id);
          out.push(c);
        }
      }
    }
    return out;
  }

  private scratch: Collider[] = [];

  /**
   * Push a circle out of all static colliders (and the map bounds). Mutates `pos`.
   * Returns the deepest contact so callers can respond (e.g. horse speed loss).
   */
  resolveCircle(pos: { x: number; z: number }, radius: number, extra?: readonly CircleCollider[]): Contact {
    const contact: Contact = { hit: false, nx: 0, nz: 0, depth: 0 };
    for (let iter = 0; iter < 3; iter++) {
      let any = false;
      const list = this.query(pos.x - radius, pos.z - radius, pos.x + radius, pos.z + radius, this.scratch);
      const all = extra ? list.concat(extra) : list;
      for (const c of all) {
        const r = c.kind === 'circle' ? pushCircleCircle(pos, radius, c) : pushCircleBox(pos, radius, c);
        if (r) {
          any = true;
          if (!contact.hit || r.depth > contact.depth) Object.assign(contact, r, { hit: true });
        }
      }
      // Map bounds.
      const lim = this.halfSize - radius;
      for (const [axis, sign] of [
        ['x', 1],
        ['x', -1],
        ['z', 1],
        ['z', -1],
      ] as const) {
        const v = pos[axis] * sign;
        if (v > lim) {
          pos[axis] = lim * sign;
          any = true;
          const depth = v - lim;
          if (!contact.hit || depth > contact.depth) {
            Object.assign(contact, { hit: true, depth, nx: axis === 'x' ? -sign : 0, nz: axis === 'z' ? -sign : 0 });
          }
        }
      }
      if (!any) break;
    }
    return contact;
  }

  /** Swept 3D segment test against extruded colliders and the ground plane. */
  raycast(ax: number, ay: number, az: number, bx: number, by: number, bz: number): SegmentHit | null {
    let best: SegmentHit | null = null;
    // Ground.
    if (by <= 0 && ay > 0) {
      const t = ay / (ay - by);
      best = { t, nx: 0, ny: 1, nz: 0, surface: 'dirt', collider: null };
    }
    const list = this.query(Math.min(ax, bx), Math.min(az, bz), Math.max(ax, bx), Math.max(az, bz), this.scratch);
    for (const c of list) {
      if (!c.blocksBullets) continue;
      const h =
        c.kind === 'circle'
          ? segmentVsCylinder(ax, ay, az, bx, by, bz, c.x, c.z, c.r, 0, c.height)
          : segmentVsBox(ax, ay, az, bx, by, bz, c.minX, c.minZ, c.maxX, c.maxZ, c.height);
      if (h && (!best || h.t < best.t)) {
        h.surface = c.surface;
        h.collider = c;
        best = h;
      }
    }
    return best;
  }
}

function pushCircleCircle(pos: { x: number; z: number }, r: number, c: CircleCollider) {
  const dx = pos.x - c.x;
  const dz = pos.z - c.z;
  const rr = r + c.r;
  const d2 = dx * dx + dz * dz;
  if (d2 >= rr * rr) return null;
  const d = Math.sqrt(d2) || 1e-6;
  const nx = d2 > 1e-12 ? dx / d : 1;
  const nz = d2 > 1e-12 ? dz / d : 0;
  pos.x = c.x + nx * rr;
  pos.z = c.z + nz * rr;
  return { nx, nz, depth: rr - d };
}

function pushCircleBox(pos: { x: number; z: number }, r: number, c: BoxCollider) {
  const cx = Math.max(c.minX, Math.min(pos.x, c.maxX));
  const cz = Math.max(c.minZ, Math.min(pos.z, c.maxZ));
  const dx = pos.x - cx;
  const dz = pos.z - cz;
  const d2 = dx * dx + dz * dz;
  if (d2 >= r * r) return null;
  if (d2 > 1e-12) {
    const d = Math.sqrt(d2);
    const nx = dx / d;
    const nz = dz / d;
    pos.x = cx + nx * r;
    pos.z = cz + nz * r;
    return { nx, nz, depth: r - d };
  }
  // Centre inside the box: exit through the nearest face.
  const exits = [
    { d: pos.x - c.minX, nx: -1, nz: 0 },
    { d: c.maxX - pos.x, nx: 1, nz: 0 },
    { d: pos.z - c.minZ, nx: 0, nz: -1 },
    { d: c.maxZ - pos.z, nx: 0, nz: 1 },
  ].sort((a, b) => a.d - b.d)[0];
  pos.x += exits.nx * (exits.d + r);
  pos.z += exits.nz * (exits.d + r);
  return { nx: exits.nx, nz: exits.nz, depth: exits.d + r };
}

/** Parameter interval in which y(t) lies within [y0, y1]. */
function heightInterval(ay: number, by: number, y0: number, y1: number): [number, number] | null {
  const dy = by - ay;
  if (Math.abs(dy) < 1e-9) return ay >= y0 && ay <= y1 ? [-Infinity, Infinity] : null;
  let t0 = (y0 - ay) / dy;
  let t1 = (y1 - ay) / dy;
  if (t0 > t1) [t0, t1] = [t1, t0];
  return [t0, t1];
}

/** Segment vs vertical cylinder (x,z,r) spanning y0..y1. Returns entry parameter and normal. */
export function segmentVsCylinder(
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
  cx: number,
  cz: number,
  r: number,
  y0: number,
  y1: number,
): SegmentHit | null {
  const dx = bx - ax;
  const dz = bz - az;
  const fx = ax - cx;
  const fz = az - cz;
  const a = dx * dx + dz * dz;
  const c = fx * fx + fz * fz - r * r;
  let tIn: number;
  let tOut: number;
  if (a < 1e-12) {
    if (c > 0) return null;
    tIn = -Infinity;
    tOut = Infinity;
  } else {
    const b = 2 * (fx * dx + fz * dz);
    const disc = b * b - 4 * a * c;
    if (disc < 0) return null;
    const sq = Math.sqrt(disc);
    tIn = (-b - sq) / (2 * a);
    tOut = (-b + sq) / (2 * a);
  }
  const hi = heightInterval(ay, by, y0, y1);
  if (!hi) return null;
  const t0 = Math.max(tIn, hi[0], 0);
  const t1 = Math.min(tOut, hi[1], 1);
  if (t0 > t1) return null;
  if (t0 === hi[0] && hi[0] > tIn) {
    // Entered through the top/bottom cap.
    return { t: t0, nx: 0, ny: by < ay ? 1 : -1, nz: 0, surface: 'dirt', collider: null };
  }
  const px = ax + dx * t0 - cx;
  const pz = az + dz * t0 - cz;
  const len = Math.hypot(px, pz) || 1;
  return { t: t0, nx: px / len, ny: 0, nz: pz / len, surface: 'dirt', collider: null };
}

/** Segment vs axis-aligned box footprint extruded 0..height (slab method). */
export function segmentVsBox(
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
  minX: number,
  minZ: number,
  maxX: number,
  maxZ: number,
  height: number,
): SegmentHit | null {
  let tIn = 0;
  let tOut = 1;
  let nx = 0;
  let ny = 0;
  let nz = 0;
  const slabs: [number, number, number, number, 'x' | 'y' | 'z'][] = [
    [ax, bx - ax, minX, maxX, 'x'],
    [ay, by - ay, 0, height, 'y'],
    [az, bz - az, minZ, maxZ, 'z'],
  ];
  for (const [o, d, lo, hi, axis] of slabs) {
    if (Math.abs(d) < 1e-12) {
      if (o < lo || o > hi) return null;
      continue;
    }
    let t0 = (lo - o) / d;
    let t1 = (hi - o) / d;
    let sign = -1;
    if (t0 > t1) {
      [t0, t1] = [t1, t0];
      sign = 1;
    }
    if (t0 > tIn) {
      tIn = t0;
      nx = axis === 'x' ? sign : 0;
      ny = axis === 'y' ? sign : 0;
      nz = axis === 'z' ? sign : 0;
    }
    tOut = Math.min(tOut, t1);
    if (tIn > tOut) return null;
  }
  return { t: tIn, nx, ny, nz, surface: 'dirt', collider: null };
}
