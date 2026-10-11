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
  /** Ammo item type it loads (matches ItemDef.ammoType). */
  ammoType: string;
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

/** Clothing slots on a character. A `fullBody` item (dress) is worn in `legs` and keeps `top` empty. */
export type EquipSlot = 'hat' | 'top' | 'legs' | 'outerwear' | 'neck' | 'boots' | 'belt' | 'holster';
export type ClothingSlot = EquipSlot | 'fullBody';
export const EQUIP_SLOTS: readonly EquipSlot[] = ['hat', 'neck', 'top', 'outerwear', 'legs', 'belt', 'holster', 'boots'];

/** How a clothing piece is built (see render/clothingBuilders). Colours make variants data-only. */
export type ClothingKind =
  | 'cowboyHat'
  | 'bonnet'
  | 'shirt'
  | 'vest'
  | 'duster'
  | 'poncho'
  | 'trousers'
  | 'chaps'
  | 'dress'
  | 'bandana'
  | 'boots'
  | 'belt'
  | 'holster';

export interface ClothingDef {
  id: string;
  name: string;
  description: string;
  slot: ClothingSlot;
  kind: ClothingKind;
  color: number;
  /** Secondary colour (hat band, trim, buckle, trousers under chaps...). */
  trim?: number;
}

/** A character's look: body traits plus one clothing id per slot. */
export interface AppearanceConfig {
  body: 'male' | 'female';
  skin: number;
  hair: number;
  hairStyle: 'short' | 'long' | 'bun';
  /** Stubble / beard colour (omit for clean-shaven). */
  beard?: number;
  clothing: Partial<Record<EquipSlot, string>>;
}

// ------------------------------------------------------------------------------------ items

export type ItemCategory = 'weapon' | 'ammo' | 'clothing';

export interface ItemDef {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  /** Footprint in grid cells (unrotated). */
  size: { w: number; h: number };
  stackable: boolean;
  maxStack: number;
  /** Icon camera tweaks; the icon itself is rendered from the item's procedural mesh. */
  icon?: { yaw?: number; pitch?: number; tint?: number };
  /** Links into the owning system. */
  weaponDefId?: string;
  ammoType?: string;
  clothingId?: string;
  /** Quantity in one "box" when spawned (ammo). */
  boxQuantity?: number;
}

/** Inventory entry in NPC data: an item id and optional quantity. */
export interface ItemGrant {
  item: string;
  quantity?: number;
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
  appearance: AppearanceConfig;
  /** A weapon id from WEAPONS, an inline weapon definition, or null for unarmed. A holster weapon is carried in hand without a holster. */
  weapon: string | WeaponDef | null;
  /** Grid contents. If omitted: 1-2 boxes of ammo for the weapon. */
  inventory?: ItemGrant[];
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
