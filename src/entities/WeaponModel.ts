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
  if (look.kind === 'pistol') {
    part(boxGeo(0.07, 0.09, 0.17), look.wood, 0, 0.02, -0.07, g); // grip (hangs down when aimed)
    part(boxGeo(0.08, 0.1, 0.1), look.metal, 0, -0.03, 0.02, g); // cylinder
    for (let i = 0; i < look.barrels; i++) {
      part(boxGeo(0.05, L, 0.05, 1), look.metal, (i - (look.barrels - 1) / 2) * 0.05, -0.06, 0.05, g);
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
