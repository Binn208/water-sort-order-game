# KIẾN TRÚC VÀ QUYẾT ĐỊNH KỸ THUẬT (ARCHITECTURAL DECISIONS)
*Cập nhật theo Phụ lục ghi đè: Ba bản độc lập (Web PWA, Android Kotlin Compose, iOS SwiftUI)*

---

## 1. Kiến trúc Đa nền tảng Độc lập (Tri-Platform Architecture)

Theo Phụ lục ghi đè ưu tiên cao nhất, trò chơi được phát triển thành **BA bản độc lập hoàn toàn**, không bản nào bọc bản nào qua WebView hay wrapper:
- **WEB**: TypeScript + PixiJS, PWA (Service Worker offline, Web App Manifest), chạy trực tiếp trên trình duyệt. Tuyệt đối không dùng Capacitor/Cordova.
- **ANDROID**: Kotlin + Jetpack Compose thuần Native 100%. Cấm WebView, Capacitor, Cordova, Flutter, React Native, Kotlin/JS.
- **iOS**: Swift + SwiftUI (hoạt họa Canvas/TimelineView hoặc SpriteKit). Build và chạy trên Xcode Simulator. Cấm WKWebView làm lõi game.
- **DỮ LIỆU DÙNG CHUNG (`shared/`)**:
  - `shared/levels/`: 120 màn chơi JSON kèm chứng chỉ giải solver.
  - `shared/i18n/`: Chuỗi ngôn ngữ đa quốc gia (`vi.json`, `en.json`).
  - `shared/economy.json`: Cân bằng kinh tế và phần thưởng.
  - `shared/golden/`: Bộ golden test cases dùng chung để kiểm thử chéo 100% logic giữa TS, Kotlin và Swift.

---

## 2. Nguồn Chân lý & Bộ Golden (Single Source of Truth)

1. **Engine TypeScript** là bản tham chiếu gốc đầu tiên (Reference Implementation).
2. **`docs/ENGINE_SPEC.md`** là đặc tả kỹ thuật chi tiết nhất của Engine.
3. **Bộ Golden Dataset (`shared/golden/golden_cases.json`)**: Chứa $\ge 5000$ trường hợp thử nghiệm (state, legalMoves theo thứ tự cố định, move, state sau, hash FNV-1a 64-bit, danh sách sự kiện có thứ tự, kết quả undo) cùng đường giải đầy đủ của 120 màn chơi.
4. **Nguyên tắc phân xử**: Nếu có mâu thuẫn giữa Spec và Golden $\to$ **Golden luôn thắng**. Muốn thay đổi luật chơi: sửa code TypeScript trước, xuất lại Golden, kiểm tra checksum, rồi mới cập nhật sang Kotlin và Swift. Không nền tảng nào được phép có luật chơi riêng.

---

## 3. Thuật toán Băm Chuẩn hóa (Canonical Hash) & FNV-1a 64-bit

Để đảm bảo đồng bộ 100% giữa TypeScript, Kotlin (`ULong`), và Swift (`UInt64`):
1. **Chuỗi chuẩn hóa (Canonical String)**:
   - Các bình được sắp xếp theo chuỗi layer lexicographically (`layers.join(',')`).
   - Các đơn hàng được chuẩn hóa theo `color:fulfilledCount/count`.
   - Các màu đã giao được sắp xếp theo bảng chữ cái.
2. **Thuật toán băm FNV-1a 64-bit**:
   - `offset_basis = 0xcbf29ce484222325` (14695981039346656037)
   - `fnv_prime = 0x100000001b3` (1099511628211)
   - Băm qua từng byte UTF-8 của chuỗi Canonical String:
     $$\text{hash} = (\text{hash} \oplus \text{byte}) \times \text{fnv\_prime} \pmod{2^{64}}$$
   - Kết quả xuất ra chuỗi hex 16 ký tự viết thường (ví dụ: `a1b2c3d4e5f60718`).

---

## 4. Thứ tự Duyệt Nước đi Tất định (Deterministic Legal Moves Ordering)

Hàm `legalMoves(state)` trả về mảng nước đi được sắp xếp theo thứ tự bất biến:
1. Sắp xếp tăng dần theo `fromJarId` (hoặc vị trí ban đầu của bình nguồn).
2. Sắp xếp tăng dần theo `toJarId` (hoặc vị trí ban đầu của bình đích).
3. Đảm bảo ở cả Web, Kotlin và Swift, danh sách `legalMoves` luôn giống hệt nhau ở từng chỉ số phần tử.

---

## 5. Quy tắc Gameplay cốt lõi

- **Đổ một phần (Partial Pour)**: Lấy toàn bộ khối cùng màu ở mặt trên của nguồn (`runLength`). Nếu đích chỉ còn `space < runLength` chỗ trống, rót đúng `space` đơn vị; phần dư giữ nguyên ở bình nguồn.
- **Đóng nắp & Giao đơn**: Khi bình có đủ đúng `capacity` lớp và tất cả các lớp cùng một màu:
  - Tự động đóng nắp bần.
  - Tìm trong danh sách đơn hàng những đơn cần màu đó. Nếu có nhiều khách cùng đợi, **ưu tiên khách chờ lâu nhất (`createdAt` nhỏ nhất)**.
  - Bình được giao rời khỏi bàn chơi ("bình rời khỏi bàn, giải phóng chỗ").
  - Nếu màu đó không có đơn hàng cần (byproduct), bình vẫn tự đóng nắp và rời khỏi bàn.
- **Kẹt & Cứu hộ**: Mọi màn chơi luôn cung cấp miễn phí ít nhất 1 bình rỗng cứu hộ khi kẹt mà không đòi hỏi xem quảng cáo hay trả phí.
