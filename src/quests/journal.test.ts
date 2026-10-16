import { describe, expect, it, vi } from 'vitest';
import { Player } from '../entities/Player';
import { InventoryUI } from '../ui/InventoryUI';
import { JournalPanel } from '../ui/JournalPanel';
import { journalEntries, type JournalWords } from './journal';
import { FakeWorld, pack, runtime } from './testkit';
import type { QuestPack } from './types';

vi.mock('../audio/uiSound', () => ({ uiSound: () => {} }));

const words = (world: FakeWorld, over: Partial<JournalWords> = {}): JournalWords => ({
  get poi() {
    return world.poi;
  },
  poiName: world.poiName,
  discovery: world.discovery,
  itemName: (id) => ({ poster: 'Wanted Poster', bandage: 'Bandage' })[id] ?? id,
  npcName: (ref) => (ref === 'kanes-crossing:gunsmith' && world.poi === 'kanes-crossing' ? 'Wade Harlan' : null),
  ...over,
});

const BOUNTY: QuestPack = pack('bounty', {
  title: 'Bounty',
  description: 'Bring in the gang.',
  giver: 'kanes-crossing:gunsmith',
  npcs: [{ id: 'boss', poi: 'rattlesnake-gulch', spawn: [0, 0], group: 'gang', def: { name: 'Black Jack' } }],
  steps: [
    { id: 'talk', type: 'talk', npc: 'kanes-crossing:gunsmith', objective: 'Hear him out' },
    { id: 'ride', type: 'goto', poi: 'two-spurs-ranch', objective: 'Ride north' },
    { id: 'kill', type: 'defeat', group: 'gang', count: 3, objective: 'Deal with the gang', fail: [{ type: 'timer', seconds: 90 }] },
    { id: 'poster', type: 'collect', item: 'poster', objective: 'Take the poster' },
  ],
  rewards: { money: 50, items: [{ item: 'bandage', count: 2 }] },
  fail: [{ type: 'npcDies', npc: 'kanes-crossing:gunsmith' }, { type: 'npcDies', npc: 'rattlesnake-gulch:boss' }, { type: 'itemLost', item: 'poster' }],
});

describe('the journal', () => {
  it('done steps ticked, the current one with its progress and POI, later ones hidden', async () => {
    const { rt, world } = runtime([BOUNTY]);
    await rt.start('bounty');
    rt.emit({ type: 'talkedTo', poi: 'kanes-crossing', npc: 'gunsmith' });
    let [q] = journalEntries(rt, words(world));
    expect(q).toMatchObject({
      title: 'Bounty',
      status: 'active',
      giver: "Wade Harlan, Kane's Crossing",
      description: 'Bring in the gang.',
      steps: [
        { text: 'Hear him out', done: true },
        { text: 'Ride north (Two Spurs Ranch)', done: false },
      ],
      next: 'Ride north (Two Spurs Ranch)',
      rewards: ['$50', 'Bandage x2'],
    });
    world.poi = 'two-spurs-ranch';
    rt.emit({ type: 'poiEntered', poi: 'two-spurs-ranch' });
    rt.update(30);
    [q] = journalEntries(rt, words(world));
    expect(q.steps.at(-1)).toEqual({ text: 'Deal with the gang', done: false, progress: '0/3' });
    expect(q.steps).toHaveLength(3); // (the poster step is still hidden)
    expect(q.giver).toBe("The gunsmith, Kane's Crossing"); // (not here: no name to read off him)
    expect(q.fails).toEqual(["If the gunsmith (Kane's Crossing) dies", 'If Black Jack dies', 'If you lose the Wanted Poster', 'Time left: 1:00']);
  });

  it('never names a place you haven\'t heard of', async () => {
    const p = pack('secret', {
      giver: 'rattlesnake-gulch:outlaw-fire',
      steps: [{ id: 'go', type: 'goto', poi: 'rattlesnake-gulch', objective: 'Find the canyon east of town' }],
      fail: [{ type: 'npcDies', npc: 'rattlesnake-gulch:outlaw-fire' }],
    });
    const { rt, world } = runtime([p]);
    await rt.start('secret');
    const [q] = journalEntries(rt, words(world));
    const all = JSON.stringify(q);
    expect(all).not.toContain('Rattlesnake');
    expect(q.next).toBe('Find the canyon east of town');
    expect(q.giver).toBe('The outlaw fire');
    world.disc.set('rattlesnake-gulch', 'hidden');
    expect(journalEntries(rt, words(world))[0].next).toBe('Find the canyon east of town (Rattlesnake Gulch)');
  });

  it('active quests first, then completed (all steps ticked), then failed and abandoned with the reason', async () => {
    const { rt, world } = runtime([pack('done'), pack('lost', { fail: [{ type: 'npcDies', npc: 'kanes-crossing:tailor', reason: 'The tailor is dead' }] }), pack('gave-up', { restartable: true }), pack('going', { steps: [{ id: 'x', type: 'talk', npc: 'kanes-crossing:gunsmith', objective: 'x' }] })]);
    await rt.start('done');
    rt.emit({ type: 'talkedTo', poi: 'kanes-crossing', npc: 'tailor' });
    await rt.start('lost');
    rt.emit({ type: 'npcKilled', poi: 'kanes-crossing', npc: 'tailor' });
    await rt.start('gave-up');
    rt.abandon('gave-up');
    await rt.start('going');
    const list = journalEntries(rt, words(world));
    expect(list.map((q) => [q.id, q.status, q.failReason ?? null])).toEqual([
      ['going', 'active', null],
      ['done', 'completed', null],
      ['lost', 'failed', 'The tailor is dead'],
      ['gave-up', 'abandoned', 'Abandoned'],
    ]);
    expect(list[1].steps).toEqual([{ text: 'Talk to the tailor', done: true }]);
    expect(list[1].next).toBeNull();
  });
});

describe('the QUESTS tab', () => {
  vi.stubGlobal('document', { createElement: () => ({ getContext: () => null, width: 0, height: 0 }) });
  const ptr = { x: 0, y: 0, pressed: false, released: false, moved: false };
  const keys = (tab = false) => ({ rotate: false, shift: false, tab });

  it('Tab / Q switches between INVENTORY and QUESTS (only with a journal: not in wave mode)', () => {
    const journal = { entries: () => [], abandon: vi.fn() };
    const ui = new InventoryUI({ player: new Player(), icons: {} as never, dropToWorld: () => {}, toast: () => {}, journal }, {} as never);
    ui.openInventory();
    ui.update(0, ptr, keys(true), 342, 192);
    expect(ui.tab).toBe('quests');
    ui.update(0, ptr, keys(true), 342, 192);
    expect(ui.tab).toBe('inventory');
    ui.openInventory('quests');
    expect(ui.tab).toBe('quests');

    const wave = new InventoryUI({ player: new Player(), icons: {} as never, dropToWorld: () => {}, toast: () => {} }, {} as never);
    wave.openInventory('quests');
    wave.update(0, ptr, keys(true), 342, 192);
    expect(wave.tab).toBe('inventory');
  });

  it('Abandon asks first; yes abandons', () => {
    const abandon = vi.fn();
    const panel = new JournalPanel({ entries: () => [{ id: 'a', title: 'A', status: 'active', giver: '', description: '', steps: [], next: 'x', rewards: [], fails: [] }], abandon });
    const ctx = new Proxy({}, { get: () => () => {} }) as unknown as CanvasRenderingContext2D;
    const r = { x: 10, y: 20, w: 300, h: 130 };
    panel.draw(ctx, r, ptr, 342, 192);
    // The button sits bottom-right of the panel.
    panel.update({ ...ptr, x: r.x + r.w - 10, y: r.y + r.h - 8, pressed: true }, 342, 192);
    expect(panel.confirm?.items.map((i) => i.label)).toEqual(['ABANDON', 'KEEP']);
    expect(abandon).not.toHaveBeenCalled();
    panel.confirm!.items[0].action();
    expect(abandon).toHaveBeenCalledWith('a');
  });
});
