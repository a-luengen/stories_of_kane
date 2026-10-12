import type { HorseTuning } from '../config';
import { clamp01, lerp, smoothstep, wrapAngle } from '../util/math';

export type HorseMode = 'idle' | 'moving' | 'coasting' | 'braking' | 'pivoting';

/**
 * Horse locomotion model (pure logic, no rendering).
 *
 * - Velocity is always `speed` along `heading`; there is no sideways drift.
 * - Heading turns towards the target at a speed-dependent rate (smooth arcs, never jumps).
 * - Opposite input (> brakeAngle) brakes hard without turning; below pivotSpeed the horse pivots
 *   in place until roughly aligned, then accelerates.
 */
export class HorseMotor {
  heading = 0;
  speed = 0;
  mode: HorseMode = 'idle';
  /** Actual heading change rate this step (rad/s, signed). */
  angularVelocity = 0;
  /** Signed angle from heading to the target direction (0 without input). */
  delta = 0;
  /** 0..1, how hard the horse is turning relative to its current max turn rate. */
  turnIntensity = 0;
  /** Target heading of the last update, or null. */
  target: number | null = null;

  constructor(public tuning: HorseTuning) {}

  /** Max turn rate at the current speed: high when slow, low at gallop. */
  turnRate(): number {
    const t = this.tuning;
    return lerp(t.turnRateSlow, t.turnRateGallop, clamp01(this.speed / t.gallopSpeed));
  }

  /** Tightest radius the horse can currently turn (Infinity when stopped). */
  minTurnRadius(): number {
    return this.speed > 1e-3 ? this.speed / this.turnRate() : Infinity;
  }

  /** Radius of the arc actually being driven this step. */
  currentTurnRadius(): number {
    return Math.abs(this.angularVelocity) > 1e-3 ? this.speed / Math.abs(this.angularVelocity) : Infinity;
  }

  /**
   * @param target desired heading (radians) or null when no direction is held
   * @param gallop raise max speed from canter to gallop
   */
  /** `cap`: a top speed below the usual (a horse ambling about on its own). */
  update(target: number | null, gallop: boolean, dt: number, cap = Infinity): void {
    const t = this.tuning;
    this.target = target;
    this.angularVelocity = 0;
    this.turnIntensity = 0;

    if (target === null) {
      // Coast: smooth decay, heading unchanged.
      this.delta = 0;
      this.mode = this.speed > 0 ? 'coasting' : 'idle';
      this.speed = Math.max(0, this.speed - this.coastDecel() * dt);
      if (this.speed < t.stopEpsilon) this.speed = 0;
      return;
    }

    const delta = wrapAngle(target - this.heading);
    const absDelta = Math.abs(delta);
    this.delta = delta;
    const maxSpeed = Math.min(cap, gallop ? t.gallopSpeed : t.canterSpeed);

    if (absDelta > t.brakeAngle && this.speed > t.pivotSpeed) {
      // Opposite input: brake hard, keep heading.
      this.mode = 'braking';
      this.speed = Math.max(0, this.speed - t.brakeDecel * dt);
      return;
    }

    if (this.speed <= t.pivotSpeed && absDelta > t.pivotAlignAngle) {
      // Slow / standing: pivot in place towards the target before moving off.
      this.mode = 'pivoting';
      const step = Math.sign(delta) * Math.min(absDelta, t.pivotTurnRate * dt);
      this.heading = wrapAngle(this.heading + step);
      this.angularVelocity = step / dt;
      this.turnIntensity = 1;
      this.speed = Math.max(0, this.speed - t.brakeDecel * dt);
      if (this.speed < t.stopEpsilon) this.speed = 0;
      return;
    }

    // Normal steering along an arc.
    this.mode = 'moving';
    const maxStep = this.turnRate() * dt;
    const step = Math.max(-maxStep, Math.min(maxStep, delta));
    this.heading = wrapAngle(this.heading + step);
    this.angularVelocity = step / dt;
    this.turnIntensity = maxStep > 0 ? Math.abs(step) / maxStep : 0;

    // Turning hard bleeds speed.
    this.speed -= this.speed * t.turnSpeedLoss * this.turnIntensity * dt;

    if (this.speed < maxSpeed) {
      // Smooth ease-in from standstill and ease-out approaching max speed.
      const easeIn = lerp(0.45, 1, smoothstep(0, 0.25 * t.gallopSpeed, this.speed));
      const easeOut = Math.max(0.3, 1 - this.speed / maxSpeed);
      const accel = t.acceleration * easeIn * easeOut * (1 - 0.6 * this.turnIntensity);
      this.speed = Math.min(maxSpeed, this.speed + accel * dt);
    } else {
      // E.g. released Shift at gallop: settle down to canter.
      this.speed = Math.max(maxSpeed, this.speed - this.coastDecel() * dt);
    }
  }

  private coastDecel(): number {
    const t = this.tuning;
    // Firmer at speed, gentler near the stop → smooth roll-out.
    return t.decay * (0.35 + 0.65 * clamp01(this.speed / t.gallopSpeed));
  }

  /** Collision response: keep only the tangential part of the velocity. */
  applyCollision(nx: number, nz: number, lossFactor: number): void {
    if (this.speed <= 0) return;
    const vx = Math.sin(this.heading);
    const vz = Math.cos(this.heading);
    const into = vx * nx + vz * nz; // < 0 when moving into the obstacle
    if (into >= 0) return;
    const impact = -into; // 1 = head-on
    const tx = vx - into * nx;
    const tz = vz - into * nz;
    const tl = Math.hypot(tx, tz);
    const keep = 1 - lossFactor * (1 - Math.sqrt(Math.max(0, 1 - impact * impact)));
    if (tl < 1e-3 || impact > 0.995) {
      this.speed = 0;
      return;
    }
    // Deflect heading along the obstacle; speed scales with how glancing the hit was.
    this.heading = Math.atan2(tx / tl, tz / tl);
    this.speed *= keep;
  }
}
