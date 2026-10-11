import * as THREE from 'three';
import { PAL } from '../render/palette';

export type BurstKind = 'dust' | 'spark' | 'wood' | 'glass' | 'straw' | 'rock' | 'cactus' | 'hoof';

interface BurstStyle {
  colors: number[];
  count: [number, number];
  speed: [number, number];
  up: number;
  life: [number, number];
  size: [number, number];
  gravity: number;
  drag: number;
}

const STYLES: Record<BurstKind, BurstStyle> = {
  dust: { colors: [PAL.sandLight, PAL.sand, PAL.sandPale], count: [6, 9], speed: [0.6, 2.2], up: 1.4, life: [0.35, 0.7], size: [0.1, 0.2], gravity: -2, drag: 3 },
  spark: { colors: [PAL.brassLight, PAL.white, PAL.orange], count: [4, 7], speed: [3, 7], up: 2, life: [0.12, 0.25], size: [0.05, 0.08], gravity: -12, drag: 1 },
  wood: { colors: [PAL.woodPale, PAL.woodLight, PAL.wood], count: [5, 8], speed: [1.5, 4], up: 3, life: [0.4, 0.8], size: [0.06, 0.12], gravity: -16, drag: 1 },
  glass: { colors: [PAL.glass, PAL.skyPale, PAL.white, PAL.glassBrown], count: [12, 16], speed: [1.5, 4.5], up: 3, life: [0.4, 0.8], size: [0.05, 0.1], gravity: -18, drag: 0.6 },
  straw: { colors: [PAL.sandPale, PAL.sandLight, PAL.brassLight], count: [7, 11], speed: [1.5, 3.5], up: 2.5, life: [0.4, 0.9], size: [0.06, 0.11], gravity: -10, drag: 2 },
  rock: { colors: [PAL.rockLight, PAL.rock, PAL.sandLight], count: [5, 8], speed: [1.5, 3.5], up: 2.5, life: [0.3, 0.6], size: [0.06, 0.12], gravity: -16, drag: 1.5 },
  cactus: { colors: [PAL.cactusLight, PAL.cactus, PAL.sandPale], count: [5, 8], speed: [1, 3], up: 2, life: [0.3, 0.6], size: [0.06, 0.1], gravity: -14, drag: 2 },
  hoof: { colors: [PAL.sandLight, PAL.sand, PAL.sandDark], count: [2, 3], speed: [0.4, 1.4], up: 1.2, life: [0.3, 0.55], size: [0.12, 0.22], gravity: -1.5, drag: 3 },
};

const MAX = 900;

/** Pooled cube particles rendered with a single InstancedMesh. */
export class Particles {
  readonly mesh: THREE.InstancedMesh;
  private count = 0;
  private p = new Float32Array(MAX * 3);
  private v = new Float32Array(MAX * 3);
  private life = new Float32Array(MAX);
  private maxLife = new Float32Array(MAX);
  private size = new Float32Array(MAX);
  private grav = new Float32Array(MAX);
  private drag = new Float32Array(MAX);
  private col = new Float32Array(MAX * 3);
  private color = new THREE.Color();

  constructor() {
    this.mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial(), MAX);
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX * 3), 3);
    this.mesh.count = 0;
    this.mesh.frustumCulled = false;
  }

  /** Spawn a burst at `pos`, spraying around `dir` (surface normal or travel direction). */
  burst(kind: BurstKind, pos: THREE.Vector3, dir?: THREE.Vector3, scale = 1): void {
    const s = STYLES[kind];
    const n = Math.round(rand(s.count[0], s.count[1]) * scale);
    for (let i = 0; i < n; i++) {
      let vx = rand(-1, 1);
      let vy = rand(0, 1);
      let vz = rand(-1, 1);
      if (dir) {
        vx = vx * 0.7 + dir.x;
        vy = vy * 0.7 + Math.max(0, dir.y);
        vz = vz * 0.7 + dir.z;
      }
      const l = Math.hypot(vx, vy, vz) || 1;
      const sp = rand(s.speed[0], s.speed[1]);
      this.spawn(
        pos.x,
        pos.y,
        pos.z,
        (vx / l) * sp,
        (vy / l) * sp + rand(0, s.up),
        (vz / l) * sp,
        rand(s.life[0], s.life[1]),
        rand(s.size[0], s.size[1]),
        s.gravity,
        s.drag,
        s.colors[(Math.random() * s.colors.length) | 0],
      );
    }
  }

  spawn(x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number, size: number, gravity: number, drag: number, color: number): void {
    if (this.count >= MAX) return;
    const i = this.count++;
    this.p.set([x, y, z], i * 3);
    this.v.set([vx, vy, vz], i * 3);
    this.life[i] = this.maxLife[i] = life;
    this.size[i] = size;
    this.grav[i] = gravity;
    this.drag[i] = drag;
    this.color.setHex(color);
    this.col.set([this.color.r, this.color.g, this.color.b], i * 3);
  }

  update(dt: number): void {
    let i = 0;
    while (i < this.count) {
      this.life[i] -= dt;
      if (this.life[i] <= 0) {
        this.swapRemove(i);
        continue;
      }
      const k = i * 3;
      const damp = Math.exp(-this.drag[i] * dt);
      this.v[k] *= damp;
      this.v[k + 2] *= damp;
      this.v[k + 1] = this.v[k + 1] * damp + this.grav[i] * dt;
      this.p[k] += this.v[k] * dt;
      this.p[k + 1] += this.v[k + 1] * dt;
      this.p[k + 2] += this.v[k + 2] * dt;
      if (this.p[k + 1] < 0.03) {
        this.p[k + 1] = 0.03;
        this.v[k + 1] *= -0.3;
        this.v[k] *= 0.6;
        this.v[k + 2] *= 0.6;
      }
      i++;
    }
    this.writeInstances();
  }

  private swapRemove(i: number): void {
    const last = --this.count;
    if (i === last) return;
    this.p.copyWithin(i * 3, last * 3, last * 3 + 3);
    this.v.copyWithin(i * 3, last * 3, last * 3 + 3);
    this.col.copyWithin(i * 3, last * 3, last * 3 + 3);
    this.life[i] = this.life[last];
    this.maxLife[i] = this.maxLife[last];
    this.size[i] = this.size[last];
    this.grav[i] = this.grav[last];
    this.drag[i] = this.drag[last];
  }

  private writeInstances(): void {
    const m = this.mesh.instanceMatrix.array as Float32Array;
    const c = this.mesh.instanceColor!.array as Float32Array;
    for (let i = 0; i < this.count; i++) {
      const t = this.life[i] / this.maxLife[i];
      const s = this.size[i] * (0.35 + 0.65 * t);
      const o = i * 16;
      m[o] = s; m[o + 1] = 0; m[o + 2] = 0; m[o + 3] = 0;
      m[o + 4] = 0; m[o + 5] = s; m[o + 6] = 0; m[o + 7] = 0;
      m[o + 8] = 0; m[o + 9] = 0; m[o + 10] = s; m[o + 11] = 0;
      m[o + 12] = this.p[i * 3]; m[o + 13] = this.p[i * 3 + 1]; m[o + 14] = this.p[i * 3 + 2]; m[o + 15] = 1;
      c[i * 3] = this.col[i * 3];
      c[i * 3 + 1] = this.col[i * 3 + 1];
      c[i * 3 + 2] = this.col[i * 3 + 2];
    }
    this.mesh.count = this.count;
    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.instanceColor!.needsUpdate = true;
  }
}

function rand(a: number, b: number): number {
  return a + Math.random() * (b - a);
}
