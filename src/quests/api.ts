import type { QuestEvent, QuestEventType } from './events';
import type { FlagValue, QuestState, Ref, StepDef } from './types';

/**
 * What a quest's `hooks.ts` may do: read its state, move it on, hand things out, talk to the
 * player, react to events. Never engine internals.
 */
export interface QuestApi {
  readonly questId: string;
  state(): Readonly<QuestState> | null;
  currentStep(): StepDef | null;
  flag(name: string): FlagValue | undefined;
  setFlag(name: string, value?: FlagValue): void;
  advance(): void;
  fail(reason: string): void;
  giveItem(item: string, count?: number): void;
  takeItem(item: string, count?: number): number;
  countItem(item: string): number;
  giveMoney(amount: number): void;
  takeMoney(amount: number): boolean;
  money(): number;
  spawn(npc: Ref): void;
  despawn(npc: Ref): void;
  /** Open one of the pack's dialogs (with the NPC it belongs to). */
  startDialog(dialogId: string): void;
  toast(text: string): void;
  /** The POI the player is on. */
  poi(): string;
  reveal(poi: string): void;
  revealPath(path: string): void;
  /** Seconds left on the quest's running timer(s) (the smallest), or null. */
  timeLeft(): number | null;
  /** Listen to game events (unsubscribed when the quest ends). */
  on(type: QuestEventType, fn: (e: QuestEvent) => void): void;
}

/** A quest's script hooks (all optional). */
export interface QuestHooks {
  onStart?(): void;
  onStepStart?(step: StepDef, index: number): void;
  onStepComplete?(step: StepDef, index: number): void;
  onEvent?(e: QuestEvent): void;
  onDialogAction?(dialogId: string, nodeId: string, choice: number): void;
  onPoiEnter?(poi: string): void;
  onComplete?(): void;
  onFail?(reason: string): void;
}

/** `src/quests/<id>/hooks.ts` default-exports one of these. */
export type QuestHooksFactory = (api: QuestApi) => QuestHooks;
