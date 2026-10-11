import type { Vec2 } from '../data/types';
import type { Collider, CollisionWorld } from '../world/Colliders';
import type { NavGrid } from './NavGrid';

/** Props this high protect a crouched body (top ~1.1) but not a standing one. */
export const LOW_COVER: [number, number] = [0.55, 1.4];
/** Shooting heights (standing muzzle) and the crouched body's middle. */
const STAND_MUZZLE = 1.38;
const CROUCHED_BODY = 0.8;

/** A point on a low prop to crouch behind; `ex` / `ez` are its half extents around the point. */
interface Anchor {
  x: number;
  z: number;
  ex: number;
  ez: number;
}

const cache = new WeakMap<CollisionWorld, Anchor[]>();

/** Anchors along every low-cover prop (long fences are sampled every ~1.2 units). */
export function lowCoverAnchors(world: CollisionWorld): Anchor[] {
  let out = cache.get(world);
  if (out) return out;
  out = [];
  for (const c of world.colliders as Collider[]) {
    if (!c.blocksBullets || (c.base ?? 0) > 0 || c.coverHeight < LOW_COVER[0] || c.coverHeight > LOW_COVER[1]) continue;
    if (c.kind === 'circle') {
      out.push({ x: c.x, z: c.z, ex: c.r, ez: c.r });
      continue;
    }
    const hx = (c.maxX - c.minX) / 2;
    const hz = (c.maxZ - c.minZ) / 2;
    const cx = (c.minX + c.maxX) / 2;
    const cz = (c.minZ + c.maxZ) / 2;
    const along = hx >= hz ? 'x' : 'z';
    const half = Math.max(hx, hz);
    const n = Math.max(1, Math.round((half * 2) / 1.2));
    const seg = half / n; // half length of each piece
    for (let i = 0; i < n; i++) {
      const o = -half + seg * (2 * i + 1);
      out.push(along === 'x' ? { x: cx + o, z: cz, ex: seg, ez: hz } : { x: cx, z: cz + o, ex: hx, ez: seg });
    }
  }
  cache.set(world, out);
  return out;
}

/**
 * True if, crouched at `spot`, a shot from `threat` is stopped by cover, while standing up there
 * still gives a clear shot back (so it's worth popping up from).
 */
export function coversFrom(world: CollisionWorld, spot: Vec2, threat: { x: number; z: number }, threatChest = 1.2): boolean {
  const [sx, sz] = spot;
  if (!world.raycast(threat.x, STAND_MUZZLE, threat.z, sx, CROUCHED_BODY, sz)) return false;
  return world.raycast(sx, STAND_MUZZLE, sz, threat.x, threatChest, threat.z) === null;
}

export interface LowCoverQuery {
  /** Who is looking (they walk there). */
  from: Vec2;
  /** Who to hide from. */
  threat: { x: number; z: number };
  /** Acceptable distance band to the threat. */
  range: [number, number];
  /** Max walk to the spot. */
  maxTravel: number;
  /** Spots to avoid (taken by others, or just left). */
  avoid?: readonly Vec2[];
}

/** The best spot right behind a low prop (seen from the threat), or null. */
export function findLowCover(world: CollisionWorld, nav: NavGrid, q: LowCoverQuery): Vec2 | null {
  const [fx, fz] = q.from;
  const { threat } = q;
  const mid = (q.range[0] + q.range[1]) / 2;
  let best: Vec2 | null = null;
  let bestScore = Infinity;
  for (const a of lowCoverAnchors(world)) {
    if (Math.hypot(a.x - fx, a.z - fz) > q.maxTravel + 1.5) continue;
    let dx = a.x - threat.x;
    let dz = a.z - threat.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.01) continue;
    dx /= d;
    dz /= d;
    // On the far side of the prop: its extent along the threat direction, plus a body.
    const extent = Math.abs(dx) * a.ex + Math.abs(dz) * a.ez;
    let spot: Vec2 | null = null;
    for (const gap of [0.5, 0.7]) {
      const s: Vec2 = [a.x + dx * (extent + gap), a.z + dz * (extent + gap)];
      if (nav.isFree(s[0], s[1])) {
        spot = s;
        break;
      }
    }
    if (!spot) continue;
    const dp = Math.hypot(spot[0] - threat.x, spot[1] - threat.z);
    if (dp < q.range[0] || dp > q.range[1]) continue;
    const dSelf = Math.hypot(spot[0] - fx, spot[1] - fz);
    if (dSelf > q.maxTravel) continue;
    if (q.avoid?.some(([x, z]) => Math.hypot(x - spot![0], z - spot![1]) < 1.2)) continue;
    const score = dSelf + Math.abs(dp - mid) * 0.3;
    if (score >= bestScore) continue;
    if (!coversFrom(world, spot, threat)) continue;
    bestScore = score;
    best = spot;
  }
  return best;
}
