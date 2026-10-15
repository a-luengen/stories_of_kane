import * as THREE from 'three';
import type { AnimalSpawn } from '../data/animals';
import type { Vec2 } from '../data/types';
import type { NavGrid } from '../ai/NavGrid';
import type { CircleCollider, CollisionWorld } from '../world/Colliders';
import { Animal, type AnimalContext, type Prey } from './Animal';

/** Animals smaller than this don't get in anyone's way (chickens scurry round your feet). */
const BLOCKING_RADIUS = 0.4;

/**
 * Wild animals living together (a wolf pack; a bear or a snake is a pack of one): they rest around
 * one home, notice together, and go for the same one together.
 */
interface Pack {
  members: Animal[];
  home: Vec2;
  /** Whom the pack is going for, or null. */
  hostile: object | null;
}

/**
 * A map's animals: spawns them, steps them, spreads a fright — a gunshot, a hit, someone rushing
 * past — through a herd or flock, and runs the wild ones' packs: a pack turns on whoever one of
 * them turns on, gives up together past its leash, and a pack that has lost wolves (two or fewer
 * left) runs off instead.
 *
 * Animals aren't part of a place's saved state: leaving and coming back finds them all alive again
 * at their spawn points (and the carcasses gone).
 */
export class AnimalSystem {
  readonly group = new THREE.Group();
  readonly animals: Animal[];
  /** Set by the session: an attack (or a trampling) landed on someone. */
  onBite: (a: Animal, prey: Prey, damage: number, push: Vec2 | null) => void = () => {};
  private colliders: CircleCollider[] = [];
  private packs: Pack[] = [];
  /** Everyone the animals could go for, as of the last update. */
  private prey: readonly Prey[] = [];

  constructor(
    spawns: readonly AnimalSpawn[],
    private world: CollisionWorld,
    private nav: NavGrid,
    rand: () => number = Math.random,
  ) {
    this.animals = spawns.map((s) => new Animal(s, rand));
    for (const a of this.animals) this.group.add(a.model.root);
    const byId = new Map<string, Animal[]>();
    for (const a of this.animals) {
      if (!a.def.hunts) continue;
      if (a.spawn.pack) byId.set(a.spawn.pack, [...(byId.get(a.spawn.pack) ?? []), a]);
      else this.packs.push({ members: [a], home: a.spawn.at, hostile: null });
    }
    for (const members of byId.values()) {
      const home: Vec2 = [members.reduce((s, m) => s + m.spawn.at[0], 0) / members.length, members.reduce((s, m) => s + m.spawn.at[1], 0) / members.length];
      this.packs.push({ members, home, hostile: null });
    }
    for (const p of this.packs) for (const m of p.members) m.home = p.home;
  }

  /** Circles of the living animals big enough to block the player, horses and NPCs. */
  get bodies(): readonly CircleCollider[] {
    return this.animals.filter((a) => a.alive && a.def.radius >= BLOCKING_RADIUS).map((a) => a.collider);
  }

  /**
   * `extra`: everyone else's bodies. `rushers`: whoever is sprinting or galloping right now.
   * `player`: null when dead. `prey`: everyone wild animals may go for (and stampedes trample).
   */
  update(dt: number, extra: readonly CircleCollider[], rushers: readonly Vec2[], player: Vec2 | null = null, prey: readonly Prey[] = []): void {
    this.prey = prey;
    for (const a of this.animals) {
      if (!a.alive || a.def.hunts) continue;
      const r = rushers.find(([x, z]) => Math.hypot(x - a.pos.x, z - a.pos.z) < a.def.startle.rush);
      if (r) this.alarm(a, r);
      const near = a.def.startle.near;
      const p = near ? prey.find((q) => Math.hypot(q.pos.x - a.pos.x, q.pos.z - a.pos.z) < near) : undefined;
      if (p) this.alarm(a, [p.pos.x, p.pos.z]);
    }
    this.colliders.length = 0;
    this.colliders.push(...extra, ...this.animals.filter((a) => a.alive).map((a) => a.collider));
    const ctx: AnimalContext = { world: this.world, nav: this.nav, colliders: this.colliders, player, prey, bite: (a, p, d, push) => this.onBite(a, p, d, push) };
    for (const a of this.animals) a.step(dt, ctx);
    for (const pack of this.packs) this.runPack(pack);
  }

  /** A gun went off at `at` (fired by `shooter`, if known): animals within earshot bolt; wild ones watch the shooter. */
  hearShot(at: THREE.Vector3, shooter: object | null = null): void {
    for (const a of this.animals) {
      if (!a.alive || Math.hypot(at.x - a.pos.x, at.z - a.pos.z) >= a.def.startle.shot) continue;
      if (!a.def.hunts) this.alarm(a, [at.x, at.z]);
      else {
        const p = this.prey.find((q) => q.key === shooter);
        if (p && (a.mode === 'idle' || a.mode === 'walk')) {
          a.watch(p);
          a.event = 'notice';
        }
      }
    }
  }

  /**
   * `a` takes fright at `from`. If it wasn't running yet, its kind close by run too, and those
   * close to them: the fright spreads through the herd.
   */
  alarm(a: Animal, from: Vec2): void {
    if (!a.startle(from)) return;
    for (const o of this.animals) {
      if (o !== a && o.alive && o.def === a.def && o.pos.distanceTo(a.pos) < a.def.herd) this.alarm(o, from);
    }
  }

  /**
   * `a` was shot by `shooter` (from the direction of `from`). Tame animals bolt (with their herd); a
   * wild one's pack goes for the shooter — a badly hurt wolf runs off instead, to come back later.
   */
  provoke(a: Animal, shooter: object | null, from: Vec2): void {
    if (!a.alive) return;
    const h = a.def.hunts;
    if (!h) {
      this.alarm(a, from);
      return;
    }
    const pack = this.packs.find((p) => p.members.includes(a))!;
    const p = this.prey.find((q) => q.key === shooter);
    if (p) pack.hostile = p.key;
    if (h.flee && a.hp < h.flee.below * a.def.hp) a.startle(from, h.flee.time);
    else if (p) a.goFor(p.key);
  }

  /** Whom the pack of `a` is going for (null: nobody). */
  packTarget(a: Animal): object | null {
    return this.packs.find((p) => p.members.includes(a))?.hostile ?? null;
  }

  private runPack(pack: Pack): void {
    const alive = pack.members.filter((m) => m.alive);
    for (const m of pack.members) {
      const key = m.targetKey;
      if (m.event === 'notice' && key) {
        const p = this.prey.find((q) => q.key === key);
        if (p) for (const o of alive) if (o !== m) o.watch(p);
      } else if (m.event === 'attack' && key) {
        pack.hostile = key;
      } else if (m.event === 'giveUp') {
        pack.hostile = null;
        for (const o of alive) if (o.mode === 'alert' || o.mode === 'hunt') o.standDown();
      }
      m.event = null;
    }
    if (!pack.hostile || alive.length === 0) return;
    const target = this.prey.find((q) => q.key === pack.hostile);
    const h = alive[0].def.hunts!;
    if (!target || Math.hypot(target.pos.x - pack.home[0], target.pos.z - pack.home[1]) > h.leash) {
      pack.hostile = null;
      for (const o of alive) if (o.mode === 'alert' || o.mode === 'hunt') o.standDown();
      return;
    }
    // A pack that has lost wolves, down to two or fewer, runs for it.
    if (pack.members.length > 1 && alive.length < pack.members.length && alive.length <= 2) {
      for (const o of alive) if (o.def.hunts?.flee && o.mode !== 'flee') o.startle([target.pos.x, target.pos.z], o.def.hunts.flee.time);
      pack.hostile = null;
      return;
    }
    for (const o of alive) if (o.mode !== 'hunt' && o.mode !== 'flee') o.goFor(pack.hostile);
  }
}
