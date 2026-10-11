import * as THREE from 'three';
import { StaticBatch } from '../../render/StaticBatch';
import { PAL } from '../../render/palette';
import { Rng, valueNoise2 } from '../../util/math';
import { CollisionWorld } from '../Colliders';
import { buildGround, cactus, fence, mesas, rock, shrub, wagon } from '../props';
import { Tumbleweed } from '../Tumbleweed';

/** Backdrop for the main menu: a stretch of open desert with a few props and tumbleweeds. */
export function buildMenuDesert(): { group: THREE.Group; tumbleweeds: Tumbleweed[] } {
  const rng = new Rng(4242);
  const group = new THREE.Group();
  const batch = new StaticBatch();
  const cw = new CollisionWorld(60); // props need one, nothing collides here

  group.add(buildGround((x, z, r) => {
    const n = valueNoise2(x * 0.08, z * 0.08, 11) * 0.7 + valueNoise2(x * 0.25, z * 0.25, 5) * 0.3;
    let col: number = n < 0.32 ? PAL.sandDark : n < 0.66 ? PAL.sand : PAL.sandLight;
    const k = r.next();
    if (k < 0.02) col = PAL.sandPale;
    // A wagon trail across the scene.
    if (Math.abs(z - x * 0.3 - 2) < 1.6 && Math.abs(Math.abs(z - x * 0.3 - 2) - 0.9) < 0.35 && k < 0.7) col = 0x8e6c46;
    return col;
  }));

  wagon(batch, cw, -3, -4, 0.5, 'broken');
  fence(batch, cw, 4, -8, 12, -8);
  fence(batch, cw, 12, -8, 12, -2);
  for (const [x, z] of [[-10, -9], [7, 4], [-6, 7], [15, -14], [-15, 3], [2, -15], [18, 6], [-18, -12]] as const) cactus(batch, cw, x, z, rng);
  for (const [x, z] of [[-12, -3], [10, 9], [0, 12], [-20, 10], [20, -6]] as const) rock(batch, cw, x, z, rng);
  for (let i = 0; i < 26; i++) shrub(batch, rng.range(-26, 26), rng.range(-26, 26), rng);
  mesas(batch, rng, 30);
  group.add(batch.build());

  const area = { minX: -30, maxX: 30, minZ: -30, maxZ: 30 };
  const wind = new THREE.Vector2(1.6, 0.7);
  const tumbleweeds = [new THREE.Vector3(-14, 0, -2), new THREE.Vector3(-4, 0, 6), new THREE.Vector3(6, 0, -10)].map(
    (p, i) => new Tumbleweed(p, wind.clone().multiplyScalar(0.8 + i * 0.25), area, 0.4 + i * 0.07),
  );
  for (const t of tumbleweeds) group.add(t.object);
  return { group, tumbleweeds };
}
