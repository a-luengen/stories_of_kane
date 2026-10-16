import * as THREE from 'three';
import { NavGrid } from '../ai/NavGrid';
import { CONFIG } from '../config';
import type { Engine } from '../core/Engine';
import { insideExit, Playthrough, type PoiSession } from '../core/Playthrough';
import { Session, type SessionHooks } from '../core/Session';
import { MERCHANT_SHOPS } from '../data/shop';
import { pathThrough, poiById, type ExitDef, type PoiDef, type WorldDef } from '../data/world';
import { TargetSystem } from '../entities/Targets';
import type { Interactable } from '../Interaction';
import { hasItemDef, itemDef } from '../items/ItemDef';
import { drawText, drawTextScaled, textWidth, textWidthScaled } from '../ui/PixelFont';
import { UI } from '../ui/theme';
import type { WorldLabel } from '../ui/Hud';
import { drawWalletPlate } from '../ui/WaveHud';
import type { Reveal } from '../world/Discovery';
import { PoiMapRegistry, type PoiMap } from '../world/poiMaps';
import { loadDiscovery, saveDiscovery } from '../world/discoveryStore';
import { routePoints, type Hop } from '../world/routes';
import { gameplay } from '../settings/gameplay';
import { WorldMapScreen } from '../ui/worldmap/WorldMapScreen';
import type { LootContainer } from '../world/Container';
import { WorldDebug, type WorldDebugAction } from '../ui/worldmap/WorldDebug';
import { QuestDebug, type QuestDebugAction } from '../ui/QuestDebug';
import { PREFETCH_RADIUS, QuestSystem } from '../quests/QuestSystem';
import { gameQuestWorld } from './questWorld';
import { DialogRunner, dialogsFor, type OfferedDialog } from '../quests/dialog';
import { DialogPanel } from '../ui/DialogPanel';
import type { JournalHost } from '../ui/JournalPanel';
import { journalEntries } from '../quests/journal';
import { splitRef } from '../quests/types';
import type { Npc } from '../entities/Npc';
import type { TravelResult } from '../core/Playthrough';
import { Economy, type Purse } from './Economy';
import type { GameMode } from './GameMode';

const TUTORIAL = 'WASD MOVE  CLICK SHOOT  R RELOAD  C CROUCH  1-3 WEAPONS  E USE  I INVENTORY';

/** Wait for the next frame (or a moment, if frames are paused in a hidden tab). */
const nextFrame = () =>
  new Promise<void>((resolve) => {
    const t = setTimeout(resolve, 50);
    requestAnimationFrame(() => {
      clearTimeout(t);
      resolve();
    });
  });

/** A way out of the map: stand in its zone and press E (works from the saddle too). */
class ExitPoint implements Interactable {
  readonly position: THREE.Vector3;
  readonly range: number;
  readonly priority = 10;
  readonly promptHeight = 0.4;
  readonly fromSaddle = true;

  constructor(
    readonly def: ExitDef,
    private mode: FrontierMode,
  ) {
    this.position = new THREE.Vector3(def.at[0], 0, def.at[1]);
    this.range = Math.hypot(def.half[0], def.half[1]) + 0.5;
  }

  get label(): string {
    const dest = this.mode.destinationOf(this.def.id);
    return dest && this.mode.knows(dest.id) ? `Travel to ${dest.name}` : 'Follow the trail';
  }

  canInteract(): boolean {
    return this.mode.canUseExits && insideExit(this.mode.playerPos, this.def);
  }

  interact(): void {
    this.mode.startTravel(this.def.id);
  }
}

/**
 * loading: the first place is loading (black) · play · map: the world map is open (M) ·
 * leaving: fading into the map · riding: the ride along the trail while the next place loads ·
 * arriving: fading from the map (or black, at the start) into the place · debug: the world debug panel (0).
 */
type Phase = 'loading' | 'play' | 'map' | 'leaving' | 'riding' | 'arriving' | 'debug' | 'dialog';

const MAP_HINT = 'M / ESC CLOSE   DRAG TO PAN   HOVER A PLACE FOR DETAILS';

/** Why fast travel didn't happen, for the map's notice line. */
const FAST_REFUSAL: Record<string, string> = {
  disabled: 'FAST TRAVEL IS OFF (PAUSE MENU - GAMEPLAY)',
  notVisited: "YOU HAVEN'T BEEN THERE YET",
  noPath: 'NO KNOWN TRAIL LEADS THERE',
  combat: "YOU CAN'T LEAVE IN THE MIDDLE OF A FIGHT",
  busy: '',
  here: 'YOU ARE HERE',
};

/** What makes a frontier mode the sandbox or the story. */
export interface FrontierConfig {
  kind: 'sandbox' | 'story';
  world: WorldDef;
  startingDollars: number;
  /** Story: the place and exit to continue from (from the quest save). */
  resume?: { poi: string; exit: string | null };
  /** Story: a new game (its starting quest begins by itself). */
  newGame?: boolean;
}

/**
 * Free roaming across a world's places — the sandbox frontier (town, ranch, canyon) or the story
 * — with the townsfolk, quests, and respawn on death. A Playthrough carries the player, purse,
 * horse and quests from map to map; travel fades out, loads the next place, and fades in at the
 * matching exit.
 */
export class FrontierMode implements GameMode {
  readonly kind: 'sandbox' | 'story';
  readonly world: WorldDef;
  readonly playthrough: Playthrough;
  /** One pocket for the whole frontier: start with a little cash, earn more by selling. */
  readonly purse: Purse;
  private respawnLeft = -1;
  private phase: Phase = 'loading';
  /** 0 = clear … 1 = black. */
  private fade = 1;
  private travelTo: PoiDef | null = null;
  private exits: ExitPoint[] = [];
  /** The exit zone the player stands in (to notice walking into one). */
  private inZone: string | null = null;
  private banner: { text: string; sub: string; left: number } | null = null;
  private firstSession = true;
  readonly map: WorldMapScreen;
  /** The fade from black (first arrival) or from the map (after a ride). */
  private fadeFrom: 'black' | 'map' = 'black';
  private notice: { text: string; left: number } | null = null;
  /** The journey under way (resolves when the next place is ready). */
  private journey: { start: () => Promise<TravelResult>; hops: Hop[]; dest: PoiDef; arrived: boolean } | null = null;
  /** 0: the world debug panel, and the exit zones drawn on the ground (in this place). */
  private debug: WorldDebug;
  /** 7: the quest debug panel (shares the debug phase with the world debug). */
  private questDebug: QuestDebug;
  private debugView: 'world' | 'quests' = 'world';
  /** This playthrough's quests (the sandbox offers only quests marked for it). */
  readonly quests: QuestSystem;
  /** Messages waiting their turn (they survive switching POIs). */
  private toasts: string[] = [];
  /** Named areas the player stands in (to notice entering one). */
  private inAreas = new Set<string>();
  private proximityLeft = 0;
  /** The conversation on screen (phase 'dialog'). */
  private dialog: DialogPanel | null = null;
  private showZones = false;
  private zones: THREE.Group | null = null;

  constructor(
    private engine: Engine,
    cfg: FrontierConfig,
  ) {
    this.kind = cfg.kind;
    this.world = cfg.world;
    this.purse = { dollars: cfg.startingDollars, earned: 0 };
    this.playthrough = new Playthrough(this.world, new PoiMapRegistry(), (poi, map) => this.buildSession(poi, map), {
      purse: this.purse,
      discovery: loadDiscovery(this.world.mode),
      at: cfg.resume,
    });
    this.playthrough.onReveal = (r, all) => {
      saveDiscovery(this.world.mode, all);
      this.announce(r);
      for (const x of r) if (x.kind === 'poi' && x.state !== 'undiscovered') this.quests.emit({ type: 'poiDiscovered', poi: x.id, state: x.state });
    };
    this.quests = new QuestSystem({
      mode: cfg.kind,
      world: this.world,
      game: gameQuestWorld({ playthrough: this.playthrough, purse: this.purse, session: () => this.session, quests: () => this.quests.runtime, toast: (t) => this.toast(t) }),
    });
    this.playthrough.quests = this.quests;
    this.questDebug = new QuestDebug(this.quests);
    this.map = new WorldMapScreen(this.world, () => this.playthrough.discovery, () => this.playthrough.poi);
    this.debug = new WorldDebug(this.world, () => this.showZones);
    // A new story: its starting quest(s) begin by themselves once the catalog is in.
    if (cfg.newGame) {
      void this.quests.whenReady().then(() => {
        const rt = this.quests.runtime;
        for (const e of rt?.catalog ?? []) if (e.storyStart) void rt!.start(e.id);
      });
    }
  }

  /** The world map (or the ride) covers the game: world sounds hold. */
  get paused(): boolean {
    return this.phase === 'map' || this.phase === 'riding' || this.phase === 'debug' || this.phase === 'dialog';
  }

  /** Esc closes the world map (or the debug panel). */
  escape(): boolean {
    if (this.phase === 'dialog') {
      this.dialog?.runner.end();
      this.dialog = null;
      this.phase = 'play';
      return true;
    }
    if (this.phase !== 'map' && this.phase !== 'debug') return false;
    this.phase = 'play';
    return true;
  }

  get session(): Session | null {
    return this.playthrough.session as Session | null;
  }

  init(): void {
    void this.playthrough.start().then(() => {
      this.fadeFrom = 'black';
      this.fade = 1;
      this.arrived(this.playthrough.here);
    });
  }

  // ------------------------------------------------------------------ the running map

  /** Build a place's session over several frames (so a ride or fade never stutters). */
  private async buildSession(poi: PoiDef, map: PoiMap): Promise<PoiSession> {
    await nextFrame();
    const targets = new TargetSystem();
    const world = map.build(targets, poi.exits);
    dropForeignMapScraps(world.containers, this.world);
    await nextFrame();
    const nav = await NavGrid.build(world.collision, world.half, nextFrame);
    await nextFrame();
    const hooks: SessionHooks = {
      onPlayerDeath: () => this.onPlayerDeath(),
      step: (dt) => this.step(dt),
      interactables: () => this.exits,
      labels: (project) => this.signLabels(project),
      drawHud: (ctx, W, H) => this.drawHud(ctx, W, H),
      study: (poi) => this.study(poi),
      onNpcDeath: (npc) => this.quests.emit({ type: 'npcKilled', poi: poi.id, npc: npc.def.id }),
      onContainerOpened: (c) => this.quests.emit({ type: 'containerOpened', poi: poi.id, container: c.id }),
      npcAdded: (npc) => this.wireNpc(s, npc, poi.id),
      journal: this.journalHost(),
    };
    const s = new Session(
      this.engine,
      { world, targets, nav, npcs: map.npcs, animals: map.animals, player: this.playthrough.player, spawnHorse: false, regen: true, tutorial: this.firstSession ? TUTORIAL : null },
      hooks,
    );
    this.firstSession = false;
    this.openMerchants(s);
    this.giveDirections(s);
    for (const npc of s.npcs.npcs) this.wireNpc(s, npc, poi.id);
    this.inAreas.clear();
    this.exits = poi.exits.map((e) => new ExitPoint(e, this));
    this.zones = exitZones(poi.exits);
    this.zones.visible = this.showZones;
    s.scene.add(this.zones);
    this.engine.pixelPass.unoutlined.push(this.zones);
    this.inZone = null;
    return s;
  }

  /** Quests hear of talking to an NPC, and quest dialog takes over E when there is some. */
  private wireNpc(s: Session, npc: Npc, poi: string): void {
    npc.onTalk = (n) => this.quests.emit({ type: 'talkedTo', poi, npc: n.def.id });
    npc.onQuestTalk = (n) => this.openDialog(s, n, poi);
    npc.hasQuestTalk = () => this.offersOf(poi, npc).length > 0;
  }

  /** NPCs with a `shop` trade instead of talking; each sells (and buys) only their own kind of goods. */
  private openMerchants(s: Session): void {
    for (const npc of s.npcs.npcs) {
      const shop = npc.def.shop ? MERCHANT_SHOPS[npc.def.shop] : undefined;
      if (!shop) continue;
      const economy = new Economy(shop.stock, this.purse);
      npc.onTrade = (n) =>
        s.openUi(() =>
          s.ui.openShop({
            economy,
            wave: () => Infinity,
            title: shop.title,
            merchantName: n.name,
            buys: (item) => shop.buys.includes(itemDef(item.defId).category),
          }),
        );
    }
  }

  /**
   * NPCs with `hints` tell you the way to places you haven't been (and they go on your map) — only
   * to places in this mode's world (the story's gunsmith knows of no Two Spurs Ranch).
   */
  private giveDirections(s: Session): void {
    for (const npc of s.npcs.npcs) {
      if (!npc.def.hints) continue;
      npc.wantsHint = (poi) => inWorld(this.world, poi) && this.playthrough.discovery.poi(poi) !== 'visible';
      npc.onHint = (_, poi) => this.playthrough.learn(poi);
    }
  }

  /** A map scrap was studied. */
  private study(poi: string): void {
    if (!inWorld(this.world, poi)) {
      this.toast('The map shows nowhere you know');
      return;
    }
    if (this.playthrough.learn(poi).length === 0) this.toast(`Nothing new: ${poiById(this.world, poi).name} is on your map`);
  }

  // ------------------------------------------------------------------ exits & travel

  get playerPos(): THREE.Vector3 {
    return this.playthrough.player.pos;
  }

  get canUseExits(): boolean {
    return this.phase === 'play' && !this.playthrough.player.dead;
  }

  destinationOf(exit: string): PoiDef | null {
    const r = pathThrough(this.world, this.playthrough.poi, exit);
    return r ? poiById(this.world, r.to.poi) : null;
  }

  knows(poi: string): boolean {
    return this.playthrough.discovery.isKnown(poi);
  }

  /** E in an exit zone: fade into the world map, ride the trail while the other end loads. */
  startTravel(exit: string): void {
    const why = this.playthrough.refusal(exit);
    if (why === 'combat') {
      this.session?.showToast("You can't leave in the middle of a fight!");
      return;
    }
    const hops = this.playthrough.planExit(exit);
    if (why || !hops) return;
    this.setOff(hops, () => this.playthrough.travel(exit));
  }

  /** Clicking a place on the map: fast travel there (if it's on and possible). */
  private tryFastTravel(poi: PoiDef): void {
    const why = this.playthrough.fastRefusal(poi.id, gameplay.fastTravel);
    if (why) {
      if (FAST_REFUSAL[why]) this.notice = { text: FAST_REFUSAL[why], left: 2.5 };
      return;
    }
    this.setOff(this.playthrough.planFast(poi.id)!, () => this.playthrough.fastTravel(poi.id, true));
  }

  private setOff(hops: Hop[], start: () => Promise<TravelResult>): void {
    const dest = poiById(this.world, hops[hops.length - 1].to.poi);
    this.travelTo = dest;
    this.journey = { start, hops, dest, arrived: false };
    // From the map (fast travel) the ride starts at once; from the game, fade into the map first.
    if (this.phase === 'map') this.ride();
    else {
      this.fade = 0;
      this.phase = 'leaving';
    }
  }

  /** The ride: the rider follows the trail on the map while the next place loads. */
  private ride(): void {
    const j = this.journey!;
    this.phase = 'riding';
    this.map.startRide(routePoints(j.hops), j.dest.id, () => j.arrived, this.engine.lowW, this.engine.lowH);
    j.start().then(
      (r) => {
        j.arrived = true;
        if (!r.ok) this.map.ride = null; // (refused after all: back to where we were)
      },
      (err) => {
        console.error('[travel]', err);
        j.arrived = true;
        this.map.ride = null;
      },
    );
  }

  private arrived(poi: PoiDef): void {
    // The story remembers where you are (and the exit you came in by) to continue from there.
    if (this.kind === 'story') {
      this.quests.where = { poi: this.playthrough.poi, exit: this.playthrough.arrivedAt };
      this.quests.save();
    }
    this.phase = 'arriving';
    this.banner = { text: poi.name.toUpperCase(), sub: poi.description.toUpperCase(), left: 3.5 };
  }

  /** "Map updated: …" for each place newly heard of (or, failing that, a trail newly known). */
  private announce(r: Reveal[]): void {
    const name = (id: string) => poiById(this.world, id).name;
    const places = r.filter((x) => x.kind === 'poi' && x.state === 'hidden').map((x) => name(x.id));
    const trails = r
      .filter((x) => x.kind === 'path')
      .map((x) => {
        const p = this.world.paths.find((q) => q.id === x.id)!;
        return `trail to ${name(p.from.poi === this.playthrough.poi ? p.to.poi : p.from.poi)}`;
      });
    const news = places.length ? places : trails;
    if (news.length) this.toast(`Map updated: ${news.join(', ')}`);
  }

  // ------------------------------------------------------------------ world debug (0)

  /** 0 / 7: open a debug panel (the other key switches panels; the same key closes). */
  private toggleDebug(view: 'world' | 'quests'): void {
    if (this.phase === 'debug' && this.debugView === view) this.phase = 'play';
    else if (this.phase === 'debug' || (this.phase === 'play' && !this.session?.ui.open)) {
      this.phase = 'debug';
      this.debugView = view;
    }
  }

  private questDebugAction(a: QuestDebugAction): void {
    const rt = this.quests.runtime;
    if (!rt) return;
    switch (a.kind) {
      case 'start':
        void rt.start(a.quest).then((ok) => {
          if (!ok) this.toast(rt.available(a.quest) ? "Couldn't load it" : 'Not available');
        });
        break;
      case 'advance':
        rt.advance(a.quest);
        break;
      case 'fail':
        rt.fail(a.quest, 'Failed from the debug panel');
        break;
      case 'reset':
        rt.reset(a.quest);
        break;
      case 'resetSave':
        this.quests.resetAll();
        this.toast('Quest saves reset');
        break;
    }
  }

  // ------------------------------------------------------------------ the journal

  /** The QUESTS tab: every quest taken, worded for where you are and what you know. */
  private journalHost(): JournalHost {
    const pt = this.playthrough;
    return {
      entries: () => {
        const rt = this.quests.runtime;
        if (!rt) return [];
        return journalEntries(rt, {
          poi: pt.poi,
          poiName: (poi) => poiById(this.world, poi).name,
          discovery: (poi) => pt.discovery.poi(poi),
          itemName: (id) => (hasItemDef(id) ? itemDef(id).name : id),
          npcName: (ref) => {
            const { poi, id } = splitRef(ref);
            return poi === pt.poi ? (this.session?.npcs.npcs.find((n) => n.def.id === id)?.name ?? null) : null;
          },
        });
      },
      abandon: (id) => {
        this.quests.runtime?.abandon(id);
        this.toast(`Quest abandoned: ${this.quests.runtime?.pack(id)?.title ?? id}`);
      },
    };
  }

  // ------------------------------------------------------------------ quest dialogs

  private offersOf(poi: string, npc: Npc): OfferedDialog[] {
    const rt = this.quests.runtime;
    return rt && npc.alive ? dialogsFor(rt, `${poi}:${npc.def.id}`) : [];
  }

  /**
   * E on an NPC with quest dialog: the conversation opens (and pauses the game) instead of the
   * greeting, hint or shop. Merchants keep a Trade choice. False: nothing to talk about.
   */
  private openDialog(s: Session, npc: Npc, poi: string): boolean {
    const rt = this.quests.runtime;
    const offers = this.offersOf(poi, npc);
    if (!rt || offers.length === 0 || this.phase !== 'play') return false;
    const runner = new DialogRunner(rt, offers, {
      npcName: npc.name,
      greeting: npc.lines.greet[0] ?? 'Howdy.',
      merchant: !!npc.def.shop,
      poi,
      openShop: () => npc.onTrade(npc),
    });
    this.dialog = new DialogPanel(runner, (line) => s.sound.speakInDialog(npc, line.text, line.mood));
    this.phase = 'dialog';
    return true;
  }

  // ------------------------------------------------------------------ messages & quest events

  /** Queue a message: shown one after another, also across POI switches. */
  toast(text: string): void {
    if (this.toasts[this.toasts.length - 1] !== text) this.toasts.push(text);
  }

  /** Hand the next queued message to the running place when it's free. */
  private feedToasts(): void {
    const s = this.session;
    if (!s || s.toastShowing || this.toasts.length === 0) return;
    if (this.phase !== 'play' && this.phase !== 'arriving') return;
    s.showToast(this.toasts.shift()!, 2.5);
  }

  /** Each step of play: named areas entered, and quest givers close enough to fetch their packs. */
  private questStep(dt: number): void {
    const s = this.session;
    if (!s) return;
    const poi = this.playthrough.poi;
    const p = this.playerPos;
    for (const a of s.map.areas ?? []) {
      const inside = p.x >= a.minX && p.x <= a.maxX && p.z >= a.minZ && p.z <= a.maxZ;
      if (inside && !this.inAreas.has(a.id)) this.quests.emit({ type: 'areaEntered', poi, area: a.id });
      if (inside) this.inAreas.add(a.id);
      else this.inAreas.delete(a.id);
    }
    this.proximityLeft -= dt;
    if (this.proximityLeft > 0) return;
    this.proximityLeft = 0.5;
    const givers = this.quests.giversOn(poi);
    if (givers.length === 0) return;
    for (const n of s.npcs.npcs) {
      if (givers.includes(n.def.id) && n.alive && n.pos.distanceTo(p) <= PREFETCH_RADIUS) this.quests.nearNpc(poi, n.def.id);
    }
  }

  private debugAction(a: WorldDebugAction): void {
    const p = this.playthrough;
    switch (a.kind) {
      case 'reveal':
        p.revealAll();
        this.toast('Map updated: everything');
        break;
      case 'reset':
        p.resetDiscovery();
        this.toast('Discovery reset');
        break;
      case 'zones':
        this.showZones = !this.showZones;
        if (this.zones) this.zones.visible = this.showZones;
        break;
      case 'teleport': {
        if (a.poi === p.poi) {
          void p.teleport(a.poi, a.exit);
          this.phase = 'play';
          break;
        }
        this.phase = 'loading';
        p.teleport(a.poi, a.exit).then(
          (r) => {
            if (!r.ok) {
              this.phase = 'play';
              return;
            }
            this.fadeFrom = 'black';
            this.fade = 1;
            this.arrived(p.here);
          },
          (err) => {
            console.error('[teleport]', err);
            this.phase = 'play';
          },
        );
        break;
      }
    }
  }

  // ------------------------------------------------------------------ frame

  onPlayerDeath(): void {
    this.respawnLeft = CONFIG.player.respawnTime;
  }

  /** Death → short pause → respawn at this place's spawn with everyone calmed down. */
  private step(dt: number): void {
    const s = this.session;
    if (!s) return;
    this.questStep(dt);
    if (this.banner) {
      this.banner.left -= dt;
      if (this.banner.left <= 0) this.banner = null;
    }
    // Walking into an exit's zone: you learn where it leads.
    const zone = this.exits.find((e) => insideExit(this.playerPos, e.def))?.def.id ?? null;
    if (zone && zone !== this.inZone) this.playthrough.exitEntered(zone);
    this.inZone = zone;
    if (this.respawnLeft < 0) return;
    this.respawnLeft -= dt;
    if (this.respawnLeft <= 0) {
      this.respawnLeft = -1;
      s.revivePlayer(1, s.map.playerSpawn.clone());
      s.npcs.calmAll();
    }
  }

  update(dt: number): void {
    const s = this.session;
    const e = this.engine;
    const input = e.input;
    const fadeRate = dt / CONFIG.world.travelFade;
    if (this.notice) {
      this.notice.left -= dt;
      if (this.notice.left <= 0) this.notice = null;
    }
    // M: the world map (not over an inventory / shop screen). 0: world debug.
    if (input.consume('KeyM')) this.toggleMap();
    if (input.consume('Digit0')) this.toggleDebug('world');
    if (input.consume('Digit7')) this.toggleDebug('quests');
    // Quest timers run in play on any POI and during the ride (not paused, on the map or in a panel).
    const ticking = this.phase === 'play' || this.phase === 'leaving' || this.phase === 'riding' || this.phase === 'arriving';
    if (ticking && !s?.ui.open) this.quests.update(dt);
    else if (s) this.quests.sync();

    switch (this.phase) {
      case 'loading':
        break;
      case 'play':
        s?.frame(dt);
        break;
      case 'map': {
        s?.render(dt, true);
        const ptr = e.pointer();
        const clicked = this.map.update(dt, ptr, input.mouseDown, e.lowW, e.lowH);
        if (clicked) this.tryFastTravel(clicked);
        break;
      }
      case 'debug': {
        s?.render(dt, true);
        const ptr = e.pointer();
        if (this.debugView === 'quests') {
          const a = ptr.pressed ? this.questDebug.hit(ptr.x, ptr.y) : null;
          if (a) this.questDebugAction(a);
        } else {
          const a = ptr.pressed ? this.debug.hit(ptr.x, ptr.y, e.lowW, e.lowH) : null;
          if (a) this.debugAction(a);
        }
        break;
      }
      case 'dialog': {
        s?.render(dt, true);
        const d = this.dialog;
        if (!d) {
          this.phase = 'play';
          break;
        }
        let digit: number | null = null;
        for (let i = 1; i <= 9; i++) if (input.consume(`Digit${i}`) && digit === null) digit = i - 1;
        const skip = ['KeyE', 'Space', 'Enter'].map((k) => input.consume(k)).some(Boolean);
        d.update(dt, e.pointer(), { digit, skip });
        if (d.ended) {
          this.dialog = null;
          if (this.phase === 'dialog') this.phase = 'play';
        }
        break;
      }
      case 'leaving':
        s?.render(dt, true);
        this.fade = Math.min(1, this.fade + fadeRate);
        if (this.fade >= 1) this.ride();
        break;
      case 'riding': {
        const ptr = e.pointer();
        this.map.update(dt, ptr, input.mouseDown, e.lowW, e.lowH);
        // E or a click skips the rest once the place is ready.
        if (input.consume('KeyE') || ptr.pressed) this.map.skipRide();
        if (this.journey?.arrived && (this.map.rideDone || !this.map.ride)) {
          const where = this.playthrough.here;
          this.journey = null;
          this.map.ride = null;
          this.fadeFrom = 'map';
          this.fade = 1;
          this.arrived(where);
        }
        break;
      }
      case 'arriving':
        s?.frame(dt);
        this.fade = Math.max(0, this.fade - fadeRate);
        if (this.fade <= 0) this.phase = 'play';
        break;
    }
    this.feedToasts();
    this.drawOverlay();
  }

  /** Open / close the world map. */
  toggleMap(): boolean {
    if (this.phase === 'map') {
      this.phase = 'play';
      return true;
    }
    if (this.phase !== 'play' || this.session?.ui.open) return false;
    this.phase = 'map';
    this.map.focus(this.engine.lowW, this.engine.lowH);
    return true;
  }

  render(dt: number): void {
    if (this.phase !== 'riding') this.session?.render(dt, true);
    this.drawOverlay();
  }

  /** The world map, the fades around it, or black while the first place loads. */
  private drawOverlay(): void {
    const ctx = this.engine.hud.context;
    const W = this.engine.lowW;
    const H = this.engine.lowH;
    const e = this.engine;
    if (this.phase === 'loading' || !this.session) {
      ctx.fillStyle = 'rgb(20,13,9)';
      ctx.fillRect(0, 0, W, H);
      drawText(ctx, 'LOADING...', Math.round((W - textWidth('LOADING...')) / 2), Math.round(H / 2), UI.sand);
      return;
    }
    if (this.phase === 'dialog') {
      this.dialog?.draw(ctx, W, H, e.uiPointer);
      return;
    }
    if (this.phase === 'debug') {
      if (this.debugView === 'quests') this.questDebug.draw(ctx, W, H, e.uiPointer, this.playthrough.poi);
      else this.debug.draw(ctx, W, H, e.uiPointer);
      return;
    }
    const hint = this.notice?.text ?? (this.phase === 'riding' ? this.rideHint() : MAP_HINT);
    if (this.phase === 'map' || this.phase === 'riding') this.map.draw(ctx, W, H, this.phase === 'map' ? e.uiPointer : null, 1, hint);
    else if (this.phase === 'leaving') this.map.draw(ctx, W, H, null, this.fade, '');
    else if (this.phase === 'arriving' && this.fade > 0) {
      if (this.fadeFrom === 'map') this.map.draw(ctx, W, H, null, this.fade, '');
      else {
        ctx.fillStyle = `rgba(20,13,9,${this.fade.toFixed(3)})`;
        ctx.fillRect(0, 0, W, H);
      }
    }
  }

  private rideHint(): string {
    const to = this.travelTo ? `RIDING TO ${this.travelTo.name.toUpperCase()}` : '';
    return this.journey?.arrived ? `${to}   E / CLICK: SKIP` : to;
  }

  /** Wallet, and the place's name for a few seconds after arriving. */
  private drawHud(ctx: CanvasRenderingContext2D, W: number, H: number): void {
    drawWalletPlate(ctx, W, this.purse.dollars);
    const b = this.banner;
    if (!b) return;
    const alpha = Math.min(1, b.left / 0.8, (3.5 - b.left) / 0.4 + 0.2);
    ctx.globalAlpha = Math.max(0, alpha);
    const s = 2;
    const y = Math.round(H * 0.2);
    drawTextScaled(ctx, b.text, Math.round((W - textWidthScaled(b.text, s)) / 2), y, UI.cream, s, UI.ink);
    drawText(ctx, b.sub, Math.round((W - textWidth(b.sub)) / 2), y + 16, UI.sand, UI.ink);
    ctx.globalAlpha = 1;
  }

  /** Trail signs name where they lead ("???" for places not yet known of). */
  private signLabels(project: (x: number, y: number, z: number) => { x: number; y: number }): WorldLabel[] {
    const s = this.session;
    if (!s) return [];
    const out: WorldLabel[] = [];
    for (const sign of s.map.exitSigns) {
      if (sign.pos.distanceTo(this.playerPos) > 14) continue;
      const dest = this.destinationOf(sign.exit);
      const text = dest && this.knows(dest.id) ? dest.name : '???';
      const at = project(sign.pos.x, sign.pos.y + 0.3, sign.pos.z);
      out.push({ kind: 'name', text, x: at.x, y: at.y });
    }
    return out;
  }

  dispose(): void {
    this.playthrough.dispose();
  }
}

/** Debug: each exit's zone as a translucent patch on the ground. */
function exitZones(exits: readonly ExitDef[]): THREE.Group {
  const g = new THREE.Group();
  // Drawn over everything (like the cover debug), with an outline.
  const fill = new THREE.MeshBasicMaterial({ color: 0xf7d774, transparent: true, opacity: 0.3, depthTest: false, depthWrite: false });
  const edge = new THREE.LineBasicMaterial({ color: 0xf7d774, depthTest: false });
  for (const e of exits) {
    const plane = new THREE.PlaneGeometry(e.half[0] * 2, e.half[1] * 2);
    const m = new THREE.Mesh(plane, fill);
    const line = new THREE.LineSegments(new THREE.EdgesGeometry(plane), edge);
    for (const o of [m, line]) {
      o.rotation.x = -Math.PI / 2;
      o.position.set(e.at[0], 0.08, e.at[1]);
      o.renderOrder = 10;
      g.add(o);
    }
  }
  return g;
}

const inWorld = (w: WorldDef, poi: string) => w.pois.some((p) => p.id === poi);

/**
 * Maps are shared between modes (the story's town is the sandbox's): a map scrap of a place this
 * world doesn't have (the gulch, in the story) is taken out of the containers that would hold it.
 */
export function dropForeignMapScraps(containers: readonly LootContainer[], world: WorldDef): void {
  for (const c of containers) {
    c.extras = c.extras.filter((id) => {
      const poi = itemDef(id).reveals;
      return !poi || inWorld(world, poi);
    });
  }
}
