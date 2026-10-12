import * as THREE from 'three';
import { CONFIG } from '../config';
import { disposeObject } from '../core/dispose';
import type { AppearanceConfig, WeaponDef } from '../data/types';
import { CharacterRig } from '../render/CharacterRig';
import { pixelsToOutlinedCanvas } from '../render/pixelCanvas';

/** Live, slowly turning render of a character rig for the inventory (drag to turn it). */
export class CharacterPreview {
  readonly canvas = document.createElement('canvas');
  yaw = 0.5;
  /** True while the player drags the preview (pauses the auto-turn). */
  dragging = false;
  private scene = new THREE.Scene();
  private camera: THREE.OrthographicCamera;
  private rig = new CharacterRig();
  private target: THREE.WebGLRenderTarget;
  private pixels: Uint8Array;
  private version = -1;

  constructor(
    private renderer: THREE.WebGLRenderer,
    readonly w: number,
    readonly h: number,
  ) {
    const r = CONFIG.render;
    this.scene.add(new THREE.HemisphereLight(r.skyLightColor, r.groundLightColor, r.hemiIntensity * 1.1));
    const sun = new THREE.DirectionalLight(r.sunColor, r.sunIntensity);
    sun.position.set(2, 4, 5);
    this.scene.add(sun, this.rig.root);
    // Frame a standing character (≈2.3 units tall with hat) in the canvas.
    const halfH = 1.25;
    const halfW = halfH * (w / h);
    this.camera = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.1, 30);
    this.camera.position.set(0, 1.6, 10);
    this.camera.lookAt(0, 1.12, 0);
    this.target = new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    this.target.texture.colorSpace = THREE.SRGBColorSpace;
    this.pixels = new Uint8Array(w * h * 4);
    // Relaxed pose: arms a little away from the body so sleeves read.
    this.rig.armL.rotation.z = -0.18;
    this.rig.armR.rotation.z = 0.18;
  }

  dispose(): void {
    this.target.dispose();
    disposeObject(this.scene);
  }

  /** Rebuild when the equipment changed (`version` is the equipment version). */
  sync(appearance: AppearanceConfig, weapons: readonly (WeaponDef | null)[], version: number, offHands: readonly (WeaponDef | null)[] = []): void {
    if (version === this.version) return;
    this.version = version;
    this.rig.applyAppearance(appearance);
    this.rig.setWeapons(weapons, offHands);
    this.rig.placeWeapons(null, false);
  }

  render(dt: number): void {
    if (!this.dragging) this.yaw += dt * 0.6;
    this.rig.root.rotation.y = this.yaw;
    const r = this.renderer;
    const prevTarget = r.getRenderTarget();
    const prevClear = r.getClearColor(new THREE.Color());
    const prevAlpha = r.getClearAlpha();
    r.setRenderTarget(this.target);
    r.setClearColor(0x000000, 0);
    r.clear();
    r.render(this.scene, this.camera);
    r.readRenderTargetPixels(this.target, 0, 0, this.w, this.h, this.pixels);
    r.setRenderTarget(prevTarget);
    r.setClearColor(prevClear, prevAlpha);
    pixelsToOutlinedCanvas(this.pixels, this.w, this.h, this.canvas);
  }
}
