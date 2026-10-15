import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NavGrid } from '../ai/NavGrid';
import { CONFIG } from '../config';
import { ANIMALS, type AnimalSpawn } from '../data/animals';
import { ITEMS } from '../data/items';
import { NPCS } from '../data/npcs';
import { SAMPLES } from '../data/soundManifest';
import { SOUNDS } from '../data/sounds';
import type { Vec2 } from '../data/types';
import { poiById, SANDBOX_WORLD } from '../data/world';
import { Rng } from '../util/math';
import { buildPlainsMap, PLAINS_ANIMALS } from '../world/maps/desertPlains';
import { buildGulchMap, CAMP, GULCH_ANIMALS } from '../world/maps/rattlesnakeGulch';
import { buildSandboxMap, TOWN_ANIMALS } from '../world/maps/sandbox';
import { RANCH_ANIMALS, RANCH_NPCS } from '../world/maps/twoSpursRanch';
import type { Animal, Prey } from './Animal';
import { AnimalSystem } from './AnimalSystem';
import { Horse } from './Horse';
import { NpcSystem } from './NpcSystem';
import { TargetSystem } from './Targets';
import type { ShotRequest } from './Weapon';

const DT = 1 / 60;
const plains = poiById(SANDBOX_WORLD, 'desert-plains');
const map = buildPlainsMap(new TargetSystem(), plains.exits);
const nav = new NavGrid(map.collision, map.half);
const arrive = plains.exits[0].arrive;

/** Someone to notice and go for: `at` moves them. */
function prey(x: number, z: number, crouch = 0): Prey & { at(x: number, z: number): void } {
  const pos = new THREE.Vector3(x, 0, z);
  return { key: {}, pos, radius: 0.35, crouch, at: (nx, nz) => pos.set(nx, 0, nz) };
}

function setup(spawns: readonly AnimalSpawn[], world = map, grid = nav, seed = 5) {
  const rng = new Rng(seed);
  const sys = new AnimalSystem(spawns, world.collision, grid, () => rng.next());
  const bites: { a: Animal; prey: Prey; damage: number; push: Vec2 | null }[] = [];
  sys.onBite = (a, p, damage, push) => bites.push({ a, prey: p, damage, push });
  const run = (seconds: number, who: readonly Prey[] = []) => {
    for (let t = 0; t < seconds; t += DT) sys.update(DT, [], [], null, who);
  };
  return { sys, bites, run };
}

const pack = (id: string) => PLAINS_ANIMALS.filter((a) => a.pack === id);
const homeOf = (spawns: readonly AnimalSpawn[]): Vec2 => [spawns.reduce((s, a) => s + a.at[0], 0) / spawns.length, spawns.reduce((s, a) => s + a.at[1], 0) / spawns.length];
const dist = (a: { x: number; z: number }, [x, z]: Vec2) => Math.hypot(a.x - x, a.z - z);

describe('wild animal data', () => {
  it('every wild species has its sounds (with slots for recordings) and drops real items', () => {
    for (const id of ['bison', 'wolf', 'bear', 'snake'] as const) {
      const s = ANIMALS[id].sounds;
      for (const sound of [s.call, s.alert, s.attack, s.hurt, s.stampede].filter((x): x is string => !!x)) {
        expect(SOUNDS[sound], sound).toBeTruthy();
        expect(SAMPLES[sound], sound).toBeDefined();
      }
      for (const l of ANIMALS[id].loot) expect(ITEMS[l.item], l.item).toBeTruthy();
    }
  });

  it('the numbers asked for: wolf two hits, bear four rifle hits and one swipe kills, bites of 10 and 8', () => {
    expect(ANIMALS.wolf.hp).toBe(50);
    expect(ANIMALS.wolf.hunts!.bite.damage).toBe(10);
    expect(ANIMALS.snake.hunts!.bite.damage).toBe(8);
    expect(Math.ceil(ANIMALS.bear.hp / 45)).toBe(4);
    expect(ANIMALS.bear.hunts!.bite.damage).toBe(Infinity);
    expect(ANIMALS.bear.hunts!.flee).toBeUndefined(); // never runs
    // Faster than you on foot, slower than a galloping horse.
    expect(ANIMALS.bear.runSpeed).toBeGreaterThan(CONFIG.player.sprintSpeed);
    expect(ANIMALS.bear.runSpeed).toBeLessThan(CONFIG.horse.gallopSpeed);
    expect(ANIMALS.wolf.loot.map((l) => l.item)).toEqual(['pelt']);
  });
});

describe('Desert Plains', () => {
  it('is on the world map (heard of, not visited) on a trail from the ranch', () => {
    expect(plains.start).toBe('hidden');
    const trail = SANDBOX_WORLD.paths.find((p) => p.to.poi === 'desert-plains' || p.from.poi === 'desert-plains')!;
    expect([trail.from.poi, trail.to.poi]).toContain('two-spurs-ranch');
    expect(RANCH_NPCS.find((n) => n.id === 'rancher')!.hints!.some((h) => h.poi === 'desert-plains')).toBe(true);
  });

  it('its wildlife stands on open ground: a bison herd, two wolf packs of 2-6, one grizzly away from the wolves', () => {
    for (const a of PLAINS_ANIMALS) expect(nav.isFree(a.at[0], a.at[1]), `${a.species} at ${a.at}`).toBe(true);
    expect(nav.findPath(arrive[0], arrive[1], plains.exits[0].at[0], plains.exits[0].at[1])).not.toBeNull();
    const bison = PLAINS_ANIMALS.filter((a) => a.species === 'bison').length;
    expect(bison).toBeGreaterThanOrEqual(4);
    expect(bison).toBeLessThanOrEqual(8);
    const packs = [...new Set(PLAINS_ANIMALS.filter((a) => a.species === 'wolf').map((a) => a.pack))];
    expect(packs).toHaveLength(2);
    for (const p of packs) {
      expect(pack(p!).length).toBeGreaterThanOrEqual(2);
      expect(pack(p!).length).toBeLessThanOrEqual(6);
    }
    const bears = PLAINS_ANIMALS.filter((a) => a.species === 'bear');
    expect(bears).toHaveLength(1);
    for (const p of packs) expect(Math.hypot(bears[0].at[0] - homeOf(pack(p!))[0], bears[0].at[1] - homeOf(pack(p!))[1])).toBeGreaterThan(25);
    // Arriving, you're out of everyone's notice.
    for (const a of PLAINS_ANIMALS.filter((x) => ANIMALS[x.species].hunts)) {
      expect(Math.hypot(a.at[0] - arrive[0], a.at[1] - arrive[1])).toBeGreaterThan(ANIMALS[a.species].hunts!.notice + 4);
    }
  });

  it('one rattlesnake out of town, one in the gulch (away from the camp), and bison across the ranch stream', () => {
    const town = buildSandboxMap(new TargetSystem());
    const townNav = new NavGrid(town.collision, town.half);
    const townSnakes = TOWN_ANIMALS.filter((a) => a.species === 'snake');
    expect(townSnakes).toHaveLength(1);
    expect(townNav.isFree(townSnakes[0].at[0], townSnakes[0].at[1])).toBe(true);
    const gulch = buildGulchMap(new TargetSystem(), poiById(SANDBOX_WORLD, 'rattlesnake-gulch').exits);
    const gulchNav = new NavGrid(gulch.collision, gulch.half);
    expect(GULCH_ANIMALS.filter((a) => a.species === 'snake')).toHaveLength(1);
    for (const s of GULCH_ANIMALS) {
      expect(gulchNav.isFree(s.at[0], s.at[1])).toBe(true);
      const west = poiById(SANDBOX_WORLD, 'rattlesnake-gulch').exits[0].arrive;
      expect(gulchNav.findPath(west[0], west[1], s.at[0], s.at[1])).not.toBeNull(); // in the basin, not beyond the cliffs
      expect(Math.hypot(s.at[0] - CAMP[0], s.at[1] - CAMP[1])).toBeGreaterThan(20);
    }
    const ranchBison = RANCH_ANIMALS.filter((a) => a.species === 'bison');
    expect(ranchBison.length).toBeGreaterThanOrEqual(3);
    for (const b of ranchBison) expect(b.at[1]).toBeGreaterThan(32); // south of the stream
  });
});

describe('a wolf pack', () => {
  const north = pack('north');
  const home = homeOf(north);

  it('rests while nobody is near; notices someone walking up (all of them), not someone creeping', () => {
    const { sys, run } = setup(north);
    run(5);
    expect(sys.animals.every((w) => w.mode === 'idle' || w.mode === 'walk')).toBe(true);
    const creeper = prey(home[0] + 11, home[1], 1);
    run(2, [creeper]);
    expect(sys.animals.every((w) => w.mode !== 'alert')).toBe(true);
    const walker = prey(home[0] + 11, home[1]);
    run(1, [walker]);
    expect(sys.animals.every((w) => w.mode === 'alert')).toBe(true);
    expect(sys.animals.every((w) => w.pose !== 'rest')).toBe(true); // up on their feet
    // Watching, not attacking, while you keep your distance.
    run(3, [walker]);
    expect(sys.animals.every((w) => w.mode === 'alert')).toBe(true);
  });

  it('comes for you if you come closer, and bites (10 a time)', () => {
    const { sys, bites, run } = setup(north);
    const me = prey(home[0] + 11, home[1]);
    run(1, [me]);
    me.at(home[0] + 5, home[1]);
    run(1, [me]);
    expect(sys.animals.every((w) => w.mode === 'hunt')).toBe(true);
    run(3, [me]);
    expect(bites.length).toBeGreaterThan(0);
    expect(bites.every((b) => b.damage === 10 && b.prey.key === me.key)).toBe(true);
  });

  it('never follows past its leash: it gives up, goes home and lies down again', () => {
    const { sys, run } = setup(north);
    const me = prey(home[0] + 5, home[1]);
    run(1.5, [me]);
    expect(sys.animals.some((w) => w.mode === 'hunt')).toBe(true);
    me.at(home[0] + ANIMALS.wolf.hunts!.leash + 4, home[1]);
    run(0.5, [me]);
    expect(sys.animals.every((w) => w.mode !== 'hunt')).toBe(true);
    me.at(home[0] + 60, home[1]);
    run(45, [me]);
    for (const w of sys.animals) expect(dist(w.pos, home)).toBeLessThan(6);
  });

  it('shooting one from afar turns the whole pack on the shooter', () => {
    const { sys, run } = setup(north);
    const me = prey(home[0] + 18, home[1]);
    run(0.5, [me]);
    sys.provoke(sys.animals[0], me.key, [me.pos.x, me.pos.z]);
    run(0.2, [me]);
    expect(sys.animals.every((w) => w.mode === 'hunt' && w.targetKey === me.key)).toBe(true);
  });

  it('a badly hurt wolf runs off, and comes back after ten seconds', () => {
    const { sys, run } = setup(north);
    const me = prey(home[0] + 6, home[1] + 2);
    run(1.5, [me]);
    const w = sys.animals[0];
    w.hp = ANIMALS.wolf.hp * 0.3;
    sys.provoke(w, me.key, [me.pos.x, me.pos.z]);
    expect(w.mode).toBe('flee');
    // Stand off (out of reach, but inside the leash) so the rest don't finish it all now.
    run(9, [me]);
    expect(w.mode).toBe('flee');
    run(2, [me]);
    expect(w.mode).toBe('hunt');
  });

  it('down to two after losing wolves, the pack runs', () => {
    const { sys, run } = setup(north);
    const me = prey(home[0] + 5, home[1]);
    run(1.5, [me]);
    sys.animals[0].hit(new THREE.Vector3(), new THREE.Vector3(1, 0, 0), { damage: 100, shooter: null });
    sys.animals[1].hit(new THREE.Vector3(), new THREE.Vector3(1, 0, 0), { damage: 100, shooter: null });
    run(0.1, [me]);
    expect(sys.animals.filter((w) => w.alive).every((w) => w.mode === 'flee')).toBe(true);
  });

  it('goes for an NPC (or a horse) that walks up to it, just the same', () => {
    const { bites, run } = setup(north);
    const horse = prey(home[0] + 4, home[1]);
    run(3, [horse]);
    expect(bites.some((b) => b.prey.key === horse.key)).toBe(true);
  });
});

describe('the grizzly', () => {
  const den = PLAINS_ANIMALS.filter((a) => a.species === 'bear');
  const at = den[0].at;

  it('rears up and roars as a warning, then charges if you keep coming; one swipe kills', () => {
    const { sys, bites, run } = setup(den);
    const bear = sys.animals[0];
    const me = prey(at[0] + 13, at[1]);
    run(0.5, [me]);
    expect(bear.mode).toBe('alert');
    expect(bear.pose).toBe('rear');
    run(3, [me]);
    expect(bear.mode).toBe('alert'); // still only warning you off
    me.at(at[0] + 7, at[1]);
    run(1, [me]);
    expect(bear.mode).toBe('alert'); // the warning lasts a moment
    run(1, [me]);
    expect(bear.mode).toBe('hunt');
    run(3, [me]);
    expect(bites[0]?.damage).toBe(Infinity);
  });

  it('never runs, however hurt', () => {
    const { sys, run } = setup(den);
    const bear = sys.animals[0];
    const me = prey(at[0] + 15, at[1]);
    run(0.3, [me]);
    bear.hp = 10;
    sys.provoke(bear, me.key, [me.pos.x, me.pos.z]);
    run(0.5, [me]);
    expect(bear.mode).toBe('hunt');
  });
});

describe('a rattlesnake', () => {
  const town = buildSandboxMap(new TargetSystem());
  const townNav = new NavGrid(town.collision, town.half);
  const spawn = TOWN_ANIMALS.find((a) => a.species === 'snake')!;
  const [sx, sz] = spawn.at;

  it('rattles when you come close and strikes (8) when you step right up; it does not chase you far', () => {
    const { sys, bites, run } = setup([spawn], town, townNav);
    const snake = sys.animals[0];
    const me = prey(snake.pos.x + 4, snake.pos.z);
    run(0.5, [me]);
    expect(snake.mode).toBe('alert');
    me.at(snake.pos.x + 1.2, snake.pos.z);
    run(3, [me]);
    expect(bites.length).toBeGreaterThan(0);
    expect(bites[0].damage).toBe(8);
    me.at(sx + 12, sz);
    run(10, [me]);
    expect(snake.mode === 'idle' || snake.mode === 'walk').toBe(true);
    expect(dist(snake.pos, spawn.at)).toBeLessThan(ANIMALS.snake.hunts!.leash + 2);
  });

  it('dies to one revolver shot', () => {
    const { sys } = setup([spawn], town, townNav);
    sys.animals[0].hit(new THREE.Vector3(), new THREE.Vector3(1, 0, 0), { damage: 25, shooter: null });
    expect(sys.animals[0].alive).toBe(false);
  });
});

describe('bison', () => {
  const herd = PLAINS_ANIMALS.filter((a) => a.species === 'bison');

  it('the whole herd stampedes when someone walks right up', () => {
    const { sys, run } = setup(herd);
    const b = sys.animals[0];
    const me = prey(b.pos.x + 2.5, b.pos.z);
    run(DT, [me]);
    expect(sys.animals.every((x) => x.mode === 'flee')).toBe(true);
  });

  it('tramples whoever is in the way: 30 damage, thrown aside', () => {
    const { sys, bites, run } = setup([{ species: 'bison', at: [-10, -20], yaw: 0, roam: 20 }]);
    const b = sys.animals[0];
    sys.alarm(b, [-30, -20]); // bolting east
    run(0.6);
    const ahead = prey(b.pos.x + 2.5, b.pos.z);
    for (let i = 0; i < 90 && bites.length === 0; i++) {
      ahead.at(b.pos.x + Math.sign(b.vel.x || 1) * 1.0, b.pos.z + (b.vel.y / Math.max(0.1, Math.abs(b.vel.x))) * 1.0);
      run(DT, [ahead]);
    }
    expect(bites).toHaveLength(1);
    expect(bites[0].damage).toBe(30);
    expect(Math.hypot(...bites[0].push!)).toBeGreaterThan(1);
  });
});

describe('NPCs against animals', () => {
  const town = buildSandboxMap(new TargetSystem());
  const townNav = new NavGrid(town.collision, town.half);

  it('an armed one shoots at a wolf coming for it; once the wolf is dead it stands down', () => {
    const npcs = new NpcSystem(NPCS, town.collision, townNav, town.occluders);
    const gunman = npcs.npcs.find((n) => n.def.id === 'porch-gunman')!;
    const { sys } = setup([{ species: 'wolf', at: [gunman.pos.x + 8, gunman.pos.z + 6], roam: 3 }], town, townNav);
    const wolf = sys.animals[0];
    npcs.threatenedBy(gunman, wolf);
    expect(gunman.mode).toBe('hostile');
    const shots: ShotRequest[] = [];
    const player = { pos: new THREE.Vector3(40, 0, 40), mounted: false, dead: false };
    for (let t = 0; t < 4; t += DT) npcs.update(DT, player, [], (n, s) => n === gunman && shots.push(s));
    expect(shots.length).toBeGreaterThan(0);
    // Aimed at the wolf, low: not at the player far off.
    const d = shots[0].dirs[0];
    const toWolf = new THREE.Vector3(wolf.pos.x - shots[0].origin.x, 0, wolf.pos.z - shots[0].origin.z).normalize();
    expect(d.x * toWolf.x + d.z * toWolf.z).toBeGreaterThan(0.9);
    wolf.hit(wolf.pos, new THREE.Vector3(1, 0, 0), { damage: 100, shooter: null });
    for (let t = 0; t < 0.5; t += DT) npcs.update(DT, player, [], () => {});
    expect(gunman.mode).toBe('routine');
    expect(gunman.foe).toBeNull();
  });

  it('an unarmed one runs from it', () => {
    const npcs = new NpcSystem(NPCS, town.collision, townNav, town.occluders);
    const woman = npcs.npcs.find((n) => n.def.id === 'townswoman')!;
    const { sys } = setup([{ species: 'wolf', at: [woman.pos.x + 3, woman.pos.z + 3], roam: 3 }], town, townNav);
    npcs.threatenedBy(woman, sys.animals[0]);
    expect(woman.mode).toBe('flee');
  });
});

describe('horses', () => {
  it('can be bitten to death; a dead horse lies still and cannot be mounted', () => {
    const h = new Horse();
    h.place(new THREE.Vector3(0, 0, 0), 0);
    expect(h.canInteract()).toBe(true);
    let died = false;
    for (let i = 0; i < 20 && !died; i++) died = h.hurt(ANIMALS.wolf.hunts!.bite.damage);
    expect(died).toBe(true);
    expect(h.dead).toBe(true);
    expect(h.canInteract()).toBe(false);
    h.update(1, 0, true, map.collision);
    expect(h.pos.length()).toBe(0);
    const h2 = new Horse();
    expect(h2.hurt(ANIMALS.bear.hunts!.bite.damage)).toBe(true); // a grizzly's swipe: one blow
  });
});
