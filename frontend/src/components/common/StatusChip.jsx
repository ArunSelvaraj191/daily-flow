import React from 'react';
import { Chip, Box } from '@mui/material';
import { STATUS_COLORS } from '../../utils/constants.js';

export const StatusChip = ({ status = 'Pending', size = 'small' }) => {
  const conf = STATUS_COLORS[status] || STATUS_COLORS.Pending;

  return (
    <Chip
      size={size}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: conf.color
            }}
          />
          <span>{status}</span>
        </Box>
      }
      sx={{
        backgroundColor: conf.bg,
        color: conf.color,
        fontWeight: 600,
        fontSize: '0.75rem',
        border: 'none'
      }}
    />
  );
};
