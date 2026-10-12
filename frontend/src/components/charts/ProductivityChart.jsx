import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '@mui/material';

export const ProductivityChart = ({ data = [], height = 300 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const dates = data.map((d) => d.date?.slice(5) || d.date);
  const completed = data.map((d) => d.completed || 0);
  const pending = data.map((d) => d.pending || 0);

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#1E222B' : '#FFFFFF',
      borderColor: isDark ? '#2A2F3A' : '#E5E7EB',
      textStyle: { color: isDark ? '#F3F4F6' : '#111827' }
    },
    legend: {
      data: ['Completed', 'Pending'],
      textStyle: { color: isDark ? '#9CA3AF' : '#6B7280' },
      bottom: 0
    },
    grid: {
      top: '10%',
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB' } },
      axisLabel: { color: isDark ? '#9CA3AF' : '#6B7280' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: isDark ? '#262C36' : '#F3F4F6' } },
      axisLabel: { color: isDark ? '#9CA3AF' : '#6B7280' }
    },
    series: [
      {
        name: 'Completed',
        type: 'bar',
        stack: 'total',
        barWidth: '35%',
        data: completed,
        itemStyle: {
          color: '#10B981',
          borderRadius: [0, 0, 4, 4]
        }
      },
      {
        name: 'Pending',
        type: 'bar',
        stack: 'total',
        barWidth: '35%',
        data: pending,
        itemStyle: {
          color: '#F59E0B',
          borderRadius: [6, 6, 0, 0]
        }
      }
    ]
  };

  return (
    <ReactECharts
      option={option}
      style={{ height, width: '100%' }}
      opts={{ renderer: 'svg' }}
    />
  );
};
