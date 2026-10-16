import { CONFIG } from '../config';
import type { Engine } from '../core/Engine';
import { STORY_WORLD } from '../data/world';
import { clearQuestSave, loadQuestSave } from '../quests/save';
import { clearDiscovery, loadDiscovery } from '../world/discoveryStore';
import { FrontierMode } from './FrontierMode';

/** Is there a story to continue? */
export function hasStorySave(): boolean {
  return loadQuestSave('story') !== undefined || loadDiscovery('story') !== undefined;
}

/**
 * The story (first version): Kane's Crossing and the Ridge, no waves; its quests are the
 * catalog's story quests, and a new game begins with the one marked `storyStart`. Continuing
 * puts you back on the POI (and at the exit) where you were.
 */
export class StoryMode extends FrontierMode {
  constructor(engine: Engine, opts: { newGame?: boolean } = {}) {
    const newGame = opts.newGame || !hasStorySave();
    if (newGame) {
      // A new story wipes the old one: quests and discovery.
      clearQuestSave('story');
      clearDiscovery('story');
    }
    const resume = newGame ? undefined : loadQuestSave('story')?.where;
    super(engine, { kind: 'story', world: STORY_WORLD, startingDollars: CONFIG.story.startingDollars, resume, newGame });
  }
}
