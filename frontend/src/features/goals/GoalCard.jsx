import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { CATEGORY_COLORS } from '../../utils/constants.js';
import { formatDuration } from '../../utils/formatters.js';

export const GoalCard = ({
  goal,
  onEdit,
  onDelete
}) => {
  const isCompleted = goal.status === 'completed' || goal.progressPercentage >= 100;
  const isOverdue = goal.isOverdue;
  const catColor = CATEGORY_COLORS[goal.category] || '#3B82F6';

  const formatGoalValue = (val) => {
    if (goal.metricType === 'duration_minutes') {
      return formatDuration(val);
    }
    return `${val} completed`;
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <CardContent sx={{ p: 2.5 }}>
        {/* Top Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              size="small"
              label={goal.category}
              sx={{
                bgcolor: `${catColor}18`,
                color: catColor,
                fontWeight: 700,
                fontSize: '0.72rem'
              }}
            />
            <Chip
              size="small"
              label={goal.measurementPeriod}
              sx={{
                bgcolor: 'action.hover',
                fontWeight: 600,
                fontSize: '0.72rem',
                textTransform: 'capitalize'
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Edit Goal">
              <IconButton size="small" onClick={() => onEdit(goal)}>
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Goal">
              <IconButton size="small" color="error" onClick={() => onDelete(goal)}>
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Title & Description */}
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, lineHeight: 1.2 }}>
          {goal.title}
        </Typography>
        {goal.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 36, fontSize: '0.85rem' }}>
            {goal.description}
          </Typography>
        )}

        {/* Dynamic Progress Metric */}
        <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'action.hover', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              {formatGoalValue(goal.currentValue)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              of {formatGoalValue(goal.targetValue)} target
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={goal.progressPercentage}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'background.paper',
              '& .MuiLinearProgress-bar': {
                bgcolor: isCompleted ? 'success.main' : isOverdue ? 'error.main' : 'primary.main',
                borderRadius: 4
              }
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.8 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: isCompleted ? 'success.main' : 'primary.main' }}>
              {goal.progressPercentage}% Completed
            </Typography>

            {isOverdue && !isCompleted && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: 'error.main' }}>
                <WarningAmberRoundedIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Overdue
                </Typography>
              </Box>
            )}

            {isCompleted && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: 'success.main' }}>
                <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Target Met!
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
