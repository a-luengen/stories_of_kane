import * as THREE from 'three';
import { boxGeo, part } from '../render/materials';
import { PAL } from '../render/palette';
import { clamp, damp, lerp } from '../util/math';

export interface HorsePose {
  speed: number;
  gallopSpeed: number;
  angularVelocity: number;
  braking: boolean;
  pivoting: boolean;
  ridden: boolean;
}

const HIP_Y = 1.02;
const HIND_Z = -0.72;
const FRONT_Z = 0.72;

/** Leg phase offsets (fraction of a stride): FL, FR, HL, HR. */
const WALK_OFFSETS = [0.0, 0.5, 0.75, 0.25];
const GALLOP_OFFSETS = [0.0, 0.12, 0.55, 0.67];

interface Leg {
  hip: THREE.Group;
  knee: THREE.Group;
  front: boolean;
}

/** Low-poly horse, forward = +Z, with procedural gait, lean and rear-back. */
export class HorseModel {
  readonly root = new THREE.Group();
  /** Rider's model root attaches here (feet level of a seated rider). */
  readonly saddle = new THREE.Group();
  private pitchPivot = new THREE.Group();
  private body = new THREE.Group();
  private neck = new THREE.Group();
  private tail = new THREE.Group();
  private legs: Leg[] = [];
  private phase = 0;
  private time = 0;
  private rear = 0;
  private rearHold = 0;
  private lean = 0;
  /** Called once per stride beat at speed (for hoof dust). */
  onFootfall: ((localX: number, localZ: number) => void) | null = null;

  constructor() {
    const coat = PAL.woodLight;
    const dark = PAL.darkBrown;
    this.root.add(this.pitchPivot);
    this.pitchPivot.position.set(0, HIP_Y, HIND_Z);
    this.pitchPivot.add(this.body);
    this.body.position.set(0, -HIP_Y, -HIND_Z);
    const b = this.body;

    // Barrel + chest + rump.
    part(boxGeo(0.64, 0.74, 1.5), coat, 0, 1.36, 0, b);
    part(boxGeo(0.7, 0.7, 0.56), coat, 0, 1.47, -0.7, b); // rump (slightly higher)
    part(boxGeo(0.62, 0.74, 0.46), coat, 0, 1.42, 0.76, b); // chest
    part(boxGeo(0.52, 0.12, 1.1), PAL.wood, 0, 0.98, 0, b); // belly

    // Neck + head.
    this.neck.position.set(0, 1.6, 0.92);
    b.add(this.neck);
    const neckMesh = part(boxGeo(0.34, 0.95, 0.42, -1), coat, 0, 0, 0, this.neck);
    neckMesh.rotation.x = 0.62;
    const mane = part(boxGeo(0.1, 0.9, 0.16, -1), PAL.ink, 0, 0.05, -0.2, this.neck);
    mane.rotation.x = 0.62;
    const head = new THREE.Group();
    head.position.set(0, 0.78, 0.5);
    this.neck.add(head);
    part(boxGeo(0.3, 0.3, 0.42), coat, 0, 0, 0, head);
    part(boxGeo(0.24, 0.24, 0.36), coat, 0, -0.08, 0.32, head); // muzzle
    part(boxGeo(0.25, 0.1, 0.1), PAL.ink, 0, -0.14, 0.48, head); // nose
    part(boxGeo(0.06, 0.2, 0.26), PAL.cream, 0, 0.06, 0.22, head).position.set(0, 0.07, 0.27); // blaze
    for (const s of [-1, 1]) part(boxGeo(0.07, 0.16, 0.07, -1), coat, s * 0.1, 0.12, -0.1, head); // ears
    part(boxGeo(0.32, 0.05, 0.05), PAL.brown, 0, -0.02, 0.3, head); // bridle

    // Tail.
    this.tail.position.set(0, 1.62, -0.98);
    b.add(this.tail);
    const tailMesh = part(boxGeo(0.14, 0.85, 0.14, 1), PAL.ink, 0, 0, 0, this.tail);
    tailMesh.rotation.x = -0.35;

    // Saddle, blanket.
    part(boxGeo(0.72, 0.06, 0.8), PAL.red, 0, 1.71, -0.05, b);
    part(boxGeo(0.74, 0.05, 0.82), PAL.cream, 0, 1.69, -0.05, b);
    part(boxGeo(0.5, 0.14, 0.62), PAL.brown, 0, 1.78, -0.08, b);
    part(boxGeo(0.12, 0.14, 0.12), PAL.darkBrown, 0, 1.9, 0.18, b); // horn
    part(boxGeo(0.46, 0.12, 0.08), PAL.darkBrown, 0, 1.88, -0.36, b); // cantle
    this.saddle.position.set(0, 1.84 - 0.88, -0.08);
    b.add(this.saddle);

    // Legs: hip pivot → upper leg → knee pivot → lower leg + hoof.
    for (const [x, z, front] of [
      [0.2, FRONT_Z, true],
      [-0.2, FRONT_Z, true],
      [0.2, HIND_Z, false],
      [-0.2, HIND_Z, false],
    ] as const) {
      const hip = new THREE.Group();
      hip.position.set(x, HIP_Y + 0.1, z);
      b.add(hip);
      // Hind thighs are chunkier than forearms.
      part(front ? boxGeo(0.2, 0.55, 0.24, 1) : boxGeo(0.24, 0.6, 0.36, 1), coat, 0, front ? 0 : 0.06, front ? 0 : -0.04, hip);
      const knee = new THREE.Group();
      knee.position.set(0, -0.52, 0);
      hip.add(knee);
      part(boxGeo(0.13, 0.48, 0.14, 1), dark, 0, 0, 0, knee);
      part(boxGeo(0.16, 0.08, 0.18, 1), PAL.ink, 0, -0.46, 0.01, knee);
      this.legs.push({ hip, knee, front });
    }
  }

  animate(dt: number, p: HorsePose): void {
    this.time += dt;
    const s = clamp(p.speed / p.gallopSpeed, 0, 1);
    const pivotMotion = p.pivoting ? Math.min(1, Math.abs(p.angularVelocity) * 0.5) : 0;
    const gaitDrive = Math.max(s, pivotMotion * 0.35);
    const moving = gaitDrive > 0.01;

    // Stride frequency rises with speed (~1.2 Hz walk → ~2.4 Hz gallop).
    const prevPhase = this.phase;
    if (moving) this.phase += dt * lerp(1.2, 2.4, s) * (p.pivoting && s < 0.05 ? 0.8 : 1);
    const beats = s > 0.4 ? 2 : 1;
    if (this.onFootfall && s > 0.3 && Math.floor(prevPhase * beats) !== Math.floor(this.phase * beats)) {
      this.onFootfall(0, -0.7);
    }

    const gallopMix = clamp((s - 0.35) / 0.4, 0, 1);
    const amp = moving ? lerp(0.25, 0.85, gaitDrive) : 0;
    this.legs.forEach((leg, i) => {
      const off = lerp(WALK_OFFSETS[i], GALLOP_OFFSETS[i], gallopMix);
      const a = (this.phase + off) * Math.PI * 2;
      let hip = Math.sin(a) * amp * (leg.front ? 1 : 0.85);
      // Knee folds while the leg swings forward.
      let knee = Math.max(0, Math.cos(a)) * amp * (leg.front ? 1.3 : -1.1);
      if (leg.front && this.rear > 0.01) {
        hip = lerp(hip, 1.1 + Math.sin(this.time * 16 + i) * 0.15, this.rear); // forelegs paw the air
        knee = lerp(knee, 1.6, this.rear);
      }
      leg.hip.rotation.x = damp(leg.hip.rotation.x, -hip, 30, dt);
      leg.knee.rotation.x = damp(leg.knee.rotation.x, knee, 30, dt);
    });

    // Body bob and pitch rock.
    const bobAmp = lerp(0.015, 0.1, gaitDrive);
    const bob = moving ? Math.abs(Math.sin(this.phase * Math.PI * 2)) * bobAmp : Math.sin(this.time * 1.6) * 0.01;
    const rock = moving ? Math.sin(this.phase * Math.PI * 2) * 0.05 * gallopMix : 0;

    // Brief rear-back on hard braking from speed.
    if (p.braking && s > 0.45) this.rearHold = 0.45;
    this.rearHold = Math.max(0, this.rearHold - dt);
    this.rear = damp(this.rear, this.rearHold > 0 ? 1 : 0, this.rearHold > 0 ? 8 : 4, dt);

    this.pitchPivot.position.y = HIP_Y + bob;
    this.pitchPivot.rotation.x = rock - this.rear * 0.5;

    // Lean into turns (roll towards the inside, proportional to centripetal accel).
    const targetLean = clamp(-p.angularVelocity * p.speed * 0.022, -0.28, 0.28);
    this.lean = damp(this.lean, targetLean, 6, dt);
    this.root.rotation.z = this.lean;

    // Head: forward at speed, up when rearing, idle sway.
    this.neck.rotation.x = lerp(0.05, 0.35, s) * (1 - this.rear) - this.rear * 0.35 + (moving ? Math.sin(this.phase * Math.PI * 4) * 0.06 : Math.sin(this.time * 0.7) * 0.05);
    this.tail.rotation.x = lerp(0, -0.9, s) + Math.sin(this.time * 3) * 0.08;
    this.tail.rotation.z = Math.sin(this.time * 2.1) * (0.1 + s * 0.2);
  }
}
