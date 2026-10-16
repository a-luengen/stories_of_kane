import * as THREE from 'three';
import { banditAppearance, ENEMIES, type ArchetypeId } from '../../data/enemies';
import type { AnimalSpawn } from '../../data/animals';
import type { NpcDef, Vec2 } from '../../data/types';
import type { ExitDef } from '../../data/world';
import type { TargetSystem } from '../../entities/Targets';
import { PAL } from '../../render/palette';
import { StaticBatch } from '../../render/StaticBatch';
import { Rng, valueNoise2 } from '../../util/math';
import { CollisionWorld } from '../Colliders';
import { ContainerSet } from '../Container';
import { buildGround, cactus, campfire, cliff, rock, shade, shrub, tent, trailExits, type Occluder, type WorldData } from '../props';
import { fadeableToon } from '../../render/materials';

const HALF = 40;

/** Walkable canyon floor: [minX, minZ, maxX, maxZ] boxes (corridors and the basin). */
const FLOOR: [number, number, number, number][] = [
  [-44, -5, -24, 5], // west corridor
  [-24, -3, -20, 3], // the narrow west pass
  [-20, -16, 26, 20], // the basin
  [6, -24, 14, -16], // north pass, lower
  [8, -28, 12, -24], // its narrow throat
  [6, -44, 14, -28], // north pass, upper
];
const onFloor = (x: number, z: number, pad = 0) => FLOOR.some(([x0, z0, x1, z1]) => x > x0 - pad && x < x1 + pad && z > z0 - pad && z < z1 + pad);

/** The camp the outlaws hold, and how close you can come before they notice. */
export const CAMP: Vec2 = [15, 6];
const CAMP_RADIUS = 17;

/** The dry riverbed winding through the canyon. */
const RIVERBED: Vec2[] = [
  [-44, 1],
  [-30, -1],
  [-21, 0],
  [-12, 5],
  [-2, 9],
  [6, 14],
  [16, 17],
  [28, 19],
];

function distToBed(x: number, z: number): number {
  let best = Infinity;
  for (let i = 1; i < RIVERBED.length; i++) {
    const [ax, az] = RIVERBED[i - 1];
    const [bx, bz] = RIVERBED[i];
    const vx = bx - ax;
    const vz = bz - az;
    const t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)));
    best = Math.min(best, Math.hypot(x - ax - vx * t, z - az - vz * t));
  }
  return best;
}

function groundColor(x: number, z: number, rng: Rng): number {
  const n = valueNoise2(x * 0.1, z * 0.1, 61) * 0.7 + valueNoise2(x * 0.32, z * 0.32, 62) * 0.3;
  if (!onFloor(x, z, 1)) return n < 0.5 ? PAL.rust : PAL.rustLight; // the rock beyond the walls
  let col: number = n < 0.35 ? PAL.sandDark : n < 0.7 ? 0xc49a68 : PAL.sand;
  const r = rng.next();
  if (r < 0.03) col = PAL.rockLight;
  // The dry riverbed: pale, cracked silt with darker pebbles.
  const d = distToBed(x, z);
  if (d < 1.6) col = r < 0.12 ? PAL.rock : d < 0.8 && n > 0.5 ? 0xd9c7a0 : PAL.sandPale;
  else if (d < 2.2) col = 0xb89466;
  return col;
}

/** Fill an area beyond the canyon walls with stacked rock (no colliders: the walls already stop you). */
function rockMass(b: StaticBatch, rng: Rng, x0: number, z0: number, x1: number, z1: number, h: [number, number]): void {
  const bands = [PAL.rustLight, PAL.orange, PAL.rust, PAL.sandDark, PAL.rockLight];
  for (let x = x0 + 2; x < x1; x += 4) {
    for (let z = z0 + 2; z < z1; z += 4) {
      const height = rng.range(h[0], h[1]);
      let y = 0;
      let layer = rng.int(0, bands.length);
      const w = rng.range(4, 5.5);
      const d = rng.range(4, 5.5);
      while (y < height) {
        const lh = Math.min(height - y, rng.range(0.6, 1.3));
        const shrink = 1 - (y / height) * 0.25;
        b.box(w * shrink, lh, d * shrink, bands[layer % bands.length], x + rng.range(-0.8, 0.8), y, z + rng.range(-0.8, 0.8), rng.range(-0.08, 0.08));
        y += lh;
        layer++;
      }
    }
  }
}

/** A rock arch: two stacked pillars and a span you walk under. Fades when it hides you. */
function arch(cw: CollisionWorld, x: number, z: number, along: 'x' | 'z', rng: Rng): Occluder {
  const b = new StaticBatch();
  const gap = 2.2;
  const h = 3.4;
  const bands = [PAL.rustLight, PAL.orange, PAL.rust];
  for (const s of [-1, 1]) {
    const px = along === 'x' ? x + s * gap : x;
    const pz = along === 'x' ? z : z + s * gap;
    let y = 0;
    let k = rng.int(0, 3);
    while (y < h) {
      const lh = rng.range(0.6, 1);
      b.box(1.6 - y * 0.08, lh, 1.6 - y * 0.08, bands[k++ % 3], px, y, pz, rng.range(-0.1, 0.1));
      y += lh;
    }
    cw.addCircle(px, pz, 0.85, h, 'rock');
  }
  const span = gap * 2 + 1.6;
  b.box(along === 'x' ? span : 1.4, 0.9, along === 'x' ? 1.4 : span, PAL.rust, x, h, z);
  b.box(along === 'x' ? span - 0.8 : 1.2, 0.5, along === 'x' ? 1.2 : span - 0.8, PAL.rustLight, x, h + 0.9, z);
  const mat = fadeableToon();
  const mesh = b.build(mat);
  const bb = new THREE.Box3().setFromObject(mesh);
  return { mesh, fade: mat.userData.uFade, minX: bb.min.x, minZ: bb.min.z, maxX: bb.max.x, maxZ: bb.max.z, height: bb.max.y };
}

/** A bleached cow skull with a few ribs half buried in the sand. */
function bones(b: StaticBatch, x: number, z: number, rng: Rng): void {
  const bone = PAL.cream;
  const yaw = rng.range(0, Math.PI * 2);
  const fx = Math.sin(yaw);
  const fz = Math.cos(yaw);
  b.box(0.26, 0.18, 0.4, bone, x, 0, z, yaw); // skull
  b.box(0.22, 0.1, 0.18, shade(bone, 0.85), x + fx * 0.26, 0, z + fz * 0.26, yaw); // muzzle
  b.box(0.7, 0.06, 0.06, bone, x - fx * 0.05, 0.16, z - fz * 0.05, yaw + Math.PI / 2); // horns
  for (const s of [-1, 1]) b.box(0.06, 0.12, 0.06, bone, x - fx * 0.05 + Math.cos(yaw) * s * 0.36, 0.18, z - fz * 0.05 - Math.sin(yaw) * s * 0.36, yaw);
  // Ribs: a row of arcs behind the skull.
  for (let i = 0; i < 5; i++) {
    const rx = x - fx * (0.9 + i * 0.22);
    const rz = z - fz * (0.9 + i * 0.22);
    for (const s of [-1, 1]) b.put(new THREE.BoxGeometry(0.05, 0.4, 0.05), bone, rx + Math.cos(yaw) * s * 0.18, 0.12, rz - Math.sin(yaw) * s * 0.18, 0, yaw, s * 0.6);
  }
}

/** The old mine: a timber-framed opening in the north wall, rails and an ore cart, a spoil heap. */
function mine(b: StaticBatch, cw: CollisionWorld, x: number, z: number): void {
  b.box(2.6, 2.7, 0.6, PAL.ink, x, 0, z - 0.1); // the dark mouth
  for (const s of [-1, 1]) b.box(0.3, 2.9, 0.34, PAL.wood, x + s * 1.45, 0, z + 0.1);
  b.box(3.6, 0.36, 0.4, PAL.wood, x, 2.75, z + 0.1);
  b.box(3.2, 0.1, 0.1, PAL.darkBrown, x, 2.6, z + 0.32);
  // Rails out of the mouth.
  for (const s of [-0.45, 0.45]) b.box(0.08, 0.06, 5, PAL.metal, x + s, 0, z + 2.5);
  for (let i = 0; i < 6; i++) b.box(1.3, 0.06, 0.18, PAL.darkBrown, x, 0, z + 0.4 + i * 0.85);
  // An ore cart, half full.
  b.box(1.1, 0.7, 1.4, PAL.metal, x, 0.25, z + 3.8);
  b.box(0.9, 0.18, 1.2, PAL.rockDark, x, 0.85, z + 3.8);
  for (const sx of [-0.5, 0.5]) for (const sz of [-0.45, 0.45]) b.box(0.08, 0.3, 0.3, PAL.ink, x + sx, 0, z + 3.8 + sz);
  cw.addBox(x - 0.6, z + 3.05, x + 0.6, z + 4.55, 1.0, 'metal');
  // Spoil heap beside the entrance.
  for (let i = 0; i < 5; i++) b.put(new THREE.DodecahedronGeometry(0.7 + i * 0.12, 0), shade(PAL.rock, 0.8 + i * 0.05), x + 3 + i * 0.3, 0.2, z + 1.2 + (i % 2) * 0.6, i, i * 1.3, 0, 1, 0.5, 1);
  cw.addCircle(x + 3.6, z + 1.5, 1.4, 1.0, 'rock');
}

/** Rattlesnake Gulch: a dry canyon with an outlaw camp, the old mine and two trails out. */
export function buildGulchMap(_targets: TargetSystem, exits: readonly ExitDef[]): WorldData {
  const rng = new Rng(9191);
  const group = new THREE.Group();
  const batch = new StaticBatch();
  const cw = new CollisionWorld(HALF);
  group.add(buildGround((x, z, r) => groundColor(x, z, r)));

  // ---------------------------------------------------------------- canyon walls
  // Tall on the far (north / west) sides, low on the camera side so they don't hide the floor.
  const TALL = 6.5;
  const LOW = 1.5;
  // West corridor and its narrow pass.
  cliff(batch, cw, -44, -5, -24, -5, TALL, rng);
  cliff(batch, cw, -44, 5, -24, 5, LOW, rng);
  cliff(batch, cw, -24, -5, -24, -3, TALL, rng);
  cliff(batch, cw, -24, 3, -24, 5, LOW, rng);
  cliff(batch, cw, -24, -3, -20, -3, TALL, rng);
  cliff(batch, cw, -24, 3, -20, 3, LOW, rng);
  // The basin.
  cliff(batch, cw, -20, -16, -20, -3, TALL, rng);
  cliff(batch, cw, -20, 3, -20, 20, TALL * 0.8, rng);
  cliff(batch, cw, -20, -16, 6, -16, TALL, rng);
  cliff(batch, cw, 14, -16, 26, -16, TALL, rng);
  cliff(batch, cw, 26, -16, 26, 20, LOW, rng);
  cliff(batch, cw, -20, 20, 26, 20, LOW, rng);
  // The north pass, pinched to a narrow throat halfway up.
  cliff(batch, cw, 6, -24, 6, -16, TALL, rng);
  cliff(batch, cw, 14, -24, 14, -16, LOW + 0.5, rng);
  cliff(batch, cw, 6, -24, 8, -24, TALL, rng);
  cliff(batch, cw, 12, -24, 14, -24, LOW + 0.5, rng);
  cliff(batch, cw, 8, -28, 8, -24, TALL, rng);
  cliff(batch, cw, 12, -28, 12, -24, LOW + 0.5, rng);
  cliff(batch, cw, 6, -28, 8, -28, TALL, rng);
  cliff(batch, cw, 12, -28, 14, -28, LOW + 0.5, rng);
  cliff(batch, cw, 6, -44, 6, -28, TALL, rng);
  cliff(batch, cw, 14, -44, 14, -28, LOW + 0.5, rng);
  // Rock beyond the walls: high plateau north and west, low ground to the south and east.
  rockMass(batch, rng, -48, -48, -24, -7, [6, 9]);
  rockMass(batch, rng, -24, -48, 4, -18, [6, 9]);
  rockMass(batch, rng, 16, -48, 48, -18, [3, 6]);
  rockMass(batch, rng, -48, 7, -22, 48, [1, 2.2]);
  rockMass(batch, rng, -22, 22, 48, 48, [0.8, 1.8]);
  rockMass(batch, rng, 28, -18, 48, 22, [0.8, 1.8]);

  // ---------------------------------------------------------------- the old mine, arches, scenery
  mine(batch, cw, -11, -14.4);
  const arches = [arch(cw, -6, -6, 'x', rng), arch(cw, 4, 16, 'z', rng)];
  for (const a of arches) group.add(a.mesh);
  const occupied: { x: number; z: number; r: number }[] = [
    { x: CAMP[0], z: CAMP[1], r: 9 },
    { x: -11, z: -11, r: 5 },
    { x: -6, z: -6, r: 4 },
    { x: 4, z: 16, r: 4 },
  ];
  // Keep the trails through the canyon clear.
  for (const e of exits) for (let t = 0; t < 12; t += 2) occupied.push({ x: e.arrive[0] + (e.arrive[0] - e.at[0]) * (t / 4), z: e.arrive[1] + (e.arrive[1] - e.at[1]) * (t / 4), r: 3 });
  const free = (x: number, z: number, r: number) => onFloor(x, z, -r - 1) && occupied.every((o) => Math.hypot(o.x - x, o.z - z) > o.r + r);
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
  scatter(16, 1.8, (x, z) => rock(batch, cw, x, z, rng));
  // A few big boulders (good cover).
  scatter(5, 2.4, (x, z) => {
    const s = rng.range(1.4, 2);
    batch.put(new THREE.DodecahedronGeometry(1, 0), rng.pick([PAL.rock, PAL.rockLight]), x, s * 0.45, z, rng.range(0, 3), rng.range(0, 3), 0, s, s * 0.8, s);
    cw.addCircle(x, z, s * 0.95, s * 1.3, 'rock');
  });
  scatter(12, 1.4, (x, z) => cactus(batch, cw, x, z, rng));
  scatter(14, 0.8, (x, z) => shrub(batch, x, z, rng));
  scatter(6, 1.2, (x, z) => bones(batch, x, z, rng));

  // ---------------------------------------------------------------- the outlaws' camp
  const [cx, cz] = CAMP;
  const flicker = campfire(group, batch, cw, cx, cz);
  tent(batch, cw, cx + 5, cz - 4, -0.6, PAL.cream);
  tent(batch, cw, cx + 6, cz + 4, -1.9, PAL.sandLight);
  tent(batch, cw, cx - 4, cz + 6, 2.6, shade(PAL.cream, 0.92));
  const containers = new ContainerSet(9191);
  containers.add(cw, 'weaponCrate', cx + 3, cz - 6.5, 0);
  containers.add(cw, 'ammoBox', cx + 1.6, cz - 3.2, 0);
  containers.add(cw, 'ammoBox', cx - 4.6, cz + 2.6, Math.PI / 2);
  // The outlaws' chest: a sketch of the ranch they've been eyeing.
  containers.add(cw, 'chest', cx + 8.5, cz + 0.2, Math.PI / 2).extras.push('map_scrap_ranch');
  containers.add(cw, 'crate', cx - 2.8, cz - 4.2, 0, 0.8);
  containers.add(cw, 'barrel', cx - 3.6, cz - 3.2, 0);
  for (const c of containers.items) group.add(c.object);

  const exitSigns = trailExits(batch, cw, exits, HALF, rng);
  group.add(batch.build());

  const west = exits.find((e) => e.id === 'west') ?? exits[0];
  return {
    group,
    collision: cw,
    occluders: arches,
    // Places to hide behind: the boulders and arches (small footprints).
    cover: [
      { minX: -8, minZ: -7, maxX: -4, maxZ: -5 },
      { minX: 3, minZ: 14, maxX: 5, maxZ: 18 },
    ],
    half: HALF,
    playerSpawn: west ? new THREE.Vector3(west.arrive[0], 0, west.arrive[1]) : new THREE.Vector3(-30, 0, 0),
    horseSpawn: null,
    horseYaw: 0,
    containers: containers.items,
    floors: [],
    exitSigns,
    update: flicker,
  };
}

// ------------------------------------------------------------------------------------------------

/** One outlaw holding the camp: an archetype's weapon, skill and look (seeded per outlaw). */
function outlaw(id: string, archetype: ArchetypeId, spawn: Vec2, routine: NpcDef['routine'], seed: number): NpcDef {
  const a = ENEMIES[archetype];
  const rng = new Rng(seed);
  return {
    id,
    attitude: 'hostile',
    defendsOthers: true,
    appearance: banditAppearance(a, () => rng.next()),
    weapon: a.weapon,
    tactics: a.tactics,
    hp: a.hp,
    inaccuracy: a.inaccuracy,
    reactionTime: a.reactionTime,
    spawn,
    routine,
    territory: { at: CAMP, radius: CAMP_RADIUS },
    // A cleared camp stays cleared.
    respawns: false,
    lines: { greet: ['...', 'Keep walking, stranger.'] },
  };
}

/** The outlaws holding the camp: two gunslingers, a rifleman on the rocks, a shotgunner by the tents. */
export const GULCH_NPCS: NpcDef[] = [
  outlaw('outlaw-fire', 'gunslinger', [CAMP[0] - 1.6, CAMP[1] + 1.8], { kind: 'idle', at: [CAMP[0] - 1.6, CAMP[1] + 1.8], facing: 2.4 }, 11),
  outlaw('outlaw-patrol', 'gunslinger', [CAMP[0] - 6, CAMP[1] - 2], { kind: 'patrol', points: [[CAMP[0] - 7, CAMP[1] - 3], [CAMP[0] - 3, CAMP[1] + 9], [CAMP[0] + 4, CAMP[1] - 8]], pause: 3 }, 12),
  outlaw('outlaw-rifle', 'rifleman', [CAMP[0] + 6, CAMP[1] - 9], { kind: 'idle', at: [CAMP[0] + 6, CAMP[1] - 9], facing: -2.2 }, 13),
  outlaw('outlaw-shotgun', 'shotgunner', [CAMP[0] + 3, CAMP[1] + 7], { kind: 'idle', at: [CAMP[0] + 3, CAMP[1] + 7], facing: -1.4 }, 14),
];

/** The gulch's namesake: one rattlesnake in the rocks at the south-west end of the basin, away from the camp. */
export const GULCH_ANIMALS: AnimalSpawn[] = [{ species: 'snake', at: [-8, 16], yaw: 2.2, roam: 3 }];
