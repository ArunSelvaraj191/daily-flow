import { apiClient } from './client.js';

export const dashboardApi = {
  getSummary: async (params = {}) => {
    const res = await apiClient.get('/dashboard/summary', { params });
    return res.data;
  },
  getActivityTrends: async (days = 7) => {
    const res = await apiClient.get('/dashboard/activity-trends', { params: { days } });
    return res.data;
  },
  getTimeDistribution: async (params = {}) => {
    const res = await apiClient.get('/dashboard/time-distribution', { params });
    return res.data;
  }
};
