import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { grazingDriver, inPen } from '../ai/GrazingAI';
import { NavGrid } from '../ai/NavGrid';
import { poiById, SANDBOX_WORLD } from '../data/world';
import { Horse } from '../entities/Horse';
import { TargetSystem } from '../entities/Targets';
import { buildRanchMap, PADDOCK, RANCH_HORSES, RANCH_NPCS } from './maps/twoSpursRanch';
import { footSurface } from '../audio/footSurface';
import { Rng } from '../util/math';

const ranch = poiById(SANDBOX_WORLD, 'two-spurs-ranch');
const map = buildRanchMap(new TargetSystem(), ranch.exits);
const nav = new NavGrid(map.collision, map.half);
const south = ranch.exits.find((e) => e.id === 'south')!;
const reach = (x: number, z: number) => nav.findPath(south.arrive[0], south.arrive[1], x, z);

describe('Two Spurs Ranch', () => {
  it('both exits, the house porch, the barn (inside) and the paddock gate are reachable from the south trail', () => {
    for (const e of ranch.exits) {
      expect(nav.isFree(e.arrive[0], e.arrive[1]), `${e.id} arrival`).toBe(true);
      expect(reach(e.at[0], e.at[1]), `${e.id}`).not.toBeNull();
    }
    expect(reach(-14, -7.6), 'porch').not.toBeNull();
    expect(nav.isFree(12, -12)).toBe(true); // inside the barn
    expect(reach(12, -12), 'barn').not.toBeNull();
    expect(reach(5, 10), 'paddock, through the gate').not.toBeNull();
  });

  it('the stream can only be crossed on the bridge', () => {
    const path = reach(0, 10)!;
    // Every crossing of the stream line happens on the bridge planks.
    const crossings = path.filter(([, z]) => z > 24 && z < 30);
    for (const [x] of crossings) expect(Math.abs(x)).toBeLessThan(2.2);
    // Away from the bridge the water itself is blocked.
    expect(nav.isFree(-20, 29.6)).toBe(false);
    expect(footSurface(0, 26.6, map.floors)).toBe('wood'); // the planks
  });

  it('has containers in the barn and at the house, a windmill turning, porches of wood', () => {
    const inBarn = map.containers.filter((c) => c.position.x > 6 && c.position.x < 18 && c.position.z > -19 && c.position.z < -9);
    const atHouse = map.containers.filter((c) => c.position.x < -8 && c.position.z < -5);
    expect(inBarn.length).toBeGreaterThanOrEqual(4);
    expect(atHouse.length).toBeGreaterThanOrEqual(2);
    expect(map.update).toBeTypeOf('function');
    expect(footSurface(-14, -7.6, map.floors)).toBe('wood');
    expect(map.occluders).toHaveLength(2);
  });

  it('everyone stands on open ground', () => {
    for (const n of RANCH_NPCS) expect(nav.isFree(n.spawn[0], n.spawn[1]), n.id).toBe(true);
    for (const h of RANCH_HORSES) expect(nav.isFree(h.pos[0], h.pos[1]), `horse at ${h.pos}`).toBe(true);
    expect(RANCH_NPCS.find((n) => n.routine.kind === 'lean')).toBeTruthy(); // one leans on the corral fence
  });

  it('paddock horses are unsaddled and stay in the paddock while they graze and wander', () => {
    const grazers = RANCH_HORSES.filter((h) => h.pen);
    expect(grazers.length).toBeGreaterThanOrEqual(3);
    expect(grazers.every((h) => h.saddled === false)).toBe(true);
    expect(RANCH_HORSES.filter((h) => h.saddled !== false)).toHaveLength(1); // the one to ride
    const h = new Horse();
    h.place(new THREE.Vector3(2, 0, 12), 0);
    const rng = new Rng(3);
    h.driver = grazingDriver(h, PADDOCK, () => rng.next());
    let grazed = 0;
    let moved = 0;
    let maxSpeed = 0;
    for (let i = 0; i < 60 * 120; i++) {
      const d = h.driver(1 / 60);
      const before = h.pos.clone();
      h.update(1 / 60, d.target, d.gallop, map.collision, [], d.cap);
      if (h.graze > 0.5) grazed++;
      moved += before.distanceTo(h.pos);
      maxSpeed = Math.max(maxSpeed, h.motor.speed);
      expect(inPen(PADDOCK, h.pos.x, h.pos.z)).toBe(true);
    }
    expect(grazed).toBeGreaterThan(60 * 30); // mostly grazing
    expect(moved).toBeGreaterThan(5); // but it does wander
    expect(maxSpeed).toBeLessThan(2); // ambling, not cantering
  });

  it('an unsaddled horse can be seen but not ridden', () => {
    const h = new Horse();
    h.setSaddled(false);
    expect(h.saddled).toBe(false);
  });
});
