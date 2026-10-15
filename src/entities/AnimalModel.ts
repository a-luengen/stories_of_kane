import * as THREE from 'three';
import type { AnimalId, AnimalPose } from '../data/animals';
import { boxGeo, part } from '../render/materials';
import { PAL } from '../render/palette';
import { clamp, damp, lerp, smoothstep } from '../util/math';
import { capsuleZ, ellip, taper, taperZ } from './HorseModel';

export interface AnimalModelPose {
  speed: number;
  runSpeed: number;
  pose: AnimalPose;
  dead: boolean;
  /** 1 right after a hit, fading. */
  flinch: number;
  /** Looking at someone: their direction relative to the body's facing (null: just looking about). */
  look: number | null;
  /** 0..1: wagging its tail (a dog being petted, or glad to see you). */
  wag: number;
  /** Warning someone off (a snake raised up and rattling). */
  alert: boolean;
  /** 0..1: lunging to bite, swiping, striking. */
  attack: number;
}

/** What an animal's body offers the entity (four-legged and two-legged ones, and the snake). */
export interface AnimalView {
  readonly root: THREE.Group;
  onStep: ((leg: number, speed01: number) => void) | null;
  animate(dt: number, p: AnimalModelPose): void;
  snapDead(): void;
}

interface Leg {
  hip: THREE.Group;
  knee: THREE.Group;
  front: boolean;
}

/** What a species builder hands back: the moving parts and its proportions. */
interface Body {
  neck: THREE.Group;
  head: THREE.Group;
  legs: Leg[];
  tail: THREE.Group | null;
  /** The tail swishes at flies (a cow's; a pig's curl stays put). */
  swish: boolean;
  wings: THREE.Group[];
  /** How far the body sinks to lie down. */
  restDrop: number;
  /** Half the body's width (it falls over that edge when it dies). */
  side: number;
  /** Neck pitch at rest and head down (grazing, rooting, pecking). */
  neckRest: number;
  neckDown: number;
  /** Strides per second at a walk and at a run. */
  stride: [number, number];
  /** Leg swing at a walk and at a run (radians). */
  swing: [number, number];
  /** Front legs lying down: folded under the chest (default) or stretched out in front (-, a dog's). */
  restFront?: number;
  /** Sitting: how far the front tips up and the rump sinks (dogs and cats). */
  sit?: { pitch: number; drop: number };
  /** The tail wags (a dog's) rather than swishing. */
  wag?: boolean;
  /** Rearing up on the hind legs: how far the body tips back and rises (a bear). */
  rear?: { pitch: number; lift: number };
  /** Attacking: how far it lunges forward; `swipe`: a front paw lashes out (a bear). */
  lunge?: number;
  swipe?: boolean;
}

/** Leg phase offsets (fraction of a stride): FL, FR, HL, HR (two-legged: L, R). */
const WALK4 = [0, 0.5, 0.75, 0.25];
const RUN4 = [0, 0.1, 0.5, 0.6];
const WALK2 = [0, 0.5];

/** Hip pivot → upper leg → knee pivot (`kneeY` below the hip) → lower leg and hoof (or foot). */
function leg(parent: THREE.Object3D, x: number, y: number, z: number, front: boolean, kneeY: number, upper: (hip: THREE.Group) => void, lower: (knee: THREE.Group) => void): Leg {
  const hip = new THREE.Group();
  hip.position.set(x, y, z);
  parent.add(hip);
  upper(hip);
  const knee = new THREE.Group();
  knee.position.y = -kneeY;
  hip.add(knee);
  lower(knee);
  return { hip, knee, front };
}

function cow(b: THREE.Group): Body {
  const coat = PAL.cream;
  const spot = PAL.darkBrown;
  part(capsuleZ(0.42, 0.95), coat, 0, 1.12, 0, b).scale.set(1, 1.05, 1);
  part(ellip(0.42, 0.44, 0.4), coat, 0, 1.18, -0.62, b); // rump
  part(ellip(0.4, 0.44, 0.38), coat, 0, 1.12, 0.6, b); // chest
  // Patches: flat ovals pressed onto the flanks and the back.
  for (const [x, y, z, ry, rz] of [[0.42, 1.12, -0.25, 0.22, 0.3], [-0.42, 1.2, 0.3, 0.2, 0.24], [0.4, 1.25, 0.5, 0.15, 0.18], [0, 1.55, -0.35, 0.3, 0.06]] as const) {
    part(x === 0 ? ellip(rz * 4, ry * 0.25, 0.32) : ellip(0.05, ry, rz), spot, x, y, z, b);
  }
  part(ellip(0.16, 0.1, 0.16), PAL.skin, 0, 0.72, -0.45, b); // udder

  const neck = new THREE.Group();
  neck.position.set(0, 1.3, 0.85);
  b.add(neck);
  part(ellip(0.22, 0.25, 0.32), coat, 0, 0, 0.1, neck);
  const head = new THREE.Group();
  head.position.set(0, -0.06, 0.4);
  neck.add(head);
  part(boxGeo(0.34, 0.34, 0.42), coat, 0, 0, 0.04, head);
  part(boxGeo(0.25, 0.2, 0.2), spot, 0.06, 0.08, -0.02, head); // a patch over one eye
  part(boxGeo(0.3, 0.22, 0.18), PAL.skin, 0, -0.08, 0.3, head); // muzzle
  for (const s of [-1, 1]) {
    part(boxGeo(0.05, 0.04, 0.02), PAL.ink, s * 0.07, -0.06, 0.4, head); // nostrils
    part(boxGeo(0.03, 0.05, 0.05), PAL.ink, s * 0.175, 0.06, 0.12, head); // eyes
    part(boxGeo(0.16, 0.06, 0.09), coat, s * 0.24, 0.08, -0.1, head); // ears
    part(new THREE.ConeGeometry(0.04, 0.2, 5), PAL.sandPale, s * 0.2, 0.2, -0.06, head).rotation.z = -s * 1.1; // horns
  }

  const legs: Leg[] = [];
  for (const [x, z, front] of [[0.25, 0.62, true], [-0.25, 0.62, true], [0.25, -0.62, false], [-0.25, -0.62, false]] as const) {
    legs.push(
      leg(b, x, 0.95, z, front, 0.48, (hip) => part(taper(0.12, 0.09, 0.5, 1), coat, 0, 0, 0, hip), (knee) => {
        part(taper(0.08, 0.07, 0.4, 1), coat, 0, 0, 0, knee);
        part(taper(0.075, 0.085, 0.08, 1), PAL.ink, 0, -0.4, 0, knee); // hoof
      }),
    );
  }
  const tail = new THREE.Group();
  tail.position.set(0, 1.45, -1.02);
  b.add(tail);
  part(taper(0.03, 0.03, 0.72, 1), coat, 0, 0, 0, tail);
  part(ellip(0.06, 0.12, 0.06), PAL.ink, 0, -0.74, 0, tail); // tuft
  return { neck, head, legs, tail, swish: true, wings: [], restDrop: 0.6, side: 0.42, neckRest: 0.15, neckDown: 1.0, stride: [1.1, 2.3], swing: [0.32, 0.8] };
}

function pig(b: THREE.Group): Body {
  const hide = PAL.skin;
  part(capsuleZ(0.3, 0.6), hide, 0, 0.55, 0, b);
  part(ellip(0.31, 0.31, 0.3), hide, 0, 0.56, -0.38, b); // rump
  part(ellip(0.07, 0.12, 0.16), PAL.brown, 0.29, 0.4, -0.1, b); // mud on the flank
  part(ellip(0.06, 0.08, 0.12), PAL.brown, -0.28, 0.36, 0.22, b);

  const neck = new THREE.Group();
  neck.position.set(0, 0.6, 0.42);
  b.add(neck);
  const head = new THREE.Group();
  head.position.set(0, 0, 0.14);
  neck.add(head);
  part(ellip(0.24, 0.23, 0.22), hide, 0, 0, 0.04, head);
  part(taperZ(0.11, 0.13, 0.16), PAL.skinDark, 0, -0.04, 0.27, head); // snout
  for (const s of [-1, 1]) {
    part(boxGeo(0.03, 0.04, 0.02), PAL.ink, s * 0.04, -0.04, 0.36, head); // nostrils
    part(boxGeo(0.03, 0.04, 0.04), PAL.ink, s * 0.15, 0.06, 0.18, head); // eyes
    part(new THREE.ConeGeometry(0.08, 0.16, 4), hide, s * 0.13, 0.2, 0.02, head).rotation.x = 0.7; // ears, flopping forward
  }

  const legs: Leg[] = [];
  for (const [x, z, front] of [[0.16, 0.34, true], [-0.16, 0.34, true], [0.16, -0.36, false], [-0.16, -0.36, false]] as const) {
    legs.push(
      leg(b, x, 0.4, z, front, 0.2, (hip) => part(taper(0.08, 0.07, 0.22, 1), hide, 0, 0, 0, hip), (knee) => {
        part(taper(0.065, 0.06, 0.15, 1), hide, 0, 0, 0, knee);
        part(taper(0.06, 0.065, 0.06, 1), PAL.darkBrown, 0, -0.15, 0, knee); // trotter
      }),
    );
  }
  const tail = new THREE.Group();
  tail.position.set(0, 0.68, -0.67);
  b.add(tail);
  part(new THREE.TorusGeometry(0.05, 0.016, 4, 8), hide, 0, 0, 0, tail).rotation.y = Math.PI / 2; // curl
  return { neck, head, legs, tail, swish: false, wings: [], restDrop: 0.24, side: 0.3, neckRest: 0, neckDown: 0.55, stride: [1.5, 3.2], swing: [0.35, 0.85] };
}

function chicken(b: THREE.Group): Body {
  const white = PAL.white;
  part(ellip(0.17, 0.16, 0.22), white, 0, 0.4, 0, b);
  part(boxGeo(0.12, 0.22, 0.07, -1), white, 0, 0.42, -0.18, b).rotation.x = -0.55; // tail feathers
  const wings: THREE.Group[] = [];
  for (const s of [-1, 1]) {
    const w = new THREE.Group();
    w.position.set(s * 0.15, 0.47, 0.02);
    b.add(w);
    part(ellip(0.04, 0.1, 0.15), PAL.cream, 0, -0.06, -0.02, w);
    wings.push(w);
  }

  const neck = new THREE.Group();
  neck.position.set(0, 0.48, 0.13);
  b.add(neck);
  part(ellip(0.07, 0.11, 0.07), white, 0, 0.05, 0, neck);
  const head = new THREE.Group();
  head.position.set(0, 0.15, 0.03);
  neck.add(head);
  part(ellip(0.075, 0.08, 0.085), white, 0, 0, 0, head);
  part(new THREE.ConeGeometry(0.03, 0.09, 4), PAL.brass, 0, -0.01, 0.1, head).rotation.x = Math.PI / 2; // beak
  part(boxGeo(0.025, 0.07, 0.11), PAL.red, 0, 0.09, 0, head); // comb
  part(ellip(0.02, 0.035, 0.025), PAL.red, 0, -0.07, 0.06, head); // wattle
  for (const s of [-1, 1]) part(boxGeo(0.02, 0.025, 0.025), PAL.ink, s * 0.07, 0.015, 0.03, head);

  const legs: Leg[] = [];
  for (const x of [0.06, -0.06]) {
    legs.push(
      leg(b, x, 0.3, 0, false, 0.13, (hip) => part(ellip(0.045, 0.07, 0.05), PAL.cream, 0, -0.03, 0, hip), (knee) => {
        part(taper(0.014, 0.014, 0.15, 1), PAL.brass, 0, 0, 0, knee);
        part(boxGeo(0.06, 0.015, 0.09), PAL.brass, 0, -0.155, 0.02, knee); // toes
      }),
    );
  }
  return { neck, head, legs, tail: null, swish: false, wings, restDrop: 0.2, side: 0.15, neckRest: -0.1, neckDown: 1.25, stride: [2.4, 4.5], swing: [0.45, 0.9] };
}

/** A dog, or (bigger, grey, its bushy tail hanging) a wolf. Built at dog size into `b` (scale it for a wolf). */
function canine(b: THREE.Group, look: { coat: number; pale: number; back: number; ears: number; wolf: boolean }): Body {
  const { coat, pale } = look;
  part(capsuleZ(0.16, 0.42), coat, 0, 0.56, 0, b);
  part(ellip(0.18, 0.2, 0.19), coat, 0, 0.58, 0.24, b); // chest
  part(ellip(0.15, 0.1, 0.2), pale, 0, 0.45, 0.2, b); // pale belly and chest
  part(ellip(0.15, 0.08, 0.24), look.back, 0, 0.7, -0.08, b); // darker saddle on the back
  if (look.wolf) part(ellip(0.2, 0.2, 0.16), coat, 0, 0.66, 0.22, b); // shaggy ruff

  const neck = new THREE.Group();
  neck.position.set(0, 0.68, 0.33);
  b.add(neck);
  part(ellip(0.1, 0.14, 0.1), coat, 0, 0.06, 0.02, neck);
  const head = new THREE.Group();
  head.position.set(0, 0.17, 0.06);
  neck.add(head);
  part(ellip(0.13, 0.12, 0.13), coat, 0, 0, 0, head);
  part(boxGeo(0.12, 0.1, 0.16), pale, 0, -0.04, 0.15, head); // muzzle
  part(boxGeo(0.06, 0.05, 0.04), PAL.ink, 0, -0.01, 0.23, head); // nose
  for (const s of [-1, 1]) {
    part(boxGeo(0.03, 0.03, 0.03), PAL.ink, s * 0.08, 0.03, 0.1, head); // eyes
    part(new THREE.ConeGeometry(0.045, 0.12, 4), look.ears, s * 0.08, 0.12, -0.03, head).rotation.z = -s * 0.3; // pricked ears
  }

  const legs: Leg[] = [];
  for (const [x, z, front] of [[0.1, 0.24, true], [-0.1, 0.24, true], [0.1, -0.24, false], [-0.1, -0.24, false]] as const) {
    legs.push(
      leg(b, x, 0.46, z, front, 0.22, (hip) => part(taper(0.055, 0.045, 0.24, 1), coat, 0, 0, 0, hip), (knee) => {
        part(taper(0.04, 0.035, 0.2, 1), coat, 0, 0, 0, knee);
        part(ellip(0.045, 0.03, 0.06), pale, 0, -0.21, 0.02, knee); // paw
      }),
    );
  }
  const tail = new THREE.Group();
  tail.position.set(0, 0.66, -0.4);
  b.add(tail);
  // A dog carries its tail up and back; a wolf's bushy one hangs.
  if (look.wolf) part(taper(0.03, 0.07, 0.4, -1), coat, 0, 0, 0, tail).rotation.x = -2.5;
  else part(taper(0.015, 0.035, 0.34, -1), coat, 0, 0, 0, tail).rotation.x = -0.75;
  return { neck, head, legs, tail, swish: look.wolf, wag: !look.wolf, wings: [], restDrop: 0.3, side: 0.17, neckRest: 0, neckDown: 0.9, stride: [1.8, 3.6], swing: [0.4, 0.9], restFront: -1.4, sit: { pitch: 0.55, drop: 0.12 }, lunge: 0.3 };
}

function dog(b: THREE.Group): Body {
  return canine(b, { coat: PAL.woodLight, pale: PAL.sandPale, back: PAL.darkBrown, ears: PAL.darkBrown, wolf: false });
}

/** A wolf: a dog's build at 1.3 times the size, grey with a dark back. */
function wolf(b: THREE.Group): Body {
  const k = 1.3;
  const g = new THREE.Group();
  g.scale.setScalar(k);
  b.add(g);
  const body = canine(g, { coat: PAL.rock, pale: PAL.rockLight, back: PAL.rockDark, ears: PAL.rockDark, wolf: true });
  return { ...body, restDrop: body.restDrop * k, side: body.side * k, sit: { pitch: 0.55, drop: 0.12 * k }, lunge: 0.45, stride: [1.6, 3.2] };
}

function bison(b: THREE.Group): Body {
  const coat = PAL.brown;
  const shag = PAL.darkBrown;
  part(capsuleZ(0.46, 0.9), coat, 0, 1.15, 0, b).scale.set(1, 1.05, 1);
  part(ellip(0.42, 0.45, 0.45), coat, 0, 1.1, -0.65, b); // rump
  part(ellip(0.58, 0.72, 0.62), shag, 0, 1.42, 0.45, b); // the great shaggy hump
  part(ellip(0.5, 0.35, 0.4), shag, 0, 0.85, 0.55, b); // shaggy chest

  const neck = new THREE.Group();
  neck.position.set(0, 1.15, 1.0);
  b.add(neck);
  const head = new THREE.Group();
  head.position.set(0, -0.1, 0.22);
  neck.add(head);
  part(boxGeo(0.46, 0.5, 0.42), shag, 0, -0.05, 0.1, head);
  part(ellip(0.15, 0.22, 0.12), shag, 0, -0.4, 0.12, head); // beard
  part(boxGeo(0.3, 0.2, 0.12), PAL.ink, 0, -0.18, 0.34, head); // muzzle
  for (const s of [-1, 1]) {
    part(boxGeo(0.03, 0.05, 0.04), PAL.ink, s * 0.22, 0.02, 0.24, head); // eyes
    part(new THREE.ConeGeometry(0.05, 0.22, 5), PAL.ink, s * 0.28, 0.15, 0.02, head).rotation.z = -s * 1.2; // horns
  }

  const legs: Leg[] = [];
  for (const [x, z, front] of [[0.27, 0.68, true], [-0.27, 0.68, true], [0.27, -0.68, false], [-0.27, -0.68, false]] as const) {
    legs.push(
      leg(b, x, 1.0, z, front, 0.5, (hip) => part(taper(front ? 0.16 : 0.13, 0.1, 0.52, 1), front ? shag : coat, 0, 0, 0, hip), (knee) => {
        part(taper(0.08, 0.07, 0.42, 1), coat, 0, 0, 0, knee);
        part(taper(0.075, 0.085, 0.08, 1), PAL.ink, 0, -0.42, 0, knee); // hoof
      }),
    );
  }
  const tail = new THREE.Group();
  tail.position.set(0, 1.3, -1.08);
  b.add(tail);
  part(taper(0.025, 0.025, 0.5, 1), coat, 0, 0, 0, tail);
  part(ellip(0.06, 0.1, 0.06), shag, 0, -0.52, 0, tail); // tuft
  return { neck, head, legs, tail, swish: true, wings: [], restDrop: 0.62, side: 0.48, neckRest: 0.35, neckDown: 0.7, stride: [1.0, 2.2], swing: [0.3, 0.85], lunge: 0.2 };
}

function bear(b: THREE.Group): Body {
  const coat = PAL.brown;
  const tips = PAL.wood;
  part(capsuleZ(0.52, 0.8), coat, 0, 1.0, 0, b);
  part(ellip(0.5, 0.5, 0.5), coat, 0, 0.98, -0.55, b); // rump
  part(ellip(0.5, 0.56, 0.46), tips, 0, 1.25, 0.4, b); // the grizzled shoulder hump

  const neck = new THREE.Group();
  neck.position.set(0, 1.1, 0.8);
  b.add(neck);
  part(ellip(0.3, 0.32, 0.3), coat, 0, 0, 0.05, neck);
  const head = new THREE.Group();
  head.position.set(0, 0.02, 0.3);
  neck.add(head);
  part(ellip(0.3, 0.27, 0.28), tips, 0, 0, 0, head);
  part(boxGeo(0.2, 0.17, 0.25), PAL.woodPale, 0, -0.08, 0.25, head); // muzzle
  part(boxGeo(0.1, 0.07, 0.05), PAL.ink, 0, -0.03, 0.38, head); // nose
  for (const s of [-1, 1]) {
    part(boxGeo(0.04, 0.04, 0.04), PAL.ink, s * 0.14, 0.05, 0.2, head); // eyes
    part(ellip(0.08, 0.08, 0.04), coat, s * 0.2, 0.22, -0.05, head); // round ears
  }

  const legs: Leg[] = [];
  for (const [x, z, front] of [[0.3, 0.55, true], [-0.3, 0.55, true], [0.3, -0.55, false], [-0.3, -0.55, false]] as const) {
    legs.push(
      leg(b, x, 0.85, z, front, 0.45, (hip) => part(taper(0.17, 0.14, 0.5, 1), coat, 0, 0, 0, hip), (knee) => {
        part(taper(0.13, 0.12, 0.38, 1), coat, 0, 0, 0, knee);
        part(boxGeo(0.22, 0.08, 0.3), PAL.darkBrown, 0, -0.4, 0.04, knee); // paw
        if (front) for (const cx of [-0.07, 0, 0.07]) part(boxGeo(0.03, 0.03, 0.08), PAL.cream, cx, -0.42, 0.22, knee); // claws
      }),
    );
  }
  part(ellip(0.08, 0.07, 0.06), coat, 0, 1.15, -1.02, b); // stub of a tail
  return {
    neck, head, legs, tail: null, swish: false, wings: [], restDrop: 0.5, side: 0.5, neckRest: 0.2, neckDown: 0.6, stride: [1.0, 2.6], swing: [0.3, 0.9],
    restFront: -1.4, sit: { pitch: 0.7, drop: 0.2 }, rear: { pitch: 1.25, lift: 1.14 }, lunge: 0.35, swipe: true,
  };
}

function cat(b: THREE.Group): Body {
  const fur = PAL.orange;
  const stripe = PAL.rustLight;
  part(capsuleZ(0.09, 0.26), fur, 0, 0.3, 0, b);
  for (const z of [-0.12, 0, 0.12]) part(boxGeo(0.19, 0.03, 0.04), stripe, 0, 0.375, z, b); // tabby stripes
  part(ellip(0.08, 0.05, 0.12), PAL.cream, 0, 0.23, 0.06, b); // pale belly

  const neck = new THREE.Group();
  neck.position.set(0, 0.36, 0.2);
  b.add(neck);
  const head = new THREE.Group();
  head.position.set(0, 0.06, 0.04);
  neck.add(head);
  part(ellip(0.085, 0.078, 0.08), fur, 0, 0, 0, head);
  part(ellip(0.045, 0.035, 0.03), PAL.cream, 0, -0.03, 0.07, head); // muzzle
  part(boxGeo(0.02, 0.015, 0.015), PAL.skin, 0, -0.01, 0.095, head); // nose
  for (const s of [-1, 1]) {
    part(boxGeo(0.022, 0.025, 0.02), PAL.cactusLight, s * 0.04, 0.02, 0.07, head); // green eyes
    part(new THREE.ConeGeometry(0.03, 0.07, 4), fur, s * 0.05, 0.085, -0.01, head); // ears
  }

  const legs: Leg[] = [];
  for (const [x, z, front] of [[0.05, 0.13, true], [-0.05, 0.13, true], [0.05, -0.13, false], [-0.05, -0.13, false]] as const) {
    legs.push(
      leg(b, x, 0.25, z, front, 0.12, (hip) => part(taper(0.03, 0.025, 0.13, 1), fur, 0, 0, 0, hip), (knee) => {
        part(taper(0.022, 0.02, 0.11, 1), fur, 0, 0, 0, knee);
        part(ellip(0.025, 0.018, 0.03), PAL.cream, 0, -0.115, 0.01, knee); // paw
      }),
    );
  }
  const tail = new THREE.Group();
  tail.position.set(0, 0.34, -0.24);
  b.add(tail);
  part(taper(0.018, 0.024, 0.34, -1), fur, 0, 0, 0, tail).rotation.x = -0.35; // held up, swaying
  return { neck, head, legs, tail, swish: true, wings: [], restDrop: 0.16, side: 0.09, neckRest: -0.1, neckDown: 0.6, stride: [2, 4.2], swing: [0.4, 0.9], restFront: -1.4, sit: { pitch: 0.7, drop: 0.06 } };
}

const BUILDERS: Record<Exclude<AnimalId, 'snake'>, (b: THREE.Group) => Body> = { cow, pig, chicken, dog, cat, bison, wolf, bear };

/**
 * A low-poly four-legged (or two-legged) animal (forward = +Z) with a procedural gait and its idle
 * poses: grazing or rooting with the head down, lying down, pecking, sitting, rearing up — a lunge
 * or a swipe when it attacks — and falling over its side when it dies.
 */
export class AnimalModel implements AnimalView {
  readonly root = new THREE.Group();
  /** Death tips the body over the edge of this pivot (at ground level, one side). */
  private fall = new THREE.Group();
  /** Sinks to lie down; bobs with the gait. */
  private lift = new THREE.Group();
  private body = new THREE.Group();
  private parts: Body;
  private phase = 0;
  private time = Math.random() * 10;
  private down = 0;
  private rest = 0;
  private sit = 0;
  private rear = 0;
  private strike = 0;
  private wag = 0;
  private dead = 0;
  private flap = 0;
  /** A foot landed: leg index (front first) and the gait speed (0 walk … 1 run). */
  onStep: ((leg: number, speed01: number) => void) | null = null;

  constructor(readonly species: Exclude<AnimalId, 'snake'>) {
    this.root.add(this.fall);
    this.fall.add(this.lift);
    this.lift.add(this.body);
    this.parts = BUILDERS[species](this.body);
    this.fall.position.x = this.parts.side;
    this.lift.position.x = -this.parts.side;
  }

  /** Lying dead already (a place restored as it was left). */
  snapDead(): void {
    this.dead = 1;
    this.fall.rotation.z = -Math.PI / 2;
  }

  animate(dt: number, p: AnimalModelPose): void {
    // Dead and down: it lies still (no breathing, glancing or tail swishing).
    if (p.dead && this.dead >= 1) return;
    const b = this.parts;
    this.time += dt;
    const s = clamp(p.speed / p.runSpeed, 0, 1);
    const moving = p.speed > 0.05 && !p.dead;
    const quad = b.legs.length === 4;

    // Gait: the legs swing on a stride clock that speeds up with the pace.
    const prev = this.phase;
    if (moving) this.phase += dt * lerp(b.stride[0], b.stride[1], s);
    const run = smoothstep(0.35, 0.75, s);
    const amp = moving ? lerp(b.swing[0], b.swing[1], s) : 0;
    b.legs.forEach((leg, i) => {
      const off = quad ? lerp(WALK4[i], RUN4[i], run) : WALK2[i];
      if (moving && this.onStep && Math.floor(prev + off - 0.25) !== Math.floor(this.phase + off - 0.25)) this.onStep(i, s);
      const a = (this.phase + off) * Math.PI * 2;
      let hip = -Math.sin(a) * amp;
      let knee = Math.max(0, Math.cos(a)) * amp * (leg.front || !quad ? 1.2 : -1);
      // Lying down: legs folded under the belly (a dog's front legs stretched out in front).
      hip = lerp(hip, quad ? (leg.front ? (b.restFront ?? 1.45) : -1.45) : -0.9, this.rest);
      knee = lerp(knee, quad ? 0 : 1.6, this.rest);
      // Sitting: front legs kept upright against the tipped-up body, hind legs folded under the rump.
      if (b.sit) {
        hip = lerp(hip, leg.front ? b.sit.pitch : b.sit.pitch - 1.5, this.sit);
        knee = lerp(knee, leg.front ? 0 : 2.3, this.sit);
      }
      // Rearing: hind legs straight under the tipped-up body, forelegs raised in front.
      if (b.rear) {
        hip = lerp(hip, leg.front ? b.rear.pitch - 1.0 : b.rear.pitch, this.rear);
        knee = lerp(knee, leg.front ? 0.7 : 0, this.rear);
      }
      // A bear's swipe: the right foreleg lashes forward.
      if (b.swipe && i === 0) hip -= this.strike * 1.6;
      // Dead: stiff, a little apart.
      hip = lerp(hip, quad ? (leg.front ? -0.25 : 0.25) : 0.4, this.dead);
      knee = lerp(knee, 0, this.dead);
      leg.hip.rotation.x = damp(leg.hip.rotation.x, hip, 30, dt);
      leg.knee.rotation.x = damp(leg.knee.rotation.x, knee, 30, dt);
    });

    // Head down to graze / root / peck; lying down or dead, the head rests.
    const wantDown = !moving && !p.dead && (p.pose === 'graze' || p.pose === 'peck') ? 1 : 0;
    this.down = damp(this.down, wantDown, p.pose === 'peck' ? 9 : 2.5, dt);
    this.rest = damp(this.rest, !moving && !p.dead && p.pose === 'rest' ? 1 : 0, 2, dt);
    this.sit = damp(this.sit, b.sit && !moving && !p.dead && p.pose === 'sit' ? 1 : 0, 4, dt);
    this.rear = damp(this.rear, b.rear && !p.dead && p.pose === 'rear' ? 1 : 0, 5, dt);
    this.strike = damp(this.strike, p.dead ? 0 : p.attack, 25, dt);
    this.dead = p.dead ? Math.min(1, this.dead + dt * 2.2) : 0;
    let neck = b.neckRest + this.down * b.neckDown;
    if (p.pose === 'peck' && wantDown) neck += Math.max(0, Math.sin(this.time * 9)) * 0.35 - 0.2; // quick jabs
    else if (p.pose === 'graze' && wantDown) neck += Math.sin(this.time * 2.6) * 0.05; // chewing
    else if (moving) neck += Math.sin(this.phase * Math.PI * 4) * 0.06 * (quad ? 1 : 2.5); // nodding along
    if (b.sit) neck += this.sit * b.sit.pitch; // the head stays level as the body tips up
    if (b.rear) neck += this.rear * b.rear.pitch * 0.7;
    neck += this.strike * 0.35; // snapping forward and down
    b.neck.rotation.x = damp(b.neck.rotation.x, lerp(neck, b.neckRest + 0.25, this.dead), 12, dt);
    // Watching someone, or (idle) glancing around now and then.
    if (p.look !== null && !p.dead) b.head.rotation.y = damp(b.head.rotation.y, clamp(p.look, -1.1, 1.1), 8, dt);
    else b.head.rotation.y = !moving && !p.dead && this.down < 0.3 ? Math.sin(this.time * 0.4) * Math.sin(this.time * 0.13) * 0.6 : damp(b.head.rotation.y, 0, 4, dt);
    if (!quad) b.neck.position.z = 0.13 + (moving ? Math.sin(this.phase * Math.PI * 4) * 0.035 : 0); // a chicken's head bob

    // Body: bob with the gait, sink to lie down, jolt when hit.
    const bob = moving ? Math.abs(Math.sin(this.phase * Math.PI * 2)) * lerp(0.015, 0.07, s) : p.dead ? 0 : Math.sin(this.time * 1.4) * 0.006;
    this.lift.position.y = bob - this.rest * b.restDrop - this.sit * (b.sit?.drop ?? 0) + this.rear * (b.rear?.lift ?? 0);
    this.lift.position.z = this.strike * (b.lunge ?? 0);
    this.body.rotation.x =
      Math.sin(this.phase * Math.PI * 2) * 0.04 * run - Math.sin(p.flinch * 14) * p.flinch * 0.12 - this.sit * (b.sit?.pitch ?? 0) - this.rear * (b.rear?.pitch ?? 0);

    // Tail swishes (or wags), wings flap when a chicken runs.
    this.wag = damp(this.wag, p.dead ? 0 : p.wag, 5, dt);
    if (b.tail && p.dead) b.tail.rotation.z = damp(b.tail.rotation.z, 0, 6, dt);
    else if (b.tail && b.wag) b.tail.rotation.z = Math.sin(this.time * 17) * 0.7 * this.wag + Math.sin(this.time * 1.3) * 0.1;
    else if (b.tail && b.swish) b.tail.rotation.z = Math.sin(this.time * 1.7) * 0.25 + Math.sin(this.time * 5.3) * 0.08;
    this.flap = damp(this.flap, moving && s > 0.5 ? 1 : 0, 6, dt);
    b.wings.forEach((w, i) => {
      w.rotation.z = (i === 0 ? -1 : 1) * this.flap * (0.5 + Math.sin(this.time * 32) * 0.5);
    });

    // Death: tips over onto its side.
    const k = this.dead * this.dead;
    this.fall.rotation.z = -k * (Math.PI / 2);
  }
}
