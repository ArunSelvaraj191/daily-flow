import { apiClient } from './client.js';

export const timersApi = {
  getActive: async () => {
    const res = await apiClient.get('/timers/active');
    return res.data;
  },
  start: async (activityId, notes = '') => {
    const res = await apiClient.post('/timers/start', { activityId, notes });
    return res.data;
  },
  pause: async (sessionId) => {
    const res = await apiClient.post(`/timers/${sessionId}/pause`);
    return res.data;
  },
  resume: async (sessionId) => {
    const res = await apiClient.post(`/timers/${sessionId}/resume`);
    return res.data;
  },
  stop: async (sessionId) => {
    const res = await apiClient.post(`/timers/${sessionId}/stop`);
    return res.data;
  }
};
