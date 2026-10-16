import type { JournalQuest } from '../quests/journal';
import type { UiPointer } from './InventoryUI';
import { Dialog } from './menuWidgets';
import { drawText, textWidth } from './PixelFont';
import { UI } from './theme';
import { inRect, wrapText, type Rect } from './widgets';
import { uiSound } from '../audio/uiSound';

/** What the journal reads and does (the mode provides it; wave mode has none). */
export interface JournalHost {
  entries(): JournalQuest[];
  abandon(id: string): void;
}

type Group = 'active' | 'completed' | 'failed';

const ROW = 8;
const LEFT_W = 100;
const GROUP_TITLE: Record<Group, string> = { active: 'ACTIVE', completed: 'COMPLETED', failed: 'FAILED' };
const groupOf = (q: JournalQuest): Group => (q.status === 'active' ? 'active' : q.status === 'completed' ? 'completed' : 'failed');

/** Cut to `px` pixels wide, with "..." if it had to be cut. */
function fit(text: string, px: number): string {
  if (textWidth(text) <= px) return text;
  let t = text;
  while (t.length > 1 && textWidth(`${t}...`) > px) t = t.slice(0, -1);
  return `${t}...`;
}

/**
 * The QUESTS tab: on the left your quests (active, then completed and failed, collapsible); on
 * the right the selected one — giver, description, steps so far (ticked), what to do next,
 * rewards, how it can fail — and an Abandon button (asks first).
 */
export class JournalPanel {
  selected: string | null = null;
  readonly collapsed = new Set<Group>();
  confirm: Dialog | null = null;
  private hits: { r: Rect; act: () => void }[] = [];

  constructor(private host: JournalHost) {}

  /** Pick what's under a click (call before draw, with last frame's layout). */
  update(ptr: UiPointer, W: number, H: number): void {
    if (this.confirm) {
      this.confirm.update(W, H, ptr, { up: false, down: false, confirm: false, back: false });
      return;
    }
    if (!ptr.pressed) return;
    const h = this.hits.find((x) => inRect(x.r, ptr.x, ptr.y));
    if (h) {
      uiSound('ui.click');
      h.act();
    }
  }

  /** Esc: close the confirmation first (true if it did). */
  escape(): boolean {
    if (!this.confirm) return false;
    this.confirm = null;
    return true;
  }

  draw(ctx: CanvasRenderingContext2D, r: Rect, ptr: UiPointer, W: number, H: number): void {
    const quests = this.host.entries();
    this.hits = [];
    if (!quests.some((q) => q.id === this.selected)) this.selected = quests.find((q) => q.status === 'active')?.id ?? quests[0]?.id ?? null;

    // ---- left: the list
    const lx = r.x + 4;
    let y = r.y + 5;
    if (quests.length === 0) {
      const lines = wrapText('NO QUESTS YET. TALK TO PEOPLE AROUND - SOME OF THEM NEED A HAND.', Math.floor((r.w - 12) / 4));
      lines.forEach((l, i) => drawText(ctx, l, r.x + Math.round((r.w - textWidth(l)) / 2), r.y + Math.round(r.h / 2) - 8 + i * ROW, UI.sand));
      return;
    }
    for (const g of ['active', 'completed', 'failed'] as Group[]) {
      const list = quests.filter((q) => groupOf(q) === g);
      if (list.length === 0) continue;
      const open = !this.collapsed.has(g);
      const head = `${g === 'active' ? '' : open ? '- ' : '+ '}${GROUP_TITLE[g]} (${list.length})`;
      const headRect = { x: lx - 1, y: y - 1, w: LEFT_W, h: ROW };
      if (g !== 'active') {
        if (inRect(headRect, ptr.x, ptr.y)) {
          ctx.fillStyle = UI.darkBrown;
          ctx.fillRect(headRect.x, headRect.y, headRect.w, headRect.h);
        }
        this.hits.push({ r: headRect, act: () => (open ? this.collapsed.add(g) : this.collapsed.delete(g)) });
      }
      drawText(ctx, head, lx, y, UI.brass);
      y += ROW + 1;
      if (!open) continue;
      for (const q of list) {
        if (y > r.y + r.h - ROW) break;
        const row = { x: lx - 1, y: y - 1, w: LEFT_W, h: ROW };
        const sel = q.id === this.selected;
        if (sel || inRect(row, ptr.x, ptr.y)) {
          ctx.fillStyle = sel ? UI.wood : UI.darkBrown;
          ctx.fillRect(row.x, row.y, row.w, row.h);
        }
        const color = g === 'failed' ? UI.woodLight : g === 'completed' ? UI.sand : UI.cream;
        drawText(ctx, fit(q.title.toUpperCase(), LEFT_W - 6), lx + 3, y, sel ? UI.brassLight : color);
        this.hits.push({ r: row, act: () => (this.selected = q.id) });
        y += ROW;
      }
      y += 3;
    }
    // Divider.
    ctx.fillStyle = UI.darkBrown;
    ctx.fillRect(lx + LEFT_W + 3, r.y + 3, 1, r.h - 6);

    // ---- right: the selected quest
    const q = quests.find((x) => x.id === this.selected);
    if (!q) return;
    const rx = lx + LEFT_W + 8;
    const rw = r.x + r.w - 4 - rx;
    const chars = Math.floor(rw / 4);
    const bottom = r.y + r.h - (q.status === 'active' ? 16 : 4);
    y = r.y + 5;
    // Lay the page out first, then make it fit: earlier steps fold into one line, then the
    // description gets shorter. What to do next, rewards and how it can fail always show.
    type Line = { text: string; color: string; next?: boolean };
    const wrap = (text: string, color: string, next = false): Line[] => wrapText(text.toUpperCase(), chars - 1).map((t) => ({ text: t, color, next }));
    const head = [...wrap(q.title, UI.brassLight), ...(q.giver ? wrap(`From ${q.giver}`, UI.sand) : [])];
    let desc = q.description ? wrap(q.description, UI.cream) : [];
    const stepLines = (fold: boolean): Line[] => {
      const done = q.steps.filter((x) => x.done);
      const items = fold && done.length > 1 ? [{ text: `${done.length} earlier steps done`, done: true }, ...q.steps.filter((x) => !x.done)] : q.steps;
      return items.flatMap((st) => wrap(`${st.done ? '[X] ' : '[ ] '}${st.text}${'progress' in st && st.progress ? `  ${st.progress}` : ''}`, st.done ? UI.woodLight : UI.cream));
    };
    const tail = [
      ...(q.status === 'active' && q.next ? wrap(`Next: ${q.next}`, UI.brassLight, true) : []),
      ...(q.status !== 'active' ? wrap(q.status === 'completed' ? 'Completed' : `Failed: ${q.failReason ?? ''}`, q.status === 'completed' ? UI.green : UI.rust) : []),
      ...(q.rewards.length ? wrap(`Rewards: ${q.rewards.join(', ')}`, UI.sand) : []),
      ...q.fails.flatMap((f) => wrap(f, UI.rust)),
    ];
    const LH = ROW - 1;
    const room = Math.floor((bottom - y) / LH) - 3; // (three small gaps between sections)
    let steps = stepLines(false);
    if (head.length + desc.length + steps.length + tail.length > room) steps = stepLines(true);
    const over = head.length + desc.length + steps.length + tail.length - room;
    if (over > 0 && desc.length > 0) {
      desc = desc.slice(0, Math.max(1, desc.length - over));
      desc[desc.length - 1] = { ...desc[desc.length - 1], text: `${desc[desc.length - 1].text}...` };
    }
    const draw = (lines: Line[]) => {
      for (const l of lines) {
        if (y > bottom - ROW) return;
        if (l.next) {
          ctx.fillStyle = UI.darkBrown;
          ctx.fillRect(rx - 2, y - 2, rw + 2, LH);
        }
        drawText(ctx, l.text, rx, y, l.color);
        y += LH;
      }
    };
    draw(head);
    y += 3;
    draw(desc);
    y += 3;
    draw(steps);
    y += 3;
    draw(tail);

    // ---- Abandon (asks first)
    if (q.status === 'active') {
      const label = 'ABANDON';
      const b = { x: r.x + r.w - textWidth(label) - 12, y: r.y + r.h - 13, w: textWidth(label) + 8, h: 10 };
      const over = inRect(b, ptr.x, ptr.y);
      ctx.fillStyle = over ? UI.rust : UI.darkBrown;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      drawText(ctx, label, b.x + 4, b.y + 3, over ? UI.cream : UI.sand);
      this.hits.push({
        r: b,
        act: () =>
          (this.confirm = new Dialog('ABANDON QUEST?', `Give up on ${q.title}? Its quest items and people will be gone.`, [
            {
              label: 'ABANDON',
              action: () => {
                this.confirm = null;
                this.host.abandon(q.id);
              },
            },
            { label: 'KEEP', action: () => (this.confirm = null) },
          ])),
      });
    }

    if (this.confirm) {
      ctx.fillStyle = 'rgba(31,21,16,0.5)';
      ctx.fillRect(0, 0, W, H);
      this.confirm.draw(ctx, W, H);
    }
  }
}
