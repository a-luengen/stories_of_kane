import { CONFIG } from '../config';

export type DeathOutcome = 'revive' | 'gameover';

/**
 * One revive token per run. A death with a token plays: slow motion, the player lies down, then
 * gets back up with half health (the mode applies the knockback and invulnerability); a death
 * without one ends the run.
 */
export class ReviveTracker {
  tokens: number;
  /** Seconds (real time) since the current death, or -1 when not dying. */
  private t = -1;
  private outcome: DeathOutcome | null = null;

  constructor(tokens = CONFIG.wave.revive.tokens) {
    this.tokens = tokens;
  }

  get dying(): boolean {
    return this.t >= 0;
  }

  /** The player went down: decide what happens. */
  onDeath(): DeathOutcome {
    this.t = 0;
    this.outcome = this.tokens > 0 ? 'revive' : 'gameover';
    if (this.outcome === 'revive') this.tokens--;
    return this.outcome;
  }

  /** Time scale while dying (slow motion at first). */
  get timeScale(): number {
    const r = CONFIG.wave.revive;
    return this.dying && this.t < r.slowMoTime ? r.slowMo : 1;
  }

  /** Advance by real time. Returns 'getUp' or 'gameover' once, when the moment comes. */
  update(realDt: number): 'getUp' | 'gameover' | null {
    if (!this.dying) return null;
    this.t += realDt;
    const r = CONFIG.wave.revive;
    if (this.t >= r.getUpAfter) {
      const o = this.outcome;
      this.t = -1;
      this.outcome = null;
      return o === 'revive' ? 'getUp' : 'gameover';
    }
    return null;
  }
}
