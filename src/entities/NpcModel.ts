import * as THREE from 'three';
import type { Outfit, WeaponDef } from '../data/types';
import { boxGeo, part } from '../render/materials';
import { PAL } from '../render/palette';
import { angleDelta, clamp, damp, dampAngle, lerp, moveToward } from '../util/math';
import { buildWeaponMesh } from './WeaponModel';

export interface NpcPose {
  /** Horizontal speed (units/s). */
  speed: number;
  /** World yaw the legs face when moving. */
  moveYaw: number;
  /** World yaw the head / torso want to face. */
  lookYaw: number;
  /** 0 = weapon stowed, 1 = drawn and aimed; values in between play the draw (or holster, going down). */
  draw: number;
  /** 0..1, decays after each shot. */
  recoil: number;
  /** 0..1 progress, or -1 when not reloading. */
  reload: number;
  lean: boolean;
  talking: boolean;
  /** 0..1 startle (arms up to the head). */
  flinch: number;
  cower: boolean;
  dead: boolean;
}

/**
 * Low-poly townsperson assembled from an Outfit, forward = +Z. Same rig as the player:
 * root → body (fall pivot) → hips (legs, yaw = move) and upper (torso, head, arms, yaw = look).
 */
export class NpcModel {
  readonly root = new THREE.Group();
  private body = new THREE.Group();
  private hips = new THREE.Group();
  private upper = new THREE.Group();
  private legL = new THREE.Group();
  private legR = new THREE.Group();
  private armR = new THREE.Group();
  private armL = new THREE.Group();
  private head = new THREE.Group();
  private hand = new THREE.Group();
  private stowSlot = new THREE.Group();
  private skirt: THREE.Mesh | null = null;
  private weapon: THREE.Group | null = null;
  private longGun = false;
  /** Revolver with no holster: always in hand. */
  private alwaysInHand = false;

  private phase = 0;
  private time = 0;
  private hipsYaw = 0;
  private upperYaw = 0;
  private bob = 0;
  private fall = 0;
  private crouch = 0;
  private fallAxis = new THREE.Vector3();

  constructor(o: Outfit, weapon: WeaponDef | null, holster: boolean) {
    this.root.add(this.body);
    this.body.add(this.hips, this.upper);
    this.hips.position.y = 0.88;
    this.upper.position.y = 0.88;
    const female = o.body === 'female';
    const w = female ? 0.34 : 0.4;
    const sleeve = o.over?.kind === 'duster' ? o.over.color : o.shirt;

    // Legs: pivot at the hip, boot at the bottom.
    for (const [leg, side] of [
      [this.legL, -1],
      [this.legR, 1],
    ] as const) {
      leg.position.set(side * (female ? 0.1 : 0.12), 0, 0);
      this.hips.add(leg);
      part(boxGeo(0.17, 0.62, 0.19, 1), o.trousers, 0, 0, 0, leg);
      if (o.chaps !== undefined) {
        part(boxGeo(0.2, 0.58, 0.22, 1), o.chaps, 0, -0.02, 0, leg);
        part(boxGeo(0.04, 0.5, 0.2, 1), PAL.sandLight, side * 0.11, -0.06, 0, leg); // fringe
      }
      part(boxGeo(0.19, 0.26, 0.24, 1), o.boots, 0, -0.62, 0.02, leg);
      part(boxGeo(0.2, 0.05, 0.3, 1), PAL.ink, 0, -0.85, 0.04, leg);
    }
    if (o.dress) {
      this.skirt = part(new THREE.CylinderGeometry(w / 2 + 0.02, 0.36, 0.78, 8), o.dress.color, 0, -0.36, 0, this.hips);
      if (o.dress.trim !== undefined) part(new THREE.CylinderGeometry(0.37, 0.37, 0.06, 8), o.dress.trim, 0, -0.38, 0, this.skirt);
    }
    part(boxGeo(w + 0.02, 0.12, 0.24), o.dress ? o.dress.color : PAL.darkBrown, 0, 0.02, 0, this.hips); // belt / waist
    if (holster) {
      part(boxGeo(w + 0.04, 0.08, 0.26), PAL.brown, 0, -0.02, 0, this.hips); // gun belt
      part(boxGeo(0.09, 0.07, 0.04), PAL.brass, 0, -0.01, 0.13, this.hips);
      part(boxGeo(0.1, 0.22, 0.16, 1), PAL.brown, w / 2 + 0.04, -0.02, 0, this.hips);
    }

    // Torso and clothing.
    const torso = o.dress ? o.dress.color : o.shirt;
    part(boxGeo(w, 0.46, 0.24, -1), torso, 0, 0.06, 0, this.upper);
    if (o.over?.kind === 'vest') {
      part(boxGeo(w + 0.04, 0.36, 0.26, -1), o.over.color, 0, 0.16, 0, this.upper);
      part(boxGeo(0.08, 0.36, 0.02, -1), o.shirt, 0, 0.16, 0.13, this.upper); // open front
    } else if (o.over?.kind === 'duster') {
      part(boxGeo(w + 0.06, 0.48, 0.28, -1), o.over.color, 0, 0.06, 0, this.upper);
      part(boxGeo(0.08, 0.4, 0.02, -1), o.shirt, 0, 0.14, 0.145, this.upper);
      part(boxGeo(w + 0.08, 0.62, 0.05, 1), o.over.color, 0, 0.1, -0.14, this.upper); // coat tails
      for (const s of [-1, 1]) part(boxGeo(0.13, 0.62, 0.05, 1), o.over.color, s * (w / 2 - 0.03), 0.1, 0.14, this.upper);
      part(boxGeo(w + 0.1, 0.08, 0.3), o.over.color, 0, 0.56, -0.01, this.upper); // collar
    }
    if (o.bandana !== undefined) {
      part(boxGeo(0.26, 0.08, 0.26), o.bandana, 0, 0.6, 0, this.upper);
      part(boxGeo(0.14, 0.1, 0.04), o.bandana, 0, 0.52, 0.13, this.upper);
    }

    // Head, hair, hat.
    this.head.position.y = 0.66;
    this.upper.add(this.head);
    part(boxGeo(0.24, 0.26, 0.24, -1), o.skin, 0, 0, 0, this.head);
    for (const s of [-1, 1]) part(boxGeo(0.04, 0.04, 0.01), PAL.ink, s * 0.06, 0.15, 0.125, this.head); // eyes
    if (o.beard !== undefined) part(boxGeo(0.26, 0.07, 0.06), o.beard, 0, 0.04, 0.11, this.head);
    part(boxGeo(0.26, 0.07, 0.26), o.hair, 0, 0.245, -0.005, this.head);
    part(boxGeo(0.26, 0.16, 0.05), o.hair, 0, 0.17, -0.115, this.head);
    if (o.hairStyle === 'long') {
      part(boxGeo(0.28, 0.46, 0.07, 1), o.hair, 0, 0.27, -0.12, this.head);
      for (const s of [-1, 1]) part(boxGeo(0.04, 0.24, 0.12), o.hair, s * 0.13, 0.12, -0.04, this.head);
    } else if (o.hairStyle === 'bun') {
      part(boxGeo(0.13, 0.13, 0.11), o.hair, 0, 0.2, -0.17, this.head);
    }
    if (o.hat?.kind === 'cowboy') {
      part(new THREE.CylinderGeometry(0.36, 0.36, 0.04, 10), o.hat.color, 0, 0.27, 0, this.head);
      part(new THREE.CylinderGeometry(0.15, 0.19, 0.22, 8), o.hat.color, 0, 0.39, 0, this.head);
      part(new THREE.CylinderGeometry(0.195, 0.195, 0.05, 8), o.hat.band ?? PAL.ink, 0, 0.31, 0, this.head);
    } else if (o.hat?.kind === 'bonnet') {
      part(boxGeo(0.3, 0.3, 0.28), o.hat.color, 0, 0.16, -0.04, this.head);
      part(boxGeo(0.36, 0.07, 0.07), o.hat.color, 0, 0.31, 0.11, this.head); // brim framing the face
      for (const s of [-1, 1]) part(boxGeo(0.06, 0.3, 0.07), o.hat.color, s * 0.17, 0.15, 0.1, this.head);
      part(boxGeo(0.26, 0.03, 0.03), o.hat.band ?? o.hat.color, 0, 0.0, 0.11, this.head); // chin ribbon
    }

    // Arms: pivot at the shoulder, extended along -Y.
    for (const [arm, side] of [
      [this.armR, 1],
      [this.armL, -1],
    ] as const) {
      arm.position.set(side * (w / 2 + 0.05), 0.5, 0);
      this.upper.add(arm);
      part(boxGeo(0.12, 0.48, 0.12, 1), sleeve, 0, 0, 0, arm);
      part(boxGeo(0.12, 0.1, 0.12, 1), o.skin, 0, -0.46, 0, arm);
    }
    this.hand.position.set(0, -0.52, 0);
    this.armR.add(this.hand);

    if (weapon) {
      this.weapon = buildWeaponMesh(weapon.look);
      this.longGun = weapon.look.kind === 'longgun';
      if (weapon.carry === 'back') {
        // Slung diagonally across the back, barrel up over the left shoulder.
        this.stowSlot.position.set(0, 0.28, -0.17);
        this.stowSlot.rotation.z = Math.PI - 0.65;
        this.upper.add(this.stowSlot);
      } else if (holster) {
        this.stowSlot.position.set(w / 2 + 0.04, 0.06, 0.0);
        this.hips.add(this.stowSlot);
      } else {
        this.alwaysInHand = true;
      }
      (this.alwaysInHand ? this.hand : this.stowSlot).add(this.weapon);
    }
  }

  animate(dt: number, p: NpcPose): void {
    this.time += dt;
    const moving = p.speed > 0.3 && !p.dead;
    const aiming = p.draw > 0.5;

    // Weapon follows the hand from the middle of the draw on.
    if (this.weapon && !this.alwaysInHand) {
      const slot = p.draw > 0.5 ? this.hand : this.stowSlot;
      if (this.weapon.parent !== slot) slot.add(this.weapon);
    }

    // Yaw: legs follow movement (or the look direction when it twists too far), torso follows the look.
    let legYaw = moving ? p.moveYaw : this.hipsYaw;
    if (!moving) {
      const twist = angleDelta(this.hipsYaw, p.lookYaw);
      if (Math.abs(twist) > (aiming ? 0.9 : 1.2)) legYaw = p.lookYaw - Math.sign(twist) * 0.5;
    } else if (aiming && Math.abs(angleDelta(p.moveYaw, p.lookYaw)) > 1.9) {
      legYaw = p.moveYaw + Math.PI; // backpedal while aiming
    }
    if (p.lean || p.cower) legYaw = this.hipsYaw;
    this.hipsYaw = dampAngle(this.hipsYaw, legYaw, 10, dt);
    const maxTwist = aiming ? Math.PI : 1.1;
    const want = this.hipsYaw + clamp(angleDelta(this.hipsYaw, p.lookYaw), -maxTwist, maxTwist);
    this.upperYaw = dampAngle(this.upperYaw, want, aiming ? 18 : 6, dt);
    this.hips.rotation.y = this.hipsYaw;
    this.upper.rotation.y = this.upperYaw;
    this.head.rotation.y = damp(this.head.rotation.y, clamp(angleDelta(this.upperYaw, p.lookYaw), -0.8, 0.8), 8, dt);

    // Walk / run cycle.
    const run = p.speed > 3.2;
    const stride = run ? 1.25 : 0.95;
    if (moving) this.phase += dt * p.speed * (run ? 2.0 : 2.6);
    const amp = moving ? clamp(p.speed / 4, 0.35, 1) * (run ? 0.9 : 0.6) : 0;
    const swing = Math.sin(this.phase * stride) * amp;
    this.crouch = damp(this.crouch, p.cower ? 1 : 0, 6, dt);
    let legLx = swing;
    let legRx = -swing;
    let legRz = 0;
    if (p.lean) {
      legLx = -0.06;
      legRx = 0.12;
      legRz = -0.22; // ankles crossed
    }
    legLx = lerp(legLx, -1.45, this.crouch);
    legRx = lerp(legRx, -1.45, this.crouch);
    this.legL.rotation.set(damp(this.legL.rotation.x, legLx, 16, dt), 0, 0);
    this.legR.rotation.set(damp(this.legR.rotation.x, legRx, 16, dt), 0, damp(this.legR.rotation.z, legRz, 10, dt));
    if (this.skirt) this.skirt.rotation.x = swing * 0.12;

    const targetBob = moving ? Math.abs(Math.cos(this.phase * stride)) * 0.06 * amp : Math.sin(this.time * 2) * 0.01;
    this.bob = damp(this.bob, targetBob, 20, dt);
    const hipY = 0.88 + this.bob - this.crouch * 0.58 - p.flinch * 0.08;
    this.hips.position.y = hipY;
    this.upper.position.y = hipY;
    let pitch = moving ? (run ? 0.14 : 0.04) : 0;
    if (p.lean) pitch = -0.16;
    pitch += p.flinch * 0.3 + this.crouch * 0.35 - p.recoil * 0.1;
    this.upper.rotation.x = damp(this.upper.rotation.x, pitch, 12, dt);

    // Arms.
    const rest: Rot = { x: -swing * 0.7, y: 0, z: 0.06 };
    let r: Rot = { ...rest };
    let l: Rot = { x: swing * 0.7, y: 0, z: -0.06 };
    if (p.lean) {
      r = { x: -1.15, y: 0, z: -0.95 }; // arms folded
      l = { x: -1.0, y: 0, z: 0.95 };
    }
    if (this.alwaysInHand && p.draw <= 0.5) r = { x: rest.x * 0.4, y: 0, z: 0.1 }; // gun hangs at the side
    if (p.draw > 0) {
      // Rest → reach (hip or shoulder) → aim, as `draw` goes 0 → 0.5 → 1.
      const reach = this.longGun ? { x: -2.7, y: 0, z: 0.35 } : this.alwaysInHand ? rest : { x: 0.3, y: 0, z: 0.12 };
      const aim = this.longGun ? { x: -Math.PI / 2 + 0.08, y: -0.25, z: 0 } : { x: -Math.PI / 2 - p.recoil * 0.5, y: -0.12, z: 0 };
      const t = p.draw;
      r = t < 0.5 ? mix(r, reach, t * 2) : mix(reach, aim, (t - 0.5) * 2);
      if (this.longGun && t > 0.5) l = mix(l, { x: -Math.PI / 2 + 0.15, y: 0.55, z: 0 }, (t - 0.5) * 2);
    }
    if (p.reload >= 0) {
      const k = Math.sin(Math.min(1, p.reload) * Math.PI);
      r = { x: -0.7 - 0.4 * k, y: 0, z: 0.4 * k };
      l = { x: -0.9, y: 0.3, z: -0.3 };
    }
    if (p.talking && !aiming) l = { x: -0.7 + Math.sin(this.time * 5) * 0.25, y: 0, z: -0.25 };
    const cover = Math.max(p.flinch, this.crouch);
    if (cover > 0.01 && !aiming) {
      r = mix(r, { x: -2.6, y: 0, z: -0.5 }, cover);
      l = mix(l, { x: -2.6, y: 0, z: 0.5 }, cover);
    }
    const s = p.draw > 0 && p.draw < 1 ? 22 : 14;
    this.armR.rotation.set(damp(this.armR.rotation.x, r.x, s, dt), damp(this.armR.rotation.y, r.y, s, dt), damp(this.armR.rotation.z, r.z, s, dt));
    this.armL.rotation.set(damp(this.armL.rotation.x, l.x, 14, dt), damp(this.armL.rotation.y, l.y, 14, dt), damp(this.armL.rotation.z, l.z, 14, dt));
    this.head.rotation.x = p.flinch * 0.3 - p.recoil * 0.08 + (p.lean ? 0.12 : 0);

    // Fall backwards (about the torso's right axis, pivoting at the feet).
    this.fall = moveToward(this.fall, p.dead ? 1 : 0, dt * (p.dead ? 2.4 : 6));
    const k = this.fall * this.fall;
    this.body.quaternion.setFromAxisAngle(this.fallAxis.set(Math.cos(this.upperYaw), 0, -Math.sin(this.upperYaw)), -k * 1.5);
    this.body.position.y = k * 0.14;
  }

  /** Snap the facing (on spawn). */
  face(yaw: number): void {
    this.hipsYaw = this.upperYaw = yaw;
  }
}

type Rot = { x: number; y: number; z: number };
function mix(a: Rot, b: Rot, t: number): Rot {
  const u = clamp(t, 0, 1);
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: lerp(a.z, b.z, u) };
}
