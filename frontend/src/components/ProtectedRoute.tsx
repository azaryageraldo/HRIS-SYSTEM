import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[]; // Optional: restrict to specific roles
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles && user && !allowedRoles.includes(user.peran_id)) {
    // User doesn't have permission, redirect to their dashboard
    const roleRoutes: Record<number, string> = {
      1: '/admin/dashboard',
      2: '/hr/dashboard',
      3: '/finance/dashboard',
      4: '/employee/dashboard'
    };
    return <Navigate to={roleRoutes[user.peran_id] || '/'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
