import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '@mui/material';

export const PlannedVsActualChart = ({ data = [], height = 300 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const dates = data.map((d) => d.date?.slice(5) || d.date);
  const plannedHours = data.map((d) => Number((d.plannedMinutes / 60).toFixed(1)));
  const actualHours = data.map((d) => Number((d.trackedMinutes / 60).toFixed(1)));

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#1E222B' : '#FFFFFF',
      borderColor: isDark ? '#2A2F3A' : '#E5E7EB',
      textStyle: { color: isDark ? '#F3F4F6' : '#111827' },
      formatter: (params) => {
        let res = `<strong>${params[0].name}</strong><br/>`;
        params.forEach((p) => {
          res += `${p.marker} ${p.seriesName}: ${p.value} hrs<br/>`;
        });
        return res;
      }
    },
    legend: {
      data: ['Planned Hours', 'Actual Tracked Hours'],
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
      name: 'Hours',
      splitLine: { lineStyle: { color: isDark ? '#262C36' : '#F3F4F6' } },
      axisLabel: { color: isDark ? '#9CA3AF' : '#6B7280' }
    },
    series: [
      {
        name: 'Planned Hours',
        type: 'bar',
        barWidth: '28%',
        data: plannedHours,
        itemStyle: {
          color: '#9CA3AF',
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: 'Actual Tracked Hours',
        type: 'bar',
        barWidth: '28%',
        data: actualHours,
        itemStyle: {
          color: '#FF5722',
          borderRadius: [4, 4, 0, 0]
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
