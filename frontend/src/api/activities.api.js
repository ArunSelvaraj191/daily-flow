import { apiClient } from './client.js';

export const activitiesApi = {
  list: async (params = {}) => {
    const res = await apiClient.get('/activities', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/activities/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/activities', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await apiClient.patch(`/activities/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/activities/${id}`);
    return res.data;
  },
  toggleComplete: async (id) => {
    const res = await apiClient.post(`/activities/${id}/complete`);
    return res.data;
  }
};
