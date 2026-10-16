import type { DialogLine, DialogRunner } from '../quests/dialog';
import type { UiPointer } from './InventoryUI';
import { drawText, textWidth } from './PixelFont';
import { UI } from './theme';
import { drawCursor, drawPanel, wrapText } from './widgets';

const ROW_H = 9;
const LINE_H = 7;
/** Characters per second when nobody murmurs (your own lines). */
const PLAIN_RATE = 45;

export interface DialogKeys {
  /** 1–9 pressed this frame (0-based), or null. */
  digit: number | null;
  /** E / Space / Enter: finish the line at once. */
  skip: boolean;
}

/**
 * The conversation box at the bottom of the screen: the speaker's name, their line typed out
 * while they murmur it, then the choices (click or 1–9; greyed ones can't be taken).
 */
export class DialogPanel {
  private shown: DialogLine | null = null;
  private chars = 0;
  private rate = PLAIN_RATE;
  private rows: { x: number; y: number; w: number; index: number }[] = [];

  constructor(
    readonly runner: DialogRunner,
    /** Murmur a line in the NPC's voice; returns how long it takes (seconds). */
    private speak: (line: DialogLine) => number,
  ) {}

  get ended(): boolean {
    return this.runner.ended;
  }

  private get typing(): boolean {
    return !!this.shown && this.chars < this.shown.text.length;
  }

  update(dt: number, ptr: UiPointer, keys: DialogKeys): void {
    const line = this.runner.line;
    if (line !== this.shown) {
      this.shown = line;
      this.chars = 0;
      if (line) {
        const t = line.npcSpeaks ? this.speak(line) : 0;
        this.rate = t > 0.3 ? line.text.length / (t * 0.9) : PLAIN_RATE;
      }
    }
    if (!line) return;
    if (this.typing) {
      this.chars = Math.min(line.text.length, this.chars + this.rate * dt);
      // A key or a click finishes the line; it doesn't pick a choice yet.
      if (keys.skip || ptr.pressed || keys.digit !== null) this.chars = line.text.length;
      return;
    }
    let pick = keys.digit;
    if (pick === null && ptr.pressed) pick = this.rows.find((r) => ptr.x >= r.x && ptr.x < r.x + r.w && ptr.y >= r.y - 1 && ptr.y < r.y + ROW_H - 1)?.index ?? null;
    if (pick !== null) this.runner.pick(pick);
  }

  draw(ctx: CanvasRenderingContext2D, W: number, H: number, ptr: UiPointer): void {
    const line = this.shown;
    if (!line) return;
    const w = Math.min(W - 20, 330);
    const maxChars = Math.floor((w - 8) / 4);
    const text = wrapText(line.text.toUpperCase(), maxChars);
    // Sized for the choices from the start (they appear once the line is out), so it never jumps.
    const choices = this.typing ? [] : line.choices;
    const h = 6 + text.length * LINE_H + (line.choices.length ? 4 + line.choices.length * ROW_H : 0) + 2;
    const r = { x: Math.round((W - w) / 2), y: H - h - 8, w, h };
    drawPanel(ctx, r, line.speaker.toUpperCase());
    // The line, typed out.
    let left = Math.floor(this.chars);
    let y = r.y + 5;
    for (const l of text) {
      const part = l.slice(0, Math.max(0, left));
      left -= l.length + 1;
      drawText(ctx, part, r.x + 4, y, UI.cream);
      y += LINE_H;
    }
    this.rows = [];
    if (choices.length) {
      y += 4;
      choices.forEach((c, i) => {
        const label = `${i + 1}  ${c.text.toUpperCase()}`;
        const cw = Math.min(r.w - 6, textWidth(label) + 6);
        const over = !c.locked && ptr.x >= r.x + 2 && ptr.x < r.x + 2 + cw && ptr.y >= y - 1 && ptr.y < y + ROW_H - 1;
        if (over) {
          ctx.fillStyle = UI.darkBrown;
          ctx.fillRect(r.x + 2, y - 2, cw, ROW_H);
        }
        drawText(ctx, label, r.x + 5, y, c.locked ? UI.woodLight : over ? UI.brassLight : UI.sand);
        this.rows.push({ x: r.x + 2, y, w: cw, index: i });
        y += ROW_H;
      });
    }
    drawCursor(ctx, ptr.x, ptr.y);
  }
}
