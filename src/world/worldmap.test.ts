import { describe, expect, it } from 'vitest';
import { SANDBOX_WORLD } from '../data/world';
import { Discovery } from './Discovery';
import { DISCOVERY_VERSION, loadDiscovery, saveDiscovery } from './discoveryStore';
import { findRoute, pointAlong, polylineLength, routePoints } from './routes';
import { loadGameplay, saveGameplay } from '../settings/gameplay';
import { SandboxMode } from '../modes/SandboxMode';
import { pointInPolygon, terrainAt } from '../ui/worldmap/terrain';
import { ICON_TYPES } from '../ui/worldmap/icons';
import { POI_TYPES } from '../data/world';

/** A Map-backed stand-in for localStorage. */
const memoryStore = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), m };
};

describe('discovery rules', () => {
  it('starts from the world data: the town visited, the ranch heard of (its trail dashed), the gulch unknown', () => {
    const d = new Discovery(SANDBOX_WORLD);
    expect([d.poi('kanes-crossing'), d.poi('two-spurs-ranch'), d.poi('rattlesnake-gulch')]).toEqual(['visible', 'hidden', 'undiscovered']);
    expect(d.path('town-ranch')).toBe('hidden');
    expect(d.path('town-gulch')).toBe('undiscovered');
  });

  it('a trail is drawn solid once both ends are visited', () => {
    const d = new Discovery(SANDBOX_WORLD);
    d.arrive('two-spurs-ranch');
    expect(d.path('town-ranch')).toBe('visible');
  });

  it("an unknown place's trails stay hidden until you hear of it", () => {
    const d = new Discovery(SANDBOX_WORLD);
    d.arrive('two-spurs-ranch');
    expect(d.path('ranch-gulch')).toBe('undiscovered');
    expect(d.takeExit('two-spurs-ranch', 'east').map((r) => `${r.kind}:${r.id}:${r.state}`)).toEqual(['poi:rattlesnake-gulch:hidden', 'path:ranch-gulch:hidden']);
    d.arrive('rattlesnake-gulch');
    expect(d.path('ranch-gulch')).toBe('visible');
    expect(d.path('town-gulch')).toBe('visible'); // its other trail, to a place you know
  });

  it('nothing changes twice', () => {
    const d = new Discovery(SANDBOX_WORLD);
    expect(d.arrive('kanes-crossing')).toEqual([{ kind: 'path', id: 'town-ranch', state: 'hidden' }].filter(() => false));
    d.learn('rattlesnake-gulch');
    expect(d.learn('rattlesnake-gulch')).toEqual([]);
  });
});

describe('discovery is saved per mode', () => {
  it('round-trips through storage, per mode, versioned', () => {
    const store = memoryStore();
    const d = new Discovery(SANDBOX_WORLD);
    d.learn('rattlesnake-gulch');
    saveDiscovery('sandbox', d.save(), store);
    expect([...store.m.keys()]).toEqual(['sok.world.sandbox']);
    const again = new Discovery(SANDBOX_WORLD, loadDiscovery('sandbox', store));
    expect(again.poi('rattlesnake-gulch')).toBe('hidden');
    expect(again.path('town-gulch')).toBe('hidden');
    expect(loadDiscovery('story', store)).toBeUndefined();
    // An old or broken save is ignored.
    store.setItem('sok.world.sandbox', JSON.stringify({ v: DISCOVERY_VERSION + 1, data: d.save() }));
    expect(loadDiscovery('sandbox', store)).toBeUndefined();
    store.setItem('sok.world.sandbox', '{nope');
    expect(loadDiscovery('sandbox', store)).toBeUndefined();
  });
});

describe('fast travel routes', () => {
  it('takes the shortest chain of known trails only', () => {
    // All three visited, but only the two trails from town known.
    const all = { 'kanes-crossing': 'visible', 'two-spurs-ranch': 'visible', 'rattlesnake-gulch': 'visible' } as const;
    const d = new Discovery(SANDBOX_WORLD, { pois: all, paths: ['town-ranch', 'town-gulch'] });
    // The canyon trail (ranch ↔ gulch) is unknown: ranch → gulch goes through town.
    const route = findRoute(SANDBOX_WORLD, d, 'two-spurs-ranch', 'rattlesnake-gulch')!;
    expect(route.map((h) => `${h.from.poi}/${h.from.exit} > ${h.to.poi}/${h.to.exit}`)).toEqual([
      'two-spurs-ranch/south > kanes-crossing/north',
      'kanes-crossing/east > rattlesnake-gulch/west',
    ]);
    // Once known, the canyon trail is shorter.
    d.takeExit('two-spurs-ranch', 'east');
    expect(findRoute(SANDBOX_WORLD, d, 'two-spurs-ranch', 'rattlesnake-gulch')!.map((h) => h.path.id)).toEqual(['ranch-gulch']);
  });

  it('no route without known trails, or to where you are', () => {
    const d = new Discovery(SANDBOX_WORLD);
    expect(findRoute(SANDBOX_WORLD, d, 'kanes-crossing', 'rattlesnake-gulch')).toBeNull();
    expect(findRoute(SANDBOX_WORLD, d, 'kanes-crossing', 'kanes-crossing')).toBeNull();
  });

  it('a route is one continuous polyline from start to end', () => {
    const d = new Discovery(SANDBOX_WORLD);
    d.revealAll();
    const hops = findRoute(SANDBOX_WORLD, d, 'rattlesnake-gulch', 'kanes-crossing')!;
    const pts = routePoints(hops);
    expect(pts[0]).toEqual(SANDBOX_WORLD.pois[2].pos);
    expect(pts[pts.length - 1]).toEqual(SANDBOX_WORLD.pois[0].pos);
    expect(pointAlong(pts, 0.5)).toHaveLength(2);
    expect(polylineLength(pts)).toBeGreaterThan(90);
  });

  it('the fast-travel setting is off by default and remembered', () => {
    const store = memoryStore();
    expect(loadGameplay(store).fastTravel).toBe(false);
    saveGameplay({ fastTravel: true }, store);
    expect(loadGameplay(store).fastTravel).toBe(true);
  });
});

describe('the world map screen', () => {
  const engineSrc = Object.values(import.meta.glob<string>('../core/Engine.ts', { query: '?raw', import: 'default', eager: true }))[0];

  it('M opens and closes the map, and no longer mutes', () => {
    expect(engineSrc).not.toContain("'KeyM'");
    const mode = new SandboxMode({ lowW: 342, lowH: 192 } as never);
    (mode as unknown as { phase: string }).phase = 'play';
    expect(mode.toggleMap()).toBe(true);
    expect(mode.paused).toBe(true);
    expect(mode.toggleMap()).toBe(true);
    expect(mode.paused).toBe(false);
    // Esc closes it too.
    mode.toggleMap();
    expect(mode.escape()).toBe(true);
    expect(mode.paused).toBe(false);
    expect(mode.escape()).toBe(false);
  });

  it('every POI type has an icon; the terrain covers mountains, river, desert where authored', () => {
    expect([...ICON_TYPES].sort()).toEqual([...POI_TYPES].sort());
    expect(terrainAt(SANDBOX_WORLD, 160, 6)).toBe('mountains');
    expect(terrainAt(SANDBOX_WORLD, 160, 185)).toBe('desert');
    expect(terrainAt(SANDBOX_WORLD, 150, 112)).toBe('plains');
    expect(pointInPolygon(1, 1, [[0, 0], [2, 0], [2, 2], [0, 2]])).toBe(true);
  });
});
