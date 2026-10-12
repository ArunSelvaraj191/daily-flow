import React from 'react';
import { Chip } from '@mui/material';
import { PRIORITY_COLORS } from '../../utils/constants.js';

export const PriorityChip = ({ priority = 'Medium', size = 'small' }) => {
  const conf = PRIORITY_COLORS[priority] || PRIORITY_COLORS.Medium;

  return (
    <Chip
      size={size}
      label={priority}
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
