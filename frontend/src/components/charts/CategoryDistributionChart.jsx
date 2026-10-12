import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '@mui/material';
import { CATEGORY_COLORS } from '../../utils/constants.js';

export const CategoryDistributionChart = ({ data = [], height = 300 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.minutes,
    itemStyle: {
      color: CATEGORY_COLORS[item.category] || '#6B7280'
    }
  }));

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} mins ({d}%)',
      backgroundColor: isDark ? '#1E222B' : '#FFFFFF',
      borderColor: isDark ? '#2A2F3A' : '#E5E7EB',
      textStyle: { color: isDark ? '#F3F4F6' : '#111827' }
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      textStyle: { color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 11 }
    },
    series: [
      {
        name: 'Category Time',
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: isDark ? '#181B20' : '#FFFFFF',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 13,
            fontWeight: 'bold',
            formatter: '{b}\n{d}%'
          }
        },
        data: chartData.length > 0 ? chartData : [{ name: 'No time logged', value: 0, itemStyle: { color: '#E5E7EB' } }]
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
