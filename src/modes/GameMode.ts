import type { Session } from '../core/Session';

export type ModeKind = 'sandbox' | 'wave';

/** End-of-run numbers for the Game Over screen. */
export interface RunStats {
  /** Waves fully cleared. */
  wavesSurvived: number;
  /** The wave the run ended in (saved as the best). */
  waveReached: number;
  kills: number;
  dollarsEarned: number;
  timeSurvived: number;
}

/** A way to play: owns a game session and its rules. */
export interface GameMode {
  readonly kind: ModeKind;
  readonly session: Session;
  /** Build the map, entities and rules. */
  init(): void;
  /** One frame of play (simulation + rendering). */
  update(dt: number): void;
  /** Draw the current state frozen (behind the pause menu / game over screen). */
  render(dt: number): void;
  /** Free everything (scene graph, GPU resources). */
  dispose(): void;
  /** The player went down; the mode decides: respawn, revive or game over. */
  onPlayerDeath(): void;
}
