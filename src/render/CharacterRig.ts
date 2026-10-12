import * as THREE from 'three';
import { clothingDef } from '../data/clothing';
import type { AppearanceConfig, ClothingDef, ClothingKind, WeaponDef } from '../data/types';
import { buildWeaponMesh } from '../entities/WeaponModel';
import { clamp, damp } from '../util/math';
import { footForward, KNEE_MAX, LEG_DIMS, legReach, type LegAngles, type LegDims } from './HumanGait';
import { boxGeo, part } from './materials';
import { PAL } from './palette';

/** Body proportions the clothing builders fit to. */
export interface BodyFit {
  /** Torso width. */
  w: number;
  female: boolean;
  /** Leg segment lengths. */
  leg: LegDims;
}

/**
 * The bones a clothing builder can attach to. Legs: `legL/legR` are the hip pivots (thigh hangs
 * down from them), `kneeL/kneeR` the knee pivots (shin), `ankleL/ankleR` the ankle pivots (foot).
 */
export interface RigBones {
  hips: THREE.Group;
  upper: THREE.Group;
  head: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  kneeL: THREE.Group;
  kneeR: THREE.Group;
  ankleL: THREE.Group;
  ankleR: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
}

type Put = (geo: THREE.BufferGeometry, color: number, x: number, y: number, z: number, parent: THREE.Object3D) => THREE.Mesh;

/** Returns the skirt mesh when the piece has one (it sways with the legs). */
type Builder = (put: Put, b: RigBones, fit: BodyFit, d: ClothingDef) => THREE.Mesh | void;

/** Per leg: hip (thigh), knee (shin), ankle (foot) bones and the side (−1 left, +1 right). */
const legs = (b: RigBones) =>
  [
    { thigh: b.legL, shin: b.kneeL, foot: b.ankleL, side: -1 },
    { thigh: b.legR, shin: b.kneeR, foot: b.ankleR, side: 1 },
  ] as const;

/** Leg covering split per bone: thigh, a knee cap (no gap when the knee bends), shin. */
function legCover(put: Put, b: RigBones, f: BodyFit, color: number, grow: number): void {
  const { thigh, shin } = f.leg;
  for (const l of legs(b)) {
    put(boxGeo(0.176 + grow, thigh + 0.005, 0.196 + grow, 1), color, 0, 0.005, 0, l.thigh);
    put(new THREE.SphereGeometry(0.098 + grow / 2, 8, 6), color, 0, 0, 0, l.shin);
    put(boxGeo(0.166 + grow, shin, 0.184 + grow, 1), color, 0, 0, 0, l.shin);
  }
}
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
    }
    put(boxGeo(w + 0.1, 0.08, 0.3), d.color, 0, 0.56, -0.01, b.upper); // collar
    // Skirt of the coat, split for riding: a panel front, back and outside each thigh, so the legs
    // never push through it; a band at the waist closes the seam.
    put(boxGeo(w + 0.08, 0.16, 0.3), d.color, 0, 0.0, 0, b.hips);
    for (const l of legs(b)) {
      const len = f.leg.thigh + 0.08;
      put(boxGeo(0.24, len, 0.04, 1), d.color, l.side * 0.02, 0.06, 0.13, l.thigh);
      put(boxGeo(0.26, len, 0.04, 1), d.color, l.side * 0.02, 0.06, -0.13, l.thigh);
      put(boxGeo(0.04, len, 0.27, 1), d.color, l.side * 0.13, 0.06, 0, l.thigh);
    }
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
    legCover(put, b, f, d.color, 0.006);
    put(boxGeo(f.w + 0.02, 0.12, 0.24), d.color, 0, 0.02, 0, b.hips);
  },
  chaps: (put, b, f, d) => {
    const trousers = d.trim ?? PAL.sandDark;
    legCover(put, b, f, trousers, 0.006);
    // Leather over thigh, knee and shin, with fringe down the outside of each.
    const { thigh, shin } = f.leg;
    for (const l of legs(b)) {
      put(boxGeo(0.204, thigh - 0.03, 0.224, 1), d.color, 0, -0.02, 0, l.thigh);
      put(new THREE.SphereGeometry(0.112, 8, 6), d.color, 0, 0, 0, l.shin);
      put(boxGeo(0.194, shin - 0.07, 0.212, 1), d.color, 0, 0, 0, l.shin);
      put(boxGeo(0.04, thigh - 0.1, 0.2, 1), PAL.sandLight, l.side * 0.115, -0.06, 0, l.thigh);
      put(boxGeo(0.04, shin - 0.12, 0.19, 1), PAL.sandLight, l.side * 0.11, -0.02, 0, l.shin);
    }
    put(boxGeo(f.w + 0.02, 0.12, 0.24), trousers, 0, 0.02, 0, b.hips);
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
  boots: (put, b, f, d) => {
    const { shin, foot } = f.leg;
    for (const l of legs(b)) {
      put(boxGeo(0.192, 0.25, 0.214, 1), d.color, 0, -(shin - 0.25), 0.005, l.shin); // shaft
      put(boxGeo(0.2, foot + 0.01, 0.3, 1), d.color, 0, 0.01, 0.04, l.foot); // foot
      put(boxGeo(0.21, 0.03, 0.31, 1), PAL.ink, 0, -foot + 0.03, 0.04, l.foot); // sole
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

export type WeaponAnchor = 'hand' | 'handL' | 'hipR' | 'hipL' | 'belt1' | 'belt2' | 'back1' | 'back2';

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
  readonly kneeL = new THREE.Group();
  readonly kneeR = new THREE.Group();
  readonly ankleL = new THREE.Group();
  readonly ankleR = new THREE.Group();
  readonly armL = new THREE.Group();
  readonly armR = new THREE.Group();
  readonly anchors: Record<WeaponAnchor, THREE.Group> = {
    hand: new THREE.Group(),
    handL: new THREE.Group(),
    hipR: new THREE.Group(),
    hipL: new THREE.Group(),
    belt1: new THREE.Group(),
    belt2: new THREE.Group(),
    back1: new THREE.Group(),
    back2: new THREE.Group(),
  };
  /** Dress skirt, if worn (sways with the stride). */
  skirt: THREE.Mesh | null = null;
  fit: BodyFit = { w: 0.4, female: false, leg: LEG_DIMS.male };
  appearance: AppearanceConfig | null = null;

  private layer: THREE.Mesh[] = [];
  private weapons: (THREE.Group | null)[] = [];
  private weaponDefs: (WeaponDef | null)[] = [];
  /** Off-hand guns (dual wielding), one per weapon slot. */
  private offWeapons: (THREE.Group | null)[] = [];
  private offDefs: (WeaponDef | null)[] = [];

  constructor(appearance?: AppearanceConfig, private bodyless = false) {
    this.root.add(this.body);
    this.body.add(this.hips, this.upper);
    this.hips.position.y = 0.88;
    this.upper.position.y = 0.88;
    // Yaw first, then pitch about the character's own right axis (leaning forward, recoil).
    this.upper.rotation.order = 'YXZ';
    this.head.position.y = 0.66;
    this.upper.add(this.head);
    this.hips.add(this.legL, this.legR);
    this.legL.add(this.kneeL);
    this.legR.add(this.kneeR);
    this.kneeL.add(this.ankleL);
    this.kneeR.add(this.ankleR);
    this.upper.add(this.armL, this.armR);
    this.anchors.hand.position.set(0, -0.52, 0);
    this.armR.add(this.anchors.hand);
    this.anchors.handL.position.set(0, -0.52, 0);
    this.armL.add(this.anchors.handL);
    this.hips.add(this.anchors.hipR, this.anchors.hipL, this.anchors.belt1, this.anchors.belt2);
    // Off-hand guns stowed: tucked into the front of the belt, grip up, canted.
    this.anchors.belt1.rotation.set(0.15, 0, -0.35);
    this.anchors.belt2.rotation.set(0.15, 0, 0.35);
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
    const leg = female ? LEG_DIMS.female : LEG_DIMS.male;
    this.fit = { w, female, leg };
    this.legL.position.set(-(female ? 0.1 : 0.12), 0, 0);
    this.legR.position.set(female ? 0.1 : 0.12, 0, 0);
    for (const k of [this.kneeL, this.kneeR]) k.position.y = -leg.thigh;
    for (const a of [this.ankleL, this.ankleR]) a.position.y = -leg.shin;
    this.armL.position.set(-(w / 2 + 0.05), 0.5, 0);
    this.armR.position.set(w / 2 + 0.05, 0.5, 0);
    this.anchors.hipR.position.set(w / 2 + 0.04, 0.08, 0);
    this.anchors.hipL.position.set(-(w / 2 + 0.04), 0.08, 0);
    this.anchors.belt1.position.set(-0.08, 0.1, 0.15);
    this.anchors.belt2.position.set(0.08, 0.1, 0.15);

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
    // Legs in long johns: thigh, knee, shin; bare feet.
    const { thigh, shin, foot } = this.fit.leg;
    for (const l of legs(this)) {
      put(boxGeo(0.17, thigh, 0.19, 1), PAL.sandPale, 0, 0, 0, l.thigh);
      put(new THREE.SphereGeometry(0.09, 8, 6), PAL.sandPale, 0, 0, 0, l.shin);
      put(boxGeo(0.155, shin, 0.17, 1), PAL.sandPale, 0, 0, 0, l.shin);
      put(boxGeo(0.15, foot, 0.24, 1), a.skin, 0, 0, 0.03, l.foot);
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

  /**
   * Ease the legs towards target joint angles (knees clamped to bend forward only) and return the
   * hip height that keeps the lower foot on the ground.
   */
  poseLegs(t: readonly [LegAngles, LegAngles], dt: number, sharpness = 20): number {
    const bones = [
      [this.legL, this.kneeL, this.ankleL],
      [this.legR, this.kneeR, this.ankleR],
    ] as const;
    let reach = 0;
    let fwd = 0;
    bones.forEach(([hip, knee, ankle], i) => {
      const a = t[i];
      hip.rotation.x = damp(hip.rotation.x, a.hip, sharpness, dt);
      hip.rotation.z = damp(hip.rotation.z, a.roll, sharpness, dt);
      knee.rotation.x = clamp(damp(knee.rotation.x, a.knee, sharpness, dt), 0, KNEE_MAX);
      ankle.rotation.x = damp(ankle.rotation.x, a.ankle, sharpness, dt);
      const now = { hip: hip.rotation.x, knee: knee.rotation.x, ankle: 0, roll: hip.rotation.z };
      reach = Math.max(reach, legReach(now, this.fit.leg));
      fwd += footForward(now, this.fit.leg) / 2;
    });
    this.feetForward = fwd;
    return reach;
  }

  /** Average forward offset of the feet from the hips (after poseLegs). */
  private feetForward = 0;

  /**
   * Put the pelvis (hips + upper body) at `height`. Crouching, the hips also move back so the
   * feet stay under the character (with the torso leaning forward, the weight is over the feet).
   */
  placePelvis(height: number, crouch: number): void {
    const back = this.feetForward * crouch;
    const yaw = this.hips.rotation.y;
    for (const g of [this.hips, this.upper]) g.position.set(-Math.sin(yaw) * back, height, -Math.cos(yaw) * back);
  }

  /** Dress skirt: sways with the stride; squashes down and spreads out over the knees when crouching. */
  poseSkirt(crouch: number, swing: number): void {
    const s = this.skirt;
    if (!s) return;
    const sy = 1 - 0.42 * crouch;
    s.scale.set(1 + 0.45 * crouch, sy, 1 + 0.75 * crouch);
    s.position.set(0, 0.03 - 0.39 * sy, 0.06 * crouch);
    s.rotation.x = swing * 0.12;
  }

  get hasHolster(): boolean {
    return !!this.appearance?.clothing.holster;
  }

  /** Build meshes for the carried weapons (index = weapon slot). */
  setWeapons(defs: readonly (WeaponDef | null)[], offDefs: readonly (WeaponDef | null)[] = []): void {
    const same = (a: readonly (WeaponDef | null)[], b: readonly (WeaponDef | null)[]) => a.length === b.length && a.every((d, i) => d === b[i]);
    if (!same(defs, this.weaponDefs)) {
      for (const g of this.weapons) g?.removeFromParent();
      this.weaponDefs = [...defs];
      this.weapons = defs.map((d) => (d ? buildWeaponMesh(d.look) : null));
    }
    if (!same(offDefs, this.offDefs)) {
      for (const g of this.offWeapons) g?.removeFromParent();
      this.offDefs = [...offDefs];
      this.offWeapons = offDefs.map((d) => (d ? buildWeaponMesh(d.look) : null));
    }
  }

  /**
   * Put each weapon where it belongs: the active one in the hand while drawn, the rest stowed
   * (revolvers on the hips, long guns across the back). `pistolInHand` keeps a holster-less
   * revolver in hand even when stowed (NPCs without a gun belt).
   */
  placeWeapons(active: number | null, inHand: boolean, pistolInHand = false): void {
    let hips = 0;
    let backs = 0;
    let belts = 0;
    const put = (g: THREE.Group, anchor: WeaponAnchor) => {
      const slot = this.anchors[anchor];
      if (g.parent !== slot) {
        slot.add(g);
        g.position.set(0, 0, 0);
        g.rotation.set(0, 0, 0);
      }
    };
    this.weapons.forEach((g, i) => {
      const d = this.weaponDefs[i];
      if (!g || !d) return;
      const pistol = d.look.kind === 'pistol';
      const held = i === active && (inHand || (pistol && pistolInHand && !this.hasHolster));
      if (held) put(g, 'hand');
      else if (pistol) put(g, hips++ === 0 ? 'hipR' : 'hipL');
      else put(g, backs++ === 0 ? 'back1' : 'back2');
      // Dual wielding: the second gun in the left hand, else tucked into the belt.
      const off = this.offWeapons[i];
      if (off) put(off, held ? 'handL' : belts++ === 0 ? 'belt1' : 'belt2');
    });
  }

  /** The weapon mesh in a slot (for small per-frame tweaks such as reload wobble). */
  weaponMesh(i: number): THREE.Group | null {
    return this.weapons[i] ?? null;
  }

  /** The off-hand gun mesh in a slot, if dual wielding. */
  offWeaponMesh(i: number): THREE.Group | null {
    return this.offWeapons[i] ?? null;
  }
}
