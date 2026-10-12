import { apiClient } from './client.js';

export const goalsApi = {
  list: async (status = '') => {
    const res = await apiClient.get('/goals', { params: status ? { status } : {} });
    return res.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/goals/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/goals', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await apiClient.patch(`/goals/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/goals/${id}`);
    return res.data;
  }
};
