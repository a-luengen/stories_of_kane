import type { GunSpriteDefinition } from '../data/gunSprites';

/**
 * Where a `sw`×`sh` sprite goes in a `W`×`H` icon: as large as fits with its aspect kept, centred.
 * Enlarged only by whole multiples (every sprite pixel stays a square block); shrunk as needed.
 */
export function fitSprite(sw: number, sh: number, W: number, H: number): { x: number; y: number; w: number; h: number } {
  let scale = Math.min(W / sw, H / sh);
  if (scale >= 1) scale = Math.floor(scale);
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));
  return { x: Math.floor((W - w) / 2), y: Math.floor((H - h) / 2), w, h };
}

/** Does the sprite lie inside its sheet? */
export function spriteInSheet(s: GunSpriteDefinition, sheetW: number, sheetH: number): boolean {
  return s.x >= 0 && s.y >= 0 && s.width > 0 && s.height > 0 && s.x + s.width <= sheetW && s.y + s.height <= sheetH;
}

/** Draw the sprite into the whole canvas (cleared first), scaled to fit with hard pixel edges. */
export function drawSprite(canvas: HTMLCanvasElement, sheet: CanvasImageSource, s: GunSpriteDefinition): void {
  const ctx = canvas.getContext('2d')!;
  const r = fitSprite(s.width, s.height, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sheet, s.x, s.y, s.width, s.height, r.x, r.y, r.w, r.h);
}

/**
 * Sprite sheets, each fetched once (under the site's base URL) and shared by every icon on it.
 * A sheet that fails to load resolves to null, with one warning.
 */
export class SpriteSheets {
  private sheets = new Map<string, Promise<HTMLImageElement | null>>();
  /** Loaded sheets, for icons asked for after the sheet arrived (drawn at once, no 3D render). */
  readonly ready = new Map<string, HTMLImageElement>();

  constructor(private base: string = import.meta.env.BASE_URL) {}

  load(path: string): Promise<HTMLImageElement | null> {
    let p = this.sheets.get(path);
    if (!p) {
      p = new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          this.ready.set(path, img);
          resolve(img);
        };
        img.onerror = () => {
          console.warn(`[icons] sprite sheet "${path}" could not be loaded: using rendered icons instead`);
          resolve(null);
        };
        img.src = this.base + path;
      });
      this.sheets.set(path, p);
    }
    return p;
  }
}
