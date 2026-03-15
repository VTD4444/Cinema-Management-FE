import axiosClient from './axiosClient';

/**
 * API thể loại – response format: { success, message, data }
 * data theo schema: Genres (id, name, created_at, updated_at)
 *
 * Backend:
 * - GET /genres        → cho user
 * - GET /genres/admin  → cho admin (bao gồm cả đã soft delete)
 */

const GENRES_BASE = '/genres';
const GENRES_ADMIN_BASE = '/genres/admin';

/**
 * Lấy danh sách thể loại (có phân trang, tìm kiếm)
 * @param {{ page?: number, limit?: number, search?: string }} params
 */
export const getGenres = (params = {}) => {
  // Dùng endpoint admin để phù hợp backend (GET /genres/admin)
  return axiosClient.get(GENRES_ADMIN_BASE, { params });
};

/**
 * Lấy chi tiết một thể loại
 * @param {number|string} id
 */
export const getGenreById = (id) => {
  return axiosClient.get(`${GENRES_BASE}/${id}`);
};

/**
 * Tạo thể loại mới
 * @param {{ name: string }} payload
 */
export const createGenre = (payload) => {
  return axiosClient.post(GENRES_BASE, payload);
};

/**
 * Cập nhật thể loại
 * @param {number|string} id
 * @param {{ name: string }} payload
 */
export const updateGenre = (id, payload) => {
  // Backend dùng PATCH /genres/{id}
  return axiosClient.patch(`${GENRES_BASE}/${id}`, payload);
};

/**
 * Xóa thể loại
 * @param {number|string} id
 */
export const deleteGenre = (id) => {
  return axiosClient.delete(`${GENRES_BASE}/${id}`);
};
