import type * as THREE from 'three';
import { angleDelta, dirToYaw } from './util/math';

/** Anything the player can use with E: the horse, NPCs, later doors and items. */
export interface Interactable {
  /** Prompt text, e.g. "Talk to Jed Collins". */
  readonly label: string;
  /** Max horizontal distance from the player. */
  readonly range: number;
  /** Tie-breaker when two candidates are about equally in the aim direction (higher wins). */
  readonly priority: number;
  /** Where it stands (ground level). */
  readonly position: THREE.Vector3;
  /** Height above `position` to show the prompt at. */
  readonly promptHeight: number;
  canInteract(): boolean;
  interact(): void;
}

/** Each priority point is worth this much aim angle (radians). */
const PRIORITY_WEIGHT = 0.2;

/**
 * Among usable interactables in range, the one closest to the aim direction. Things right at
 * the player's feet count as straight ahead (the direction to them is meaningless).
 */
export function pickInteractable(list: readonly Interactable[], from: THREE.Vector3, aimYaw: number): Interactable | null {
  let best: Interactable | null = null;
  let bestScore = Infinity;
  for (const it of list) {
    const dx = it.position.x - from.x;
    const dz = it.position.z - from.z;
    const d = Math.hypot(dx, dz);
    if (d > it.range || !it.canInteract()) continue;
    const angle = d < 0.6 ? 0 : Math.abs(angleDelta(aimYaw, dirToYaw(dx, dz)));
    const score = angle - it.priority * PRIORITY_WEIGHT;
    if (score < bestScore) {
      bestScore = score;
      best = it;
    }
  }
  return best;
}
