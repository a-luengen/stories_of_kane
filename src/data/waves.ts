import type { ArchetypeId } from './enemies';

export interface WaveSpec {
  /** Enemies in the wave. */
  count: number;
  /** Relative weights of the archetypes. */
  mix: Partial<Record<ArchetypeId, number>>;
  /** Fraction of enemies on horseback (only from CONFIG.wave.mountedEnemiesFromWave, mountable archetypes). */
  mounted: number;
  /** Stat multipliers: HP, spread (lower = more accurate), reaction time (lower = faster). */
  hp: number;
  accuracy: number;
  reaction: number;
}

/** Hand-tuned waves; later waves scale from the last entry (see waveSpec). */
export const WAVES: WaveSpec[] = [
  { count: 3, mix: { gunslinger: 1 }, mounted: 0, hp: 0.8, accuracy: 1.25, reaction: 1.25 },
  { count: 4, mix: { gunslinger: 3, rifleman: 1 }, mounted: 0, hp: 0.85, accuracy: 1.2, reaction: 1.2 },
  { count: 5, mix: { gunslinger: 3, rifleman: 1, shotgunner: 1 }, mounted: 0, hp: 0.9, accuracy: 1.1, reaction: 1.1 },
  { count: 6, mix: { gunslinger: 3, rifleman: 2, shotgunner: 1 }, mounted: 0, hp: 1, accuracy: 1.05, reaction: 1.05 },
  { count: 7, mix: { gunslinger: 3, rifleman: 2, shotgunner: 2 }, mounted: 0.2, hp: 1, accuracy: 1, reaction: 1 },
  { count: 8, mix: { gunslinger: 3, rifleman: 2, shotgunner: 2 }, mounted: 0.25, hp: 1.05, accuracy: 0.97, reaction: 0.97 },
  { count: 9, mix: { gunslinger: 3, rifleman: 2, shotgunner: 3 }, mounted: 0.3, hp: 1.1, accuracy: 0.94, reaction: 0.95 },
  { count: 10, mix: { gunslinger: 3, rifleman: 3, shotgunner: 3 }, mounted: 0.35, hp: 1.15, accuracy: 0.9, reaction: 0.92 },
];

/** Beyond the table: per extra wave. */
export const WAVE_SCALING = {
  countPerWave: 1.5,
  maxCount: 30,
  mountedPerWave: 0.03,
  maxMounted: 0.6,
  hpPerWave: 0.06,
  accuracyPerWave: 0.02,
  minAccuracy: 0.6,
  reactionPerWave: 0.02,
  minReaction: 0.6,
};
