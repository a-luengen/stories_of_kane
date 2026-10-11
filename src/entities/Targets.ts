import * as THREE from 'three';
import { CONFIG } from '../config';
import { boxGeo, part } from '../render/materials';
import { PAL } from '../render/palette';
import { segmentVsCylinder } from '../world/Colliders';
import type { BurstKind } from './Particles';
import { clamp } from '../util/math';

export interface HitInfo {
  /** Damage after distance falloff. */
  damage: number;
  /** Who fired (their own hitbox), or null. */
  shooter: Target | null;
}

export interface Target {
  readonly object: THREE.Object3D;
  /** Returns the hit parameter along a→b, or null. */
  test(a: THREE.Vector3, b: THREE.Vector3): { t: number; normal: THREE.Vector3 } | null;
  /** Apply a hit; returns the particle burst to spawn. */
  hit(point: THREE.Vector3, dir: THREE.Vector3, info: HitInfo): BurstKind;
  /** Per-step animation (static targets; actors update themselves). */
  update?(dt: number): void;
}

class Bottle implements Target {
  readonly object = new THREE.Group();
  private alive = true;
  private timer = 0;
  private pop = 1;

  constructor(private base: THREE.Vector3, color: number) {
    const o = this.object;
    o.position.copy(base);
    // Deliberately chunky so a bottle reads as ~4×9 px at 320×180.
    part(new THREE.CylinderGeometry(0.15, 0.16, 0.38, 6), color, 0, 0.19, 0, o);
    part(new THREE.CylinderGeometry(0.06, 0.12, 0.16, 6), color, 0, 0.46, 0, o);
    part(new THREE.CylinderGeometry(0.065, 0.065, 0.08, 6), PAL.cream, 0, 0.58, 0, o);
  }

  test(a: THREE.Vector3, b: THREE.Vector3) {
    if (!this.alive) return null;
    const h = segmentVsCylinder(a.x, a.y, a.z, b.x, b.y, b.z, this.base.x, this.base.z, 0.2, this.base.y - 0.05, this.base.y + 0.65);
    return h ? { t: h.t, normal: new THREE.Vector3(h.nx, h.ny, h.nz) } : null;
  }

  hit(): BurstKind {
    this.alive = false;
    this.object.visible = false;
    this.timer = CONFIG.targets.bottleRespawn;
    return 'glass';
  }

  update(dt: number): void {
    if (!this.alive) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.alive = true;
        this.object.visible = true;
        this.pop = 0;
      }
    }
    if (this.pop < 1) {
      this.pop = Math.min(1, this.pop + dt * 4);
      const s = this.pop < 0.7 ? this.pop / 0.7 * 1.2 : 1.2 - (this.pop - 0.7) / 0.3 * 0.2;
      this.object.scale.setScalar(s);
    }
  }
}

type DummyState = 'up' | 'falling' | 'down' | 'rising';

class Dummy implements Target {
  readonly object = new THREE.Group();
  private pivot = new THREE.Group();
  private tilt = new THREE.Vector2();
  private tiltVel = new THREE.Vector2();
  private hp = CONFIG.targets.dummyHp;
  private state: DummyState = 'up';
  private timer = 0;
  private fall = 0;
  private fallDir = new THREE.Vector2(1, 0);
  private flash = 0;
  private flashMesh: THREE.Mesh;

  constructor(private base: THREE.Vector3, yaw: number) {
    this.object.position.copy(base);
    this.object.rotation.y = yaw;
    this.object.add(this.pivot);
    const p = this.pivot;
    part(boxGeo(0.12, 1.9, 0.12, -1), PAL.wood, 0, 0, 0, p); // post
    part(boxGeo(0.9, 0.1, 0.1), PAL.wood, 0, 1.3, 0.02, p); // cross bar
    this.flashMesh = part(boxGeo(0.5, 0.72, 0.32, -1), PAL.sandLight, 0, 0.82, 0, p); // straw body
    part(boxGeo(0.52, 0.08, 0.34), PAL.brown, 0, 1.0, 0, p); // rope
    part(boxGeo(0.34, 0.34, 0.3, -1), PAL.sandPale, 0, 1.56, 0, p); // sack head
    part(boxGeo(0.2, 0.2, 0.04), PAL.red, 0, 1.08 + 0.1, 0.17, p); // target circle
    part(boxGeo(0.08, 0.08, 0.05), PAL.cream, 0, 1.18, 0.18, p);
    for (const s of [-1, 1]) part(boxGeo(0.1, 0.1, 0.1), PAL.sandLight, s * 0.42, 1.3, 0.02, p);
  }

  test(a: THREE.Vector3, b: THREE.Vector3) {
    if (this.state !== 'up' && this.state !== 'rising') return null;
    const h = segmentVsCylinder(a.x, a.y, a.z, b.x, b.y, b.z, this.base.x, this.base.z, 0.32, 0.6, 1.95);
    return h ? { t: h.t, normal: new THREE.Vector3(h.nx, h.ny, h.nz) } : null;
  }

  hit(_point: THREE.Vector3, dir: THREE.Vector3, _info: HitInfo): BurstKind {
    // Angular kick in the bullet's direction (world space XZ).
    this.tiltVel.x += dir.x * 4.5;
    this.tiltVel.y += dir.z * 4.5;
    this.flash = 0.08;
    if (this.state === 'up' && --this.hp <= 0) {
      this.state = 'falling';
      this.fall = 0;
      const l = Math.hypot(dir.x, dir.z) || 1;
      this.fallDir.set(dir.x / l, dir.z / l);
    }
    return 'straw';
  }

  update(dt: number): void {
    // Damped spring wobble.
    const k = 60;
    const c = 5;
    this.tiltVel.x += (-k * this.tilt.x - c * this.tiltVel.x) * dt;
    this.tiltVel.y += (-k * this.tilt.y - c * this.tiltVel.y) * dt;
    this.tilt.addScaledVector(this.tiltVel, dt);
    this.tilt.clampLength(0, 0.6);

    if (this.state === 'falling') {
      this.fall = Math.min(1, this.fall + dt * 2.6);
      if (this.fall >= 1) {
        this.state = 'down';
        this.timer = CONFIG.targets.dummyRespawn;
      }
    } else if (this.state === 'down') {
      this.timer -= dt;
      if (this.timer <= 0) this.state = 'rising';
    } else if (this.state === 'rising') {
      this.fall = Math.max(0, this.fall - dt * 1.5);
      if (this.fall <= 0) {
        this.state = 'up';
        this.hp = CONFIG.targets.dummyHp;
      }
    }

    // Combine wobble and fall into a world-space tilt (rotate about the axis perpendicular to the lean).
    const fallAngle = (this.state === 'falling' ? this.fall * this.fall : this.fall) * (Math.PI / 2 - 0.08);
    const lx = this.tilt.x + this.fallDir.x * fallAngle;
    const lz = this.tilt.y + this.fallDir.y * fallAngle;
    const angle = clamp(Math.hypot(lx, lz), 0, Math.PI / 2);
    // Lean towards (lx, lz): axis = up × lean = (lz, 0, -lx); convert to local (undo object yaw).
    const axis = new THREE.Vector3(lz, 0, -lx);
    if (axis.lengthSq() > 1e-8) {
      axis.normalize().applyAxisAngle(THREE.Object3D.DEFAULT_UP, -this.object.rotation.y);
      this.pivot.quaternion.setFromAxisAngle(axis, angle);
    } else {
      this.pivot.quaternion.identity();
    }

    this.flash = Math.max(0, this.flash - dt);
    this.flashMesh.scale.setScalar(this.flash > 0 ? 1.08 : 1);
  }
}

/** Owns all shootable targets and answers swept bullet queries. */
export class TargetSystem {
  readonly group = new THREE.Group();
  readonly targets: Target[] = [];
  /** Characters (player, NPCs): shootable, but their models live elsewhere in the scene and update themselves. */
  readonly actors: Target[] = [];

  addBottle(pos: THREE.Vector3, color: number): void {
    this.add(new Bottle(pos.clone(), color));
  }

  addDummy(pos: THREE.Vector3, yaw: number): void {
    this.add(new Dummy(pos.clone(), yaw));
  }

  addActor(t: Target): void {
    this.actors.push(t);
  }

  private add(t: Target): void {
    this.targets.push(t);
    this.group.add(t.object);
  }

  /** Nearest target or actor along a→b, skipping `ignore` (e.g. the shooter). */
  raycast(a: THREE.Vector3, b: THREE.Vector3, ignore: Target | null = null): { t: number; normal: THREE.Vector3; target: Target } | null {
    let best: { t: number; normal: THREE.Vector3; target: Target } | null = null;
    for (const list of [this.targets, this.actors]) {
      for (const target of list) {
        if (target === ignore) continue;
        const h = target.test(a, b);
        if (h && (!best || h.t < best.t)) best = { ...h, target };
      }
    }
    return best;
  }

  update(dt: number): void {
    for (const t of this.targets) t.update?.(dt);
  }
}
