import type { Equipment } from '../items/Equipment';
import type { GridContainer } from '../items/GridContainer';
import type { IconRenderer } from '../items/IconRenderer';
import type { ItemInstance } from '../items/ItemInstance';
import type { Economy } from '../modes/Economy';
import { gridZone, weaponSlotZones } from './InventoryPanel';
import { drawText, textWidth } from './PixelFont';
import { UI } from './theme';
import { drawIconFit } from './WeaponBar';
import { CELL, type Layout, type Rect, type Zone } from './widgets';

/** What the shop screen needs from the mode. */
export interface ShopHost {
  economy: Economy;
  /** Wave number used for unlocks. */
  wave(): number;
  /** Title over the stock. */
  title: string;
  merchantName: string;
  /** Whether the merchant buys this item (default: everything). */
  buys?(item: ItemInstance): boolean;
}

const TILE_W = 31;
const TILE_H = 21;

/**
 * Shop: the player's grid and weapon slots on the left, the merchant's stock on the right (drop
 * anything onto that side to sell it), the wallet on top.
 */
export function shopLayout(
  W: number,
  H: number,
  player: { equipment: Equipment; inventory: GridContainer },
  shop: ShopHost,
  page: number,
  setPage: (p: number) => void,
): Layout & { wallet: Rect; pages: number } {
  const gw = player.inventory.w * CELL;
  const gh = player.inventory.h * CELL;
  const pw = 6 + gw + 6;
  const ph = 8 + gh + 6 + 20 + 6;
  const gap = 14;
  const x = Math.round((W - (pw * 2 + gap)) / 2);
  const y = Math.max(16, Math.round((H - ph) / 2) + 4);
  const left = { x, y, w: pw, h: ph, title: 'YOU' };
  const right = { x: x + pw + gap, y, w: pw, h: ph, title: shop.title.toUpperCase() };
  const zones: Zone[] = [
    gridZone(player.inventory, left.x + 6, y + 8),
    ...weaponSlotZones(player.equipment, left.x + 6, y + 8 + gh + 6, gw),
  ];
  const wave = shop.wave();
  const cols = Math.floor((pw - 8) / (TILE_W + 1));
  const all = shop.economy.available(Infinity);
  // One page if it fits; otherwise a row less per page and < > buttons at the bottom.
  const fullRows = Math.floor((ph - 10) / (TILE_H + 1));
  const rows = all.length <= cols * fullRows ? fullRows : fullRows - 1;
  const perPage = cols * rows;
  const pages = Math.max(1, Math.ceil(all.length / perPage));
  const p = Math.min(page, pages - 1);
  all.slice(p * perPage, (p + 1) * perPage).forEach((entry, i) => {
    const cx = right.x + 5 + (i % cols) * (TILE_W + 1);
    const cy = y + 8 + Math.floor(i / cols) * (TILE_H + 1);
    zones.push({ kind: 'stock', entry, locked: entry.unlockWave > wave, x: cx, y: cy, w: TILE_W, h: TILE_H });
  });
  if (pages > 1) {
    const by = right.y + right.h - 17;
    zones.push({ kind: 'button', label: '<', action: () => setPage((p + pages - 1) % pages), x: right.x + 6, y: by, w: 18, h: 12 });
    zones.push({ kind: 'button', label: `${p + 1}/${pages}`, action: () => setPage((p + 1) % pages), x: right.x + Math.round(right.w / 2) - 14, y: by, w: 28, h: 12 });
    zones.push({ kind: 'button', label: '>', action: () => setPage((p + 1) % pages), x: right.x + right.w - 24, y: by, w: 18, h: 12 });
  }
  // The whole merchant side accepts items to sell (stock tiles take clicks first).
  zones.push({ kind: 'sell', x: right.x, y: right.y, w: right.w, h: right.h });
  return { panels: [left, right], zones, wallet: { x: x + pw * 2 + gap - 50, y: y - 18, w: 50, h: 9 }, pages };
}

export function drawStockTile(ctx: CanvasRenderingContext2D, z: Extract<Zone, { kind: 'stock' }>, icons: IconRenderer, affordable: boolean, hover: boolean): void {
  ctx.fillStyle = UI.ink;
  ctx.fillRect(z.x - 1, z.y - 1, z.w + 2, z.h + 2);
  ctx.fillStyle = hover ? UI.cellLine : UI.cell;
  ctx.fillRect(z.x, z.y, z.w, z.h);
  drawIconFit(ctx, icons.get(z.entry.item, CELL / 2), z.x + 1, z.y + 1, z.w - 2, z.h - 8, false, z.locked ? 0.35 : 1);
  if (z.locked) {
    const t = `W${z.entry.unlockWave}`;
    drawText(ctx, t, z.x + z.w - textWidth(t) - 1, z.y + z.h - 6, UI.woodPale);
  } else {
    const t = `$${z.entry.price}`;
    drawText(ctx, t, z.x + Math.round((z.w - textWidth(t)) / 2), z.y + z.h - 6, affordable ? UI.brassLight : UI.rust);
  }
  if (z.entry.quantity > 1) drawText(ctx, `${z.entry.quantity}`, z.x + 1, z.y + 1, UI.cream, UI.ink);
}

export function drawWallet(ctx: CanvasRenderingContext2D, r: Rect, dollars: number): void {
  const t = `$${dollars}`;
  const w = textWidth(t) + 8;
  const x = r.x + r.w - w;
  ctx.fillStyle = UI.ink;
  ctx.fillRect(x - 1, r.y - 1, w + 2, r.h + 2);
  ctx.fillStyle = UI.darkBrown;
  ctx.fillRect(x, r.y, w, r.h);
  drawText(ctx, t, x + 4, r.y + 2, UI.brassLight);
}
