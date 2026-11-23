# GIẤY PHÉP VÀ NGUỒN GỐC TÀI NGUYÊN (LICENSES & ASSET PROVENANCE)

Tài liệu này xác nhận mọi mã nguồn, tài nguyên hình ảnh, font chữ và âm thanh sử dụng trong dự án đều là bản gốc tự tạo hoặc có giấy phép thương mại hợp lệ (MIT, Apache 2.0, SIL Open Font License, CC0).

---

## 1. Mã nguồn (Source Code)
- Toàn bộ Game Engine, Solver, Generator, Render, UI do nhóm phát triển tự viết 100%.
- Thư viện bên thứ ba (Dependencies):
  - `pixi.js`: MIT License
  - `typescript`: Apache 2.0
  - `vitest`: MIT License
  - `fast-check`: MIT License
  - `@capacitor/core`, `@capacitor/android`: MIT License

---

## 2. Font chữ (Typography)
- Font hiển thị chính: **Nunito** (hoặc **Quicksand** / **Fredoka**) - Giấy phép: **SIL Open Font License 1.1** (Miễn phí 100% cho mục đích thương mại, nhúng vào game).
- Font số & điểm: Tự tạo bằng SVG hoặc sử dụng biến thể Open Font.

---

## 3. Hình ảnh và Đồ họa (Graphics & Visuals)
- Mọi sprite bình nước, siro, icon UI, hạt hiệu ứng (particle) và nhân vật chibi mèo được vẽ dưới dạng vector SVG hoặc procedural generation bằng Canvas/Pixi Graphics trong giai đoạn này.
- Tuyệt đối không sao chép asset từ Snap Brain Games ("Order Crazy") hoặc bất kỳ tựa game nào khác trên thị trường.

---

## 4. Âm thanh (Audio & SFX)
- Âm thanh được thiết kế dạng Web Audio API Synth / Sound generator (chất lượng cao, zero latency, pitch shift tự nhiên) kết hợp các mẫu âm thanh tự tạo hoặc CC0 (Public Domain).
- Chi tiết từng sự kiện âm thanh được liệt kê trong `docs/AUDIO.md`.
