import * as THREE from 'three';
import { CONFIG } from '../config';
import { disposeObject } from '../core/dispose';
import type { Engine } from '../core/Engine';
import type { ModeKind } from '../modes/GameMode';
import { readBestWave } from '../modes/records';
import { buildMenuDesert } from '../world/maps/menuDesert';
import type { Tumbleweed } from '../world/Tumbleweed';
import { Dialog, dim, MenuList, readMenuKeys } from './menuWidgets';
import { drawText, drawTextScaled, textWidth, textWidthScaled } from './PixelFont';
import { UI } from './theme';
import { drawCursor } from './widgets';

/** Title screen: live desert backdrop, mode buttons, "coming soon" hint for Story. */
export class MainMenu {
  private scene = new THREE.Scene();
  private tumbleweeds: Tumbleweed[];
  /** The desert wind behind the title (gusts as tumbleweeds roll by). */
  private list: MenuList;
  private dialog: Dialog | null = null;
  private time = 0;
  private focus = new THREE.Vector3();

  constructor(
    private engine: Engine,
    start: (mode: ModeKind) => void,
  ) {
    const r = CONFIG.render;
    this.scene.background = new THREE.Color(r.skyColor);
    this.scene.add(new THREE.HemisphereLight(r.skyLightColor, r.groundLightColor, r.hemiIntensity));
    const sun = new THREE.DirectionalLight(r.sunColor, r.sunIntensity);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 200 });
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
    sun.position.set(...(r.sunDirection.map((v) => v * 80) as [number, number, number]));
    this.scene.add(sun, sun.target);
    const desert = buildMenuDesert();
    this.tumbleweeds = desert.tumbleweeds;
    this.scene.add(desert.group);
    engine.pixelPass.unoutlined.length = 0;
    engine.pixelPass.normalPassExclude.length = 0;

    const best = readBestWave();
    this.list = new MenuList([
      { label: 'SANDBOX', description: 'Explore the frontier town freely.', action: () => start('sandbox') },
      { label: 'WAVE', sub: best > 0 ? `BEST: WAVE ${best}` : undefined, description: 'Survive endless waves of outlaws.', action: () => start('wave') },
      {
        label: 'STORY',
        dim: true,
        description: 'Coming soon.',
        action: () => {
          this.dialog = new Dialog('STORY', "Story mode isn't available yet. Check back in a future update!", [{ label: 'OK', action: () => (this.dialog = null) }]);
        },
      },
    ], 110, 18, 5);
    engine.rig.snapTo(this.focus);
    engine.input.clearPressed();
  }

  frame(dt: number): void {
    const e = this.engine;
    this.time += dt;
    // Slow pan back and forth across the desert.
    this.focus.set(Math.sin(this.time * 0.05) * 14, 0, Math.cos(this.time * 0.037) * 8 - 2);
    e.rig.update(dt, this.focus, e.pixelate);
    for (const t of this.tumbleweeds) t.update(dt);
    e.renderer.shadowMap.needsUpdate = true;
    e.renderScene(this.scene);

    const W = e.lowW;
    const H = e.lowH;
    const ctx = e.hud.clear();
    dim(ctx, W, H, 0.22);
    const ptr = e.pointer();
    const keys = readMenuKeys(e.input);

    // Title.
    const scale = W >= 420 ? 4 : 3;
    const title = CONFIG.game.title;
    const tw = textWidthScaled(title, scale);
    const ty = Math.round(H * 0.16);
    drawTextScaled(ctx, title, Math.round((W - tw) / 2), ty, UI.brassLight, scale, UI.ink);
    ctx.fillStyle = UI.rust;
    ctx.fillRect(Math.round((W - tw) / 2), ty + 6 * scale, tw, 1);

    const lx = Math.round((W - this.list.w) / 2);
    const ly = ty + 6 * scale + 14;
    if (this.dialog) this.dialog.update(W, H, ptr, keys);
    else this.list.update(lx, ly, ptr, keys);
    this.list.draw(ctx);
    const desc = this.list.focused.description ?? '';
    drawText(ctx, desc.toUpperCase(), Math.round((W - textWidth(desc)) / 2), ly + this.list.height + 8, UI.cream, UI.ink);
    const hint = 'W/S SELECT   ENTER START';
    drawText(ctx, hint, Math.round((W - textWidth(hint)) / 2), H - 10, UI.sand, UI.ink);
    if (this.dialog) {
      dim(ctx, W, H, 0.4);
      this.dialog.draw(ctx, W, H);
    }
    drawCursor(ctx, ptr.x, ptr.y);
    e.debug.draw(dt, e.rig.view, null, [`main menu  geometries ${e.renderer.info.memory.geometries}  textures ${e.renderer.info.memory.textures}`]);
  }

  dispose(): void {
    disposeObject(this.scene);
    this.scene.clear();
  }
}
