# HƯỚNG DẪN VẬN HÀNH DỰ ÁN (PROJECT RUNBOOK)

Game puzzle đổ màu offline theo đơn hàng thương mại: **Meow Syrup: Color Sort Cafe**.

---

## 1. Lệnh duy nhất chạy toàn bộ kiểm thử (Single Test Command)

Để chạy trọn vẹn toàn bộ 25 bài test từ Engine, Invariants, Solver, Generator đến E2E Bot Simulation:

```bash
npm test
```

Để kiểm tra kiểu tĩnh TypeScript nghiêm ngặt (Strict Typecheck):
```bash
npm run typecheck
```

---

## 2. Cách chạy bản Web (Local Web Server)

```bash
npm run dev
```
Sau đó mở trình duyệt tại: `http://localhost:5173`.

Để build bản tối ưu hóa cho sản phẩm (Production Web Build):
```bash
npm run build
```
Kết quả nằm tại thư mục `dist/` (Dung lượng toàn bộ bundle $< 50$ KB, siêu nhẹ và siêu tốc).

---

## 3. Cách Build Android APK

Yêu cầu máy có Java JDK và Android SDK (`ANDROID_HOME`).

1. Đồng bộ web bundle vào Android:
```bash
npm run build
npx cap sync android
```

2. Biên dịch APK Debug:
```bash
cd android
./gradlew assembleDebug
```
File APK đầu ra nằm tại: `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 4. Cấu trúc Dự án (Project Architecture)

```text
cat-syrup-sort/
├── android/               # Dự án Native Android (Capacitor wrapper)
├── content/
│   └── economy.json       # Bảng cân bằng kinh tế, thưởng qua màn, chi phí công cụ
├── docs/
│   ├── ACCEPTANCE/        # Hồ sơ nghiệm thu & Bảng tự chấm điểm
│   ├── ART_NEEDS.md       # Báo cáo kiểm toán đồ họa và âm thanh
│   ├── AUDIO.md           # Danh mục 27 sự kiện âm thanh Web Audio
│   ├── COMPLIANCE.md      # Khai báo quyền riêng tư Google Play & App Store
│   ├── DECISIONS.md       # Quyết định kiến trúc & xử lý điểm mơ hồ luật chơi
│   ├── DESIGN_SYSTEM.md   # Hệ thống thiết kế & 3 chủ đề gốc
│   ├── LEVEL_REPORT.md    # Báo cáo phân tích độ khó 120 màn chơi
│   ├── LICENSES.md        # Giấy phép bản quyền mã nguồn & asset
│   ├── NAMING.md          # 5 đề xuất đặt tên thương mại
│   ├── OWNER_TODO.md      # Hướng dẫn dành cho chủ sở hữu xuất bản store
│   └── STORE_LISTING.md   # Siêu dữ liệu mô tả store và từ khóa ASO
├── levels/                # 120 file màn chơi JSON kèm chứng chỉ giải solver
├── public/                # Tài nguyên web tĩnh
├── src/
│   ├── audio/             # Web Audio API Synth đa tần số
│   ├── engine/            # Engine logic thuần túy (Immutable, Deterministic)
│   ├── generator/         # Bộ sinh màn ngược ngẫu nhiên theo seed
│   ├── i18n/              # Hệ thống đa ngôn ngữ (Tiếng Việt + Tiếng Anh)
│   ├── render/            # Hiệu ứng hạt Canvas Confetti, Liquid rendering
│   ├── save/              # Lưu trữ nguyên tử LocalStorage / Native Preferences
│   ├── skins/             # Bảng màu siro & Ký hiệu hỗ trợ mù màu
│   ├── solver/            # Thuật toán BFS/A* tìm lời giải tối ưu & phát hiện kẹt
│   └── main.ts            # Điểm khởi nhập ứng dụng Web / Mobile
├── tests/
│   ├── e2e/               # Bot simulation, chaos test, responsive test
│   ├── engine/            # Unit test luật chơi & Property-based testing
│   ├── generator/         # CI repository validator duyệt 120 màn chơi
│   └── solver/            # Kiểm thử tính tối ưu của solver
└── tools/
    └── build_levels.ts    # Tool sinh tự động 120 màn chơi và LEVEL_REPORT
```

---

## 5. Cách thêm Màn chơi mới & Thêm Skin mới

### Thêm Màn chơi mới:
1. Mở `tools/build_levels.ts`.
2. Định nghĩa tham số màn: số màu, số bình rỗng, số bước trộn ngược (`reverseSteps`).
3. Chạy `npm run build:levels`. Thuật toán sẽ tự động kiểm tra chứng chỉ giải được và xuất file `levels/level_###.json`.

### Thêm Skin mới:
1. Mở [src/skins/theme.ts](file:///C:/Users/Bemo/.gemini/antigravity/scratch/cat-syrup-sort/src/skins/theme.ts).
2. Thêm định nghĩa màu trong `COLOR_MAP` gồm: tên (`name`), mã màu hex (`hex`), và ký hiệu mù màu (`symbol`).
3. Engine và UI hoàn toàn độc lập với skin dữ liệu, hệ thống sẽ tự động cập nhật ngay lập tức.
