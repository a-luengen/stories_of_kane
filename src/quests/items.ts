import type { ItemDef } from '../data/types';
import { registerItem } from '../items/ItemDef';
import type { QuestPack } from './types';

/** A pack's items as game items (unknown to the game until the pack loads). */
export function questItemDefs(pack: QuestPack, base: string): ItemDef[] {
  return (pack.items ?? []).map((it) => ({
    id: it.id,
    name: it.name,
    description: it.description,
    category: 'quest',
    size: it.size ?? { w: 1, h: 1 },
    stackable: it.stackable ?? false,
    maxStack: it.stackable ? 20 : 1,
    quest: {
      id: pack.id,
      shape: it.shape,
      colors: it.colors,
      iconUrl: it.icon ? `${base}${pack.id}/icons/${it.icon}` : undefined,
      questItem: it.questItem ?? true,
      keepAfterQuest: it.keepAfterQuest ?? false,
    },
  }));
}

export function registerQuestItems(pack: QuestPack, base: string): void {
  for (const d of questItemDefs(pack, base)) registerItem(d);
}
