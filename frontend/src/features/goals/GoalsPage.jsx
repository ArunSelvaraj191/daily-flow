import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Grid, ToggleButtonGroup, ToggleButton } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { GoalCard } from './GoalCard.jsx';
import { GoalFormDialog } from '../../components/forms/GoalFormDialog.jsx';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { goalsApi } from '../../api/goals.api.js';

export const GoalsPage = () => {
  const [statusFilter, setStatusFilter] = useState('active');
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await goalsApi.list(statusFilter === 'all' ? '' : statusFilter);
      setGoals(res || []);
    } catch (err) {
      setError(err.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleOpenCreate = () => {
    setSelectedGoal(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (goal) => {
    setSelectedGoal(goal);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (selectedGoal?.id) {
      await goalsApi.update(selectedGoal.id, formData);
    } else {
      await goalsApi.create(formData);
    }
    loadGoals();
  };

  const handleOpenDelete = (goal) => {
    setGoalToDelete(goal);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (goalToDelete?.id) {
      await goalsApi.delete(goalToDelete.id);
      setDeleteDialogOpen(false);
      setGoalToDelete(null);
      loadGoals();
    }
  };

  return (
    <Box>
      <PageHeader
        title="Goals & Milestones"
        subtitle="Set quantitative targets derived from tracked activities and recurring habits"
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <ToggleButtonGroup
              size="small"
              value={statusFilter}
              exclusive
              onChange={(_, val) => val && setStatusFilter(val)}
              sx={{ bgcolor: 'background.paper', borderRadius: 2.5 }}
            >
              <ToggleButton value="active" sx={{ px: 1.5, fontWeight: 600 }}>Active</ToggleButton>
              <ToggleButton value="completed" sx={{ px: 1.5, fontWeight: 600 }}>Completed</ToggleButton>
              <ToggleButton value="all" sx={{ px: 1.5, fontWeight: 600 }}>All</ToggleButton>
            </ToggleButtonGroup>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddRoundedIcon />}
              onClick={handleOpenCreate}
              sx={{ borderRadius: 2.5, px: 2.5 }}
            >
              New Goal
            </Button>
          </Box>
        }
      />

      {error && <ErrorState message={error} onRetry={loadGoals} />}

      {loading ? (
        <LoadingSkeleton type="cards" count={3} />
      ) : goals.length === 0 ? (
        <EmptyState
          title={`No ${statusFilter === 'all' ? '' : statusFilter} goals found`}
          description="Create measurable targets to track focused work, learning, or fitness progress."
          actionLabel="Create Goal"
          onAction={handleOpenCreate}
        />
      ) : (
        <Grid container spacing={2.5}>
          {goals.map((goal) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={goal.id}>
              <GoalCard
                goal={goal}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Goal Form Modal */}
      <GoalFormDialog
        open={formOpen}
        initialData={selectedGoal}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Goal"
        message={`Are you sure you want to delete "${goalToDelete?.title}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setDeleteDialogOpen(false);
          setGoalToDelete(null);
        }}
      />
    </Box>
  );
};
