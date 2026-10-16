import { describe, expect, it } from 'vitest';
import { NavGrid } from '../ai/NavGrid';
import { NPCS } from '../data/npcs';
import { MERCHANT_SHOPS } from '../data/shop';
import { poiById, SANDBOX_WORLD, STORY_WORLD } from '../data/world';
import { TargetSystem } from '../entities/Targets';
import { buildSandboxMap, SOUTH_STREET, TOWN_ANIMALS } from './maps/sandbox';

const town = poiById(SANDBOX_WORLD, 'kanes-crossing');
const map = buildSandboxMap(new TargetSystem(), town.exits);
const nav = new NavGrid(map.collision, map.half);
const reach = (x: number, z: number) => nav.findPath(map.playerSpawn.x, map.playerSpawn.z, x, z);

describe('the bigger town', () => {
  it('is 200 × 200, its exits at the edge (in the story too), all reachable from the start', () => {
    expect(map.half).toBe(100);
    for (const e of town.exits) {
      expect(Math.max(Math.abs(e.at[0]), Math.abs(e.at[1])), e.id).toBeGreaterThan(90);
      expect(reach(e.arrive[0], e.arrive[1]), e.id).not.toBeNull();
    }
    expect(poiById(STORY_WORLD, 'kanes-crossing').exits.map((e) => e.at)).toEqual([[97, 0]]);
  });

  it('the south quarter: everyone stands on open ground you can walk to', () => {
    for (const n of NPCS.filter((d) => ['butcher', 'tanner', 'sheriff', 'farmer', 'drifter'].includes(d.id))) {
      // (Those leaning on a porch post stand against it: check the spot just in front.)
      const [x, z] = n.routine.kind === 'lean' ? [n.spawn[0], n.spawn[1] + 0.8] : n.spawn;
      expect(nav.isFree(x, z), n.id).toBe(true);
      expect(reach(x, z), n.id).not.toBeNull();
    }
    const south = NPCS.filter((n) => n.spawn[1] > SOUTH_STREET - 10).map((n) => n.id);
    expect(south.sort()).toEqual(['butcher', 'drifter', 'farmer', 'sheriff', 'tanner']);
    for (const a of TOWN_ANIMALS) expect(nav.isFree(a.at[0], a.at[1]), `${a.species} at ${a.at}`).toBe(true);
  });

  it('the butcher and the tanner keep shop; the tanner knows where the bison are', () => {
    for (const id of ['butcher', 'tanner']) {
      const def = NPCS.find((n) => n.id === id)!;
      expect(MERCHANT_SHOPS[def.shop!], id).toBeDefined();
    }
    expect(NPCS.find((n) => n.id === 'tanner')!.hints![0].poi).toBe('desert-plains');
  });
});
