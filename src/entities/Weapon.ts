import * as THREE from 'three';
import { CONFIG } from '../config';
import type { WeaponDef } from '../data/types';
import type { AmmoSource } from '../items/GridContainer';
import type { ItemInstance } from '../items/ItemInstance';
import { clamp, yawToX, yawToZ } from '../util/math';

/** Which hand a gun is in: the main gun in the right, a dual-wielded one in the left. */
export type Hand = 'right' | 'left';

export interface ShotRequest {
  origin: THREE.Vector3;
  /** One direction per bullet / pellet. */
  dirs: THREE.Vector3[];
  weapon: WeaponDef;
  /** The hand that fired (dual wielding alternates). */
  hand?: Hand;
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
  private cooldown = 0;
  /** Remaining reload time, 0 when not reloading. */
  reloadLeft = 0;
  private looseAmmo: number;

  /**
   * @param item  the weapon item; its `loadedRounds` is the magazine (kept when the item moves)
   * @param source  where reloads take rounds from (an inventory); null = unlimited
   */
  constructor(
    readonly def: WeaponDef,
    readonly item: ItemInstance | null = null,
    public source: AmmoSource | null = null,
  ) {
    this.looseAmmo = def.magazine;
  }

  /** Rounds in the magazine. */
  get ammo(): number {
    return this.item ? (this.item.loadedRounds ?? 0) : this.looseAmmo;
  }

  set ammo(v: number) {
    if (this.item) this.item.loadedRounds = v;
    else this.looseAmmo = v;
  }

  /** Rounds available to reload from. */
  get reserve(): number {
    return this.source ? this.source.ammoCount(this.def.ammoType) : Infinity;
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

  /** Empty with nothing to reload. */
  get dry(): boolean {
    return this.ammo <= 0 && this.reserve <= 0;
  }

  update(dt: number): void {
    this.cooldown = Math.max(0, this.cooldown - dt);
    if (this.reloading) {
      this.reloadLeft -= dt;
      if (this.reloadLeft <= 0) {
        this.reloadLeft = 0;
        const need = this.def.magazine - this.ammo;
        this.ammo += this.source ? this.source.takeAmmo(this.def.ammoType, need) : need;
      }
    }
  }

  /** Start reloading. False if full, already reloading, or there are no rounds to load. */
  startReload(): boolean {
    if (this.reloading || this.ammo >= this.def.magazine || this.reserve <= 0) return false;
    this.reloadLeft = this.def.reloadTime;
    return true;
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
    this.cooldown = this.def.fireInterval;
    return this.shoot(origin, aim, spreadMul, facingYaw);
  }

  /** One round out of the barrel, no cooldown or reload checks (GunSet paces dual shots itself). */
  shoot(origin: THREE.Vector3, aim: THREE.Vector3, spreadMul: number, facingYaw: number): ShotRequest {
    this.ammo--;
    const n = pelletCount(this.def);
    const dirs: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      dirs.push(scatterDir(origin, aim, this.def.spread * spreadMul, this.def.spreadGrowth, facingYaw, n > 1));
    }
    return { origin, dirs, weapon: this.def };
  }
}

/**
 * The gun(s) in one weapon slot: the main gun alone (then this just passes through to it), or
 * two dual-wieldable guns, fired right → left → right. While both have rounds the pace is the
 * slower gun's interval × `dualFireIntervalMultiplier`; with one empty the other fires at its own
 * rate. Reloading refills both from the same bags in (longer reload × `dualReloadMultiplier`).
 * Each gun keeps its own magazine (on its item) and its own spread.
 */
export class GunSet {
  private nextHand: Hand = 'right';
  private cooldown = 0;
  private reloadLeft = 0;
  private reloadTotal = 0;

  constructor(
    readonly right: WeaponState,
    public left: WeaponState | null = null,
  ) {}

  /** Swap the off-hand gun (or drop it); the pair starts fresh. */
  setLeft(left: WeaponState | null): void {
    if (left === this.left) return;
    this.cancelReload();
    this.left = left;
    this.nextHand = 'right';
    this.cooldown = 0;
  }

  get dual(): boolean {
    return this.left !== null;
  }

  /** The main gun's definition (look, draw, NPC tactics). */
  get def(): WeaponDef {
    return this.right.def;
  }

  gun(hand: Hand): WeaponState {
    return hand === 'left' && this.left ? this.left : this.right;
  }

  private get guns(): WeaponState[] {
    return this.left ? [this.right, this.left] : [this.right];
  }

  /** Rounds loaded across both guns. */
  get ammo(): number {
    return this.guns.reduce((n, g) => n + g.ammo, 0);
  }

  get magazine(): number {
    return this.guns.reduce((n, g) => n + g.def.magazine, 0);
  }

  /** Rounds to reload from (both ammo types if they differ). */
  get reserve(): number {
    const types = new Set(this.guns.map((g) => g.def.ammoType));
    let n = 0;
    for (const t of types) n += this.guns.find((g) => g.def.ammoType === t)!.reserve;
    return n;
  }

  get reloading(): boolean {
    return this.dual ? this.reloadLeft > 0 : this.right.reloading;
  }

  get reloadProgress(): number {
    if (!this.dual) return this.right.reloadProgress;
    return this.reloadLeft > 0 ? 1 - this.reloadLeft / this.reloadTotal : -1;
  }

  /** Seconds a dual reload takes. */
  get reloadTime(): number {
    if (!this.left) return this.right.def.reloadTime;
    return Math.max(this.right.def.reloadTime, this.left.def.reloadTime) * CONFIG.weapons.dualReloadMultiplier;
  }

  /** Time between shots right now. */
  get interval(): number {
    if (!this.left) return this.right.def.fireInterval;
    if (this.right.ammo > 0 && this.left.ammo > 0) return Math.max(this.right.def.fireInterval, this.left.def.fireInterval) * CONFIG.weapons.dualFireIntervalMultiplier;
    return (this.right.ammo > 0 ? this.right : this.left).def.fireInterval;
  }

  get ready(): boolean {
    if (!this.dual) return this.right.ready;
    return this.cooldown <= 0 && !this.reloading && this.ammo > 0;
  }

  get dry(): boolean {
    return this.ammo <= 0 && this.reserve <= 0;
  }

  get drawTime(): number {
    return Math.max(...this.guns.map((g) => g.def.drawTime));
  }

  update(dt: number): void {
    for (const g of this.guns) g.update(dt);
    this.cooldown = Math.max(0, this.cooldown - dt);
    if (this.reloadLeft > 0) {
      this.reloadLeft -= dt;
      if (this.reloadLeft <= 0) {
        this.reloadLeft = 0;
        for (const g of this.guns) {
          const need = g.def.magazine - g.ammo;
          g.ammo += g.source ? g.source.takeAmmo(g.def.ammoType, need) : need;
        }
      }
    }
  }

  /** Reload whatever needs it. False if nothing can be loaded. */
  startReload(): boolean {
    if (!this.dual) return this.right.startReload();
    if (this.reloading) return false;
    if (!this.guns.some((g) => g.ammo < g.def.magazine && g.reserve > 0)) return false;
    this.reloadTotal = this.reloadLeft = this.reloadTime;
    return true;
  }

  cancelReload(): void {
    this.reloadLeft = 0;
    for (const g of this.guns) g.cancelReload();
  }

  /** Instantly refill both (respawns). */
  refill(): void {
    for (const g of this.guns) g.refill();
    this.reloadLeft = this.cooldown = 0;
  }

  /**
   * Fire the next gun. `origin(hand)` gives each hand's muzzle. Dual: alternates hands, skipping
   * an empty gun; both empty starts a reload.
   */
  fire(origin: (hand: Hand) => THREE.Vector3, aim: THREE.Vector3, spreadMul: number, facingYaw: number): ShotRequest | null {
    if (!this.left) {
      const shot = this.right.fire(origin('right'), aim, spreadMul, facingYaw);
      return shot && { ...shot, hand: 'right' };
    }
    if (this.cooldown > 0 || this.reloading) return null;
    const order: Hand[] = this.nextHand === 'right' ? ['right', 'left'] : ['left', 'right'];
    const hand = order.find((h) => this.gun(h).ammo > 0);
    if (!hand) {
      this.startReload();
      return null;
    }
    this.cooldown = this.interval; // with both still loaded: the dual pace
    const shot = this.gun(hand).shoot(origin(hand), aim, spreadMul, facingYaw);
    this.nextHand = hand === 'right' ? 'left' : 'right';
    return { ...shot, hand };
  }
}
