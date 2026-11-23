import Foundation

public enum Moves {
    public static func getTopColorRun(jar: Jar) -> (color: String, count: Int)? {
        guard let color = jar.layers.last else { return nil }
        var count = 0
        for item in jar.layers.reversed() {
            if item == color {
                count += 1
            } else {
                break
            }
        }
        return (color, count)
    }

    public static func getTopColorRun(_ jar: Jar) -> (color: String, count: Int)? {
        getTopColorRun(jar: jar)
    }

    public static func canPour(source: Jar, target: Jar) -> Bool {
        if source.id == target.id { return false }
        if source.layers.isEmpty { return false }
        if target.layers.count >= target.capacity { return false }

        guard let sourceRun = getTopColorRun(jar: source) else { return false }
        if target.layers.isEmpty { return true }

        return target.layers.last == sourceRun.color
    }

    public static func canPour(_ source: Jar, _ target: Jar) -> Bool {
        canPour(source: source, target: target)
    }

    public static func computePourAmount(source: Jar, target: Jar) -> Int {
        guard canPour(source: source, target: target) else { return 0 }
        guard let sourceRun = getTopColorRun(jar: source) else { return 0 }
        let space = target.capacity - target.layers.count
        return min(sourceRun.count, space)
    }

    public static func computePourAmount(_ source: Jar, _ target: Jar) -> Int {
        computePourAmount(source: source, target: target)
    }

    public static func legalMoves(state: GameState) -> [Move] {
        if state.isWon { return [] }

        var moves: [Move] = []
        let jars = state.jars
        let n = jars.count

        for i in 0..<n {
            let src = jars[i]
            if src.layers.isEmpty { continue }
            guard let run = getTopColorRun(jar: src) else { continue }

            for j in 0..<n {
                if i == j { continue }
                let tgt = jars[j]

                if canPour(source: src, target: tgt) {
                    let amount = min(run.count, tgt.capacity - tgt.layers.count)
                    if amount > 0 {
                        moves.append(Move(fromJarId: src.id, toJarId: tgt.id, count: amount, color: run.color))
                    }
                }
            }
        }

        // Deterministic sort: fromJarId asc, then toJarId asc
        return moves.sorted {
            if $0.fromJarId != $1.fromJarId {
                return $0.fromJarId < $1.fromJarId
            }
            return $0.toJarId < $1.toJarId
        }
    }
}
