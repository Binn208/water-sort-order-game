# Meow Syrup: Color Sort Cafe (iOS Native Swift & SwiftUI)

Game giải đố phân loại màu siro theo đơn hàng dành riêng cho hệ điều hành **iOS**, được viết hoàn toàn bằng **Swift 5.9** và **SwiftUI**, chuẩn kiến trúc native 100% (không WebView, không Capacitor, không React Native/Flutter).

---

## 🌟 ĐẶC ĐIỂM NỔI BẬT

1. **Giao diện SwiftUI Chân thực**:
   - Bình thủy tinh đa tầng với dải sáng phản chiếu bóng loáng (*specular gloss reflection*).
   - 16 hương vị siro trái cây phong phú: Dâu tây, Việt quất, Chanh vàng, Kiwi, Nho tím, Cam tươi, Đào hồng, Bạc hà, Sô-cô-la, Dừa sữa, Anh đào, Khoai môn, Trà xanh, Xoài chín, Đại dương, Cà phê.
   - Cơ chế đổ siro từ trên xuống dưới đúng chuẩn vật lý thực tế.
   - Kệ gỗ 2 tầng chia đều các bình khi số bình $> 4$.
2. **Khách hàng Mèo Chibi & Đơn hàng**:
   - 8 nhân vật mèo độc đáo (Mochi, Mimi, Kuro, Luna, Oliver, Boba, Simba, Milo).
   - Phiếu gọi món với chai siro mini, thanh kiên nhẫn và biểu cảm vui mừng khi nhận đồ.
3. **1.000 Màn Chơi Tích Hợp Sẵn**:
   - Tích hợp toàn bộ dữ liệu 1.000 màn chơi tăng dần độ khó trong `Resources/levels/`.
   - Có bộ chọn cấp độ trực quan hỗ trợ nhảy tới bất kỳ màn nào từ 1 đến 1.000.
4. **Hiệu năng & Tương tác**:
   - Tích hợp xúc giác `UIImpactFeedbackGenerator` cho phản hồi rung chân thực khi chạm và đổ nước.
   - Hoàn tác vô hạn (Undo), Chơi lại (Restart), Cứu hộ miễn phí (+ Bình rỗng), Gợi ý (Hint).

---

## 🛠️ HƯỚNG DẪN MỞ VÀ CHẠY DỰ ÁN TRÊN XCODE (macOS)

### Cách 1: Mở trực tiếp bằng Xcode (Khuyên dùng)
1. Trên máy tính Mac, mở ứng dụng **Xcode** (yêu cầu Xcode 15 trở lên).
2. Chọn **File** > **Open...**
3. Mở trực tiếp thư mục repo vừa clone hoặc mở file `Package.swift`.
4. Xcode sẽ tự động nạp toàn bộ cấu trúc Swift Package gồm:
   - `CatSyrupEngine`: Logic game, thuật toán kiểm tra nước đi, FNV-1a 64-bit băm trạng thái.
   - `CatSyrupUI`: Toàn bộ giao diện SwiftUI, các thành phần chai lọ, khách mèo và bộ chọn màn.
5. Chọn thiết bị giả lập (ví dụ: `iPhone 15 Pro` hoặc `iPhone 16`) trên thanh công cụ và nhấn **Run (Cmd + R)** để khởi chạy game!

### Cách 2: Chạy kiểm thử tự động
- Nhấn tổ hợp phím **Cmd + U** trong Xcode để chạy toàn bộ bộ kiểm thử `CatSyrupTests` đối chiếu với Golden Dataset.

---

## 📁 CẤU TRÚC DỰ ÁN

```
.
├── Package.swift                             # Cấu hình Swift Package Manager (mở bằng Xcode)
├── README.md                                 # Tài liệu dự án
├── Sources/
│   ├── CatSyrupEngine/                       # Lõi Engine Swift thuần logic
│   │   ├── Models.swift                      # Struct Jar, Order, Move, GameState
│   │   ├── Moves.swift                       # Quy tắc đổ nước, tính thể tích
│   │   ├── Game.swift                        # Máy trạng thái GameEngine
│   │   ├── Hash.swift                        # Thuật toán băm FNV-1a 64-bit
│   │   └── LevelLoader.swift                 # Bộ nạp 1.000 màn từ JSON
│   └── CatSyrupUI/                           # Giao diện người dùng SwiftUI
│       ├── App.swift                         # Điểm khởi chạy ứng dụng iOS (@main)
│       ├── GameView.swift                    # Màn hình chơi game chính & Kệ bình
│       └── Resources/
│           └── levels/                       # 1.000 file JSON màn chơi (level_001.json ... level_1000.json)
└── Tests/
    └── CatSyrupTests/                        # Kiểm thử logic tự động
```
