import * as THREE from 'three';
import type { WeaponDef } from '../data/types';
import { clamp, yawToX, yawToZ } from '../util/math';

export interface ShotRequest {
  origin: THREE.Vector3;
  /** One direction per bullet / pellet. */
  dirs: THREE.Vector3[];
  weapon: WeaponDef;
}

/** Damage multiplier for a bullet that has traveled `dist`. */
export function falloff(def: WeaponDef, dist: number): number {
  if (dist <= def.falloffStart) return 1;
  const t = clamp((dist - def.falloffStart) / Math.max(1e-6, def.range - def.falloffStart), 0, 1);
  return 1 + (def.falloffMin - 1) * t;
}

export function pelletCount(def: WeaponDef, rand = Math.random): number {
  if (typeof def.pellets === 'number') return def.pellets;
  const [lo, hi] = def.pellets;
  return lo + Math.floor(rand() * (hi - lo + 1));
}

/**
 * Scatter the aim point around `aim` and return the bullet direction from `origin`. The radius
 * grows faster than linearly with distance, so far shots are disproportionately harder to land.
 */
export function scatterDir(
  origin: THREE.Vector3,
  aim: THREE.Vector3,
  spread: number,
  growth: number,
  fallbackYaw: number,
  uniform: boolean,
  rand = Math.random,
): THREE.Vector3 {
  const p = aim.clone();
  const dist = Math.hypot(p.x - origin.x, p.z - origin.z);
  const radius = dist * Math.tan(spread) * (1 + dist * growth);
  const a = rand() * Math.PI * 2;
  // Single bullets are biased towards the centre; pellets fill the cone evenly.
  const r = radius * (uniform ? Math.sqrt(rand()) : rand());
  p.x += Math.cos(a) * r;
  p.z += Math.sin(a) * r;
  // Raised surfaces (walls, targets, people) also scatter vertically; ground shots stay on the ground.
  if (p.y > 0.05) p.y = Math.max(0, p.y + (rand() - 0.5) * radius);

  // If the point is right at (or behind) the muzzle, keep the facing direction so the shot
  // never goes back through the shooter.
  let dx = p.x - origin.x;
  let dz = p.z - origin.z;
  if (Math.hypot(dx, dz) < 0.6) {
    dx = yawToX(fallbackYaw) * 0.6;
    dz = yawToZ(fallbackYaw) * 0.6;
  }
  return new THREE.Vector3(dx, p.y - origin.y, dz).normalize();
}

/** Ammo, fire-rate and reload state of one carried weapon. */
export class WeaponState {
  ammo: number;
  private cooldown = 0;
  /** Remaining reload time, 0 when not reloading. */
  reloadLeft = 0;

  constructor(readonly def: WeaponDef) {
    this.ammo = def.magazine;
  }

  get reloading(): boolean {
    return this.reloadLeft > 0;
  }

  /** 0..1 reload progress or -1. */
  get reloadProgress(): number {
    return this.reloading ? 1 - this.reloadLeft / this.def.reloadTime : -1;
  }

  get ready(): boolean {
    return this.cooldown <= 0 && !this.reloading && this.ammo > 0;
  }

  update(dt: number): void {
    this.cooldown = Math.max(0, this.cooldown - dt);
    if (this.reloading) {
      this.reloadLeft -= dt;
      if (this.reloadLeft <= 0) {
        this.reloadLeft = 0;
        this.ammo = this.def.magazine;
      }
    }
  }

  startReload(): void {
    if (!this.reloading && this.ammo < this.def.magazine) this.reloadLeft = this.def.reloadTime;
  }

  cancelReload(): void {
    this.reloadLeft = 0;
  }

  /** Instantly refill (respawns). */
  refill(): void {
    this.ammo = this.def.magazine;
    this.reloadLeft = 0;
    this.cooldown = 0;
  }

  /**
   * Fire one round at `aim` if possible. `spreadMul` scales the weapon's base spread
   * (movement, horseback, NPC skill). Starts a reload when trying to fire an empty gun.
   */
  fire(origin: THREE.Vector3, aim: THREE.Vector3, spreadMul: number, facingYaw: number): ShotRequest | null {
    if (this.cooldown > 0 || this.reloading) return null;
    if (this.ammo <= 0) {
      this.startReload();
      return null;
    }
    this.ammo--;
    this.cooldown = this.def.fireInterval;
    const n = pelletCount(this.def);
    const dirs: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      dirs.push(scatterDir(origin, aim, this.def.spread * spreadMul, this.def.spreadGrowth, facingYaw, n > 1));
    }
    return { origin, dirs, weapon: this.def };
  }
}
