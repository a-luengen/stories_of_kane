import * as THREE from 'three';
import { CONFIG } from '../config';
import type { Interactable } from '../Interaction';
import type { CircleCollider, CollisionWorld } from '../world/Colliders';
import { HorseModel } from './HorseModel';
import { HorseMotor } from './HorseMotor';
import { lerpAngle } from '../util/math';

export class Horse implements Interactable {
  readonly label = 'Mount horse';
  readonly range = CONFIG.player.mountRange;
  readonly priority = 0;
  readonly promptHeight = 2.6;
  /** Set by the game: whether mounting is possible right now, and what mounting does. */
  canMount: () => boolean = () => !this.ridden;
  onMount: () => void = () => {};
  readonly motor = new HorseMotor(CONFIG.horse);
  readonly model = new HorseModel();
  readonly pos = new THREE.Vector3();
  readonly prevPos = new THREE.Vector3();
  private prevHeading = 0;
  ridden = false;
  /** NPC riding it (wave-mode riders), or null. */
  riderNpc: object | null = null;
  /** Steering when not ridden by the player (enemy rider, arriving / leaving on its own, grazing). */
  driver: ((dt: number) => { target: number | null; gallop: boolean; cap?: number }) | null = null;
  /** Wears a saddle (only saddled horses can be ridden). */
  saddled = true;
  /** Kept inside this area (a paddock: minX, minZ, maxX, maxZ), or free. */
  pen: [number, number, number, number] | null = null;
  /** 0..1: head down, grazing. */
  graze = 0;
  /** Interpolated render yaw (heading changes from collisions are smoothed visually). */
  private renderYaw = 0;
  /** Last collision contact this step (for debug). */
  lastContact = false;

  get position(): THREE.Vector3 {
    return this.pos;
  }

  canInteract(): boolean {
    return this.canMount();
  }

  interact(): void {
    this.onMount();
  }

  /** Saddle on or off (unsaddled horses can't be ridden). */
  setSaddled(on: boolean): void {
    this.saddled = on;
    this.model.setTack(on);
  }

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
  update(dt: number, target: number | null, gallop: boolean, world: CollisionWorld, dynamic?: readonly CircleCollider[], cap = Infinity): void {
    this.prevPos.copy(this.pos);
    this.prevHeading = this.motor.heading;
    this.motor.update(target, gallop, dt, cap);

    const m = this.motor;
    this.pos.x += Math.sin(m.heading) * m.speed * dt;
    this.pos.z += Math.cos(m.heading) * m.speed * dt;
    const p = { x: this.pos.x, z: this.pos.z };
    const c = world.resolveCircle(p, CONFIG.horse.radius, dynamic);
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
      graze: this.graze,
    });
  }

  get renderYawValue(): number {
    return this.renderYaw;
  }
}
