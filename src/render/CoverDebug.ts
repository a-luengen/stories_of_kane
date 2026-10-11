import * as THREE from 'three';
import type { Hitbox } from '../entities/Targets';
import type { Collider, CollisionWorld } from '../world/Colliders';

const LOW = new THREE.Color(0x8ae05a); // low cover: a standing chest shows over it
const MID = new THREE.Color(0xf7d774);
const TALL = new THREE.Color(0xff8a3c);
const HITBOX = new THREE.Color(0xff3c3c);
const TRAIL_HIGH = new THREE.Color(0x5ad2ff);
const TRAIL_LOW = new THREE.Color(0x2050ff);
const DROP = new THREE.Color(0xffffff);

interface Trail {
  points: THREE.Vector3[];
  /** Seconds since the bullet was last seen (trails fade after it lands). */
  age: number;
}

/**
 * Debug view (B): every prop's cover volume (green = low cover, yellow = medium, orange = tall),
 * character hitboxes (red, shrinking when crouched), and bullet trails coloured by height with a
 * drop line to the ground, to check what blocks what.
 */
export class CoverDebug {
  readonly group = new THREE.Group();
  private props: THREE.LineSegments | null = null;
  private dynamic: THREE.LineSegments;
  private trails = new Map<THREE.Vector3, Trail>();

  constructor(private world: CollisionWorld) {
    this.group.visible = false;
    const geo = new THREE.BufferGeometry();
    this.dynamic = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ vertexColors: true, depthTest: false }));
    this.dynamic.frustumCulled = false;
    this.dynamic.renderOrder = 10;
    this.group.add(this.dynamic);
  }

  get visible(): boolean {
    return this.group.visible;
  }

  toggle(): void {
    this.group.visible = !this.group.visible;
    if (this.group.visible && !this.props) this.buildProps();
  }

  /** Static: one outline per collider, extruded base → coverHeight. */
  private buildProps(): void {
    const pos: number[] = [];
    const col: number[] = [];
    const seg = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Color) => {
      pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
      col.push(c.r, c.g, c.b, c.r, c.g, c.b);
    };
    for (const c of this.world.colliders as Collider[]) {
      if (!c.blocksBullets) continue;
      const h = c.coverHeight;
      const color = h < 1.2 ? LOW : h < 2.2 ? MID : TALL;
      const y0 = c.base ?? 0;
      if (c.kind === 'box') {
        const xs = [c.minX, c.maxX];
        const zs = [c.minZ, c.maxZ];
        const corners = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([i, j]) => [xs[i], zs[j]]);
        corners.forEach(([x, z], k) => {
          const [nx, nz] = corners[(k + 1) % 4];
          for (const y of [y0, h]) seg(new THREE.Vector3(x, y, z), new THREE.Vector3(nx, y, nz), color);
          seg(new THREE.Vector3(x, y0, z), new THREE.Vector3(x, h, z), color);
        });
      } else {
        this.cylinder(seg, { x: c.x, z: c.z, r: c.r, y0, y1: h }, color);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    this.props = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ vertexColors: true }));
    this.props.frustumCulled = false;
    this.group.add(this.props);
  }

  private cylinder(seg: (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Color) => void, h: Hitbox, color: THREE.Color): void {
    const n = 10;
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2;
      const a1 = ((i + 1) / n) * Math.PI * 2;
      for (const y of [h.y0, h.y1]) {
        seg(new THREE.Vector3(h.x + Math.cos(a0) * h.r, y, h.z + Math.sin(a0) * h.r), new THREE.Vector3(h.x + Math.cos(a1) * h.r, y, h.z + Math.sin(a1) * h.r), color);
      }
      if (i % (n / 5) === 0) {
        seg(new THREE.Vector3(h.x + Math.cos(a0) * h.r, h.y0, h.z + Math.sin(a0) * h.r), new THREE.Vector3(h.x + Math.cos(a0) * h.r, h.y1, h.z + Math.sin(a0) * h.r), color);
      }
    }
  }

  /** Per frame (while visible): hitboxes and bullet trails. */
  update(dt: number, hitboxes: (Hitbox | null)[], bullets: THREE.Vector3[]): void {
    if (!this.group.visible) return;
    const pos: number[] = [];
    const col: number[] = [];
    const seg = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Color) => {
      pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
      col.push(c.r, c.g, c.b, c.r, c.g, c.b);
    };
    for (const h of hitboxes) if (h) this.cylinder(seg, h, HITBOX);

    // Trails: one per bullet; a pooled bullet that reappears far away starts a new one.
    for (const t of this.trails.values()) t.age += dt;
    for (const b of bullets) {
      let t = this.trails.get(b);
      const last = t?.points[t.points.length - 1];
      if (!t || (last && last.distanceTo(b) > 4)) {
        t = { points: [], age: 0 };
        this.trails.set(b, t);
      }
      t.age = 0;
      t.points.push(b.clone());
      if (t.points.length > 60) t.points.shift();
      // Drop line: where it is above the ground.
      seg(b, new THREE.Vector3(b.x, 0, b.z), DROP);
    }
    for (const [key, t] of this.trails) {
      if (t.age > 1.2) {
        this.trails.delete(key);
        continue;
      }
      for (let i = 1; i < t.points.length; i++) {
        const c = TRAIL_LOW.clone().lerp(TRAIL_HIGH, Math.min(1, t.points[i].y / 2));
        seg(t.points[i - 1], t.points[i], c);
      }
    }
    const geo = this.dynamic.geometry;
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.computeBoundingSphere();
  }
}
