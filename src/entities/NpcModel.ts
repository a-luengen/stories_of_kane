import * as THREE from 'three';
import type { AppearanceConfig, WeaponDef } from '../data/types';
import { footfall } from '../audio/footSurface';
import { CharacterRig, LONG_GUN_TWIST } from '../render/CharacterRig';
import { CROUCH_LEAN, legTargets } from '../render/HumanGait';
import { angleDelta, clamp, damp, dampAngle, lerp, moveToward, smoothstep } from '../util/math';

export interface NpcPose {
  /** Horizontal speed (units/s). */
  speed: number;
  /** World yaw the legs face when moving. */
  moveYaw: number;
  /** World yaw the head / torso want to face. */
  lookYaw: number;
  /** 0 = weapon stowed, 1 = drawn and aimed; values in between play the draw (or holster, going down). */
  draw: number;
  /** 0..1, decays after each shot (right hand). */
  recoil: number;
  /** Left hand's kick when dual wielding (optional for single-gun poses). */
  recoilL?: number;
  /** Two guns: both arms aim. */
  dual?: boolean;
  /** 0..1 progress, or -1 when not reloading. */
  reload: number;
  lean: boolean;
  talking: boolean;
  /** 0..1 startle (arms up to the head). */
  flinch: number;
  cower: boolean;
  /** 0 = standing … 1 = crouched (the NPC's crouch blend). */
  crouch: number;
  /** Crouched, looking at something on the ground. */
  inspect: boolean;
  dead: boolean;
  /** Sitting in a saddle (yaws are relative to the horse). */
  mounted: boolean;
}

/**
 * Townsperson animation on the shared CharacterRig (look and weapons come from data):
 * root → body (fall pivot) → hips (legs, yaw = move) and upper (torso, head, arms, yaw = look).
 */
export class NpcModel {
  readonly rig: CharacterRig;
  /** A foot hit the ground (−1 left, +1 right), from the walk cycle. */
  onStep: ((side: -1 | 1) => void) | null = null;
  private weapon: WeaponDef | null = null;
  private offHand: WeaponDef | null = null;

  private phase = 0;
  private time = 0;
  private hipsYaw = 0;
  private upperYaw = 0;
  private stride = 0;
  private run = 0;
  private fall = 0;
  /** 0..1: shouldering a long gun (both hands on it, torso turned). */
  private hold = 0;
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
  setWeapon(weapon: WeaponDef | null, offHand: WeaponDef | null = null): void {
    this.weapon = weapon;
    this.offHand = weapon ? offHand : null;
    this.rig.setWeapons([weapon], [this.offHand]);
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

    const { hips, upper, head, armL, armR } = this.rig;
    // Weapon follows the hand from the middle of the draw on.
    this.rig.placeWeapons(0, p.draw > 0.5 && !p.dead, true);

    // Yaw: legs follow movement (or the look direction when it twists too far), torso follows the look.
    let legYaw = moving ? p.moveYaw : this.hipsYaw;
    if (!moving) {
      const twist = angleDelta(this.hipsYaw, p.lookYaw);
      if (Math.abs(twist) > (aiming ? 0.9 : 1.2)) legYaw = p.lookYaw - Math.sign(twist) * 0.5;
    } else if (aiming && Math.abs(angleDelta(p.moveYaw, p.lookYaw)) > 1.9) {
      legYaw = p.moveYaw + Math.PI; // backpedal while aiming
    }
    if (p.lean || p.cower) legYaw = this.hipsYaw;
    this.hipsYaw = p.mounted ? 0 : dampAngle(this.hipsYaw, legYaw, 10, dt);
    const maxTwist = aiming ? Math.PI : 1.1;
    const want = this.hipsYaw + clamp(angleDelta(this.hipsYaw, p.lookYaw), -maxTwist, maxTwist);
    this.upperYaw = dampAngle(this.upperYaw, want, aiming ? 18 : 6, dt);
    hips.rotation.y = this.hipsYaw;
    upper.rotation.y = this.upperYaw;
    head.rotation.y = damp(head.rotation.y, clamp(angleDelta(this.upperYaw + LONG_GUN_TWIST * this.hold, p.lookYaw), -0.8, 0.8), 8, dt);

    // Gait (knees, feet flat in stance; the planted foot sets the hip height).
    const run = p.speed > 3.2;
    const prevPhase = this.phase;
    if (moving) this.phase += dt * p.speed * (run ? 1.9 : 2.4);
    const foot = moving && !p.mounted ? footfall(prevPhase, this.phase) : 0;
    if (foot !== 0) this.onStep?.(foot);
    this.stride = damp(this.stride, moving ? clamp(p.speed / 4.3, 0.3, 1) : 0, 8, dt);
    this.run = damp(this.run, run ? 1 : 0, 6, dt);
    // The NPC blends its crouch already; a startle dips the knees a little on top.
    this.crouch = Math.max(p.crouch, damp(this.crouch, p.flinch * 0.35, 6, dt));
    const swing = Math.sin(this.phase) * this.stride * 0.85; // arm swing, opposite to the legs
    const pelvis = this.rig.poseLegs(
      legTargets({
        phase: this.phase,
        stride: this.stride,
        run: this.run,
        crouch: this.crouch,
        time: this.time,
        buckle: this.fall > 0 ? this.buckle : 0,
        mounted: p.mounted,
        crossed: p.lean,
      }),
      dt,
      16,
    );
    this.rig.poseSkirt(this.crouch, swing);
    this.rig.placePelvis(p.mounted ? 0.88 : pelvis, p.mounted ? 0 : this.crouch);
    let pitch = moving ? (run ? 0.14 : 0.04) : 0;
    if (p.lean) pitch = -0.16;
    // Crouched, the torso folds forward over the feet (weight over the feet, not behind them).
    const lean = p.mounted ? 0 : CROUCH_LEAN * this.crouch;
    pitch += p.flinch * 0.3 + lean - p.recoil * 0.1;
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
      // Aim stays level however far the torso leans.
      const aim = this.longGun ? { x: -Math.PI / 2 + 0.08 - lean, y: -0.25, z: 0 } : { x: -Math.PI / 2 - p.recoil * 0.5 - lean, y: -0.12, z: 0 };
      const t = p.draw;
      r = t < 0.5 ? mix(r, reach, t * 2) : mix(reach, aim, (t - 0.5) * 2);
      if (this.longGun && t > 0.5) l = mix(l, { x: -Math.PI / 2 + 0.15 - lean, y: 0.55, z: 0 }, (t - 0.5) * 2);
      if (p.dual && this.offHand) {
        // Second gun: out of the belt, then aimed with the right one (its own kick).
        const reachL = { x: 0.1, y: 0, z: 0.35 };
        const aimL = { x: -Math.PI / 2 - (p.recoilL ?? 0) * 0.5 - lean, y: 0.12, z: 0 };
        l = t < 0.5 ? mix(l, reachL, t * 2) : mix(reachL, aimL, (t - 0.5) * 2);
      }
    }
    if (p.reload >= 0) {
      const k = Math.sin(Math.min(1, p.reload) * Math.PI);
      r = { x: -0.7 - 0.4 * k, y: 0, z: 0.4 * k };
      l = p.dual ? { x: -0.7 - 0.4 * k, y: 0, z: -0.4 * k } : { x: -0.9, y: 0.3, z: -0.3 };
    }
    if (p.talking && !aiming) l = { x: -0.7 + Math.sin(this.time * 5) * 0.25, y: 0, z: -0.25 };
    if (p.inspect && !aiming) {
      // One hand reaches to the ground in front and pokes about; the other rests on the knee.
      r = { x: -(0.75 + lean) + Math.sin(this.time * 2.3) * 0.12, y: 0, z: 0.12 + Math.sin(this.time * 1.7) * 0.08 };
      l = { x: -(0.35 + lean), y: 0, z: -0.25 };
    }
    // Arms over the head: startled, or cowering in a hiding spot.
    const cover = Math.max(p.flinch, p.cower ? this.crouch : 0);
    if (cover > 0.01 && !aiming) {
      r = mix(r, { x: -2.6, y: 0, z: -0.5 }, cover);
      l = mix(l, { x: -2.6, y: 0, z: 0.5 }, cover);
    }
    if (p.dead) {
      // Falling / lying: arms slack along the body (no aim, no flinch, nothing held).
      r = { x: 0.05, y: 0, z: 0.1 };
      l = { x: 0.05, y: 0, z: -0.1 };
    }
    const s = p.draw > 0 && p.draw < 1 ? 22 : 14;
    armR.rotation.set(damp(armR.rotation.x, r.x, s, dt), damp(armR.rotation.y, r.y, s, dt), damp(armR.rotation.z, r.z, s, dt));
    armL.rotation.set(damp(armL.rotation.x, l.x, 14, dt), damp(armL.rotation.y, l.y, 14, dt), damp(armL.rotation.z, l.z, 14, dt));
    // A drawn long gun is shouldered with both hands, the torso turned left-shoulder-forward.
    this.hold = damp(this.hold, this.longGun && p.reload < 0 && !p.dead ? clamp(p.draw * 2 - 1, 0, 1) : 0, 14, dt);
    const gun = this.rig.weaponMesh(0);
    if (this.hold > 0.001) {
      upper.rotation.y = this.upperYaw + LONG_GUN_TWIST * this.hold;
      this.rig.holdLongGun(gun, this.hold, LONG_GUN_TWIST);
    } else if (gun) gun.rotation.set(0, 0, gun.rotation.z);
    head.rotation.x = p.flinch * 0.3 - p.recoil * 0.08 + (p.lean ? 0.12 : 0) - lean * (p.inspect ? 0.2 : 0.8);

    // Death: the knees buckle first, then the body tips over backwards (about the torso's right
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
