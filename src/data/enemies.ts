import { PAL } from '../render/palette';
import type { AppearanceConfig, EquipSlot, WeaponDef } from './types';
import { WEAPONS } from './weapons';

export type ArchetypeId = 'gunslinger' | 'rifleman' | 'shotgunner';

/** How an enemy fights (on top of its weapon's preferred range). */
export type Tactics = 'strafe' | 'cover' | 'rush';

/** A weapon an archetype may spawn with instead of its usual one. */
export interface WeaponOption {
  weapon: string;
  /** Relative to the usual weapon's weight of 1. */
  weight: number;
  /** Wave mode: only from this wave on. */
  fromWave?: number;
  /** Always a second gun in the off hand (two sawed-offs); otherwise dual wielding as usual. */
  offHand?: string;
}

export interface EnemyArchetype {
  id: ArchetypeId;
  /** Weapon on foot. */
  weapon: string;
  /** Other weapons it may carry on foot (picked per spawn, see `pickEnemyWeapon`). */
  weaponOptions?: WeaponOption[];
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
    offHandWeapons: ['revolver', 'revolver', 'nickel_revolver', 'derringer'],
    weaponOptions: [
      { weapon: 'nickel_revolver', weight: 0.6, fromWave: 3 },
      // The rare heavy hitter of the later waves.
      { weapon: 'magnum', weight: 0.15, fromWave: 7 },
    ],
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
    // From the mid waves some come with a sawed-off in each hand.
    weaponOptions: [{ weapon: 'sawed_off', offHand: 'sawed_off', weight: 0.5, fromWave: 4 }],
    tactics: 'rush',
    hp: 110,
    inaccuracy: 1.2,
    reactionTime: 0.35,
    ammoBoxes: [2, 3],
    wardrobe: BANDIT,
  },
};

/**
 * What an enemy of this archetype carries on foot in a wave: its usual weapon or one of its
 * options (weighted), and a second gun if the option brings one. Riders use `mountedWeapon`.
 */
export function pickEnemyWeapon(a: EnemyArchetype, wave: number, rand = Math.random): { weapon: string; offHand?: string } {
  const options = (a.weaponOptions ?? []).filter((o) => wave >= (o.fromWave ?? 1));
  let r = rand() * (1 + options.reduce((n, o) => n + o.weight, 0));
  for (const o of options) {
    r -= o.weight;
    if (r < 0) return o.offHand ? { weapon: o.weapon, offHand: o.offHand } : { weapon: o.weapon };
  }
  return { weapon: a.weapon };
}

/**
 * An enemy's guns: riders carry `mountedWeapon`; on foot the usual gun or an option, plus a
 * second gun if the option brings one, or if it's a dual wielder with a gun that pairs (never
 * the magnum).
 */
export function enemyLoadout(a: EnemyArchetype, wave: number, o: { mounted?: boolean; dual?: boolean }, rand = Math.random): { weapon: string; offHand: string | null } {
  if (o.mounted) return { weapon: a.mountedWeapon ?? a.weapon, offHand: null };
  const pick = pickEnemyWeapon(a, wave, rand);
  if (pick.offHand) return { weapon: pick.weapon, offHand: pick.offHand };
  const pairs = (WEAPONS as Record<string, WeaponDef>)[pick.weapon]?.dualWieldable === true;
  const offHand = o.dual && pairs && a.offHandWeapons?.length ? a.offHandWeapons[Math.floor(rand() * a.offHandWeapons.length)] : null;
  return { weapon: pick.weapon, offHand };
}

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
