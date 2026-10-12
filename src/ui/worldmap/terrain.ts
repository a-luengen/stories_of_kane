import type { Vec2 } from '../../data/types';
import type { TerrainKind, WorldDef } from '../../data/world';
import { valueNoise2 } from '../../util/math';

/** Parchment tones per terrain. */
export const TERRAIN_COLOR: Record<TerrainKind, [number, number, number]> = {
  plains: [217, 197, 151],
  desert: [228, 207, 152],
  prairie: [189, 184, 119],
  forest: [127, 138, 82],
  mountains: [168, 149, 124],
  mesa: [194, 123, 82],
  canyon: [176, 104, 74],
  river: [111, 147, 168],
  stream: [118, 152, 172],
  lake: [106, 146, 173],
};
const INK: [number, number, number] = [59, 42, 30];

export function pointInPolygon(x: number, y: number, poly: readonly Vec2[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function distToPolyline(x: number, y: number, pts: readonly Vec2[]): number {
  let best = Infinity;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const vx = bx - ax;
    const vy = by - ay;
    const t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy || 1)));
    best = Math.min(best, Math.hypot(x - ax - vx * t, y - ay - vy * t));
  }
  return best;
}

/** Which terrain is at a world-map point (shapes later in the list win; edges wobble with noise). */
export function terrainAt(world: WorldDef, x: number, y: number): TerrainKind {
  const jx = x + (valueNoise2(x * 0.12, y * 0.12, 11) - 0.5) * 4;
  const jy = y + (valueNoise2(x * 0.12, y * 0.12, 23) - 0.5) * 4;
  let kind = world.base;
  for (const s of world.terrain) {
    if (s.width !== undefined) {
      if (distToPolyline(jx, jy, s.points) <= s.width / 2) kind = s.kind;
    } else if (pointInPolygon(jx, jy, s.points)) kind = s.kind;
  }
  return kind;
}

/**
 * The world's terrain drawn as an old map: tinted areas with grain, inked borders between them,
 * then little hand-drawn stamps (peaks, mesas, trees, dunes, grass, canyon strata). Rendered
 * once, one pixel per world-map unit.
 */
export function renderTerrain(world: WorldDef): HTMLCanvasElement {
  const [W, H] = world.size;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(W, H);
  const kinds: TerrainKind[] = new Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) kinds[y * W + x] = terrainAt(world, x + 0.5, y + 0.5);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const k = kinds[y * W + x];
      let [r, g, b] = TERRAIN_COLOR[k];
      // Grain: fine speckle plus a slow mottling of the paper.
      const grain = 1 + (valueNoise2(x * 0.9, y * 0.9, 5) - 0.5) * 0.09 + (valueNoise2(x * 0.05, y * 0.05, 9) - 0.5) * 0.12;
      // Inked edge where the terrain changes.
      const edge = (x > 0 && kinds[y * W + x - 1] !== k) || (y > 0 && kinds[(y - 1) * W + x] !== k);
      // Burnt, darker paper towards the border.
      const border = Math.min(x, y, W - 1 - x, H - 1 - y);
      const burn = border < 6 ? 0.72 + border * 0.045 : 1;
      const f = grain * burn;
      if (edge) [r, g, b] = [r * 0.55 + INK[0] * 0.45, g * 0.55 + INK[1] * 0.45, b * 0.55 + INK[2] * 0.45];
      const i = (y * W + x) * 4;
      img.data[i] = Math.min(255, r * f);
      img.data[i + 1] = Math.min(255, g * f);
      img.data[i + 2] = Math.min(255, b * f);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  // Stamps on a jittered grid, each only where its terrain is.
  const ink = (a: number) => `rgba(${INK[0]},${INK[1]},${INK[2]},${a})`;
  const stamp = (kind: TerrainKind, step: number, draw: (x: number, y: number, n: number) => void) => {
    for (let gy = step / 2; gy < H; gy += step) {
      for (let gx = step / 2 + ((gy / step) % 2) * (step / 2); gx < W; gx += step) {
        const n = valueNoise2(gx * 0.37, gy * 0.37, 31);
        const x = Math.round(gx + (n - 0.5) * step * 0.6);
        const y = Math.round(gy + (valueNoise2(gx * 0.41, gy * 0.41, 37) - 0.5) * step * 0.6);
        if (x < 3 || y < 3 || x > W - 4 || y > H - 4 || kinds[y * W + x] !== kind) continue;
        draw(x, y, n);
      }
    }
  };
  const px = (x: number, y: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, 1, 1);
  };
  // Mountains: little peaks with a snowy tip.
  stamp('mountains', 10, (x, y, n) => {
    const h = 3 + Math.round(n * 2);
    for (let i = 0; i < h; i++) {
      px(x - i, y - h + i + 1, ink(0.8));
      px(x + i, y - h + i + 1, ink(0.55));
    }
    px(x, y - h + 1, 'rgba(244,236,216,0.9)');
  });
  // Mesas: flat tops with straight sides.
  stamp('mesa', 11, (x, y) => {
    ctx.fillStyle = ink(0.7);
    ctx.fillRect(x - 3, y - 3, 7, 1);
    ctx.fillRect(x - 3, y - 2, 1, 3);
    ctx.fillRect(x + 3, y - 2, 1, 3);
    ctx.fillStyle = ink(0.3);
    ctx.fillRect(x - 2, y - 1, 5, 1);
  });
  // Canyon: strata lines.
  stamp('canyon', 7, (x, y) => {
    ctx.fillStyle = ink(0.45);
    ctx.fillRect(x - 3, y, 6, 1);
  });
  // Forest: round trees.
  stamp('forest', 6, (x, y) => {
    ctx.fillStyle = 'rgba(70,84,44,0.95)';
    ctx.fillRect(x - 1, y - 2, 3, 2);
    ctx.fillRect(x - 2, y - 1, 5, 1);
    px(x, y, ink(0.8));
  });
  // Prairie: grass tufts.
  stamp('prairie', 7, (x, y) => {
    px(x - 1, y, ink(0.5));
    px(x, y - 1, ink(0.6));
    px(x + 1, y, ink(0.5));
  });
  // Desert: dune arcs.
  stamp('desert', 12, (x, y) => {
    ctx.fillStyle = ink(0.35);
    ctx.fillRect(x - 2, y, 2, 1);
    ctx.fillRect(x, y - 1, 2, 1);
    ctx.fillRect(x + 2, y, 2, 1);
  });
  // Water: a few lighter ripples.
  stamp('lake', 5, (x, y) => px(x, y, 'rgba(220,235,240,0.55)'));
  return canvas;
}
