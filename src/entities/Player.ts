import * as THREE from 'three';
import { CONFIG } from '../config';
import { WEAPONS } from '../data/weapons';
import { segmentVsCylinder, type CollisionWorld, type CircleCollider } from '../world/Colliders';
import type { BurstKind } from './Particles';
import { PlayerModel } from './PlayerModel';
import type { HitInfo, Target } from './Targets';
import { WeaponState, type ShotRequest } from './Weapon';
import { dirToYaw, moveToward, yawToX, yawToZ } from '../util/math';

export interface PlayerInput {
  /** World-space desired direction on XZ (normalized) or null. */
  moveX: number;
  moveZ: number;
  sprint: boolean;
  fireHeld: boolean;
  reload: boolean;
  /** Put the weapon away. */
  holster: boolean;
  /** Aim point in world space: the surface under the crosshair. */
  aim: THREE.Vector3;
}

export class Player implements Target {
  readonly model = new PlayerModel();
  readonly weapon = new WeaponState(WEAPONS.revolver);
  readonly pos = new THREE.Vector3();
  readonly prevPos = new THREE.Vector3();
  readonly vel = new THREE.Vector2();
  moveYaw = 0;
  aimYaw = 0;
  sprinting = false;

  recoil = 0;
  /** 0 = holstered, 1 = drawn; in between plays the draw (or holster). */
  draw = 0;
  private drawTarget = 0;
  /** Seconds since the last shot (or draw), for auto-holstering. */
  private idle = 0;
  hp = CONFIG.player.maxHp;
  dead = false;
  /** 1 right after taking damage, fades to 0 (HUD flash). */
  hurt = 0;
  private sinceHurt = 0;

  /** Set while riding: horse speed and yaw, used for spread and pose. */
  mounted = false;
  mountSpeed = 0;
  mountYaw = 0;

  get object(): THREE.Object3D {
    return this.model.root;
  }

  get ammo(): number {
    return this.weapon.ammo;
  }

  /** 0..1 reload progress or -1. */
  get reloadProgress(): number {
    return this.weapon.reloadProgress;
  }

  speed(): number {
    return this.vel.length();
  }

  setPosition(p: THREE.Vector3): void {
    this.pos.copy(p);
    this.prevPos.copy(p);
  }

  /** Movement on foot. When mounted the Game moves the player with the horse. */
  updateMovement(dt: number, input: PlayerInput, world: CollisionWorld, dynamic: readonly CircleCollider[]): void {
    this.prevPos.copy(this.pos);
    if (this.mounted) return;
    if (this.dead) input = { ...input, moveX: 0, moveZ: 0 };
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

  /** Aim, reload and fire. Returns a shot when the weapon fires this step. */
  updateWeapon(dt: number, input: PlayerInput): ShotRequest | null {
    const ax = input.aim.x - this.pos.x;
    const az = input.aim.z - this.pos.z;
    if (ax * ax + az * az > 0.01) this.aimYaw = dirToYaw(ax, az);

    this.weapon.update(dt);
    this.recoil = moveToward(this.recoil, 0, dt * 5);

    // Holster on request or after a while without shooting; shooting or reloading draws again.
    this.idle += dt;
    if (input.holster || (this.drawTarget === 1 && this.idle >= CONFIG.player.autoHolsterTime)) this.holster();
    else if ((input.fireHeld || input.reload) && this.drawTarget === 0) {
      this.drawTarget = 1;
      this.idle = 0;
    }
    this.draw = moveToward(this.draw, this.drawTarget, dt / this.weapon.def.drawTime);
    if (input.reload) this.reloadQueued = true;
    if (this.draw < 1) return null;
    if (this.reloadQueued) {
      this.weapon.startReload();
      this.reloadQueued = false;
    }
    if (!input.fireHeld) return null;

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

    const pc = CONFIG.player;
    let spreadMul = 1;
    if (this.mounted) spreadMul = pc.spreadMountedMul + this.mountSpeed * pc.spreadMountedPerSpeed;
    else if (this.speed() > 0.5) spreadMul = pc.spreadMovingMul;
    const shot = this.weapon.fire(origin, input.aim, spreadMul, this.aimYaw);
    if (shot) {
      this.recoil = 1;
      this.idle = 0;
    }
    return shot;
  }

  get drawn(): boolean {
    return this.drawTarget === 1;
  }

  /** Put the gun away (cancels a reload in progress). `instant` skips the animation. */
  holster(instant = false): void {
    this.drawTarget = 0;
    this.reloadQueued = false;
    this.weapon.cancelReload();
    if (instant) this.draw = 0;
  }

  private reloadQueued = false;

  // ---------------------------------------------------------------- Target (hitbox)

  test(a: THREE.Vector3, b: THREE.Vector3): { t: number; normal: THREE.Vector3 } | null {
    if (this.dead) return null;
    const [y0, y1] = this.mounted ? [1.0, 2.95] : [0, 1.85];
    const h = segmentVsCylinder(a.x, a.y, a.z, b.x, b.y, b.z, this.pos.x, this.pos.z, 0.38, y0, y1);
    return h ? { t: h.t, normal: new THREE.Vector3(h.nx, h.ny, h.nz) } : null;
  }

  hit(_point: THREE.Vector3, _dir: THREE.Vector3, info: HitInfo): BurstKind {
    if (!this.dead) {
      this.hp = Math.max(0, this.hp - info.damage);
      this.sinceHurt = 0;
      this.hurt = 1;
    }
    return 'blood';
  }

  update(dt: number): void {
    this.hurt = Math.max(0, this.hurt - dt * 2.5);
    if (this.dead) return;
    this.sinceHurt += dt;
    const pc = CONFIG.player;
    if (this.sinceHurt > pc.regenDelay) this.hp = Math.min(pc.maxHp, this.hp + pc.regenRate * dt);
  }

  /** Back on your feet with full health and a full gun. */
  revive(p: THREE.Vector3): void {
    this.dead = false;
    this.hp = CONFIG.player.maxHp;
    this.weapon.refill();
    this.vel.set(0, 0);
    this.setPosition(p);
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
      dead: this.dead,
      draw: this.draw,
    });
  }
}
