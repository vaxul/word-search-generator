// Seeded pseudo-random number generator for the grid engine.
//
// The engine must be deterministic given a seed (docs/constitution.md +
// spec-grid-engine.md Prior decisions): the same `(config, seed)` yields a
// byte-identical grid so unit tests can pin fixtures. `Math.random()` is
// therefore forbidden anywhere in src/core — all randomness flows through this
// pinned, pure, dependency-free generator.
//
// Algorithm: mulberry32 — a tiny, well-distributed 32-bit PRNG. `mulberry32`
// takes a numeric seed and returns a generator closure; each call yields the
// next float in the half-open range [0, 1). The same seed always produces the
// same sequence, and two different seeds produce (with overwhelming likelihood)
// different sequences.

/** A pure random source: each call returns the next float in [0, 1). */
export type RandomFn = () => number;

/**
 * Build a deterministic PRNG from a numeric seed (mulberry32).
 *
 * Pure factory: `mulberry32(seed)` returns a stateful closure, but the factory
 * itself has no external side effects and no dependency on `Math.random()`.
 * Two generators built from the same seed emit identical sequences.
 *
 * @param seed - Any 32-bit-representable integer; the starting state.
 * @returns A {@link RandomFn} yielding successive floats in [0, 1).
 */
export function mulberry32(seed: number): RandomFn {
  // `>>> 0` coerces the seed into an unsigned 32-bit integer so fractional or
  // negative seeds still produce a well-defined, reproducible state.
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Derive a stable 32-bit numeric seed from a string (xfnv1a hash).
 *
 * Callers that seed generation from a textual key (e.g. a per-run token) need a
 * deterministic string → number reduction; passing the raw string to
 * {@link mulberry32} would not be numeric. This is a pure hash — the same input
 * always yields the same seed.
 *
 * @param input - The string to hash.
 * @returns An unsigned 32-bit integer suitable as a mulberry32 seed.
 */
export function seedFromString(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
