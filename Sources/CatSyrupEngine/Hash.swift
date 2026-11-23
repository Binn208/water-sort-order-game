import Foundation

public enum Hash {
    private static let offsetBasis: UInt64 = 0xcbf29ce484222325
    private static let fnvPrime: UInt64 = 0x100000001b3

    /**
     * Standard FNV-1a 64-bit algorithm matching TypeScript and Kotlin implementations.
     */
    public static func fnv1a64(_ input: String) -> String {
        var hash = offsetBasis
        guard let data = input.data(using: .utf8) else { return "" }

        for byte in data {
            hash ^= UInt64(byte)
            hash &*= fnvPrime
        }

        return String(format: "%016llx", hash)
    }

    public static func canonicalString(state: GameState) -> String {
        let jarStrings = state.jars.map { $0.layers.joined(separator: ",") }.sorted().joined(separator: "|")
        let orderStrings = state.orders.map { "\($0.color):\($0.fulfilledCount)/\($0.count)" }.sorted().joined(separator: ";")
        let deliveredStrings = state.deliveredColorsCount.keys.sorted().map { "\($0):\(state.deliveredColorsCount[$0] ?? 0)" }.joined(separator: ",")

        return "J:[\(jarStrings)]#O:[\(orderStrings)]#D:[\(deliveredStrings)]#W:\(state.isWon ? 1 : 0)"
    }

    public static func canonicalHash(state: GameState) -> String {
        return fnv1a64(canonicalString(state: state))
    }
}
