import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { CONFIG } from '../config';
import { SOUNDS } from '../data/sounds';
import { WEAPONS } from '../data/weapons';
import { ProjectileSystem } from '../entities/Projectiles';
import { TargetSystem } from '../entities/Targets';
import { CollisionWorld } from '../world/Colliders';
import type { AudioEngine } from './AudioEngine';
import { gunSound, reloadSound, SessionAudio } from './SessionAudio';
import { attenuation, closestApproach, distanceLowpass, panFor, shotDelay } from './spatial';
import { voiceFor } from './voices';

describe('distance', () => {
  it('full volume within ref, falling with distance, silent at max', () => {
    expect(attenuation(0, 4, 40)).toBe(1);
    expect(attenuation(4, 4, 40)).toBe(1);
    let last = 1;
    for (let d = 5; d < 40; d += 1) {
      const g = attenuation(d, 4, 40);
      expect(g).toBeLessThanOrEqual(last);
      last = g;
    }
    expect(attenuation(40, 4, 40)).toBe(0);
    expect(attenuation(80, 4, 40)).toBe(0);
  });

  it('gunshots carry across the map; footstep-range sounds only nearby', () => {
    const shot = SOUNDS['gun.revolver'];
    expect(attenuation(60, shot.ref!, shot.maxDistance!)).toBeGreaterThan(0.05);
    const dry = SOUNDS['gun.dry'];
    expect(attenuation(20, dry.ref!, dry.maxDistance!)).toBe(0);
  });

  it('distant sounds get duller', () => {
    expect(distanceLowpass(2, 4, 40)).toBeCloseTo(20000);
    const mid = distanceLowpass(20, 4, 40);
    const far = distanceLowpass(40, 4, 40);
    expect(mid).toBeLessThan(20000);
    expect(far).toBeLessThan(mid);
    expect(far).toBeCloseTo(CONFIG.audio.farLowpass);
  });

  it('pans by screen-space side, never fully hard', () => {
    expect(panFor(0)).toBe(0);
    expect(panFor(5)).toBeGreaterThan(0);
    expect(panFor(-5)).toBeLessThan(0);
    expect(panFor(1000)).toBeCloseTo(0.9);
    expect(panFor(-1000)).toBeCloseTo(-0.9);
  });

  it('distant shots are delayed by their travel time; near ones are not', () => {
    expect(shotDelay(10)).toBe(0);
    expect(shotDelay(CONFIG.audio.distantShot)).toBe(0);
    expect(shotDelay(60)).toBeCloseTo(60 / CONFIG.audio.soundSpeed);
    expect(shotDelay(120)).toBeGreaterThan(shotDelay(60));
  });
});

describe('session audio', () => {
  const fake = { spatializer: null } as unknown as AudioEngine;
  // Camera right axis for the isometric view: (1, 0, -1)/√2.
  const right = new THREE.Vector3(1, 0, -1).normalize();

  it('a sound to the camera-right of the listener pans right; behind the camera axis stays centred', () => {
    const sa = new SessionAudio(fake, right);
    sa.setListener(new THREE.Vector3(0, 0, 0));
    const def = SOUNDS['gun.revolver'];
    expect(sa.spatial({ x: 4, z: -4 }, def).pan).toBeGreaterThan(0.3);
    expect(sa.spatial({ x: -4, z: 4 }, def).pan).toBeLessThan(-0.3);
    expect(Math.abs(sa.spatial({ x: 5, z: 5 }, def).pan)).toBeLessThan(1e-6);
    expect(sa.spatial({ x: 30, z: 0 }, def).distance).toBeCloseTo(30);
    sa.dispose();
  });

  it('every weapon has a gunshot and reload sound (inline guns map by look)', () => {
    for (const w of Object.values(WEAPONS)) {
      expect(SOUNDS[gunSound(w)], w.id).toBeTruthy();
      expect(SOUNDS[reloadSound(w)], w.id).toBeTruthy();
    }
    expect(gunSound({ ...WEAPONS.shotgun, id: 'custom' })).toBe('gun.shotgun');
    expect(gunSound({ ...WEAPONS.revolver, id: 'custom' })).toBe('gun.revolver');
  });

  it('NPC voices: deterministic per seed, lower for men than women', () => {
    expect(voiceFor('jed', 'male')).toEqual(voiceFor('jed', 'male'));
    expect(voiceFor('jed', 'male').pitch).not.toBe(voiceFor('ezra', 'male').pitch);
    for (const name of ['a', 'b', 'c', 'd', 'e']) expect(voiceFor(name, 'male').pitch).toBeLessThan(voiceFor(name, 'female').pitch);
  });
});

describe('bullet whizz', () => {
  it('closest approach of a segment to a point', () => {
    const c = closestApproach(-5, 1, 1, 5, 1, 1, 0, 1, 0);
    expect(c.dist).toBeCloseTo(1);
    expect(c.t).toBeCloseTo(0.5);
    expect(closestApproach(0, 0, 0, 1, 0, 0, 5, 0, 0).dist).toBeCloseTo(4); // past the end
  });

  /** Fire one bullet along +Z past (offset, 1.5, 10); count passes. */
  function fly(offset: number, shooter: object | null, ignore: object | null) {
    const ps = new ProjectileSystem();
    const passes: THREE.Vector3[] = [];
    const ear = new THREE.Vector3(0, 1.5, 10);
    ps.fire(new THREE.Vector3(offset, 1.5, 0), new THREE.Vector3(0, 0, 1), WEAPONS.revolver, shooter as never);
    for (let i = 0; i < 60; i++) {
      ps.update(1 / 60, new CollisionWorld(50), new TargetSystem(), () => {}, { pos: ear, radius: CONFIG.audio.whizzRadius, ignore: ignore as never, onPass: (p) => passes.push(p) });
    }
    return passes;
  }

  it('a near miss whizzes once, at the closest point, on the side it passed', () => {
    const npc = {};
    const left = fly(-1, npc, {});
    expect(left).toHaveLength(1);
    expect(left[0].x).toBeCloseTo(-1);
    expect(left[0].z).toBeGreaterThan(9);
    expect(left[0].z).toBeLessThan(11);
    expect(fly(1, npc, {})[0].x).toBeCloseTo(1);
  });

  it('wide misses and your own bullets stay quiet', () => {
    expect(fly(3, {}, {})).toHaveLength(0);
    const me = {};
    expect(fly(0.5, me, me)).toHaveLength(0);
  });
});
