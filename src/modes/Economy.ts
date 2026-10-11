import { ECONOMY } from '../data/economy';
import type { ArchetypeId } from '../data/enemies';
import { SHOP, type ShopEntry } from '../data/shop';
import type { GridContainer } from '../items/GridContainer';
import { itemDef } from '../items/ItemDef';
import { createItem, type ItemInstance } from '../items/ItemInstance';
import { waveClearBonus } from './WaveDirector';

export type BuyResult = { ok: true; item: ItemInstance } | { ok: false; reason: 'locked' | 'funds' | 'space' };

/** Money that can be shared between several shops (one pocket, several merchants). */
export interface Purse {
  dollars: number;
  /** Total earned (for the stats). */
  earned: number;
}

/** The wallet, rewards and a merchant's prices. */
export class Economy {
  constructor(
    private stock: readonly ShopEntry[] = SHOP,
    readonly purse: Purse = { dollars: 0, earned: 0 },
  ) {}

  get wallet(): number {
    return this.purse.dollars;
  }

  set wallet(v: number) {
    this.purse.dollars = v;
  }

  /** Total dollars earned this run (for the stats). */
  get earned(): number {
    return this.purse.earned;
  }

  killReward(archetype: ArchetypeId, mounted: boolean): number {
    return ECONOMY.killReward[archetype] + (mounted ? ECONOMY.mountedBonus : 0);
  }

  waveBonus(wave: number): number {
    return waveClearBonus(wave);
  }

  earn(amount: number): void {
    this.purse.dollars += amount;
    this.purse.earned += amount;
  }

  entry(itemId: string): ShopEntry | undefined {
    return this.stock.find((e) => e.item === itemId);
  }

  /** Items for sale at this wave. */
  available(wave: number): ShopEntry[] {
    return this.stock.filter((e) => e.unlockWave <= wave);
  }

  /** A new instance of what one purchase of `e` gives. */
  makeItem(e: ShopEntry): ItemInstance {
    return createItem(e.item, e.quantity);
  }

  /**
   * Buy into the inventory (merging ammo, trying both orientations). All or nothing: refused
   * when locked, unaffordable or there isn't room for all of it.
   */
  buy(e: ShopEntry, inventory: GridContainer, wave: number, place?: (item: ItemInstance) => boolean): BuyResult {
    if (e.unlockWave > wave) return { ok: false, reason: 'locked' };
    if (this.wallet < e.price) return { ok: false, reason: 'funds' };
    const item = this.makeItem(e);
    const restore = inventory.snapshot();
    const stored = place ? place(item) : inventory.add(item) === 0;
    if (!stored) {
      restore();
      return { ok: false, reason: 'space' };
    }
    this.wallet -= e.price;
    return { ok: true, item };
  }

  /** What the merchant pays for an item (half the price; ammo per round). */
  sellValue(item: ItemInstance): number {
    const def = itemDef(item.defId);
    const e = this.entry(item.defId);
    const f = ECONOMY.sellFraction;
    if (def.stackable) {
      const perUnit = e ? e.price / e.quantity : ECONOMY.fallbackPrice[def.category] / Math.max(1, def.boxQuantity ?? 1);
      return Math.floor(perUnit * item.quantity * f);
    }
    return Math.floor((e?.price ?? ECONOMY.fallbackPrice[def.category]) * f);
  }

  /** Sell an item (the caller removes it from where it was). Returns the dollars received. */
  sell(item: ItemInstance): number {
    const v = this.sellValue(item);
    this.wallet += v;
    return v;
  }
}
