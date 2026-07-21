// Public surface of the grid primitives (Phase 2, issue #10): the seeded PRNG,
// the compass direction vectors + reverse transform, and German-aware word
// normalization. Placement/fill logic re-exports here as it lands.
export { mulberry32, seedFromString } from './prng';
export type { RandomFn } from './prng';
export {
  DIRECTIONS,
  DIRECTION_VECTORS,
  oppositeDirection,
  reverseVector,
} from './directions';
export type { DirectionVector } from './directions';
export { normalizeWord } from './normalize';
