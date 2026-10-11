import { CONFIG } from '../config';
import { drawText, textWidth } from './PixelFont';

const C = {
  ink: '#1f1510',
  brass: '#d9a441',
  brassLight: '#f7d774',
  empty: '#5a3a24',
  cream: '#f4ecd8',
  rust: '#b5562b',
  red: '#a33a2a',
};

export interface HudState {
  ammo: number;
  reloadProgress: number; // -1 when not reloading
  prompt: string | null;
  /** Crosshair position in low-res pixels (or null when the cursor is outside). */
  cursorX: number | null;
  cursorY: number | null;
  mounted: boolean;
  speedLabel: string | null;
  pixelate: boolean;
}

/**
 * HUD drawn on a canvas at the same low resolution as the 3D render and upscaled with
 * nearest-neighbour, so it shares the exact pixel grid.
 */
export class Hud {
  readonly canvas = document.createElement('canvas');
  private ctx: CanvasRenderingContext2D;
  private time = 0;

  constructor(container: HTMLElement) {
    this.canvas.style.pointerEvents = 'none';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;
  }

  setSize(lowW: number, lowH: number, cssW: number, cssH: number, left: string, top: string): void {
    this.canvas.width = lowW;
    this.canvas.height = lowH;
    Object.assign(this.canvas.style, { width: `${cssW}px`, height: `${cssH}px`, left, top });
    this.ctx.imageSmoothingEnabled = false;
  }

  draw(dt: number, s: HudState): void {
    this.time += dt;
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Ammo: six bullet icons bottom-left.
    const mag = CONFIG.revolver.magazine;
    const bx = 6;
    const by = H - 15;
    const reloading = s.reloadProgress >= 0;
    const shownAmmo = reloading ? Math.floor(s.reloadProgress * mag) : s.ammo;
    ctx.fillStyle = 'rgba(31,21,16,0.55)';
    ctx.fillRect(bx - 3, by - 3, mag * 6 + 4, 15);
    for (let i = 0; i < mag; i++) this.bullet(bx + i * 6, by, i < shownAmmo, reloading && i === shownAmmo);

    if (reloading) {
      // Reload bar + label.
      const w = mag * 6 - 2;
      const y = by - 9;
      drawText(ctx, 'RELOADING', bx, y - 6, C.cream, C.ink);
      ctx.fillStyle = C.ink;
      ctx.fillRect(bx - 1, y - 1, w + 2, 4);
      ctx.fillStyle = C.rust;
      ctx.fillRect(bx, y, Math.round(w * s.reloadProgress), 2);
    } else if (s.ammo === 0) {
      if (Math.floor(this.time * 3) % 2 === 0) drawText(ctx, 'R TO RELOAD', bx, by - 9, C.cream, C.ink);
    }

    if (s.mounted && s.speedLabel) drawText(ctx, s.speedLabel, bx + mag * 6 + 6, by + 3, C.cream, C.ink);

    if (s.prompt) {
      const tw = textWidth(s.prompt);
      const x = Math.round(W / 2 - tw / 2);
      const y = Math.round(H * 0.62);
      ctx.fillStyle = 'rgba(31,21,16,0.6)';
      ctx.fillRect(x - 3, y - 2, tw + 6, 9);
      drawText(ctx, s.prompt, x, y, C.cream);
    }

    if (!s.pixelate) drawText(ctx, 'PIXEL OFF [P]', W - textWidth('PIXEL OFF [P]') - 4, 4, C.cream, C.ink);

    if (s.cursorX !== null && s.cursorY !== null) this.crosshair(s.cursorX, s.cursorY, reloading);
  }

  private bullet(x: number, y: number, full: boolean, next: boolean): void {
    const ctx = this.ctx;
    if (full) {
      ctx.fillStyle = C.ink;
      ctx.fillRect(x, y, 5, 10);
      ctx.fillStyle = C.brassLight;
      ctx.fillRect(x + 1, y + 1, 3, 3); // tip
      ctx.fillStyle = C.brass;
      ctx.fillRect(x + 1, y + 4, 3, 5);
      ctx.fillStyle = C.cream;
      ctx.fillRect(x + 1, y + 1, 1, 2);
    } else {
      ctx.fillStyle = C.ink;
      ctx.fillRect(x, y, 5, 10);
      ctx.fillStyle = next && Math.floor(this.time * 8) % 2 ? C.rust : C.empty;
      ctx.fillRect(x + 1, y + 4, 3, 5);
    }
  }

  private crosshair(cx: number, cy: number, dim: boolean): void {
    const ctx = this.ctx;
    const col = dim ? C.rust : C.cream;
    const arms: [number, number, number, number][] = [
      [-5, 0, 3, 1],
      [3, 0, 3, 1],
      [0, -5, 1, 3],
      [0, 3, 1, 3],
    ];
    ctx.fillStyle = C.ink;
    for (const [x, y, w, h] of arms) ctx.fillRect(cx + x - (w > 1 ? 0 : 1), cy + y - (h > 1 ? 0 : 1), w + (w > 1 ? 0 : 2), h + (h > 1 ? 0 : 2));
    ctx.fillRect(cx - 1, cy - 1, 3, 3);
    ctx.fillStyle = col;
    for (const [x, y, w, h] of arms) ctx.fillRect(cx + x, cy + y, w, h);
    ctx.fillStyle = C.red;
    ctx.fillRect(cx, cy, 1, 1);
  }
}
