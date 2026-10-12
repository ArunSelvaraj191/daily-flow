import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { ProtectedRoute } from '../features/auth/ProtectedRoute.jsx';
import { LoginPage } from '../features/auth/LoginPage.jsx';
import { RegisterPage } from '../features/auth/RegisterPage.jsx';
import { DashboardPage } from '../features/dashboard/DashboardPage.jsx';
import { ActivitiesPage } from '../features/activities/ActivitiesPage.jsx';
import { CalendarPage } from '../features/calendar/CalendarPage.jsx';
import { HabitsPage } from '../features/habits/HabitsPage.jsx';
import { GoalsPage } from '../features/goals/GoalsPage.jsx';
import { ReportsPage } from '../features/reports/ReportsPage.jsx';
import { SettingsPage } from '../features/settings/SettingsPage.jsx';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />
          },
          {
            path: 'dashboard',
            element: <DashboardPage />
          },
          {
            path: 'activities',
            element: <ActivitiesPage />
          },
          {
            path: 'calendar',
            element: <CalendarPage />
          },
          {
            path: 'habits',
            element: <HabitsPage />
          },
          {
            path: 'goals',
            element: <GoalsPage />
          },
          {
            path: 'reports',
            element: <ReportsPage />
          },
          {
            path: 'settings',
            element: <SettingsPage />
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
]);
