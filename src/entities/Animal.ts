import * as THREE from 'three';
import { CONFIG } from '../config';
import { ANIMALS, type AnimalDef, type AnimalPose, type AnimalSpawn } from '../data/animals';
import type { Vec2 } from '../data/types';
import type { NavGrid } from '../ai/NavGrid';
import type { Interactable } from '../Interaction';
import { GridContainer } from '../items/GridContainer';
import { itemDef } from '../items/ItemDef';
import { createItem } from '../items/ItemInstance';
import { angleDelta, dampAngle, dirToYaw, lerp, yawToX, yawToZ } from '../util/math';
import { segmentVsCylinder, type CircleCollider, type CollisionWorld } from '../world/Colliders';
import { AnimalModel, type AnimalView } from './AnimalModel';
import type { BurstKind } from './Particles';
import { SnakeModel } from './SnakeModel';
import type { Hitbox, HitInfo, Target } from './Targets';

/**
 * idle: standing in one of its poses · walk: strolling (or heading home) · flee: bolting ·
 * alert: a wild animal watching someone (warning them off) · hunt: going for them · dead: a carcass.
 */
export type AnimalMode = 'idle' | 'walk' | 'flee' | 'alert' | 'hunt' | 'dead';

/** Someone an animal may notice, attack or trample: the player, an NPC, a horse. */
export interface Prey {
  /** Who it is (the session tells them apart). */
  readonly key: object;
  readonly pos: THREE.Vector3;
  readonly radius: number;
  /** 0..1: crouching (harder to notice). */
  readonly crouch: number;
}

export interface AnimalContext {
  world: CollisionWorld;
  nav: NavGrid;
  /** Bodies to collide with (player, horses, NPCs, other animals; an animal skips its own). */
  colliders: readonly CircleCollider[];
  /** Where the player is (null: dead): whom pets watch. */
  player: Vec2 | null;
  /** Everyone wild animals may go for, and stampedes trample. */
  prey: readonly Prey[];
  /** An attack (or a trampling) landed: damage, and which way they're thrown (if at all). */
  bite(a: Animal, prey: Prey, damage: number, push: Vec2 | null): void;
}

/** Default radius a free (unpenned) animal wanders in around its spawn. */
const ROAM = 6;

/**
 * An animal on a map: strolls about its home (a pen, or a patch around where it was put), stops to
 * graze, root, peck, sit or lie down, bolts from gunfire and from anyone rushing past, and calms
 * down again. Pets can be petted, and a dog turns to watch whoever comes close. A bolting bison
 * tramples whoever is in its way.
 *
 * Wild hunters (wolves, bears, snakes) don't bolt: they notice whoever comes close (stand up, rear,
 * rattle), go for them if they come closer still or shoot, bite, give up past their leash, and go
 * home to rest. Packs act together (see AnimalSystem). It can be shot; carcasses can be looted.
 */
export class Animal implements Target, Interactable {
  readonly def: AnimalDef;
  readonly model: AnimalView;
  /** The carcass's contents (filled when it dies). */
  readonly inventory: GridContainer;
  readonly pos = new THREE.Vector3();
  readonly prevPos = new THREE.Vector3();
  readonly vel = new THREE.Vector2();
  readonly collider: CircleCollider;
  readonly priority = 1;
  readonly range: number;
  /** Set by the session: open the loot view for this carcass. */
  onLoot: (a: Animal) => void = () => {};
  /** Set by the session: the player pets it. */
  onPet: (a: Animal) => void = () => {};

  mode: AnimalMode = 'idle';
  pose: AnimalPose = 'stand';
  hp: number;
  /** Facing (yaw, 0 = +Z): where it walks; the model turns towards it smoothly. */
  heading: number;
  /** 1 right after a hit, fading. */
  flinch = 0;
  /** Who it has its eyes on: the player come close to a dog, or petting it (null: nobody). */
  lookAt: Vec2 | null = null;
  /** Seconds left of being petted. */
  petLeft = 0;
  /** Where it lives (a wolf: its pack's resting place); it never chases further than its leash from here. */
  home: Vec2;
  /** Whom a wild animal is watching or going for. */
  targetKey: object | null = null;
  /** What it did this step, for its pack: noticed someone, went for them, gave up (cleared by the system). */
  event: 'notice' | 'attack' | 'giveUp' | null = null;
  /** Attacks landed so far (the sound layer listens for it to go up). */
  bites = 0;
  /** Seconds spent watching its target (a bear rears for the first moments). */
  alertTime = 0;

  private renderYaw: number;
  private timer: number;
  private path: Vec2[] | null = null;
  private dest: Vec2 | null = null;
  private stuckLeft = 1;
  private progressFrom = new THREE.Vector2();
  private fleeFrom: Vec2 = [0, 0];
  private repathLeft = 0;
  private warnLeft = 0;
  private calmLeft = 0;
  private windup = 0;
  private biteCooldown = 0;
  /** 1 as it bites, fading (the lunge). */
  private lunge = 0;
  /** Walk back home before settling (a hunter that gave up). */
  private goHome = false;
  /** Seconds before a stampeding animal can trample the same one again. */
  private trampled = new Map<object, number>();

  constructor(
    readonly spawn: AnimalSpawn,
    private rand: () => number = Math.random,
  ) {
    this.def = ANIMALS[spawn.species];
    this.model = spawn.species === 'snake' ? new SnakeModel() : new AnimalModel(spawn.species);
    this.home = spawn.at;
    this.inventory = new GridContainer(this.def.lootGrid.w, this.def.lootGrid.h);
    this.hp = this.def.hp;
    this.range = this.def.radius + 1.3;
    this.collider = { kind: 'circle', x: spawn.at[0], z: spawn.at[1], r: this.def.radius, coverHeight: this.def.hit.y1, surface: 'wood', blocksBullets: false };
    this.pos.set(spawn.at[0], 0, spawn.at[1]);
    this.prevPos.copy(this.pos);
    this.heading = this.renderYaw = spawn.yaw ?? this.rand() * Math.PI * 2;
    this.model.root.position.copy(this.pos);
    this.model.root.rotation.y = this.heading;
    // Animals start in a pose, at different points of it.
    this.pose = this.pickPose();
    this.timer = this.rand() * this.def.idle.time[1];
  }

  get name(): string {
    return this.def.name;
  }

  get alive(): boolean {
    return this.mode !== 'dead';
  }

  // As someone NPCs can fight (see Npc.foe): never mounted, aimed at mid-body.
  readonly mounted = false;
  get dead(): boolean {
    return !this.alive;
  }
  get chestY(): number {
    return (this.def.hit.y0 + this.def.hit.y1) / 2;
  }

  // ---------------------------------------------------------------- Interactable (a pet, or a carcass)

  get label(): string {
    if (this.alive) return `Pet the ${this.name.toLowerCase()}`;
    return `Loot ${this.name}${this.inventory.isEmpty ? ' (empty)' : ''}`;
  }

  get promptHeight(): number {
    return this.def.hit.y1 * 0.6 + 0.3;
  }

  get position(): THREE.Vector3 {
    return this.pos;
  }

  /** A pet that isn't running off (or already being petted); a carcass with something to take. */
  canInteract(): boolean {
    if (this.alive) return !!this.def.pettable && this.mode !== 'flee' && this.petLeft <= 0;
    return this.def.loot.length > 0;
  }

  interact(): void {
    if (!this.alive) {
      this.onLoot(this);
      return;
    }
    this.petLeft = CONFIG.player.petTime;
    this.onPet(this);
  }

  /** The loot view changed the contents (LootTarget). */
  lootChanged(): void {}

  // ---------------------------------------------------------------- Target

  get object(): THREE.Object3D {
    return this.model.root;
  }

  /** Centres of the shootable cylinders along the body. */
  private hitCentres(): Vec2[] {
    const fx = yawToX(this.heading);
    const fz = yawToZ(this.heading);
    return this.def.hit.along.map((o): Vec2 => [this.pos.x + fx * o, this.pos.z + fz * o]);
  }

  /** The middle of the body (for the cover debug view). */
  hitbox(): Hitbox | null {
    if (!this.alive) return null;
    const h = this.def.hit;
    return { x: this.pos.x, z: this.pos.z, r: h.r, y0: h.y0, y1: h.y1 };
  }

  test(a: THREE.Vector3, b: THREE.Vector3): { t: number; normal: THREE.Vector3 } | null {
    if (!this.alive) return null;
    const h = this.def.hit;
    let best: { t: number; normal: THREE.Vector3 } | null = null;
    for (const [x, z] of this.hitCentres()) {
      const hit = segmentVsCylinder(a.x, a.y, a.z, b.x, b.y, b.z, x, z, h.r, h.y0, h.y1);
      if (hit && (!best || hit.t < best.t)) best = { t: hit.t, normal: new THREE.Vector3(hit.nx, hit.ny, hit.nz) };
    }
    return best;
  }

  hit(_point: THREE.Vector3, _dir: THREE.Vector3, info: HitInfo): BurstKind {
    if (!this.alive) return 'blood';
    this.hp -= info.damage;
    this.flinch = 1;
    if (this.hp <= 0) this.die();
    return 'blood';
  }

  private die(): void {
    this.mode = 'dead';
    this.hp = 0;
    this.vel.set(0, 0);
    this.clearPath();
    for (const l of this.def.loot) {
      const n = l.count[0] + Math.floor(this.rand() * (l.count[1] - l.count[0] + 1));
      if (n <= 0) continue;
      // A stack where the item stacks (meat, feathers), otherwise one each (hides).
      if (itemDef(l.item).stackable) this.inventory.placeAnywhere(createItem(l.item, n));
      else for (let i = 0; i < n; i++) this.inventory.placeAnywhere(createItem(l.item));
    }
  }

  // ---------------------------------------------------------------- events

  /**
   * Something frightening at `from` (a shot, a bullet, someone rushing by): bolt away from it (for
   * `time` seconds, or its usual while). Returns true if it wasn't already running.
   */
  startle(from: Vec2, time?: number): boolean {
    if (!this.alive) return false;
    const fresh = this.mode !== 'flee';
    this.fleeFrom = from;
    const [lo, hi] = this.def.fleeTime;
    this.timer = Math.max(fresh ? 0 : this.timer, time ?? lo + this.rand() * (hi - lo));
    if (fresh) {
      this.mode = 'flee';
      this.clearPath();
    }
    return fresh;
  }

  /** A wild animal notices someone: stops, stands (rears, rattles) and watches them. */
  watch(p: Prey): void {
    const h = this.def.hunts;
    if (!h || !this.alive || this.mode === 'flee' || this.mode === 'hunt' || this.mode === 'alert') return;
    this.mode = 'alert';
    this.targetKey = p.key;
    this.warnLeft = h.warn;
    this.calmLeft = h.calm;
    this.alertTime = 0;
    this.goHome = false;
    this.pose = h.rears ? 'rear' : 'stand';
    this.clearPath();
  }

  /** A wild animal goes for someone. */
  goFor(key: object): void {
    if (!this.def.hunts || !this.alive || this.mode === 'flee') return;
    if (this.mode !== 'hunt' || this.targetKey !== key) this.clearPath();
    this.mode = 'hunt';
    this.targetKey = key;
    this.goHome = false;
    this.windup = 0;
    this.pose = 'stand';
  }

  /** Gives up on whoever it was after and heads back home to rest. */
  standDown(): void {
    if (!this.alive || this.mode === 'flee') return;
    this.targetKey = null;
    this.mode = 'idle';
    this.timer = 0;
    this.goHome = true;
    this.clearPath();
  }

  // ---------------------------------------------------------------- simulation

  step(dt: number, ctx: AnimalContext): void {
    this.prevPos.copy(this.pos);
    this.flinch = Math.max(0, this.flinch - dt * 2.5);
    if (this.mode === 'dead') return;

    if (this.def.hunts) {
      this.stepHunter(dt, ctx);
      this.collider.x = this.pos.x;
      this.collider.z = this.pos.z;
      return;
    }
    this.petLeft = Math.max(0, this.petLeft - dt);
    this.lookAt = this.mode === 'flee' ? null : this.noticed(ctx);
    if (this.lookAt) {
      // Eyes on whoever came close (or is petting it): stop, nose up, and turn to them (unless lying down).
      if (this.mode === 'walk') {
        this.mode = 'idle';
        this.clearPath();
      }
      if (this.pose === 'graze') this.pose = 'stand';
      this.halt(dt, ctx);
      if (this.pose !== 'rest') this.heading = dampAngle(this.heading, dirToYaw(this.lookAt[0] - this.pos.x, this.lookAt[1] - this.pos.z), 4, dt);
      this.timer = Math.max(this.timer, 1.5); // and a moment more once they've gone
    } else {
      this.timer -= dt;
    }
    switch (this.lookAt ? null : this.mode) {
      case 'idle':
        this.halt(dt, ctx);
        if (this.timer <= 0) this.stroll(ctx);
        break;
      case 'walk':
        if (this.followPath(dt, this.def.walkSpeed, ctx) || this.timer <= 0) this.settle();
        break;
      case 'flee':
        this.flee(dt, ctx);
        if (this.def.trample) this.trample(dt, ctx);
        break;
    }
    this.collider.x = this.pos.x;
    this.collider.z = this.pos.z;
  }

  /** Stampeding: whoever is in the way ahead gets knocked down (and thrown aside). */
  private trample(dt: number, ctx: AnimalContext): void {
    const t = this.def.trample!;
    for (const [k, left] of this.trampled) {
      if (left - dt <= 0) this.trampled.delete(k);
      else this.trampled.set(k, left - dt);
    }
    const speed = this.vel.length();
    if (speed < 3) return;
    const fx = this.vel.x / speed;
    const fz = this.vel.y / speed;
    for (const p of ctx.prey) {
      if (this.trampled.has(p.key)) continue;
      const dx = p.pos.x - this.pos.x;
      const dz = p.pos.z - this.pos.z;
      if (Math.hypot(dx, dz) > this.def.radius + p.radius + 0.25 || dx * fx + dz * fz <= 0) continue;
      this.trampled.set(p.key, 1.5);
      ctx.bite(this, p, t.damage, [fx * t.push, fz * t.push]);
    }
  }

  /** A wild animal's step: rest at home, notice, warn, go for them, bite, give up. */
  private stepHunter(dt: number, ctx: AnimalContext): void {
    const h = this.def.hunts!;
    this.biteCooldown -= dt;
    this.lunge = Math.max(0, this.lunge - dt * 4);
    const target = this.targetKey ? (ctx.prey.find((p) => p.key === this.targetKey) ?? null) : null;
    if ((this.mode === 'alert' || this.mode === 'hunt') && !target) {
      // They're gone (dead, or left the place).
      this.standDown();
      this.event = 'giveUp';
    }
    this.lookAt = target && this.mode !== 'flee' ? [target.pos.x, target.pos.z] : null;
    switch (this.mode) {
      case 'idle':
      case 'walk': {
        const p = this.nearest(ctx.prey, h.notice, h.crouch);
        if (p) {
          this.watch(p);
          this.event = 'notice';
          break;
        }
        this.timer -= dt;
        if (this.mode === 'walk') {
          if (this.followPath(dt, this.def.walkSpeed, ctx) || this.timer <= 0) this.settle();
        } else {
          this.halt(dt, ctx);
          if (this.goHome) {
            this.goHome = false;
            const spot = this.pickSpot(ctx, this.home[0], this.home[1], 3, 1, true);
            if (spot) {
              this.mode = 'walk';
              this.timer = 40;
              this.setDest(spot, ctx);
            }
          } else if (this.timer <= 0) this.stroll(ctx);
        }
        break;
      }
      case 'alert': {
        const t = target!;
        this.halt(dt, ctx);
        this.face(t.pos, dt, 6);
        this.alertTime += dt;
        if (h.rears) this.pose = this.alertTime < 1.6 ? 'rear' : 'stand';
        const k = lerp(1, h.crouch, t.crouch);
        const d = this.distTo(t);
        if (d < h.attack * k) {
          this.warnLeft -= dt;
          if (this.warnLeft <= 0) {
            this.goFor(t.key);
            this.event = 'attack';
          }
        }
        if (d > h.notice * k) {
          this.calmLeft -= dt;
          if (this.calmLeft <= 0) {
            this.standDown();
            this.event = 'giveUp';
          }
        } else this.calmLeft = h.calm;
        break;
      }
      case 'hunt': {
        const t = target!;
        if (Math.hypot(t.pos.x - this.home[0], t.pos.z - this.home[1]) > h.leash) {
          // Past its leash: not worth it.
          this.standDown();
          this.event = 'giveUp';
          break;
        }
        const reach = h.bite.reach + this.def.radius + t.radius;
        if (this.distTo(t) > reach) {
          this.windup = 0;
          this.repathLeft -= dt;
          if (!this.dest || this.repathLeft <= 0) {
            this.setDest([t.pos.x, t.pos.z], ctx);
            this.repathLeft = 0.35;
          }
          if (this.followPath(dt, this.def.runSpeed, ctx)) this.clearPath();
        } else {
          this.halt(dt, ctx);
          this.face(t.pos, dt, 10);
          this.windup += dt;
          if (this.windup >= h.bite.windup && this.biteCooldown <= 0) {
            ctx.bite(this, t, h.bite.damage, null);
            this.bites++;
            this.lunge = 1;
            this.windup = 0;
            this.biteCooldown = h.bite.cooldown;
          }
        }
        break;
      }
      case 'flee':
        this.timer -= dt;
        this.flee(dt, ctx);
        break;
    }
  }

  /** The closest prey within `range` (shorter for someone crouching), or null. */
  private nearest(prey: readonly Prey[], range: number, crouchMul: number): Prey | null {
    let best: Prey | null = null;
    let bestD = Infinity;
    for (const p of prey) {
      const d = this.distTo(p);
      if (d < range * lerp(1, crouchMul, p.crouch) && d < bestD) {
        best = p;
        bestD = d;
      }
    }
    return best;
  }

  private distTo(p: Prey): number {
    return Math.hypot(p.pos.x - this.pos.x, p.pos.z - this.pos.z);
  }

  private face(at: THREE.Vector3, dt: number, rate: number): void {
    this.heading = dampAngle(this.heading, dirToYaw(at.x - this.pos.x, at.z - this.pos.z), rate, dt);
  }

  /** The player, if petting it or come within its watch range. */
  private noticed(ctx: AnimalContext): Vec2 | null {
    const p = ctx.player;
    if (!p) return null;
    if (this.petLeft > 0) return p;
    const w = this.def.watch;
    return w !== undefined && Math.hypot(p[0] - this.pos.x, p[1] - this.pos.z) < w ? p : null;
  }

  /** Done standing about: amble to another spot of its home. */
  private stroll(ctx: AnimalContext): void {
    const to = this.pickSpot(ctx, this.pos.x, this.pos.z, this.def.stroll);
    if (!to) {
      this.settle();
      return;
    }
    this.mode = 'walk';
    this.timer = 20; // give up on a walk that goes nowhere
    this.setDest(to, ctx);
  }

  /** Stop and take up a pose for a while. */
  private settle(): void {
    this.mode = 'idle';
    this.clearPath();
    this.pose = this.pickPose();
    const [lo, hi] = this.def.idle.time;
    this.timer = lo + this.rand() * (hi - lo);
  }

  private flee(dt: number, ctx: AnimalContext): void {
    this.repathLeft -= dt;
    if (!this.dest || this.repathLeft <= 0) {
      // Straight away from the fright, a little off to one side; penned animals make for the far fence.
      const ax = this.pos.x - this.fleeFrom[0];
      const az = this.pos.z - this.fleeFrom[1];
      const yaw = (Math.hypot(ax, az) > 0.01 ? dirToYaw(ax, az) : this.rand() * Math.PI * 2) + (this.rand() - 0.5) * 0.9;
      const far = this.def.runSpeed * 1.6;
      const to = this.pickSpot(ctx, this.pos.x + yawToX(yaw) * far, this.pos.z + yawToZ(yaw) * far, 3, 2.5) ?? this.pickSpot(ctx, this.pos.x, this.pos.z, far, 2.5);
      if (to) this.setDest(to, ctx);
      this.repathLeft = 1.2;
    }
    if (this.followPath(dt, this.def.runSpeed, ctx)) this.clearPath();
    if (this.timer > 0) return;
    // Calmed down: back home if it ran off, otherwise right here.
    const [hx, hz] = this.spawn.at;
    if (!this.spawn.pen && Math.hypot(this.pos.x - hx, this.pos.z - hz) > (this.spawn.roam ?? ROAM)) {
      const home = this.pickSpot(ctx, hx, hz, (this.spawn.roam ?? ROAM) * 0.6);
      if (home) {
        this.mode = 'walk';
        this.timer = 40;
        this.setDest(home, ctx);
        return;
      }
    }
    this.settle();
  }

  /**
   * A walkable spot within `r` of (x, z) that is part of its home: inside its pen, or within its
   * roaming radius (times `slack` for a bolting animal, which may run a bit beyond it). `near`: a
   * spot right where it is will do (going home and already there).
   */
  private pickSpot(ctx: AnimalContext, x: number, z: number, r: number, slack = 1, near = false): Vec2 | null {
    const pen = this.spawn.pen;
    const margin = this.def.radius + 0.5;
    for (let i = 0; i < 8; i++) {
      const a = this.rand() * Math.PI * 2;
      const d = i === 0 ? 0 : this.rand() * r;
      let tx = x + Math.cos(a) * d;
      let tz = z + Math.sin(a) * d;
      if (pen) {
        tx = Math.min(Math.max(tx, pen[0] + margin), pen[2] - margin);
        tz = Math.min(Math.max(tz, pen[1] + margin), pen[3] - margin);
      } else {
        const roam = (this.spawn.roam ?? ROAM) * Math.max(1, slack);
        const hx = tx - this.spawn.at[0];
        const hz = tz - this.spawn.at[1];
        const h = Math.hypot(hx, hz);
        if (h > roam) {
          tx = this.spawn.at[0] + (hx / h) * roam;
          tz = this.spawn.at[1] + (hz / h) * roam;
        }
      }
      if (!near && Math.hypot(tx - this.pos.x, tz - this.pos.z) < 0.8) continue;
      if (ctx.nav.isFree(tx, tz)) return [tx, tz];
    }
    return null;
  }

  private pickPose(): AnimalPose {
    const poses = Object.entries(this.def.idle.poses) as [AnimalPose, number][];
    let r = this.rand() * poses.reduce((s, [, w]) => s + w, 0);
    for (const [p, w] of poses) {
      r -= w;
      if (r <= 0) return p;
    }
    return 'stand';
  }

  // ---------------------------------------------------------------- movement

  private setDest(to: Vec2, ctx: AnimalContext): void {
    this.dest = to;
    this.path = ctx.nav.findPath(this.pos.x, this.pos.z, to[0], to[1], 6000) ?? [to];
    this.stuckLeft = 1;
    this.progressFrom.set(this.pos.x, this.pos.z);
  }

  private clearPath(): void {
    this.dest = null;
    this.path = null;
  }

  private halt(dt: number, ctx: AnimalContext): void {
    this.steer(dt, 0, 0, ctx);
  }

  /** Walk the current path. Returns true on arrival. */
  private followPath(dt: number, speed: number, ctx: AnimalContext): boolean {
    const path = this.path;
    if (!path || path.length === 0) {
      this.halt(dt, ctx);
      return true;
    }
    let [wx, wz] = path[0];
    let d = Math.hypot(wx - this.pos.x, wz - this.pos.z);
    while (d < 0.3) {
      path.shift();
      if (path.length === 0) {
        this.halt(dt, ctx);
        return true;
      }
      [wx, wz] = path[0];
      d = Math.hypot(wx - this.pos.x, wz - this.pos.z);
    }
    // Ease in on the last waypoint.
    const v = path.length === 1 ? Math.min(speed, d * 2.5) : speed;
    this.steer(dt, ((wx - this.pos.x) / d) * v, ((wz - this.pos.z) / d) * v, ctx);

    // Stuck behind somebody (or a bad path): try again, or give up on it.
    this.stuckLeft -= dt;
    if (this.stuckLeft <= 0) {
      const moved = this.progressFrom.distanceTo(new THREE.Vector2(this.pos.x, this.pos.z));
      this.stuckLeft = 1;
      this.progressFrom.set(this.pos.x, this.pos.z);
      if (moved < 0.2) {
        this.halt(dt, ctx);
        return true;
      }
    }
    return false;
  }

  private steer(dt: number, tx: number, tz: number, ctx: AnimalContext): void {
    const accel = (this.mode === 'flee' || this.mode === 'hunt' ? 16 : 6) * dt;
    const dx = tx - this.vel.x;
    const dz = tz - this.vel.y;
    const dl = Math.hypot(dx, dz);
    if (dl <= accel) this.vel.set(tx, tz);
    else this.vel.set(this.vel.x + (dx / dl) * accel, this.vel.y + (dz / dl) * accel);
    if (this.vel.lengthSq() < 1e-6) return;

    this.pos.x += this.vel.x * dt;
    this.pos.z += this.vel.y * dt;
    const pt = { x: this.pos.x, z: this.pos.z };
    const others = ctx.colliders.filter((c) => c !== this.collider);
    const c = ctx.world.resolveCircle(pt, this.def.radius, others);
    // Penned: never out (not through the gate, nor squeezed through the rails in a crush).
    const pen = this.spawn.pen;
    const r = this.def.radius;
    this.pos.x = pen ? Math.min(Math.max(pt.x, pen[0] + r), pen[2] - r) : pt.x;
    this.pos.z = pen ? Math.min(Math.max(pt.z, pen[1] + r), pen[3] - r) : pt.z;
    if (c.hit) {
      const vn = this.vel.x * c.nx + this.vel.y * c.nz;
      if (vn < 0) this.vel.set(this.vel.x - vn * c.nx, this.vel.y - vn * c.nz);
    }
    if (this.vel.lengthSq() > 0.04) this.heading = dirToYaw(this.vel.x, this.vel.y);
  }

  // ---------------------------------------------------------------- rendering

  sync(alpha: number, frameDt: number): void {
    this.model.root.position.lerpVectors(this.prevPos, this.pos, alpha);
    if (this.alive) this.renderYaw = dampAngle(this.renderYaw, this.heading, 7, frameDt);
    this.model.root.rotation.y = this.renderYaw;
    this.model.animate(frameDt, {
      speed: this.vel.length(),
      runSpeed: this.def.runSpeed,
      pose: this.pose,
      dead: !this.alive,
      flinch: this.flinch,
      look: this.lookAt ? angleDelta(this.renderYaw, dirToYaw(this.lookAt[0] - this.pos.x, this.lookAt[1] - this.pos.z)) : null,
      wag: this.petLeft > 0 ? 1 : this.lookAt && !this.def.hunts ? 0.35 : 0,
      alert: this.mode === 'alert' || this.mode === 'hunt',
      attack: Math.max(this.lunge, this.def.hunts ? (this.windup / this.def.hunts.bite.windup) * 0.3 : 0),
    });
  }
}
