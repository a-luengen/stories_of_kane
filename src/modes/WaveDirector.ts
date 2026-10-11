import { CONFIG } from '../config';
import { ECONOMY } from '../data/economy';
import { ENEMIES, type ArchetypeId } from '../data/enemies';
import { WAVES, WAVE_SCALING, type WaveSpec } from '../data/waves';

export interface EnemySpawn {
  archetype: ArchetypeId;
  mounted: boolean;
  /** Stat multipliers for this wave. */
  hp: number;
  accuracy: number;
  reaction: number;
}

export interface WaveComposition {
  wave: number;
  enemies: EnemySpawn[];
}

export type DirectorEvent =
  | { type: 'countdown'; wave: number }
  | { type: 'waveStart'; wave: number; count: number }
  | { type: 'spawn'; wave: number; enemy: EnemySpawn }
  | { type: 'waveCleared'; wave: number; bonus: number }
  | { type: 'horseArrives' }
  | { type: 'despawnCorpses'; upToWave: number };

export type WavePhase = 'countdown' | 'active' | 'intermission';

/** The wave's spec: from the table, or scaled from its last entry. */
export function waveSpec(wave: number): WaveSpec {
  if (wave <= WAVES.length) return WAVES[Math.max(1, wave) - 1];
  const last = WAVES[WAVES.length - 1];
  const k = wave - WAVES.length;
  const s = WAVE_SCALING;
  return {
    count: Math.min(s.maxCount, Math.round(last.count + k * s.countPerWave)),
    mix: last.mix,
    mounted: Math.min(s.maxMounted, last.mounted + k * s.mountedPerWave),
    hp: last.hp + k * s.hpPerWave,
    accuracy: Math.max(s.minAccuracy, last.accuracy - k * s.accuracyPerWave),
    reaction: Math.max(s.minReaction, last.reaction - k * s.reactionPerWave),
  };
}

/** Split `count` by weights (largest remainder), e.g. 5 × {a:3,b:1,c:1} → a3 b1 c1. */
export function apportion(count: number, weights: Partial<Record<ArchetypeId, number>>): Record<ArchetypeId, number> {
  const ids = Object.keys(weights) as ArchetypeId[];
  const total = ids.reduce((s, id) => s + (weights[id] ?? 0), 0);
  const out = { gunslinger: 0, rifleman: 0, shotgunner: 0 } as Record<ArchetypeId, number>;
  const rem: [ArchetypeId, number][] = [];
  let given = 0;
  for (const id of ids) {
    const exact = (count * (weights[id] ?? 0)) / total;
    out[id] = Math.floor(exact);
    given += out[id];
    rem.push([id, exact - out[id]]);
  }
  rem.sort((a, b) => b[1] - a[1]);
  for (let i = 0; given < count; i++, given++) out[rem[i % rem.length][0]]++;
  return out;
}

/** Who spawns in a wave (order shuffled). */
export function composeWave(wave: number, rand = Math.random): WaveComposition {
  const spec = waveSpec(wave);
  const counts = apportion(spec.count, spec.mix);
  const enemies: EnemySpawn[] = [];
  for (const id of Object.keys(counts) as ArchetypeId[]) {
    for (let i = 0; i < counts[id]; i++) enemies.push({ archetype: id, mounted: false, hp: spec.hp, accuracy: spec.accuracy, reaction: spec.reaction });
  }
  // Mounted share, only from the configured wave and only archetypes that can ride.
  if (wave >= CONFIG.wave.mountedEnemiesFromWave && spec.mounted > 0) {
    let riders = Math.round(spec.count * spec.mounted);
    for (const e of enemies) {
      if (riders <= 0) break;
      if (ENEMIES[e.archetype].mountedWeapon) {
        e.mounted = true;
        riders--;
      }
    }
  }
  for (let i = enemies.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [enemies[i], enemies[j]] = [enemies[j], enemies[i]];
  }
  return { wave, enemies };
}

export function waveClearBonus(wave: number): number {
  return ECONOMY.waveBonusBase + ECONOMY.waveBonusPerWave * wave;
}

/**
 * Wave flow: countdown → staggered spawns → (all dead) cleared → intermission → next countdown.
 * Pure logic: the mode feeds it time and the number of living enemies and reacts to its events.
 */
export class WaveDirector {
  phase: WavePhase = 'countdown';
  wave: number;
  /** Seconds left in the countdown / intermission. */
  timer = 0;
  /** Seconds since the last wave was cleared (for the banner). */
  sinceCleared = Infinity;
  private queue: EnemySpawn[] = [];
  private spawnTimer = 0;
  private spawned = 0;

  constructor(
    startWave = 1,
    private rand: () => number = Math.random,
  ) {
    this.wave = Math.max(1, startWave);
  }

  /** Begin the first countdown. */
  start(): DirectorEvent[] {
    return this.beginCountdown();
  }

  /** Enemies of the current wave still to spawn. */
  get pending(): number {
    return this.queue.length;
  }

  private beginCountdown(): DirectorEvent[] {
    this.phase = 'countdown';
    this.timer = CONFIG.wave.countdown;
    return [{ type: 'countdown', wave: this.wave }];
  }

  /**
   * Advance by `dt`. `alive` = living enemies of this run. `paused` (shop open) freezes the
   * intermission timer.
   */
  update(dt: number, alive: number, paused = false): DirectorEvent[] {
    const ev: DirectorEvent[] = [];
    this.sinceCleared += dt;
    if (this.phase === 'countdown') {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.phase = 'active';
        this.queue = composeWave(this.wave, this.rand).enemies;
        this.spawned = 0;
        this.spawnTimer = 0;
        ev.push({ type: 'waveStart', wave: this.wave, count: this.queue.length });
      }
    } else if (this.phase === 'active') {
      this.spawnTimer -= dt;
      let spawnedNow = false;
      if (this.queue.length > 0 && this.spawnTimer <= 0) {
        ev.push({ type: 'spawn', wave: this.wave, enemy: this.queue.shift()! });
        this.spawned++;
        spawnedNow = true;
        const [lo, hi] = CONFIG.wave.spawnInterval;
        this.spawnTimer = lo + this.rand() * (hi - lo);
      }
      // `alive` was counted before this step's spawn exists: never call the wave clear on a spawn tick.
      if (!spawnedNow && this.queue.length === 0 && alive === 0 && this.spawned > 0) {
        ev.push({ type: 'waveCleared', wave: this.wave, bonus: waveClearBonus(this.wave) });
        this.sinceCleared = 0;
        this.phase = 'intermission';
        this.timer = CONFIG.wave.intermission;
        if (this.wave === CONFIG.wave.horseUnlockWave) ev.push({ type: 'horseArrives' });
        if (this.wave - CONFIG.wave.corpseWaves >= 1) ev.push({ type: 'despawnCorpses', upToWave: this.wave - CONFIG.wave.corpseWaves });
      }
    } else if (!paused) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.wave++;
        ev.push(...this.beginCountdown());
      }
    }
    return ev;
  }

  /** Enter during the intermission: straight to the next countdown. */
  skipIntermission(): DirectorEvent[] {
    if (this.phase !== 'intermission') return [];
    this.wave++;
    return this.beginCountdown();
  }
}
