import * as THREE from 'three';
import { AudioEngine } from '../audio/AudioEngine';
import { setUiSoundSink } from '../audio/uiSound';
import { CameraRig } from '../CameraRig';
import { CONFIG } from '../config';
import { Input } from '../Input';
import { IconRenderer } from '../items/IconRenderer';
import { PixelPass } from '../PixelPass';
import { DebugOverlay } from '../ui/DebugOverlay';
import { Hud } from '../ui/Hud';
import { SoundDebug } from '../ui/SoundDebug';
import type { UiPointer } from '../ui/InventoryUI';

/**
 * Everything that lives for the whole app, across menus and game modes: renderer, input, the
 * pixelation pass, camera rig, HUD canvas, icon cache, resize handling and the frame loop.
 * Game sessions borrow these and dispose only their own scene.
 */
export class Engine {
  readonly renderer: THREE.WebGLRenderer;
  readonly input: Input;
  readonly pixelPass = new PixelPass();
  readonly rig = new CameraRig();
  readonly hud: Hud;
  readonly debug: DebugOverlay;
  readonly icons: IconRenderer;
  /** Sound for the whole app (starts on the first click / key press). */
  readonly audio = new AudioEngine();
  /** 9: playing voices and where they come from. */
  readonly soundDebug: SoundDebug;
  pixelate = CONFIG.render.pixelate;
  lowW = CONFIG.render.baseWidth;
  lowH = CONFIG.render.baseHeight;
  scale = 1;
  /** Low-res pointer with press / release edges (refreshed by pointer()). */
  readonly uiPointer: UiPointer = { x: 0, y: 0, pressed: false, released: false, moved: false };
  private lastTime = 0;

  constructor(container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(1);
    this.renderer.shadowMap.enabled = true;
    // Hard shadow compare on purpose: three's PCF jitters its taps with screen-space noise, which
    // makes shadow edges crawl when the snapped camera moves. A shadow texel (~0.025u) is far below
    // one low-res pixel (~0.09u), so edges are still clean; the toon ramp + palette do the softening.
    this.renderer.shadowMap.type = THREE.BasicShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.info.autoReset = false; // count draw calls across all passes of a frame
    container.appendChild(this.renderer.domElement);
    this.input = new Input(container);
    this.hud = new Hud(container);
    this.debug = new DebugOverlay(container);
    this.soundDebug = new SoundDebug(container);
    setUiSoundSink((id) => this.audio.play(id));
    this.icons = new IconRenderer(this.renderer);
    this.icons.warm([8, 16]);
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  /** Low-res size = window / largest integer factor that still fits the 320×180 base. */
  resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const devW = Math.max(1, Math.floor(window.innerWidth * dpr));
    const devH = Math.max(1, Math.floor(window.innerHeight * dpr));
    const r = CONFIG.render;
    this.scale = Math.max(1, Math.floor(Math.min(devW / r.baseWidth, devH / r.baseHeight)));
    this.lowW = Math.ceil(devW / this.scale);
    this.lowH = Math.ceil(devH / this.scale);
    const bufW = this.lowW * this.scale;
    const bufH = this.lowH * this.scale;
    this.renderer.setSize(bufW, bufH, false);
    const cssW = bufW / dpr;
    const cssH = bufH / dpr;
    const left = `${Math.floor((window.innerWidth - cssW) / 2)}px`;
    const top = `${Math.floor((window.innerHeight - cssH) / 2)}px`;
    Object.assign(this.renderer.domElement.style, { width: `${cssW}px`, height: `${cssH}px`, left, top });
    this.hud.setSize(this.lowW, this.lowH, cssW, cssH, left, top);
    this.debug.setSize(bufW, bufH, cssW, cssH, left, top);
    this.soundDebug.setSize(bufW, bufH, cssW, cssH, left, top);
    this.rig.setViewport(this.lowW, this.lowH);
    this.pixelPass.setSize(this.lowW, this.lowH, this.scale);
  }

  /** Start the loop; `frame` gets the (clamped) frame time in seconds. */
  start(frame: (dt: number) => void): void {
    this.lastTime = performance.now();
    this.renderer.setAnimationLoop((now) => {
      const dt = Math.min(0.1, (now - this.lastTime) / 1000);
      this.lastTime = now;
      this.handleToggles();
      frame(dt);
      this.audio.update();
      this.soundDebug.draw(this.rig.view, this.audio);
    });
  }

  /** Debug / look toggles that work everywhere. */
  private handleToggles(): void {
    const i = this.input;
    if (i.consume('KeyP')) this.pixelate = !this.pixelate;
    if (i.consume('KeyO')) this.pixelPass.quantize = !this.pixelPass.quantize;
    if (i.consume('KeyL')) this.pixelPass.outlines = !this.pixelPass.outlines;
    if (i.consume('Digit8')) this.debug.visible = !this.debug.visible;
    if (i.consume('Digit9')) this.soundDebug.visible = !this.soundDebug.visible;
  }

  /** Update and return the low-res pointer for menus (consumes mouse press / release edges). */
  pointer(): UiPointer {
    const i = this.input;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = Math.floor(((i.mouseX - rect.left) / rect.width) * this.lowW);
    const y = Math.floor(((i.mouseY - rect.top) / rect.height) * this.lowH);
    this.uiPointer.moved = x !== this.uiPointer.x || y !== this.uiPointer.y;
    this.uiPointer.x = x;
    this.uiPointer.y = y;
    this.uiPointer.pressed = i.consume('Mouse0');
    this.uiPointer.released = i.consume('Mouse0Up');
    this.uiPointer.secondary = i.consume('Mouse2');
    return this.uiPointer;
  }

  /** Render a scene through the pixel pass (or straight, with pixelation off). */
  renderScene(scene: THREE.Scene): void {
    if (this.pixelate) {
      this.pixelPass.render(this.renderer, scene, this.rig.camera, this.rig.subpixel);
    } else {
      this.renderer.shadowMap.needsUpdate = true;
      this.renderer.setRenderTarget(null);
      this.renderer.render(scene, this.rig.view);
    }
  }
}
