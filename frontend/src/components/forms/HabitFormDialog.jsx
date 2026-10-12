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
  FormControlLabel,
  Switch
} from '@mui/material';
import { CATEGORIES } from '../../utils/constants.js';

const habitSchema = z.object({
  name: z.string().min(1, 'Habit name is required').max(150),
  description: z.string().optional(),
  category: z.string(),
  frequency: z.enum(['daily', 'weekdays', 'weekly']),
  targetDuration: z.coerce.number().min(0),
  targetCount: z.coerce.number().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true)
});

export const HabitFormDialog = ({
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
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'Health',
      frequency: 'daily',
      targetDuration: 15,
      targetCount: 1,
      startDate: dayjs().format('YYYY-MM-DD'),
      endDate: '',
      isActive: true
    }
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name || '',
          description: initialData.description || '',
          category: initialData.category || 'Health',
          frequency: initialData.frequency || 'daily',
          targetDuration: initialData.targetDuration ?? 15,
          targetCount: initialData.targetCount ?? 1,
          startDate: initialData.startDate || dayjs().format('YYYY-MM-DD'),
          endDate: initialData.endDate || '',
          isActive: initialData.isActive ?? true
        });
      } else {
        reset({
          name: '',
          description: '',
          category: 'Health',
          frequency: 'daily',
          targetDuration: 15,
          targetCount: 1,
          startDate: dayjs().format('YYYY-MM-DD'),
          endDate: '',
          isActive: true
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
          {isEdit ? 'Edit Habit' : 'Create Recurring Habit'}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Habit Name"
                  fullWidth
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                  placeholder="e.g. Read for 30 minutes, Morning Meditation"
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
                  placeholder="Why is this habit meaningful to you?"
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
                  name="frequency"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Frequency" fullWidth>
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekdays">Weekdays (Mon-Fri)</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="targetDuration"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Target Duration (mins)"
                      fullWidth
                    />
                  )}
                />
              </Grid>
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
            </Grid>

            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label="Active Habit"
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
            {isEdit ? 'Save Changes' : 'Create Habit'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
