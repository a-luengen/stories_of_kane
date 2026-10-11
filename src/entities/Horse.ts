import * as THREE from 'three';
import { CONFIG } from '../config';
import type { CollisionWorld } from '../world/Colliders';
import { HorseModel } from './HorseModel';
import { HorseMotor } from './HorseMotor';
import { lerpAngle } from '../util/math';

export class Horse {
  readonly motor = new HorseMotor(CONFIG.horse);
  readonly model = new HorseModel();
  readonly pos = new THREE.Vector3();
  readonly prevPos = new THREE.Vector3();
  private prevHeading = 0;
  ridden = false;
  /** Interpolated render yaw (heading changes from collisions are smoothed visually). */
  private renderYaw = 0;
  /** Last collision contact this step (for debug). */
  lastContact = false;

  get heading(): number {
    return this.motor.heading;
  }

  place(p: THREE.Vector3, heading: number): void {
    this.pos.copy(p);
    this.prevPos.copy(p);
    this.motor.heading = this.prevHeading = this.renderYaw = heading;
    this.motor.speed = 0;
  }

  /** @param target desired heading or null */
  update(dt: number, target: number | null, gallop: boolean, world: CollisionWorld): void {
    this.prevPos.copy(this.pos);
    this.prevHeading = this.motor.heading;
    this.motor.update(target, gallop, dt);

    const m = this.motor;
    this.pos.x += Math.sin(m.heading) * m.speed * dt;
    this.pos.z += Math.cos(m.heading) * m.speed * dt;
    const p = { x: this.pos.x, z: this.pos.z };
    const c = world.resolveCircle(p, CONFIG.horse.radius);
    this.pos.x = p.x;
    this.pos.z = p.z;
    this.lastContact = c.hit;
    if (c.hit) m.applyCollision(c.nx, c.nz, CONFIG.horse.collisionSpeedLoss);
  }

  /** Interpolated transform + animation for rendering. */
  sync(alpha: number, frameDt: number): void {
    this.model.root.position.lerpVectors(this.prevPos, this.pos, alpha);
    const yaw = lerpAngle(this.prevHeading, this.motor.heading, alpha);
    this.renderYaw = lerpAngle(this.renderYaw, yaw, 1 - Math.exp(-25 * frameDt));
    this.model.root.rotation.y = this.renderYaw;
    const m = this.motor;
    this.model.animate(frameDt, {
      speed: m.speed,
      gallopSpeed: CONFIG.horse.gallopSpeed,
      angularVelocity: m.angularVelocity,
      braking: m.mode === 'braking',
      pivoting: m.mode === 'pivoting',
      ridden: this.ridden,
    });
  }

  get renderYawValue(): number {
    return this.renderYaw;
  }
}
