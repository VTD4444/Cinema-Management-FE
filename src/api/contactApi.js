import axiosClient from './axiosClient';

const CONTACTS_BASE = '/contacts';

/**
 * Lấy danh sách phản hồi (Admin) - có phân trang
 * @param {{ pageNo?: number, pageSize?: number }} params
 */
export const getContacts = (params = {}) => {
  return axiosClient.get(CONTACTS_BASE, { params });
};

/**
 * Lấy chi tiết phản hồi theo ID
 * @param {number|string} id
 */
export const getContactById = (id) => {
  return axiosClient.get(`${CONTACTS_BASE}/${id}`);
};

/**
 * Soft delete phản hồi
 * @param {number|string} id
 */
export const deleteContact = (id) => {
  return axiosClient.delete(`${CONTACTS_BASE}/${id}`);
};

/**
 * Admin phản hồi contact (chuyển trạng thái PROCESSING)
 * @param {number|string} id
 * @param {{ replyMessage: string }} payload
 */
export const replyContact = (id, payload) => {
  return axiosClient.put(`${CONTACTS_BASE}/${id}/reply`, payload);
};

/**
 * Đánh dấu contact là đã giải quyết (RESOLVED)
 * @param {number|string} id
 */
export const resolveContact = (id) => {
  return axiosClient.put(`${CONTACTS_BASE}/${id}/resolve`);
};
