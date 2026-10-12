import type { PoiType } from '../../data/world';

/**
 * 9×9 pixel icons per POI type. '#' ink, 'a' accent (warm), 'b' second accent, 'w' light, '.' empty.
 */
const ICONS: Record<PoiType, string[]> = {
  town: [
    '.........',
    '.###.....',
    '.#a#.###.',
    '.#a#.#b#.',
    '#####b#b#',
    '#ww##bbb#',
    '#ww##b#b#',
    '#########',
    '.........',
  ],
  village: [
    '.........',
    '...#.....',
    '..#a#....',
    '.#aaa#.#.',
    '.#w#w##a#',
    '.#w#w#ww#',
    '.#####ww#',
    '.########',
    '.........',
  ],
  farm: [
    '....#....',
    '...#a#...',
    '..#aaa#..',
    '.#aaaaa#.',
    '.#a#w#a#.',
    '.#aw#wa#.',
    '.#a#w#a#.',
    '.#######.',
    '.........',
  ],
  canyon: [
    '.........',
    '##.....##',
    'a##...##a',
    'aa#...#aa',
    'aa##.##aa',
    'aaa#.#aaa',
    'aaa#b#aaa',
    '#########',
    '.........',
  ],
  prairie: [
    '.........',
    '.........',
    '..#...#..',
    '.#a#.#a#.',
    '..a...a..',
    '#.a.#.a.#',
    'a#a#a#a#a',
    '#########',
    '.........',
  ],
  desert: [
    '...www...',
    '..wwwww..',
    '...www...',
    '.....#...',
    '.#..#a#..',
    '#a#.#a#..',
    '.#.##a##.',
    'aaaaaaaaa',
    '#########',
  ],
  stream: [
    '.........',
    '.##...##.',
    '#bb#.#bb#',
    'b..b#b..b',
    '.........',
    '.##...##.',
    '#bb#.#bb#',
    'b..b#b..b',
    '.........',
  ],
  mine: [
    '.........',
    '..#####..',
    '.#aaaaa#.',
    '.#a###a#.',
    '.#a###a#.',
    '.#a###a#.',
    '.#a###a#.',
    '##a###a##',
    '.........',
  ],
  station: [
    '.........',
    '.#####...',
    '.#w#w#...',
    '.#####.#.',
    '##aaa####',
    '#aaaaaaa#',
    '#########',
    '.#.#.#.#.',
    '#########',
  ],
  caves: [
    '.........',
    '...###...',
    '..#aaa#..',
    '.#aa#aa#.',
    '#aa###aa#',
    '#a#####a#',
    '#a#####a#',
    '#########',
    '.........',
  ],
  camp: [
    '....#....',
    '....#....',
    '...#a#...',
    '..#aaa#..',
    '.#aa#aa#.',
    '#aa###aa#',
    '#########',
    '.........',
    '.........',
  ],
  outpost: [
    '.#.......',
    '.#aaa....',
    '.#aa.....',
    '.#.......',
    '#.#.#.#.#',
    '#########',
    '#b#b#b#b#',
    '#########',
    '.........',
  ],
};

const COLORS: Record<string, string> = { '#': '#3b2a1e', a: '#b5562b', b: '#5d84a0', w: '#f4ecd8' };

/** Draw a POI icon centred on (cx, cy). */
export function drawPoiIcon(ctx: CanvasRenderingContext2D, type: PoiType, cx: number, cy: number, alpha = 1): void {
  const rows = ICONS[type];
  const x0 = Math.round(cx) - 4;
  const y0 = Math.round(cy) - 4;
  ctx.globalAlpha = alpha;
  // A pale halo so it reads on any terrain.
  ctx.fillStyle = 'rgba(244,236,216,0.75)';
  ctx.fillRect(x0 - 1, y0 - 1, 11, 11);
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = COLORS[row[x]];
      if (!c) continue;
      ctx.fillStyle = c;
      ctx.fillRect(x0 + x, y0 + y, 1, 1);
    }
  });
  ctx.globalAlpha = 1;
}

/** The "?" for places heard of but not visited. */
export function drawUnknownMarker(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const rows = ['.#####.', '##...##', '.....##', '...###.', '...##..', '.......', '...##..'];
  const x0 = Math.round(cx) - 3;
  const y0 = Math.round(cy) - 3;
  ctx.fillStyle = 'rgba(244,236,216,0.75)';
  ctx.fillRect(x0 - 1, y0 - 1, 9, 9);
  ctx.fillStyle = '#3b2a1e';
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) if (row[x] === '#') ctx.fillRect(x0 + x, y0 + y, 1, 1);
  });
}

export const ICON_TYPES = Object.keys(ICONS) as PoiType[];
