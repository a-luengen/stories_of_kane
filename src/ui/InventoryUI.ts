import type * as THREE from 'three';
import { uiSound } from '../audio/uiSound';
import type { Equipment } from '../items/Equipment';
import type { GridContainer } from '../items/GridContainer';
import type { IconRenderer } from '../items/IconRenderer';
import { ammoItemFor, clothingOf, itemDef, weaponOf } from '../items/ItemDef';
import { footprint, type ItemInstance } from '../items/ItemInstance';
import {
  beginDrag,
  beginSplit,
  canDrop,
  cancelDrag,
  dropDrag,
  quickEquip,
  quickMove,
  quickUnequip,
  takeAll,
  unloadWeapon,
  type Drag,
  type DropTarget,
  type Holding,
  type QuickResult,
} from '../items/transfer';
import { CharacterPreview } from './CharacterPreview';
import { inventoryLayout, PREVIEW_SIZE } from './InventoryPanel';
import { lootLayout } from './LootPanel';
import { drawStockTile, drawWallet, shopLayout, type ShopHost } from './ShopPanel';
import type { ShopEntry } from '../data/shop';
import { drawText, textWidth } from './PixelFont';
import { Dialog } from './menuWidgets';
import { JournalPanel, type JournalHost } from './JournalPanel';
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

/** What the loot view opens: a corpse (grid + gun slot) or a container (grid only). */
export interface LootTarget {
  name: string;
  inventory: GridContainer;
  /** Corpses: their weapon slot is lootable too. */
  equipment?: Equipment;
  /** Called after items were taken (e.g. to update the corpse's model). */
  lootChanged(): void;
}

export interface InventoryHost {
  player: ItemOwner & {
    appearance(): import('../data/types').AppearanceConfig;
    syncEquipment(): void;
    /** Selected weapon slot (double-clicking a handgun fills its off-hand). */
    active?: number | null;
  };
  icons: IconRenderer;
  /** Spawn the item on the ground next to the player. */
  dropToWorld(item: ItemInstance): void;
  toast(text: string): void;
  /** The quest journal (the QUESTS tab); none in wave mode. */
  journal?: JournalHost;
  /** Right-click: use a consumable or study a map scrap (lying in `from`). Returns why not, or null. */
  useItem?(item: ItemInstance, from: GridContainer): string | null;
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

/** Two clicks on the same thing within this many seconds make a double-click. */
const DOUBLE_CLICK = 0.4;
/** A press and release count as a click (not a drag) within this time and distance (low-res px). */
const CLICK_TIME = 0.3;
const CLICK_SLOP = 3;

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
  /** Where and when the pointer went down (to tell clicks from drags). */
  private press: { x: number; y: number; t: number } | null = null;
  private lastClick: { key: object; t: number } | null = null;
  /** A grid flashes red when something doesn't fit into it. */
  private flash: { grid: GridContainer; left: number } | null = null;
  /** "Drop the quest item?" (it may fail the quest). */
  private confirm: Dialog | null = null;
  /** The inventory screen's tabs (with a journal): INVENTORY | QUESTS. */
  tab: 'inventory' | 'quests' = 'inventory';
  private journal: JournalPanel | null = null;
  private tabRects: { tab: 'inventory' | 'quests'; r: Rect }[] = [];

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

  openInventory(tab: 'inventory' | 'quests' = 'inventory'): void {
    this.mode = { kind: 'inventory' };
    this.tab = this.host.journal ? tab : 'inventory';
  }

  /** Has tabs (the inventory screen, with a journal to show). */
  private get tabbed(): boolean {
    return this.mode?.kind === 'inventory' && !!this.host.journal;
  }

  private switchTab(tab: 'inventory' | 'quests'): void {
    if (tab === this.tab) return;
    if (this.drag) {
      cancelDrag(this.drag);
      this.drag = null;
      this.changed();
    }
    this.tab = tab;
    uiSound('ui.click');
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
    if (this.tabbed && this.tab === 'quests' && this.journal?.escape()) return;
    if (this.confirm) {
      this.confirm = null;
    } else if (this.buying) {
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
    if (this.mode?.kind === 'loot') return lootLayout(W, H, p, this.mode.target, () => this.takeAll());
    return inventoryLayout(W, H, p.equipment, p.inventory);
  }

  private walletRect: Rect = { x: 0, y: 0, w: 0, h: 0 };

  /** Loot view: everything that fits into the player's bags. */
  private takeAll(): void {
    if (this.mode?.kind !== 'loot') return;
    const t = this.mode.target;
    const p = this.host.player;
    // Off-hand first (taking the main gun would move the off-hand gun up into its place).
    const slots = t.equipment ? [{ holder: t.equipment, key: 'o0' as const }, { holder: t.equipment, key: 'w0' as const }] : [];
    const r = takeAll(t.inventory, p.inventory, slots);
    if (r.moved > 0) uiSound('inv.drop');
    if (r.leftover) {
      this.host.toast('Inventory full');
      this.deny(p.inventory);
    }
    this.changed();
  }

  /**
   * Unload a gun's rounds: into the grid it lies in; from your weapon slots into your bags (a
   * corpse's gun slot into the corpse's pockets).
   */
  private unload(item: ItemInstance, z: Zone): void {
    const p = this.host.player;
    let into: GridContainer;
    if (z.kind === 'grid') into = z.grid;
    else if (z.kind === 'slot' && z.holder !== p.equipment && this.mode?.kind === 'loot') into = this.mode.target.inventory;
    else into = p.inventory;
    const r = unloadWeapon(item, into);
    if (r.unloaded === 0 && r.left === 0) this.host.toast('Not loaded');
    else if (r.left > 0) {
      this.deny(into);
      this.host.toast(r.unloaded > 0 ? `No space for ${r.left} rounds` : 'No space');
    } else {
      this.host.toast(`Unloaded ${r.unloaded} rounds`);
      uiSound('inv.unload');
    }
    if (r.unloaded > 0 && r.left > 0) uiSound('inv.unload');
    this.changed();
  }

  /** True when this click on `key` completes a double-click. */
  private doubleClick(key: object): boolean {
    const d = this.lastClick !== null && this.lastClick.key === key && this.time - this.lastClick.t < DOUBLE_CLICK;
    this.lastClick = d ? null : { key, t: this.time };
    return d;
  }

  /** Where an item currently sits among the visible zones. */
  private holdingOf(item: ItemInstance): Holding | null {
    for (const z of this.layout?.zones ?? []) {
      if (z.kind === 'grid' && z.grid.find(item)) return { kind: 'grid', grid: z.grid };
      if (z.kind === 'slot' && z.holder.get(z.key) === item) return { kind: 'slot', holder: z.holder, key: z.key };
    }
    return null;
  }

  /**
   * Double-click on an item. Loot view: across to the other side. Inventory: equip from the
   * grid, or unequip into it. (Shop: nothing — selling needs a deliberate drag.)
   */
  private quickAction(item: ItemInstance): void {
    const h = this.holdingOf(item);
    if (!h || !this.mode) return;
    const p = this.host.player;
    let r: QuickResult;
    let into: GridContainer;
    if (this.mode.kind === 'loot') {
      const t = this.mode.target;
      const mine = h.kind === 'grid' ? h.grid === p.inventory : h.holder === p.equipment;
      if (mine && isQuestItem(item)) {
        this.host.toast('Quest items stay in your bags');
        uiSound('inv.noSpace');
        return;
      }
      into = mine ? t.inventory : p.inventory;
      r = quickMove(item, h, into);
    } else if (this.mode.kind === 'inventory') {
      into = p.inventory;
      if (h.kind === 'grid') {
        r = quickEquip(item, p.inventory, p.equipment, p.active ?? null);
        if (!r.ok && r.reason === 'noSlot') {
          if (itemDef(item.defId).category === 'weapon') this.host.toast('No free weapon slot');
          return;
        }
      } else {
        r = quickUnequip(h.holder, h.key, p.inventory);
      }
    } else {
      return;
    }
    if (r.ok) uiSound(this.mode.kind === 'inventory' && h.kind === 'grid' ? equipSound(item) : 'inv.drop');
    if (!r.ok || r.partial) {
      this.deny(into);
      this.host.toast(r.ok ? 'No space for all of it' : 'No space');
    }
    this.changed();
  }

  /** Something didn't fit: the grid blinks red and buzzes. */
  private deny(grid: GridContainer): void {
    this.flash = { grid, left: 0.4 };
    uiSound('inv.noSpace');
  }

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
    uiSound(r.ok ? 'shop.buy' : 'inv.noSpace');
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
  update(dt: number, ptr: UiPointer, keys: { rotate: boolean; shift: boolean; tab?: boolean }, W: number, H: number): void {
    if (!this.mode) return;
    this.time += dt;
    this.layout = this.buildLayout(W, H);
    // Tabs: click one, or Tab / Q to switch.
    if (this.tabbed) {
      if (keys.tab && !this.confirm) this.switchTab(this.tab === 'inventory' ? 'quests' : 'inventory');
      const t = ptr.pressed && !this.confirm ? this.tabRects.find((x) => inRect(x.r, ptr.x, ptr.y)) : undefined;
      if (t) {
        this.switchTab(t.tab);
        return;
      }
      if (this.tab === 'quests') {
        this.journal ??= new JournalPanel(this.host.journal!);
        this.journal.update(ptr, W, H);
        return;
      }
    }
    const { x, y } = ptr;
    const overflow = this.host.player.inventory;
    if (this.confirm) {
      this.confirm.update(W, H, ptr, { up: false, down: false, confirm: false, back: false });
      return;
    }

    if (this.flash) {
      this.flash.left -= dt;
      if (this.flash.left <= 0) this.flash = null;
    }

    // R: rotate what's held; with nothing held, "Take all" in the loot view.
    if (keys.rotate) {
      if (this.buying || this.drag) uiSound('inv.rotate');
      if (this.buying) this.buying.item.rotated = !this.buying.item.rotated;
      else if (this.drag) {
        this.drag.item.rotated = !this.drag.item.rotated;
        const f = footprint(this.drag.item);
        this.grab = { dx: (f.w * 16) / 2, dy: (f.h * 16) / 2 };
      } else if (this.mode.kind === 'loot') this.takeAll();
    }
    if (ptr.pressed) this.press = { x, y, t: this.time };
    const click = ptr.released && this.press !== null && Math.hypot(x - this.press.x, y - this.press.y) <= CLICK_SLOP && this.time - this.press.t <= CLICK_TIME;
    if (ptr.released) this.press = null;
    // Shift-clicks split stacks; they're never part of a double-click.
    const clicked = click && !keys.shift ? (this.drag?.item ?? null) : null;

    if (this.previewDrag) this.preview.yaw = this.previewDrag.yaw0 + (x - this.previewDrag.x0) * 0.05;

    // Right-click: use a consumable, study a map, or unload a gun.
    if (ptr.secondary && !this.drag && !this.buying) {
      const z = this.zoneAt(x, y);
      const item = z?.kind === 'grid' ? z.grid.at(Math.floor((x - z.x) / z.cell), Math.floor((y - z.y) / z.cell))?.item : z?.kind === 'slot' ? z.holder.get(z.key) : null;
      const def = item ? itemDef(item.defId) : null;
      if (item && (def?.heal || def?.reveals) && this.host.useItem && z?.kind === 'grid') {
        const why = this.host.useItem(item, z.grid);
        if (why) this.host.toast(why);
        uiSound(why ? 'inv.noSpace' : def?.reveals ? 'inv.lift' : 'inv.cloth');
      } else if (item && weaponOf(itemDef(item.defId)) && z) this.unload(item, z);
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
          if (this.drag) uiSound('inv.lift');
        }
      } else if (z?.kind === 'slot') {
        const item = z.holder.get(z.key);
        if (item) {
          const f = footprint(item);
          this.grab = { dx: (f.w * 16) / 2, dy: (f.h * 16) / 2 };
          this.drag = beginDrag({ kind: 'slot', holder: z.holder, key: z.key });
          uiSound('inv.lift');
          this.changed();
        }
      } else if (z?.kind === 'stock' && this.mode.kind === 'shop') {
        if (z.locked) this.host.toast(`Available from wave ${z.entry.unlockWave}`);
        else {
          const item = this.mode.shop.economy.makeItem(z.entry);
          const f = footprint(item);
          this.grab = { dx: (f.w * 16) / 2, dy: (f.h * 16) / 2 };
          this.buying = { entry: z.entry, item, from: z };
          uiSound('inv.lift');
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
        // Double-click on a tile buys into any free space; dragging onto a cell or slot buys it there.
        if (z?.kind === 'stock') {
          if (click && z.entry === b.entry && this.doubleClick(b.entry)) this.completePurchase(b.entry, b.item, undefined, x, y);
        } else if (z?.kind === 'grid' || (z?.kind === 'slot' && z.holder === this.host.player.equipment)) this.completePurchase(b.entry, b.item, z, x, y);
      }
      // Anywhere on the merchant's side (tiles and page buttons included) sells.
      const sellZone = this.mode?.kind === 'shop' ? this.layout.zones.find((z) => z.kind === 'sell') : undefined;
      if (this.drag && sellZone && inRect(sellZone, x, y) && this.mode?.kind === 'shop') {
        // Sold: the item is gone, the money is in the wallet (if this merchant deals in it).
        const d = this.drag;
        this.drag = null;
        const shop = this.mode.shop;
        if (isQuestItem(d.item)) {
          cancelDrag(d);
          uiSound('inv.noSpace');
          this.host.toast("Quest items can't be sold");
          this.changed();
          return;
        }
        if (shop.buys && !shop.buys(d.item)) {
          cancelDrag(d);
          uiSound('inv.noSpace');
          this.host.toast(`${shop.merchantName} doesn't buy that`);
          this.changed();
          return;
        }
        const v = this.mode.shop.economy.sell(d.item);
        if (d.splitFrom && d.splitFrom.quantity <= 0) this.host.player.inventory.remove(d.splitFrom);
        this.host.toast(`Sold ${itemDef(d.item.defId).name}  +$${v}`);
        uiSound('shop.sell');
        this.changed();
      }
      if (this.drag) {
        const d = this.drag;
        this.drag = null;
        const target = this.dropTarget(x, y);
        const questItem = isQuestItem(d.item);
        const fromBags = d.from.kind === 'grid' && d.from.grid === this.host.player.inventory;
        if (questItem && target?.kind === 'world') {
          // Dropping it may fail the quest: ask first.
          cancelDrag(d);
          this.askDrop(d.item);
          this.changed();
        } else if (questItem && fromBags && target?.kind === 'grid' && target.grid !== this.host.player.inventory) {
          cancelDrag(d);
          uiSound('inv.noSpace');
          this.host.toast('Quest items stay in your bags');
          this.changed();
        } else if (target) {
          const r = dropDrag(d, target, overflow);
          if (r.dropped) this.host.dropToWorld(r.dropped);
          // Where it landed: a worn piece rustles, a gun clicks into its slot, the rest is set down.
          if (!r.ok) uiSound('inv.noSpace');
          else if (target.kind === 'slot') uiSound(equipSound(d.item));
          else uiSound('inv.drop');
        } else {
          cancelDrag(d);
          uiSound('inv.drop');
        }
        this.changed();
      }
      // A click puts the item straight back; the second one in a row is a double-click.
      if (clicked && this.doubleClick(clicked)) this.quickAction(clicked);
    }
  }

  draw(ctx: CanvasRenderingContext2D, W: number, H: number, ptr: UiPointer): void {
    if (!this.mode || !this.layout) return;
    const icons = this.host.icons;
    const p = this.host.player;
    ctx.fillStyle = 'rgba(31,21,16,0.55)';
    ctx.fillRect(0, 0, W, H);
    if (this.tabbed) {
      const panel = this.layout.panels[0];
      drawPanel(ctx, panel, '');
      this.drawTabs(ctx, panel, ptr);
      if (this.tab === 'quests') {
        this.journal ??= new JournalPanel(this.host.journal!);
        const hint = 'TAB / Q SWITCH   CLICK A QUEST   I/ESC CLOSE';
        drawText(ctx, hint, Math.round(panel.x + panel.w / 2 - textWidth(hint) / 2), Math.min(H - 7, panel.y + panel.h + 7), UI.sand, UI.ink);
        this.journal.draw(ctx, panel, ptr, W, H);
        drawCursor(ctx, ptr.x, ptr.y);
        return;
      }
    } else for (const panel of this.layout.panels) drawPanel(ctx, panel, panel.title);

    // A worn dress blocks the top slot.
    const dressWorn = !!p.equipment.clothing.legs && clothingOf(itemDef(p.equipment.clothing.legs.defId))?.slot === 'fullBody';
    let hovered: ItemInstance | null = null;
    /** Drawn last, over the key hints. */
    let tooltip: { text: string; color?: string }[] | null = null;
    let hoveredStock: Extract<Zone, { kind: 'stock' }> | null = null;
    if (this.mode.kind === 'shop') drawWallet(ctx, this.walletRect, this.mode.shop.economy.wallet);
    for (const z of this.layout.zones) {
      if (z.kind === 'grid') {
        drawGridZone(ctx, z, icons, null);
        if (this.flash?.grid === z.grid) {
          // Didn't fit: a red blink over the grid.
          ctx.globalAlpha = Math.min(1, this.flash.left / 0.2);
          ctx.fillStyle = UI.invalid;
          ctx.fillRect(z.x, z.y, z.w, z.h);
          ctx.globalAlpha = 1;
        }
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
        this.preview.sync(p.appearance(), p.equipment.weaponDefs(), p.equipment.version, p.equipment.offHandDefs());
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
      tooltip = lines;
    } else if (hoveredStock) {
      const e = hoveredStock.entry;
      const lines = this.tooltip({ uid: 0, defId: e.item, quantity: e.quantity, rotated: false });
      lines.splice(1, 0, { text: hoveredStock.locked ? `FROM WAVE ${e.unlockWave}` : `PRICE $${e.price}`, color: hoveredStock.locked ? UI.rust : UI.brassLight });
      tooltip = lines;
    }

    // Key hints under the panels.
    const last = this.layout.panels[this.layout.panels.length - 1];
    const first = this.layout.panels[0];
    const hint =
      this.mode.kind === 'shop'
        ? 'DOUBLE-CLICK OR DRAG TO BUY   DRAG ONTO MERCHANT TO SELL   E/ESC CLOSE'
        : this.mode.kind === 'loot'
          ? 'DOUBLE-CLICK MOVES ACROSS   R TAKE ALL (ROTATES WHILE DRAGGING)   E/ESC CLOSE'
          : 'DOUBLE-CLICK EQUIP   R ROTATE   SHIFT SPLIT   DRAG OUT TO DROP   I/ESC CLOSE';
    const hx = Math.round((first.x + last.x + last.w) / 2 - textWidth(hint) / 2);
    drawText(ctx, hint, hx, Math.min(H - 7, last.y + last.h + 7), UI.sand, UI.ink);

    if (tooltip && !this.confirm) drawTooltip(ctx, tooltip, ptr.x, ptr.y, W, H);
    if (this.confirm) {
      ctx.fillStyle = 'rgba(31,21,16,0.5)';
      ctx.fillRect(0, 0, W, H);
      this.confirm.draw(ctx, W, H);
    }
    drawCursor(ctx, ptr.x, ptr.y);
  }

  /** INVENTORY | QUESTS plates on top of the panel; the open one is lit. */
  private drawTabs(ctx: CanvasRenderingContext2D, panel: Rect, ptr: UiPointer): void {
    const tabs = [
      { tab: 'inventory' as const, label: 'INVENTORY' },
      { tab: 'quests' as const, label: 'QUESTS' },
    ];
    const widths = tabs.map((t) => textWidth(t.label) + 8);
    let x = Math.round(panel.x + panel.w / 2 - (widths[0] + widths[1] + 4) / 2);
    this.tabRects = tabs.map((t, i) => {
      const r = { x, y: panel.y - 7, w: widths[i], h: 10 };
      x += widths[i] + 4;
      const on = t.tab === this.tab;
      const over = !on && inRect(r, ptr.x, ptr.y);
      ctx.fillStyle = UI.ink;
      ctx.fillRect(r.x - 1, r.y - 1, r.w + 2, r.h + 2);
      ctx.fillStyle = on ? UI.darkBrown : over ? UI.wood : UI.leather;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      drawText(ctx, t.label, r.x + 4, r.y + 3, on ? UI.brassLight : UI.sand);
      return { tab: t.tab, r };
    });
  }

  /** "Drop it?" for a quest item; yes drops it at your feet (it stays on this POI). */
  private askDrop(item: ItemInstance): void {
    const name = itemDef(item.defId).name;
    this.confirm = new Dialog('DROP QUEST ITEM?', `The ${name} is needed for a quest. Dropping it may fail the quest.`, [
      {
        label: 'DROP',
        action: () => {
          this.confirm = null;
          const h = this.holdingOf(item);
          if (h?.kind === 'grid') h.grid.remove(item);
          this.host.dropToWorld(item);
          uiSound('inv.drop');
          this.changed();
        },
      },
      { label: 'KEEP', action: () => (this.confirm = null) },
    ]);
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
      lines.push({ text: 'RIGHT-CLICK: UNLOAD', color: UI.woodPale });
    }
    const c = clothingOf(def);
    if (c) lines.push({ text: `SLOT ${SLOT_NAMES[c.slot]}`, color: UI.sand });
    return lines;
  }
}

/** Equipping: guns click, clothes rustle. */
function equipSound(item: ItemInstance): string {
  const cat = itemDef(item.defId).category;
  return cat === 'weapon' ? 'inv.gun' : cat === 'clothing' ? 'inv.cloth' : 'inv.drop';
}

/** A quest's own item (can't be sold or stored away; dropping it asks first). */
function isQuestItem(item: ItemInstance): boolean {
  return itemDef(item.defId).quest?.questItem === true;
}
