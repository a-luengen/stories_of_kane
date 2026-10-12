import { EQUIP_SLOTS, type AppearanceConfig, type EquipSlot, type WeaponDef } from '../data/types';
import type { GridContainer } from './GridContainer';
import { clothingOf, itemDef, weaponOf } from './ItemDef';
import type { ItemInstance } from './ItemInstance';

/** Slot keys: weapon slots 'w0'..'w2', their off-hand sub-slots 'o0'..'o2', and the clothing slots. */
export type SlotKey = `w${number}` | `o${number}` | EquipSlot;

/** Anything with named single-item slots that items can be dragged into and out of. */
export interface SlotHolder {
  get(key: SlotKey): ItemInstance | null;
  /** Could `item` go in this slot (ignoring whatever is there now)? */
  accepts(key: SlotKey, item: ItemInstance): boolean;
  /**
   * Put `item` in an empty slot. Items it pushes out of *other* slots (a dress clears the top)
   * go to `overflow`; returns false (and changes nothing) if they don't fit there.
   */
  put(key: SlotKey, item: ItemInstance, overflow: GridContainer | null): boolean;
  take(key: SlotKey): ItemInstance | null;
  /** Capture the slots; the returned function restores them. */
  snapshot(): () => void;
}

export const WEAPON_SLOTS = 3;
export const weaponKey = (i: number): SlotKey => `w${i}`;
export const offHandKey = (i: number): SlotKey => `o${i}`;
const weaponIndex = (key: SlotKey) => (/^w\d+$/.test(key) ? Number(key.slice(1)) : -1);
const offHandIndex = (key: SlotKey) => (/^o\d+$/.test(key) ? Number(key.slice(1)) : -1);

/** Can this item be one of two guns in a weapon slot? */
export function isDualWieldable(item: ItemInstance | null): boolean {
  return !!item && !!weaponOf(itemDef(item.defId))?.dualWieldable;
}

/**
 * Weapon slots (outside the grid) and worn clothing of one character. A weapon slot holding a
 * dual-wieldable gun has an off-hand sub-slot for a second one; both count as that one slot.
 * Taking the main gun out moves the off-hand gun up to be the main one (single wielding again).
 */
export class Equipment implements SlotHolder {
  readonly weapons: (ItemInstance | null)[] = Array(WEAPON_SLOTS).fill(null);
  /** Off-hand guns, one per weapon slot. */
  readonly offHands: (ItemInstance | null)[] = Array(WEAPON_SLOTS).fill(null);
  readonly clothing = Object.fromEntries(EQUIP_SLOTS.map((s) => [s, null])) as Record<EquipSlot, ItemInstance | null>;
  /** Bumped on every change, so views know when to rebuild. */
  version = 0;

  get(key: SlotKey): ItemInstance | null {
    const i = weaponIndex(key);
    if (i >= 0) return this.weapons[i] ?? null;
    const o = offHandIndex(key);
    if (o >= 0) return this.offHands[o] ?? null;
    return this.clothing[key as EquipSlot];
  }

  accepts(key: SlotKey, item: ItemInstance): boolean {
    const def = itemDef(item.defId);
    const i = weaponIndex(key);
    if (i >= 0) return i < WEAPON_SLOTS && def.category === 'weapon';
    const o = offHandIndex(key);
    if (o >= 0) return o < WEAPON_SLOTS && isDualWieldable(item) && isDualWieldable(this.weapons[o]);
    const c = clothingOf(def);
    if (!c) return false;
    return c.slot === key || (c.slot === 'fullBody' && key === 'legs');
  }

  /** The dress currently worn, if any. */
  private get dress(): ItemInstance | null {
    const legs = this.clothing.legs;
    return legs && clothingOf(itemDef(legs.defId))?.slot === 'fullBody' ? legs : null;
  }

  put(key: SlotKey, item: ItemInstance, overflow: GridContainer | null): boolean {
    if (!this.accepts(key, item)) return false;
    const w = weaponIndex(key);
    if (w >= 0 && this.weapons[w] && !this.offHands[w] && isDualWieldable(item) && isDualWieldable(this.weapons[w])) {
      // The off-hand gun moved up when this one was taken out: it goes back to the left hand.
      this.offHands[w] = this.weapons[w];
      this.weapons[w] = item;
      this.version++;
      return true;
    }
    if (this.get(key)) return false;
    const i = weaponIndex(key);
    if (i >= 0) {
      this.weapons[i] = item;
      this.version++;
      return true;
    }
    const o = offHandIndex(key);
    if (o >= 0) {
      this.offHands[o] = item;
      this.version++;
      return true;
    }
    // A dress needs the top slot free; a top displaces a worn dress.
    const displaced: [EquipSlot, ItemInstance][] = [];
    const isDress = clothingOf(itemDef(item.defId))?.slot === 'fullBody';
    if (isDress && this.clothing.top) displaced.push(['top', this.clothing.top]);
    if (key === 'top' && this.dress) displaced.push(['legs', this.dress]);
    if (displaced.length > 0) {
      if (!overflow) return false;
      const placed: ItemInstance[] = [];
      for (const [, d] of displaced) {
        if (!overflow.placeAnywhere(d)) {
          for (const p of placed) overflow.remove(p);
          return false;
        }
        placed.push(d);
      }
      for (const [slot] of displaced) this.clothing[slot] = null;
    }
    this.clothing[key as EquipSlot] = item;
    this.version++;
    return true;
  }

  take(key: SlotKey): ItemInstance | null {
    const item = this.get(key);
    if (!item) return null;
    const i = weaponIndex(key);
    const o = offHandIndex(key);
    if (i >= 0) {
      // Single wielding again: the off-hand gun becomes the main one.
      this.weapons[i] = this.offHands[i];
      this.offHands[i] = null;
    } else if (o >= 0) this.offHands[o] = null;
    else this.clothing[key as EquipSlot] = null;
    this.version++;
    return item;
  }

  snapshot(): () => void {
    const weapons = [...this.weapons];
    const offHands = [...this.offHands];
    const clothing = { ...this.clothing };
    const version = this.version;
    return () => {
      this.weapons.splice(0, this.weapons.length, ...weapons);
      this.offHands.splice(0, this.offHands.length, ...offHands);
      Object.assign(this.clothing, clothing);
      this.version = version; // the interim state was never observed (operations are synchronous)
    };
  }

  /** Is `item` worn or slotted here (and where)? */
  slotOf(item: ItemInstance): SlotKey | null {
    const i = this.weapons.indexOf(item);
    if (i >= 0) return weaponKey(i);
    const o = this.offHands.indexOf(item);
    if (o >= 0) return offHandKey(o);
    const s = EQUIP_SLOTS.find((k) => this.clothing[k] === item);
    return s ?? null;
  }

  weaponDefs(): (WeaponDef | null)[] {
    return this.weapons.map((w) => (w ? weaponOf(itemDef(w.defId)) : null));
  }

  offHandDefs(): (WeaponDef | null)[] {
    return this.offHands.map((w) => (w ? weaponOf(itemDef(w.defId)) : null));
  }

  /** Body traits from `base` with the clothing currently worn. */
  appearance(base: Omit<AppearanceConfig, 'clothing'>): AppearanceConfig {
    const clothing: AppearanceConfig['clothing'] = {};
    for (const s of EQUIP_SLOTS) {
      const it = this.clothing[s];
      if (it) clothing[s] = clothingOf(itemDef(it.defId))!.id;
    }
    return { ...base, clothing };
  }
}
