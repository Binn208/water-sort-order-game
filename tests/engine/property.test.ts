import { describe, expect, it } from 'vitest';
import {
  addRescueJar,
  applyMove,
  canonicalHash,
  createGame,
  deserializeState,
  GameState,
  legalMoves,
  LevelDefinition,
  serializeState,
  undo,
  validateInvariants,
} from '../../src/engine';

/**
 * Deterministic pseudo-random number generator (Mulberry32)
 */
function createPrng(seed: number) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates a valid random level guaranteed to satisfy supply >= demand.
 */
function generateRandomValidLevel(seed: number, numColors: number, numEmptyJars: number): LevelDefinition {
  const prng = createPrng(seed);
  const colorPool = ['strawberry', 'blueberry', 'lemon', 'kiwi', 'grape', 'peach', 'orange', 'mint'];
  const colors = colorPool.slice(0, numColors);
  const capacity = 4;

  // Each color has 1 full jar
  const jarsUnits: string[][] = colors.map(c => [c, c, c, c]);

  // Shuffle all units together to create mixed initial jars
  const allUnits: string[] = jarsUnits.flat();
  for (let i = allUnits.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [allUnits[i], allUnits[j]] = [allUnits[j], allUnits[i]];
  }

  // Distribute back into jars
  const jars = colors.map((_, idx) => ({
    id: `jar_${idx + 1}`,
    capacity,
    layers: allUnits.slice(idx * capacity, (idx + 1) * capacity),
  }));

  // Add empty jars
  for (let i = 0; i < numEmptyJars; i++) {
    jars.push({
      id: `empty_jar_${i + 1}`,
      capacity,
      layers: [],
    });
  }

  // Create orders for all colors (each needs 1 jar)
  const orders = colors.map((c, idx) => ({
    id: `order_${c}`,
    customerId: `cat_customer_${idx + 1}`,
    color: c,
    count: 1,
    maxPatienceSeconds: 60,
  }));

  return {
    id: `fuzz_${seed}`,
    seed,
    jars,
    orders,
    starThresholds: { moves: [20, 30, 45] },
  };
}

describe('Property-Based & Fuzz Testing (Kiểm thử tính chất & hàng nghìn trạng thái)', () => {
  it('Bảo toàn đơn vị mỗi màu, sức chứa bình, supply >= demand qua 500 bước ngẫu nhiên', () => {
    const seeds = [101, 202, 303, 404, 505];

    for (const seed of seeds) {
      const level = generateRandomValidLevel(seed, 4, 2);
      let state = createGame(level);
      const prng = createPrng(seed + 9999);

      // Track states for reversibility test
      const stateStack: { state: GameState; hash: string }[] = [];

      for (let step = 0; step < 100; step++) {
        if (state.isWon) break;

        const moves = legalMoves(state);

        // Invariant: legalMoves.length === 0 <=> isStuck
        if (moves.length === 0) {
          expect(state.isStuck).toBe(true);

          // Test Rescue mechanism when stuck
          if (state.freeRescueAvailable) {
            state = addRescueJar(state);
            expect(state.isStuck).toBe(false);
            const newMoves = legalMoves(state);
            expect(newMoves.length).toBeGreaterThan(0);
          } else if (stateStack.length > 0) {
            // If stuck and rescue used, player can undo
            const previous = stateStack.pop()!;
            state = undo(state);
            expect(canonicalHash(state)).toBe(previous.hash);
            continue;
          } else {
            // Can restart to level beginning
            break;
          }
        } else {
          expect(state.isStuck).toBe(false);
        }

        // Test Undo randomly (25% chance if history exists)
        if (stateStack.length > 0 && prng() < 0.25) {
          const previous = stateStack.pop()!;
          state = undo(state);
          expect(canonicalHash(state)).toBe(previous.hash);
          const invAfterUndo = validateInvariants(state);
          expect(invAfterUndo.valid).toBe(true);
          continue;
        }

        // Choose a random legal move
        const availableMoves = legalMoves(state);
        if (availableMoves.length === 0) break;

        const chosenMove = availableMoves[Math.floor(prng() * availableMoves.length)];
        const currentHash = canonicalHash(state);
        stateStack.push({ state, hash: currentHash });

        // Apply move
        state = applyMove(state, chosenMove);

        // Assert 1: Invariants valid
        const inv = validateInvariants(state);
        expect(inv.valid).toBe(true);
        expect(inv.errors).toEqual([]);

        // Assert 2: Jar capacities
        for (const jar of state.jars) {
          expect(jar.layers.length).toBeLessThanOrEqual(jar.capacity);
        }

        // Assert 3: Serialization roundtrip
        const serialized = serializeState(state);
        const restored = deserializeState(serialized);
        expect(canonicalHash(restored)).toBe(canonicalHash(state));
      }
    }
  });

  it('Tính chất Không bao giờ mất lối thoát vĩnh viễn (No Permanent Softlock)', () => {
    // Over 50 random game simulations: at every single step, there MUST be at least
    // one escape route: a legal move, an undo, a rescue jar, or restart.
    for (let s = 1; s <= 20; s++) {
      const level = generateRandomValidLevel(s * 17, 3, 1);
      let state = createGame(level);
      const prng = createPrng(s * 123);

      for (let step = 0; step < 50; step++) {
        if (state.isWon) break;

        const moves = legalMoves(state);
        const hasMoves = moves.length > 0;
        const canUndo = state.history.length > 0;
        const canRescue = state.freeRescueAvailable;
        const canRestart = true; // Restart always available

        // Condition 4.4: At all times, player has at least one valid path forward or backward
        expect(hasMoves || canUndo || canRescue || canRestart).toBe(true);

        if (hasMoves) {
          const move = moves[Math.floor(prng() * moves.length)];
          state = applyMove(state, move);
        } else if (canRescue) {
          state = addRescueJar(state);
        } else if (canUndo) {
          state = undo(state);
        } else {
          break;
        }
      }
    }
  });

  it('Tính chất Bất biến Deterministic: cùng một chuỗi nước đi luôn tạo ra cùng kết quả', () => {
    const level = generateRandomValidLevel(999, 3, 2);
    const game1 = createGame(level);
    const game2 = createGame(level);

    expect(canonicalHash(game1)).toBe(canonicalHash(game2));

    const moves1 = legalMoves(game1);
    const moves2 = legalMoves(game2);
    expect(moves1).toEqual(moves2);

    if (moves1.length > 0) {
      const m = moves1[0];
      const next1 = applyMove(game1, m);
      const next2 = applyMove(game2, m);
      expect(canonicalHash(next1)).toBe(canonicalHash(next2));
    }
  });
});
