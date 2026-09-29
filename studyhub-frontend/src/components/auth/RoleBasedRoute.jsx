import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // ✅ Get user role (handle both formats)
  const userRole = (user?.role || '').trim().toUpperCase();
  const normalizedUserRole = userRole.replace('ROLE_', '');
  console.log('🔍 RoleBasedRoute - User role:', userRole);
  console.log('🔍 Allowed roles:', allowedRoles);

  // ✅ Check if user has any of the allowed roles
  const hasAllowedRole = allowedRoles.some(role => {
    const r = (role || '').trim().toUpperCase();
    const normalizedRole = r.replace('ROLE_', '');
    return userRole === r || 
           normalizedUserRole === normalizedRole ||
           userRole === normalizedRole ||
           normalizedUserRole === r;
  });

  if (allowedRoles.length > 0 && !hasAllowedRole) {
    console.log('❌ User does not have required role. Redirecting to unauthorized.');
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleBasedRoute;