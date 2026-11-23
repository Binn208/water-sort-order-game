# BÁO CÁO TOÀN DIỆN KIỂM THỬ (TESTING REPORT)

Báo cáo này tổng hợp đầy đủ số lượng bài test, thời gian thực thi, các hạt giống ngẫu nhiên (seeds) và kết quả kiểm thử trên toàn bộ các tầng kiến trúc.

---

## 1. Tổng quan Kết quả Kiểm thử (Test Suite Overview)

- **Tổng số bộ kiểm thử (Test Files)**: 5 suites
- **Tổng số bài kiểm thử (Total Tests)**: 25 tests
- **Tỉ lệ thành công (Pass Rate)**: **100% (25/25 tests passed)**
- **Thời gian chạy**: ~2.19 giây
- **Môi trường chạy**: Node.js v24.15.0 trên Windows 11

```text
 ✓ tests/engine/rules.test.ts (11 tests) 14ms
 ✓ tests/solver/solver.test.ts (3 tests) 18ms
 ✓ tests/engine/property.test.ts (3 tests) 103ms
 ✓ tests/e2e/bot_simulation.test.ts (5 tests) 157ms
 ✓ tests/generator/generator.test.ts (3 tests) 215ms

 Test Files  5 passed (5)
      Tests  25 passed (25)
   Duration  2.19s
```

---

## 2. Chi tiết từng Bộ Kiểm thử

### 2.1. Kiểm thử Đặc tả Luật chơi (`tests/engine/rules.test.ts`)
- `4.1 Khởi tạo game và bảo toàn bất biến ban đầu`: Đạt.
- `4.1 Bắt lỗi khi tổng cung < nhu cầu đơn hàng (Softlock prevention)`: Đạt.
- `4.2 Lấy khối màu trên cùng (getTopColorRun)`: Đạt.
- `4.2 Kiểm tra tính hợp lệ của thao tác đổ (canPour)`: Đạt.
- `4.2 Đổ một phần khi đích chỉ còn ít chỗ hơn khối nguồn (Partial pour)`: Đạt.
- `4.3 Tự động đóng nắp, giao cho khách và giải phóng chỗ khi bình đầy cùng màu`: Đạt.
- `4.3 Giao cho người chờ lâu nhất trước khi có nhiều khách cùng đợi một màu`: Đạt.
- `4.3 Xử lý màu dư không có đơn hàng (Byproduct)`: Đạt.
- `4.4 Phát hiện kẹt (Stuck) và cơ chế cứu hộ miễn phí`: Đạt.
- `4.6 Hoàn tác khôi phục trạng thái nguyên vẹn kể cả bình đã đóng gói`: Đạt.
- `Serialization & Deserialization khôi phục chính xác 100%`: Đạt.

### 2.2. Kiểm thử Tính chất & Fuzzing (`tests/engine/property.test.ts`)
- **Seeds kiểm thử**: `101`, `202`, `303`, `404`, `505`, `999`.
- **Số bước ngẫu nhiên**: > 500 bước đổ, hoàn tác và cứu hộ liên tục.
- **Tính chất xác nhận**:
  - Bảo toàn đơn vị màu tuyệt đối qua mọi bước.
  - Dung tích bình không bao giờ vượt `capacity`.
  - Không bao giờ mất lối thoát vĩnh viễn (No permanent softlock).
  - Tính chất tất định (Deterministic) theo chuỗi nước đi.

### 2.3. Kiểm thử Thuật toán Solver (`tests/solver/solver.test.ts`)
- Solver tìm ra đường giải tối ưu ngắn nhất bằng BFS/A* với `canonicalHash`.
- Xác minh phát lại (`verifySolution`) chiến thắng 100%.
- Phát hiện chuẩn xác thế cờ chết (Dead-end detection).

### 2.4. Kiểm duyệt Kho 120 Màn chơi CI (`tests/generator/generator.test.ts`)
- Kiểm tra 120/120 file `levels/level_###.json` tồn tại đầy đủ.
- 100% 120 màn thỏa mãn bất biến $\text{Tổng cung} \ge \text{Nhu cầu đơn hàng}$.
- 100% 120 màn sở hữu chứng chỉ khả giả hợp lệ và phát lại đạt chiến thắng.

### 2.5. Kiểm thử E2E Bot Simulation & Stress Test (`tests/e2e/bot_simulation.test.ts`)
- **Bot tự động chơi thắng liên tiếp 45 màn** (Vượt yêu cầu $\ge 40$ màn).
- Thử nghiệm công cụ trong ván chơi thật: Undo, Add Jar, Hint, Lưu/Khôi phục giữa màn.
- **Monkey / Chaos Test**: 1,000 thao tác chạm loạn, bấm liên tục, bảo vệ bất biến 100%, không crash, không nhân đôi chất lỏng.
- Mô phỏng mù màu: 10/10 màu có ký hiệu riêng biệt.
- Kiểm tra kích thước vùng tương tác đạt chuẩn công thái học ($\ge 44 \times 44$ dp).
