import React from 'react';
import { Box, Typography } from '@mui/material';

export const PageHeader = ({
  title,
  subtitle = '',
  action = null
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 3.5
      }}
    >
      <Box>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box sx={{ display: 'flex', gap: 1.5 }}>{action}</Box>}
    </Box>
  );
};
