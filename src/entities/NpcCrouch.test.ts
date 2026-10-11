import * as THREE from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { coversFrom, findLowCover } from '../ai/LowCover';
import { NavGrid } from '../ai/NavGrid';
import { CONFIG } from '../config';
import { NPCS } from '../data/npcs';
import type { NpcDef } from '../data/types';
import { buildSandboxMap } from '../world/maps/sandbox';
import { CollisionWorld } from '../world/Colliders';
import type { Horse } from './Horse';
import type { Npc } from './Npc';
import { NpcSystem } from './NpcSystem';
import { TargetSystem } from './Targets';
import type { ShotRequest } from './Weapon';

const DT = 1 / 60;

/** Open ground with one barrel at the origin and a tall wall off to the side. */
function arena() {
  const cw = new CollisionWorld(30);
  cw.addCircle(0, 0, 0.4, 1.0, 'wood'); // barrel
  cw.addBox(8, -1, 9, 3, 3, 'wood'); // wall: too tall to be "low cover"
  const nav = new NavGrid(cw, 30);
  return { cw, nav };
}

function bandit(id: string, weapon: string, tactics: NpcDef['tactics'], spawn: [number, number]): NpcDef {
  return {
    id,
    attitude: 'hostile',
    defendsOthers: false,
    appearance: NPCS[0].appearance,
    weapon,
    tactics,
    spawn,
    routine: { kind: 'idle', at: spawn, facing: 0 },
  };
}

/** One NPC in the arena, the player 16 units north of the barrel. */
function duel(def: NpcDef) {
  const { cw, nav } = arena();
  const sys = new NpcSystem([def], cw, nav, []);
  const player = { pos: new THREE.Vector3(0, 0, -16), mounted: false, dead: false, crouch: 0 };
  const npc = sys.npcs[0];
  const log: { t: number; crouch: number; shot: ShotRequest | null; x: number; z: number }[] = [];
  let t = 0;
  const run = (seconds: number) => {
    for (const end = t + seconds; t < end; t += DT) {
      let shot: ShotRequest | null = null;
      sys.update(DT, player, [], (_, s) => (shot = s));
      log.push({ t, crouch: npc.crouch, shot, x: npc.pos.x, z: npc.pos.z });
    }
  };
  return { cw, nav, sys, player, npc, log, run };
}

afterEach(() => vi.restoreAllMocks());

describe('low cover', () => {
  it('finds the spot right behind a barrel, seen from the threat', () => {
    const { cw, nav } = arena();
    const spot = findLowCover(cw, nav, { from: [3, 3], threat: { x: 0, z: -16 }, range: [10, 24], maxTravel: 10 })!;
    expect(spot).not.toBeNull();
    // Behind the barrel (further from the threat), a body's width away.
    expect(spot[1]).toBeGreaterThan(0.5);
    expect(Math.hypot(spot[0], spot[1])).toBeLessThan(1.4);
    expect(coversFrom(cw, spot, { x: 0, z: -16 })).toBe(true);
  });

  it('a spot stops counting once the threat walks round the barrel', () => {
    const { cw } = arena();
    expect(coversFrom(cw, [0, 0.95], { x: 0, z: -16 })).toBe(true);
    expect(coversFrom(cw, [0, 0.95], { x: 14, z: 2 })).toBe(false);
  });

  it('nothing low enough nearby (or out of range): no spot', () => {
    const { cw, nav } = arena();
    expect(findLowCover(cw, nav, { from: [3, 3], threat: { x: 0, z: -16 }, range: [30, 40], maxTravel: 10 })).toBeNull();
    expect(findLowCover(cw, nav, { from: [-20, 20], threat: { x: 0, z: -16 }, range: [10, 24], maxTravel: 6 })).toBeNull();
  });
});

describe('NPC crouching', () => {
  it('riflemen crouch behind low cover and pop up to shoot over it', () => {
    const { cw, npc, log, run } = duel(bandit('rifle', 'rifle', 'cover', [3, 3]));
    run(12);
    const inCover = log.filter((s) => Math.hypot(s.x, s.z) < 1.4 && s.z > 0.4);
    expect(inCover.length).toBeGreaterThan(60);
    // Mostly crouched there…
    expect(inCover.filter((s) => s.crouch > 0.95).length).toBeGreaterThan(inCover.length * 0.4);
    // … shooting from there: popped up over the barrel, or from the crouch when that clears it.
    const shots = inCover.filter((s) => s.shot).map((s) => ({ ...s, shot: s.shot! }));
    expect(shots.length).toBeGreaterThan(1);
    expect(shots.some((s) => s.crouch < 0.5)).toBe(true);
    for (const { shot } of shots) {
      const o = shot.origin;
      const aim = new THREE.Vector3(0, 1.2, -16).sub(o).normalize().multiplyScalar(3).add(o);
      expect(cw.raycast(o.x, o.y, o.z, aim.x, aim.y, aim.z)).toBeNull();
    }
    // Crouched: a lower hitbox.
    const crouched = log.findIndex((s) => s.crouch === 1);
    expect(crouched).toBeGreaterThan(-1);
    expect(npc.hitbox()!.y1).toBeLessThanOrEqual(CONFIG.player.crouch.standHeight);
  });

  it('shotgunners rush and never crouch, not even when bullets land close', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const { sys, npc, log, run } = duel(bandit('shotgun', 'shotgun', 'rush', [3, 3]));
    for (let i = 0; i < 6; i++) {
      sys.onPlayerShotLanded(npc.pos.clone().add(new THREE.Vector3(1, 0, 0)), null);
      run(0.5);
    }
    expect(npc.canCrouch).toBe(false);
    expect(log.every((s) => s.crouch === 0)).toBe(true);
  });

  it('armed NPCs duck briefly when bullets land close, then stand', () => {
    const { cw, nav } = arena();
    const sys = new NpcSystem([{ ...NPCS[0], spawn: [10, 10], routine: { kind: 'idle', at: [10, 10], facing: 0 } }], cw, nav, []);
    const player = { pos: new THREE.Vector3(0, 0, -16), mounted: false, dead: false };
    const gunman = sys.npcs[0];
    vi.spyOn(Math, 'random').mockReturnValue(0);
    sys.onPlayerShotLanded(gunman.pos.clone().add(new THREE.Vector3(1, 0, 0)), null);
    for (let t = 0; t < 0.3; t += DT) sys.update(DT, player, [], () => {});
    expect(gunman.crouched).toBe(true);
    expect(gunman.crouch).toBe(1);
    for (let t = 0; t < 1.5; t += DT) sys.update(DT, player, [], () => {});
    expect(gunman.crouched).toBe(false);
    expect(gunman.crouch).toBe(0);
  });

  it('unarmed NPCs crouch in their hiding spot (and stand when bolting again)', () => {
    const wd = buildSandboxMap(new TargetSystem());
    const nav = new NavGrid(wd.collision, CONFIG.world.size / 2);
    const sys = new NpcSystem(NPCS, wd.collision, nav, wd.occluders);
    const player = { pos: new THREE.Vector3(-2, 0, 1.5), mounted: false, dead: false };
    const woman = sys.npcs[1];
    sys.onPlayerHitNpc(woman, player);
    for (let t = 0; t < 1; t += DT) sys.update(DT, player, [], () => {});
    expect(woman.crouch).toBe(0); // running
    for (let t = 0; t < 10; t += DT) sys.update(DT, player, [], () => {});
    expect(woman.mode).toBe('hide');
    expect(woman.crouch).toBe(1);
    expect(woman.hitbox()!.y1).toBeCloseTo(CONFIG.player.crouch.standHeight * CONFIG.player.crouch.hitboxScale);
  });

  it('sandbox idlers sometimes crouch to inspect the ground, then go on', () => {
    const { cw, nav } = arena();
    const def: NpcDef = {
      ...NPCS[1],
      spawn: [-10, 10],
      routine: { kind: 'wander', points: [[-14, 10], [-6, 10]], jitter: 0, pause: [1, 1], inspect: 1 },
    };
    const sys = new NpcSystem([def], cw, nav, []);
    const player = { pos: new THREE.Vector3(20, 0, -20), mounted: false, dead: false };
    const npc = sys.npcs[0];
    const seen: boolean[] = [];
    let moved = false;
    for (let t = 0; t < 20; t += DT) {
      sys.update(DT, player, [], () => {});
      seen.push(npc.crouched);
      if (npc.crouched && Math.hypot(npc.vel.x, npc.vel.y) > 0.3) moved = true;
    }
    expect(seen.some((c) => c)).toBe(true);
    // Stood up again between inspections (and doesn't walk around crouched).
    expect(seen.filter((c) => !c).length).toBeGreaterThan(60);
    expect(moved).toBe(false);
  });

  it('riders never crouch', () => {
    const { npc } = duel(bandit('rider', 'revolver', 'strafe', [3, 3]));
    expect(npc.canCrouch).toBe(true);
    (npc as Npc).mount = {} as Horse;
    expect(npc.canCrouch).toBe(false);
  });
});
