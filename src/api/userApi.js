import axiosClient from './axiosClient';

/**
 * User API Endpoints
 */

export const createUser = (userData) => {
    return axiosClient.post('/users', userData);
};

export const getAllUsers = (params) => {
    return axiosClient.get('/users', { params });
};

export const getUserById = (id) => {
    return axiosClient.get(`/users/${id}`);
};

export const updateUser = (id, userData) => {
    return axiosClient.put(`/users/${id}`, userData);
};

/**
 * Cập nhật thông tin cá nhân cho user hiện tại
 * (backend userController.updateUser nhận full_name, phone, gender, dob)
 * @param {number|string} id
 * @param {{ full_name?: string, phone?: string, gender?: 'MALE'|'FEMALE', dob?: string|null }} payload
 */
export const updateMyProfile = (id, payload) => {
    return axiosClient.put(`/users/${id}`, payload);
};

export const deleteUser = (id) => {
    return axiosClient.delete(`/users/${id}`);
};
