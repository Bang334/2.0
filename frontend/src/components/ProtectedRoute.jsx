import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, isAdmin, isGiangVien, isSinhVien, getAnonymousRoute } from '../utils/authUtils';

/**
 * ProtectedRoute component for handling role-based access control
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if access is granted
 * @param {Array} props.requiredRoles - Array of roles allowed to access this route
 * @returns {React.ReactNode}
 */
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const location = useLocation();
  
  // If not authenticated, redirect to appropriate login page based on path
  if (!isAuthenticated()) {
    const loginRoute = getAnonymousRoute(location.pathname);
    return <Navigate to={loginRoute} state={{ from: location.pathname }} replace />;
  }

  // If there are required roles, check if user has at least one of them
  if (requiredRoles.length > 0) {
    let hasRequiredRole = false;
    
    // Admin role check
    if (requiredRoles.includes('ROLE_QL') || requiredRoles.includes('ROLE_ADMIN')) {
      hasRequiredRole = hasRequiredRole || isAdmin();
    }
    
    // Giảng viên role check
    if (requiredRoles.includes('ROLE_GV')) {
      hasRequiredRole = hasRequiredRole || isGiangVien();
    }
    
    // Sinh viên role check
    if (requiredRoles.includes('ROLE_SV')) {
      hasRequiredRole = hasRequiredRole || isSinhVien();
    }
    
    // If user doesn't have any of the required roles, redirect to home
    if (!hasRequiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  // If all checks pass, render the children
  return children;
};

export default ProtectedRoute; 