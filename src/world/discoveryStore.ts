import type { DiscoveryData } from './Discovery';

/** Bump when the saved shape changes (older saves are then ignored). */
export const DISCOVERY_VERSION = 1;

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const key = (mode: string) => `sok.world.${mode}`;

function storage(): Store | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/** What's been discovered in a mode's world (undefined: nothing saved, or an old version). */
export function loadDiscovery(mode: string, store: Store | null = storage()): DiscoveryData | undefined {
  try {
    const raw = store?.getItem(key(mode));
    if (!raw) return undefined;
    const s = JSON.parse(raw) as { v?: number; data?: DiscoveryData };
    if (s.v !== DISCOVERY_VERSION || !s.data || typeof s.data.pois !== 'object' || !Array.isArray(s.data.paths)) return undefined;
    return s.data;
  } catch {
    return undefined;
  }
}

export function saveDiscovery(mode: string, data: DiscoveryData, store: Store | null = storage()): void {
  try {
    store?.setItem(key(mode), JSON.stringify({ v: DISCOVERY_VERSION, data }));
  } catch {
    // Private mode / blocked storage: discovery just doesn't persist.
  }
}

export function clearDiscovery(mode: string, store: Store | null = storage()): void {
  try {
    store?.removeItem(key(mode));
  } catch {
    // ignore
  }
}
