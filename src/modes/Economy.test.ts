import { describe, expect, it } from 'vitest';
import { ECONOMY } from '../data/economy';
import { SHOP } from '../data/shop';
import { GridContainer } from '../items/GridContainer';
import { createItem } from '../items/ItemInstance';
import { Economy } from './Economy';

const entry = (id: string) => SHOP.find((e) => e.item === id)!;

describe('Economy', () => {
  it('pays per kill (bonus on horseback) and per cleared wave', () => {
    const e = new Economy();
    expect(e.killReward('rifleman', false)).toBe(ECONOMY.killReward.rifleman);
    expect(e.killReward('gunslinger', true)).toBe(ECONOMY.killReward.gunslinger + ECONOMY.mountedBonus);
    expect(e.waveBonus(4)).toBeGreaterThan(e.waveBonus(1));
    e.earn(30);
    expect([e.wallet, e.earned]).toEqual([30, 30]);
  });

  it('buys into the inventory and takes the money', () => {
    const e = new Economy();
    e.earn(100);
    const bag = new GridContainer(8, 4);
    const r = e.buy(entry('ammo_revolver'), bag, 1);
    expect(r.ok).toBe(true);
    expect(e.wallet).toBe(100 - entry('ammo_revolver').price);
    expect(bag.ammoCount('revolverAmmo')).toBe(entry('ammo_revolver').quantity);
  });

  it('refuses when unaffordable, locked or out of space (and changes nothing)', () => {
    const e = new Economy();
    e.earn(50);
    const bag = new GridContainer(8, 4);
    expect(e.buy(entry('rifle'), bag, 5)).toEqual({ ok: false, reason: 'funds' });
    e.earn(200);
    expect(e.buy(entry('shotgun'), bag, 1)).toEqual({ ok: false, reason: 'locked' });
    const tiny = new GridContainer(2, 2);
    tiny.place(createItem('revolver'), 0, 0);
    const before = e.wallet;
    expect(e.buy(entry('ammo_shells'), tiny, 1)).toEqual({ ok: false, reason: 'space' });
    expect(e.wallet).toBe(before);
    expect(tiny.items).toHaveLength(1);
  });

  it('buying tries the rotated orientation', () => {
    const e = new Economy();
    e.earn(500);
    const bag = new GridContainer(1, 4); // a 4×1 rifle only fits standing up
    const r = e.buy(entry('rifle'), bag, 9);
    expect(r.ok).toBe(true);
    expect(bag.items[0].rotated).toBe(true);
  });

  it('sells for half the price; ammo per round', () => {
    const e = new Economy();
    expect(e.sellValue(createItem('revolver'))).toBe(Math.floor(entry('revolver').price * 0.5));
    const box = entry('ammo_rifle');
    const half = createItem('ammo_rifle', box.quantity / 2);
    expect(e.sellValue(half)).toBe(Math.floor((box.price / box.quantity) * (box.quantity / 2) * 0.5));
    expect(e.sell(createItem('revolver'))).toBe(30);
    expect(e.wallet).toBe(30);
  });
});
