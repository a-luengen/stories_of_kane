import { CONFIG } from '../config';

/** Best wave reached (0 = never played). Storage can be unavailable; that's fine. */
export function readBestWave(): number {
  try {
    return Number(localStorage.getItem(CONFIG.game.bestWaveKey)) || 0;
  } catch {
    return 0;
  }
}

/** Save `wave` if it beats the record. Returns the (new) best. */
export function recordWave(wave: number): number {
  const best = Math.max(readBestWave(), wave);
  try {
    localStorage.setItem(CONFIG.game.bestWaveKey, String(best));
  } catch {
    // Private mode / blocked storage: keep playing without a record.
  }
  return best;
}
