/**
 * Every sound in the game: what bus it plays on, how loud, how it varies, how often it may
 * play, how far it carries, and the synthesized recipe that makes it. Sounds with recorded
 * samples (see soundManifest.ts) use their recipe as the fallback when no sample is loaded.
 */

export type Bus = 'effects' | 'voices' | 'ambience' | 'ui';

export interface FilterSpec {
  type: BiquadFilterType;
  freq: number;
  /** Sweep the cutoff to this over the layer's length. */
  freqEnd?: number;
  q?: number;
}

/** One voice of a recipe: a tone or noise burst with its own envelope and filter. */
export interface RecipeLayer {
  kind: 'tone' | 'noise';
  /** Tones: oscillator shape. */
  wave?: OscillatorType;
  /** Tones: start frequency (Hz). */
  freq?: number;
  /** Tones: glide to this frequency over the attack + hold + decay. */
  freqEnd?: number;
  filter?: FilterSpec;
  /** Peak gain (0..1, before the sound's volume). */
  gain: number;
  /** Seconds after the sound starts. */
  delay?: number;
  attack: number;
  /** Seconds at the peak before decaying. */
  hold?: number;
  /** Seconds to fall to silence. */
  decay: number;
}

export interface Recipe {
  layers: RecipeLayer[];
}

export interface SoundDef {
  bus: Bus;
  /** Synth recipe (the fallback for sample-based sounds). */
  recipe: string;
  /** Base volume 0..1. */
  volume?: number;
  /** Random pitch / volume variation per play (fraction, e.g. 0.06 = ±6 %). */
  pitchVar?: number;
  volVar?: number;
  /** At most this many copies playing at once (the quietest/oldest is replaced). */
  maxConcurrent?: number;
  /** Minimum seconds between two starts. */
  cooldown?: number;
  /** World sounds: full volume within `ref` units, silent beyond `maxDistance`. */
  ref?: number;
  maxDistance?: number;
}

const click = (freq: number, gain: number, decay: number): RecipeLayer => ({ kind: 'tone', wave: 'square', freq, freqEnd: freq * 0.6, gain, attack: 0.001, decay, filter: { type: 'lowpass', freq: 3200 } });

// ---------------------------------------------------------------- building blocks

const noise = (gain: number, decay: number, filter: FilterSpec, o: Partial<RecipeLayer> = {}): RecipeLayer => ({ kind: 'noise', gain, attack: 0.002, decay, filter, ...o });
const tone = (wave: OscillatorType, freq: number, freqEnd: number | undefined, gain: number, decay: number, o: Partial<RecipeLayer> = {}): RecipeLayer => ({ kind: 'tone', wave, freq, freqEnd, gain, attack: 0.002, decay, ...o });

/** A small metallic click (cartridge, hammer, latch). */
const metal = (delay: number, freq = 3000, gain = 0.35): RecipeLayer[] => [
  tone('square', freq, freq * 0.7, gain * 0.5, 0.025, { delay, filter: { type: 'bandpass', freq: freq * 1.2, q: 2 } }),
  noise(gain, 0.02, { type: 'highpass', freq: 3500 }, { delay }),
];

/** A heavier mechanical clack (lever, break-action hinge). */
const clack = (delay: number, gain = 0.6): RecipeLayer[] => [
  noise(gain, 0.06, { type: 'bandpass', freq: 1300, q: 1.2 }, { delay }),
  tone('triangle', 520, 300, gain * 0.5, 0.07, { delay }),
  ...metal(delay + 0.012, 2400, gain * 0.5),
];

/** A shell or cartridge sliding home. */
const slideIn = (delay: number, gain = 0.3): RecipeLayer[] => [
  noise(gain, 0.12, { type: 'bandpass', freq: 1800, freqEnd: 3200, q: 3 }, { delay, attack: 0.05 }),
  ...metal(delay + 0.16, 2200, gain),
];

/** A voiced grunt: a buzzy source through two vowel formants (pitch scales it per voice). */
const grunt = (f0: number, f1: number, hold: number, decay: number, gain: number, o: Partial<RecipeLayer> = {}): RecipeLayer[] => [
  tone('sawtooth', f0, f1, gain, decay, { attack: 0.02, hold, filter: { type: 'bandpass', freq: 650, q: 1.6 }, ...o }),
  tone('sawtooth', f0, f1, gain * 0.45, decay, { attack: 0.02, hold, filter: { type: 'bandpass', freq: 1150, q: 2 }, ...o }),
  noise(gain * 0.15, decay * 0.8, { type: 'bandpass', freq: 1000, q: 1 }, { attack: 0.01, hold, ...o }),
];

export const RECIPES: Record<string, Recipe> = {
  // ---------------------------------------------------------------- guns (fallbacks for samples)
  gunRevolver: {
    layers: [
      noise(0.9, 0.08, { type: 'bandpass', freq: 3000, q: 0.7 }),
      noise(0.8, 0.38, { type: 'lowpass', freq: 5000, freqEnd: 450 }),
      tone('sine', 150, 45, 0.9, 0.18),
    ],
  },
  gunRifle: {
    layers: [
      noise(1, 0.06, { type: 'bandpass', freq: 3600, q: 0.8 }),
      noise(0.8, 0.55, { type: 'lowpass', freq: 7000, freqEnd: 380 }),
      tone('sine', 115, 35, 1, 0.26),
      noise(0.25, 0.8, { type: 'lowpass', freq: 900 }, { delay: 0.05, attack: 0.03 }),
    ],
  },
  gunShotgun: {
    layers: [
      noise(0.75, 0.09, { type: 'bandpass', freq: 1800, q: 0.7 }),
      noise(1, 0.62, { type: 'lowpass', freq: 3600, freqEnd: 240 }),
      tone('sine', 92, 30, 1, 0.32),
    ],
  },
  gunDerringer: {
    layers: [
      noise(0.7, 0.05, { type: 'bandpass', freq: 4200, q: 0.8 }),
      noise(0.55, 0.18, { type: 'lowpass', freq: 6000, freqEnd: 900 }),
      tone('sine', 230, 80, 0.5, 0.08),
    ],
  },
  /** The rolling echo after a distant shot. */
  gunEcho: {
    layers: [
      noise(0.35, 1.3, { type: 'lowpass', freq: 1100, freqEnd: 260 }, { attack: 0.06 }),
      noise(0.18, 1.0, { type: 'lowpass', freq: 800, freqEnd: 200 }, { delay: 0.38, attack: 0.08 }),
    ],
  },
  gunDry: { layers: [...metal(0, 2600, 0.45), tone('triangle', 900, 700, 0.1, 0.03)] },
  gunDraw: {
    layers: [
      noise(0.22, 0.14, { type: 'bandpass', freq: 1400, freqEnd: 3000, q: 2 }, { attack: 0.05 }),
      ...metal(0.17, 1900, 0.35),
    ],
  },
  gunHolster: {
    layers: [
      noise(0.2, 0.14, { type: 'bandpass', freq: 2600, freqEnd: 1200, q: 2 }, { attack: 0.04 }),
      tone('sine', 170, 110, 0.35, 0.07, { delay: 0.16 }),
    ],
  },
  reloadRevolver: {
    layers: [
      ...metal(0.02, 2000, 0.4), // loading gate
      ...[0.25, 0.45, 0.65, 0.85, 1.05].flatMap((t) => metal(t, 3200, 0.3)),
      ...[1.17, 1.21, 1.25, 1.29].flatMap((t) => metal(t, 4200, 0.15)), // cylinder spin
      ...metal(1.38, 2200, 0.5),
    ],
  },
  reloadRifle: {
    layers: [
      ...[0.3, 0.65, 1.0, 1.35, 1.7].flatMap((t) => slideIn(t, 0.25)),
      ...clack(2.0, 0.6), // lever down
      ...clack(2.25, 0.7), // and up
    ],
  },
  reloadShotgun: {
    layers: [
      ...clack(0.1, 0.8), // break open
      ...slideIn(0.85, 0.35),
      ...slideIn(1.35, 0.35),
      ...clack(2.1, 0.9), // snap shut
    ],
  },
  reloadDerringer: { layers: [...clack(0.05, 0.4), ...metal(0.4, 3000, 0.3), ...metal(0.65, 3000, 0.3), ...clack(0.95, 0.5)] },

  // ---------------------------------------------------------------- impacts (fallbacks for samples)
  impactDirt: { layers: [noise(0.6, 0.12, { type: 'lowpass', freq: 1800, freqEnd: 300 }), tone('sine', 90, 50, 0.3, 0.06)] },
  impactWood: {
    layers: [
      tone('triangle', 260, 170, 0.5, 0.08),
      noise(0.6, 0.07, { type: 'bandpass', freq: 1200, q: 1.5 }),
      noise(0.4, 0.02, { type: 'highpass', freq: 3500 }),
    ],
  },
  impactRock: {
    layers: [
      noise(0.55, 0.1, { type: 'bandpass', freq: 2500, q: 1 }),
      tone('sine', 2300, 1300, 0.12, 0.28, { delay: 0.01 }), // ricochet whine
    ],
  },
  impactMetal: {
    layers: [
      tone('sine', 1800, 1750, 0.3, 0.4),
      tone('sine', 2650, 2600, 0.2, 0.3),
      noise(0.4, 0.03, { type: 'highpass', freq: 3000 }),
    ],
  },
  impactCactus: { layers: [noise(0.4, 0.08, { type: 'lowpass', freq: 1200 }), tone('sine', 140, 90, 0.3, 0.05)] },
  impactFlesh: { layers: [noise(0.7, 0.1, { type: 'lowpass', freq: 900, freqEnd: 200 }), tone('sine', 72, 45, 0.6, 0.08)] },
  impactGlass: {
    layers: [
      noise(0.5, 0.22, { type: 'highpass', freq: 4500 }),
      ...[0, 0.03, 0.07, 0.12, 0.18].map((t, i) => tone('sine', 3000 + i * 600, undefined, 0.12, 0.08, { delay: t })),
    ],
  },

  // ---------------------------------------------------------------- bodies
  hurtPlayer: { layers: [...grunt(160, 118, 0.04, 0.2, 0.45), tone('sine', 72, 42, 0.8, 0.15)] },
  /** NPC grunt / groan at 120 Hz; played with the NPC's voice pitch. */
  npcGrunt: { layers: grunt(120, 96, 0.04, 0.16, 0.45) },
  npcDeath: { layers: grunt(124, 70, 0.28, 0.7, 0.5) },
  crateBreak: {
    layers: [
      noise(0.9, 0.05, { type: 'highpass', freq: 2000 }),
      noise(0.7, 0.35, { type: 'bandpass', freq: 900, q: 0.8 }),
      ...[0.05, 0.11, 0.19, 0.26].map((t) => noise(0.5, 0.04, { type: 'bandpass', freq: 2500, q: 2 }, { delay: t })),
      tone('sine', 92, 50, 0.7, 0.2),
      noise(0.25, 0.5, { type: 'lowpass', freq: 2500 }, { delay: 0.15, attack: 0.03 }),
    ],
  },
  // ---------------------------------------------------------------- movement (fallbacks for samples)
  stepDirt: {
    layers: [
      noise(0.5, 0.09, { type: 'lowpass', freq: 900, freqEnd: 300 }, { attack: 0.005 }),
      tone('sine', 72, 50, 0.25, 0.05),
      noise(0.12, 0.04, { type: 'bandpass', freq: 2600, q: 1 }, { delay: 0.012 }), // grit
    ],
  },
  stepWood: {
    layers: [
      tone('triangle', 185, 120, 0.45, 0.07), // hollow knock
      noise(0.35, 0.06, { type: 'bandpass', freq: 800, q: 2 }),
      noise(0.1, 0.05, { type: 'bandpass', freq: 2200, q: 4 }, { delay: 0.03 }), // a board's creak
    ],
  },
  hoofDirt: {
    layers: [
      tone('sine', 115, 60, 0.7, 0.07),
      noise(0.5, 0.06, { type: 'lowpass', freq: 1200 }),
      noise(0.3, 0.03, { type: 'bandpass', freq: 950, q: 3 }), // the clop
    ],
  },
  horseSnort: {
    layers: [
      noise(0.6, 0.3, { type: 'bandpass', freq: 650, freqEnd: 350, q: 1.2 }, { attack: 0.03 }),
      noise(0.2, 0.25, { type: 'bandpass', freq: 1600, q: 2 }, { attack: 0.03 }),
      tone('sawtooth', 46, 38, 0.15, 0.3, { attack: 0.03, filter: { type: 'lowpass', freq: 400 } }), // lips flutter
      noise(0.35, 0.18, { type: 'bandpass', freq: 500, q: 1 }, { delay: 0.32, attack: 0.02 }),
    ],
  },
  horseWhinny: {
    layers: [
      tone('sawtooth', 520, 1250, 0.35, 0.3, { attack: 0.08, hold: 0.05, filter: { type: 'bandpass', freq: 1400, q: 1.5 } }),
      ...[0.36, 0.48, 0.6, 0.72].map((t, i) =>
        tone('sawtooth', 1200 - i * 160, 1040 - i * 160, 0.3 - i * 0.04, 0.16, { delay: t, attack: 0.03, filter: { type: 'bandpass', freq: 1150, q: 1.4 } }),
      ),
      noise(0.1, 1.0, { type: 'bandpass', freq: 2000, q: 1 }, { attack: 0.1 }),
    ],
  },
  bulletWhizz: {
    layers: [
      noise(0.7, 0.16, { type: 'bandpass', freq: 3500, freqEnd: 900, q: 3 }, { attack: 0.02 }),
      tone('sine', 1400, 700, 0.08, 0.15, { attack: 0.02 }),
    ],
  },

  // ---------------------------------------------------------------- containers
  lidBarrel: {
    layers: [
      noise(0.3, 0.2, { type: 'bandpass', freq: 900, q: 1.5 }, { attack: 0.05 }), // lid scraped off
      tone('triangle', 165, 110, 0.4, 0.1, { delay: 0.35 }), // set down
      noise(0.3, 0.1, { type: 'lowpass', freq: 600 }, { delay: 0.35 }),
    ],
  },
  lidCrate: {
    layers: [
      tone('sawtooth', 90, 145, 0.22, 0.3, { attack: 0.05, filter: { type: 'bandpass', freq: 1100, q: 8 } }), // creak
      tone('triangle', 150, 100, 0.45, 0.1, { delay: 0.32 }),
      noise(0.3, 0.09, { type: 'lowpass', freq: 700 }, { delay: 0.32 }),
    ],
  },
  lidChest: {
    layers: [
      tone('sawtooth', 70, 125, 0.24, 0.3, { attack: 0.1, hold: 0.2, filter: { type: 'bandpass', freq: 900, q: 10 } }), // old hinge
      tone('sawtooth', 120, 95, 0.14, 0.2, { delay: 0.3, attack: 0.05, filter: { type: 'bandpass', freq: 1300, q: 10 } }),
      tone('triangle', 130, 85, 0.5, 0.12, { delay: 0.58 }),
      noise(0.35, 0.1, { type: 'lowpass', freq: 650 }, { delay: 0.58 }),
    ],
  },
  lidAmmoBox: { layers: [...metal(0, 3200, 0.35), ...metal(0.06, 2800, 0.3), tone('triangle', 260, 180, 0.3, 0.06, { delay: 0.16 })] },
  lidWeaponCrate: {
    layers: [
      noise(0.3, 0.08, { type: 'bandpass', freq: 2500, q: 3 }), // prised up
      tone('sawtooth', 85, 130, 0.2, 0.28, { delay: 0.05, attack: 0.05, filter: { type: 'bandpass', freq: 1000, q: 8 } }),
      tone('triangle', 120, 80, 0.55, 0.13, { delay: 0.42 }),
      noise(0.4, 0.12, { type: 'lowpass', freq: 600 }, { delay: 0.42 }),
    ],
  },
  lidClose: { layers: [tone('triangle', 140, 90, 0.5, 0.1), noise(0.35, 0.08, { type: 'lowpass', freq: 700 })] },

  // ---------------------------------------------------------------- inventory & shop
  invLift: { layers: [noise(0.25, 0.04, { type: 'bandpass', freq: 1800, q: 1.5 }), tone('sine', 700, 900, 0.1, 0.03)] },
  invDrop: { layers: [noise(0.35, 0.06, { type: 'lowpass', freq: 1200 }), tone('sine', 220, 160, 0.25, 0.05)] },
  invRotate: { layers: [tone('triangle', 900, 1250, 0.15, 0.035)] },
  invCloth: {
    layers: [
      noise(0.3, 0.16, { type: 'bandpass', freq: 3000, q: 0.8 }, { attack: 0.03 }),
      noise(0.2, 0.12, { type: 'bandpass', freq: 2200, q: 0.8 }, { delay: 0.09, attack: 0.03 }),
    ],
  },
  invGun: { layers: [...metal(0, 2400, 0.4), ...metal(0.05, 1800, 0.3), tone('sine', 160, 110, 0.25, 0.06, { delay: 0.05 })] },
  invUnload: { layers: [0, 0.05, 0.11, 0.18, 0.24, 0.29].flatMap((t, i) => metal(t, 3000 + ((i * 431) % 1200), 0.32 - i * 0.03)) },
  invNoSpace: {
    layers: [
      tone('square', 110, undefined, 0.12, 0.18, { filter: { type: 'lowpass', freq: 900 } }),
      tone('square', 104, undefined, 0.1, 0.18, { filter: { type: 'lowpass', freq: 900 } }),
    ],
  },
  shopCoins: { layers: [0, 0.06, 0.13, 0.19].flatMap((t, i) => [tone('sine', 2400 + i * 140, undefined, 0.18, 0.12, { delay: t }), tone('sine', 3300 + i * 90, undefined, 0.1, 0.09, { delay: t })]) },
  shopSell: { layers: [0, 0.08].flatMap((t, i) => [tone('sine', 2100 + i * 200, undefined, 0.18, 0.14, { delay: t }), tone('sine', 2900, undefined, 0.08, 0.1, { delay: t })]) },

  // ---------------------------------------------------------------- wave mode
  waveBell: {
    layers: [0, 0.85].flatMap((t) => [
      tone('sine', 660, undefined, 0.35, 1.8, { delay: t }),
      tone('sine', 1650, undefined, 0.16, 1.0, { delay: t }),
      tone('sine', 1980, undefined, 0.1, 0.6, { delay: t }),
      noise(0.2, 0.03, { type: 'bandpass', freq: 3000, q: 1 }, { delay: t }), // the strike
    ]),
  },
  waveCleared: { layers: [392, 494, 587, 784].map((f, i) => tone('triangle', f, undefined, 0.22, i === 3 ? 0.9 : 0.4, { delay: i * 0.11 })) },
  waveTick: { layers: [tone('triangle', 1000, 900, 0.3, 0.05), noise(0.15, 0.02, { type: 'bandpass', freq: 1500, q: 2 })] },
  waveTickLast: { layers: [tone('triangle', 1500, 1350, 0.35, 0.09), noise(0.2, 0.03, { type: 'bandpass', freq: 2200, q: 2 })] },

  // ---------------------------------------------------------------- UI
  uiHover: { layers: [click(1250, 0.12, 0.03)] },
  uiClick: {
    layers: [
      click(900, 0.25, 0.05),
      { kind: 'noise', gain: 0.12, attack: 0.001, decay: 0.03, filter: { type: 'bandpass', freq: 2500, q: 1.5 } },
    ],
  },
  uiSlider: { layers: [{ kind: 'tone', wave: 'triangle', freq: 660, gain: 0.25, attack: 0.002, decay: 0.06 }] },
  uiMute: {
    layers: [
      { kind: 'tone', wave: 'triangle', freq: 660, gain: 0.3, attack: 0.002, decay: 0.08 },
      { kind: 'tone', wave: 'triangle', freq: 440, gain: 0.3, delay: 0.08, attack: 0.002, decay: 0.12 },
    ],
  },
  uiUnmute: {
    layers: [
      { kind: 'tone', wave: 'triangle', freq: 440, gain: 0.3, attack: 0.002, decay: 0.08 },
      { kind: 'tone', wave: 'triangle', freq: 660, gain: 0.3, delay: 0.08, attack: 0.002, decay: 0.12 },
    ],
  },
};

export const SOUNDS: Record<string, SoundDef> = {
  'ui.hover': { bus: 'ui', recipe: 'uiHover', volume: 0.5, pitchVar: 0.03, cooldown: 0.03 },
  'ui.click': { bus: 'ui', recipe: 'uiClick', volume: 0.7, pitchVar: 0.03 },
  'ui.slider': { bus: 'ui', recipe: 'uiSlider', volume: 0.5, cooldown: 0.04 },
  'ui.mute': { bus: 'ui', recipe: 'uiMute', volume: 0.6 },
  'ui.unmute': { bus: 'ui', recipe: 'uiUnmute', volume: 0.6 },

  // Container lids open as the loot view opens (UI bus: the view pauses the world); they close
  // on their own in the world (wave mode restocks).
  'lid.barrel': { bus: 'ui', recipe: 'lidBarrel', volume: 0.7, ref: 3, maxDistance: 20 },
  'lid.crate': { bus: 'ui', recipe: 'lidCrate', volume: 0.7, ref: 3, maxDistance: 20 },
  'lid.chest': { bus: 'ui', recipe: 'lidChest', volume: 0.7, ref: 3, maxDistance: 20 },
  'lid.ammoBox': { bus: 'ui', recipe: 'lidAmmoBox', volume: 0.7, ref: 3, maxDistance: 20 },
  'lid.weaponCrate': { bus: 'ui', recipe: 'lidWeaponCrate', volume: 0.7, ref: 3, maxDistance: 20 },
  'lid.close': { bus: 'effects', recipe: 'lidClose', volume: 0.5, pitchVar: 0.1, ref: 3, maxDistance: 22, maxConcurrent: 3 },
  'item.pickup': { bus: 'effects', recipe: 'invLift', volume: 0.7, ref: 2, maxDistance: 12 },

  'inv.lift': { bus: 'ui', recipe: 'invLift', volume: 0.6, pitchVar: 0.08, cooldown: 0.03 },
  'inv.drop': { bus: 'ui', recipe: 'invDrop', volume: 0.6, pitchVar: 0.08, cooldown: 0.03 },
  'inv.rotate': { bus: 'ui', recipe: 'invRotate', volume: 0.5, cooldown: 0.03 },
  'inv.cloth': { bus: 'ui', recipe: 'invCloth', volume: 0.7, pitchVar: 0.08 },
  'inv.gun': { bus: 'ui', recipe: 'invGun', volume: 0.7, pitchVar: 0.05 },
  'inv.unload': { bus: 'ui', recipe: 'invUnload', volume: 0.7, pitchVar: 0.05 },
  'inv.noSpace': { bus: 'ui', recipe: 'invNoSpace', volume: 0.7, cooldown: 0.1 },
  'shop.buy': { bus: 'ui', recipe: 'shopCoins', volume: 0.6, pitchVar: 0.04 },
  'shop.sell': { bus: 'ui', recipe: 'shopSell', volume: 0.6, pitchVar: 0.04 },

  'wave.bell': { bus: 'ui', recipe: 'waveBell', volume: 0.7 },
  'wave.cleared': { bus: 'ui', recipe: 'waveCleared', volume: 0.6 },
  'wave.tick': { bus: 'ui', recipe: 'waveTick', volume: 0.5 },
  'wave.tickLast': { bus: 'ui', recipe: 'waveTickLast', volume: 0.6 },

  // Gunshots carry across the map; impacts and handling only nearby.
  'gun.revolver': { bus: 'effects', recipe: 'gunRevolver', volume: 0.85, pitchVar: 0.05, ref: 6, maxDistance: 140, maxConcurrent: 6 },
  'gun.rifle': { bus: 'effects', recipe: 'gunRifle', volume: 0.95, pitchVar: 0.04, ref: 7, maxDistance: 160, maxConcurrent: 4 },
  'gun.shotgun': { bus: 'effects', recipe: 'gunShotgun', volume: 1, pitchVar: 0.04, ref: 6, maxDistance: 140, maxConcurrent: 4 },
  'gun.derringer': { bus: 'effects', recipe: 'gunDerringer', volume: 0.7, pitchVar: 0.06, ref: 5, maxDistance: 110, maxConcurrent: 4 },
  'gun.echo': { bus: 'effects', recipe: 'gunEcho', volume: 0.7, ref: 10, maxDistance: 170, maxConcurrent: 4 },
  'gun.dry': { bus: 'effects', recipe: 'gunDry', volume: 0.6, ref: 2, maxDistance: 15, cooldown: 0.12 },
  'gun.draw': { bus: 'effects', recipe: 'gunDraw', volume: 0.5, ref: 2, maxDistance: 14, maxConcurrent: 3 },
  'gun.holster': { bus: 'effects', recipe: 'gunHolster', volume: 0.5, ref: 2, maxDistance: 14, maxConcurrent: 3 },
  'reload.revolver': { bus: 'effects', recipe: 'reloadRevolver', volume: 0.6, ref: 2, maxDistance: 18, maxConcurrent: 3 },
  'reload.rifle': { bus: 'effects', recipe: 'reloadRifle', volume: 0.6, ref: 2, maxDistance: 18, maxConcurrent: 3 },
  'reload.shotgun': { bus: 'effects', recipe: 'reloadShotgun', volume: 0.6, ref: 2, maxDistance: 18, maxConcurrent: 3 },
  'reload.derringer': { bus: 'effects', recipe: 'reloadDerringer', volume: 0.6, ref: 2, maxDistance: 18, maxConcurrent: 3 },

  'impact.dirt': { bus: 'effects', recipe: 'impactDirt', volume: 0.55, ref: 3, maxDistance: 40, maxConcurrent: 5 },
  'impact.wood': { bus: 'effects', recipe: 'impactWood', volume: 0.6, ref: 3, maxDistance: 40, maxConcurrent: 5 },
  'impact.rock': { bus: 'effects', recipe: 'impactRock', volume: 0.55, ref: 3, maxDistance: 45, maxConcurrent: 5 },
  'impact.metal': { bus: 'effects', recipe: 'impactMetal', volume: 0.5, ref: 3, maxDistance: 45, maxConcurrent: 4 },
  'impact.cactus': { bus: 'effects', recipe: 'impactCactus', volume: 0.5, ref: 3, maxDistance: 35, maxConcurrent: 4 },
  'impact.flesh': { bus: 'effects', recipe: 'impactFlesh', volume: 0.7, ref: 3, maxDistance: 40, maxConcurrent: 4 },
  'impact.glass': { bus: 'effects', recipe: 'impactGlass', volume: 0.5, ref: 3, maxDistance: 40, maxConcurrent: 4 },

  'hurt.player': { bus: 'voices', recipe: 'hurtPlayer', volume: 0.8, pitchVar: 0.06, maxConcurrent: 1 },
  /** NPC talk: built from the line at play time (audio/murmur.ts); the recipe is only a stand-in. */
  'npc.murmur': { bus: 'voices', recipe: 'npcGrunt', volume: 0.7, pitchVar: 0, volVar: 0.05, ref: 3, maxDistance: 26, maxConcurrent: 4 },
  /** A merchant greeting you as their shop opens (UI bus: it plays on while the shop pauses the world). */
  'npc.murmur.shop': { bus: 'ui', recipe: 'npcGrunt', volume: 0.7, pitchVar: 0, volVar: 0.05, ref: 3, maxDistance: 26, maxConcurrent: 1 },
  'npc.grunt': { bus: 'voices', recipe: 'npcGrunt', volume: 0.75, pitchVar: 0.04, ref: 3, maxDistance: 35, maxConcurrent: 3 },
  'npc.death': { bus: 'voices', recipe: 'npcDeath', volume: 0.85, pitchVar: 0.03, ref: 4, maxDistance: 45, maxConcurrent: 3 },
  'crate.break': { bus: 'effects', recipe: 'crateBreak', volume: 0.85, ref: 4, maxDistance: 50, maxConcurrent: 3 },
  // Steps carry only a little way; hoofbeats further.
  'step.dirt': { bus: 'effects', recipe: 'stepDirt', volume: 0.45, pitchVar: 0.1, volVar: 0.15, ref: 2, maxDistance: 16, maxConcurrent: 3 },
  'step.wood': { bus: 'effects', recipe: 'stepWood', volume: 0.5, pitchVar: 0.08, volVar: 0.15, ref: 2, maxDistance: 18, maxConcurrent: 3 },
  'hoof.dirt': { bus: 'effects', recipe: 'hoofDirt', volume: 0.55, pitchVar: 0.08, volVar: 0.15, ref: 3, maxDistance: 32, maxConcurrent: 6 },
  'horse.snort': { bus: 'effects', recipe: 'horseSnort', volume: 0.6, pitchVar: 0.08, ref: 3, maxDistance: 25, maxConcurrent: 2 },
  'horse.whinny': { bus: 'effects', recipe: 'horseWhinny', volume: 0.55, pitchVar: 0.06, ref: 5, maxDistance: 50, maxConcurrent: 1 },
  'bullet.whizz': { bus: 'effects', recipe: 'bulletWhizz', volume: 0.7, pitchVar: 0.12, ref: 1.5, maxDistance: 6, maxConcurrent: 4 },
};
