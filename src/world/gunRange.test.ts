import { describe, expect, it } from 'vitest';
import { NavGrid } from '../ai/NavGrid';
import { MERCHANT_SHOPS } from '../data/shop';
import { pathThrough, poiById, SANDBOX_WORLD, STORY_WORLD, validateWorld } from '../data/world';
import { WEAPONS } from '../data/weapons';
import { TargetSystem } from '../entities/Targets';
import { Equipment } from '../items/Equipment';
import { itemDef, weaponOf } from '../items/ItemDef';
import type { ItemInstance } from '../items/ItemInstance';
import { buildRangeMap, FIRING_LINE, RANGE_CHESTS, RANGE_NPCS } from './maps/gunRange';
import { POI_MAPS } from './poiMaps';
import { applyPoi, capturePoi } from './poiState';
import type { NpcDef } from '../data/types';
import { Npc } from '../entities/Npc';

const range = poiById(SANDBOX_WORLD, 'gun-range');
const build = () => buildRangeMap(new TargetSystem(), range.exits);
const map = build();
const nav = new NavGrid(map.collision, map.half);
const north = range.exits[0];
const reach = (x: number, z: number) => nav.findPath(north.arrive[0], north.arrive[1], x, z);
const opened = (c: (typeof map.containers)[number]) => {
  c.ensureLoot();
  return c.inventory.items;
};

describe('the gun range', () => {
  it('lies south of town, down the south trail (sandbox only), and its map exists', () => {
    expect(validateWorld(SANDBOX_WORLD, Object.keys(POI_MAPS))).toEqual([]);
    expect(pathThrough(SANDBOX_WORLD, 'kanes-crossing', 'south')!.to).toEqual({ poi: 'gun-range', exit: 'north' });
    expect(range.pos[1]).toBeGreaterThan(poiById(SANDBOX_WORLD, 'kanes-crossing').pos[1]);
    expect(STORY_WORLD.pois.some((p) => p.id === 'gun-range')).toBe(false);
  });

  it('from the trail you walk to the firing line, every chest and the range master', () => {
    expect(reach(FIRING_LINE + 3, 0)).not.toBeNull();
    for (const c of map.containers) expect(reach(c.position.x + 1.4, c.position.z), c.name).not.toBeNull();
    const [x, z] = RANGE_NPCS[0].spawn;
    expect(nav.isFree(x, z)).toBe(true);
    expect(reach(x, z)).not.toBeNull();
    expect(MERCHANT_SHOPS[RANGE_NPCS[0].shop!].stock.map((e) => e.item).sort()).toEqual(['ammo_magnum', 'ammo_revolver', 'ammo_rifle', 'ammo_shells']);
  });

  it('a chest for every gun in the game, named for it: two of each you can pair, rounds for many reloads', () => {
    const guns = Object.keys(WEAPONS).sort();
    expect(RANGE_CHESTS.map((c) => c.gun).sort()).toEqual(guns);
    for (const c of map.containers) {
      const items = opened(c);
      const gunItems = items.filter((i) => weaponOf(itemDef(i.defId)));
      const w = weaponOf(itemDef(gunItems[0].defId))!;
      expect(c.name).toBe(`${itemDef(gunItems[0].defId).name} Chest`);
      expect(gunItems.length, c.name).toBe(w.dualWieldable ? 2 : 1);
      expect(gunItems.every((g) => g.loadedRounds === w.magazine), c.name).toBe(true);
      const rounds = items.filter((i) => itemDef(i.defId).ammoType === w.ammoType).reduce((n, i) => n + i.quantity, 0);
      expect(rounds, c.name).toBeGreaterThanOrEqual(w.magazine * 10 * gunItems.length);
    }
  });

  it('enough to try dual wielding: pairs of each, and mixed pairs across chests', () => {
    const all = map.containers.flatMap((c) => opened(c));
    const first = (id: string) => all.find((i) => i.defId === id)!;
    const pair = (a: ItemInstance, b: ItemInstance) => {
      const eq = new Equipment();
      eq.put('w0', a, null);
      return eq.accepts('o0', b) && eq.put('o0', b, null);
    };
    for (const id of ['revolver', 'nickel_revolver', 'derringer', 'sawed_off']) {
      const two = all.filter((i) => i.defId === id);
      expect(pair(two[0], two[1]), id).toBe(true);
    }
    expect(pair(all.filter((i) => i.defId === 'nickel_revolver')[1], all.filter((i) => i.defId === 'sawed_off')[1])).toBe(true);
    expect(pair(first('magnum'), all.filter((i) => i.defId === 'revolver')[1])).toBe(false);
  });

  it('the chests are full again every time you come back', () => {
    const before = build();
    for (const c of before.containers) {
      c.interact();
      for (const i of [...c.inventory.items]) c.inventory.remove(i);
    }
    const rt = {
      containers: before.containers,
      npcList: [] as Npc[],
      groundItems: () => [],
      placeItem: () => {},
      clearGroundItems: () => {},
      looseHorses: () => [],
      setLooseHorses: () => {},
      spawnNpc: (d: NpcDef) => new Npc(d),
    };
    const snap = JSON.parse(JSON.stringify(capturePoi(rt)));
    const after = build();
    applyPoi({ ...rt, containers: after.containers }, snap);
    for (const c of after.containers) expect(opened(c).length, c.name).toBeGreaterThan(0);
  });
});
