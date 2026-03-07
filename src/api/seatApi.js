import axiosClient from './axiosClient';

/**
 * API ghế ngồi (Seats trong DB)
 * Schema DB: id, room_id (FK), row_label (varchar), number (int), type (enum: vip, couple, standard)
 * Optional: is_active cho trạng thái bật/tắt (có thể bổ sung DB sau)
 */

const SEATS_BASE = '/seats';

/**
 * Lấy danh sách ghế (theo phòng, phân trang, tìm kiếm)
 * @param {{ room_id?: number, page?: number, limit?: number, search?: string }} params
 */
export const getSeats = (params = {}) => {
  return axiosClient.get(SEATS_BASE, { params });
};

/**
 * Lấy chi tiết một ghế
 * @param {number|string} id
 */
export const getSeatById = (id) => {
  return axiosClient.get(`${SEATS_BASE}/${id}`);
};

/**
 * Tạo ghế mới
 * @param {{ room_id: number, row_label: string, number: number, type: 'standard'|'vip'|'couple', is_active?: boolean }} payload
 */
export const createSeat = (payload) => {
  return axiosClient.post(SEATS_BASE, payload);
};

/**
 * Cập nhật ghế
 * @param {number|string} id
 * @param {Object} payload
 */
export const updateSeat = (id, payload) => {
  return axiosClient.put(`${SEATS_BASE}/${id}`, payload);
};

/**
 * Xóa ghế
 * @param {number|string} id
 */
export const deleteSeat = (id) => {
  return axiosClient.delete(`${SEATS_BASE}/${id}`);
};
