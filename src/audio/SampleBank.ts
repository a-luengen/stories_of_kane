import { pickVariant } from './variants';

export type SampleState = 'idle' | 'loading' | 'ready' | 'failed';

export type Resolved<B> = { kind: 'sample'; buffer: B; file: string } | { kind: 'fallback' };

/**
 * Recorded samples from the manifest, loaded in the background. `resolve` hands out a random
 * loaded variant — or says "use the fallback" while nothing is ready yet, or when every file of
 * a sound failed (missing / undecodable), which is warned about once per sound.
 */
export class SampleBank<B> {
  private buffers = new Map<string, B>();
  private states = new Map<string, SampleState>();
  private lastVariant = new Map<string, number>();
  private warned = new Set<string>();
  private started = false;

  constructor(
    readonly manifest: Readonly<Record<string, readonly string[]>>,
    /** Folder URL ending in "/" (e.g. BASE_URL + "sounds/"). */
    private baseUrl: string,
    private load: (url: string) => Promise<B>,
    private warn: (msg: string) => void = (m) => console.warn(m),
  ) {}

  /** Start fetching + decoding every file (once). */
  start(): void {
    if (this.started) return;
    this.started = true;
    for (const [id, files] of Object.entries(this.manifest)) {
      for (const f of files) {
        this.states.set(f, 'loading');
        this.load(this.baseUrl + f).then(
          (b) => {
            this.buffers.set(f, b);
            this.states.set(f, 'ready');
          },
          () => {
            this.states.set(f, 'failed');
            if (files.every((x) => this.states.get(x) === 'failed') && !this.warned.has(id)) {
              this.warned.add(id);
              this.warn(`[audio] "${id}": no sample could be loaded (${files.join(', ')}) - using the synthesized fallback.`);
            }
          },
        );
      }
    }
  }

  fileState(file: string): SampleState {
    return this.states.get(file) ?? 'idle';
  }

  /** Does this sound come from samples (rather than only a recipe)? */
  hasSamples(id: string): boolean {
    return (this.manifest[id]?.length ?? 0) > 0;
  }

  resolve(id: string, rand: () => number = Math.random): Resolved<B> {
    const ready = (this.manifest[id] ?? []).filter((f) => this.buffers.has(f));
    if (ready.length === 0) return { kind: 'fallback' };
    const i = pickVariant(ready.length, this.lastVariant.get(id), rand);
    this.lastVariant.set(id, i);
    return { kind: 'sample', buffer: this.buffers.get(ready[i])!, file: ready[i] };
  }
}
