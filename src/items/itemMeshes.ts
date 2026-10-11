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
