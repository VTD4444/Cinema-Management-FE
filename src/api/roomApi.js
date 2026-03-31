import axiosClient from './axiosClient';
import { withoutSoftDeleted } from '../utils/withoutSoftDeleted';

/**
 * API phòng chiếu (CinemaRooms trong DB)
 * Schema DB hiện tại: id, cinema_id, name, created_at, updated_at
 * Các trường room_type, seat_count, format, status cần bổ sung vào DB (migration) để khớp UI.
 */

const ROOMS_BASE = '/cinema-rooms';

/** GET /cinema-rooms trả { data: { items, pageNo, ... } } */
export const getRoomListFromResponse = (res) => {
  const d = res?.data;
  let list = [];
  if (Array.isArray(d?.items)) list = d.items;
  else if (Array.isArray(d)) list = d;
  else if (Array.isArray(res)) list = res;
  return withoutSoftDeleted(list);
};

/**
 * Lấy danh sách phòng chiếu theo rạp
 * @param {{ cinema_id?: number|string, pageNo?: number, pageSize?: number }} params
 */
export const getRooms = (params = {}) => {
  return axiosClient.get(ROOMS_BASE, { params });
};

/**
 * Lấy chi tiết một phòng
 * @param {number|string} id
 */
export const getRoomById = (id) => {
  return axiosClient.get(`${ROOMS_BASE}/${id}`);
};

/**
 * Tạo phòng chiếu mới
 * @param {{ cinema_id: number, name: string, room_type: string, seat_count: number, format: string, status?: string }} payload
 */
export const createRoom = (payload) => {
  return axiosClient.post(ROOMS_BASE, payload);
};

/**
 * Cập nhật phòng chiếu
 * @param {number|string} id
 * @param {Object} payload
 */
export const updateRoom = (id, payload) => {
  return axiosClient.put(`${ROOMS_BASE}/${id}`, payload);
};

/**
 * Xóa phòng chiếu
 * @param {number|string} id
 */
export const deleteRoom = (id) => {
  return axiosClient.delete(`${ROOMS_BASE}/${id}`);
};
