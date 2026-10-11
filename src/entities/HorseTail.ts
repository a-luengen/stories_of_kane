import * as THREE from 'three';
import { CONFIG } from '../config';
import { part } from '../render/materials';
import { clamp, lerp } from '../util/math';

/** What drives the tail each frame (from the horse's motor and gait). */
export interface TailDrive {
  /** Speed as a fraction of gallop speed, 0..1. */
  speed01: number;
  /** Forward acceleration (units/s²): braking is negative. */
  accel: number;
  /** Turn rate (rad/s, + = towards the horse's local +X). */
  turnRate: number;
  pivoting: boolean;
  braking: boolean;
  /** Gait phase (strides), for the rhythmic sway. */
  gaitPhase: number;
}

interface Segment {
  pivot: THREE.Group;
  /** Absolute angles of the segment (rad): pitch (+ = back / up) and side (+ = towards local +X). */
  pitch: number;
  side: number;
  vPitch: number;
  vSide: number;
}

/**
 * Horse tail as a chain of tapering segments, one pivot each. The first segment springs towards a
 * state pose (hang, sway, stream, swish); every next one springs towards its parent's angle, so
 * motion ripples down the tail with a lag. Inertia comes from the horse's acceleration and turns.
 */
export class HorseTail {
  readonly root = new THREE.Group();
  private segs: Segment[] = [];
  private time = 0;
  private swishLeft = 0;
  private swishDir = 1;
  private swishTimer = 0;

  constructor(color: number) {
    const t = CONFIG.horse.tail;
    const n = t.segments;
    const len = t.length / n;
    let parent: THREE.Object3D = this.root;
    for (let i = 0; i < n; i++) {
      const k0 = i / n;
      const k1 = (i + 1) / n;
      // Thick at the dock, thinner down the tail, then fanning out into the switch at the end.
      const r = (k: number) => lerp(0.085, 0.035, k) + Math.max(0, k - 0.6) * 0.14;
      const pivot = new THREE.Group();
      pivot.position.y = i === 0 ? 0 : -len * 0.92;
      parent.add(pivot);
      const geo = new THREE.CylinderGeometry(r(k0), r(k1), len, 5);
      geo.translate(0, -len / 2, 0);
      const m = part(geo, color, 0, 0, 0, pivot);
      // Flatter side to side towards the end (a fanned switch rather than a rope).
      if (k0 >= 0.4) m.scale.set(1.25 + k0 * 0.4, 1, 0.75);
      this.segs.push({ pivot, pitch: 0.15, side: 0, vPitch: 0, vSide: 0 });
      parent = pivot;
    }
    this.swishTimer = this.nextSwish();
    this.apply();
  }

  private nextSwish(): number {
    const [lo, hi] = CONFIG.horse.tail.swishInterval;
    return lo + Math.random() * (hi - lo);
  }

  update(dt: number, d: TailDrive): void {
    if (dt <= 0) return;
    const t = CONFIG.horse.tail;
    this.time += dt;
    const s = d.speed01;
    const gallop = clamp((s - 0.45) / 0.35, 0, 1);
    const moving = s > 0.03;

    // Fly-swatting swishes when idling (and with the rotation when pivoting).
    this.swishTimer -= dt;
    if (this.swishTimer <= 0 && !moving) {
      this.swishLeft = 0.45;
      this.swishDir = Math.random() < 0.5 ? -1 : 1;
      this.swishTimer = this.nextSwish();
    }
    this.swishLeft = Math.max(0, this.swishLeft - dt);
    const swish = this.swishLeft > 0 ? Math.sin((1 - this.swishLeft / 0.45) * Math.PI) * 0.75 * this.swishDir : 0;

    // Root target: hang slightly off the rump at rest, lift and stream back with speed.
    let pitch = lerp(0.18, 0.32, Math.min(1, s * 2)) + gallop * 0.95;
    // Momentum: accelerating pushes it back, braking throws it forward / down.
    pitch += clamp(d.accel * 0.05, -0.9, 0.5);
    if (d.braking) pitch -= 0.35;
    let side = swish;
    // Gentle sway in rhythm with the gait (walk / trot), smaller at a gallop.
    if (moving) side += Math.sin(d.gaitPhase * Math.PI * 2) * 0.14 * (1 - gallop);
    // Turning: swings outward, against the turn.
    side += clamp(-d.turnRate * (0.18 + s * 0.25), -0.8, 0.8);
    if (d.pivoting) side += Math.sin(this.time * 9) * 0.35;
    pitch = clamp(pitch, -0.6, 1.4);

    // Integrate in small steps (stiff springs).
    const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
    const h = dt / steps;
    for (let k = 0; k < steps; k++) {
      this.segs.forEach((g, i) => {
        // Root chases the pose; each further segment chases its parent (softer down the chain).
        const parent = i === 0 ? null : this.segs[i - 1];
        const stiff = i === 0 ? t.stiffness : t.followStiffness * Math.pow(0.85, i - 1);
        const curl = i === 0 ? 0 : 0.04 * gallop; // the streaming tail curves up a little
        const tp = parent ? parent.pitch + curl : pitch;
        const ts = parent ? parent.side : side;
        // Flutter on the outer segments at a gallop.
        const flutter = i > 1 ? Math.sin(this.time * 19 + i * 1.7) * 0.06 * gallop : 0;
        g.vPitch += (stiff * (tp + flutter - g.pitch) - t.damping * g.vPitch) * h;
        g.vSide += (stiff * (ts + flutter * 0.7 - g.side) - t.damping * g.vSide) * h;
        g.pitch += g.vPitch * h;
        g.side += g.vSide * h;
      });
    }
    this.apply();
  }

  /** Absolute angles → local pivot rotations. */
  private apply(): void {
    let pp = 0;
    let ps = 0;
    for (const g of this.segs) {
      g.pivot.rotation.set(g.pitch - pp, 0, g.side - ps, 'XZY');
      pp = g.pitch;
      ps = g.side;
    }
  }

  /** Root angles (for tests / debugging). */
  get rootPitch(): number {
    return this.segs[0].pitch;
  }

  get tipPitch(): number {
    return this.segs[this.segs.length - 1].pitch;
  }

  get tipSide(): number {
    return this.segs[this.segs.length - 1].side;
  }
}
