import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Typography,
  Box,
  Pagination
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { StatusChip } from '../../components/common/StatusChip.jsx';
import { PriorityChip } from '../../components/common/PriorityChip.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { formatDuration, formatDate } from '../../utils/formatters.js';

export const ActivityTable = ({
  activities = [],
  total = 0,
  page = 1,
  pageSize = 10,
  totalPages = 1,
  onPageChange,
  onStartTimer,
  onToggleComplete,
  onEdit,
  onDelete
}) => {
  if (activities.length === 0) {
    return (
      <EmptyState
        title="No activities match your filters"
        description="Try adjusting your search criteria or create a new activity."
      />
    );
  }

  return (
    <Box>
      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 48 }}></TableCell>
              <TableCell>Activity Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Planned</TableCell>
              <TableCell>Tracked</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.map((act) => {
              const isCompleted = act.status === 'Completed';

              return (
                <TableRow
                  key={act.id}
                  hover
                  sx={{
                    transition: 'background-color 0.2s',
                    opacity: isCompleted ? 0.75 : 1
                  }}
                >
                  {/* Complete Checkbox Button */}
                  <TableCell>
                    <Tooltip title={isCompleted ? 'Mark Pending' : 'Mark Completed'}>
                      <IconButton
                        size="small"
                        onClick={() => onToggleComplete(act.id)}
                        color={isCompleted ? 'success' : 'default'}
                      >
                        {isCompleted ? (
                          <CheckCircleRoundedIcon fontSize="small" />
                        ) : (
                          <CheckCircleOutlineRoundedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </TableCell>

                  {/* Title & Notes/Tags */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        textDecoration: isCompleted ? 'line-through' : 'none'
                      }}
                    >
                      {act.title}
                    </Typography>
                    {act.description && (
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 220 }}>
                        {act.description}
                      </Typography>
                    )}
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {act.category}
                    </Typography>
                  </TableCell>

                  {/* Priority */}
                  <TableCell>
                    <PriorityChip priority={act.priority} />
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <StatusChip status={act.status} />
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(act.activityDate, 'MMM D, YYYY')}
                    </Typography>
                  </TableCell>

                  {/* Planned Duration */}
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDuration(act.plannedDuration)}
                    </Typography>
                  </TableCell>

                  {/* Actual Tracked Duration */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: act.actualDuration > 0 ? 'primary.main' : 'text.secondary'
                      }}
                    >
                      {formatDuration(act.actualDuration)}
                    </Typography>
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Tooltip title="Start Timer">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onStartTimer(act.id)}
                          disabled={isCompleted}
                        >
                          <PlayArrowRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Edit Activity">
                        <IconButton size="small" onClick={() => onEdit(act)}>
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Activity">
                        <IconButton size="small" color="error" onClick={() => onDelete(act)}>
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => onPageChange(newPage)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
};
