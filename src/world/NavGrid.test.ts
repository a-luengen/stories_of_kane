import { describe, expect, it } from 'vitest';
import { CollisionWorld } from './Colliders';
import { NavGrid } from './NavGrid';

describe('NavGrid', () => {
  const world = new CollisionWorld(20);
  world.addBox(-2, -6, 2, 6, 3, 'wood'); // a wall between the two sides
  const nav = new NavGrid(world, 20);

  it('marks colliders (inflated by the character radius) as blocked', () => {
    expect(nav.isFree(0, 0)).toBe(false);
    expect(nav.isFree(2.2, 0)).toBe(false);
    expect(nav.isFree(3, 0)).toBe(true);
  });

  it('walks straight when nothing is in the way', () => {
    expect(nav.findPath(-8, 10, 8, 10)).toEqual([[8, 10]]);
  });

  it('routes around obstacles with only walkable straight legs', () => {
    const path = nav.findPath(-6, 0, 6, 0)!;
    expect(path.length).toBeGreaterThan(1);
    expect(path[path.length - 1]).toEqual([6, 0]);
    let [x, z] = [-6, 0];
    for (const [px, pz] of path) {
      expect(nav.walkable(x, z, px, pz) || !nav.isFree(x, z)).toBe(true);
      [x, z] = [px, pz];
    }
    expect(Math.max(...path.map(([, pz]) => Math.abs(pz)))).toBeGreaterThan(6);
  });

  it('snaps a blocked goal to the nearest free spot', () => {
    const path = nav.findPath(-6, 0, 0, 0)!;
    const [gx, gz] = path[path.length - 1];
    expect(nav.isFree(gx, gz)).toBe(true);
    expect(Math.hypot(gx, gz)).toBeLessThan(4);
  });
});
