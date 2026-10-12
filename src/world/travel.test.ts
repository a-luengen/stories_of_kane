import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NavGrid } from '../ai/NavGrid';
import { CONFIG } from '../config';
import { horseTravels, inCombat, insideExit, Playthrough, type PoiSession } from '../core/Playthrough';
import { NPCS } from '../data/npcs';
import { pathThrough, poiById, SANDBOX_WORLD, validateWorld, type PoiDef, type WorldDef } from '../data/world';
import { Horse } from '../entities/Horse';
import type { Npc } from '../entities/Npc';
import { NpcSystem } from '../entities/NpcSystem';
import { Player } from '../entities/Player';
import { TargetSystem } from '../entities/Targets';
import { WEAPONS } from '../data/weapons';
import { createItem, type ItemInstance } from '../items/ItemInstance';
import type { LootContainer } from './Container';
import { Discovery } from './Discovery';
import { buildSandboxMap } from './maps/sandbox';
import { POI_MAPS, PoiMapRegistry, type PoiMap } from './poiMaps';
import { applyPoi, capturePoi, type HorseState, type PoiRuntime } from './poiState';

const exitOf = (poi: string, id: string) => poiById(SANDBOX_WORLD, poi).exits.find((e) => e.id === id)!;

describe('world data', () => {
  it('the sandbox world is valid: ids, links, reachability, builders', () => {
    expect(validateWorld(SANDBOX_WORLD, Object.keys(POI_MAPS))).toEqual([]);
    expect(SANDBOX_WORLD.pois.map((p) => p.name)).toEqual(["Kane's Crossing", 'Two Spurs Ranch', 'Rattlesnake Gulch']);
  });

  it('catches broken links, unreachable places, duplicates and missing builders', () => {
    const w: WorldDef = structuredClone(SANDBOX_WORLD);
    w.paths[0].to.exit = 'nowhere';
    w.pois.push({ ...w.pois[0], id: 'island', exits: [] });
    w.pois.push({ ...w.pois[1] });
    const problems = validateWorld(w, ['kanes-crossing']).join('\n');
    expect(problems).toMatch(/has no exit "nowhere"/);
    expect(problems).toMatch(/"island" can't be reached/);
    expect(problems).toMatch(/duplicate POI id "two-spurs-ranch"/);
    expect(problems).toMatch(/no map builder "two-spurs-ranch"/);
  });

  it('each exit leads along a path to an exit of another place', () => {
    expect(pathThrough(SANDBOX_WORLD, 'kanes-crossing', 'north')?.to).toEqual({ poi: 'two-spurs-ranch', exit: 'south' });
    expect(pathThrough(SANDBOX_WORLD, 'two-spurs-ranch', 'south')?.to).toEqual({ poi: 'kanes-crossing', exit: 'north' });
    expect(pathThrough(SANDBOX_WORLD, 'rattlesnake-gulch', 'north')?.to).toEqual({ poi: 'two-spurs-ranch', exit: 'east' });
  });
});

describe('exits', () => {
  const east = exitOf('kanes-crossing', 'east');

  it('the prompt applies inside the zone only', () => {
    expect(insideExit({ x: 47, z: 0 }, east)).toBe(true);
    expect(insideExit({ x: 45, z: 3 }, east)).toBe(true);
    expect(insideExit({ x: 43, z: 0 }, east)).toBe(false);
    expect(insideExit({ x: 47, z: 4 }, east)).toBe(false);
  });

  it('no travelling while someone is shooting at you', () => {
    expect(inCombat([{ alive: true, engaging: false }])).toBe(false);
    expect(inCombat([{ alive: false, engaging: true }])).toBe(false);
    expect(inCombat([{ alive: true, engaging: false }, { alive: true, engaging: true }])).toBe(true);
  });

  it('the horse comes along when ridden or near the exit', () => {
    expect(horseTravels(true, { x: -40, z: 0 }, east)).toBe(true);
    expect(horseTravels(false, { x: 44, z: 2 }, east)).toBe(true);
    expect(horseTravels(false, { x: 47 - CONFIG.world.horseFollowRadius - 1, z: 0 }, east)).toBe(false);
  });

  it('the town map has a trail sign at each exit, and the trails are walkable', () => {
    const exits = poiById(SANDBOX_WORLD, 'kanes-crossing').exits;
    const map = buildSandboxMap(new TargetSystem(), exits);
    expect(map.exitSigns.map((s) => s.exit)).toEqual(['east', 'north']);
    const nav = new NavGrid(map.collision, map.half);
    for (const e of exits) {
      expect(nav.isFree(e.arrive[0], e.arrive[1]), `${e.id} arrival`).toBe(true);
      expect(nav.findPath(map.playerSpawn.x, map.playerSpawn.z, e.at[0], e.at[1]), `${e.id} reachable`).not.toBeNull();
    }
  });
});

describe('lazy POI maps', () => {
  it('a POI map is only loaded the first time it is needed, then reused', async () => {
    let loads = 0;
    const map: PoiMap = { build: () => buildSandboxMap(new TargetSystem()), npcs: [] };
    const reg = new PoiMapRegistry({ a: async () => (loads++, map), b: async () => (loads++, map) });
    expect(reg.isLoaded('a')).toBe(false);
    expect(loads).toBe(0);
    await reg.load('a');
    await reg.load('a');
    expect(loads).toBe(1);
    expect(reg.isLoaded('b')).toBe(false);
    await expect(reg.load('missing')).rejects.toThrow(/No map/);
  });
});

// ------------------------------------------------------------------------------------------------

/** The town's containers and people, without a renderer (what a Session would hold). */
class FakeRuntime implements PoiRuntime {
  readonly containers: LootContainer[];
  readonly npcList: Npc[];
  items: { item: ItemInstance; pos: THREE.Vector3; npc: Npc | null }[] = [];
  horses: HorseState[] = [];
  constructor() {
    const wd = buildSandboxMap(new TargetSystem(), poiById(SANDBOX_WORLD, 'kanes-crossing').exits);
    this.containers = wd.containers;
    this.npcList = new NpcSystem(NPCS, wd.collision, new NavGrid(wd.collision, wd.half), wd.occluders).npcs;
  }
  groundItems() {
    return this.items;
  }
  placeItem(item: ItemInstance, pos: THREE.Vector3, npc: Npc | null) {
    this.items.push({ item, pos, npc });
  }
  clearGroundItems() {
    this.items = [];
  }
  looseHorses() {
    return this.horses;
  }
  setLooseHorses(h: readonly HorseState[]) {
    this.horses = [...h];
  }
}

describe('places keep their state', () => {
  it('looted and broken containers, dead NPCs and dropped items come back as left', () => {
    const before = new FakeRuntime();
    const chest = before.containers.find((c) => c.kind === 'chest')!;
    chest.interact();
    const firstItem = chest.inventory.items[0];
    chest.inventory.remove(firstItem); // looted one thing
    const crate = before.containers.find((c) => c.kind === 'crate')!;
    for (let i = 0; i < 4; i++) crate.damage(WEAPONS.revolver.damage); // shot to pieces
    const gunman = before.npcList[0];
    gunman.hit(gunman.pos, gunman.pos, { damage: 999, shooter: null });
    before.placeItem(createItem('revolver', 1, 3), new THREE.Vector3(1, 0, 2), gunman);
    before.placeItem(createItem('bandage', 2), new THREE.Vector3(-3, 0, 4), null);

    // As plain data (JSON-safe), then onto a freshly built town.
    const snap = JSON.parse(JSON.stringify(capturePoi(before)));
    const after = new FakeRuntime();
    applyPoi(after, snap);

    const chest2 = after.containers[before.containers.indexOf(chest)];
    expect(chest2.opened && chest2.generated).toBe(true);
    expect(chest2.inventory.items.map((i) => i.defId)).toEqual(chest.inventory.items.map((i) => i.defId));
    const crate2 = after.containers[before.containers.indexOf(crate)];
    expect(crate2.destroyed).toBe(true);
    expect(crate2.canInteract()).toBe(false);
    const gunman2 = after.npcList.find((n) => n.def.id === gunman.def.id)!;
    expect(gunman2.alive).toBe(false);
    expect(gunman2.equipment.weapons[0]).toBeNull(); // dropped it as he died
    expect(gunman2.pos.distanceTo(gunman.pos)).toBeLessThan(1e-6);
    expect(after.items.map((g) => [g.item.defId, g.item.quantity, g.item.loadedRounds ?? null, g.pos.x, g.pos.z, g.npc?.def.id ?? null])).toEqual([
      ['revolver', 1, 3, 1, 2, gunman.def.id],
      ['bandage', 2, null, -3, 4, null],
    ]);
    // The rest of the town is untouched.
    expect(after.npcList.filter((n) => n.alive)).toHaveLength(before.npcList.length - 1);
  });
});

// ------------------------------------------------------------------------------------------------

/** An empty place (no containers or people). */
class FakeRuntimeLite implements PoiRuntime {
  containers: LootContainer[] = [];
  npcList: Npc[] = [];
  items: { item: ItemInstance; pos: THREE.Vector3; npc: Npc | null }[] = [];
  groundItems() {
    return this.items;
  }
  placeItem(item: ItemInstance, pos: THREE.Vector3, npc: Npc | null) {
    this.items.push({ item, pos, npc });
  }
  clearGroundItems() {
    this.items = [];
  }
  looseHorses(): HorseState[] {
    return [];
  }
  setLooseHorses() {}
}

/** A stand-in for a running map: enough for the playthrough to move the player and horse around. */
class FakeSession extends FakeRuntimeLite implements PoiSession {
  readonly horses: Horse[] = [];
  riding: Horse | null = null;
  disposed = false;
  readonly map: PoiSession['map'];
  constructor(
    readonly poi: PoiDef,
    readonly player: Player,
  ) {
    super();
    const first = poi.exits[0];
    this.map = {
      playerSpawn: new THREE.Vector3(first.arrive[0], 0, first.arrive[1]),
      horseSpawn: poi.id === 'kanes-crossing' ? new THREE.Vector3(-6.5, 0, 2.6) : null,
      horseYaw: 0,
    };
    player.setPosition(this.map.playerSpawn);
  }
  addHorse(h: Horse, at: THREE.Vector3, yaw: number) {
    h.place(at, yaw);
    this.horses.push(h);
    return h;
  }
  detachHorse(h: Horse) {
    if (this.riding === h) {
      this.riding = null;
      this.player.mounted = false;
    }
    this.horses.splice(this.horses.indexOf(h), 1);
  }
  mount(h: Horse) {
    this.riding = h;
    this.player.mounted = true;
    this.player.setPosition(h.pos);
  }
  snapCamera() {}
  looseHorses(): HorseState[] {
    return this.horses.map((h) => ({ pos: [h.pos.x, h.pos.z], yaw: h.heading }));
  }
  dispose() {
    this.disposed = true;
  }
}

function playthrough() {
  const sessions: FakeSession[] = [];
  const loaded: string[] = [];
  const maps: Record<string, () => Promise<PoiMap>> = {};
  for (const p of SANDBOX_WORLD.pois) maps[p.id] = async () => (loaded.push(p.id), { build: () => null as never, npcs: [] });
  const pt = new Playthrough(SANDBOX_WORLD, new PoiMapRegistry(maps), async (poi, _map, player) => {
    const s = new FakeSession(poi, player);
    sessions.push(s);
    return s;
  }, { purse: { dollars: 150, earned: 0 } });
  return { pt, sessions, loaded };
}

describe('travel', () => {
  it('round trip: same bags, money, health and dual-wield slots; arrival at the matching exit', async () => {
    const { pt, sessions, loaded } = playthrough();
    await pt.start();
    expect(loaded).toEqual(['kanes-crossing']); // the ranch isn't loaded until you go there
    const p = pt.player;
    p.equipment.put('o0', createItem('derringer', 1, 1), null);
    p.inventory.placeAnywhere(createItem('bandage', 2));
    p.hp = 63;
    pt.purse.dollars = 222;
    const bag = p.inventory.items.map((i) => `${i.defId}x${i.quantity}`);

    const r = await pt.travel('north');
    expect(r.ok).toBe(true);
    expect(pt.poi).toBe('two-spurs-ranch');
    expect(loaded).toEqual(['kanes-crossing', 'two-spurs-ranch']);
    expect(sessions[0].disposed).toBe(true);
    const south = exitOf('two-spurs-ranch', 'south');
    expect([p.pos.x, p.pos.z]).toEqual(south.arrive);
    expect(p.moveYaw).toBeCloseTo(south.facing);

    await pt.travel('south');
    expect(pt.poi).toBe('kanes-crossing');
    expect(pt.player).toBe(p);
    expect(p.hp).toBe(63);
    expect(pt.purse.dollars).toBe(222);
    expect(p.inventory.items.map((i) => `${i.defId}x${i.quantity}`)).toEqual(bag);
    expect(p.equipment.offHands[0]?.defId).toBe('derringer');
    expect(p.weapon!.dual).toBe(true);
    expect([p.pos.x, p.pos.z]).toEqual(exitOf('kanes-crossing', 'north').arrive);
  });

  it('the horse: ridden or near comes along; left far away it waits where it was', async () => {
    const { pt, sessions } = playthrough();
    await pt.start();
    const town = sessions[0];
    const h = pt.horse;
    expect(town.horses).toContain(h); // waiting at its spawn

    // Left behind in town (far from the exit).
    await pt.travel('north');
    expect(sessions[1].horses).toHaveLength(0);
    expect(pt.horseAt?.poi).toBe('kanes-crossing');
    // Back in town: there it is, where it was left.
    await pt.travel('south');
    expect(sessions[2].horses).toContain(h);
    expect([h.pos.x, h.pos.z]).toEqual([-6.5, 2.6]);

    // Standing near the exit: it comes, arriving beside you.
    const north = exitOf('kanes-crossing', 'north');
    h.place(new THREE.Vector3(north.at[0] + 2, 0, north.at[1] + 2), 0);
    await pt.travel('north');
    expect(sessions[3].horses).toContain(h);
    expect(h.pos.distanceTo(pt.player.pos)).toBeLessThan(2.5);
    expect(pt.horseAt).toBeNull();

    // Ridden: you arrive in the saddle.
    sessions[3].mount(h);
    await pt.travel('south');
    expect(sessions[4].riding).toBe(h);
    expect(pt.player.mounted).toBe(true);
  });

  it("can't leave during a fight, or twice at once", async () => {
    const { pt } = playthrough();
    const s = (await pt.start()) as FakeSession;
    (s as unknown as { npcList: unknown[] }).npcList = [{ alive: true, engaging: true }];
    expect(pt.refusal('north')).toBe('combat');
    expect((await pt.travel('north')).ok).toBe(false);
    expect(pt.poi).toBe('kanes-crossing');
    (s as unknown as { npcList: unknown[] }).npcList = [];
    expect(pt.refusal('nowhere')).toBe('noPath');
    const first = pt.travel('north');
    expect(pt.refusal('north')).toBe('busy');
    await first;
  });

  it('arriving reveals the place; walking into an exit tells you of the one behind it', async () => {
    const { pt } = playthrough();
    await pt.start();
    const d = pt.discovery;
    expect(d.poi('rattlesnake-gulch')).toBe('undiscovered');
    pt.exitEntered('east');
    expect(d.poi('rattlesnake-gulch')).toBe('hidden');
    expect(d.path('town-gulch')).toBe('hidden');
    await pt.travel('north');
    expect(d.poi('two-spurs-ranch')).toBe('visible');
    expect(d.path('town-ranch')).toBe('visible');
    // You'd heard of the gulch: arriving at the ranch shows its trail there too (dashed: not visited).
    expect(d.path('ranch-gulch')).toBe('hidden');
  });
});

describe("riding off on someone else's horse", () => {
  it('it becomes your horse; your old one stays behind as a horse of that place', async () => {
    const { pt, sessions } = playthrough();
    await pt.start();
    const mine = pt.horse;
    const ranchHorse = sessions[0].addHorse(new Horse(), new THREE.Vector3(0, 0, -44), 0);
    sessions[0].mount(ranchHorse);
    await pt.travel('north');
    expect(pt.horse).toBe(ranchHorse);
    expect(sessions[1].riding).toBe(ranchHorse);
    // Back in town: the old horse is still there (as a loose horse in the saved town).
    const town = pt.snapshots.get('kanes-crossing')!;
    expect(town.horses.some((h) => Math.hypot(h.pos[0] - mine.pos.x, h.pos[1] - mine.pos.z) < 0.01)).toBe(true);
  });
});

describe('fast travel', () => {
  it('off: refused; on: only to visited places, over known trails, arriving at the matching exit', async () => {
    const { pt, loaded } = playthrough();
    await pt.start();
    expect((await pt.fastTravel('two-spurs-ranch', false)).ok).toBe(false);
    expect(pt.fastRefusal('two-spurs-ranch', false)).toBe('disabled');
    expect(pt.fastRefusal('two-spurs-ranch', true)).toBe('notVisited');
    await pt.travel('north'); // now visited
    await pt.travel('south');
    expect(pt.fastRefusal('kanes-crossing', true)).toBe('here');
    expect(pt.fastRefusal('rattlesnake-gulch', true)).toBe('notVisited');
    const r = await pt.fastTravel('two-spurs-ranch', true);
    expect(r.ok).toBe(true);
    expect(pt.poi).toBe('two-spurs-ranch');
    expect([pt.player.pos.x, pt.player.pos.z]).toEqual(exitOf('two-spurs-ranch', 'south').arrive);
    expect(loaded.filter((x) => x === 'two-spurs-ranch')).toHaveLength(1); // loaded once, reused
  });
});

describe('discovery', () => {
  it('learning of a place shows it as "?" with its trails to visited places', () => {
    const d = new Discovery(SANDBOX_WORLD);
    expect(d.learn('rattlesnake-gulch')).toEqual([
      { kind: 'poi', id: 'rattlesnake-gulch', state: 'hidden' },
      { kind: 'path', id: 'town-gulch', state: 'hidden' },
    ]);
    // The ranch hasn't been visited: its canyon trail stays unknown.
    expect(d.path('ranch-gulch')).toBe('undiscovered');
  });
});

describe('world debug (F7)', () => {
  it('teleport: within a place you are moved to the exit; elsewhere the place loads, whatever the fight or trails', async () => {
    const { pt, sessions } = playthrough();
    await pt.start();
    expect((await pt.teleport('kanes-crossing', 'east')).ok).toBe(true);
    expect(sessions).toHaveLength(1);
    expect([pt.player.pos.x, pt.player.pos.z]).toEqual(exitOf('kanes-crossing', 'east').arrive);
    // The gulch is undiscovered and no trail is known: no matter.
    expect((await pt.teleport('rattlesnake-gulch', 'north')).ok).toBe(true);
    expect(pt.poi).toBe('rattlesnake-gulch');
    expect([pt.player.pos.x, pt.player.pos.z]).toEqual(exitOf('rattlesnake-gulch', 'north').arrive);
    expect(pt.discovery.poi('rattlesnake-gulch')).toBe('visible');
  });

  it('reveal all, then reset: back to the start, where you are still visited; both saved', async () => {
    const { pt } = playthrough();
    const saved: unknown[] = [];
    pt.onReveal = (_r, all) => saved.push(all);
    await pt.start();
    await pt.teleport('two-spurs-ranch', 'south');
    pt.revealAll();
    expect(pt.discovery.poi('rattlesnake-gulch')).toBe('visible');
    expect(pt.discovery.path('ranch-gulch')).toBe('visible');
    pt.resetDiscovery();
    expect(pt.discovery.poi('rattlesnake-gulch')).toBe('undiscovered');
    expect(pt.discovery.poi('two-spurs-ranch')).toBe('visible'); // you're here
    expect(pt.discovery.path('ranch-gulch')).toBe('undiscovered');
    expect(saved.at(-1)).toEqual(pt.discovery.save());
  });
});
