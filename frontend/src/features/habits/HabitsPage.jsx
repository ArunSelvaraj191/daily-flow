import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import dayjs from 'dayjs';

import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { HabitCard } from './HabitCard.jsx';
import { HabitFormDialog } from '../../components/forms/HabitFormDialog.jsx';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { habitsApi } from '../../api/habits.api.js';

export const HabitsPage = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);

  const loadHabits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await habitsApi.list(false);
      setHabits(res || []);
    } catch (err) {
      setError(err.message || 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const handleOpenCreate = () => {
    setSelectedHabit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (habit) => {
    setSelectedHabit(habit);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (selectedHabit?.id) {
      await habitsApi.update(selectedHabit.id, formData);
    } else {
      await habitsApi.create(formData);
    }
    loadHabits();
  };

  const handleLogCompletion = async (habit) => {
    const todayStr = dayjs().format('YYYY-MM-DD');
    const newStatus = !habit.completedToday;
    await habitsApi.logCompletion(habit.id, {
      date: todayStr,
      completed: newStatus,
      durationMinutes: habit.targetDuration || 15
    });
    loadHabits();
  };

  const handleOpenDelete = (habit) => {
    setHabitToDelete(habit);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (habitToDelete?.id) {
      await habitsApi.delete(habitToDelete.id);
      setDeleteDialogOpen(false);
      setHabitToDelete(null);
      loadHabits();
    }
  };

  return (
    <Box>
      <PageHeader
        title="Habit Tracker"
        subtitle="Cultivate long-term consistency and track cumulative streaks"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenCreate}
            sx={{ borderRadius: 2.5, px: 2.5 }}
          >
            New Habit
          </Button>
        }
      />

      {error && <ErrorState message={error} onRetry={loadHabits} />}

      {loading ? (
        <LoadingSkeleton type="cards" count={3} />
      ) : habits.length === 0 ? (
        <EmptyState
          title="No habits created yet"
          description="Start building healthy routines by setting your first daily habit."
          actionLabel="Create Habit"
          onAction={handleOpenCreate}
        />
      ) : (
        <Grid container spacing={2.5}>
          {habits.map((habit) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={habit.id}>
              <HabitCard
                habit={habit}
                onLogCompletion={handleLogCompletion}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Habit Create / Edit Modal */}
      <HabitFormDialog
        open={formOpen}
        initialData={selectedHabit}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Habit"
        message={`Are you sure you want to delete "${habitToDelete?.name}"? Historical logs will be preserved.`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setDeleteDialogOpen(false);
          setHabitToDelete(null);
        }}
      />
    </Box>
  );
};
