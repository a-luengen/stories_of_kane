import type { Horse } from '../entities/Horse';

/**
 * A horse left to itself in a paddock: grazes a while (head down), then ambles to another spot
 * inside its pen and grazes there. Returns a driver for Horse.driver.
 */
export function grazingDriver(h: Horse, pen: readonly [number, number, number, number], rand: () => number = Math.random, margin = 1.6) {
  let mode: 'graze' | 'walk' = 'graze';
  let timer = 2 + rand() * 8;
  let tx = h.pos.x;
  let tz = h.pos.z;
  const [x0, z0, x1, z1] = pen;
  const pick = () => {
    // Somewhere else in the paddock, not too far (a few steps to a fresh patch).
    for (let i = 0; i < 8; i++) {
      const x = x0 + margin + rand() * Math.max(0, x1 - x0 - 2 * margin);
      const z = z0 + margin + rand() * Math.max(0, z1 - z0 - 2 * margin);
      if (Math.hypot(x - h.pos.x, z - h.pos.z) < 9) return [x, z];
    }
    return [(x0 + x1) / 2, (z0 + z1) / 2];
  };
  return (dt: number): { target: number | null; gallop: boolean; cap?: number } => {
    timer -= dt;
    if (mode === 'graze') {
      h.graze = 1;
      if (timer <= 0) {
        [tx, tz] = pick();
        mode = 'walk';
        timer = 14;
      }
      return { target: null, gallop: false };
    }
    h.graze = 0;
    const dx = tx - h.pos.x;
    const dz = tz - h.pos.z;
    if (Math.hypot(dx, dz) < 0.8 || timer <= 0) {
      mode = 'graze';
      timer = 5 + rand() * 12;
      return { target: null, gallop: false };
    }
    return { target: Math.atan2(dx, dz), gallop: false, cap: 1.3 };
  };
}

/** Is the point inside the pen? */
export function inPen(pen: readonly [number, number, number, number], x: number, z: number): boolean {
  return x >= pen[0] && x <= pen[2] && z >= pen[1] && z <= pen[3];
}
