import * as THREE from 'three';
import { CONFIG } from '../config';
import { DEFAULT_LINES, NAMES } from '../data/npcs';
import type { NpcDef, NpcLines, Vec2, WeaponDef } from '../data/types';
import { resolveWeapon } from '../data/weapons';
import { EQUIP_SLOTS } from '../data/types';
import { Equipment, type SlotKey } from '../items/Equipment';
import { GridContainer } from '../items/GridContainer';
import { ammoItemFor, itemDef, itemForWeapon, weaponOf } from '../items/ItemDef';
import { createItem, type ItemInstance } from '../items/ItemInstance';
import type { Interactable } from '../Interaction';
import { damp, dirToYaw, moveToward, yawToX, yawToZ } from '../util/math';
import { segmentVsCylinder, type CircleCollider, type CollisionWorld } from '../world/Colliders';
import type { NavGrid } from '../world/NavGrid';
import { NpcModel } from './NpcModel';
import type { BurstKind } from './Particles';
import type { HitInfo, Target } from './Targets';
import { WeaponState, type ShotRequest } from './Weapon';
import { muzzleOffset } from './WeaponModel';

export type NpcMode = 'routine' | 'hostile' | 'flee' | 'hide' | 'dead';

/** What an NPC needs to know about the player. */
export interface PlayerView {
  readonly pos: THREE.Vector3;
  readonly mounted: boolean;
  readonly dead: boolean;
}

export interface NpcContext {
  world: CollisionWorld;
  nav: NavGrid;
  player: PlayerView;
  /** Dynamic circles to collide with (player, horse, NPCs; an NPC skips its own). */
  colliders: readonly CircleCollider[];
  /** Candidate cover spots next to buildings. */
  hideSpots: readonly Vec2[];
  fire(npc: Npc, shot: ShotRequest): void;
}

const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
const pick = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

export function randomName(body: 'male' | 'female'): string {
  return `${pick(NAMES[body])} ${pick(NAMES.last)}`;
}

/** Player chest point (what NPCs aim at and look for). */
export function playerChest(p: PlayerView, out = new THREE.Vector3()): THREE.Vector3 {
  return out.set(p.pos.x, p.mounted ? 2.2 : CONFIG.npc.chestHeight, p.pos.z);
}

/** A townsperson: routine, conversation, and a provocation-driven combat / flee state machine. */
export class Npc implements Target, Interactable {
  readonly name: string;
  readonly model: NpcModel;
  readonly lines: NpcLines;
  /** Pockets: ammo and whatever else (lootable when dead). */
  readonly inventory = new GridContainer(CONFIG.items.npcGrid.w, CONFIG.items.npcGrid.h);
  /** Weapon in slot 'w0' and worn clothing (clothing isn't lootable yet). */
  readonly equipment = new Equipment();
  private states = new WeakMap<ItemInstance, WeaponState>();
  /** Set by the game: open the loot view for this corpse. */
  onLoot: (npc: Npc) => void = () => {};
  readonly pos = new THREE.Vector3();
  readonly prevPos = new THREE.Vector3();
  readonly vel = new THREE.Vector2();
  readonly collider: CircleCollider;
  readonly range = CONFIG.npc.talkRange;
  readonly priority = 1;

  mode: NpcMode = 'routine';
  hp: number;
  /** Line currently shown in a speech bubble. */
  speech: string | null = null;
  private speechLeft = 0;

  private moveYaw = 0;
  private lookYaw = 0;
  private path: Vec2[] | null = null;
  private dest: Vec2 | null = null;
  private repathLeft = 0;
  private stuckLeft = 1;
  private progressFrom = new THREE.Vector2();

  private waitLeft = 0;
  private patrolIdx = 0;
  private talkLeft = 0;
  private alertLeft = 0;
  private warnCooldown = 0;
  private greetIdx = 0;
  private flinch = 0;

  // Combat.
  private draw = 0;
  private drawTarget = 0;
  private telegraphLeft = 0;
  private shotDelay = 0;
  private recoil = 0;
  private wasReloading = false;
  private strafeLeft = 0;
  private aimPoint = new THREE.Vector3();
  private lastSeen: THREE.Vector3 | null = null;
  /** Seconds the player has been away (out of range or out of sight). */
  calmTimer = 0;
  private sees = false;
  private fleeLeft = 0;
  private cowering = false;
  private deadLeft = 0;

  private chest = new THREE.Vector3();

  constructor(readonly def: NpcDef) {
    this.name = def.name ?? randomName(def.appearance.body);
    this.lines = { ...DEFAULT_LINES[def.attitude], ...def.lines };
    this.hp = this.maxHp;
    this.model = new NpcModel(def.appearance, null);
    this.collider = { kind: 'circle', x: 0, z: 0, r: CONFIG.npc.radius, height: 1.9, surface: 'wood', blocksBullets: false };
    this.spawn();
  }

  /** The equipped weapon's definition (null when unarmed or looted). */
  get weaponDef(): WeaponDef | null {
    const item = this.equipment.weapons[0];
    return item ? weaponOf(itemDef(item.defId)) : null;
  }

  /** The equipped weapon's state; reloads come out of this NPC's own inventory. */
  get weapon(): WeaponState | null {
    const item = this.equipment.weapons[0];
    const def = this.weaponDef;
    if (!item || !def) return null;
    let s = this.states.get(item);
    if (!s) {
      s = new WeaponState(def, item, this.inventory);
      this.states.set(item, s);
    }
    return s;
  }

  /** Fresh kit from the data: weapon, worn clothing, pockets (given or 1-2 boxes of matching ammo). */
  private resetLoadout(): void {
    for (const p of [...this.inventory.placements]) this.inventory.remove(p.item);
    for (const k of ['w0', ...EQUIP_SLOTS] as SlotKey[]) this.equipment.take(k);
    const w = resolveWeapon(this.def.weapon);
    if (w) this.equipment.put('w0', createItem(itemForWeapon(w).id), null);
    for (const s of EQUIP_SLOTS) {
      const id = this.def.appearance.clothing[s];
      if (id) this.equipment.put(s, createItem(id), null);
    }
    let grants = this.def.inventory;
    if (!grants) {
      const ammo = w ? ammoItemFor(w.ammoType) : null;
      grants = ammo ? Array.from({ length: 1 + Math.floor(Math.random() * 2) }, () => ({ item: ammo.id })) : [];
    }
    for (const g of grants) this.inventory.placeAnywhere(createItem(g.item, g.quantity ?? itemDef(g.item).boxQuantity ?? 1));
    this.lootChanged();
  }

  /** After items were taken from the corpse: update what the model carries. */
  lootChanged(): void {
    this.model.setWeapon(this.weaponDef);
  }

  /** Anything left to loot. */
  get hasLoot(): boolean {
    return !this.inventory.isEmpty || this.equipment.weapons[0] !== null;
  }

  get maxHp(): number {
    return this.def.hp ?? CONFIG.npc.hp;
  }

  get alive(): boolean {
    return this.mode !== 'dead';
  }

  /** True while aiming before the first shot (HUD shows a warning mark). */
  get telegraphing(): boolean {
    return this.mode === 'hostile' && this.draw >= 1 && this.telegraphLeft > 0;
  }

  // ---------------------------------------------------------------- Interactable

  get label(): string {
    if (!this.alive) return `Loot ${this.name}${this.hasLoot ? '' : ' (empty)'}`;
    return `Talk to ${this.name}`;
  }

  get promptHeight(): number {
    return this.alive ? 2.3 : 0.9;
  }

  get position(): THREE.Vector3 {
    return this.pos;
  }

  canInteract(): boolean {
    return this.mode === 'routine' || this.mode === 'dead';
  }

  interact(): void {
    if (!this.alive) {
      this.onLoot(this);
      return;
    }
    this.talkLeft = CONFIG.npc.talkTime;
    this.say(this.lines.greet[this.greetIdx++ % this.lines.greet.length], CONFIG.npc.talkTime);
  }

  // ---------------------------------------------------------------- Target (hitbox)

  get object(): THREE.Object3D {
    return this.model.root;
  }

  test(a: THREE.Vector3, b: THREE.Vector3): { t: number; normal: THREE.Vector3 } | null {
    if (!this.alive) return null;
    const top = this.mode === 'hide' && this.cowering ? 1.1 : 1.85;
    const h = segmentVsCylinder(a.x, a.y, a.z, b.x, b.y, b.z, this.pos.x, this.pos.z, 0.34, 0, top);
    return h ? { t: h.t, normal: new THREE.Vector3(h.nx, h.ny, h.nz) } : null;
  }

  hit(_point: THREE.Vector3, _dir: THREE.Vector3, info: HitInfo): BurstKind {
    if (!this.alive) return 'blood';
    this.hp -= info.damage;
    this.flinch = Math.max(this.flinch, 0.6);
    if (this.hp <= 0) this.die();
    return 'blood';
  }

  // ---------------------------------------------------------------- events

  /** Shot by the player, or saw the player shoot someone. */
  provoke(ctx: NpcContext): void {
    if (!this.alive) return;
    this.calmTimer = 0;
    this.talkLeft = 0;
    if (this.weapon && !this.weapon.dry) {
      if (this.mode !== 'hostile') {
        this.mode = 'hostile';
        this.say(pick(this.lines.hostile));
        this.drawTarget = 1;
        this.shotDelay = 0;
        this.telegraphLeft = this.weaponDef!.ai.telegraph;
        this.aimPoint.copy(playerChest(ctx.player, this.chest));
        this.clearPath();
      }
      this.lastSeen = ctx.player.pos.clone();
    } else if (this.mode !== 'flee' && this.mode !== 'hide') {
      this.startFleeing();
    }
  }

  /** A player bullet landed close by: flinch and warn (never hostile on its own). */
  nearMiss(): void {
    if (this.mode !== 'routine') return;
    this.flinch = 1;
    this.alertLeft = 2.5;
    this.talkLeft = 0;
    if (this.warnCooldown <= 0) {
      this.say(pick(this.lines.warn));
      this.warnCooldown = CONFIG.npc.warnCooldown;
    }
  }

  /** Back to the routine (weapon put away). */
  calmDown(silent = false): void {
    if (!this.alive || this.mode === 'routine') return;
    this.mode = 'routine';
    this.drawTarget = 0;
    this.cowering = false;
    this.lastSeen = null;
    this.calmTimer = 0;
    this.waitLeft = 1;
    this.clearPath();
    if (!silent) this.say(pick(this.lines.calm));
  }

  private startFleeing(): void {
    this.mode = 'flee';
    this.fleeLeft = 2.2;
    this.cowering = false;
    this.say(pick(this.lines.flee));
    this.clearPath();
  }

  private die(): void {
    this.mode = 'dead';
    this.hp = 0;
    this.deadLeft = CONFIG.npc.respawnTime;
    this.vel.set(0, 0);
    this.clearPath();
    this.speech = null;
    this.drawTarget = 0;
  }

  /** (Re)place at the spawn point with full health. */
  spawn(): void {
    const [x, z] = this.def.spawn;
    this.pos.set(x, 0, z);
    this.prevPos.copy(this.pos);
    this.vel.set(0, 0);
    this.hp = this.maxHp;
    this.mode = 'routine';
    this.draw = this.drawTarget = 0;
    this.resetLoadout();
    this.clearPath();
    const r = this.def.routine;
    const facing = r.kind === 'lean' || r.kind === 'idle' ? r.facing : 0;
    this.moveYaw = this.lookYaw = facing;
    this.model.face(facing);
    this.collider.x = x;
    this.collider.z = z;
  }

  private say(text: string, time = CONFIG.npc.speechTime): void {
    this.speech = text;
    this.speechLeft = time;
  }

  // ---------------------------------------------------------------- simulation

  step(dt: number, ctx: NpcContext): void {
    this.prevPos.copy(this.pos);
    this.speechLeft -= dt;
    if (this.speechLeft <= 0) this.speech = null;
    this.flinch = moveToward(this.flinch, 0, dt * 1.6);
    this.recoil = moveToward(this.recoil, 0, dt * 5);
    this.warnCooldown -= dt;

    if (this.mode === 'dead') {
      this.deadLeft -= dt;
      if (this.deadLeft <= 0) this.spawn();
      return;
    }

    const p = ctx.player;
    const chest = playerChest(p, this.chest);
    const dist = Math.hypot(p.pos.x - this.pos.x, p.pos.z - this.pos.z);
    if (this.mode !== 'routine') {
      this.sees = !p.dead && dist < CONFIG.npc.awarenessRange && this.lineOfSight(ctx, chest);
      if (this.sees) {
        this.calmTimer = 0;
        this.lastSeen = p.pos.clone();
      } else {
        this.calmTimer += dt;
      }
      if (this.calmTimer >= CONFIG.npc.calmTime) this.calmDown();
    }

    // Weapon draw / holster.
    if (this.weaponDef) {
      this.draw = moveToward(this.draw, this.drawTarget, dt / this.weaponDef.drawTime);
      this.weapon!.update(dt);
    }

    switch (this.mode) {
      case 'routine':
        this.routine(dt, ctx, dist);
        break;
      case 'hostile':
        this.combat(dt, ctx, dist, chest);
        break;
      case 'flee':
      case 'hide':
        this.flee(dt, ctx, dist);
        break;
    }

    this.collider.x = this.pos.x;
    this.collider.z = this.pos.z;
  }

  private routine(dt: number, ctx: NpcContext, dist: number): void {
    const p = ctx.player;
    const r = this.def.routine;
    const noticing = !p.dead && dist < CONFIG.npc.noticeRange;
    const towardPlayer = dirToYaw(p.pos.x - this.pos.x, p.pos.z - this.pos.z);
    this.talkLeft -= dt;
    this.alertLeft -= dt;

    // Talking, startled or just noticing the player: stop and face them.
    if (this.talkLeft > 0 || this.alertLeft > 0 || (noticing && r.kind !== 'lean' && r.kind !== 'idle')) {
      this.lookYaw = towardPlayer;
      this.halt(dt, ctx);
      return;
    }

    if (r.kind === 'lean' || r.kind === 'idle') {
      if (this.distTo(r.at) > 0.4) {
        if (!this.dest) this.setDest(r.at, ctx);
        if (this.followPath(dt, CONFIG.npc.walkSpeed, ctx)) this.clearPath();
      } else {
        this.halt(dt, ctx);
        this.moveYaw = r.facing;
        this.lookYaw = noticing ? towardPlayer : r.facing;
      }
      return;
    }

    if (!this.dest) {
      this.halt(dt, ctx);
      this.waitLeft -= dt;
      if (this.waitLeft > 0) return;
      let target: Vec2;
      if (r.kind === 'wander') {
        const [x, z] = pick(r.points);
        const j = r.jitter ?? 1;
        target = ctx.nav.nearestFree(x + rand(-j, j), z + rand(-j, j)) ?? [x, z];
      } else {
        target = r.points[this.patrolIdx % r.points.length];
        this.patrolIdx++;
      }
      this.setDest(target, ctx);
    }
    if (this.followPath(dt, CONFIG.npc.walkSpeed, ctx)) {
      this.clearPath();
      this.waitLeft = r.kind === 'wander' ? rand(...(r.pause ?? [2, 5])) : (r.pause ?? 1);
    }
    this.lookYaw = this.moveYaw;
  }

  private combat(dt: number, ctx: NpcContext, dist: number, chest: THREE.Vector3): void {
    const def = this.weaponDef!;
    const weapon = this.weapon!;
    // Out of ammo with nothing to reload: run.
    if (weapon.dry && !weapon.reloading) {
      this.drawTarget = 0;
      this.startFleeing();
      return;
    }
    const nc = CONFIG.npc;

    // Aim lags behind the target (reaction time), so moving targets are harder to hit.
    this.aimPoint.x = damp(this.aimPoint.x, chest.x, 1 / (this.def.reactionTime ?? nc.reactionTime), dt);
    this.aimPoint.y = damp(this.aimPoint.y, chest.y, 1 / (this.def.reactionTime ?? nc.reactionTime), dt);
    this.aimPoint.z = damp(this.aimPoint.z, chest.z, 1 / (this.def.reactionTime ?? nc.reactionTime), dt);

    // Movement: keep the weapon's preferred distance; hunt the last known position when out of sight.
    const [lo, hi] = def.ai.preferredRange;
    let speed = nc.combatSpeed;
    if (!this.sees) {
      if (this.lastSeen && this.distTo([this.lastSeen.x, this.lastSeen.z]) > 1) {
        this.repathLeft -= dt;
        if (!this.dest || this.repathLeft <= 0) this.setDest([this.lastSeen.x, this.lastSeen.z], ctx);
      } else {
        this.lastSeen = null;
        this.clearPath();
      }
    } else if (dist > hi) {
      speed = dist > hi + 6 ? nc.runSpeed : nc.combatSpeed;
      this.repathLeft -= dt;
      if (!this.dest || this.repathLeft <= 0) this.setDest([ctx.player.pos.x, ctx.player.pos.z], ctx);
    } else if (dist < lo) {
      this.repathLeft -= dt;
      if (!this.dest || this.repathLeft <= 0) {
        const ax = (this.pos.x - ctx.player.pos.x) / Math.max(dist, 0.01);
        const az = (this.pos.z - ctx.player.pos.z) / Math.max(dist, 0.01);
        const back = ctx.nav.nearestFree(this.pos.x + ax * 3, this.pos.z + az * 3, 3);
        if (back) this.setDest(back, ctx);
      }
    } else {
      // In the band: hold, or sidestep now and then.
      this.strafeLeft -= dt;
      if (this.strafeLeft <= 0) {
        this.strafeLeft = rand(1.2, 2.6);
        this.clearPath();
        if (Math.random() < 0.5) {
          const side = Math.random() < 0.5 ? -1 : 1;
          const tx = this.pos.x + (-(ctx.player.pos.z - this.pos.z) / Math.max(dist, 0.01)) * 2 * side;
          const tz = this.pos.z + ((ctx.player.pos.x - this.pos.x) / Math.max(dist, 0.01)) * 2 * side;
          const spot = ctx.nav.nearestFree(tx, tz, 1.5);
          if (spot) this.setDest(spot, ctx);
        }
      }
      speed = nc.combatSpeed * 0.6;
    }
    if (this.dest) {
      if (this.followPath(dt, speed, ctx)) this.clearPath();
    } else {
      this.halt(dt, ctx);
    }

    // Look / aim.
    if (this.sees) this.lookYaw = dirToYaw(this.aimPoint.x - this.pos.x, this.aimPoint.z - this.pos.z);
    else if (this.vel.lengthSq() > 0.04) this.lookYaw = this.moveYaw;

    // Reload when empty; re-aim briefly after reloading.
    if (weapon.ammo === 0) weapon.startReload();
    if (this.wasReloading && !weapon.reloading) this.telegraphLeft = def.ai.telegraph * 0.6;
    this.wasReloading = weapon.reloading;

    // Fire.
    if (this.draw < 1) return;
    this.telegraphLeft -= dt;
    this.shotDelay -= dt;
    if (!this.sees || this.telegraphLeft > 0 || this.shotDelay > 0 || !weapon.ready || dist > def.range * 0.9) return;
    const yaw = this.lookYaw;
    const fx = yawToX(yaw);
    const fz = yawToZ(yaw);
    const reach = 0.4 + muzzleOffset(def.look);
    const origin = new THREE.Vector3(this.pos.x + fx * reach + fz * 0.18, 1.38, this.pos.z + fz * reach - fx * 0.18);
    // Don't waste shots into a wall right in front.
    if (ctx.world.raycast(origin.x, origin.y, origin.z, this.aimPoint.x, this.aimPoint.y, this.aimPoint.z)) {
      this.shotDelay = 0.3;
      return;
    }
    const moving = this.vel.lengthSq() > 0.25;
    const spreadMul = (this.def.inaccuracy ?? nc.inaccuracy) * (moving ? nc.movingSpreadMul : 1);
    const shot = weapon.fire(origin, this.aimPoint, spreadMul, yaw);
    if (shot) {
      ctx.fire(this, shot);
      this.recoil = 1;
      this.shotDelay = def.fireInterval + rand(...def.ai.extraDelay);
    }
  }

  private flee(dt: number, ctx: NpcContext, dist: number): void {
    const p = ctx.player;
    const run = CONFIG.npc.runSpeed;
    if (this.mode === 'flee') {
      // First bolt straight away from the player...
      this.fleeLeft -= dt;
      this.repathLeft -= dt;
      if (!this.dest || this.repathLeft <= 0) {
        const ax = (this.pos.x - p.pos.x) / Math.max(dist, 0.01);
        const az = (this.pos.z - p.pos.z) / Math.max(dist, 0.01);
        const away = ctx.nav.nearestFree(this.pos.x + ax * 8, this.pos.z + az * 8, 4);
        if (away) this.setDest(away, ctx);
        this.repathLeft = 0.8;
      }
      this.followPath(dt, run, ctx);
      // ...then head for cover by a building.
      if (this.fleeLeft <= 0) {
        this.mode = 'hide';
        this.cowering = false;
        this.setDest(this.pickHideSpot(ctx), ctx);
      }
    } else {
      if (!this.cowering) {
        if (!this.dest || this.followPath(dt, run, ctx)) {
          this.clearPath();
          this.cowering = true;
        }
      } else {
        this.halt(dt, ctx);
        if (this.sees && dist < CONFIG.npc.hideBreakRange) this.startFleeing();
      }
    }
    this.lookYaw = this.cowering ? dirToYaw(p.pos.x - this.pos.x, p.pos.z - this.pos.z) : this.moveYaw;
  }

  /** Cover spot out of the player's sight, preferring close to us and far from them. */
  private pickHideSpot(ctx: NpcContext): Vec2 {
    const p = ctx.player.pos;
    let best: Vec2 | null = null;
    let bestScore = Infinity;
    for (const s of ctx.hideSpots) {
      const dSelf = this.distTo(s);
      const dPlayer = Math.hypot(s[0] - p.x, s[1] - p.z);
      if (dSelf > 30 || dPlayer < 6) continue;
      const hidden = ctx.world.raycast(p.x, 1.2, p.z, s[0], 1.0, s[1]) !== null;
      // Running past the player to get there is a bad idea.
      const pastPlayer = dPlayer < dSelf ? 8 : 0;
      const score = dSelf - dPlayer * 0.6 + pastPlayer + (hidden ? 0 : 20);
      if (score < bestScore) {
        bestScore = score;
        best = s;
      }
    }
    return best ?? [this.pos.x, this.pos.z];
  }

  // ---------------------------------------------------------------- movement

  private distTo([x, z]: Vec2): number {
    return Math.hypot(x - this.pos.x, z - this.pos.z);
  }

  private lineOfSight(ctx: NpcContext, target: THREE.Vector3): boolean {
    const e = CONFIG.npc.eyeHeight;
    return ctx.world.raycast(this.pos.x, e, this.pos.z, target.x, target.y, target.z) === null;
  }

  private setDest(to: Vec2, ctx: NpcContext): void {
    this.dest = to;
    this.path = ctx.nav.findPath(this.pos.x, this.pos.z, to[0], to[1]) ?? [to];
    this.repathLeft = 0.7;
    this.stuckLeft = 1;
    this.progressFrom.set(this.pos.x, this.pos.z);
  }

  private clearPath(): void {
    this.dest = null;
    this.path = null;
  }

  private halt(dt: number, ctx: NpcContext): void {
    this.steer(dt, 0, 0, ctx);
  }

  /** Walk the current path. Returns true on arrival. */
  private followPath(dt: number, speed: number, ctx: NpcContext): boolean {
    if (!this.path || this.path.length === 0) {
      this.halt(dt, ctx);
      return true;
    }
    let [wx, wz] = this.path[0];
    let d = Math.hypot(wx - this.pos.x, wz - this.pos.z);
    while (d < 0.3 && this.path.length > 0) {
      this.path.shift();
      if (this.path.length === 0) {
        this.halt(dt, ctx);
        return true;
      }
      [wx, wz] = this.path[0];
      d = Math.hypot(wx - this.pos.x, wz - this.pos.z);
    }
    // Ease in on the final waypoint.
    const v = this.path.length === 1 ? Math.min(speed, d * 3) : speed;
    this.steer(dt, ((wx - this.pos.x) / d) * v, ((wz - this.pos.z) / d) * v, ctx);

    // Stuck behind something dynamic (or a bad path): try again.
    this.stuckLeft -= dt;
    if (this.stuckLeft <= 0) {
      const moved = this.progressFrom.distanceTo(new THREE.Vector2(this.pos.x, this.pos.z));
      if (moved < 0.3 && this.dest) this.setDest(this.dest, ctx);
      this.stuckLeft = 1;
      this.progressFrom.set(this.pos.x, this.pos.z);
    }
    return false;
  }

  private steer(dt: number, tx: number, tz: number, ctx: NpcContext): void {
    const accel = 14 * dt;
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
    const c = ctx.world.resolveCircle(pt, CONFIG.npc.radius, others);
    this.pos.x = pt.x;
    this.pos.z = pt.z;
    if (c.hit) {
      const vn = this.vel.x * c.nx + this.vel.y * c.nz;
      if (vn < 0) this.vel.set(this.vel.x - vn * c.nx, this.vel.y - vn * c.nz);
    }
    if (this.vel.lengthSq() > 0.04) this.moveYaw = dirToYaw(this.vel.x, this.vel.y);
  }

  // ---------------------------------------------------------------- rendering

  sync(alpha: number, frameDt: number): void {
    this.model.root.position.lerpVectors(this.prevPos, this.pos, alpha);
    const r = this.def.routine;
    const atPost = (r.kind === 'lean' || r.kind === 'idle') && this.mode === 'routine' && this.distTo(r.at) <= 0.4;
    this.model.animate(frameDt, {
      speed: this.vel.length(),
      moveYaw: this.moveYaw,
      lookYaw: this.lookYaw,
      draw: this.draw,
      recoil: this.recoil,
      reload: this.weapon?.reloadProgress ?? -1,
      lean: atPost && r.kind === 'lean' && this.alertLeft <= 0,
      talking: this.talkLeft > 0,
      flinch: this.flinch,
      cower: this.mode === 'hide' && this.cowering,
      dead: this.mode === 'dead',
    });
  }
}
