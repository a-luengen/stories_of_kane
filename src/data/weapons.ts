import { PAL } from '../render/palette';
import type { WeaponDef } from './types';

const DEG = Math.PI / 180;

/** Weapons shared by the player and NPCs. */
export const WEAPONS = {
  revolver: {
    id: 'revolver',
    name: 'Revolver',
    damage: 25,
    fireInterval: 0.3,
    magazine: 6,
    reloadTime: 1.5,
    spread: 0.8 * DEG,
    spreadGrowth: 0.1,
    range: 46,
    bulletSpeed: 72,
    pellets: 1,
    falloffStart: 46,
    falloffMin: 1,
    carry: 'holster',
    drawTime: 0.45,
    ai: { preferredRange: [5, 11], extraDelay: [0.5, 1.1], telegraph: 0.5 },
    look: { kind: 'pistol', barrelLength: 0.32, barrels: 1, metal: PAL.metalLight, wood: PAL.woodLight },
  },
  rifle: {
    id: 'rifle',
    name: 'Rifle',
    damage: 45,
    fireInterval: 1.3,
    magazine: 5,
    reloadTime: 2.6,
    spread: 0.25 * DEG,
    spreadGrowth: 0.05,
    range: 70,
    bulletSpeed: 110,
    pellets: 1,
    falloffStart: 70,
    falloffMin: 1,
    carry: 'back',
    drawTime: 0.8,
    ai: { preferredRange: [13, 22], extraDelay: [0.6, 1.4], telegraph: 0.7 },
    look: { kind: 'longgun', barrelLength: 0.95, barrels: 1, metal: PAL.metal, wood: PAL.wood },
  },
  shotgun: {
    id: 'shotgun',
    name: 'Shotgun',
    damage: 12,
    fireInterval: 0.9,
    magazine: 2,
    reloadTime: 2.4,
    spread: 6 * DEG,
    spreadGrowth: 0,
    range: 16,
    bulletSpeed: 60,
    pellets: [6, 8],
    falloffStart: 4,
    falloffMin: 0.25,
    carry: 'back',
    drawTime: 0.7,
    ai: { preferredRange: [2.5, 6], extraDelay: [0.4, 0.9], telegraph: 0.5 },
    look: { kind: 'longgun', barrelLength: 0.7, barrels: 2, metal: PAL.metal, wood: PAL.woodLight },
  },
} satisfies Record<string, WeaponDef>;

export type WeaponId = keyof typeof WEAPONS;

/** Resolve a weapon reference from data (id or inline definition). */
export function resolveWeapon(ref: string | WeaponDef | null): WeaponDef | null {
  if (ref === null) return null;
  if (typeof ref !== 'string') return ref;
  const def = (WEAPONS as Record<string, WeaponDef>)[ref];
  if (!def) throw new Error(`Unknown weapon "${ref}"`);
  return def;
}
