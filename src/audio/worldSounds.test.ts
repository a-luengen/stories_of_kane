import { describe, expect, it } from 'vitest';
import { SOUNDS } from '../data/sounds';
import { CONTAINER_TYPES } from '../world/Container';

/** Every .ts source under src (tests excluded), as text. */
const SOURCES = Object.entries(import.meta.glob<string>(['../**/*.ts', '!../**/*.test.ts'], { query: '?raw', import: 'default', eager: true }));

describe('sound ids used in the code', () => {
  it('every literal uiSound / play / waveCue id exists in SOUNDS', () => {
    const used = new Set<string>();
    expect(SOURCES.length).toBeGreaterThan(50);
    for (const [, src] of SOURCES) {
      for (const m of src.matchAll(/(?:uiSound|\.play)\('([a-zA-Z.]+)'/g)) used.add(m[1]);
      for (const m of src.matchAll(/waveCue\('([a-zA-Z]+)'\)/g)) used.add(`wave.${m[1]}`);
      for (const m of src.matchAll(/'(inv\.[a-zA-Z]+|shop\.[a-z]+|wave\.[a-zA-Z]+)'/g)) used.add(m[1]);
    }
    expect(used.size).toBeGreaterThan(15);
    for (const id of used) expect(SOUNDS[id], id).toBeTruthy();
  });

  it('every container type has a lid sound', () => {
    for (const kind of Object.keys(CONTAINER_TYPES)) expect(SOUNDS[`lid.${kind}`], kind).toBeTruthy();
  });

  it('UI feedback plays on the UI bus (it keeps going while panels pause the world)', () => {
    for (const [id, def] of Object.entries(SOUNDS)) {
      if (/^(inv|shop|ui|wave)\./.test(id) || (id.startsWith('lid.') && id !== 'lid.close')) expect(def.bus, id).toBe('ui');
    }
  });
});
