import Foundation

public struct Jar: Codable, Equatable {
    public let id: String
    public let capacity: Int
    public var layers: [String]

    public init(id: String, capacity: Int, layers: [String]) {
        self.id = id
        self.capacity = capacity
        self.layers = layers
    }
}

public struct Order: Codable, Equatable {
    public let id: String
    public let customerId: String
    public let color: String
    public let count: Int
    public var fulfilledCount: Int
    public let maxPatienceSeconds: Int
    public let createdAt: Int

    public init(id: String, customerId: String, color: String, count: Int, fulfilledCount: Int = 0, maxPatienceSeconds: Int = 60, createdAt: Int = 0) {
        self.id = id
        self.customerId = customerId
        self.color = color
        self.count = count
        self.fulfilledCount = fulfilledCount
        self.maxPatienceSeconds = maxPatienceSeconds
        self.createdAt = createdAt
    }
}

public struct Move: Codable, Equatable {
    public let fromJarId: String
    public let toJarId: String
    public let count: Int
    public let color: String

    public init(fromJarId: String, toJarId: String, count: Int, color: String) {
        self.fromJarId = fromJarId
        self.toJarId = toJarId
        self.count = count
        self.color = color
    }
}

public struct PackingEvent: Codable, Equatable {
    public let jarId: String
    public let color: String
    public let orderId: String?
    public let customerId: String?
    public let byproduct: Bool

    public init(jarId: String, color: String, orderId: String? = nil, customerId: String? = nil, byproduct: Bool = false) {
        self.jarId = jarId
        self.color = color
        self.orderId = orderId
        self.customerId = customerId
        self.byproduct = byproduct
    }
}

public struct MoveRecord: Codable, Equatable {
    public let move: Move
    public let packedEvents: [PackingEvent]
    public let removedJars: [Jar]
    public let previousOrderSnapshots: [OrderSnapshot]

    public struct OrderSnapshot: Codable, Equatable {
        public let id: String
        public let fulfilledCount: Int
        public init(id: String, fulfilledCount: Int) {
            self.id = id
            self.fulfilledCount = fulfilledCount
        }
    }
}

public struct StarThresholds: Codable, Equatable {
    public let moves: [Int]
    public init(moves: [Int]) {
        self.moves = moves
    }
}

public struct LevelDefinition: Codable, Equatable {
    public let id: Int
    public let seed: Int?
    public let jars: [Jar]
    public let orders: [Order]
    public let starThresholds: StarThresholds
    public let solution: [Move]?

    public init(id: Int, seed: Int? = nil, jars: [Jar], orders: [Order], starThresholds: StarThresholds, solution: [Move]? = nil) {
        self.id = id
        self.seed = seed
        self.jars = jars
        self.orders = orders
        self.starThresholds = starThresholds
        self.solution = solution
    }
}

public struct GameState: Codable, Equatable {
    public let levelId: Int
    public let capacity: Int
    public var jars: [Jar]
    public var orders: [Order]
    public var deliveredColorsCount: [String: Int]
    public var history: [MoveRecord]
    public var moveCount: Int
    public var freeRescueAvailable: Bool
    public var addedRescueJarsCount: Int
    public var isWon: Bool
    public var isStuck: Bool
    public let initialSupplies: [String: Int]
}
