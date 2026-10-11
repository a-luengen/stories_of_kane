import type { Vec2 } from '../data/types';
import type { CollisionWorld } from '../world/Colliders';

const DIRS: [number, number, number][] = [
  [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
  [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
];

/**
 * Walkability grid over the static colliders (built once) with A* + line-of-sight smoothing.
 * A cell is blocked when a character-sized circle at its centre would be pushed out of something.
 */
export class NavGrid {
  readonly n: number;
  private blocked: Uint8Array;
  // A* scratch, reused between searches.
  private g: Float32Array;
  private parent: Int32Array;
  private stamp: Uint32Array;
  private closed: Uint32Array;
  private search = 0;

  constructor(
    world: CollisionWorld,
    readonly half: number,
    readonly cell = 0.5,
    radius = 0.42,
  ) {
    this.n = Math.ceil((half * 2) / cell);
    const total = this.n * this.n;
    this.blocked = new Uint8Array(total);
    this.g = new Float32Array(total);
    this.parent = new Int32Array(total);
    this.stamp = new Uint32Array(total);
    this.closed = new Uint32Array(total);
    for (let j = 0; j < this.n; j++) {
      for (let i = 0; i < this.n; i++) {
        const x = this.cx(i);
        const z = this.cx(j);
        const p = { x, z };
        world.resolveCircle(p, radius);
        if (Math.abs(p.x - x) + Math.abs(p.z - z) > 1e-4) this.blocked[j * this.n + i] = 1;
      }
    }
  }

  /** Cell index → world coordinate of its centre. */
  private cx(i: number): number {
    return -this.half + (i + 0.5) * this.cell;
  }

  private ix(x: number): number {
    return Math.max(0, Math.min(this.n - 1, Math.floor((x + this.half) / this.cell)));
  }

  isFree(x: number, z: number): boolean {
    if (Math.abs(x) >= this.half || Math.abs(z) >= this.half) return false;
    return !this.blocked[this.ix(z) * this.n + this.ix(x)];
  }

  /** Nearest walkable point to (x, z) within `maxR`, searching outwards ring by ring. */
  nearestFree(x: number, z: number, maxR = 6): Vec2 | null {
    if (this.isFree(x, z)) return [x, z];
    const ci = this.ix(x);
    const cj = this.ix(z);
    const rings = Math.ceil(maxR / this.cell);
    for (let r = 1; r <= rings; r++) {
      let best: Vec2 | null = null;
      let bestD = Infinity;
      for (let dj = -r; dj <= r; dj++) {
        for (let di = -r; di <= r; di++) {
          if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
          const i = ci + di;
          const j = cj + dj;
          if (i < 0 || j < 0 || i >= this.n || j >= this.n || this.blocked[j * this.n + i]) continue;
          const px = this.cx(i);
          const pz = this.cx(j);
          const d = (px - x) ** 2 + (pz - z) ** 2;
          if (d < bestD) {
            bestD = d;
            best = [px, pz];
          }
        }
      }
      if (best) return best;
    }
    return null;
  }

  /** True if a straight walk from a to b only crosses walkable cells. */
  walkable(ax: number, az: number, bx: number, bz: number): boolean {
    const len = Math.hypot(bx - ax, bz - az);
    const steps = Math.max(1, Math.ceil(len / (this.cell * 0.5)));
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      if (!this.isFree(ax + (bx - ax) * t, az + (bz - az) * t)) return false;
    }
    return true;
  }

  /**
   * Waypoints from (sx, sz) to (tx, tz), excluding the start; null if unreachable.
   * Start / goal inside obstacles snap to the nearest walkable cell.
   */
  findPath(sx: number, sz: number, tx: number, tz: number, maxExpand = 40000): Vec2[] | null {
    const start = this.nearestFree(sx, sz, 2);
    const goal = this.nearestFree(tx, tz, 6);
    if (!start || !goal) return null;
    if (this.walkable(sx, sz, goal[0], goal[1])) return [goal];

    const n = this.n;
    const si = this.ix(start[1]) * n + this.ix(start[0]);
    const gi = this.ix(goal[1]) * n + this.ix(goal[0]);
    const gxi = gi % n;
    const gzi = Math.floor(gi / n);
    const id = ++this.search;
    const heap = new MinHeap();
    const h = (k: number) => {
      const dx = Math.abs((k % n) - gxi);
      const dz = Math.abs(Math.floor(k / n) - gzi);
      return Math.max(dx, dz) + (Math.SQRT2 - 1) * Math.min(dx, dz);
    };
    this.stamp[si] = id;
    this.g[si] = 0;
    this.parent[si] = -1;
    heap.push(si, h(si));
    let expanded = 0;
    let found = false;
    while (heap.size > 0) {
      const cur = heap.pop();
      if (this.closed[cur] === id) continue;
      this.closed[cur] = id;
      if (cur === gi) {
        found = true;
        break;
      }
      if (++expanded > maxExpand) break;
      const ci = cur % n;
      const cj = Math.floor(cur / n);
      for (const [di, dj, cost] of DIRS) {
        const i = ci + di;
        const j = cj + dj;
        if (i < 0 || j < 0 || i >= n || j >= n) continue;
        const k = j * n + i;
        if (this.blocked[k] || this.closed[k] === id) continue;
        // No corner cutting.
        if (di !== 0 && dj !== 0 && (this.blocked[cj * n + i] || this.blocked[j * n + ci])) continue;
        const g = this.g[cur] + cost;
        if (this.stamp[k] !== id || g < this.g[k]) {
          this.stamp[k] = id;
          this.g[k] = g;
          this.parent[k] = cur;
          heap.push(k, g + h(k));
        }
      }
    }
    if (!found) return null;

    const cells: Vec2[] = [];
    for (let k = gi; k !== -1; k = this.parent[k]) cells.push([this.cx(k % n), this.cx(Math.floor(k / n))]);
    cells.reverse();
    cells[cells.length - 1] = goal;

    // String-pull: skip every waypoint that can be reached in a straight line.
    const out: Vec2[] = [];
    let ax = sx;
    let az = sz;
    let i = 0;
    while (i < cells.length) {
      let j = cells.length - 1;
      while (j > i && !this.walkable(ax, az, cells[j][0], cells[j][1])) j--;
      out.push(cells[j]);
      [ax, az] = cells[j];
      i = j + 1;
    }
    return out;
  }
}

/** Binary min-heap of (index, priority). */
class MinHeap {
  private items: number[] = [];
  private prio: number[] = [];

  get size(): number {
    return this.items.length;
  }

  push(item: number, p: number): void {
    const a = this.items;
    const q = this.prio;
    a.push(item);
    q.push(p);
    let i = a.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (q[parent] <= q[i]) break;
      [a[parent], a[i]] = [a[i], a[parent]];
      [q[parent], q[i]] = [q[i], q[parent]];
      i = parent;
    }
  }

  pop(): number {
    const a = this.items;
    const q = this.prio;
    const top = a[0];
    const lastItem = a.pop()!;
    const lastPrio = q.pop()!;
    if (a.length > 0) {
      a[0] = lastItem;
      q[0] = lastPrio;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && q[l] < q[m]) m = l;
        if (r < a.length && q[r] < q[m]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        [q[m], q[i]] = [q[i], q[m]];
        i = m;
      }
    }
    return top;
  }
}
