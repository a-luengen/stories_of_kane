import { banditAppearance, ENEMIES } from '../data/enemies';
import type { AppearanceConfig, NpcDef } from '../data/types';
import { PAL } from '../render/palette';
import { Rng } from '../util/math';
import type { QuestNpcDef } from './types';

/** A stable seed from text (so a quest NPC looks the same every time it spawns). */
export function seedOf(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** A plain townsfolk look for quest NPCs that don't bring their own. */
const TOWNSFOLK: AppearanceConfig = {
  body: 'male',
  skin: PAL.skin,
  hair: PAL.brown,
  hairStyle: 'short',
  clothing: { hat: 'cowboy_hat_brown', top: 'shirt_grey', legs: 'trousers_brown', boots: 'boots_brown', belt: 'belt_leather' },
};

/** How far a quest NPC holding a spot notices you, unless the pack says otherwise. */
const DEFAULT_TERRITORY = 16;

/**
 * The game's NpcDef for a pack's NPC: the archetype's weapon, skill and look (bandits), the pack's
 * own fields on top. Hostile quest NPCs hold their spot (a territory) instead of hunting you
 * across the map; quest NPCs never respawn.
 */
export function questNpcDef(n: QuestNpcDef, quest: string): NpcDef {
  const own = (n.def ?? {}) as Partial<NpcDef>;
  const arch = n.archetype ? ENEMIES[n.archetype] : null;
  const rng = new Rng(seedOf(`${quest}/${n.poi}/${n.id}`));
  const attitude = own.attitude ?? (arch ? 'hostile' : 'neutral');
  const def: NpcDef = {
    attitude,
    defendsOthers: arch !== null,
    appearance: arch ? banditAppearance(arch, () => rng.next()) : TOWNSFOLK,
    weapon: arch?.weapon ?? null,
    routine: { kind: 'idle', at: n.spawn, facing: rng.range(0, Math.PI * 2) },
    ...(arch ? { tactics: arch.tactics, hp: arch.hp, inaccuracy: arch.inaccuracy, reactionTime: arch.reactionTime } : {}),
    ...own,
    id: n.id,
    spawn: n.spawn,
    respawns: false,
    questId: quest,
  };
  if (attitude === 'hostile' && !def.territory) def.territory = { at: n.spawn, radius: DEFAULT_TERRITORY };
  return def;
}
