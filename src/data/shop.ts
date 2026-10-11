import { ClothingRegistry } from './clothing';
import type { ClothingSlot, ItemCategory } from './types';

export interface ShopEntry {
  item: string;
  price: number;
  /** Items per purchase (ammo: rounds in the box). */
  quantity: number;
  /** First wave it's for sale. */
  unlockWave: number;
}

/** The merchant's stock. Ammo is always available; better guns unlock as the waves go on. */
export const SHOP: ShopEntry[] = [
  { item: 'ammo_revolver', price: 12, quantity: 18, unlockWave: 1 },
  { item: 'ammo_rifle', price: 16, quantity: 10, unlockWave: 1 },
  { item: 'ammo_shells', price: 14, quantity: 6, unlockWave: 1 },
  { item: 'bandage', price: 20, quantity: 1, unlockWave: 1 },
  { item: 'revolver', price: 60, quantity: 1, unlockWave: 1 },
  { item: 'rifle', price: 120, quantity: 1, unlockWave: 2 },
  { item: 'shotgun', price: 150, quantity: 1, unlockWave: 4 },
  // Cosmetics.
  ...['cowboy_hat_tan', 'cowboy_hat_black', 'duster_sand', 'duster_black', 'vest_brown', 'bandana_black', 'chaps_wood', 'boots_black', 'shirt_denim'].map((id) => ({
    item: id,
    price: ClothingRegistry[id].slot === 'outerwear' ? 40 : 25,
    quantity: 1,
    unlockWave: 1,
  })),
];

/** A sandbox merchant's shop: what they sell, and which kinds of items they buy. */
export interface MerchantShop {
  /** Shown over the stock. */
  title: string;
  stock: ShopEntry[];
  /** Item categories the merchant buys from you. */
  buys: ItemCategory[];
}

const CLOTHING_PRICE: Record<ClothingSlot, number> = {
  hat: 25,
  top: 18,
  outerwear: 40,
  legs: 28,
  fullBody: 45,
  boots: 30,
  neck: 10,
  belt: 15,
  holster: 20,
};

/** Shops run by town NPCs (NpcDef.shop). Everything is available from the start. */
export const MERCHANT_SHOPS: Record<string, MerchantShop> = {
  gunsmith: {
    title: 'GUNS & AMMO',
    stock: [
      { item: 'revolver', price: 60, quantity: 1, unlockWave: 1 },
      { item: 'rifle', price: 120, quantity: 1, unlockWave: 1 },
      { item: 'shotgun', price: 150, quantity: 1, unlockWave: 1 },
      { item: 'ammo_revolver', price: 12, quantity: 18, unlockWave: 1 },
      { item: 'ammo_rifle', price: 16, quantity: 10, unlockWave: 1 },
      { item: 'ammo_shells', price: 14, quantity: 6, unlockWave: 1 },
      { item: 'bandage', price: 20, quantity: 1, unlockWave: 1 },
    ],
    buys: ['weapon', 'ammo', 'consumable'],
  },
  tailor: {
    title: 'CLOTHIER',
    stock: Object.values(ClothingRegistry).map((c) => ({ item: c.id, price: CLOTHING_PRICE[c.slot], quantity: 1, unlockWave: 1 })),
    buys: ['clothing'],
  },
};
