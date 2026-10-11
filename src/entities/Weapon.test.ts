import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { WEAPONS } from '../data/weapons';
import { falloff, pelletCount, scatterDir, WeaponState } from './Weapon';

describe('weapons', () => {
  it('shotgun damage falls off with distance; rifle and revolver do not', () => {
    const s = WEAPONS.shotgun;
    expect(falloff(s, 2)).toBe(1);
    expect(falloff(s, (s.falloffStart + s.range) / 2)).toBeCloseTo((1 + s.falloffMin) / 2);
    expect(falloff(s, s.range)).toBeCloseTo(s.falloffMin);
    expect(falloff(WEAPONS.rifle, 60)).toBe(1);
    expect(falloff(WEAPONS.revolver, 40)).toBe(1);
  });

  it('shotgun fires 6-8 pellets, the others one bullet', () => {
    const counts = new Set(Array.from({ length: 200 }, () => pelletCount(WEAPONS.shotgun)));
    expect([...counts].sort()).toEqual([6, 7, 8]);
    expect(pelletCount(WEAPONS.rifle)).toBe(1);
  });

  it('magazine, fire interval and reload', () => {
    const w = new WeaponState(WEAPONS.shotgun);
    const o = new THREE.Vector3(0, 1.4, 0);
    const aim = new THREE.Vector3(0, 1.2, 5);
    expect(w.fire(o, aim, 1, 0)!.dirs.length).toBeGreaterThanOrEqual(6);
    expect(w.fire(o, aim, 1, 0)).toBeNull(); // still cycling
    w.update(WEAPONS.shotgun.fireInterval);
    expect(w.fire(o, aim, 1, 0)).not.toBeNull();
    w.update(WEAPONS.shotgun.fireInterval);
    expect(w.ammo).toBe(0);
    expect(w.fire(o, aim, 1, 0)).toBeNull(); // empty → starts reloading
    expect(w.reloading).toBe(true);
    w.update(WEAPONS.shotgun.reloadTime + 0.01);
    expect(w.ammo).toBe(2);
  });

  it('scatter stays within the spread radius around the aim point', () => {
    const o = new THREE.Vector3(0, 1.4, 0);
    const aim = new THREE.Vector3(0, 0, 20);
    const def = WEAPONS.revolver;
    const radius = 20 * Math.tan(def.spread) * (1 + 20 * def.spreadGrowth);
    for (let i = 0; i < 100; i++) {
      const d = scatterDir(o, aim, def.spread, def.spreadGrowth, 0, false);
      // Where it crosses the ground.
      const t = -o.y / d.y;
      const hit = o.clone().addScaledVector(d, t);
      expect(Math.hypot(hit.x - aim.x, hit.z - aim.z)).toBeLessThanOrEqual(radius + 1e-6);
    }
  });
});
