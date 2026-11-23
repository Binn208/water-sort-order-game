# HƯỚNG DẪN TRIỂN KHAI BẢN WEB PWA (WEB DEPLOYMENT GUIDE)

Bản Web của game được đóng gói theo tiêu chuẩn **Progressive Web App (PWA)**, hoàn toàn tĩnh (Static HTML/JS/CSS), hoạt động offline 100% nhờ Service Worker và không đòi hỏi máy chủ động (Node/PHP/Python).

---

## 1. Biên dịch Bản Phát hành (Production Build)

Chạy lệnh duy nhất tại thư mục gốc của dự án:
```bash
npm run build
```

Kết quả xuất ra tại thư mục: [`dist/`](file:///C:/Users/Bemo/.gemini/antigravity/scratch/cat-syrup-sort/dist).
- Tổng dung lượng: $\approx 42$ KB (Gzip: $\approx 12$ KB).
- Không phụ thuộc bất kỳ API bên ngoài nào.

---

## 2. Hướng dẫn Đưa lên các Nền tảng Lưu trữ Miễn phí

### Cách 1: Cloudflare Pages (Khuyên dùng - Nhanh nhất)
1. Đăng nhập [Cloudflare Dashboard](https://dash.cloudflare.com/) $\to$ Workers & Pages $\to$ Create application $\to$ Pages.
2. Chọn thư mục build là `dist` hoặc kéo thả trực tiếp thư mục `dist` lên giao diện web.
3. Trang web tự động có HTTPS và phân phối qua CDN toàn cầu với độ trễ $< 20$ ms.

### Cách 2: GitHub Pages
1. Trong file `package.json`, thêm script deploy:
   ```json
   "deploy": "gh-pages -d dist"
   ```
2. Vào Settings repo GitHub $\to$ Pages $\to$ chọn branch `gh-pages` $\to$ Save.

### Cách 3: Nginx / Máy chủ Web Riêng
Cấu hình mẫu cho Nginx:
```nginx
server {
    listen 80;
    server_name catsyrup.local;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name catsyrup.local;

    ssl_certificate /etc/ssl/certs/catsyrup.crt;
    ssl_certificate_key /etc/ssl/private/catsyrup.key;

    root /var/www/cat-syrup-sort/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache assets dài hạn
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webmanifest)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Service Worker không cache dài hạn
    location = /sw.js {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
}
```

---

## 3. Kiểm tra Trạng thái PWA Offline (Offline Verification)
1. Mở trang web đã deploy trên trình duyệt Chrome/Edge/Safari.
2. Mở DevTools (F12) $\to$ tab **Application** $\to$ kiểm tra Service Worker đã đăng ký trạng thái `Active and running`.
3. Tích chọn checkbox **Offline** trong tab Application hoặc bật chế độ máy bay.
4. Tải lại trang (F5) $\to$ Game vẫn khởi động tức thì và chơi mượt mà 100%, không phát sinh bất kỳ yêu cầu mạng nào.
