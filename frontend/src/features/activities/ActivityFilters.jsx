import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
  InputAdornment
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import { setFilters, resetFilters } from './activitiesSlice.js';
import { CATEGORIES, PRIORITIES, STATUSES } from '../../utils/constants.js';

export const ActivityFilters = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.activities);

  const handleChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const handleReset = () => {
    dispatch(resetFilters());
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Search */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search activities & tags..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              )
            }}
          />
        </Grid>

        {/* Date */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            size="small"
            fullWidth
            type="date"
            label="Date"
            InputLabelProps={{ shrink: true }}
            value={filters.date || ''}
            onChange={(e) => handleChange('date', e.target.value)}
          />
        </Grid>

        {/* Category */}
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <TextField
            size="small"
            select
            fullWidth
            label="Category"
            value={filters.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Status */}
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <TextField
            size="small"
            select
            fullWidth
            label="Status"
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {STATUSES.map((st) => (
              <MenuItem key={st} value={st}>
                {st}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Priority */}
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <TextField
            size="small"
            select
            fullWidth
            label="Priority"
            value={filters.priority || ''}
            onChange={(e) => handleChange('priority', e.target.value)}
          >
            <MenuItem value="">All Priorities</MenuItem>
            {PRIORITIES.map((pri) => (
              <MenuItem key={pri} value={pri}>
                {pri}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Reset */}
        <Grid size={{ xs: 6, sm: 12, md: 1 }}>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            fullWidth
            startIcon={<RestartAltRoundedIcon />}
            onClick={handleReset}
            sx={{ height: 40, borderRadius: 2 }}
          >
            Reset
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
