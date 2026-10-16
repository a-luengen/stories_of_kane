import type { QuestRuntime } from './QuestRuntime';
import type { DialogChoice, DialogDef, DialogNode } from './types';

/** A quest dialog an NPC can hold right now. */
export interface OfferedDialog {
  quest: string;
  dialog: DialogDef;
}

/**
 * The quest dialogs of an NPC (`<poi>:<npc>`) whose conditions hold, from every loaded pack: an
 * offer says `{ quest, status: available }`, a step's lines `{ status: active, step }`. Running
 * quests' dialogs come first.
 */
export function dialogsFor(rt: QuestRuntime, npc: string): OfferedDialog[] {
  const out: OfferedDialog[] = [];
  const ids = [...new Set([...rt.active.map((q) => q.id), ...rt.catalog.map((e) => e.id)])];
  for (const quest of ids) {
    for (const d of rt.pack(quest)?.dialogs ?? []) if (d.npc === npc && rt.checkAll(d.if, quest)) out.push({ quest, dialog: d });
  }
  return out;
}

export interface DialogLine {
  /** Who says it: the NPC's name, "You", or a name from the pack. */
  speaker: string;
  /** The NPC is speaking (murmur in their voice). */
  npcSpeaks: boolean;
  text: string;
  mood: NonNullable<DialogNode['mood']>;
  choices: { text: string; locked: boolean }[];
}

export interface DialogHost {
  /** The NPC's name (for `{npc}` and the speaker plate) and greeting (the topic list). */
  npcName: string;
  greeting: string;
  /** The NPC trades: their topic list keeps a "Trade" choice. */
  merchant: boolean;
  poi: string;
  /** "Trade" was picked (the dialog closes first). */
  openShop(): void;
}

interface Option {
  text: string;
  locked: boolean;
  pick: () => void;
}

/**
 * One conversation: with a single quest topic it opens on that dialog; with several (or at a
 * merchant) it opens on a topic list (each quest, Trade, Goodbye). Choices whose conditions fail
 * are hidden, or greyed out when `showLocked`. Picking one runs its actions and moves on; no next
 * node (or an `end` action) closes it.
 */
export class DialogRunner {
  line: DialogLine | null = null;
  private options: Option[] = [];
  private current: { offer: OfferedDialog; node: DialogNode } | null = null;
  ended = false;

  constructor(
    private rt: QuestRuntime,
    private offers: OfferedDialog[],
    private host: DialogHost,
  ) {
    if (offers.length === 1 && !host.merchant) this.enter(offers[0], offers[0].dialog.start);
    else this.topics();
  }

  /** The topic list: one entry per quest dialog, Trade for merchants, Goodbye. */
  private topics(): void {
    this.current = null;
    const opts: Option[] = this.offers.map((o) => ({
      text: this.rt.pack(o.quest)?.title ?? o.quest,
      locked: false,
      pick: () => this.enter(o, o.dialog.start),
    }));
    if (this.host.merchant)
      opts.push({
        text: 'Trade',
        locked: false,
        pick: () => {
          this.end();
          this.host.openShop();
        },
      });
    opts.push({ text: 'Goodbye.', locked: false, pick: () => this.end() });
    this.show({ speaker: this.host.npcName, npcSpeaks: true, text: this.host.greeting, mood: 'greet' }, opts);
  }

  private enter(offer: OfferedDialog, nodeId: string): void {
    const node = offer.dialog.nodes.find((n) => n.id === nodeId);
    if (!node) {
      this.end();
      return;
    }
    this.current = { offer, node };
    const visible = (node.choices ?? []).map((c, i) => ({ c, i, ok: this.rt.checkAll(c.if, offer.quest) })).filter((x) => x.ok || x.c.showLocked);
    const opts: Option[] = visible.map(({ c, i, ok }) => ({ text: this.fill(c.text), locked: !ok, pick: () => this.choose(offer, node, c, i) }));
    if (opts.length === 0) opts.push({ text: 'Goodbye.', locked: false, pick: () => this.end() });
    const speaker = node.speaker === 'player' ? 'You' : !node.speaker || node.speaker === 'npc' ? this.host.npcName : node.speaker;
    this.show({ speaker, npcSpeaks: !node.speaker || node.speaker === 'npc', text: this.fill(node.text), mood: node.mood ?? 'greet' }, opts);
  }

  private choose(offer: OfferedDialog, node: DialogNode, c: DialogChoice, index: number): void {
    const rt = this.rt;
    rt.dialogChoice(offer.quest, offer.dialog.id, node.id, index, this.host.poi);
    let goOn = true;
    for (const a of c.do ?? []) {
      if (a.type === 'openShop') {
        this.end();
        this.host.openShop();
        return;
      }
      if (!rt.run([a], offer.quest)) goOn = false;
    }
    if (this.ended) return;
    if (!goOn || !c.next) this.end();
    else this.enter(offer, c.next);
  }

  private show(line: Omit<DialogLine, 'choices'>, opts: Option[]): void {
    this.options = opts;
    this.line = { ...line, choices: opts.map((o) => ({ text: o.text, locked: o.locked })) };
  }

  /** Pick a choice (0-based). Locked ones do nothing. Returns whether it was taken. */
  pick(i: number): boolean {
    const o = this.options[i];
    if (!o || o.locked || this.ended) return false;
    o.pick();
    return true;
  }

  /** Leave (Esc): counts as "end". */
  end(): void {
    if (this.ended) return;
    if (this.current) this.rt.dialogChoice(this.current.offer.quest, this.current.offer.dialog.id, this.current.node.id, 'end', this.host.poi);
    this.ended = true;
    this.line = null;
    this.options = [];
  }

  private fill(text: string): string {
    return text.replaceAll('{npc}', this.host.npcName);
  }
}
