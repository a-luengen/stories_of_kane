import type { QuestSystem } from '../quests/QuestSystem';
import { drawText, textWidth } from './PixelFont';
import { UI } from './theme';
import { dim } from './menuWidgets';
import { drawCursor, drawPanel, wrapText } from './widgets';

export type QuestDebugAction = { kind: 'start' | 'advance' | 'fail' | 'reset'; quest: string } | { kind: 'resetSave' };

const ROW_H = 9;
const BUTTONS = ['start', 'advance', 'fail', 'reset'] as const;
const LABEL: Record<(typeof BUTTONS)[number], string> = { start: 'START', advance: 'ADV', fail: 'FAIL', reset: 'RESET' };

interface Hit {
  x: number;
  y: number;
  w: number;
  action: QuestDebugAction;
}

/** 7: the quest catalog of this mode with each quest's state, buttons to drive them, and errors. */
export class QuestDebug {
  private hits: Hit[] = [];

  constructor(private quests: QuestSystem) {}

  hit(px: number, py: number): QuestDebugAction | null {
    return this.hits.find((h) => px >= h.x && px < h.x + h.w && py >= h.y - 1 && py < h.y + ROW_H - 1)?.action ?? null;
  }

  draw(ctx: CanvasRenderingContext2D, W: number, H: number, ptr: { x: number; y: number }, poi: string): void {
    const q = this.quests;
    const rt = q.runtime;
    dim(ctx, W, H, 0.45);
    const panelW = Math.min(W - 16, 320);
    const lines: { text: string; color: string; quest?: string }[] = [];
    lines.push({ text: `POI ${poi.toUpperCase()}   MODE ${q.mode.toUpperCase()}`, color: UI.sand });
    lines.push({ text: `PACKS ${q.loader.loadedIds.join(', ').toUpperCase() || '-'}`, color: UI.sand });
    if (!rt) lines.push({ text: 'LOADING CATALOG...', color: UI.cream });
    for (const e of q.catalog) {
      const s = rt?.state(e.id);
      const pack = rt?.pack(e.id);
      let status = s ? s.status.toUpperCase() : rt?.available(e.id) ? 'AVAILABLE' : 'LOCKED';
      if (s?.status === 'active' && pack) {
        const step = pack.steps[s.step];
        const t = rt!.timeLeft(e.id);
        status += `  ${s.step + 1}/${pack.steps.length} ${step.type.toUpperCase()} ${s.counter}${t !== null ? `  ${Math.ceil(t)}S` : ''}`;
      }
      lines.push({ text: e.title.toUpperCase(), color: UI.brassLight, quest: e.id });
      lines.push({ text: `  ${status}`, color: s?.status === 'failed' ? UI.rust : UI.cream });
    }
    const errors = q.allErrors.flatMap((e) => wrapText(e.toUpperCase(), Math.floor((panelW - 8) / 4)));
    const h = (lines.length + 2 + (errors.length ? errors.length + 1 : 0)) * ROW_H + 4;
    const r = { x: Math.round((W - panelW) / 2), y: Math.max(10, Math.round((H - h) / 2)), w: panelW, h: Math.min(h, H - 14) };
    drawPanel(ctx, r, 'QUEST DEBUG  7');
    this.hits = [];
    let y = r.y + 3;
    for (const l of lines) {
      drawText(ctx, l.text, r.x + 4, y + 1, l.color);
      if (l.quest) {
        let bx = r.x + r.w - 4;
        for (const b of [...BUTTONS].reverse()) {
          const w = textWidth(LABEL[b]) + 4;
          bx -= w + 2;
          this.button(ctx, bx, y, w, LABEL[b], { kind: b, quest: l.quest }, ptr);
        }
      }
      y += ROW_H;
    }
    y += 2;
    const w = textWidth('RESET QUEST SAVE') + 4;
    this.button(ctx, r.x + 4, y, w, 'RESET QUEST SAVE', { kind: 'resetSave' }, ptr);
    y += ROW_H + 2;
    if (errors.length) {
      drawText(ctx, 'ERRORS', r.x + 4, y + 1, UI.rust);
      y += ROW_H;
      for (const e of errors) {
        if (y > r.y + r.h - ROW_H) break;
        drawText(ctx, e, r.x + 4, y + 1, UI.cream);
        y += ROW_H;
      }
    }
    drawCursor(ctx, ptr.x, ptr.y);
  }

  private button(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, label: string, action: QuestDebugAction, ptr: { x: number; y: number }): void {
    const over = ptr.x >= x && ptr.x < x + w && ptr.y >= y - 1 && ptr.y < y + ROW_H - 1;
    ctx.fillStyle = over ? UI.woodLight : UI.darkBrown;
    ctx.fillRect(x, y - 1, w, ROW_H - 1);
    drawText(ctx, label, x + 2, y + 1, over ? UI.ink : UI.cream);
    this.hits.push({ x, y, w, action });
  }
}
