import * as THREE from 'three';
import { CONFIG } from '../config';
import type { LootTableId } from '../data/lootTables';
import type { Interactable } from '../Interaction';
import { GridContainer, gridFromData, gridToData } from '../items/GridContainer';
import { createItem, type ItemInstance, type PlacedItemData } from '../items/ItemInstance';
import { fillWithLoot } from '../items/loot';
import { vertexToon } from '../render/materials';
import { PAL } from '../render/palette';
import { StaticBatch } from '../render/StaticBatch';
import { lerp, moveToward, Rng, smoothstep } from '../util/math';
import type { Collider, CollisionWorld } from './Colliders';

export type ContainerKind = 'barrel' | 'crate' | 'chest' | 'ammoBox' | 'weaponCrate';

/** A container as plain data (contents, lid, wear), for a place's saved state. */
export interface ContainerState {
  generated: boolean;
  opened: boolean;
  destroyed: boolean;
  hp: number;
  seed: number;
  wave: number | null;
  items: PlacedItemData[];
}

export interface ContainerType {
  name: string;
  grid: { w: number; h: number };
  table: LootTableId;
  /** How many finds are rolled (inclusive range). */
  count: [number, number];
  /** Bullets passing lower than this are stopped (see Collider.coverHeight). */
  coverHeight: number;
}

/** Every box-like prop is a container: grid size, what's inside, how much, how much cover. */
export const CONTAINER_TYPES: Record<ContainerKind, ContainerType> = {
  ammoBox: { name: 'Ammo Box', grid: { w: 4, h: 2 }, table: 'ammoOnly', count: [1, 3], coverHeight: 0.4 },
  weaponCrate: { name: 'Weapon Crate', grid: { w: 8, h: 4 }, table: 'weaponsOnly', count: [1, 2], coverHeight: 0.56 },
  chest: { name: 'Chest', grid: { w: 8, h: 4 }, table: 'general', count: [3, 6], coverHeight: 0.74 },
  crate: { name: 'Crate', grid: { w: 6, h: 4 }, table: 'general', count: [2, 4], coverHeight: 0.8 }, // per crate: its size
  barrel: { name: 'Barrel', grid: { w: 4, h: 4 }, table: 'general', count: [1, 3], coverHeight: 1.0 },
};

/** Footprints (local, before yaw) for the box-shaped containers. */
const SIZE: Record<Exclude<ContainerKind, 'barrel' | 'crate'>, { w: number; d: number }> = {
  ammoBox: { w: 0.62, d: 0.42 },
  weaponCrate: { w: 1.6, d: 0.56 },
  chest: { w: 1.1, d: 0.66 },
};

/** Barrel lid: lifted off and leant against the side. Hinged lids: swung back past upright. */
const OPEN_TIME = 0.45;

/**
 * A lootable prop: a grid that fills from a loot table the first time it's opened (seeded per
 * container), a lid that opens (and stays open), and a darker look once it's been emptied.
 * Use it like a corpse in the loot view; the player can also store items in it.
 * Crates and ammo boxes can be shot to pieces (see `damage`).
 */
export class LootContainer implements Interactable {
  readonly object = new THREE.Group();
  readonly inventory: GridContainer;
  readonly name: string;
  readonly priority = 1;
  readonly promptHeight: number;
  readonly range: number;
  /** Set by the session: open the loot view. */
  onOpen: (c: LootContainer) => void = () => {};
  /** Wave whose loot it rolls (`minWave` entries); Infinity in the sandbox. */
  wave = Infinity;
  /** Loot has been rolled (on first open). */
  generated = false;
  /** Item ids always found inside (a map scrap), placed before the rolled loot. */
  extras: string[] = [];
  /** Lid open (stays open once opened, until a restock closes it). */
  opened = false;
  private seed: number;
  private lid = new THREE.Group();
  private open01 = 0;
  private material = vertexToon();
  private dark = 0;
  /** Crates and ammo boxes break when shot enough. */
  readonly destructible: boolean;
  hp: number = CONFIG.containers.hp;
  destroyed = false;
  /** Set by the session: its collider was removed or put back (refresh navigation). */
  onCollisionChanged: (c: LootContainer) => void = () => {};
  private collider: Collider | null = null;
  private world: CollisionWorld | null = null;
  private intact = new THREE.Group();
  private debris = new THREE.Group();
  /** 1 right after a hit, fades (a little jolt). */
  private jolt = 0;

  constructor(
    readonly kind: ContainerKind,
    readonly position: THREE.Vector3,
    readonly yaw: number,
    seed: number,
    /** Crates: edge length. */
    readonly size = 0.8,
  ) {
    const t = CONTAINER_TYPES[kind];
    this.name = t.name;
    this.inventory = new GridContainer(t.grid.w, t.grid.h);
    this.seed = seed;
    const height = kind === 'crate' ? size : t.coverHeight;
    this.promptHeight = height + 0.5;
    this.range = (kind === 'weaponCrate' ? 0.8 : kind === 'chest' ? 0.55 : 0.45) + 1.4;
    this.destructible = kind === 'crate' || kind === 'ammoBox';
    this.object.position.copy(position);
    this.object.rotation.y = yaw;
    this.object.add(this.intact, this.debris);
    this.debris.visible = false;
    this.build();
  }

  /** Add the collider (axis-aligned: box containers sit at yaw 0 or ±π/2). */
  addCollider(cw: CollisionWorld): void {
    const { x, z } = this.position;
    this.world = cw;
    if (this.kind === 'barrel') {
      this.collider = cw.addCircle(x, z, 0.4, CONTAINER_TYPES.barrel.coverHeight, 'wood');
      return;
    }
    const s = this.kind === 'crate' ? { w: this.size, d: this.size } : SIZE[this.kind];
    const across = Math.abs(Math.sin(this.yaw)) > 0.5;
    const hx = (across ? s.d : s.w) / 2;
    const hz = (across ? s.w : s.d) / 2;
    const h = this.kind === 'crate' ? this.size : CONTAINER_TYPES[this.kind].coverHeight;
    this.collider = cw.addBox(x - hx, z - hz, x + hx, z + hz, h, 'wood');
  }

  /** Is this the prop's collider (a bullet hit it)? */
  owns(c: Collider | null): boolean {
    return c !== null && c === this.collider;
  }

  /** Ground footprint (for refreshing navigation). */
  get bounds(): { minX: number; minZ: number; maxX: number; maxZ: number } {
    const c = this.collider;
    if (!c) return { minX: this.position.x, minZ: this.position.z, maxX: this.position.x, maxZ: this.position.z };
    return c.kind === 'circle' ? { minX: c.x - c.r, minZ: c.z - c.r, maxX: c.x + c.r, maxZ: c.z + c.r } : c;
  }

  /**
   * A bullet hit it. Destructible ones lose `amount` HP and break at 0: returns the items that
   * spill out (or null while it still stands). A box nobody opened scatters a share of its loot
   * (`CONFIG.containers.scatterShare`, rounded up); an opened one drops whatever is still in it.
   */
  damage(amount: number): ItemInstance[] | null {
    if (!this.destructible || this.destroyed) return null;
    this.jolt = 1;
    this.hp -= amount;
    if (this.hp > 0) return null;
    return this.destroy();
  }

  private destroy(): ItemInstance[] {
    const unopened = !this.generated;
    this.ensureLoot();
    let items = this.inventory.items;
    if (unopened) {
      // A seeded half of the finds survives (rounded up); the rest is splinters.
      const rng = new Rng(this.seed ^ 0x5bd1e995);
      const keep = Math.ceil(items.length * CONFIG.containers.scatterShare);
      const shuffled = [...items];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = rng.int(0, i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      items = shuffled.slice(0, keep);
    }
    for (const p of [...this.inventory.placements]) this.inventory.remove(p.item);
    this.breakApart();
    return items;
  }

  /** Wrecked: debris instead of the box, no collider. */
  private breakApart(): void {
    this.destroyed = true;
    this.hp = 0;
    this.opened = false;
    this.intact.visible = false;
    this.debris.visible = true;
    if (this.collider && this.world) this.world.remove(this.collider);
    this.onCollisionChanged(this);
  }

  /** Plain-data state (to leave a place and find it as it was). */
  state(): ContainerState {
    return {
      generated: this.generated,
      opened: this.opened,
      destroyed: this.destroyed,
      hp: this.hp,
      seed: this.seed,
      wave: Number.isFinite(this.wave) ? this.wave : null,
      items: gridToData(this.inventory),
    };
  }

  /** Back to a saved state: contents, lid (already open, no animation), broken or not. */
  restore(s: ContainerState): void {
    this.seed = s.seed;
    this.wave = s.wave ?? Infinity;
    this.generated = s.generated;
    gridFromData(this.inventory, s.items);
    if (s.destroyed) this.breakApart();
    else {
      this.hp = s.hp;
      this.opened = s.opened;
      this.open01 = s.opened ? 1 : 0;
    }
  }

  /** Put a broken box back together (wave mode restock). */
  private rebuild(): void {
    if (!this.destroyed) return;
    this.destroyed = false;
    this.hp = CONFIG.containers.hp;
    this.intact.visible = true;
    this.debris.visible = false;
    if (this.collider && this.world) this.world.restore(this.collider);
    this.onCollisionChanged(this);
  }

  get empty(): boolean {
    return this.generated && this.inventory.isEmpty;
  }

  get label(): string {
    return `Open ${this.name}${this.empty ? ' (empty)' : ''}`;
  }

  canInteract(): boolean {
    return !this.destroyed;
  }

  interact(): void {
    this.ensureLoot();
    this.opened = true;
    this.onOpen(this);
  }

  /** Roll the contents (once per stock). */
  ensureLoot(): void {
    if (this.generated) return;
    this.generated = true;
    const t = CONTAINER_TYPES[this.kind];
    for (const id of this.extras) this.inventory.placeAnywhere(createItem(id));
    const rng = new Rng(this.seed);
    fillWithLoot(this.inventory, t.table, rng.int(t.count[0], t.count[1] + 1), rng, this.wave);
  }

  /** Wave mode, each intermission: empty it, close the lid, fresh loot (for `wave`) on next open. */
  restock(wave: number): void {
    this.rebuild();
    this.hp = CONFIG.containers.hp; // also heals a damaged one
    for (const p of [...this.inventory.placements]) this.inventory.remove(p.item);
    this.wave = wave;
    this.seed = (Math.imul(this.seed, 1103515245) + 12345 + wave) >>> 0;
    this.generated = false;
    this.opened = false;
  }

  /** The loot view changed the contents (LootTarget). */
  lootChanged(): void {}

  update(dt: number): void {
    this.open01 = moveToward(this.open01, this.opened ? 1 : 0, dt / OPEN_TIME);
    const k = smoothstep(0, 1, this.open01);
    if (this.kind === 'barrel') {
      // Lifts up, then slides off to the side and leans against the barrel.
      const up = Math.sin(Math.min(1, k * 1.6) * Math.PI * 0.5) * 0.28;
      const side = smoothstep(0.3, 1, this.open01);
      this.lid.position.set(lerp(0, 0.44, side), 1.0 + up * (1 - side) + lerp(0, -0.55, side), lerp(0, 0.06, side));
      this.lid.rotation.set(0, 0, lerp(0, -1.35, side));
    } else {
      this.lid.rotation.x = -1.95 * k;
    }
    // Hit: a short jolt.
    this.jolt = moveToward(this.jolt, 0, dt * 6);
    const j = this.jolt * this.jolt;
    this.intact.rotation.set(Math.sin(this.jolt * 40) * 0.05 * j, 0, Math.cos(this.jolt * 33) * 0.05 * j);
    this.intact.position.y = 0.03 * j;
    // Looted out: a shade darker.
    this.dark = moveToward(this.dark, this.empty && this.opened ? 1 : 0, dt * 3);
    const c = 1 - 0.38 * this.dark;
    this.material.color.setRGB(c, c * 0.97, c * 0.94);
  }

  // ------------------------------------------------------------------------ meshes

  private build(): void {
    const body = new StaticBatch();
    const lid = new StaticBatch();
    const b = (fn: (body: StaticBatch, lid: StaticBatch) => number) => {
      this.lid.position.z = fn(body, lid); // the builder sets the lid height; it returns the hinge z
    };
    switch (this.kind) {
      case 'barrel':
        b((bd, ld) => this.barrel(bd, ld));
        break;
      case 'crate':
        b((bd, ld) => this.crate(bd, ld));
        break;
      case 'chest':
        b((bd, ld) => this.chest(bd, ld));
        break;
      case 'ammoBox':
        b((bd, ld) => this.ammoBox(bd, ld));
        break;
      case 'weaponCrate':
        b((bd, ld) => this.weaponCrate(bd, ld));
        break;
    }
    const bodyMesh = body.build(this.material);
    const lidMesh = lid.build(this.material);
    this.intact.add(bodyMesh, this.lid);
    this.lid.add(lidMesh);
    if (this.destructible) this.buildDebris();
  }

  /** Broken: a few planks and splinters lying where the box stood. */
  private buildDebris(): void {
    const rng = new Rng(this.seed ^ 0x9e3779b9);
    const batch = new StaticBatch();
    const small = this.kind === 'ammoBox';
    const len = small ? 0.5 : this.size;
    const cols = small ? [PAL.cactusDark, PAL.cactus, PAL.wood] : [PAL.woodPale, PAL.woodLight, PAL.wood];
    const n = small ? 5 : 7;
    for (let i = 0; i < n; i++) {
      const a = rng.range(0, Math.PI * 2);
      const r = rng.range(0.05, len * 0.7);
      const g = new THREE.BoxGeometry(rng.range(0.6, 1) * len, 0.05, rng.range(0.1, 0.2));
      batch.put(g, rng.pick(cols), Math.cos(a) * r, 0.03 + i * 0.012, Math.sin(a) * r, rng.range(-0.15, 0.15), rng.range(0, Math.PI), rng.range(-0.1, 0.1));
    }
    // One board still half standing.
    batch.box(len * 0.8, small ? 0.16 : 0.26, 0.06, cols[0], 0, 0, -len * 0.3, rng.range(-0.3, 0.3));
    this.debris.add(batch.build(this.material));
  }

  /** Returns the hinge's local z (0 for the barrel, whose lid is placed in update()). */
  private barrel(body: StaticBatch, lid: StaticBatch): number {
    const rng = new Rng(this.seed);
    const col = rng.pick([PAL.wood, PAL.woodLight, PAL.rust]);
    body.put(new THREE.CylinderGeometry(0.36, 0.36, 1.0, 8), col, 0, 0.5, 0);
    body.put(new THREE.CylinderGeometry(0.39, 0.39, 0.08, 8), PAL.metal, 0, 0.22, 0);
    body.put(new THREE.CylinderGeometry(0.39, 0.39, 0.08, 8), PAL.metal, 0, 0.78, 0);
    body.put(new THREE.CylinderGeometry(0.31, 0.31, 0.02, 8), PAL.ink, 0, 0.985, 0); // dark inside
    lid.put(new THREE.CylinderGeometry(0.33, 0.33, 0.05, 8), shadeOf(col), 0, 0.02, 0);
    lid.box(0.06, 0.04, 0.22, PAL.metal, 0, 0.04, 0); // grip
    this.lid.position.set(0, 1.0, 0);
    return 0;
  }

  private crate(body: StaticBatch, lid: StaticBatch): number {
    const s = this.size;
    const h = s - 0.08;
    body.box(s, h, s, PAL.woodPale, 0, 0, 0);
    body.box(s + 0.04, 0.1, s + 0.04, PAL.wood, 0, s * 0.42, 0);
    body.box(s - 0.12, 0.02, s - 0.12, PAL.ink, 0, h - 0.01, 0); // dark inside
    // Lid: planks with a cross batten, hinged along the back edge.
    for (let i = 0; i < 3; i++) lid.box(s + 0.02, 0.07, s / 3 - 0.01, i % 2 ? PAL.woodLight : PAL.woodPale, 0, 0, (i + 0.5) * (s / 3));
    lid.box(0.08, 0.02, s, PAL.wood, -s * 0.3, 0.07, s / 2);
    lid.box(0.08, 0.02, s, PAL.wood, s * 0.3, 0.07, s / 2);
    this.lid.position.y = h;
    return -s / 2;
  }

  private chest(body: StaticBatch, lid: StaticBatch): number {
    const { w, d } = SIZE.chest;
    const h = 0.5;
    body.box(w, h, d, PAL.wood, 0, 0, 0);
    for (const x of [-w * 0.32, w * 0.32]) body.box(0.08, h + 0.01, d + 0.02, PAL.metal, x, 0, 0); // iron bands
    body.box(w - 0.1, 0.02, d - 0.1, PAL.ink, 0, h - 0.01, 0);
    body.box(0.12, 0.14, 0.03, PAL.brass, 0, h - 0.16, d / 2 + 0.01); // lock plate
    // Lid: a low rounded top (two stepped slabs), bands and the hasp.
    lid.box(w + 0.02, 0.12, d + 0.02, PAL.woodLight, 0, 0, d / 2);
    lid.box(w + 0.02, 0.1, d * 0.7, PAL.woodLight, 0, 0.12, d / 2);
    for (const x of [-w * 0.32, w * 0.32]) lid.box(0.09, 0.23, d + 0.04, PAL.metal, x, 0, d / 2);
    lid.box(0.08, 0.1, 0.03, PAL.brassLight, 0, -0.04, d + 0.02);
    this.lid.position.y = h;
    return -d / 2;
  }

  private ammoBox(body: StaticBatch, lid: StaticBatch): number {
    const { w, d } = SIZE.ammoBox;
    const h = 0.32;
    body.box(w, h, d, PAL.cactusDark, 0, 0, 0);
    body.box(w + 0.02, 0.05, d + 0.02, PAL.wood, 0, 0.04, 0);
    body.box(w - 0.08, 0.02, d - 0.08, PAL.ink, 0, h - 0.01, 0);
    for (const x of [-w / 2 - 0.02, w / 2 + 0.02]) body.box(0.03, 0.04, 0.16, PAL.metal, x, h * 0.6, 0); // handles
    // Lid with a stamped mark (a cartridge and a band).
    lid.box(w + 0.02, 0.07, d + 0.02, PAL.cactus, 0, 0, d / 2);
    lid.box(w * 0.55, 0.01, 0.1, PAL.cream, 0, 0.07, d / 2);
    lid.box(0.06, 0.012, 0.06, PAL.redDark, -w * 0.18, 0.07, d / 2);
    lid.box(0.14, 0.012, 0.04, PAL.ink, w * 0.08, 0.07, d / 2);
    this.lid.position.y = h;
    return -d / 2;
  }

  private weaponCrate(body: StaticBatch, lid: StaticBatch): number {
    const { w, d } = SIZE.weaponCrate;
    const h = 0.48;
    body.box(w, h, d, PAL.woodLight, 0, 0, 0);
    for (const x of [-w / 2 + 0.06, w / 2 - 0.06]) body.box(0.1, h + 0.01, d + 0.02, PAL.wood, x, 0, 0); // end battens
    body.box(w - 0.12, 0.02, d - 0.1, PAL.ink, 0, h - 0.01, 0);
    // Rope handles at both ends.
    for (const s of [-1, 1]) {
      body.box(0.04, 0.04, 0.24, PAL.sandLight, s * (w / 2 + 0.05), h * 0.62, 0);
      for (const z of [-0.12, 0.12]) body.box(0.06, 0.06, 0.04, PAL.sandLight, s * (w / 2 + 0.03), h * 0.62, z);
    }
    // Stenciled lettering on the front: a row of blocky dark marks.
    const marks = [0.07, 0.04, 0.07, 0.07, 0.04, 0.07, 0.07];
    let x = -0.38;
    for (const mw of marks) {
      body.box(mw, 0.11, 0.01, PAL.darkBrown, x + mw / 2, h * 0.36, d / 2 + 0.006);
      x += mw + 0.05;
    }
    // Lid: three long slats on two battens.
    for (let i = 0; i < 3; i++) lid.box(w + 0.02, 0.06, d / 3 - 0.01, i % 2 ? PAL.woodPale : PAL.woodLight, 0, 0, (i + 0.5) * (d / 3));
    for (const bx of [-w * 0.36, 0, w * 0.36]) lid.box(0.08, 0.02, d, PAL.wood, bx, 0.06, d / 2);
    this.lid.position.y = h;
    return -d / 2;
  }
}

function shadeOf(hex: number): number {
  const c = new THREE.Color(hex).multiplyScalar(0.7);
  return c.getHex();
}

/** Container spots per map, filled in by the map builders. */
export class ContainerSet {
  readonly items: LootContainer[] = [];
  private n = 0;

  constructor(private seed: number) {}

  /** Create, collide and remember a container. */
  add(cw: CollisionWorld, kind: ContainerKind, x: number, z: number, yaw = 0, size?: number): LootContainer {
    const c = new LootContainer(kind, new THREE.Vector3(x, 0, z), yaw, (this.seed * 7919 + ++this.n * 104729) >>> 0, size ?? 0.8);
    c.addCollider(cw);
    this.items.push(c);
    return c;
  }
}
