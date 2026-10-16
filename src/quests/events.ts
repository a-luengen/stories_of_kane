/**
 * The game events quests listen to. Every event names the POI it happened on, so a target on
 * another POI never matches by accident (the same NPC id on two POIs is two different NPCs).
 */
export type QuestEvent =
  | { type: 'npcKilled'; poi: string; npc: string }
  /** An animal died to a bullet (`byPlayer`: the player's). */
  | { type: 'animalKilled'; poi: string; species: string; byPlayer: boolean }
  | { type: 'talkedTo'; poi: string; npc: string }
  | { type: 'itemAdded'; poi: string; item: string; count: number }
  /** `byQuest`: a quest took it (delivered / handed over), so it isn't "lost". */
  | { type: 'itemRemoved'; poi: string; item: string; count: number; byQuest?: boolean }
  | { type: 'areaEntered'; poi: string; area: string }
  | { type: 'poiEntered'; poi: string }
  | { type: 'poiLeft'; poi: string }
  | { type: 'poiDiscovered'; poi: string; state: 'visible' | 'hidden' }
  | { type: 'containerOpened'; poi: string; container: string }
  | { type: 'dialogAction'; poi: string; quest: string; action: string };

export type QuestEventType = QuestEvent['type'];

/** A tiny typed event bus: the game emits, the quest runtime (and hooks) listen. */
export class QuestEventBus {
  private listeners = new Set<(e: QuestEvent) => void>();

  on(fn: (e: QuestEvent) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit(e: QuestEvent): void {
    for (const fn of [...this.listeners]) fn(e);
  }
}
