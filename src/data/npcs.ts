import { PAL } from '../render/palette';
import type { NpcDef, NpcLines } from './types';

/**
 * NPCs on the sandbox map. To add one, append an entry: appearance and weapon are plain data
 * (`appearance.clothing` takes ids from the ClothingRegistry in data/clothing.ts, `weapon` an id
 * from WEAPONS or a full inline WeaponDef, `inventory` optional item ids from data/items.ts).
 */
export const NPCS: NpcDef[] = [
  {
    id: 'porch-gunman',
    attitude: 'friendly',
    defendsOthers: true,
    appearance: {
      body: 'male',
      skin: PAL.skin,
      hair: PAL.darkBrown,
      hairStyle: 'short',
      beard: PAL.brown,
      clothing: {
        hat: 'cowboy_hat_tan',
        top: 'shirt_cream',
        outerwear: 'vest_brown',
        legs: 'trousers_denim',
        boots: 'boots_brown',
        belt: 'belt_leather',
        holster: 'holster_leather',
      },
    },
    weapon: 'revolver',
    spawn: [0.45, -4.25],
    // Leaning on the left porch post of the store across the street from the spawn.
    routine: { kind: 'lean', at: [0.45, -4.25], facing: 0 },
  },
  {
    id: 'townswoman',
    attitude: 'friendly',
    defendsOthers: false,
    appearance: {
      body: 'female',
      skin: PAL.skin,
      hair: PAL.woodLight,
      hairStyle: 'bun',
      clothing: { hat: 'bonnet_cream', legs: 'dress_blue', boots: 'boots_brown' },
    },
    weapon: null,
    spawn: [4, -3.2],
    routine: {
      kind: 'wander',
      points: [[-14, -3.6], [-5, -3.4], [3.5, -3.4], [12, -3.6], [20, -3.6], [-16.4, -10], [-16.4, -1], [-15.6, 4.6]],
      jitter: 1.2,
      pause: [2, 6],
      inspect: 0.3,
    },
  },
  {
    id: 'fence-rifle',
    attitude: 'neutral',
    defendsOthers: false,
    appearance: {
      body: 'female',
      skin: PAL.skinDark,
      hair: PAL.ink,
      hairStyle: 'long',
      clothing: { hat: 'cowboy_hat_dark', top: 'shirt_rust', outerwear: 'duster_sand', legs: 'trousers_brown', boots: 'boots_black' },
    },
    weapon: 'rifle',
    spawn: [-10, 10.6],
    routine: {
      kind: 'wander',
      points: [[-13, 10.6], [-8.5, 10.6], [-10, 7.6], [10.5, 10.6], [15, 10.6], [18, 7.6], [12, 7.6]],
      jitter: 0.6,
      pause: [3, 7],
      inspect: 0.45,
    },
  },
  {
    id: 'edge-patrol',
    attitude: 'neutral',
    defendsOthers: false,
    appearance: {
      body: 'male',
      skin: PAL.skin,
      hair: PAL.ink,
      hairStyle: 'short',
      beard: PAL.ink,
      clothing: { hat: 'cowboy_hat_black', top: 'shirt_denim', neck: 'bandana_red', legs: 'chaps_wood', boots: 'boots_brown' },
    },
    weapon: 'shotgun',
    spawn: [44, 14],
    routine: { kind: 'patrol', points: [[44, 44], [-44, 44], [-44, -44], [44, -44]], pause: 2 },
  },
  {
    id: 'gunsmith',
    attitude: 'friendly',
    defendsOthers: false,
    shop: 'gunsmith',
    appearance: {
      body: 'male',
      skin: PAL.skin,
      hair: PAL.brown,
      hairStyle: 'short',
      beard: PAL.brown,
      clothing: {
        hat: 'cowboy_hat_brown',
        top: 'shirt_grey',
        outerwear: 'vest_brown',
        legs: 'trousers_brown',
        boots: 'boots_black',
        belt: 'belt_leather',
      },
    },
    weapon: null,
    spawn: [15.55, -4.25],
    // Leaning on the right porch post of the red store on the north row.
    routine: { kind: 'lean', at: [15.55, -4.25], facing: 0 },
    lines: { greet: ['Looking for iron?', 'Finest guns this side of the Pecos.'] },
    hints: [{ poi: 'two-spurs-ranch', line: 'Need a horse? Abel Spurr breaks them at Two Spurs Ranch, up the north trail.' }],
  },
  {
    id: 'tailor',
    attitude: 'friendly',
    defendsOthers: false,
    shop: 'tailor',
    appearance: {
      body: 'female',
      skin: PAL.skin,
      hair: PAL.darkBrown,
      hairStyle: 'bun',
      clothing: { legs: 'dress_red', boots: 'boots_black' },
    },
    weapon: null,
    spawn: [-16.9, 9.2],
    // On the porch of the big building on the west side, beside the door.
    routine: { kind: 'idle', at: [-16.9, 9.2], facing: Math.PI / 2 },
    lines: { greet: ['That coat has seen better days.', 'Something finer, perhaps?'] },
  },
  // ---------------------------------------------------------------- the south quarter
  {
    id: 'butcher',
    attitude: 'friendly',
    defendsOthers: false,
    shop: 'butcher',
    appearance: {
      body: 'male',
      skin: PAL.skinDark,
      hair: PAL.ink,
      hairStyle: 'short',
      beard: PAL.ink,
      clothing: { top: 'shirt_cream', legs: 'trousers_brown', boots: 'boots_black', belt: 'belt_leather' },
    },
    weapon: null,
    spawn: [-14, 30.3],
    // On the porch of his shop on the south street.
    routine: { kind: 'idle', at: [-14, 30.3], facing: 0 },
    lines: { greet: ['Fresh meat fetches a fair price.', 'Bring me what you shoot. I pay by the pound.'] },
  },
  {
    id: 'tanner',
    attitude: 'friendly',
    defendsOthers: false,
    shop: 'tanner',
    appearance: {
      body: 'female',
      skin: PAL.skin,
      hair: PAL.woodLight,
      hairStyle: 'bun',
      clothing: { hat: 'cowboy_hat_brown', top: 'shirt_rust', outerwear: 'vest_brown', legs: 'trousers_brown', boots: 'boots_brown', belt: 'belt_leather' },
    },
    weapon: null,
    spawn: [-8.45, 31.75],
    // Leaning on the left porch post of the tannery.
    routine: { kind: 'lean', at: [-8.45, 31.75], facing: 0 },
    lines: { greet: ['Hides, pelts, feathers. I take them all.', 'Good leather starts with a clean shot.'] },
    hints: [{ poi: 'desert-plains', line: 'Bison graze the plains west of Two Spurs Ranch. Mind the wolves out there.' }],
  },
  {
    id: 'sheriff',
    attitude: 'friendly',
    defendsOthers: true,
    appearance: {
      body: 'male',
      skin: PAL.skin,
      hair: PAL.brown,
      hairStyle: 'short',
      beard: PAL.woodLight,
      clothing: { hat: 'cowboy_hat_black', top: 'shirt_grey', outerwear: 'vest_brown', legs: 'trousers_denim', boots: 'boots_black', belt: 'belt_leather', holster: 'holster_leather' },
    },
    weapon: 'nickel_revolver',
    hp: 120,
    spawn: [8.5, 30.3],
    // Keeping an eye on the street from the porch of his office.
    routine: { kind: 'idle', at: [8.5, 30.3], facing: 0.3 },
    lines: { greet: ["Keep your iron holstered in my town.", 'Quiet day. I like quiet days.'] },
  },
  {
    id: 'farmer',
    attitude: 'neutral',
    defendsOthers: false,
    appearance: {
      body: 'male',
      skin: PAL.skinDark,
      hair: PAL.darkBrown,
      hairStyle: 'short',
      clothing: { hat: 'cowboy_hat_tan', top: 'shirt_denim', legs: 'trousers_brown', boots: 'boots_brown' },
    },
    weapon: null,
    spawn: [2, 34],
    routine: {
      kind: 'wander',
      points: [[-18, 34], [-6, 35], [2, 34], [14, 35], [22, 34], [1.5, 20], [1.5, 8]],
      jitter: 1.2,
      pause: [3, 7],
      inspect: 0.3,
    },
    lines: { greet: ['Morning.', 'Dry year. Drier than the last.'] },
  },
  {
    id: 'drifter',
    attitude: 'neutral',
    defendsOthers: false,
    appearance: {
      body: 'male',
      skin: PAL.skin,
      hair: PAL.ink,
      hairStyle: 'long',
      beard: PAL.ink,
      clothing: { hat: 'cowboy_hat_dark', top: 'shirt_grey', outerwear: 'duster_dark', legs: 'trousers_denim', boots: 'boots_black' },
    },
    weapon: 'revolver',
    spawn: [15.05, 31.75],
    // Leaning on the porch post of the house at the end of the street.
    routine: { kind: 'lean', at: [15.05, 31.75], facing: 0 },
    lines: { greet: ["Just passin' through.", "Don't mind me."] },
  },
];

/** Default lines per attitude (an NpcDef can override any of them). Font: A-Z 0-9 . , : ! ? ' - / */
export const DEFAULT_LINES: Record<NpcDef['attitude'], NpcLines> = {
  hostile: {
    greet: ['...'],
    warn: ['Ha!'],
    hostile: ['There he is!', 'Get him, boys!', 'Your hide\'s worth money!', 'End of the line.'],
    flee: ['I\'m out! Fall back!'],
    calm: ['...'],
  },
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
