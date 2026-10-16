import type { QuestApi, QuestHooks } from './api';
import { QuestEventBus, type QuestEvent, type QuestEventType } from './events';
import type { LoadedPack, LoadReason } from './loader';
import {
  splitRef,
  type Action,
  type CatalogEntry,
  type Condition,
  type FailDef,
  type FlagValue,
  type QuestPack,
  type QuestState,
  type Ref,
  type SetupDef,
  type StepDef,
} from './types';

/** What the runtime needs from the game (the mode implements it; tests use a fake). */
export interface QuestWorld {
  /** The POI the player is on. */
  readonly poi: string;
  money(): number;
  giveMoney(amount: number): void;
  takeMoney(amount: number): boolean;
  /** How many of an item are in the player's bags. */
  countItem(item: string): number;
  /** Into the bags; whatever doesn't fit drops at the player's feet. Returns how many dropped. */
  giveItem(item: string, count: number): number;
  /** Out of the bags. Returns how many were taken. */
  takeItem(item: string, count: number): number;
  itemName(item: string): string;
  discovery(poi: string): 'visible' | 'hidden' | 'undiscovered';
  reveal(poi: string): void;
  revealPath(path: string): void;
  poiName(poi: string): string;
  toast(text: string): void;
  /** Is the player inside this named area (on the current POI)? */
  inArea(area: Ref): boolean;
  /** Put a step's setup into the running POI (`restore`: it was set up before the page reloaded). */
  setup(entry: SetupDef, info: { quest: string; key: string; restore: boolean }): void;
  /** Bring a quest NPC into the running POI (if it isn't there, or dead, already). */
  spawn(npc: Ref, quest: string): void;
  /** Take a quest NPC out, on whatever POI it is (also one that isn't loaded). */
  despawn(npc: Ref, quest: string): void;
  /** Setup keys of quest-placed items in the player's bags (they've been picked up). */
  heldKeys(): string[];
  /** A quest ended: its NPCs and (unless kept) items go, on every POI. */
  cleanup(pack: QuestPack): void;
  /** Open a pack dialog (dialog step). */
  startDialog?(quest: string, dialogId: string): void;
}

/** Quest data that belongs to a POI (plain, saved): what's been set up there, and its fate. */
export interface QuestPoiData {
  /** Setup entries applied here (`<quest>#<run>/<step>/<i>`). */
  setup: string[];
  /** Quest NPCs killed here (`<poi>:<id>`). */
  dead: string[];
  /** Setup items picked up / looted (their setup keys). */
  taken: string[];
  /** Quest NPCs spawned here by actions (setup spawns are in `setup`). */
  spawned: { quest: string; npc: Ref }[];
}

export interface QuestSaveData {
  quests: Record<string, QuestState>;
  flags: Record<string, FlagValue>;
  pois: Record<string, QuestPoiData>;
  /** Quest items in the player's bags (re-added after a reload). */
  held: Record<string, number>;
  /** Story mode: where the player was. */
  where?: { poi: string; exit: string | null };
}

export interface QuestRuntimeOptions {
  catalog: CatalogEntry[];
  world: QuestWorld;
  /** Pack access (the PackLoader). */
  packs: { get(id: string): LoadedPack | null; load(id: string, reason: LoadReason): Promise<LoadedPack | null> };
  saved?: QuestSaveData;
  /** Something changed that should be saved. */
  onChange?(): void;
}

const emptyPoi = (): QuestPoiData => ({ setup: [], dead: [], taken: [], spawned: [] });

/**
 * The quests of one playthrough: which are active, their current steps, counters, flags and
 * timers. It reacts to game events, runs pack actions and hooks, and keeps quest data per POI.
 * It belongs to the Playthrough, so it survives every trip between places.
 */
export class QuestRuntime {
  readonly states = new Map<string, QuestState>();
  flags: Record<string, FlagValue> = {};
  pois: Record<string, QuestPoiData> = {};
  readonly events = new QuestEventBus();
  private hooks = new Map<string, QuestHooks>();
  private hookListeners = new Map<string, (() => void)[]>();
  /** Setup applied while this page has been open (the rest has to be restored on entering). */
  private live = new Set<string>();
  /** Item counts last seen in the bags (to turn changes into itemAdded / itemRemoved). */
  private lastCounts = new Map<string, number>();
  /** Items the runtime itself is taking (not "lost"). */
  private taking = 0;
  readonly catalog: CatalogEntry[];
  private world: QuestWorld;
  private packs: QuestRuntimeOptions['packs'];

  constructor(private opts: QuestRuntimeOptions) {
    this.catalog = opts.catalog;
    this.world = opts.world;
    this.packs = opts.packs;
    const s = opts.saved;
    if (s) {
      for (const [id, q] of Object.entries(s.quests)) this.states.set(id, { ...q, timers: { ...q.timers } });
      this.flags = { ...s.flags };
      this.pois = JSON.parse(JSON.stringify(s.pois)) as Record<string, QuestPoiData>;
      for (const d of Object.values(this.pois)) d.spawned ??= [];
    }
  }

  // ------------------------------------------------------------------ queries

  entry(id: string): CatalogEntry | undefined {
    return this.catalog.find((e) => e.id === id);
  }

  pack(id: string): QuestPack | null {
    return this.packs.get(id)?.pack ?? null;
  }

  state(id: string): QuestState | null {
    return this.states.get(id) ?? null;
  }

  get active(): QuestState[] {
    return [...this.states.values()].filter((q) => q.status === 'active');
  }

  currentStep(id: string): StepDef | null {
    const q = this.states.get(id);
    const p = this.pack(id);
    return q && p && q.status === 'active' ? (p.steps[q.step] ?? null) : null;
  }

  /** Can it be taken now (in this mode, its requirements met, not running, not used up)? */
  available(id: string): boolean {
    const e = this.entry(id);
    if (!e) return false;
    const q = this.states.get(id);
    const pack = this.pack(id);
    if (q) {
      if (q.status === 'active') return false;
      if (q.status === 'completed' && !(pack?.repeatable ?? e.repeatable)) return false;
      if ((q.status === 'failed' || q.status === 'abandoned') && !(pack?.restartable ?? e.restartable)) return false;
    }
    return (e.requires ?? []).every((c) => this.check(c, id));
  }

  /** Quests whose giver stands on this POI (for proximity prefetch). */
  giversOn(poi: string): { quest: string; npc: string }[] {
    return this.catalog.filter((e) => splitRef(e.giver).poi === poi).map((e) => ({ quest: e.id, npc: splitRef(e.giver).id }));
  }

  /** Seconds left on a quest's running timers (the smallest), or null. */
  timeLeft(id: string): number | null {
    const t = Object.values(this.states.get(id)?.timers ?? {});
    return t.length ? Math.min(...t) : null;
  }

  /** The POI a step happens on (from its target), if it names one. */
  stepPoi(step: StepDef): string | null {
    switch (step.type) {
      case 'talk':
      case 'deliver':
        return splitRef(step.npc).poi;
      case 'goto':
        return step.poi ?? (step.area ? splitRef(step.area).poi : null);
      case 'defeat':
        return step.npcs?.length ? splitRef(step.npcs[0]).poi : (this.groupPoi(step) ?? null);
      case 'hunt':
        return step.poi ?? null;
      case 'collect': {
        const s = step.setup?.find((x) => x.type === 'placeItem');
        if (!s || s.type !== 'placeItem') return null;
        const r = 'container' in s ? s.container : 'area' in s ? s.area : s.corpse;
        return splitRef(r).poi;
      }
    }
  }

  private groupPoi(step: StepDef): string | undefined {
    if (step.type !== 'defeat' || !step.group) return undefined;
    for (const q of this.states.keys()) {
      const n = this.pack(q)?.npcs?.find((x) => x.group === step.group);
      if (n) return n.poi;
    }
    return undefined;
  }

  // ------------------------------------------------------------------ conditions

  check(c: Condition, quest?: string): boolean {
    const w = this.world;
    switch (c.type) {
      case 'quest': {
        const q = this.states.get(c.quest);
        let ok: boolean;
        if (c.status === 'available') ok = this.available(c.quest);
        else if (c.status === 'notStarted') ok = !q;
        else ok = q?.status === c.status;
        if (ok && c.step) ok = q?.status === 'active' && this.pack(c.quest)?.steps[q.step]?.id === c.step;
        return ok;
      }
      case 'hasItem':
        return w.countItem(c.item) >= (c.count ?? 1);
      case 'money':
        return w.money() >= c.atLeast;
      case 'flag': {
        const v = this.flags[c.flag];
        return c.value === undefined ? v !== undefined && v !== false : v === c.value;
      }
      case 'poi':
        return w.poi === c.poi;
      case 'discovered': {
        const d = w.discovery(c.poi);
        return c.state === 'known' ? d !== 'undiscovered' : d === c.state;
      }
      case 'not':
        return !this.check(c.cond, quest);
      case 'any':
        return c.conds.some((x) => this.check(x, quest));
    }
    void quest;
    return false;
  }

  checkAll(cs: readonly Condition[] | undefined, quest?: string): boolean {
    return (cs ?? []).every((c) => this.check(c, quest));
  }

  // ------------------------------------------------------------------ actions

  /** Run pack actions on behalf of `quest`. Returns false if one asked to end (a dialog). */
  run(actions: readonly Action[] | undefined, quest: string): boolean {
    let goOn = true;
    for (const a of actions ?? []) {
      const w = this.world;
      switch (a.type) {
        case 'startQuest':
          void this.start(a.quest);
          break;
        case 'advance':
          this.advance(a.quest ?? quest);
          break;
        case 'deliver':
          this.deliver(a.quest ?? quest);
          break;
        case 'failQuest':
          this.fail(a.quest ?? quest, a.reason);
          break;
        case 'giveItem':
          w.giveItem(a.item, a.count ?? 1);
          this.syncItems();
          break;
        case 'takeItem':
          this.take(a.item, a.count ?? 1);
          break;
        case 'giveMoney':
          w.giveMoney(a.amount);
          break;
        case 'takeMoney':
          w.takeMoney(a.amount);
          break;
        case 'setFlag':
          this.flags[a.flag] = a.value ?? true;
          this.changed();
          break;
        case 'spawn':
          this.spawnNpc(a.npc, quest);
          break;
        case 'despawn':
          this.despawnNpc(a.npc, quest);
          break;
        case 'reveal':
          w.reveal(a.poi);
          break;
        case 'revealPath':
          w.revealPath(a.path);
          break;
        case 'toast':
          w.toast(a.text);
          break;
        case 'openShop':
          break; // (the dialog panel handles it)
        case 'end':
          goOn = false;
          break;
      }
    }
    return goOn;
  }

  /** Take items out of the bags on the quest's behalf (not counted as lost). */
  private take(item: string, count: number): number {
    this.taking++;
    const n = this.world.takeItem(item, count);
    this.syncItems(true);
    this.taking--;
    return n;
  }

  // ------------------------------------------------------------------ lifecycle

  /** Take a quest (loads its pack first). Resolves to whether it started. */
  async start(id: string): Promise<boolean> {
    if (!this.available(id)) return false;
    // Already loaded (a dialog offering it): start right away, so the next line sees it running.
    const have = this.packs.get(id);
    if (have) return this.startNow(id, have);
    const lp = await this.packs.load(id, 'start');
    if (!lp || !this.available(id)) return false;
    return this.startNow(id, lp);
  }

  private startNow(id: string, lp: LoadedPack): boolean {
    const prev = this.states.get(id);
    const q: QuestState = { id, status: 'active', step: 0, counter: 0, timers: {}, completions: prev?.completions ?? 0 };
    this.states.set(id, q);
    this.attachHooks(id, lp);
    (lp.pack.fail ?? []).forEach((f, i) => {
      if (f.type === 'timer') q.timers[`quest:${i}`] = f.seconds;
    });
    this.syncItems(); // (what's in the bags now is the baseline for its item events)
    this.world.toast(`Quest started: ${lp.pack.title}`);
    this.hooks.get(id)?.onStart?.();
    this.changed();
    this.beginStep(id);
    return true;
  }

  /** A dialog choice was picked (or the dialog left: `end`): hooks and listeners hear of it. */
  dialogChoice(quest: string, dialogId: string, nodeId: string, choice: number | 'end', poi: string): void {
    if (choice !== 'end') this.hooks.get(quest)?.onDialogAction?.(dialogId, nodeId, choice);
    this.emit({ type: 'dialogAction', poi, quest, action: `${dialogId}/${nodeId}/${choice}` });
  }

    /** Complete the current step (debug, `advance` actions, hooks). */
  advance(id: string): void {
    const q = this.states.get(id);
    if (q?.status === 'active' && this.pack(id)) this.completeStep(id);
  }

  /** Hand over what the current deliver step asks for. False if the bags don't hold it. */
  deliver(id: string): boolean {
    const step = this.currentStep(id);
    if (step?.type !== 'deliver') return false;
    const need = step.count ?? 1;
    if (this.world.countItem(step.item) < need) return false;
    this.take(step.item, need);
    this.world.toast(`Delivered: ${this.world.itemName(step.item)}${need > 1 ? ` x${need}` : ''}`);
    this.completeStep(id);
    return true;
  }

  fail(id: string, reason: string): void {
    const q = this.states.get(id);
    if (q?.status !== 'active') return;
    q.status = 'failed';
    q.failReason = reason;
    q.timers = {};
    const pack = this.pack(id);
    this.world.toast(`Quest failed: ${pack?.title ?? id} - ${reason}`);
    this.hooks.get(id)?.onFail?.(reason);
    this.end(id);
  }

  /** Give up on a quest (from the journal): same cleanup as failing. */
  abandon(id: string): void {
    const q = this.states.get(id);
    if (q?.status !== 'active') return;
    q.status = 'abandoned';
    q.timers = {};
    this.end(id);
  }

  /** Debug: forget a quest entirely (cleaned up first if it was running). */
  reset(id: string): void {
    const q = this.states.get(id);
    if (q?.status === 'active') this.end(id);
    else if (this.pack(id)) this.cleanupData(id);
    this.states.delete(id);
    this.changed();
  }

  // ------------------------------------------------------------------ steps

  private beginStep(id: string): void {
    const q = this.states.get(id)!;
    const pack = this.pack(id)!;
    const step = pack.steps[q.step];
    q.counter = 0;
    for (const k of Object.keys(q.timers)) if (k.startsWith('step:')) delete q.timers[k];
    (step.fail ?? []).forEach((f, i) => {
      if (f.type === 'timer') q.timers[`step:${q.step}:${i}`] = f.seconds;
    });
    this.run(step.onStart, id);
    if (this.states.get(id)?.status !== 'active' || this.states.get(id)!.step !== pack.steps.indexOf(step)) return;
    this.hooks.get(id)?.onStepStart?.(step, q.step);
    this.applySetup(this.world.poi);
    this.changed();
    // Already done? (holding the items, standing in the place)
    this.checkStep(id);
  }

  /** Steps that can be satisfied by how things are (not by an event). */
  private checkStep(id: string): void {
    const q = this.states.get(id);
    const step = this.currentStep(id);
    if (!q || !step) return;
    const w = this.world;
    if (step.type === 'collect') {
      const need = step.count ?? 1;
      const have = Math.min(need, w.countItem(step.item));
      if (have > q.counter) {
        q.counter = have;
        w.toast(`${step.label ?? w.itemName(step.item)} ${have}/${need}`);
        this.changed();
      } else if (have < q.counter) {
        q.counter = have;
        this.changed();
      }
      if (have >= need) this.completeStep(id);
    } else if (step.type === 'goto') {
      const carrying = !step.carrying || w.countItem(step.carrying) > 0;
      const there = step.area ? splitRef(step.area).poi === w.poi && w.inArea(step.area) : step.poi === w.poi;
      if (carrying && there) {
        w.toast(`Reached ${step.label ?? w.poiName(step.poi ?? splitRef(step.area!).poi)}`);
        this.completeStep(id);
      }
    }
  }

  private completeStep(id: string): void {
    const q = this.states.get(id)!;
    const pack = this.pack(id)!;
    const index = q.step;
    const step = pack.steps[index];
    this.run(step.onComplete, id);
    if (this.states.get(id)?.status !== 'active' || q.step !== index) return; // (an action ended or moved it)
    this.hooks.get(id)?.onStepComplete?.(step, index);
    if (q.status !== 'active' || q.step !== index) return;
    q.step++;
    q.counter = 0;
    if (q.step >= pack.steps.length) {
      this.complete(id);
      return;
    }
    const next = pack.steps[q.step];
    this.world.toast(`Next: ${this.objectiveLine(next)}`);
    this.beginStep(id);
  }

  /** "Ride to the Ridge - The Ridge": the objective, and its POI when that's elsewhere and known. */
  objectiveLine(step: StepDef): string {
    const poi = this.stepPoi(step);
    if (!poi || poi === this.world.poi || this.world.discovery(poi) === 'undiscovered') return step.objective;
    const name = this.world.poiName(poi);
    return step.objective.includes(name) ? step.objective : `${step.objective} (${name})`;
  }

  private complete(id: string): void {
    const q = this.states.get(id)!;
    const pack = this.pack(id)!;
    q.status = 'completed';
    q.completions++;
    q.timers = {};
    const w = this.world;
    const got: string[] = [];
    const r = pack.rewards;
    if (r?.money) {
      w.giveMoney(r.money);
      got.push(`$${r.money}`);
    }
    for (const it of r?.items ?? []) {
      const n = it.count ?? 1;
      w.giveItem(it.item, n);
      got.push(`${w.itemName(it.item)}${n > 1 ? ` x${n}` : ''}`);
    }
    w.toast(`Quest complete: ${pack.title}${got.length ? ` (+${got.join(', ')})` : ''}`);
    this.hooks.get(id)?.onComplete?.();
    this.end(id);
  }

  /** A quest is over (any way): hooks off, its NPCs and items gone, its POI data dropped. */
  private end(id: string): void {
    for (const off of this.hookListeners.get(id) ?? []) off();
    this.hookListeners.delete(id);
    this.hooks.delete(id);
    this.cleanupData(id);
    this.syncItems(true);
    this.changed();
  }

  private cleanupData(id: string): void {
    const pack = this.pack(id);
    if (pack) {
      this.taking++;
      this.world.cleanup(pack);
      this.taking--;
    }
    const npcs = new Set((pack?.npcs ?? []).map((n) => `${n.poi}:${n.id}`));
    for (const d of Object.values(this.pois)) {
      d.setup = d.setup.filter((k) => !k.startsWith(`${id}#`));
      d.taken = d.taken.filter((k) => !k.startsWith(`${id}#`));
      d.dead = d.dead.filter((r) => !npcs.has(r));
      d.spawned = d.spawned.filter((x) => x.quest !== id);
    }
    for (const k of [...this.live]) if (k.startsWith(`${id}#`)) this.live.delete(k);
  }

  // ------------------------------------------------------------------ setup per POI

  private setupKey(id: string, run: number, step: number, i: number): string {
    return `${id}#${run}/${step}/${i}`;
  }

  /** Where a setup entry happens. */
  setupPoi(s: SetupDef): string {
    if (s.type === 'spawn') return splitRef(s.npc).poi;
    return splitRef('container' in s ? s.container : 'area' in s ? s.area : s.corpse).poi;
  }

  /**
   * Put each active quest's setup (current and earlier steps) into the POI being entered, once:
   * not again after leaving and coming back (the POI's state keeps it), but restored after a page
   * reload (`restore`), when the POI is rebuilt from scratch.
   */
  applySetup(poi: string): void {
    for (const q of this.active) {
      const pack = this.pack(q.id);
      if (!pack) continue;
      for (let si = 0; si <= q.step && si < pack.steps.length; si++) {
        (pack.steps[si].setup ?? []).forEach((entry, i) => {
          if (this.setupPoi(entry) !== poi) return;
          const key = this.setupKey(q.id, q.completions, si, i);
          if (this.live.has(key)) return;
          const data = (this.pois[poi] ??= emptyPoi());
          const restore = data.setup.includes(key);
          this.live.add(key);
          if (!restore) data.setup.push(key);
          this.world.setup(entry, { quest: q.id, key, restore });
        });
      }
    }
    // NPCs spawned here by actions, after a reload.
    for (const x of this.pois[poi]?.spawned ?? []) {
      const key = `${x.quest}#spawn/${x.npc}`;
      if (this.live.has(key) || this.states.get(x.quest)?.status !== 'active') continue;
      this.live.add(key);
      this.world.spawn(x.npc, x.quest);
    }
    this.changed();
  }

  /** A quest NPC comes into the world: now if you're on its POI, otherwise when you get there. */
  spawnNpc(npc: Ref, quest: string): void {
    const poi = splitRef(npc).poi;
    const d = (this.pois[poi] ??= emptyPoi());
    if (!d.spawned.some((x) => x.npc === npc && x.quest === quest)) d.spawned.push({ quest, npc });
    if (poi === this.world.poi) {
      this.live.add(`${quest}#spawn/${npc}`);
      this.world.spawn(npc, quest);
    }
    this.changed();
  }

  despawnNpc(npc: Ref, quest: string): void {
    const d = this.pois[splitRef(npc).poi];
    if (d) d.spawned = d.spawned.filter((x) => !(x.npc === npc && x.quest === quest));
    this.live.delete(`${quest}#spawn/${npc}`);
    this.world.despawn(npc, quest);
    this.changed();
  }

  /** A quest-placed item reached the bags: it won't be placed again (after a reload either). */
  markTakenKey(key: string): void {
    const m = /^(.+)#\d+\/(\d+)\/(\d+)$/.exec(key);
    const entry = m ? this.pack(m[1])?.steps[Number(m[2])]?.setup?.[Number(m[3])] : undefined;
    if (entry) this.markTaken(this.setupPoi(entry), key);
  }

  /** The game reports a placed setup item was picked up / looted (it isn't placed again). */
  markTaken(poi: string, key: string): void {
    const d = (this.pois[poi] ??= emptyPoi());
    if (!d.taken.includes(key)) d.taken.push(key);
    this.changed();
  }

  private isTakenKey(key: string): boolean {
    return Object.values(this.pois).some((d) => d.taken.includes(key));
  }

  isTaken(poi: string, key: string): boolean {
    return this.pois[poi]?.taken.includes(key) ?? false;
  }

  isDead(npc: Ref): boolean {
    return this.pois[splitRef(npc).poi]?.dead.includes(npc) ?? false;
  }

  /** Quest NPCs of active quests that should exist on a POI (spawned by setup or actions, alive). */
  questNpcRefs(quest: string): Set<string> {
    return new Set((this.pack(quest)?.npcs ?? []).map((n) => `${n.poi}:${n.id}`));
  }

  // ------------------------------------------------------------------ events

  /** A game event: every active quest's current step (and fail conditions) sees it. */
  emit(e: QuestEvent): void {
    if (e.type === 'npcKilled') this.recordDeath(e);
    if (e.type === 'poiEntered') this.applySetup(e.poi);
    for (const q of this.active) {
      const pack = this.pack(q.id);
      if (!pack) continue;
      if (this.failedBy(q.id, e)) continue;
      this.hooks.get(q.id)?.onEvent?.(e);
      if (e.type === 'poiEntered') this.hooks.get(q.id)?.onPoiEnter?.(e.poi);
      if (this.states.get(q.id)?.status === 'active') this.stepEvent(q.id, e);
    }
    this.events.emit(e);
  }

  private recordDeath(e: Extract<QuestEvent, { type: 'npcKilled' }>): void {
    const ref = `${e.poi}:${e.npc}`;
    for (const q of this.states.keys()) {
      if (!this.questNpcRefs(q).has(ref)) continue;
      const d = (this.pois[e.poi] ??= emptyPoi());
      if (!d.dead.includes(ref)) d.dead.push(ref);
      this.changed();
    }
  }

  private failedBy(id: string, e: QuestEvent): boolean {
    const q = this.states.get(id)!;
    const pack = this.pack(id)!;
    const step = pack.steps[q.step];
    const fails: FailDef[] = [...(pack.fail ?? []), ...(step?.fail ?? [])];
    for (const f of fails) {
      if (f.type === 'npcDies' && e.type === 'npcKilled' && `${e.poi}:${e.npc}` === f.npc) {
        this.fail(id, f.reason ?? 'Someone you needed was killed');
        return true;
      }
      if (f.type === 'itemLost' && e.type === 'itemRemoved' && !e.byQuest && e.item === f.item) {
        this.fail(id, f.reason ?? `You lost the ${this.world.itemName(f.item)}`);
        return true;
      }
    }
    return false;
  }

  private stepEvent(id: string, e: QuestEvent): void {
    const q = this.states.get(id)!;
    const step = this.currentStep(id);
    if (!step) return;
    const at = (ref: Ref, poi: string, local: string) => ref === `${poi}:${local}`;
    switch (step.type) {
      case 'talk':
        // (A talk through a dialog is finished by that dialog's `advance`.)
        if (e.type === 'talkedTo' && !step.dialog && at(step.npc, e.poi, e.npc)) this.completeStep(id);
        break;
      case 'goto':
        if ((e.type === 'poiEntered' && step.poi === e.poi && !step.area) || (e.type === 'areaEntered' && step.area && at(step.area, e.poi, e.area))) this.checkStep(id);
        else if (e.type === 'itemAdded' && step.carrying === e.item) this.checkStep(id);
        break;
      case 'defeat': {
        if (e.type !== 'npcKilled') break;
        const ref = `${e.poi}:${e.npc}`;
        const pack = this.pack(id)!;
        const hit = step.npcs ? step.npcs.includes(ref) : pack.npcs?.some((n) => n.group === step.group && `${n.poi}:${n.id}` === ref);
        if (!hit) break;
        const need = step.count ?? step.npcs?.length ?? pack.npcs?.filter((n) => n.group === step.group).length ?? 1;
        q.counter = Math.min(need, q.counter + 1);
        this.world.toast(`${step.label ?? 'Defeated'} ${q.counter}/${need}`);
        this.changed();
        if (q.counter >= need) this.completeStep(id);
        break;
      }
      case 'collect':
        if ((e.type === 'itemAdded' || e.type === 'itemRemoved') && e.item === step.item) this.checkStep(id);
        break;
      case 'hunt': {
        if (e.type !== 'animalKilled' || !e.byPlayer || !step.species.includes(e.species)) break;
        if (step.poi && e.poi !== step.poi) break;
        const need = step.count ?? 1;
        q.counter = Math.min(need, q.counter + 1);
        this.world.toast(`${step.label ?? 'Hunted'} ${q.counter}/${need}`);
        this.changed();
        if (q.counter >= need) this.completeStep(id);
        break;
      }
      case 'deliver':
        break; // (handed over in the dialog: `deliver` action)
    }
  }

  // ------------------------------------------------------------------ per frame

  /**
   * Time passes (play on any POI and the travel ride; not paused or on the world map): fail
   * timers run down. Item changes in the bags become events.
   */
  update(dt: number): void {
    for (const q of this.active) {
      for (const k of Object.keys(q.timers)) {
        q.timers[k] -= dt;
        if (q.timers[k] > 0) continue;
        const pack = this.pack(q.id);
        const [scope, a, b] = k.split(':');
        const def = scope === 'quest' ? pack?.fail?.[Number(a)] : pack?.steps[Number(a)]?.fail?.[Number(b)];
        this.fail(q.id, def?.reason ?? 'Time ran out');
        break;
      }
    }
    this.syncItems();
  }

  /** Items quests care about: their pack items and every item a step or fail condition names. */
  private trackedItems(): Set<string> {
    const out = new Set<string>();
    for (const q of this.active) {
      const pack = this.pack(q.id);
      if (!pack) continue;
      for (const it of pack.items ?? []) out.add(it.id);
      for (const s of pack.steps) {
        if (s.type === 'collect' || s.type === 'deliver') out.add(s.item);
        if (s.type === 'goto' && s.carrying) out.add(s.carrying);
        for (const f of s.fail ?? []) if (f.type === 'itemLost') out.add(f.item);
      }
      for (const f of pack.fail ?? []) if (f.type === 'itemLost') out.add(f.item);
    }
    return out;
  }

  /** Compare the bags with last time and emit itemAdded / itemRemoved for what changed. */
  syncItems(byQuest = this.taking > 0): void {
    const tracked = this.trackedItems();
    for (const id of [...this.lastCounts.keys()]) if (!tracked.has(id)) this.lastCounts.delete(id);
    for (const id of tracked) {
      const now = this.world.countItem(id);
      const before = this.lastCounts.get(id);
      this.lastCounts.set(id, now);
      if (before === undefined || before === now) continue;
      const poi = this.world.poi;
      if (now > before) {
        for (const k of this.world.heldKeys()) if (!this.isTakenKey(k)) this.markTakenKey(k);
        this.emit({ type: 'itemAdded', poi, item: id, count: now - before });
      }
      else this.emit({ type: 'itemRemoved', poi, item: id, count: before - now, byQuest });
    }
  }

  // ------------------------------------------------------------------ hooks

  private attachHooks(id: string, lp: LoadedPack): void {
    if (!lp.hooks || this.hooks.has(id)) return;
    this.hooks.set(id, lp.hooks(this.api(id)));
  }

  /** The narrow API a quest's hooks get. */
  api(id: string): QuestApi {
    const w = this.world;
    return {
      questId: id,
      state: () => this.states.get(id) ?? null,
      currentStep: () => this.currentStep(id),
      flag: (name) => this.flags[name],
      setFlag: (name, value = true) => {
        this.flags[name] = value;
        this.changed();
      },
      advance: () => this.advance(id),
      fail: (reason) => this.fail(id, reason),
      giveItem: (item, count = 1) => {
        w.giveItem(item, count);
        this.syncItems();
      },
      takeItem: (item, count = 1) => this.take(item, count),
      countItem: (item) => w.countItem(item),
      giveMoney: (n) => w.giveMoney(n),
      takeMoney: (n) => w.takeMoney(n),
      money: () => w.money(),
      spawn: (npc) => this.spawnNpc(npc, id),
      despawn: (npc) => this.despawnNpc(npc, id),
      startDialog: (dialogId) => w.startDialog?.(id, dialogId),
      toast: (text) => w.toast(text),
      poi: () => w.poi,
      reveal: (poi) => w.reveal(poi),
      revealPath: (path) => w.revealPath(path),
      timeLeft: () => this.timeLeft(id),
      on: (type: QuestEventType, fn) => {
        const off = this.events.on((e) => {
          if (e.type === type) fn(e);
        });
        const list = this.hookListeners.get(id) ?? [];
        list.push(off);
        this.hookListeners.set(id, list);
      },
    };
  }

  // ------------------------------------------------------------------ save

  /** After a save is loaded: fetch the active quests' packs, hook them up, give back held items. */
  async restore(held: Record<string, number> = {}): Promise<void> {
    await Promise.all(
      this.active.map(async (q) => {
        const lp = await this.packs.load(q.id, 'save');
        if (lp) this.attachHooks(q.id, lp);
      }),
    );
    for (const [item, n] of Object.entries(held)) {
      const have = this.world.countItem(item);
      if (n > have) this.world.giveItem(item, n - have);
    }
    this.lastCounts.clear();
    this.syncItems();
    this.applySetup(this.world.poi);
  }

  /** A pack loaded later (after a failed fetch): hook up its quest if it's running. */
  packLoaded(lp: LoadedPack): void {
    if (this.states.get(lp.pack.id)?.status === 'active') {
      this.attachHooks(lp.pack.id, lp);
      this.applySetup(this.world.poi);
    }
  }

  save(): QuestSaveData {
    const held: Record<string, number> = {};
    for (const q of this.active) {
      for (const it of this.pack(q.id)?.items ?? []) {
        const n = this.world.countItem(it.id);
        if (n > 0) held[it.id] = n;
      }
    }
    return {
      quests: Object.fromEntries([...this.states].map(([k, v]) => [k, { ...v, timers: { ...v.timers } }])),
      flags: { ...this.flags },
      pois: JSON.parse(JSON.stringify(this.pois)) as Record<string, QuestPoiData>,
      held,
    };
  }

  private changed(): void {
    this.opts.onChange?.();
  }
}
