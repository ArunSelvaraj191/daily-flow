import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { ActivityFilters } from './ActivityFilters.jsx';
import { ActivityTable } from './ActivityTable.jsx';
import { ActivityFormDialog } from '../../components/forms/ActivityFormDialog.jsx';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog.jsx';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';

import {
  fetchActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  toggleCompleteActivity,
  setPage
} from './activitiesSlice.js';
import { startTimer } from '../timers/timerSlice.js';

export const ActivitiesPage = () => {
  const dispatch = useDispatch();
  const { items, total, page, pageSize, totalPages, filters, loading, error } =
    useSelector((state) => state.activities);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);

  useEffect(() => {
    dispatch(
      fetchActivities({
        page,
        pageSize,
        ...filters
      })
    );
  }, [dispatch, page, pageSize, filters]);

  const handleStartTimer = (activityId) => {
    dispatch(startTimer({ activityId }));
  };

  const handleToggleComplete = (activityId) => {
    dispatch(toggleCompleteActivity(activityId));
  };

  const handleOpenCreate = () => {
    setSelectedActivity(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (act) => {
    setSelectedActivity(act);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (selectedActivity?.id) {
      await dispatch(updateActivity({ id: selectedActivity.id, data: formData }));
    } else {
      await dispatch(createActivity(formData));
    }
  };

  const handleOpenDelete = (act) => {
    setActivityToDelete(act);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (activityToDelete?.id) {
      await dispatch(deleteActivity(activityToDelete.id));
      setDeleteDialogOpen(false);
      setActivityToDelete(null);
    }
  };

  return (
    <Box>
      <PageHeader
        title="My Activities"
        subtitle="Manage, schedule, filter, and track daily execution"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenCreate}
            sx={{ borderRadius: 2.5, px: 2.5 }}
          >
            New Activity
          </Button>
        }
      />

      <ActivityFilters />

      {error && (
        <ErrorState
          message={error}
          onRetry={() => dispatch(fetchActivities({ page, pageSize, ...filters }))}
        />
      )}

      {loading ? (
        <LoadingSkeleton type="table" />
      ) : (
        <ActivityTable
          activities={items}
          total={total}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={(newPage) => dispatch(setPage(newPage))}
          onStartTimer={handleStartTimer}
          onToggleComplete={handleToggleComplete}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      )}

      {/* Create / Edit Dialog */}
      <ActivityFormDialog
        open={formOpen}
        initialData={selectedActivity}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Activity"
        message={`Are you sure you want to delete "${activityToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setDeleteDialogOpen(false);
          setActivityToDelete(null);
        }}
      />
    </Box>
  );
};
