import { GameState, Jar, Order } from './types';

export interface InvariantValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Computes current units of each color present inside jars on the table.
 */
export function computeCurrentJarUnits(jars: Jar[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const jar of jars) {
    for (const color of jar.layers) {
      counts[color] = (counts[color] || 0) + 1;
    }
  }
  return counts;
}

/**
 * Computes total units required for each color by the orders list.
 */
export function computeRequiredDemand(orders: Order[], capacity: number): Record<string, number> {
  const demand: Record<string, number> = {};
  for (const order of orders) {
    demand[order.color] = (demand[order.color] || 0) + order.count * capacity;
  }
  return demand;
}

/**
 * Validates that supply of every color meets or exceeds demand.
 * If supply < demand, this level is mathematically unsolvable and must be rejected.
 */
export function validateSupplyVsDemand(
  initialSupplies: Record<string, number>,
  orders: Order[],
  capacity: number
): InvariantValidationResult {
  const errors: string[] = [];
  const demand = computeRequiredDemand(orders, capacity);

  for (const [color, requiredUnits] of Object.entries(demand)) {
    const supply = initialSupplies[color] || 0;
    if (supply < requiredUnits) {
      errors.push(
        `Supply deficit for color '${color}': required ${requiredUnits} units (${requiredUnits / capacity} jars), but total supply is only ${supply} units.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Strictly verifies conservation invariants:
 * 1. No jar exceeds its capacity.
 * 2. Units in play + units delivered in completed jars === initial supply for every color.
 * 3. Fulfilled count of each order <= target count.
 */
export function validateInvariants(state: GameState): InvariantValidationResult {
  const errors: string[] = [];
  const currentUnits = computeCurrentJarUnits(state.jars);

  // 1. Capacity check
  for (const jar of state.jars) {
    if (jar.layers.length > jar.capacity) {
      errors.push(`Jar ${jar.id} exceeds capacity: ${jar.layers.length}/${jar.capacity}`);
    }
  }

  // 2. Conservation check
  const allColors = new Set<string>([
    ...Object.keys(state.initialSupplies),
    ...Object.keys(currentUnits),
    ...Object.keys(state.deliveredColorsCount),
  ]);

  for (const color of allColors) {
    const onTable = currentUnits[color] || 0;
    const deliveredJars = state.deliveredColorsCount[color] || 0;
    const deliveredUnits = deliveredJars * state.capacity;
    const totalCurrent = onTable + deliveredUnits;
    const initial = state.initialSupplies[color] || 0;

    if (totalCurrent !== initial) {
      errors.push(
        `Conservation violation for color '${color}': initial = ${initial}, but onTable (${onTable}) + delivered (${deliveredUnits}) = ${totalCurrent}. Delta = ${totalCurrent - initial}`
      );
    }
  }

  // 3. Orders fulfilled bounds
  for (const order of state.orders) {
    if (order.fulfilledCount > order.count) {
      errors.push(`Order ${order.id} fulfilledCount ${order.fulfilledCount} exceeds required count ${order.count}`);
    }
    if (order.fulfilledCount < 0) {
      errors.push(`Order ${order.id} fulfilledCount ${order.fulfilledCount} is negative`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
