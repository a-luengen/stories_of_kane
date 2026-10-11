export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export function clamp01(v: number): number {
  return clamp(v, 0, 1);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}

/** Wrap an angle to [-PI, PI). */
export function wrapAngle(a: number): number {
  a = (a + Math.PI) % TAU;
  if (a < 0) a += TAU;
  return a - Math.PI;
}

/** Signed shortest angle from a to b. */
export function angleDelta(a: number, b: number): number {
  return wrapAngle(b - a);
}

/** Frame-rate independent exponential approach. */
export function damp(current: number, target: number, sharpness: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-sharpness * dt));
}

export function dampAngle(current: number, target: number, sharpness: number, dt: number): number {
  return current + angleDelta(current, target) * (1 - Math.exp(-sharpness * dt));
}

export function lerpAngle(a: number, b: number, t: number): number {
  return a + angleDelta(a, b) * t;
}

export function moveToward(current: number, target: number, maxDelta: number): number {
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
}

/**
 * Yaw convention used everywhere: yaw 0 faces +Z, matching Object3D.rotation.y,
 * so direction = (sin(yaw), cos(yaw)) on the XZ plane.
 */
export function yawToX(yaw: number): number {
  return Math.sin(yaw);
}
export function yawToZ(yaw: number): number {
  return Math.cos(yaw);
}
export function dirToYaw(x: number, z: number): number {
  return Math.atan2(x, z);
}

/** Small deterministic PRNG (mulberry32). */
export class Rng {
  private s: number;
  constructor(seed: number) {
    this.s = seed >>> 0;
  }
  next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(lo: number, hi: number): number {
    return lo + (hi - lo) * this.next();
  }
  int(lo: number, hiExclusive: number): number {
    return Math.floor(this.range(lo, hiExclusive));
  }
  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.next() * items.length)];
  }
}

/** Cheap 2D value noise (deterministic, smooth). */
export function valueNoise2(x: number, y: number, seed = 0): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const h = (ix: number, iy: number) => {
    let n = ix * 374761393 + iy * 668265263 + seed * 2147483647;
    n = (n ^ (n >>> 13)) * 1274126177;
    n = n ^ (n >>> 16);
    return ((n >>> 0) % 10000) / 10000;
  };
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = lerp(h(xi, yi), h(xi + 1, yi), u);
  const b = lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u);
  return lerp(a, b, v);
}
