import { LevelDefinition, Move } from '../engine/types';
import { solve, verifySolution } from '../solver/solver';

/**
 * Deterministic PRNG (Mulberry32)
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

const COLOR_NAMES = [
  'strawberry',
  'blueberry',
  'orange',
  'kiwi',
  'grape',
  'lemon',
  'peach',
  'mint',
  'chocolate',
  'vanilla',
];

const CUSTOMER_NAMES = [
  'cat_mochi',
  'cat_mimi',
  'cat_boba',
  'cat_luna',
  'cat_simba',
  'cat_oliver',
  'cat_milo',
  'cat_chloe',
  'cat_felix',
  'cat_nami',
];

export interface GeneratorParams {
  levelId: number;
  seed: number;
  numColors: number;
  capacity?: number;
  numEmptyJars?: number;
  reverseSteps?: number;
  minMovesRequired?: number;
  maxMovesAllowed?: number;
}

/**
 * Generates a provably solvable level via reverse mixing from solved state.
 */
export function generateLevel(params: GeneratorParams): {
  level: LevelDefinition;
  solution: Move[];
  minMoves: number;
  nodesExplored: number;
} {
  const {
    levelId,
    seed,
    numColors,
    capacity = 4,
    numEmptyJars = 2,
    reverseSteps = 25,
    minMovesRequired = 4,
    maxMovesAllowed = 60,
  } = params;

  let currentSeed = seed;

  for (let attempt = 0; attempt < 50; attempt++) {
    const prng = createPrng(currentSeed);
    currentSeed += 1337;

    const colors = COLOR_NAMES.slice(0, numColors);

    // Initial solved jars: 1 full jar per color
    const jars: { id: string; capacity: number; layers: string[] }[] = colors.map((c, idx) => ({
      id: `jar_${idx + 1}`,
      capacity,
      layers: Array(capacity).fill(c),
    }));

    // Add empty jars
    for (let e = 0; e < numEmptyJars; e++) {
      jars.push({
        id: `jar_${colors.length + e + 1}`,
        capacity,
        layers: [],
      });
    }

    // Reverse pouring simulation to scramble jars
    for (let step = 0; step < reverseSteps; step++) {
      // Pick a source jar that has layers
      const nonEmpties = jars.filter(j => j.layers.length > 0);
      if (nonEmpties.length === 0) break;
      const src = nonEmpties[Math.floor(prng() * nonEmpties.length)];

      // Pick a target jar that has space
      const availableTargets = jars.filter(j => j.id !== src.id && j.layers.length < j.capacity);
      if (availableTargets.length === 0) continue;
      const tgt = availableTargets[Math.floor(prng() * availableTargets.length)];

      // Transfer 1 unit in reverse
      const popped = src.layers.pop()!;
      tgt.layers.push(popped);
    }

    // Create orders
    const orders = colors.map((c, idx) => ({
      id: `order_${idx + 1}`,
      customerId: CUSTOMER_NAMES[idx % CUSTOMER_NAMES.length],
      color: c,
      count: 1,
      maxPatienceSeconds: 60 + numColors * 15,
    }));

    const candidateLevel: LevelDefinition = {
      id: levelId,
      seed: currentSeed,
      jars,
      orders,
      starThresholds: {
        moves: [12, 18, 25],
      },
    };

    // Solve candidate with Solver to verify and get minimal path
    const solveResult = solve(candidateLevel, { maxNodes: 80000, maxDepth: 50 });

    if (
      solveResult.solvable &&
      solveResult.minMoves >= minMovesRequired &&
      solveResult.minMoves <= maxMovesAllowed
    ) {
      // Calibrate star thresholds according to minimal solver moves
      const minM = solveResult.minMoves;
      candidateLevel.starThresholds = {
        moves: [
          Math.ceil(minM * 1.15) + 1, // 3 stars
          Math.ceil(minM * 1.5) + 2,  // 2 stars
          Math.ceil(minM * 2.2) + 4,  // 1 star
        ],
      };

      candidateLevel.solution = solveResult.solution;
      candidateLevel.metrics = {
        minMoves: minM,
        nodesExplored: solveResult.nodesExplored,
        branchingFactor: 2.2,
        deadEndRatio: 0.15,
      };

      // Ensure solution replay passes
      const replay = verifySolution(candidateLevel, solveResult.solution);
      if (replay.win) {
        return {
          level: candidateLevel,
          solution: solveResult.solution,
          minMoves: minM,
          nodesExplored: solveResult.nodesExplored,
        };
      }
    }
  }

  throw new Error(`Failed to generate valid solvable level for levelId=${levelId} after 50 attempts.`);
}
