import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { CONFIG } from '../config';
import { Player, type PlayerInput } from './Player';

const DT = 1 / 60;

function input(over: Partial<PlayerInput> = {}): PlayerInput {
  return { moveX: 0, moveZ: 0, sprint: false, fireHeld: false, reload: false, holster: false, aim: new THREE.Vector3(0, 0, 10), ...over };
}

/** Step for `seconds`, returning the number of shots fired. */
function run(p: Player, seconds: number, over: Partial<PlayerInput> = {}): number {
  let shots = 0;
  for (let t = 0; t < seconds; t += DT) if (p.updateWeapon(DT, input(over))) shots++;
  return shots;
}

describe('player holster', () => {
  it('starts holstered; the first trigger pull draws, then fires', () => {
    const p = new Player();
    expect(p.drawn).toBe(false);
    expect(run(p, p.weapon.def.drawTime * 0.9, { fireHeld: true })).toBe(0);
    expect(p.drawn).toBe(true);
    expect(run(p, 0.3, { fireHeld: true })).toBeGreaterThan(0);
  });

  it('H holsters (and cancels a reload)', () => {
    const p = new Player();
    run(p, 1, { fireHeld: true });
    run(p, 0.1, { reload: true });
    expect(p.weapon.reloading).toBe(true);
    run(p, DT, { holster: true });
    expect(p.drawn).toBe(false);
    expect(p.weapon.reloading).toBe(false);
    run(p, 1);
    expect(p.draw).toBe(0);
  });

  it('auto-holsters after the idle time without shooting', () => {
    const p = new Player();
    run(p, 0.6, { fireHeld: true });
    run(p, CONFIG.player.autoHolsterTime - 1);
    expect(p.drawn).toBe(true);
    run(p, 1.5);
    expect(p.drawn).toBe(false);
  });

  it('shooting resets the idle timer', () => {
    const p = new Player();
    run(p, 0.6, { fireHeld: true });
    run(p, CONFIG.player.autoHolsterTime - 5);
    run(p, 0.1, { fireHeld: true });
    run(p, 10);
    expect(p.drawn).toBe(true);
  });

  it('instant holster (on death) snaps the gun away', () => {
    const p = new Player();
    run(p, 1, { fireHeld: true });
    p.holster(true);
    expect(p.draw).toBe(0);
    expect(p.drawn).toBe(false);
  });
});
