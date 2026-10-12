import * as THREE from 'three';
import { CONFIG } from '../config';
import type { WeaponDef } from '../data/types';
import { closestApproach } from '../audio/spatial';
import { PAL } from '../render/palette';
import type { Collider, CollisionWorld, Surface } from '../world/Colliders';
import type { TargetSystem, Target } from './Targets';
import { falloff } from './Weapon';

export interface Impact {
  point: THREE.Vector3;
  normal: THREE.Vector3;
  dir: THREE.Vector3;
  surface: Surface | 'target';
  target: Target | null;
  /** Damage after distance falloff. */
  damage: number;
  shooter: Target | null;
  weapon: WeaponDef;
  /** The static collider that stopped it (props), if any. */
  collider: Collider | null;
}

/** Someone listening for bullets going past (the player's head). */
export interface NearListener {
  pos: THREE.Vector3;
  radius: number;
  /** A bullet not fired by `ignore` passed within `radius` (closest point, direction of travel). */
  onPass(point: THREE.Vector3, dir: THREE.Vector3): void;
  ignore: Target | null;
}

interface Bullet {
  pos: THREE.Vector3;
  prev: THREE.Vector3;
  vel: THREE.Vector3;
  travelled: number;
  alive: boolean;
  /** Already whizzed past the listener. */
  passed: boolean;
  mesh: THREE.Mesh;
  weapon: WeaponDef;
  shooter: Target | null;
}

/** Fast, visible bullets with stretched tracers; swept collision each fixed step. */
export class ProjectileSystem {
  readonly group = new THREE.Group();
  private bullets: Bullet[] = [];
  private geo = new THREE.BoxGeometry(0.11, 0.11, 1); // ≥ 1 low-res px wide
  private mat = new THREE.MeshBasicMaterial({ color: PAL.brassLight });
  private tmpA = new THREE.Vector3();
  private tmpB = new THREE.Vector3();

  constructor() {
    this.geo.translate(0, 0, -0.5); // pivot at the head; tail stretches backwards
  }

  fire(origin: THREE.Vector3, dir: THREE.Vector3, weapon: WeaponDef, shooter: Target | null): void {
    let b = this.bullets.find((x) => !x.alive);
    if (!b) {
      const mesh = new THREE.Mesh(this.geo, this.mat);
      mesh.frustumCulled = false;
      this.group.add(mesh);
      b = { pos: new THREE.Vector3(), prev: new THREE.Vector3(), vel: new THREE.Vector3(), travelled: 0, alive: false, passed: false, mesh, weapon, shooter };
      this.bullets.push(b);
    }
    b.pos.copy(origin);
    b.prev.copy(origin);
    b.vel.copy(dir).multiplyScalar(weapon.bulletSpeed);
    b.travelled = 0;
    b.alive = true;
    b.passed = false;
    b.weapon = weapon;
    b.shooter = shooter;
    b.mesh.visible = true;
  }

  update(dt: number, world: CollisionWorld, targets: TargetSystem, onImpact: (i: Impact) => void, near?: NearListener): void {
    for (const b of this.bullets) {
      if (!b.alive) continue;
      b.prev.copy(b.pos);
      const a = b.pos;
      const e = this.tmpB.copy(a).addScaledVector(b.vel, dt);
      const wh = world.raycast(a.x, a.y, a.z, e.x, e.y, e.z);
      const th = targets.raycast(a, e, b.shooter);
      const dir = this.tmpA.copy(b.vel).normalize();
      const step = b.vel.length() * dt;
      const hit = (t: number, normal: THREE.Vector3, surface: Surface | 'target', target: Target | null, collider: Collider | null = null) => {
        const point = a.clone().lerp(e, t);
        const damage = b.weapon.damage * falloff(b.weapon, b.travelled + step * t);
        onImpact({ point, normal, dir: dir.clone(), surface, target, damage, shooter: b.shooter, weapon: b.weapon, collider });
        b.pos.copy(point);
        b.alive = false;
      };
      if (th && (!wh || th.t <= wh.t)) {
        hit(th.t, th.normal, 'target', th.target);
      } else if (wh) {
        hit(wh.t, new THREE.Vector3(wh.nx, wh.ny, wh.nz), wh.surface, null, wh.collider);
      } else {
        if (near && !b.passed && b.shooter !== near.ignore) {
          const c = closestApproach(a.x, a.y, a.z, e.x, e.y, e.z, near.pos.x, near.pos.y, near.pos.z);
          if (c.dist < near.radius) {
            b.passed = true;
            near.onPass(a.clone().lerp(e, c.t), dir.clone());
          }
        }
        b.pos.copy(e);
        b.travelled += step;
        if (b.travelled > b.weapon.range) b.alive = false;
      }
    }
  }

  /** Positions of bullets in flight (for the cover debug view). */
  live(): THREE.Vector3[] {
    return this.bullets.filter((b) => b.alive).map((b) => b.pos);
  }

  /** Interpolate tracer visuals between fixed steps. */
  sync(alpha: number): void {
    const len = CONFIG.projectiles.tracerLength;
    for (const b of this.bullets) {
      if (!b.alive) {
        // Let a just-dead bullet's tracer vanish on the next render.
        b.mesh.visible = false;
        continue;
      }
      const head = this.tmpA.copy(b.prev).lerp(b.pos, alpha);
      const travelled = b.travelled - head.distanceTo(b.pos);
      b.mesh.position.copy(head);
      this.tmpB.copy(head).add(b.vel);
      b.mesh.lookAt(this.tmpB);
      b.mesh.scale.set(1, 1, Math.max(0.05, Math.min(len, travelled)));
    }
  }
}
