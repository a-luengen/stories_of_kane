import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { MERCHANT_SHOPS } from '../data/shop';
import { poiById, SANDBOX_WORLD } from '../data/world';
import type { NpcDef } from '../data/types';
import { Npc } from '../entities/Npc';
import { Player } from '../entities/Player';
import { TargetSystem } from '../entities/Targets';
import type { Playthrough } from '../core/Playthrough';
import type { Session } from '../core/Session';
import { hasItemDef, itemDef } from '../items/ItemDef';
import { buildItemMesh } from '../items/itemMeshes';
import { createItem, type ItemInstance } from '../items/ItemInstance';
import { gameQuestWorld, stripSnapshot } from '../modes/questWorld';
import { Economy } from '../modes/Economy';
import { InventoryUI } from '../ui/InventoryUI';
import type { LootContainer } from '../world/Container';
import { buildSandboxMap } from '../world/maps/sandbox';
import { applyPoi, capturePoi, type PoiSnapshot } from '../world/poiState';
import { registerQuestItems } from './items';
import { questNpcDef } from './npcs';
import { QuestRuntime } from './QuestRuntime';
import { entry, memoryPacks } from './testkit';
import type { QuestPack } from './types';
import { validatePack } from './validate';

// ------------------------------------------------------------------ a quest that uses it all

const BOUNTY: QuestPack = {
  formatVersion: 1,
  id: 'test-bounty',
  title: 'Test Bounty',
  description: 'x',
  giver: 'kanes-crossing:gunsmith',
  modes: ['sandbox'],
  items: [
    { id: 'tb-letter', name: 'Test Letter', description: 'x', shape: 'letter', questItem: true },
    { id: 'tb-poster', name: 'Test Poster', description: 'x', shape: 'map', questItem: true },
    { id: 'tb-badge', name: 'Test Badge', description: 'x', shape: 'badge', questItem: true, keepAfterQuest: true },
  ],
  npcs: [
    { id: 'boss', poi: 'kanes-crossing', spawn: [6, 12], group: 'gang', archetype: 'gunslinger', def: { name: 'Black Jack' } },
    { id: 'goon', poi: 'kanes-crossing', spawn: [9, 12], group: 'gang', archetype: 'shotgunner' },
    { id: 'far', poi: 'two-spurs-ranch', spawn: [0, 0], group: 'gang' },
  ],
  steps: [
    {
      id: 'find',
      type: 'collect',
      item: 'tb-letter',
      objective: 'Find the letter',
      setup: [
        { type: 'placeItem', item: 'tb-letter', container: 'kanes-crossing:chest-porch' },
        { type: 'spawn', npc: 'kanes-crossing:boss' },
        { type: 'spawn', npc: 'kanes-crossing:goon' },
        { type: 'placeItem', item: 'tb-poster', corpse: 'kanes-crossing:boss' },
        { type: 'placeItem', item: 'tb-badge', area: 'kanes-crossing:well' },
      ],
    },
    { id: 'kill', type: 'defeat', group: 'gang', count: 2, label: 'Gang', objective: 'Deal with the gang' },
  ],
};

/** The town as a running place, without a renderer: containers, NPCs, ground items, an area. */
class TownSession {
  readonly containers: LootContainer[];
  readonly npcs = { npcs: [] as Npc[] };
  readonly map = { areas: [{ id: 'well', minX: 10, minZ: 6, maxX: 12, maxZ: 8 }] };
  ground: { item: ItemInstance; pos: THREE.Vector3; npc: Npc | null }[] = [];
  constructor() {
    this.containers = buildSandboxMap(new TargetSystem(), poiById(SANDBOX_WORLD, 'kanes-crossing').exits).containers;
  }
  get npcList() {
    return this.npcs.npcs;
  }
  spawnNpc(def: NpcDef) {
    const n = new Npc(def);
    this.npcs.npcs.push(n);
    return n;
  }
  removeNpc(n: Npc) {
    this.npcs.npcs.splice(this.npcs.npcs.indexOf(n), 1);
  }
  placeItem(item: ItemInstance, pos: THREE.Vector3, npc: Npc | null) {
    this.ground.push({ item, pos, npc });
  }
  groundItems() {
    return this.ground;
  }
  removeGroundItem(item: ItemInstance) {
    this.ground = this.ground.filter((g) => g.item !== item);
  }
  clearGroundItems() {
    this.ground = [];
  }
  dropToWorld(item: ItemInstance) {
    this.ground.push({ item, pos: new THREE.Vector3(), npc: null });
  }
  looseHorses() {
    return [];
  }
  setLooseHorses() {}
}

function game(session = new TownSession(), player = new Player(), saved?: ReturnType<QuestRuntime['save']>) {
  const pt = { player, poi: 'kanes-crossing', world: SANDBOX_WORLD, snapshots: new Map<string, PoiSnapshot>() } as unknown as Playthrough;
  let rt: QuestRuntime | null = null;
  const toasts: string[] = [];
  const world = gameQuestWorld({ playthrough: pt, purse: { dollars: 0, earned: 0 }, session: () => session as unknown as Session, quests: () => rt, toast: (t) => void toasts.push(t) });
  rt = new QuestRuntime({ catalog: [entry(BOUNTY.id)], world, packs: memoryPacks([BOUNTY]), saved });
  return { rt, session, player, pt, toasts };
}

registerQuestItems(BOUNTY, '/q/');
const chestOf = (s: TownSession) => s.containers.find((c) => c.id === 'chest-porch')!;
const kill = (n: Npc) => n.hit(n.pos, n.pos, { damage: 999, shooter: null });

describe('quest NPCs', () => {
  it('an archetype gives a hostile bandit holding its spot; the pack\'s own fields win; never respawns', () => {
    const d = questNpcDef(BOUNTY.npcs![0], BOUNTY.id);
    expect(d).toMatchObject({ id: 'boss', name: 'Black Jack', attitude: 'hostile', weapon: 'revolver', spawn: [6, 12], respawns: false, questId: 'test-bounty', territory: { at: [6, 12], radius: 16 } });
    expect(questNpcDef(BOUNTY.npcs![0], BOUNTY.id).appearance).toEqual(d.appearance); // (the same look every time)
    expect(questNpcDef(BOUNTY.npcs![2], BOUNTY.id)).toMatchObject({ attitude: 'neutral', weapon: null });
  });

  it('they are stored with their POI and come back (dead stays dead), quest id and all', () => {
    const a = new TownSession();
    const boss = a.spawnNpc(questNpcDef(BOUNTY.npcs![0], BOUNTY.id));
    a.spawnNpc(questNpcDef(BOUNTY.npcs![1], BOUNTY.id));
    kill(boss);
    const snap: PoiSnapshot = JSON.parse(JSON.stringify(capturePoi(a)));
    expect(snap.npcs).toEqual([]);
    expect(snap.extraNpcs.map((x) => [x.def.id, x.state.alive])).toEqual([['boss', false], ['goon', true]]);
    const b = new TownSession();
    applyPoi(b, snap);
    expect(b.npcs.npcs.map((n) => [n.def.id, n.def.questId, n.alive])).toEqual([['boss', 'test-bounty', false], ['goon', 'test-bounty', true]]);
  });
});

describe('quest items', () => {
  it('are registered when their pack loads, with their look, flags and PNG icon path', () => {
    const p = { ...BOUNTY, id: 'icons-test', items: [{ id: 'it-poster', name: 'Poster', description: 'x', shape: 'map' as const, icon: 'poster.png' }] };
    expect(hasItemDef('it-poster')).toBe(false);
    registerQuestItems(p, '/base/quests/');
    expect(itemDef('it-poster')).toMatchObject({ category: 'quest', size: { w: 1, h: 1 }, quest: { id: 'icons-test', shape: 'map', iconUrl: '/base/quests/icons-test/icons/poster.png', questItem: true, keepAfterQuest: false } });
    // Once registered, a pack can't define it again.
    expect(validatePack(p, { pois: new Set(['kanes-crossing']), paths: new Set(), itemExists: hasItemDef }, 'icons-test').ok).toBe(false);
  });

  it('every shape has a procedural look', () => {
    for (const shape of ['letter', 'key', 'pouch', 'box', 'badge', 'bottle', 'map', 'photo', 'star', 'ring']) {
      const def = { ...itemDef('tb-letter'), quest: { ...itemDef('tb-letter').quest!, shape } };
      const box = new THREE.Box3().setFromObject(buildItemMesh(def));
      expect(box.isEmpty(), shape).toBe(false);
    }
  });

  it('merchants never buy them', () => {
    for (const shop of Object.values(MERCHANT_SHOPS)) expect(shop.buys).not.toContain('quest');
  });
});

// ------------------------------------------------------------------ setup in the world

describe('POI-scoped setup in the world', () => {
  it('items go into the named container, onto the area and onto the body; NPCs spawn; all once', async () => {
    const { rt, session } = game();
    await rt.start(BOUNTY.id);
    expect(chestOf(session).inventory.items.filter((i) => i.defId === 'tb-letter').map((i) => i.questKey)).toEqual(['test-bounty#0/0/0']);
    const boss = session.npcs.npcs.find((n) => n.def.id === 'boss')!;
    expect(boss.def.questId).toBe('test-bounty');
    expect(boss.inventory.items.some((i) => i.defId === 'tb-poster')).toBe(true);
    expect(session.ground.map((g) => [g.item.defId, g.pos.x, g.pos.z])).toEqual([['tb-badge', 11, 7]]);
    // Leaving and coming back doesn't add anything.
    rt.emit({ type: 'poiLeft', poi: 'kanes-crossing' });
    rt.emit({ type: 'poiEntered', poi: 'kanes-crossing' });
    expect(session.npcs.npcs).toHaveLength(2);
    expect(chestOf(session).inventory.items.filter((i) => i.defId === 'tb-letter')).toHaveLength(1);
  });

  it('a picked-up item is remembered: after a reload it isn\'t placed again; killed NPCs stay dead, their loot falls where they stood', async () => {
    const { rt, session, player } = game();
    await rt.start(BOUNTY.id);
    // Take the letter from the chest.
    const letter = chestOf(session).inventory.items.find((i) => i.defId === 'tb-letter')!;
    chestOf(session).inventory.remove(letter);
    player.inventory.add(letter);
    rt.update(0);
    expect(rt.state(BOUNTY.id)!.step).toBe(1);
    expect(rt.isTaken('kanes-crossing', 'test-bounty#0/0/0')).toBe(true);
    const boss = session.npcs.npcs.find((n) => n.def.id === 'boss')!;
    kill(boss);
    rt.emit({ type: 'npcKilled', poi: 'kanes-crossing', npc: 'boss' });
    expect(rt.state(BOUNTY.id)!.counter).toBe(1);

    // The page reloads: a fresh town, the save, the quest items in the bags given back.
    const save = JSON.parse(JSON.stringify(rt.save()));
    const again = game(new TownSession(), new Player(), save);
    await again.rt.restore(save.held);
    expect(again.player.inventory.items.filter((i) => i.defId === 'tb-letter')).toHaveLength(1);
    expect(chestOf(again.session).inventory.items.some((i) => i.defId === 'tb-letter')).toBe(false); // taken: not placed again
    expect(again.session.npcs.npcs.map((n) => n.def.id)).toEqual(['goon']); // the boss is dead
    expect(again.session.ground.map((g) => [g.item.defId, g.pos.x, g.pos.z]).sort()).toEqual([['tb-badge', 11, 7], ['tb-poster', 6, 12]]);
    // And the hunt goes on where it was.
    kill(again.session.npcs.npcs[0]);
    again.rt.emit({ type: 'npcKilled', poi: 'kanes-crossing', npc: 'goon' });
    expect(again.rt.state(BOUNTY.id)!.status).toBe('completed');
    expect(again.toasts).toContain('Gang 2/2');
  });

  it('a quest that ends takes its NPCs and items away, here and on POIs that aren\'t loaded', async () => {
    const { rt, session, player, pt } = game();
    await rt.start(BOUNTY.id);
    player.inventory.add(createItem('tb-poster'));
    player.inventory.add(createItem('bandage', 2));
    // Another POI, stored as it was left: the quest's NPC there, its items in a box, on a body, on the ground.
    const ranch = new TownSession();
    const far = ranch.spawnNpc(questNpcDef(BOUNTY.npcs![2], BOUNTY.id));
    far.inventory.add(createItem('tb-poster'));
    ranch.containers[0].inventory.add(createItem('tb-letter'));
    ranch.placeItem(createItem('tb-poster'), new THREE.Vector3(1, 0, 1), null);
    ranch.placeItem(createItem('bandage'), new THREE.Vector3(2, 0, 2), null);
    pt.snapshots.set('two-spurs-ranch', JSON.parse(JSON.stringify(capturePoi(ranch))));

    rt.abandon(BOUNTY.id);
    expect(session.npcs.npcs).toEqual([]);
    expect(chestOf(session).inventory.items.some((i) => i.defId === 'tb-letter')).toBe(false);
    expect(player.inventory.items.map((i) => i.defId)).not.toContain('tb-poster');
    expect(player.inventory.items.map((i) => i.defId)).toContain('bandage');
    expect(session.ground.map((g) => g.item.defId)).toEqual(['tb-badge']); // keepAfterQuest
    const snap = pt.snapshots.get('two-spurs-ranch')!;
    expect(snap.extraNpcs).toEqual([]);
    expect(snap.containers[0].items.some((i) => i.defId === 'tb-letter')).toBe(false);
    expect(snap.items.map((g) => g.item.defId)).toEqual(['bandage']);
  });

  it('stripping a stored place leaves everything else alone', () => {
    const s = new TownSession();
    s.spawnNpc(questNpcDef({ id: 'x', poi: 'kanes-crossing', spawn: [0, 0] }, 'other-quest'));
    const snap = capturePoi(s);
    stripSnapshot(snap, BOUNTY.id);
    expect(snap.extraNpcs).toHaveLength(1);
  });
});

// ------------------------------------------------------------------ inventory rules

describe('quest items in the inventory', () => {
  const W = 342;
  const H = 192;
  function ui() {
    // (The character preview makes a canvas; nothing is drawn in these tests.)
    vi.stubGlobal('document', { createElement: () => ({ getContext: () => null, width: 0, height: 0 }) });
    const player = new Player();
    const dropped: ItemInstance[] = [];
    const toasts: string[] = [];
    const inv = new InventoryUI({ player, icons: {} as never, dropToWorld: (i) => void dropped.push(i), toast: (t) => void toasts.push(t) }, {} as never);
    const keys = { rotate: false, shift: false };
    const at = (x: number, y: number, pressed = false, released = false) => inv.update(0.016, { x, y, pressed, released, moved: true }, keys, W, H);
    /** The screen position of an item's cell in a grid on screen. */
    const cellOf = (grid: unknown, item: ItemInstance) => {
      const z = (inv as unknown as { layout: { zones: { kind: string; grid?: unknown; x: number; y: number; cell: number }[] } }).layout.zones.find((q) => q.kind === 'grid' && q.grid === grid)!;
      const p = (grid as { placements: { item: ItemInstance; x: number; y: number }[] }).placements.find((q) => q.item === item)!;
      return { x: z.x + p.x * z.cell + 3, y: z.y + p.y * z.cell + 3 };
    };
    const drag = (from: { x: number; y: number }, to: { x: number; y: number }) => {
      at(from.x, from.y);
      at(from.x, from.y, true);
      at(to.x, to.y);
      at(to.x, to.y, false, true);
    };
    return { inv, player, dropped, toasts, at, cellOf, drag };
  }

  it('dropping one asks first; yes drops it, no keeps it', () => {
    const { inv, player, dropped, at, cellOf, drag } = ui();
    const letter = createItem('tb-letter');
    player.inventory.placeAnywhere(letter);
    inv.openInventory();
    at(0, 0);
    drag(cellOf(player.inventory, letter), { x: 2, y: 2 });
    const confirm = (inv as unknown as { confirm: { items: { label: string; action(): void }[] } | null }).confirm!;
    expect(confirm.items.map((i) => i.label)).toEqual(['DROP', 'KEEP']);
    expect(player.inventory.find(letter)).toBeTruthy(); // not yet
    confirm.items[0].action();
    expect(dropped).toEqual([letter]);
    expect(player.inventory.find(letter)).toBeFalsy();
    // An ordinary item just drops.
    const bandage = createItem('bandage');
    player.inventory.placeAnywhere(bandage);
    at(0, 0);
    drag(cellOf(player.inventory, bandage), { x: 2, y: 2 });
    expect(dropped).toEqual([letter, bandage]);
  });

  it("can't be stashed in a container or sold", () => {
    const { inv, player, toasts, at, cellOf, drag } = ui();
    const letter = createItem('tb-letter');
    player.inventory.placeAnywhere(letter);
    const box = new TownSession().containers[0];
    box.ensureLoot();
    for (const i of box.inventory.items) box.inventory.remove(i);
    inv.openLoot(box);
    at(0, 0);
    const z = (inv as unknown as { layout: { zones: { kind: string; grid?: unknown; x: number; y: number }[] } }).layout.zones.find((q) => q.kind === 'grid' && q.grid === box.inventory)!;
    drag(cellOf(player.inventory, letter), { x: z.x + 4, y: z.y + 4 });
    expect(box.inventory.items).toEqual([]);
    expect(toasts.at(-1)).toBe('Quest items stay in your bags');

    const shop = MERCHANT_SHOPS.gunsmith;
    const purse = { dollars: 0, earned: 0 };
    inv.openShop({ economy: new Economy(shop.stock, purse), wave: () => Infinity, title: shop.title, merchantName: 'Wade', buys: () => true });
    at(0, 0);
    const sell = (inv as unknown as { layout: { zones: { kind: string; x: number; y: number }[] } }).layout.zones.find((q) => q.kind === 'sell')!;
    drag(cellOf(player.inventory, letter), { x: sell.x + 5, y: sell.y + 5 });
    expect(player.inventory.find(letter)).toBeTruthy();
    expect(purse.dollars).toBe(0);
    expect(toasts.at(-1)).toBe("Quest items can't be sold");
  });
});

vi.mock('../audio/uiSound', () => ({ uiSound: () => {} }));
