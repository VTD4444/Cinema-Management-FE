import axios from 'axios';
import { AUTH_REALM, getAccessToken, getAuthRealmFromPath } from '../store/authSession';
import useUserAuthStore from '../store/useUserAuthStore';
import useAdminAuthStore from '../store/useAdminAuthStore';
import { isUserAuthRequiredRoute } from '../utils/authRoutes';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const realm = getAuthRealmFromPath(pathname);
    const token = getAccessToken(realm);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const isAdminArea = currentPath.startsWith('/admin');
      const realm = isAdminArea ? AUTH_REALM.ADMIN : AUTH_REALM.USER;

      if (realm === AUTH_REALM.ADMIN) {
        useAdminAuthStore.getState().logout();
      } else {
        useUserAuthStore.getState().logout();
      }

      const isAlreadyOnAdminLogin = currentPath === '/admin/login';
      const isAlreadyOnUserLogin = currentPath === '/login';

      if (isAdminArea) {
        if (!isAlreadyOnAdminLogin) {
          window.location.href = '/admin/login';
        }
      } else if (isUserAuthRequiredRoute(currentPath) && !isAlreadyOnUserLogin) {
        const returnUrl = encodeURIComponent(`${currentPath}${window.location.search || ''}`);
        window.location.href = `/login?returnUrl=${returnUrl}`;
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
