import axiosClient from './axiosClient';

/**
 * API ghế ngồi (Seats trong DB)
 * Backend ENUM: STANDARD | VIP | COUPLE — FE form dùng chữ thường, map tại đây.
 */

const SEATS_BASE = '/seats';

const FE_TO_DB_SEAT_TYPE = {
  standard: 'STANDARD',
  vip: 'VIP',
  couple: 'COUPLE',
};

/** Chuẩn hóa type gửi lên API (khớp ENUM DB) */
export function toApiSeatType(type) {
  if (type == null || type === '') return 'STANDARD';
  const key = String(type).trim().toLowerCase();
  if (FE_TO_DB_SEAT_TYPE[key]) return FE_TO_DB_SEAT_TYPE[key];
  const up = String(type).trim().toUpperCase();
  if (up === 'STANDARD' || up === 'VIP' || up === 'COUPLE') return up;
  return up;
}

/** Chuẩn hóa type từ API/DB về key UI: standard | vip | couple */
export function normalizeSeatTypeForUi(type) {
  const up = String(type || '').trim().toUpperCase();
  if (up === 'VIP') return 'vip';
  if (up === 'COUPLE') return 'couple';
  return 'standard';
}

/**
 * Import ghế từ Excel — POST /seats/import-excel, field multipart: file
 * Backend: sheet 1 cột room_id, row_label, number, type (optional)
 */
export const importSeatsFromExcel = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axiosClient.post(`${SEATS_BASE}/import-excel`, formData, {
    transformRequest: [
      (data, headers) => {
        delete headers['Content-Type'];
        return data;
      },
    ],
  });
};

/**
 * Lấy danh sách ghế (theo phòng, phân trang, tìm kiếm)
 * @param {{ room_id?: number, page?: number, limit?: number, search?: string, type?: string }} params
 */
export const getSeats = (params = {}) => {
  const p = { ...params };
  if (p.type != null && p.type !== '') p.type = toApiSeatType(p.type);
  return axiosClient.get(SEATS_BASE, { params: p });
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
 * @param {{ room_id: number, row_label: string, number: number, type?: 'standard'|'vip'|'couple', is_active?: boolean }} payload
 */
export const createSeat = (payload) => {
  const body = { ...payload, type: toApiSeatType(payload?.type) };
  return axiosClient.post(SEATS_BASE, body);
};

/**
 * Cập nhật ghế
 * @param {number|string} id
 * @param {Object} payload
 */
export const updateSeat = (id, payload) => {
  const body = { ...payload };
  if (Object.prototype.hasOwnProperty.call(body, 'type')) {
    body.type = toApiSeatType(body.type);
  }
  return axiosClient.patch(`${SEATS_BASE}/${id}`, body);
};

/**
 * Xóa ghế
 * @param {number|string} id
 */
export const deleteSeat = (id) => {
  return axiosClient.delete(`${SEATS_BASE}/${id}`);
};
