import { apiClient } from './client.js';

export const reportsApi = {
  getDaily: async (date = '') => {
    const res = await apiClient.get('/reports/daily', { params: date ? { date } : {} });
    return res.data;
  },
  getWeekly: async (startDate = '', endDate = '') => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const res = await apiClient.get('/reports/weekly', { params });
    return res.data;
  },
  getMonthly: async (month = '') => {
    const res = await apiClient.get('/reports/monthly', { params: month ? { month } : {} });
    return res.data;
  },
  getAIInsights: async () => {
    const res = await apiClient.get('/reports/ai-insights');
    return res.data;
  },
  downloadCSV: async (startDate = '', endDate = '') => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const res = await apiClient.get('/reports/export.csv', {
      params,
      responseType: 'blob'
    });
    
    // Create download trigger
    const blob = new Blob([res.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dailyflow_report_${startDate || 'all'}_${endDate || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};
