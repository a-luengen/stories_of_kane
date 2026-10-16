/**
 * The quest pack format (`public/quests/<id>/quest.json`) and the catalog (`public/quests/index.json`).
 * Only the engine lives in the bundle; every quest's content is data fetched when it's needed.
 *
 * References to things in the world are global, `<poiId>:<id>`: an NPC (`kanes-crossing:gunsmith`),
 * a container (`kanes-crossing:chest-porch`) or a named area (`the-ridge:camp-entrance`). The same
 * local id on two POIs names two different things.
 */

export const QUEST_FORMAT_VERSION = 1;

export type QuestMode = 'story' | 'sandbox';

/** `<poiId>:<id>` */
export type Ref = string;

// ---------------------------------------------------------------- catalog

export interface CatalogEntry {
  id: string;
  title: string;
  /** Who offers it (proximity prefetch loads the pack when you come near). */
  giver: Ref;
  modes: QuestMode[];
  /** All must hold for the quest to be offered (e.g. another quest completed). */
  requires?: Condition[];
  /** Starts by itself on a new story game. */
  storyStart?: boolean;
  /** As in the pack (needed before the pack is loaded, e.g. after a reload). */
  repeatable?: boolean;
  restartable?: boolean;
  /** Pack version (bump to bust caches). */
  version: number;
}

export interface QuestCatalog {
  formatVersion: number;
  quests: CatalogEntry[];
}

// ---------------------------------------------------------------- conditions & actions

export type Condition =
  | { type: 'quest'; quest: string; status: QuestStatus | 'available' | 'notStarted'; step?: string }
  | { type: 'hasItem'; item: string; count?: number }
  | { type: 'money'; atLeast: number }
  | { type: 'flag'; flag: string; value?: FlagValue }
  | { type: 'poi'; poi: string }
  | { type: 'discovered'; poi: string; state: 'visible' | 'hidden' | 'undiscovered' | 'known' }
  | { type: 'not'; cond: Condition }
  /** At least one of them. */
  | { type: 'any'; conds: Condition[] };

export type FlagValue = boolean | number | string;

export type Action =
  | { type: 'startQuest'; quest: string }
  /** Complete the quest's current step (`quest` defaults to the pack's own). */
  | { type: 'advance'; quest?: string }
  /** Hand over what the current `deliver` step asks for (taken from the bags). */
  | { type: 'deliver'; quest?: string }
  | { type: 'failQuest'; quest?: string; reason: string }
  | { type: 'giveItem'; item: string; count?: number }
  | { type: 'takeItem'; item: string; count?: number }
  | { type: 'giveMoney'; amount: number }
  | { type: 'takeMoney'; amount: number }
  | { type: 'setFlag'; flag: string; value?: FlagValue }
  | { type: 'spawn'; npc: Ref }
  | { type: 'despawn'; npc: Ref }
  | { type: 'openShop' }
  | { type: 'reveal'; poi: string }
  | { type: 'revealPath'; path: string }
  | { type: 'toast'; text: string }
  | { type: 'end' };

// ---------------------------------------------------------------- steps

/** Something a step puts in the world on its POI (applied once, also after leaving and coming back). */
export type SetupDef =
  | { type: 'spawn'; npc: Ref }
  | { type: 'placeItem'; item: string; count?: number; container: Ref }
  | { type: 'placeItem'; item: string; count?: number; area: Ref }
  | { type: 'placeItem'; item: string; count?: number; corpse: Ref };

export type FailDef =
  | { type: 'npcDies'; npc: Ref; reason?: string }
  | { type: 'itemLost'; item: string; reason?: string }
  | { type: 'timer'; seconds: number; reason?: string };

interface StepBase {
  id: string;
  /** What to do next ("Find the letter in the saloon"). Never name a place you haven't heard of. */
  objective: string;
  /** Progress toast label ("Bandits" → "Bandits 2/3"). */
  label?: string;
  setup?: SetupDef[];
  onStart?: Action[];
  onComplete?: Action[];
  fail?: FailDef[];
}

export type StepDef = StepBase &
  (
    /** Talk to them; with `dialog`, it's done by that dialog (an `advance` choice), not by just saying hello. */
    | { type: 'talk'; npc: Ref; dialog?: string }
    | { type: 'deliver'; npc: Ref; item: string; count?: number }
    /** Reach a named area, or arrive at a POI (`poi`), optionally carrying an item. */
    | { type: 'goto'; area?: Ref; poi?: string; carrying?: string }
    /** Kill these quest NPCs, or `count` from a quest-spawned group. */
    | { type: 'defeat'; npcs?: Ref[]; group?: string; count?: number }
    | { type: 'collect'; item: string; count?: number }
  );

export type StepType = StepDef['type'];

// ---------------------------------------------------------------- items, NPCs, dialogs (later steps)

export type QuestItemShape = 'letter' | 'key' | 'pouch' | 'box' | 'badge' | 'bottle' | 'map' | 'photo' | 'star' | 'ring';

export interface QuestItemDef {
  id: string;
  name: string;
  description: string;
  shape: QuestItemShape;
  colors?: { main?: string; accent?: string };
  /** A PNG in the pack's `icons/` folder for the inventory icon. */
  icon?: string;
  size?: { w: number; h: number };
  stackable?: boolean;
  /** Can't be sold; dropping it asks first; removed when the quest ends (unless `keepAfterQuest`). */
  questItem?: boolean;
  keepAfterQuest?: boolean;
}

export interface QuestNpcDef {
  /** Local id; the NPC is `<poi>:<id>`. */
  id: string;
  poi: string;
  /** Where it stands on its POI's map. */
  spawn: [number, number];
  /** A group for `defeat` counts. */
  group?: string;
  /** A bandit archetype: its weapon, skill and a (seeded) bandit look, hostile, holding its spot. */
  archetype?: 'gunslinger' | 'rifleman' | 'shotgunner';
  /** NpcDef fields (name, look, weapon, routine, attitude, lines, territory…) on top: used as-is. */
  def?: Record<string, unknown>;
  /** Loot on the corpse besides its gun. */
  carries?: { item: string; count?: number }[];
}

export interface DialogChoice {
  text: string;
  if?: Condition[];
  /** Show greyed out when its conditions fail (otherwise hidden). */
  showLocked?: boolean;
  do?: Action[];
  /** Next node; none ends the dialog. */
  next?: string;
}

export interface DialogNode {
  id: string;
  /** Who says it: `npc` (the one you talk to), `player`, or a name. */
  speaker?: string;
  text: string;
  mood?: 'greet' | 'warn' | 'hostile' | 'flee' | 'calm';
  choices?: DialogChoice[];
}

export interface DialogDef {
  id: string;
  /** Whose dialog it is. */
  npc: Ref;
  /** When it's offered (all must hold). */
  if?: Condition[];
  start: string;
  nodes: DialogNode[];
}

// ---------------------------------------------------------------- the pack

export interface QuestPack {
  formatVersion: number;
  id: string;
  title: string;
  description: string;
  giver: Ref;
  modes: QuestMode[];
  /** Can be taken again after completing it. */
  repeatable?: boolean;
  /** Can be taken again after failing or abandoning it. */
  restartable?: boolean;
  steps: StepDef[];
  rewards?: { money?: number; items?: { item: string; count?: number }[] };
  fail?: FailDef[];
  items?: QuestItemDef[];
  npcs?: QuestNpcDef[];
  dialogs?: DialogDef[];
  /** Has `src/quests/<id>/hooks.ts`. */
  hooks?: boolean;
}

// ---------------------------------------------------------------- runtime state

export type QuestStatus = 'active' | 'completed' | 'failed' | 'abandoned';

export interface QuestState {
  id: string;
  status: QuestStatus;
  /** Index into `steps` (== steps.length once completed). */
  step: number;
  /** Progress of the current step (kills, items). */
  counter: number;
  /** Seconds left on running fail timers: `quest:<i>` for the quest's own, `step:<i>` for the step's. */
  timers: Record<string, number>;
  failReason?: string;
  /** Times completed (repeatable quests). */
  completions: number;
}

export function splitRef(ref: Ref): { poi: string; id: string } {
  const i = ref.indexOf(':');
  return { poi: ref.slice(0, i), id: ref.slice(i + 1) };
}
