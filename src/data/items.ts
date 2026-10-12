import { CONFIG } from '../config';
import { PAL } from '../render/palette';
import { ClothingRegistry } from './clothing';
import type { ClothingSlot, ItemDef } from './types';

const ammoStack = CONFIG.items.ammoMaxStack;

/** Grid footprint of clothing by slot. */
const CLOTHING_SIZE: Record<ClothingSlot, { w: number; h: number }> = {
  hat: { w: 2, h: 2 },
  top: { w: 2, h: 3 },
  outerwear: { w: 2, h: 3 },
  legs: { w: 2, h: 3 },
  fullBody: { w: 2, h: 4 },
  boots: { w: 2, h: 2 },
  neck: { w: 1, h: 1 },
  belt: { w: 2, h: 1 },
  holster: { w: 1, h: 2 },
};

/**
 * Every item in the game. Weapons and ammo are listed here; clothing items are generated from
 * the ClothingRegistry (one per entry), so new clothing only needs a registry entry.
 */
const DEFS: ItemDef[] = [
  {
    id: 'revolver',
    name: 'Revolver',
    description: 'Six-shot single action. Reliable at medium range.',
    category: 'weapon',
    size: { w: 2, h: 2 },
    stackable: false,
    maxStack: 1,
    weaponDefId: 'revolver',
  },
  {
    id: 'derringer',
    name: 'Derringer',
    description: 'Two-shot pocket pistol. Quick to draw, short-ranged. Pairs with a revolver.',
    category: 'weapon',
    size: { w: 1, h: 2 },
    stackable: false,
    maxStack: 1,
    weaponDefId: 'derringer',
  },
  {
    id: 'rifle',
    name: 'Rifle',
    description: 'Lever-action rifle. Slow, but true at long range.',
    category: 'weapon',
    size: { w: 4, h: 1 },
    stackable: false,
    maxStack: 1,
    weaponDefId: 'rifle',
  },
  {
    id: 'shotgun',
    name: 'Shotgun',
    description: 'Double-barrelled scattergun. Devastating up close.',
    category: 'weapon',
    size: { w: 4, h: 2 },
    stackable: false,
    maxStack: 1,
    weaponDefId: 'shotgun',
  },
  {
    id: 'ammo_revolver',
    name: 'Revolver Rounds',
    description: 'A box of .44 cartridges.',
    category: 'ammo',
    size: { w: 1, h: 1 },
    stackable: true,
    maxStack: ammoStack.revolverAmmo,
    ammoType: 'revolverAmmo',
    boxQuantity: 18,
    icon: { tint: PAL.red },
  },
  {
    id: 'ammo_rifle',
    name: 'Rifle Rounds',
    description: 'A box of long rifle cartridges.',
    category: 'ammo',
    size: { w: 1, h: 1 },
    stackable: true,
    maxStack: ammoStack.rifleAmmo,
    ammoType: 'rifleAmmo',
    boxQuantity: 10,
    icon: { tint: PAL.cactus },
  },
  {
    id: 'ammo_shells',
    name: 'Shotgun Shells',
    description: 'A box of buckshot shells.',
    category: 'ammo',
    size: { w: 1, h: 1 },
    stackable: true,
    maxStack: ammoStack.shotgunShells,
    ammoType: 'shotgunShells',
    boxQuantity: 6,
    icon: { tint: PAL.skyDeep },
  },
  {
    id: 'bandage',
    name: 'Bandage',
    description: 'Clean linen. Right-click or G to use: heals 40% over 2s.',
    category: 'consumable',
    size: { w: 1, h: 1 },
    stackable: true,
    maxStack: 5,
    heal: { fraction: 0.4, duration: 2 },
    icon: { tint: PAL.red },
  },
  {
    id: 'map_scrap_gulch',
    name: 'Map Scrap: Rattlesnake Gulch',
    description: 'A torn corner of a survey map, a canyon inked east of town. Right-click to study.',
    category: 'map',
    size: { w: 1, h: 1 },
    stackable: false,
    maxStack: 1,
    reveals: 'rattlesnake-gulch',
    icon: { tint: PAL.rust },
  },
  {
    id: 'map_scrap_ranch',
    name: 'Map Scrap: Two Spurs Ranch',
    description: 'A sketch of a ranch north of town, with a trail through the canyon. Right-click to study.',
    category: 'map',
    size: { w: 1, h: 1 },
    stackable: false,
    maxStack: 1,
    reveals: 'two-spurs-ranch',
    icon: { tint: PAL.cactus },
  },
  ...Object.values(ClothingRegistry).map(
    (c): ItemDef => ({
      id: c.id,
      name: c.name,
      description: c.description,
      category: 'clothing',
      size: CLOTHING_SIZE[c.slot],
      stackable: false,
      maxStack: 1,
      clothingId: c.id,
    }),
  ),
];

export const ITEMS: Record<string, ItemDef> = Object.fromEntries(DEFS.map((d) => [d.id, d]));
