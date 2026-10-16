import * as THREE from 'three';
import type { WeaponLook } from '../data/types';
import { boxGeo, part } from '../render/materials';

/**
 * Builds a gun mesh from its look. Origin = the grip / trigger hand; the barrel points along -Y
 * (the same convention as the player's revolver, so it lines up with a hanging or raised arm).
 */
export function buildWeaponMesh(look: WeaponLook): THREE.Group {
  const g = new THREE.Group();
  const L = look.barrelLength;
  if (look.kind === 'pistol' && look.style === 'sawedOff') {
    // A shotgun cut down: the stock sawn to a grip, the action, two fat barrels side by side, twin hammers.
    const grip = part(boxGeo(0.075, 0.1, 0.21), look.wood, 0, 0.03, -0.09, g);
    grip.rotation.x = 0.2;
    part(boxGeo(0.11, 0.12, 0.1), look.metal, 0, -0.03, 0.03, g); // action
    for (const s of [-1, 1]) {
      part(boxGeo(0.055, L, 0.055, 1), look.metal, s * 0.029, -0.07, 0.055, g);
      part(boxGeo(0.025, 0.04, 0.05), look.trim ?? look.metal, s * 0.03, 0.0, 0.09, g); // hammers
    }
    return g;
  }
  if (look.kind === 'pistol') {
    const heavy = look.style === 'magnum';
    part(boxGeo(heavy ? 0.075 : 0.07, 0.09, heavy ? 0.18 : 0.17), look.wood, 0, 0.02, -0.07, g); // grip (hangs down when aimed)
    part(boxGeo(heavy ? 0.1 : 0.08, heavy ? 0.12 : 0.1, heavy ? 0.12 : 0.1), look.metal, 0, -0.03, 0.02, g); // cylinder
    const t = heavy ? 0.065 : 0.05;
    for (let i = 0; i < look.barrels; i++) {
      part(boxGeo(t, L, t, 1), look.metal, (i - (look.barrels - 1) / 2) * 0.05, -0.06, 0.05, g);
    }
    if (heavy) part(boxGeo(0.03, L, 0.02, 1), look.metal, 0, -0.06, 0.09, g); // top rib
    if (look.trim !== undefined) {
      part(boxGeo(0.03, 0.04, 0.05), look.trim, 0, 0.01, 0.07, g); // hammer
      part(boxGeo(0.02, 0.03, 0.04), look.trim, 0, 0.0, -0.02, g); // trigger
    }
    return g;
  }
  // Long gun: stock behind the hand, receiver, forestock and barrel(s) ahead of it.
  const stock = part(boxGeo(0.08, 0.4, 0.12, -1), look.wood, 0, 0.04, -0.02, g);
  stock.rotation.x = 0.22;
  part(boxGeo(0.09, 0.2, 0.1), look.metal, 0, -0.04, 0.03, g); // receiver
  part(boxGeo(0.08, L * 0.5, 0.08, 1), look.wood, 0, -0.14, 0.02, g); // forestock
  for (let i = 0; i < look.barrels; i++) {
    part(boxGeo(0.045, L, 0.045, 1), look.metal, (i - (look.barrels - 1) / 2) * 0.05, -0.14, 0.07, g);
  }
  return g;
}

/** Distance from the grip to the muzzle along the barrel. */
export function muzzleOffset(look: WeaponLook): number {
  return look.kind === 'pistol' ? 0.06 + look.barrelLength : 0.14 + look.barrelLength;
}
