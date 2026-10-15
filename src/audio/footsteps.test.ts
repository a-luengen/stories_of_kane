import { describe, expect, it } from 'vitest';
import { CONFIG } from '../config';
import { PLAYER_APPEARANCE } from '../data/player';
import { HorseModel } from '../entities/HorseModel';
import { PlayerModel, type PlayerPose } from '../entities/PlayerModel';
import { TargetSystem } from '../entities/Targets';
import { buildSandboxMap } from '../world/maps/sandbox';
import { buildOutpostMap } from '../world/maps/waveOutpost';
import { footfall, footSurface } from './footSurface';

describe('footstep surface', () => {
  const floors = buildSandboxMap(new TargetSystem()).floors;

  it('the sandbox porches are wood; the street and desert are dirt', () => {
    expect(floors.length).toBe(8); // one porch per building
    expect(footSurface(-5, -5.5, floors)).toBe('wood'); // saloon porch (north row)
    expect(footSurface(-18.5, -10, floors)).toBe('wood'); // west row porch (faces +X)
    expect(footSurface(0, 0, floors)).toBe('dirt'); // main street
    expect(footSurface(40, 40, floors)).toBe('dirt');
  });

  it('the wave outpost has no wooden floors', () => {
    expect(buildOutpostMap(new TargetSystem()).floors).toEqual([]);
    expect(footSurface(0, 0, [])).toBe('dirt');
  });
});

describe('steps from the walk cycle', () => {
  it('feet alternate left / right, also when the cycle runs backwards', () => {
    const feet: number[] = [];
    for (let ph = 0, prev = 0; ph < 4 * Math.PI; prev = ph, ph += 0.1) {
      const f = footfall(prev, ph);
      if (f) feet.push(f);
    }
    expect(feet).toEqual([-1, 1, -1, 1]);
    const back: number[] = [];
    for (let ph = 4 * Math.PI, prev = ph; ph > 0; prev = ph, ph -= 0.1) {
      const f = footfall(prev, ph);
      if (f) back.push(f);
    }
    expect(back).toHaveLength(4);
    expect(new Set(back)).toEqual(new Set([-1, 1]));
  });

  const pose = (speed: number, sprint: boolean, crouch = 0): PlayerPose => ({
    speed, sprint, moveYaw: 0, aimYaw: 0, recoil: 0, recoilL: 0, dual: false, reload: -1, mounted: false, horseYaw: 0, dead: false, draw: 0, active: null, crouch, longGun: false, pet: 0,
  });
  const stepsPerSecond = (p: PlayerPose) => {
    const m = new PlayerModel(PLAYER_APPEARANCE);
    let n = 0;
    m.onStep = () => n++;
    for (let i = 0; i < 300; i++) m.animate(1 / 60, p);
    return n / 5;
  };

  it('walking steps follow the stride; running is faster; standing still makes none', () => {
    const walk = stepsPerSecond(pose(CONFIG.player.walkSpeed, false));
    const run = stepsPerSecond(pose(CONFIG.player.sprintSpeed, true));
    const crouch = stepsPerSecond(pose(CONFIG.player.walkSpeed * 0.5, false, 1));
    expect(walk).toBeGreaterThan(1.2);
    expect(walk).toBeLessThan(3.5);
    expect(run).toBeGreaterThan(walk);
    expect(crouch).toBeLessThan(walk);
    expect(stepsPerSecond(pose(0, false))).toBe(0);
  });
});

describe('hoofbeats', () => {
  /** Hoof landings (time, leg) over one second at a fraction of gallop speed. */
  const beats = (s: number) => {
    const m = new HorseModel();
    const out: { t: number; leg: number }[] = [];
    let t = 0;
    m.onHoof = (leg) => out.push({ t, leg });
    for (let i = 0; i < 240; i++, t += 1 / 60) m.animate(1 / 60, { speed: s * 10, gallopSpeed: 10, angularVelocity: 0, braking: false, pivoting: false, ridden: false });
    return out.filter((b) => b.t > 1);
  };

  it('every hoof lands once per stride, more often the faster it goes', () => {
    const walk = beats(0.15);
    const gallop = beats(1);
    for (const leg of [0, 1, 2, 3]) expect(walk.some((b) => b.leg === leg)).toBe(true);
    expect(gallop.length).toBeGreaterThan(walk.length);
  });

  it('a walk is four even beats; a gallop bunches them', () => {
    const gaps = (bs: { t: number }[]) => bs.slice(1).map((b, i) => b.t - bs[i].t);
    const spread = (xs: number[]) => Math.max(...xs) / Math.max(1e-6, Math.min(...xs.filter((x) => x > 0)));
    expect(spread(gaps(beats(0.15)))).toBeLessThan(1.6);
    expect(spread(gaps(beats(1)))).toBeGreaterThan(2);
  });

  it('a standing horse is silent', () => {
    expect(beats(0)).toHaveLength(0);
  });
});
