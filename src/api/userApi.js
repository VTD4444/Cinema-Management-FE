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

export const deleteUser = (id) => {
    return axiosClient.delete(`/users/${id}`);
};
