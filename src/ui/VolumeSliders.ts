import type { AudioEngine } from '../audio/AudioEngine';
import { uiSound } from '../audio/uiSound';
import type { UiPointer } from './InventoryUI';
import { drawText, textWidth } from './PixelFont';
import { UI } from './theme';
import { inRect, type Rect } from './widgets';

type Channel = 'master' | 'effects' | 'voices' | 'ambience';
const ROWS: [Channel, string][] = [
  ['master', 'MASTER'],
  ['effects', 'EFFECTS'],
  ['voices', 'VOICES'],
  ['ambience', 'AMBIENCE'],
];
const ROW_H = 11;
const LABEL_W = 40;
const TRACK_W = 62;
const STEP = 0.1;

/** Volume sliders (pause menu): drag or click a track; with focus, ← / → change it by 10 %. */
export class VolumeSliders {
  /** Focused row, or null when the focus is elsewhere. */
  focus: number | null = null;
  private dragging: number | null = null;
  private tracks: Rect[] = [];

  constructor(private audio: AudioEngine) {}

  readonly rows = ROWS.length;
  readonly width = LABEL_W + TRACK_W + 22;
  get height(): number {
    return ROWS.length * ROW_H + 10;
  }

  update(x: number, y: number, ptr: UiPointer, mouseDown: boolean, left: boolean, right: boolean): void {
    this.tracks = ROWS.map((_, i) => ({ x: x + LABEL_W, y: y + 10 + i * ROW_H, w: TRACK_W, h: 7 }));
    const hover = this.tracks.findIndex((r) => inRect({ x: r.x - 2, y: r.y - 2, w: r.w + 4, h: r.h + 4 }, ptr.x, ptr.y));
    if (hover >= 0 && (ptr.moved || ptr.pressed)) this.focus = hover;
    if (ptr.pressed && hover >= 0) this.dragging = hover;
    if (!mouseDown) this.dragging = null;
    if (this.dragging !== null) {
      const r = this.tracks[this.dragging];
      this.set(this.dragging, Math.round(((ptr.x - r.x) / r.w) * 20) / 20);
    }
    if (this.focus !== null && (left || right)) {
      const ch = ROWS[this.focus][0];
      this.set(this.focus, Math.round((this.audio.settings[ch] + (right ? STEP : -STEP)) * 10) / 10);
    }
  }

  private set(row: number, v: number): void {
    const ch = ROWS[row][0];
    const value = Math.min(1, Math.max(0, v));
    if (Math.abs(value - this.audio.settings[ch]) < 1e-6) return;
    this.audio.setVolume(ch, value);
    uiSound('ui.slider');
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const title = this.audio.muted ? 'SOUND  (MUTED - M)' : 'SOUND  (M MUTES)';
    drawText(ctx, title, x, y, this.audio.muted ? UI.rust : UI.sand);
    ROWS.forEach(([ch, label], i) => {
      const r = this.tracks[i];
      if (!r) return;
      const focused = this.focus === i;
      drawText(ctx, label, x, r.y + 1, focused ? UI.brassLight : UI.cream, UI.ink);
      ctx.fillStyle = UI.ink;
      ctx.fillRect(r.x - 1, r.y - 1, r.w + 2, r.h + 2);
      ctx.fillStyle = UI.darkBrown;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      const v = this.audio.settings[ch];
      ctx.fillStyle = focused ? UI.brassLight : UI.brass;
      ctx.fillRect(r.x, r.y + 1, Math.round(r.w * v), r.h - 2);
      // Knob.
      const kx = r.x + Math.round(r.w * v) - 1;
      ctx.fillStyle = UI.cream;
      ctx.fillRect(Math.min(r.x + r.w - 2, Math.max(r.x, kx)), r.y - 1, 2, r.h + 2);
      const t = `${Math.round(v * 100)}`;
      drawText(ctx, t, r.x + r.w + 20 - textWidth(t), r.y + 1, UI.cream, UI.ink);
    });
  }
}
