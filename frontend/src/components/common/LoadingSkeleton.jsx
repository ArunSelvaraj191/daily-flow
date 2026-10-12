import React from 'react';
import { Box, Skeleton, Grid } from '@mui/material';

export const LoadingSkeleton = ({ type = 'cards', count = 4 }) => {
  if (type === 'cards') {
    return (
      <Grid container spacing={2.5}>
        {Array.from({ length: count }).map((_, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <Skeleton
              variant="rounded"
              height={130}
              sx={{ borderRadius: 4 }}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (type === 'table') {
    return (
      <Box sx={{ width: '100%', py: 1 }}>
        <Skeleton variant="rounded" height={45} sx={{ mb: 1.5, borderRadius: 2 }} />
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton
            key={idx}
            variant="rounded"
            height={48}
            sx={{ mb: 1, borderRadius: 2 }}
          />
        ))}
      </Box>
    );
  }

  return <Skeleton variant="rounded" height={260} sx={{ borderRadius: 4 }} />;
};
