import axiosClient from './axiosClient';

/**
 * API phim – response format: { success, message, data }
 * data theo schema: Movies (id, title, duration, directors_name, release_date, description, poster_urls, trailer_url, status, genres?)
 */

const MOVIES_BASE = '/movies';
const GENRES_BASE = '/genres';

/**
 * Lấy danh sách phim có phân trang, tìm kiếm, lọc trạng thái
 * @param {{ page?: number, limit?: number, search?: string, status?: 'showing'|'coming_soon'|'passed' }} params
 * @returns {Promise<{ success: boolean, message: string, data: { items: Array, total: number } }>}
 */
export const getMovies = (params = {}) => {
  return axiosClient.get(MOVIES_BASE, { params });
};

/**
 * Lấy chi tiết một phim (kèm genres nếu backend trả về)
 * @param {number|string} id
 */
export const getMovieById = (id) => {
  return axiosClient.get(`${MOVIES_BASE}/${id}`);
};

/**
 * Tạo phim mới
 * @param {{ title, duration, directors_name?, release_date?, description?, poster_urls?, trailer_url?, status, genre_ids?: number[] }} payload
 */
export const createMovie = (payload) => {
  return axiosClient.post(MOVIES_BASE, payload);
};

/**
 * Cập nhật phim
 * @param {number|string} id
 * @param {Object} payload - cùng cấu trúc createMovie
 */
export const updateMovie = (id, payload) => {
  return axiosClient.put(`${MOVIES_BASE}/${id}`, payload);
};

/**
 * Xóa phim
 * @param {number|string} id
 */
export const deleteMovie = (id) => {
  return axiosClient.delete(`${MOVIES_BASE}/${id}`);
};

/**
 * Lấy danh sách thể loại (cho dropdown trong form Thêm/Sửa phim)
 * @returns {Promise<{ success: boolean, message: string, data: Array<{ id: number, name: string }> }>}
 */
export const getGenres = () => {
  return axiosClient.get(GENRES_BASE);
};
