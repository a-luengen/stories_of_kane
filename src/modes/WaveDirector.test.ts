import { describe, expect, it } from 'vitest';
import { CONFIG } from '../config';
import { WAVES } from '../data/waves';
import { apportion, composeWave, waveClearBonus, WaveDirector, waveSpec, type DirectorEvent } from './WaveDirector';

const seeded = (seed = 1) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

/** Run the director until `pred` is met (or `max` seconds), with `alive` given per step. */
function run(d: WaveDirector, seconds: number, alive: () => number, dt = 0.05): DirectorEvent[] {
  const out: DirectorEvent[] = [];
  for (let t = 0; t < seconds; t += dt) out.push(...d.update(dt, alive()));
  return out;
}

describe('wave composition', () => {
  it('follows the table: count and archetype mix', () => {
    const c = composeWave(3, seeded());
    expect(c.enemies).toHaveLength(WAVES[2].count);
    const n = (id: string) => c.enemies.filter((e) => e.archetype === id).length;
    expect([n('gunslinger'), n('rifleman'), n('shotgunner')]).toEqual([3, 1, 1]);
    expect(apportion(7, { gunslinger: 3, rifleman: 2, shotgunner: 2 })).toEqual({ gunslinger: 3, rifleman: 2, shotgunner: 2 });
    expect(Object.values(apportion(10, { gunslinger: 1, rifleman: 1, shotgunner: 1 })).reduce((a, b) => a + b)).toBe(10);
  });

  it('scales beyond the table with the formula', () => {
    const last = WAVES[WAVES.length - 1];
    const next = waveSpec(WAVES.length + 4);
    expect(next.count).toBeGreaterThan(last.count);
    expect(next.hp).toBeGreaterThan(last.hp);
    expect(next.accuracy).toBeLessThan(last.accuracy);
    expect(waveSpec(500).count).toBeLessThanOrEqual(30);
    expect(composeWave(WAVES.length + 4).enemies).toHaveLength(next.count);
  });

  it('mounted share starts at the configured wave and never puts riflemen on horses', () => {
    for (let w = 1; w < CONFIG.wave.mountedEnemiesFromWave; w++) expect(composeWave(w).enemies.some((e) => e.mounted)).toBe(false);
    const w = CONFIG.wave.mountedEnemiesFromWave + 3;
    const c = composeWave(w, seeded(7));
    const riders = c.enemies.filter((e) => e.mounted);
    expect(riders.length).toBe(Math.round(waveSpec(w).count * waveSpec(w).mounted));
    expect(riders.every((e) => e.archetype !== 'rifleman')).toBe(true);
  });
});

describe('WaveDirector', () => {
  it('countdown → staggered spawns → cleared when all are dead → intermission → next wave', () => {
    const d = new WaveDirector(1, seeded());
    expect(d.start()).toEqual([{ type: 'countdown', wave: 1 }]);
    let alive = 0;
    const ev = run(d, CONFIG.wave.countdown + 0.1, () => alive);
    expect(ev.map((e) => e.type)).toEqual(['waveStart', 'spawn']);
    alive = 1;
    // Staggered: 3 enemies need at least 2 more intervals.
    const spawns = run(d, 2 * CONFIG.wave.spawnInterval[1] + 0.2, () => alive).filter((e) => e.type === 'spawn');
    expect(spawns.length).toBe(WAVES[0].count - 1);
    expect(d.phase).toBe('active');
    alive = 0;
    const cleared = d.update(0.05, alive);
    expect(cleared[0]).toEqual({ type: 'waveCleared', wave: 1, bonus: waveClearBonus(1) });
    expect(d.phase).toBe('intermission');
    expect(d.timer).toBe(CONFIG.wave.intermission);
  });

  it('is not cleared on the tick the last enemy spawns (even if everyone else is dead)', () => {
    const d = new WaveDirector(1, seeded());
    d.start();
    run(d, CONFIG.wave.countdown + 0.1, () => 0);
    // Everyone spawned so far is dead; step until the last spawn: that tick must not clear.
    let lastSpawnTick: DirectorEvent[] = [];
    while (d.pending > 0) {
      const ev = d.update(0.05, 0);
      if (ev.some((e) => e.type === 'spawn')) lastSpawnTick = ev;
    }
    expect(lastSpawnTick.some((e) => e.type === 'waveCleared')).toBe(false);
    expect(d.phase).toBe('active');
    // The just-spawned enemy is alive: still not cleared.
    expect(d.update(0.05, 1).some((e) => e.type === 'waveCleared')).toBe(false);
    expect(d.update(0.05, 0)[0]?.type).toBe('waveCleared');
  });

  it('does not end a wave while enemies are alive or still to spawn', () => {
    const d = new WaveDirector(2, seeded());
    d.start();
    run(d, CONFIG.wave.countdown + 0.1, () => 0);
    // First enemy spawned; the rest are queued. Even with 0 alive the wave isn't over.
    expect(d.pending).toBeGreaterThan(0);
    expect(run(d, 0.1, () => 0).some((e) => e.type === 'waveCleared')).toBe(false);
  });

  it('intermission timing: pauses while the shop is open, Enter skips it', () => {
    const d = new WaveDirector(1, seeded());
    d.start();
    run(d, 20, () => 0); // spawn everything and clear with nobody alive
    expect(d.phase).toBe('intermission');
    const t = d.timer;
    d.update(5, 0, true);
    expect(d.timer).toBe(t);
    d.update(5, 0, false);
    expect(d.timer).toBeCloseTo(t - 5);
    expect(d.skipIntermission()).toEqual([{ type: 'countdown', wave: 2 }]);
    expect(d.phase).toBe('countdown');
    const d2 = new WaveDirector(1, seeded());
    d2.start();
    run(d2, 20, () => 0);
    const ev = run(d2, CONFIG.wave.intermission + 0.1, () => 0);
    expect(ev).toContainEqual({ type: 'countdown', wave: 2 });
  });

  it('the horse arrives after the unlock wave; old corpses are cleared', () => {
    const w = CONFIG.wave.horseUnlockWave;
    const d = new WaveDirector(w, seeded());
    d.start();
    const ev = run(d, 30, () => 0);
    expect(ev).toContainEqual({ type: 'horseArrives' });
    expect(ev).toContainEqual({ type: 'despawnCorpses', upToWave: w - CONFIG.wave.corpseWaves });
    const d1 = new WaveDirector(1, seeded());
    d1.start();
    expect(run(d1, 30, () => 0).some((e) => e.type === 'horseArrives' || e.type === 'despawnCorpses')).toBe(false);
  });
});
