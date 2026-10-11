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

/** Text anchored to a point in the world, already projected to low-res pixels. */
export interface WorldLabel {
  kind: 'name' | 'prompt' | 'speech' | 'alert';
  text: string;
  x: number;
  y: number;
}

export interface HudState {
  ammo: number;
  magazine: number;
  hp: number;
  maxHp: number;
  /** 0..1 damage flash. */
  hurt: number;
  dead: boolean;
  labels: WorldLabel[];
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

    for (const l of s.labels) this.label(l, W, H);

    // Damage flash: red frame, plus a dark veil once dead.
    if (s.hurt > 0.01) {
      ctx.fillStyle = `rgba(163,58,42,${(s.hurt * 0.55).toFixed(3)})`;
      const t = 4;
      ctx.fillRect(0, 0, W, t);
      ctx.fillRect(0, H - t, W, t);
      ctx.fillRect(0, t, t, H - 2 * t);
      ctx.fillRect(W - t, t, t, H - 2 * t);
    }
    if (s.dead) {
      ctx.fillStyle = 'rgba(31,21,16,0.45)';
      ctx.fillRect(0, 0, W, H);
      const msg = 'YOU DIED';
      drawText(ctx, msg, Math.round(W / 2 - textWidth(msg) / 2), Math.round(H * 0.42), C.red, C.ink);
    }

    // Health bar top-left.
    const hw = 40;
    ctx.fillStyle = 'rgba(31,21,16,0.55)';
    ctx.fillRect(3, 3, hw + 17, 9);
    drawText(ctx, 'HP', 5, 5, C.cream, C.ink);
    ctx.fillStyle = C.ink;
    ctx.fillRect(15, 5, hw + 2, 5);
    ctx.fillStyle = s.hp / s.maxHp < 0.3 && Math.floor(this.time * 4) % 2 ? C.cream : C.red;
    ctx.fillRect(16, 6, Math.ceil((hw * s.hp) / s.maxHp), 3);

    // Ammo: bullet icons bottom-left.
    const mag = s.magazine;
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

  private label(l: WorldLabel, W: number, H: number): void {
    const ctx = this.ctx;
    if (l.kind === 'alert') {
      drawText(ctx, '!', Math.round(l.x - 1), Math.round(l.y - 5), C.red, C.ink);
      return;
    }
    if (l.kind === 'speech') {
      const lines = wrap(l.text.toUpperCase(), 24);
      const tw = Math.max(...lines.map(textWidth));
      const bw = tw + 6;
      const bh = lines.length * 7 + 3;
      const x = clampInt(Math.round(l.x - bw / 2), 1, W - bw - 1);
      const y = clampInt(Math.round(l.y - bh - 3), 1, H - bh - 4);
      ctx.fillStyle = C.ink;
      ctx.fillRect(x - 1, y - 1, bw + 2, bh + 2);
      ctx.fillStyle = C.cream;
      ctx.fillRect(x, y, bw, bh);
      // Tail towards the speaker.
      const tx = clampInt(Math.round(l.x), x + 2, x + bw - 3);
      ctx.fillStyle = C.ink;
      ctx.fillRect(tx - 2, y + bh, 5, 2);
      ctx.fillRect(tx - 1, y + bh + 2, 3, 1);
      ctx.fillStyle = C.cream;
      ctx.fillRect(tx - 1, y + bh, 3, 1);
      ctx.fillRect(tx, y + bh + 1, 1, 1);
      lines.forEach((line, i) => drawText(ctx, line, x + 3 + Math.round((tw - textWidth(line)) / 2), y + 2 + i * 7, C.ink));
      return;
    }
    const tw = textWidth(l.text);
    const x = clampInt(Math.round(l.x - tw / 2), 2, W - tw - 2);
    const y = clampInt(Math.round(l.y - 5), 2, H - 8);
    if (l.kind === 'prompt') {
      ctx.fillStyle = 'rgba(31,21,16,0.7)';
      ctx.fillRect(x - 3, y - 2, tw + 6, 9);
      drawText(ctx, l.text, x, y, C.brassLight);
    } else {
      drawText(ctx, l.text, x, y, C.cream, C.ink);
    }
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

function clampInt(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Greedy word wrap. */
function wrap(text: string, max: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && line.length + 1 + word.length > max) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}
