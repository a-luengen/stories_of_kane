import type * as THREE from 'three';
import type { Equipment } from '../items/Equipment';
import type { GridContainer } from '../items/GridContainer';
import type { IconRenderer } from '../items/IconRenderer';
import { ammoItemFor, clothingOf, itemDef, weaponOf } from '../items/ItemDef';
import { footprint, type ItemInstance } from '../items/ItemInstance';
import { beginDrag, beginSplit, canDrop, cancelDrag, dropDrag, takeAll, type Drag, type DropTarget } from '../items/transfer';
import { CharacterPreview } from './CharacterPreview';
import { inventoryLayout, PREVIEW_SIZE } from './InventoryPanel';
import { lootLayout } from './LootPanel';
import { drawStockTile, drawWallet, shopLayout, type ShopHost } from './ShopPanel';
import type { ShopEntry } from '../data/shop';
import { drawText, textWidth } from './PixelFont';
import { UI } from './theme';
import {
  drawButton,
  drawCursor,
  drawGridZone,
  drawItem,
  drawPanel,
  drawSlotZone,
  drawTooltip,
  inRect,
  wrapText,
  type Layout,
  type Rect,
  type Zone,
} from './widgets';

/** Someone with a bag and slots (the player, a corpse). */
export interface ItemOwner {
  equipment: Equipment;
  inventory: GridContainer;
}

export interface LootTarget extends ItemOwner {
  name: string;
  /** Called after items were taken (e.g. to update the corpse's model). */
  lootChanged(): void;
}

export interface InventoryHost {
  player: ItemOwner & { appearance(): import('../data/types').AppearanceConfig; syncEquipment(): void };
  icons: IconRenderer;
  /** Spawn the item on the ground next to the player. */
  dropToWorld(item: ItemInstance): void;
  toast(text: string): void;
  /** Right-click: use a consumable. Returns why not, or null. */
  useItem?(item: ItemInstance): string | null;
}

export interface UiPointer {
  x: number;
  y: number;
  pressed: boolean;
  released: boolean;
  /** The pointer moved since the last frame (so hover only steals keyboard focus on movement). */
  moved: boolean;
  /** Right button pressed this frame. */
  secondary?: boolean;
}

const SLOT_NAMES: Record<string, string> = {
  hat: 'HAT', top: 'TOP', legs: 'LEGS', fullBody: 'FULL BODY', outerwear: 'OUTERWEAR', neck: 'NECK', boots: 'BOOTS', belt: 'BELT', holster: 'HOLSTER',
};

/**
 * Inventory and loot screens (the game is paused while one is open). Pure presentation and
 * input; all item rules live in items/ (GridContainer, Equipment, transfer).
 */
export class InventoryUI {
  mode: { kind: 'inventory' } | { kind: 'loot'; target: LootTarget } | { kind: 'shop'; shop: ShopHost } | null = null;
  /** A shop item being dragged out of the stock (not paid for yet). */
  private buying: { entry: ShopEntry; item: ItemInstance; from: Zone } | null = null;
  readonly preview: CharacterPreview;
  private layout: Layout | null = null;
  private drag: Drag | null = null;
  /** Pointer offset from the dragged item's top-left (low-res px). */
  private grab = { dx: 0, dy: 0 };
  private previewDrag: { x0: number; yaw0: number } | null = null;
  private time = 0;

  constructor(
    private host: InventoryHost,
    renderer: THREE.WebGLRenderer,
  ) {
    this.preview = new CharacterPreview(renderer, PREVIEW_SIZE.w, PREVIEW_SIZE.h);
  }

  dispose(): void {
    this.preview.dispose();
  }

  get open(): boolean {
    return this.mode !== null;
  }

  openInventory(): void {
    this.mode = { kind: 'inventory' };
  }

  openLoot(target: LootTarget): void {
    this.mode = { kind: 'loot', target };
  }

  openShop(shop: ShopHost): void {
    this.mode = { kind: 'shop', shop };
    this.shopPage = 0;
  }

  private shopPage = 0;

  close(): void {
    if (this.drag) {
      cancelDrag(this.drag);
      this.drag = null;
      this.changed();
    }
    this.previewDrag = null;
    this.buying = null;
    this.preview.dragging = false;
    this.mode = null;
  }

  /** Esc: drop the held item back first, close on the next press. */
  escape(): void {
    if (this.buying) {
      this.buying = null;
    } else if (this.drag) {
      cancelDrag(this.drag);
      this.drag = null;
      this.changed();
    } else {
      this.close();
    }
  }

  private changed(): void {
    this.host.player.syncEquipment();
    if (this.mode?.kind === 'loot') this.mode.target.lootChanged();
  }

  private buildLayout(W: number, H: number): Layout {
    const p = this.host.player;
    if (this.mode?.kind === 'shop') {
      const l = shopLayout(W, H, p, this.mode.shop, this.shopPage, (pg) => (this.shopPage = pg));
      this.walletRect = l.wallet;
      return l;
    }
    if (this.mode?.kind === 'loot') {
      const t = this.mode.target;
      return lootLayout(W, H, p, t, () => {
        const r = takeAll(t.inventory, p.inventory, [{ holder: t.equipment, key: 'w0' }]);
        if (r.leftover) this.host.toast('Inventory full');
        this.changed();
      });
    }
    return inventoryLayout(W, H, p.equipment, p.inventory);
  }

  private walletRect: Rect = { x: 0, y: 0, w: 0, h: 0 };

  /** Buy a dragged / clicked stock item into a grid cell, a slot, or anywhere that fits. */
  private completePurchase(entry: ShopEntry, item: ItemInstance, z: Zone | undefined, x: number, y: number): void {
    if (this.mode?.kind !== 'shop') return;
    const { economy } = this.mode.shop;
    const inv = this.host.player.inventory;
    let place: ((it: ItemInstance) => boolean) | undefined;
    if (z?.kind === 'grid') {
      const cx = Math.round((x - this.grab.dx - z.x) / z.cell);
      const cy = Math.round((y - this.grab.dy - z.y) / z.cell);
      place = (it) => z.grid.place(it, cx, cy, item.rotated) || z.grid.place(it, cx, cy, !item.rotated);
    } else if (z?.kind === 'slot') {
      place = (it) => z.holder.accepts(z.key, it) && !z.holder.get(z.key) && z.holder.put(z.key, it, inv);
    }
    const r = economy.buy(entry, inv, this.mode.shop.wave(), place);
    const name = itemDef(entry.item).name;
    if (r.ok) this.host.toast(`Bought ${name}  -$${entry.price}`);
    else if (r.reason === 'funds') this.host.toast('Not enough money');
    else if (r.reason === 'locked') this.host.toast(`Available from wave ${entry.unlockWave}`);
    else this.host.toast(place ? 'No space there' : 'No space in your bags');
    this.changed();
  }

  private zoneAt(x: number, y: number): Zone | undefined {
    return this.layout?.zones.find((z) => inRect(z, x, y));
  }

  /** Where the held item would land if released now. null = inside a panel but nowhere valid. */
  private dropTarget(x: number, y: number): DropTarget | null {
    const z = this.zoneAt(x, y);
    if (z?.kind === 'grid') {
      return { kind: 'grid', grid: z.grid, x: Math.round((x - this.grab.dx - z.x) / z.cell), y: Math.round((y - this.grab.dy - z.y) / z.cell) };
    }
    if (z?.kind === 'slot') return { kind: 'slot', holder: z.holder, key: z.key };
    const insidePanel = this.layout?.panels.some((p) => inRect({ x: p.x - 4, y: p.y - 8, w: p.w + 8, h: p.h + 12 }, x, y));
    return insidePanel ? null : { kind: 'world' };
  }

  /** Handle pointer and keys for this frame. */
  update(dt: number, ptr: UiPointer, keys: { rotate: boolean; shift: boolean }, W: number, H: number): void {
    if (!this.mode) return;
    this.time += dt;
    this.layout = this.buildLayout(W, H);
    const { x, y } = ptr;
    const overflow = this.host.player.inventory;

    if (this.buying && keys.rotate) this.buying.item.rotated = !this.buying.item.rotated;
    if (this.drag && keys.rotate) {
      this.drag.item.rotated = !this.drag.item.rotated;
      const f = footprint(this.drag.item);
      this.grab = { dx: (f.w * 16) / 2, dy: (f.h * 16) / 2 };
    }

    if (this.previewDrag) this.preview.yaw = this.previewDrag.yaw0 + (x - this.previewDrag.x0) * 0.05;

    // Right-click a consumable in the grid to use it.
    if (ptr.secondary && !this.drag) {
      const z = this.zoneAt(x, y);
      const item = z?.kind === 'grid' ? z.grid.at(Math.floor((x - z.x) / z.cell), Math.floor((y - z.y) / z.cell))?.item : null;
      if (item && itemDef(item.defId).heal && this.host.useItem) {
        const why = this.host.useItem(item);
        if (why) this.host.toast(why);
      }
    }

    if (ptr.pressed && !this.drag) {
      const z = this.zoneAt(x, y);
      if (z?.kind === 'grid') {
        const cx = Math.floor((x - z.x) / z.cell);
        const cy = Math.floor((y - z.y) / z.cell);
        const p = z.grid.at(cx, cy);
        if (p) {
          this.grab = { dx: x - (z.x + p.x * z.cell), dy: y - (z.y + p.y * z.cell) };
          this.drag = keys.shift ? beginSplit(z.grid, cx, cy) : beginDrag({ kind: 'grid', grid: z.grid, x: cx, y: cy });
        }
      } else if (z?.kind === 'slot') {
        const item = z.holder.get(z.key);
        if (item) {
          const f = footprint(item);
          this.grab = { dx: (f.w * 16) / 2, dy: (f.h * 16) / 2 };
          this.drag = beginDrag({ kind: 'slot', holder: z.holder, key: z.key });
          this.changed();
        }
      } else if (z?.kind === 'stock' && this.mode.kind === 'shop') {
        if (z.locked) this.host.toast(`Available from wave ${z.entry.unlockWave}`);
        else {
          const item = this.mode.shop.economy.makeItem(z.entry);
          const f = footprint(item);
          this.grab = { dx: (f.w * 16) / 2, dy: (f.h * 16) / 2 };
          this.buying = { entry: z.entry, item, from: z };
        }
      } else if (z?.kind === 'button') {
        z.action();
      } else if (z?.kind === 'preview') {
        this.previewDrag = { x0: x, yaw0: this.preview.yaw };
        this.preview.dragging = true;
      }
    }

    if (ptr.released) {
      if (this.previewDrag) {
        this.previewDrag = null;
        this.preview.dragging = false;
      }
      if (this.buying) {
        const b = this.buying;
        this.buying = null;
        const z = this.zoneAt(x, y);
        // Click on the tile (or a drop anywhere on the merchant's side): buy into any free space.
        if (z?.kind === 'stock' || z?.kind === 'sell') this.completePurchase(b.entry, b.item, undefined, x, y);
        else if (z?.kind === 'grid' || (z?.kind === 'slot' && z.holder === this.host.player.equipment)) this.completePurchase(b.entry, b.item, z, x, y);
      }
      // Anywhere on the merchant's side (tiles and page buttons included) sells.
      const sellZone = this.mode?.kind === 'shop' ? this.layout.zones.find((z) => z.kind === 'sell') : undefined;
      if (this.drag && sellZone && inRect(sellZone, x, y) && this.mode?.kind === 'shop') {
        // Sold: the item is gone, the money is in the wallet (if this merchant deals in it).
        const d = this.drag;
        this.drag = null;
        const shop = this.mode.shop;
        if (shop.buys && !shop.buys(d.item)) {
          cancelDrag(d);
          this.host.toast(`${shop.merchantName} doesn't buy that`);
          this.changed();
          return;
        }
        const v = this.mode.shop.economy.sell(d.item);
        if (d.splitFrom && d.splitFrom.quantity <= 0) this.host.player.inventory.remove(d.splitFrom);
        this.host.toast(`Sold ${itemDef(d.item.defId).name}  +$${v}`);
        this.changed();
      }
      if (this.drag) {
        const d = this.drag;
        this.drag = null;
        const target = this.dropTarget(x, y);
        if (target) {
          const r = dropDrag(d, target, overflow);
          if (r.dropped) this.host.dropToWorld(r.dropped);
        } else {
          cancelDrag(d);
        }
        this.changed();
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, W: number, H: number, ptr: UiPointer): void {
    if (!this.mode || !this.layout) return;
    const icons = this.host.icons;
    const p = this.host.player;
    ctx.fillStyle = 'rgba(31,21,16,0.55)';
    ctx.fillRect(0, 0, W, H);
    for (const panel of this.layout.panels) drawPanel(ctx, panel, panel.title);

    // A worn dress blocks the top slot.
    const dressWorn = !!p.equipment.clothing.legs && clothingOf(itemDef(p.equipment.clothing.legs.defId))?.slot === 'fullBody';
    let hovered: ItemInstance | null = null;
    let hoveredStock: Extract<Zone, { kind: 'stock' }> | null = null;
    if (this.mode.kind === 'shop') drawWallet(ctx, this.walletRect, this.mode.shop.economy.wallet);
    for (const z of this.layout.zones) {
      if (z.kind === 'grid') {
        drawGridZone(ctx, z, icons, null);
        if (!this.drag && inRect(z, ptr.x, ptr.y)) hovered = z.grid.at(Math.floor((ptr.x - z.x) / z.cell), Math.floor((ptr.y - z.y) / z.cell))?.item ?? null;
      } else if (z.kind === 'slot') {
        drawSlotZone(ctx, z, icons, null, z.key === 'top' && dressWorn && z.holder === p.equipment);
        if (!this.drag && inRect(z, ptr.x, ptr.y)) hovered = z.holder.get(z.key);
      } else if (z.kind === 'button') {
        drawButton(ctx, z, inRect(z, ptr.x, ptr.y));
      } else if (z.kind === 'stock') {
        const shop = this.mode.kind === 'shop' ? this.mode.shop : null;
        drawStockTile(ctx, z, icons, (shop?.economy.wallet ?? 0) >= z.entry.price, inRect(z, ptr.x, ptr.y));
        if (!this.drag && !this.buying && inRect(z, ptr.x, ptr.y)) hoveredStock = z;
      } else if (z.kind === 'sell') {
        // Highlight the merchant's side while carrying something to sell.
        if (this.drag && inRect(z, ptr.x, ptr.y) && this.mode.kind === 'shop') {
          const shop = this.mode.shop;
          const buys = !shop.buys || shop.buys(this.drag.item);
          ctx.fillStyle = buys ? UI.valid : UI.invalid;
          ctx.fillRect(z.x, z.y, z.w, z.h);
          const t = buys ? `SELL +$${shop.economy.sellValue(this.drag.item)}` : "DOESN'T BUY THAT";
          drawText(ctx, t, z.x + Math.round((z.w - textWidth(t)) / 2), z.y + z.h - 9, UI.brassLight, UI.ink);
        }
      } else {
        this.preview.sync(p.appearance(), p.equipment.weaponDefs(), p.equipment.version);
        this.preview.render(1 / 60);
        ctx.drawImage(this.preview.canvas, z.x, z.y);
      }
    }

    // Held item: target highlight (green = valid, red = snaps back) and the icon under the pointer.
    if (this.drag) {
      const item = this.drag.item;
      const f = footprint(item);
      const target = this.dropTarget(ptr.x, ptr.y);
      const z = this.zoneAt(ptr.x, ptr.y);
      if (target && target.kind !== 'world' && z) {
        const ok = canDrop(this.drag, target, p.inventory);
        ctx.fillStyle = ok ? UI.valid : UI.invalid;
        if (target.kind === 'grid' && z.kind === 'grid') {
          const rx = z.x + target.x * z.cell;
          const ry = z.y + target.y * z.cell;
          const rw = f.w * z.cell;
          const rh = f.h * z.cell;
          const cx0 = Math.max(rx, z.x);
          const cy0 = Math.max(ry, z.y);
          ctx.fillRect(cx0, cy0, Math.min(rx + rw, z.x + z.w) - cx0, Math.min(ry + rh, z.y + z.h) - cy0);
        } else {
          ctx.fillRect(z.x, z.y, z.w, z.h);
        }
      }
      const rx = Math.round(ptr.x - this.grab.dx);
      const ry = Math.round(ptr.y - this.grab.dy);
      drawItem(ctx, item, { x: rx, y: ry, w: f.w * 16, h: f.h * 16 }, icons, 0.9);
      if (target?.kind === 'world') {
        const t = 'DROP';
        drawText(ctx, t, Math.round(ptr.x - textWidth(t) / 2), ry - 7, UI.brassLight, UI.ink);
      }
    } else if (this.buying) {
      const f = footprint(this.buying.item);
      drawItem(ctx, this.buying.item, { x: Math.round(ptr.x - this.grab.dx), y: Math.round(ptr.y - this.grab.dy), w: f.w * 16, h: f.h * 16 }, icons, 0.9);
    } else if (hovered) {
      const lines = this.tooltip(hovered);
      if (this.mode.kind === 'shop') lines.push({ text: `SELLS FOR $${this.mode.shop.economy.sellValue(hovered)}`, color: UI.brassLight });
      drawTooltip(ctx, lines, ptr.x, ptr.y, W, H);
    } else if (hoveredStock) {
      const e = hoveredStock.entry;
      const lines = this.tooltip({ uid: 0, defId: e.item, quantity: e.quantity, rotated: false });
      lines.splice(1, 0, { text: hoveredStock.locked ? `FROM WAVE ${e.unlockWave}` : `PRICE $${e.price}`, color: hoveredStock.locked ? UI.rust : UI.brassLight });
      drawTooltip(ctx, lines, ptr.x, ptr.y, W, H);
    }

    // Key hints under the panels.
    const last = this.layout.panels[this.layout.panels.length - 1];
    const first = this.layout.panels[0];
    const hint = this.mode.kind === 'shop' ? 'CLICK OR DRAG TO BUY   DRAG ONTO MERCHANT TO SELL   E/ESC CLOSE' : this.mode.kind === 'loot' ? 'DRAG ACROSS   R ROTATE   SHIFT SPLIT   DRAG OUT TO DROP   E/ESC CLOSE' : 'R ROTATE   SHIFT SPLIT   DRAG OUT TO DROP   I/ESC CLOSE';
    const hx = Math.round((first.x + last.x + last.w) / 2 - textWidth(hint) / 2);
    drawText(ctx, hint, hx, Math.min(H - 7, last.y + last.h + 7), UI.sand, UI.ink);

    drawCursor(ctx, ptr.x, ptr.y);
  }

  private tooltip(item: ItemInstance): { text: string; color?: string }[] {
    const def = itemDef(item.defId);
    const lines: { text: string; color?: string }[] = [{ text: def.name, color: UI.brassLight }];
    for (const l of wrapText(def.description.toUpperCase(), 30)) lines.push({ text: l });
    if (def.stackable) lines.push({ text: `QUANTITY ${item.quantity}/${def.maxStack}`, color: UI.sand });
    const w = weaponOf(def);
    if (w) {
      const pellets = typeof w.pellets === 'number' ? (w.pellets > 1 ? ` X${w.pellets}` : '') : ` X${w.pellets[0]}-${w.pellets[1]}`;
      lines.push({ text: `DAMAGE ${w.damage}${pellets}`, color: UI.sand });
      lines.push({ text: `FIRE RATE ${(1 / w.fireInterval).toFixed(1)}/S`, color: UI.sand });
      lines.push({ text: `AMMO ${ammoItemFor(w.ammoType)?.name ?? w.ammoType}`, color: UI.sand });
      lines.push({ text: `LOADED ${item.loadedRounds ?? 0}/${w.magazine}`, color: UI.sand });
    }
    const c = clothingOf(def);
    if (c) lines.push({ text: `SLOT ${SLOT_NAMES[c.slot]}`, color: UI.sand });
    return lines;
  }
}
