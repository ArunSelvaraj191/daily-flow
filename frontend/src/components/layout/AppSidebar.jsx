import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import LoopRoundedIcon from '@mui/icons-material/LoopRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

import { useColorMode } from '../../theme/ThemeProvider.jsx';
import { logout } from '../../features/auth/authSlice.js';

export const SIDEBAR_WIDTH = 250;

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: DashboardRoundedIcon },
  { label: 'My Activities', path: '/activities', icon: CheckCircleOutlineRoundedIcon },
  { label: 'Calendar', path: '/calendar', icon: CalendarMonthRoundedIcon },
  { label: 'Habit Tracker', path: '/habits', icon: LoopRoundedIcon },
  { label: 'Goals', path: '/goals', icon: FlagRoundedIcon },
  { label: 'Analytics & Reports', path: '/reports', icon: InsightsRoundedIcon },
  { label: 'Profile & Settings', path: '/settings', icon: SettingsRoundedIcon }
];

export const AppSidebar = ({ open, onClose, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { mode, toggleColorMode } = useColorMode();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const content = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        px: 2,
        py: 2.5
      }}
    >
      {/* Brand Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1, mb: 3 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 3,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '1.2rem',
            boxShadow: '0 4px 12px rgba(255, 87, 34, 0.35)'
          }}
        >
          DF
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            DailyFlow
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Productivity Suite
          </Typography>
        </Box>
      </Box>

      {/* Navigation List */}
      <List sx={{ flex: 1, p: 0, display: 'flex', flexDirection: 'column', gap: 0.6 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isSelected = location.pathname === item.path;

          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={NavLink}
                to={item.path}
                onClick={isMobile ? onClose : undefined}
                sx={{
                  borderRadius: 2.5,
                  py: 1.1,
                  px: 1.5,
                  bgcolor: isSelected ? 'action.selected' : 'transparent',
                  color: isSelected ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    bgcolor: isSelected ? 'action.selected' : 'action.hover'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isSelected ? 'primary.main' : 'text.secondary'
                  }}
                >
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.9rem'
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Bottom Profile and Theme Controls */}
      <Box
        sx={{
          p: 1.5,
          borderRadius: 3,
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, overflow: 'hidden' }}>
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: 'primary.light',
              color: '#FFF',
              fontSize: '0.85rem',
              fontWeight: 700
            }}
          >
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
              {user?.fullName || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', fontSize: '0.72rem' }}>
              {user?.email || ''}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}>
            <IconButton size="small" onClick={toggleColorMode}>
              {mode === 'light' ? <DarkModeRoundedIcon fontSize="small" /> : <LightModeRoundedIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Log Out">
            <IconButton size="small" onClick={handleLogout} color="error">
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box' }
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Box
      component="nav"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0
      }}
    >
      {content}
    </Box>
  );
};
