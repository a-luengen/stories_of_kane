import * as THREE from 'three';
import { poiById } from '../data/world';
import type { Playthrough } from '../core/Playthrough';
import type { Session } from '../core/Session';
import type { Npc } from '../entities/Npc';
import type { GridContainer } from '../items/GridContainer';
import { hasItemDef, itemDef } from '../items/ItemDef';
import { createItem, type ItemData, type ItemInstance } from '../items/ItemInstance';
import { questNpcDef } from '../quests/npcs';
import type { QuestRuntime, QuestWorld } from '../quests/QuestRuntime';
import { splitRef, type QuestPack, type Ref } from '../quests/types';
import type { PoiSnapshot } from '../world/poiState';
import type { Purse } from './Economy';

export interface QuestWorldHost {
  playthrough: Playthrough;
  purse: Purse;
  session(): Session | null;
  /** The quest runtime (packs, what's dead or taken). */
  quests(): QuestRuntime | null;
  /** Queue a message (shown one after the other, across POI switches). */
  toast(text: string): void;
}

/** An item of this quest that goes when the quest ends (not a `keepAfterQuest` one). */
function endsWith(quest: string, defId: string): boolean {
  if (!hasItemDef(defId)) return false;
  const q = itemDef(defId).quest;
  return !!q && q.id === quest && !q.keepAfterQuest;
}

/** Remove a quest's NPCs and items from a place that isn't loaded (its stored state). */
export function stripSnapshot(snap: PoiSnapshot, quest: string): void {
  const keep = (d: ItemData) => !endsWith(quest, d.defId);
  snap.extraNpcs = (snap.extraNpcs ?? []).filter((x) => x.def.questId !== quest);
  for (const c of snap.containers) c.items = c.items.filter(keep);
  for (const n of snap.npcs) n.inventory = n.inventory.filter(keep);
  for (const x of snap.extraNpcs) x.state.inventory = x.state.inventory.filter(keep);
  snap.items = snap.items.filter((g) => keep(g.item));
}

/**
 * The game as the quest runtime sees it: the player's bags and purse, the current POI and its
 * named areas, discovery, messages, and quest things in the world — items placed in containers,
 * on the ground or on bodies; quest NPCs spawned and taken away again (also on POIs that aren't
 * loaded, through their stored state).
 */
export function gameQuestWorld(h: QuestWorldHost): QuestWorld {
  const pt = h.playthrough;
  const bags = () => pt.player.inventory;
  const questNpc = (s: Session, ref: Ref, quest: string): Npc | undefined => s.npcs.npcs.find((n) => n.def.questId === quest && n.def.id === splitRef(ref).id);

  const world: QuestWorld = {
    get poi() {
      return pt.poi;
    },
    money: () => h.purse.dollars,
    giveMoney: (n) => {
      h.purse.dollars += n;
    },
    takeMoney: (n) => {
      if (h.purse.dollars < n) return false;
      h.purse.dollars -= n;
      return true;
    },
    countItem: (id) => bags().items.reduce((n, i) => n + (i.defId === id ? i.quantity : 0), 0),
    giveItem: (id, count) => {
      const def = itemDef(id);
      let dropped = 0;
      for (let left = count; left > 0; ) {
        const n = def.stackable ? Math.min(left, def.maxStack) : 1;
        left -= n;
        const item = createItem(id, n);
        const rest = bags().add(item);
        if (rest > 0) {
          // Doesn't fit: at the player's feet.
          dropped += rest;
          const s = h.session();
          if (s) s.dropToWorld(item);
        }
      }
      return dropped;
    },
    takeItem: (id, count) => {
      let taken = 0;
      for (const item of [...bags().items].filter((i) => i.defId === id).sort((a, b) => a.quantity - b.quantity)) {
        if (taken >= count) break;
        const n = Math.min(item.quantity, count - taken);
        item.quantity -= n;
        taken += n;
        if (item.quantity <= 0) bags().remove(item);
      }
      return taken;
    },
    itemName: (id) => (hasItemDef(id) ? itemDef(id).name : id),
    discovery: (poi) => pt.discovery.poi(poi),
    reveal: (poi) => void pt.learn(poi),
    revealPath: (path) => void pt.learnPath(path),
    poiName: (poi) => (pt.world.pois.some((p) => p.id === poi) ? poiById(pt.world, poi).name : poi),
    toast: (text) => h.toast(text),
    inArea: (ref) => {
      const { poi, id } = splitRef(ref);
      const s = h.session();
      const a = poi === pt.poi ? s?.map.areas?.find((x) => x.id === id) : undefined;
      const p = pt.player.pos;
      return !!a && p.x >= a.minX && p.x <= a.maxX && p.z >= a.minZ && p.z <= a.maxZ;
    },
    heldKeys: () => bags().items.flatMap((i) => (i.questKey ? [i.questKey] : [])),

    spawn: (ref, quest) => {
      const s = h.session();
      const rt = h.quests();
      const { poi, id } = splitRef(ref);
      const def = rt?.pack(quest)?.npcs?.find((n) => n.poi === poi && n.id === id);
      if (!s || !rt || !def || poi !== pt.poi) return;
      // Already here (alive or as a body), or killed before the page reloaded: nothing to do.
      if (questNpc(s, ref, quest) || rt.isDead(ref)) return;
      const npc = s.spawnNpc(questNpcDef(def, quest));
      for (const c of def.carries ?? []) npc.inventory.add(createItem(c.item, c.count ?? 1));
    },

    despawn: (ref, quest) => {
      const { poi, id } = splitRef(ref);
      const s = h.session();
      if (poi === pt.poi && s) {
        const n = questNpc(s, ref, quest);
        if (n) s.removeNpc(n);
        return;
      }
      const snap = pt.snapshots.get(poi);
      if (snap) snap.extraNpcs = (snap.extraNpcs ?? []).filter((x) => !(x.def.questId === quest && x.def.id === id));
    },

    setup: (entry, info) => {
      const s = h.session();
      const rt = h.quests();
      if (!s || !rt) return;
      if (entry.type === 'spawn') {
        world.spawn(entry.npc, info.quest);
        return;
      }
      if (info.restore && rt.isTaken(pt.poi, info.key)) return;
      const make = (): ItemInstance => {
        const item = createItem(entry.item, entry.count ?? 1);
        item.questKey = info.key;
        return item;
      };
      const onGround = (at: THREE.Vector3) => s.placeItem(make(), at, null);
      if ('container' in entry) {
        const c = s.containers.find((x) => x.id === splitRef(entry.container).id);
        if (!c) {
          console.warn(`[quests] ${info.quest}: no container "${entry.container}"`);
          onGround(pt.player.pos.clone());
        } else if (c.destroyed || c.inventory.add(make()) > 0) onGround(c.position.clone().add(new THREE.Vector3(0.6, 0, 0.6)));
      } else if ('area' in entry) {
        const a = s.map.areas?.find((x) => x.id === splitRef(entry.area).id);
        if (!a) console.warn(`[quests] ${info.quest}: no area "${entry.area}"`);
        onGround(a ? new THREE.Vector3((a.minX + a.maxX) / 2, 0, (a.minZ + a.maxZ) / 2) : pt.player.pos.clone());
      } else {
        const npc = questNpc(s, entry.corpse, info.quest) ?? s.npcs.npcs.find((n) => !n.def.questId && n.def.id === splitRef(entry.corpse).id);
        if (npc && npc.inventory.add(make()) === 0) return;
        // Gone (killed before a reload) or full: where it fell.
        const def = rt.pack(info.quest)?.npcs?.find((n) => `${n.poi}:${n.id}` === entry.corpse);
        onGround(npc ? npc.pos.clone() : def ? new THREE.Vector3(def.spawn[0], 0, def.spawn[1]) : pt.player.pos.clone());
      }
    },

    cleanup: (pack: QuestPack) => {
      const quest = pack.id;
      const drop = (g: GridContainer) => {
        for (const i of [...g.items]) if (endsWith(quest, i.defId)) g.remove(i);
      };
      drop(bags());
      const s = h.session();
      if (s) {
        for (const n of s.npcs.npcs.filter((x) => x.def.questId === quest)) s.removeNpc(n);
        for (const c of s.containers) drop(c.inventory);
        for (const n of s.npcs.npcs) drop(n.inventory);
        for (const g of s.groundItems()) if (endsWith(quest, g.item.defId)) s.removeGroundItem(g.item);
      }
      for (const [poi, snap] of pt.snapshots) if (poi !== pt.poi || !s) stripSnapshot(snap, quest);
    },
  };
  return world;
}
