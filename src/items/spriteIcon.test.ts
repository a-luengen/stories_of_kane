import { afterEach, describe, expect, it, vi } from 'vitest';
import gunSheet from '../../public/sprites/guns.png?inline';
import { GUN_SPRITES } from '../data/gunSprites';
import { ITEMS } from '../data/items';
import { weaponOf } from './ItemDef';
import { fitSprite, spriteInSheet, SpriteSheets } from './spriteIcon';

/** The sheets, as data URLs (Vite inlines them), by path under public/. */
const SHEETS: Record<string, string> = { 'sprites/guns.png': gunSheet };

/** Width and height from a PNG data URL's IHDR chunk. */
function pngSize(dataUrl: string): [number, number] {
  const bytes = atob(dataUrl.split(',')[1]);
  const u32 = (o: number) => ((bytes.charCodeAt(o) << 24) | (bytes.charCodeAt(o + 1) << 16) | (bytes.charCodeAt(o + 2) << 8) | bytes.charCodeAt(o + 3)) >>> 0;
  return [u32(16), u32(20)];
}

describe('gun sprites', () => {
  it('every sprite is for a gun, and lies inside its sheet (which exists under public/)', () => {
    for (const [id, s] of Object.entries(GUN_SPRITES)) {
      expect(weaponOf(ITEMS[id]), id).toBeTruthy();
      expect(SHEETS[s.sheetPath], `${id}: no such sheet ${s.sheetPath}`).toBeDefined();
      const [w, h] = pngSize(SHEETS[s.sheetPath]);
      expect(spriteInSheet(s, w, h), id).toBe(true);
    }
  });

  it('some guns have sprites, others keep their rendered icon', () => {
    const guns = Object.values(ITEMS).filter((d) => weaponOf(d));
    expect(guns.some((g) => GUN_SPRITES[g.id])).toBe(true);
    expect(guns.some((g) => !GUN_SPRITES[g.id])).toBe(true);
  });

  it('a sprite outside its sheet is caught', () => {
    expect(spriteInSheet({ sheetPath: '', x: 40, y: 0, width: 48, height: 12 }, 80, 16)).toBe(false);
    expect(spriteInSheet({ sheetPath: '', x: 0, y: 0, width: 0, height: 12 }, 80, 16)).toBe(false);
  });
});

describe('fitting a sprite into an icon', () => {
  it('keeps the aspect, centres it, and only enlarges by whole multiples', () => {
    // Revolver (32×16) in a 2×2 slot: weapon bar (8 px/cell), inventory (16), bigger still (32).
    expect(fitSprite(32, 16, 16, 16)).toEqual({ x: 0, y: 4, w: 16, h: 8 });
    expect(fitSprite(32, 16, 32, 32)).toEqual({ x: 0, y: 8, w: 32, h: 16 });
    expect(fitSprite(32, 16, 64, 64)).toEqual({ x: 0, y: 16, w: 64, h: 32 });
    // Rifle (48×12) in a 4×1 slot: shrunk to fit at 8 px/cell; at 16 px/cell not stretched to 1.33×.
    expect(fitSprite(48, 12, 32, 8)).toEqual({ x: 0, y: 0, w: 32, h: 8 });
    expect(fitSprite(48, 12, 64, 16)).toEqual({ x: 8, y: 2, w: 48, h: 12 });
  });
});

describe('sprite sheets', () => {
  const made: string[] = [];
  /** A stand-in for the browser's Image: "loads" anything not called missing. */
  class FakeImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    set src(v: string) {
      made.push(v);
      setTimeout(() => (v.includes('missing') ? this.onerror?.() : this.onload?.()));
    }
  }
  afterEach(() => {
    vi.unstubAllGlobals();
    made.length = 0;
  });

  it('loads each sheet once (under the base URL), shared by every sprite on it', async () => {
    vi.stubGlobal('Image', FakeImage);
    const sheets = new SpriteSheets('/base/');
    const [a, b] = await Promise.all([sheets.load('sprites/guns.png'), sheets.load('sprites/guns.png')]);
    expect(a).not.toBeNull();
    expect(a).toBe(b);
    expect(made).toEqual(['/base/sprites/guns.png']);
    expect(sheets.ready.get('sprites/guns.png')).toBe(a);
  });

  it('a sheet that fails to load gives null and one warning (icons stay rendered)', async () => {
    vi.stubGlobal('Image', FakeImage);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const sheets = new SpriteSheets('/');
    expect(await sheets.load('sprites/missing.png')).toBeNull();
    expect(await sheets.load('sprites/missing.png')).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(sheets.ready.has('sprites/missing.png')).toBe(false);
    warn.mockRestore();
  });
});
