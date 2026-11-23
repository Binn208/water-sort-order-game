import { GameState, Jar, Move } from './types';

/**
 * Returns the top contiguous run of identical color in a jar.
 * If jar is empty, returns null.
 */
export function getTopColorRun(jar: Jar): { color: string; count: number } | null {
  const len = jar.layers.length;
  if (len === 0) return null;

  const color = jar.layers[len - 1];
  let count = 0;
  for (let i = len - 1; i >= 0; i--) {
    if (jar.layers[i] === color) {
      count++;
    } else {
      break;
    }
  }

  return { color, count };
}

/**
 * Checks whether liquid can be poured from source jar into target jar.
 *
 * Rules:
 * 1. Source cannot be empty.
 * 2. Source and target must be distinct jars.
 * 3. Target must have available space (layers.length < capacity).
 * 4. Target must either be empty OR have its top layer matching the source's top color.
 */
export function canPour(source: Jar, target: Jar): boolean {
  if (source.id === target.id) return false;
  if (source.layers.length === 0) return false;
  if (target.layers.length >= target.capacity) return false;

  const sourceRun = getTopColorRun(source);
  if (!sourceRun) return false;

  if (target.layers.length === 0) return true;

  const targetTopColor = target.layers[target.layers.length - 1];
  return targetTopColor === sourceRun.color;
}

/**
 * Computes how many units will actually be transferred from source to target.
 * Partial pour: if target space < run length, only target space units are transferred.
 */
export function computePourAmount(source: Jar, target: Jar): number {
  if (!canPour(source, target)) return 0;

  const sourceRun = getTopColorRun(source);
  if (!sourceRun) return 0;

  const availableSpace = target.capacity - target.layers.length;
  return Math.min(sourceRun.count, availableSpace);
}

/**
 * Generates all legal moves available in the given game state in deterministic order.
 * Order: sorted by fromJarId ascending, then toJarId ascending.
 */
export function legalMoves(state: GameState): Move[] {
  if (state.isWon) return [];

  const moves: Move[] = [];
  const jars = state.jars;
  const n = jars.length;

  for (let i = 0; i < n; i++) {
    const src = jars[i];
    if (src.layers.length === 0) continue;

    const run = getTopColorRun(src);
    if (!run) continue;

    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const tgt = jars[j];

      if (canPour(src, tgt)) {
        const amount = Math.min(run.count, tgt.capacity - tgt.layers.length);
        if (amount > 0) {
          moves.push({
            fromJarId: src.id,
            toJarId: tgt.id,
            count: amount,
            color: run.color,
          });
        }
      }
    }
  }

  // Deterministic sort: fromJarId asc, then toJarId asc
  return moves.sort((a, b) => {
    const cmp = a.fromJarId.localeCompare(b.fromJarId);
    if (cmp !== 0) return cmp;
    return a.toJarId.localeCompare(b.toJarId);
  });
}
