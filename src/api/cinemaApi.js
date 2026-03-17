import axiosClient from './axiosClient';

/**
 * API rạp phim (Cinemas trong DB)
 * Schema DB: id, name, address, image_urls (json), province_id (FK Provinces), created_at, updated_at
 * province_id trong DB = city_id trong code (cùng nghĩa). code, city_name, room_count: optional/computed.
 *
 * Backend:
 * - /cinemas          (GET user, POST admin)
 * - /cinemas/admin    (GET admin)
 * - /cinemas/{id}     (GET, PATCH, DELETE)
 */

const CINEMAS_BASE = '/cinemas';

/**
 * Lấy danh sách rạp (phân trang, tìm kiếm). Lọc theo province_id (city_id).
 * @param {{ page?: number, limit?: number, search?: string, city_id?: number, province_id?: number }} params
 */
export const getCinemas = (params = {}) => {
  return axiosClient.get(`${CINEMAS_BASE}/admin`, { params });
};

/**
 * Lấy chi tiết một rạp
 * @param {number|string} id
 */
export const getCinemaById = (id) => {
  return axiosClient.get(`${CINEMAS_BASE}/${id}`);
};

/**
 * Tạo rạp mới. Schema DB: name, address, province_id (bắt buộc), image_urls (optional).
 * @param {{ name: string, address: string, city_id?: number, province_id?: number, image_urls?: string[] }} payload
 */
export const createCinema = (payload) => {
  return axiosClient.post(CINEMAS_BASE, payload);
};

/**
 * Cập nhật rạp
 * @param {number|string} id
 * @param {Object} payload
 */
export const updateCinema = (id, payload) => {
  return axiosClient.patch(`${CINEMAS_BASE}/${id}`, payload);
};

/**
 * Xóa rạp
 * @param {number|string} id
 */
export const deleteCinema = (id) => {
  return axiosClient.delete(`${CINEMAS_BASE}/${id}`);
};
