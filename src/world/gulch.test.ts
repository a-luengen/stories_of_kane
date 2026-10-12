import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NavGrid } from '../ai/NavGrid';
import { poiById, SANDBOX_WORLD } from '../data/world';
import { NpcSystem } from '../entities/NpcSystem';
import { TargetSystem } from '../entities/Targets';
import { buildGulchMap, CAMP, GULCH_NPCS } from './maps/rattlesnakeGulch';
import { POI_MAPS } from './poiMaps';

const gulch = poiById(SANDBOX_WORLD, 'rattlesnake-gulch');
const map = buildGulchMap(new TargetSystem(), gulch.exits);
const nav = new NavGrid(map.collision, map.half);
const west = gulch.exits.find((e) => e.id === 'west')!;
const reach = (x: number, z: number) => nav.findPath(west.arrive[0], west.arrive[1], x, z);
const DT = 1 / 60;

function camp(playerAt: [number, number]) {
  const sys = new NpcSystem(GULCH_NPCS, map.collision, nav, []);
  const player = { pos: new THREE.Vector3(playerAt[0], 0, playerAt[1]), mounted: false, dead: false };
  const run = (seconds: number) => {
    for (let t = 0; t < seconds; t += DT) sys.update(DT, player, [], () => {});
  };
  return { sys, player, run };
}

describe('Rattlesnake Gulch', () => {
  it('both exits and the camp are reachable from the west trail, through the narrow passes', () => {
    for (const e of gulch.exits) {
      expect(nav.isFree(e.arrive[0], e.arrive[1]), `${e.id} arrival`).toBe(true);
      expect(reach(e.at[0], e.at[1]), e.id).not.toBeNull();
    }
    expect(reach(CAMP[0] - 3, CAMP[1]), 'camp').not.toBeNull();
    // The canyon walls hold: nothing beyond them can be reached.
    expect(reach(0, -30)).toBeNull();
    expect(reach(-30, 12)).toBeNull();
  });

  it('has the camp loot (weapon crate, ammo, a chest), a campfire burning and its outlaws registered', async () => {
    const kinds = map.containers.map((c) => c.kind);
    expect(kinds).toContain('weaponCrate');
    expect(kinds.filter((k) => k === 'ammoBox')).toHaveLength(2);
    expect(kinds).toContain('chest');
    expect(map.update).toBeTypeOf('function');
    const m = await POI_MAPS['rattlesnake-gulch']();
    expect(m.npcs).toBe(GULCH_NPCS);
  });

  it('the outlaws stand on open ground, hold the camp and do not respawn', () => {
    expect(GULCH_NPCS.length).toBeGreaterThanOrEqual(3);
    for (const n of GULCH_NPCS) {
      expect(nav.isFree(n.spawn[0], n.spawn[1]), n.id).toBe(true);
      expect(n.attitude).toBe('hostile');
      expect(n.respawns).toBe(false);
      expect(n.territory?.at).toEqual(CAMP);
    }
  });

  it('they leave you be at the far end of the canyon', () => {
    const { sys, run } = camp(west.arrive);
    run(5);
    expect(sys.npcs.every((n) => n.mode === 'routine')).toBe(true);
  });

  it('walk into the camp and the whole camp turns on you', () => {
    const { sys, run } = camp([CAMP[0] - 9, CAMP[1] + 1]);
    run(3);
    expect(sys.npcs.every((n) => n.mode === 'hostile')).toBe(true);
  });

  it('a shot landing near one of them alarms them all', () => {
    const { sys, run } = camp(west.arrive);
    const n = sys.npcs[0];
    sys.onPlayerShotLanded(n.pos.clone().add(new THREE.Vector3(1, 0, 0)), null);
    run(0.5);
    expect(sys.npcs.every((m) => m.mode === 'hostile')).toBe(true);
  });
});
