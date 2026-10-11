import type { Engine } from '../core/Engine';
import { Dialog, dim, MenuList, readMenuKeys } from './menuWidgets';
import { drawTextScaled, textWidthScaled } from './PixelFont';
import { UI } from './theme';
import { drawCursor, drawPanel } from './widgets';

export interface PauseActions {
  resume(): void;
  restart(): void;
  mainMenu(): void;
}

/** Esc menu over the frozen game: Resume, Restart, Main Menu (with confirmation). */
export class PauseMenu {
  private list: MenuList;
  private confirm: Dialog | null = null;

  constructor(
    private engine: Engine,
    private actions: PauseActions,
  ) {
    this.list = new MenuList([
      { label: 'RESUME', action: () => actions.resume() },
      { label: 'RESTART', action: () => actions.restart() },
      {
        label: 'MAIN MENU',
        action: () => {
          this.confirm = new Dialog('MAIN MENU', 'Leave the current game?', [
            { label: 'LEAVE', action: () => actions.mainMenu() },
            { label: 'STAY', action: () => (this.confirm = null) },
          ]);
        },
      },
    ], 90, 15, 4);
  }

  /** Each time the menu opens: focus on Resume, no confirmation pending. */
  reset(): void {
    this.list.focus = 0;
    this.confirm = null;
  }

  /** Draw over the already-rendered game frame and handle input. */
  frame(): void {
    const e = this.engine;
    const W = e.lowW;
    const H = e.lowH;
    const ctx = e.hud.context;
    const ptr = e.pointer();
    const keys = readMenuKeys(e.input);
    dim(ctx, W, H, 0.5);
    const pw = this.list.w + 24;
    const ph = this.list.height + 30;
    const px = Math.round((W - pw) / 2);
    const py = Math.round((H - ph) / 2);
    drawPanel(ctx, { x: px, y: py, w: pw, h: ph }, 'PAUSED');
    if (this.confirm) {
      this.list.update(px + 12, py + 18, { ...ptr, pressed: false, released: false, moved: false }, { up: false, down: false, confirm: false, back: false });
      this.list.draw(ctx);
      this.confirm.update(W, H, ptr, keys);
      if (this.confirm) {
        dim(ctx, W, H, 0.4);
        this.confirm.draw(ctx, W, H);
      }
    } else {
      if (keys.back) {
        this.actions.resume();
        return;
      }
      this.list.update(px + 12, py + 18, ptr, keys);
      this.list.draw(ctx);
    }
    const s = 2;
    const t = 'PAUSED';
    drawTextScaled(ctx, t, Math.round((W - textWidthScaled(t, s)) / 2), py - 24, UI.cream, s, UI.ink);
    drawCursor(ctx, ptr.x, ptr.y);
  }
}
