import * as THREE from 'three';
import { boxGeo, part } from '../render/materials';
import { PAL } from '../render/palette';

export type QuestShape = 'letter' | 'key' | 'pouch' | 'box' | 'badge' | 'bottle' | 'map' | 'photo' | 'star' | 'ring';

/** Shapes that lie flat (their icon looks down on them). */
export const FLAT_SHAPES = new Set<string>(['letter', 'map', 'photo', 'badge', 'star']);

/** Each shape's colours unless the pack picks its own. */
const DEFAULTS: Record<QuestShape, { main: number; accent: number }> = {
  letter: { main: PAL.cream, accent: PAL.red },
  key: { main: PAL.brass, accent: PAL.brassLight },
  pouch: { main: PAL.brown, accent: PAL.sandLight },
  box: { main: PAL.wood, accent: PAL.metal },
  badge: { main: PAL.brass, accent: PAL.brassLight },
  bottle: { main: PAL.glassBrown, accent: PAL.woodPale },
  map: { main: PAL.sandPale, accent: PAL.rust },
  photo: { main: PAL.cream, accent: PAL.rock },
  star: { main: PAL.metalLight, accent: PAL.white },
  ring: { main: PAL.brassLight, accent: PAL.red },
};

const hex = (c: string | undefined): number | undefined => (c ? parseInt(c.slice(1), 16) : undefined);

function starGeo(outer: number, inner: number, depth: number): THREE.BufferGeometry {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 ? inner : outer;
    if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  g.rotateX(-Math.PI / 2); // lying flat, extruded upwards
  return g;
}

/**
 * A quest item's look: one of a few procedural shapes in the pack's colours (a letter with a wax
 * seal, a brass key, a leather pouch…), in the same toon style as every other item.
 */
export function buildQuestItemMesh(shape: string, colors?: { main?: string; accent?: string }): THREE.Object3D {
  const d = DEFAULTS[shape as QuestShape] ?? DEFAULTS.box;
  const main = hex(colors?.main) ?? d.main;
  const accent = hex(colors?.accent) ?? d.accent;
  const out = new THREE.Group();
  switch (shape as QuestShape) {
    case 'letter':
      part(boxGeo(0.5, 0.03, 0.34, -1), main, 0, 0, 0, out);
      // The flap's edges and the wax seal.
      part(boxGeo(0.3, 0.031, 0.03, -1), PAL.sandLight, -0.1, 0, -0.05, out).rotation.y = -0.6;
      part(boxGeo(0.3, 0.031, 0.03, -1), PAL.sandLight, 0.1, 0, -0.05, out).rotation.y = 0.6;
      part(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 8), accent, 0, 0.04, 0.02, out);
      break;
    case 'key':
      part(new THREE.TorusGeometry(0.1, 0.035, 5, 10), main, -0.2, 0.04, 0, out).rotation.x = Math.PI / 2;
      part(boxGeo(0.36, 0.05, 0.05, -1), main, 0.05, 0.015, 0, out);
      part(boxGeo(0.05, 0.05, 0.1, -1), accent, 0.16, 0.015, 0.06, out);
      part(boxGeo(0.05, 0.05, 0.07, -1), accent, 0.07, 0.015, 0.045, out);
      break;
    case 'pouch':
      part(new THREE.DodecahedronGeometry(0.2, 0), main, 0, 0.18, 0, out).scale.set(1, 0.85, 0.9);
      part(new THREE.CylinderGeometry(0.06, 0.1, 0.1, 6), main, 0, 0.36, 0, out);
      part(new THREE.TorusGeometry(0.07, 0.02, 4, 8), accent, 0, 0.36, 0, out).rotation.x = Math.PI / 2;
      break;
    case 'box':
      part(boxGeo(0.4, 0.26, 0.3, -1), main, 0, 0, 0, out);
      part(boxGeo(0.41, 0.05, 0.31, -1), accent, 0, 0.2, 0, out);
      part(boxGeo(0.06, 0.08, 0.02, -1), PAL.brass, 0, 0.1, 0.16, out);
      break;
    case 'badge':
      part(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 6), main, 0, 0.02, 0, out);
      part(starGeo(0.13, 0.06, 0.03), accent, 0, 0.04, 0, out);
      break;
    case 'bottle':
      part(new THREE.CylinderGeometry(0.11, 0.11, 0.34, 8), main, 0, 0.17, 0, out);
      part(new THREE.CylinderGeometry(0.04, 0.09, 0.1, 8), main, 0, 0.39, 0, out);
      part(new THREE.CylinderGeometry(0.035, 0.035, 0.07, 6), accent, 0, 0.47, 0, out);
      part(boxGeo(0.23, 0.1, 0.02, -1), PAL.cream, 0, 0.1, 0.105, out); // label
      break;
    case 'map':
      part(boxGeo(0.5, 0.02, 0.42, -1), main, 0, 0, 0, out);
      for (let i = 0; i < 4; i++) part(boxGeo(0.08, 0.03, 0.05, -1), PAL.darkBrown, -0.18 + i * 0.09, 0, 0.12 - i * 0.06, out);
      part(boxGeo(0.14, 0.035, 0.14, -1), accent, 0.15, 0, -0.08, out);
      break;
    case 'photo':
      part(boxGeo(0.36, 0.02, 0.46, -1), main, 0, 0, 0, out);
      part(boxGeo(0.28, 0.025, 0.34, -1), accent, 0, 0, -0.03, out);
      part(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 8), PAL.rockDark, 0, 0.01, -0.05, out); // a face
      break;
    case 'star':
      part(starGeo(0.24, 0.1, 0.05), main, 0, 0, 0, out);
      part(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 8), accent, 0, 0.03, 0, out);
      break;
    case 'ring':
      part(new THREE.TorusGeometry(0.15, 0.04, 6, 14), main, 0, 0.19, 0, out);
      part(new THREE.OctahedronGeometry(0.07, 0), accent, 0, 0.37, 0, out);
      break;
  }
  return out;
}
