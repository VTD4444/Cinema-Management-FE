import axiosClient from './axiosClient';

/**
 * Lấy danh sách voucher (có phân trang)
 * @param {{ pageNo?: number, pageSize?: number }} params
 */
export const getVouchersAdmin = (params = {}) => {
  return axiosClient.get('/vouchers', { params });
};

/**
 * Lấy chi tiết một voucher
 * @param {number|string} id
 */
export const getVoucherById = (id) => {
  return axiosClient.get(`/vouchers/${id}`);
};

/**
 * Tạo voucher mới (Admin)
 * @param {{ code: string, value: number, type: string, start_date: string, end_date: string, usage_limit: number, is_active: boolean }} payload
 */
export const createVoucher = (payload) => {
  return axiosClient.post('/vouchers', payload);
};

/**
 * Cập nhật voucher (Admin)
 * @param {number|string} id
 * @param {{ code: string, value: number, type: string, start_date: string, end_date: string, usage_limit: number, is_active: boolean }} payload
 */
export const updateVoucher = (id, payload) => {
  return axiosClient.put(`/vouchers/${id}`, payload);
};

/**
 * Xóa mềm voucher (Admin)
 * @param {number|string} id
 */
export const deleteVoucher = (id) => {
  return axiosClient.delete(`/vouchers/${id}`);
};
