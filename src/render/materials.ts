import * as THREE from 'three';

let gradient: THREE.DataTexture | null = null;

/** Toon ramp indexed by N·L*0.5+0.5: back-facing = 0 (same as shadow, hides acne), then mid / lit. Nearest filtered so steps stay hard. */
export function toonGradient(): THREE.DataTexture {
  if (!gradient) {
    gradient = new THREE.DataTexture(new Uint8Array([0, 0, 150, 255]), 4, 1, THREE.RedFormat);
    gradient.minFilter = THREE.NearestFilter;
    gradient.magFilter = THREE.NearestFilter;
    gradient.generateMipmaps = false;
    gradient.needsUpdate = true;
    gradient.userData.shared = true;
  }
  return gradient;
}

const cache = new Map<number, THREE.MeshToonMaterial>();

/** Shared flat-shaded toon material per colour. */
export function toon(color: number): THREE.MeshToonMaterial {
  let m = cache.get(color);
  if (!m) {
    m = new THREE.MeshToonMaterial({ color, gradientMap: toonGradient() });
    (m as THREE.MeshToonMaterial & { flatShading: boolean }).flatShading = true;
    m.userData.shared = true; // cached for the whole app: never disposed with a scene
    cache.set(color, m);
  }
  return m;
}

/** Toon material driven by vertex colours (used by merged static geometry). */
export function vertexToon(): THREE.MeshToonMaterial {
  const m = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: toonGradient() });
  (m as THREE.MeshToonMaterial & { flatShading: boolean }).flatShading = true;
  return m;
}

/** Build a mesh from geometry + palette colour, with shadows enabled. */
export function part(
  geo: THREE.BufferGeometry,
  color: number,
  x = 0,
  y = 0,
  z = 0,
  parent?: THREE.Object3D,
): THREE.Mesh {
  const m = new THREE.Mesh(geo, toon(color));
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent?.add(m);
  return m;
}

/** Box helper with the pivot at the given anchor (0 = centre, 1 = top, -1 = bottom on Y). */
export function boxGeo(w: number, h: number, d: number, anchorY = 0): THREE.BoxGeometry {
  const g = new THREE.BoxGeometry(w, h, d);
  if (anchorY !== 0) g.translate(0, (-anchorY * h) / 2, 0);
  return g;
}

/**
 * Vertex-colour toon material that can be dithered away (ordered 4×4 Bayer, screen-anchored)
 * when it occludes the player. `uniforms.uFade.value` in 0..1 = fraction of pixels discarded.
 */
export function fadeableToon(): THREE.MeshToonMaterial & { userData: { uFade: { value: number } } } {
  const m = vertexToon() as THREE.MeshToonMaterial & { userData: { uFade: { value: number } } };
  const uFade = { value: 0 };
  m.userData.uFade = uFade;
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uFade = uFade;
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uFade;
float bayer4(ivec2 p) {
  int i = (p.x & 3) + (p.y & 3) * 4;
  int m[16] = int[](0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5);
  return (float(m[i]) + 0.5) / 16.0;
}`,
      )
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
if (uFade > 0.0 && bayer4(ivec2(gl_FragCoord.xy)) < uFade) discard;`,
      );
  };
  m.customProgramCacheKey = () => 'fadeable-toon';
  return m;
}
