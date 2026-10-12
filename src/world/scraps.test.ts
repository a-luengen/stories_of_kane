import { describe, expect, it } from 'vitest';
import { NPCS } from '../data/npcs';
import { poiById, SANDBOX_WORLD } from '../data/world';
import { Npc } from '../entities/Npc';
import { TargetSystem } from '../entities/Targets';
import { itemDef } from '../items/ItemDef';
import { WorldDebug } from '../ui/worldmap/WorldDebug';
import { Discovery } from './Discovery';
import { buildGulchMap } from './maps/rattlesnakeGulch';
import { buildSandboxMap } from './maps/sandbox';
import { RANCH_NPCS } from './maps/twoSpursRanch';

const contents = (cs: ReturnType<typeof buildSandboxMap>['containers']) =>
  cs.flatMap((c) => {
    c.ensureLoot();
    return c.inventory.items.map((i) => i.defId);
  });

describe('map scraps', () => {
  it('are 1×1 maps of real places', () => {
    for (const id of ['map_scrap_gulch', 'map_scrap_ranch']) {
      const d = itemDef(id);
      expect(d.category).toBe('map');
      expect(d.size).toEqual({ w: 1, h: 1 });
      expect(poiById(SANDBOX_WORLD, d.reveals!)).toBeTruthy();
    }
  });

  it('a gulch scrap lies in a town chest, a ranch scrap in the outlaws\' chest', () => {
    const town = buildSandboxMap(new TargetSystem());
    expect(contents(town.containers).filter((id) => id === 'map_scrap_gulch')).toHaveLength(1);
    const gulch = buildGulchMap(new TargetSystem(), poiById(SANDBOX_WORLD, 'rattlesnake-gulch').exits);
    const chest = gulch.containers.find((c) => c.kind === 'chest')!;
    expect(contents([chest])).toContain('map_scrap_ranch');
  });

  it('studying the gulch scrap: the gulch goes on the map ("?") with its trail from town', () => {
    const d = new Discovery(SANDBOX_WORLD);
    const r = d.learn(itemDef('map_scrap_gulch').reveals!);
    expect(r).toEqual([
      { kind: 'poi', id: 'rattlesnake-gulch', state: 'hidden' },
      { kind: 'path', id: 'town-gulch', state: 'hidden' },
    ]);
  });
});

describe('directions from NPCs', () => {
  const talk = (def: (typeof NPCS)[number], unvisited: (poi: string) => boolean) => {
    const n = new Npc(def);
    const heard: string[] = [];
    n.wantsHint = unvisited;
    n.onHint = (_, poi) => heard.push(poi);
    n.interact();
    return { n, heard };
  };

  it('the gunsmith points you to the ranch until you have been there', () => {
    const gunsmith = NPCS.find((d) => d.id === 'gunsmith')!;
    const before = talk(gunsmith, () => true);
    expect(before.heard).toEqual(['two-spurs-ranch']);
    expect(before.n.speech).toBe(gunsmith.hints![0].line);
    const after = talk(gunsmith, () => false);
    expect(after.heard).toEqual([]);
    expect(gunsmith.lines!.greet).toContain(after.n.speech);
  });

  it('the rancher tells of the gulch', () => {
    const rancher = RANCH_NPCS.find((d) => d.id === 'rancher')!;
    expect(talk(rancher, (p) => p === 'rattlesnake-gulch').heard).toEqual(['rattlesnake-gulch']);
  });
});

describe('world debug panel', () => {
  it('has reveal, reset, exit zones, and a teleport row per exit', () => {
    const zones = false;
    const dbg = new WorldDebug(SANDBOX_WORLD, () => zones);
    const W = 342;
    const H = 192;
    const found: string[] = [];
    for (let y = 0; y < H; y++) {
      const a = dbg.hit(W / 2, y, W, H);
      const key = a ? (a.kind === 'teleport' ? `${a.poi}/${a.exit}` : a.kind) : null;
      if (key && found.at(-1) !== key) found.push(key);
    }
    const exits = SANDBOX_WORLD.pois.flatMap((p) => p.exits.map((e) => `${p.id}/${e.id}`));
    expect(found).toEqual(['reveal', 'reset', 'zones', ...exits]);
  });
});
