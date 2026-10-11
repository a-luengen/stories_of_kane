import * as THREE from 'three';
import { CONFIG } from '../config';
import type { CollisionWorld, CircleCollider } from '../world/Colliders';
import { PlayerModel } from './PlayerModel';
import { dirToYaw, moveToward, yawToX, yawToZ } from '../util/math';

export interface PlayerInput {
  /** World-space desired direction on XZ (normalized) or null. */
  moveX: number;
  moveZ: number;
  sprint: boolean;
  fireHeld: boolean;
  reload: boolean;
  /** Aim point in world space. */
  aim: THREE.Vector3;
}

export interface ShotRequest {
  origin: THREE.Vector3;
  dir: THREE.Vector3;
}

export class Player {
  readonly model = new PlayerModel();
  readonly pos = new THREE.Vector3();
  readonly prevPos = new THREE.Vector3();
  readonly vel = new THREE.Vector2();
  moveYaw = 0;
  aimYaw = 0;
  sprinting = false;

  ammo = CONFIG.revolver.magazine;
  private cooldown = 0;
  /** Remaining reload time, 0 when not reloading. */
  reloadLeft = 0;
  recoil = 0;

  /** Set while riding: horse speed and yaw, used for spread and pose. */
  mounted = false;
  mountSpeed = 0;
  mountYaw = 0;

  get reloading(): boolean {
    return this.reloadLeft > 0;
  }

  /** 0..1 reload progress or -1. */
  get reloadProgress(): number {
    return this.reloading ? 1 - this.reloadLeft / CONFIG.revolver.reloadTime : -1;
  }

  speed(): number {
    return this.vel.length();
  }

  setPosition(p: THREE.Vector3): void {
    this.pos.copy(p);
    this.prevPos.copy(p);
  }

  startReload(): void {
    if (!this.reloading && this.ammo < CONFIG.revolver.magazine) this.reloadLeft = CONFIG.revolver.reloadTime;
  }

  /** Movement on foot. When mounted the Game moves the player with the horse. */
  updateMovement(dt: number, input: PlayerInput, world: CollisionWorld, dynamic: readonly CircleCollider[]): void {
    this.prevPos.copy(this.pos);
    if (this.mounted) return;
    const pc = CONFIG.player;
    const hasInput = input.moveX !== 0 || input.moveZ !== 0;
    this.sprinting = hasInput && input.sprint;
    const max = this.sprinting ? pc.sprintSpeed : pc.walkSpeed;
    const tx = input.moveX * max;
    const tz = input.moveZ * max;
    const rate = (hasInput ? pc.acceleration : pc.deceleration) * dt;
    // Move the velocity vector towards the target velocity (not per-axis, to keep diagonals clean).
    const dx = tx - this.vel.x;
    const dz = tz - this.vel.y;
    const dl = Math.hypot(dx, dz);
    if (dl <= rate) this.vel.set(tx, tz);
    else this.vel.set(this.vel.x + (dx / dl) * rate, this.vel.y + (dz / dl) * rate);

    this.pos.x += this.vel.x * dt;
    this.pos.z += this.vel.y * dt;
    const p = { x: this.pos.x, z: this.pos.z };
    const c = world.resolveCircle(p, pc.radius, dynamic);
    this.pos.x = p.x;
    this.pos.z = p.z;
    if (c.hit) {
      // Remove velocity into the obstacle so we slide instead of sticking.
      const vn = this.vel.x * c.nx + this.vel.y * c.nz;
      if (vn < 0) this.vel.set(this.vel.x - vn * c.nx, this.vel.y - vn * c.nz);
    }
    if (this.vel.lengthSq() > 0.04) this.moveYaw = dirToYaw(this.vel.x, this.vel.y);
  }

  /** Aim, reload and fire. Returns a shot when the revolver fires this step. */
  updateWeapon(dt: number, input: PlayerInput): ShotRequest | null {
    const rc = CONFIG.revolver;
    const ax = input.aim.x - this.pos.x;
    const az = input.aim.z - this.pos.z;
    if (ax * ax + az * az > 0.01) this.aimYaw = dirToYaw(ax, az);

    this.cooldown = Math.max(0, this.cooldown - dt);
    this.recoil = moveToward(this.recoil, 0, dt * 5);

    if (this.reloading) {
      this.reloadLeft -= dt;
      if (this.reloadLeft <= 0) {
        this.reloadLeft = 0;
        this.ammo = rc.magazine;
      }
    }
    if (input.reload) this.startReload();

    if (!input.fireHeld || this.cooldown > 0 || this.reloading) return null;
    if (this.ammo <= 0) {
      this.startReload();
      return null;
    }

    this.ammo--;
    this.cooldown = rc.fireCooldown;
    this.recoil = 1;

    // Muzzle in world space, computed from the logical pose (right hand, shoulder height).
    const muzzleH = this.mounted ? 2.34 : 1.38; // shoulder height of the gun arm (see PlayerModel/HorseModel)
    const fx = yawToX(this.aimYaw);
    const fz = yawToZ(this.aimYaw);
    // The gun arm sits on the model's local +X, which is (fz, -fx) in world space.
    const sx = fz;
    const sz = -fx;
    const origin = new THREE.Vector3(
      this.pos.x + fx * 0.75 + sx * 0.18,
      this.pos.y + muzzleH,
      this.pos.z + fz * 0.75 + sz * 0.18,
    );

    // Aim at the picked point at aim-plane height; clamp the vertical slope for close shots.
    let dx = input.aim.x - origin.x;
    let dz = input.aim.z - origin.z;
    const horiz = Math.max(Math.hypot(dx, dz), 0.001);
    if (horiz < 0.6) {
      dx = fx;
      dz = fz;
    }
    const hl = Math.max(Math.hypot(dx, dz), 0.001);
    const slopeDist = Math.max(horiz, 5);
    const dy = ((rc.aimPlaneHeight - origin.y) / slopeDist) * hl;

    let spread = rc.spreadStanding;
    if (this.mounted) spread = rc.spreadMounted + this.mountSpeed * rc.spreadMountedPerSpeed;
    else if (this.speed() > 0.5) spread = rc.spreadMoving;
    const yawJitter = (Math.random() - 0.5) * 2 * spread;
    const yaw = dirToYaw(dx, dz) + yawJitter;
    const dir = new THREE.Vector3(Math.sin(yaw) * hl, dy, Math.cos(yaw) * hl).normalize();
    return { origin, dir };
  }

  animate(dt: number): void {
    this.model.animate(dt, {
      speed: this.mounted ? 0 : this.speed(),
      sprint: this.sprinting,
      moveYaw: this.moveYaw,
      aimYaw: this.aimYaw,
      recoil: this.recoil,
      reload: this.reloadProgress,
      mounted: this.mounted,
      horseYaw: this.mountYaw,
    });
  }
}
