import * as THREE from 'three';
import { CONFIG } from '../config';
import type { NpcDef } from '../data/types';
import { NavGrid } from '../ai/NavGrid';
import { Horse } from '../entities/Horse';
import { MuzzleFlash } from '../entities/MuzzleFlash';
import { Npc } from '../entities/Npc';
import { NpcSystem } from '../entities/NpcSystem';
import { Particles, type BurstKind } from '../entities/Particles';
import { Player, type PlayerInput } from '../entities/Player';
import { ProjectileSystem, type Impact } from '../entities/Projectiles';
import { TargetSystem } from '../entities/Targets';
import type { ShotRequest } from '../entities/Weapon';
import { pickInteractable, type Interactable } from '../Interaction';
import type { ItemInstance } from '../items/ItemInstance';
import { pickup } from '../items/transfer';
import type { WorldLabel } from '../ui/Hud';
import { InventoryUI } from '../ui/InventoryUI';
import { damp, dirToYaw } from '../util/math';
import { segmentVsBox, type CircleCollider, type CollisionWorld, type Surface } from '../world/Colliders';
import type { Occluder, WorldData } from '../world/props';
import { WorldItemSystem, type WorldItem } from '../world/WorldItem';
import { CoverDebug } from '../render/CoverDebug';
import { SessionAudio } from '../audio/SessionAudio';
import { disposeObject } from './dispose';
import type { Engine } from './Engine';

const IMPACT_BURSTS: Record<Surface, BurstKind[]> = {
  dirt: ['dust'],
  wood: ['wood', 'spark'],
  rock: ['rock', 'spark', 'dust'],
  cactus: ['cactus'],
  metal: ['spark', 'spark'],
};

export interface SessionOptions {
  /** Builds the map (fills the target system with shootables). */
  map: (targets: TargetSystem) => WorldData;
  npcs: readonly NpcDef[];
  /** Passive health regeneration. */
  regen: boolean;
  /** Controls hint shown for the first seconds. */
  tutorial: string | null;
}

/** How a mode plugs into a session. */
export interface SessionHooks {
  /** The player's HP hit 0 (they have already fallen). */
  onPlayerDeath(): void;
  /** An NPC was killed by a bullet. */
  onNpcDeath?(npc: Npc, byPlayer: boolean): void;
  /** Every fixed simulation step, after the world update. */
  step?(dt: number): void;
  /** Extra E targets (e.g. the merchant). */
  interactables?(): Interactable[];
  /** Extra world-anchored labels. */
  labels?(project: (x: number, y: number, z: number) => { x: number; y: number }): WorldLabel[];
  /** Mode HUD, drawn over the standard HUD (and under open panels). */
  drawHud?(ctx: CanvasRenderingContext2D, W: number, H: number, dt: number): void;
}

/**
 * One playthrough of a map: scene, player, horses, NPCs, bullets, items and the inventory UI.
 * Owns its scene graph and disposes it completely; borrows the engine's renderer and input.
 */
export class Session {
  readonly scene = new THREE.Scene();
  readonly world: CollisionWorld;
  readonly player = new Player();
  readonly horses: Horse[] = [];
  /** The horse the player is riding. */
  riding: Horse | null = null;
  readonly projectiles = new ProjectileSystem();
  readonly particles = new Particles();
  readonly flash = new MuzzleFlash();
  /** Separate flash for NPC shots so they don't steal the player's. */
  readonly npcFlash = new MuzzleFlash();
  readonly targets = new TargetSystem();
  readonly nav: NavGrid;
  readonly npcs: NpcSystem;
  readonly ui: InventoryUI;
  readonly worldItems: WorldItemSystem;
  /** B: cover volumes, hitboxes and bullet heights. */
  readonly coverDebug: CoverDebug;
  /** Positioned sound for this session (the player is the listener). */
  readonly sound: SessionAudio;
  readonly map: WorldData;
  /** Simulation speed (slow motion < 1). */
  timeScale = 1;
  /** Seconds of simulated play. */
  elapsed = 0;
  /** Text shown while the player is down. */
  deathMessage = 'YOU DIED';

  private interactTarget: Interactable | null = null;
  private playerCollider: CircleCollider;
  private horseColliders = new Map<Horse, CircleCollider>();
  private pausedAlpha = 0;
  private fireBlocked = false;
  private toast: { text: string; left: number } | null = null;
  private sun: THREE.DirectionalLight;
  private sunDir = new THREE.Vector3(...CONFIG.render.sunDirection).normalize();
  private accumulator = 0;
  private aim = new THREE.Vector3();
  private focusTarget = new THREE.Vector3();
  private cursor: { x: number; y: number } | null = null;
  private occluders: Occluder[];

  constructor(
    readonly engine: Engine,
    private opts: SessionOptions,
    private hooks: SessionHooks,
  ) {
    const px = engine.pixelPass;
    px.unoutlined.length = 0;
    px.normalPassExclude.length = 0;

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
    const wd = opts.map(this.targets);
    this.map = wd;
    this.world = wd.collision;
    this.occluders = wd.occluders;
    this.scene.add(wd.group, this.targets.group, this.projectiles.group, this.particles.mesh, this.flash.group, this.flash.light);
    this.scene.add(this.npcFlash.group, this.npcFlash.light);
    px.unoutlined.push(this.projectiles.group, this.flash.group, this.npcFlash.group, this.particles.mesh);
    this.player.setPosition(wd.playerSpawn);
    this.player.regen = opts.regen;
    this.playerCollider = { kind: 'circle', x: 0, z: 0, r: CONFIG.player.radius, coverHeight: 1.9, surface: 'wood', blocksBullets: false };
    this.targets.addActor(this.player);
    this.scene.add(this.player.model.root);
    if (wd.horseSpawn) this.addHorse(new Horse(), wd.horseSpawn, wd.horseYaw);

    // NPCs walk a nav grid over the static colliders and hide behind the buildings.
    this.nav = new NavGrid(this.world, wd.half);
    this.npcs = new NpcSystem(opts.npcs, this.world, this.nav, wd.cover);
    this.scene.add(this.npcs.group);
    for (const n of this.npcs.npcs) this.registerNpc(n);
    for (const c of wd.containers) {
      c.onOpen = (box) => {
        this.sound.lidOpen(box.kind, box.position);
        this.openUi(() => this.ui.openLoot(box));
      };
      c.onCollisionChanged = (box) => {
        const b = box.bounds;
        this.nav.refresh(this.world, b.minX, b.minZ, b.maxX, b.maxZ);
      };
    }

    this.sound = new SessionAudio(engine.audio, engine.rig.right);
    this.sound.setListener(this.player.pos);
    // Footsteps come from the walk cycle: a sound on the surface underfoot, dust on dirt.
    this.player.model.onStep = () => {
      const p = this.player;
      const gait = p.crouch > 0.5 ? 'crouch' : p.sprinting ? 'run' : 'walk';
      const surface = this.sound.step(p.pos, gait, this.map.floors);
      if (surface === 'dirt') this.particles.burst('hoof', p.pos.clone().setY(0.05), undefined, gait === 'run' ? 0.8 : gait === 'walk' ? 0.5 : 0.3);
    };
    this.coverDebug = new CoverDebug(this.world);
    this.scene.add(this.coverDebug.group);
    px.unoutlined.push(this.coverDebug.group);

    this.worldItems = new WorldItemSystem(this.world);
    this.scene.add(this.worldItems.group, this.worldItems.glints);
    px.unoutlined.push(this.worldItems.glints);
    this.ui = new InventoryUI(
      {
        player: this.player,
        icons: engine.icons,
        dropToWorld: (item) => this.dropToWorld(item),
        toast: (t) => this.showToast(t),
        useItem: (item) => this.player.useItem(item),
      },
      engine.renderer,
    );
    engine.rig.snapTo(this.player.pos);
  }

  /** Make an NPC shootable and lootable in this session. */
  registerNpc(n: Npc): void {
    this.targets.addActor(n);
    n.onLoot = (npc) => this.openUi(() => this.ui.openLoot(npc));
    n.onSpeak = (npc, text, mood) => this.sound.speak(npc, text, mood);
    n.onGunsDropped = (npc, guns) => this.dropNpcGuns(npc, guns);
    n.onRespawn = (npc) => this.clearNpcDrops(npc);
    n.model.onStep = () => {
      const gait = n.crouch > 0.5 ? 'crouch' : n.vel.length() > 3.2 ? 'run' : 'walk';
      this.sound.step(n.pos, gait, this.map.floors, true);
    };
  }

  /** Guns a dead NPC dropped, still lying on the ground (they go when the corpse does). */
  private npcDrops = new Map<Npc, WorldItem[]>();

  /** A dying NPC's guns land beside the body, each on its own (a dual wielder drops two). */
  private dropNpcGuns(npc: Npc, guns: ItemInstance[]): void {
    const yaw = Math.random() * Math.PI * 2;
    const items = guns.map((g, i) => {
      const w = this.worldItems.spawn(g, npc.pos, yaw + i * 2.4, 0.7);
      w.onPickup = (wi) => this.pickUp(wi);
      return w;
    });
    this.npcDrops.set(npc, [...(this.npcDrops.get(npc) ?? []), ...items]);
  }

  /** The corpse is gone (respawn, or wave mode clearing the dead): its guns go with it. */
  clearNpcDrops(npc: Npc): void {
    for (const w of this.npcDrops.get(npc) ?? []) if (this.worldItems.items.includes(w)) this.worldItems.remove(w);
    this.npcDrops.delete(npc);
  }

  /** Add a horse (mountable by the player whenever no one rides it). */
  addHorse(h: Horse, at: THREE.Vector3, yaw: number): Horse {
    h.place(at, yaw);
    this.horses.push(h);
    this.scene.add(h.model.root);
    this.horseColliders.set(h, { kind: 'circle', x: at.x, z: at.z, r: CONFIG.horse.radius, coverHeight: 2, surface: 'wood', blocksBullets: false });
    h.model.onFootfall = () => {
      const m = h.model.root;
      const back = new THREE.Vector3(-Math.sin(m.rotation.y) * 0.7, 0.05, -Math.cos(m.rotation.y) * 0.7);
      this.particles.burst('hoof', back.add(m.position));
    };
    h.model.onHoof = (leg, speed01) => this.sound.hoof(h.pos, speed01, leg < 2);
    h.canMount = () => !this.player.mounted && !this.player.dead && !h.ridden && !h.riderNpc;
    h.onMount = () => this.mount(h);
    return h;
  }

  removeHorse(h: Horse): void {
    const i = this.horses.indexOf(h);
    if (i < 0) return;
    if (this.riding === h) this.dismount();
    this.horses.splice(i, 1);
    this.horseColliders.delete(h);
    h.model.root.removeFromParent();
    disposeObject(h.model.root);
  }

  // ------------------------------------------------------------------------------ frame

  /** One frame of play: inventory screens pause the world, otherwise fixed-step simulation. */
  frame(frameDt: number): void {
    if (this.engine.input.consume('KeyB')) this.coverDebug.toggle();
    this.handleMenuKeys();
    if (this.ui.open) {
      this.ui.update(frameDt, this.engine.pointer(), { rotate: this.engine.input.consume('KeyR'), shift: this.engine.input.sprint }, this.engine.lowW, this.engine.lowH);
      this.render(frameDt, true);
      return;
    }
    const step = CONFIG.sim.fixedDt;
    this.accumulator += frameDt * this.timeScale;
    let steps = 0;
    while (this.accumulator >= step && steps < CONFIG.sim.maxStepsPerFrame) {
      this.update(step);
      this.accumulator -= step;
      steps++;
      if (this.ui.open) break;
    }
    if (steps === CONFIG.sim.maxStepsPerFrame) this.accumulator = 0;
    this.pausedAlpha = this.accumulator / step;
    this.render(frameDt * this.timeScale, false);
  }

  /** Esc while an inventory-type screen is open: handled here (true). Otherwise it's the mode's. */
  escape(): boolean {
    if (!this.ui.open) return false;
    this.ui.escape();
    if (!this.ui.open) this.closeUi();
    return true;
  }

  /** I toggles the inventory; E also closes the loot / shop view. */
  private handleMenuKeys(): void {
    const i = this.engine.input;
    const open = this.ui.open;
    if (i.consume('KeyI')) {
      if (open) this.closeUi();
      else if (!this.player.dead) this.openUi(() => this.ui.openInventory());
    } else if (open && this.ui.mode?.kind !== 'inventory' && i.consume('KeyE')) {
      this.closeUi();
    }
  }

  openUi(open: () => void): void {
    open();
    this.engine.input.clearPressed();
  }

  closeUi(): void {
    this.ui.close();
    this.engine.input.clearPressed();
    // Don't let a mouse button still held from the menu fire the gun.
    this.fireBlocked = this.engine.input.mouseDown;
  }

  /** Put an item on the ground next to the player (towards the aim). */
  dropToWorld(item: ItemInstance, at?: THREE.Vector3): WorldItem {
    const p = this.player;
    const w = this.worldItems.spawn(item, at ?? p.pos, p.aimYaw, p.mounted ? 1.7 : 1.0);
    w.onPickup = (wi) => this.pickUp(wi);
    return w;
  }

  private pickUp(w: WorldItem): void {
    const before = w.item.quantity;
    const left = pickup(this.player.inventory, w.item);
    if (left < before) this.sound.pickup(w.position);
    if (left === 0) {
      this.worldItems.remove(w);
    } else {
      this.showToast('Inventory full');
      if (left < before) w.item.quantity = left;
    }
    this.player.syncEquipment();
  }

  /** Show a short message in the lower middle of the screen. */
  showToast(text: string, seconds = 2): void {
    this.toast = { text, left: seconds };
  }

  // ------------------------------------------------------------------------------ simulation

  private update(dt: number): void {
    this.elapsed += dt;
    const input = this.engine.input;
    this.updateAim();

    // Screen-relative WASD → world direction (diagonals normalised).
    const rig = this.engine.rig;
    const axes = input.moveAxes();
    let mx = rig.screenRightGround.x * axes.x + rig.screenUpGround.x * axes.y;
    let mz = rig.screenRightGround.z * axes.x + rig.screenUpGround.z * axes.y;
    const ml = Math.hypot(mx, mz);
    if (ml > 1e-6) {
      mx /= ml;
      mz /= ml;
    }

    const p = this.player;
    p.update(dt);
    if (!input.mouseDown) this.fireBlocked = false;
    const interactables: Interactable[] = [
      ...this.horses,
      ...this.npcs.npcs,
      ...this.worldItems.items,
      ...this.map.containers,
      ...(this.hooks.interactables?.() ?? []),
    ];
    this.interactTarget = p.mounted || p.dead ? null : pickInteractable(interactables, p.pos, p.aimYaw);
    if (input.consume('KeyE') && !p.dead) {
      // Context-sensitive: riding always dismounts, on foot use whatever is targeted.
      if (p.mounted) this.dismount();
      else this.interactTarget?.interact();
    }
    if (input.consume('KeyG')) {
      const why = p.useBandage();
      if (why) this.showToast(why);
    }

    const pin: PlayerInput = {
      moveX: mx,
      moveZ: mz,
      sprint: input.sprint,
      fireHeld: input.mouseDown && !p.dead && !this.fireBlocked,
      reload: input.consume('KeyR') && !p.dead,
      holster: input.consume('KeyH'),
      select: this.slotKey(),
      crouch: input.consume('KeyC'),
      aim: this.aim,
    };

    const npcBodies = this.npcs.bodies;
    for (const h of this.horses) {
      const others = [...npcBodies, ...this.otherHorseColliders(h)];
      if (h === this.riding) {
        h.update(dt, ml > 1e-6 ? dirToYaw(mx, mz) : null, input.sprint, this.world, others);
      } else if (h.driver) {
        const d = h.driver(dt);
        h.update(dt, d.target, d.gallop, this.world, others);
      } else {
        h.update(dt, null, false, this.world, others);
      }
      const c = this.horseColliders.get(h)!;
      c.x = h.pos.x;
      c.z = h.pos.z;
    }
    if (this.riding) {
      p.prevPos.copy(p.pos);
      p.pos.copy(this.riding.pos);
      p.mountSpeed = this.riding.motor.speed;
      p.mountYaw = this.riding.heading;
    } else {
      p.updateMovement(dt, pin, this.world, [...this.otherHorseColliders(null), ...npcBodies]);
    }
    this.playerCollider.x = p.pos.x;
    this.playerCollider.z = p.pos.z;

    // Pulling the trigger on an empty gun clicks.
    const pull = pin.fireHeld && !this.triggerWasHeld;
    this.triggerWasHeld = pin.fireHeld;
    const gun = p.weapon;
    if (pull && gun && p.draw >= 1 && gun.ammo === 0 && !gun.reloading && p.healLeft <= 0) this.sound.dryFire(p.pos);
    const shot = p.updateWeapon(dt, pin);
    if (shot) {
      this.fireShot(shot, p, this.flash);
      rig.addTrauma(CONFIG.shake.shotTrauma);
    }

    const others = [...this.otherHorseColliders(null)];
    if (!p.mounted && !p.dead) others.push(this.playerCollider);
    this.npcs.update(dt, p, others, (npc, s) => this.fireShot(s, npc, this.npcFlash));

    this.projectiles.update(dt, this.world, this.targets, (imp) => this.onImpact(imp), {
      pos: this.sound.ear(p),
      radius: CONFIG.audio.whizzRadius,
      ignore: p,
      onPass: (point) => this.sound.whizz(point),
    });
    this.sound.watchGuns([p, ...this.npcs.npcs]);
    this.sound.watchHorses(dt, this.horses);
    this.updateDeath();
    this.targets.update(dt);
    this.particles.update(dt);
    this.flash.update(dt);
    this.npcFlash.update(dt);
    this.hooks.step?.(dt);
  }

  /** Colliders of all horses except `skip` and the one the player rides. */
  private otherHorseColliders(skip: Horse | null): CircleCollider[] {
    const out: CircleCollider[] = [];
    for (const h of this.horses) if (h !== skip && h !== this.riding) out.push(this.horseColliders.get(h)!);
    return out;
  }

  private updateAim(): void {
    const rect = this.engine.renderer.domElement.getBoundingClientRect();
    const input = this.engine.input;
    const u = (input.mouseX - rect.left) / rect.width;
    const v = (input.mouseY - rect.top) / rect.height;
    this.pickAim(u * 2 - 1, -(v * 2 - 1), this.aim);
    this.cursor = input.mouseInside ? { x: Math.floor(u * this.engine.lowW), y: Math.floor(v * this.engine.lowH) } : null;
  }

  /** Weapon slot key pressed this step (each key is consumed). */
  private slotKey(): number | null {
    let pressed: number | null = null;
    ['Digit1', 'Digit2', 'Digit3'].forEach((k, i) => {
      if (this.engine.input.consume(k) && pressed === null) pressed = i;
    });
    return pressed;
  }

  private aimFrom = new THREE.Vector3();
  private aimTo = new THREE.Vector3();
  /** The first visible surface under the cursor (target, building, prop or ground) — what the crosshair is on. */
  private pickAim(ndcX: number, ndcY: number, out: THREE.Vector3): void {
    const ray = this.engine.rig.pickRay(ndcX, ndcY);
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

  private triggerWasHeld = false;

  private fireShot(shot: ShotRequest, shooter: Player | Npc, flash: MuzzleFlash): void {
    this.sound.shot(shot);
    for (const dir of shot.dirs) this.projectiles.fire(shot.origin, dir, shot.weapon, shooter);
    const d = shot.dirs[0];
    flash.trigger(shot.origin, d);
    // A wisp of smoke at the muzzle.
    this.particles.spawn(shot.origin.x, shot.origin.y, shot.origin.z, d.x * 1.5, 0.6, d.z * 1.5, 0.35, 0.16, 0.5, shot.dirs.length > 1 ? 5 : 3, 0xe8cf9b);
  }

  /** The player went down: off the horse, gun away, and the mode decides what happens next. */
  private updateDeath(): void {
    const p = this.player;
    if (p.dead || p.hp > 0) return;
    if (p.mounted) this.dismount();
    p.holster(true);
    p.crouched = false; // eases out while falling
    p.dead = true;
    p.vel.set(0, 0);
    this.hooks.onPlayerDeath();
  }

  /** Bring the player back (at `at`, or where they fell). */
  revivePlayer(hpFraction: number, at?: THREE.Vector3): void {
    this.player.revive(at ?? this.player.pos.clone(), hpFraction);
  }

  mount(h: Horse): void {
    this.sound.horseMount(h.pos);
    const p = this.player;
    p.cancelCrouch();
    p.mounted = true;
    h.ridden = true;
    h.driver = null;
    this.riding = h;
    p.vel.set(0, 0);
    h.model.saddle.add(p.model.root);
    p.model.root.position.set(0, 0, 0);
    p.setPosition(h.pos);
  }

  dismount(): void {
    const p = this.player;
    const h = this.riding;
    if (!h) return;
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
    this.riding = null;
    p.setPosition(new THREE.Vector3(h.pos.x + best[0] * 1.3, 0, h.pos.z + best[1] * 1.3));
    p.vel.set(Math.sin(hy) * h.motor.speed * 0.3, Math.cos(hy) * h.motor.speed * 0.3);
    this.scene.add(p.model.root);
    p.model.root.rotation.set(0, 0, 0);
    this.particles.burst('dust', p.pos.clone().setY(0.1));
  }

  private onImpact(imp: Impact): void {
    const byPlayer = imp.shooter === this.player;
    const hitNpc = imp.target instanceof Npc ? imp.target : null;
    const wasAlive = hitNpc?.alive ?? false;
    if (byPlayer) {
      if (hitNpc?.alive) this.npcs.onPlayerHitNpc(hitNpc, this.player);
      this.npcs.onPlayerShotLanded(imp.point, hitNpc);
    }
    if (imp.target) {
      const kind = imp.target.hit(imp.point, imp.dir, { damage: imp.damage, shooter: imp.shooter });
      this.sound.impact(imp, kind);
      if (imp.target === this.player) this.sound.playerHurt();
      else if (hitNpc && wasAlive) this.sound.npcHit(hitNpc, !hitNpc.alive);
      this.particles.burst(kind, imp.point, imp.dir.clone().multiplyScalar(0.6).add(imp.normal));
      if (kind !== 'blood') this.particles.burst('spark', imp.point, imp.normal, 0.5);
      if (imp.target === this.player) this.engine.rig.addTrauma(0.35);
      if (hitNpc && wasAlive && !hitNpc.alive) this.hooks.onNpcDeath?.(hitNpc, byPlayer);
      return;
    }
    this.sound.impact(imp, null);
    const kinds = imp.surface === 'target' ? ['dust' as BurstKind] : IMPACT_BURSTS[imp.surface];
    kinds.forEach((k, i) => this.particles.burst(k, imp.point, imp.normal, i === 0 ? 1 : 0.6));
    if (imp.surface === 'dirt') this.particles.burst('dust', imp.point, imp.normal, 0.6);
    if (imp.collider) this.hitContainer(imp);
  }

  /** Bullets wear crates and ammo boxes down; a broken one bursts and spills (some of) its loot. */
  private hitContainer(imp: Impact): void {
    const box = this.map.containers.find((c) => c.owns(imp.collider));
    if (!box) return;
    const spilled = box.damage(imp.damage);
    if (!spilled) return;
    const at = box.position;
    this.sound.crateBreak(at);
    for (let i = 0; i < 4; i++) {
      const p = at.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.6, 0.25 + Math.random() * 0.4, (Math.random() - 0.5) * 0.6));
      this.particles.burst('wood', p, new THREE.Vector3(0, 1, 0), 1.3);
    }
    this.particles.burst('dust', at.clone().setY(0.2), undefined, 1.4);
    // Scattered around the wreck, starting on the side the shot came from.
    const back = dirToYaw(-imp.dir.x, -imp.dir.z);
    spilled.forEach((item, i) => {
      const w = this.worldItems.spawn(item, at, back + i * 2.1, 0.75);
      w.onPickup = (wi) => this.pickUp(wi);
    });
  }

  // ------------------------------------------------------------------------------ rendering

  /** Draw the world (frozen when paused), the HUD, mode overlays and any open panel. */
  render(frameDt: number, paused: boolean): void {
    const engine = this.engine;
    const rig = engine.rig;
    engine.renderer.info.reset();
    const alpha = this.pausedAlpha;
    const p = this.player;
    // Paused: everything holds its pose (animations get no time).
    const animDt = paused ? 0 : frameDt;
    for (const h of this.horses) h.sync(alpha, animDt);
    if (!p.mounted) p.model.root.position.lerpVectors(p.prevPos, p.pos, alpha);
    p.animate(animDt);
    // Flash while invulnerable.
    p.model.root.visible = p.invulnerable <= 0 || Math.floor(p.invulnerable * 12) % 2 === 0;
    for (const n of this.npcs.npcs) n.sync(alpha, animDt);
    this.projectiles.sync(alpha);
    this.worldItems.update(animDt);
    // Lids keep moving while the loot view is open (the world behind it is paused).
    for (const c of this.map.containers) c.update(frameDt);

    // Camera: follow the (interpolated) player, lead a little towards the aim and travel direction.
    const base = this.riding ? this.riding.model.root.position : p.model.root.position;
    // The listener follows the player (as the camera does).
    this.sound.setListener(base);
    const c = CONFIG.camera;
    const lead = this.focusTarget.set(this.aim.x - base.x, 0, this.aim.z - base.z).multiplyScalar(c.aimLead);
    if (lead.length() > c.maxAimLead) lead.setLength(c.maxAimLead);
    if (this.riding) {
      const m = this.riding.motor;
      lead.x += Math.sin(m.heading) * m.speed * 0.18;
      lead.z += Math.cos(m.heading) * m.speed * 0.18;
    }
    lead.add(base).setY(0);
    rig.update(animDt, lead, engine.pixelate);
    this.updateSun();
    this.updateOccluders(animDt, base, p.mounted);
    this.coverDebug.update(animDt, this.targets.actors.map((a) => a.hitbox?.() ?? null), this.projectiles.live());
    engine.renderScene(this.scene);

    if (this.toast) {
      this.toast.left -= frameDt;
      if (this.toast.left <= 0) this.toast = null;
    }
    const w = p.weapon;
    const menuOpen = paused || this.ui.open;
    engine.hud.draw(frameDt, {
      weaponBar: {
        slots: p.equipment.weapons.map((item, i) => {
          const off = p.equipment.offHands[i];
          return { icon: item ? engine.icons.get(item.defId, 8) : null, offIcon: off ? engine.icons.get(off.defId, 8) : null, selected: p.active === i };
        }),
        drawn: p.drawn,
        ammo: w
          ? {
              loaded: w.right.ammo,
              magazine: w.right.def.magazine,
              reserve: w.reserve,
              left: w.left ? { loaded: w.left.ammo, magazine: w.left.def.magazine } : undefined,
            }
          : null,
        reloadProgress: p.reloadProgress,
        noAmmo: p.noAmmo > 0,
        stance: p.mounted ? null : p.crouched ? 'crouch' : 'stand',
      },
      toast: this.toast?.text ?? null,
      menuOpen,
      hp: p.hp,
      maxHp: CONFIG.player.maxHp,
      healProgress: p.healProgress,
      hurt: p.hurt,
      dead: p.dead,
      deathMessage: this.deathMessage,
      labels: menuOpen ? [] : this.worldLabels(),
      prompt: this.opts.tutorial && this.elapsed < 9 ? this.opts.tutorial : null,
      cursorX: this.cursor?.x ?? null,
      cursorY: this.cursor?.y ?? null,
      mounted: p.mounted,
      speedLabel: this.riding ? this.gaitLabel(this.riding) : null,
      pixelate: engine.pixelate,
      muted: engine.audio.muted,
    });
    const ctx = engine.hud.context;
    this.hooks.drawHud?.(ctx, engine.lowW, engine.lowH, paused ? 0 : frameDt);
    if (this.ui.open) this.ui.draw(ctx, engine.lowW, engine.lowH, engine.uiPointer);
    engine.debug.draw(frameDt, rig.view, this.riding ?? this.horses[0] ?? null, [
      `low-res ${engine.lowW}x${engine.lowH} x${engine.scale}  pixel ${engine.pixelate ? 'on' : 'off'}  palette ${engine.pixelPass.quantize ? 'on' : 'off'} [O]  outlines [L]`,
      `player ${p.pos.x.toFixed(1)}, ${p.pos.z.toFixed(1)}  ${p.mounted ? 'mounted' : 'on foot'}  ammo ${p.ammo}`,
      `draw calls ${engine.renderer.info.render.calls}  geometries ${engine.renderer.info.memory.geometries}  textures ${engine.renderer.info.memory.textures}`,
      `npcs ${this.npcs.npcs.map((n) => `${n.name.split(' ')[0]}:${n.mode}${n.mode !== 'routine' && n.alive ? ` ${n.calmTimer.toFixed(0)}s` : ''}`).join('  ')}`,
    ]);
  }

  private projected = new THREE.Vector3();
  /** World point → low-res HUD pixel. */
  project = (x: number, y: number, z: number): { x: number; y: number } => {
    const v = this.projected.set(x, y, z).project(this.engine.rig.view);
    return { x: ((v.x + 1) / 2) * this.engine.lowW, y: ((1 - v.y) / 2) * this.engine.lowH };
  };

  /** Name tag + prompt for the interaction target, speech bubbles, aim warnings. */
  private worldLabels(): WorldLabel[] {
    const out: WorldLabel[] = [];
    const t = this.interactTarget;
    for (const n of this.npcs.npcs) {
      if (!n.alive) continue; // corpses get a plain prompt below
      const r = n.model.root.getWorldPosition(this.labelPos);
      const head = this.project(r.x, r.y + 2.15, r.z);
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
    if (this.hooks.labels) out.push(...this.hooks.labels(this.project));
    return out;
  }

  private labelPos = new THREE.Vector3();

  /** Dither out buildings that sit between the camera and the player. */
  private updateOccluders(dt: number, base: THREE.Vector3, mounted: boolean): void {
    const rig = this.engine.rig;
    const back = rig.back;
    const exclude = this.engine.pixelPass.normalPassExclude;
    exclude.length = 0;
    const L = 40;
    for (const o of this.occluders) {
      let hidden = false;
      // Probe a few points on the character (feet, chest, head; wider when mounted).
      for (const [ox, oy] of mounted ? [[0, 0.6], [0, 2.4], [1, 1.4], [-1, 1.4]] : [[0, 0.3], [0, 1.0], [0, 1.8]]) {
        const ax = base.x + rig.right.x * ox;
        const az = base.z + rig.right.z * ox;
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

  private gaitLabel(h: Horse): string {
    const m = h.motor;
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
    const f = this.engine.rig.focus;
    const x = f.dot(this.lightRight);
    const y = f.dot(this.lightUp);
    const dx = Math.round(x / texel) * texel - x;
    const dy = Math.round(y / texel) * texel - y;
    const target = this.sun.target.position.copy(f).addScaledVector(this.lightRight, dx).addScaledVector(this.lightUp, dy);
    this.sun.position.copy(target).addScaledVector(this.sunDir, 80);
    this.sun.target.updateMatrixWorld();
  }

  /** Free everything this session created (geometries, materials, shadow map, preview target). */
  dispose(): void {
    this.sound.dispose();
    if (this.ui.open) this.ui.close();
    this.ui.dispose();
    this.sun.shadow.map?.dispose();
    disposeObject(this.scene);
    this.scene.clear();
    this.engine.pixelPass.unoutlined.length = 0;
    this.engine.pixelPass.normalPassExclude.length = 0;
    this.engine.input.clearPressed();
  }
}
