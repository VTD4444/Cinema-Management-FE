import axiosClient from './axiosClient';

/**
 * API tỉnh/thành phố (Provinces trong DB)
 * Schema DB: id, name, created_at, updated_at
 * Optional/display: code (mã định danh), cinema_complex_count (tính từ Cinemas)
 */

const CITIES_BASE = '/cities';

/**
 * Lấy danh sách tỉnh/thành phố (phân trang, tìm kiếm)
 * @param {{ page?: number, limit?: number, search?: string }} params
 */
export const getCities = (params = {}) => {
  return axiosClient.get(CITIES_BASE, { params });
};

/**
 * Lấy chi tiết một tỉnh/thành phố
 * @param {number|string} id
 */
export const getCityById = (id) => {
  return axiosClient.get(`${CITIES_BASE}/${id}`);
};

/**
 * Tạo tỉnh/thành phố mới. Schema DB chỉ có name (bắt buộc); code optional cho UI.
 * @param {{ name: string, code?: string }} payload
 */
export const createCity = (payload) => {
  return axiosClient.post(CITIES_BASE, payload);
};

/**
 * Cập nhật tỉnh/thành phố
 * @param {number|string} id
 * @param {{ name?: string, code?: string }} payload
 */
export const updateCity = (id, payload) => {
  return axiosClient.put(`${CITIES_BASE}/${id}`, payload);
};

/**
 * Xóa tỉnh/thành phố
 * @param {number|string} id
 */
export const deleteCity = (id) => {
  return axiosClient.delete(`${CITIES_BASE}/${id}`);
};
