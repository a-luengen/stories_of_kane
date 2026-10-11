import * as THREE from 'three';
import { CONFIG } from '../config';
import type { NpcDef, Vec2 } from '../data/types';
import type { CircleCollider, CollisionWorld } from '../world/Colliders';
import type { NavGrid } from '../world/NavGrid';
import { Npc, playerChest, type NpcContext, type PlayerView } from './Npc';
import type { ShotRequest } from './Weapon';

/** Building footprint (for picking cover spots). */
export interface Footprint {
  minX: number;
  minZ: number;
  maxX: number;
  maxZ: number;
}

/** Spawns the NPCs, steps them, and turns gunfire into provocations, witnesses and warnings. */
export class NpcSystem {
  readonly group = new THREE.Group();
  readonly npcs: Npc[];
  readonly hideSpots: Vec2[];
  private colliders: CircleCollider[] = [];
  private tmpA = new THREE.Vector3();
  private tmpB = new THREE.Vector3();

  constructor(
    defs: readonly NpcDef[],
    private world: CollisionWorld,
    private nav: NavGrid,
    buildings: readonly Footprint[],
  ) {
    this.npcs = defs.map((d) => new Npc(d));
    for (const n of this.npcs) this.group.add(n.model.root);
    this.hideSpots = coverSpots(buildings, nav);
  }

  /** Circles of the living NPCs, for the player / horse to collide with. */
  get bodies(): readonly CircleCollider[] {
    return this.npcs.filter((n) => n.alive).map((n) => n.collider);
  }

  update(dt: number, player: PlayerView, extra: readonly CircleCollider[], fire: (npc: Npc, shot: ShotRequest) => void): void {
    this.colliders.length = 0;
    this.colliders.push(...extra, ...this.bodies);
    const ctx: NpcContext = { world: this.world, nav: this.nav, player, colliders: this.colliders, hideSpots: this.hideSpots, fire };
    for (const n of this.npcs) n.step(dt, ctx);
  }

  /**
   * The player shot `victim`. The victim is provoked; any defender within witness range of the
   * victim who can see the victim or the player joins in.
   */
  onPlayerHitNpc(victim: Npc, player: PlayerView): void {
    const ctx = this.contextFor(player);
    victim.provoke(ctx);
    const nc = CONFIG.npc;
    const chest = playerChest(player, this.tmpA);
    for (const n of this.npcs) {
      if (n === victim || !n.alive || !n.def.defendsOthers) continue;
      if (n.pos.distanceTo(victim.pos) > nc.witnessRange) continue;
      const seesVictim = this.lineOfSight(n.pos, this.tmpB.set(victim.pos.x, nc.chestHeight, victim.pos.z));
      if (seesVictim || this.lineOfSight(n.pos, chest)) n.provoke(ctx);
    }
  }

  /** A player bullet landed at `point` (having hit `hitNpc`, if any): nearby NPCs flinch and warn. */
  onPlayerShotLanded(point: THREE.Vector3, hitNpc: Npc | null): void {
    const r = CONFIG.npc.nearMissRadius;
    for (const n of this.npcs) {
      if (n === hitNpc || !n.alive) continue;
      if (Math.hypot(point.x - n.pos.x, point.z - n.pos.z) <= r) n.nearMiss();
    }
  }

  /** Everyone stands down (e.g. after the player respawns). */
  calmAll(): void {
    for (const n of this.npcs) n.calmDown(true);
  }

  private lineOfSight(from: THREE.Vector3, to: THREE.Vector3): boolean {
    const e = CONFIG.npc.eyeHeight;
    return this.world.raycast(from.x, e, from.z, to.x, to.y, to.z) === null;
  }

  private contextFor(player: PlayerView): NpcContext {
    return { world: this.world, nav: this.nav, player, colliders: this.colliders, hideSpots: this.hideSpots, fire: () => {} };
  }
}

/** Walkable points around each building, just outside its footprint. */
function coverSpots(buildings: readonly Footprint[], nav: NavGrid): Vec2[] {
  const out: Vec2[] = [];
  const pad = 1.0;
  for (const b of buildings) {
    const x0 = b.minX - pad;
    const x1 = b.maxX + pad;
    const z0 = b.minZ - pad;
    const z1 = b.maxZ + pad;
    for (let x = x0; x <= x1; x += 2) {
      out.push([x, z0], [x, z1]);
    }
    for (let z = z0 + 2; z < z1; z += 2) {
      out.push([x0, z], [x1, z]);
    }
  }
  return out.filter(([x, z]) => nav.isFree(x, z));
}
