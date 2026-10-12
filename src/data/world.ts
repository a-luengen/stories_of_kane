import type { Vec2 } from './types';

/** What a place looks like on the world map (each has its own pixel icon). */
export type PoiType = 'town' | 'village' | 'farm' | 'canyon' | 'prairie' | 'desert' | 'stream' | 'mine' | 'station' | 'caves' | 'camp' | 'outpost';
export const POI_TYPES: readonly PoiType[] = ['town', 'village', 'farm', 'canyon', 'prairie', 'desert', 'stream', 'mine', 'station', 'caves', 'camp', 'outpost'];

/** Visible = known and visited; hidden = known, not visited ("?"); undiscovered = not shown. */
export type DiscoveryState = 'visible' | 'hidden' | 'undiscovered';

/** A way in and out of a POI map. */
export interface ExitDef {
  id: string;
  /** Centre of the exit zone on the POI map (world units of that map). */
  at: Vec2;
  /** Half size of the zone (x, z). */
  half: Vec2;
  /** Where you stand when arriving through this exit, and which way you face (yaw, 0 = +Z). */
  arrive: Vec2;
  facing: number;
}

export interface PoiDef {
  id: string;
  name: string;
  type: PoiType;
  /** Position on the world map (world-map units). */
  pos: Vec2;
  /** Key into the POI map registry (world/poiMaps.ts). */
  map: string;
  start: DiscoveryState;
  description: string;
  exits: ExitDef[];
}

export interface PathEnd {
  poi: string;
  exit: string;
}

/** A trail between two POI exits, drawn along `route` on the world map. */
export interface PathDef {
  id: string;
  from: PathEnd;
  to: PathEnd;
  /** World-map polyline between the two POIs (endpoints included). */
  route: Vec2[];
  start: DiscoveryState;
}

export type TerrainKind = 'mountains' | 'mesa' | 'canyon' | 'desert' | 'prairie' | 'plains' | 'forest' | 'river' | 'stream' | 'lake';

/** Terrain for the world map: areas are polygons, rivers and streams are lines (with a width). */
export interface TerrainShape {
  kind: TerrainKind;
  /** Closed polygon (areas) or polyline (river / stream). */
  points: Vec2[];
  /** Lines: width in world-map units. */
  width?: number;
}

export interface WorldDef {
  /** Which mode this world belongs to (discovery is saved per mode). */
  mode: string;
  /** World-map size (units). */
  size: Vec2;
  /** Ground everywhere no shape covers. */
  base: TerrainKind;
  terrain: TerrainShape[];
  pois: PoiDef[];
  paths: PathDef[];
  /** Where a new playthrough starts. */
  start: { poi: string };
}

// ------------------------------------------------------------------------------------------------

/** The sandbox frontier: a town, a ranch to the north and a canyon to the east. */
export const SANDBOX_WORLD: WorldDef = {
  mode: 'sandbox',
  size: [320, 200],
  base: 'plains',
  start: { poi: 'kanes-crossing' },
  pois: [
    {
      id: 'kanes-crossing',
      name: "Kane's Crossing",
      type: 'town',
      pos: [150, 112],
      map: 'kanes-crossing',
      start: 'visible',
      description: 'A dusty crossroads town with a saloon, a gunsmith and a tailor.',
      exits: [
        // East road, past the shooting range.
        { id: 'east', at: [47, 0], half: [2.5, 3.5], arrive: [43.5, 0], facing: -Math.PI / 2 },
        // North trail, between the buildings and past the water tower.
        { id: 'north', at: [0, -47], half: [3.5, 2.5], arrive: [0, -43.5], facing: 0 },
      ],
    },
    {
      id: 'two-spurs-ranch',
      name: 'Two Spurs Ranch',
      type: 'farm',
      pos: [128, 46],
      map: 'two-spurs-ranch',
      start: 'hidden',
      description: 'Horse country: corrals, a big barn and a windmill on the prairie.',
      exits: [
        { id: 'south', at: [0, 37], half: [3.5, 2.5], arrive: [0, 33.5], facing: Math.PI },
        // The unmarked canyon trail.
        { id: 'east', at: [37, -10], half: [2.5, 3.5], arrive: [33.5, -10], facing: -Math.PI / 2 },
      ],
    },
    {
      id: 'rattlesnake-gulch',
      name: 'Rattlesnake Gulch',
      type: 'canyon',
      pos: [252, 96],
      map: 'rattlesnake-gulch',
      start: 'undiscovered',
      description: 'A dry canyon of tall cliffs and old mine workings. Outlaws are said to camp there.',
      exits: [
        { id: 'west', at: [-37, 0], half: [2.5, 3.5], arrive: [-33.5, 0], facing: Math.PI / 2 },
        { id: 'north', at: [10, -37], half: [3.5, 2.5], arrive: [10, -33.5], facing: 0 },
      ],
    },
  ],
  paths: [
    {
      id: 'town-ranch',
      from: { poi: 'kanes-crossing', exit: 'north' },
      to: { poi: 'two-spurs-ranch', exit: 'south' },
      route: [[150, 112], [146, 92], [138, 74], [131, 58], [128, 46]],
      start: 'hidden',
    },
    {
      id: 'town-gulch',
      from: { poi: 'kanes-crossing', exit: 'east' },
      to: { poi: 'rattlesnake-gulch', exit: 'west' },
      route: [[150, 112], [176, 114], [204, 108], [228, 100], [252, 96]],
      start: 'undiscovered',
    },
    {
      id: 'ranch-gulch',
      from: { poi: 'two-spurs-ranch', exit: 'east' },
      to: { poi: 'rattlesnake-gulch', exit: 'north' },
      route: [[128, 46], [160, 42], [196, 52], [222, 66], [244, 80], [252, 96]],
      start: 'undiscovered',
    },
  ],
  terrain: [
    // Mountains along the north edge.
    { kind: 'mountains', points: [[0, 0], [320, 0], [320, 22], [270, 30], [215, 20], [170, 26], [120, 18], [70, 28], [30, 20], [0, 30]] },
    // Forest on the lower slopes, north-west.
    { kind: 'forest', points: [[10, 34], [62, 30], [88, 44], [70, 62], [30, 60], [8, 52]] },
    // Prairie around the ranch.
    { kind: 'prairie', points: [[70, 40], [190, 32], [205, 62], [170, 80], [110, 84], [60, 72]] },
    // Mesas and canyon walls to the east.
    { kind: 'mesa', points: [[226, 40], [262, 36], [270, 58], [236, 62]] },
    { kind: 'mesa', points: [[284, 120], [312, 116], [316, 146], [288, 150]] },
    { kind: 'canyon', points: [[232, 70], [292, 66], [300, 112], [272, 128], [236, 120], [226, 96]] },
    // Desert to the south.
    { kind: 'desert', points: [[0, 140], [90, 130], [180, 142], [260, 136], [320, 150], [320, 200], [0, 200]] },
    // The river along the prairie, a stream from the hills, a small lake.
    { kind: 'river', width: 5, points: [[0, 92], [40, 86], [72, 92], [100, 80], [118, 66], [150, 60], [186, 66], [212, 58], [238, 30], [250, 0]] },
    { kind: 'stream', width: 2, points: [[96, 30], [106, 46], [112, 58], [118, 66]] },
    { kind: 'lake', points: [[40, 98], [58, 94], [66, 104], [52, 112], [38, 108]] },
  ],
};

// ------------------------------------------------------------------------------------------------

/**
 * Check a world for broken data: unique ids, paths between existing exits, every POI reachable
 * from the start, every map builder registered. Returns the problems (empty = fine).
 */
export function validateWorld(w: WorldDef, builders: readonly string[]): string[] {
  const out: string[] = [];
  const dup = (kind: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) out.push(`duplicate ${kind} id "${id}"`);
      seen.add(id);
    }
  };
  dup('POI', w.pois.map((p) => p.id));
  dup('path', w.paths.map((p) => p.id));
  for (const p of w.pois) {
    dup(`exit (in ${p.id})`, p.exits.map((e) => e.id));
    if (!builders.includes(p.map)) out.push(`POI "${p.id}": no map builder "${p.map}"`);
  }
  const exitOf = (end: PathEnd) => w.pois.find((p) => p.id === end.poi)?.exits.find((e) => e.id === end.exit);
  for (const path of w.paths) {
    for (const end of [path.from, path.to]) {
      if (!w.pois.some((p) => p.id === end.poi)) out.push(`path "${path.id}": unknown POI "${end.poi}"`);
      else if (!exitOf(end)) out.push(`path "${path.id}": POI "${end.poi}" has no exit "${end.exit}"`);
    }
    if (path.route.length < 2) out.push(`path "${path.id}": route needs at least two points`);
  }
  // Each exit leads somewhere (one path per exit).
  for (const p of w.pois) {
    for (const e of p.exits) {
      const n = w.paths.filter((x) => (x.from.poi === p.id && x.from.exit === e.id) || (x.to.poi === p.id && x.to.exit === e.id)).length;
      if (n !== 1) out.push(`exit "${p.id}/${e.id}" is used by ${n} paths (needs exactly 1)`);
    }
  }
  if (!w.pois.some((p) => p.id === w.start.poi)) out.push(`start POI "${w.start.poi}" does not exist`);
  // Reachability over all paths.
  const reached = new Set([w.start.poi]);
  for (let grew = true; grew; ) {
    grew = false;
    for (const path of w.paths) {
      const a = reached.has(path.from.poi);
      const b = reached.has(path.to.poi);
      if (a !== b) {
        reached.add(a ? path.to.poi : path.from.poi);
        grew = true;
      }
    }
  }
  for (const p of w.pois) if (!reached.has(p.id)) out.push(`POI "${p.id}" can't be reached from "${w.start.poi}"`);
  return out;
}

/** The path leaving a POI through an exit, and where it arrives. */
export function pathThrough(w: WorldDef, poi: string, exit: string): { path: PathDef; to: PathEnd } | null {
  for (const path of w.paths) {
    if (path.from.poi === poi && path.from.exit === exit) return { path, to: path.to };
    if (path.to.poi === poi && path.to.exit === exit) return { path, to: path.from };
  }
  return null;
}

export function poiById(w: WorldDef, id: string): PoiDef {
  const p = w.pois.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown POI "${id}"`);
  return p;
}
