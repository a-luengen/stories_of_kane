import { Engine } from './core/Engine';
import { GameStateManager } from './core/GameStateManager';
import { SandboxMode } from './modes/SandboxMode';
import { WaveMode } from './modes/WaveMode';
import { StoryMode } from './modes/StoryMode';

const container = document.getElementById('app')!;
const engine = new Engine(container);
const states = new GameStateManager(engine, {
  sandbox: (e) => new SandboxMode(e),
  wave: (e, host, opts) => new WaveMode(e, host, opts),
  story: (e, _host, opts) => new StoryMode(e, { newGame: opts.newGame }),
});
states.boot(new URLSearchParams(location.search));
engine.start((dt) => states.frame(dt));

// Handy for poking at things from the devtools console.
(window as unknown as { game: unknown }).game = {
  engine,
  states,
  get session() {
    return states.mode?.session ?? null;
  },
};
