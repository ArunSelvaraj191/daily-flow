import React from 'react';
import { useSelector } from 'react-redux';
import { Box, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import dayjs from 'dayjs';
import { ActiveTimerBanner } from './ActiveTimerBanner.jsx';

export const AppHeader = ({ onMobileNavToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useSelector((state) => state.auth);

  const todayStr = dayjs().format('dddd, MMMM D');

  return (
    <Box
      component="header"
      sx={{
        py: 1.5,
        px: { xs: 2, sm: 3, md: 4 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        zIndex: 1100
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {isMobile && (
          <IconButton onClick={onMobileNavToggle} size="small" edge="start">
            <MenuRoundedIcon />
          </IconButton>
        )}
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
            {todayStr}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            Welcome back, {user?.fullName?.split(' ')[0] || 'Flow Master'} 👋
          </Typography>
        </Box>
      </Box>

      {/* Floating or Inline Active Timer */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <ActiveTimerBanner />
      </Box>
    </Box>
  );
};
