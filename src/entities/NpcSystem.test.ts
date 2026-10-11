import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { CONFIG } from '../config';
import { NPCS } from '../data/npcs';
import { ITEMS } from '../data/items';
import { MERCHANT_SHOPS } from '../data/shop';
import { Economy } from '../modes/Economy';
import type { NpcDef } from '../data/types';
import { PAL } from '../render/palette';
import { GridContainer } from '../items/GridContainer';
import { createItem } from '../items/ItemInstance';
import { takeAll } from '../items/transfer';
import { WEAPONS } from '../data/weapons';
import { buildSandboxMap as buildWorld } from '../world/maps/sandbox';
import { NavGrid } from '../ai/NavGrid';
import type { Npc } from './Npc';
import { NpcSystem } from './NpcSystem';
import { TargetSystem } from './Targets';
import type { ShotRequest } from './Weapon';

const DT = 1 / 60;
const wd = buildWorld(new TargetSystem());
const nav = new NavGrid(wd.collision, CONFIG.world.size / 2);

function setup() {
  const sys = new NpcSystem(NPCS, wd.collision, nav, wd.occluders);
  const player = { pos: new THREE.Vector3(-2, 0, 1.5), mounted: false, dead: false };
  const shots: { npc: Npc; shot: ShotRequest }[] = [];
  const run = (seconds: number) => {
    for (let t = 0; t < seconds; t += DT) sys.update(DT, player, [], (npc, shot) => shots.push({ npc, shot }));
  };
  const [gunman, townswoman, rifle, shotgun] = sys.npcs;
  return { sys, player, shots, run, gunman, townswoman, rifle, shotgun };
}

describe('NPCs', () => {
  it('spawn with names, distinct outfits and the configured weapons', () => {
    const { sys } = setup();
    expect(sys.npcs).toHaveLength(6);
    for (const n of sys.npcs) expect(n.name).toMatch(/^\w+ \w+$/);
    expect(sys.npcs.map((n) => n.weaponDef?.id ?? null)).toEqual(['revolver', null, 'rifle', 'shotgun', null, null]);
    expect(sys.npcs.every((n) => n.mode === 'routine')).toBe(true);
  });

  it('a near miss makes an NPC warn without turning hostile', () => {
    const { sys, gunman, run } = setup();
    sys.onPlayerShotLanded(gunman.pos.clone().add(new THREE.Vector3(1.5, 0, 0)), null);
    expect(gunman.speech).toBeTruthy();
    expect(gunman.mode).toBe('routine');
    run(1);
    expect(gunman.mode).toBe('routine');
  });

  it('shooting the townswoman makes her flee and the nearby defender hostile', () => {
    const { sys, player, gunman, townswoman, rifle, shotgun, run } = setup();
    sys.onPlayerHitNpc(townswoman, player);
    expect(townswoman.mode).toBe('flee');
    expect(gunman.mode).toBe('hostile');
    // Not defenders (or too far away).
    expect(rifle.mode).toBe('routine');
    expect(shotgun.mode).toBe('routine');
    run(6);
    expect(townswoman.mode).toBe('hide');
    expect(townswoman.pos.distanceTo(player.pos)).toBeGreaterThan(6);
  });

  it('hostile NPCs draw, telegraph, then fire at the player', () => {
    const { sys, player, gunman, shots, run } = setup();
    player.pos.set(2, 0, 4); // across the street, in sight
    sys.onPlayerHitNpc(gunman, player);
    run(0.5); // draw + telegraph not yet done
    expect(shots).toHaveLength(0);
    run(4);
    expect(shots.length).toBeGreaterThan(0);
    expect(shots.every((s) => s.npc === gunman && s.shot.weapon.id === 'revolver')).toBe(true);
  });

  it('each weapon keeps its own distance and fire pattern', () => {
    const { sys, player, rifle, shotgun, shots, run } = setup();
    // Shotgunner: player 14 units away → closes in to the short preferred range.
    player.pos.set(shotgun.pos.x - 14, 0, shotgun.pos.z);
    sys.onPlayerHitNpc(shotgun, player);
    run(8);
    expect(shotgun.pos.distanceTo(player.pos)).toBeLessThan(WEAPONS.shotgun.ai.preferredRange[1] + 1.5);
    const pellets = shots.filter((s) => s.npc === shotgun).map((s) => s.shot.dirs.length);
    expect(pellets.length).toBeGreaterThan(0);
    expect(Math.min(...pellets)).toBeGreaterThanOrEqual(6);

    // Rifle: player walks up close → she backs off towards her long range.
    player.pos.set(rifle.pos.x + 4, 0, rifle.pos.z - 4);
    sys.onPlayerHitNpc(rifle, player);
    const before = rifle.pos.distanceTo(player.pos);
    run(4);
    expect(rifle.pos.distanceTo(player.pos)).toBeGreaterThan(before + 2);
  });

  it('calms down after the player stays away for the calm time', () => {
    const { sys, player, gunman, run } = setup();
    sys.onPlayerHitNpc(gunman, player);
    expect(gunman.mode).toBe('hostile');
    player.pos.set(45, 0, 45); // far out of range
    run(CONFIG.npc.calmTime - 5);
    expect(gunman.mode).toBe('hostile');
    run(10);
    expect(gunman.mode).toBe('routine');
  });

  it('a fifth NPC with its own look and an inline weapon needs only data', () => {
    const fifth: NpcDef = {
      id: 'preacher',
      name: 'Silas Crane',
      attitude: 'neutral',
      defendsOthers: false,
      appearance: {
        body: 'male',
        skin: PAL.skinDark,
        hair: PAL.cream,
        hairStyle: 'long',
        clothing: { hat: 'cowboy_hat_black', top: 'shirt_cream', outerwear: 'duster_sand', neck: 'bandana_red', legs: 'trousers_brown', boots: 'boots_black' },
      },
      weapon: {
        ...WEAPONS.revolver,
        id: 'derringer',
        name: 'Derringer',
        magazine: 2,
        damage: 40,
        range: 12,
        look: { kind: 'pistol', barrelLength: 0.14, barrels: 2, metal: PAL.brass, wood: PAL.cream },
      },
      spawn: [4, 3],
      routine: { kind: 'idle', at: [4, 3], facing: Math.PI },
      lines: { greet: ['Repent.'] },
    };
    const sys = new NpcSystem([...NPCS, fifth], wd.collision, nav, wd.occluders);
    const npc = sys.npcs[sys.npcs.length - 1];
    expect(npc.name).toBe('Silas Crane');
    expect(npc.weaponDef?.id).toBe('derringer');
    npc.interact();
    expect(npc.speech).toBe('Repent.');

    const player = { pos: new THREE.Vector3(4, 0, 9), mounted: false, dead: false };
    const fired: string[] = [];
    sys.onPlayerHitNpc(npc, player);
    for (let t = 0; t < 4; t += DT) sys.update(DT, player, [], (n, shot) => n === npc && fired.push(shot.weapon.id));
    expect(fired.length).toBeGreaterThan(0);
    expect(fired.every((id) => id === 'derringer')).toBe(true);
  });

  it('carry their weapon plus 1-2 boxes of matching ammo; the unarmed carry nothing', () => {
    const { gunman, townswoman, rifle } = setup();
    expect(gunman.equipment.weapons[0]?.defId).toBe('revolver');
    const boxes = gunman.inventory.items.filter((i) => i.defId === 'ammo_revolver').length;
    expect(boxes).toBeGreaterThanOrEqual(1);
    expect(boxes).toBeLessThanOrEqual(2);
    expect(rifle.inventory.ammoCount('rifleAmmo')).toBeGreaterThan(0);
    expect(townswoman.inventory.isEmpty).toBe(true);
    expect(gunman.equipment.clothing.holster?.defId).toBe('holster_leather');
  });

  it('reload from their own pockets and flee once out of ammo', () => {
    const { sys, player, gunman, run } = setup();
    player.pos.set(2, 0, 4);
    gunman.inventory.takeAmmo('revolverAmmo', 999);
    gunman.inventory.placeAnywhere(createItem('ammo_revolver', 3));
    sys.onPlayerHitNpc(gunman, player);
    run(30);
    expect(gunman.inventory.ammoCount('revolverAmmo')).toBe(0);
    expect(['flee', 'hide']).toContain(gunman.mode);
  });

  it('dead NPCs become lootable, and say so once emptied', () => {
    const { sys, gunman } = setup();
    const opened: string[] = [];
    gunman.onLoot = (n) => opened.push(n.name);
    gunman.hit(gunman.pos, gunman.pos, { damage: 999, shooter: null });
    expect(gunman.canInteract()).toBe(true);
    expect(gunman.label).toBe(`Loot ${gunman.name}`);
    gunman.interact();
    expect(opened).toEqual([gunman.name]);
    const bag = new GridContainer(8, 4);
    takeAll(gunman.inventory, bag, [{ holder: gunman.equipment, key: 'w0' }]);
    expect(gunman.label).toBe(`Loot ${gunman.name} (empty)`);
    expect(bag.items.some((i) => i.defId === 'revolver' && i.loadedRounds === 6)).toBe(true);
    void sys;
  });

  it('two merchants (a man and a woman) trade instead of talking', () => {
    const { sys, player } = setup();
    const [gunsmith, tailor] = sys.npcs.filter((n) => n.def.shop);
    expect([gunsmith.def.shop, tailor.def.shop]).toEqual(['gunsmith', 'tailor']);
    expect([gunsmith.def.appearance.body, tailor.def.appearance.body]).toEqual(['male', 'female']);
    expect(gunsmith.def.routine.kind).toBe('lean');
    expect(gunsmith.label).toBe(`Trade with ${gunsmith.name}`);
    const opened: string[] = [];
    tailor.onTrade = (n) => opened.push(n.name);
    tailor.interact();
    expect(opened).toEqual([tailor.name]);
    // They stand on open ground in front of the buildings, and flee (unarmed) when shot.
    for (const n of [gunsmith, tailor]) {
      const p = { x: n.pos.x, z: n.pos.z };
      wd.collision.resolveCircle(p, CONFIG.npc.radius);
      expect(Math.hypot(p.x - n.pos.x, p.z - n.pos.z)).toBeLessThan(1e-3); // not inside anything
    }
    sys.onPlayerHitNpc(tailor, player);
    expect(tailor.mode).toBe('flee');
    expect(tailor.canInteract()).toBe(false);
  });

  it('the gunsmith sells guns, ammo and bandages; the tailor only clothes', () => {
    const cat = (id: string) => ITEMS[id].category;
    const guns = MERCHANT_SHOPS.gunsmith;
    const tailor = MERCHANT_SHOPS.tailor;
    expect(new Set(guns.stock.map((e) => cat(e.item)))).toEqual(new Set(['weapon', 'ammo', 'consumable']));
    expect(guns.stock.some((e) => e.item === 'bandage')).toBe(true);
    expect(tailor.stock.every((e) => cat(e.item) === 'clothing')).toBe(true);
    expect(tailor.buys).toEqual(['clothing']);
    // One shared purse for both shops.
    const purse = { dollars: 100, earned: 0 };
    const a = new Economy(guns.stock, purse);
    const b = new Economy(tailor.stock, purse);
    a.buy(guns.stock.find((e) => e.item === 'bandage')!, new GridContainer(8, 4), Infinity);
    expect(b.wallet).toBe(80);
  });

  it('hostile and fleeing NPCs cannot be talked to', () => {
    const { sys, player, gunman, townswoman } = setup();
    expect(gunman.canInteract()).toBe(true);
    sys.onPlayerHitNpc(townswoman, player);
    expect(gunman.canInteract()).toBe(false);
    expect(townswoman.canInteract()).toBe(false);
  });
});
