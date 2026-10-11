import * as THREE from 'three';
import { boxGeo, part } from '../render/materials';
import { PAL } from '../render/palette';
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
}

/**
 * Low-poly cowboy built from boxes/cylinders. Forward is +Z.
 * Hierarchy: root → hips (legs, yaw = move) and root → upper (torso, head, arms, yaw = aim).
 */
export class PlayerModel {
  readonly root = new THREE.Group();
  /** Everything visible; tips over when dead. */
  private body = new THREE.Group();
  private hips = new THREE.Group();
  private upper = new THREE.Group();
  private legL = new THREE.Group();
  private legR = new THREE.Group();
  private armR = new THREE.Group();
  private armL = new THREE.Group();
  private head = new THREE.Group();
  private gun = new THREE.Group();
  /** Where the gun sits when holstered (in the hip holster). */
  private holsterSlot = new THREE.Group();
  /** Muzzle tip in model space (for effects). */
  readonly muzzle = new THREE.Object3D();

  private phase = 0;
  private time = 0;
  private hipsYaw = 0;
  private upperYaw = 0;
  private bob = 0;
  private fall = 0;

  constructor() {
    const r = this.body;
    this.root.add(r);
    r.add(this.hips, this.upper);
    this.hips.position.y = 0.88;
    this.upper.position.y = 0.88;

    // Legs: pivot at hip, boot at the bottom.
    for (const [leg, side] of [
      [this.legL, -1],
      [this.legR, 1],
    ] as const) {
      leg.position.set(side * 0.12, 0, 0);
      this.hips.add(leg);
      part(boxGeo(0.17, 0.62, 0.19, 1), PAL.denim, 0, 0, 0, leg);
      part(boxGeo(0.19, 0.26, 0.24, 1), PAL.darkBrown, 0, -0.62, 0.02, leg);
      part(boxGeo(0.2, 0.05, 0.3, 1), PAL.ink, 0, -0.85, 0.04, leg);
    }
    part(boxGeo(0.42, 0.14, 0.24), PAL.darkBrown, 0, 0.02, 0, this.hips); // belt
    part(boxGeo(0.09, 0.07, 0.04), PAL.brass, 0, 0.03, 0.13, this.hips); // buckle
    part(boxGeo(0.1, 0.2, 0.16, 1), PAL.brown, 0.24, -0.02, 0, this.hips); // holster
    this.holsterSlot.position.set(0.24, 0.08, 0);
    this.hips.add(this.holsterSlot);

    // Torso, poncho, bandana.
    part(boxGeo(0.4, 0.46, 0.24, -1), PAL.cream, 0, 0.06, 0, this.upper);
    const poncho = part(new THREE.ConeGeometry(0.46, 0.5, 4, 1), PAL.rustLight, 0, 0.42, 0, this.upper);
    poncho.rotation.y = Math.PI / 4;
    poncho.scale.set(1, 1, 0.75);
    const stripe = part(new THREE.ConeGeometry(0.47, 0.1, 4, 1, true), PAL.cream, 0, 0.27, 0, this.upper);
    stripe.rotation.y = Math.PI / 4;
    stripe.scale.set(1, 1, 0.76);
    part(boxGeo(0.24, 0.1, 0.2), PAL.red, 0, 0.62, 0.02, this.upper);

    // Head + hat.
    this.head.position.y = 0.66;
    this.upper.add(this.head);
    part(boxGeo(0.24, 0.26, 0.24, -1), PAL.skin, 0, 0, 0, this.head);
    part(boxGeo(0.26, 0.06, 0.06), PAL.brown, 0, 0.04, 0.11, this.head); // stubble
    part(new THREE.CylinderGeometry(0.36, 0.36, 0.04, 10), PAL.brown, 0, 0.27, 0, this.head);
    part(new THREE.CylinderGeometry(0.15, 0.19, 0.22, 8), PAL.brown, 0, 0.39, 0, this.head);
    part(new THREE.CylinderGeometry(0.195, 0.195, 0.05, 8), PAL.ink, 0, 0.31, 0, this.head);

    // Right (gun) arm: pivot at the shoulder, extended along -Y; rotated to point forward.
    this.armR.position.set(0.25, 0.5, 0);
    this.upper.add(this.armR);
    part(boxGeo(0.12, 0.48, 0.12, 1), PAL.cream, 0, 0, 0, this.armR);
    part(boxGeo(0.13, 0.1, 0.13, 1), PAL.skin, 0, -0.46, 0, this.armR);
    this.holsterSlot.add(this.gun); // starts holstered
    part(boxGeo(0.07, 0.09, 0.17), PAL.woodLight, 0, 0.02, -0.07, this.gun); // grip (hangs down when aimed)
    part(boxGeo(0.08, 0.1, 0.1), PAL.metal, 0, -0.03, 0.02, this.gun); // cylinder
    part(boxGeo(0.05, 0.32, 0.05, 1), PAL.metalLight, 0, 0.02, 0.06, this.gun).position.set(0, -0.06, 0.05); // barrel
    this.muzzle.position.set(0, -0.4, 0.05);
    this.gun.add(this.muzzle);

    // Left arm.
    this.armL.position.set(-0.25, 0.5, 0);
    this.upper.add(this.armL);
    part(boxGeo(0.12, 0.48, 0.12, 1), PAL.cream, 0, 0, 0, this.armL);
    part(boxGeo(0.12, 0.1, 0.12, 1), PAL.skin, 0, -0.46, 0, this.armL);
  }

  /** Visual muzzle position in world space (after the last animate()). */
  getMuzzleWorld(out: THREE.Vector3): THREE.Vector3 {
    this.root.updateWorldMatrix(true, true);
    return this.muzzle.getWorldPosition(out);
  }

  animate(dt: number, p: PlayerPose): void {
    this.time += dt;
    const moving = p.speed > 0.3;

    if (p.mounted) {
      // Root sits on the saddle anchor (in horse space); yaw relative to the horse.
      this.hipsYaw = 0;
      // Holstered: only glance towards the aim; drawn: the torso swings round to it.
      const aimRel = angleDelta(p.horseYaw, p.aimYaw);
      this.upperYaw = p.draw > 0.5 ? aimRel : clamp(aimRel, -0.6, 0.6);
      this.hips.rotation.y = 0;
      this.upper.rotation.y = this.upperYaw;
      // Straddle: thighs forward/outward, boots down along the flanks.
      this.legL.rotation.set(-0.45, 0, -0.42);
      this.legR.rotation.set(-0.45, 0, 0.42);
      this.hips.position.y = this.upper.position.y = 0.88;
      this.upper.rotation.x = 0;
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
      this.hips.rotation.y = this.hipsYaw;
      this.upper.rotation.y = this.upperYaw;

      // Walk cycle.
      const stride = p.sprint ? 1.25 : 0.95;
      if (moving) this.phase += dt * p.speed * (p.sprint ? 2.0 : 2.4) * dir;
      const amp = moving ? clamp(p.speed / 4, 0.4, 1) * (p.sprint ? 0.9 : 0.65) : 0;
      const swing = Math.sin(this.phase * stride) * amp;
      this.legL.rotation.set(damp(this.legL.rotation.x, swing, 20, dt), 0, 0);
      this.legR.rotation.set(damp(this.legR.rotation.x, -swing, 20, dt), 0, 0);

      const targetBob = moving ? Math.abs(Math.cos(this.phase * stride)) * 0.06 * amp : Math.sin(this.time * 2.2) * 0.012;
      this.bob = damp(this.bob, targetBob, 20, dt);
      this.hips.position.y = 0.88 + this.bob;
      this.upper.position.y = 0.88 + this.bob;
      this.upper.rotation.x = moving ? (p.sprint ? 0.12 : 0.05) : 0;
    }

    // Gun in the hand from the middle of the draw on, otherwise in the holster.
    const inHand = p.draw > 0.5;
    if (inHand !== (this.gun.parent === this.armR)) {
      (inHand ? this.armR : this.holsterSlot).add(this.gun);
      this.gun.position.set(0, inHand ? -0.52 : 0, 0);
      this.gun.rotation.set(0, 0, 0);
    }

    // Arms: gun arm points forward, kicks up on recoil, drops while reloading.
    // While drawing it goes rest → hand at the holster → aim (and back when holstering).
    const reloading = p.reload >= 0;
    let armPitch = -Math.PI / 2 - p.recoil * 0.55;
    let armRoll = 0;
    let armYaw = -0.12; // inward, so the barrel converges near the centre line
    if (reloading) {
      const k = Math.sin(Math.min(1, p.reload) * Math.PI);
      armPitch = -0.6 - 0.5 * k;
      armRoll = 0.5 * k;
      armYaw = 0;
      this.gun.rotation.z = Math.sin(p.reload * 30) * 0.15 * k;
    } else if (inHand) {
      this.gun.rotation.z = 0;
    }
    if (p.draw < 1) {
      const rest = p.mounted ? -0.3 : this.legL.rotation.x * 0.6 - 0.1;
      const [reachPitch, reachRoll] = [0.3, 0.12];
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
    this.armR.rotation.x = damp(this.armR.rotation.x, armPitch, reloading ? 14 : drawing ? 24 : 40, dt);
    this.armR.rotation.z = damp(this.armR.rotation.z, armRoll, 14, dt);
    this.armR.rotation.y = armYaw;
    this.upper.rotation.x += -p.recoil * 0.12;

    const freeArm = reloading ? -0.9 : p.mounted ? -0.5 : -this.legL.rotation.x * 0.6 - 0.1;
    this.armL.rotation.x = damp(this.armL.rotation.x, freeArm, 14, dt);
    this.armL.rotation.z = damp(this.armL.rotation.z, reloading ? -0.4 : -0.08, 14, dt);
    this.head.rotation.x = -p.recoil * 0.1;
    // The head turns the rest of the way to the aim (when holstered the torso only half-follows).
    const aimRel = p.mounted ? angleDelta(p.horseYaw, p.aimYaw) : p.aimYaw;
    this.head.rotation.y = damp(this.head.rotation.y, clamp(angleDelta(this.upperYaw, aimRel), -0.7, 0.7), 10, dt);

    // Fall backwards (about the facing's right axis, pivoting at the feet).
    this.fall = moveToward(this.fall, p.dead ? 1 : 0, dt * (p.dead ? 2.4 : 6));
    const k = this.fall * this.fall;
    this.body.quaternion.setFromAxisAngle(this.fallAxis.set(Math.cos(this.upperYaw), 0, -Math.sin(this.upperYaw)), -k * 1.5);
    this.body.position.y = k * 0.14;
  }

  private fallAxis = new THREE.Vector3();
}
