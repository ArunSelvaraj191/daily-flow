import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

export const EmptyState = ({
  icon: Icon = InboxOutlinedIcon,
  title = 'No records found',
  description = 'Get started by creating a new entry.',
  actionLabel = '',
  onAction = null
}) => {
  return (
    <Box
      sx={{
        py: 6,
        px: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: 3,
        bgcolor: 'action.hover'
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'primary.main',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          mb: 2
        }}
      >
        <Icon sx={{ fontSize: 28 }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: actionLabel ? 2.5 : 0 }}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" color="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};
