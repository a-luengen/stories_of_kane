import { describe, expect, it } from 'vitest';
import { HorseTail, type TailDrive } from './HorseTail';

const DT = 1 / 60;
const still: TailDrive = { speed01: 0, accel: 0, turnRate: 0, pivoting: false, braking: false, gaitPhase: 0 };

function run(t: HorseTail, seconds: number, d: Partial<TailDrive>, each?: () => void): void {
  for (let s = 0; s < seconds; s += DT) {
    t.update(DT, { ...still, ...d, gaitPhase: s * 2 });
    each?.();
  }
}

describe('horse tail', () => {
  it('hangs at rest and swishes side to side now and then', () => {
    const t = new HorseTail(0);
    run(t, 2, {});
    expect(Math.abs(t.rootPitch - 0.18)).toBeLessThan(0.1);
    let maxSide = 0;
    run(t, 14, {}, () => (maxSide = Math.max(maxSide, Math.abs(t.tipSide))));
    expect(maxSide).toBeGreaterThan(0.3); // at least one fly-swatting swish
  });

  it('lifts and streams back at a gallop', () => {
    const t = new HorseTail(0);
    run(t, 3, { speed01: 1 });
    expect(t.rootPitch).toBeGreaterThan(1);
    expect(t.tipPitch).toBeGreaterThan(1);
  });

  it('swings forward when braking and outward in turns', () => {
    const t = new HorseTail(0);
    run(t, 3, { speed01: 0.8 });
    const before = t.rootPitch;
    run(t, 0.4, { speed01: 0.5, accel: -20, braking: true });
    expect(t.rootPitch).toBeLessThan(before - 0.8);
    const turn = new HorseTail(0);
    run(turn, 2, { speed01: 0.5, turnRate: 1.5 }); // turning towards +X
    expect(turn.tipSide).toBeLessThan(-0.2); // tail out to -X
  });

  it('the tip lags behind the root (ripples down the chain)', () => {
    const t = new HorseTail(0);
    run(t, 2, {});
    run(t, 0.1, { speed01: 1, accel: 15 });
    expect(t.rootPitch - t.tipPitch).toBeGreaterThan(0.1);
  });
});
