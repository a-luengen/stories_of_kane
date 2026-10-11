import * as THREE from 'three';
import { CONFIG } from './config';
import { damp } from './util/math';

/**
 * True isometric orthographic camera (45° yaw, 35.26° pitch).
 *
 * `view` is the logical, unsnapped camera covering exactly the visible low-res area; it is used
 * for picking and debug projection. `camera` is what actually renders: its position is snapped to
 * the low-res pixel grid (so static geometry rasterizes identically every frame → no shimmer) and
 * its frustum includes a 1px border. The snap remainder (`subpixel`, in low-res pixels) is applied
 * by the upscale pass so the camera still glides smoothly at screen resolution.
 */
export class CameraRig {
  readonly camera: THREE.OrthographicCamera;
  readonly view: THREE.OrthographicCamera;
  readonly right = new THREE.Vector3();
  readonly up = new THREE.Vector3();
  readonly back = new THREE.Vector3();
  /** Screen-relative ground directions (unit vectors on XZ). */
  readonly screenRightGround = new THREE.Vector3(1, 0, -1).normalize();
  readonly screenUpGround = new THREE.Vector3(-1, 0, -1).normalize();

  readonly focus = new THREE.Vector3();
  readonly subpixel = new THREE.Vector2();
  private trauma = 0;
  private shakeTime = 0;
  private lowW = CONFIG.render.baseWidth;
  private lowH = CONFIG.render.baseHeight;
  private readonly offset: THREE.Vector3;

  constructor() {
    const c = CONFIG.camera;
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, c.near, c.far);
    this.view = new THREE.OrthographicCamera(-1, 1, 1, -1, c.near, c.far);
    this.offset = new THREE.Vector3(1, 1, 1).normalize().multiplyScalar(c.distance);
    for (const cam of [this.camera, this.view]) {
      cam.position.copy(this.offset);
      cam.lookAt(0, 0, 0);
      cam.updateMatrixWorld();
    }
    this.right.setFromMatrixColumn(this.camera.matrixWorld, 0).normalize();
    this.up.setFromMatrixColumn(this.camera.matrixWorld, 1).normalize();
    this.back.setFromMatrixColumn(this.camera.matrixWorld, 2).normalize();
  }

  get pixelSize(): number {
    return CONFIG.render.unitsPerPixel;
  }

  setViewport(lowW: number, lowH: number): void {
    this.lowW = lowW;
    this.lowH = lowH;
    const px = this.pixelSize;
    const hw = (lowW / 2) * px;
    const hh = (lowH / 2) * px;
    Object.assign(this.view, { left: -hw, right: hw, top: hh, bottom: -hh });
    this.view.updateProjectionMatrix();
    this.applyRenderFrustum(true);
  }

  private bordered = true;
  private applyRenderFrustum(border: boolean): void {
    this.bordered = border;
    const px = this.pixelSize;
    const b = border ? 1 : 0;
    const hw = (this.lowW / 2 + b) * px;
    const hh = (this.lowH / 2 + b) * px;
    Object.assign(this.camera, { left: -hw, right: hw, top: hh, bottom: -hh });
    this.camera.updateProjectionMatrix();
  }

  addTrauma(amount: number): void {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  snapTo(target: THREE.Vector3): void {
    this.focus.copy(target);
  }

  private tmp = new THREE.Vector3();

  /**
   * @param desired world point to keep centred
   * @param snap snap the render camera to the pixel grid (pixel mode)
   */
  update(dt: number, desired: THREE.Vector3, snap: boolean): void {
    const s = CONFIG.camera.followSharpness;
    this.focus.x = damp(this.focus.x, desired.x, s, dt);
    this.focus.y = damp(this.focus.y, desired.y, s, dt);
    this.focus.z = damp(this.focus.z, desired.z, s, dt);

    // Trauma-based screen shake, expressed in the camera plane.
    this.trauma = Math.max(0, this.trauma - CONFIG.shake.decay * dt);
    this.shakeTime += dt;
    const shake = this.trauma * this.trauma * CONFIG.shake.maxOffset;
    const sx = shake * Math.sin(this.shakeTime * 71.3) * Math.cos(this.shakeTime * 13.1);
    const sy = shake * Math.sin(this.shakeTime * 57.7 + 1.7);

    const pos = this.tmp.copy(this.focus).add(this.offset);
    pos.addScaledVector(this.right, sx).addScaledVector(this.up, sy);
    this.view.position.copy(pos);
    this.view.updateMatrixWorld();

    if (snap !== this.bordered) this.applyRenderFrustum(snap);

    if (snap) {
      const px = this.pixelSize;
      const x = pos.dot(this.right);
      const y = pos.dot(this.up);
      const z = pos.dot(this.back);
      const xs = Math.round(x / px) * px;
      const ys = Math.round(y / px) * px;
      this.camera.position
        .copy(this.right)
        .multiplyScalar(xs)
        .addScaledVector(this.up, ys)
        .addScaledVector(this.back, z);
      this.subpixel.set(CONFIG.render.subpixelCamera ? (x - xs) / px : 0, CONFIG.render.subpixelCamera ? (y - ys) / px : 0);
    } else {
      this.camera.position.copy(pos);
      this.subpixel.set(0, 0);
    }
    this.camera.updateMatrixWorld();
  }

  private ray = new THREE.Ray();
  /** Intersect the cursor (NDC of the visible area) with the horizontal plane y = height. */
  pickPlane(ndcX: number, ndcY: number, height: number, out: THREE.Vector3): THREE.Vector3 {
    const v = this.view;
    this.ray.origin
      .copy(v.position)
      .addScaledVector(this.right, ndcX * v.right)
      .addScaledVector(this.up, ndcY * v.top);
    this.ray.direction.copy(this.back).negate();
    const t = (height - this.ray.origin.y) / this.ray.direction.y;
    return this.ray.at(t, out);
  }
}
