import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import { useLocation } from 'react-router-dom';

const PrivateRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // For dashboard routes, require establishmentId when needed
  if (location.pathname.startsWith('/dashboard/') && 
      !location.pathname.includes('/dashboard/profile') && 
      !location.pathname.includes('/dashboard/assets')) {
    const establishmentId = localStorage.getItem('establishmentId');
    if (!establishmentId) {
      return <Navigate to="/assets" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;
