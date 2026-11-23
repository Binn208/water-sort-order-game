import { GameState, Jar } from './types';

const FNV_OFFSET_BASIS = 0xcbf29ce484222325n;
const FNV_PRIME = 0x100000001b3n;
const MASK_64 = 0xffffffffffffffffn;

/**
 * Standard FNV-1a 64-bit hash algorithm.
 * Input: UTF-8 string.
 * Output: 16-character lowercase hex string.
 * This exact algorithm is replicated in Kotlin (ULong) and Swift (UInt64).
 */
export function fnv1a64(input: string): string {
  let hash = FNV_OFFSET_BASIS;
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);

  for (let i = 0; i < bytes.length; i++) {
    hash ^= BigInt(bytes[i]);
    hash = (hash * FNV_PRIME) & MASK_64;
  }

  return hash.toString(16).padStart(16, '0');
}

/**
 * Returns a canonical string representation of a jar's contents.
 * Example: "strawberry,blueberry,strawberry"
 */
export function serializeJarLayers(jar: Jar): string {
  return jar.layers.join(',');
}

/**
 * Generates the canonical string for a state.
 * Symmetries handled:
 * 1. Jar permutation symmetry (sorted lexicographically).
 * 2. Orders representation sorted by color and count.
 * 3. Delivered colors count sorted alphabetically.
 */
export function canonicalString(state: GameState): string {
  const jarStrings = state.jars.map(serializeJarLayers).sort();
  const jarsPart = jarStrings.join('|');

  const orderStrings = state.orders
    .map(o => `${o.color}:${o.fulfilledCount}/${o.count}`)
    .sort()
    .join(';');

  const deliveredPart = Object.entries(state.deliveredColorsCount)
    .sort(([c1], [c2]) => c1.localeCompare(c2))
    .map(([c, count]) => `${c}:${count}`)
    .join(',');

  return `J:[${jarsPart}]#O:[${orderStrings}]#D:[${deliveredPart}]#W:${state.isWon ? 1 : 0}`;
}

/**
 * Returns the 64-bit FNV-1a canonical hash of the game state as a 16-char hex string.
 */
export function canonicalHash(state: GameState): string {
  return fnv1a64(canonicalString(state));
}

/**
 * Exact state hash preserving jar IDs and exact visual order.
 */
export function exactHash(state: GameState): string {
  const jarsPart = state.jars.map(j => `${j.id}:[${j.layers.join(',')}]`).join('|');
  const ordersPart = state.orders.map(o => `${o.id}:${o.fulfilledCount}/${o.count}`).join(';');
  return fnv1a64(`E_J:[${jarsPart}]#O:[${ordersPart}]#W:${state.isWon ? 1 : 0}`);
}
