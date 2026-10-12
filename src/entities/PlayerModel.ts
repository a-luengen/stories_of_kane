import * as THREE from 'three';
import type { AppearanceConfig, WeaponDef } from '../data/types';
import { footfall } from '../audio/footSurface';
import { CharacterRig, LONG_GUN_TWIST } from '../render/CharacterRig';
import { CROUCH_LEAN, legTargets, type GaitState } from '../render/HumanGait';
import { angleDelta, clamp, damp, dampAngle, lerp, moveToward, smoothstep } from '../util/math';

export interface PlayerPose {
  /** Horizontal speed (units/s). */
  speed: number;
  sprint: boolean;
  /** World yaw the legs/hips face. */
  moveYaw: number;
  /** World yaw the torso/gun faces. */
  aimYaw: number;
  /** 0..1, decays after each shot (right hand). */
  recoil: number;
  /** Left hand's kick when dual wielding. */
  recoilL: number;
  /** Two guns in the active slot: both arms aim. */
  dual: boolean;
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
  /** 0 = standing … 1 = crouched. */
  crouch: number;
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
  /** A foot hit the ground (−1 left, +1 right), from the walk cycle. */
  onStep: ((side: -1 | 1) => void) | null = null;

  private phase = 0;
  private time = 0;
  private hipsYaw = 0;
  private upperYaw = 0;
  private fall = 0;
  /** 0..1: shouldering a long gun (both hands on it, torso turned). */
  private hold = 0;

  constructor(appearance: AppearanceConfig) {
    this.rig = new CharacterRig(appearance);
  }

  get root(): THREE.Group {
    return this.rig.root;
  }

  setAppearance(a: AppearanceConfig): void {
    this.rig.applyAppearance(a);
  }

  setWeapons(defs: readonly (WeaponDef | null)[], offDefs: readonly (WeaponDef | null)[] = []): void {
    this.rig.setWeapons(defs, offDefs);
  }

  animate(dt: number, p: PlayerPose): void {
    this.time += dt;
    const { hips, upper, head, armL, armR } = this.rig;
    const moving = p.speed > 0.3;

    if (p.mounted) {
      // Root sits on the saddle anchor (in horse space); yaw relative to the horse.
      this.hipsYaw = 0;
      // Holstered: only glance towards the aim; drawn: the torso swings round to it.
      const aimRel = angleDelta(p.horseYaw, p.aimYaw);
      this.upperYaw = p.draw > 0.5 ? aimRel : clamp(aimRel, -0.6, 0.6);
      hips.rotation.y = 0;
      upper.rotation.y = this.upperYaw;
      // Straddle: thighs forward/outward, shins down along the flanks.
      this.rig.poseLegs(legTargets({ ...this.gait(0, 0, p), mounted: true }), dt);
      this.rig.placePelvis(0.88, 0);
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

      // Gait: knees flex in the swing, feet flat in stance; the planted foot sets the hip height
      // (that's the bob). Sprinting lifts the knees higher with a longer stride.
      const prevPhase = this.phase;
      if (moving) this.phase += dt * p.speed * (p.sprint ? 1.9 : 2.3) * dir;
      const foot = moving && !p.dead ? footfall(prevPhase, this.phase) : 0;
      if (foot !== 0) this.onStep?.(foot);
      this.stride = damp(this.stride, moving ? clamp(p.speed / 4.3, 0.35, 1) : 0, 8, dt);
      this.run = damp(this.run, p.sprint && moving ? 1 : 0, 6, dt);
      const pelvis = this.rig.poseLegs(legTargets(this.gait(this.stride, this.run, p)), dt);
      this.rig.placePelvis(pelvis, p.crouch);
      // Crouched: torso a little forward, weapon held ready (aiming is unaffected).
      // Crouched: the torso folds forward over the feet (the arms and head level out the aim).
      upper.rotation.x = (moving ? lerp(0.05, 0.14, this.run) : 0) + CROUCH_LEAN * p.crouch;
    }

    // Active weapon in the hand from the middle of the draw on; everything else stowed.
    const inHand = p.draw > 0.5;
    this.rig.placeWeapons(p.active, inHand);
    const gun = p.active !== null ? this.rig.weaponMesh(p.active) : null;
    const offGun = p.dual && p.active !== null ? this.rig.offWeaponMesh(p.active) : null;

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
      if (offGun) offGun.rotation.z = -Math.sin(p.reload * 30 + 1) * 0.15 * k;
    } else if (gun && inHand) {
      gun.rotation.z = 0;
      if (offGun) offGun.rotation.z = 0;
    }
    if (p.draw < 1) {
      const rest = p.mounted ? -0.3 : this.legSwing(p) * 0.6 - 0.1;
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
    // Arms hang from the leaning torso: take the crouch lean back out of the aim.
    const lean = p.mounted ? 0 : CROUCH_LEAN * p.crouch;
    if (p.draw > 0.5) armPitch -= lean;
    armR.rotation.x = damp(armR.rotation.x, armPitch, reloading ? 14 : drawing ? 24 : 40, dt);
    armR.rotation.z = damp(armR.rotation.z, armRoll, 14, dt);
    armR.rotation.y = armYaw;
    upper.rotation.x += -Math.max(p.recoil, p.recoilL) * (p.longGun ? 0.06 : 0.12);

    if (p.dual) {
      // Dual wielding: the left arm mirrors the gun arm (aim, own recoil, draw from the belt, reload).
      let pitchL = -Math.PI / 2 - p.recoilL * 0.55;
      let rollL = 0;
      let yawL = 0.12;
      if (reloading) {
        const k = Math.sin(Math.min(1, p.reload) * Math.PI);
        pitchL = -0.6 - 0.5 * k;
        rollL = -0.5 * k;
        yawL = 0;
      }
      if (p.draw < 1) {
        const rest = p.mounted ? -0.3 : -this.legSwing(p) * 0.6 - 0.1;
        const t = p.draw;
        // The off-hand gun comes out of the front of the belt.
        if (t < 0.5) {
          pitchL = lerp(rest, 0.1, t * 2);
          rollL = lerp(-0.06, 0.35, t * 2);
        } else {
          pitchL = lerp(0.1, pitchL, t * 2 - 1);
          rollL = lerp(0.35, rollL, t * 2 - 1);
        }
        yawL *= Math.max(0, t * 2 - 1);
      }
      if (p.draw > 0.5) pitchL -= lean;
      armL.rotation.x = damp(armL.rotation.x, pitchL, reloading ? 14 : drawing ? 24 : 40, dt);
      armL.rotation.z = damp(armL.rotation.z, rollL, 14, dt);
      armL.rotation.y = yawL;
    } else {
      // Free arm swings, or supports the forestock of a drawn long gun.
      const support = p.longGun && !reloading ? Math.max(0, p.draw * 2 - 1) : 0;
      const freeArm = reloading ? -0.9 : p.mounted ? -0.5 : -this.legSwing(p) * 0.6 - 0.1;
      armL.rotation.x = damp(armL.rotation.x, lerp(freeArm, -Math.PI / 2 + 0.15 - lean, support), 14, dt);
      armL.rotation.y = damp(armL.rotation.y, 0.55 * support, 14, dt);
      armL.rotation.z = damp(armL.rotation.z, reloading ? -0.4 : -0.08 * (1 - support), 14, dt);
    }
    // A drawn long gun is shouldered with both hands: the torso turns left-shoulder-forward, the
    // right hand on the grip with the stock at the shoulder, the left one under the forestock.
    this.hold = damp(this.hold, p.longGun && !reloading && !p.dead ? clamp(p.draw * 2 - 1, 0, 1) : 0, 14, dt);
    const twist = LONG_GUN_TWIST * this.hold;
    if (this.hold > 0.001) {
      upper.rotation.y += twist;
      this.rig.holdLongGun(gun, this.hold, LONG_GUN_TWIST);
    } else if (gun) gun.rotation.set(0, 0, gun.rotation.z);
    head.rotation.x = -p.recoil * 0.1 - lean * 0.8;
    // The head turns the rest of the way to the aim (when holstered the torso only half-follows).
    const aimRel = p.mounted ? angleDelta(p.horseYaw, p.aimYaw) : p.aimYaw;
    head.rotation.y = damp(head.rotation.y, clamp(angleDelta(this.upperYaw + twist, aimRel), -0.7, 0.7), 10, dt);

    // Death: the knees buckle first, then the body tips over backwards (about the facing's right
    // axis, pivoting at the feet); lying down, the legs relax half straight.
    this.fall = moveToward(this.fall, p.dead ? 1 : 0, dt * (p.dead ? 1.6 : 6));
    const k = smoothstep(0.3, 1, this.fall) ** 2;
    this.rig.body.quaternion.setFromAxisAngle(this.fallAxis.set(Math.cos(this.upperYaw), 0, -Math.sin(this.upperYaw)), -k * 1.5);
    this.rig.body.position.y = k * 0.14;
  }

  /** Death buckle: knees give way first, then relax once lying down. */
  private get buckle(): number {
    return this.fall < 0.6 ? smoothstep(0, 0.35, this.fall) : lerp(1, 0.35, (this.fall - 0.6) / 0.4);
  }

  private gait(stride: number, run: number, p: PlayerPose): GaitState {
    return { phase: this.phase, stride, run, crouch: p.crouch, time: this.time, buckle: p.dead || this.fall > 0 ? this.buckle : 0, mounted: false, crossed: false };
  }

  private stride = 0;
  private run = 0;

  /** The left thigh's swing about its crouch / stand base (drives the arm swing). */
  private legSwing(p: PlayerPose): number {
    return this.rig.legL.rotation.x + 1.15 * p.crouch;
  }

  private fallAxis = new THREE.Vector3();
}
