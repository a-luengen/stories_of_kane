import * as THREE from 'three';
import { CONFIG } from './config';
import { Input } from './Input';
import { CameraRig } from './CameraRig';
import { PixelPass } from './PixelPass';
import { Player, type PlayerInput } from './entities/Player';
import { Horse } from './entities/Horse';
import { ProjectileSystem, type Impact } from './entities/Projectiles';
import { Particles, type BurstKind } from './entities/Particles';
import { MuzzleFlash } from './entities/MuzzleFlash';
import { TargetSystem } from './entities/Targets';
import { buildWorld, type Occluder } from './world/World';
import { segmentVsBox, type CircleCollider, type CollisionWorld, type Surface } from './world/Colliders';
import { Hud } from './ui/Hud';
import { DebugOverlay } from './ui/DebugOverlay';
import { damp, dirToYaw } from './util/math';

const IMPACT_BURSTS: Record<Surface, BurstKind[]> = {
  dirt: ['dust'],
  wood: ['wood', 'spark'],
  rock: ['rock', 'spark', 'dust'],
  cactus: ['cactus'],
  metal: ['spark', 'spark'],
};

export class Game {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly rig = new CameraRig();
  readonly input: Input;
  readonly pixelPass = new PixelPass();

  readonly world: CollisionWorld;
  readonly player = new Player();
  readonly horse = new Horse();
  readonly projectiles = new ProjectileSystem();
  readonly particles = new Particles();
  readonly flash = new MuzzleFlash();
  readonly targets = new TargetSystem();
  private hud: Hud;
  private debug: DebugOverlay;

  private sun: THREE.DirectionalLight;
  private sunDir = new THREE.Vector3(...CONFIG.render.sunDirection).normalize();
  private pixelate = CONFIG.render.pixelate;

  private lowW = CONFIG.render.baseWidth;
  private lowH = CONFIG.render.baseHeight;
  private scale = 1;

  private accumulator = 0;
  private lastTime = 0;
  private elapsed = 0;
  private aim = new THREE.Vector3();
  private focusTarget = new THREE.Vector3();
  private horseCollider: CircleCollider;
  private footstepTimer = 0;
  private cursor: { x: number; y: number } | null = null;
  private occluders: Occluder[];

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

    // Lighting: warm low sun + sky/ground hemisphere fill.
    const r = CONFIG.render;
    this.scene.background = new THREE.Color(r.skyColor);
    this.scene.add(new THREE.HemisphereLight(r.skyLightColor, r.groundLightColor, r.hemiIntensity));
    this.sun = new THREE.DirectionalLight(r.sunColor, r.sunIntensity);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(r.shadowMapSize, r.shadowMapSize);
    const e = r.shadowExtent;
    Object.assign(this.sun.shadow.camera, { left: -e, right: e, top: e, bottom: -e, near: 1, far: 160 });
    this.sun.shadow.bias = -0.0005;
    this.sun.shadow.normalBias = 0.02;
    this.scene.add(this.sun, this.sun.target);

    // World + entities.
    const wd = buildWorld(this.targets);
    this.world = wd.collision;
    this.occluders = wd.occluders;
    this.scene.add(wd.group, this.targets.group, this.projectiles.group, this.particles.mesh, this.flash.group, this.flash.light);
    this.pixelPass.unoutlined.push(this.projectiles.group, this.flash.group, this.particles.mesh);
    this.player.setPosition(wd.playerSpawn);
    this.scene.add(this.player.model.root);
    this.horse.place(wd.horseSpawn, wd.horseYaw);
    this.scene.add(this.horse.model.root);
    this.horseCollider = { kind: 'circle', x: 0, z: 0, r: CONFIG.horse.radius, height: 2, surface: 'wood', blocksBullets: false };
    this.horse.model.onFootfall = () => {
      const h = this.horse.model.root;
      const back = new THREE.Vector3(-Math.sin(h.rotation.y) * 0.7, 0.05, -Math.cos(h.rotation.y) * 0.7);
      this.particles.burst('hoof', back.add(h.position));
    };

    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  /** Low-res size = window / largest integer factor that still fits the 320×180 base. */
  private resize(): void {
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
    this.rig.setViewport(this.lowW, this.lowH);
    this.pixelPass.setSize(this.lowW, this.lowH, this.scale);
  }

  start(): void {
    this.rig.snapTo(this.player.pos);
    this.lastTime = performance.now();
    this.renderer.setAnimationLoop((t) => this.frame(t));
  }

  private frame(now: number): void {
    const frameDt = Math.min(0.1, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.handleToggles();
    const step = CONFIG.sim.fixedDt;
    this.accumulator += frameDt;
    let steps = 0;
    while (this.accumulator >= step && steps < CONFIG.sim.maxStepsPerFrame) {
      this.update(step);
      this.accumulator -= step;
      steps++;
    }
    if (steps === CONFIG.sim.maxStepsPerFrame) this.accumulator = 0;
    this.render(frameDt, this.accumulator / step);
  }

  private handleToggles(): void {
    const i = this.input;
    if (i.consume('KeyP')) this.pixelate = !this.pixelate;
    if (i.consume('KeyO')) this.pixelPass.quantize = !this.pixelPass.quantize;
    if (i.consume('KeyL')) this.pixelPass.outlines = !this.pixelPass.outlines;
    if (i.consume('KeyH')) this.debug.visible = !this.debug.visible;
  }

  // ------------------------------------------------------------------------------ simulation

  private update(dt: number): void {
    this.elapsed += dt;
    const input = this.input;
    this.updateAim();

    // Screen-relative WASD → world direction (diagonals normalised).
    const axes = input.moveAxes();
    let mx = this.rig.screenRightGround.x * axes.x + this.rig.screenUpGround.x * axes.y;
    let mz = this.rig.screenRightGround.z * axes.x + this.rig.screenUpGround.z * axes.y;
    const ml = Math.hypot(mx, mz);
    if (ml > 1e-6) {
      mx /= ml;
      mz /= ml;
    }

    if (input.consume('KeyE')) this.toggleMount();

    const pin: PlayerInput = {
      moveX: mx,
      moveZ: mz,
      sprint: input.sprint,
      fireHeld: input.mouseDown,
      reload: input.consume('KeyR'),
      aim: this.aim,
    };

    if (this.player.mounted) {
      const target = ml > 1e-6 ? dirToYaw(mx, mz) : null;
      this.horse.update(dt, target, input.sprint, this.world);
      this.player.prevPos.copy(this.player.pos);
      this.player.pos.copy(this.horse.pos);
      this.player.mountSpeed = this.horse.motor.speed;
      this.player.mountYaw = this.horse.heading;
    } else {
      this.horse.update(dt, null, false, this.world);
      this.horseCollider.x = this.horse.pos.x;
      this.horseCollider.z = this.horse.pos.z;
      this.player.updateMovement(dt, pin, this.world, [this.horseCollider]);
      this.spawnFootsteps(dt);
    }

    const shot = this.player.updateWeapon(dt, pin);
    if (shot) {
      this.projectiles.fire(shot.origin, shot.dir);
      this.flash.trigger(shot.origin, shot.dir);
      this.rig.addTrauma(CONFIG.shake.shotTrauma);
      // A wisp of smoke at the muzzle.
      this.particles.spawn(shot.origin.x, shot.origin.y, shot.origin.z, shot.dir.x * 1.5, 0.6, shot.dir.z * 1.5, 0.35, 0.16, 0.5, 3, 0xe8cf9b);
    }

    this.projectiles.update(dt, this.world, this.targets, (imp) => this.onImpact(imp));
    this.targets.update(dt);
    this.particles.update(dt);
    this.flash.update(dt);
  }

  private updateAim(): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const u = (this.input.mouseX - rect.left) / rect.width;
    const v = (this.input.mouseY - rect.top) / rect.height;
    this.pickAim(u * 2 - 1, -(v * 2 - 1), this.aim);
    this.cursor = this.input.mouseInside ? { x: Math.floor(u * this.lowW), y: Math.floor(v * this.lowH) } : null;
  }

  private aimFrom = new THREE.Vector3();
  private aimTo = new THREE.Vector3();
  /** The first visible surface under the cursor (target, building, prop or ground) — what the crosshair is on. */
  private pickAim(ndcX: number, ndcY: number, out: THREE.Vector3): void {
    const ray = this.rig.pickRay(ndcX, ndcY);
    const a = this.aimFrom.copy(ray.origin);
    const b = this.aimTo.copy(ray.origin).addScaledVector(ray.direction, -ray.origin.y / ray.direction.y + 1);
    // A few passes so buildings dithered away in front of the player don't catch the cursor.
    for (let pass = 0; pass < 4; pass++) {
      const wh = this.world.raycast(a.x, a.y, a.z, b.x, b.y, b.z);
      const th = this.targets.raycast(a, b);
      if (th && (!wh || th.t <= wh.t)) {
        out.copy(a).lerp(b, th.t);
        return;
      }
      if (!wh) break;
      out.copy(a).lerp(b, wh.t);
      if (!wh.collider || !this.isFadedAt(out.x, out.z)) return;
      a.copy(out).addScaledVector(ray.direction, 0.05);
    }
    out.copy(ray.origin).addScaledVector(ray.direction, -ray.origin.y / ray.direction.y);
  }

  private isFadedAt(x: number, z: number): boolean {
    const e = 0.05;
    return this.occluders.some((o) => o.fade.value > 0.3 && x > o.minX - e && x < o.maxX + e && z > o.minZ - e && z < o.maxZ + e);
  }

  private toggleMount(): void {
    const p = this.player;
    const h = this.horse;
    if (p.mounted) {
      // Dismount to the side, falling back to the other side / behind if blocked.
      const hy = h.heading;
      const candidates = [
        [Math.cos(hy), -Math.sin(hy)],
        [-Math.cos(hy), Math.sin(hy)],
        [-Math.sin(hy), -Math.cos(hy)],
      ];
      let best = candidates[0];
      for (const c of candidates) {
        const test = { x: h.pos.x + c[0] * 1.3, z: h.pos.z + c[1] * 1.3 };
        const before = { ...test };
        this.world.resolveCircle(test, CONFIG.player.radius);
        if (Math.hypot(test.x - before.x, test.z - before.z) < 1e-4) {
          best = c;
          break;
        }
      }
      p.mounted = false;
      h.ridden = false;
      p.setPosition(new THREE.Vector3(h.pos.x + best[0] * 1.3, 0, h.pos.z + best[1] * 1.3));
      p.vel.set(Math.sin(hy) * h.motor.speed * 0.3, Math.cos(hy) * h.motor.speed * 0.3);
      this.scene.add(p.model.root);
      p.model.root.rotation.set(0, 0, 0);
      this.particles.burst('dust', p.pos.clone().setY(0.1));
    } else if (p.pos.distanceTo(h.pos) < CONFIG.player.mountRange) {
      p.mounted = true;
      h.ridden = true;
      p.vel.set(0, 0);
      h.model.saddle.add(p.model.root);
      p.model.root.position.set(0, 0, 0);
      p.setPosition(h.pos);
    }
  }

  private spawnFootsteps(dt: number): void {
    const sp = this.player.speed();
    if (sp < 1) return;
    this.footstepTimer -= dt;
    if (this.footstepTimer <= 0) {
      this.footstepTimer = this.player.sprinting ? 0.2 : 0.32;
      this.particles.burst('hoof', this.player.pos.clone().setY(0.05), undefined, this.player.sprinting ? 0.8 : 0.5);
    }
  }

  private onImpact(imp: Impact): void {
    if (imp.target) {
      const kind = imp.target.hit(imp.point, imp.dir);
      this.particles.burst(kind, imp.point, imp.dir.clone().multiplyScalar(0.6).add(imp.normal));
      this.particles.burst('spark', imp.point, imp.normal, 0.5);
      return;
    }
    const kinds = imp.surface === 'target' ? ['dust' as BurstKind] : IMPACT_BURSTS[imp.surface];
    kinds.forEach((k, i) => this.particles.burst(k, imp.point, imp.normal, i === 0 ? 1 : 0.6));
    if (imp.surface === 'dirt') this.particles.burst('dust', imp.point, imp.normal, 0.6);
  }

  // ------------------------------------------------------------------------------ rendering

  private render(frameDt: number, alpha: number): void {
    this.renderer.info.reset();
    const p = this.player;
    this.horse.sync(alpha, frameDt);
    if (!p.mounted) p.model.root.position.lerpVectors(p.prevPos, p.pos, alpha);
    p.animate(frameDt);
    this.projectiles.sync(alpha);

    // Camera: follow the (interpolated) player, lead a little towards the aim and travel direction.
    const base = p.mounted ? this.horse.model.root.position : p.model.root.position;
    const c = CONFIG.camera;
    const lead = this.focusTarget.set(this.aim.x - base.x, 0, this.aim.z - base.z).multiplyScalar(c.aimLead);
    if (lead.length() > c.maxAimLead) lead.setLength(c.maxAimLead);
    if (p.mounted) {
      const m = this.horse.motor;
      lead.x += Math.sin(m.heading) * m.speed * 0.18;
      lead.z += Math.cos(m.heading) * m.speed * 0.18;
    }
    lead.add(base).setY(0);
    this.rig.update(frameDt, lead, this.pixelate);
    this.updateSun();
    this.updateOccluders(frameDt, base, p.mounted);

    if (this.pixelate) {
      this.pixelPass.render(this.renderer, this.scene, this.rig.camera, this.rig.subpixel);
    } else {
      this.renderer.shadowMap.needsUpdate = true;
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.scene, this.rig.view);
    }

    const nearHorse = !p.mounted && p.pos.distanceTo(this.horse.pos) < CONFIG.player.mountRange;
    this.hud.draw(frameDt, {
      ammo: p.ammo,
      reloadProgress: p.reloadProgress,
      prompt: nearHorse ? '[E] MOUNT' : this.elapsed < 9 ? 'WASD MOVE  MOUSE AIM  CLICK SHOOT  R RELOAD' : null,
      cursorX: this.cursor?.x ?? null,
      cursorY: this.cursor?.y ?? null,
      mounted: p.mounted,
      speedLabel: p.mounted ? this.gaitLabel() : null,
      pixelate: this.pixelate,
    });
    this.debug.draw(frameDt, this.rig.view, this.horse, [
      `low-res ${this.lowW}x${this.lowH} x${this.scale}  pixel ${this.pixelate ? 'on' : 'off'}  palette ${this.pixelPass.quantize ? 'on' : 'off'} [O]  outlines [L]`,
      `player ${p.pos.x.toFixed(1)}, ${p.pos.z.toFixed(1)}  ${p.mounted ? 'mounted' : 'on foot'}  ammo ${p.ammo}`,
      `draw calls ${this.renderer.info.render.calls}`,
    ]);
  }

  /** Dither out buildings that sit between the camera and the player. */
  private updateOccluders(dt: number, base: THREE.Vector3, mounted: boolean): void {
    const back = this.rig.back;
    const exclude = this.pixelPass.normalPassExclude;
    exclude.length = 0;
    const L = 40;
    for (const o of this.occluders) {
      let hidden = false;
      // Probe a few points on the character (feet, chest, head; wider when mounted).
      for (const [ox, oy] of mounted ? [[0, 0.6], [0, 2.4], [1, 1.4], [-1, 1.4]] : [[0, 0.3], [0, 1.0], [0, 1.8]]) {
        const ax = base.x + this.rig.right.x * ox;
        const az = base.z + this.rig.right.z * ox;
        if (segmentVsBox(ax, oy, az, ax + back.x * L, oy + back.y * L, az + back.z * L, o.minX, o.minZ, o.maxX, o.maxZ, o.height)) {
          hidden = true;
          break;
        }
      }
      o.fade.value = damp(o.fade.value, hidden ? 0.72 : 0, 10, dt);
      if (o.fade.value < 0.01) o.fade.value = 0;
      // Faded meshes draw after the rest so the dithered holes reveal what's behind them.
      o.mesh.renderOrder = o.fade.value > 0 ? 1 : 0;
      if (o.fade.value > 0.05) exclude.push(o.mesh);
    }
  }

  private gaitLabel(): string {
    const m = this.horse.motor;
    if (m.mode === 'braking') return 'WHOA!';
    if (m.speed < 0.1) return 'STAND';
    if (m.speed < 3.5) return 'WALK';
    if (m.speed < CONFIG.horse.canterSpeed + 0.5) return 'CANTER';
    return 'GALLOP';
  }

  private lightRight = new THREE.Vector3();
  private lightUp = new THREE.Vector3();
  /** Sun follows the camera focus, snapped to shadow texels so shadow edges don't crawl. */
  private updateSun(): void {
    const e = CONFIG.render.shadowExtent;
    const texel = (2 * e) / CONFIG.render.shadowMapSize;
    this.lightRight.crossVectors(THREE.Object3D.DEFAULT_UP, this.sunDir).normalize();
    this.lightUp.crossVectors(this.sunDir, this.lightRight).normalize();
    const f = this.rig.focus;
    const x = f.dot(this.lightRight);
    const y = f.dot(this.lightUp);
    const dx = Math.round(x / texel) * texel - x;
    const dy = Math.round(y / texel) * texel - y;
    const target = this.sun.target.position.copy(f).addScaledVector(this.lightRight, dx).addScaledVector(this.lightUp, dy);
    this.sun.position.copy(target).addScaledVector(this.sunDir, 80);
    this.sun.target.updateMatrixWorld();
  }
}
