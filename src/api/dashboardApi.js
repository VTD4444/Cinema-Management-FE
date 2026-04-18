import axiosClient from './axiosClient';

export const getDashboardData = (params = {}) => {
  return axiosClient.get('/dashboard', { params });
};

export const getDashboardSummary = (params = {}) => {
  return axiosClient.get('/dashboard/summary', { params });
};

export const getDashboardMonthlyRevenue = (params = {}) => {
  return axiosClient.get('/dashboard/monthly-revenue', { params });
};

export const getDashboardLatestBookings = (params = {}) => {
  return axiosClient.get('/dashboard/latest-bookings', { params });
};

export const getDashboardTopMovies = (params = {}) => {
  return axiosClient.get('/dashboard/top-movies', { params });
};

export const getDashboardTopCinemas = (params = {}) => {
  return axiosClient.get('/dashboard/top-cinemas', { params });
};

