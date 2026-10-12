import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect } from 'vitest';

import authReducer from '../auth/authSlice.js';
import timerReducer from './timerSlice.js';
import activitiesReducer from '../activities/activitiesSlice.js';
import { ActiveTimerBanner } from '../../components/layout/ActiveTimerBanner.jsx';

describe('Timer Component', () => {
  it('renders ActiveTimerBanner when an active session is running', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
        timer: timerReducer,
        activities: activitiesReducer
      },
      preloadedState: {
        auth: { isAuthenticated: true, token: 'mock-token', user: { fullName: 'Test User' } },
        timer: {
          hasActiveTimer: true,
          activeSession: {
            id: 'sess-1',
            activityId: 'act-1',
            activityTitle: 'Deep Work Coding',
            status: 'running',
            accumulatedSeconds: 600,
            currentElapsedSeconds: 600
          },
          elapsedSeconds: 600
        }
      }
    });

    render(
      <Provider store={store}>
        <ActiveTimerBanner />
      </Provider>
    );

    expect(screen.getByText('Deep Work Coding')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  it('does not render banner when no active timer exists', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
        timer: timerReducer,
        activities: activitiesReducer
      },
      preloadedState: {
        auth: { isAuthenticated: true, token: 'mock-token' },
        timer: {
          hasActiveTimer: false,
          activeSession: null,
          elapsedSeconds: 0
        }
      }
    });

    const { container } = render(
      <Provider store={store}>
        <ActiveTimerBanner />
      </Provider>
    );

    expect(container).toBeEmptyDOMElement();
  });
});
