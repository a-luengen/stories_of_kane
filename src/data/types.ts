/** Shapes of the game's data files (weapons, NPCs). Everything here is plain data. */

export type Vec2 = [number, number];

// ------------------------------------------------------------------------------------ weapons

export interface WeaponLook {
  kind: 'pistol' | 'longgun';
  /** Barrel length in world units (measured from the grip / receiver). */
  barrelLength: number;
  barrels: 1 | 2;
  metal: number;
  wood: number;
}

export interface WeaponDef {
  id: string;
  name: string;
  /** Damage per bullet (per pellet for shotguns) before falloff. */
  damage: number;
  /** Seconds between shots. */
  fireInterval: number;
  magazine: number;
  reloadTime: number;
  /** Base spread angle (radians); scatter radius at distance d is d·tan(spread)·(1 + d·spreadGrowth). */
  spread: number;
  /** How fast inaccuracy compounds with distance (per world unit). 0 = a plain cone. */
  spreadGrowth: number;
  /** Maximum bullet travel distance. */
  range: number;
  bulletSpeed: number;
  /** Projectiles per shot: a fixed count or a [min, max] range. */
  pellets: number | [number, number];
  /** Damage is full up to this distance, then falls off linearly to `falloffMin`× at `range`. */
  falloffStart: number;
  falloffMin: number;
  /** Where the weapon sits when not drawn. A 'holster' weapon is held in hand if the owner has no holster. */
  carry: 'holster' | 'back';
  /** Seconds to draw (or put away). */
  drawTime: number;
  /** How NPCs fight with it. */
  ai: {
    /** Distance band the NPC tries to keep to its target. */
    preferredRange: [number, number];
    /** Random pause added on top of fireInterval between NPC shots (s). */
    extraDelay: [number, number];
    /** Aim-before-first-shot delay after drawing or reloading (s). */
    telegraph: number;
  };
  look: WeaponLook;
}

// ------------------------------------------------------------------------------------ NPCs

export interface Outfit {
  body: 'male' | 'female';
  skin: number;
  hair: number;
  hairStyle: 'short' | 'long' | 'bun';
  /** Stubble / beard colour (omit for clean-shaven). */
  beard?: number;
  shirt: number;
  trousers: number;
  boots: number;
  /** Worn over the shirt. */
  over?: { kind: 'vest' | 'duster'; color: number };
  /** A long dress replaces the trousers visually. */
  dress?: { color: number; trim?: number };
  /** Leather chaps over the trousers. */
  chaps?: number;
  /** Neckerchief colour. */
  bandana?: number;
  hat?: { kind: 'cowboy' | 'bonnet'; color: number; band?: number };
}

export type Routine =
  /** Stand at a spot, leaning back against whatever is behind. `facing` is a yaw in radians (0 = +Z). */
  | { kind: 'lean'; at: Vec2; facing: number }
  /** Stand at a spot. */
  | { kind: 'idle'; at: Vec2; facing: number }
  /** Walk between random points (each jittered), pausing in between. */
  | { kind: 'wander'; points: Vec2[]; jitter?: number; pause?: [number, number] }
  /** Walk the points in order, looping. */
  | { kind: 'patrol'; points: Vec2[]; pause?: number };

export interface NpcLines {
  greet: string[];
  warn: string[];
  hostile: string[];
  flee: string[];
  calm: string[];
}

export interface NpcDef {
  id: string;
  /** Omit for a random name. */
  name?: string;
  attitude: 'friendly' | 'neutral';
  /** Also turns hostile when it sees the player shoot another NPC nearby. */
  defendsOthers: boolean;
  outfit: Outfit;
  /** A weapon id from WEAPONS, an inline weapon definition, or null for unarmed. */
  weapon: string | WeaponDef | null;
  /** Wears a gun belt with a holster (a holster weapon without one is carried in hand). */
  holster: boolean;
  spawn: Vec2;
  routine: Routine;
  hp?: number;
  /** Multiplier on the weapon's spread in this NPC's hands (1 = as steady as the player standing still). */
  inaccuracy?: number;
  /** Seconds the NPC's aim lags behind a moving target. */
  reactionTime?: number;
  /** Overrides the default lines for the NPC's attitude. */
  lines?: Partial<NpcLines>;
}
