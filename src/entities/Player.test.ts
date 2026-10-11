import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { CONFIG } from '../config';
import { createItem } from '../items/ItemInstance';
import { CollisionWorld } from '../world/Colliders';
import { Player, type PlayerInput } from './Player';

const DT = 1 / 60;

function input(over: Partial<PlayerInput> = {}): PlayerInput {
  return { moveX: 0, moveZ: 0, sprint: false, fireHeld: false, reload: false, holster: false, select: null, aim: new THREE.Vector3(0, 0, 10), ...over };
}

/** Step for `seconds`, returning the number of shots fired. */
function run(p: Player, seconds: number, over: Partial<PlayerInput> = {}): number {
  let shots = 0;
  for (let t = 0; t < seconds; t += DT) if (p.updateWeapon(DT, input(over))) shots++;
  return shots;
}

describe('player holster', () => {
  it('starts holstered; the first trigger pull draws, then fires', () => {
    const p = new Player();
    expect(p.drawn).toBe(false);
    expect(run(p, p.weapon!.def.drawTime * 0.9, { fireHeld: true })).toBe(0);
    expect(p.drawn).toBe(true);
    expect(run(p, 0.3, { fireHeld: true })).toBeGreaterThan(0);
  });

  it('H holsters (and cancels a reload)', () => {
    const p = new Player();
    run(p, 1, { fireHeld: true });
    run(p, 0.1, { reload: true });
    expect(p.weapon!.reloading).toBe(true);
    run(p, DT, { holster: true });
    expect(p.drawn).toBe(false);
    expect(p.weapon!.reloading).toBe(false);
    run(p, 1);
    expect(p.draw).toBe(0);
  });

  it('auto-holsters after the idle time without shooting', () => {
    const p = new Player();
    run(p, 0.6, { fireHeld: true });
    run(p, CONFIG.player.autoHolsterTime - 1);
    expect(p.drawn).toBe(true);
    run(p, 1.5);
    expect(p.drawn).toBe(false);
  });

  it('shooting resets the idle timer', () => {
    const p = new Player();
    run(p, 0.6, { fireHeld: true });
    run(p, CONFIG.player.autoHolsterTime - 5);
    run(p, 0.1, { fireHeld: true });
    run(p, 10);
    expect(p.drawn).toBe(true);
  });

  it('instant holster (on death) snaps the gun away', () => {
    const p = new Player();
    run(p, 1, { fireHeld: true });
    p.holster(true);
    expect(p.draw).toBe(0);
    expect(p.drawn).toBe(false);
  });
});

describe('player inventory weapons', () => {
  it('starts with the revolver in slot 1 and two boxes of revolver ammo', () => {
    const p = new Player();
    expect(p.equipment.weapons.map((w) => w?.defId ?? null)).toEqual(['revolver', null, null]);
    expect(p.inventory.items.filter((i) => i.defId === 'ammo_revolver')).toHaveLength(2);
    expect(p.equipment.clothing.hat?.defId).toBe('cowboy_hat_brown');
  });

  it('reload takes rounds from the inventory, and is blocked without them', () => {
    const p = new Player();
    for (let i = 0; i < 600 && p.ammo > 0; i++) p.updateWeapon(DT, input({ fireHeld: true }));
    expect(p.weapon!.ammo).toBe(0);
    const reserve = p.inventory.ammoCount('revolverAmmo');
    run(p, 0.1, { reload: true });
    run(p, p.weapon!.def.reloadTime + 0.1);
    expect(p.weapon!.ammo).toBe(6);
    expect(p.inventory.ammoCount('revolverAmmo')).toBe(reserve - 6);

    // Empty the reserve: reload is refused and "No ammo" shows.
    p.inventory.takeAmmo('revolverAmmo', 999);
    for (let i = 0; i < 600 && p.ammo > 0; i++) p.updateWeapon(DT, input({ fireHeld: true }));
    run(p, 0.1, { reload: true });
    expect(p.weapon!.reloading).toBe(false);
    expect(p.noAmmo).toBeGreaterThan(0);
  });

  it('1/2/3 switch slots (holster, then draw); the active key again holsters', () => {
    const p = new Player();
    p.equipment.put('w1', createItem('rifle'), null);
    run(p, 0.6, { fireHeld: true });
    expect(p.active).toBe(0);
    run(p, DT, { select: 1 });
    run(p, CONFIG.items.weaponSwapTime + 0.05);
    expect(p.active).toBe(1);
    expect(p.draw).toBe(1);
    expect(p.weapon!.def.id).toBe('rifle');
    run(p, DT, { select: 1 });
    expect(p.drawn).toBe(false);
    run(p, DT, { select: 2 }); // empty slot: nothing happens
    expect(p.active).toBe(1);
  });

  it('removing the active weapon via the inventory holsters at once', () => {
    const p = new Player();
    run(p, 1, { fireHeld: true });
    expect(p.draw).toBe(1);
    p.equipment.take('w0');
    p.syncEquipment();
    expect(p.draw).toBe(0);
    expect(p.weapon).toBeNull();
    expect(run(p, 1, { fireHeld: true })).toBe(0);
  });
});

describe('crouching', () => {
  const world = new CollisionWorld(50);
  const move = (p: Player, seconds: number, over: Partial<PlayerInput> = {}) => {
    for (let t = 0; t < seconds; t += DT) p.updateMovement(DT, input(over), world, []);
  };

  it('C toggles crouch; the pose blends in over ~0.2 s', () => {
    const p = new Player();
    move(p, DT, { crouch: true });
    expect(p.crouched).toBe(true);
    expect(p.crouch).toBeLessThan(1);
    move(p, CONFIG.player.crouch.blendTime + 0.02);
    expect(p.crouch).toBe(1);
    move(p, DT, { crouch: true });
    expect(p.crouched).toBe(false);
  });

  it('halves the speed; Shift stands up into a sprint', () => {
    const p = new Player();
    move(p, DT, { crouch: true });
    move(p, 1, { moveX: 1 });
    expect(p.speed()).toBeCloseTo(CONFIG.player.walkSpeed * CONFIG.player.crouch.speedMul, 1);
    move(p, 1, { moveX: 1, sprint: true });
    expect(p.crouched).toBe(false);
    expect(p.sprinting).toBe(true);
    expect(p.speed()).toBeCloseTo(CONFIG.player.sprintSpeed, 1);
  });

  it('not available while mounted; mounting cancels it', () => {
    const p = new Player();
    move(p, DT, { crouch: true });
    move(p, 0.5);
    expect(p.crouch).toBe(1);
    p.mounted = true;
    move(p, DT);
    expect([p.crouched, p.crouch]).toEqual([false, 0]);
    move(p, DT, { crouch: true });
    expect(p.crouched).toBe(false);
  });

  it("can't stand up under something low overhead", () => {
    const low = new CollisionWorld(50);
    // A beam 1.3 high over the spot (doesn't block walking, only standing up).
    const beam = low.addBox(-1, -1, 1, 1, 1.6, 'wood');
    beam.base = 1.3;
    const p = new Player();
    p.setPosition(new THREE.Vector3(0, 0, 0));
    p.updateMovement(DT, input({ crouch: true }), low, []);
    p.updateMovement(DT, input({ crouch: true }), low, []);
    expect(p.crouched).toBe(true);
    p.updateMovement(DT, input({ sprint: true, moveX: 1 }), low, []);
    expect(p.crouched).toBe(true);
    expect(low.blocksStanding(5, 5, 0.35, 1.15, 1.85)).toBe(false);
  });

  it('steadier aim and a smaller hitbox when crouched', () => {
    const p = new Player();
    const shotAt = (q: Player) => {
      // Spread scale: fire many shots at a far point and measure the widest miss.
      let worst = 0;
      for (let i = 0; i < 200; i++) {
        q.weapon!.refill();
        const s = q.updateWeapon(1, input({ fireHeld: true, aim: new THREE.Vector3(0, 0, 30) }));
        if (s) worst = Math.max(worst, Math.abs(s.dirs[0].x));
      }
      return worst;
    };
    run(p, 1, { fireHeld: true });
    const standing = shotAt(p);
    move(p, DT, { crouch: true });
    move(p, 0.5);
    const crouched = shotAt(p);
    expect(crouched).toBeLessThan(standing * 0.75);
    // Bullet passing at 1.4 m: hits a standing player, misses a crouched one.
    const over = [new THREE.Vector3(-1, 1.4, 0), new THREE.Vector3(1, 1.4, 0)] as const;
    const q = new Player();
    q.setPosition(new THREE.Vector3(0, 0, 0));
    expect(q.test(...over)).not.toBeNull();
    move(q, DT, { crouch: true });
    move(q, 0.5);
    expect(q.test(...over)).toBeNull();
  });
});
