import { apiClient } from './client.js';

export const habitsApi = {
  list: async (activeOnly = false) => {
    const res = await apiClient.get('/habits', { params: { activeOnly } });
    return res.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/habits', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await apiClient.patch(`/habits/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/habits/${id}`);
    return res.data;
  },
  logCompletion: async (id, data) => {
    const res = await apiClient.post(`/habits/${id}/logs`, data);
    return res.data;
  },
  getHistory: async (id, params = {}) => {
    const res = await apiClient.get(`/habits/${id}/history`, { params });
    return res.data;
  }
};
