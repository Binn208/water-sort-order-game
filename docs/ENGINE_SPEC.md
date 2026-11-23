# ĐẶC TẢ KỸ THUẬT ENGINE TRÒ CHƠI (ENGINE SPECIFICATION)
*Chuẩn tham chiếu Nguồn Chân Lý (Source of Truth) dùng chung cho TypeScript (Web), Kotlin (Android) và Swift (iOS)*

Tài liệu này đặc tả chính xác logic và mô hình toán học của Engine, được trích xuất trực tiếp từ mã nguồn thực tế. Cả ba nền tảng (Web, Android, iOS) bắt buộc phải tuân thủ 100% tài liệu này.

---

## 1. Mô hình Dữ liệu (Data Model)

### 1.1. Bình chứa (`Jar`)
- `id: string`: Định danh duy nhất của bình (ví dụ: `"jar_1"`, `"rescue_1"`).
- `capacity: number`: Sức chứa tối đa số lớp (mặc định là 4).
- `layers: string[]`: Mảng màu từ đáy lên miệng.
  - `layers[0]`: Lớp dưới đáy bình.
  - `layers[layers.length - 1]`: Lớp trên cùng sát miệng bình.
  - Bình rỗng khi `layers.length === 0`.
  - Bình đầy khi `layers.length === capacity`.

### 1.2. Đơn hàng khách (`Order`)
- `id: string`: Định danh đơn hàng (ví dụ: `"order_1"`).
- `customerId: string`: Định danh khách mèo (ví dụ: `"cat_mochi"`).
- `color: string`: Màu siro yêu cầu (ví dụ: `"strawberry"`).
- `count: number`: Số lượng bình đầy cần giao (thường là 1).
- `fulfilledCount: number`: Số lượng bình đã giao được cho đơn này.
- `maxPatienceSeconds: number`: Thanh kiên nhẫn tối đa (giây).
- `remainingPatienceSeconds: number`: Thời gian kiên nhẫn còn lại.
- `createdAt: number`: Số thứ tự hàng đợi khi khách đến (số nguyên tăng dần: 0, 1, 2...).

### 1.3. Nước đi (`Move`)
- `fromJarId: string`: Định danh bình nguồn.
- `toJarId: string`: Định danh bình đích.
- `count: number`: Số lớp chất lỏng chuyển giao.
- `color: string`: Màu chất lỏng được rót.

---

## 2. Quy tắc Đổ Chất lỏng (Pouring Rules)

### 2.1. Khối màu trên cùng (`getTopColorRun`)
- Quét từ `layers.length - 1` xuống đáy. Đếm các lớp liên tiếp có màu trùng với màu trên cùng.
- Trả về `{ color, count }`. Nếu bình rỗng, trả về `null`.

### 2.2. Điều kiện rót hợp lệ (`canPour`)
Nước đi từ `source` sang `target` hợp lệ khi và chỉ khi thỏa mãn đồng thời:
1. `source.id !== target.id` (Không rót vào chính nó).
2. `source.layers.length > 0` (Bình nguồn không rỗng).
3. `target.layers.length < target.capacity` (Bình đích còn chỗ trống).
4. `target.layers.length === 0` HOẶC `target.topColor === source.topColor` (Bình đích rỗng hoặc trùng màu trên cùng).

### 2.3. Quy tắc Đổ một phần (Partial Pour & `computePourAmount`)
- Số lượng chuyển giao:
  $$\text{count} = \min(\text{sourceRun.count}, \text{target.capacity} - \text{target.layers.length})$$
- Nếu `count < sourceRun.count`: Chỉ chuyển `count` lớp sang bình đích, số lớp còn lại `sourceRun.count - count` giữ nguyên ở đỉnh bình nguồn.

### 2.4. Thứ tự duyệt nước đi tất định (`legalMoves`)
- Duyệt qua tất cả các cặp `(src, tgt)` sao cho `src !== tgt`.
- Nếu `canPour(src, tgt)` thỏa mãn: thêm `Move` vào danh sách.
- **Sắp xếp tất định bắt buộc**:
  ```ts
  moves.sort((a, b) => a.fromJarId.localeCompare(b.fromJarId) || a.toJarId.localeCompare(b.toJarId))
  ```

---

## 3. Đóng gói, Giao hàng & Giải phóng Bàn chơi (Packing & Delivery)

Sau mỗi nước đi:
1. Duyệt tất cả các bình trên bàn.
2. Bình được coi là **Đầy Đồng Nhất** khi:
   $$\text{jar.layers.length} === \text{jar.capacity} \quad \text{và} \quad \forall i, \text{jar.layers}[i] === \text{jar.layers}[0]$$
3. Khi phát hiện bình đầy đồng nhất màu $C$:
   - Tăng `deliveredColorsCount[C] += 1`.
   - Tìm trong danh sách đơn hàng những đơn chưa hoàn thành có `color === C`:
     - **Thứ tự ưu tiên giao**: Sắp xếp các đơn hợp lệ theo `createdAt` tăng dần (người chờ lâu nhất nhận trước).
     - Đơn đầu tiên nhận bình: `order.fulfilledCount += 1`.
     - Sự kiện sinh ra: `byproduct = false`.
   - Nếu không có đơn hàng nào cần màu $C$ (màu phụ/dư cung):
     - Bình vẫn đóng nắp và sinh sự kiện `byproduct = true`.
   - **Bình rời khỏi bàn chơi**: Trong cả 2 trường hợp, bình này bị xóa khỏi mảng `state.jars` đang hiển thị trên bàn chơi để giải phóng không gian.

---

## 4. Điều kiện Thắng, Kẹt & Cứu hộ (Win, Stuck, Rescue)

1. **Thắng (`isWon`)**:
   $$\text{orders.length} > 0 \quad \text{và} \quad \forall o \in \text{orders}, o.\text{fulfilledCount} \ge o.\text{count}$$
2. **Kẹt (`isStuck`)**:
   $$\text{!isWon} \quad \text{và} \quad \text{legalMoves(state).length} === 0$$
3. **Cứu hộ miễn phí (`addRescueJar`)**:
   - Thêm một bình rỗng mới: `{ id: "rescue_N", capacity: state.capacity, layers: [] }`.
   - `freeRescueAvailable = false`, `isStuck = false`.
   - Không yêu cầu xem quảng cáo hay trả phí.
4. **Hoàn tác (`undo`)**:
   - Hoàn tác toàn bộ nước đi trước, bao gồm khôi phục bình đã giao/đóng gói về lại bàn chơi, trừ lại tiến độ đơn hàng và khôi phục hash cũ.

---

## 5. Thuật toán Băm Chuẩn hóa (Canonical Hash) & FNV-1a 64-bit

Để đảm bảo hoán vị các bình giống nhau hoặc bình rỗng cho cùng một giá trị băm:

### 5.1. Chuỗi Chuẩn hóa (Canonical String)
1. Biểu diễn mỗi bình: `layers.join(',')`.
2. Sắp xếp danh sách bình theo thứ tự từ điển (`sort()`), nối bằng dấu `|`.
3. Biểu diễn đơn hàng: `color:fulfilledCount/count`, sắp xếp theo thứ tự từ điển, nối bằng dấu `;`.
4. Biểu diễn màu đã giao: `color:count` sắp xếp theo từ điển.
5. Ghép chuỗi chuẩn hóa theo mẫu:
   ```text
   J:[<sorted_jars>]#O:[<sorted_orders>]#D:[<sorted_delivered>]#W:<isWon ? 1 : 0>
   ```

### 5.2. Thuật toán FNV-1a 64-bit
- Hằng số:
  - `OFFSET_BASIS = 0xcbf29ce484222325` (UInt64 / ULong)
  - `PRIME = 0x100000001b3` (UInt64 / ULong)
- Thuật toán mã giả:
  ```text
  hash = OFFSET_BASIS
  for each byte in UTF8_BYTES(canonicalString):
      hash = hash XOR byte
      hash = (hash * PRIME) modulo 2^64
  return hex16_lowercase(hash)
  ```
- Ví dụ: Chuỗi `J:[]#O:[]#D:[]#W:0` $\to$ kết quả băm hex 16 ký tự cố định.

---

## 6. Định dạng Dữ liệu JSON (JSON Schemas)

### 6.1. Cấu trúc File Màn chơi (`LevelDefinition`)
```json
{
  "id": 1,
  "seed": 101414,
  "jars": [
    { "id": "jar_1", "capacity": 4, "layers": [] },
    { "id": "jar_2", "capacity": 4, "layers": ["blueberry", "blueberry", "strawberry"] }
  ],
  "orders": [
    { "id": "order_1", "customerId": "cat_mochi", "color": "strawberry", "count": 1, "maxPatienceSeconds": 90 }
  ],
  "starThresholds": {
    "moves": [10, 16, 25]
  },
  "solution": [
    { "fromJarId": "jar_2", "toJarId": "jar_1", "count": 1, "color": "strawberry" }
  ]
}
```

### 6.2. Cấu trúc Bản ghi Golden (`GoldenCase`)
```json
{
  "id": 1,
  "state": { ... },
  "legalMoves": [ ... ],
  "move": { "fromJarId": "jar_2", "toJarId": "jar_1", "count": 1, "color": "strawberry" },
  "nextState": { ... },
  "canonicalString": "J:[...]#O:[...]#D:[...]#W:0",
  "canonicalHash": "e2a1b94df0562c88",
  "events": [
    { "jarId": "jar_1", "color": "strawberry", "orderId": "order_1", "byproduct": false }
  ],
  "isWon": false,
  "isStuck": false,
  "undoMatchesInitial": true
}
```
