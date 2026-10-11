import type { Engine } from '../core/Engine';
import type { RunStats } from '../modes/GameMode';
import { dim, MenuList, readMenuKeys } from './menuWidgets';
import { drawText, drawTextScaled, textWidth, textWidthScaled } from './PixelFont';
import { UI } from './theme';
import { drawCursor, drawPanel } from './widgets';

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** End of a wave run: stats, Retry, Main Menu. */
export class GameOverScreen {
  private list: MenuList;

  constructor(
    private engine: Engine,
    private stats: RunStats,
    private best: number,
    actions: { retry(): void; mainMenu(): void },
  ) {
    this.list = new MenuList([
      { label: 'RETRY', action: () => actions.retry() },
      { label: 'MAIN MENU', action: () => actions.mainMenu() },
    ], 90, 15, 4);
  }

  frame(): void {
    const e = this.engine;
    const W = e.lowW;
    const H = e.lowH;
    const ctx = e.hud.context;
    const ptr = e.pointer();
    const keys = readMenuKeys(e.input);
    dim(ctx, W, H, 0.6);
    const s = this.stats;
    const rows: [string, string][] = [
      ['WAVES SURVIVED', String(s.wavesSurvived)],
      ['KILLS', String(s.kills)],
      ['DOLLARS EARNED', `$${s.dollarsEarned}`],
      ['TIME SURVIVED', formatTime(s.timeSurvived)],
      ['BEST WAVE', String(this.best)],
    ];
    const pw = 150;
    const ph = rows.length * 9 + 14 + this.list.height + 12;
    const px = Math.round((W - pw) / 2);
    const py = Math.round(H / 2 - ph / 2 + 10);
    const title = 'GAME OVER';
    drawTextScaled(ctx, title, Math.round((W - textWidthScaled(title, 3)) / 2), py - 30, UI.red, 3, UI.ink);
    drawPanel(ctx, { x: px, y: py, w: pw, h: ph }, 'YOUR RUN');
    rows.forEach(([k, v], i) => {
      drawText(ctx, k, px + 10, py + 10 + i * 9, UI.sand);
      drawText(ctx, v, px + pw - 10 - textWidth(v), py + 10 + i * 9, UI.brassLight);
    });
    this.list.update(px + Math.round((pw - this.list.w) / 2), py + 14 + rows.length * 9, ptr, keys);
    this.list.draw(ctx);
    drawCursor(ctx, ptr.x, ptr.y);
  }
}
