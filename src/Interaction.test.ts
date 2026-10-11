import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { pickInteractable, type Interactable } from './Interaction';

function thing(label: string, x: number, z: number, opts: Partial<Interactable> = {}): Interactable {
  return { label, range: 3, priority: 0, position: new THREE.Vector3(x, 0, z), promptHeight: 2, canInteract: () => true, interact: () => {}, ...opts };
}

describe('pickInteractable', () => {
  const origin = new THREE.Vector3(0, 0, 0);

  it('picks the candidate closest to the aim direction, not the nearest', () => {
    const near = thing('near', -1, 0); // to the left, close
    const ahead = thing('ahead', 0, 2.5); // straight ahead (+Z = yaw 0), further
    expect(pickInteractable([near, ahead], origin, 0)?.label).toBe('ahead');
    expect(pickInteractable([near, ahead], origin, -Math.PI / 2)?.label).toBe('near');
  });

  it('ignores things out of range or unavailable', () => {
    expect(pickInteractable([thing('far', 0, 4)], origin, 0)).toBeNull();
    expect(pickInteractable([thing('busy', 0, 1, { canInteract: () => false })], origin, 0)).toBeNull();
  });

  it('priority breaks near-ties', () => {
    const a = thing('a', 0.1, 2);
    const b = thing('b', -0.1, 2, { priority: 1 });
    expect(pickInteractable([a, b], origin, 0)?.label).toBe('b');
  });
});
