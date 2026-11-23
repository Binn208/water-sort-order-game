import Foundation

public enum LevelLoader {
    public static func loadLevel(id: Int, bundle: Bundle = .main) -> LevelDefinition {
        let filename = String(format: "level_%03d", id)
        
        // Try Bundle URL
        if let url = bundle.url(forResource: filename, withExtension: "json", subdirectory: "levels") ??
                     bundle.url(forResource: filename, withExtension: "json") {
            if let data = try? Data(contentsOf: url),
               let level = try? JSONDecoder().decode(LevelDefinition.self, from: data) {
                return level
            }
        }
        
        // Try direct file path (useful in Swift Package Manager tests and local development)
        let localPath = "Sources/CatSyrupUI/Resources/levels/\(filename).json"
        if let data = try? Data(contentsOf: URL(fileURLWithPath: localPath)),
           let level = try? JSONDecoder().decode(LevelDefinition.self, from: data) {
            return level
        }
        
        let sharedPath = "shared/levels/\(filename).json"
        if let data = try? Data(contentsOf: URL(fileURLWithPath: sharedPath)),
           let level = try? JSONDecoder().decode(LevelDefinition.self, from: data) {
            return level
        }

        // Procedural Fallback
        return LevelDefinition(
            id: id,
            jars: [
                Jar(id: "jar_1", capacity: 4, layers: ["strawberry", "strawberry", "blueberry", "blueberry"]),
                Jar(id: "jar_2", capacity: 4, layers: ["blueberry", "blueberry", "strawberry", "strawberry"]),
                Jar(id: "jar_3", capacity: 4, layers: []),
                Jar(id: "jar_4", capacity: 4, layers: [])
            ],
            orders: [
                Order(id: "o1", customerId: "cat_mochi", color: "strawberry", count: 1),
                Order(id: "o2", customerId: "cat_mimi", color: "blueberry", count: 1)
            ],
            starThresholds: StarThresholds(moves: [6, 12, 18]),
            solution: nil
        )
    }
}
