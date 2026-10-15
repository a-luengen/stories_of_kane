import * as THREE from 'three';
import type { ItemDef } from '../data/types';
import { CharacterRig } from '../render/CharacterRig';
import { boxGeo, part } from '../render/materials';
import { PAL } from '../render/palette';
import { buildWeaponMesh } from '../entities/WeaponModel';
import { clothingOf, weaponOf } from './ItemDef';

/**
 * The procedural mesh of an item in "display" orientation: weapons side-on pointing +X with the
 * grip down, clothing as worn (on an invisible body), ammo as a box. Used for inventory icons and
 * for items lying in the world.
 */
export function buildItemMesh(def: ItemDef): THREE.Object3D {
  const out = new THREE.Group();
  const weapon = weaponOf(def);
  if (weapon) {
    const yaw = new THREE.Group();
    yaw.rotation.y = Math.PI / 2;
    const gun = buildWeaponMesh(weapon.look);
    gun.rotation.x = -Math.PI / 2; // barrel forward, grip down (as when aimed)
    yaw.add(gun);
    out.add(yaw);
    return out;
  }
  const clothing = clothingOf(def);
  if (clothing) {
    const rig = new CharacterRig(undefined, true);
    rig.applyAppearance({ body: 'male', skin: 0, hair: 0, hairStyle: 'short', clothing: {} });
    const put = (geo: THREE.BufferGeometry, color: number, x: number, y: number, z: number, parent: THREE.Object3D) => part(geo, color, x, y, z, parent);
    rig.buildPiece(put, clothing);
    out.add(rig.root);
    return out;
  }
  if (def.category === 'consumable') {
    // Bandage roll with a red cross.
    part(new THREE.CylinderGeometry(0.2, 0.2, 0.22, 10), PAL.cream, 0, 0.2, 0, out).rotation.z = Math.PI / 2;
    const red = def.icon?.tint ?? PAL.red;
    part(boxGeo(0.05, 0.18, 0.03), red, 0, 0.2, 0.2, out);
    part(boxGeo(0.18, 0.05, 0.03), red, 0, 0.2, 0.2, out);
    return out;
  }
  if (def.category === 'goods') {
    goodsMesh(def.id, out);
    return out;
  }
  if (def.reveals) {
    // A torn scrap of parchment lying flat, a trail and a place inked on it.
    part(boxGeo(0.5, 0.02, 0.42, -1), PAL.sandPale, 0, 0, 0, out);
    part(boxGeo(0.16, 0.021, 0.12, -1), PAL.sandLight, 0.2, 0, -0.18, out); // the torn corner
    const ink = def.icon?.tint ?? PAL.rust;
    for (let i = 0; i < 4; i++) part(boxGeo(0.08, 0.03, 0.05, -1), PAL.darkBrown, -0.18 + i * 0.09, 0.0, 0.12 - i * 0.06, out);
    part(boxGeo(0.14, 0.035, 0.14, -1), ink, 0.15, 0, -0.08, out);
    return out;
  }
  // Ammo box: card box with a coloured band and a few cartridges on top.
  const tint = def.icon?.tint ?? PAL.red;
  part(boxGeo(0.5, 0.28, 0.34, -1), PAL.sandLight, 0, 0, 0, out);
  part(boxGeo(0.51, 0.1, 0.35, -1), tint, 0, 0.09, 0, out);
  for (let i = 0; i < 3; i++) {
    part(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 6), PAL.brass, -0.12 + i * 0.12, 0.33, 0.02, out);
    part(new THREE.CylinderGeometry(0.03, 0.035, 0.04, 6), PAL.brassLight, -0.12 + i * 0.12, 0.42, 0.02, out);
  }
  return out;
}

/** Meat in butcher's paper, a rolled hide tied with cord, a pelt laid flat, a bundle of feathers. */
function goodsMesh(id: string, out: THREE.Group): void {
  switch (id) {
    case 'meat':
      part(boxGeo(0.46, 0.18, 0.34, -1), PAL.sandPale, 0, 0, 0, out); // paper
      part(boxGeo(0.34, 0.08, 0.24, -1), PAL.red, 0, 0.18, 0, out);
      part(boxGeo(0.12, 0.05, 0.2, -1), PAL.cream, 0.08, 0.26, 0, out); // fat
      part(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6), PAL.cream, -0.14, 0.24, 0, out).rotation.z = Math.PI / 2; // bone
      break;
    case 'leather': {
      const roll = part(new THREE.CylinderGeometry(0.2, 0.2, 0.7, 8), PAL.woodLight, 0, 0.2, 0, out);
      roll.rotation.z = Math.PI / 2;
      part(boxGeo(0.5, 0.03, 0.3, -1), PAL.woodPale, 0, 0, 0.18, out); // the loose end
      for (const x of [-0.2, 0.2]) part(new THREE.CylinderGeometry(0.21, 0.21, 0.05, 8), PAL.darkBrown, x, 0.2, 0, out).rotation.z = Math.PI / 2; // cord
      break;
    }
    case 'pelt':
    case 'bear_pelt': {
      // Spread flat: the body, four leg flaps, the head end and the tail.
      const [fur, dark] = id === 'pelt' ? [PAL.rock, PAL.rockDark] : [PAL.brown, PAL.darkBrown];
      part(boxGeo(0.62, 0.04, 0.36, -1), fur, 0, 0, 0, out);
      part(boxGeo(0.4, 0.045, 0.2, -1), dark, 0, 0, 0, out); // the darker back
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) part(boxGeo(0.12, 0.04, 0.16, -1), fur, sx * 0.24, 0, sz * 0.24, out);
      part(boxGeo(0.14, 0.05, 0.16, -1), fur, 0.36, 0, 0, out); // head
      part(boxGeo(0.16, 0.04, 0.06, -1), dark, -0.38, 0, 0, out); // tail
      break;
    }
    default:
      // Feathers: a fan of quills bound at the base.
      for (let i = -2; i <= 2; i++) {
        const q = part(boxGeo(0.07, 0.42, 0.02, -1), i % 2 ? PAL.cream : PAL.white, i * 0.03, 0, 0, out);
        q.rotation.z = i * 0.22;
      }
      part(boxGeo(0.1, 0.06, 0.05, -1), PAL.red, 0, 0.02, 0, out);
  }
}
