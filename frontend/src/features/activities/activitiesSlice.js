import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { activitiesApi } from '../../api/activities.api.js';

export const fetchActivities = createAsyncThunk(
  'activities/fetchActivities',
  async (params, { rejectWithValue }) => {
    try {
      return await activitiesApi.list(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createActivity = createAsyncThunk(
  'activities/createActivity',
  async (data, { rejectWithValue }) => {
    try {
      return await activitiesApi.create(data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateActivity = createAsyncThunk(
  'activities/updateActivity',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await activitiesApi.update(id, data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteActivity = createAsyncThunk(
  'activities/deleteActivity',
  async (id, { rejectWithValue }) => {
    try {
      await activitiesApi.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const toggleCompleteActivity = createAsyncThunk(
  'activities/toggleCompleteActivity',
  async (id, { rejectWithValue }) => {
    try {
      return await activitiesApi.toggleComplete(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const activitiesSlice = createSlice({
  name: 'activities',
  initialState: {
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    filters: {
      search: '',
      date: '',
      category: '',
      status: '',
      priority: '',
      sortBy: 'activityDate',
      sortOrder: 'desc'
    },
    loading: false,
    error: null
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // Reset to page 1 on filter change
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        date: '',
        category: '',
        status: '',
        priority: '',
        sortBy: 'activityDate',
        sortOrder: 'desc'
      };
      state.page = 1;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pageSize = action.payload.page_size;
        state.totalPages = action.payload.total_pages;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createActivity.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.total += 1;
      })
      // Update
      .addCase(updateActivity.fulfilled, (state, action) => {
        const idx = state.items.findIndex((item) => item.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
      })
      // Toggle
      .addCase(toggleCompleteActivity.fulfilled, (state, action) => {
        const idx = state.items.findIndex((item) => item.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
      })
      // Delete
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      });
  }
});

export const { setFilters, resetFilters, setPage } = activitiesSlice.actions;
export default activitiesSlice.reducer;
