import { describe, expect, it } from 'vitest';
import { Player } from '../entities/Player';
import { createItem } from '../items/ItemInstance';
import { gameQuestWorld } from './questWorld';
import type { Playthrough } from '../core/Playthrough';
import type { Session } from '../core/Session';
import { SANDBOX_WORLD } from '../data/world';

describe('the game as quests see it', () => {
  it('rewards that don\'t fit in the bags land at the player\'s feet', () => {
    const player = new Player();
    const bags = player.inventory;
    // Fill every cell.
    while (bags.placeAnywhere(createItem('bandage', 5)));
    const dropped: string[] = [];
    const session = { dropToWorld: (i: { defId: string; quantity: number }) => dropped.push(`${i.defId}x${i.quantity}`) } as unknown as Session;
    const purse = { dollars: 10, earned: 0 };
    const w = gameQuestWorld({ playthrough: { player, poi: 'kanes-crossing', world: SANDBOX_WORLD } as unknown as Playthrough, purse, session: () => session, quests: () => null, toast: () => {} });
    const before = w.countItem('map_scrap_ranch');
    expect(w.giveItem('map_scrap_ranch', 1)).toBe(1);
    expect(w.countItem('map_scrap_ranch')).toBe(before);
    expect(dropped).toEqual(['map_scrap_ranchx1']);
    w.giveMoney(15);
    expect(w.money()).toBe(25);
    expect(w.takeMoney(30)).toBe(false);
    // Taking out of the bags: smallest stacks first, across stacks.
    const n = w.countItem('bandage');
    expect(w.takeItem('bandage', 7)).toBe(7);
    expect(w.countItem('bandage')).toBe(n - 7);
    expect(w.poiName('two-spurs-ranch')).toBe('Two Spurs Ranch');
  });
});
