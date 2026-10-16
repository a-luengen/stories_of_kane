import { ClothingRegistry } from '../data/clothing';
import { ITEMS } from '../data/items';
import type { ClothingDef, ItemDef, WeaponDef } from '../data/types';
import { WEAPONS } from '../data/weapons';

/** Item definitions created at runtime for inline weapons in NPC data. */
const extra: Record<string, ItemDef> = {};
/** Inline weapon definitions referenced by such items. */
const extraWeapons: Record<string, WeaponDef> = {};

export function itemDef(id: string): ItemDef {
  const d = ITEMS[id] ?? extra[id];
  if (!d) throw new Error(`Unknown item "${id}"`);
  return d;
}

/** Is there an item with this id (the game's own or one registered at runtime)? */
export function hasItemDef(id: string): boolean {
  return id in ITEMS || id in extra;
}

/** Add an item definition at runtime (quest packs). Registering the same id again replaces it. */
export function registerItem(def: ItemDef): void {
  if (isBuiltinItem(def.id)) throw new Error(`Item "${def.id}" already exists`);
  extra[def.id] = def;
}

const isBuiltinItem = (id: string) => id in ITEMS;

export function weaponOf(def: ItemDef): WeaponDef | null {
  if (!def.weaponDefId) return null;
  return (WEAPONS as Record<string, WeaponDef>)[def.weaponDefId] ?? extraWeapons[def.weaponDefId] ?? null;
}

export function clothingOf(def: ItemDef): ClothingDef | null {
  return def.clothingId ? (ClothingRegistry[def.clothingId] ?? null) : null;
}

/** The item for a weapon definition (registering one for inline weapons from NPC data). */
export function itemForWeapon(w: WeaponDef): ItemDef {
  const existing = Object.values(ITEMS).find((d) => d.weaponDefId === w.id) ?? extra[`weapon:${w.id}`];
  if (existing) return existing;
  const pistol = w.look.kind === 'pistol';
  const d: ItemDef = {
    id: `weapon:${w.id}`,
    name: w.name,
    description: pistol ? 'A sidearm.' : 'A long gun.',
    category: 'weapon',
    size: pistol ? { w: 2, h: 2 } : { w: 4, h: w.look.barrels > 1 ? 2 : 1 },
    stackable: false,
    maxStack: 1,
    weaponDefId: w.id,
  };
  extra[d.id] = d;
  extraWeapons[w.id] = w;
  return d;
}

/** The ammo item that holds rounds of this type. */
export function ammoItemFor(ammoType: string): ItemDef | null {
  return Object.values(ITEMS).find((d) => d.category === 'ammo' && d.ammoType === ammoType) ?? null;
}
