import { PAL } from '../render/palette';
import type { AppearanceConfig, ItemGrant } from './types';

/** The player's look at the start: body traits plus the clothes worn (each becomes an equipped item). */
export const PLAYER_APPEARANCE: AppearanceConfig = {
  body: 'male',
  skin: PAL.skin,
  hair: PAL.darkBrown,
  hairStyle: 'short',
  beard: PAL.brown,
  clothing: {
    hat: 'cowboy_hat_brown',
    top: 'shirt_cream',
    outerwear: 'poncho_rust',
    neck: 'bandana_red',
    legs: 'trousers_denim',
    belt: 'belt_leather',
    holster: 'holster_leather',
    boots: 'boots_brown',
  },
};

/** Starting kit: weapon slots 1-3 and grid contents (each grant is its own stack). */
export const PLAYER_START: { weapons: (string | null)[]; grid: ItemGrant[] } = {
  weapons: ['revolver', null, null],
  grid: [
    { item: 'ammo_revolver', quantity: 18 },
    { item: 'ammo_revolver', quantity: 18 },
  ],
};
