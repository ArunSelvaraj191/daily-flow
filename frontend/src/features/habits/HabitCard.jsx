import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Tooltip,
  LinearProgress,
  Chip
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { CATEGORY_COLORS } from '../../utils/constants.js';

export const HabitCard = ({
  habit,
  onLogCompletion,
  onEdit,
  onDelete
}) => {
  const isCompletedToday = habit.completedToday;
  const catColor = CATEGORY_COLORS[habit.category] || '#6B7280';

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <CardContent sx={{ p: 2.5 }}>
        {/* Top Badges & Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Chip
            size="small"
            label={habit.category}
            sx={{
              bgcolor: `${catColor}18`,
              color: catColor,
              fontWeight: 700,
              fontSize: '0.72rem'
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Edit Habit">
              <IconButton size="small" onClick={() => onEdit(habit)}>
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Habit">
              <IconButton size="small" color="error" onClick={() => onDelete(habit)}>
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Title & Description */}
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, lineHeight: 1.2 }}>
          {habit.name}
        </Typography>
        {habit.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 36, fontSize: '0.85rem' }}>
            {habit.description}
          </Typography>
        )}

        {/* Streaks Row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1.5,
            borderRadius: 2.5,
            bgcolor: 'action.hover',
            mb: 2.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 87, 34, 0.15)',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LocalFireDepartmentRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>
                Current Streak
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                {habit.currentStreak} {habit.currentStreak === 1 ? 'day' : 'days'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>
              Best Streak
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {habit.longestStreak} days
            </Typography>
          </Box>
        </Box>

        {/* Weekly Completion Rate */}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              7-Day Consistency
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {habit.weeklyCompletionRate}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={habit.weeklyCompletionRate}
            sx={{
              height: 7,
              borderRadius: 4,
              bgcolor: 'action.hover',
              '& .MuiLinearProgress-bar': { bgcolor: 'success.main', borderRadius: 4 }
            }}
          />
        </Box>
      </CardContent>

      {/* Complete Today Button Footer */}
      <Box sx={{ p: 2, pt: 0 }}>
        <Box
          onClick={() => onLogCompletion(habit)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            py: 1.2,
            px: 2,
            borderRadius: 3,
            bgcolor: isCompletedToday ? 'success.main' : 'action.selected',
            color: isCompletedToday ? '#FFF' : 'text.primary',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontWeight: 700,
            fontSize: '0.9rem',
            '&:hover': {
              bgcolor: isCompletedToday ? 'success.dark' : 'primary.main',
              color: '#FFF'
            }
          }}
        >
          {isCompletedToday ? (
            <>
              <CheckCircleRoundedIcon fontSize="small" />
              <span>Completed Today!</span>
            </>
          ) : (
            <>
              <CheckCircleOutlineRoundedIcon fontSize="small" />
              <span>Mark Done for Today</span>
            </>
          )}
        </Box>
      </Box>
    </Card>
  );
};
