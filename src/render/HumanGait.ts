import { clamp, lerp } from '../util/math';

/** Leg segment lengths (hip pivot → knee → ankle → sole). */
export interface LegDims {
  thigh: number;
  shin: number;
  /** Ankle pivot to the sole. */
  foot: number;
}

/**
 * Joint rotations of one leg (radians, rig convention): `hip` < 0 swings the thigh forward,
 * `knee` > 0 folds the shin back (knees only bend forward: 0..KNEE_MAX), `ankle` pitches the
 * foot (> 0 = toe down), `roll` swings the leg out sideways (+ = towards +X).
 */
export interface LegAngles {
  hip: number;
  knee: number;
  ankle: number;
  roll: number;
}

/** What the legs are doing. */
export interface GaitState {
  /** Stride phase (rad); the left leg uses it, the right one is half a stride off. */
  phase: number;
  /** 0 = standing still … 1 = full stride. */
  stride: number;
  /** 0 = walking … 1 = sprinting (longer stride, higher knees). */
  run: number;
  /** 0 = standing … 1 = crouched. */
  crouch: number;
  /** Seconds, for the idle weight shift. */
  time: number;
  /** 0..1: knees giving way (dying). */
  buckle: number;
  mounted: boolean;
  /** Leaning back with the ankles crossed. */
  crossed: boolean;
}

/** ~140°: knees never bend further. */
export const KNEE_MAX = 2.44;

/** Male and female leg proportions (thigh a little longer than the shin; same overall height). */
export const LEG_DIMS = {
  male: { thigh: 0.43, shin: 0.37, foot: 0.08 },
  female: { thigh: 0.44, shin: 0.36, foot: 0.08 },
} satisfies Record<string, LegDims>;

function leg(g: GaitState, phase: number, side: number): LegAngles {
  if (g.mounted) {
    // Straddling the saddle: thighs forward and out, shins down along the flanks, feet level.
    const hip = -0.5;
    const knee = 1.0;
    return { hip, knee, ankle: -(hip + knee), roll: side * 0.42 };
  }
  const s = g.stride * (1 - 0.45 * g.crouch); // short steps when crouched
  const run = g.run;
  const swing = Math.max(0, Math.cos(phase)); // leg travelling forward (lifted)
  const stance = Math.max(0, -Math.cos(phase)); // leg on the ground, pushing back
  // Thigh: forward at heel strike (phase π/2), back at toe-off (−π/2).
  let hipFwd = Math.sin(phase) * lerp(0.42, 0.72, run) * s;
  // Knee: flexes during the swing (most at mid-swing), near straight at heel strike, a slight
  // bend while carrying the weight.
  let knee = Math.pow(swing, 1.5) * lerp(0.95, 1.7, run) * s + stance * lerp(0.1, 0.32, run) * s;
  // Idle: weight shifts slowly from one leg to the other (one knee softens).
  const idle = 1 - Math.min(1, g.stride * 3);
  knee += idle * 0.07 * (1 + side * Math.sin(g.time * 0.9));
  // Crouch: thighs forward, knees deep.
  hipFwd += 1.15 * g.crouch;
  knee += 1.9 * g.crouch;
  // Dying: the knees go first.
  hipFwd += 0.7 * g.buckle;
  knee += 1.3 * g.buckle;
  let roll = 0;
  if (g.crossed) {
    // Leaning: the right ankle crosses over the left.
    if (side > 0) {
      hipFwd -= 0.12;
      roll = -0.22;
    } else {
      hipFwd += 0.06;
    }
  }
  const hip = -hipFwd;
  knee = clamp(knee, 0, KNEE_MAX);
  // Feet flat on the ground; the toe drops a little while the foot is in the air.
  const ankle = -(hip + knee) + 0.3 * swing * s;
  return { hip, knee, ankle, roll };
}

/** Target joint angles for the left and right leg. */
export function legTargets(g: GaitState): [LegAngles, LegAngles] {
  return [leg(g, g.phase, -1), leg(g, g.phase + Math.PI, 1)];
}

/** Height of the hip pivot above the sole for these angles (the planted foot sets the pelvis). */
export function legReach(a: LegAngles, d: LegDims): number {
  const v = d.thigh * Math.cos(a.hip) + d.shin * Math.cos(a.hip + a.knee);
  return v * Math.cos(a.roll) + d.foot;
}

/** How far in front of the hip pivot the middle of the foot is (+ = forward). */
export function footForward(a: LegAngles, d: LegDims): number {
  return d.thigh * Math.sin(-a.hip) - d.shin * Math.sin(a.hip + a.knee) + 0.05;
}

/** Forward lean of the upper body when fully crouched (keeps the weight over the feet). */
export const CROUCH_LEAN = 0.62;
