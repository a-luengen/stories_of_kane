import type { Vec2 } from './types';

export type AnimalId = 'cow' | 'pig' | 'chicken' | 'dog' | 'cat' | 'bison' | 'wolf' | 'bear' | 'snake';

/**
 * What an animal does while it stands still: look about, graze / root / sniff, lie down (a snake:
 * coiled), peck, sit, rear up on its hind legs (a bear's warning).
 */
export type AnimalPose = 'stand' | 'graze' | 'rest' | 'peck' | 'sit' | 'rear';

/** A wild animal's temper: when it notices someone, how long it warns, how it attacks. */
export interface Hunting {
  /** Notices anyone within this range: stands up (rears, rattles) and watches them... */
  notice: number;
  /** ...and attacks once they come within this range (or as soon as they shoot it). */
  attack: number;
  /** Both ranges shrink to this fraction for someone crouching. */
  crouch: number;
  /** Never chases anyone further than this from home: past it, it gives up and goes back. */
  leash: number;
  /** Seconds after the threat has gone (out of notice range) before it relaxes. */
  calm: number;
  /** Seconds of warning (rearing and roaring, rattling) before it goes for someone close. */
  warn: number;
  /** Rears up on its hind legs to warn (a bear). */
  rears?: boolean;
  /** Its attack: damage (Infinity: kills outright), reach beyond the two bodies, wind-up and pause between. */
  bite: { damage: number; reach: number; windup: number; cooldown: number };
  /** Runs off below this share of its health, and comes back after `time` seconds (wolves). */
  flee?: { below: number; time: number };
}

/** A species: body, speed, temper, what it leaves behind and how it sounds. */
export interface AnimalDef {
  id: AnimalId;
  name: string;
  hp: number;
  /** Body circle for collisions. */
  radius: number;
  /** Shootable volume: upright cylinders spaced along the body (forward offsets from the centre). */
  hit: { r: number; y0: number; y1: number; along: number[] };
  walkSpeed: number;
  runSpeed: number;
  /** Stops between strolls: a pose picked by weight, held for `time` seconds. */
  idle: { poses: Partial<Record<AnimalPose, number>>; time: [number, number] };
  /** Longest single stroll (it stays within its home area either way). */
  stroll: number;
  /**
   * Bolts at a gunshot within `shot`, someone rushing by (sprint, gallop) within `rush`, or anyone
   * at all coming within `near`. Wild hunters don't bolt: a shot within `shot` makes them watch the shooter.
   */
  startle: { shot: number; rush: number; near?: number };
  /** Seconds it runs before calming down. */
  fleeTime: [number, number];
  /** Others of its kind within this range bolt with it (a herd, a flock). */
  herd: number;
  /** Somebody's livestock or pet: shooting it in front of the owners angers them. */
  domestic: boolean;
  /** A pet: E pets it (it stays put for it, glad of the attention). */
  pettable?: boolean;
  /** Turns to watch anyone who comes within this range (a dog keeping an eye on strangers). */
  watch?: number;
  /** A wild animal that attacks (wolves, bears, snakes). */
  hunts?: Hunting;
  /** Bolting, it tramples whoever is in its way: damage, and how far they're thrown. */
  trample?: { damage: number; push: number };
  /** What the carcass holds (each entry one stack), and its grid. */
  loot: { item: string; count: [number, number] }[];
  lootGrid: { w: number; h: number };
  sounds: {
    /** Its call (moo, oink, cluck), every `interval` seconds or so. */
    call: string;
    interval: [number, number];
    /** Pitch of the shared hurt / death sounds (1 = a pig's). */
    pitch: number;
    /** Footfall volume (0: too light to hear). */
    step: number;
    /** Played while it's petted (a cat's purr). */
    pet?: string;
    /** Its warning (growl, roar, rattle) as it notices someone, repeated every `alertEvery` s if set. */
    alert?: string;
    alertEvery?: number;
    /** Its attack (bite, swipe, strike). */
    attack?: string;
    /** Hit, instead of the shared squeal (a wolf's yelp). */
    hurt?: string;
    /** A herd bolting (the rumble of a stampede). */
    stampede?: string;
  };
}

/** One animal placed on a map. */
export interface AnimalSpawn {
  species: AnimalId;
  at: Vec2;
  yaw?: number;
  /** Penned: it never leaves this rectangle (minX, minZ, maxX, maxZ), even when it bolts. */
  pen?: [number, number, number, number];
  /** Free: it wanders within this radius of `at` (default 6) and comes back after bolting. */
  roam?: number;
  /** Wolves of one pack share this id: they rest together, notice together and fight together. */
  pack?: string;
}

export const ANIMALS: Record<AnimalId, AnimalDef> = {
  cow: {
    id: 'cow',
    name: 'Cow',
    hp: 120,
    radius: 0.75,
    hit: { r: 0.5, y0: 0.45, y1: 1.6, along: [-0.6, 0.15, 0.95] },
    walkSpeed: 1.0,
    runSpeed: 4.6,
    idle: { poses: { graze: 6, stand: 3, rest: 1.5 }, time: [5, 14] },
    stroll: 7,
    startle: { shot: 22, rush: 4.5 },
    fleeTime: [2.5, 4],
    herd: 10,
    domestic: true,
    loot: [
      { item: 'meat', count: [3, 4] },
      { item: 'leather', count: [1, 1] },
      { item: 'leather', count: [0, 1] },
    ],
    lootGrid: { w: 4, h: 3 },
    sounds: { call: 'cow.moo', interval: [12, 30], pitch: 0.7, step: 0.45 },
  },
  pig: {
    id: 'pig',
    name: 'Pig',
    hp: 70,
    radius: 0.5,
    hit: { r: 0.38, y0: 0.15, y1: 0.85, along: [-0.3, 0.3] },
    walkSpeed: 0.9,
    runSpeed: 4.0,
    idle: { poses: { graze: 5, rest: 3, stand: 2 }, time: [4, 11] },
    stroll: 5,
    startle: { shot: 18, rush: 3.5 },
    fleeTime: [2, 3.5],
    herd: 7,
    domestic: true,
    loot: [
      { item: 'meat', count: [2, 3] },
      { item: 'leather', count: [1, 1] },
    ],
    lootGrid: { w: 4, h: 2 },
    sounds: { call: 'pig.oink', interval: [6, 16], pitch: 1, step: 0.25 },
  },
  chicken: {
    id: 'chicken',
    name: 'Chicken',
    hp: 15,
    radius: 0.2,
    hit: { r: 0.2, y0: 0.1, y1: 0.55, along: [0] },
    walkSpeed: 0.8,
    runSpeed: 3.6,
    idle: { poses: { peck: 7, stand: 2, rest: 1 }, time: [2, 6] },
    stroll: 3.5,
    startle: { shot: 16, rush: 3 },
    fleeTime: [1.2, 2.2],
    herd: 5,
    domestic: true,
    loot: [
      { item: 'meat', count: [1, 1] },
      { item: 'feathers', count: [2, 4] },
    ],
    lootGrid: { w: 2, h: 1 },
    sounds: { call: 'chicken.cluck', interval: [3, 9], pitch: 1.7, step: 0 },
  },
  dog: {
    id: 'dog',
    name: 'Dog',
    hp: 60,
    radius: 0.3,
    hit: { r: 0.24, y0: 0.2, y1: 0.8, along: [-0.2, 0.25] },
    walkSpeed: 1.3,
    runSpeed: 6.5,
    idle: { poses: { sit: 4, stand: 3, rest: 3, graze: 2 }, time: [4, 12] },
    stroll: 8,
    startle: { shot: 24, rush: 2.5 },
    fleeTime: [2, 3.5],
    herd: 0,
    domestic: true,
    pettable: true,
    watch: 5,
    loot: [],
    lootGrid: { w: 1, h: 1 },
    sounds: { call: 'dog.bark', interval: [10, 25], pitch: 1.15, step: 0 },
  },
  cat: {
    id: 'cat',
    name: 'Cat',
    hp: 20,
    radius: 0.15,
    hit: { r: 0.15, y0: 0.08, y1: 0.45, along: [-0.08, 0.15] },
    walkSpeed: 0.9,
    runSpeed: 6,
    idle: { poses: { sit: 5, rest: 4, stand: 1, graze: 1 }, time: [6, 16] },
    stroll: 3,
    startle: { shot: 26, rush: 3.5 },
    fleeTime: [1.5, 2.5],
    herd: 0,
    domestic: true,
    pettable: true,
    loot: [],
    lootGrid: { w: 1, h: 1 },
    sounds: { call: 'cat.meow', interval: [14, 35], pitch: 1.8, step: 0, pet: 'cat.purr' },
  },
  bison: {
    id: 'bison',
    name: 'Bison',
    hp: 135, // three rifle hits
    radius: 0.85,
    hit: { r: 0.6, y0: 0.4, y1: 1.85, along: [-0.6, 0.2, 0.95] },
    walkSpeed: 0.9,
    runSpeed: 7.5,
    idle: { poses: { graze: 6, stand: 3, rest: 1 }, time: [6, 15] },
    stroll: 8,
    startle: { shot: 30, rush: 6, near: 3 },
    fleeTime: [3.5, 5],
    herd: 14,
    domestic: false,
    trample: { damage: 30, push: 2.2 },
    loot: [
      { item: 'meat', count: [4, 5] },
      { item: 'leather', count: [1, 1] },
      { item: 'leather', count: [0, 1] },
    ],
    lootGrid: { w: 4, h: 3 },
    sounds: { call: 'bison.grunt', interval: [10, 26], pitch: 0.6, step: 0.6, stampede: 'bison.stampede' },
  },
  wolf: {
    id: 'wolf',
    name: 'Wolf',
    hp: 50, // two revolver or rifle hits
    radius: 0.35,
    hit: { r: 0.3, y0: 0.25, y1: 0.95, along: [-0.25, 0.3] },
    walkSpeed: 1.4,
    runSpeed: 7.2,
    idle: { poses: { rest: 6, sit: 3, stand: 1 }, time: [6, 16] },
    stroll: 3,
    startle: { shot: 30, rush: 0 },
    fleeTime: [2, 3],
    herd: 0,
    domestic: false,
    hunts: {
      notice: 13,
      attack: 7,
      crouch: 0.45,
      leash: 24,
      calm: 4,
      warn: 0.4,
      bite: { damage: 10, reach: 0.7, windup: 0.25, cooldown: 1.1 },
      flee: { below: 0.4, time: 10 },
    },
    loot: [{ item: 'pelt', count: [1, 1] }],
    lootGrid: { w: 2, h: 2 },
    sounds: { call: 'wolf.howl', interval: [25, 60], pitch: 1.1, step: 0, alert: 'wolf.growl', attack: 'wolf.bite', hurt: 'wolf.yelp' },
  },
  bear: {
    id: 'bear',
    name: 'Grizzly',
    hp: 180, // four rifle hits
    radius: 0.8,
    hit: { r: 0.6, y0: 0.3, y1: 1.6, along: [-0.5, 0.3, 0.9] },
    walkSpeed: 1.2,
    runSpeed: 8.8, // faster than you on foot (6.9), slower than a galloping horse (12.5)
    idle: { poses: { stand: 3, graze: 3, sit: 2, rest: 2 }, time: [6, 14] },
    stroll: 6,
    startle: { shot: 35, rush: 0 },
    fleeTime: [2, 3],
    herd: 0,
    domestic: false,
    hunts: {
      notice: 16,
      attack: 9,
      crouch: 0.5,
      leash: 26,
      calm: 5,
      warn: 1.6,
      rears: true,
      bite: { damage: Infinity, reach: 0.9, windup: 0.45, cooldown: 1.6 },
    },
    loot: [
      { item: 'bear_pelt', count: [1, 1] },
      { item: 'meat', count: [3, 5] },
    ],
    lootGrid: { w: 4, h: 3 },
    sounds: { call: 'bear.growl', interval: [14, 30], pitch: 0.5, step: 0.5, alert: 'bear.roar', attack: 'bear.swipe' },
  },
  snake: {
    id: 'snake',
    name: 'Rattlesnake',
    hp: 25, // one revolver shot
    radius: 0.28,
    hit: { r: 0.32, y0: 0, y1: 0.5, along: [0.22, -0.38] }, // the model is built 1.5× (see SnakeModel)
    walkSpeed: 0.5,
    runSpeed: 1.8,
    idle: { poses: { rest: 4, stand: 1 }, time: [8, 20] },
    stroll: 2.5,
    startle: { shot: 0, rush: 0 },
    fleeTime: [1, 2],
    herd: 0,
    domestic: false,
    hunts: {
      notice: 4.5,
      attack: 2.4,
      crouch: 0.8,
      leash: 4,
      calm: 2,
      warn: 1.2,
      bite: { damage: 8, reach: 0.9, windup: 0.3, cooldown: 1.6 },
    },
    loot: [],
    lootGrid: { w: 1, h: 1 },
    sounds: { call: 'snake.hiss', interval: [12, 30], pitch: 2, step: 0, alert: 'snake.rattle', alertEvery: 1.1, attack: 'snake.strike' },
  },
};
