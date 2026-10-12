import * as THREE from 'three';
import type { TargetSystem } from '../../entities/Targets';
import { fadeableToon } from '../../render/materials';
import { PAL } from '../../render/palette';
import { StaticBatch } from '../../render/StaticBatch';
import { Rng, valueNoise2 } from '../../util/math';
import { CollisionWorld } from '../Colliders';
import { ContainerSet } from '../Container';
import { buildGround, cactus, cliff, mesas, rock, ruin, sandbags, shrub, trough, wagon, well, type Occluder, type WorldData } from '../props';

/** Inner half-size of the canyon (walls stand at ±WALL). */
const WALL = 30;
/** Walkable half-size: a little beyond the walls so the passes lead out (spawns, leaving horses). */
const HALF = 33;

/** Passes through the canyon walls where enemies come in. */
export const OUTPOST_SPAWNS: THREE.Vector3[] = [
  new THREE.Vector3(0, 0, -31.5), // north canyon pass
  new THREE.Vector3(-31.5, 0, 9), // west pass
  new THREE.Vector3(-11, 0, 31.5), // south-west gate
  new THREE.Vector3(12.5, 0, 31.5), // south-east gate
  new THREE.Vector3(31.5, 0, -9), // east pass
];

/** The merchant's covered wagon and where the merchant stands beside it. */
export const OUTPOST_MERCHANT = {
  wagon: new THREE.Vector3(7, 0, 4),
  stand: new THREE.Vector3(5.4, 0, 6.6),
  facing: Math.PI * 0.85,
};

/** Where a newly arrived horse pulls up. */
export const OUTPOST_HORSE_STOP = new THREE.Vector3(-3.5, 0, 4.5);

/** Point-to-segment distance on XZ. */
function segDist(x: number, z: number, ax: number, az: number, bx: number, bz: number): number {
  const vx = bx - ax;
  const vz = bz - az;
  const t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)));
  return Math.hypot(x - (ax + vx * t), z - (az + vz * t));
}

const tileCache = new Map<string, number>();
function groundColor(x: number, z: number, rng: Rng, first: boolean): number {
  const key = `${x},${z}`;
  if (!first && tileCache.has(key)) return tileCache.get(key)!;
  const n = valueNoise2(x * 0.08, z * 0.08, 17) * 0.7 + valueNoise2(x * 0.22, z * 0.22, 4) * 0.3;
  let col: number = n < 0.34 ? PAL.sandDark : n < 0.66 ? PAL.sand : PAL.sandLight;
  const r = rng.next();
  if (r < 0.02) col = PAL.sandPale;
  // Packed-dirt square in the middle.
  if (Math.hypot(x, z) < 11 + n * 3) col = n < 0.5 ? 0xb08a58 : PAL.sandDark;
  // Wagon tracks from each pass to the square: two ruts.
  for (const s of OUTPOST_SPAWNS) {
    const d = segDist(x, z, s.x, s.z, 0, 0);
    if (d < 1.9 && Math.abs(d - 0.9) < 0.4 && r < 0.75) col = 0x8e6c46;
  }
  if (Math.abs(x) > WALL + 1 || Math.abs(z) > WALL + 1) col = n < 0.5 ? PAL.sandDark : 0x9a7c62;
  tileCache.set(key, col);
  return col;
}

/** Abandoned frontier outpost for wave mode: a canyon-ringed square full of cover. */
export function buildOutpostMap(_targets: TargetSystem): WorldData {
  const rng = new Rng(777);
  const group = new THREE.Group();
  const batch = new StaticBatch();
  const cw = new CollisionWorld(HALF);
  const occluders: Occluder[] = [];
  const cover: WorldData['cover'] = [];
  const coverBox = (x: number, z: number, hx: number, hz: number) => cover.push({ minX: x - hx, minZ: z - hz, maxX: x + hx, maxZ: z + hz });

  group.add(buildGround(groundColor));

  // Canyon walls. Tall cliffs behind (north, west); low rock on the camera side (south, east).
  const tall = 6;
  const low = 1.4;
  cliff(batch, cw, -HALF, -WALL, -3, -WALL, tall, rng);
  cliff(batch, cw, 3, -WALL, HALF, -WALL, tall, rng);
  cliff(batch, cw, -WALL, -HALF, -WALL, 6, tall, rng);
  cliff(batch, cw, -WALL, 12, -WALL, HALF, tall, rng);
  cliff(batch, cw, -HALF, WALL, -14, WALL, low, rng);
  cliff(batch, cw, -8, WALL, 10, WALL, low, rng);
  cliff(batch, cw, 15, WALL, HALF, WALL, low, rng);
  cliff(batch, cw, WALL, -HALF, WALL, -12, low, rng);
  cliff(batch, cw, WALL, -6, WALL, HALF, low, rng);
  // Broken fence gates at the southern passes (posts only).
  for (const gx of [-14.3, -7.7, 9.7, 15.3]) {
    batch.box(0.22, 1.3, 0.22, PAL.wood, gx, 0, WALL + 0.2);
    batch.box(0.26, 0.06, 0.26, PAL.darkBrown, gx, 1.3, WALL + 0.2);
  }
  batch.put(new THREE.BoxGeometry(2.4, 0.1, 0.1), PAL.woodLight, -11, 0.12, WALL + 0.8, 0, 0.4, 0); // fallen rail

  // The square.
  well(batch, cw, -2.5, -3);
  wagon(batch, cw, OUTPOST_MERCHANT.wagon.x, OUTPOST_MERCHANT.wagon.z, 0, 'covered');
  coverBox(OUTPOST_MERCHANT.wagon.x, OUTPOST_MERCHANT.wagon.z, 0.8, 1.6);
  for (const [x, z, yaw] of [[-9, -8, 0.6], [11, -11, -0.4]] as const) {
    wagon(batch, cw, x, z, yaw, 'broken');
    coverBox(x, z, 1.2, 1.2);
  }
  wagon(batch, cw, -16, 13, 1.4, 'intact');
  coverBox(-16, 13, 1.5, 1);
  trough(batch, cw, -1.5, -10.5);
  trough(batch, cw, 13, 1.5);
  coverBox(-1.5, -10.5, 1.1, 0.4);
  coverBox(13, 1.5, 1.1, 0.4);

  // Crate / barrel clusters (all of them lootable).
  const containers = new ContainerSet(777);
  for (const [cx, cz] of [[-5, 8], [8, -4.5], [-13, -13], [14, 14], [-21, -2], [21, 5]] as const) {
    containers.add(cw, 'crate', cx, cz, 0, rng.range(0.7, 0.9));
    containers.add(cw, 'crate', cx + 0.95, cz + 0.2, 0, rng.range(0.7, 0.9));
    containers.add(cw, 'barrel', cx - 0.4, cz + 1.1, rng.range(0, Math.PI * 2));
    if (rng.next() < 0.6) containers.add(cw, 'barrel', cx + 1.4, cz + 1.2, rng.range(0, Math.PI * 2));
    coverBox(cx + 0.5, cz + 0.5, 1.3, 1.2);
  }
  // A few more around the square: ammo boxes, a weapon crate and a chest.
  containers.add(cw, 'ammoBox', -4.6, 7.1, 0);
  containers.add(cw, 'ammoBox', 9.2, -5.6, Math.PI / 2);
  containers.add(cw, 'ammoBox', 22.5, 5.2, Math.PI / 2);
  containers.add(cw, 'weaponCrate', -12.6, -11.2, 0);
  containers.add(cw, 'chest', 9.6, 2.2, Math.PI / 2);
  for (const c of containers.items) group.add(c.object);

  // Sandbag lines.
  for (const [x, z, len, alongX] of [[-12, 3, 3, false], [3, 13, 3.5, true], [17.5, -3, 3, false], [-3, -17, 3.5, true], [21, -19, 3, true], [-22, 18, 3, true]] as const) {
    sandbags(batch, cw, x, z, len, alongX, rng);
    coverBox(x, z, alongX ? len / 2 : 0.3, alongX ? 0.3 : len / 2);
  }

  // Ruins on the far side of the square (they fade when the player is behind them).
  for (const [x, z, w, d] of [[-17, -19, 7, 6], [16, -20, 6, 5]] as const) {
    const rb = new StaticBatch();
    ruin(rb, cw, x, z, w, d, rng);
    const mat = fadeableToon();
    const mesh = rb.build(mat);
    const bb = new THREE.Box3().setFromObject(mesh);
    occluders.push({ mesh, fade: mat.userData.uFade, minX: bb.min.x, minZ: bb.min.z, maxX: bb.max.x, maxZ: bb.max.z, height: bb.max.y });
    group.add(mesh);
    coverBox(x, z, w / 2, d / 2);
  }

  // Rock formations along the walls, a few cacti and shrubs.
  for (const [x, z] of [[-25, -25], [24, -24], [-25, 21], [25, 23], [-23, -9], [23, 12], [-8, -24], [9, 24], [-26, 2]] as const) rock(batch, cw, x, z, rng);
  for (const [x, z] of [[-19, 23], [19, -26], [26, -16], [-26, -15], [5, -24]] as const) cactus(batch, cw, x, z, rng);
  for (let i = 0; i < 30; i++) shrub(batch, rng.range(-27, 27), rng.range(-27, 27), rng);
  mesas(batch, rng, HALF + 3);

  group.add(batch.build());
  return {
    group,
    collision: cw,
    occluders,
    cover,
    half: HALF,
    playerSpawn: new THREE.Vector3(0, 0, 1.5),
    horseSpawn: null,
    horseYaw: 0,
    containers: containers.items,
    floors: [],
    exitSigns: [],
  };
}
