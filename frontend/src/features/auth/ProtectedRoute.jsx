import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const ProtectedRoute = () => {
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
