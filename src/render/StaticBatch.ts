import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { vertexToon } from './materials';

const tmpColor = new THREE.Color();
const tmpMatrix = new THREE.Matrix4();
const tmpQuat = new THREE.Quaternion();
const tmpEuler = new THREE.Euler();
const tmpPos = new THREE.Vector3();
const tmpScale = new THREE.Vector3();

/**
 * Collects static, flat-shaded geometry with per-vertex colour and merges it into a single mesh
 * (one draw call per pass for the whole map).
 */
export class StaticBatch {
  private geos: THREE.BufferGeometry[] = [];

  add(geo: THREE.BufferGeometry, color: number, matrix: THREE.Matrix4): void {
    let g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.deleteAttribute('uv');
    g.applyMatrix4(matrix);
    g.computeVertexNormals(); // non-indexed → flat face normals
    tmpColor.setHex(color);
    const n = g.getAttribute('position').count;
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) col.set([tmpColor.r, tmpColor.g, tmpColor.b], i * 3);
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    // Normalise attribute set for merging.
    for (const name of Object.keys(g.attributes)) {
      if (name !== 'position' && name !== 'normal' && name !== 'color') g.deleteAttribute(name);
    }
    this.geos.push(g);
    if (g !== geo) geo.dispose();
  }

  /** Add a geometry with position, Euler rotation and scale. */
  put(
    geo: THREE.BufferGeometry,
    color: number,
    x: number,
    y: number,
    z: number,
    rx = 0,
    ry = 0,
    rz = 0,
    sx = 1,
    sy = 1,
    sz = 1,
  ): void {
    tmpQuat.setFromEuler(tmpEuler.set(rx, ry, rz));
    tmpMatrix.compose(tmpPos.set(x, y, z), tmpQuat, tmpScale.set(sx, sy, sz));
    this.add(geo, color, tmpMatrix);
  }

  /** Box whose base sits at y (convenient for props). */
  box(w: number, h: number, d: number, color: number, x: number, y: number, z: number, ry = 0, parent?: THREE.Matrix4): void {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(0, h / 2, 0);
    tmpQuat.setFromEuler(tmpEuler.set(0, ry, 0));
    tmpMatrix.compose(tmpPos.set(x, y, z), tmpQuat, tmpScale.set(1, 1, 1));
    if (parent) tmpMatrix.premultiply(parent);
    this.add(g, color, tmpMatrix);
  }

  get isEmpty(): boolean {
    return this.geos.length === 0;
  }

  build(material: THREE.Material = vertexToon()): THREE.Mesh {
    const merged = mergeGeometries(this.geos, false);
    for (const g of this.geos) g.dispose();
    this.geos = [];
    const mesh = new THREE.Mesh(merged, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }
}
