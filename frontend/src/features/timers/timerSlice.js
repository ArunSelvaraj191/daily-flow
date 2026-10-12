import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { timersApi } from '../../api/timers.api.js';

export const fetchActiveTimer = createAsyncThunk(
  'timer/fetchActiveTimer',
  async (_, { rejectWithValue }) => {
    try {
      return await timersApi.getActive();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const startTimer = createAsyncThunk(
  'timer/startTimer',
  async ({ activityId, notes }, { rejectWithValue }) => {
    try {
      return await timersApi.start(activityId, notes);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const pauseTimer = createAsyncThunk(
  'timer/pauseTimer',
  async (sessionId, { rejectWithValue }) => {
    try {
      return await timersApi.pause(sessionId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const resumeTimer = createAsyncThunk(
  'timer/resumeTimer',
  async (sessionId, { rejectWithValue }) => {
    try {
      return await timersApi.resume(sessionId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const stopTimer = createAsyncThunk(
  'timer/stopTimer',
  async (sessionId, { rejectWithValue }) => {
    try {
      return await timersApi.stop(sessionId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const timerSlice = createSlice({
  name: 'timer',
  initialState: {
    activeSession: null,
    hasActiveTimer: false,
    elapsedSeconds: 0,
    loading: false,
    error: null
  },
  reducers: {
    incrementTimerTick: (state) => {
      if (state.hasActiveTimer && state.activeSession?.status === 'running') {
        state.elapsedSeconds += 1;
      }
    },
    resetTimerState: (state) => {
      state.activeSession = null;
      state.hasActiveTimer = false;
      state.elapsedSeconds = 0;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch active timer
      .addCase(fetchActiveTimer.fulfilled, (state, action) => {
        state.hasActiveTimer = action.payload.hasActiveTimer;
        state.activeSession = action.payload.session || null;
        state.elapsedSeconds = action.payload.session?.currentElapsedSeconds || 0;
      })
      // Start
      .addCase(startTimer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startTimer.fulfilled, (state, action) => {
        state.loading = false;
        state.hasActiveTimer = true;
        state.activeSession = action.payload;
        state.elapsedSeconds = action.payload.currentElapsedSeconds || 0;
      })
      .addCase(startTimer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Pause
      .addCase(pauseTimer.fulfilled, (state, action) => {
        state.activeSession = action.payload;
        state.elapsedSeconds = action.payload.accumulatedSeconds || state.elapsedSeconds;
      })
      // Resume
      .addCase(resumeTimer.fulfilled, (state, action) => {
        state.activeSession = action.payload;
        state.elapsedSeconds = action.payload.accumulatedSeconds || state.elapsedSeconds;
      })
      // Stop
      .addCase(stopTimer.fulfilled, (state) => {
        state.activeSession = null;
        state.hasActiveTimer = false;
        state.elapsedSeconds = 0;
      });
  }
});

export const { incrementTimerTick, resetTimerState } = timerSlice.actions;
export default timerSlice.reducer;
