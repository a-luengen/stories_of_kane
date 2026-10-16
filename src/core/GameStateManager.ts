import type { GameMode, ModeKind, RunStats } from '../modes/GameMode';
import { recordWave } from '../modes/records';
import { GameOverScreen } from '../ui/GameOverScreen';
import { MainMenu } from '../ui/MainMenu';
import { PauseMenu } from '../ui/PauseMenu';
import type { Engine } from './Engine';

export type StateName = 'MainMenu' | 'Playing' | 'Paused' | 'GameOver';

export interface ModeOptions {
  /** Wave mode: first wave (dev / testing). */
  startWave?: number;
  /** Story: start over (otherwise continue the saved story, if there is one). */
  newGame?: boolean;
}

/** How modes talk back to the state manager. */
export interface ModeHost {
  gameOver(stats: RunStats): void;
}

export type ModeFactory = (engine: Engine, host: ModeHost, opts: ModeOptions) => GameMode;

/**
 * Top-level flow: main menu → playing a mode ⇄ paused → game over. Switching always disposes the
 * previous scene (menu backdrop or game session) before building the next one.
 */
export class GameStateManager implements ModeHost {
  state: StateName = 'MainMenu';
  mode: GameMode | null = null;
  private modeKind: ModeKind = 'sandbox';
  private modeOpts: ModeOptions = {};
  private menu: MainMenu | null = null;
  private pauseMenu: PauseMenu;
  private gameOverScreen: GameOverScreen | null = null;
  /** Mode switches are applied between frames, never mid-update. */
  private pending: (() => void) | null = null;

  constructor(
    private engine: Engine,
    private factories: Record<ModeKind, ModeFactory>,
  ) {
    this.pauseMenu = new PauseMenu(engine, {
      resume: () => this.resume(),
      // (Restarting a story continues it from its save; it never wipes it.)
      restart: () => this.defer(() => this.startMode(this.modeKind, this.modeKind === 'story' ? {} : this.modeOpts)),
      mainMenu: () => this.defer(() => this.toMenu()),
    });
  }

  /** Start from the URL: `?mode=sandbox|wave|story` skips the menu, `?wave=N` picks the first wave. */
  boot(params: URLSearchParams): void {
    const mode = params.get('mode');
    if (mode === 'story') {
      this.startMode('story', {});
    } else if (mode === 'sandbox' || mode === 'wave') {
      const wave = Number(params.get('wave'));
      this.startMode(mode, wave > 0 ? { startWave: Math.floor(wave) } : {});
    } else {
      this.toMenu();
    }
  }

  private defer(fn: () => void): void {
    this.pending = fn;
  }

  private teardown(): void {
    this.mode?.dispose();
    this.mode = null;
    this.menu?.dispose();
    this.menu = null;
    this.gameOverScreen = null;
  }

  toMenu(): void {
    this.teardown();
    this.menu = new MainMenu(this.engine, (kind, opts) => this.defer(() => this.startMode(kind, opts ?? {})));
    this.state = 'MainMenu';
  }

  startMode(kind: ModeKind, opts: ModeOptions): void {
    this.teardown();
    this.modeKind = kind;
    this.modeOpts = opts;
    this.mode = this.factories[kind](this.engine, this, opts);
    this.mode.init();
    this.state = 'Playing';
    this.engine.input.clearPressed();
  }

  pause(): void {
    if (this.state !== 'Playing') return;
    this.state = 'Paused';
    this.pauseMenu.reset();
    this.engine.input.clearPressed();
  }

  resume(): void {
    if (this.state !== 'Paused') return;
    this.state = 'Playing';
    this.engine.input.clearPressed();
  }

  gameOver(stats: RunStats): void {
    const best = recordWave(stats.waveReached);
    this.gameOverScreen = new GameOverScreen(this.engine, stats, best, {
      retry: () => this.defer(() => this.startMode(this.modeKind, {})),
      mainMenu: () => this.defer(() => this.toMenu()),
    });
    this.state = 'GameOver';
    this.engine.input.clearPressed();
  }

  frame(dt: number): void {
    const input = this.engine.input;
    switch (this.state) {
      case 'MainMenu':
        this.menu!.frame(dt);
        break;
      case 'Playing':
        // Esc closes an open inventory / loot / shop screen first; otherwise it pauses.
        if (input.consume('Escape') && !this.mode!.escape?.() && !this.mode!.session?.escape()) {
          this.pause();
          this.mode!.render(dt);
          this.pauseMenu.frame();
          break;
        }
        this.mode!.update(dt);
        break;
      case 'Paused':
        this.mode!.render(dt);
        this.pauseMenu.frame();
        break;
      case 'GameOver':
        this.mode!.render(dt);
        this.gameOverScreen!.frame();
        break;
    }
    // World sounds hold while paused or while an inventory / shop screen is open (UI keeps playing).
    this.engine.audio.setWorldPaused(this.state === 'Paused' || this.state === 'GameOver' || (this.state === 'Playing' && (!!this.mode?.session?.ui.open || !!this.mode?.paused)));
    if (this.pending) {
      const p = this.pending;
      this.pending = null;
      p();
    }
  }
}
