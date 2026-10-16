import { describe, expect, it, vi } from 'vitest';
import { NPCS } from '../data/npcs';
import { SANDBOX_WORLD } from '../data/world';
import { Npc } from '../entities/Npc';
import { DialogRunner, dialogsFor, type DialogHost } from './dialog';
import { QuestRuntime } from './QuestRuntime';
import { entry, FakeWorld, memoryPacks, pack, runtime } from './testkit';
import type { DialogDef, QuestPack } from './types';
import { validatePack } from './validate';

const host = (over: Partial<DialogHost> = {}): DialogHost => ({ npcName: 'Lottie Whitlock', greeting: 'Howdy.', merchant: false, poi: 'kanes-crossing', openShop: vi.fn(), ...over });

const offer = (quest: string, nodes: DialogDef['nodes'], over: Partial<DialogDef> = {}): DialogDef => ({
  id: 'offer',
  npc: 'kanes-crossing:tailor',
  if: [{ type: 'quest', quest, status: 'available' }],
  start: nodes[0].id,
  nodes,
  ...over,
});

describe('dialogs', () => {
  it('only conditions that hold: offers while takeable, step lines while on that step, none for others', async () => {
    const p = pack('a', {
      dialogs: [
        offer('a', [{ id: 'n', text: 'Help me?' }]),
        { id: 'step', npc: 'kanes-crossing:tailor', if: [{ type: 'quest', quest: 'a', status: 'active', step: 's1' }], start: 'n', nodes: [{ id: 'n', text: 'Well?' }] },
      ],
    });
    const { rt } = runtime([p]);
    expect(dialogsFor(rt, 'kanes-crossing:tailor').map((o) => o.dialog.id)).toEqual(['offer']);
    expect(dialogsFor(rt, 'kanes-crossing:gunsmith')).toEqual([]);
    expect(dialogsFor(rt, 'two-spurs-ranch:tailor')).toEqual([]); // (another POI's "tailor")
    await rt.start('a');
    expect(dialogsFor(rt, 'kanes-crossing:tailor').map((o) => o.dialog.id)).toEqual(['step']);
  });

  it('opens on the dialog itself; failing choices are hidden, or greyed and untakeable with showLocked', () => {
    const p = pack('a', {
      dialogs: [
        offer('a', [
          {
            id: 'n',
            text: 'Hello, I am {npc}.',
            mood: 'warn',
            choices: [
              { text: 'Rich option', if: [{ type: 'money', atLeast: 500 }] },
              { text: 'Locked option', if: [{ type: 'flag', flag: 'brave' }], showLocked: true, next: 'n' },
              { text: 'Here option', if: [{ type: 'poi', poi: 'kanes-crossing' }, { type: 'discovered', poi: 'rattlesnake-gulch', state: 'undiscovered' }] },
              { text: 'Bye' },
            ],
          },
        ]),
      ],
    });
    const { rt } = runtime([p]);
    const d = new DialogRunner(rt, dialogsFor(rt, 'kanes-crossing:tailor'), host());
    expect(d.line).toEqual({
      speaker: 'Lottie Whitlock',
      npcSpeaks: true,
      text: 'Hello, I am Lottie Whitlock.',
      mood: 'warn',
      choices: [
        { text: 'Locked option', locked: true },
        { text: 'Here option', locked: false },
        { text: 'Bye', locked: false },
      ],
    });
    expect(d.pick(0)).toBe(false);
    expect(d.ended).toBe(false);
    rt.flags.brave = true;
    expect(new DialogRunner(rt, dialogsFor(rt, 'kanes-crossing:tailor'), host()).line!.choices[0]).toEqual({ text: 'Locked option', locked: false });
    d.pick(2);
    expect(d.ended).toBe(true);
  });

  it('choice actions: start a quest, set flags, money, items, reveal; then on to the next node, or end', async () => {
    const p = pack('a', {
      dialogs: [
        offer('a', [
          {
            id: 'n1',
            text: 'Deal?',
            choices: [
              {
                text: 'Deal.',
                do: [
                  { type: 'startQuest', quest: 'a' },
                  { type: 'setFlag', flag: 'dealt' },
                  { type: 'takeMoney', amount: 30 },
                  { type: 'giveItem', item: 'bandage', count: 2 },
                  { type: 'reveal', poi: 'rattlesnake-gulch' },
                  { type: 'revealPath', path: 'town-gulch' },
                ],
                next: 'n2',
              },
            ],
          },
          { id: 'n2', speaker: 'player', text: 'Shake on it.', choices: [{ text: 'Done.', do: [{ type: 'end' }], next: 'n1' }] },
        ]),
      ],
    });
    const { rt, world } = runtime([p]);
    const d = new DialogRunner(rt, dialogsFor(rt, 'kanes-crossing:tailor'), host());
    d.pick(0);
    expect(rt.state('a')!.status).toBe('active'); // (at once: the next line can tell)
    expect([rt.flags.dealt, world.dollars, world.countItem('bandage'), world.discovery('rattlesnake-gulch'), world.paths]).toEqual([true, 70, 2, 'hidden', ['town-gulch']]);
    expect(d.line).toMatchObject({ speaker: 'You', npcSpeaks: false, text: 'Shake on it.' });
    d.pick(0); // `end` wins over `next`
    expect(d.ended).toBe(true);
  });

  it('advance and deliver from a dialog', async () => {
    const p = pack('a', {
      steps: [
        { id: 'talk', type: 'talk', npc: 'kanes-crossing:tailor', objective: 'Talk' },
        { id: 'give', type: 'deliver', npc: 'kanes-crossing:gunsmith', item: 'letter', objective: 'Bring the letter' },
      ],
      dialogs: [
        { id: 'a1', npc: 'kanes-crossing:tailor', if: [{ type: 'quest', quest: 'a', status: 'active', step: 'talk' }], start: 'n', nodes: [{ id: 'n', text: 'x', choices: [{ text: 'Go on', do: [{ type: 'advance' }] }] }] },
        { id: 'a2', npc: 'kanes-crossing:gunsmith', if: [{ type: 'quest', quest: 'a', status: 'active', step: 'give' }], start: 'n', nodes: [{ id: 'n', text: 'y', choices: [{ text: 'Here.', if: [{ type: 'hasItem', item: 'letter' }], do: [{ type: 'deliver' }] }] }] },
      ],
    });
    const { rt, world } = runtime([p]);
    await rt.start('a');
    new DialogRunner(rt, dialogsFor(rt, 'kanes-crossing:tailor'), host()).pick(0);
    expect(rt.state('a')!.step).toBe(1);
    world.bags.set('letter', 1);
    new DialogRunner(rt, dialogsFor(rt, 'kanes-crossing:gunsmith'), host({ npcName: 'Wade' })).pick(0);
    expect(rt.state('a')!.status).toBe('completed');
    expect(world.countItem('letter')).toBe(0);
  });

  it('a merchant (or several quests) opens on a topic list: each quest, Trade, Goodbye', () => {
    const a = pack('a', { dialogs: [offer('a', [{ id: 'n', text: 'Quest A?' }], { npc: 'kanes-crossing:gunsmith' })] });
    const b = pack('b', { dialogs: [offer('b', [{ id: 'n', text: 'Quest B?' }], { npc: 'kanes-crossing:gunsmith' })] });
    const { rt } = runtime([a, b]);
    const shop = vi.fn();
    const d = new DialogRunner(rt, dialogsFor(rt, 'kanes-crossing:gunsmith'), host({ merchant: true, greeting: 'Looking for iron?', openShop: shop }));
    expect(d.line!.text).toBe('Looking for iron?');
    expect(d.line!.choices.map((c) => c.text)).toEqual(['A', 'B', 'Trade', 'Goodbye.']);
    d.pick(1);
    expect(d.line!.text).toBe('Quest B?');
    const again = new DialogRunner(rt, dialogsFor(rt, 'kanes-crossing:gunsmith'), host({ merchant: true, openShop: shop }));
    again.pick(2);
    expect(shop).toHaveBeenCalledTimes(1);
    expect(again.ended).toBe(true);
  });

  it('an openShop action closes the dialog and opens the shop', () => {
    const shop = vi.fn();
    const { rt } = runtime([pack('a', { dialogs: [offer('a', [{ id: 'n', text: 'x', choices: [{ text: 'Show me your wares', do: [{ type: 'openShop' }], next: 'n' }] }])] })]);
    const d = new DialogRunner(rt, dialogsFor(rt, 'kanes-crossing:tailor'), host({ openShop: shop }));
    d.pick(0);
    expect(shop).toHaveBeenCalled();
    expect(d.ended).toBe(true);
  });

  it('every choice (and leaving with Esc) reaches the hooks and the event bus', () => {
    const p = pack('a', { hooks: true, dialogs: [offer('a', [{ id: 'n', text: 'x', choices: [{ text: 'Hm', next: 'n' }] }])] });
    const heard: string[] = [];
    const lp = { pack: p, hooks: () => ({ onDialogAction: (d: string, n: string, c: number) => heard.push(`hook ${d}/${n}/${c}`) }) };
    const world = new FakeWorld();
    const rt = new QuestRuntime({ catalog: [entry('a')], world, packs: { get: () => lp, load: async () => lp } });
    rt.events.on((e) => e.type === 'dialogAction' && heard.push(`event ${e.poi} ${e.action}`));
    void rt.start('a');
    rt.states.delete('a'); // (back to "available": the hooks stay attached for this test)
    const d = new DialogRunner(rt, dialogsFor(rt, 'kanes-crossing:tailor'), host());
    d.pick(0);
    d.end();
    expect(heard).toEqual(['hook offer/n/0', 'event kanes-crossing offer/n/0', 'event kanes-crossing offer/n/end']);
  });
});

describe('NPCs and quest dialog', () => {
  const tailorDef = NPCS.find((d) => d.id === 'tailor')!;
  const gunsmithDef = NPCS.find((d) => d.id === 'gunsmith')!;

  it('without quest dialog an NPC behaves exactly as before (greeting, hint, trade)', () => {
    const g = new Npc(gunsmithDef);
    const trade = vi.fn();
    g.onTrade = trade;
    g.onQuestTalk = () => false;
    g.wantsHint = () => false;
    g.interact();
    expect(gunsmithDef.lines!.greet).toContain(g.speech);
    expect(trade).toHaveBeenCalled();
    expect(g.label).toBe(`Trade with ${g.name}`);
  });

  it('a quest dialog replaces the greeting, the hint and the shop; the hint is back once it is over', () => {
    const g = new Npc(gunsmithDef);
    const trade = vi.fn();
    const heard: string[] = [];
    let questTalk = true;
    g.onTrade = trade;
    g.onQuestTalk = () => questTalk;
    g.hasQuestTalk = () => questTalk;
    g.wantsHint = () => true;
    g.onHint = (_, poi) => heard.push(poi);
    expect(g.label).toBe(`Talk to ${g.name}`);
    g.interact();
    expect([g.speech, trade.mock.calls.length, heard]).toEqual([null, 0, []]);
    questTalk = false;
    g.interact();
    expect(heard).toEqual(['two-spurs-ranch']);
    expect(g.speech).toBe(gunsmithDef.hints![0].line);
  });

  it('talking still counts for talk steps before the dialog opens', () => {
    const t = new Npc(tailorDef);
    const order: string[] = [];
    t.onTalk = () => order.push('talkedTo');
    t.onQuestTalk = () => (order.push('dialog'), true);
    t.interact();
    expect(order).toEqual(['talkedTo', 'dialog']);
  });
});

describe('The Lost Letter', () => {
  const raw = Object.values(import.meta.glob('../../public/quests/the-lost-letter/quest.json', { eager: true, import: 'default' }))[0];
  const ctx = { pois: new Set(SANDBOX_WORLD.pois.map((p) => p.id)), paths: new Set(SANDBOX_WORLD.paths.map((p) => p.id)), itemExists: () => false };

  it('is a valid pack', () => {
    const v = validatePack(raw, ctx, 'the-lost-letter');
    expect(v.ok ? [] : v.errors).toEqual([]);
  });

  it('plays through its dialogs: haggle with the tailor, find the letter, hand it to the gunsmith', () => {
    const p = raw as QuestPack;
    const world = new FakeWorld();
    const rt = new QuestRuntime({ catalog: [entry(p.id, { giver: p.giver })], world, packs: memoryPacks([p]) });
    const talk = (npc: string, merchant = false) => new DialogRunner(rt, dialogsFor(rt, `kanes-crossing:${npc}`), host({ merchant }));
    const say = (d: DialogRunner, choice: string) => {
      const i = d.line!.choices.findIndex((c) => c.text === choice);
      expect(i, `"${choice}" among ${d.line!.choices.map((c) => c.text).join(' | ')}`).toBeGreaterThanOrEqual(0);
      d.pick(i);
    };
    // The gunsmith has nothing to say about it yet.
    expect(dialogsFor(rt, 'kanes-crossing:gunsmith')).toEqual([]);
    const tailor = talk('tailor');
    say(tailor, 'Make it worth my while.');
    say(tailor, 'Deal.');
    expect(rt.state(p.id)!.status).toBe('active');
    expect(tailor.line!.text).toContain('chest on the porch');
    expect(world.toasts).toEqual(['Quest started: The Lost Letter', 'Next: Find the letter in the chest on the porch across the street']);
    // Asking again while looking.
    expect(talk('tailor').line!.text).toContain('Any luck?');
    world.bags.set('tailors-letter', 1);
    rt.update(0);
    expect(world.toasts.slice(2)).toEqual(['Sealed letter 1/1', 'Next: Bring the letter to the gunsmith']);
    // At the gunsmith's (a merchant): the topic list, then the hand-over.
    const smith = talk('gunsmith', true);
    expect(smith.line!.choices.map((c) => c.text)).toEqual(['The Lost Letter', 'Trade', 'Goodbye.']);
    say(smith, 'The Lost Letter');
    say(smith, 'A letter from the tailor.');
    expect(rt.state(p.id)!.status).toBe('completed');
    expect(world.dollars).toBe(140);
    expect(world.toasts.at(-1)).toBe('Quest complete: The Lost Letter (+$40)');
    expect(dialogsFor(rt, 'kanes-crossing:tailor')).toEqual([]); // (done: back to her usual self)
  });

  it('without the letter the hand-over is greyed out', async () => {
    const p = raw as QuestPack;
    const world = new FakeWorld();
    const rt = new QuestRuntime({ catalog: [entry(p.id)], world, packs: memoryPacks([p]) });
    await rt.start(p.id);
    rt.advance(p.id); // (asked her…)
    rt.advance(p.id); // (found it… and lost it again)
    const d = new DialogRunner(rt, dialogsFor(rt, 'kanes-crossing:gunsmith'), host());
    expect(d.line!.choices).toEqual([{ text: 'A letter from the tailor.', locked: true }, { text: 'Never mind.', locked: false }]);
  });
});
