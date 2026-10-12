import * as THREE from 'three';
import type { AudioEngine } from '../audio/AudioEngine';

const BUS_COLOR: Record<string, string> = { effects: '#ffb347', voices: '#7fd7ff', ambience: '#9be37a', ui: '#e0a0ff' };

/** F4: the playing voices as a list, and a ring at each positioned sound in the world. */
export class SoundDebug {
  readonly canvas = document.createElement('canvas');
  private ctx: CanvasRenderingContext2D;
  visible = false;
  private v = new THREE.Vector3();

  constructor(container: HTMLElement) {
    this.canvas.style.pointerEvents = 'none';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;
  }

  setSize(bufW: number, bufH: number, cssW: number, cssH: number, left: string, top: string): void {
    this.canvas.width = bufW;
    this.canvas.height = bufH;
    Object.assign(this.canvas.style, { width: `${cssW}px`, height: `${cssH}px`, left, top });
  }

  draw(cam: THREE.Camera, audio: AudioEngine): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (!this.visible) return;
    const scale = Math.max(1, this.canvas.height / 540);
    const now = audio.ctx?.currentTime ?? 0;
    // Rings at positioned sources: size and fade by age, colour by bus.
    for (const voice of audio.voices) {
      if (!voice.pos) continue;
      this.v.set(voice.pos.x, voice.pos.y ?? 0.5, voice.pos.z).project(cam);
      if (Math.abs(this.v.x) > 1.2 || Math.abs(this.v.y) > 1.2) continue;
      const x = ((this.v.x + 1) / 2) * this.canvas.width;
      const y = ((1 - this.v.y) / 2) * this.canvas.height;
      const age = Math.max(0, now - voice.started);
      ctx.strokeStyle = BUS_COLOR[voice.bus];
      ctx.globalAlpha = Math.max(0.25, 1 - age * 1.5);
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.arc(x, y, (5 + Math.min(14, age * 30)) * scale, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // The list.
    const state = !audio.ctx ? 'LOCKED - click or press a key to start audio' : audio.ctx.state.toUpperCase();
    const lines = [
      `SOUND ${state}${audio.muted ? '  (MUTED)' : ''}   voices ${audio.voices.length}/${audio.pool.maxVoices}`,
      ...audio.voices.map((v) => {
        const vol = `vol ${v.gain.toFixed(2)}`;
        const dist = v.distance !== undefined ? `  d ${v.distance.toFixed(1)}` : '';
        return `${v.sound.padEnd(18)} ${v.bus.padEnd(8)} ${(v.source === 'sample' ? `sample ${v.file}` : 'synth').padEnd(10)} ${vol}${dist}`;
      }),
    ];
    ctx.font = `${Math.round(11 * scale)}px monospace`;
    const lh = Math.round(13 * scale);
    const x = this.canvas.width - Math.round(460 * scale);
    const y = Math.round(40 * scale);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(x - 6, y - lh, Math.round(450 * scale), lh * (lines.length + 0.6));
    lines.forEach((l, i) => {
      const voice = i > 0 ? audio.voices[i - 1] : null;
      ctx.fillStyle = voice ? BUS_COLOR[voice.bus] : '#ffffff';
      ctx.fillText(l, x, y + i * lh);
    });
  }
}
