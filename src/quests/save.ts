import type { QuestMode } from './types';
import type { QuestSaveData } from './QuestRuntime';

export const QUEST_SAVE_VERSION = 1;

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const key = (mode: QuestMode) => `sok.quests.${mode}`;
const storage = (): Store | null => {
  try {
    return localStorage;
  } catch {
    return null;
  }
};

/** The quest save of a mode (undefined if none, outdated or broken). */
export function loadQuestSave(mode: QuestMode, store: Store | null = storage()): QuestSaveData | undefined {
  try {
    const raw = store?.getItem(key(mode));
    if (!raw) return undefined;
    const v = JSON.parse(raw) as { v?: number; data?: QuestSaveData };
    if (v.v !== QUEST_SAVE_VERSION || !v.data || typeof v.data.quests !== 'object') return undefined;
    return { quests: v.data.quests, flags: v.data.flags ?? {}, pois: v.data.pois ?? {}, held: v.data.held ?? {}, where: v.data.where };
  } catch {
    return undefined;
  }
}

export function saveQuests(mode: QuestMode, data: QuestSaveData, store: Store | null = storage()): void {
  try {
    store?.setItem(key(mode), JSON.stringify({ v: QUEST_SAVE_VERSION, data }));
  } catch {
    // Blocked storage: play on without saving.
  }
}

export function clearQuestSave(mode: QuestMode, store: Store | null = storage()): void {
  try {
    store?.removeItem(key(mode));
  } catch {
    // (nothing to clear)
  }
}
