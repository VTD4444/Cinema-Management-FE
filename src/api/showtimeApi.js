import axiosClient from './axiosClient';

const SHOWTIMES_BASE = '/showtimes';

/**
 * Tạo suất chiếu mới
 * @param {{ movie_id: number, room_id: number, base_price: number, start_times: string|string[] }} payload
 */
export const createShowtime = (payload) => {
  return axiosClient.post(SHOWTIMES_BASE, payload);
};

/**
 * Cập nhật suất chiếu
 * @param {number|string} id
 * @param {{ movie_id?: number, room_id?: number, start_time?: string, base_price?: number }} payload
 */
export const updateShowtime = (id, payload) => {
  return axiosClient.put(`${SHOWTIMES_BASE}/${id}`, payload);
};

/**
 * Xóa suất chiếu
 * @param {number|string} id
 */
export const deleteShowtime = (id) => {
  return axiosClient.delete(`${SHOWTIMES_BASE}/${id}`);
};

/**
 * Lấy suất chiếu theo phim, rạp và ngày
 * @param {{ movie_id: number, cinema_id: number, date: string }} params
 */
export const getShowtimesByFilter = (params) => {
  return axiosClient.get(`${SHOWTIMES_BASE}/filter`, { params });
};
