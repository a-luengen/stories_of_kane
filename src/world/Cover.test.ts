import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { WEAPONS } from '../data/weapons';
import { playerChest } from '../entities/Npc';
import { Player } from '../entities/Player';
import { ProjectileSystem, type Impact } from '../entities/Projectiles';
import { TargetSystem } from '../entities/Targets';
import { StaticBatch } from '../render/StaticBatch';
import { Rng } from '../util/math';
import { CollisionWorld, type Collider } from './Colliders';
import { barrel, building, cliff, crate, fence, rock, sandbags, trough, wagon } from './props';

/**
 * An NPC 10 units away shoots straight at the player's chest (as NPCs aim: lower when the player
 * crouches), from shoulder height; `cover` stands 1.2 units in front of the player.
 */
function shoot(crouched: boolean, cover: (cw: CollisionWorld) => void, aimHeight?: number): Impact | { target: null; surface: 'none'; point: THREE.Vector3 } {
  const cw = new CollisionWorld(30);
  cover(cw);
  const targets = new TargetSystem();
  const p = new Player();
  p.setPosition(new THREE.Vector3(0, 0, 0));
  if (crouched) {
    p.crouched = true;
    p.crouch = 1;
  }
  targets.addActor(p);
  const origin = new THREE.Vector3(0, 1.38, -10);
  const aim = playerChest(p).clone();
  if (aimHeight !== undefined) aim.y = aimHeight;
  const bullets = new ProjectileSystem();
  bullets.fire(origin, aim.sub(origin).normalize(), WEAPONS.revolver, null);
  let hit: Impact | null = null;
  for (let i = 0; i < 120 && !hit; i++) bullets.update(1 / 60, cw, targets, (imp) => (hit = imp));
  // Nothing hit within range: it flew past.
  return hit ?? { target: null, surface: 'none', point: new THREE.Vector3() };
}

const barrelInFront = (cw: CollisionWorld) => barrel(new StaticBatch(), cw, 0, -1.2, new Rng(1));
const wallInFront = (cw: CollisionWorld) => cw.addBox(-2, -1.5, 2, -1.1, 3, 'wood');

describe('height-based cover', () => {
  it('standing behind a barrel: the shot clears it and hits', () => {
    expect(shoot(false, barrelInFront).target).toBeInstanceOf(Player);
  });

  it('crouched behind a barrel: the barrel takes the shot', () => {
    const imp = shoot(true, barrelInFront);
    expect(imp.target).toBeNull();
    expect(imp.surface).toBe('wood');
    expect(imp.point.y).toBeLessThan(1.0);
  });

  it('tall cover stops the shot either way', () => {
    expect(shoot(false, wallInFront).target).toBeNull();
    expect(shoot(true, wallInFront).target).toBeNull();
  });

  it('in the open, crouching only helps through the smaller hitbox', () => {
    expect(shoot(true, () => {}).target).toBeInstanceOf(Player); // aimed low: still hit
    // A chest-high shot meant for a standing target flies over a crouched one.
    expect(shoot(true, () => {}, 1.2).target).toBeNull();
    expect(shoot(false, () => {}, 1.2).target).toBeInstanceOf(Player);
  });

  it('every prop has a sensible cover height (low cover below a standing chest, tall above a head)', () => {
    const rng = new Rng(3);
    const top = (build: (cw: CollisionWorld) => void): number => {
      const cw = new CollisionWorld(30);
      build(cw);
      return Math.max(...cw.colliders.map((c: Collider) => c.coverHeight));
    };
    const b = new StaticBatch();
    const low = {
      barrel: top((cw) => barrel(b, cw, 0, 0, rng)),
      crate: top((cw) => crate(b, cw, 0, 0, rng)),
      sandbags: top((cw) => sandbags(b, cw, 0, 0, 3, true, rng)),
      trough: top((cw) => trough(b, cw, 0, 0)),
      fence: top((cw) => fence(b, cw, 0, 0, 4, 0)),
    };
    for (const [name, h] of Object.entries(low)) {
      expect(h, name).toBeGreaterThan(0.5);
      expect(h, name).toBeLessThan(1.2); // a standing chest (1.2) shows over it, a crouched one (0.72) doesn't
    }
    expect(top((cw) => building(cw, 0, 0, 0, 6, 6, 3.4, 0, 0, rng))).toBeGreaterThan(3);
    expect(top((cw) => cliff(b, cw, -5, 0, 5, 0, 6, rng))).toBeGreaterThan(4);
    expect(top((cw) => wagon(b, cw, 0, 0, 0, 'covered'))).toBeGreaterThan(1.5);
    expect(top((cw) => wagon(b, cw, 0, 0, 0, 'intact'))).toBeGreaterThan(1.1);
    const big = new Rng(7);
    let tallest = 0;
    for (let i = 0; i < 20; i++) tallest = Math.max(tallest, top((cw) => rock(b, cw, 0, 0, big)));
    expect(tallest).toBeGreaterThan(1.2); // big boulders hide a standing person
  });
});
