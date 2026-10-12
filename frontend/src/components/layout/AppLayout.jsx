import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { AppSidebar } from './AppSidebar.jsx';
import { AppHeader } from './AppHeader.jsx';

export const AppLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppSidebar
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        isMobile={isMobile}
      />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppHeader onMobileNavToggle={() => setMobileNavOpen((prev) => !prev)} />
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 4 },
            maxWidth: 1600,
            width: '100%',
            mx: 'auto'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
