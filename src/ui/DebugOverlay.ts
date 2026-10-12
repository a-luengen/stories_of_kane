import * as THREE from 'three';
import type { Horse } from '../entities/Horse';

/** Full-resolution debug canvas (toggle 8): horse heading/input arrows, turn radius, speed, FPS. */
export class DebugOverlay {
  readonly canvas = document.createElement('canvas');
  private ctx: CanvasRenderingContext2D;
  visible = false;
  private fps = 60;
  private v = new THREE.Vector3();

  constructor(container: HTMLElement) {
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.imageRendering = 'auto';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;
  }

  setSize(bufW: number, bufH: number, cssW: number, cssH: number, left: string, top: string): void {
    this.canvas.width = bufW;
    this.canvas.height = bufH;
    Object.assign(this.canvas.style, { width: `${cssW}px`, height: `${cssH}px`, left, top });
  }

  /** Project a world point into canvas pixels using the logical (unsnapped) camera. */
  private project(cam: THREE.Camera, x: number, y: number, z: number): [number, number] {
    this.v.set(x, y, z).project(cam);
    return [((this.v.x + 1) / 2) * this.canvas.width, ((1 - this.v.y) / 2) * this.canvas.height];
  }

  draw(frameDt: number, cam: THREE.Camera, horse: Horse | null, extra: string[]): void {
    if (frameDt > 0) this.fps += (1 / frameDt - this.fps) * 0.05;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (!this.visible) return;

    const scale = Math.max(1, this.canvas.height / 540);
    const info = [`FPS ${this.fps.toFixed(0)}`, ...extra, 'red = heading, blue = input, yellow = turn radius'];
    if (!horse) {
      this.label(info, 10 * scale, 10 * scale, scale);
      return;
    }
    const m = horse.motor;
    const p = horse.model.root.position;
    const y = 0.05;

    // Turn radius circle (current arc, or tightest possible arc if going straight).
    const turning = Math.abs(m.angularVelocity) > 1e-3;
    const radius = turning ? m.currentTurnRadius() : m.minTurnRadius();
    if (Number.isFinite(radius) && radius < 60 && m.speed > 0.05) {
      const side = turning ? Math.sign(m.angularVelocity) : 1;
      // Positive angular velocity turns towards local +X: (cos h, -sin h).
      const cx = p.x + Math.cos(m.heading) * radius * side;
      const cz = p.z - Math.sin(m.heading) * radius * side;
      ctx.strokeStyle = turning ? 'rgba(255,215,90,0.9)' : 'rgba(255,215,90,0.35)';
      ctx.lineWidth = 1.5 * scale;
      ctx.setLineDash(turning ? [] : [6 * scale, 6 * scale]);
      ctx.beginPath();
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        const [sx, sy] = this.project(cam, cx + Math.cos(a) * radius, y, cz + Math.sin(a) * radius);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Heading arrow (length ~ speed) and input arrow.
    const hl = 1.5 + m.speed * 0.25;
    this.arrow(cam, p.x, p.z, p.x + Math.sin(m.heading) * hl, p.z + Math.cos(m.heading) * hl, '#ff5a3c', scale);
    if (m.target !== null) {
      this.arrow(cam, p.x, p.z, p.x + Math.sin(m.target) * 3, p.z + Math.cos(m.target) * 3, '#5ad2ff', scale);
    }

    const [lx, ly] = this.project(cam, p.x, 2.8, p.z);
    const lines = [
      `speed ${m.speed.toFixed(2)}  mode ${m.mode}`,
      `turn radius ${Number.isFinite(radius) ? radius.toFixed(2) : '∞'}  rate ${(m.angularVelocity * 57.3).toFixed(0)}°/s`,
      `delta ${(m.delta * 57.3).toFixed(0)}°`,
    ];
    this.label(lines, lx + 12 * scale, ly - 30 * scale, scale);

    this.label(info, 10 * scale, 10 * scale, scale);
  }

  private arrow(cam: THREE.Camera, x0: number, z0: number, x1: number, z1: number, color: string, scale: number): void {
    const ctx = this.ctx;
    const [ax, ay] = this.project(cam, x0, 0.05, z0);
    const [bx, by] = this.project(cam, x1, 0.05, z1);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    const ang = Math.atan2(by - ay, bx - ax);
    const s = 10 * scale;
    ctx.beginPath();
    ctx.moveTo(bx + Math.cos(ang) * s * 0.6, by + Math.sin(ang) * s * 0.6);
    ctx.lineTo(bx + Math.cos(ang + 2.4) * s, by + Math.sin(ang + 2.4) * s);
    ctx.lineTo(bx + Math.cos(ang - 2.4) * s, by + Math.sin(ang - 2.4) * s);
    ctx.fill();
  }

  private label(lines: string[], x: number, y: number, scale: number): void {
    const ctx = this.ctx;
    ctx.font = `${Math.round(12 * scale)}px ui-monospace, Menlo, monospace`;
    const lh = 15 * scale;
    const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 10 * scale;
    ctx.fillStyle = 'rgba(20,12,8,0.7)';
    ctx.fillRect(x - 5 * scale, y - 12 * scale, w, lines.length * lh + 6 * scale);
    ctx.fillStyle = '#f4ecd8';
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
  }
}
