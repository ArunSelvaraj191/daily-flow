import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  ButtonGroup,
  IconButton,
  Grid,
  Chip,
  MenuItem,
  TextField,
  Tooltip,
  Divider,
  Paper
} from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import dayjs from 'dayjs';

import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { ActivityFormDialog } from '../../components/forms/ActivityFormDialog.jsx';
import { StatusChip } from '../../components/common/StatusChip.jsx';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { calendarApi } from '../../api/calendar.api.js';
import { activitiesApi } from '../../api/activities.api.js';
import { CATEGORIES, STATUSES } from '../../utils/constants.js';
import { formatDuration } from '../../utils/formatters.js';

export const CalendarPage = () => {
  const [view, setView] = useState('month'); // 'month' | 'week' | 'day'
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form modal
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDateForNew, setSelectedDateForNew] = useState(null);

  const calculateDateRange = useCallback(() => {
    if (view === 'month') {
      const start = currentDate.startOf('month').startOf('week');
      const end = currentDate.endOf('month').endOf('week');
      return { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') };
    }
    if (view === 'week') {
      const start = currentDate.startOf('week');
      const end = currentDate.endOf('week');
      return { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') };
    }
    // Day view
    const d = currentDate.format('YYYY-MM-DD');
    return { start: d, end: d };
  }, [view, currentDate]);

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { start, end } = calculateDateRange();
      const res = await calendarApi.getActivities(start, end, categoryFilter, statusFilter);
      setActivities(res || []);
    } catch (err) {
      setError(err.message || 'Failed to load calendar activities');
    } finally {
      setLoading(false);
    }
  }, [calculateDateRange, categoryFilter, statusFilter]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handlePrev = () => {
    if (view === 'month') setCurrentDate((d) => d.subtract(1, 'month'));
    else if (view === 'week') setCurrentDate((d) => d.subtract(1, 'week'));
    else setCurrentDate((d) => d.subtract(1, 'day'));
  };

  const handleNext = () => {
    if (view === 'month') setCurrentDate((d) => d.add(1, 'month'));
    else if (view === 'week') setCurrentDate((d) => d.add(1, 'week'));
    else setCurrentDate((d) => d.add(1, 'day'));
  };

  const handleToday = () => {
    setCurrentDate(dayjs());
  };

  const handleDayClick = (dateStr) => {
    setSelectedDateForNew(dateStr);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    await activitiesApi.create(formData);
    loadActivities();
  };

  // Group activities by date
  const activitiesByDate = activities.reduce((acc, act) => {
    const d = act.activityDate;
    if (!acc[d]) acc[d] = [];
    acc[d].push(act);
    return acc;
  }, {});

  const renderMonthView = () => {
    const start = currentDate.startOf('month').startOf('week');
    const end = currentDate.endOf('month').endOf('week');

    const days = [];
    let day = start;
    while (day.isBefore(end) || day.isSame(end, 'day')) {
      days.push(day);
      day = day.add(1, 'day');
    }

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        {/* Weekday headers */}
        <Grid container sx={{ bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
          {weekdays.map((w) => (
            <Grid size={{ xs: 12 / 7 }} key={w} sx={{ py: 1.2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                {w}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Days Grid */}
        <Grid container>
          {days.map((d) => {
            const dateStr = d.format('YYYY-MM-DD');
            const isToday = d.isSame(dayjs(), 'day');
            const isCurrentMonth = d.isSame(currentDate, 'month');
            const dayActs = activitiesByDate[dateStr] || [];

            return (
              <Grid
                size={{ xs: 12 / 7 }}
                key={dateStr}
                onClick={() => handleDayClick(dateStr)}
                sx={{
                  minHeight: 115,
                  p: 1,
                  borderRight: '1px solid',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: isToday
                    ? 'rgba(255, 87, 34, 0.04)'
                    : isCurrentMonth
                    ? 'background.paper'
                    : 'action.hover',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  '&:hover': { bgcolor: 'action.selected' },
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: isToday ? 800 : 600,
                      color: isToday ? 'primary.main' : isCurrentMonth ? 'text.primary' : 'text.secondary',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: isToday ? 'primary.main' : 'transparent',
                      color: isToday ? '#FFF' : 'inherit'
                    }}
                  >
                    {d.date()}
                  </Typography>

                  {dayActs.length > 0 && (
                    <Chip
                      size="small"
                      label={dayActs.length}
                      sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1, overflow: 'hidden' }}>
                  {dayActs.slice(0, 3).map((act) => (
                    <Box
                      key={act.id}
                      sx={{
                        p: 0.4,
                        px: 0.8,
                        borderRadius: 1.5,
                        bgcolor: act.status === 'Completed' ? 'success.light' : 'primary.light',
                        color: '#FFF',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {act.title}
                    </Box>
                  ))}
                  {dayActs.length > 3 && (
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                      +{dayActs.length - 3} more
                    </Typography>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  const renderWeekOrDayView = () => {
    const isWeek = view === 'week';
    const days = isWeek
      ? Array.from({ length: 7 }).map((_, i) => currentDate.startOf('week').add(i, 'day'))
      : [currentDate];

    return (
      <Grid container spacing={2}>
        {days.map((d) => {
          const dateStr = d.format('YYYY-MM-DD');
          const isToday = d.isSame(dayjs(), 'day');
          const dayActs = activitiesByDate[dateStr] || [];

          return (
            <Grid size={{ xs: 12, md: isWeek ? 12 / 7 : 12 }} key={dateStr}>
              <Card sx={{ height: '100%', borderColor: isToday ? 'primary.main' : 'divider' }}>
                <CardHeader
                  title={d.format(isWeek ? 'ddd, MMM D' : 'dddd, MMMM D, YYYY')}
                  titleTypographyProps={{ variant: 'subtitle2', fontWeight: 700, color: isToday ? 'primary.main' : 'inherit' }}
                  action={
                    <IconButton size="small" onClick={() => handleDayClick(dateStr)}>
                      <AddRoundedIcon fontSize="small" />
                    </IconButton>
                  }
                  sx={{ py: 1.2, px: 2, bgcolor: isToday ? 'rgba(255, 87, 34, 0.06)' : 'action.hover' }}
                />
                <Divider />
                <CardContent sx={{ p: 1.5, minHeight: 200, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {dayActs.length === 0 ? (
                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', py: 4, display: 'block' }}>
                      No activities
                    </Typography>
                  ) : (
                    dayActs.map((act) => (
                      <Paper
                        key={act.id}
                        elevation={0}
                        sx={{
                          p: 1.2,
                          borderRadius: 2,
                          bgcolor: 'action.hover',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {act.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.5, flexWrap: 'wrap' }}>
                          <StatusChip status={act.status} />
                          <Typography variant="caption" color="text.secondary">
                            {formatDuration(act.plannedDuration)}
                          </Typography>
                        </Box>
                      </Paper>
                    ))
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <Box>
      <PageHeader
        title="Calendar Schedule"
        subtitle="Visualize and structure scheduled activities across days, weeks, and months"
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <ButtonGroup size="small" variant="outlined">
              <Button onClick={() => setView('month')} variant={view === 'month' ? 'contained' : 'outlined'}>Month</Button>
              <Button onClick={() => setView('week')} variant={view === 'week' ? 'contained' : 'outlined'}>Week</Button>
              <Button onClick={() => setView('day')} variant={view === 'day' ? 'contained' : 'outlined'}>Day</Button>
            </ButtonGroup>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddRoundedIcon />}
              onClick={() => {
                setSelectedDateForNew(dayjs().format('YYYY-MM-DD'));
                setFormOpen(true);
              }}
              sx={{ borderRadius: 2.5 }}
            >
              Add Activity
            </Button>
          </Box>
        }
      />

      {/* Navigation & Filters Bar */}
      <Card sx={{ mb: 3, p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          {/* Previous / Today / Next */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={handlePrev}>
              <ChevronLeftRoundedIcon />
            </IconButton>
            <Button size="small" variant="outlined" color="inherit" onClick={handleToday} startIcon={<TodayRoundedIcon />}>
              Today
            </Button>
            <IconButton size="small" onClick={handleNext}>
              <ChevronRightRoundedIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 800, ml: 1 }}>
              {currentDate.format(view === 'month' ? 'MMMM YYYY' : 'MMM D, YYYY')}
            </Typography>
          </Box>

          {/* Quick Filters */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TextField
              size="small"
              select
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">All</MenuItem>
              {CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">All</MenuItem>
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>
      </Card>

      {error && <ErrorState message={error} onRetry={loadActivities} />}

      {loading ? (
        <LoadingSkeleton count={7} />
      ) : view === 'month' ? (
        renderMonthView()
      ) : (
        renderWeekOrDayView()
      )}

      {/* New Activity Dialog */}
      <ActivityFormDialog
        open={formOpen}
        initialData={selectedDateForNew ? { activityDate: selectedDateForNew } : null}
        onClose={() => {
          setFormOpen(false);
          setSelectedDateForNew(null);
        }}
        onSubmit={handleFormSubmit}
      />
    </Box>
  );
};
