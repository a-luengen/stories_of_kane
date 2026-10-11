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
import { Npc } from './entities/Npc';
import { NpcSystem } from './entities/NpcSystem';
import type { ShotRequest } from './entities/Weapon';
import { NPCS } from './data/npcs';
import { pickInteractable, type Interactable } from './Interaction';
import { buildWorld, type Occluder } from './world/World';
import { segmentVsBox, type CircleCollider, type CollisionWorld, type Surface } from './world/Colliders';
import { NavGrid } from './world/NavGrid';
import { IconRenderer } from './items/IconRenderer';
import type { ItemInstance } from './items/ItemInstance';
import { pickup } from './items/transfer';
import { InventoryUI, type UiPointer } from './ui/InventoryUI';
import { WorldItemSystem, type WorldItem } from './world/WorldItem';
import { Hud, type WorldLabel } from './ui/Hud';
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
  /** Separate flash for NPC shots so they don't steal the player's. */
  readonly npcFlash = new MuzzleFlash();
  readonly targets = new TargetSystem();
  readonly nav: NavGrid;
  readonly npcs: NpcSystem;
  /** What E would use right now (on foot). */
  private interactTarget: Interactable | null = null;
  private playerCollider: CircleCollider;
  private playerSpawn: THREE.Vector3;
  private respawnLeft = 0;
  readonly icons: IconRenderer;
  readonly ui: InventoryUI;
  readonly worldItems: WorldItemSystem;
  private uiPointer: UiPointer = { x: 0, y: 0, pressed: false, released: false };
  private pausedAlpha = 0;
  private fireBlocked = false;
  private toast: { text: string; left: number } | null = null;
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
    this.scene.add(this.npcFlash.group, this.npcFlash.light);
    this.pixelPass.unoutlined.push(this.projectiles.group, this.flash.group, this.npcFlash.group, this.particles.mesh);
    this.playerSpawn = wd.playerSpawn.clone();
    this.player.setPosition(wd.playerSpawn);
    this.playerCollider = { kind: 'circle', x: 0, z: 0, r: CONFIG.player.radius, height: 1.9, surface: 'wood', blocksBullets: false };
    this.targets.addActor(this.player);
    this.scene.add(this.player.model.root);
    this.horse.place(wd.horseSpawn, wd.horseYaw);
    this.scene.add(this.horse.model.root);
    this.horseCollider = { kind: 'circle', x: 0, z: 0, r: CONFIG.horse.radius, height: 2, surface: 'wood', blocksBullets: false };
    this.horse.model.onFootfall = () => {
      const h = this.horse.model.root;
      const back = new THREE.Vector3(-Math.sin(h.rotation.y) * 0.7, 0.05, -Math.cos(h.rotation.y) * 0.7);
      this.particles.burst('hoof', back.add(h.position));
    };
    this.horse.canMount = () => !this.player.mounted && !this.player.dead;
    this.horse.onMount = () => this.mount();

    // NPCs walk a nav grid over the static colliders and hide behind the buildings.
    this.nav = new NavGrid(this.world, CONFIG.world.size / 2);
    this.npcs = new NpcSystem(NPCS, this.world, this.nav, this.occluders);
    this.scene.add(this.npcs.group);
    for (const n of this.npcs.npcs) this.targets.addActor(n);
    for (const n of this.npcs.npcs) n.onLoot = (npc) => this.openUi(() => this.ui.openLoot(npc));

    this.icons = new IconRenderer(this.renderer);
    this.icons.warm([8, 16]);
    this.worldItems = new WorldItemSystem(this.world);
    this.scene.add(this.worldItems.group, this.worldItems.glints);
    this.pixelPass.unoutlined.push(this.worldItems.glints);
    this.ui = new InventoryUI(
      {
        player: this.player,
        icons: this.icons,
        dropToWorld: (item) => this.dropToWorld(item),
        toast: (t) => this.showToast(t),
      },
      this.renderer,
    );

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
    this.handleMenuKeys();
    if (this.ui.open) {
      // Paused: no simulation; the world is rendered frozen behind the panel.
      this.updateUi(frameDt);
      this.render(frameDt, this.pausedAlpha, true);
      return;
    }
    const step = CONFIG.sim.fixedDt;
    this.accumulator += frameDt;
    let steps = 0;
    while (this.accumulator >= step && steps < CONFIG.sim.maxStepsPerFrame) {
      this.update(step);
      this.accumulator -= step;
      steps++;
    }
    if (steps === CONFIG.sim.maxStepsPerFrame) this.accumulator = 0;
    this.pausedAlpha = this.accumulator / step;
    this.render(frameDt, this.pausedAlpha, false);
  }

  /** I toggles the inventory, Esc closes (or drops the held item first); E also closes the loot view. */
  private handleMenuKeys(): void {
    const i = this.input;
    const open = this.ui.open;
    if (i.consume('KeyI')) {
      if (open) this.closeUi();
      else if (!this.player.dead) this.openUi(() => this.ui.openInventory());
    } else if (open && i.consume('Escape')) {
      this.ui.escape();
      if (!this.ui.open) this.closeUi();
    } else if (open && this.ui.mode?.kind === 'loot' && i.consume('KeyE')) {
      this.closeUi();
    }
  }

  private openUi(open: () => void): void {
    open();
    this.input.clearPressed();
  }

  private closeUi(): void {
    this.ui.close();
    this.input.clearPressed();
    // Don't let a mouse button still held from the menu fire the gun.
    this.fireBlocked = this.input.mouseDown;
  }

  private updateUi(frameDt: number): void {
    const i = this.input;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.uiPointer.x = Math.floor(((i.mouseX - rect.left) / rect.width) * this.lowW);
    this.uiPointer.y = Math.floor(((i.mouseY - rect.top) / rect.height) * this.lowH);
    this.uiPointer.pressed = i.consume('Mouse0');
    this.uiPointer.released = i.consume('Mouse0Up');
    this.ui.update(frameDt, this.uiPointer, { rotate: i.consume('KeyR'), shift: i.sprint }, this.lowW, this.lowH);
  }

  /** Put an item on the ground next to the player (towards the aim). */
  private dropToWorld(item: ItemInstance): void {
    const p = this.player;
    const w = this.worldItems.spawn(item, p.pos, p.aimYaw, p.mounted ? 1.7 : 1.0);
    w.onPickup = (wi) => this.pickUp(wi);
  }

  private pickUp(w: WorldItem): void {
    const before = w.item.quantity;
    const left = pickup(this.player.inventory, w.item);
    if (left === 0) {
      this.worldItems.remove(w);
    } else {
      this.showToast('Inventory full');
      if (left < before) w.item.quantity = left;
    }
    this.player.syncEquipment();
  }

  private handleToggles(): void {
    const i = this.input;
    if (i.consume('KeyP')) this.pixelate = !this.pixelate;
    if (i.consume('KeyO')) this.pixelPass.quantize = !this.pixelPass.quantize;
    if (i.consume('KeyL')) this.pixelPass.outlines = !this.pixelPass.outlines;
    if (i.consume('F3')) this.debug.visible = !this.debug.visible;
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

    const p = this.player;
    p.update(dt);
    if (!input.mouseDown) this.fireBlocked = false;
    const interactables: Interactable[] = [this.horse, ...this.npcs.npcs, ...this.worldItems.items];
    this.interactTarget = p.mounted || p.dead ? null : pickInteractable(interactables, p.pos, p.aimYaw);
    if (input.consume('KeyE') && !p.dead) {
      // Context-sensitive: riding always dismounts, on foot use whatever is targeted.
      if (p.mounted) this.dismount();
      else this.interactTarget?.interact();
    }

    const pin: PlayerInput = {
      moveX: mx,
      moveZ: mz,
      sprint: input.sprint,
      fireHeld: input.mouseDown && !p.dead && !this.fireBlocked,
      reload: input.consume('KeyR') && !p.dead,
      holster: input.consume('KeyH'),
      select: this.slotKey(),
      aim: this.aim,
    };

    const npcBodies = this.npcs.bodies;
    if (p.mounted) {
      const target = ml > 1e-6 ? dirToYaw(mx, mz) : null;
      this.horse.update(dt, target, input.sprint, this.world, npcBodies);
      p.prevPos.copy(p.pos);
      p.pos.copy(this.horse.pos);
      p.mountSpeed = this.horse.motor.speed;
      p.mountYaw = this.horse.heading;
    } else {
      this.horse.update(dt, null, false, this.world, npcBodies);
      p.updateMovement(dt, pin, this.world, [this.horseCollider, ...npcBodies]);
      this.spawnFootsteps(dt);
    }
    this.horseCollider.x = this.horse.pos.x;
    this.horseCollider.z = this.horse.pos.z;
    this.playerCollider.x = p.pos.x;
    this.playerCollider.z = p.pos.z;

    const shot = p.updateWeapon(dt, pin);
    if (shot) {
      this.fireShot(shot, p, this.flash);
      this.rig.addTrauma(CONFIG.shake.shotTrauma);
    }

    const others = p.mounted || p.dead ? [this.horseCollider] : [this.horseCollider, this.playerCollider];
    this.npcs.update(dt, p, others, (npc, s) => this.fireShot(s, npc, this.npcFlash));

    this.projectiles.update(dt, this.world, this.targets, (imp) => this.onImpact(imp));
    this.updateDeath(dt);
    this.targets.update(dt);
    this.particles.update(dt);
    this.flash.update(dt);
    this.npcFlash.update(dt);
  }

  private updateAim(): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const u = (this.input.mouseX - rect.left) / rect.width;
    const v = (this.input.mouseY - rect.top) / rect.height;
    this.pickAim(u * 2 - 1, -(v * 2 - 1), this.aim);
    this.cursor = this.input.mouseInside ? { x: Math.floor(u * this.lowW), y: Math.floor(v * this.lowH) } : null;
  }

  /** Weapon slot key pressed this step (each key is consumed). */
  private slotKey(): number | null {
    let pressed: number | null = null;
    ['Digit1', 'Digit2', 'Digit3'].forEach((k, i) => {
      if (this.input.consume(k) && pressed === null) pressed = i;
    });
    return pressed;
  }

  /** Show a short message in the lower middle of the screen. */
  private showToast(text: string, seconds = 2): void {
    this.toast = { text, left: seconds };
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
      const th = this.targets.raycast(a, b, this.player);
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

  private fireShot(shot: ShotRequest, shooter: Player | Npc, flash: MuzzleFlash): void {
    for (const dir of shot.dirs) this.projectiles.fire(shot.origin, dir, shot.weapon, shooter);
    const d = shot.dirs[0];
    flash.trigger(shot.origin, d);
    // A wisp of smoke at the muzzle.
    this.particles.spawn(shot.origin.x, shot.origin.y, shot.origin.z, d.x * 1.5, 0.6, d.z * 1.5, 0.35, 0.16, 0.5, shot.dirs.length > 1 ? 5 : 3, 0xe8cf9b);
  }

  /** Death → short pause → respawn at the start with everyone calmed down. */
  private updateDeath(dt: number): void {
    const p = this.player;
    if (!p.dead && p.hp <= 0) {
      if (p.mounted) this.dismount();
      p.holster(true);
      p.dead = true;
      p.vel.set(0, 0);
      this.respawnLeft = CONFIG.player.respawnTime;
    } else if (p.dead) {
      this.respawnLeft -= dt;
      if (this.respawnLeft <= 0) {
        p.revive(this.playerSpawn);
        this.npcs.calmAll();
      }
    }
  }

  private mount(): void {
    const p = this.player;
    const h = this.horse;
    p.mounted = true;
    h.ridden = true;
    p.vel.set(0, 0);
    h.model.saddle.add(p.model.root);
    p.model.root.position.set(0, 0, 0);
    p.setPosition(h.pos);
  }

  private dismount(): void {
    const p = this.player;
    const h = this.horse;
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
    const byPlayer = imp.shooter === this.player;
    const hitNpc = imp.target instanceof Npc ? imp.target : null;
    if (byPlayer) {
      if (hitNpc?.alive) this.npcs.onPlayerHitNpc(hitNpc, this.player);
      this.npcs.onPlayerShotLanded(imp.point, hitNpc);
    }
    if (imp.target) {
      const kind = imp.target.hit(imp.point, imp.dir, { damage: imp.damage, shooter: imp.shooter });
      this.particles.burst(kind, imp.point, imp.dir.clone().multiplyScalar(0.6).add(imp.normal));
      if (kind !== 'blood') this.particles.burst('spark', imp.point, imp.normal, 0.5);
      if (imp.target === this.player) this.rig.addTrauma(0.35);
      return;
    }
    const kinds = imp.surface === 'target' ? ['dust' as BurstKind] : IMPACT_BURSTS[imp.surface];
    kinds.forEach((k, i) => this.particles.burst(k, imp.point, imp.normal, i === 0 ? 1 : 0.6));
    if (imp.surface === 'dirt') this.particles.burst('dust', imp.point, imp.normal, 0.6);
  }

  // ------------------------------------------------------------------------------ rendering

  private render(frameDt: number, alpha: number, paused: boolean): void {
    this.renderer.info.reset();
    const p = this.player;
    // Paused: everything holds its pose (animations get no time).
    const animDt = paused ? 0 : frameDt;
    this.horse.sync(alpha, animDt);
    if (!p.mounted) p.model.root.position.lerpVectors(p.prevPos, p.pos, alpha);
    p.animate(animDt);
    for (const n of this.npcs.npcs) n.sync(alpha, animDt);
    this.projectiles.sync(alpha);
    this.worldItems.update(animDt);

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
    this.rig.update(animDt, lead, this.pixelate);
    this.updateSun();
    this.updateOccluders(animDt, base, p.mounted);

    if (this.pixelate) {
      this.pixelPass.render(this.renderer, this.scene, this.rig.camera, this.rig.subpixel);
    } else {
      this.renderer.shadowMap.needsUpdate = true;
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.scene, this.rig.view);
    }

    if (this.toast) {
      this.toast.left -= frameDt;
      if (this.toast.left <= 0) this.toast = null;
    }
    const w = p.weapon;
    this.hud.draw(frameDt, {
      weaponBar: {
        slots: p.equipment.weapons.map((item, i) => ({ icon: item ? this.icons.get(item.defId, 8) : null, selected: p.active === i })),
        drawn: p.drawn,
        ammo: w ? { loaded: w.ammo, magazine: w.def.magazine, reserve: w.reserve } : null,
        reloadProgress: p.reloadProgress,
        noAmmo: p.noAmmo > 0,
      },
      toast: this.toast?.text ?? null,
      menuOpen: paused,
      hp: p.hp,
      maxHp: CONFIG.player.maxHp,
      hurt: p.hurt,
      dead: p.dead,
      labels: paused ? [] : this.worldLabels(),
      prompt: this.elapsed < 9 ? 'WASD MOVE  CLICK SHOOT  R RELOAD  1-3 WEAPONS  E USE  I INVENTORY' : null,
      cursorX: this.cursor?.x ?? null,
      cursorY: this.cursor?.y ?? null,
      mounted: p.mounted,
      speedLabel: p.mounted ? this.gaitLabel() : null,
      pixelate: this.pixelate,
    });
    if (paused) this.ui.draw(this.hud.context, this.lowW, this.lowH, this.uiPointer);
    this.debug.draw(frameDt, this.rig.view, this.horse, [
      `low-res ${this.lowW}x${this.lowH} x${this.scale}  pixel ${this.pixelate ? 'on' : 'off'}  palette ${this.pixelPass.quantize ? 'on' : 'off'} [O]  outlines [L]`,
      `player ${p.pos.x.toFixed(1)}, ${p.pos.z.toFixed(1)}  ${p.mounted ? 'mounted' : 'on foot'}  ammo ${p.ammo}`,
      `draw calls ${this.renderer.info.render.calls}`,
      `npcs ${this.npcs.npcs.map((n) => `${n.name.split(' ')[0]}:${n.mode}${n.mode !== 'routine' && n.alive ? ` ${n.calmTimer.toFixed(0)}s` : ''}`).join('  ')}`,
    ]);
  }

  private projected = new THREE.Vector3();
  /** World point → low-res HUD pixel. */
  private project(x: number, y: number, z: number): { x: number; y: number } {
    const v = this.projected.set(x, y, z).project(this.rig.view);
    return { x: ((v.x + 1) / 2) * this.lowW, y: ((1 - v.y) / 2) * this.lowH };
  }

  /** Name tag + prompt for the interaction target, speech bubbles, aim warnings. */
  private worldLabels(): WorldLabel[] {
    const out: WorldLabel[] = [];
    const t = this.interactTarget;
    for (const n of this.npcs.npcs) {
      if (!n.alive) continue; // corpses get a plain prompt below
      const r = n.model.root.position;
      const head = this.project(r.x, 2.15, r.z);
      // Stacked upwards: name tag, prompt, aim warning, speech bubble.
      let y = head.y;
      if (t === n) {
        out.push({ kind: 'name', text: n.name, x: head.x, y });
        out.push({ kind: 'prompt', text: `[E] ${t.label}`, x: head.x, y: y - 10 });
        y -= 18;
      }
      if (n.telegraphing) {
        out.push({ kind: 'alert', text: '!', x: head.x, y });
        y -= 8;
      }
      if (n.speech) out.push({ kind: 'speech', text: n.speech, x: head.x, y });
    }
    if (t && !(t instanceof Npc && t.alive)) {
      const at = this.project(t.position.x, t.promptHeight, t.position.z);
      out.push({ kind: 'prompt', text: `[E] ${t.label}`, x: at.x, y: at.y });
    }
    return out;
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
