import { describe, expect, it } from 'vitest';
import { KNEE_MAX, LEG_DIMS, legReach, legTargets, type GaitState } from './HumanGait';

const base: GaitState = { phase: 0, stride: 0, run: 0, crouch: 0, time: 0, buckle: 0, mounted: false, crossed: false };
const standing = legReach({ hip: 0, knee: 0, ankle: 0, roll: 0 }, LEG_DIMS.male);

describe('human gait', () => {
  it('legs add up to the hip height for both bodies', () => {
    expect(standing).toBeCloseTo(0.88);
    expect(legReach({ hip: 0, knee: 0, ankle: 0, roll: 0 }, LEG_DIMS.female)).toBeCloseTo(0.88);
    expect(LEG_DIMS.male.thigh).toBeGreaterThan(LEG_DIMS.male.shin);
  });

  it('knees only bend forward and never past ~140°, feet stay flat in stance', () => {
    for (let phase = 0; phase < Math.PI * 2; phase += 0.3) {
      for (const g of [{ stride: 1, run: 1 }, { stride: 1, crouch: 1 }, { buckle: 1, crouch: 1 }]) {
        for (const leg of legTargets({ ...base, phase, ...g })) {
          expect(leg.knee).toBeGreaterThanOrEqual(0);
          expect(leg.knee).toBeLessThanOrEqual(KNEE_MAX);
        }
      }
    }
    // Stance (cos(phase) < 0): foot pitch = hip + knee + ankle = 0.
    const [l] = legTargets({ ...base, phase: Math.PI, stride: 1 });
    expect(l.hip + l.knee + l.ankle).toBeCloseTo(0);
  });

  it('the swinging leg bends more than the planted one; running bends it more than walking', () => {
    const [swing, stance] = legTargets({ ...base, phase: 0, stride: 1 }); // left mid-swing, right mid-stance
    expect(swing.knee).toBeGreaterThan(stance.knee + 0.5);
    expect(stance.knee).toBeGreaterThan(0); // slight bend while carrying the weight
    const [runSwing] = legTargets({ ...base, phase: 0, stride: 1, run: 1 });
    expect(runSwing.knee).toBeGreaterThan(swing.knee);
    // Near straight at heel strike.
    const [heel] = legTargets({ ...base, phase: Math.PI / 2, stride: 1 });
    expect(heel.knee).toBeLessThan(0.15);
  });

  it('crouching lowers the hips to roughly 60% of standing height', () => {
    const [l] = legTargets({ ...base, crouch: 1 });
    const h = legReach(l, LEG_DIMS.male);
    expect(h / standing).toBeGreaterThan(0.5);
    expect(h / standing).toBeLessThan(0.7);
  });
});
