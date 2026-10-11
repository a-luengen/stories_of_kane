import * as THREE from 'three';
import { CONFIG } from '../config';
import { PLAYER_APPEARANCE, PLAYER_START } from '../data/player';
import { EQUIP_SLOTS, type AppearanceConfig, type WeaponDef } from '../data/types';
import { Equipment, weaponKey } from '../items/Equipment';
import { GridContainer } from '../items/GridContainer';
import { itemDef, weaponOf } from '../items/ItemDef';
import { createItem, type ItemInstance } from '../items/ItemInstance';
import { segmentVsCylinder, type CollisionWorld, type CircleCollider } from '../world/Colliders';
import type { BurstKind } from './Particles';
import { PlayerModel } from './PlayerModel';
import type { HitInfo, Target } from './Targets';
import { WeaponState, type ShotRequest } from './Weapon';
import { muzzleOffset } from './WeaponModel';
import { dirToYaw, moveToward, yawToX, yawToZ } from '../util/math';

export interface PlayerInput {
  /** World-space desired direction on XZ (normalized) or null. */
  moveX: number;
  moveZ: number;
  sprint: boolean;
  fireHeld: boolean;
  reload: boolean;
  /** Put the weapon away. */
  holster: boolean;
  /** Weapon slot key pressed this step (0-2), or null. */
  select: number | null;
  /** Aim point in world space: the surface under the crosshair. */
  aim: THREE.Vector3;
}

export class Player implements Target {
  readonly model: PlayerModel;
  readonly inventory = new GridContainer(CONFIG.items.playerGrid.w, CONFIG.items.playerGrid.h);
  readonly equipment = new Equipment();
  /** Body traits; clothing comes from the equipment. */
  private readonly look: Omit<AppearanceConfig, 'clothing'>;
  private seenVersion = -1;
  /** Selected weapon slot (drawn, or what a trigger pull draws), or null for none. */
  active: number | null = 0;
  /** Slot to draw once the current weapon is holstered (switching). */
  private pending: number | null = null;
  private swapping = false;
  private activeItem: ItemInstance | null = null;
  private states = new WeakMap<ItemInstance, WeaponState>();
  /** Seconds left to show "No ammo". */
  noAmmo = 0;
  readonly pos = new THREE.Vector3();
  readonly prevPos = new THREE.Vector3();
  readonly vel = new THREE.Vector2();
  moveYaw = 0;
  aimYaw = 0;
  sprinting = false;

  recoil = 0;
  /** 0 = holstered, 1 = drawn; in between plays the draw (or holster). */
  draw = 0;
  hp = CONFIG.player.maxHp;
  dead = false;
  /** Passive health regeneration (off in wave mode, where bandages are the only heal). */
  regen = true;
  /** Seconds of damage immunity left (after a revive). */
  invulnerable = 0;
  /** Seconds of bandaging left (heals over time; no shooting meanwhile). */
  healLeft = 0;
  private healRate = 0;
  private healTotal = 0;
  /** 1 right after taking damage, fades to 0 (HUD flash). */
  hurt = 0;
  private sinceHurt = 0;

  /** Set while riding: horse speed and yaw, used for spread and pose. */
  mounted = false;
  mountSpeed = 0;
  mountYaw = 0;

  constructor() {
    const { clothing, ...look } = PLAYER_APPEARANCE;
    this.look = look;
    this.model = new PlayerModel(PLAYER_APPEARANCE);
    for (const s of EQUIP_SLOTS) {
      const id = clothing[s];
      if (id) this.equipment.put(s, createItem(id), null);
    }
    PLAYER_START.weapons.forEach((id, i) => id && this.equipment.put(weaponKey(i), createItem(id), null));
    // Each grant is its own stack (two boxes stay two boxes).
    for (const g of PLAYER_START.grid) this.inventory.placeAnywhere(createItem(g.item, g.quantity ?? itemDef(g.item).boxQuantity ?? 1));
    this.syncEquipment();
  }

  get object(): THREE.Object3D {
    return this.model.root;
  }

  /** State of the weapon in the active slot (null when the slot is empty / none selected). */
  get weapon(): WeaponState | null {
    const item = this.active !== null ? this.equipment.weapons[this.active] : null;
    return item ? this.stateFor(item) : null;
  }

  stateFor(item: ItemInstance): WeaponState {
    let s = this.states.get(item);
    if (!s) {
      s = new WeaponState(weaponOf(itemDef(item.defId))!, item, this.inventory);
      this.states.set(item, s);
    }
    return s;
  }

  get ammo(): number {
    return this.weapon?.ammo ?? 0;
  }

  /** 0..1 reload progress or -1. */
  get reloadProgress(): number {
    return this.weapon?.reloadProgress ?? -1;
  }

  appearance(): AppearanceConfig {
    return this.equipment.appearance(this.look);
  }

  /**
   * React to equipment changes (inventory UI, looting, dropping): rebuild the look, and holster
   * at once if the active weapon was removed or replaced.
   */
  syncEquipment(): void {
    if (this.equipment.version === this.seenVersion) return;
    this.seenVersion = this.equipment.version;
    this.model.setAppearance(this.appearance());
    this.model.setWeapons(this.equipment.weaponDefs());
    const item = this.active !== null ? this.equipment.weapons[this.active] : null;
    if (item !== this.activeItem) {
      if (this.activeItem) this.states.get(this.activeItem)?.cancelReload();
      this.activeItem = item;
      this.holster(true);
      this.pending = null;
    }
  }

  speed(): number {
    return this.vel.length();
  }

  setPosition(p: THREE.Vector3): void {
    this.pos.copy(p);
    this.prevPos.copy(p);
  }

  /** Movement on foot. When mounted the Game moves the player with the horse. */
  updateMovement(dt: number, input: PlayerInput, world: CollisionWorld, dynamic: readonly CircleCollider[]): void {
    this.prevPos.copy(this.pos);
    if (this.mounted) return;
    if (this.dead) input = { ...input, moveX: 0, moveZ: 0 };
    const pc = CONFIG.player;
    const hasInput = input.moveX !== 0 || input.moveZ !== 0;
    this.sprinting = hasInput && input.sprint;
    const max = this.sprinting ? pc.sprintSpeed : pc.walkSpeed;
    const tx = input.moveX * max;
    const tz = input.moveZ * max;
    const rate = (hasInput ? pc.acceleration : pc.deceleration) * dt;
    // Move the velocity vector towards the target velocity (not per-axis, to keep diagonals clean).
    const dx = tx - this.vel.x;
    const dz = tz - this.vel.y;
    const dl = Math.hypot(dx, dz);
    if (dl <= rate) this.vel.set(tx, tz);
    else this.vel.set(this.vel.x + (dx / dl) * rate, this.vel.y + (dz / dl) * rate);

    this.pos.x += this.vel.x * dt;
    this.pos.z += this.vel.y * dt;
    const p = { x: this.pos.x, z: this.pos.z };
    const c = world.resolveCircle(p, pc.radius, dynamic);
    this.pos.x = p.x;
    this.pos.z = p.z;
    if (c.hit) {
      // Remove velocity into the obstacle so we slide instead of sticking.
      const vn = this.vel.x * c.nx + this.vel.y * c.nz;
      if (vn < 0) this.vel.set(this.vel.x - vn * c.nx, this.vel.y - vn * c.nz);
    }
    if (this.vel.lengthSq() > 0.04) this.moveYaw = dirToYaw(this.vel.x, this.vel.y);
  }

  /** Aim, switch, reload and fire. Returns a shot when the weapon fires this step. */
  updateWeapon(dt: number, input: PlayerInput): ShotRequest | null {
    this.syncEquipment();
    const ax = input.aim.x - this.pos.x;
    const az = input.aim.z - this.pos.z;
    if (ax * ax + az * az > 0.01) this.aimYaw = dirToYaw(ax, az);
    this.recoil = moveToward(this.recoil, 0, dt * 5);
    this.noAmmo = Math.max(0, this.noAmmo - dt);
    const slots = this.equipment.weapons;

    // Slot keys: the active slot again holsters, another (non-empty) slot switches.
    if (input.select !== null && slots[input.select]) {
      if (input.select === this.active && this.drawTarget === 1 && this.pending === null) {
        this.holster(); // stays selected: the next trigger pull draws it again
      } else if (input.select !== this.active || this.drawTarget === 0) {
        this.weapon?.cancelReload();
        this.swapping = true;
        if (this.draw > 0 && input.select !== this.active) {
          this.pending = input.select;
          this.drawTarget = 0;
        } else {
          this.active = input.select;
          this.drawTarget = 1;
        }
        this.idle = 0;
      }
    }

    // Holster on request or after a while without shooting; shooting or reloading draws again.
    this.idle += dt;
    if (input.holster || (this.drawTarget === 1 && this.idle >= CONFIG.player.autoHolsterTime)) this.holster();
    else if ((input.fireHeld || input.reload) && this.drawTarget === 0 && this.pending === null && this.healLeft <= 0) {
      if (this.active === null || !slots[this.active]) this.active = slots.findIndex((w) => w !== null);
      if (this.active < 0) this.active = null;
      if (this.active !== null) {
        this.drawTarget = 1;
        this.idle = 0;
      }
    }

    // Draw / holster animation; a switch holsters, swaps, then draws (quicker than a plain draw).
    const weapon = this.weapon;
    const drawTime = this.swapping ? CONFIG.items.weaponSwapTime / 2 : (weapon?.def.drawTime ?? 0.4);
    this.draw = moveToward(this.draw, this.drawTarget, dt / drawTime);
    if (this.draw === 0 && this.pending !== null) {
      this.active = this.pending;
      this.pending = null;
      this.drawTarget = 1;
    }
    if (this.draw === 1 || this.drawTarget === 0) this.swapping = this.pending !== null;
    this.activeItem = this.active !== null ? slots[this.active] : null;
    if (!weapon) return null;
    weapon.update(dt);

    if (input.reload) this.reloadQueued = true;
    if (this.draw < 1 || this.healLeft > 0) return null;
    if (this.reloadQueued) {
      this.reloadQueued = false;
      if (!weapon.startReload() && weapon.ammo < weapon.def.magazine && weapon.reserve <= 0) this.noAmmo = 1.5;
    }
    if (!input.fireHeld) return null;
    if (weapon.ammo <= 0 && weapon.reserve <= 0) {
      if (input.fireHeld) this.noAmmo = 1.5;
      return null;
    }

    // Muzzle in world space, computed from the logical pose (right hand, shoulder height).
    const muzzleH = this.mounted ? 2.34 : 1.38; // shoulder height of the gun arm (see PlayerModel/HorseModel)
    const fx = yawToX(this.aimYaw);
    const fz = yawToZ(this.aimYaw);
    // The gun arm sits on the model's local +X, which is (fz, -fx) in world space.
    const sx = fz;
    const sz = -fx;
    const reach = 0.4 + muzzleOffset(weapon.def.look);
    const origin = new THREE.Vector3(
      this.pos.x + fx * reach + sx * 0.18,
      this.pos.y + muzzleH,
      this.pos.z + fz * reach + sz * 0.18,
    );

    const pc = CONFIG.player;
    let spreadMul = 1;
    if (this.mounted) spreadMul = pc.spreadMountedMul + this.mountSpeed * pc.spreadMountedPerSpeed;
    else if (this.speed() > 0.5) spreadMul = pc.spreadMovingMul;
    const shot = weapon.fire(origin, input.aim, spreadMul, this.aimYaw);
    if (shot) {
      this.recoil = 1;
      this.idle = 0;
    }
    return shot;
  }

  get drawn(): boolean {
    return this.drawTarget === 1;
  }

  /** Put the gun away (cancels a reload in progress). `instant` skips the animation. */
  holster(instant = false): void {
    this.drawTarget = 0;
    this.pending = null;
    this.reloadQueued = false;
    this.weapon?.cancelReload();
    if (instant) this.draw = 0;
  }

  private reloadQueued = false;
  private drawTarget = 0;
  /** Seconds since the last shot (or draw), for auto-holstering. */
  private idle = 0;

  // ---------------------------------------------------------------- Target (hitbox)

  test(a: THREE.Vector3, b: THREE.Vector3): { t: number; normal: THREE.Vector3 } | null {
    if (this.dead) return null;
    const [y0, y1] = this.mounted ? [1.0, 2.95] : [0, 1.85];
    const h = segmentVsCylinder(a.x, a.y, a.z, b.x, b.y, b.z, this.pos.x, this.pos.z, 0.38, y0, y1);
    return h ? { t: h.t, normal: new THREE.Vector3(h.nx, h.ny, h.nz) } : null;
  }

  hit(_point: THREE.Vector3, _dir: THREE.Vector3, info: HitInfo): BurstKind {
    if (!this.dead && this.invulnerable <= 0) {
      this.hp = Math.max(0, this.hp - info.damage);
      this.sinceHurt = 0;
      this.hurt = 1;
    }
    return 'blood';
  }

  update(dt: number): void {
    this.hurt = Math.max(0, this.hurt - dt * 2.5);
    if (this.dead) return;
    this.sinceHurt += dt;
    const pc = CONFIG.player;
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    if (this.healLeft > 0) {
      const k = Math.min(dt, this.healLeft);
      this.hp = Math.min(CONFIG.player.maxHp, this.hp + this.healRate * k);
      this.healLeft -= k;
    }
    if (this.regen && this.sinceHurt > pc.regenDelay) this.hp = Math.min(pc.maxHp, this.hp + pc.regenRate * dt);
  }

  /** 0..1 bandaging progress, or -1. */
  get healProgress(): number {
    return this.healLeft > 0 ? 1 - this.healLeft / this.healTotal : -1;
  }

  /**
   * Use a consumable (bandage): takes one from its stack and heals over time; puts the gun away
   * and blocks shooting while bandaging. Returns why not, or null when it worked.
   */
  useItem(item: ItemInstance): string | null {
    const def = itemDef(item.defId);
    if (!def.heal) return null;
    if (this.dead) return 'Not now';
    if (this.healLeft > 0) return 'Already bandaging';
    if (this.hp >= CONFIG.player.maxHp) return 'Already at full health';
    item.quantity--;
    if (item.quantity <= 0) this.inventory.remove(item);
    this.healTotal = def.heal.duration;
    this.healLeft = def.heal.duration;
    this.healRate = (def.heal.fraction * CONFIG.player.maxHp) / def.heal.duration;
    this.holster();
    return null;
  }

  /** B: use the smallest stack of bandages in the inventory. */
  useBandage(): string | null {
    const stacks = this.inventory.items.filter((i) => itemDef(i.defId).heal).sort((a, b) => a.quantity - b.quantity);
    if (stacks.length === 0) return 'No bandages';
    return this.useItem(stacks[0]);
  }

  /** Back on your feet (inventory and loaded rounds are kept). */
  revive(p: THREE.Vector3, hpFraction = 1): void {
    this.dead = false;
    this.healLeft = 0;
    this.hp = CONFIG.player.maxHp * hpFraction;
    this.vel.set(0, 0);
    this.setPosition(p);
  }

  animate(dt: number): void {
    this.syncEquipment();
    const def: WeaponDef | null = this.weapon?.def ?? null;
    this.model.animate(dt, {
      speed: this.mounted ? 0 : this.speed(),
      sprint: this.sprinting,
      moveYaw: this.moveYaw,
      aimYaw: this.aimYaw,
      recoil: this.recoil,
      reload: this.reloadProgress,
      mounted: this.mounted,
      horseYaw: this.mountYaw,
      dead: this.dead,
      draw: this.draw,
      active: this.weapon ? this.active : null,
      longGun: def?.look.kind === 'longgun',
    });
  }
}
