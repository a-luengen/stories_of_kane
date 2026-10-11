import type { EquipSlot } from '../data/types';
import { weaponKey, WEAPON_SLOTS, type Equipment } from '../items/Equipment';
import type { GridContainer } from '../items/GridContainer';
import { CELL, type Layout, type Rect, type Zone } from './widgets';

const SLOT = 26;
const GAP = 3;
const PREVIEW_W = 48;
const PREVIEW_H = 72;
const LEFT: [EquipSlot, string][] = [
  ['hat', 'HAT'],
  ['neck', 'NECK'],
  ['top', 'TOP'],
  ['outerwear', 'COAT'],
];
const RIGHT: [EquipSlot, string][] = [
  ['legs', 'LEGS'],
  ['belt', 'BELT'],
  ['holster', 'HOLS'],
  ['boots', 'BOOT'],
];

export const PREVIEW_SIZE = { w: PREVIEW_W, h: PREVIEW_H };

/** Weapon slots 1-3 in a row. */
export function weaponSlotZones(eq: Equipment, x: number, y: number, w: number): Zone[] {
  const sw = Math.floor((w - (WEAPON_SLOTS - 1) * 2) / WEAPON_SLOTS);
  return Array.from({ length: WEAPON_SLOTS }, (_, i) => ({ kind: 'slot' as const, holder: eq, key: weaponKey(i), label: String(i + 1), x: x + i * (sw + 2), y, w: sw, h: 20 }));
}

export function gridZone(grid: GridContainer, x: number, y: number): Zone {
  return { kind: 'grid', grid, cell: CELL, x, y, w: grid.w * CELL, h: grid.h * CELL };
}

/**
 * Player inventory: character preview framed by clothing slots, weapon slots 1/2/3 below it,
 * the grid on the right. Centred on a W × H screen (low-res pixels).
 */
export function inventoryLayout(W: number, H: number, eq: Equipment, grid: GridContainer): Layout {
  const leftW = SLOT + 4 + PREVIEW_W + 4 + SLOT + 4;
  const colH = 4 * SLOT + 3 * GAP;
  const gridW = grid.w * CELL;
  const w = 6 + leftW + 10 + gridW + 6;
  const h = 8 + colH + 6 + 20 + 6;
  const panel: Rect & { title: string } = { x: Math.round((W - w) / 2), y: Math.max(10, Math.round((H - h) / 2)), w, h, title: 'INVENTORY' };
  const x0 = panel.x + 6;
  const y0 = panel.y + 8;
  const zones: Zone[] = [];
  LEFT.forEach(([key, label], i) => zones.push({ kind: 'slot', holder: eq, key, label, x: x0, y: y0 + i * (SLOT + GAP), w: SLOT, h: SLOT }));
  RIGHT.forEach(([key, label], i) => zones.push({ kind: 'slot', holder: eq, key, label, x: x0 + SLOT + 8 + PREVIEW_W, y: y0 + i * (SLOT + GAP), w: SLOT, h: SLOT }));
  zones.push({ kind: 'preview', x: x0 + SLOT + 4, y: y0 + Math.round((colH - PREVIEW_H) / 2), w: PREVIEW_W, h: PREVIEW_H });
  zones.push(...weaponSlotZones(eq, x0, y0 + colH + 6, SLOT * 2 + 8 + PREVIEW_W));
  zones.push(gridZone(grid, x0 + leftW + 10, y0));
  return { panels: [panel], zones };
}
