import * as THREE from 'three';
import { CONFIG } from '../config';
import { GUN_SPRITES, type GunSpriteDefinition } from '../data/gunSprites';
import { ITEMS } from '../data/items';
import { pixelsToOutlinedCanvas } from '../render/pixelCanvas';
import { itemDef } from './ItemDef';
import { buildItemMesh } from './itemMeshes';
import { drawSprite, spriteInSheet, SpriteSheets } from './spriteIcon';
import { FLAT_SHAPES } from './questItemMeshes';

/**
 * Renders each item's procedural mesh to a small offscreen canvas in the game's pixel style
 * (toon shading at low resolution, nearest sampling, 1px dark outline). Cached per size.
 *
 * Guns with a hand-drawn sprite (data/gunSprites.ts) use it instead, scaled to the icon. Until its
 * sheet has loaded — or if it can't be — the rendered icon stands in; the sprite is then drawn into
 * that same canvas, so whoever holds it sees the change.
 */
export class IconRenderer {
  private cache = new Map<string, HTMLCanvasElement>();
  private sheets = new SpriteSheets();
  /** Sprites already found to lie outside their sheet (warned about once). */
  private badSprites = new Set<string>();
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 50);

  constructor(private renderer: THREE.WebGLRenderer) {
    const r = CONFIG.render;
    this.scene.add(new THREE.HemisphereLight(r.skyLightColor, r.groundLightColor, r.hemiIntensity * 1.1));
    const sun = new THREE.DirectionalLight(r.sunColor, r.sunIntensity);
    sun.position.set(1.5, 3, 4);
    this.scene.add(sun);
  }

  /** Pre-render every item at the given cell sizes (call once at startup). */
  warm(pxPerCell: number[]): void {
    for (const id of Object.keys(ITEMS)) for (const px of pxPerCell) this.get(id, px);
  }

  /** Icon for an item, `pxPerCell` pixels per grid cell (unrotated footprint). */
  get(defId: string, pxPerCell: number): HTMLCanvasElement {
    const key = `${defId}@${pxPerCell}`;
    let c = this.cache.get(key);
    if (!c) {
      c = this.make(defId, pxPerCell);
      this.cache.set(key, c);
      const url = itemDef(defId).quest?.iconUrl;
      if (url) this.overlayPng(c, url);
    }
    return c;
  }

  /** The sprite if its sheet is in; otherwise the rendered icon (redrawn as the sprite once the sheet arrives). */
  private make(defId: string, px: number): HTMLCanvasElement {
    const sprite = GUN_SPRITES[defId];
    if (!sprite) return this.render(defId, px);
    const sheet = this.sheets.ready.get(sprite.sheetPath);
    if (sheet && this.fits(defId, sprite, sheet)) {
      const def = itemDef(defId);
      const c = document.createElement('canvas');
      c.width = def.size.w * px;
      c.height = def.size.h * px;
      drawSprite(c, sheet, sprite);
      return c;
    }
    const c = this.render(defId, px);
    void this.sheets.load(sprite.sheetPath).then((img) => {
      if (img && this.fits(defId, sprite, img)) drawSprite(c, img, sprite);
    });
    return c;
  }

  /** The sprite's rectangle lies inside its sheet (warns once if not: the rendered icon stays). */
  private fits(defId: string, s: GunSpriteDefinition, sheet: HTMLImageElement): boolean {
    if (spriteInSheet(s, sheet.naturalWidth, sheet.naturalHeight)) return true;
    if (!this.badSprites.has(defId)) {
      this.badSprites.add(defId);
      console.warn(`[icons] sprite for "${defId}" lies outside "${s.sheetPath}" (${sheet.naturalWidth}x${sheet.naturalHeight}): using the rendered icon`);
    }
    return false;
  }

  /**
   * A pack's PNG icon replaces the drawn one once it has loaded (drawn into the same canvas, so
   * whoever holds it shows the new icon). If it can't be loaded, the drawn one stays.
   */
  private overlayPng(canvas: HTMLCanvasElement, url: string): void {
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Fit, keeping the aspect, centred.
      const s = Math.min(canvas.width / img.width, canvas.height / img.height);
      const w = Math.round(img.width * s);
      const h = Math.round(img.height * s);
      ctx.drawImage(img, Math.floor((canvas.width - w) / 2), Math.floor((canvas.height - h) / 2), w, h);
    };
    img.onerror = () => console.warn(`[icons] couldn't load ${url}`);
    img.src = url;
  }

  private render(defId: string, px: number): HTMLCanvasElement {
    const def = itemDef(defId);
    const W = def.size.w * px;
    const H = def.size.h * px;
    const obj = buildItemMesh(def);
    this.scene.add(obj);

    // Look from front-above-right (nearly side-on for weapons) and fit the ortho frustum to the item.
    // Map scraps lie flat: look down on them.
    const flat = def.reveals || (def.quest && FLAT_SHAPES.has(def.quest.shape));
    const dir = def.category === 'weapon' ? new THREE.Vector3(0.1, 0.35, 1) : flat ? new THREE.Vector3(0.15, 1.6, 0.6) : new THREE.Vector3(0.45, 0.55, 1);
    if (def.icon?.yaw) dir.applyAxisAngle(THREE.Object3D.DEFAULT_UP, def.icon.yaw);
    obj.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    const cam = this.camera;
    cam.position.copy(center).addScaledVector(dir.normalize(), 10);
    cam.up.set(0, 1, 0);
    cam.lookAt(center);
    cam.updateMatrixWorld(true);
    const inv = cam.matrixWorldInverse;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (let i = 0; i < 8; i++) {
      const p = new THREE.Vector3(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).applyMatrix4(inv);
      x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x);
      y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
    }
    // Keep the aspect of the target, leaving a pixel for the outline.
    const margin = 1 + 2.5 / Math.min(W, H);
    let hw = ((x1 - x0) / 2) * margin;
    let hh = ((y1 - y0) / 2) * margin;
    if (hw / hh > W / H) hh = hw * (H / W);
    else hw = hh * (W / H);
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    Object.assign(cam, { left: cx - hw, right: cx + hw, top: cy + hh, bottom: cy - hh });
    cam.updateProjectionMatrix();

    const target = new THREE.WebGLRenderTarget(W, H, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    target.texture.colorSpace = THREE.SRGBColorSpace;
    const r = this.renderer;
    const prevTarget = r.getRenderTarget();
    const prevClear = r.getClearColor(new THREE.Color());
    const prevAlpha = r.getClearAlpha();
    const prevShadows = r.shadowMap.enabled;
    r.shadowMap.enabled = false;
    r.setRenderTarget(target);
    r.setClearColor(0x000000, 0);
    r.clear();
    r.render(this.scene, cam);
    const pixels = new Uint8Array(W * H * 4);
    r.readRenderTargetPixels(target, 0, 0, W, H, pixels);
    r.setRenderTarget(prevTarget);
    r.setClearColor(prevClear, prevAlpha);
    r.shadowMap.enabled = prevShadows;
    target.dispose();
    this.scene.remove(obj);

    const canvas = document.createElement('canvas');
    pixelsToOutlinedCanvas(pixels, W, H, canvas);
    return canvas;
  }
}
