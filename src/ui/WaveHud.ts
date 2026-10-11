import { drawText, drawTextScaled, textWidth, textWidthScaled } from './PixelFont';
import { UI } from './theme';

export interface WaveHudState {
  wave: number;
  phase: 'countdown' | 'active' | 'intermission';
  /** Seconds left in the countdown / intermission. */
  timer: number;
  enemiesLeft: number;
  wallet: number;
  reviveTokens: number;
  /** Big centred banner ("WAVE 3", "WAVE CLEARED"), with fade 0..1. */
  banner: { text: string; sub?: string; alpha: number } | null;
  /** Recent "+$15" pops under the wallet (age in seconds). */
  pops: { text: string; age: number }[];
  /** Screen positions (low-res px) of enemies to point at from the screen edge. */
  pointers: { x: number; y: number }[];
}

function plate(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, color: string): void {
  const w = textWidth(text) + 8;
  const x = Math.round(cx - w / 2);
  ctx.fillStyle = 'rgba(31,21,16,0.65)';
  ctx.fillRect(x, y, w, 9);
  drawText(ctx, text, x + 4, y + 2, color);
}

/** Wave-mode HUD on top of the standard one. */
export function drawWaveHud(ctx: CanvasRenderingContext2D, W: number, H: number, s: WaveHudState, time: number): void {
  // Top centre: wave status.
  if (s.phase === 'active') plate(ctx, `WAVE ${s.wave}   ${s.enemiesLeft} LEFT`, W / 2, 3, UI.cream);
  else if (s.phase === 'countdown') plate(ctx, `WAVE ${s.wave} IN ${Math.ceil(s.timer)}`, W / 2, 3, UI.brassLight);
  else {
    plate(ctx, `NEXT WAVE IN ${Math.ceil(s.timer)}`, W / 2, 3, UI.cream);
    if (Math.floor(time * 2) % 2 === 0) plate(ctx, 'ENTER: SKIP   E: TRADE AT THE WAGON', W / 2, 13, UI.sand);
  }

  // Top right: wallet with recent earnings.
  drawWalletPlate(ctx, W, s.wallet);
  s.pops.forEach((p, i) => {
    if (p.age > 1.6) return;
    drawText(ctx, p.text, W - textWidth(p.text) - 5, 15 + i * 7 - Math.round(p.age * 4), UI.green, UI.ink);
  });

  // Revive token next to the health bar: a brass star, greyed once used.
  const tx = 62;
  const ty = 4;
  const col = s.reviveTokens > 0 ? UI.brassLight : UI.leather;
  ctx.fillStyle = UI.ink;
  ctx.fillRect(tx - 1, ty - 1, 9, 9);
  ctx.fillStyle = col;
  for (const [x, y, w, h] of [[3, 0, 1, 7], [0, 3, 7, 1], [2, 1, 3, 5], [1, 2, 5, 3]]) ctx.fillRect(tx + x, ty + y, w, h);
  if (s.reviveTokens > 0) drawText(ctx, `x${s.reviveTokens}`, tx + 9, ty + 1, UI.cream, UI.ink);

  // Edge pointers to the last few enemies (so a hidden straggler can be found).
  for (const p of s.pointers) {
    const inside = p.x >= 0 && p.y >= 0 && p.x < W && p.y < H;
    if (inside) continue;
    const cx = Math.max(6, Math.min(W - 7, p.x));
    const cy = Math.max(22, Math.min(H - 30, p.y));
    const a = Math.atan2(p.y - H / 2, p.x - W / 2);
    ctx.fillStyle = UI.red;
    for (let i = 0; i < 4; i++) {
      const bx = Math.round(cx + Math.cos(a) * i);
      const by = Math.round(cy + Math.sin(a) * i);
      const half = 3 - i;
      ctx.fillRect(bx - half, by - half, half * 2 + 1, half * 2 + 1);
    }
  }

  // Banner.
  if (s.banner && s.banner.alpha > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, s.banner.alpha);
    const scale = W >= 420 ? 4 : 3;
    const bw = textWidthScaled(s.banner.text, scale);
    const by = Math.round(H * 0.24);
    drawTextScaled(ctx, s.banner.text, Math.round((W - bw) / 2), by, UI.brassLight, scale, UI.ink);
    if (s.banner.sub) drawText(ctx, s.banner.sub, Math.round((W - textWidth(s.banner.sub)) / 2), by + 6 * scale + 4, UI.cream, UI.ink);
    ctx.restore();
  }
}

/** "$123" in the top-right corner. */
export function drawWalletPlate(ctx: CanvasRenderingContext2D, W: number, dollars: number): void {
  const money = `$${dollars}`;
  const mw = textWidth(money) + 8;
  ctx.fillStyle = 'rgba(31,21,16,0.65)';
  ctx.fillRect(W - mw - 3, 3, mw, 9);
  drawText(ctx, money, W - mw + 1, 5, UI.brassLight);
}
