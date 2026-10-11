import * as THREE from 'three';
import { CONFIG } from '../config';
import { randomName } from '../entities/Npc';
import { NpcModel } from '../entities/NpcModel';
import type { Interactable } from '../Interaction';
import { PAL } from '../render/palette';
import { dirToYaw } from '../util/math';

/**
 * The trader at the covered wagon. Out in the open during breaks (E to trade); hidden inside the
 * wagon during waves, where nothing can reach them. Not a target: bullets pass through.
 */
export class Merchant implements Interactable {
  readonly name = randomName('male');
  readonly model = new NpcModel(
    {
      body: 'male',
      skin: PAL.skin,
      hair: PAL.cream,
      hairStyle: 'short',
      beard: PAL.cream,
      clothing: { hat: 'cowboy_hat_tan', top: 'shirt_cream', outerwear: 'vest_brown', legs: 'trousers_brown', boots: 'boots_brown', belt: 'belt_leather' },
    },
    null,
  );
  readonly range = CONFIG.npc.talkRange;
  readonly priority = 2;
  readonly promptHeight = 2.3;
  /** Out of the wagon and open for business. */
  open = false;
  private lookYaw: number;

  constructor(
    readonly position: THREE.Vector3,
    facing: number,
    private onTrade: () => void,
  ) {
    this.lookYaw = facing;
    this.model.face(facing);
    this.model.root.position.copy(position);
  }

  get root(): THREE.Object3D {
    return this.model.root;
  }

  get label(): string {
    return `Trade with ${this.name}`;
  }

  canInteract(): boolean {
    return this.open;
  }

  interact(): void {
    this.onTrade();
  }

  /** Turn towards the player when they're close. */
  animate(dt: number, player: THREE.Vector3): void {
    this.model.root.visible = this.open;
    if (!this.open) return;
    const d = Math.hypot(player.x - this.position.x, player.z - this.position.z);
    if (d < 6) this.lookYaw = dirToYaw(player.x - this.position.x, player.z - this.position.z);
    this.model.animate(dt, {
      speed: 0,
      moveYaw: this.lookYaw,
      lookYaw: this.lookYaw,
      draw: 0,
      recoil: 0,
      reload: -1,
      lean: false,
      talking: false,
      flinch: 0,
      cower: false,
      dead: false,
      mounted: false,
    });
  }
}
