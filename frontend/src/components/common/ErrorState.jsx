import React from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';

export const ErrorState = ({
  message = 'Failed to load data.',
  onRetry = null
}) => {
  return (
    <Box sx={{ my: 2 }}>
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          ) : null
        }
        sx={{ borderRadius: 3 }}
      >
        <Typography variant="body2">{message}</Typography>
      </Alert>
    </Box>
  );
};
