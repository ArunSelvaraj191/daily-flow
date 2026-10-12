import { apiClient } from './client.js';

export const calendarApi = {
  getActivities: async (startDate, endDate, category = '', status = '') => {
    const params = { startDate, endDate };
    if (category) params.category = category;
    if (status) params.status = status;
    const res = await apiClient.get('/calendar/activities', { params });
    return res.data;
  }
};
