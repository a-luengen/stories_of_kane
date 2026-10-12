/** Pick one of `count` variants at random, never the same as `last` twice in a row (if there's a choice). */
export function pickVariant(count: number, last: number | undefined, rand: () => number = Math.random): number {
  if (count <= 1) return 0;
  if (last === undefined || last < 0 || last >= count) return Math.floor(rand() * count);
  // Choose among the others.
  const k = Math.floor(rand() * (count - 1));
  return k >= last ? k + 1 : k;
}

/** `base` scaled by a random factor in [1 − spread, 1 + spread]. */
export function jitter(base: number, spread: number, rand: () => number = Math.random): number {
  return spread > 0 ? base * (1 + (rand() * 2 - 1) * spread) : base;
}
