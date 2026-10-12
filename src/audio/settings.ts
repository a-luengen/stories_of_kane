/** Volume settings (0..1 each), remembered in localStorage. */
export interface AudioSettings {
  master: number;
  effects: number;
  voices: number;
  ambience: number;
  muted: boolean;
}

export const DEFAULT_SETTINGS: AudioSettings = { master: 0.8, effects: 0.9, voices: 0.8, ambience: 0.6, muted: false };

const KEY = 'stories-of-kane.audio';

export function loadSettings(storage: Pick<Storage, 'getItem'> | null = safeStorage()): AudioSettings {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const s = JSON.parse(raw) as Partial<AudioSettings>;
    const vol = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : d);
    return {
      master: vol(s.master, DEFAULT_SETTINGS.master),
      effects: vol(s.effects, DEFAULT_SETTINGS.effects),
      voices: vol(s.voices, DEFAULT_SETTINGS.voices),
      ambience: vol(s.ambience, DEFAULT_SETTINGS.ambience),
      muted: s.muted === true,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s: AudioSettings, storage: Pick<Storage, 'setItem'> | null = safeStorage()): void {
  try {
    storage?.setItem(KEY, JSON.stringify(s));
  } catch {
    // Private mode / blocked storage: the settings just don't stick.
  }
}

function safeStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}
