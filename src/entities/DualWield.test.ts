import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { CONFIG } from '../config';
import { WEAPONS } from '../data/weapons';
import { Equipment } from '../items/Equipment';
import { GridContainer } from '../items/GridContainer';
import { createItem } from '../items/ItemInstance';
import { beginDrag, cancelDrag, dropDrag, quickEquip, takeAll } from '../items/transfer';
import { composeWave } from '../modes/WaveDirector';
import { Player } from './Player';
import { GunSet, WeaponState, type Hand } from './Weapon';

const DT = 1 / 60;
const aim = new THREE.Vector3(0, 1.2, 10);
const origin = () => new THREE.Vector3(0, 1.4, 0);

/** A revolver + derringer pair loaded from a bag of revolver rounds. */
function pair(bagRounds = 50) {
  const bag = new GridContainer(8, 4);
  if (bagRounds > 0) bag.placeAnywhere(createItem('ammo_revolver', bagRounds));
  const right = new WeaponState(WEAPONS.revolver, createItem('revolver'), bag);
  const left = new WeaponState(WEAPONS.derringer, createItem('derringer'), bag);
  return { bag, set: new GunSet(right, left) };
}

/** Hold the trigger for `seconds`; returns the hands and times of each shot. */
function hold(set: GunSet, seconds: number): { hand: Hand; t: number }[] {
  const out: { hand: Hand; t: number }[] = [];
  for (let t = 0; t < seconds; t += DT) {
    set.update(DT);
    const shot = set.fire(origin, aim, 1, 0);
    if (shot) out.push({ hand: shot.hand!, t });
  }
  return out;
}

describe('dual wielding: eligibility', () => {
  it('revolvers and derringers are dual-wieldable; long guns are not', () => {
    expect(WEAPONS.revolver.dualWieldable).toBe(true);
    expect(WEAPONS.derringer.dualWieldable).toBe(true);
    expect(WEAPONS.rifle.dualWieldable).toBe(false);
    expect(WEAPONS.shotgun.dualWieldable).toBe(false);
  });

  it('the off-hand sub-slot takes a second handgun only next to a handgun', () => {
    const eq = new Equipment();
    expect(eq.accepts('o0', createItem('revolver'))).toBe(false); // nothing in slot 1 yet
    eq.put('w0', createItem('revolver'), null);
    expect(eq.accepts('o0', createItem('revolver'))).toBe(true);
    expect(eq.accepts('o0', createItem('derringer'))).toBe(true);
    expect(eq.accepts('o0', createItem('rifle'))).toBe(false);
    eq.put('w1', createItem('rifle'), null);
    expect(eq.accepts('o1', createItem('revolver'))).toBe(false); // rifle: single only
    const d = new Equipment();
    d.put('w0', createItem('derringer'), null);
    expect(d.put('o0', createItem('derringer'), null)).toBe(true); // derringer + derringer
  });

  it('removing either gun returns the slot to single wielding', () => {
    const eq = new Equipment();
    const a = createItem('revolver');
    const b = createItem('derringer');
    eq.put('w0', a, null);
    eq.put('o0', b, null);
    expect(eq.take('o0')).toBe(b);
    expect(eq.get('w0')).toBe(a);
    eq.put('o0', b, null);
    // Taking the main gun: the off-hand one becomes the main.
    expect(eq.take('w0')).toBe(a);
    expect(eq.get('w0')).toBe(b);
    expect(eq.get('o0')).toBeNull();
  });

  it('dragging the main gun away and dropping it back restores the pair', () => {
    const eq = new Equipment();
    const a = createItem('revolver');
    const b = createItem('revolver');
    eq.put('w0', a, null);
    eq.put('o0', b, null);
    const d = beginDrag({ kind: 'slot', holder: eq, key: 'w0' })!;
    expect(eq.get('w0')).toBe(b);
    cancelDrag(d);
    expect(eq.get('w0')).toBe(a);
    expect(eq.get('o0')).toBe(b);
    // A long gun can't go in a dual slot's main hand without clearing it first.
    const bag = new GridContainer(8, 4);
    const rifle = createItem('rifle');
    bag.place(rifle, 0, 0);
    const r = beginDrag({ kind: 'grid', grid: bag, x: 0, y: 0 })!;
    expect(dropDrag(r, { kind: 'slot', holder: eq, key: 'w0' }, bag).ok).toBe(false);
    expect(eq.get('w0')).toBe(a);
    expect(eq.get('o0')).toBe(b);
    expect(bag.find(rifle)).toBeTruthy();
  });

  it('double-clicking a handgun next to the selected single handgun fills the off-hand', () => {
    const eq = new Equipment();
    eq.put('w0', createItem('revolver'), null);
    const bag = new GridContainer(8, 4);
    const second = createItem('derringer');
    bag.place(second, 0, 0);
    expect(quickEquip(second, bag, eq, 0).ok).toBe(true);
    expect(eq.get('o0')).toBe(second);
    // Selected slot holds a rifle: a handgun goes to the first free slot instead.
    const eq2 = new Equipment();
    eq2.put('w0', createItem('rifle'), null);
    const rev = createItem('revolver');
    bag.place(rev, 2, 0);
    expect(quickEquip(rev, bag, eq2, 0).ok).toBe(true);
    expect(eq2.get('w1')).toBe(rev);
  });

  it('take all from a corpse gets both guns', () => {
    const corpse = new Equipment();
    corpse.put('w0', createItem('revolver'), null);
    corpse.put('o0', createItem('derringer'), null);
    const bag = new GridContainer(8, 4);
    takeAll(new GridContainer(4, 4), bag, [
      { holder: corpse, key: 'o0' },
      { holder: corpse, key: 'w0' },
    ]);
    expect(bag.items.map((i) => i.defId).sort()).toEqual(['derringer', 'revolver']);
    expect(corpse.get('w0')).toBeNull();
  });
});

describe('dual wielding: firing and reloading', () => {
  it('alternates right → left → right, each gun using its own rounds', () => {
    const { set } = pair();
    const shots = hold(set, 0.6);
    expect(shots.slice(0, 4).map((s) => s.hand)).toEqual(['right', 'left', 'right', 'left']);
    expect(set.right.ammo).toBe(6 - shots.filter((s) => s.hand === 'right').length);
    expect(set.left!.ammo).toBe(2 - shots.filter((s) => s.hand === 'left').length);
  });

  it('fires every (slower gun interval × dualFireIntervalMultiplier) while both are loaded', () => {
    const { set } = pair();
    const shots = hold(set, 0.5);
    const want = Math.max(WEAPONS.revolver.fireInterval, WEAPONS.derringer.fireInterval) * CONFIG.weapons.dualFireIntervalMultiplier;
    expect(shots[1].t - shots[0].t).toBeCloseTo(want, 1);
    expect(want).toBeLessThan(WEAPONS.revolver.fireInterval); // faster than one revolver
  });

  it('with one gun empty the other keeps firing at its own single rate', () => {
    const { set } = pair(0);
    set.left!.ammo = 0;
    const shots = hold(set, 1.2);
    expect(shots.every((s) => s.hand === 'right')).toBe(true);
    expect(shots[1].t - shots[0].t).toBeCloseTo(WEAPONS.revolver.fireInterval, 1);
  });

  it('reload refills both, taking (longer reload × dualReloadMultiplier)', () => {
    const { set, bag } = pair(40);
    set.right.ammo = 1;
    set.left!.ammo = 0;
    expect(set.startReload()).toBe(true);
    const want = Math.max(WEAPONS.revolver.reloadTime, WEAPONS.derringer.reloadTime) * CONFIG.weapons.dualReloadMultiplier;
    expect(set.reloadTime).toBeCloseTo(want);
    let t = 0;
    while (set.reloading && t < 10) {
      set.update(DT);
      t += DT;
    }
    expect(t).toBeCloseTo(want, 1);
    expect(set.right.ammo).toBe(6);
    expect(set.left!.ammo).toBe(2);
    expect(bag.ammoCount('revolverAmmo')).toBe(40 - 5 - 2);
  });

  it('both empty: the trigger starts the reload; nothing to load: dry', () => {
    const { set } = pair(10);
    set.right.ammo = 0;
    set.left!.ammo = 0;
    expect(set.fire(origin, aim, 1, 0)).toBeNull();
    expect(set.reloading).toBe(true);
    const empty = pair(0).set;
    empty.right.ammo = empty.left!.ammo = 0;
    expect(empty.dry).toBe(true);
    expect(empty.startReload()).toBe(false);
  });

  it('a single gun behaves exactly as before', () => {
    const bag = new GridContainer(8, 4);
    const single = new GunSet(new WeaponState(WEAPONS.revolver, createItem('revolver'), bag));
    const shots = hold(single, 1);
    expect(shots.every((s) => s.hand === 'right')).toBe(true);
    expect(shots[1].t - shots[0].t).toBeCloseTo(WEAPONS.revolver.fireInterval, 1);
  });
});

describe('dual wielding: player and waves', () => {
  it('the player shoots both guns from either side of the body, on foot and mounted', () => {
    for (const mounted of [false, true]) {
      const p = new Player();
      p.setPosition(new THREE.Vector3(0, 0, 0));
      p.mounted = mounted;
      p.equipment.put('o0', createItem('revolver'), null);
      p.syncEquipment();
      expect(p.weapon!.dual).toBe(true);
      const shots: { hand: Hand; x: number }[] = [];
      const input = { moveX: 0, moveZ: 0, sprint: false, fireHeld: true, reload: false, holster: false, select: null, aim: new THREE.Vector3(0, 1, 10) };
      for (let t = 0; t < 2; t += DT) {
        const s = p.updateWeapon(DT, input);
        if (s) shots.push({ hand: s.hand!, x: s.origin.x });
      }
      expect(shots.length).toBeGreaterThan(4);
      const right = shots.filter((s) => s.hand === 'right');
      const left = shots.filter((s) => s.hand === 'left');
      expect(right.length).toBeGreaterThan(0);
      expect(left.length).toBeGreaterThan(0);
      // Facing +Z, the right hand is on -X in world space; the left one on +X.
      expect(Math.sign(right[0].x)).toBe(-Math.sign(left[0].x));
    }
  });

  it(`gunslingers start dual wielding from wave ${CONFIG.wave.dualWieldFromWave}`, () => {
    const duals = (w: number) => composeWave(w).enemies.filter((e) => e.dual);
    for (let w = 1; w < CONFIG.wave.dualWieldFromWave; w++) expect(duals(w)).toHaveLength(0);
    for (const w of [CONFIG.wave.dualWieldFromWave, 8, 12]) {
      const d = duals(w);
      expect(d.length).toBeGreaterThan(0);
      expect(d.every((e) => e.archetype === 'gunslinger')).toBe(true);
    }
  });
});
