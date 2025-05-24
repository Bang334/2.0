import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getDefaultRoute } from '../utils/authUtils';

/**
 * PublicOnlyRoute component for pages that should only be accessible when not logged in
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if access is granted
 * @returns {React.ReactNode}
 */
const PublicOnlyRoute = ({ children }) => {
  // If user is already authenticated, redirect to their default route
  if (isAuthenticated()) {
    return <Navigate to={getDefaultRoute()} replace />;
  }
  
  // If not authenticated, allow access to the public route
  return children;
};

export default PublicOnlyRoute; 