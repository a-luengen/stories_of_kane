import type { NpcDef } from '../data/types';
import type { ExitDef } from '../data/world';
import type { TargetSystem } from '../entities/Targets';
import type { WorldData } from './props';
import type { HorseState } from './poiState';

/** Builds a POI's map (it may fill the target system with shootables). */
export type MapBuilder = (targets: TargetSystem, exits: readonly ExitDef[]) => WorldData;

/** What a POI map module provides. */
export interface PoiMap {
  build: MapBuilder;
  /** Who lives there. */
  npcs: readonly NpcDef[];
  /** Horses of the place (put out on the first visit; afterwards they're part of its saved state). */
  horses?: readonly HorseState[];
}

/**
 * Every POI map, loaded on demand: a POI's code (and data) is only fetched the first time it's
 * needed, and kept afterwards.
 */
export const POI_MAPS: Record<string, () => Promise<PoiMap>> = {
  'kanes-crossing': async () => {
    const [{ buildSandboxMap }, { NPCS }] = await Promise.all([import('./maps/sandbox'), import('../data/npcs')]);
    return { build: buildSandboxMap, npcs: NPCS };
  },
  'two-spurs-ranch': async () => {
    const m = await import('./maps/twoSpursRanch');
    return { build: m.buildRanchMap, npcs: m.RANCH_NPCS, horses: m.RANCH_HORSES };
  },
  'rattlesnake-gulch': async () => {
    const m = await import('./maps/rattlesnakeGulch');
    return { build: m.buildGulchMap, npcs: m.GULCH_NPCS };
  },
};

/** Loads POI maps once each (later requests get the same promise). */
export class PoiMapRegistry {
  private loaded = new Map<string, Promise<PoiMap>>();

  constructor(private loaders: Record<string, () => Promise<PoiMap>> = POI_MAPS) {}

  get ids(): string[] {
    return Object.keys(this.loaders);
  }

  load(id: string): Promise<PoiMap> {
    let p = this.loaded.get(id);
    if (!p) {
      const loader = this.loaders[id];
      if (!loader) return Promise.reject(new Error(`No map for POI "${id}"`));
      p = loader();
      this.loaded.set(id, p);
    }
    return p;
  }

  isLoaded(id: string): boolean {
    return this.loaded.has(id);
  }
}
