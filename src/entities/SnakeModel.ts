import * as THREE from 'three';
import { boxGeo, part } from '../render/materials';
import { PAL } from '../render/palette';
import { damp, lerp } from '../util/math';
import type { AnimalModelPose, AnimalView } from './AnimalModel';
import { ellip } from './HorseModel';

const SEGMENTS = 12;
const SEG_LEN = 0.11;
/** Built a bit larger than life, so it still reads as a snake at the game's pixel size. */
const SCALE = 1.5;

/**
 * A rattlesnake: a chain of body segments (forward = +Z) that slithers in waves, lies coiled,
 * rears its head and shakes its rattle to warn, and lunges to strike.
 */
export class SnakeModel implements AnimalView {
  readonly root = new THREE.Group();
  onStep: ((leg: number, speed01: number) => void) | null = null;
  private body = new THREE.Group();
  private segs: THREE.Object3D[] = [];
  private phase = 0;
  private time = Math.random() * 10;
  private coil = 0;
  private raise = 0;
  private strike = 0;
  private dead = 0;

  constructor() {
    this.body.scale.setScalar(SCALE);
    this.root.add(this.body);
    for (let i = 0; i < SEGMENTS; i++) {
      const g = new THREE.Group();
      this.body.add(g);
      const t = i / (SEGMENTS - 1);
      const r = lerp(0.065, 0.025, t * t);
      // Diamond-backed: dark bands on brown, dark enough to stand out on the sand.
      part(ellip(r, r * 0.75, SEG_LEN * 0.75), i % 3 === 1 ? PAL.darkBrown : PAL.wood, 0, r * 0.75, 0, g);
      this.segs.push(g);
    }
    const head = this.segs[0];
    part(ellip(0.075, 0.045, 0.1), PAL.wood, 0, 0.05, 0.05, head);
    for (const s of [-1, 1]) part(boxGeo(0.02, 0.02, 0.02), PAL.ink, s * 0.05, 0.075, 0.08, head);
    const tail = this.segs[SEGMENTS - 1];
    for (let k = 0; k < 3; k++) part(ellip(0.025, 0.02, 0.025), PAL.sandPale, 0, 0.03, -0.03 - k * 0.04, tail); // the rattle
  }

  snapDead(): void {
    this.dead = 1;
  }

  animate(dt: number, p: AnimalModelPose): void {
    // Dead: it lies still.
    if (p.dead && this.dead >= 1) return;
    this.time += dt;
    const moving = p.speed > 0.05 && !p.dead;
    if (moving) this.phase += dt * (1 + p.speed * 1.5);
    this.coil = damp(this.coil, !moving && !p.dead && (p.pose === 'rest' || p.alert) ? 1 : 0, 3, dt);
    this.raise = damp(this.raise, p.alert && !p.dead ? 1 : 0, 6, dt);
    this.strike = damp(this.strike, p.dead ? 0 : p.attack, 25, dt);
    this.dead = p.dead ? Math.min(1, this.dead + dt * 3) : 0;
    const wave = moving ? 0.09 : 0.02;
    const len = SEGMENTS * SEG_LEN;
    let prevYaw = 0;
    this.segs.forEach((seg, i) => {
      // Stretched out in a wave (head at the front), or wound into a coil, head on top.
      const sx = Math.sin(this.phase * 5 - i * 0.7) * wave * Math.min(1, i / 3);
      const sz = len / 2 - i * SEG_LEN;
      const a = i * 0.72;
      const r = 0.06 + i * 0.016;
      const cx = Math.cos(a) * r;
      const cz = Math.sin(a) * r;
      let x = lerp(sx, cx, this.coil);
      let z = lerp(sz, cz, this.coil);
      let y = this.coil * Math.max(0, 0.06 - i * 0.008);
      // Warning: the neck reared up in an S, the rattle raised and buzzing.
      if (i < 4) {
        y += this.raise * 0.28 * (1 - i / 4);
        z += this.strike * 0.55 * (1 - i / 4); // strike: the head shoots forward
      }
      if (i >= SEGMENTS - 2) {
        y += this.raise * 0.1;
        x += this.raise * Math.sin(this.time * 70) * 0.012;
      }
      y *= 1 - this.dead;
      seg.position.set(x, y, z);
      // Each segment faces along the body (towards the one in front).
      const front = i > 0 ? this.segs[i - 1].position : null;
      const yaw = front ? Math.atan2(front.x - x, front.z - z) : prevYaw;
      seg.rotation.set(0, yaw, this.dead * 2.6);
      prevYaw = yaw;
    });
    // The head looks along the first segment, or at whoever it's watching.
    this.segs[0].rotation.y = p.look !== null && !p.dead ? p.look : this.segs.length > 1 ? Math.atan2(-this.segs[1].position.x + this.segs[0].position.x, -this.segs[1].position.z + this.segs[0].position.z) : 0;
  }
}
