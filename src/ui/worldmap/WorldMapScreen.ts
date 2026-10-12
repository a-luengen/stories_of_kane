import type { Vec2 } from '../../data/types';
import type { PoiDef, WorldDef } from '../../data/world';
import type { Discovery } from '../../world/Discovery';
import { pointAlong, polylineLength } from '../../world/routes';
import type { UiPointer } from '../InventoryUI';
import { drawText, drawTextScaled, textWidth, textWidthScaled } from '../PixelFont';
import { UI } from '../theme';
import { drawCursor, drawTooltip, wrapText } from '../widgets';
import { drawPoiIcon, drawUnknownMarker } from './icons';
import { renderTerrain } from './terrain';

const TOP = 14;
const BOTTOM = 10;
/** Pointer within this many pixels of a place hovers it. */
const HOVER = 7;

/** A ride shown on the map while the next place loads. */
interface Ride {
  points: Vec2[];
  /** 0..1 along the route. */
  t: number;
  duration: number;
  /** The destination has loaded. */
  ready: () => boolean;
  dest: string;
}

/**
 * The world map (M): terrain, known places (visited ones with their icon, heard-of ones as "?"),
 * known trails (dashed towards unvisited places), a legend, where you are, tooltips. Drag to pan
 * when the world is larger than the screen; click a visited place to fast travel (if enabled).
 * Also plays the ride between places while the destination loads.
 */
export class WorldMapScreen {
  private terrain: HTMLCanvasElement | null = null;
  /** Screen position of the map's top-left corner. */
  private ox = 0;
  private oy = 0;
  private time = 0;
  private dragFrom: { x: number; y: number; ox: number; oy: number; moved: boolean } | null = null;
  private hovered: PoiDef | null = null;
  ride: Ride | null = null;

  constructor(
    readonly world: WorldDef,
    private discovery: () => Discovery,
    private current: () => string,
  ) {}

  /** Opening: centre on where you are. */
  focus(W: number, H: number, on = this.current()): void {
    const p = this.world.pois.find((x) => x.id === on);
    const [mw] = this.world.size;
    this.ox = p ? Math.round(W / 2 - p.pos[0]) : Math.round((W - mw) / 2);
    this.oy = p ? Math.round(TOP + (H - TOP - BOTTOM) / 2 - p.pos[1]) : TOP;
    this.clamp(W, H);
  }

  /** Keep the map on screen (centred along an axis where it's smaller than the screen). */
  private clamp(W: number, H: number): void {
    const [mw, mh] = this.world.size;
    const vh = H - TOP - BOTTOM;
    this.ox = mw <= W ? Math.round((W - mw) / 2) : Math.min(0, Math.max(W - mw, this.ox));
    this.oy = mh <= vh ? Math.round(TOP + (vh - mh) / 2) : Math.min(TOP, Math.max(TOP + vh - mh, this.oy));
  }

  /** Start the ride animation: 2–4 s depending on the route's length. */
  startRide(points: Vec2[], dest: string, ready: () => boolean, W: number, H: number): void {
    const len = polylineLength(points);
    this.ride = { points, t: 0, duration: Math.min(4, Math.max(2, len / 45)), ready, dest };
    // Frame the route.
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    this.ox = Math.round(W / 2 - (Math.min(...xs) + Math.max(...xs)) / 2);
    this.oy = Math.round(TOP + (H - TOP - BOTTOM) / 2 - (Math.min(...ys) + Math.max(...ys)) / 2);
    this.clamp(W, H);
  }

  /** The ride reached its end and the place is ready (or it was skipped). */
  get rideDone(): boolean {
    return !!this.ride && this.ride.t >= 1 && this.ride.ready();
  }

  /** Skip the rest of the ride (only once the destination is ready). */
  skipRide(): boolean {
    if (!this.ride || !this.ride.ready()) return false;
    this.ride.t = 1;
    return true;
  }

  /**
   * Pointer handling while viewing. Returns a place that was clicked (not dragged), if any.
   */
  update(dt: number, ptr: UiPointer, mouseDown: boolean, W: number, H: number): PoiDef | null {
    this.time += dt;
    if (this.ride) {
      this.ride.t = Math.min(1, this.ride.t + dt / this.ride.duration);
      return null;
    }
    let clicked: PoiDef | null = null;
    if (ptr.pressed) this.dragFrom = { x: ptr.x, y: ptr.y, ox: this.ox, oy: this.oy, moved: false };
    if (this.dragFrom && mouseDown) {
      const dx = ptr.x - this.dragFrom.x;
      const dy = ptr.y - this.dragFrom.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) this.dragFrom.moved = true;
      if (this.dragFrom.moved) {
        this.ox = this.dragFrom.ox + dx;
        this.oy = this.dragFrom.oy + dy;
        this.clamp(W, H);
      }
    }
    this.hovered = this.poiAt(ptr.x, ptr.y);
    if (ptr.released && this.dragFrom) {
      if (!this.dragFrom.moved && this.hovered) clicked = this.hovered;
      this.dragFrom = null;
    }
    return clicked;
  }

  private poiAt(x: number, y: number): PoiDef | null {
    const d = this.discovery();
    let best: PoiDef | null = null;
    let bestD = HOVER;
    for (const p of this.world.pois) {
      if (!d.isKnown(p.id)) continue;
      const dist = Math.hypot(this.ox + p.pos[0] - x, this.oy + p.pos[1] - y);
      if (dist < bestD) {
        bestD = dist;
        best = p;
      }
    }
    return best;
  }

  draw(ctx: CanvasRenderingContext2D, W: number, H: number, ptr: UiPointer | null, alpha = 1, hint = ''): void {
    if (alpha <= 0) return;
    this.terrain ??= renderTerrain(this.world);
    const d = this.discovery();
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#2a1d14';
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(this.terrain, this.ox, this.oy);
    ctx.globalAlpha = 1;
    if (alpha < 1) ctx.globalAlpha = alpha;

    // Known trails: a solid trail of dots between visited places, dashed towards the unknown.
    for (const path of this.world.paths) {
      const state = d.path(path.id);
      if (state === 'undiscovered') continue;
      this.trail(ctx, path.route, state === 'visible' ? 'solid' : 'dashed');
    }

    // Places.
    for (const p of this.world.pois) {
      const state = d.poi(p.id);
      if (state === 'undiscovered') continue;
      const x = this.ox + p.pos[0];
      const y = this.oy + p.pos[1];
      if (state === 'visible') drawPoiIcon(ctx, p.type, x, y, alpha);
      else drawUnknownMarker(ctx, x, y);
      const name = p.name.toUpperCase();
      drawText(ctx, name, Math.round(x - textWidth(name) / 2), Math.round(y + 7), state === 'visible' ? UI.cream : UI.sand, UI.ink);
    }
    // The ride, over everything else on the map.
    if (this.ride) this.drawRide(ctx);
    // You are here: a pulsing ring.
    const here = this.world.pois.find((p) => p.id === this.current());
    if (here && !this.ride) {
      const r = 7 + Math.round((Math.sin(this.time * 5) + 1) * 1.5);
      this.ring(ctx, this.ox + here.pos[0], this.oy + here.pos[1], r, UI.red);
    }

    // Title, legend, hint.
    ctx.fillStyle = 'rgba(31,21,16,0.85)';
    ctx.fillRect(0, 0, W, TOP - 2);
    const title = 'THE FRONTIER';
    drawTextScaled(ctx, title, Math.round((W - textWidthScaled(title, 1)) / 2), 3, UI.brassLight, 1, UI.ink);
    this.legend(ctx, H);
    ctx.fillStyle = 'rgba(31,21,16,0.85)';
    ctx.fillRect(0, H - BOTTOM + 1, W, BOTTOM - 1);
    drawText(ctx, hint, Math.round((W - textWidth(hint)) / 2), H - BOTTOM + 3, UI.sand);

    // Tooltip for the hovered place.
    if (this.hovered && ptr && !this.ride) {
      const p = this.hovered;
      const state = d.poi(p.id);
      const lines: { text: string; color?: string }[] = [
        { text: p.name.toUpperCase(), color: UI.brassLight },
        { text: state === 'visible' ? (p.id === this.current() ? 'YOU ARE HERE' : 'VISITED') : 'HEARD OF - NOT VISITED', color: UI.sand },
      ];
      if (state === 'visible') for (const l of wrapText(p.description.toUpperCase(), 32)) lines.push({ text: l });
      drawTooltip(ctx, lines, ptr.x, ptr.y, W, H);
    }
    if (ptr && !this.ride) drawCursor(ctx, ptr.x, ptr.y);
    ctx.restore();
  }

  /** A trail of ink dots along a route (every other dot missing when dashed). */
  private trail(ctx: CanvasRenderingContext2D, route: readonly Vec2[], style: 'solid' | 'dashed'): void {
    const len = polylineLength(route);
    for (let s = 0, i = 0; s <= len; s += 1, i++) {
      // Solid: a dotted ink trail; dashed: short dashes with gaps.
      if (style === 'solid' ? i % 3 === 2 : i % 6 >= 3) continue;
      const [x, y] = pointAlong(route, s / len);
      ctx.fillStyle = '#4a2f1d';
      ctx.fillRect(Math.round(this.ox + x), Math.round(this.oy + y), 2, 2);
    }
  }

  private ring(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string): void {
    ctx.fillStyle = color;
    for (let a = 0; a < Math.PI * 2; a += 0.35) ctx.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1);
  }

  /** The rider on the route, with a little dust behind; "Arriving..." if the place isn't ready. */
  private drawRide(ctx: CanvasRenderingContext2D): void {
    const ride = this.ride!;
    // The route ahead in red, ridden part darker.
    const len = polylineLength(ride.points);
    for (let s = 0; s <= len; s += 2) {
      const [x, y] = pointAlong(ride.points, s / len);
      ctx.fillStyle = s / len <= ride.t ? '#7a2e1e' : 'rgba(181,86,43,0.7)';
      ctx.fillRect(Math.round(this.ox + x), Math.round(this.oy + y), 1, 1);
    }
    const [x, y] = pointAlong(ride.points, ride.t);
    const rx = Math.round(this.ox + x);
    const ry = Math.round(this.oy + y);
    // Dust puffs behind.
    for (let i = 1; i <= 3; i++) {
      const [dx, dy] = pointAlong(ride.points, Math.max(0, ride.t - i * 0.02));
      ctx.fillStyle = `rgba(228,207,152,${0.6 - i * 0.15})`;
      ctx.fillRect(Math.round(this.ox + dx) - 1, Math.round(this.oy + dy) + 1, 2, 1);
    }
    // Horse and rider: a tiny silhouette with a hat.
    const bob = Math.round(Math.sin(this.time * 18) * 0.6);
    ctx.fillStyle = '#1f1510';
    ctx.fillRect(rx - 3, ry - 1 + bob, 6, 2); // body
    ctx.fillRect(rx - 3, ry + 1 + bob, 1, 2); // legs
    ctx.fillRect(rx + 2, ry + 1 + bob, 1, 2);
    ctx.fillRect(rx + 3, ry - 2 + bob, 2, 1); // head
    ctx.fillRect(rx - 1, ry - 4 + bob, 2, 3); // rider
    ctx.fillStyle = '#b5562b';
    ctx.fillRect(rx - 2, ry - 5 + bob, 4, 1); // hat
    if (ride.t >= 1 && !ride.ready()) {
      const t = 'ARRIVING...';
      drawText(ctx, t, rx - Math.round(textWidth(t) / 2), ry - 13, UI.cream, UI.ink);
    }
  }

  /** What the marks mean. */
  private legend(ctx: CanvasRenderingContext2D, H: number): void {
    const x = 4;
    const row = 11;
    const y = H - BOTTOM - row * 5 - 2;
    ctx.fillStyle = 'rgba(31,21,16,0.75)';
    ctx.fillRect(x - 2, y - 4, 78, row * 5 + 3);
    drawPoiIcon(ctx, 'town', x + 5, y + 2);
    drawText(ctx, 'VISITED', x + 13, y, UI.cream);
    drawUnknownMarker(ctx, x + 5, y + row + 2);
    drawText(ctx, 'HEARD OF', x + 13, y + row, UI.cream);
    ctx.fillStyle = '#c9a77a';
    for (let i = 0; i < 9; i++) if (i % 3 !== 2) ctx.fillRect(x + 1 + i, y + row * 2 + 2, 1, 2);
    drawText(ctx, 'KNOWN TRAIL', x + 13, y + row * 2, UI.cream);
    for (let i = 0; i < 9; i++) if (i % 6 < 3) ctx.fillRect(x + 1 + i, y + row * 3 + 2, 1, 2);
    drawText(ctx, 'TRAIL TO ?', x + 13, y + row * 3, UI.cream);
    this.ring(ctx, x + 5, y + row * 4 + 2, 3, UI.red);
    drawText(ctx, 'YOU ARE HERE', x + 13, y + row * 4, UI.cream);
  }
}
