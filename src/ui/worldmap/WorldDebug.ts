import type { WorldDef } from '../../data/world';
import { drawText } from '../PixelFont';
import { UI } from '../theme';
import { dim } from '../menuWidgets';
import { drawCursor, drawPanel } from '../widgets';

export type WorldDebugAction = { kind: 'reveal' } | { kind: 'reset' } | { kind: 'zones' } | { kind: 'teleport'; poi: string; exit: string };

interface Row {
  label: () => string;
  action: WorldDebugAction | null;
  header?: boolean;
}

const ROW_H = 9;
const PANEL_W = 190;

/** 0: reveal or reset the world map, show exit zones, jump to any place's exit. */
export class WorldDebug {
  private rows: Row[];

  constructor(world: WorldDef, zonesShown: () => boolean) {
    this.rows = [
      { label: () => 'REVEAL ALL PLACES AND TRAILS', action: { kind: 'reveal' } },
      { label: () => 'RESET DISCOVERY', action: { kind: 'reset' } },
      { label: () => `SHOW EXIT ZONES: ${zonesShown() ? 'ON' : 'OFF'}`, action: { kind: 'zones' } },
      { label: () => 'TELEPORT TO', action: null, header: true },
      ...world.pois.flatMap((p) => p.exits.map((e): Row => ({ label: () => `${p.name.toUpperCase()} - ${e.id.toUpperCase()}`, action: { kind: 'teleport', poi: p.id, exit: e.id } }))),
    ];
  }

  private layout(W: number, H: number) {
    const h = this.rows.length * ROW_H + 6;
    return { x: Math.round((W - PANEL_W) / 2), y: Math.round((H - h) / 2) + 4, w: PANEL_W, h };
  }

  /** The action under the pointer (rows you can click). */
  hit(px: number, py: number, W: number, H: number): WorldDebugAction | null {
    const r = this.layout(W, H);
    if (px < r.x || px >= r.x + r.w) return null;
    const i = Math.floor((py - r.y - 3) / ROW_H);
    return this.rows[i]?.action ?? null;
  }

  draw(ctx: CanvasRenderingContext2D, W: number, H: number, ptr: { x: number; y: number }): void {
    dim(ctx, W, H, 0.45);
    const r = this.layout(W, H);
    drawPanel(ctx, r, 'WORLD DEBUG  0');
    const over = this.hit(ptr.x, ptr.y, W, H);
    this.rows.forEach((row, i) => {
      const y = r.y + 3 + i * ROW_H;
      if (row.action && row.action === over) {
        ctx.fillStyle = UI.darkBrown;
        ctx.fillRect(r.x + 2, y - 1, r.w - 4, ROW_H);
      }
      const indent = row.action?.kind === 'teleport' ? 10 : 4;
      drawText(ctx, row.label(), r.x + indent, y + 1, row.header ? UI.brass : row.action === over ? UI.brassLight : UI.cream);
    });
    drawCursor(ctx, ptr.x, ptr.y);
  }
}
