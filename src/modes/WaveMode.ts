import * as THREE from 'three';
import { MountedAI, routeDriver } from '../ai/MountedAI';
import { NavGrid } from '../ai/NavGrid';
import { CONFIG } from '../config';
import type { Engine } from '../core/Engine';
import type { ModeHost, ModeOptions } from '../core/GameStateManager';
import { Session } from '../core/Session';
import { banditAppearance, ENEMIES } from '../data/enemies';
import type { NpcDef } from '../data/types';
import { resolveWeapon } from '../data/weapons';
import { Horse } from '../entities/Horse';
import type { Npc } from '../entities/Npc';
import { ammoItemFor } from '../items/ItemDef';
import { createItem } from '../items/ItemInstance';
import { drawWaveHud, type WaveHudState } from '../ui/WaveHud';
import { dirToYaw } from '../util/math';
import { OUTPOST_HORSE_STOP, OUTPOST_MERCHANT, OUTPOST_SPAWNS, buildOutpostMap } from '../world/maps/waveOutpost';
import { Economy } from './Economy';
import type { GameMode } from './GameMode';
import { Merchant } from './Merchant';
import { ReviveTracker } from './Revive';
import { WaveDirector, type DirectorEvent, type EnemySpawn } from './WaveDirector';

interface Enemy {
  npc: Npc;
  wave: number;
  spawn: EnemySpawn;
}

interface LooseHorse {
  horse: Horse;
  /** Seconds before it bolts. */
  left: number;
  leaving: boolean;
}

/** Wave survival on the outpost map: waves of outlaws, a merchant between waves, one revive. */
export class WaveMode implements GameMode {
  readonly kind = 'wave' as const;
  session!: Session;
  readonly economy = new Economy();
  readonly revive = new ReviveTracker();
  director: WaveDirector;
  private enemies: Enemy[] = [];
  private horseNav!: NavGrid;
  /** Horses that belong to the player (never leave). */
  private playerHorses = new Set<Horse>();
  private loose: LooseHorse[] = [];
  private merchant!: Merchant;
  private kills = 0;
  private time = 0;
  private banner: { text: string; sub?: string; left: number } | null = null;
  private pops: { text: string; age: number }[] = [];
  private nextId = 1;
  private over = false;

  constructor(
    private engine: Engine,
    private host: ModeHost,
    opts: ModeOptions,
  ) {
    this.director = new WaveDirector(opts.startWave ?? 1);
  }

  init(): void {
    this.session = new Session(
      this.engine,
      {
        map: buildOutpostMap,
        npcs: [],
        regen: false,
        tutorial: 'SURVIVE THE WAVES   G BANDAGE   C CROUCH   TRADE AT THE WAGON BETWEEN WAVES',
      },
      {
        onPlayerDeath: () => this.onPlayerDeath(),
        onNpcDeath: (npc, byPlayer) => this.onNpcDeath(npc, byPlayer),
        step: (dt) => this.step(dt),
        interactables: () => [this.merchant],
        drawHud: (ctx, W, H, dt) => this.drawHud(ctx, W, H, dt),
      },
    );
    const s = this.session;
    // Starting kit: the standard revolver + 2 boxes, plus one bandage, $0.
    s.player.inventory.placeAnywhere(createItem('bandage', 1));
    this.horseNav = new NavGrid(s.world, s.map.half, 0.5, 0.85);
    this.merchant = new Merchant(OUTPOST_MERCHANT.stand.clone(), OUTPOST_MERCHANT.facing, () =>
      s.openUi(() =>
        s.ui.openShop({
          economy: this.economy,
          // During a break you're shopping for the next wave.
          wave: () => this.director.wave + (this.director.phase === 'intermission' ? 1 : 0),
          title: this.merchant.name,
          merchantName: this.merchant.name,
        }),
      ),
    );
    s.scene.add(this.merchant.root);
    this.handle(this.director.start());
  }

  // ------------------------------------------------------------------------------ frame

  update(dt: number): void {
    const s = this.session;
    // Revive sequence runs on real time (slow motion included).
    const r = this.revive.update(dt);
    if (r === 'getUp') this.getUp();
    if (r === 'gameover' && !this.over) {
      this.over = true;
      this.host.gameOver({
        wavesSurvived: Math.max(0, this.director.wave - (this.director.phase === 'intermission' ? 0 : 1)),
        waveReached: this.director.wave,
        kills: this.kills,
        dollarsEarned: this.economy.earned,
        timeSurvived: this.time,
      });
      return;
    }
    s.timeScale = this.revive.timeScale;
    if (this.engine.input.consume('Enter') && !s.ui.open && this.director.phase === 'intermission') this.handle(this.director.skipIntermission());
    s.frame(dt);
    this.merchant.animate(s.ui.open ? 0 : dt, s.player.pos);
  }

  render(dt: number): void {
    this.session.render(dt, true);
  }

  dispose(): void {
    this.session.dispose();
  }

  // ------------------------------------------------------------------------------ simulation

  private get alive(): Enemy[] {
    return this.enemies.filter((e) => e.npc.alive);
  }

  private step(dt: number): void {
    this.time += dt;
    this.handle(this.director.update(dt, this.alive.length));
    this.merchant.open = this.director.phase === 'intermission' && !this.session.player.dead;
    if (this.banner) {
      this.banner.left -= dt;
      if (this.banner.left <= 0) this.banner = null;
    }
    for (const p of this.pops) p.age += dt;
    this.pops = this.pops.filter((p) => p.age < 1.6);
    this.updateLooseHorses(dt);
  }

  private handle(events: DirectorEvent[]): void {
    for (const e of events) {
      switch (e.type) {
        case 'countdown':
          this.showBanner(`WAVE ${e.wave}`, 'GET READY', CONFIG.wave.countdown);
          break;
        case 'waveStart':
          this.showBanner(`WAVE ${e.wave}`, `${e.count} OUTLAWS INCOMING`, 2);
          break;
        case 'spawn':
          this.spawnEnemy(e.enemy, e.wave);
          break;
        case 'waveCleared':
          this.economy.earn(e.bonus);
          this.pop(`+$${e.bonus}`);
          this.showBanner('WAVE CLEARED', `+$${e.bonus}   E: TRADE AT THE WAGON`, CONFIG.wave.clearedBanner);
          break;
        case 'horseArrives':
          this.horseArrives();
          break;
        case 'despawnCorpses':
          this.despawnCorpses(e.upToWave);
          break;
      }
    }
  }

  private showBanner(text: string, sub: string | undefined, seconds: number): void {
    this.banner = { text, sub, left: seconds };
  }

  private pop(text: string): void {
    this.pops.unshift({ text, age: 0 });
    this.pops.length = Math.min(this.pops.length, 4);
  }

  /** A pass the player can't see and isn't close to (else the farthest one). */
  private spawnPoint(): THREE.Vector3 {
    const p = this.session.player.pos;
    const view = this.engine.rig.view;
    const ok = OUTPOST_SPAWNS.filter((s) => {
      if (s.distanceTo(p) < CONFIG.wave.minSpawnDistance) return false;
      const v = s.clone().setY(1).project(view);
      return Math.abs(v.x) > 1.05 || Math.abs(v.y) > 1.05;
    });
    if (ok.length > 0) return ok[Math.floor(Math.random() * ok.length)];
    return [...OUTPOST_SPAWNS].sort((a, b) => b.distanceTo(p) - a.distanceTo(p))[0];
  }

  private spawnEnemy(spawn: EnemySpawn, wave: number): void {
    const s = this.session;
    const a = ENEMIES[spawn.archetype];
    const weaponId = spawn.mounted ? (a.mountedWeapon ?? a.weapon) : a.weapon;
    const ammo = ammoItemFor(resolveWeapon(weaponId)!.ammoType);
    const boxes = a.ammoBoxes[0] + Math.floor(Math.random() * (a.ammoBoxes[1] - a.ammoBoxes[0] + 1));
    const at = this.spawnPoint();
    const def: NpcDef = {
      id: `outlaw-${this.nextId++}`,
      attitude: 'hostile',
      defendsOthers: false,
      appearance: banditAppearance(a),
      weapon: weaponId,
      inventory: ammo ? Array.from({ length: boxes }, () => ({ item: ammo.id })) : [],
      spawn: [at.x, at.z],
      routine: { kind: 'idle', at: [at.x, at.z], facing: dirToYaw(-at.x, -at.z) },
      hp: Math.round(a.hp * spawn.hp),
      inaccuracy: a.inaccuracy * spawn.accuracy,
      reactionTime: a.reactionTime * spawn.reaction,
      tactics: a.tactics,
      respawns: false,
    };
    const npc = s.npcs.add(def);
    s.registerNpc(npc);
    this.enemies.push({ npc, wave, spawn });
    s.particles.burst('dust', at.clone().setY(0.2), undefined, 1.5);
    if (spawn.mounted) {
      const horse = s.addHorse(new Horse(), at, dirToYaw(-at.x, -at.z));
      npc.mountOn(horse);
      const ai = new MountedAI(this.horseNav);
      horse.driver = (dt) => ai.drive(dt, horse, s.player.pos);
    }
  }

  private onNpcDeath(npc: Npc, byPlayer: boolean): void {
    const e = this.enemies.find((x) => x.npc === npc);
    if (!e) return;
    const horse = npc.mount;
    if (byPlayer) {
      this.kills++;
      const reward = this.economy.killReward(e.spawn.archetype, !!horse);
      this.economy.earn(reward);
      this.pop(`+$${reward}`);
    }
    if (horse) {
      // The rider falls off; the horse slows to a stop, waits, then bolts.
      npc.dismount(this.session.npcs.group);
      horse.driver = null;
      this.loose.push({ horse, left: CONFIG.wave.riderlessStay, leaving: false });
    }
  }

  private despawnCorpses(upToWave: number): void {
    const s = this.session;
    this.enemies = this.enemies.filter((e) => {
      if (e.npc.alive || e.wave > upToWave) return true;
      s.npcs.remove(e.npc);
      s.targets.removeActor(e.npc);
      return false;
    });
  }

  private horseArrives(): void {
    const s = this.session;
    const from = OUTPOST_SPAWNS[4];
    const h = s.addHorse(new Horse(), from, dirToYaw(-from.x, -from.z));
    this.playerHorses.add(h);
    const drive = routeDriver(this.horseNav, [OUTPOST_HORSE_STOP.x, OUTPOST_HORSE_STOP.z], 1.5);
    h.driver = (dt) => drive(dt, h);
    this.showBanner('A HORSE HAS ARRIVED!', 'E TO MOUNT', 3.5);
  }

  /** Riderless horses: stand ~10 s (mountable), then ride off through the nearest pass. */
  private updateLooseHorses(dt: number): void {
    const s = this.session;
    this.loose = this.loose.filter((l) => {
      const h = l.horse;
      if (s.riding === h || this.playerHorses.has(h)) {
        // Claimed by the player: theirs to keep.
        this.playerHorses.add(h);
        return false;
      }
      if (!l.leaving) {
        l.left -= dt;
        if (l.left <= 0) {
          l.leaving = true;
          const exit = [...OUTPOST_SPAWNS].sort((a, b) => a.distanceTo(h.pos) - b.distanceTo(h.pos))[0];
          const out = exit.clone().multiplyScalar(1.15);
          const drive = routeDriver(this.horseNav, [out.x, out.z], null);
          h.driver = (d) => drive(d, h);
        }
        return true;
      }
      if (Math.abs(h.pos.x) > s.map.half - 0.9 || Math.abs(h.pos.z) > s.map.half - 0.9) {
        s.removeHorse(h);
        return false;
      }
      return true;
    });
  }

  // ------------------------------------------------------------------------------ death & revive

  onPlayerDeath(): void {
    const outcome = this.revive.onDeath();
    this.session.deathMessage = outcome === 'revive' ? 'DOWN... BUT NOT OUT' : 'YOU DIED';
  }

  /** Back up with half health; nearby outlaws are knocked back; brief invulnerability. */
  private getUp(): void {
    const s = this.session;
    const r = CONFIG.wave.revive;
    s.revivePlayer(r.hp);
    s.player.invulnerable = r.invulnerable;
    const p = s.player.pos;
    for (const e of this.alive) {
      const n = e.npc;
      if (n.mount) continue;
      const dx = n.pos.x - p.x;
      const dz = n.pos.z - p.z;
      const d = Math.hypot(dx, dz);
      if (d > r.knockbackRadius) continue;
      const k = r.knockback * (1 - d / r.knockbackRadius) + 1;
      const pt = { x: n.pos.x + (dx / Math.max(d, 0.01)) * k, z: n.pos.z + (dz / Math.max(d, 0.01)) * k };
      s.world.resolveCircle(pt, CONFIG.npc.radius);
      n.pos.set(pt.x, 0, pt.z);
      n.prevPos.copy(n.pos);
      n.stagger();
    }
    s.particles.burst('dust', p.clone().setY(0.2), undefined, 2.5);
    this.engine.rig.addTrauma(0.6);
    this.showBanner('BACK ON YOUR FEET', 'NO MORE REVIVES', 2);
  }

  // ------------------------------------------------------------------------------ HUD

  private drawHud(ctx: CanvasRenderingContext2D, W: number, H: number, dt: number): void {
    const d = this.director;
    const alive = this.alive;
    const state: WaveHudState = {
      wave: d.wave,
      phase: d.phase,
      timer: d.timer,
      enemiesLeft: alive.length + d.pending,
      wallet: this.economy.wallet,
      reviveTokens: this.revive.tokens,
      banner: this.banner ? { text: this.banner.text, sub: this.banner.sub, alpha: Math.min(1, this.banner.left * 2) } : null,
      pops: this.pops,
      // Point at the last few outlaws, and always at ones that ran dry and went to ground.
      pointers: d.phase === 'active'
        ? alive.filter((e) => alive.length + d.pending <= 3 || e.npc.mode === 'flee' || e.npc.mode === 'hide').map((e) => this.session.project(e.npc.pos.x, 1.2, e.npc.pos.z))
        : [],
    };
    this.hudTime += dt;
    drawWaveHud(ctx, W, H, state, this.hudTime);
  }

  private hudTime = 0;
}
