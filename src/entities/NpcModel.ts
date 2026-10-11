import * as THREE from 'three';
import type { AppearanceConfig, WeaponDef } from '../data/types';
import { CharacterRig } from '../render/CharacterRig';
import { angleDelta, clamp, damp, dampAngle, lerp, moveToward } from '../util/math';

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
 * Townsperson animation on the shared CharacterRig (look and weapons come from data):
 * root → body (fall pivot) → hips (legs, yaw = move) and upper (torso, head, arms, yaw = look).
 */
export class NpcModel {
  readonly rig: CharacterRig;
  private weapon: WeaponDef | null = null;

  private phase = 0;
  private time = 0;
  private hipsYaw = 0;
  private upperYaw = 0;
  private bob = 0;
  private fall = 0;
  private crouch = 0;
  private fallAxis = new THREE.Vector3();

  constructor(appearance: AppearanceConfig, weapon: WeaponDef | null) {
    this.rig = new CharacterRig(appearance);
    this.setWeapon(weapon);
  }

  get root(): THREE.Group {
    return this.rig.root;
  }

  /** Change the carried weapon (e.g. after being looted). */
  setWeapon(weapon: WeaponDef | null): void {
    this.weapon = weapon;
    this.rig.setWeapons([weapon]);
    this.rig.placeWeapons(0, false, true);
  }

  private get longGun(): boolean {
    return this.weapon?.look.kind === 'longgun';
  }

  /** Revolver with no holster: always in hand. */
  private get alwaysInHand(): boolean {
    return this.weapon?.look.kind === 'pistol' && !this.rig.hasHolster;
  }

  animate(dt: number, p: NpcPose): void {
    this.time += dt;
    const moving = p.speed > 0.3 && !p.dead;
    const aiming = p.draw > 0.5;

    const { hips, upper, head, legL, legR, armL, armR } = this.rig;
    // Weapon follows the hand from the middle of the draw on.
    this.rig.placeWeapons(0, p.draw > 0.5, true);

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
    hips.rotation.y = this.hipsYaw;
    upper.rotation.y = this.upperYaw;
    head.rotation.y = damp(head.rotation.y, clamp(angleDelta(this.upperYaw, p.lookYaw), -0.8, 0.8), 8, dt);

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
    legL.rotation.set(damp(legL.rotation.x, legLx, 16, dt), 0, 0);
    legR.rotation.set(damp(legR.rotation.x, legRx, 16, dt), 0, damp(legR.rotation.z, legRz, 10, dt));
    if (this.rig.skirt) this.rig.skirt.rotation.x = swing * 0.12;

    const targetBob = moving ? Math.abs(Math.cos(this.phase * stride)) * 0.06 * amp : Math.sin(this.time * 2) * 0.01;
    this.bob = damp(this.bob, targetBob, 20, dt);
    const hipY = 0.88 + this.bob - this.crouch * 0.58 - p.flinch * 0.08;
    hips.position.y = hipY;
    upper.position.y = hipY;
    let pitch = moving ? (run ? 0.14 : 0.04) : 0;
    if (p.lean) pitch = -0.16;
    pitch += p.flinch * 0.3 + this.crouch * 0.35 - p.recoil * 0.1;
    upper.rotation.x = damp(upper.rotation.x, pitch, 12, dt);

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
    armR.rotation.set(damp(armR.rotation.x, r.x, s, dt), damp(armR.rotation.y, r.y, s, dt), damp(armR.rotation.z, r.z, s, dt));
    armL.rotation.set(damp(armL.rotation.x, l.x, 14, dt), damp(armL.rotation.y, l.y, 14, dt), damp(armL.rotation.z, l.z, 14, dt));
    head.rotation.x = p.flinch * 0.3 - p.recoil * 0.08 + (p.lean ? 0.12 : 0);

    // Fall backwards (about the torso's right axis, pivoting at the feet).
    this.fall = moveToward(this.fall, p.dead ? 1 : 0, dt * (p.dead ? 2.4 : 6));
    const k = this.fall * this.fall;
    this.rig.body.quaternion.setFromAxisAngle(this.fallAxis.set(Math.cos(this.upperYaw), 0, -Math.sin(this.upperYaw)), -k * 1.5);
    this.rig.body.position.y = k * 0.14;
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
