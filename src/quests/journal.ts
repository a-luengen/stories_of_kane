import type { QuestRuntime } from './QuestRuntime';
import { splitRef, type FailDef, type QuestStatus, type StepDef } from './types';

/** One quest as the journal shows it. */
export interface JournalQuest {
  id: string;
  title: string;
  status: QuestStatus;
  /** "The tailor, Kane's Crossing" (a place you haven't heard of is never named). */
  giver: string;
  description: string;
  /** Done steps and the current one; later steps stay hidden. */
  steps: { text: string; done: boolean; progress?: string }[];
  /** What to do next (active quests). */
  next: string | null;
  rewards: string[];
  /** Fail conditions that apply now (the quest's own and the current step's). */
  fails: string[];
  failReason?: string;
}

/** What the journal needs to know about the world to word things. */
export interface JournalWords {
  poi: string;
  poiName(poi: string): string;
  discovery(poi: string): 'visible' | 'hidden' | 'undiscovered';
  itemName(item: string): string;
  /** A world NPC's name if it's known (the one standing on the current POI), else null. */
  npcName(npc: string): string | null;
}

/** "gunsmith" → "the gunsmith", "outlaw-fire" → "the outlaw fire". */
const humanize = (id: string) => `the ${id.replace(/[-_]+/g, ' ')}`;

const clock = (s: number) => {
  const t = Math.max(0, Math.ceil(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};

/**
 * The journal's view of every quest that has been taken: active ones first, then completed,
 * then failed and abandoned. Only quests whose pack is loaded show their steps (packs of finished
 * quests aren't fetched again after a reload).
 */
export function journalEntries(rt: QuestRuntime, w: JournalWords): JournalQuest[] {
  const order: Record<QuestStatus, number> = { active: 0, completed: 1, failed: 2, abandoned: 2 };
  const place = (poi: string) => (w.discovery(poi) === 'undiscovered' ? null : w.poiName(poi));
  const who = (ref: string): string => {
    const { poi, id } = splitRef(ref);
    for (const q of rt.states.keys()) {
      const n = rt.pack(q)?.npcs?.find((x) => x.poi === poi && x.id === id);
      const name = n?.def?.name;
      if (typeof name === 'string') return name;
    }
    return w.npcName(ref) ?? humanize(id);
  };
  const progress = (step: StepDef, counter: number): string | undefined => {
    if (step.type === 'collect') return `${counter}/${step.count ?? 1}`;
    if (step.type === 'defeat') {
      const need = step.count ?? step.npcs?.length ?? 0;
      return need > 1 ? `${counter}/${need}` : undefined;
    }
    return undefined;
  };
  const failText = (f: FailDef, timers: Record<string, number>, key: string): string => {
    if (f.type === 'npcDies') {
      const at = place(splitRef(f.npc).poi);
      return `If ${who(f.npc)}${at && splitRef(f.npc).poi !== w.poi ? ` (${at})` : ''} dies`;
    }
    if (f.type === 'itemLost') return `If you lose the ${w.itemName(f.item)}`;
    return `Time left: ${clock(timers[key] ?? f.seconds)}`;
  };

  return [...rt.states.values()]
    .sort((a, b) => order[a.status] - order[b.status])
    .map((q): JournalQuest => {
      const pack = rt.pack(q.id);
      const entry = rt.entry(q.id);
      const giverRef = pack?.giver ?? entry?.giver ?? '';
      const giverPlace = giverRef ? place(splitRef(giverRef).poi) : null;
      const giver = giverRef ? `${who(giverRef).replace(/^the /, 'The ')}${giverPlace ? `, ${giverPlace}` : ''}` : '';
      const out: JournalQuest = {
        id: q.id,
        title: pack?.title ?? entry?.title ?? q.id,
        status: q.status,
        giver,
        description: pack?.description ?? '',
        steps: [],
        next: null,
        rewards: [],
        fails: [],
        failReason: q.status === 'abandoned' ? 'Abandoned' : q.failReason,
      };
      if (!pack) return out;
      const shown = q.status === 'active' ? q.step + 1 : q.status === 'completed' ? pack.steps.length : q.step + 1;
      pack.steps.slice(0, Math.min(shown, pack.steps.length)).forEach((s, i) => {
        const current = q.status === 'active' && i === q.step;
        out.steps.push(current ? { text: rt.objectiveLine(s), done: false, progress: progress(s, q.counter) } : { text: s.objective, done: i < q.step || q.status === 'completed' });
      });
      if (q.status === 'active') {
        const step = pack.steps[q.step];
        out.next = step ? rt.objectiveLine(step) : null;
        (pack.fail ?? []).forEach((f, i) => out.fails.push(failText(f, q.timers, `quest:${i}`)));
        (step?.fail ?? []).forEach((f, i) => out.fails.push(failText(f, q.timers, `step:${q.step}:${i}`)));
      }
      if (pack.rewards?.money) out.rewards.push(`$${pack.rewards.money}`);
      for (const it of pack.rewards?.items ?? []) out.rewards.push(`${w.itemName(it.item)}${(it.count ?? 1) > 1 ? ` x${it.count}` : ''}`);
      return out;
    });
}
