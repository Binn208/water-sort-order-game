# HƯỚNG DẪN DÀNH CHO CHỦ SỞ HỮU DỰ ÁN (OWNER PRE-PUBLISH CHECKLIST)

Tài liệu này liệt kê chi tiết các công việc hành chính, đăng ký tài khoản, chi phí và thủ tục mà Chủ sở hữu cần thực hiện để chính thức đưa game lên App Store và Google Play.

---

## 1. Tài khoản Nhà phát triển (Developer Accounts)

| Nền tảng | Loại tài khoản | Chi phí | Thời gian phê duyệt | Lưu ý bắt buộc |
|---|---|---|---|---|
| **Google Play** | Google Play Console (Cá nhân / Doanh nghiệp) | $25 (Trả một lần) | 2–5 ngày làm việc | Bắt buộc xác minh danh tính (CCCD/Hộ chiếu) và thử nghiệm 14 ngày với 20 tester nếu tài khoản cá nhân mới tạo. |
| **Apple App Store** | Apple Developer Program | $99 / năm | 2–7 ngày làm việc | Cần thẻ thanh toán quốc tế Visa/Mastercard. Cần máy tính Mac chạy macOS + Xcode để ký chứng chỉ và upload bản build iOS. |

---

## 2. Thông tin Thuế & Thanh toán (Tax & Banking)
- **Biểu mẫu thuế W-8BEN** (dành cho cá nhân/doanh nghiệp ngoài nước Mỹ): Khai báo trên Google Play Console và Apple App Store Connect để giảm thuế khấu lưu theo hiệp định tránh đánh thuế 2 lần.
- **Tài khoản ngân hàng nhận tiền**: Điền số tài khoản ngân hàng Việt Nam, mã SWIFT Code của ngân hàng.

---

## 3. Trang Chính sách Quyền riêng tư & Trang Hỗ trợ (Hosting URL)
- Cần tạo một trang web tĩnh (có thể dùng GitHub Pages hoặc Google Sites miễn phí):
  - `https://your-domain.com/privacy-policy` (Nội dung lấy từ `docs/COMPLIANCE.md`).
  - `https://your-domain.com/support` (Email hỗ trợ: `support@catsyrup.local`).

---

## 4. Ký Chứng chỉ Phát hành (Release Signing Key)
- **Android**:
  - Tạo Keystore ký ứng dụng bằng lệnh:
    ```bash
    keytool -genkey -v -keystore cat-syrup-release.keystore -alias catsyrup -keyalg RSA -keysize 2048 -validity 10000
    ```
  - Lưu file Keystore và mật khẩu ở nơi an toàn tuyệt đối (nếu mất sẽ không thể update game trên Google Play!).
- **iOS**:
  - Tạo Certificate và Provisioning Profile trên `developer.apple.com`.
  - Mở thư mục `ios` bằng Xcode trên Mac, chọn Team và nhấn Archive.
