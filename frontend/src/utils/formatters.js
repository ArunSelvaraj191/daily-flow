import dayjs from 'dayjs';

export const formatDuration = (minutes = 0) => {
  if (!minutes || minutes <= 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
};

export const formatTimerSeconds = (totalSeconds = 0) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  const pad = (n) => String(n).padStart(2, '0');
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
};

export const formatDate = (dateStr, format = 'MMM D, YYYY') => {
  if (!dateStr) return '';
  return dayjs(dateStr).format(format);
};

export const formatPercentage = (val = 0) => {
  return `${Number(val || 0).toFixed(1)}%`;
};
