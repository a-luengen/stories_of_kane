import { PAL } from '../render/palette';
import type { AppearanceConfig, EquipSlot } from './types';

export type ArchetypeId = 'gunslinger' | 'rifleman' | 'shotgunner';

/** How an enemy fights (on top of its weapon's preferred range). */
export type Tactics = 'strafe' | 'cover' | 'rush';

export interface EnemyArchetype {
  id: ArchetypeId;
  /** Weapon on foot. */
  weapon: string;
  /** Weapon on horseback (null: never spawns mounted). */
  mountedWeapon: string | null;
  /** Second guns for the dual wielders (EnemySpawn.dual), picked at random. */
  offHandWeapons?: string[];
  tactics: Tactics;
  hp: number;
  /** Spread multiplier (lower = more accurate). */
  inaccuracy: number;
  /** Aim lag in seconds. */
  reactionTime: number;
  /** Boxes of matching ammo in their pockets. */
  ammoBoxes: [number, number];
  /** Clothing options per slot (null = nothing in that slot); one is picked at random. */
  wardrobe: Partial<Record<EquipSlot, (string | null)[]>>;
}

/** Bandit looks: dark hats, dusters, bandanas, chaps. */
const BANDIT: EnemyArchetype['wardrobe'] = {
  hat: ['cowboy_hat_black', 'cowboy_hat_dark', 'cowboy_hat_brown'],
  top: ['shirt_grey', 'shirt_denim', 'shirt_rust'],
  outerwear: ['duster_dark', 'duster_black', 'vest_brown', null],
  neck: ['bandana_black', 'bandana_rust', 'bandana_red'],
  legs: ['chaps_dark', 'chaps_wood', 'trousers_brown'],
  boots: ['boots_black', 'boots_brown'],
  belt: ['belt_leather'],
};

export const ENEMIES: Record<ArchetypeId, EnemyArchetype> = {
  gunslinger: {
    id: 'gunslinger',
    weapon: 'revolver',
    mountedWeapon: 'revolver',
    offHandWeapons: ['revolver', 'revolver', 'derringer'],
    tactics: 'strafe',
    hp: 90,
    inaccuracy: 2.4,
    reactionTime: 0.32,
    ammoBoxes: [2, 3],
    wardrobe: { ...BANDIT, holster: ['holster_leather'] },
  },
  rifleman: {
    id: 'rifleman',
    weapon: 'rifle',
    mountedWeapon: null,
    tactics: 'cover',
    hp: 80,
    inaccuracy: 2.2,
    reactionTime: 0.4,
    ammoBoxes: [2, 3],
    wardrobe: BANDIT,
  },
  shotgunner: {
    id: 'shotgunner',
    weapon: 'shotgun',
    mountedWeapon: 'shotgun',
    tactics: 'rush',
    hp: 110,
    inaccuracy: 1.2,
    reactionTime: 0.35,
    ammoBoxes: [2, 3],
    wardrobe: BANDIT,
  },
};

const SKINS = [PAL.skin, PAL.skinDark, 0xc48a66];
const HAIR = [PAL.ink, PAL.darkBrown, PAL.brown, PAL.woodLight];

/** A random bandit look for an archetype. */
export function banditAppearance(a: EnemyArchetype, rand = Math.random): AppearanceConfig {
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)];
  const clothing: AppearanceConfig['clothing'] = {};
  for (const [slot, options] of Object.entries(a.wardrobe) as [EquipSlot, (string | null)[]][]) {
    const id = pick(options);
    if (id) clothing[slot] = id;
  }
  return {
    body: 'male',
    skin: pick(SKINS),
    hair: pick(HAIR),
    hairStyle: rand() < 0.25 ? 'long' : 'short',
    beard: rand() < 0.7 ? pick(HAIR) : undefined,
    clothing,
  };
}
