import * as THREE from 'three';
import type { Interactable } from '../Interaction';
import { clothingOf, itemDef } from '../items/ItemDef';
import { itemLabel, type ItemInstance } from '../items/ItemInstance';
import { buildItemMesh } from '../items/itemMeshes';
import { PAL } from '../render/palette';
import type { CollisionWorld } from './Colliders';

/** Lying upright (hats, boots, ammo) rather than flat on its side. */
const UPRIGHT = new Set(['hat', 'boots']);

/** An item lying on the ground: bobs a little and glints now and then; E picks it up. */
export class WorldItem implements Interactable {
  readonly object = new THREE.Group();
  readonly glint: THREE.Mesh;
  readonly range = 2;
  readonly priority = 1;
  readonly promptHeight = 0.9;
  /** Set by the owner: what picking up does. */
  onPickup: (w: WorldItem) => void = () => {};
  private body = new THREE.Group();
  private phase = Math.random() * 10;

  constructor(
    public item: ItemInstance,
    readonly position: THREE.Vector3,
    glintMat: THREE.Material,
  ) {
    const def = itemDef(item.defId);
    const mesh = buildItemMesh(def);
    const slot = clothingOf(def)?.slot;
    const upright = def.category === 'ammo' || (slot !== undefined && UPRIGHT.has(slot));
    if (!upright) mesh.rotation.x = -Math.PI / 2; // lay it down, display side up
    // Sit on the ground, centred on the spot (a bit oversized so small items read at pixel scale).
    mesh.scale.setScalar(1.4);
    this.body.add(mesh);
    mesh.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(mesh);
    const c = box.getCenter(new THREE.Vector3());
    mesh.position.set(-c.x, 0.03 - box.min.y, -c.z);
    this.body.rotation.y = Math.random() * Math.PI * 2;
    this.object.add(this.body);
    this.object.position.copy(position);

    this.glint = new THREE.Mesh(new THREE.OctahedronGeometry(0.07), glintMat);
    this.glint.position.set(0, box.max.y - box.min.y + 0.12, 0);
    this.glint.visible = false;
    this.object.add(this.glint);
  }

  get label(): string {
    return `Pick up ${itemLabel(this.item)}`;
  }

  canInteract(): boolean {
    return true;
  }

  interact(): void {
    this.onPickup(this);
  }

  update(dt: number): void {
    this.phase += dt;
    this.body.position.y = Math.sin(this.phase * 2.2) * 0.025 + 0.025;
    // A short sparkle every couple of seconds.
    const t = this.phase % 2.4;
    this.glint.visible = t < 0.18;
    this.glint.scale.setScalar(t < 0.09 ? 0.6 + t * 6 : 1.14 - (t - 0.09) * 6);
    this.glint.rotation.y = this.phase * 3;
  }
}

/** Items dropped into the world (they stay for the session). */
export class WorldItemSystem {
  readonly group = new THREE.Group();
  /** Unoutlined sparkles (added to the pixel pass's unoutlined list). */
  readonly glints = new THREE.Group();
  readonly items: WorldItem[] = [];
  private glintMat = new THREE.MeshBasicMaterial({ color: PAL.white });

  constructor(private world: CollisionWorld) {}

  /** Drop an item on the nearest free spot around `near`, starting in the `towardYaw` direction. */
  spawn(item: ItemInstance, near: THREE.Vector3, towardYaw: number, minRadius = 1): WorldItem {
    return this.placeAt(item, this.freeSpot(near, towardYaw, minRadius));
  }

  /** Put an item exactly at `spot` (restoring where it lay). */
  placeAt(item: ItemInstance, spot: THREE.Vector3): WorldItem {
    const w = new WorldItem(item, spot.clone().setY(0), this.glintMat);
    this.items.push(w);
    this.group.add(w.object);
    // Keep the sparkle out of the outline pass, but positioned with its item.
    w.object.remove(w.glint);
    w.glint.position.add(spot);
    this.glints.add(w.glint);
    return w;
  }

  remove(w: WorldItem): void {
    const i = this.items.indexOf(w);
    if (i < 0) return;
    this.items.splice(i, 1);
    w.object.removeFromParent();
    w.glint.removeFromParent();
  }

  update(dt: number): void {
    for (const w of this.items) w.update(dt);
  }

  private freeSpot(near: THREE.Vector3, yaw: number, minRadius: number): THREE.Vector3 {
    for (const r of [minRadius, minRadius + 0.6, minRadius + 1.2, minRadius + 1.8]) {
      for (let k = 0; k < 12; k++) {
        // Alternate either side of the preferred direction.
        const a = yaw + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (Math.PI / 6);
        const p = { x: near.x + Math.sin(a) * r, z: near.z + Math.cos(a) * r };
        const before = { ...p };
        this.world.resolveCircle(p, 0.3);
        if (Math.hypot(p.x - before.x, p.z - before.z) > 1e-4) continue;
        if (this.items.some((w) => Math.hypot(w.position.x - p.x, w.position.z - p.z) < 0.6)) continue;
        return new THREE.Vector3(p.x, 0, p.z);
      }
    }
    return new THREE.Vector3(near.x, 0, near.z);
  }
}
