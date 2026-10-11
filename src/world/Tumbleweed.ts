import * as THREE from 'three';
import { part } from '../render/materials';
import { PAL } from '../render/palette';

/** A rolling, bouncing tumbleweed that drifts with the wind and wraps around an area. */
export class Tumbleweed {
  readonly object = new THREE.Group();
  private ball = new THREE.Group();
  private bounce = Math.random() * 10;

  constructor(
    readonly pos: THREE.Vector3,
    private wind: THREE.Vector2,
    private area: { minX: number; maxX: number; minZ: number; maxZ: number },
    readonly radius = 0.45,
  ) {
    // A loose bundle: a few offset icosahedra in dry-grass tones.
    for (const [s, c, o] of [
      [1, PAL.woodPale, [0, 0, 0]],
      [0.75, PAL.sandDark, [0.12, 0.08, -0.1]],
      [0.65, PAL.wood, [-0.1, -0.05, 0.12]],
    ] as const) {
      const m = part(new THREE.IcosahedronGeometry(radius * s, 0), c, o[0] * radius, o[1] * radius, o[2] * radius, this.ball);
      m.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    }
    this.object.add(this.ball);
    this.object.position.copy(pos);
  }

  update(dt: number): void {
    const speed = this.wind.length() * (0.75 + 0.25 * Math.sin(this.bounce * 0.7));
    const dir = this.wind.clone().normalize();
    this.pos.x += dir.x * speed * dt;
    this.pos.z += dir.y * speed * dt;
    const a = this.area;
    if (this.pos.x > a.maxX) this.pos.x = a.minX;
    if (this.pos.x < a.minX) this.pos.x = a.maxX;
    if (this.pos.z > a.maxZ) this.pos.z = a.minZ;
    if (this.pos.z < a.minZ) this.pos.z = a.maxZ;
    // Hops: |sin| arcs.
    this.bounce += dt * 3.2;
    const hop = Math.abs(Math.sin(this.bounce)) * 0.35;
    this.object.position.set(this.pos.x, this.radius * 0.8 + hop, this.pos.z);
    // Roll about the axis perpendicular to travel.
    const axis = new THREE.Vector3(dir.y, 0, -dir.x);
    this.ball.rotateOnWorldAxis(axis, (speed * dt) / this.radius);
  }
}
