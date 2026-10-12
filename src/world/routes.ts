import type { Vec2 } from '../data/types';
import { pathThrough, type PathDef, type WorldDef } from '../data/world';
import type { Discovery } from './Discovery';

/** One trail ridden in one direction. */
export interface Hop {
  path: PathDef;
  from: { poi: string; exit: string };
  to: { poi: string; exit: string };
  /** The trail's world-map polyline, from `from` to `to`. */
  points: Vec2[];
}

export function polylineLength(points: readonly Vec2[]): number {
  let n = 0;
  for (let i = 1; i < points.length; i++) n += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  return n;
}

/** The point a fraction `t` (0..1) of the way along a polyline. */
export function pointAlong(points: readonly Vec2[], t: number): Vec2 {
  const total = polylineLength(points);
  let left = Math.max(0, Math.min(1, t)) * total;
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1];
    const [bx, by] = points[i];
    const l = Math.hypot(bx - ax, by - ay);
    if (left <= l || i === points.length - 1) {
      const k = l > 0 ? Math.min(1, left / l) : 0;
      return [ax + (bx - ax) * k, ay + (by - ay) * k];
    }
    left -= l;
  }
  return points[points.length - 1];
}

/** Leaving `poi` through `exit`: the trail and where it ends. */
export function hopThrough(world: WorldDef, poi: string, exit: string): Hop | null {
  const r = pathThrough(world, poi, exit);
  if (!r) return null;
  const forward = r.path.from.poi === poi && r.path.from.exit === exit;
  return { path: r.path, from: { poi, exit }, to: r.to, points: forward ? r.path.route : [...r.path.route].reverse() };
}

/**
 * The shortest way from one place to another over trails the player knows (by length on the
 * world map). Null if there's none (or `from` = `to`).
 */
export function findRoute(world: WorldDef, discovery: Discovery, from: string, to: string): Hop[] | null {
  if (from === to) return null;
  const dist = new Map<string, number>([[from, 0]]);
  const via = new Map<string, Hop>();
  const open = new Set([from]);
  while (open.size) {
    let here = '';
    for (const p of open) if (!here || dist.get(p)! < dist.get(here)!) here = p;
    open.delete(here);
    if (here === to) break;
    for (const path of world.paths) {
      if (discovery.path(path.id) === 'undiscovered') continue;
      const end = path.from.poi === here ? path.from : path.to.poi === here ? path.to : null;
      if (!end) continue;
      const hop = hopThrough(world, here, end.exit)!;
      const d = dist.get(here)! + polylineLength(hop.points);
      if (d < (dist.get(hop.to.poi) ?? Infinity)) {
        dist.set(hop.to.poi, d);
        via.set(hop.to.poi, hop);
        open.add(hop.to.poi);
      }
    }
  }
  if (!via.has(to)) return null;
  const hops: Hop[] = [];
  for (let p = to; p !== from; p = via.get(p)!.from.poi) hops.unshift(via.get(p)!);
  return hops;
}

/** All hops' points as one polyline. */
export function routePoints(hops: readonly Hop[]): Vec2[] {
  const out: Vec2[] = [];
  for (const h of hops) out.push(...(out.length ? h.points.slice(1) : h.points));
  return out;
}
