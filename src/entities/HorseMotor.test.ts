import { describe, expect, it } from 'vitest';
import { CONFIG } from '../config';
import { HorseMotor } from './HorseMotor';
import { wrapAngle } from '../util/math';

// Abstract screen directions as headings (the exact mapping to world yaw doesn't matter here).
const RIGHT = Math.PI / 2; // D
const DOWN = 0; // S
const LEFT = -Math.PI / 2; // A
const UP = Math.PI; // W

const DT = 1 / 60;

interface Sim {
  m: HorseMotor;
  x: number;
  z: number;
  t: number;
}

function sim(heading = RIGHT, speed = 0): Sim {
  const m = new HorseMotor({ ...CONFIG.horse });
  m.heading = heading;
  m.speed = speed;
  return { m, x: 0, z: 0, t: 0 };
}

function step(s: Sim, target: number | null, gallop: boolean): void {
  s.m.update(target, gallop, DT);
  s.x += Math.sin(s.m.heading) * s.m.speed * DT;
  s.z += Math.cos(s.m.heading) * s.m.speed * DT;
  s.t += DT;
}

function run(s: Sim, target: number | null, gallop: boolean, seconds: number, each?: () => void): void {
  for (let i = 0; i < Math.round(seconds / DT); i++) {
    step(s, target, gallop);
    each?.();
  }
}

/** Run until the predicate holds; returns elapsed time. */
function until(s: Sim, target: number | null, gallop: boolean, pred: () => boolean, max = 10): number {
  const t0 = s.t;
  while (!pred() && s.t - t0 < max) step(s, target, gallop);
  return s.t - t0;
}

describe('HorseMotor', () => {
  it('builds speed gradually from standstill and coasts straight to a stop', () => {
    const s = sim(RIGHT);
    let last = 0;
    let monotonic = true;
    const tGallop = until(s, RIGHT, true, () => {
      if (s.m.speed < last - 1e-9) monotonic = false;
      last = s.m.speed;
      return s.m.speed >= CONFIG.horse.gallopSpeed * 0.99;
    });
    expect(monotonic).toBe(true);
    expect(tGallop).toBeGreaterThan(1.5);
    expect(tGallop).toBeLessThan(2.4);

    const heading = s.m.heading;
    const z0 = s.z;
    const tStop = until(s, null, false, () => s.m.speed === 0);
    expect(tStop).toBeGreaterThan(1.2);
    expect(tStop).toBeLessThan(1.8);
    expect(s.m.heading).toBe(heading);
    expect(Math.abs(s.z - z0)).toBeLessThan(1e-9); // straight line (moving along +x)
    console.log(`standstill→gallop ${tGallop.toFixed(2)}s, gallop→stop ${tStop.toFixed(2)}s`);
  });

  function uTurn(gallop: boolean, startSpeed: number) {
    const s = sim(RIGHT, startSpeed);
    let maxX = 0;
    let minZ = 0;
    let headingJump = 0;
    let prev = s.m.heading;
    const track = () => {
      maxX = Math.max(maxX, s.x);
      minZ = Math.min(minZ, s.z);
      headingJump = Math.max(headingJump, Math.abs(wrapAngle(s.m.heading - prev)));
      prev = s.m.heading;
    };
    // D held → hold S until roughly facing down → hold A until facing left.
    until(s, DOWN, gallop, () => (track(), Math.abs(wrapAngle(s.m.heading - DOWN)) < 0.35));
    until(s, LEFT, gallop, () => (track(), Math.abs(wrapAngle(s.m.heading - LEFT)) < 0.05));
    return { s, overshoot: maxX, depth: -minZ, headingJump };
  }

  it('D → S → A makes a wide U-turn at gallop and a tight one when slow', () => {
    // Heading RIGHT = +x; DOWN = +z in this abstract frame, so the arc bulges along +x and +z.
    const fast = uTurn(true, CONFIG.horse.gallopSpeed);
    const slow = uTurn(false, 2.5);
    const fastSize = Math.hypot(fast.overshoot, fast.s.z);
    const slowSize = Math.hypot(slow.overshoot, slow.s.z);
    console.log(`U-turn size fast ${fastSize.toFixed(2)}, slow ${slowSize.toFixed(2)}`);
    expect(fast.s.m.mode).toBe('moving'); // never braked: it was a continuous arc
    expect(fastSize).toBeGreaterThan(slowSize * 3);
    expect(fast.s.z).toBeGreaterThan(4); // the path curves down before coming back left
    expect(fast.headingJump).toBeLessThan(CONFIG.horse.turnRateSlow * DT + 1e-6);
  });

  it('at gallop, D → A brakes to near standstill, pivots, then accelerates left', () => {
    const s = sim(RIGHT, CONFIG.horse.gallopSpeed);
    const h0 = s.m.heading;
    const modes: string[] = [];
    let turnedWhileFast = false;
    run(s, LEFT, true, 3.5, () => {
      if (modes[modes.length - 1] !== s.m.mode) modes.push(s.m.mode);
      if (s.m.speed > CONFIG.horse.pivotSpeed && s.m.mode === 'braking' && s.m.heading !== h0) turnedWhileFast = true;
    });
    console.log('modes', modes.join(' → '));
    expect(modes.slice(0, 3)).toEqual(['braking', 'pivoting', 'moving']);
    expect(turnedWhileFast).toBe(false);
    expect(Math.abs(wrapAngle(s.m.heading - LEFT))).toBeLessThan(0.05);
    expect(s.m.speed).toBeGreaterThan(CONFIG.horse.canterSpeed * 0.5);
  });

  it('standing still, any key pivots in place before moving', () => {
    for (const target of [UP, DOWN, LEFT]) {
      const s = sim(RIGHT, 0);
      let movedWhileMisaligned = false;
      run(s, target, false, 1.5, () => {
        if (Math.abs(wrapAngle(s.m.heading - target)) > CONFIG.horse.pivotAlignAngle + 1e-6 && Math.hypot(s.x, s.z) > 1e-6) {
          movedWhileMisaligned = true;
        }
      });
      expect(movedWhileMisaligned).toBe(false);
      expect(s.m.speed).toBeGreaterThan(0);
    }
  });

  it('switching to a non-opposite direction during braking resumes turning immediately', () => {
    const s = sim(RIGHT, CONFIG.horse.gallopSpeed);
    run(s, LEFT, true, 0.15);
    expect(s.m.mode).toBe('braking');
    const h = s.m.heading;
    step(s, DOWN, true);
    expect(s.m.mode).toBe('moving');
    expect(s.m.heading).not.toBe(h);
  });

  it('collisions slide and only stop dead head-on', () => {
    const glancing = sim(0, 10);
    // Travelling +z into a wall whose normal is ~10° off perpendicular → glancing hit.
    glancing.m.applyCollision(-Math.cos(0.17), -Math.sin(0.17), 1);
    expect(glancing.m.speed).toBeGreaterThan(9);
    const headOn = sim(0, 10);
    headOn.m.applyCollision(0, -1, 1);
    expect(headOn.m.speed).toBe(0);
    const angled = sim(0, 10);
    angled.m.applyCollision(-Math.SQRT1_2, -Math.SQRT1_2, 1);
    expect(angled.m.speed).toBeGreaterThan(5);
    expect(angled.m.speed).toBeLessThan(9);
  });
});
