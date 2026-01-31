import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Dashboard Router Component
 * Redirects users to their role-specific dashboard
 */
const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      // Role-based routing
      const roleRoutes: Record<number, string> = {
        1: '/admin/dashboard',      // Admin
        2: '/hr/dashboard',          // HR
        3: '/finance/dashboard',     // Finance
        4: '/employee/dashboard'     // Employee
      };

      const targetRoute = roleRoutes[user.peran_id];
      if (targetRoute) {
        navigate(targetRoute, { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  // Show loading while determining route
  return <LoadingSpinner />;
};

export default Dashboard;
