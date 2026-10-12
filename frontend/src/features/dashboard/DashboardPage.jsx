import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import dayjs from 'dayjs';

import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { SummaryCard } from './SummaryCard.jsx';
import { ProductivityChart } from '../../components/charts/ProductivityChart.jsx';
import { CategoryDistributionChart } from '../../components/charts/CategoryDistributionChart.jsx';
import { PlannedVsActualChart } from '../../components/charts/PlannedVsActualChart.jsx';
import { StatusChip } from '../../components/common/StatusChip.jsx';
import { PriorityChip } from '../../components/common/PriorityChip.jsx';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { ActivityFormDialog } from '../../components/forms/ActivityFormDialog.jsx';

import { dashboardApi } from '../../api/dashboard.api.js';
import { activitiesApi } from '../../api/activities.api.js';
import { reportsApi } from '../../api/reports.api.js';
import { startTimer } from '../timers/timerSlice.js';
import { createActivity } from '../activities/activitiesSlice.js';
import { formatDuration } from '../../utils/formatters.js';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [preset, setPreset] = useState('this_week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [todaysTasks, setTodaysTasks] = useState([]);

  // Create Activity modal state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const todayStr = dayjs().format('YYYY-MM-DD');

      const [summaryRes, trendsRes, distRes, insightsRes, todayTasksRes] = await Promise.all([
        dashboardApi.getSummary({ preset }),
        dashboardApi.getActivityTrends(7),
        dashboardApi.getTimeDistribution({ preset }),
        reportsApi.getAIInsights().catch(() => null),
        activitiesApi.list({ date: todayStr, pageSize: 6 })
      ]);

      setSummary(summaryRes);
      setTrends(trendsRes);
      setDistribution(distRes);
      setAiInsights(insightsRes);
      setTodaysTasks(todayTasksRes.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, [preset]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleStartTimer = (activityId) => {
    dispatch(startTimer({ activityId }));
  };

  const handleCreateActivitySubmit = async (data) => {
    await dispatch(createActivity(data));
    loadDashboardData();
  };

  return (
    <Box>
      <PageHeader
        title="Productivity Dashboard"
        subtitle="Track focus, analyze distribution, and crush your daily objectives"
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <ToggleButtonGroup
              size="small"
              value={preset}
              exclusive
              onChange={(_, val) => val && setPreset(val)}
              sx={{ bgcolor: 'background.paper', borderRadius: 2.5 }}
            >
              <ToggleButton value="today" sx={{ px: 1.5, fontWeight: 600 }}>Today</ToggleButton>
              <ToggleButton value="yesterday" sx={{ px: 1.5, fontWeight: 600 }}>Yesterday</ToggleButton>
              <ToggleButton value="this_week" sx={{ px: 1.5, fontWeight: 600 }}>This Week</ToggleButton>
              <ToggleButton value="this_month" sx={{ px: 1.5, fontWeight: 600 }}>This Month</ToggleButton>
            </ToggleButtonGroup>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddRoundedIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{ borderRadius: 2.5, px: 2 }}
            >
              New Activity
            </Button>
          </Box>
        }
      />

      {error && <ErrorState message={error} onRetry={loadDashboardData} />}

      {loading && !summary ? (
        <LoadingSkeleton type="cards" count={4} />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          {/* Top Metric Cards */}
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Completion Rate"
                value={`${summary?.completionRate || 0}%`}
                subtitle={`${summary?.completedActivities || 0} of ${summary?.totalActivities || 0} activities finished`}
                icon={CheckCircleOutlineRoundedIcon}
                color="#10B981"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Productive Time"
                value={`${summary?.productiveHours || 0}h`}
                subtitle={`${formatDuration(summary?.totalTimeTrackedMinutes || 0)} actual vs ${formatDuration(summary?.plannedTimeMinutes || 0)} planned`}
                icon={AccessTimeRoundedIcon}
                color="#FF5722"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Habit Streak"
                value={`${summary?.activeHabitStreak || 0} days`}
                subtitle="Best active streak across recurring habits"
                icon={LocalFireDepartmentRoundedIcon}
                color="#F59E0B"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Goal Progress"
                value={`${summary?.goalCompletionRate || 0}%`}
                subtitle={`${summary?.activeGoalsCount || 0} active personal & work targets`}
                icon={FlagRoundedIcon}
                color="#3B82F6"
              />
            </Grid>
          </Grid>

          {/* AI Grounded Insights & Today's Agenda Row */}
          <Grid container spacing={2.5}>
            {/* AI Productivity Summary Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
                <CardHeader
                  avatar={
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2.5,
                        bgcolor: 'rgba(255, 87, 34, 0.12)',
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <AutoAwesomeRoundedIcon fontSize="small" />
                    </Box>
                  }
                  title="Daily AI Flow Review"
                  titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
                  subheader="Grounded in your real activity statistics"
                />
                <Divider />
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.6, fontWeight: 500 }}>
                    {aiInsights?.summary || 'Log activities and run the timer to unlock personalized AI productivity feedback.'}
                  </Typography>

                  {aiInsights?.strengths?.length > 0 && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main', display: 'block', mb: 0.5 }}>
                        HIGHLIGHTS
                      </Typography>
                      {aiInsights.strengths.slice(0, 2).map((st, i) => (
                        <Typography key={i} variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.3 }}>
                          • {st}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  {aiInsights?.quoteOfTheDay && (
                    <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'action.hover', borderLeft: '3px solid #FF5722' }}>
                      <Typography variant="caption" sx={{ fontStyle: 'italic', fontWeight: 600 }}>
                        {aiInsights.quoteOfTheDay}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Today's Focus Tasks Widget */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardHeader
                  title="Today's Focus Tasks"
                  titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
                  action={
                    <Button
                      size="small"
                      endIcon={<ArrowForwardRoundedIcon />}
                      onClick={() => navigate('/activities')}
                    >
                      View All
                    </Button>
                  }
                />
                <Divider />
                <CardContent sx={{ p: 2 }}>
                  {todaysTasks.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No activities scheduled for today yet.
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        sx={{ mt: 1.5, borderRadius: 2 }}
                        onClick={() => setCreateDialogOpen(true)}
                      >
                        Schedule First Activity
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                      {todaysTasks.map((t) => (
                        <Box
                          key={t.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1.5,
                            borderRadius: 2.5,
                            bgcolor: 'action.hover',
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: 'action.selected' }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                            <Box sx={{ overflow: 'hidden' }}>
                              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                                {t.title}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.3 }}>
                                <StatusChip status={t.status} />
                                <PriorityChip priority={t.priority} />
                                <Typography variant="caption" color="text.secondary">
                                  {formatDuration(t.plannedDuration)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          <Tooltip title="Start Focus Timer">
                            <IconButton
                              size="small"
                              onClick={() => handleStartTimer(t.id)}
                              sx={{
                                bgcolor: 'primary.main',
                                color: '#FFF',
                                '&:hover': { bgcolor: 'primary.dark' }
                              }}
                            >
                              <PlayArrowRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Interactive Apache ECharts Section */}
          <Grid container spacing={2.5}>
            {/* Trend Chart */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card sx={{ height: '100%' }}>
                <CardHeader
                  title="Activity Completion Trends"
                  titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
                  subheader="Past 7 days performance breakdown"
                />
                <Divider />
                <CardContent sx={{ pt: 1 }}>
                  <ProductivityChart data={trends} height={290} />
                </CardContent>
              </Card>
            </Grid>

            {/* Category Pie Chart */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardHeader
                  title="Time by Category"
                  titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
                  subheader="Distribution of recorded focus"
                />
                <Divider />
                <CardContent sx={{ pt: 1 }}>
                  <CategoryDistributionChart data={distribution} height={290} />
                </CardContent>
              </Card>
            </Grid>

            {/* Planned vs Actual Duration Chart */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader
                  title="Planned vs. Actual Duration"
                  titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
                  subheader="Evaluate estimation accuracy across past days"
                />
                <Divider />
                <CardContent sx={{ pt: 1 }}>
                  <PlannedVsActualChart data={trends} height={280} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Activity Create Modal */}
      <ActivityFormDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateActivitySubmit}
      />
    </Box>
  );
};
