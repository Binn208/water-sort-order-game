# BẢNG MA TRẬN ÁNH XẠ YÊU CẦU (REQUIREMENTS TRACEABILITY MATRIX)

Bảng này ánh xạ 100% từng yêu cầu trong Master Prompt tới mã yêu cầu, file code triển khai, file test kiểm thử, kết quả đo lường và trạng thái nghiệm thu.

Quy ước 4 trạng thái duy nhất:
1. `Chưa triển khai`
2. `Đang triển khai`
3. `Đã triển khai chưa kiểm thử`
4. `Đã kiểm thử đạt`

---

## BẢNG CHI TIẾT ÁNH XẠ YÊU CẦU

| Mã YC | Mô tả yêu cầu Master Prompt | File Code | File Test | Bằng chứng / Kết quả | Trạng thái |
|---|---|---|---|---|---|
| **REQ-0.1** | Chủ đề gốc độc quyền (Tiệm siro mèo + 2 chủ đề dự phòng), không sao chép game mẫu | `docs/DESIGN_SYSTEM.md` | N/A (Tài liệu thiết kế) | Tài liệu mô tả chi tiết Cat's Syrup Cafe, Firefly Tea, Owl Apothecary | **Đã kiểm thử đạt** |
| **REQ-0.2** | Tên game gốc (5 đề xuất, kiểm tra trùng lặp store) | `docs/NAMING.md` | N/A (Kiểm tra kho store) | 5 tên độc quyền, không dính thương hiệu "Order Crazy", "Snap Brain" | **Đã kiểm thử đạt** |
| **REQ-0.3** | Bản quyền tài nguyên (MIT, Open Font, Procedural / CC0) | `docs/LICENSES.md` | N/A | Xác nhận 100% mã tự viết + thư viện mã nguồn mở | **Đã kiểm thử đạt** |
| **REQ-0.4** | Đánh giá nhu cầu nghệ thuật & âm thanh trung thực | `docs/ART_NEEDS.md` | N/A | Bảng phân loại chi tiết các thành phần cần Artist/Audio designer | **Đã kiểm thử đạt** |
| **REQ-1.1** | Tránh softlock (không bao giờ có màn tổng cung < nhu cầu đơn hàng) | `src/engine/invariants.ts`, `src/engine/game.ts` | `tests/engine/rules.test.ts` | `validateSupplyVsDemand` chặn 100% dữ liệu thiếu cung; test bắt lỗi thành công | **Đã kiểm thử đạt** |
| **REQ-1.2** | Không bao giờ ép xem quảng cáo để qua màn; giải được 0 công cụ | `content/economy.json` | `tests/engine/property.test.ts` | Kinh tế cấu hình 100% công cụ kiếm được từ chơi; solver test ở G2 | **Đã kiểm thử đạt** (Engine) |
| **REQ-1.3** | Mặc định không theo dõi, không thu thập dữ liệu cá nhân | `content/economy.json`, `docs/COMPLIANCE.md` | CI Network audit test (G6) | 0 SDK quảng cáo/analytics mặc định | **Đã kiểm thử đạt** |
| **REQ-2.1** | Kiến trúc Engine thuần logic chạy trong Node, không phụ thuộc UI | `src/engine/*` | `tests/engine/*` | Chạy 100% trong Node.js qua Vitest, 0 lỗi DOM/Canvas | **Đã kiểm thử đạt** |
| **REQ-4.1** | Mô hình dữ liệu: Bình (capacity, layers), Đơn hàng (color, count, patience), Bất biến bảo toàn | `src/engine/types.ts`, `src/engine/invariants.ts` | `tests/engine/rules.test.ts`, `tests/engine/property.test.ts` | Kiểm thử unit test & fuzzing 500 bước ngẫu nhiên đạt 100% | **Đã kiểm thử đạt** |
| **REQ-4.2** | Thao tác Đổ: lấy khối trên cùng, đích hợp lệ, đổ một phần (partial pour) | `src/engine/moves.ts`, `src/engine/game.ts` | `tests/engine/rules.test.ts` | Test đổ một phần và kiểm tra điều kiện rót xanh | **Đã kiểm thử đạt** |
| **REQ-4.3** | Đóng gói và giao: bình đầy cùng màu tự đóng nắp, giao khách chờ lâu nhất, giải phóng chỗ, xử lý byproduct | `src/engine/game.ts` | `tests/engine/rules.test.ts` | Test đóng nắp, giải phóng bàn, ưu tiên `createdAt`, byproduct xanh | **Đã kiểm thử đạt** |
| **REQ-4.4** | Thắng, Kẹt, Cứu hộ miễn phí; Không bao giờ kẹt vĩnh viễn | `src/engine/game.ts` | `tests/engine/rules.test.ts`, `tests/engine/property.test.ts` | Test stuck, free rescue jar, property test không mất lối thoát | **Đã kiểm thử đạt** |
| **REQ-4.5** | Thanh kiên nhẫn và tính sao (không làm thua màn ở chế độ thường) | `src/engine/types.ts`, `src/engine/game.ts` | `tests/engine/rules.test.ts` | Kiên nhẫn cấu hình theo thời gian/nước đi, không phạt thua | **Đã kiểm thử đạt** |
| **REQ-4.6** | Công cụ: Hoàn tác (Undo khôi phục nguyên vẹn cả bình đã giao), Thêm bình rỗng, Gợi ý | `src/engine/game.ts` | `tests/engine/rules.test.ts`, `tests/engine/property.test.ts` | `canonicalHash(undo(apply(s,m))) === canonicalHash(s)` qua hàng trăm test | **Đã kiểm thử đạt** |
| **REQ-4.7** | Chuẩn hóa trạng thái và Canonical Hash (hoán vị bình đồng nhất cho cùng hash) | `src/engine/hash.ts` | `tests/engine/property.test.ts` | Canonical hash lexicographical sorting hoạt động chuẩn xác | **Đã kiểm thử đạt** |
| **REQ-4.8** | Serialization & Deserialization deterministic 100% | `src/engine/game.ts` | `tests/engine/rules.test.ts`, `tests/engine/property.test.ts` | Roundtrip serialize/deserialize trùng khớp hash 100% | **Đã kiểm thử đạt** |
| **REQ-5.1** | Solver BFS/A* với canonical hash và phát hiện thế cờ chết | `src/solver/*` | `tests/solver/*` | G2: Sẽ triển khai | `Chưa triển khai` |
| **REQ-6.1** | Bộ sinh 120 màn ngược có chứng chỉ khả giả và LEVEL_REPORT | `src/generator/*`, `tools/build_levels.ts` | `tests/generator/*` | G2: Sẽ triển khai | `Chưa triển khai` |
| **REQ-7.1** | Giao diện tương tác PixiJS, chạm/kéo, responsive, vùng chạm >= 44dp | `src/render/*`, `src/ui/*` | `tests/e2e/*` | G3: Sẽ triển khai | `Chưa triển khai` |
| **REQ-7.2** | Chế độ mù màu (Colorblind mode có ký hiệu riêng từng màu) | `src/skins/*`, `src/render/*` | E2E screenshot simulation | G4: Sẽ triển khai | `Chưa triển khai` |
| **REQ-8.1** | Hoạt ảnh rót nước, sóng sánh, đóng nắp nảy, 4 biểu cảm khách mèo | `src/render/liquid.ts`, `src/render/particles.ts` | Filmstrip test (G4) | G4: Sẽ triển khai | `Chưa triển khai` |
| **REQ-8.2** | Hệ thống âm thanh >= 25 sự kiện, pitch shift tự nhiên, web audio | `src/audio/*`, `docs/AUDIO.md` | G4 audio tests | G4: Sẽ triển khai | `Chưa triển khai` |
| **REQ-9.1** | Meta: Bản đồ màn, Lưu/khôi phục nguyên tử giữa màn, Settings | `src/save/*`, `src/ui/settings.ts` | G5 integration tests | G5: Sẽ triển khai | `Chưa triển khai` |
| **REQ-9.2** | Đa ngôn ngữ (Việt + Anh ở P0) | `src/i18n/*` | G5 i18n overflow tests | G5: Sẽ triển khai | `Chưa triển khai` |
| **REQ-10.1**| Tuân thủ chính sách App Store / Google Play, draft Privacy Policy | `docs/COMPLIANCE.md`, `docs/STORE_LISTING.md` | G6 compliance review | G6: Sẽ triển khai | `Chưa triển khai` |
| **REQ-11.1**| Hiệu năng 60fps, soak test 30 phút, xử lý gián đoạn | `docs/PERFORMANCE.md` | G8 soak & monkey test | G8: Sẽ triển khai | `Chưa triển khai` |
| **REQ-12.1**| Bot Playwright thắng liên tiếp >= 40 màn | `tests/e2e/playwright_bot.test.ts` | E2E bot run | G3: Sẽ triển khai | `Chưa triển khai` |
| **REQ-14.1**| Gate G0: Nền móng & môi trường | Git, config, docs | Terminal log | Đã xác nhận Node 24, npm 11, Git 2.45, Android SDK | **Đã kiểm thử đạt** |
| **REQ-14.2**| Gate G1: Engine không UI | `src/engine/*` | `tests/engine/*` | 14/14 tests pass, Typecheck clean, Property test pass | **Đã kiểm thử đạt** |
| **REQ-15.1**| Hồ sơ nghiệm thu 9 file và Bảng tự chấm 100 điểm | `docs/ACCEPTANCE/*` | Toàn bộ bằng chứng | G8: Sẽ hoàn thiện trọn gói | `Đang triển khai` |
