import * as THREE from 'three';
import { CONFIG } from '../config';
import { DEFAULT_LINES, NAMES } from '../data/npcs';
import type { NpcDef, NpcLines, Vec2, WeaponDef } from '../data/types';
import { resolveWeapon } from '../data/weapons';
import { EQUIP_SLOTS } from '../data/types';
import { Equipment, type SlotKey } from '../items/Equipment';
import { GridContainer, gridFromData, gridToData } from '../items/GridContainer';
import { ammoItemFor, itemDef, itemForWeapon, weaponOf } from '../items/ItemDef';
import { createItem, itemFromData, itemToData, type ItemData, type ItemInstance, type PlacedItemData } from '../items/ItemInstance';
import type { Interactable } from '../Interaction';
import { angleDelta, damp, dirToYaw, lerp, moveToward, yawToX, yawToZ } from '../util/math';
import { segmentVsCylinder, type CircleCollider, type CollisionWorld } from '../world/Colliders';
import { coversFrom, findLowCover } from '../ai/LowCover';
import type { NavGrid } from '../ai/NavGrid';
import type { Mood } from '../audio/murmur';
import type { Horse } from './Horse';
import { NpcModel } from './NpcModel';
import type { BurstKind } from './Particles';
import type { Hitbox, HitInfo, Target } from './Targets';
import { GunSet, WeaponState, type Hand, type ShotRequest } from './Weapon';
import { muzzleOffset } from './WeaponModel';

export type NpcMode = 'routine' | 'hostile' | 'flee' | 'hide' | 'dead';

/** An NPC as plain data, for a place's saved state (matched by `def.id` on the way back). */
export interface NpcState {
  id: string;
  alive: boolean;
  hp: number;
  pos: Vec2;
  yaw: number;
  /** Seconds until a dead NPC respawns (null: never). */
  deadLeft: number | null;
  inventory: PlacedItemData[];
  weapon: ItemData | null;
  offHand: ItemData | null;
}

/** What an NPC needs to know about the player. */
export interface PlayerView {
  readonly pos: THREE.Vector3;
  readonly mounted: boolean;
  readonly dead: boolean;
  /** 0 = standing … 1 = crouched (lower chest). */
  readonly crouch?: number;
  /** Height to aim at, if not a person's chest (an animal). */
  readonly chestY?: number;
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
  if (p.chestY !== undefined) return out.set(p.pos.x, p.chestY, p.pos.z);
  const h = p.mounted ? 2.2 : CONFIG.npc.chestHeight * (1 - (1 - CONFIG.player.crouch.hitboxScale) * (p.crouch ?? 0));
  return out.set(p.pos.x, h, p.pos.z);
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
  /** Set by the mode: open this merchant's shop (NpcDef.shop). */
  onTrade: (npc: Npc) => void = () => {};
  /** Set by the session: the guns this NPC dropped as it died (each lands on the ground). */
  onGunsDropped: ((npc: Npc, guns: ItemInstance[]) => void) | null = null;
  /** Set by the session: back at the spawn point (what was left lying around goes). */
  onRespawn: ((npc: Npc) => void) | null = null;
  /** Set by the session: murmur a line; returns how long it takes (the bubble lasts as long). */
  onSpeak: ((npc: Npc, text: string, mood: Mood) => number) | null = null;
  /** Set by the mode: is a place worth giving directions to (not visited yet)? */
  wantsHint: ((poi: string) => boolean) | null = null;
  /** Set by the mode: directions were given (the place goes on the map). */
  onHint: ((npc: Npc, poi: string) => void) | null = null;
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
  private recoilL = 0;
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

  // Crouching.
  /** Wants to be crouched (the body blends there over CONFIG.player.crouch.blendTime). */
  crouched = false;
  /** 0 = standing … 1 = crouched. */
  crouch = 0;
  private flinchCrouchLeft = 0;
  private inspectLeft = 0;
  /** Low-cover spot (behind a barrel, fence, …) being held or walked to. */
  private lowCover: Vec2 | null = null;
  private lastLowCover: Vec2 | null = null;
  /** Arrived at the low-cover spot. */
  private inCover = false;
  private lowCoverLeft = 0;
  private lowCoverRetry = 0;
  private coverCheckLeft = 0;
  /** Standing up over cover to shoot (seconds left before ducking again). */
  private popUpLeft = 0;

  private chest = new THREE.Vector3();

  constructor(readonly def: NpcDef) {
    this.name = def.name ?? randomName(def.appearance.body);
    this.lines = { ...DEFAULT_LINES[def.attitude], ...def.lines };
    this.hp = this.maxHp;
    this.model = new NpcModel(def.appearance, null);
    this.collider = { kind: 'circle', x: 0, z: 0, r: CONFIG.npc.radius, coverHeight: 1.9, surface: 'wood', blocksBullets: false };
    this.spawn();
  }

  /** The equipped weapon's definition (null when unarmed or looted). */
  get weaponDef(): WeaponDef | null {
    const item = this.equipment.weapons[0];
    return item ? weaponOf(itemDef(item.defId)) : null;
  }

  /** The off-hand gun's definition (dual wielding), if any. */
  get offHandDef(): WeaponDef | null {
    const item = this.equipment.offHands[0];
    return item ? weaponOf(itemDef(item.defId)) : null;
  }

  private stateOf(item: ItemInstance): WeaponState {
    let s = this.states.get(item);
    if (!s) {
      s = new WeaponState(weaponOf(itemDef(item.defId))!, item, this.inventory);
      this.states.set(item, s);
    }
    return s;
  }

  private sets = new WeakMap<ItemInstance, GunSet>();

  /** The equipped gun(s); reloads come out of this NPC's own inventory. */
  get weapon(): GunSet | null {
    const item = this.equipment.weapons[0];
    if (!item || !this.weaponDef) return null;
    let set = this.sets.get(item);
    if (!set) {
      set = new GunSet(this.stateOf(item));
      this.sets.set(item, set);
    }
    const off = this.equipment.offHands[0];
    set.setLeft(off ? this.stateOf(off) : null);
    return set;
  }

  /** Fresh kit from the data: weapon, worn clothing, pockets (given or 1-2 boxes of matching ammo). */
  private resetLoadout(): void {
    for (const p of [...this.inventory.placements]) this.inventory.remove(p.item);
    for (const k of ['o0', 'w0', ...EQUIP_SLOTS] as SlotKey[]) this.equipment.take(k);
    const w = resolveWeapon(this.def.weapon);
    if (w) this.equipment.put('w0', createItem(itemForWeapon(w).id), null);
    const off = resolveWeapon(this.def.offHandWeapon ?? null);
    if (w && off) this.equipment.put('o0', createItem(itemForWeapon(off).id), null);
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
    this.model.setWeapon(this.weaponDef, this.offHandDef);
  }

  /** Anything left to loot. */
  get hasLoot(): boolean {
    return !this.inventory.isEmpty || this.equipment.weapons[0] !== null || this.equipment.offHands[0] !== null;
  }

  get maxHp(): number {
    return this.def.hp ?? CONFIG.npc.hp;
  }

  get alive(): boolean {
    return this.mode !== 'dead';
  }

  /** Shots landed nearby while holding a camp (the camp turns hostile on its next update). */
  alarmed = false;

  /**
   * Someone other than the player this NPC is up against (a wolf going for it): it fights or flees
   * them exactly as it would the player, until they're dead or it calms down.
   */
  foe: PlayerView | null = null;

  /** Gun out (or coming out). */
  get drawn(): boolean {
    return this.drawTarget === 1;
  }

  /** True while aiming before the first shot (HUD shows a warning mark). */
  get telegraphing(): boolean {
    return this.mode === 'hostile' && this.draw >= 1 && this.telegraphLeft > 0;
  }

  // ---------------------------------------------------------------- Interactable

  get label(): string {
    if (!this.alive) return `Loot ${this.name}${this.hasLoot ? '' : ' (empty)'}`;
    return this.def.shop ? `Trade with ${this.name}` : `Talk to ${this.name}`;
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
    const hint = this.def.hints?.find((h) => this.wantsHint?.(h.poi));
    if (hint) {
      this.say(hint.line, 'greet', CONFIG.npc.talkTime);
      this.onHint?.(this, hint.poi);
    } else this.say(this.lines.greet[this.greetIdx++ % this.lines.greet.length], 'greet', CONFIG.npc.talkTime);
    if (this.def.shop) this.onTrade(this);
  }

  // ---------------------------------------------------------------- Target (hitbox)

  get object(): THREE.Object3D {
    return this.model.root;
  }

  /** The shootable volume (only the rider on horseback: horses can't be harmed). */
  hitbox(): Hitbox | null {
    if (!this.alive) return null;
    const top = CONFIG.player.crouch.standHeight * lerp(1, CONFIG.player.crouch.hitboxScale, this.crouch);
    const [y0, y1] = this.mount ? [1.0, 2.95] : [0, top];
    return { x: this.pos.x, z: this.pos.z, r: 0.38, y0, y1 };
  }

  test(a: THREE.Vector3, b: THREE.Vector3): { t: number; normal: THREE.Vector3 } | null {
    const hb = this.hitbox();
    if (!hb) return null;
    const h = segmentVsCylinder(a.x, a.y, a.z, b.x, b.y, b.z, hb.x, hb.z, hb.r, hb.y0, hb.y1);
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
    this.inspectLeft = 0;
    if (this.weapon && !this.weapon.dry) {
      if (this.mode !== 'hostile') {
        this.mode = 'hostile';
        this.say(pick(this.lines.hostile), 'hostile');
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

  /** Knocked back (the player getting up): a moment of startle, aim reset. */
  stagger(): void {
    this.flinch = 1;
    this.telegraphLeft = Math.max(this.telegraphLeft, 0.8);
    this.clearPath();
  }

  /** A player bullet landed close by: flinch (armed ones may duck) and warn (never hostile on its own). */
  nearMiss(): void {
    const nc = CONFIG.npc.crouch;
    if (this.alive && this.weaponDef && this.canCrouch && Math.random() < nc.flinchChance) {
      this.flinchCrouchLeft = Math.max(this.flinchCrouchLeft, rand(...nc.flinchTime));
    }
    if (this.mode !== 'routine') return;
    // Outlaws holding a camp don't warn: shooting near them starts the fight.
    if (this.def.territory && this.hostileByNature) {
      this.alarmed = true;
      return;
    }
    this.flinch = 1;
    this.alertLeft = 2.5;
    this.talkLeft = 0;
    if (this.warnCooldown <= 0) {
      this.say(pick(this.lines.warn), 'warn');
      this.warnCooldown = CONFIG.npc.warnCooldown;
    }
  }

  /** Back to the routine (weapon put away). */
  calmDown(silent = false): void {
    this.foe = null;
    if (!this.alive || this.mode === 'routine') return;
    this.mode = 'routine';
    this.drawTarget = 0;
    this.cowering = false;
    this.leaveLowCover(0);
    this.lastSeen = null;
    this.calmTimer = 0;
    this.waitLeft = 1;
    this.clearPath();
    if (!silent) this.say(pick(this.lines.calm), 'calm');
  }

  private startFleeing(): void {
    this.mode = 'flee';
    this.fleeLeft = 2.2;
    this.cowering = false;
    this.leaveLowCover(0);
    this.say(pick(this.lines.flee), 'flee');
    this.clearPath();
  }

  private die(): void {
    this.mode = 'dead';
    this.hp = 0;
    this.deadLeft = this.def.respawns === false ? Infinity : CONFIG.npc.respawnTime;
    this.vel.set(0, 0);
    this.clearPath();
    this.speech = null;
    this.draw = this.drawTarget = 0; // the arms go slack at once
    this.leaveLowCover(0);
    this.crouched = false; // eases out while falling
    // The guns fall from their hands: the off-hand one first (taking the main gun would move it
    // up into the main slot), each its own item on the ground, still loaded.
    const guns = [this.equipment.take('o0'), this.equipment.take('w0')].filter((g): g is ItemInstance => g !== null);
    this.lootChanged();
    if (guns.length) this.onGunsDropped?.(this, guns);
  }

  /** Is hostile and can see the player right now (a fight is on). */
  get engaging(): boolean {
    return this.mode === 'hostile' && this.sees;
  }

  /** Plain-data state (to leave a place and find it as it was). */
  state(): NpcState {
    const w = this.equipment.weapons[0];
    const o = this.equipment.offHands[0];
    return {
      id: this.def.id,
      alive: this.alive,
      hp: this.hp,
      pos: [this.pos.x, this.pos.z],
      yaw: this.moveYaw,
      deadLeft: this.alive || !Number.isFinite(this.deadLeft) ? null : this.deadLeft,
      inventory: gridToData(this.inventory),
      weapon: w ? itemToData(w) : null,
      offHand: o ? itemToData(o) : null,
    };
  }

  /**
   * Back to a saved state. The living stand where they were, calm (time stood still while you
   * were away, and they've forgotten the fight); the dead lie where they fell, already down.
   */
  restore(s: NpcState): void {
    this.pos.set(s.pos[0], 0, s.pos[1]);
    this.prevPos.copy(this.pos);
    this.collider.x = this.pos.x;
    this.collider.z = this.pos.z;
    this.vel.set(0, 0);
    this.clearPath();
    gridFromData(this.inventory, s.inventory);
    this.equipment.take('o0');
    this.equipment.take('w0');
    if (s.weapon) this.equipment.put('w0', itemFromData(s.weapon), null);
    if (s.offHand) this.equipment.put('o0', itemFromData(s.offHand), null);
    this.lootChanged();
    this.moveYaw = this.lookYaw = s.yaw;
    this.speech = null;
    this.flinch = 0;
    this.crouched = false;
    this.crouch = 0;
    this.leaveLowCover(0);
    this.draw = this.drawTarget = 0;
    if (s.alive) {
      this.mode = 'routine';
      this.hp = s.hp;
      this.lastSeen = null;
      this.calmTimer = 0;
      this.model.face(s.yaw);
    } else {
      this.mode = 'dead';
      this.hp = 0;
      this.deadLeft = s.deadLeft ?? Infinity;
      this.model.snapDead(s.yaw);
    }
  }

  /** (Re)place at the spawn point with full health. */
  spawn(): void {
    if (this.mode === 'dead') this.onRespawn?.(this);
    const [x, z] = this.def.spawn;
    this.pos.set(x, 0, z);
    this.prevPos.copy(this.pos);
    this.vel.set(0, 0);
    this.hp = this.maxHp;
    this.mode = 'routine';
    this.draw = this.drawTarget = 0;
    this.crouched = false;
    this.crouch = 0;
    this.flinchCrouchLeft = this.inspectLeft = 0;
    this.leaveLowCover(0);
    this.resetLoadout();
    this.clearPath();
    const r = this.def.routine;
    const facing = r.kind === 'lean' || r.kind === 'idle' ? r.facing : 0;
    this.moveYaw = this.lookYaw = facing;
    this.model.face(facing);
    this.collider.x = x;
    this.collider.z = z;
    if (this.hostileByNature && this.weaponDef && !this.def.territory) {
      // Outlaws come in with guns drawn (those holding a camp wait for you to show up).
      this.mode = 'hostile';
      this.drawTarget = 1;
      this.telegraphLeft = this.weaponDef.ai.telegraph;
      if (Math.random() < 0.6) this.say(pick(this.lines.hostile), 'hostile');
    }
  }

  /** Outlaws are one team: their bullets pass through each other. Townsfolk can be caught in crossfire. */
  get team(): string | undefined {
    return this.def.attitude === 'hostile' ? 'outlaws' : undefined;
  }

  /** Wave enemies: attack on sight, never calm down, always know where the player is. */
  get hostileByNature(): boolean {
    return this.def.attitude === 'hostile';
  }

  // ---------------------------------------------------------------- riding

  /** Horse this NPC rides (it steers via the horse's driver; the NPC aims and shoots). */
  mount: Horse | null = null;

  mountOn(h: Horse): void {
    this.mount = h;
    h.riderNpc = this;
    h.model.saddle.add(this.model.root);
    this.model.root.position.set(0, 0, 0);
    this.pos.copy(h.pos);
    this.prevPos.copy(h.pos);
  }

  /** Fall off (on death): the body lands beside the horse. */
  dismount(scene: THREE.Object3D): void {
    const h = this.mount;
    if (!h) return;
    this.mount = null;
    h.riderNpc = null;
    const side = Math.random() < 0.5 ? -1 : 1;
    this.pos.set(h.pos.x + Math.cos(h.heading) * 1.2 * side, 0, h.pos.z - Math.sin(h.heading) * 1.2 * side);
    this.prevPos.copy(this.pos);
    scene.add(this.model.root);
    this.model.face(h.heading);
  }

  /** Show a speech bubble and murmur it; the bubble lasts as long as the murmur (plus a beat). */
  private say(text: string, mood: Mood, time = CONFIG.npc.speechTime): void {
    this.speech = text;
    const spoken = this.onSpeak?.(this, text, mood);
    this.speechLeft = spoken !== undefined ? Math.max(1, spoken + CONFIG.npc.speechTail) : time;
  }

  // ---------------------------------------------------------------- simulation

  step(dt: number, ctx: NpcContext): void {
    // Up against an animal: it takes the player's place in this NPC's eyes; once it's dead, stand down.
    if (this.foe?.dead) this.calmDown();
    if (this.foe) ctx = { ...ctx, player: this.foe };
    this.prevPos.copy(this.pos);
    this.speechLeft -= dt;
    if (this.speechLeft <= 0) this.speech = null;
    this.flinch = moveToward(this.flinch, 0, dt * 1.6);
    this.recoil = moveToward(this.recoil, 0, dt * 5);
    this.recoilL = moveToward(this.recoilL, 0, dt * 5);
    this.warnCooldown -= dt;

    if (this.mode === 'dead') {
      this.deadLeft -= dt;
      if (this.deadLeft <= 0) this.spawn();
      return;
    }

    const p = ctx.player;
    const chest = playerChest(p, this.chest);
    const dist = Math.hypot(p.pos.x - this.pos.x, p.pos.z - this.pos.z);
    if (this.mount) this.pos.copy(this.mount.pos);
    if (this.mode !== 'routine') {
      const range = this.hostileByNature ? 60 : CONFIG.npc.awarenessRange;
      this.sees = !p.dead && dist < range && this.lineOfSight(ctx, chest);
      if (this.sees || (this.hostileByNature && !p.dead)) {
        // Outlaws always know where you are; townsfolk only while they can see you.
        this.calmTimer = 0;
        this.lastSeen = p.pos.clone();
      } else if (!this.hostileByNature) {
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

    this.updateCrouch(dt);
    this.collider.x = this.pos.x;
    this.collider.z = this.pos.z;
  }

  /** Shotgunners rush and never crouch; riders sit. */
  get canCrouch(): boolean {
    if (this.mount) return false;
    const w = this.weaponDef;
    const scatter = w ? (Array.isArray(w.pellets) ? w.pellets[1] : w.pellets) > 1 : false;
    return this.def.tactics !== 'rush' && !scatter;
  }

  private updateCrouch(dt: number): void {
    this.flinchCrouchLeft -= dt;
    this.popUpLeft -= dt;
    let want = false;
    if (this.mode === 'hide') want = this.cowering;
    else if (this.mode === 'routine') want = this.inspectLeft > 0 && this.vel.lengthSq() < 0.04; // once stopped
    else if (this.mode === 'hostile') want = this.inCover && this.popUpLeft <= 0;
    if (this.flinchCrouchLeft > 0 && this.mode !== 'dead') want = true;
    this.crouched = want && this.canCrouch;
    this.crouch = moveToward(this.crouch, this.crouched ? 1 : 0, dt / CONFIG.player.crouch.blendTime);
  }

  private routine(dt: number, ctx: NpcContext, dist: number): void {
    const p = ctx.player;
    const r = this.def.routine;
    // Holding a camp: someone walks up, in sight — fight.
    const t = this.def.territory;
    if (t && this.hostileByNature && !p.dead && Math.hypot(p.pos.x - t.at[0], p.pos.z - t.at[1]) < t.radius && this.lineOfSight(ctx, playerChest(p, this.chest))) {
      this.provoke(ctx);
      return;
    }
    const noticing = !p.dead && dist < CONFIG.npc.noticeRange;
    const towardPlayer = dirToYaw(p.pos.x - this.pos.x, p.pos.z - this.pos.z);
    this.talkLeft -= dt;
    this.alertLeft -= dt;

    // Talking, startled or just noticing the player: stop and face them.
    if (this.talkLeft > 0 || this.alertLeft > 0 || (noticing && r.kind !== 'lean' && r.kind !== 'idle')) {
      this.inspectLeft = 0;
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
      this.inspectLeft -= dt;
      if (this.waitLeft > 0) return;
      this.inspectLeft = 0;
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
      // Now and then: crouch and look at something on the ground, then stand up and go on.
      if (Math.random() < (r.inspect ?? 0)) {
        this.inspectLeft = rand(...CONFIG.npc.crouch.inspectTime);
        this.waitLeft = Math.max(this.waitLeft, this.inspectLeft + 0.6);
      }
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
    // (Riders don't walk: their horse's driver steers.)
    const [lo, hi] = def.ai.preferredRange;
    let speed = nc.combatSpeed;
    const tactics = this.def.tactics ?? 'strafe';
    if (this.mount) {
      // nothing: the mounted AI drives the horse
    } else if (tactics !== 'rush' && this.canCrouch && this.sees && this.holdLowCover(dt, ctx, dist, lo, hi)) {
      // Behind (or on the way to) a barrel, fence, …: crouched there, popping up to shoot.
    } else if (tactics === 'cover' && this.sees && dist <= hi + 4 && this.takeCover(dt, ctx, lo, hi)) {
      speed = nc.combatSpeed;
    } else if (!this.sees) {
      if (this.lastSeen && this.distTo([this.lastSeen.x, this.lastSeen.z]) > 1) {
        this.repathLeft -= dt;
        if (!this.dest || this.repathLeft <= 0) this.setDest([this.lastSeen.x, this.lastSeen.z], ctx);
      } else {
        this.lastSeen = null;
        this.clearPath();
      }
    } else if (dist > hi) {
      speed = dist > hi + 6 || tactics === 'rush' ? nc.runSpeed : nc.combatSpeed;
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
    if (this.mount) {
      // Riding: position comes from the horse.
    } else if (this.dest) {
      if (this.followPath(dt, speed, ctx)) this.clearPath();
    } else {
      this.halt(dt, ctx);
    }
    if (!this.sees && this.lowCover) this.leaveLowCover(1);

    // Look / aim.
    if (this.sees) this.lookYaw = dirToYaw(this.aimPoint.x - this.pos.x, this.aimPoint.z - this.pos.z);
    else if (this.mount) this.lookYaw = this.mount.heading;
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
    const muzzleY = this.mount ? 2.34 : 1.38 - CONFIG.player.crouchDrop * this.crouch;
    // Each hand's muzzle (a dual-wielded left gun is mirrored).
    const muzzle = (hand: Hand) => {
      const reach = 0.4 + muzzleOffset(weapon.gun(hand).def.look);
      const side = hand === 'left' ? -0.18 : 0.18;
      return new THREE.Vector3(this.pos.x + fx * reach + fz * side, muzzleY, this.pos.z + fz * reach - fx * side);
    };
    const origin = muzzle('right');
    if (ctx.world.raycast(origin.x, origin.y, origin.z, this.aimPoint.x, this.aimPoint.y, this.aimPoint.z)) {
      // Crouched behind cover with no clear shot: stand up over it (then shoot) …
      if (this.inCover && this.crouch > 0.02) this.popUpLeft = Math.max(this.popUpLeft, 0.4);
      // … otherwise don't waste shots into a wall right in front.
      else this.shotDelay = 0.3;
      return;
    }
    const moving = this.vel.lengthSq() > 0.25;
    // Crouching steadies the aim (moving crouched keeps part of it), as for the player.
    const pc = CONFIG.player.crouch;
    const stance = moving ? lerp(nc.movingSpreadMul, pc.movingSpreadMul, this.crouch) : lerp(1, pc.spreadMul, this.crouch);
    let spreadMul = (this.def.inaccuracy ?? nc.inaccuracy) * stance;
    // Same horseback penalty as the player.
    if (this.mount) spreadMul = (this.def.inaccuracy ?? nc.inaccuracy) * (CONFIG.player.spreadMountedMul + this.mount.motor.speed * CONFIG.player.spreadMountedPerSpeed) * 0.5;
    const shot = weapon.fire(muzzle, this.aimPoint, spreadMul, yaw);
    if (shot) {
      ctx.fire(this, shot);
      if (shot.hand === 'left') this.recoilL = 1;
      else this.recoil = 1;
      // Two guns: the faster dual pace, and less hesitation between shots.
      this.shotDelay = weapon.interval + rand(...def.ai.extraDelay) * (weapon.dual ? 0.5 : 1);
      // Popped up over cover: stay up a moment, then duck.
      if (this.inCover && this.popUpLeft > 0) this.popUpLeft = nc.crouch.popUpHold;
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

  private coverSpot: Vec2 | null = null;
  private coverLeft = 0;

  /**
   * Riflemen and gunslingers: crouch behind low cover (barrels, fences, troughs) at their range.
   * They hold the spot for a while, then stand up and reposition; a spot that stops covering
   * (the player moved round it, or came too close) is left at once. False: no spot (or not now).
   */
  private holdLowCover(dt: number, ctx: NpcContext, dist: number, lo: number, hi: number): boolean {
    const cc = CONFIG.npc.crouch;
    const p = ctx.player.pos;
    this.lowCoverLeft -= dt;
    this.coverCheckLeft -= dt;
    if (this.lowCover && this.coverCheckLeft <= 0) {
      this.coverCheckLeft = 0.5;
      if (dist < lo * 0.6 || !coversFrom(ctx.world, this.lowCover, p, playerChest(ctx.player, this.chest).y)) this.leaveLowCover(rand(0.8, 1.5));
    }
    if (this.lowCover && this.lowCoverLeft <= 0) this.leaveLowCover(rand(1.5, 3)); // reposition
    if (!this.lowCover) {
      this.lowCoverRetry -= dt;
      if (this.lowCoverRetry > 0) return false;
      // Gunslingers mix it up: sometimes cover, sometimes sidestepping in the open.
      if (this.def.tactics !== 'cover' && Math.random() > cc.strafeCoverChance) {
        this.lowCoverRetry = rand(3, 5);
        return false;
      }
      const avoid = ctx.colliders.filter((c) => c !== this.collider).map((c): Vec2 => [c.x, c.z]);
      if (this.lastLowCover) avoid.push(this.lastLowCover);
      const spot = findLowCover(ctx.world, ctx.nav, {
        from: [this.pos.x, this.pos.z],
        threat: p,
        range: [lo * 0.8, hi + 2],
        maxTravel: cc.maxTravel,
        avoid,
      });
      if (!spot) {
        this.lowCoverRetry = rand(1.5, 2.5);
        return false;
      }
      this.lowCover = spot;
      this.lowCoverLeft = rand(...cc.holdTime);
      this.coverCheckLeft = 0.5;
      this.setDest(spot, ctx);
    }
    if (this.distTo(this.lowCover) < 0.35) {
      this.inCover = true;
      this.clearPath();
    } else if (!this.inCover && !this.dest) {
      this.setDest(this.lowCover, ctx);
    }
    return true;
  }

  /** Stand up and go (looking for cover again after `retry` seconds). */
  private leaveLowCover(retry: number): void {
    if (this.lowCover) this.lastLowCover = this.lowCover;
    if (this.lowCover && !this.inCover) this.clearPath();
    this.lowCover = null;
    this.inCover = false;
    this.popUpLeft = 0;
    this.lowCoverRetry = retry;
  }

  /**
   * Riflemen: hold a spot next to cover, at their preferred range, that still sees the player.
   * Returns false when no such spot exists (fall back to the normal band keeping).
   */
  private takeCover(dt: number, ctx: NpcContext, lo: number, hi: number): boolean {
    this.coverLeft -= dt;
    const p = ctx.player.pos;
    if (!this.coverSpot || this.coverLeft <= 0) {
      this.coverLeft = rand(3.5, 5.5);
      let best: Vec2 | null = null;
      let bestScore = Infinity;
      for (const s of ctx.hideSpots) {
        const dp = Math.hypot(s[0] - p.x, s[1] - p.z);
        if (dp < lo || dp > hi) continue;
        const dSelf = this.distTo(s);
        if (dSelf > 14) continue;
        if (ctx.world.raycast(s[0], CONFIG.npc.eyeHeight, s[1], p.x, CONFIG.npc.chestHeight, p.z)) continue;
        const score = dSelf + Math.abs(dp - (lo + hi) / 2) * 0.3;
        if (score < bestScore) {
          bestScore = score;
          best = s;
        }
      }
      this.coverSpot = best;
      if (best) this.setDest(best, ctx);
    }
    if (!this.coverSpot) return false;
    if (this.distTo(this.coverSpot) < 0.5) this.clearPath();
    return true;
  }

  private lineOfSight(ctx: NpcContext, target: THREE.Vector3): boolean {
    const e = this.mount ? 2.5 : CONFIG.npc.eyeHeight;
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
    // Crouched: half speed. Ease in on the final waypoint.
    speed *= lerp(1, CONFIG.player.crouch.speedMul, this.crouch);
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
    if (this.mount) {
      // Sitting in the saddle: yaws are relative to the horse.
      const hy = this.mount.renderYawValue;
      this.model.animate(frameDt, {
        speed: 0,
        moveYaw: 0,
        lookYaw: angleDelta(hy, this.lookYaw),
        draw: this.draw,
        recoil: this.recoil,
        recoilL: this.recoilL,
        dual: this.weapon?.dual ?? false,
        reload: this.weapon?.reloadProgress ?? -1,
        lean: false,
        talking: false,
        flinch: this.flinch,
        cower: false,
        crouch: 0,
        inspect: false,
        dead: false,
        mounted: true,
      });
      return;
    }
    this.model.root.position.lerpVectors(this.prevPos, this.pos, alpha);
    const r = this.def.routine;
    const atPost = (r.kind === 'lean' || r.kind === 'idle') && this.mode === 'routine' && this.distTo(r.at) <= 0.4;
    this.model.animate(frameDt, {
      speed: this.vel.length(),
      moveYaw: this.moveYaw,
      lookYaw: this.lookYaw,
      draw: this.draw,
      recoil: this.recoil,
      recoilL: this.recoilL,
      dual: this.weapon?.dual ?? false,
      reload: this.weapon?.reloadProgress ?? -1,
      lean: atPost && r.kind === 'lean' && this.alertLeft <= 0,
      talking: this.talkLeft > 0,
      flinch: this.flinch,
      cower: this.mode === 'hide' && this.cowering,
      crouch: this.crouch,
      inspect: this.mode === 'routine' && this.inspectLeft > 0,
      dead: this.mode === 'dead',
      mounted: false,
    });
  }
}
