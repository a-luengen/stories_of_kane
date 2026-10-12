/** Gameplay options (pause menu → Gameplay), remembered in localStorage. */
export interface GameplaySettings {
  /** Click a visited place on the world map to travel there along known trails. */
  fastTravel: boolean;
}

const KEY = 'sok.settings.gameplay';
const DEFAULTS: GameplaySettings = { fastTravel: false };

type Store = Pick<Storage, 'getItem' | 'setItem'>;

function storage(): Store | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function loadGameplay(store: Store | null = storage()): GameplaySettings {
  try {
    const s = JSON.parse(store?.getItem(KEY) ?? '{}') as Partial<GameplaySettings>;
    return { fastTravel: s.fastTravel === true };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveGameplay(s: GameplaySettings, store: Store | null = storage()): void {
  try {
    store?.setItem(KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

/** The live settings (shared by the pause menu and the modes). */
export const gameplay: GameplaySettings = loadGameplay();

export function setFastTravel(on: boolean): void {
  gameplay.fastTravel = on;
  saveGameplay(gameplay);
}
