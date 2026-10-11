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
