import { UI } from './theme';
import { drawText, textWidth } from './PixelFont';

export interface WeaponBarState {
  slots: { icon: HTMLCanvasElement | null; selected: boolean }[];
  /** The selected weapon is out (not holstered). */
  drawn: boolean;
  /** Active weapon ammo, or null when no weapon is selected. */
  ammo: { loaded: number; magazine: number; reserve: number } | null;
  /** 0..1 or -1. */
  reloadProgress: number;
  noAmmo: boolean;
  /** Stance icon next to the slots (null when riding). */
  stance: 'stand' | 'crouch' | null;
}

/** Tiny stance figures: hat, head, body, legs ('#' = figure). */
const STANCE: Record<'stand' | 'crouch', string[]> = {
  stand: ['.###.', '#####', '.##..', '.###.', '#####', '#.#.#', '..#..', '.#.#.', '.#.#.', '.#.#.', '##.##'],
  crouch: ['.###..', '#####.', '.##...', '.###..', '######', '.##.#.', '.###..', '#..#..', '##.##.'],
};

export const SLOT_W = 36;
export const SLOT_H = 18;

/** HUD weapon bar: three slots with icons, the active one highlighted, ammo above. */
export function drawWeaponBar(ctx: CanvasRenderingContext2D, x: number, y: number, s: WeaponBarState, time: number): void {
  s.slots.forEach((slot, i) => {
    const sx = x + i * (SLOT_W + 2);
    ctx.fillStyle = 'rgba(31,21,16,0.6)';
    ctx.fillRect(sx, y, SLOT_W, SLOT_H);
    const edge = slot.selected ? (s.drawn ? UI.brassLight : UI.cream) : UI.leather;
    ctx.fillStyle = edge;
    ctx.fillRect(sx, y, SLOT_W, 1);
    ctx.fillRect(sx, y + SLOT_H - 1, SLOT_W, 1);
    ctx.fillRect(sx, y, 1, SLOT_H);
    ctx.fillRect(sx + SLOT_W - 1, y, 1, SLOT_H);
    if (slot.icon) drawIconFit(ctx, slot.icon, sx + 1, y + 1, SLOT_W - 2, SLOT_H - 2, false, slot.selected ? 1 : 0.6);
    drawText(ctx, String(i + 1), sx + 2, y + 2, slot.selected ? UI.brassLight : UI.cream, UI.ink);
  });

  if (s.stance) {
    const bx = x + 3 * (SLOT_W + 2);
    ctx.fillStyle = 'rgba(31,21,16,0.6)';
    ctx.fillRect(bx, y, 12, SLOT_H);
    const rows = STANCE[s.stance];
    const oy = y + SLOT_H - 2 - rows.length;
    rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        if (row[i] !== '#') continue;
        ctx.fillStyle = s.stance === 'crouch' ? UI.brassLight : UI.cream;
        ctx.fillRect(bx + 3 + i, oy + j, 1, 1);
      }
    });
  }

  // Ammo: loaded / magazine | reserve.
  if (s.ammo) {
    const ty = y - 8;
    const a = s.ammo;
    const txt = `${a.loaded}/${a.magazine}`;
    ctx.fillStyle = 'rgba(31,21,16,0.55)';
    const res = `| ${a.reserve}`;
    ctx.fillRect(x, ty - 2, textWidth(txt) + textWidth(res) + 10, 9);
    drawText(ctx, txt, x + 3, ty, a.loaded === 0 ? UI.rust : UI.cream);
    drawText(ctx, res, x + 7 + textWidth(txt), ty, a.reserve === 0 ? UI.rust : UI.sand);
    if (s.noAmmo && Math.floor(time * 4) % 2 === 0) drawText(ctx, 'NO AMMO', x + 14 + textWidth(txt) + textWidth(res), ty, UI.red, UI.ink);
    else if (s.reloadProgress >= 0) {
      const bx = x + 14 + textWidth(txt) + textWidth(res);
      drawText(ctx, 'RELOADING', bx, ty, UI.cream, UI.ink);
      ctx.fillStyle = UI.ink;
      ctx.fillRect(bx - 1, ty + 7, 38, 3);
      ctx.fillStyle = UI.rust;
      ctx.fillRect(bx, ty + 8, Math.round(36 * s.reloadProgress), 1);
    } else if (a.loaded === 0 && a.reserve > 0 && Math.floor(time * 3) % 2 === 0) {
      drawText(ctx, 'R TO RELOAD', x + 14 + textWidth(txt) + textWidth(res), ty, UI.cream, UI.ink);
    }
  }
}

/** Draw an icon centred in a box at the largest integer scale (or 1:1 / downscaled if too big). */
export function drawIconFit(
  ctx: CanvasRenderingContext2D,
  icon: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
  rotated: boolean,
  alpha = 1,
): void {
  const iw = rotated ? icon.height : icon.width;
  const ih = rotated ? icon.width : icon.height;
  let k = Math.floor(Math.min(w / iw, h / ih));
  let dw = iw * k;
  let dh = ih * k;
  if (k < 1) {
    // Too big for the box: scale down (keeps aspect), still nearest-neighbour.
    const f = Math.min(w / iw, h / ih);
    dw = Math.floor(iw * f);
    dh = Math.floor(ih * f);
    k = f;
  }
  const dx = Math.round(x + (w - dw) / 2);
  const dy = Math.round(y + (h - dh) / 2);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = false;
  if (rotated) {
    ctx.translate(dx + dw, dy);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(icon, 0, 0, dh, dw);
  } else {
    ctx.drawImage(icon, dx, dy, dw, dh);
  }
  ctx.restore();
}
