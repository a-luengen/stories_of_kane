import * as THREE from 'three';
import type { AppearanceConfig, WeaponDef } from '../data/types';
import { CharacterRig } from '../render/CharacterRig';
import { angleDelta, clamp, damp, dampAngle, lerp, moveToward } from '../util/math';

export interface PlayerPose {
  /** Horizontal speed (units/s). */
  speed: number;
  sprint: boolean;
  /** World yaw the legs/hips face. */
  moveYaw: number;
  /** World yaw the torso/gun faces. */
  aimYaw: number;
  /** 0..1, decays after each shot. */
  recoil: number;
  /** 0..1 progress, or -1 when not reloading. */
  reload: number;
  mounted: boolean;
  /** World yaw of the horse (mounted only). */
  horseYaw: number;
  dead: boolean;
  /** 0 = holstered, 1 = drawn; in between plays the draw / holster. */
  draw: number;
  /** Weapon slot being drawn / held, or null. */
  active: number | null;
  /** The active weapon is a two-handed long gun. */
  longGun: boolean;
}

/**
 * The player's animation on the shared CharacterRig. Look and carried weapons come from the
 * equipment (see setAppearance / setWeapons).
 * Hierarchy: root → body → hips (legs, yaw = move) and upper (torso, head, arms, yaw = aim).
 */
export class PlayerModel {
  readonly rig: CharacterRig;

  private phase = 0;
  private time = 0;
  private hipsYaw = 0;
  private upperYaw = 0;
  private bob = 0;
  private fall = 0;

  constructor(appearance: AppearanceConfig) {
    this.rig = new CharacterRig(appearance);
  }

  get root(): THREE.Group {
    return this.rig.root;
  }

  setAppearance(a: AppearanceConfig): void {
    this.rig.applyAppearance(a);
  }

  setWeapons(defs: readonly (WeaponDef | null)[]): void {
    this.rig.setWeapons(defs);
  }

  animate(dt: number, p: PlayerPose): void {
    this.time += dt;
    const { hips, upper, head, legL, legR, armL, armR } = this.rig;
    const moving = p.speed > 0.3;

    if (p.mounted) {
      // Root sits on the saddle anchor (in horse space); yaw relative to the horse.
      this.hipsYaw = 0;
      // Holstered: only glance towards the aim; drawn: the torso swings round to it.
      const aimRel = angleDelta(p.horseYaw, p.aimYaw);
      this.upperYaw = p.draw > 0.5 ? aimRel : clamp(aimRel, -0.6, 0.6);
      hips.rotation.y = 0;
      upper.rotation.y = this.upperYaw;
      // Straddle: thighs forward/outward, boots down along the flanks.
      legL.rotation.set(-0.45, 0, -0.42);
      legR.rotation.set(-0.45, 0, 0.42);
      hips.position.y = upper.position.y = 0.88;
      upper.rotation.x = 0;
    } else {
      // Backpedal when aiming far away from the movement direction.
      let legYaw = p.moveYaw;
      let dir = 1;
      if (moving && p.draw > 0.5 && Math.abs(angleDelta(p.moveYaw, p.aimYaw)) > 1.9) {
        legYaw = p.moveYaw + Math.PI;
        dir = -1;
      }
      if (!moving) {
        // Feet turn to follow the aim if the twist gets large.
        const twist = angleDelta(this.hipsYaw, p.aimYaw);
        legYaw = Math.abs(twist) > 0.9 ? p.aimYaw - Math.sign(twist) * 0.6 : this.hipsYaw;
      }
      this.hipsYaw = dampAngle(this.hipsYaw, legYaw, 14, dt);
      const upperTarget = p.draw > 0.5 ? p.aimYaw : this.hipsYaw + clamp(angleDelta(this.hipsYaw, p.aimYaw), -0.6, 0.6);
      this.upperYaw = dampAngle(this.upperYaw, upperTarget, p.draw > 0.5 ? 30 : 10, dt);
      hips.rotation.y = this.hipsYaw;
      upper.rotation.y = this.upperYaw;

      // Walk cycle.
      const stride = p.sprint ? 1.25 : 0.95;
      if (moving) this.phase += dt * p.speed * (p.sprint ? 2.0 : 2.4) * dir;
      const amp = moving ? clamp(p.speed / 4, 0.4, 1) * (p.sprint ? 0.9 : 0.65) : 0;
      const swing = Math.sin(this.phase * stride) * amp;
      legL.rotation.set(damp(legL.rotation.x, swing, 20, dt), 0, 0);
      legR.rotation.set(damp(legR.rotation.x, -swing, 20, dt), 0, 0);

      const targetBob = moving ? Math.abs(Math.cos(this.phase * stride)) * 0.06 * amp : Math.sin(this.time * 2.2) * 0.012;
      this.bob = damp(this.bob, targetBob, 20, dt);
      hips.position.y = 0.88 + this.bob;
      upper.position.y = 0.88 + this.bob;
      upper.rotation.x = moving ? (p.sprint ? 0.12 : 0.05) : 0;
    }

    // Active weapon in the hand from the middle of the draw on; everything else stowed.
    const inHand = p.draw > 0.5;
    this.rig.placeWeapons(p.active, inHand);
    const gun = p.active !== null ? this.rig.weaponMesh(p.active) : null;

    // Arms: gun arm points forward, kicks up on recoil, drops while reloading.
    // While drawing it goes rest → hand at the holster / over the shoulder → aim (and back when holstering).
    const reloading = p.reload >= 0;
    let armPitch = p.longGun ? -Math.PI / 2 + 0.08 - p.recoil * 0.25 : -Math.PI / 2 - p.recoil * 0.55;
    let armRoll = 0;
    let armYaw = p.longGun ? -0.25 : -0.12; // inward, so the barrel converges near the centre line
    if (reloading) {
      const k = Math.sin(Math.min(1, p.reload) * Math.PI);
      armPitch = -0.6 - 0.5 * k;
      armRoll = 0.5 * k;
      armYaw = 0;
      if (gun) gun.rotation.z = Math.sin(p.reload * 30) * 0.15 * k;
    } else if (gun && inHand) {
      gun.rotation.z = 0;
    }
    if (p.draw < 1) {
      const rest = p.mounted ? -0.3 : legL.rotation.x * 0.6 - 0.1;
      const [reachPitch, reachRoll] = p.longGun ? [-2.7, 0.35] : [0.3, 0.12];
      const t = p.draw;
      if (t < 0.5) {
        armPitch = lerp(rest, reachPitch, t * 2);
        armRoll = lerp(0.06, reachRoll, t * 2);
      } else {
        armPitch = lerp(reachPitch, armPitch, t * 2 - 1);
        armRoll = lerp(reachRoll, armRoll, t * 2 - 1);
      }
      armYaw *= Math.max(0, t * 2 - 1);
    }
    const drawing = p.draw > 0 && p.draw < 1;
    armR.rotation.x = damp(armR.rotation.x, armPitch, reloading ? 14 : drawing ? 24 : 40, dt);
    armR.rotation.z = damp(armR.rotation.z, armRoll, 14, dt);
    armR.rotation.y = armYaw;
    upper.rotation.x += -p.recoil * (p.longGun ? 0.06 : 0.12);

    // Free arm swings, or supports the forestock of a drawn long gun.
    const support = p.longGun && !reloading ? Math.max(0, p.draw * 2 - 1) : 0;
    const freeArm = reloading ? -0.9 : p.mounted ? -0.5 : -legL.rotation.x * 0.6 - 0.1;
    armL.rotation.x = damp(armL.rotation.x, lerp(freeArm, -Math.PI / 2 + 0.15, support), 14, dt);
    armL.rotation.y = damp(armL.rotation.y, 0.55 * support, 14, dt);
    armL.rotation.z = damp(armL.rotation.z, reloading ? -0.4 : -0.08 * (1 - support), 14, dt);
    head.rotation.x = -p.recoil * 0.1;
    // The head turns the rest of the way to the aim (when holstered the torso only half-follows).
    const aimRel = p.mounted ? angleDelta(p.horseYaw, p.aimYaw) : p.aimYaw;
    head.rotation.y = damp(head.rotation.y, clamp(angleDelta(this.upperYaw, aimRel), -0.7, 0.7), 10, dt);

    // Fall backwards (about the facing's right axis, pivoting at the feet).
    this.fall = moveToward(this.fall, p.dead ? 1 : 0, dt * (p.dead ? 2.4 : 6));
    const k = this.fall * this.fall;
    this.rig.body.quaternion.setFromAxisAngle(this.fallAxis.set(Math.cos(this.upperYaw), 0, -Math.sin(this.upperYaw)), -k * 1.5);
    this.rig.body.position.y = k * 0.14;
  }

  private fallAxis = new THREE.Vector3();
}
