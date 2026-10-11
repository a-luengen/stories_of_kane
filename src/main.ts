import { Game } from './Game';

const container = document.getElementById('app')!;
const game = new Game(container);
game.start();

// Handy for poking at things from the devtools console.
(window as unknown as { game: Game }).game = game;
