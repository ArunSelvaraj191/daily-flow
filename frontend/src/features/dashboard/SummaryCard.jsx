import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';

export const SummaryCard = ({
  title,
  value,
  subtitle = '',
  icon: Icon,
  color = '#FF5722',
  badge = null
}) => {
  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
            {title}
          </Typography>
          {Icon && (
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                bgcolor: `${color}18`,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon sx={{ fontSize: 20 }} />
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {value}
          </Typography>
          {badge}
        </Box>

        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: '0.75rem' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
