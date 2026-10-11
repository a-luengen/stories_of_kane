import type * as THREE from 'three';
import { CONFIG } from '../config';
import type { Vec2 } from '../data/types';
import type { Horse } from '../entities/Horse';
import { dirToYaw } from '../util/math';
import type { NavGrid } from './NavGrid';

export interface Steering {
  /** Desired heading, or null to let the horse slow to a stop. */
  target: number | null;
  gallop: boolean;
}

/** The first point along `path` at least `ahead` units away (or its end). */
function lookahead(path: Vec2[], x: number, z: number, ahead: number): Vec2 {
  for (const p of path) if (Math.hypot(p[0] - x, p[1] - z) >= ahead) return p;
  return path[path.length - 1];
}

/**
 * Steers a horse along the nav grid towards a point: straight when the line is clear, else along
 * a path, aiming at a point a few units ahead so the horse rounds corners at speed.
 */
class PathSteer {
  private path: Vec2[] | null = null;
  private pathGoal: Vec2 | null = null;
  private repathLeft = 0;

  constructor(private nav: NavGrid) {}

  heading(dt: number, horse: Horse, goal: Vec2): number {
    const { x, z } = horse.pos;
    let aim = goal;
    if (!this.nav.walkable(x, z, goal[0], goal[1])) {
      this.repathLeft -= dt;
      const moved = !this.pathGoal || Math.hypot(this.pathGoal[0] - goal[0], this.pathGoal[1] - goal[1]) > 3;
      if (!this.path || this.repathLeft <= 0 || moved) {
        this.path = this.nav.findPath(x, z, goal[0], goal[1]);
        this.pathGoal = goal;
        this.repathLeft = 0.6;
      }
      if (this.path && this.path.length > 0) aim = lookahead(this.path, x, z, 4);
    } else {
      this.path = null;
    }
    return dirToYaw(aim[0] - x, aim[1] - z);
  }
}

/**
 * Mounted enemy: closes in at a gallop, then rides wide arcs around the player at medium range
 * (aiming at a point ahead on the circle, so it never stops on the spot), now and then changing
 * direction. Drives the same HorseMotor as the player, so momentum and turning limits apply.
 */
export class MountedAI {
  private dir = Math.random() < 0.5 ? 1 : -1;
  private flipLeft = 10 + Math.random() * 8;
  private steer: PathSteer;

  constructor(
    private nav: NavGrid,
    private radius = CONFIG.wave.orbitRadius,
  ) {
    this.steer = new PathSteer(nav);
  }

  drive(dt: number, horse: Horse, target: THREE.Vector3): Steering {
    this.flipLeft -= dt;
    if (this.flipLeft <= 0) {
      this.flipLeft = 12 + Math.random() * 8;
      this.dir = -this.dir;
    }
    const dx = horse.pos.x - target.x;
    const dz = horse.pos.z - target.z;
    const d = Math.hypot(dx, dz);
    const R = this.radius;
    let goal: Vec2;
    if (d > R + 8) {
      goal = [target.x, target.z];
    } else {
      // A point ahead on the circle (radius eases in from wherever the horse is).
      const a = Math.atan2(dz, dx) + this.dir * 0.75;
      const r = R + (d - R) * 0.4;
      goal = [target.x + Math.cos(a) * r, target.z + Math.sin(a) * r];
      goal = this.nav.nearestFree(goal[0], goal[1], 4) ?? goal;
      // Blocked ahead on the circle (wall, cover): go round the other way.
      if (!this.nav.isFree(goal[0], goal[1])) this.dir = -this.dir;
    }
    return { target: this.steer.heading(dt, horse, goal), gallop: d > R + 3 };
  }
}

/**
 * Ride to `dest`, then stop (`stopWithin`) or keep going straight out (`stopWithin` = null, used
 * to leave the map). Returns a driver function for Horse.driver.
 */
export function routeDriver(nav: NavGrid, dest: Vec2, stopWithin: number | null, gallop = true): (dt: number, horse: Horse) => Steering {
  const steer = new PathSteer(nav);
  let arrived = false;
  return (dt, horse) => {
    const d = Math.hypot(dest[0] - horse.pos.x, dest[1] - horse.pos.z);
    if (stopWithin !== null && (arrived || d < stopWithin)) {
      arrived = true;
      return { target: null, gallop: false };
    }
    if (stopWithin === null && d < 2) return { target: horse.heading, gallop };
    return { target: steer.heading(dt, horse, dest), gallop: gallop && (stopWithin === null || d > stopWithin + 6) };
  };
}
