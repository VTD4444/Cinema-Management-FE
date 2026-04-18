import axiosClient from './axiosClient';

/**
 * API rạp phim (Cinemas)
 *
 * Backend endpoints:
 * - POST   /cinemas           → Tạo rạp mới (Admin only)
 * - GET    /cinemas           → Lấy danh sách rạp (User, chỉ active) — response: { success, results, data: [...] }
 * - GET    /cinemas/admin     → Lấy tất cả rạp cho Admin (bao gồm cả soft-deleted) — filter: province_id
 * - GET    /cinemas/{id}      → Lấy chi tiết rạp
 * - PATCH  /cinemas/{id}      → Cập nhật rạp (Admin only)
 * - DELETE /cinemas/{id}      → Soft delete rạp (Admin only)
 */

const CINEMAS_BASE = '/cinemas';

/**
 * Lấy danh sách rạp cho Admin (bao gồm cả soft-deleted)
 * @param {{ province_id?: number }} params
 */
export const getCinemas = (params = {}) => {
  return axiosClient.get(`${CINEMAS_BASE}/admin`, { params });
};

/**
 * Lấy danh sách rạp cho User (chỉ active)
 * Response format: { success, results, data: [...] }
 * @param {{ province_id?: number }} params
 */
export const getCinemasPublic = (params = {}) => {
  return axiosClient.get(CINEMAS_BASE, { params });
};

/**
 * Lấy chi tiết một rạp
 * @param {number|string} id
 */
export const getCinemaById = (id) => {
  return axiosClient.get(`${CINEMAS_BASE}/${id}`);
};

/**
 * Lấy danh sách phòng của một rạp
 * @param {number|string} cinemaId
 */
export const getCinemaRooms = (cinemaId) => {
  return axiosClient.get(`${CINEMAS_BASE}/${cinemaId}/rooms`);
};

/**
 * Tạo rạp mới (Admin only)
 * @param {{ name: string, address: string, province_id: number, image_urls?: string[] }} payload
 */
export const createCinema = (payload) => {
  return axiosClient.post(CINEMAS_BASE, payload);
};

/**
 * Cập nhật rạp (Admin only) — PATCH
 * @param {number|string} id
 * @param {{ name?: string, address?: string, province_id?: number, image_urls?: string[] }} payload
 */
export const updateCinema = (id, payload) => {
  return axiosClient.patch(`${CINEMAS_BASE}/${id}`, payload);
};

/**
 * Soft delete rạp (Admin only)
 * @param {number|string} id
 */
export const deleteCinema = (id) => {
  return axiosClient.delete(`${CINEMAS_BASE}/${id}`);
};
