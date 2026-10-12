import type { Floor } from '../world/props';

export type FootSurface = 'dirt' | 'wood';

/** What a foot lands on at (x, z): a wooden floor (porch) if inside one, else dirt. */
export function footSurface(x: number, z: number, floors: readonly Floor[]): FootSurface {
  for (const f of floors) if (x >= f.minX && x <= f.maxX && z >= f.minZ && z <= f.maxZ) return f.surface;
  return 'dirt';
}

/**
 * Did a foot land between two walk-cycle phases? The left heel strikes at phase π/2 and the right
 * at 3π/2 (the gait's convention). Returns which foot (−1 left, +1 right) or 0. Works both ways
 * (backpedalling runs the cycle backwards).
 */
export function footfall(prevPhase: number, phase: number): -1 | 0 | 1 {
  const k0 = Math.floor((prevPhase - Math.PI / 2) / Math.PI);
  const k1 = Math.floor((phase - Math.PI / 2) / Math.PI);
  if (k0 === k1) return 0;
  const k = Math.max(k0, k1);
  return ((k % 2) + 2) % 2 === 0 ? -1 : 1;
}
