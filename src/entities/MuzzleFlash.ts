import * as THREE from 'three';
import { PAL } from '../render/palette';

/** Short-lived star-shaped flash plus a point light pulse. */
export class MuzzleFlash {
  readonly group = new THREE.Group();
  readonly light = new THREE.PointLight(0xffc870, 0, 4.5, 1.6);
  private timer = 0;
  private readonly duration = 0.06;

  constructor() {
    const core = new THREE.MeshBasicMaterial({ color: PAL.white });
    const outer = new THREE.MeshBasicMaterial({ color: PAL.brassLight });
    const a = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), core);
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.55), outer);
    b.position.z = 0.22;
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.06), outer);
    c.position.z = 0.08;
    this.group.add(a, b, c);
    this.group.visible = false;
    // Keep the light in the scene permanently (intensity 0) so shader programs never recompile.
  }

  trigger(pos: THREE.Vector3, dir: THREE.Vector3): void {
    this.timer = this.duration;
    this.group.position.copy(pos);
    this.group.lookAt(pos.x + dir.x, pos.y + dir.y, pos.z + dir.z);
    this.group.rotateZ(Math.random() * Math.PI);
    this.group.scale.setScalar(0.85 + Math.random() * 0.4);
    this.group.visible = true;
    this.light.position.copy(pos).addScaledVector(dir, 0.3);
  }

  update(dt: number): void {
    this.timer = Math.max(0, this.timer - dt);
    this.group.visible = this.timer > 0;
    this.light.intensity = this.timer > 0 ? 14 * (this.timer / this.duration) : 0;
  }
}
