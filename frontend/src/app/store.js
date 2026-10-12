import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import timerReducer from '../features/timers/timerSlice.js';
import activitiesReducer from '../features/activities/activitiesSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    timer: timerReducer,
    activities: activitiesReducer
  }
});
