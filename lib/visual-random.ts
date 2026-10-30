/**
 * Pure, deterministic pseudo-random fraction in [0, 1) for decorative visuals.
 * Same (index, channel) always yields the same value. No global state.
 */
export function visualRandom(index: number, channel: number): number {
  let h = Math.imul((index | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul((channel | 0) + 1, 0xc2b2ae35);
  h ^= h >>> 16;
  h = Math.imul(h, 0x7feb352d);
  h ^= h >>> 15;
  h = Math.imul(h, 0x846ca68b);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
