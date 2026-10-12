import { CONFIG } from '../config';

/** Distance gain: full within `ref`, then ~ref/d, fading to silence towards `max`. */
export function attenuation(d: number, ref: number, max: number): number {
  if (d >= max) return 0;
  const g = d <= ref ? 1 : ref / d;
  // Ease out over the last 40 % so sounds don't stop abruptly at the edge.
  const t = Math.min(1, Math.max(0, (d - max * 0.6) / (max * 0.4)));
  return g * (1 - t * t * (3 - 2 * t));
}

/** Low-pass cutoff: open (20 kHz) up close, closing towards `minHz` at `max` (air dulls far sounds). */
export function distanceLowpass(d: number, ref: number, max: number, minHz = CONFIG.audio.farLowpass): number {
  const t = Math.min(1, Math.max(0, (d - ref) / Math.max(1e-6, max - ref)));
  return 20000 * Math.pow(minHz / 20000, Math.sqrt(t));
}

/**
 * Stereo pan from how far right of the listener the sound is on screen (`screenDx`, world units
 * along the camera's right axis). Never fully hard-panned.
 */
export function panFor(screenDx: number, range = CONFIG.audio.panRange): number {
  return Math.max(-1, Math.min(1, screenDx / range)) * 0.9;
}

/** Distant gunshots arrive late: beyond `CONFIG.audio.distantShot`, the travel time of sound. */
export function shotDelay(d: number): number {
  const a = CONFIG.audio;
  return d > a.distantShot ? d / a.soundSpeed : 0;
}

/**
 * Closest approach of the segment a→b to point p (all 3D). Returns the distance and the
 * parameter along the segment (0..1). Used to catch bullets whizzing past the listener.
 */
export function closestApproach(
  ax: number, ay: number, az: number,
  bx: number, by: number, bz: number,
  px: number, py: number, pz: number,
): { dist: number; t: number } {
  const dx = bx - ax;
  const dy = by - ay;
  const dz = bz - az;
  const len2 = dx * dx + dy * dy + dz * dz;
  const t = len2 > 0 ? Math.min(1, Math.max(0, ((px - ax) * dx + (py - ay) * dy + (pz - az) * dz) / len2)) : 0;
  const cx = ax + dx * t - px;
  const cy = ay + dy * t - py;
  const cz = az + dz * t - pz;
  return { dist: Math.sqrt(cx * cx + cy * cy + cz * cz), t };
}
