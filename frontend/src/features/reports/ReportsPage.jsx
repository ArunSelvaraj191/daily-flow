import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  ButtonGroup,
  Grid,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import dayjs from 'dayjs';

import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { SummaryCard } from '../dashboard/SummaryCard.jsx';
import { CategoryDistributionChart } from '../../components/charts/CategoryDistributionChart.jsx';
import { StatusChip } from '../../components/common/StatusChip.jsx';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { reportsApi } from '../../api/reports.api.js';
import { formatDuration } from '../../utils/formatters.js';

export const ReportsPage = () => {
  const [reportType, setReportType] = useState('weekly'); // 'daily' | 'weekly' | 'monthly'
  const [reportData, setReportData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [repRes, aiRes] = await Promise.all([
        reportType === 'daily'
          ? reportsApi.getDaily()
          : reportType === 'weekly'
          ? reportsApi.getWeekly()
          : reportsApi.getMonthly(),
        reportsApi.getAIInsights().catch(() => null)
      ]);

      setReportData(repRes);
      setAiInsights(aiRes);
    } catch (err) {
      setError(err.message || 'Failed to load productivity report');
    } finally {
      setLoading(false);
    }
  }, [reportType]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleDownloadCSV = async () => {
    try {
      setExporting(true);
      await reportsApi.downloadCSV();
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Analytics & Productivity Reports"
        subtitle="Deep dive into your activity patterns, time allocation, and historical consistency"
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <ButtonGroup size="small" variant="outlined">
              <Button onClick={() => setReportType('daily')} variant={reportType === 'daily' ? 'contained' : 'outlined'}>Daily</Button>
              <Button onClick={() => setReportType('weekly')} variant={reportType === 'weekly' ? 'contained' : 'outlined'}>Weekly</Button>
              <Button onClick={() => setReportType('monthly')} variant={reportType === 'monthly' ? 'contained' : 'outlined'}>Monthly</Button>
            </ButtonGroup>

            <Button
              variant="contained"
              color="primary"
              startIcon={<FileDownloadRoundedIcon />}
              onClick={handleDownloadCSV}
              disabled={exporting}
              sx={{ borderRadius: 2.5 }}
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          </Box>
        }
      />

      {error && <ErrorState message={error} onRetry={loadReport} />}

      {loading ? (
        <LoadingSkeleton type="cards" count={4} />
      ) : !reportData ? null : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          {/* Summary Row */}
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Completion Rate"
                value={`${reportData.completionRate || 0}%`}
                subtitle={`${reportData.completedActivitiesCount || 0} completed of ${reportData.totalActivitiesCount || reportData.plannedActivitiesCount || 0}`}
                icon={CheckCircleOutlineRoundedIcon}
                color="#10B981"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Total Time Tracked"
                value={formatDuration(reportData.totalTrackedMinutes || reportData.actualTrackedMinutes || 0)}
                subtitle={`Planned: ${formatDuration(reportData.totalPlannedMinutes || reportData.plannedMinutes || 0)}`}
                icon={AccessTimeRoundedIcon}
                color="#FF5722"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Habit Consistency"
                value={`${reportData.habitConsistencyRate || reportData.habitCompletionRate || 0}%`}
                subtitle="Recurring habits completed on schedule"
                color="#8B5CF6"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Period Status"
                value={reportType.toUpperCase()}
                subtitle={
                  reportType === 'daily'
                    ? reportData.date
                    : reportType === 'weekly'
                    ? `${reportData.startDate} to ${reportData.endDate}`
                    : reportData.month
                }
                color="#3B82F6"
              />
            </Grid>
          </Grid>

          {/* AI Productivity Analysis & Category Breakdown */}
          <Grid container spacing={2.5}>
            {/* AI Insights Card */}
            <Grid size={{ xs: 12, lg: 7 }}>
              <Card sx={{ height: '100%' }}>
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
                  title="AI Grounded Productivity Assessment"
                  titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
                  subheader="Grounded observations based entirely on your recorded metrics"
                />
                <Divider />
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {aiInsights?.summary || 'No activities recorded yet for deep analysis.'}
                  </Typography>

                  {aiInsights?.actionableSuggestions?.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block', mb: 0.5 }}>
                        ACTIONABLE RECOMMENDATIONS
                      </Typography>
                      {aiInsights.actionableSuggestions.map((sug, i) => (
                        <Typography key={i} variant="body2" sx={{ display: 'block', mb: 0.6 }}>
                          • {sug}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  {aiInsights?.areasForImprovement?.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                        AREAS TO OPTIMIZE
                      </Typography>
                      {aiInsights.areasForImprovement.map((imp, i) => (
                        <Typography key={i} variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.3 }}>
                          • {imp}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Category Breakdown */}
            <Grid size={{ xs: 12, lg: 5 }}>
              <Card sx={{ height: '100%' }}>
                <CardHeader
                  title="Category Distribution"
                  titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
                />
                <Divider />
                <CardContent sx={{ pt: 1 }}>
                  <CategoryDistributionChart data={reportData.categoryDistribution || []} height={280} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Daily Report: Incomplete Activities Table */}
          {reportType === 'daily' && reportData.incompleteActivities?.length > 0 && (
            <Card>
              <CardHeader
                title="Incomplete Activities to Review"
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
              />
              <Divider />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Planned</TableCell>
                      <TableCell>Actual</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.incompleteActivities.map((act) => (
                      <TableRow key={act.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{act.title}</TableCell>
                        <TableCell>{act.category}</TableCell>
                        <TableCell><StatusChip status={act.status} /></TableCell>
                        <TableCell>{formatDuration(act.plannedDuration)}</TableCell>
                        <TableCell>{formatDuration(act.actualDuration)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}

          {/* Weekly Report: Daily Breakdown Table */}
          {reportType === 'weekly' && reportData.dailyBreakdown?.length > 0 && (
            <Card>
              <CardHeader
                title="Daily Breakdown Comparison"
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
              />
              <Divider />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Day</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Completed / Total</TableCell>
                      <TableCell>Tracked Time</TableCell>
                      <TableCell>Planned Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.dailyBreakdown.map((row) => (
                      <TableRow key={row.date}>
                        <TableCell sx={{ fontWeight: 700 }}>{row.day}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.completed} / {row.total}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {formatDuration(row.trackedMinutes)}
                        </TableCell>
                        <TableCell>{formatDuration(row.plannedMinutes)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
};
