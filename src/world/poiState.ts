import * as THREE from 'three';
import type { NpcDef, Vec2 } from '../data/types';
import type { Npc, NpcState } from '../entities/Npc';
import { itemFromData, itemToData, type ItemData, type ItemInstance } from '../items/ItemInstance';
import type { ContainerState, LootContainer } from './Container';

/** An item lying on the ground (and whose corpse dropped it, if anyone's). */
export interface GroundItemState {
  item: ItemData;
  pos: Vec2;
  /** The NPC who dropped it (it goes when their corpse does). */
  npc?: string;
}

export interface HorseState {
  pos: Vec2;
  yaw: number;
  /** Default true. Unsaddled horses can't be ridden. */
  saddled?: boolean;
  /** Grazes inside this paddock (minX, minZ, maxX, maxZ). */
  pen?: [number, number, number, number];
}

/**
 * A place as you left it, as plain data (so a save game can reuse it): containers by index,
 * NPCs by id, items on the ground and loose horses. The map itself is rebuilt from its builder.
 */
export interface PoiSnapshot {
  containers: ContainerState[];
  npcs: NpcState[];
  /** NPCs that aren't part of the map (spawned by quests), with their definitions. */
  extraNpcs: { def: NpcDef; state: NpcState }[];
  items: GroundItemState[];
  horses: HorseState[];
}

/** What a running map exposes for saving and restoring it. */
export interface PoiRuntime {
  readonly containers: readonly LootContainer[];
  readonly npcList: readonly Npc[];
  groundItems(): { item: ItemInstance; pos: THREE.Vector3; npc: Npc | null }[];
  placeItem(item: ItemInstance, pos: THREE.Vector3, npc: Npc | null): void;
  clearGroundItems(): void;
  /** Horses standing around (not the player's: that one travels with the playthrough). */
  looseHorses(): HorseState[];
  setLooseHorses(horses: readonly HorseState[]): void;
  /** Bring in an NPC that isn't part of the map (a quest NPC) and return it. */
  spawnNpc(def: NpcDef): Npc;
}

export function capturePoi(rt: PoiRuntime): PoiSnapshot {
  return {
    containers: rt.containers.map((c) => c.state()),
    npcs: rt.npcList.filter((n) => !n.def.questId).map((n) => n.state()),
    extraNpcs: rt.npcList.filter((n) => n.def.questId).map((n) => ({ def: n.def, state: n.state() })),
    items: rt.groundItems().map((g) => ({ item: itemToData(g.item), pos: [g.pos.x, g.pos.z] as Vec2, ...(g.npc ? { npc: g.npc.def.id } : {}) })),
    horses: rt.looseHorses(),
  };
}

/** Make a freshly built map look the way it was left. */
export function applyPoi(rt: PoiRuntime, snap: PoiSnapshot): void {
  snap.containers.forEach((s, i) => rt.containers[i]?.restore(s));
  for (const x of snap.extraNpcs ?? []) rt.spawnNpc(x.def).restore(x.state);
  for (const s of snap.npcs) rt.npcList.find((n) => n.def.id === s.id)?.restore(s);
  rt.clearGroundItems();
  for (const g of snap.items) {
    const npc = g.npc ? (rt.npcList.find((n) => n.def.id === g.npc) ?? null) : null;
    rt.placeItem(itemFromData(g.item), new THREE.Vector3(g.pos[0], 0, g.pos[1]), npc);
  }
  rt.setLooseHorses(snap.horses);
}
