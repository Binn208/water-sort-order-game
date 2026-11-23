import Foundation

public enum Game {
    public static func createGame(level: LevelDefinition) -> GameState {
        let jars = level.jars.map { Jar(id: $0.id, capacity: $0.capacity, layers: $0.layers) }
        let capacity = jars.first?.capacity ?? 4

        let orders = level.orders.enumerated().map { idx, o in
            Order(id: o.id, customerId: o.customerId, color: o.color, count: o.count, fulfilledCount: 0, maxPatienceSeconds: o.maxPatienceSeconds, createdAt: idx)
        }

        var supplies: [String: Int] = [:]
        for j in jars {
            for c in j.layers {
                supplies[c, default: 0] += 1
            }
        }

        var state = GameState(
            levelId: level.id,
            capacity: capacity,
            jars: jars,
            orders: orders,
            deliveredColorsCount: [:],
            history: [],
            moveCount: 0,
            freeRescueAvailable: true,
            addedRescueJarsCount: 0,
            isWon: false,
            isStuck: false,
            initialSupplies: supplies
        )

        let moves = Moves.legalMoves(state: state)
        state.isStuck = moves.isEmpty && !state.isWon
        return state
    }

    public static func applyMove(state: GameState, move: Move) -> GameState {
        guard !state.isWon else { return state }
        guard let srcIndex = state.jars.firstIndex(where: { $0.id == move.fromJarId }),
              let tgtIndex = state.jars.firstIndex(where: { $0.id == move.toJarId }) else {
            return state
        }

        var newJars = state.jars
        for _ in 0..<move.count {
            if let popped = newJars[srcIndex].layers.popLast() {
                newJars[tgtIndex].layers.append(popped)
            }
        }

        var newOrders = state.orders
        let prevSnapshots = state.orders.map { MoveRecord.OrderSnapshot(id: $0.id, fulfilledCount: $0.fulfilledCount) }
        var delivered = state.deliveredColorsCount
        var packedEvents: [PackingEvent] = []
        var removedJars: [Jar] = []
        var remainingJars: [Jar] = []

        for jar in newJars {
            let isFull = jar.layers.count == jar.capacity
            let isUniform = isFull && jar.layers.allSatisfy { $0 == jar.layers.first }

            if isUniform, let color = jar.layers.first {
                delivered[color, default: 0] += 1
                let matching = newOrders.indices
                    .filter { newOrders[$0].color == color && newOrders[$0].fulfilledCount < newOrders[$0].count }
                    .sorted { newOrders[$0].createdAt < newOrders[$1].createdAt }

                if let firstMatch = matching.first {
                    newOrders[firstMatch].fulfilledCount += 1
                    packedEvents.append(PackingEvent(jarId: jar.id, color: color, orderId: newOrders[firstMatch].id, customerId: newOrders[firstMatch].customerId, byproduct: false))
                } else {
                    packedEvents.append(PackingEvent(jarId: jar.id, color: color, byproduct: true))
                }
                removedJars.append(jar)
            } else {
                remainingJars.append(jar)
            }
        }

        let isWon = !newOrders.isEmpty && newOrders.allSatisfy { $0.fulfilledCount >= $0.count }
        let record = MoveRecord(move: move, packedEvents: packedEvents, removedJars: removedJars, previousOrderSnapshots: prevSnapshots)

        var nextState = state
        nextState.jars = remainingJars
        nextState.orders = newOrders
        nextState.deliveredColorsCount = delivered
        nextState.history.append(record)
        nextState.moveCount += 1
        nextState.isWon = isWon
        nextState.isStuck = !isWon && Moves.legalMoves(state: nextState).isEmpty

        return nextState
    }

    public static func undo(state: GameState) -> GameState {
        guard let lastRecord = state.history.last else { return state }
        var remainingHistory = state.history
        remainingHistory.removeLast()

        var restoredOrders = state.orders
        for snap in lastRecord.previousOrderSnapshots {
            if let idx = restoredOrders.firstIndex(where: { $0.id == snap.id }) {
                restoredOrders[idx].fulfilledCount = snap.fulfilledCount
            }
        }

        var delivered = state.deliveredColorsCount
        for event in lastRecord.packedEvents {
            if let count = delivered[event.color] {
                if count <= 1 {
                    delivered.removeValue(forKey: event.color)
                } else {
                    delivered[event.color] = count - 1
                }
            }
        }

        var jarsMap: [String: Jar] = [:]
        for j in state.jars { jarsMap[j.id] = j }
        for rj in lastRecord.removedJars { jarsMap[rj.id] = rj }

        guard var src = jarsMap[lastRecord.move.fromJarId],
              var tgt = jarsMap[lastRecord.move.toJarId] else {
            return state
        }

        for _ in 0..<lastRecord.move.count {
            if let popped = tgt.layers.popLast() {
                src.layers.append(popped)
            }
        }
        jarsMap[src.id] = src
        jarsMap[tgt.id] = tgt

        var prevState = state
        prevState.jars = Array(jarsMap.values)
        prevState.orders = restoredOrders
        prevState.deliveredColorsCount = delivered
        prevState.history = remainingHistory
        prevState.moveCount = max(0, state.moveCount - 1)
        prevState.isWon = false
        prevState.isStuck = Moves.legalMoves(state: prevState).isEmpty

        return prevState
    }

    public static func addRescueJar(state: GameState) -> GameState {
        let newId = "rescue_\(state.addedRescueJarsCount + 1)"
        let newJar = Jar(id: newId, capacity: state.capacity, layers: [])

        var nextState = state
        nextState.jars.append(newJar)
        nextState.freeRescueAvailable = false
        nextState.addedRescueJarsCount += 1
        nextState.isStuck = Moves.legalMoves(state: nextState).isEmpty && !nextState.isWon
        return nextState
    }
}
