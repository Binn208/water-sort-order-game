# TÀI LIỆU DANH MỤC ÂM THANH (AUDIO DESIGN SYSTEM)

Dự án sử dụng bộ phát âm thanh tổng hợp đa tần số dựa trên **Web Audio API** (Procedural Synthesis), đảm bảo không cần tải file MP3/WAV bên ngoài, độ trễ bằng 0ms, không tốn dung lượng lưu trữ và tự động biến thiên cao độ ngẫu nhiên $\pm 5\%$ cho từng lần phát (chống mỏi tai).

---

## 1. Danh sách 27 sự kiện âm thanh (Audio Events)

| STT | Mã sự kiện (Event ID) | Mô tả trải nghiệm | Tần số cơ bản | Biến thiên cao độ |
|---|---|---|---|---|
| 1 | `jar_select` | Nhấc bình siro lên khỏi bàn | 520Hz $\to$ 660Hz (Sine) | $\pm 5\%$ |
| 2 | `jar_deselect` | Đặt bình siro trở lại vị trí cũ | 440Hz $\to$ 330Hz (Sine) | $\pm 5\%$ |
| 3 | `jar_invalid` | Thao tác chạm bình không hợp lệ (nhún nhẹ) | 180Hz $\to$ 130Hz (Sawtooth nhẹ) | $\pm 5\%$ |
| 4 | `pour_start` | Bắt đầu nghiêng bình rót chất lỏng | 440Hz $\to$ 550Hz (Fluid sweep) | $\pm 5\%$ |
| 5 | `pour_flow_low` | Dòng siro chảy ở đáy bình | 440Hz (Resonant sine) | $\pm 5\%$ |
| 6 | `pour_flow_mid` | Dòng siro dâng lên giữa bình | 620Hz (Resonant sine) | $\pm 5\%$ |
| 7 | `pour_flow_high`| Dòng siro đầy sát miệng bình | 880Hz (Resonant sine) | $\pm 5\%$ |
| 8 | `pour_end` | Bình trở về vị trí, giọt siro cuối cùng | 580Hz $\to$ 400Hz | $\pm 5\%$ |
| 9 | `cork_pop` | Nắp chai bần bật đóng "chốp" khi đầy | 300Hz $\to$ 800Hz (Fast pop) | $\pm 5\%$ |
| 10 | `order_matched` | Khách nhận diện đúng màu siro | 587Hz (Ding) | $\pm 5\%$ |
| 11 | `order_delivered` | Giao chai siro thành công cho mèo | Hợp âm 4 nốt (C-E-G-C) | $\pm 5\%$ |
| 12 | `customer_happy` | Mèo kêu meow và nhảy cẫng vui sướng | Hợp âm tam giác hài âm ấm | $\pm 5\%$ |
| 13 | `customer_impatient`| Mèo sốt ruột gõ nhẹ chân | 220Hz (Woodblock knock) | $\pm 5\%$ |
| 14 | `combo_1` | Hoàn thành chuỗi đơn liên tiếp x1 | 659Hz | $\pm 5\%$ |
| 15 | `combo_2` | Hoàn thành chuỗi đơn liên tiếp x2 | 784Hz | $\pm 5\%$ |
| 16 | `combo_3` | Hoàn thành chuỗi đơn liên tiếp x3+ | 1046Hz | $\pm 5\%$ |
| 17 | `win_fanfare` | Qua màn (Fanfare ngũ cung vui vẻ) | Chuỗi ngũ âm (C-E-G-C-E) | $\pm 5\%$ |
| 18 | `star_1` | Ngôi sao thứ 1 rơi vào bảng | 523Hz | $\pm 5\%$ |
| 19 | `star_2` | Ngôi sao thứ 2 rơi vào bảng | 659Hz | $\pm 5\%$ |
| 20 | `star_3` | Ngôi sao thứ 3 rơi vào bảng | 784Hz | $\pm 5\%$ |
| 21 | `confetti_burst` | Pháo giấy nổ tung lấp lánh | White noise sweep lọc dải thông | $\pm 5\%$ |
| 22 | `tool_undo` | Hoàn tác tua ngược thời gian | 600Hz $\to$ 320Hz (Down sweep) | $\pm 5\%$ |
| 23 | `tool_add_jar` | Thêm bình rỗng mới rơi xuống có nảy | 350Hz $\to$ 700Hz (Bounce chime) | $\pm 5\%$ |
| 24 | `tool_hint` | Đèn gợi ý sáng nhịp đập | 880Hz (Harmonic ping) | $\pm 5\%$ |
| 25 | `stuck_gentle` | Thông báo kẹt nhẹ nhàng không giật mình | 330Hz $\to$ 260Hz (Warm chime) | $\pm 5\%$ |
| 26 | `btn_click` | Nhấn nút giao diện mềm mại | 500Hz (Subtle click) | $\pm 5\%$ |
| 27 | `bgm_loop` | Nhạc nền Lo-fi Cafe ấm áp | Vòng hòa âm C - Am - F - G | Chu kỳ 10s |
