/** Where a gun's pixel-art icon sits in a sprite sheet (pixels, top-left origin). */
export interface GunSpriteDefinition {
  /** Sheet image, relative to `public/` (it's served from the site root, see BASE_URL). */
  sheetPath: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Hand-drawn icons for guns, by item id: the inventory, shop and weapon bar show the sprite
 * (scaled to the slot, nearest-neighbour) instead of rendering the gun's 3D mesh. Guns not listed
 * here — or whose sheet can't be loaded — keep the rendered icon.
 *
 * Draw sprites side-on with the muzzle pointing right and the grip down, on a transparent
 * background; whole-number multiples of the slot size stay crisp (a 2×2 pistol slot is 16×16 px
 * in the weapon bar and 32×32 px in the inventory).
 */
export const GUN_SPRITES: Record<string, GunSpriteDefinition> = {
  revolver: { sheetPath: 'sprites/guns.png', x: 0, y: 0, width: 32, height: 16 },
  rifle: { sheetPath: 'sprites/guns.png', x: 32, y: 0, width: 48, height: 12 },
  nickel_revolver: { sheetPath: 'sprites/guns.png', x: 0, y: 16, width: 32, height: 16 },
  magnum: { sheetPath: 'sprites/guns.png', x: 32, y: 16, width: 32, height: 16 },
  sawed_off: { sheetPath: 'sprites/guns.png', x: 64, y: 16, width: 32, height: 16 },
};
