import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // You can get token from store or localStorage here
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosClient.interceptors.response.use(
  (response) => {
    // any status code in the 2xx range
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    // any status code outside 2xx
    if (error.response && error.response.status === 401) {
      // Handle unauthorized error and redirect based on current route context
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');

      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const isAdminArea = currentPath.startsWith('/admin');

      // Avoid redirect loops when already on login pages
      const isAlreadyOnAdminLogin = currentPath === '/admin/login';
      const isAlreadyOnUserLogin = currentPath === '/login';

      if (isAdminArea) {
        if (!isAlreadyOnAdminLogin) {
          window.location.href = '/admin/login';
        }
      } else if (!isAlreadyOnUserLogin) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
