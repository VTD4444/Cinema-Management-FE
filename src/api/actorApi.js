import axiosClient from './axiosClient';

export const getActorsPublic = (params = {}) => {
  return axiosClient.get('/actors', { params });
};

export const getActorByIdPublic = (id) => {
  return axiosClient.get(`/actors/${id}`);
};
