import { PAL } from '../render/palette';
import type { NpcDef, NpcLines } from './types';

/**
 * NPCs on the sandbox map. To add one, append an entry: outfit and weapon are plain data
 * (`weapon` takes an id from WEAPONS or a full inline WeaponDef).
 */
export const NPCS: NpcDef[] = [
  {
    id: 'porch-gunman',
    attitude: 'friendly',
    defendsOthers: true,
    outfit: {
      body: 'male',
      skin: PAL.skin,
      hair: PAL.darkBrown,
      hairStyle: 'short',
      beard: PAL.brown,
      shirt: PAL.cream,
      trousers: PAL.denim,
      boots: PAL.darkBrown,
      over: { kind: 'vest', color: PAL.brown },
      hat: { kind: 'cowboy', color: PAL.woodPale, band: PAL.darkBrown },
    },
    weapon: 'revolver',
    holster: true,
    spawn: [0.45, -4.25],
    // Leaning on the left porch post of the store across the street from the spawn.
    routine: { kind: 'lean', at: [0.45, -4.25], facing: 0 },
  },
  {
    id: 'townswoman',
    attitude: 'friendly',
    defendsOthers: false,
    outfit: {
      body: 'female',
      skin: PAL.skin,
      hair: PAL.woodLight,
      hairStyle: 'bun',
      shirt: PAL.cream,
      trousers: PAL.cream,
      boots: PAL.darkBrown,
      dress: { color: PAL.skyDeep, trim: PAL.cream },
      hat: { kind: 'bonnet', color: PAL.cream, band: PAL.skyDeep },
    },
    weapon: null,
    holster: false,
    spawn: [4, -3.2],
    routine: {
      kind: 'wander',
      points: [[-14, -3.6], [-5, -3.4], [3.5, -3.4], [12, -3.6], [20, -3.6], [-16.4, -10], [-16.4, -1], [-16.4, 7]],
      jitter: 1.2,
      pause: [2, 6],
    },
  },
  {
    id: 'fence-rifle',
    attitude: 'neutral',
    defendsOthers: false,
    outfit: {
      body: 'female',
      skin: PAL.skinDark,
      hair: PAL.ink,
      hairStyle: 'long',
      shirt: PAL.rustLight,
      trousers: PAL.brown,
      boots: PAL.ink,
      over: { kind: 'duster', color: PAL.sandDark },
      hat: { kind: 'cowboy', color: PAL.darkBrown, band: PAL.red },
    },
    weapon: 'rifle',
    holster: false,
    spawn: [-10, 10.6],
    routine: {
      kind: 'wander',
      points: [[-13, 10.6], [-8.5, 10.6], [-10, 7.6], [10.5, 10.6], [15, 10.6], [18, 7.6], [12, 7.6]],
      jitter: 0.6,
      pause: [3, 7],
    },
  },
  {
    id: 'edge-patrol',
    attitude: 'neutral',
    defendsOthers: false,
    outfit: {
      body: 'male',
      skin: PAL.skin,
      hair: PAL.ink,
      hairStyle: 'short',
      beard: PAL.ink,
      shirt: PAL.denim,
      trousers: PAL.sandDark,
      boots: PAL.darkBrown,
      chaps: PAL.wood,
      bandana: PAL.red,
      hat: { kind: 'cowboy', color: PAL.ink, band: PAL.brass },
    },
    weapon: 'shotgun',
    holster: false,
    spawn: [44, 14],
    routine: { kind: 'patrol', points: [[44, 44], [-44, 44], [-44, -44], [44, -44]], pause: 2 },
  },
];

/** Default lines per attitude (an NpcDef can override any of them). Font: A-Z 0-9 . , : ! ? ' - / */
export const DEFAULT_LINES: Record<NpcDef['attitude'], NpcLines> = {
  friendly: {
    greet: ['Howdy, stranger!', 'Fine day, ain\'t it?', 'Mind the sun out here.', 'Welcome to town, friend.'],
    warn: ['Hey! Watch where you point that!', 'Easy with that iron!', 'You near hit me!'],
    hostile: ['You asked for it!', 'That\'s it, draw!'],
    flee: ['Help! Somebody help!', 'Don\'t shoot!'],
    calm: ['Reckon that\'s over.'],
  },
  neutral: {
    greet: ['What do you want?', 'Keep walking.', 'Hm.', 'Mind your business.'],
    warn: ['Careful, stranger.', 'Do that again, I dare you.', 'Watch it!'],
    hostile: ['Big mistake.', 'Now you\'ve done it.'],
    flee: ['Leave me be!', 'Not worth dying over!'],
    calm: ['Hmph. Gone.'],
  },
};

export const NAMES = {
  male: ['Jed', 'Eli', 'Wade', 'Cole', 'Silas', 'Amos', 'Hank', 'Virgil', 'Clay', 'Ezra'],
  female: ['Clara', 'Mae', 'Hattie', 'Ruth', 'Etta', 'Lottie', 'Ada', 'Josie', 'Pearl', 'Nell'],
  last: ['Collins', 'Harlan', 'McCready', 'Sutter', 'Boone', 'Calloway', 'Pickett', 'Hollis', 'Tate', 'Whitlock'],
};
