import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, IconButton, Tooltip, Paper } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import {
  fetchActiveTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  incrementTimerTick
} from '../../features/timers/timerSlice.js';
import { fetchActivities } from '../../features/activities/activitiesSlice.js';
import { formatTimerSeconds } from '../../utils/formatters.js';

export const ActiveTimerBanner = () => {
  const dispatch = useDispatch();
  const { activeSession, hasActiveTimer, elapsedSeconds } = useSelector((state) => state.timer);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchActiveTimer());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    let interval = null;
    if (hasActiveTimer && activeSession?.status === 'running') {
      interval = setInterval(() => {
        dispatch(incrementTimerTick());
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasActiveTimer, activeSession?.status, dispatch]);

  if (!hasActiveTimer || !activeSession) {
    return null;
  }

  const isRunning = activeSession.status === 'running';

  const handleTogglePlay = () => {
    if (isRunning) {
      dispatch(pauseTimer(activeSession.id));
    } else {
      dispatch(resumeTimer(activeSession.id));
    }
  };

  const handleStop = async () => {
    await dispatch(stopTimer(activeSession.id));
    dispatch(fetchActivities());
  };

  return (
    <Paper
      elevation={3}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2.5,
        py: 1,
        borderRadius: '50px',
        bgcolor: '#FF5722',
        color: '#FFFFFF',
        boxShadow: '0 4px 18px rgba(255, 87, 34, 0.45)',
        transition: 'all 0.3s ease'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TimerOutlinedIcon sx={{ fontSize: 20, animation: isRunning ? 'spin 6s linear infinite' : 'none' }} />
        <Box sx={{ maxWidth: { xs: 100, sm: 160 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', lineHeight: 1 }}>
            Focusing on
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }} noWrap>
            {activeSession.activityTitle || 'Active Session'}
          </Typography>
        </Box>
      </Box>

      {/* Live Timer Counter */}
      <Typography
        variant="h6"
        sx={{
          fontFamily: 'monospace',
          fontWeight: 800,
          fontSize: '1.25rem',
          letterSpacing: '1px'
        }}
      >
        {formatTimerSeconds(elapsedSeconds)}
      </Typography>

      {/* Control Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title={isRunning ? 'Pause Timer' : 'Resume Timer'}>
          <IconButton
            size="small"
            onClick={handleTogglePlay}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.35)' }
            }}
          >
            {isRunning ? <PauseRoundedIcon fontSize="small" /> : <PlayArrowRoundedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Stop & Log Duration">
          <IconButton
            size="small"
            onClick={handleStop}
            sx={{
              bgcolor: 'rgba(0, 0, 0, 0.2)',
              color: '#FFFFFF',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.35)' }
            }}
          >
            <StopRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};
