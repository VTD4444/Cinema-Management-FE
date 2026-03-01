# CineGo Frontend - React Base Setup

Dự án này đã được cài đặt và thiết lập base chuẩn.

## Cấu trúc Thư mục

- `src/components`: Các thành phần giao diện dùng chung (Button, Input, Modal, v.v.).
- `src/features`: Chia theo tính năng hoặc trang cụ thể.
- `src/pages`: Màn hình giao diện chính (Routing pages).
- `src/hooks`: Các Custom Hooks dùng để xử lý logic.
- `src/services` & `src/api`: Nơi quản lý các lệnh gọi API (chứa Axios instance phân cấp).
- `src/store`: Quản lý trạng thái toàn cục sử dụng Zustand.
- `src/utils`: Các hàm tiện ích dùng chung (format ngày tháng, xử lý chuỗi).
- `src/types`: Các type definition dùng (nếu có dùng TypeScript/JSDoc)
- `src/layouts`: Layout wrapper chung cho các Page (VD: AppShell có header và sidebar).

## Các thư viện và công cụ tích hợp

- **Vite & React 19**
- **Tailwind CSS v4** (Tích hợp thông qua @tailwindcss/vite plug)
- **Zustand**: Quản lý state toàn cục nhẹ nhàng, dễ sử dụng.
- **Lucide React**: Thư viện icon phong phú, giao diện đẹp.
- **Axios**: Quản lý API dễ dàng, đã có sẵn Instance Configurable (`src/api/axiosClient.js`).
- **Husky & lint-staged**: Tự động chặn lcommit mã lỗi bằng Prettier & ESLint trước khi commit.
- **ESLint & Prettier**: Định dạng và chuẩn hoá Code.

## Cấu hình Môi trường

Đã tạo sẵn hai file môi trường:

- `.env.development`: Chứa cấu hình dành cho dev.
- `.env.production`: Chứa cấu hình dành cho môi trường chạy thực tế.
  _(Chú ý: Hiện đã được ignore theo `.gitignore` chuẩn của Vite)_

## Design System

Tông màu chính cho hệ thống UI đã được tuỳ chỉnh:

- Primary: `#E50914` (Hover: `#F11D28`)
- Background: `#0F0F0F`
- Mẫu Theme đã tuỳ biến trong `src/index.css`.
