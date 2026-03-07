# So sánh trường dữ liệu với Database Schema (ERD)

## 1. Genres (Thể loại) – **KHỚP**

| Schema DB | Hiện tại | Ghi chú |
|-----------|----------|---------|
| id (PK) | ✓ id | |
| name (varchar, NN) | ✓ name | |
| created_at (timestamp, NN) | ✓ created_at | |
| updated_at (timestamp, NN) | ✓ updated_at | |

**Kết luận:** Genres trong code và mock khớp đủ với bảng `Genres` trong DB.

---

## 2. Provinces (Tỉnh/Thành phố – đang dùng tên "Cities") – **CẦN ĐIỀU CHỈNH**

| Schema DB (Provinces) | Hiện tại | Ghi chú |
|----------------------|----------|---------|
| id (PK) | ✓ id | |
| name (varchar, NN) | ✓ name | |
| created_at (timestamp, NN) | ✓ created_at | |
| updated_at (timestamp, NN) | ✓ updated_at | |
| — | code | **Không có trong DB.** Chỉ dùng cho UI (Mã định danh G-xxx). Nên optional hoặc bỏ khi gọi API thật. |
| — | cinema_complex_count | **Không có trong DB.** Có thể tính từ số Cinemas theo province_id. |

**Hành động:** Backend/API thật nên chỉ dùng `id, name, created_at, updated_at`. Front có thể giữ `code` (optional) cho hiển thị; `cinema_complex_count` nên lấy từ API hoặc tính, không lưu trong bảng Provinces.

---

## 3. Cinemas (Rạp) – **CẦN ĐIỀU CHỈNH**

| Schema DB (Cinemas) | Hiện tại | Ghi chú |
|--------------------|----------|---------|
| id (PK) | ✓ id | |
| name (varchar, NN) | ✓ name | |
| address (varchar, NN) | ✓ address | |
| image_urls (json) | ✗ | **Thiếu trong mock/API.** Cần thêm khi tích hợp backend. |
| province_id (int, NN, FK → Provinces) | ✓ city_id | **Cùng nghĩa.** Nên dùng tên `province_id` khi gọi API để khớp DB. |
| created_at (timestamp, NN) | ✓ created_at | |
| updated_at (timestamp, NN) | ✓ updated_at | |
| — | code | Không có trong DB. Chỉ cho UI (CG001…). |
| — | city_name | Không có trong DB. Có thể join từ Provinces. |
| — | room_count | Không có trong DB. Có thể đếm từ CinemaRooms. |

**Hành động:** Thêm `image_urls` (json, optional) trong API/mock; ưu tiên dùng `province_id` trong request/response; `code`, `city_name`, `room_count` dùng cho hiển thị hoặc tính từ backend.

---

## 4. CinemaRooms (Phòng chiếu) – **SCHEMA DB THIẾU NHIỀU TRƯỜNG**

| Schema DB (CinemaRooms) | Hiện tại | Ghi chú |
|-------------------------|----------|---------|
| id (PK) | ✓ id | |
| cinema_id (int, NN, FK → Cinemas) | ✓ cinema_id | |
| name (varchar, NN) | ✓ name | |
| created_at (timestamp, NN) | ✓ created_at | |
| updated_at (timestamp, NN) | ✓ updated_at | |
| — | room_type | **Không có trong DB.** UI cần (Standard, Gold Class, Couple). |
| — | seat_count | **Không có trong DB.** UI cần (số ghế). |
| — | format | **Không có trong DB.** UI cần (IMAX, 2D, 3D). |
| — | status | **Không có trong DB.** UI cần (Đang hoạt động, Bảo trì, Chờ duyệt). |

**Hành động:** Nếu backend đúng schema hiện tại thì bảng `CinemaRooms` chỉ có id, cinema_id, name, created_at, updated_at. Cần **bổ sung migration** thêm các cột `room_type`, `seat_count`, `format`, `status` (hoặc bảng con tương ứng) để khớp nghiệp vụ và UI. Front giữ các trường này trong mock/API cho đến khi backend hỗ trợ.

---

## Tóm tắt

| Feature | Khớp schema? | Việc cần làm |
|---------|----------------|--------------|
| **Genres** | ✓ Có | Không. |
| **Provinces (Cities)** | Gần đủ | Bỏ/optional `code`, `cinema_complex_count` khi gọi API thật. |
| **Cinemas** | Gần đủ | Thêm `image_urls`; dùng `province_id`; coi code/city_name/room_count là hiển thị hoặc tính. |
| **CinemaRooms** | Thiếu trường DB | Backend cần thêm room_type, seat_count, format, status (hoặc bảng liên quan). |
