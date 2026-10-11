import * as THREE from 'three';

/**
 * Free the GPU resources of everything under `root`: geometries, materials and their textures.
 * Materials / textures flagged `userData.shared` (the app-wide toon cache) are left alone.
 */
export function disposeObject(root: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.geometry) geometries.add(m.geometry);
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((x) => materials.add(x));
    else if (mat) materials.add(mat);
    const light = o as THREE.DirectionalLight;
    if (light.isLight && light.shadow?.map) light.shadow.map.dispose();
  });
  for (const g of geometries) g.dispose();
  for (const mat of materials) {
    if (mat.userData.shared) continue;
    for (const v of Object.values(mat)) {
      if (v instanceof THREE.Texture && !v.userData.shared) v.dispose();
    }
    mat.dispose();
  }
}
