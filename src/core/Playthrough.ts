import * as THREE from 'three';
import { CONFIG } from '../config';
import { pathThrough, poiById, type ExitDef, type PoiDef, type WorldDef } from '../data/world';
import { findRoute, hopThrough, type Hop } from '../world/routes';
import { Horse } from '../entities/Horse';
import { Player } from '../entities/Player';
import type { Purse } from '../modes/Economy';
import { Discovery, type DiscoveryData, type Reveal } from '../world/Discovery';
import type { PoiMap, PoiMapRegistry } from '../world/poiMaps';
import { applyPoi, capturePoi, type PoiRuntime, type PoiSnapshot } from '../world/poiState';

/** What the playthrough needs from a running POI map (a Session). */
export interface PoiSession extends PoiRuntime {
  readonly player: Player;
  readonly horses: readonly Horse[];
  readonly riding: Horse | null;
  /** Where the map puts the player and the horse by default. */
  readonly map: { playerSpawn: THREE.Vector3; horseSpawn: THREE.Vector3 | null; horseYaw: number };
  addHorse(h: Horse, at: THREE.Vector3, yaw: number): Horse;
  detachHorse(h: Horse): void;
  mount(h: Horse): void;
  /** Jump the camera to the player after they've been placed. */
  snapCamera(): void;
  dispose(): void;
}

/** Builds the running map for a POI (loading may take several frames). */
export type SessionFactory = (poi: PoiDef, map: PoiMap, player: Player) => Promise<PoiSession>;

/** Someone who travels along with the player (future companions): told when they leave and arrive. */
export interface Follower {
  leave(from: PoiSession): void;
  arrive(to: PoiSession, at: THREE.Vector3, facing: number): void;
}

export type TravelRefusal = 'combat' | 'busy' | 'noPath' | 'disabled' | 'notVisited' | 'here';

export type TravelResult = { ok: true; session: PoiSession; poi: PoiDef } | { ok: false; reason: TravelRefusal };

/** Is the player standing in an exit's zone? */
export function insideExit(pos: { x: number; z: number }, e: ExitDef): boolean {
  return Math.abs(pos.x - e.at[0]) <= e.half[0] && Math.abs(pos.z - e.at[1]) <= e.half[1];
}

/** Someone's shooting at you: an NPC that's hostile and has you in sight. */
export function inCombat(npcs: readonly { alive: boolean; engaging: boolean }[]): boolean {
  return npcs.some((n) => n.alive && n.engaging);
}

/** Your horse comes along if you ride it, or it stands close to the exit. */
export function horseTravels(riding: boolean, horse: { x: number; z: number }, exit: ExitDef, radius = CONFIG.world.horseFollowRadius): boolean {
  return riding || Math.hypot(horse.x - exit.at[0], horse.z - exit.at[1]) <= radius;
}

/**
 * One run through the world: owns everything that crosses maps — the player (bags, equipment,
 * dual-wield slots, health), the purse, the horse, what's been discovered, and how each place was
 * left — while each POI's map lives in its own session for as long as you're there.
 */
export class Playthrough {
  readonly player: Player;
  readonly purse: Purse;
  readonly discovery: Discovery;
  /** Each place as it was left (plain data; reset when the page reloads). */
  readonly snapshots = new Map<string, PoiSnapshot>();
  /** The player's horse, and where it waits when it isn't with you. */
  horse = new Horse();
  horseAt: { poi: string; pos: [number, number]; yaw: number } | null = null;
  /** Future companions. */
  readonly followers: Follower[] = [];
  poi: string;
  session: PoiSession | null = null;
  traveling = false;
  disposed = false;
  /** New places or trails learnt of (with the whole state, to save). */
  onReveal: (r: Reveal[], all: DiscoveryData) => void = () => {};

  constructor(
    readonly world: WorldDef,
    private registry: PoiMapRegistry,
    private factory: SessionFactory,
    opts: { player?: Player; purse: Purse; discovery?: DiscoveryData },
  ) {
    this.player = opts.player ?? new Player();
    this.purse = opts.purse;
    this.discovery = new Discovery(world, opts.discovery);
    this.poi = world.start.poi;
  }

  get here(): PoiDef {
    return poiById(this.world, this.poi);
  }

  /** Load the starting place; the horse waits at its spawn there. */
  async start(): Promise<PoiSession> {
    const poi = this.here;
    const map = await this.registry.load(poi.id);
    const s = await this.factory(poi, map, this.player);
    if (map.horses) s.setLooseHorses(map.horses);
    const m = s.map;
    if (m.horseSpawn) this.horseAt = { poi: poi.id, pos: [m.horseSpawn.x, m.horseSpawn.z], yaw: m.horseYaw };
    this.enter(s, null);
    this.reveal(this.discovery.arrive(poi.id));
    return s;
  }

  /** Why travel through this exit isn't possible right now (null: it is). */
  refusal(exit: string): TravelRefusal | null {
    if (this.traveling || !this.session) return 'busy';
    if (!pathThrough(this.world, this.poi, exit)) return 'noPath';
    if (inCombat(this.session.npcList)) return 'combat';
    return null;
  }

  /** Walking into an exit's zone: the place behind it is now known of. */
  exitEntered(exit: string): void {
    this.reveal(this.discovery.takeExit(this.poi, exit));
  }

  /** The trail out through an exit (for the ride on the world map). */
  planExit(exitId: string): Hop[] | null {
    const hop = hopThrough(this.world, this.poi, exitId);
    return hop ? [hop] : null;
  }

  /** Why fast travel to `poi` isn't possible (null: it is). Only to places you've been, over known trails. */
  fastRefusal(poi: string, enabled: boolean): TravelRefusal | null {
    if (!enabled) return 'disabled';
    if (this.traveling || !this.session) return 'busy';
    if (poi === this.poi) return 'here';
    if (this.discovery.poi(poi) !== 'visible') return 'notVisited';
    if (!findRoute(this.world, this.discovery, this.poi, poi)) return 'noPath';
    if (inCombat(this.session.npcList)) return 'combat';
    return null;
  }

  /** The shortest chain of known trails to a place (for fast travel and its ride on the map). */
  planFast(poi: string): Hop[] | null {
    return findRoute(this.world, this.discovery, this.poi, poi);
  }

  /** Leave through an exit and arrive at the other end of its trail. */
  async travel(exitId: string): Promise<TravelResult> {
    const why = this.refusal(exitId);
    if (why) return { ok: false, reason: why };
    const exit = this.here.exits.find((e) => e.id === exitId)!;
    this.reveal(this.discovery.takeExit(this.poi, exitId));
    return this.journey(this.planExit(exitId)![0].to, exit);
  }

  /** Fast travel (if `enabled`): along the shortest known trails to a visited place. */
  async fastTravel(poi: string, enabled: boolean): Promise<TravelResult> {
    const why = this.fastRefusal(poi, enabled);
    if (why) return { ok: false, reason: why };
    const hops = this.planFast(poi)!;
    return this.journey(hops[hops.length - 1].to, null);
  }

  /**
   * Ride a chain of trails: the place is saved as it is, the destination loads, the player (and
   * horse, if it comes) arrive at the last trail's exit, and the place looks the way it was left
   * if they've been there before. `exit` is the one walked out of (null for fast travel, where the
   * horse comes if it's near the player).
   */
  private async journey(to: { poi: string; exit: string }, exit: ExitDef | null): Promise<TravelResult> {
    const from = this.session!;
    const here = this.here;
    const dest = poiById(this.world, to.poi);
    const arrival = dest.exits.find((e) => e.id === to.exit)!;
    this.traveling = true;

    // Riding off on a horse that isn't yours (a saddled ranch horse): it's yours now; your old
    // one stays where it is, as a loose horse of that place.
    const ridden = from.riding;
    if (ridden && ridden !== this.horse) {
      const old = this.horse;
      if (!from.horses.includes(old) && this.horseAt) this.snapshots.get(this.horseAt.poi)?.horses.push({ pos: this.horseAt.pos, yaw: this.horseAt.yaw });
      this.horse = ridden;
      this.horseAt = null;
    }
    // The horse: along if ridden or close by, otherwise it waits here.
    const riding = from.riding === this.horse;
    let horseComes = false;
    if (from.horses.includes(this.horse)) {
      const near = exit ?? { at: [this.player.pos.x, this.player.pos.z], half: [0, 0], arrive: [0, 0], facing: 0, id: '' };
      horseComes = horseTravels(riding, this.horse.pos, near as ExitDef);
      if (!horseComes) this.horseAt = { poi: here.id, pos: [this.horse.pos.x, this.horse.pos.z], yaw: this.horse.heading };
      from.detachHorse(this.horse); // (dismounts first)
    }
    if (horseComes) this.horseAt = null;
    this.snapshots.set(here.id, capturePoi(from));
    for (const f of this.followers) f.leave(from);

    const map = await this.registry.load(dest.id);
    const next = await this.factory(dest, map, this.player);
    if (this.disposed) {
      next.dispose();
      return { ok: false, reason: 'busy' };
    }
    from.dispose();
    this.poi = dest.id;
    const snap = this.snapshots.get(dest.id);
    if (snap) applyPoi(next, snap);
    else if (map.horses) next.setLooseHorses(map.horses);
    this.enter(next, arrival, horseComes ? { riding } : null);
    for (const f of this.followers) f.arrive(next, this.player.pos, arrival.facing);
    this.reveal(this.discovery.arrive(dest.id));
    this.traveling = false;
    return { ok: true, session: next, poi: dest };
  }

  /** Place the player (and horse) in a freshly loaded map. */
  private enter(s: PoiSession, arrival: ExitDef | null, withHorse: { riding: boolean } | null = null): void {
    this.session = s;
    const p = this.player;
    if (arrival) {
      p.setPosition(new THREE.Vector3(arrival.arrive[0], 0, arrival.arrive[1]));
      p.face(arrival.facing);
    }
    const yaw = arrival?.facing ?? p.moveYaw;
    if (withHorse) {
      // Beside you, a little behind, facing the same way.
      const at = new THREE.Vector3(p.pos.x + Math.cos(yaw) * 1.6 - Math.sin(yaw) * 0.6, 0, p.pos.z - Math.sin(yaw) * 1.6 - Math.cos(yaw) * 0.6);
      s.addHorse(this.horse, withHorse.riding ? p.pos.clone() : at, yaw);
      if (withHorse.riding) s.mount(this.horse);
    } else if (this.horseAt?.poi === this.poi) {
      s.addHorse(this.horse, new THREE.Vector3(this.horseAt.pos[0], 0, this.horseAt.pos[1]), this.horseAt.yaw);
    }
    s.snapCamera();
  }

  private reveal(r: Reveal[]): void {
    if (r.length) this.onReveal(r, this.discovery.save());
  }

  /** Debug: everything on the map. */
  revealAll(): void {
    this.discovery.revealAll();
    this.onReveal([], this.discovery.save());
  }

  /** Debug: discovery as at the start (where you are stays visited). */
  resetDiscovery(): void {
    this.discovery.reset();
    this.discovery.arrive(this.poi);
    this.onReveal([], this.discovery.save());
  }

  /**
   * Debug: straight to a place's exit (fights and trails don't matter). In the same place you're
   * just moved there; elsewhere it's a journey without the ride (your horse comes if near).
   */
  async teleport(poi: string, exitId: string): Promise<TravelResult> {
    if (this.traveling || !this.session) return { ok: false, reason: 'busy' };
    const dest = poiById(this.world, poi);
    const exit = dest.exits.find((e) => e.id === exitId);
    if (!exit) return { ok: false, reason: 'busy' };
    if (poi === this.poi) {
      const s = this.session;
      const at = new THREE.Vector3(exit.arrive[0], 0, exit.arrive[1]);
      s.riding?.place(at, exit.facing); // (the rider goes with the horse)
      this.player.setPosition(at);
      this.player.face(exit.facing);
      s.snapCamera();
      return { ok: true, session: s, poi: dest };
    }
    return this.journey({ poi, exit: exitId }, null);
  }

  /** Learn of a place (map scraps, directions) and tell whoever listens. */
  learn(poi: string): Reveal[] {
    const r = this.discovery.learn(poi);
    this.reveal(r);
    return r;
  }

  dispose(): void {
    this.disposed = true;
    this.session?.dispose();
    this.session = null;
  }
}
