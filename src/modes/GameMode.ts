import type { Session } from '../core/Session';

export type ModeKind = 'sandbox' | 'wave' | 'story';

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
  /** The running map (null while one is loading). */
  readonly session: Session | null;
  /** Build the map, entities and rules. */
  init(): void;
  /** One frame of play (simulation + rendering). */
  update(dt: number): void;
  /** Draw the current state frozen (behind the pause menu / game over screen). */
  render(dt: number): void;
  /** Free everything (scene graph, GPU resources). */
  dispose(): void;
  /** A full-screen view of the mode's own is up (e.g. the world map): world sounds hold. */
  readonly paused?: boolean;
  /** Esc: close the mode's own view first (true if it did). */
  escape?(): boolean;
  /** The player went down; the mode decides: respawn, revive or game over. */
  onPlayerDeath(): void;
}
