import axiosClient from './axiosClient';

/**
 * Lấy danh sách đồ ăn/thức uống cho Admin (có phân trang)
 * @param {{ pageNo?: number, pageSize?: number }} params
 */
export const getFoodsAdmin = (params = {}) => {
  return axiosClient.get('/foods/admin', { params });
};

/**
 * Lấy danh sách đồ ăn/thức uống cho User
 */
export const getFoods = () => {
  return axiosClient.get('/foods');
};

/**
 * Lấy chi tiết một món đồ ăn/thức uống
 * @param {number|string} id
 */
export const getFoodById = (id) => {
  return axiosClient.get(`/foods/${id}`);
};

/**
 * Tạo món đồ ăn/thức uống mới (Admin)
 * @param {{ name: string, image_url: string, description: string, price: number, stock_quantity: number, is_available: boolean }} payload
 */
export const createFood = (payload) => {
  return axiosClient.post('/foods', payload);
};

/**
 * Cập nhật món đồ ăn/thức uống (Admin)
 * @param {number|string} id
 * @param {{ name: string, image_url: string, description: string, price: number, stock_quantity: number, is_available: boolean }} payload
 */
export const updateFood = (id, payload) => {
  return axiosClient.put(`/foods/${id}`, payload);
};

/**
 * Xóa mềm món đồ ăn/thức uống (Admin)
 * @param {number|string} id
 */
export const deleteFood = (id) => {
  return axiosClient.delete(`/foods/${id}`);
};
