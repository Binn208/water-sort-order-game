import SwiftUI
import CatSyrupEngine

public struct SyrupPalette {
    public let topColor: Color
    public let bottomColor: Color
    public let symbol: String
    public let nameVi: String
    
    public init(topColor: Color, bottomColor: Color, symbol: String, nameVi: String) {
        self.topColor = topColor
        self.bottomColor = bottomColor
        self.symbol = symbol
        self.nameVi = nameVi
    }
}

public let SYRUP_MAP: [String: SyrupPalette] = [
    "strawberry": SyrupPalette(topColor: Color(red: 1.0, green: 0.16, blue: 0.43), bottomColor: Color(red: 0.76, green: 0.1, blue: 0.36), symbol: "●", nameVi: "Dâu tây"),
    "blueberry":  SyrupPalette(topColor: Color(red: 0.16, green: 0.47, blue: 1.0), bottomColor: Color(red: 0.08, green: 0.4, blue: 0.75), symbol: "✦", nameVi: "Việt quất"),
    "lemon":      SyrupPalette(topColor: Color(red: 1.0, green: 0.84, blue: 0.0), bottomColor: Color(red: 1.0, green: 0.56, blue: 0.0), symbol: "☾", nameVi: "Chanh vàng"),
    "kiwi":       SyrupPalette(topColor: Color(red: 0.0, green: 0.9, blue: 0.46), bottomColor: Color(red: 0.0, green: 0.54, blue: 0.48), symbol: "♣", nameVi: "Kiwi"),
    "grape":      SyrupPalette(topColor: Color(red: 0.73, green: 0.41, blue: 0.78), bottomColor: Color(red: 0.48, green: 0.12, blue: 0.64), symbol: "▲", nameVi: "Nho tím"),
    "orange":     SyrupPalette(topColor: Color(red: 1.0, green: 0.57, blue: 0.0), bottomColor: Color(red: 0.9, green: 0.32, blue: 0.0), symbol: "☀", nameVi: "Cam tươi"),
    "peach":      SyrupPalette(topColor: Color(red: 1.0, green: 0.5, blue: 0.67), bottomColor: Color(red: 0.85, green: 0.11, blue: 0.38), symbol: "♥", nameVi: "Đào hồng"),
    "mint":       SyrupPalette(topColor: Color(red: 0.11, green: 0.91, blue: 0.71), bottomColor: Color(red: 0.0, green: 0.54, blue: 0.48), symbol: "❄", nameVi: "Bạc hà"),
    "chocolate":  SyrupPalette(topColor: Color(red: 0.55, green: 0.43, blue: 0.39), bottomColor: Color(red: 0.31, green: 0.2, blue: 0.18), symbol: "■", nameVi: "Sô-cô-la"),
    "coconut":    SyrupPalette(topColor: Color(red: 0.92, green: 0.94, blue: 0.95), bottomColor: Color(red: 0.69, green: 0.75, blue: 0.77), symbol: "☁", nameVi: "Dừa sữa"),
    "cherry":     SyrupPalette(topColor: Color(red: 1.0, green: 0.09, blue: 0.27), bottomColor: Color(red: 0.72, green: 0.11, blue: 0.11), symbol: "♦", nameVi: "Anh đào"),
    "taro":       SyrupPalette(topColor: Color(red: 0.82, green: 0.77, blue: 0.91), bottomColor: Color(red: 0.49, green: 0.34, blue: 0.76), symbol: "✿", nameVi: "Khoai môn"),
    "matcha":     SyrupPalette(topColor: Color(red: 0.49, green: 0.7, blue: 0.26), bottomColor: Color(red: 0.2, green: 0.41, blue: 0.12), symbol: "☘", nameVi: "Trà xanh"),
    "mango":      SyrupPalette(topColor: Color(red: 1.0, green: 0.76, blue: 0.03), bottomColor: Color(red: 1.0, green: 0.44, blue: 0.0), symbol: "★", nameVi: "Xoài chín"),
    "ocean":      SyrupPalette(topColor: Color(red: 0.0, green: 0.9, blue: 1.0), bottomColor: Color(red: 0.0, green: 0.59, blue: 0.65), symbol: "≋", nameVi: "Đại dương"),
    "coffee":     SyrupPalette(topColor: Color(red: 0.84, green: 0.8, blue: 0.78), bottomColor: Color(red: 0.36, green: 0.25, blue: 0.22), symbol: "☕", nameVi: "Cà phê")
]

public let CAT_PROFILES: [String: (name: String, color: Color, emoji: String)] = [
    "cat_mochi":  ("Mochi", Color.orange, "🐱"),
    "cat_mimi":   ("Mimi", Color.pink, "😺"),
    "cat_kuro":   ("Kuro", Color.gray, "😸"),
    "cat_luna":   ("Luna", Color.purple, "😽"),
    "cat_oliver": ("Oliver", Color.yellow, "😻"),
    "cat_boba":   ("Boba", Color.cyan, "🐾"),
    "cat_simba":  ("Simba", Color.orange, "🦁"),
    "cat_milo":   ("Milo", Color.yellow, "🐈")
]

public struct GameView: View {
    @State private var currentLevelId: Int = 1
    @State private var maxUnlockedLevel: Int = 1
    @State private var levelDef: LevelDefinition
    @State private var game: GameEngine
    @State private var selectedJarId: String? = nil
    @State private var colorblindMode: Bool = true
    @State private var showLevelSelect: Bool = false
    @State private var showWinModal: Bool = false
    @State private var showStuckModal: Bool = false
    @State private var hintMessage: String? = nil

    public init(levelId: Int = 1) {
        let loaded = LevelLoader.loadLevel(id: levelId)
        _currentLevelId = State(initialValue: levelId)
        _levelDef = State(initialValue: loaded)
        _game = State(initialValue: GameEngine(level: loaded))
    }

    public var body: some View {
        ZStack {
            // Warm Cozy Cafe Background
            LinearGradient(
                colors: [Color(red: 1.0, green: 0.97, blue: 0.93), Color(red: 0.99, green: 0.92, blue: 0.87), Color(red: 0.96, green: 0.85, blue: 0.76)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 12) {
                // Top Header HUD
                HStack {
                    Button(action: { showLevelSelect = true }) {
                        HStack(spacing: 6) {
                            Text("🐾 Màn \(currentLevelId)")
                                .font(.headline)
                                .bold()
                                .foregroundColor(Color(red: 0.29, green: 0.16, blue: 0.09))
                            Text("▾")
                                .font(.subheadline)
                                .foregroundColor(.orange)
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.white.opacity(0.85))
                        .cornerRadius(12)
                    }

                    Spacer()

                    Text("🥤 \(game.state.moveCount) bước")
                        .font(.subheadline)
                        .bold()
                        .foregroundColor(.orange)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(Color(red: 1.0, green: 0.95, blue: 0.88))
                        .cornerRadius(10)

                    Button(action: { colorblindMode.toggle() }) {
                        Text(colorblindMode ? "👁️" : "🕶️")
                            .padding(8)
                            .background(Color.white.opacity(0.85))
                            .clipShape(Circle())
                    }
                }
                .padding(.horizontal)

                // Customer Counter
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text("ĐƠN HÀNG CHỜ PHA CHẾ")
                            .font(.system(size: 10, weight: .black))
                            .foregroundColor(Color(red: 0.55, green: 0.43, blue: 0.39))
                        Spacer()
                        Text("\(game.state.orders.filter { $0.fulfilledCount >= $0.count }.count)/\(game.state.orders.count) xong")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.green)
                    }

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            ForEach(game.state.orders, id: \.id) { order in
                                CustomerOrderCard(order: order, colorblindMode: colorblindMode)
                            }
                        }
                    }
                }
                .padding(10)
                .background(Color.white.opacity(0.92))
                .cornerRadius(16)
                .padding(.horizontal)

                // Hint message if active
                if let hint = hintMessage {
                    Text(hint)
                        .font(.caption)
                        .bold()
                        .foregroundColor(Color(red: 0.52, green: 0.39, blue: 0.02))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 4)
                        .background(Color(red: 1.0, green: 0.95, blue: 0.8))
                        .cornerRadius(8)
                }

                Spacer()

                // Bottle Shelves Layout
                BottleShelvesView(
                    jars: game.state.jars,
                    selectedJarId: selectedJarId,
                    colorblindMode: colorblindMode,
                    onSelectJar: { jar in
                        handleJarTap(jar)
                    }
                )

                Spacer()

                // Bottom Action Toolbar
                HStack(spacing: 12) {
                    BottomActionButton(icon: "↩️", label: "Hoàn tác", color: .red, enabled: !game.state.history.isEmpty) {
                        if game.undo() {
                            selectedJarId = nil
                            hintMessage = "Đã hoàn tác."
                        }
                    }

                    BottomActionButton(icon: "🔄", label: "Chơi lại", color: .blue) {
                        game.reset()
                        selectedJarId = nil
                        hintMessage = "Đã chơi lại màn."
                    }

                    BottomActionButton(icon: "🧪", label: "+ Bình", color: .green, enabled: game.state.jars.count < 10) {
                        if let _ = game.addRescueJar() {
                            hintMessage = "Đã thêm 1 bình cứu hộ rỗng!"
                        }
                    }

                    BottomActionButton(icon: "💡", label: "Gợi ý", color: .orange) {
                        let legals = game.legalMoves()
                        if let first = legals.first {
                            hintMessage = "💡 Gợi ý: Đổ từ \(first.fromJarId) sang \(first.toJarId)"
                        } else {
                            hintMessage = "Hết nước đi!"
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.bottom, 8)
            }
        }
        .sheet(isPresented: $showLevelSelect) {
            LevelSelectSheet(
                currentLevel: currentLevelId,
                maxUnlocked: maxUnlockedLevel,
                totalLevels: 1000,
                onSelect: { selected in
                    currentLevelId = selected
                    levelDef = LevelLoader.loadLevel(id: selected)
                    game = GameEngine(level: levelDef)
                    selectedJarId = nil
                    showLevelSelect = false
                }
            )
        }
        .alert("🎉 CHIẾN THẮNG!", isPresented: $showWinModal) {
            Button("Màn Tiếp Theo 🐾") {
                if currentLevelId < 1000 {
                    currentLevelId += 1
                    levelDef = LevelLoader.loadLevel(id: currentLevelId)
                    game = GameEngine(level: levelDef)
                    selectedJarId = nil
                }
            }
            Button("Chơi lại") {
                game.reset()
                selectedJarId = nil
            }
        } message: {
            Text("Chúc mừng bạn đã hoàn thành màn \(currentLevelId) trong \(game.state.moveCount) bước!")
        }
    }

    private func handleJarTap(_ jar: Jar) {
        #if os(iOS)
        let generator = UIImpactFeedbackGenerator(style: .light)
        generator.impactOccurred()
        #endif

        if let fromId = selectedJarId {
            if fromId == jar.id {
                selectedJarId = nil
                return
            }
            if let src = game.state.jars.first(where: { $0.id == fromId }) {
                if Moves.canPour(src, jar) {
                    let amt = Moves.computePourAmount(src, jar)
                    let run = Moves.getTopColorRun(src)!
                    let res = game.applyMove(Move(fromJarId: src.id, toJarId: jar.id, count: amt, color: run.color))
                    if res.success {
                        if game.state.isWon {
                            showWinModal = true
                        }
                    }
                }
            }
            selectedJarId = nil
        } else {
            if !jar.layers.isEmpty {
                selectedJarId = jar.id
                hintMessage = nil
            }
        }
    }
}

// -------------------------------------------------------------
// BOTTLE SHELVES & REALISTIC GLASS BOTTLES
// -------------------------------------------------------------
struct BottleShelvesView: View {
    let jars: [Jar]
    let selectedJarId: String?
    let colorblindMode: Bool
    let onSelectJar: (Jar) -> Void

    var body: some View {
        if jars.count <= 4 {
            SingleShelfView(jars: jars, selectedJarId: selectedJarId, colorblindMode: colorblindMode, onSelectJar: onSelectJar, height: 180)
        } else {
            let mid = (jars.count + 1) / 2
            let topJars = Array(jars.prefix(mid))
            let bottomJars = Array(jars.suffix(from: mid))

            VStack(spacing: 16) {
                SingleShelfView(jars: topJars, selectedJarId: selectedJarId, colorblindMode: colorblindMode, onSelectJar: onSelectJar, height: 150)
                SingleShelfView(jars: bottomJars, selectedJarId: selectedJarId, colorblindMode: colorblindMode, onSelectJar: onSelectJar, height: 150)
            }
        }
    }
}

struct SingleShelfView: View {
    let jars: [Jar]
    let selectedJarId: String?
    let colorblindMode: Bool
    let onSelectJar: (Jar) -> Void
    let height: CGFloat

    var body: some View {
        ZStack(alignment: .bottom) {
            // Wooden Shelf Ledge
            RoundedRectangle(cornerRadius: 4)
                .fill(LinearGradient(colors: [Color(red: 0.63, green: 0.53, blue: 0.5), Color(red: 0.43, green: 0.3, blue: 0.25)], startPoint: .top, endPoint: .bottom))
                .frame(height: 14)
                .shadow(radius: 4)

            HStack(spacing: 14) {
                ForEach(jars, id: \.id) { jar in
                    RealisticBottleView(
                        jar: jar,
                        isSelected: jar.id == selectedJarId,
                        colorblindMode: colorblindMode,
                        height: height,
                        onTap: { onSelectJar(jar) }
                    )
                }
            }
            .padding(.bottom, 8)
        }
        .padding(.horizontal)
    }
}

struct RealisticBottleView: View {
    let jar: Jar
    let isSelected: Bool
    let colorblindMode: Bool
    let height: CGFloat
    let onTap: () -> Void

    var body: some View {
        VStack(spacing: 2) {
            // Bottle Lip
            RoundedRectangle(cornerRadius: 3)
                .fill(Color.white.opacity(0.5))
                .frame(width: 36, height: 8)
                .overlay(RoundedRectangle(cornerRadius: 3).stroke(isSelected ? Color.cyan : Color.gray.opacity(0.4), lineWidth: 1))

            // Main Bottle Body
            ZStack(alignment: .bottom) {
                // Glass Body Background
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.white.opacity(0.25))
                    .frame(width: 56, height: height)
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(isSelected ? Color.cyan : Color.white.opacity(0.6), lineWidth: isSelected ? 3 : 1.5))
                    .shadow(radius: isSelected ? 8 : 2)

                // Liquid Stack: TOP TO BOTTOM (layers.reversed() so jar.layers.last() appears on TOP!)
                VStack(spacing: 0) {
                    let unitH = (height - 16) / CGFloat(jar.capacity)
                    ForEach(Array(jar.layers.reversed().enumerated()), id: \.offset) { _, colorKey in
                        let palette = SYRUP_MAP[colorKey] ?? SyrupPalette(topColor: .gray, bottomColor: .black, symbol: "?", nameVi: "")
                        ZStack {
                            LinearGradient(colors: [palette.topColor, palette.bottomColor], startPoint: .top, endPoint: .bottom)
                            if colorblindMode {
                                Text(palette.symbol)
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundColor(.white)
                                    .padding(3)
                                    .background(Color.black.opacity(0.25))
                                    .clipShape(Circle())
                            }
                        }
                        .frame(width: 52, height: unitH)
                    }
                }
                .padding(.bottom, 4)

                // Specular Glass Gloss Overlay
                HStack {
                    Rectangle()
                        .fill(LinearGradient(colors: [Color.white.opacity(0.4), Color.clear], startPoint: .leading, endPoint: .trailing))
                        .frame(width: 8)
                    Spacer()
                }
                .frame(width: 52, height: height - 12)
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .padding(.bottom, 6)
            }
            .offset(y: isSelected ? -20 : 0)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isSelected)
            .onTapGesture {
                onTap()
            }

            Text(jar.id.replacingOccurrences(of: "jar_", with: "Bình "))
                .font(.system(size: 9, weight: .bold))
                .foregroundColor(Color(red: 0.43, green: 0.3, blue: 0.25))
        }
    }
}

// -------------------------------------------------------------
// CUSTOMER & TOOLBAR COMPONENTS
// -------------------------------------------------------------
struct CustomerOrderCard: View {
    let order: Order
    let colorblindMode: Bool

    var body: some View {
        let isDone = order.fulfilledCount >= order.count
        let palette = SYRUP_MAP[order.color] ?? SyrupPalette(topColor: .gray, bottomColor: .black, symbol: "?", nameVi: "")
        let cat = CAT_PROFILES[order.customerId] ?? ("Mèo", .orange, "🐱")

        VStack(spacing: 3) {
            ZStack(alignment: .bottomTrailing) {
                Text(cat.emoji)
                    .font(.system(size: 20))
                    .padding(6)
                    .background(cat.color.opacity(0.25))
                    .clipShape(Circle())
                if isDone {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                        .font(.system(size: 10))
                }
            }

            VStack(spacing: 1) {
                HStack(spacing: 3) {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(LinearGradient(colors: [palette.topColor, palette.bottomColor], startPoint: .top, endPoint: .bottom))
                        .frame(width: 12, height: 16)
                    Text("\(order.fulfilledCount)/\(order.count)")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(isDone ? .green : .orange)
                }
                Text(palette.nameVi)
                    .font(.system(size: 8))
                    .foregroundColor(.secondary)
            }
            .padding(4)
            .background(isDone ? Color.green.opacity(0.12) : Color.white)
            .cornerRadius(6)
        }
        .frame(width: 72)
    }
}

struct BottomActionButton: View {
    let icon: String
    let label: String
    let color: Color
    var enabled: Bool = true
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 2) {
                Text(icon)
                    .font(.system(size: 16))
                Text(label)
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.white)
            }
            .frame(maxWidth: .infinity, minHeight: 46)
            .background(enabled ? color : Color.gray.opacity(0.4))
            .cornerRadius(12)
            .shadow(radius: enabled ? 2 : 0)
        }
        .disabled(!enabled)
    }
}

// -------------------------------------------------------------
// LEVEL SELECT SHEET (1 - 1000)
// -------------------------------------------------------------
struct LevelSelectSheet: View {
    let currentLevel: Int
    let maxUnlocked: Int
    let totalLevels: Int
    let onSelect: (Int) -> Void

    @State private var page: Int = 0
    private let pageSize = 50

    var body: some View {
        NavigationView {
            VStack {
                HStack {
                    Button("◀ Trước") {
                        if page > 0 { page -= 1 }
                    }
                    .disabled(page == 0)

                    Spacer()
                    Text("Màn \(page * pageSize + 1) - \(min(totalLevels, (page + 1) * pageSize))")
                        .font(.headline)
                        .bold()
                    Spacer()

                    Button("Sau ▶") {
                        if (page + 1) * pageSize < totalLevels { page += 1 }
                    }
                    .disabled((page + 1) * pageSize >= totalLevels)
                }
                .padding()

                let start = page * pageSize + 1
                let end = min(totalLevels, (page + 1) * pageSize)
                let levels = Array(start...end)

                ScrollView {
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 55))], spacing: 10) {
                        ForEach(levels, id: \.self) { lvl in
                            let isCurrent = lvl == currentLevel
                            let isUnlocked = lvl <= maxUnlocked
                            Button(action: { onSelect(lvl) }) {
                                VStack {
                                    Text("\(lvl)")
                                        .font(.system(size: 13, weight: .bold))
                                        .foregroundColor(isCurrent ? .white : (isUnlocked ? .primary : .secondary))
                                    Text(isCurrent ? "🐾" : (isUnlocked ? "⭐" : "🔒"))
                                        .font(.system(size: 9))
                                }
                                .frame(width: 52, height: 52)
                                .background(isCurrent ? Color.orange : (isUnlocked ? Color.green.opacity(0.2) : Color.gray.opacity(0.15)))
                                .cornerRadius(10)
                                .overlay(RoundedRectangle(cornerRadius: 10).stroke(isCurrent ? Color.orange : Color.clear, lineWidth: 2))
                            }
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle("🗺️ Chọn Cấp Độ")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
