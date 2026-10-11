import { describe, expect, it } from 'vitest';
import { NavGrid } from '../../ai/NavGrid';
import { TargetSystem } from '../../entities/Targets';
import { buildOutpostMap, OUTPOST_HORSE_STOP, OUTPOST_MERCHANT, OUTPOST_SPAWNS } from './waveOutpost';

describe('wave outpost map', () => {
  const map = buildOutpostMap(new TargetSystem());

  it('every pass connects to the square for people and for horses', () => {
    for (const radius of [0.42, 0.85]) {
      const nav = new NavGrid(map.collision, map.half, 0.5, radius);
      for (const s of OUTPOST_SPAWNS) {
        expect(nav.isFree(s.x, s.z)).toBe(true);
        const path = nav.findPath(s.x, s.z, map.playerSpawn.x, map.playerSpawn.z);
        expect(path, `from ${s.x},${s.z} (r=${radius})`).not.toBeNull();
      }
      expect(nav.findPath(OUTPOST_SPAWNS[4].x, OUTPOST_SPAWNS[4].z, OUTPOST_HORSE_STOP.x, OUTPOST_HORSE_STOP.z)).not.toBeNull();
    }
  });

  it('player spawn, merchant spot and horse stop are open ground; there is cover', () => {
    const nav = new NavGrid(map.collision, map.half);
    for (const p of [map.playerSpawn, OUTPOST_MERCHANT.stand, OUTPOST_HORSE_STOP]) expect(nav.isFree(p.x, p.z)).toBe(true);
    expect(map.cover.length).toBeGreaterThan(15);
    expect(map.occluders.length).toBe(2);
  });
});
