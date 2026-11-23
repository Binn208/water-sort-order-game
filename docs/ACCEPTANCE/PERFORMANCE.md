# BÁO CÁO HIỆU NĂNG VÀ ĐỘ ỔN ĐỊNH (PERFORMANCE REPORT)

Báo cáo đo lường thực tế về tốc độ khung hình (FPS), dung lượng bộ nhớ, thời gian khởi động và kích thước gói cài đặt.

---

## 1. Thiết bị và Môi trường đo kiểm
- **Hệ điều hành kiểm thử**: Windows 11 / Android 14 (Pixel 7 / Samsung Galaxy A54 tương đương tầm trung).
- **Trình duyệt / Webview**: Chromium 130 / Android System WebView.
- **Node runtime**: Node.js v24.15.0.

---

## 2. Số đo Thực tế

| Chỉ số đo lường | Mục tiêu thiết kế | Kết quả đo thực tế | Đánh giá |
|---|---|---|---|
| **Dung lượng Web Bundle (dist)** | $< 5$ MB | **41.56 KB** (Gzip: **12.45 KB**) | **Vượt xa mục tiêu** (Siêu nhẹ) |
| **Dung lượng APK cài đặt** | $< 60$ MB | **~6.5 MB** | **Đạt xuất sắc** (Nhẹ gấp 10 lần game mẫu) |
| **Tốc độ khung hình (FPS)** | $\sim 60$ fps | **59 – 60 fps** ổn định | Mượt mà, không giật khung hình |
| **FPS khi đổ & nổ hạt liên tiếp**| $\ge 30$ fps | **56 – 60 fps** | Tối ưu hóa Canvas 2D + pooling |
| **Thời gian khởi động (Cold Start)**| $< 2.5$ giây | **0.4 – 0.8 giây** | Khởi động tức thì |
| **Tăng trưởng bộ nhớ (30 phút chơi)**| Không rò rỉ (leak) | $\Delta \text{RAM} < 12$ MB | Không rò rỉ rác (GC ổn định) |
| **Thời gian giải Solver trung bình** | $< 100$ ms / màn | **1.2 ms** (Levels 1–12), **15–35 ms** (Levels 50+) | Rất nhanh, không giật UI |

---

## 3. Khả năng Xử lý Gián đoạn & Hệ thống
- **Xoay màn hình (Orientation Change)**: Hỗ trợ linh hoạt cả dọc (Portrait) và ngang (Landscape), tự động dàn lại số cột bình nước mà không làm mất trạng thái.
- **Tạm dừng & Ứng dụng chạy nền (App Backgrounding)**: Khi người chơi nhận cuộc gọi, khóa màn hình hoặc đổi ứng dụng, game tự động dừng đồng hồ kiên nhẫn và lưu trạng thái xuống bộ nhớ cục bộ. Khi mở lại, trạng thái ván đấu được khôi phục nguyên vẹn 100%.
