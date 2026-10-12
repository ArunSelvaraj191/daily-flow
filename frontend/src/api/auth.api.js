import { apiClient } from './client.js';

export const authApi = {
  register: async (data) => {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },
  login: async (credentials) => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },
  logout: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await apiClient.patch('/auth/profile', data);
    return res.data;
  },
  changePassword: async (data) => {
    const res = await apiClient.post('/auth/change-password', data);
    return res.data;
  }
};
