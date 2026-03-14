import axiosClient from './axiosClient';

/**
 * Đăng nhập
 * @param {{ email: string, password: string }} payload
 */
export const login = (payload) => {
  return axiosClient.post('/auth/login', payload);
};
