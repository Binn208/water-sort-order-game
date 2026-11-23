import {
  GameState,
  Jar,
  LevelDefinition,
  Move,
  MoveRecord,
  Order,
  PackingEvent,
} from './types';
import {
  computeCurrentJarUnits,
  validateInvariants,
  validateSupplyVsDemand,
} from './invariants';
import { canPour, computePourAmount, getTopColorRun, legalMoves } from './moves';

/**
 * Creates an initial GameState from a LevelDefinition.
 */
export function createGame(level: LevelDefinition): GameState {
  // Deep clone jars
  const jars: Jar[] = level.jars.map(j => ({
    id: j.id,
    capacity: j.capacity,
    layers: [...j.layers],
  }));

  const capacity = jars.length > 0 ? jars[0].capacity : 4;

  // Deep clone orders
  const orders: Order[] = level.orders.map((o, idx) => ({
    id: o.id,
    customerId: o.customerId,
    color: o.color,
    count: o.count,
    fulfilledCount: 0,
    maxPatienceSeconds: o.maxPatienceSeconds || 60,
    remainingPatienceSeconds: o.maxPatienceSeconds || 60,
    createdAt: idx,
  }));

  // Calculate initial color supplies
  const initialSupplies = computeCurrentJarUnits(jars);

  // Validate supply vs demand
  const supplyCheck = validateSupplyVsDemand(initialSupplies, orders, capacity);
  if (!supplyCheck.valid) {
    throw new Error(
      `Level ${level.id} failed supply vs demand validation:\n${supplyCheck.errors.join('\n')}`
    );
  }

  const state: GameState = {
    levelId: level.id,
    seed: level.seed,
    capacity,
    jars,
    orders,
    deliveredColorsCount: {},
    history: [],
    moveCount: 0,
    elapsedTimeSeconds: 0,
    freeRescueAvailable: true,
    addedRescueJarsCount: 0,
    isWon: false,
    isStuck: false,
    starThresholds: level.starThresholds || { moves: [15, 25, 40] },
    initialSupplies,
  };

  // Check if initial state is already stuck or won
  const moves = legalMoves(state);
  state.isStuck = moves.length === 0 && !state.isWon;

  // Validate initial invariants
  const invariantCheck = validateInvariants(state);
  if (!invariantCheck.valid) {
    throw new Error(
      `Level ${level.id} failed initial invariant check:\n${invariantCheck.errors.join('\n')}`
    );
  }

  return state;
}

/**
 * Applies a Move to the GameState, returning a brand new GameState.
 * Automatically checks for uniform full jars, packages them, serves waiting customers,
 * frees up table space, and updates win/stuck flags.
 */
export function applyMove(state: GameState, move: Move): GameState {
  if (state.isWon) {
    throw new Error(`Cannot move: Game is already won.`);
  }

  const srcJarIndex = state.jars.findIndex(j => j.id === move.fromJarId);
  const tgtJarIndex = state.jars.findIndex(j => j.id === move.toJarId);

  if (srcJarIndex === -1 || tgtJarIndex === -1) {
    throw new Error(`Invalid move: Jar not found on table (${move.fromJarId} -> ${move.toJarId})`);
  }

  const srcJar = state.jars[srcJarIndex];
  const tgtJar = state.jars[tgtJarIndex];

  if (!canPour(srcJar, tgtJar)) {
    throw new Error(`Illegal move: Cannot pour from jar ${srcJar.id} to jar ${tgtJar.id}`);
  }

  const validAmount = computePourAmount(srcJar, tgtJar);
  if (validAmount !== move.count) {
    throw new Error(
      `Move count mismatch: expected ${validAmount} units, but move requested ${move.count}`
    );
  }

  const run = getTopColorRun(srcJar);
  if (!run || run.color !== move.color) {
    throw new Error(`Move color mismatch: expected ${run?.color}, got ${move.color}`);
  }

  // Clone jars
  const newJars: Jar[] = state.jars.map(j => ({
    id: j.id,
    capacity: j.capacity,
    layers: [...j.layers],
  }));

  const newSrc = newJars[srcJarIndex];
  const newTgt = newJars[tgtJarIndex];

  // Transfer layers
  for (let i = 0; i < move.count; i++) {
    const popped = newSrc.layers.pop()!;
    newTgt.layers.push(popped);
  }

  // Clone orders
  const newOrders: Order[] = state.orders.map(o => ({ ...o }));
  const previousOrderSnapshots = state.orders.map(o => ({
    orderId: o.id,
    fulfilledCount: o.fulfilledCount,
  }));

  const deliveredColorsCount = { ...state.deliveredColorsCount };
  const packedEvents: PackingEvent[] = [];
  const removedJars: Jar[] = [];

  // Check for jars that have become full uniform (layers.length === capacity && all layers same color)
  // We inspect all jars on the table.
  const remainingJars: Jar[] = [];

  for (const jar of newJars) {
    const isFull = jar.layers.length === jar.capacity;
    const isUniform = isFull && jar.layers.every(c => c === jar.layers[0]);

    if (isUniform) {
      const color = jar.layers[0];
      deliveredColorsCount[color] = (deliveredColorsCount[color] || 0) + 1;

      // Find pending orders for this color, prioritizing earliest waiting customer (createdAt ascending)
      const matchingOrders = newOrders
        .filter(o => o.color === color && o.fulfilledCount < o.count)
        .sort((a, b) => a.createdAt - b.createdAt);

      if (matchingOrders.length > 0) {
        const orderToFulfill = matchingOrders[0];
        orderToFulfill.fulfilledCount += 1;

        packedEvents.push({
          jarId: jar.id,
          color,
          orderId: orderToFulfill.id,
          customerId: orderToFulfill.customerId,
          byproduct: false,
        });
      } else {
        // Byproduct (extra supply completed)
        packedEvents.push({
          jarId: jar.id,
          color,
          byproduct: true,
        });
      }

      // Jar leaves the table ("bình rời khỏi bàn, giải phóng chỗ")
      removedJars.push(jar);
    } else {
      remainingJars.push(jar);
    }
  }

  const isWon = newOrders.length > 0 && newOrders.every(o => o.fulfilledCount >= o.count);

  const moveRecord: MoveRecord = {
    move,
    packedEvents,
    removedJars,
    previousOrderSnapshots,
  };

  const nextState: GameState = {
    ...state,
    jars: remainingJars,
    orders: newOrders,
    deliveredColorsCount,
    history: [...state.history, moveRecord],
    moveCount: state.moveCount + 1,
    isWon,
    isStuck: false,
  };

  // Update stuck status
  if (!isWon) {
    const nextMoves = legalMoves(nextState);
    nextState.isStuck = nextMoves.length === 0;
  }

  // Invariant verification
  const inv = validateInvariants(nextState);
  if (!inv.valid) {
    throw new Error(`Invariant violation after move: ${inv.errors.join('; ')}`);
  }

  return nextState;
}

/**
 * Reverts the most recent move in history, restoring jars, orders, and packing events.
 */
export function undo(state: GameState): GameState {
  if (state.history.length === 0) {
    return state;
  }

  const history = [...state.history];
  const lastRecord = history.pop()!;
  const { move, packedEvents, removedJars, previousOrderSnapshots } = lastRecord;

  // Restore orders
  const restoredOrders: Order[] = state.orders.map(o => {
    const snap = previousOrderSnapshots.find(s => s.orderId === o.id);
    return {
      ...o,
      fulfilledCount: snap !== undefined ? snap.fulfilledCount : o.fulfilledCount,
    };
  });

  // Restore delivered counts
  const deliveredColorsCount = { ...state.deliveredColorsCount };
  for (const event of packedEvents) {
    deliveredColorsCount[event.color] = (deliveredColorsCount[event.color] || 1) - 1;
    if (deliveredColorsCount[event.color] <= 0) {
      delete deliveredColorsCount[event.color];
    }
  }

  // Restore jars: combine remaining jars and removed jars
  // We need to restore the exact jars before the move.
  // First, put back removedJars
  const jarsMap = new Map<string, Jar>();
  for (const j of state.jars) {
    jarsMap.set(j.id, { id: j.id, capacity: j.capacity, layers: [...j.layers] });
  }
  for (const rj of removedJars) {
    jarsMap.set(rj.id, { id: rj.id, capacity: rj.capacity, layers: [...rj.layers] });
  }

  // Now reverse the pour between fromJar and toJar:
  // Move transferred `count` layers from fromJar to toJar.
  // To reverse: pop `count` layers from toJar, push back to fromJar.
  const tgtJar = jarsMap.get(move.toJarId);
  const srcJar = jarsMap.get(move.fromJarId);

  if (!tgtJar || !srcJar) {
    throw new Error(`Undo failed: cannot find jars ${move.fromJarId} or ${move.toJarId}`);
  }

  for (let i = 0; i < move.count; i++) {
    const popped = tgtJar.layers.pop()!;
    srcJar.layers.push(popped);
  }

  // Rebuild jars array (keep stable order: existing jars in their order, removed jars appended in order)
  const restoredJars: Jar[] = Array.from(jarsMap.values());

  const previousState: GameState = {
    ...state,
    jars: restoredJars,
    orders: restoredOrders,
    deliveredColorsCount,
    history,
    moveCount: Math.max(0, state.moveCount - 1),
    isWon: false,
    isStuck: false,
  };

  const moves = legalMoves(previousState);
  previousState.isStuck = moves.length === 0;

  // Validate invariants
  const inv = validateInvariants(previousState);
  if (!inv.valid) {
    throw new Error(`Invariant violation after undo: ${inv.errors.join('; ')}`);
  }

  return previousState;
}

/**
 * Adds an empty rescue jar to the table.
 * If free rescue was available, consumes it.
 */
export function addRescueJar(state: GameState): GameState {
  const newJarId = `rescue_${state.addedRescueJarsCount + 1}`;
  const newJar: Jar = {
    id: newJarId,
    capacity: state.capacity,
    layers: [],
  };

  const nextState: GameState = {
    ...state,
    jars: [...state.jars, newJar],
    freeRescueAvailable: false,
    addedRescueJarsCount: state.addedRescueJarsCount + 1,
    isStuck: false,
  };

  const moves = legalMoves(nextState);
  nextState.isStuck = moves.length === 0 && !nextState.isWon;

  const inv = validateInvariants(nextState);
  if (!inv.valid) {
    throw new Error(`Invariant violation after addRescueJar: ${inv.errors.join('; ')}`);
  }

  return nextState;
}

/**
 * Serializes game state into a JSON string.
 */
export function serializeState(state: GameState): string {
  return JSON.stringify(state);
}

/**
 * Deserializes game state from a JSON string.
 */
export function deserializeState(jsonStr: string): GameState {
  const parsed = JSON.parse(jsonStr) as GameState;
  const inv = validateInvariants(parsed);
  if (!inv.valid) {
    throw new Error(`Invalid state JSON: ${inv.errors.join('; ')}`);
  }
  return parsed;
}
