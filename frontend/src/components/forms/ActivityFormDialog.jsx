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
  Box,
  Typography
} from '@mui/material';
import { CATEGORIES, PRIORITIES, STATUSES } from '../../utils/constants.js';

const activitySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  category: z.string(),
  priority: z.string(),
  status: z.string(),
  activityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date required (YYYY-MM-DD)'),
  plannedStartTime: z.string().optional(),
  plannedEndTime: z.string().optional(),
  plannedDuration: z.coerce.number().min(0, 'Must be positive'),
  tags: z.string().optional(),
  notes: z.string().optional()
});

export const ActivityFormDialog = ({
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
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'Work',
      priority: 'Medium',
      status: 'Pending',
      activityDate: dayjs().format('YYYY-MM-DD'),
      plannedStartTime: '',
      plannedEndTime: '',
      plannedDuration: 30,
      tags: '',
      notes: ''
    }
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          title: initialData.title || '',
          description: initialData.description || '',
          category: initialData.category || 'Work',
          priority: initialData.priority || 'Medium',
          status: initialData.status || 'Pending',
          activityDate: initialData.activityDate || dayjs().format('YYYY-MM-DD'),
          plannedStartTime: initialData.plannedStartTime || '',
          plannedEndTime: initialData.plannedEndTime || '',
          plannedDuration: initialData.plannedDuration ?? 30,
          tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
          notes: initialData.notes || ''
        });
      } else {
        reset({
          title: '',
          description: '',
          category: 'Work',
          priority: 'Medium',
          status: 'Pending',
          activityDate: dayjs().format('YYYY-MM-DD'),
          plannedStartTime: '',
          plannedEndTime: '',
          plannedDuration: 30,
          tags: '',
          notes: ''
        });
      }
    }
  }, [open, initialData, reset]);

  const onFormSubmit = async (values) => {
    const formatted = {
      ...values,
      tags: values.tags
        ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : []
    };
    await onSubmit(formatted);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {isEdit ? 'Edit Activity' : 'Create New Activity'}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {/* Title */}
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Activity Title"
                  fullWidth
                  error={Boolean(errors.title)}
                  helperText={errors.title?.message}
                  placeholder="e.g. Design Dashboard Components"
                />
              )}
            />

            {/* Description */}
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
                  placeholder="Details regarding this activity..."
                />
              )}
            />

            {/* Category & Priority */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Category" fullWidth>
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
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Priority" fullWidth>
                      {PRIORITIES.map((pri) => (
                        <MenuItem key={pri} value={pri}>
                          {pri}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>

            {/* Status & Date */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Status" fullWidth>
                      {STATUSES.map((st) => (
                        <MenuItem key={st} value={st}>
                          {st}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="activityDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="Activity Date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.activityDate)}
                      helperText={errors.activityDate?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Planned Times & Duration */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="plannedStartTime"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="time"
                      label="Start Time"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="plannedEndTime"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="time"
                      label="End Time"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="plannedDuration"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Duration (min)"
                      fullWidth
                      error={Boolean(errors.plannedDuration)}
                      helperText={errors.plannedDuration?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Tags & Notes */}
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tags (comma separated)"
                  fullWidth
                  placeholder="e.g. dev, ui, priority"
                />
              )}
            />

            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Notes"
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Additional context or links..."
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Activity'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
