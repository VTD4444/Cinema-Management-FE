import axiosClient from './axiosClient';

/**
 * Đăng nhập (user + admin)
 * @param {{ email: string, password: string }} payload
 */
export const login = (payload) => {
  return axiosClient.post('/auth/login', payload);
};

/**
 * Đăng ký user
 * @param {{ full_name: string, email: string, phone: string, password: string, confirm_password: string }} payload
 */
export const register = (payload) => {
  return axiosClient.post('/auth/register', payload);
};

/**
 * Bước 1 – Gửi email quên mật khẩu
 * @param {{ email: string }} payload
 */
export const forgotPassword = (payload) => {
  return axiosClient.post('/auth/forgot-password', payload);
};

/**
 * Bước 2 – Xác thực OTP
 * @param {{ email: string, otp: string }} payload
 */
export const verifyOtp = (payload) => {
  return axiosClient.post('/auth/forgot-password/verify-otp', payload);
};

/**
 * Bước 3 – Đặt lại mật khẩu
 * @param {{ resetToken: string, newPassword: string, confirmPassword: string }} payload
 */
export const resetPassword = (payload) => {
  return axiosClient.post('/auth/forgot-password/reset-password', payload);
};

/**
 * Lấy thông tin người dùng hiện tại
 */
export const getMyInfo = () => {
  return axiosClient.get('/auth/myInfo');
};

/**
 * Đổi mật khẩu (đã đăng nhập)
 * @param {{ currentPassword: string, newPassword: string, confirmPassword: string }} payload
 */
export const changePassword = (payload) => {
  return axiosClient.put('/auth/change-password', payload);
};

/**
 * Lấy thông tin profile (alias cho getMyInfo)
 */
export const getMyProfile = () => {
  return axiosClient.get('/auth/myInfo');
};
