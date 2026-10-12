import type { Engine } from '../core/Engine';
import { Dialog, dim, MenuList, readMenuKeys } from './menuWidgets';
import { drawTextScaled, textWidthScaled } from './PixelFont';
import { UI } from './theme';
import { VolumeSliders } from './VolumeSliders';
import { drawCursor, drawPanel } from './widgets';

export interface PauseActions {
  resume(): void;
  restart(): void;
  mainMenu(): void;
}

/** Esc menu over the frozen game: Resume, Restart, Main Menu (with confirmation), sound volumes. */
export class PauseMenu {
  private list: MenuList;
  private confirm: Dialog | null = null;
  private sliders: VolumeSliders;

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
    this.sliders = new VolumeSliders(engine.audio);
  }

  /** Each time the menu opens: focus on Resume, no confirmation pending. */
  reset(): void {
    this.list.focus = 0;
    this.sliders.focus = null;
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
    const left = e.input.consume('ArrowLeft') || e.input.consume('KeyA');
    const right = e.input.consume('ArrowRight') || e.input.consume('KeyD');
    dim(ctx, W, H, 0.5);
    const pw = Math.max(this.list.w, this.sliders.width) + 24;
    const ph = this.list.height + 30 + this.sliders.height + 6;
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
      // Up / down run through the buttons and on into the sliders.
      const sl = this.sliders;
      const n = this.list.items.length;
      let listKeys = keys;
      if (sl.focus !== null) {
        if (keys.up) {
          if (sl.focus === 0) {
            sl.focus = null;
            this.list.focus = n - 1;
          } else sl.focus--;
        } else if (keys.down && sl.focus < sl.rows - 1) sl.focus++;
        listKeys = { ...keys, up: false, down: false, confirm: false };
      } else if (keys.down && this.list.focus === n - 1) {
        sl.focus = 0;
        listKeys = { ...keys, down: false };
      }
      const sx = Math.round(px + (pw - sl.width) / 2);
      const sy = py + 18 + this.list.height + 10;
      sl.update(sx, sy, ptr, e.input.mouseDown, left, right);
      this.list.update(px + 12, py + 18, ptr, listKeys);
      // Pointing at a button takes the focus back from the sliders.
      const overList = ptr.x >= px + 12 && ptr.x < px + 12 + this.list.w && ptr.y >= py + 18 && ptr.y < py + 18 + this.list.height;
      if (sl.focus !== null && overList && ptr.moved) sl.focus = null;
      // While a slider has the focus, no button shows it.
      const listFocus = this.list.focus;
      if (sl.focus !== null) this.list.focus = -1;
      this.list.draw(ctx);
      this.list.focus = listFocus;
      sl.draw(ctx, sx, sy);
    }
    const s = 2;
    const t = 'PAUSED';
    drawTextScaled(ctx, t, Math.round((W - textWidthScaled(t, s)) / 2), py - 24, UI.cream, s, UI.ink);
    drawCursor(ctx, ptr.x, ptr.y);
  }
}
