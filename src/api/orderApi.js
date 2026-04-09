import axiosClient from './axiosClient';

/**
 * Tạo một order mới và sinh URL để chuyển hướng khách hàng sang cổng thanh toán VNPay
 * @param {{ showtimeId: number, seatIds: number[], foodItems: {foodId: number, quantity: number}[], voucher_code?: string }} payload
 */
export const createOrder = (payload) => {
  return axiosClient.post('/orders', payload);
};

/**
 * Xử lý kết quả trả về sau khi khác hàng thanh toán tại VNPay (Backend Verification).
 * Hàm này đón nhận nguyên params từ VNPay return URL.
 * @param {Object} params { vnp_TxnRef, vnp_ResponseCode, ... }
 */
export const verifyVNPayReturn = (params) => {
  return axiosClient.get('/orders/vnpay-return', { params });
};

/**
 * Láy lịch sử mua vé của User (có phân trang và lọc theo payment_status)
 * @param {Object} params { pageNo, pageSize, order_status }
 */
export const getMyOrderHistory = (params) => {
  return axiosClient.get('/orders/my-history', { params });
};

/**
 * Check-in vé theo booking_code (Admin quét QR hoặc nhập tay)
 * @param {string} booking_code
 */
export const checkInByBookingCode = (booking_code) => {
  return axiosClient.post('/orders/check-in', { booking_code });
};

/**
 * Lấy lịch sử check-in toàn hệ thống (Admin only)
 * @param {Object} params { pageNo, pageSize, ticket_status }
 */
export const getCheckinHistory = (params) => {
  return axiosClient.get('/orders/checkin/history/all', { params });
};

/**
 * Lấy danh sách tất cả các đơn hàng (Admin only)
 * @param {Object} params { pageNo, pageSize, payment_status }
 */
export const getAdminOrders = (params) => {
  return axiosClient.get('/orders/admin', { params });
};
