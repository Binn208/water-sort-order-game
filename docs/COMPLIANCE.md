# CHÍNH SÁCH TUÂN THỦ STORE & QUYỀN RIÊNG TƯ (COMPLIANCE & PRIVACY)

Tài liệu này tổng hợp các quy định pháp lý và quy chế hiện hành của Apple App Store và Google Play Store áp dụng cho tựa game *Meow Syrup: Color Sort Cafe*.

---

## 1. Cam kết Quyền riêng tư & Thu thập dữ liệu (Privacy by Design)
- **Mặc định Offline 100%**: Trò chơi không gửi bất kỳ yêu cầu mạng (Network Request) nào ra bên ngoài.
- **Không theo dõi (Zero Tracking)**: Không tích hợp IDFA, GAID, hoặc bất kỳ SDK phân tích/quảng cáo nào (không Firebase, không AppsFlyer, không Facebook Pixel, không Google AdMob ở bản phát hành cơ bản).
- **Lưu trữ dữ liệu**: 100% dữ liệu tiến trình (màn chơi, số sao, tiền xu, cài đặt) được lưu cục bộ trên thiết bị của người dùng qua `localStorage` / Native Preferences.

---

## 2. Khai báo Google Play Data Safety
- **Dữ liệu được thu thập**: `None` (Không thu thập).
- **Dữ liệu được chia sẻ**: `None` (Không chia sẻ với bên thứ ba).
- **Bảo mật dữ liệu**: Không truyền dữ liệu qua Internet. Người chơi có toàn quyền xóa dữ liệu ứng dụng trực tiếp từ phần Cài đặt của hệ thống.
- **Đối tượng trẻ em**: Game an toàn cho mọi lứa tuổi, không chứa nội dung bạo lực hay phản cảm, tuân thủ đạo luật COPPA.

---

## 3. Khai báo Apple App Tracking Transparency (ATT) & App Privacy
- **App Privacy Details**: Lựa chọn mục *"Data Not Collected"* (Ứng dụng không thu thập bất kỳ dữ liệu nào).
- **ATT Prompt**: Do không theo dõi và không thu thập IDFA, ứng dụng không cần và không kích hoạt popup xin quyền theo dõi ATT.
- **EU GDPR / UMP Consent**: Vì ứng dụng không có quảng cáo cá nhân hóa và không lưu thông tin người dùng EU, không cần hiển thị hộp thoại Consent Form phức tạp.

---

## 4. Quy tắc Kinh doanh Công bằng (Fair Monetization Guidelines)
1. **Không Paywall**: 100% các màn chơi (từ màn 1 đến màn 120+) đều giải được hoàn toàn bằng tư duy và 0 công cụ hỗ trợ.
2. **Cứu hộ miễn phí**: Luôn luôn có sẵn ít nhất 1 bình rỗng cứu hộ khi kẹt mà không đòi hỏi xem quảng cáo hay trả phí.
3. **Quảng cáo thưởng (Rewarded Ads - Nếu bật sau này)**: Hoàn toàn do người chơi chủ động bấm nhận thêm xu, không bao giờ ép buộc để mở khóa màn.
4. **Gói Bỏ Quảng Cáo (No-Ads IAP)**: Nêu rõ loại bỏ quảng cáo xen kẽ (interstitial), giữ nguyên tùy chọn xem quảng cáo thưởng.

*Lưu ý: Mọi điều khoản pháp lý cuối cùng cần được người phụ trách store hoặc cố vấn pháp lý của chủ sở hữu kiểm tra lại trước khi nhấn nút Submit.*
