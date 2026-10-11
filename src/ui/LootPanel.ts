import type { Equipment } from '../items/Equipment';
import type { GridContainer } from '../items/GridContainer';
import { gridZone, weaponSlotZones } from './InventoryPanel';
import { CELL, type Layout, type Zone } from './widgets';

/**
 * Split view for looting: the player's grid and weapon slots on the left, the corpse's grid,
 * its weapon and a "Take all" button on the right.
 */
export function lootLayout(
  W: number,
  H: number,
  player: { equipment: Equipment; inventory: GridContainer },
  corpse: { name: string; equipment: Equipment; inventory: GridContainer },
  takeAll: () => void,
): Layout {
  const gw = Math.max(player.inventory.w, corpse.inventory.w) * CELL;
  const gh = Math.max(player.inventory.h, corpse.inventory.h) * CELL;
  const pw = 6 + gw + 6;
  const ph = 8 + gh + 6 + 20 + 6;
  const gap = 14;
  const x = Math.round((W - (pw * 2 + gap)) / 2);
  const y = Math.max(10, Math.round((H - ph) / 2));
  const left = { x, y, w: pw, h: ph, title: 'YOU' };
  const right = { x: x + pw + gap, y, w: pw, h: ph, title: corpse.name.toUpperCase() };
  const zones: Zone[] = [
    gridZone(player.inventory, left.x + 6, y + 8),
    ...weaponSlotZones(player.equipment, left.x + 6, y + 8 + gh + 6, gw),
    gridZone(corpse.inventory, right.x + 6, y + 8),
    { kind: 'slot', holder: corpse.equipment, key: 'w0', label: 'GUN', x: right.x + 6, y: y + 8 + gh + 6, w: 50, h: 20 },
    { kind: 'button', label: 'TAKE ALL', action: takeAll, x: right.x + pw - 6 - 50, y: y + 8 + gh + 9, w: 50, h: 13 },
  ];
  return { panels: [left, right], zones };
}
