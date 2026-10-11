import * as THREE from 'three';
import { clothingDef } from '../data/clothing';
import type { AppearanceConfig, ClothingDef, ClothingKind, WeaponDef } from '../data/types';
import { buildWeaponMesh } from '../entities/WeaponModel';
import { boxGeo, part } from './materials';
import { PAL } from './palette';

/** Body proportions the clothing builders fit to. */
export interface BodyFit {
  /** Torso width. */
  w: number;
  female: boolean;
}

/** The bones a clothing builder can attach to. */
export interface RigBones {
  hips: THREE.Group;
  upper: THREE.Group;
  head: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
}

type Put = (geo: THREE.BufferGeometry, color: number, x: number, y: number, z: number, parent: THREE.Object3D) => THREE.Mesh;

/** Returns the skirt mesh when the piece has one (it sways with the legs). */
type Builder = (put: Put, b: RigBones, fit: BodyFit, d: ClothingDef) => THREE.Mesh | void;

const legs = (b: RigBones) =>
  [
    [b.legL, -1],
    [b.legR, 1],
  ] as const;
const arms = (b: RigBones) => [b.armL, b.armR];

/** Geometry per clothing kind (ported from the original player / NPC models). */
const BUILDERS: Record<ClothingKind, Builder> = {
  cowboyHat: (put, b, _f, d) => {
    put(new THREE.CylinderGeometry(0.36, 0.36, 0.04, 10), d.color, 0, 0.27, 0, b.head);
    put(new THREE.CylinderGeometry(0.15, 0.19, 0.22, 8), d.color, 0, 0.39, 0, b.head);
    put(new THREE.CylinderGeometry(0.195, 0.195, 0.05, 8), d.trim ?? PAL.ink, 0, 0.31, 0, b.head);
  },
  bonnet: (put, b, _f, d) => {
    put(boxGeo(0.3, 0.3, 0.28), d.color, 0, 0.16, -0.04, b.head);
    put(boxGeo(0.36, 0.07, 0.07), d.color, 0, 0.31, 0.11, b.head); // brim framing the face
    for (const s of [-1, 1]) put(boxGeo(0.06, 0.3, 0.07), d.color, s * 0.17, 0.15, 0.1, b.head);
    put(boxGeo(0.26, 0.03, 0.03), d.trim ?? d.color, 0, 0.0, 0.11, b.head); // chin ribbon
  },
  shirt: (put, b, f, d) => {
    put(boxGeo(f.w + 0.012, 0.462, 0.252, -1), d.color, 0, 0.06, 0, b.upper);
    for (const a of arms(b)) put(boxGeo(0.124, 0.44, 0.124, 1), d.color, 0, 0.005, 0, a);
  },
  vest: (put, b, f, d) => {
    // Panels around an open front, so whatever is underneath shows through.
    const w = f.w;
    put(boxGeo(w + 0.04, 0.36, 0.04, -1), d.color, 0, 0.16, -0.12, b.upper);
    for (const s of [-1, 1]) {
      put(boxGeo(w / 2 - 0.03, 0.36, 0.04, -1), d.color, s * (w / 4 + 0.025), 0.16, 0.12, b.upper);
      put(boxGeo(0.04, 0.36, 0.26, -1), d.color, s * (w / 2 + 0.01), 0.16, 0, b.upper);
    }
  },
  duster: (put, b, f, d) => {
    const w = f.w;
    put(boxGeo(w + 0.06, 0.48, 0.04, -1), d.color, 0, 0.06, -0.13, b.upper);
    for (const s of [-1, 1]) {
      put(boxGeo(w / 2 - 0.02, 0.48, 0.04, -1), d.color, s * (w / 4 + 0.03), 0.06, 0.13, b.upper);
      put(boxGeo(0.04, 0.48, 0.28, -1), d.color, s * (w / 2 + 0.02), 0.06, 0, b.upper);
      put(boxGeo(0.13, 0.62, 0.05, 1), d.color, s * (w / 2 - 0.03), 0.1, 0.14, b.upper); // front tails
    }
    put(boxGeo(w + 0.08, 0.62, 0.05, 1), d.color, 0, 0.1, -0.14, b.upper); // back tail
    put(boxGeo(w + 0.1, 0.08, 0.3), d.color, 0, 0.56, -0.01, b.upper); // collar
    for (const a of arms(b)) put(boxGeo(0.134, 0.45, 0.134, 1), d.color, 0, 0.01, 0, a);
  },
  poncho: (put, b, _f, d) => {
    const poncho = put(new THREE.ConeGeometry(0.46, 0.5, 4, 1), d.color, 0, 0.42, 0, b.upper);
    poncho.rotation.y = Math.PI / 4;
    poncho.scale.set(1, 1, 0.75);
    const stripe = put(new THREE.ConeGeometry(0.47, 0.1, 4, 1, true), d.trim ?? PAL.cream, 0, 0.27, 0, b.upper);
    stripe.rotation.y = Math.PI / 4;
    stripe.scale.set(1, 1, 0.76);
  },
  trousers: (put, b, f, d) => {
    for (const [leg] of legs(b)) put(boxGeo(0.176, 0.64, 0.196, 1), d.color, 0, 0.005, 0, leg);
    put(boxGeo(f.w + 0.02, 0.12, 0.24), d.color, 0, 0.02, 0, b.hips);
  },
  chaps: (put, b, f, d) => {
    for (const [leg, side] of legs(b)) {
      put(boxGeo(0.176, 0.64, 0.196, 1), d.trim ?? PAL.sandDark, 0, 0.005, 0, leg);
      put(boxGeo(0.2, 0.58, 0.22, 1), d.color, 0, -0.02, 0, leg);
      put(boxGeo(0.04, 0.5, 0.2, 1), PAL.sandLight, side * 0.11, -0.06, 0, leg); // fringe
    }
    put(boxGeo(f.w + 0.02, 0.12, 0.24), d.trim ?? PAL.sandDark, 0, 0.02, 0, b.hips);
  },
  dress: (put, b, f, d) => {
    const skirt = put(new THREE.CylinderGeometry(f.w / 2 + 0.02, 0.36, 0.78, 8), d.color, 0, -0.36, 0, b.hips);
    if (d.trim !== undefined) put(new THREE.CylinderGeometry(0.37, 0.37, 0.06, 8), d.trim, 0, -0.38, 0, skirt);
    put(boxGeo(f.w + 0.02, 0.12, 0.24), d.color, 0, 0.02, 0, b.hips);
    put(boxGeo(f.w + 0.012, 0.462, 0.252, -1), d.color, 0, 0.06, 0, b.upper);
    for (const a of arms(b)) put(boxGeo(0.124, 0.44, 0.124, 1), d.trim ?? d.color, 0, 0.005, 0, a);
    return skirt;
  },
  bandana: (put, b, _f, d) => {
    put(boxGeo(0.26, 0.08, 0.26), d.color, 0, 0.6, 0, b.upper);
    put(boxGeo(0.14, 0.1, 0.04), d.color, 0, 0.52, 0.13, b.upper);
  },
  boots: (put, b, _f, d) => {
    for (const [leg] of legs(b)) {
      put(boxGeo(0.19, 0.26, 0.24, 1), d.color, 0, -0.62, 0.02, leg);
      put(boxGeo(0.2, 0.05, 0.3, 1), PAL.ink, 0, -0.85, 0.04, leg);
    }
  },
  belt: (put, b, f, d) => {
    put(boxGeo(f.w + 0.04, 0.1, 0.26), d.color, 0, 0.0, 0, b.hips);
    put(boxGeo(0.09, 0.07, 0.04), d.trim ?? PAL.brass, 0, 0.0, 0.135, b.hips);
  },
  holster: (put, b, f, d) => {
    put(boxGeo(0.1, 0.22, 0.16, 1), d.color, f.w / 2 + 0.04, -0.02, 0, b.hips);
  },
};

export type WeaponAnchor = 'hand' | 'hipR' | 'hipL' | 'back1' | 'back2';

/**
 * Shared character skeleton (player and NPCs), forward = +Z:
 * root → body (fall pivot) → hips (legs) and upper (torso, head, arms).
 * Body and clothing meshes are a rebuildable layer: applyAppearance() swaps them without
 * touching the bones, so animation state survives an outfit change.
 */
export class CharacterRig implements RigBones {
  readonly root = new THREE.Group();
  readonly body = new THREE.Group();
  readonly hips = new THREE.Group();
  readonly upper = new THREE.Group();
  readonly head = new THREE.Group();
  readonly legL = new THREE.Group();
  readonly legR = new THREE.Group();
  readonly armL = new THREE.Group();
  readonly armR = new THREE.Group();
  readonly anchors: Record<WeaponAnchor, THREE.Group> = {
    hand: new THREE.Group(),
    hipR: new THREE.Group(),
    hipL: new THREE.Group(),
    back1: new THREE.Group(),
    back2: new THREE.Group(),
  };
  /** Dress skirt, if worn (sways with the stride). */
  skirt: THREE.Mesh | null = null;
  fit: BodyFit = { w: 0.4, female: false };
  appearance: AppearanceConfig | null = null;

  private layer: THREE.Mesh[] = [];
  private weapons: (THREE.Group | null)[] = [];
  private weaponDefs: (WeaponDef | null)[] = [];

  constructor(appearance?: AppearanceConfig, private bodyless = false) {
    this.root.add(this.body);
    this.body.add(this.hips, this.upper);
    this.hips.position.y = 0.88;
    this.upper.position.y = 0.88;
    this.head.position.y = 0.66;
    this.upper.add(this.head);
    this.hips.add(this.legL, this.legR);
    this.upper.add(this.armL, this.armR);
    this.anchors.hand.position.set(0, -0.52, 0);
    this.armR.add(this.anchors.hand);
    this.hips.add(this.anchors.hipR, this.anchors.hipL);
    // Long guns slung diagonally across the back, crossing if there are two.
    this.anchors.back1.position.set(0, 0.28, -0.17);
    this.anchors.back1.rotation.z = Math.PI - 0.65;
    this.anchors.back2.position.set(0, 0.28, -0.21);
    this.anchors.back2.rotation.z = -(Math.PI - 0.65);
    this.upper.add(this.anchors.back1, this.anchors.back2);
    if (appearance) this.applyAppearance(appearance);
  }

  /** (Re)build body and clothing meshes for this appearance. */
  applyAppearance(a: AppearanceConfig): void {
    for (const m of this.layer) {
      m.removeFromParent();
      m.geometry.dispose();
    }
    this.layer = [];
    this.skirt = null;
    this.appearance = a;
    const female = a.body === 'female';
    const w = female ? 0.34 : 0.4;
    this.fit = { w, female };
    this.legL.position.set(-(female ? 0.1 : 0.12), 0, 0);
    this.legR.position.set(female ? 0.1 : 0.12, 0, 0);
    this.armL.position.set(-(w / 2 + 0.05), 0.5, 0);
    this.armR.position.set(w / 2 + 0.05, 0.5, 0);
    this.anchors.hipR.position.set(w / 2 + 0.04, 0.08, 0);
    this.anchors.hipL.position.set(-(w / 2 + 0.04), 0.08, 0);

    const put: Put = (geo, color, x, y, z, parent) => {
      const m = part(geo, color, x, y, z, parent);
      this.layer.push(m);
      return m;
    };
    if (!this.bodyless) this.buildBody(put, a);
    for (const id of Object.values(a.clothing)) {
      if (!id) continue;
      this.buildPiece(put, clothingDef(id));
    }
  }

  /** Build a single clothing piece (used for icons and dropped items via a bodyless rig). */
  buildPiece(put: Put, d: ClothingDef): void {
    const skirt = BUILDERS[d.kind](put, this, this.fit, d);
    if (skirt) this.skirt = skirt;
  }

  /** Bare body: skin, long johns, hair. Clothing goes on top (slightly larger boxes). */
  private buildBody(put: Put, a: AppearanceConfig): void {
    const w = this.fit.w;
    put(boxGeo(w, 0.46, 0.24, -1), a.skin, 0, 0.06, 0, this.upper);
    for (const arm of [this.armL, this.armR]) {
      put(boxGeo(0.11, 0.48, 0.11, 1), a.skin, 0, 0, 0, arm);
      put(boxGeo(0.12, 0.1, 0.12, 1), a.skin, 0, -0.46, 0, arm);
    }
    for (const leg of [this.legL, this.legR]) {
      put(boxGeo(0.17, 0.78, 0.19, 1), PAL.sandPale, 0, 0, 0, leg); // long johns
      put(boxGeo(0.16, 0.1, 0.24, 1), a.skin, 0, -0.78, 0.02, leg);
    }
    const h = this.head;
    put(boxGeo(0.24, 0.26, 0.24, -1), a.skin, 0, 0, 0, h);
    for (const s of [-1, 1]) put(boxGeo(0.04, 0.04, 0.01), PAL.ink, s * 0.06, 0.15, 0.125, h); // eyes
    if (a.beard !== undefined) put(boxGeo(0.26, 0.07, 0.06), a.beard, 0, 0.04, 0.11, h);
    put(boxGeo(0.26, 0.07, 0.26), a.hair, 0, 0.245, -0.005, h);
    put(boxGeo(0.26, 0.16, 0.05), a.hair, 0, 0.17, -0.115, h);
    if (a.hairStyle === 'long') {
      put(boxGeo(0.28, 0.46, 0.07, 1), a.hair, 0, 0.27, -0.12, h);
      for (const s of [-1, 1]) put(boxGeo(0.04, 0.24, 0.12), a.hair, s * 0.13, 0.12, -0.04, h);
    } else if (a.hairStyle === 'bun') {
      put(boxGeo(0.13, 0.13, 0.11), a.hair, 0, 0.2, -0.17, h);
    }
  }

  get hasHolster(): boolean {
    return !!this.appearance?.clothing.holster;
  }

  /** Build meshes for the carried weapons (index = weapon slot). */
  setWeapons(defs: readonly (WeaponDef | null)[]): void {
    if (defs.length === this.weaponDefs.length && defs.every((d, i) => d === this.weaponDefs[i])) return;
    for (const g of this.weapons) g?.removeFromParent();
    this.weaponDefs = [...defs];
    this.weapons = defs.map((d) => (d ? buildWeaponMesh(d.look) : null));
  }

  /**
   * Put each weapon where it belongs: the active one in the hand while drawn, the rest stowed
   * (revolvers on the hips, long guns across the back). `pistolInHand` keeps a holster-less
   * revolver in hand even when stowed (NPCs without a gun belt).
   */
  placeWeapons(active: number | null, inHand: boolean, pistolInHand = false): void {
    let hips = 0;
    let backs = 0;
    this.weapons.forEach((g, i) => {
      const d = this.weaponDefs[i];
      if (!g || !d) return;
      const pistol = d.look.kind === 'pistol';
      let anchor: WeaponAnchor;
      if (i === active && (inHand || (pistol && pistolInHand && !this.hasHolster))) anchor = 'hand';
      else if (pistol) anchor = hips++ === 0 ? 'hipR' : 'hipL';
      else anchor = backs++ === 0 ? 'back1' : 'back2';
      const slot = this.anchors[anchor];
      if (g.parent !== slot) {
        slot.add(g);
        g.position.set(0, 0, 0);
        g.rotation.set(0, 0, 0);
      }
    });
  }

  /** The weapon mesh in a slot (for small per-frame tweaks such as reload wobble). */
  weaponMesh(i: number): THREE.Group | null {
    return this.weapons[i] ?? null;
  }
}
