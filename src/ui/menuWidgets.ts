import { uiSound } from '../audio/uiSound';
import type { Input } from '../Input';
import { drawText, textWidth } from './PixelFont';
import { UI } from './theme';
import type { UiPointer } from './InventoryUI';
import { drawPanel, inRect, wrapText, type Rect } from './widgets';

export interface MenuItem {
  label: string;
  /** Shown under the list while focused. */
  description?: string;
  /** Small second line on the button (e.g. "BEST: WAVE 7"). */
  sub?: string;
  /** Greyed out (still selectable, e.g. to explain why). */
  dim?: boolean;
  action: () => void;
}

/** Keys a menu reacts to this frame (consumed from Input). */
export interface MenuKeys {
  up: boolean;
  down: boolean;
  confirm: boolean;
  back: boolean;
}

export function readMenuKeys(input: Input): MenuKeys {
  const c = (...codes: string[]) => codes.map((k) => input.consume(k)).some(Boolean);
  return {
    up: c('KeyW', 'ArrowUp'),
    down: c('KeyS', 'ArrowDown'),
    confirm: c('Enter', 'NumpadEnter', 'Space'),
    back: c('Escape'),
  };
}

/** Vertical list of buttons: hover / W,S / arrows move the focus, click / Enter activates. */
export class MenuList {
  focus = 0;
  private rects: Rect[] = [];

  constructor(
    public items: MenuItem[],
    readonly w = 120,
    readonly h = 16,
    readonly gap = 5,
  ) {}

  get height(): number {
    return this.items.length * this.h + (this.items.length - 1) * this.gap;
  }

  /** Lay out at (x, y), handle input. */
  update(x: number, y: number, ptr: UiPointer, keys: MenuKeys): void {
    this.rects = this.items.map((_, i) => ({ x, y: y + i * (this.h + this.gap), w: this.w, h: this.h }));
    const n = this.items.length;
    const before = this.focus;
    if (keys.up) this.focus = (this.focus + n - 1) % n;
    if (keys.down) this.focus = (this.focus + 1) % n;
    const hover = this.rects.findIndex((r) => inRect(r, ptr.x, ptr.y));
    if (hover >= 0 && (ptr.moved || ptr.pressed)) this.focus = hover;
    if (this.focus !== before) uiSound('ui.hover');
    if (keys.confirm) {
      uiSound('ui.click');
      this.items[this.focus].action();
    } else if (ptr.released && hover >= 0 && hover === this.focus) {
      uiSound('ui.click');
      this.items[hover].action();
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.items.forEach((item, i) => {
      const r = this.rects[i];
      if (!r) return;
      const focused = i === this.focus;
      ctx.fillStyle = UI.ink;
      ctx.fillRect(r.x - 1, r.y - 1, r.w + 2, r.h + 2);
      ctx.fillStyle = focused ? UI.woodLight : UI.wood;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = focused ? UI.brassLight : UI.woodPale;
      ctx.fillRect(r.x, r.y, r.w, 1);
      if (focused) {
        ctx.fillStyle = UI.brassLight;
        ctx.fillRect(r.x + 3, r.y + Math.floor(r.h / 2) - 2, 2, 5); // pointer notch
      }
      const color = item.dim ? UI.woodPale : focused ? UI.brassLight : UI.cream;
      const ty = item.sub ? r.y + 3 : r.y + Math.round(r.h / 2 - 2);
      drawText(ctx, item.label, r.x + Math.round((r.w - textWidth(item.label)) / 2), ty, color, UI.ink);
      if (item.sub) drawText(ctx, item.sub, r.x + Math.round((r.w - textWidth(item.sub)) / 2), r.y + r.h - 7, item.dim ? UI.woodPale : UI.sand);
    });
  }

  get focused(): MenuItem {
    return this.items[this.focus];
  }
}

/** Small modal panel with a message and a row of buttons (Enter = focused, Esc = last). */
export class Dialog {
  private focus = 0;
  private buttons: Rect[] = [];

  constructor(
    readonly title: string,
    readonly text: string,
    readonly items: MenuItem[],
  ) {}

  private rect(W: number, H: number): Rect {
    const w = Math.max(170, this.items.length * 66 + 14);
    const h = 26 + wrapText(this.text.toUpperCase(), Math.floor((w - 18) / 4)).length * 7 + 20;
    return { x: Math.round((W - w) / 2), y: Math.round((H - h) / 2), w, h };
  }

  update(W: number, H: number, ptr: UiPointer, keys: MenuKeys): void {
    const r = this.rect(W, H);
    const n = this.items.length;
    const bw = 60;
    const bx = Math.round(r.x + (r.w - (n * bw + (n - 1) * 6)) / 2);
    this.buttons = this.items.map((_, i) => ({ x: bx + i * (bw + 6), y: r.y + r.h - 18, w: bw, h: 13 }));
    if (keys.back) {
      uiSound('ui.click');
      return this.items[n - 1].action();
    }
    const before = this.focus;
    if (keys.up || keys.down) this.focus = (this.focus + 1) % n;
    const hover = this.buttons.findIndex((b) => inRect(b, ptr.x, ptr.y));
    if (hover >= 0 && (ptr.moved || ptr.pressed)) this.focus = hover;
    if (this.focus !== before) uiSound('ui.hover');
    if (keys.confirm) {
      uiSound('ui.click');
      this.items[this.focus].action();
    } else if (ptr.released && hover >= 0) {
      uiSound('ui.click');
      this.items[hover].action();
    }
  }

  draw(ctx: CanvasRenderingContext2D, W: number, H: number): void {
    const r = this.rect(W, H);
    drawPanel(ctx, r, this.title);
    wrapText(this.text.toUpperCase(), Math.floor((r.w - 18) / 4)).forEach((l, i) => drawText(ctx, l, r.x + Math.round((r.w - textWidth(l)) / 2), r.y + 12 + i * 7, UI.cream));
    this.items.forEach((item, i) => {
      const b = this.buttons[i];
      if (!b) return;
      const focused = i === this.focus;
      ctx.fillStyle = UI.ink;
      ctx.fillRect(b.x - 1, b.y - 1, b.w + 2, b.h + 2);
      ctx.fillStyle = focused ? UI.woodLight : UI.wood;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = focused ? UI.brassLight : UI.woodPale;
      ctx.fillRect(b.x, b.y, b.w, 1);
      drawText(ctx, item.label, b.x + Math.round((b.w - textWidth(item.label)) / 2), b.y + 4, focused ? UI.brassLight : UI.cream, UI.ink);
    });
  }
}

/** Dim the frame behind a menu. */
export function dim(ctx: CanvasRenderingContext2D, W: number, H: number, alpha = 0.55): void {
  ctx.fillStyle = `rgba(31,21,16,${alpha})`;
  ctx.fillRect(0, 0, W, H);
}
