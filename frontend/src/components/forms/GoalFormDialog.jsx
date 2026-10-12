import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Grid,
  Box
} from '@mui/material';
import { CATEGORIES } from '../../utils/constants.js';

const goalSchema = z.object({
  title: z.string().min(1, 'Goal title is required').max(150),
  description: z.string().optional(),
  category: z.string(),
  metricType: z.enum(['duration_minutes', 'activity_count', 'habit_count']),
  targetValue: z.coerce.number().gt(0, 'Target must be greater than 0'),
  measurementPeriod: z.enum(['daily', 'weekly', 'monthly']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().optional(),
  status: z.enum(['active', 'completed', 'archived'])
});

export const GoalFormDialog = ({
  open,
  initialData = null,
  onClose,
  onSubmit
}) => {
  const isEdit = Boolean(initialData?.id);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'General',
      metricType: 'duration_minutes',
      targetValue: 60,
      measurementPeriod: 'weekly',
      startDate: dayjs().format('YYYY-MM-DD'),
      endDate: '',
      status: 'active'
    }
  });

  const selectedMetric = watch('metricType');

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          title: initialData.title || '',
          description: initialData.description || '',
          category: initialData.category || 'General',
          metricType: initialData.metricType || 'duration_minutes',
          targetValue: initialData.targetValue ?? 60,
          measurementPeriod: initialData.measurementPeriod || 'weekly',
          startDate: initialData.startDate || dayjs().format('YYYY-MM-DD'),
          endDate: initialData.endDate || '',
          status: initialData.status || 'active'
        });
      } else {
        reset({
          title: '',
          description: '',
          category: 'General',
          metricType: 'duration_minutes',
          targetValue: 60,
          measurementPeriod: 'weekly',
          startDate: dayjs().format('YYYY-MM-DD'),
          endDate: '',
          status: 'active'
        });
      }
    }
  }, [open, initialData, reset]);

  const onFormSubmit = async (values) => {
    const formatted = {
      ...values,
      endDate: values.endDate || null
    };
    await onSubmit(formatted);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {isEdit ? 'Edit Goal' : 'Create Productivity Goal'}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Goal Title"
                  fullWidth
                  error={Boolean(errors.title)}
                  helperText={errors.title?.message}
                  placeholder="e.g. Learn Python for 10 hours, Exercise 5 times"
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="What outcome do you want to accomplish?"
                />
              )}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Category" fullWidth>
                      <MenuItem value="General">General (All)</MenuItem>
                      {CATEGORIES.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="metricType"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Metric Type" fullWidth>
                      <MenuItem value="duration_minutes">Tracked Minutes</MenuItem>
                      <MenuItem value="activity_count">Activities Completed</MenuItem>
                      <MenuItem value="habit_count">Habit Completions</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="targetValue"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label={`Target (${selectedMetric === 'duration_minutes' ? 'Minutes' : 'Count'})`}
                      fullWidth
                      error={Boolean(errors.targetValue)}
                      helperText={errors.targetValue?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="measurementPeriod"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Measurement Period" fullWidth>
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="Start Date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="End Date (Optional)"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {isEdit && (
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Status" fullWidth>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </TextField>
                )}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Goal'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
