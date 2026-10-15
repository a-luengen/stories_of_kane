import type { ArchetypeId } from './enemies';

/** Dollars. */
export const ECONOMY = {
  killReward: { gunslinger: 15, rifleman: 20, shotgunner: 18 } as Record<ArchetypeId, number>,
  /** Extra for a kill on horseback. */
  mountedBonus: 10,
  /** Wave-clear bonus = base + perWave × wave. */
  waveBonusBase: 20,
  waveBonusPerWave: 10,
  /** Selling pays this fraction of the shop price (ammo: per round). */
  sellFraction: 0.5,
  /** Value of items the shop doesn't stock, for selling. */
  fallbackPrice: { weapon: 60, ammo: 10, clothing: 20, consumable: 10, map: 5, goods: 5 },
};
