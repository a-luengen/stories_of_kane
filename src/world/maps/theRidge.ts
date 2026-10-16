import * as THREE from 'three';
import type { Vec2 } from '../../data/types';
import type { ExitDef } from '../../data/world';
import type { TargetSystem } from '../../entities/Targets';
import { PAL } from '../../render/palette';
import { StaticBatch } from '../../render/StaticBatch';
import { Rng, valueNoise2 } from '../../util/math';
import { CollisionWorld } from '../Colliders';
import { ContainerSet } from '../Container';
import { buildGround, cactus, campfire, cliff, exitCorridors, mesas, rock, shade, shrub, tent, trailExits, type NamedArea, type WorldData } from '../props';

const HALF = 30;

/** The camp on the outcrop (quests put their bandits here). */
export const RIDGE_CAMP: Vec2 = [8, 2];

/** Named places quests can send you to (`the-ridge:<id>`). */
export const RIDGE_AREAS: NamedArea[] = [
  { id: 'camp', minX: 1, minZ: -7, maxX: 17, maxZ: 11 },
  { id: 'camp-entrance', minX: -4, minZ: -5, maxX: 1, maxZ: 9 },
  { id: 'lookout', minX: -18, minZ: -13, maxX: -10, maxZ: -5 },
];

function groundColor(x: number, z: number, rng: Rng): number {
  const n = valueNoise2(x * 0.09, z * 0.09, 71) * 0.7 + valueNoise2(x * 0.3, z * 0.3, 72) * 0.3;
  let col: number = n < 0.3 ? PAL.rockLight : n < 0.62 ? PAL.sandDark : PAL.sand;
  // Bare rock shows through on the high ground to the north.
  if (z < -16 && n < 0.55) col = PAL.rock;
  // The camp's trampled, ashy ground.
  if (Math.hypot(x - RIDGE_CAMP[0], z - RIDGE_CAMP[1]) < 7 && rng.next() < 0.5) col = shade(PAL.sandDark, 0.85);
  if (rng.next() < 0.03) col = PAL.rockDark;
  return col;
}

/** The Ridge: a rocky outcrop above the plains with a bandit camp, and a lookout over the trail. */
export function buildRidgeMap(_targets: TargetSystem, exits: readonly ExitDef[]): WorldData {
  const rng = new Rng(4242);
  const group = new THREE.Group();
  const batch = new StaticBatch();
  const cw = new CollisionWorld(HALF);
  group.add(buildGround((x, z, r) => groundColor(x, z, r)));

  // The outcrop's edges: rock all round (with a gap where the trail comes up), a ledge to the
  // north (tall, far side) and a low one to the south.
  mesas(batch, rng, HALF, exits);
  cliff(batch, cw, -22, -20, 18, -20, 4.5, rng);
  cliff(batch, cw, 22, -16, 22, 12, 3.5, rng);
  cliff(batch, cw, -12, 20, 14, 20, 1.4, rng);

  // The camp: a fire, three tents, the gang's supplies.
  const [cx, cz] = RIDGE_CAMP;
  const flicker = campfire(group, batch, cw, cx, cz);
  tent(batch, cw, cx + 5, cz - 4, -0.6, PAL.cream);
  tent(batch, cw, cx + 6, cz + 4, -1.9, PAL.sandLight);
  tent(batch, cw, cx - 4, cz + 6, 2.6, shade(PAL.cream, 0.9));
  const containers = new ContainerSet(4242);
  containers.add(cw, 'crate', cx + 3, cz - 6.5, 0, 0.8, 'crate-camp');
  containers.add(cw, 'ammoBox', cx + 1.4, cz - 3.4, 0, undefined, 'ammo-camp');
  containers.add(cw, 'chest', cx + 9, cz + 0.4, Math.PI / 2, undefined, 'chest-camp');
  containers.add(cw, 'barrel', cx - 3.4, cz - 3.4, 0, undefined, 'barrel-camp');
  for (const c of containers.items) group.add(c.object);

  // The lookout: a knot of rocks over the trail.
  for (const [x, z] of [[-17, -12.5], [-12, -13], [-18.5, -8]] as const) rock(batch, cw, x, z, rng);

  // Boulders for cover and scattered scrub, kept off the trail, the camp and the lookout.
  const occupied = [
    { x: cx, z: cz, r: 11 },
    { x: -14, z: -9, r: 4 },
    ...exitCorridors(exits, HALF),
  ];
  const free = (x: number, z: number, r: number) => Math.abs(x) < HALF - 3 && z > -17 && z < 17 && occupied.every((o) => Math.hypot(o.x - x, o.z - z) > o.r + r);
  const scatter = (count: number, r: number, place: (x: number, z: number) => void) => {
    for (let placed = 0, tries = 0; placed < count && tries < count * 60; tries++) {
      const x = rng.range(-HALF, HALF);
      const z = rng.range(-HALF, HALF);
      if (!free(x, z, r)) continue;
      occupied.push({ x, z, r });
      place(x, z);
      placed++;
    }
  };
  scatter(6, 2.2, (x, z) => {
    const s = rng.range(1.2, 1.8);
    batch.put(new THREE.DodecahedronGeometry(1, 0), rng.pick([PAL.rock, PAL.rockLight]), x, s * 0.45, z, rng.range(0, 3), rng.range(0, 3), 0, s, s * 0.8, s);
    cw.addCircle(x, z, s * 0.95, s * 1.3, 'rock');
  });
  scatter(14, 1.4, (x, z) => rock(batch, cw, x, z, rng));
  scatter(6, 1.2, (x, z) => cactus(batch, cw, x, z, rng));
  scatter(14, 0.8, (x, z) => shrub(batch, x, z, rng));

  const exitSigns = trailExits(batch, cw, exits, HALF, rng);
  group.add(batch.build());
  const west = exits.find((e) => e.id === 'west') ?? exits[0];
  return {
    group,
    collision: cw,
    occluders: [],
    cover: [],
    half: HALF,
    playerSpawn: west ? new THREE.Vector3(west.arrive[0], 0, west.arrive[1]) : new THREE.Vector3(-25, 0, 0),
    horseSpawn: null,
    horseYaw: 0,
    containers: containers.items,
    floors: [],
    exitSigns,
    areas: RIDGE_AREAS,
    update: flicker,
  };
}
