import axiosClient from './axiosClient';

/**
 * API thể loại – response format: { success, message, data }
 * data theo schema: Genres (id, name, created_at, updated_at)
 */

const GENRES_BASE = '/genres';

/**
 * Lấy danh sách thể loại (có phân trang, tìm kiếm)
 * @param {{ page?: number, limit?: number, search?: string }} params
 */
export const getGenres = (params = {}) => {
  return axiosClient.get(GENRES_BASE, { params });
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
  return axiosClient.put(`${GENRES_BASE}/${id}`, payload);
};

/**
 * Xóa thể loại
 * @param {number|string} id
 */
export const deleteGenre = (id) => {
  return axiosClient.delete(`${GENRES_BASE}/${id}`);
};
