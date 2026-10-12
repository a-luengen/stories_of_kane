import type { DiscoveryState, WorldDef } from '../data/world';

/** A change the player should hear about ("Map updated: …"). */
export interface Reveal {
  kind: 'poi' | 'path';
  id: string;
  state: DiscoveryState;
}

/** Plain, saveable discovery state. */
export interface DiscoveryData {
  pois: Record<string, DiscoveryState>;
  /** Trails the player knows about. */
  paths: string[];
}

/**
 * What the player knows of the world. POIs are visible (visited), hidden (known of: a "?") or
 * undiscovered. A trail is known or not; a known one counts as visible once both its ends are,
 * otherwise as hidden (drawn dashed). Unknown trails are never shown.
 */
export class Discovery {
  private pois = new Map<string, DiscoveryState>();
  private known = new Set<string>();

  constructor(
    readonly world: WorldDef,
    saved?: DiscoveryData,
  ) {
    this.load(saved);
  }

  private load(saved?: DiscoveryData): void {
    this.pois.clear();
    this.known.clear();
    for (const p of this.world.pois) this.pois.set(p.id, saved?.pois[p.id] ?? p.start);
    for (const path of this.world.paths) {
      if (saved ? saved.paths.includes(path.id) : path.start !== 'undiscovered') this.known.add(path.id);
    }
  }

  /** Back to how the world starts (debug). */
  reset(): void {
    this.load();
  }

  poi(id: string): DiscoveryState {
    return this.pois.get(id) ?? 'undiscovered';
  }

  /** Shown on the map at all. */
  isKnown(id: string): boolean {
    return this.poi(id) !== 'undiscovered';
  }

  path(id: string): DiscoveryState {
    const path = this.world.paths.find((p) => p.id === id);
    if (!path || !this.known.has(id)) return 'undiscovered';
    return this.poi(path.from.poi) === 'visible' && this.poi(path.to.poi) === 'visible' ? 'visible' : 'hidden';
  }

  /** Arriving at a POI: it's visited; its trails to places already known show up. */
  arrive(poi: string): Reveal[] {
    const out = this.setPoi(poi, 'visible');
    for (const path of this.world.paths) {
      const other = path.from.poi === poi ? path.to.poi : path.to.poi === poi ? path.from.poi : null;
      if (other && this.isKnown(other)) out.push(...this.knowPath(path.id));
    }
    return out;
  }

  /** Walking into an exit: the place behind it is now known of, and so is the trail. */
  takeExit(poi: string, exit: string): Reveal[] {
    const path = this.world.paths.find((p) => (p.from.poi === poi && p.from.exit === exit) || (p.to.poi === poi && p.to.exit === exit));
    if (!path) return [];
    const other = path.from.poi === poi ? path.to.poi : path.from.poi;
    return [...this.hear(other), ...this.knowPath(path.id)];
  }

  /**
   * Learning of a place (a map scrap, someone's directions): it becomes hidden if it was
   * undiscovered, and its trails to places you know are drawn.
   */
  learn(poi: string): Reveal[] {
    const out = this.hear(poi);
    for (const path of this.world.paths) {
      const other = path.from.poi === poi ? path.to.poi : path.to.poi === poi ? path.from.poi : null;
      if (other && this.poi(other) === 'visible') out.push(...this.knowPath(path.id));
    }
    return out;
  }

  /** Debug: everything known and visited. */
  revealAll(): void {
    for (const p of this.world.pois) this.pois.set(p.id, 'visible');
    for (const p of this.world.paths) this.known.add(p.id);
  }

  save(): DiscoveryData {
    return { pois: Object.fromEntries(this.pois), paths: [...this.known] };
  }

  private hear(poi: string): Reveal[] {
    return this.poi(poi) === 'undiscovered' ? this.setPoi(poi, 'hidden') : [];
  }

  private setPoi(id: string, state: DiscoveryState): Reveal[] {
    if (this.pois.get(id) === state) return [];
    this.pois.set(id, state);
    return [{ kind: 'poi', id, state }];
  }

  private knowPath(id: string): Reveal[] {
    if (this.known.has(id)) return [];
    this.known.add(id);
    return [{ kind: 'path', id, state: this.path(id) }];
  }
}
