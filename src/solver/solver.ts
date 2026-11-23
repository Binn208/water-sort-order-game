import {
  applyMove,
  canonicalHash,
  createGame,
  GameState,
  legalMoves,
  LevelDefinition,
  Move,
} from '../engine';

export interface SolverResult {
  solvable: boolean;
  solution: Move[];
  nodesExplored: number;
  exhaustedBudget: boolean;
  minMoves: number;
}

export interface SolverOptions {
  maxNodes?: number;
  maxDepth?: number;
}

/**
 * Prunes moves that are mathematically redundant:
 * 1. Pouring from a jar that is already completely uniform into an empty jar.
 * 2. Pouring into an empty jar when another empty jar has already been tried at the same step.
 */
function filterSearchMoves(state: GameState, moves: Move[]): Move[] {
  const filtered: Move[] = [];
  let triedEmptyTarget = false;

  for (const move of moves) {
    const src = state.jars.find(j => j.id === move.fromJarId);
    const tgt = state.jars.find(j => j.id === move.toJarId);
    if (!src || !tgt) continue;

    // Prune pouring completely uniform jar to an empty jar
    const isSrcUniformFull = src.layers.length === src.capacity && src.layers.every(c => c === src.layers[0]);
    if (tgt.layers.length === 0 && isSrcUniformFull) {
      continue;
    }

    // Prune moving to multiple identical empty jars
    if (tgt.layers.length === 0) {
      if (triedEmptyTarget) {
        continue;
      }
      triedEmptyTarget = true;
    }

    filtered.push(move);
  }

  return filtered;
}

/**
 * BFS / A* Solver for Cat Syrup Sort.
 * Explores state space using canonicalHash deduplication to guarantee shortest solution path.
 */
export function solve(levelOrState: LevelDefinition | GameState, options: SolverOptions = {}): SolverResult {
  const maxNodes = options.maxNodes ?? 150000;
  const maxDepth = options.maxDepth ?? 80;

  let initialState: GameState;
  if ('jars' in levelOrState && Array.isArray((levelOrState as LevelDefinition).orders)) {
    // Check if it's LevelDefinition or GameState
    if ('initialSupplies' in levelOrState) {
      initialState = levelOrState as GameState;
    } else {
      initialState = createGame(levelOrState as LevelDefinition);
    }
  } else {
    initialState = levelOrState as GameState;
  }

  if (initialState.isWon) {
    return {
      solvable: true,
      solution: [],
      nodesExplored: 1,
      exhaustedBudget: false,
      minMoves: 0,
    };
  }

  interface QueueNode {
    state: GameState;
    moves: Move[];
    depth: number;
  }

  const queue: QueueNode[] = [{ state: initialState, moves: [], depth: 0 }];
  const visited = new Set<string>();
  visited.add(canonicalHash(initialState));

  let nodesExplored = 0;

  while (queue.length > 0) {
    nodesExplored++;
    if (nodesExplored > maxNodes) {
      return {
        solvable: false,
        solution: [],
        nodesExplored,
        exhaustedBudget: true,
        minMoves: 0,
      };
    }

    const current = queue.shift()!;

    if (current.state.isWon) {
      return {
        solvable: true,
        solution: current.moves,
        nodesExplored,
        exhaustedBudget: false,
        minMoves: current.moves.length,
      };
    }

    if (current.depth >= maxDepth) {
      continue;
    }

    const rawMoves = legalMoves(current.state);
    const moves = filterSearchMoves(current.state, rawMoves);

    for (const move of moves) {
      try {
        const nextState = applyMove(current.state, move);
        const hash = canonicalHash(nextState);

        if (!visited.has(hash)) {
          visited.add(hash);
          queue.push({
            state: nextState,
            moves: [...current.moves, move],
            depth: current.depth + 1,
          });
        }
      } catch {
        // Illegal move ignored
      }
    }
  }

  return {
    solvable: false,
    solution: [],
    nodesExplored,
    exhaustedBudget: false,
    minMoves: 0,
  };
}

/**
 * Checks if the current state has become a dead end (unsolvable within budget).
 */
export function isDeadEnd(state: GameState, budget: number = 3000): boolean {
  if (state.isWon) return false;
  if (state.isStuck) return true;

  const res = solve(state, { maxNodes: budget, maxDepth: 40 });
  return !res.solvable && !res.exhaustedBudget;
}

/**
 * Replays a move sequence on a level to verify solvability certificate.
 */
export function verifySolution(
  level: LevelDefinition,
  solution: Move[]
): { win: boolean; finalState: GameState; error?: string } {
  let state = createGame(level);

  for (let i = 0; i < solution.length; i++) {
    const move = solution[i];
    try {
      state = applyMove(state, move);
    } catch (err: unknown) {
      return {
        win: false,
        finalState: state,
        error: `Step ${i + 1} failed: ${(err as Error).message}`,
      };
    }
  }

  return {
    win: state.isWon,
    finalState: state,
  };
}
