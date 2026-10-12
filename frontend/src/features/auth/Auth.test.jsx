import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect } from 'vitest';

import authReducer from './authSlice.js';
import timerReducer from '../timers/timerSlice.js';
import activitiesReducer from '../activities/activitiesSlice.js';
import { LoginPage } from './LoginPage.jsx';
import { RegisterPage } from './RegisterPage.jsx';

const createMockStore = (initialAuth = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      timer: timerReducer,
      activities: activitiesReducer
    },
    preloadedState: {
      auth: {
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        ...initialAuth
      }
    }
  });
};

describe('Authentication Pages', () => {
  it('renders login form with email and password fields', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders registration form with full name, email, and password', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });
});
