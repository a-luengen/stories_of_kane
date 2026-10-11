import { PAL } from '../render/palette';
import type { ClothingDef } from './types';

const defs: ClothingDef[] = [
  // Hats.
  { id: 'cowboy_hat_brown', name: 'Brown Stetson', description: 'Sweat-stained and trail-worn.', slot: 'hat', kind: 'cowboyHat', color: PAL.brown, trim: PAL.ink },
  { id: 'cowboy_hat_tan', name: 'Tan Stetson', description: 'A light felt hat with a leather band.', slot: 'hat', kind: 'cowboyHat', color: PAL.woodPale, trim: PAL.darkBrown },
  { id: 'cowboy_hat_dark', name: 'Dark Stetson', description: 'Dark felt with a red band.', slot: 'hat', kind: 'cowboyHat', color: PAL.darkBrown, trim: PAL.red },
  { id: 'cowboy_hat_black', name: 'Black Stetson', description: 'Black felt, brass-studded band.', slot: 'hat', kind: 'cowboyHat', color: PAL.ink, trim: PAL.brass },
  { id: 'bonnet_cream', name: 'Bonnet', description: 'Keeps the sun off.', slot: 'hat', kind: 'bonnet', color: PAL.cream, trim: PAL.skyDeep },

  // Tops and outerwear.
  { id: 'shirt_cream', name: 'Cream Shirt', description: 'Plain cotton work shirt.', slot: 'top', kind: 'shirt', color: PAL.cream },
  { id: 'shirt_rust', name: 'Rust Shirt', description: 'Faded red flannel.', slot: 'top', kind: 'shirt', color: PAL.rustLight },
  { id: 'shirt_denim', name: 'Denim Shirt', description: 'Heavy blue work shirt.', slot: 'top', kind: 'shirt', color: PAL.denim },
  { id: 'poncho_rust', name: 'Poncho', description: 'Woven wool with a cream stripe.', slot: 'outerwear', kind: 'poncho', color: PAL.rustLight, trim: PAL.cream },
  { id: 'vest_brown', name: 'Leather Vest', description: 'Brown leather, open front.', slot: 'outerwear', kind: 'vest', color: PAL.brown },
  { id: 'duster_sand', name: 'Duster', description: 'Long canvas riding coat.', slot: 'outerwear', kind: 'duster', color: PAL.sandDark },

  // Legs and full body.
  { id: 'trousers_denim', name: 'Denim Trousers', description: 'Riveted work trousers.', slot: 'legs', kind: 'trousers', color: PAL.denim },
  { id: 'trousers_brown', name: 'Brown Trousers', description: 'Wool trousers.', slot: 'legs', kind: 'trousers', color: PAL.brown },
  { id: 'chaps_wood', name: 'Chaps', description: 'Fringed leather chaps over canvas trousers.', slot: 'legs', kind: 'chaps', color: PAL.wood, trim: PAL.sandDark },
  { id: 'dress_blue', name: 'Blue Dress', description: 'Long prairie dress with cream trim.', slot: 'fullBody', kind: 'dress', color: PAL.skyDeep, trim: PAL.cream },

  // Accessories.
  { id: 'bandana_red', name: 'Red Bandana', description: 'Keeps the dust out.', slot: 'neck', kind: 'bandana', color: PAL.red },
  { id: 'boots_brown', name: 'Brown Boots', description: 'Riding boots.', slot: 'boots', kind: 'boots', color: PAL.darkBrown },
  { id: 'boots_black', name: 'Black Boots', description: 'Polished, mostly.', slot: 'boots', kind: 'boots', color: PAL.ink },
  { id: 'belt_leather', name: 'Leather Belt', description: 'Brass buckle.', slot: 'belt', kind: 'belt', color: PAL.darkBrown, trim: PAL.brass },
  { id: 'holster_leather', name: 'Holster', description: 'Hip holster for a revolver.', slot: 'holster', kind: 'holster', color: PAL.brown },
];

/** All clothing, by id. Each entry also becomes an inventory item (see data/items.ts). */
export const ClothingRegistry: Record<string, ClothingDef> = Object.fromEntries(defs.map((d) => [d.id, d]));

export function clothingDef(id: string): ClothingDef {
  const d = ClothingRegistry[id];
  if (!d) throw new Error(`Unknown clothing "${id}"`);
  return d;
}
