# KIẾN TRÚC VÀ QUYẾT ĐỊNH KỸ THUẬT (ARCHITECTURAL DECISIONS)

Tài liệu này ghi lại toàn bộ quyết định kỹ thuật, quy tắc gameplay, cấu trúc dữ liệu và xử lý các điểm mơ hồ theo Gate G0 và G1.

---

## 1. Công nghệ nền tảng (Tech Stack)
- **Engine Logic**: TypeScript strict mode (`strict: true`), chạy độc lập không phụ thuộc DOM hay WebGL, 100% deterministic, kiểm thử được trên Node.js.
- **Rendering**: PixiJS v8 (WebGL/WebGPU 2D rendering tốc độ cao, object pooling, hạt FX).
- **Mobile Packaging**: Capacitor (cho Android/iOS, plugin Native audio, Haptics, Preferences).
- **Kiểm thử**: Vitest (Unit test + Property-based testing với `fast-check`), Playwright (E2E & UI Bot test ở các kích thước màn hình).
- **Quản lý trạng thái**: Bất biến (Immutable state operations) hoặc Functional State Transitions có hash canonical rõ ràng.

---

## 2. Quyết định luật chơi (Game Rules & Edge Cases)

### 2.1. Đổ chất lỏng (Pouring Mechanics)
- **Khối lấy ra (Source Run)**: Lấy toàn bộ khối liền kề cùng màu ở mặt trên cùng (`runLength`).
- **Đích hợp lệ (Valid Target)**:
  1. `target.id !== source.id`
  2. `target.layers.length < target.capacity` (còn chỗ)
  3. `target.layers.length === 0` HOẶC màu trên cùng của target bằng màu khối nguồn (`target.topColor === source.topColor`).
- **Đổ một phần (Partial Pour)**:
  - Nếu số chỗ trống ở đích `space = capacity - target.layers.length < runLength`:
    - Ta chỉ đổ `space` đơn vị sang đích.
    - `runLength - space` đơn vị còn lại giữ nguyên ở bình nguồn.
  - *Lý do*: Đây là cơ chế chuẩn giúp tăng chiều sâu chiến thuật và tránh bế tắc giả tạo, cho phép người chơi chiết tách màu linh hoạt.

### 2.2. Đóng gói và giao đơn hàng (Packing & Serving)
- **Điều kiện đóng nắp**: Bình có đủ đúng `capacity` lớp và tất cả các lớp có cùng 1 màu.
- **Giao cho khách**:
  - Khi một bình đóng nắp màu $X$:
    - Tìm trong danh sách đơn hàng (`orders`) các đơn có `color === X` và chưa hoàn thành (`fulfilledCount < count`).
    - Nếu có nhiều khách cùng đợi màu $X$: **Ưu tiên giao cho khách đến trước/chờ lâu nhất** (`createdAt` nhỏ nhất hoặc theo thứ tự hàng đợi).
    - Sau khi giao: Đơn hàng tăng `fulfilledCount += 1`.
    - **Bình rời khỏi bàn**: Khi được giao cho khách, bình đó được đóng gói và chuyển đi (rời khỏi bàn chơi), giúp bàn thoáng hơn và giảm số lượng bình cần thao tác.
- **Màu không có đơn hàng (Byproduct / Extra Supply)**:
  - Nếu bình đầy 1 màu nhưng không còn khách nào yêu cầu màu đó: Bình vẫn tự động đóng nắp và hoàn thành dọn dẹp khỏi bàn chơi (giải phóng không gian làm việc). Không tính điểm đơn hàng nhưng cộng điểm hoàn thành màu phụ.

### 2.3. Bất biến bảo toàn (Conservation Invariants)
- **Bảo toàn số lượng**:
  $$\text{Tổng số lớp màu } X \text{ trên bàn} + (\text{Số bình màu } X \text{ đã giao/đóng gói} \times \text{capacity}) = \text{Tổng cung ban đầu}(X)$$
- **Cung $\ge$ Cầu**:
  $$\text{Tổng cung}(X) \ge \text{Tổng số bình cần giao}(X) \times \text{capacity}$$
  Mọi màn chơi vi phạm bất biến này sẽ bị bộ kiểm tra (validator) đánh trượt ngay lập tức trong CI.

### 2.4. Điều kiện Kẹt (Stuck) và Cứu hộ miễn phí (Free Rescue)
- **Kẹt (Stuck)**: `legalMoves.length === 0` và game chưa thắng (`!isWon`).
- **Không bao giờ kẹt vĩnh viễn (No Permanent Softlock)**:
  - Tại mọi thời điểm, game cung cấp:
    1. Hoàn tác (Undo): Có thể hoàn tác về trạng thái trước đó.
    2. Cứu hộ miễn phí (Free Extra Jar): Mỗi màn chơi luôn cung cấp ít nhất 1 bình rỗng cứu hộ miễn phí không đòi hỏi xem quảng cáo hay trả tiền.
    3. Nút "Chơi lại" (Restart) luôn khả dụng và đặt lại trạng thái ban đầu của màn.
- **Không quảng cáo ép buộc**: Tuyệt đối không có cơ chế chặn người chơi bằng paywall hay ad-wall để qua màn.

### 2.5. Thanh kiên nhẫn (Patience) và Đánh giá Sao
- Khách hàng có thanh kiên nhẫn giảm dần theo thời gian (giây).
- Ở chế độ mặc định (P0): Hết kiên nhẫn **KHÔNG** làm thua màn và khách **KHÔNG** bỏ đi; chỉ ảnh hưởng đến xếp hạng sao:
  - 3 sao: Hoàn thành nhanh + số nước đi tối ưu (theo ngưỡng solver).
  - 2 sao: Hoàn thành trong thời gian kiên nhẫn trung bình.
  - 1 sao: Hoàn thành màn bất kể thời gian/kiên nhẫn.
- Thanh kiên nhẫn tự động dừng (Pause) khi: Mở menu Pause, popup hướng dẫn xuất hiện, hoặc app vào chế độ chạy nền (backgrounded).

---

## 3. Hoàn tác (Undo) và Serialization
- Hàm `applyMove(state, move)` trả về trạng thái mới kèm lịch sử.
- Hàm `undo(state)` khôi phục nguyên vẹn trạng thái trước đó, bao gồm:
  - Vị trí và các lớp của bình
  - Trạng thái đóng gói và bình đã giao (nếu nước đi trước đó vừa đóng gói và giao, bình được đưa lại về bàn)
  - Tiến độ đơn hàng của khách
- Tính chất: `canonicalHash(undo(applyMove(s, m).state)) === canonicalHash(s)`.
