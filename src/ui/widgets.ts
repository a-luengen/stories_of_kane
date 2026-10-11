import type { ShopEntry } from '../data/shop';
import type { SlotHolder, SlotKey } from '../items/Equipment';
import type { GridContainer } from '../items/GridContainer';
import type { IconRenderer } from '../items/IconRenderer';
import { itemDef } from '../items/ItemDef';
import { footprint, type ItemInstance } from '../items/ItemInstance';
import { drawText, textWidth } from './PixelFont';
import { UI } from './theme';
import { drawIconFit } from './WeaponBar';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Interactive regions of a panel layout. */
export type Zone =
  | ({ kind: 'grid'; grid: GridContainer; cell: number } & Rect)
  | ({ kind: 'slot'; holder: SlotHolder; key: SlotKey; label: string } & Rect)
  | ({ kind: 'button'; label: string; action: () => void } & Rect)
  | ({ kind: 'preview' } & Rect)
  | ({ kind: 'stock'; entry: ShopEntry; locked: boolean } & Rect)
  /** Drop a carried item here to sell it. */
  | ({ kind: 'sell' } & Rect);

export interface Layout {
  /** Panel frames (dropping outside all of them drops into the world). */
  panels: (Rect & { title: string })[];
  zones: Zone[];
}

export const CELL = 16;

export const inRect = (r: Rect, x: number, y: number) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;

/** Wooden frame with a leather inside and a title plate. */
export function drawPanel(ctx: CanvasRenderingContext2D, r: Rect, title: string): void {
  const { x, y, w, h } = r;
  ctx.fillStyle = UI.ink;
  ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  ctx.fillStyle = UI.wood;
  ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
  ctx.fillStyle = UI.woodPale; // top / left highlight
  ctx.fillRect(x - 3, y - 3, w + 6, 1);
  ctx.fillRect(x - 3, y - 3, 1, h + 6);
  ctx.fillStyle = UI.darkBrown; // bottom / right shade
  ctx.fillRect(x - 3, y + h + 2, w + 6, 1);
  ctx.fillRect(x + w + 2, y - 3, 1, h + 6);
  // Nails in the corners.
  ctx.fillStyle = UI.brass;
  for (const [nx, ny] of [[x - 2, y - 2], [x + w + 1, y - 2], [x - 2, y + h + 1], [x + w + 1, y + h + 1]]) ctx.fillRect(nx, ny, 1, 1);
  ctx.fillStyle = UI.ink;
  ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = UI.leather;
  ctx.fillRect(x, y, w, h);
  // Title plate.
  const tw = textWidth(title) + 8;
  const tx = Math.round(x + w / 2 - tw / 2);
  ctx.fillStyle = UI.ink;
  ctx.fillRect(tx - 1, y - 7, tw + 2, 11);
  ctx.fillStyle = UI.darkBrown;
  ctx.fillRect(tx, y - 6, tw, 9);
  drawText(ctx, title, tx + 4, y - 4, UI.brassLight);
}

export function drawGridZone(ctx: CanvasRenderingContext2D, z: Extract<Zone, { kind: 'grid' }>, icons: IconRenderer, hidden: ItemInstance | null): void {
  const { grid, cell } = z;
  ctx.fillStyle = UI.ink;
  ctx.fillRect(z.x - 1, z.y - 1, z.w + 2, z.h + 2);
  for (let cy = 0; cy < grid.h; cy++) {
    for (let cx = 0; cx < grid.w; cx++) {
      ctx.fillStyle = UI.cellLine;
      ctx.fillRect(z.x + cx * cell, z.y + cy * cell, cell, cell);
      ctx.fillStyle = UI.cell;
      ctx.fillRect(z.x + cx * cell + 1, z.y + cy * cell + 1, cell - 1, cell - 1);
    }
  }
  for (const p of grid.placements) {
    if (p.item === hidden) continue;
    const f = footprint(p.item);
    const r = { x: z.x + p.x * cell, y: z.y + p.y * cell, w: f.w * cell, h: f.h * cell };
    ctx.fillStyle = 'rgba(156,107,62,0.25)';
    ctx.fillRect(r.x + 1, r.y + 1, r.w - 1, r.h - 1);
    drawItem(ctx, p.item, r, icons);
  }
}

/** Item icon in a rect, with stack count / loaded rounds. */
export function drawItem(ctx: CanvasRenderingContext2D, item: ItemInstance, r: Rect, icons: IconRenderer, alpha = 1): void {
  const def = itemDef(item.defId);
  // Full-size icons where they fit, the half-size set in small slots (crisper than scaling down).
  const f = footprint(item);
  const px = f.w * CELL <= r.w && f.h * CELL <= r.h ? CELL : CELL / 2;
  drawIconFit(ctx, icons.get(item.defId, px), r.x, r.y, r.w, r.h, item.rotated, alpha);
  if (def.stackable) {
    const t = String(item.quantity);
    drawText(ctx, t, r.x + r.w - textWidth(t) - 1, r.y + r.h - 6, UI.cream, UI.ink);
  } else if (item.loadedRounds !== undefined) {
    const t = String(item.loadedRounds);
    drawText(ctx, t, r.x + r.w - textWidth(t) - 1, r.y + r.h - 6, UI.brassLight, UI.ink);
  }
}

export function drawSlotZone(ctx: CanvasRenderingContext2D, z: Extract<Zone, { kind: 'slot' }>, icons: IconRenderer, hidden: ItemInstance | null, dim = false): void {
  ctx.fillStyle = UI.ink;
  ctx.fillRect(z.x - 1, z.y - 1, z.w + 2, z.h + 2);
  ctx.fillStyle = dim ? UI.darkBrown : UI.cell;
  ctx.fillRect(z.x, z.y, z.w, z.h);
  ctx.fillStyle = UI.cellLine;
  ctx.fillRect(z.x, z.y, z.w, 1);
  const item = z.holder.get(z.key);
  if (item && item !== hidden) drawItem(ctx, item, { x: z.x + 1, y: z.y + 1, w: z.w - 2, h: z.h - 2 }, icons);
  else drawText(ctx, z.label, z.x + Math.round((z.w - textWidth(z.label)) / 2), z.y + Math.round(z.h / 2 - 2), UI.cellLine);
}

export function drawButton(ctx: CanvasRenderingContext2D, z: Extract<Zone, { kind: 'button' }>, hover: boolean): void {
  ctx.fillStyle = UI.ink;
  ctx.fillRect(z.x - 1, z.y - 1, z.w + 2, z.h + 2);
  ctx.fillStyle = hover ? UI.woodLight : UI.wood;
  ctx.fillRect(z.x, z.y, z.w, z.h);
  ctx.fillStyle = UI.woodPale;
  ctx.fillRect(z.x, z.y, z.w, 1);
  drawText(ctx, z.label, z.x + Math.round((z.w - textWidth(z.label)) / 2), z.y + Math.round(z.h / 2 - 2), UI.cream, UI.ink);
}

/** Tooltip box near the cursor, kept on screen. */
export function drawTooltip(ctx: CanvasRenderingContext2D, lines: { text: string; color?: string }[], mx: number, my: number, W: number, H: number): void {
  const w = Math.max(...lines.map((l) => textWidth(l.text))) + 8;
  const h = lines.length * 7 + 5;
  const x = Math.min(W - w - 2, mx + 8);
  const y = Math.min(H - h - 2, my + 8);
  ctx.fillStyle = UI.ink;
  ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = UI.darkBrown;
  ctx.fillRect(x, y, w, h);
  lines.forEach((l, i) => drawText(ctx, l.text, x + 4, y + 3 + i * 7, l.color ?? UI.cream));
}

/** Greedy word wrap. */
export function wrapText(text: string, max: number): string[] {
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

/** Small pixel arrow cursor (the crosshair is hidden while a panel or menu is open). */
export function drawCursor(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const rows = ['1', '11', '121', '1221', '12221', '122221', '1222111', '12121', '11 121', '   11'];
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      if (row[i] === ' ') continue;
      ctx.fillStyle = row[i] === '1' ? UI.ink : UI.cream;
      ctx.fillRect(Math.round(x) + i, Math.round(y) + j, 1, 1);
    }
  });
}
