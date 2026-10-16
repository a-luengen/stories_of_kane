import { QUEST_FORMAT_VERSION, type QuestCatalog, type QuestPack } from './types';

/** What a pack may refer to in the current mode's world. */
export interface ValidationContext {
  pois: ReadonlySet<string>;
  paths: ReadonlySet<string>;
  /** Items outside the pack (the game's own, or other loaded packs'). */
  itemExists(id: string): boolean;
}

export type Validated<T> = { ok: true; value: T } | { ok: false; errors: string[] };

const SHAPES = ['letter', 'key', 'pouch', 'box', 'badge', 'bottle', 'map', 'photo', 'star', 'ring'];
const MODES = ['story', 'sandbox'];
const MOODS = ['greet', 'warn', 'hostile', 'flee', 'calm'];
const STATUSES = ['active', 'completed', 'failed', 'abandoned', 'available', 'notStarted'];
const DISCOVERY = ['visible', 'hidden', 'undiscovered', 'known'];
const ID = /^[a-z0-9][a-z0-9-]*$/;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Collects errors as "quest "<id>": <path>: <problem>". Each check names the field it looked at;
 * a broken pack lists everything wrong with it at once.
 */
class Checker {
  readonly errors: string[] = [];
  constructor(private prefix: string) {}

  err(path: string, msg: string): void {
    this.errors.push(`${this.prefix}${path}: ${msg}`);
  }

  obj(v: unknown, path: string): v is Obj {
    if (isObj(v)) return true;
    this.err(path, 'must be an object');
    return false;
  }

  str(o: Obj, key: string, path: string, opt = false): string | undefined {
    const v = o[key];
    if (v === undefined && opt) return undefined;
    if (typeof v !== 'string' || v.length === 0) {
      this.err(`${path}.${key}`, opt ? 'must be a non-empty string if given' : 'missing (a non-empty string)');
      return undefined;
    }
    return v;
  }

  num(o: Obj, key: string, path: string, opt = false, min = 0): number | undefined {
    const v = o[key];
    if (v === undefined && opt) return undefined;
    if (typeof v !== 'number' || !Number.isFinite(v) || v < min) {
      this.err(`${path}.${key}`, `${opt ? 'if given, must' : 'must'} be a number ≥ ${min}`);
      return undefined;
    }
    return v;
  }

  bool(o: Obj, key: string, path: string): void {
    if (o[key] !== undefined && typeof o[key] !== 'boolean') this.err(`${path}.${key}`, 'must be true or false');
  }

  arr(o: Obj, key: string, path: string, opt = false): unknown[] {
    const v = o[key];
    if (v === undefined && opt) return [];
    if (!Array.isArray(v)) {
      this.err(`${path}.${key}`, opt ? 'must be an array if given' : 'missing (an array)');
      return [];
    }
    return v;
  }

  oneOf(o: Obj, key: string, path: string, options: readonly string[], opt = false): string | undefined {
    const v = o[key];
    if (v === undefined && opt) return undefined;
    if (typeof v !== 'string' || !options.includes(v)) {
      this.err(`${path}.${key}`, `must be one of ${options.join(', ')} (got ${JSON.stringify(v)})`);
      return undefined;
    }
    return v;
  }
}

/** Checks one pack against the format and the current mode's world. */
export function validatePack(raw: unknown, ctx: ValidationContext, expectedId?: string): Validated<QuestPack> {
  const id = isObj(raw) && typeof raw.id === 'string' ? raw.id : (expectedId ?? '?');
  const c = new Checker(`quest "${id}": `);
  if (!c.obj(raw, 'pack')) return { ok: false, errors: c.errors };
  const p = raw;

  if (p.formatVersion !== QUEST_FORMAT_VERSION) c.err('formatVersion', `must be ${QUEST_FORMAT_VERSION} (got ${JSON.stringify(p.formatVersion)})`);
  const pid = c.str(p, 'id', 'pack');
  if (pid && !ID.test(pid)) c.err('id', 'use lowercase letters, digits and dashes');
  if (pid && expectedId && pid !== expectedId) c.err('id', `must match its folder / catalog id "${expectedId}"`);
  c.str(p, 'title', 'pack');
  c.str(p, 'description', 'pack');
  c.bool(p, 'repeatable', 'pack');
  c.bool(p, 'restartable', 'pack');
  c.bool(p, 'hooks', 'pack');
  const modes = c.arr(p, 'modes', 'pack');
  if (modes.length === 0) c.err('modes', 'needs at least one of story, sandbox');
  modes.forEach((m, i) => {
    if (typeof m !== 'string' || !MODES.includes(m)) c.err(`modes[${i}]`, `must be story or sandbox (got ${JSON.stringify(m)})`);
  });

  // Things the pack itself defines.
  const packItems = new Set<string>();
  c.arr(p, 'items', 'pack', true).forEach((it, i) => {
    const path = `items[${i}]`;
    if (!c.obj(it, path)) return;
    const iid = c.str(it, 'id', path);
    if (iid) {
      if (packItems.has(iid)) c.err(`${path}.id`, `"${iid}" is defined twice`);
      else if (ctx.itemExists(iid)) c.err(`${path}.id`, `"${iid}" clashes with an existing item`);
      packItems.add(iid);
    }
    c.str(it, 'name', path);
    c.str(it, 'description', path);
    c.oneOf(it, 'shape', path, SHAPES);
    c.str(it, 'icon', path, true);
    if (it.icon !== undefined && typeof it.icon === 'string' && !/^[\w-]+\.png$/.test(it.icon)) c.err(`${path}.icon`, 'must be a file name like "poster.png" (in icons/)');
    if (it.size !== undefined) {
      if (c.obj(it.size, `${path}.size`)) {
        c.num(it.size, 'w', `${path}.size`, false, 1);
        c.num(it.size, 'h', `${path}.size`, false, 1);
      }
    }
    if (it.colors !== undefined && c.obj(it.colors, `${path}.colors`)) {
      for (const k of ['main', 'accent']) {
        const v = it.colors[k];
        if (v !== undefined && (typeof v !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(v))) c.err(`${path}.colors.${k}`, 'must be a colour like "#a33a2a"');
      }
    }
    for (const k of ['stackable', 'questItem', 'keepAfterQuest']) c.bool(it, k, path);
  });
  const packNpcs = new Set<string>();
  const groups = new Set<string>();
  c.arr(p, 'npcs', 'pack', true).forEach((n, i) => {
    const path = `npcs[${i}]`;
    if (!c.obj(n, path)) return;
    const nid = c.str(n, 'id', path);
    const poi = c.str(n, 'poi', path);
    if (poi && !ctx.pois.has(poi)) c.err(`${path}.poi`, `unknown POI "${poi}"`);
    if (nid && poi) {
      const ref = `${poi}:${nid}`;
      if (packNpcs.has(ref)) c.err(`${path}.id`, `"${ref}" is defined twice`);
      packNpcs.add(ref);
    }
    const g = c.str(n, 'group', path, true);
    if (g) groups.add(g);
    const sp = n.spawn;
    if (!Array.isArray(sp) || sp.length !== 2 || sp.some((v) => typeof v !== 'number' || !Number.isFinite(v))) c.err(`${path}.spawn`, 'must be [x, z]');
    c.oneOf(n, 'archetype', path, ['gunslinger', 'rifleman', 'shotgunner'], true);
    if (n.def !== undefined) c.obj(n.def, `${path}.def`);
    c.arr(n, 'carries', path, true).forEach((ci, j) => {
      if (!c.obj(ci, `${path}.carries[${j}]`)) return;
      item(ci, 'item', `${path}.carries[${j}]`);
      c.num(ci, 'count', `${path}.carries[${j}]`, true, 1);
    });
  });

  // ---- references
  function poiRef(o: Obj, key: string, path: string, opt = false): string | undefined {
    const v = c.str(o, key, path, opt);
    if (v !== undefined && !ctx.pois.has(v)) c.err(`${path}.${key}`, `unknown POI "${v}"`);
    return v;
  }
  function ref(o: Obj, key: string, path: string, opt = false): string | undefined {
    const v = c.str(o, key, path, opt);
    if (v === undefined) return undefined;
    const i = v.indexOf(':');
    if (i <= 0 || i === v.length - 1) {
      c.err(`${path}.${key}`, `"${v}" must be "<poi>:<id>"`);
      return undefined;
    }
    const poi = v.slice(0, i);
    if (!ctx.pois.has(poi)) c.err(`${path}.${key}`, `unknown POI "${poi}" in "${v}"`);
    return v;
  }
  function item(o: Obj, key: string, path: string): void {
    const v = c.str(o, key, path);
    if (v && !packItems.has(v) && !ctx.itemExists(v)) c.err(`${path}.${key}`, `unknown item "${v}"`);
  }

  function condition(v: unknown, path: string): void {
    if (!c.obj(v, path)) return;
    switch (v.type) {
      case 'quest':
        c.str(v, 'quest', path);
        c.oneOf(v, 'status', path, STATUSES);
        c.str(v, 'step', path, true);
        break;
      case 'hasItem':
        item(v, 'item', path);
        c.num(v, 'count', path, true, 1);
        break;
      case 'money':
        c.num(v, 'atLeast', path);
        break;
      case 'flag':
        c.str(v, 'flag', path);
        break;
      case 'poi':
        poiRef(v, 'poi', path);
        break;
      case 'discovered':
        poiRef(v, 'poi', path);
        c.oneOf(v, 'state', path, DISCOVERY);
        break;
      case 'not':
        condition(v.cond, `${path}.cond`);
        break;
      case 'any': {
        const list = c.arr(v, 'conds', path);
        if (list.length === 0) c.err(`${path}.conds`, 'needs at least one condition');
        list.forEach((x, i) => condition(x, `${path}.conds[${i}]`));
        break;
      }
      default:
        c.err(`${path}.type`, `unknown condition ${JSON.stringify(v.type)}`);
    }
  }
  const conditions = (o: Obj, key: string, path: string) => c.arr(o, key, path, true).forEach((v, i) => condition(v, `${path}.${key}[${i}]`));

  function action(v: unknown, path: string): void {
    if (!c.obj(v, path)) return;
    switch (v.type) {
      case 'startQuest':
        c.str(v, 'quest', path);
        break;
      case 'advance':
      case 'deliver':
        c.str(v, 'quest', path, true);
        break;
      case 'failQuest':
        c.str(v, 'quest', path, true);
        c.str(v, 'reason', path);
        break;
      case 'giveItem':
      case 'takeItem':
        item(v, 'item', path);
        c.num(v, 'count', path, true, 1);
        break;
      case 'giveMoney':
      case 'takeMoney':
        c.num(v, 'amount', path, false, 1);
        break;
      case 'setFlag':
        c.str(v, 'flag', path);
        break;
      case 'spawn':
      case 'despawn': {
        const r = ref(v, 'npc', path);
        if (r && !packNpcs.has(r)) c.err(`${path}.npc`, `"${r}" isn't one of the pack's npcs`);
        break;
      }
      case 'reveal':
        poiRef(v, 'poi', path);
        break;
      case 'revealPath': {
        const pth = c.str(v, 'path', path);
        if (pth && !ctx.paths.has(pth)) c.err(`${path}.path`, `unknown path "${pth}"`);
        break;
      }
      case 'toast':
        c.str(v, 'text', path);
        break;
      case 'openShop':
      case 'end':
        break;
      default:
        c.err(`${path}.type`, `unknown action ${JSON.stringify(v.type)}`);
    }
  }
  const actions = (o: Obj, key: string, path: string) => c.arr(o, key, path, true).forEach((v, i) => action(v, `${path}.${key}[${i}]`));

  function fail(v: unknown, path: string): void {
    if (!c.obj(v, path)) return;
    c.str(v, 'reason', path, true);
    switch (v.type) {
      case 'npcDies':
        ref(v, 'npc', path);
        break;
      case 'itemLost':
        item(v, 'item', path);
        break;
      case 'timer':
        c.num(v, 'seconds', path, false, 1);
        break;
      default:
        c.err(`${path}.type`, `unknown fail condition ${JSON.stringify(v.type)}`);
    }
  }

  function setup(v: unknown, path: string): void {
    if (!c.obj(v, path)) return;
    if (v.type === 'spawn') {
      const r = ref(v, 'npc', path);
      if (r && !packNpcs.has(r)) c.err(`${path}.npc`, `"${r}" isn't one of the pack's npcs`);
    } else if (v.type === 'placeItem') {
      item(v, 'item', path);
      c.num(v, 'count', path, true, 1);
      const where = ['container', 'area', 'corpse'].filter((k) => v[k] !== undefined);
      if (where.length !== 1) c.err(path, 'needs exactly one of container, area, corpse');
      else ref(v, where[0], path);
    } else c.err(`${path}.type`, `unknown setup ${JSON.stringify(v.type)} (spawn, placeItem)`);
  }

  // ---- giver, steps, rewards, fail
  ref(p, 'giver', 'pack');
  const steps = c.arr(p, 'steps', 'pack');
  if (steps.length === 0) c.err('steps', 'needs at least one step');
  const stepIds = new Set<string>();
  steps.forEach((s, i) => {
    const path = `steps[${i}]`;
    if (!c.obj(s, path)) return;
    const sid = c.str(s, 'id', path);
    if (sid && stepIds.has(sid)) c.err(`${path}.id`, `"${sid}" is used twice`);
    if (sid) stepIds.add(sid);
    c.str(s, 'objective', path);
    c.str(s, 'label', path, true);
    switch (s.type) {
      case 'talk': {
        ref(s, 'npc', path);
        const d = c.str(s, 'dialog', path, true);
        const dialogs = Array.isArray(p.dialogs) ? p.dialogs.filter(isObj).map((x) => x.id) : [];
        if (d && !dialogs.includes(d)) c.err(`${path}.dialog`, `no dialog "${d}" in the pack`);
        break;
      }
      case 'deliver':
        ref(s, 'npc', path);
        item(s, 'item', path);
        c.num(s, 'count', path, true, 1);
        break;
      case 'goto':
        if (s.area === undefined && s.poi === undefined) c.err(path, 'goto needs an area or a poi');
        ref(s, 'area', path, true);
        poiRef(s, 'poi', path, true);
        if (s.carrying !== undefined) item(s, 'carrying', path);
        break;
      case 'defeat': {
        const npcs = c.arr(s, 'npcs', path, true);
        npcs.forEach((n, j) => {
          if (typeof n !== 'string') c.err(`${path}.npcs[${j}]`, 'must be "<poi>:<id>"');
          else ref({ n }, 'n', `${path}.npcs[${j}]`);
        });
        const g = c.str(s, 'group', path, true);
        if (g && !groups.has(g)) c.err(`${path}.group`, `no pack npc is in group "${g}"`);
        if (!g && npcs.length === 0) c.err(path, 'defeat needs npcs or a group');
        c.num(s, 'count', path, true, 1);
        break;
      }
      case 'collect':
        item(s, 'item', path);
        c.num(s, 'count', path, true, 1);
        break;
      default:
        c.err(`${path}.type`, `unknown step type ${JSON.stringify(s.type)} (talk, deliver, goto, defeat, collect)`);
    }
    c.arr(s, 'setup', path, true).forEach((v, j) => setup(v, `${path}.setup[${j}]`));
    actions(s, 'onStart', path);
    actions(s, 'onComplete', path);
    c.arr(s, 'fail', path, true).forEach((v, j) => fail(v, `${path}.fail[${j}]`));
  });
  c.arr(p, 'fail', 'pack', true).forEach((v, j) => fail(v, `fail[${j}]`));
  if (p.rewards !== undefined && c.obj(p.rewards, 'rewards')) {
    c.num(p.rewards, 'money', 'rewards', true);
    c.arr(p.rewards, 'items', 'rewards', true).forEach((v, i) => {
      if (!c.obj(v, `rewards.items[${i}]`)) return;
      item(v, 'item', `rewards.items[${i}]`);
      c.num(v, 'count', `rewards.items[${i}]`, true, 1);
    });
  }

  // ---- dialogs
  c.arr(p, 'dialogs', 'pack', true).forEach((d, i) => {
    const path = `dialogs[${i}]`;
    if (!c.obj(d, path)) return;
    c.str(d, 'id', path);
    ref(d, 'npc', path);
    conditions(d, 'if', path);
    const nodes = c.arr(d, 'nodes', path);
    const ids = new Set(nodes.filter(isObj).map((n) => n.id));
    const start = c.str(d, 'start', path);
    if (start && !ids.has(start)) c.err(`${path}.start`, `no node "${start}"`);
    nodes.forEach((n, j) => {
      const np = `${path}.nodes[${j}]`;
      if (!c.obj(n, np)) return;
      c.str(n, 'id', np);
      c.str(n, 'text', np);
      c.str(n, 'speaker', np, true);
      c.oneOf(n, 'mood', np, MOODS, true);
      c.arr(n, 'choices', np, true).forEach((ch, k) => {
        const cp = `${np}.choices[${k}]`;
        if (!c.obj(ch, cp)) return;
        c.str(ch, 'text', cp);
        c.bool(ch, 'showLocked', cp);
        conditions(ch, 'if', cp);
        actions(ch, 'do', cp);
        if (ch.next !== undefined && (typeof ch.next !== 'string' || !ids.has(ch.next))) c.err(`${cp}.next`, `no node ${JSON.stringify(ch.next)}`);
      });
    });
  });

  return c.errors.length ? { ok: false, errors: c.errors } : { ok: true, value: p as unknown as QuestPack };
}

/** Checks the catalog; entries for other modes aren't checked against this world. */
export function validateCatalog(raw: unknown, ctx: Pick<ValidationContext, 'pois'>, mode: string): Validated<QuestCatalog> {
  const c = new Checker('quest catalog: ');
  if (!c.obj(raw, 'index')) return { ok: false, errors: c.errors };
  if (raw.formatVersion !== QUEST_FORMAT_VERSION) c.err('formatVersion', `must be ${QUEST_FORMAT_VERSION} (got ${JSON.stringify(raw.formatVersion)})`);
  const seen = new Set<string>();
  c.arr(raw, 'quests', 'index').forEach((e, i) => {
    const path = `quests[${i}]`;
    if (!c.obj(e, path)) return;
    const id = c.str(e, 'id', path);
    if (id && !ID.test(id)) c.err(`${path}.id`, 'use lowercase letters, digits and dashes');
    if (id && seen.has(id)) c.err(`${path}.id`, `"${id}" is listed twice`);
    if (id) seen.add(id);
    c.str(e, 'title', path);
    c.num(e, 'version', path, false, 1);
    c.bool(e, 'storyStart', path);
    c.bool(e, 'repeatable', path);
    c.bool(e, 'restartable', path);
    const modes = c.arr(e, 'modes', path);
    if (modes.length === 0 || modes.some((m) => typeof m !== 'string' || !MODES.includes(m))) c.err(`${path}.modes`, 'must list story and/or sandbox');
    const giver = c.str(e, 'giver', path);
    if (giver && modes.includes(mode)) {
      const poi = giver.split(':')[0];
      if (!giver.includes(':')) c.err(`${path}.giver`, `"${giver}" must be "<poi>:<npc>"`);
      else if (!ctx.pois.has(poi)) c.err(`${path}.giver`, `unknown POI "${poi}"`);
    }
    c.arr(e, 'requires', path, true).forEach((r, j) => {
      if (!c.obj(r, `${path}.requires[${j}]`)) return;
      if (typeof r.type !== 'string') c.err(`${path}.requires[${j}].type`, 'missing');
    });
  });
  return c.errors.length ? { ok: false, errors: c.errors } : { ok: true, value: raw as unknown as QuestCatalog };
}
