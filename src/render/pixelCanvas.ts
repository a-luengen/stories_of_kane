import { PAL } from './palette';

const OUTLINE = [(PAL.ink >> 16) & 255, (PAL.ink >> 8) & 255, PAL.ink & 255];

/**
 * Copy WebGL `readPixels` output (bottom-up RGBA) into a canvas, flipping it upright and adding a
 * 1px dark outline around opaque pixels (the pixel-art look of icons and previews).
 */
export function pixelsToOutlinedCanvas(pixels: Uint8Array, W: number, H: number, canvas: HTMLCanvasElement): void {
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width = W;
    canvas.height = H;
  }
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(W, H);
  const a = (x: number, y: number) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : pixels[((H - 1 - y) * W + x) * 4 + 3]);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const o = (y * W + x) * 4;
      const src = ((H - 1 - y) * W + x) * 4;
      if (pixels[src + 3] > 127) {
        img.data[o] = pixels[src];
        img.data[o + 1] = pixels[src + 1];
        img.data[o + 2] = pixels[src + 2];
        img.data[o + 3] = 255;
      } else if (a(x - 1, y) > 127 || a(x + 1, y) > 127 || a(x, y - 1) > 127 || a(x, y + 1) > 127) {
        img.data.set([...OUTLINE, 255], o);
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}
