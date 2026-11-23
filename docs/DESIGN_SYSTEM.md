# HỆ THỐNG THIẾT KẾ & CHỦ ĐỀ GỐC (DESIGN SYSTEM & ORIGINAL THEMES)

Tài liệu này xác định ngôn ngữ thiết kế, bảng màu, quy chuẩn truy cập (WCAG AA, Mù màu) và 3 chủ đề độc quyền (1 chủ đề mặc định và 2 chủ đề dự phòng).

---

## 1. Chủ đề mặc định: Tiệm Siro của Chú Mèo (Cat's Syrup Cafe)

- **Bối cảnh**: Quán nước ngọt ngào phong cách cozy anime/Ghibli-inspired do Bếp Trưởng Mèo Mochi điều hành. Khách hàng là những bạn mèo đáng yêu (Mèo Cam, Mèo Xiêm, Mèo Mướp, Mèo Đen, Bé Corgi ghé chơi...) đến gọi các chai siro trái cây thơm lừng đóng chai cổ điển có nút bần.
- **Vật phẩm**:
  - Bình chứa: Chai thủy tinh kiểu cổ, bo tròn cạnh, cổ chai thắt nhẹ có nút bần gỗ.
  - Chất lỏng: Siro hoa quả sóng sánh, có độ nhớt nhẹ, bọt khí li ti nổi lên khi rót.
  - Nắp đóng gói: Nút bần nén xuống có nơ ruy băng màu pastel.
  - Khách hàng: Sprite chibi các giống mèo với 4 trạng thái biểu cảm:
    1. Vui vẻ chờ đợi (Happy idle - tai động đậy, mắt tròn)
    2. Hơi sốt ruột (Restless - đuôi ngoe nguẩy nhẹ, liếc đồng hồ cát)
    3. Phụng phịu (Pouty / Impatient - phồng má, tai cụp)
    4. Vui mừng tột đỉnh (Delighted - hai mắt hình ngôi sao/trái tim, nhảy cẫng, nhận chai siro và để lại sao thưởng).

---

## 2. Hai chủ đề gốc bổ sung (Engine độc lập, đổi skin chỉ đổi asset/data)

### Chủ đề đề xuất 2: Vườn Trà Đom Đóm (Firefly Tea Garden)
- **Bối cảnh**: Vườn trà phương Đông thần tiên dưới ánh trăng.
- **Vật phẩm**: Bình sứ ngọc bích trong mờ chứa các loại trà thảo mộc phát sáng (Trà Hoa Cúc Vàng, Trà Đậu Biếc Lam, Trà Sen Hồng, Trà Matcha Ngọc). Khách hàng là các linh hồn rừng tí hon (Linh Miêu Rừng, Thỏ Trăng, Cáo Nhỏ) ghé lấy bình trà thơm để thắp sáng khu rừng.
- **Phong cách nghệ thuật**: Zen, huyền ảo, ánh sáng đom đóm dập dờn, tiếng gõ tre shishi-odoshi và tiếng nước suối êm dịu.

### Chủ đề đề xuất 3: Tiệm Dược Thảo Cú Mèo (Owl Apothecary)
- **Bối cảnh**: Tiệm thuốc phép thuật cổ điển phong cách Victorian ma thuật ấm áp do Bác Cú Già thông thái trông coi.
- **Vật phẩm**: Bình thuốc giả kim hình cầu hoặc bình tam giác bằng thủy tinh dày, chứa các tinh chất phép thuật (Bột Sao, Tinh Dầu Rồng, Nước Mắt Phượng Hoàng). Khách hàng là các sinh vật huyền bí (Cú học giả, Mèo phù thủy, Chồn bay).
- **Phong cách nghệ thuật**: Huyền bí, cổ điển ấm áp (Warm Steampunk / Fantasy Library), tiếng thủy tinh lanh lảnh và khói phép lấp lánh.

---

## 3. Hệ thống Màu sắc & Chế độ Hỗ trợ Mù Màu (Colorblind Mode)

Mỗi màu trong game đều đi kèm một **Ký hiệu/Biểu tượng độc quyền (Pattern Icon)** in chìm trên lớp chất lỏng và trên nhãn của khách hàng, đảm bảo người bị mù màu (Protanopia, Deuteranopia, Tritanopia, Monochromacy) đều chơi thoải mái 100%.

| Mã Màu (ID) | Tên Siro | Màu Hex chuẩn | Ký hiệu mù màu | Mô tả ký hiệu |
|---|---|---|---|---|
| `strawberry` | Dâu Tây | `#FF4B72` | 🍓 / Vòng tròn có chấm | Hình giọt nước dâu |
| `blueberry` | Việt Quất | `#3388FF` | 🫐 / Hình thoi đôi | Ngôi sao 4 cánh |
| `orange` | Cam Tươi | `#FF9900` | 🍊 / Vạch chéo // | Mặt trời tỏa tia |
| `kiwi` | Kiwi Xanh | `#2ECC71` | 🥝 / Dấu cộng lồng tròn | Chiếc lá 3 cánh |
| `grape` | Nho Tím | `#9B59B6` | 🍇 / Tam giác hướng lên | Chùm quả tam giác |
| `lemon` | Chanh Vàng | `#F1C40F` | 🍋 / Gợn sóng ~~~ | Trăng khuyết |
| `peach` | Đào Hồng | `#FF8A80` | 🍑 / Hình trái tim ♥ | Trái tim nhỏ |
| `mint` | Bạc Hà Băng | `#1ABC9C` | 🌿 / Hình lục giác | Bông tuyết 6 cánh |
| `chocolate` | Cacao Đậm | `#795548` | 🍫 / Ô cờ vuông | Vuông chia 4 ô |
| `vanilla` | Vani Kem | `#FFF8E1` | 🍦 / Vòng xoắn xoáy | Đám mây tròn |

---

## 4. Quy chuẩn Giao diện & Công thái học (UI & Ergonomics)
- **Vùng chạm tối thiểu**: Tất cả các bình và nút bấm đều có kích thước tương tác $\ge 44 \times 44$ dp.
- **Độ tương phản**: Đạt chuẩn WCAG 2.1 AA (Tỷ lệ tương phản chữ $\ge 4.5:1$ cho chữ thông thường và $\ge 3:1$ cho chữ lớn/icon).
- **Cỡ chữ**: Tối thiểu 14 dp trên điện thoại di động nhỏ (360 dp chiều rộng).
- **Responsive Layout**:
  - Màn hình hẹp (360x740): Tự động dàn 2 hàng bình, co giãn khoảng cách.
  - Màn hình rộng / Tablet (768x1024, iPad): Dàn 1 đến 2 hàng cân đối ở trung tâm màn hình, không bị vỡ bố cục.
  - Màn hình ngang (740x360): Cột đơn hàng nằm bên trái/phải, bình nằm ở khu vực chính.
