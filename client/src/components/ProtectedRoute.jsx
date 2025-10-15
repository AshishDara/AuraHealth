// client/src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const userInfo = localStorage.getItem('userInfo');

  // If user info doesn't exist in local storage, redirect to the login page
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the component that was passed in (e.g., ChatPage)
  return children;
};

export default ProtectedRoute;