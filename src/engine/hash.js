/**
 * Returns a canonical string representation of a jar's contents.
 * Example: "red,blue,red"
 */
export function serializeJarLayers(jar) {
    return jar.layers.join(',');
}
/**
 * Canonical hash function for game state.
 *
 * Symmetries handled:
 * 1. Jar permutation symmetry: jars with identical contents (or empty jars)
 *    produce the exact same canonical hash regardless of position on table.
 * 2. Order queue canonical representation: based on color and fulfillment counts.
 *
 * This ensures state deduplication in BFS/A* solver and strict undo reversibility checks.
 */
export function canonicalHash(state) {
    // Sort jar representations lexicographically
    const jarStrings = state.jars.map(serializeJarLayers).sort();
    const jarsPart = jarStrings.join('|');
    // Orders part: color, fulfilled, count
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
 * Exact state hash preserving jar IDs and exact visual order.
 */
export function exactHash(state) {
    const jarsPart = state.jars.map(j => `${j.id}:[${j.layers.join(',')}]`).join('|');
    const ordersPart = state.orders.map(o => `${o.id}:${o.fulfilledCount}/${o.count}`).join(';');
    return `E_J:[${jarsPart}]#O:[${ordersPart}]#W:${state.isWon ? 1 : 0}`;
}
