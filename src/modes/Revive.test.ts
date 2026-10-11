import { describe, expect, it } from 'vitest';
import { CONFIG } from '../config';
import { ReviveTracker } from './Revive';

describe('revive', () => {
  it('the first death revives (after slow motion and the get-up delay), the second ends the run', () => {
    const r = new ReviveTracker();
    expect(r.onDeath()).toBe('revive');
    expect(r.tokens).toBe(0);
    expect(r.timeScale).toBe(CONFIG.wave.revive.slowMo);
    expect(r.update(CONFIG.wave.revive.slowMoTime + 0.01)).toBeNull();
    expect(r.timeScale).toBe(1);
    expect(r.update(CONFIG.wave.revive.getUpAfter)).toBe('getUp');
    expect(r.dying).toBe(false);

    expect(r.onDeath()).toBe('gameover');
    let result = null;
    for (let t = 0; t < 5 && !result; t += 0.1) result = r.update(0.1);
    expect(result).toBe('gameover');
  });
});
