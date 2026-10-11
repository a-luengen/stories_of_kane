import * as THREE from 'three';
import { CONFIG } from '../config';
import { PAL } from '../render/palette';
import type { CollisionWorld, Surface } from '../world/Colliders';
import type { TargetSystem, Target } from './Targets';

export interface Impact {
  point: THREE.Vector3;
  normal: THREE.Vector3;
  dir: THREE.Vector3;
  surface: Surface | 'target';
  target: Target | null;
}

interface Bullet {
  pos: THREE.Vector3;
  prev: THREE.Vector3;
  vel: THREE.Vector3;
  travelled: number;
  alive: boolean;
  mesh: THREE.Mesh;
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

  fire(origin: THREE.Vector3, dir: THREE.Vector3): void {
    let b = this.bullets.find((x) => !x.alive);
    if (!b) {
      const mesh = new THREE.Mesh(this.geo, this.mat);
      mesh.frustumCulled = false;
      this.group.add(mesh);
      b = { pos: new THREE.Vector3(), prev: new THREE.Vector3(), vel: new THREE.Vector3(), travelled: 0, alive: false, mesh };
      this.bullets.push(b);
    }
    b.pos.copy(origin);
    b.prev.copy(origin);
    b.vel.copy(dir).multiplyScalar(CONFIG.revolver.bulletSpeed);
    b.travelled = 0;
    b.alive = true;
    b.mesh.visible = true;
  }

  update(dt: number, world: CollisionWorld, targets: TargetSystem, onImpact: (i: Impact) => void): void {
    for (const b of this.bullets) {
      if (!b.alive) continue;
      b.prev.copy(b.pos);
      const a = b.pos;
      const e = this.tmpB.copy(a).addScaledVector(b.vel, dt);
      const wh = world.raycast(a.x, a.y, a.z, e.x, e.y, e.z);
      const th = targets.raycast(a, e);
      const dir = this.tmpA.copy(b.vel).normalize();
      if (th && (!wh || th.t <= wh.t)) {
        const point = a.clone().lerp(e, th.t);
        onImpact({ point, normal: th.normal, dir: dir.clone(), surface: 'target', target: th.target });
        b.pos.copy(point);
        b.alive = false;
      } else if (wh) {
        const point = a.clone().lerp(e, wh.t);
        onImpact({ point, normal: new THREE.Vector3(wh.nx, wh.ny, wh.nz), dir: dir.clone(), surface: wh.surface, target: null });
        b.pos.copy(point);
        b.alive = false;
      } else {
        b.pos.copy(e);
        b.travelled += b.vel.length() * dt;
        if (b.travelled > CONFIG.revolver.bulletRange) b.alive = false;
      }
    }
  }

  /** Interpolate tracer visuals between fixed steps. */
  sync(alpha: number): void {
    const len = CONFIG.revolver.tracerLength;
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
