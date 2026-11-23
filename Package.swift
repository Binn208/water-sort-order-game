// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CatSyrupCafe",
    platforms: [
        .iOS(.v16),
        .macOS(.v13)
    ],
    products: [
        .library(name: "CatSyrupEngine", targets: ["CatSyrupEngine"]),
        .library(name: "CatSyrupUI", targets: ["CatSyrupUI"])
    ],
    dependencies: [],
    targets: [
        .target(
            name: "CatSyrupEngine",
            dependencies: []
        ),
        .target(
            name: "CatSyrupUI",
            dependencies: ["CatSyrupEngine"],
            resources: [
                .process("Resources")
            ]
        ),
        .testTarget(
            name: "CatSyrupTests",
            dependencies: ["CatSyrupEngine"]
        )
    ]
)
