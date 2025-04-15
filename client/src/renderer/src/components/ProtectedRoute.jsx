import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AppNavbar from './Navbar';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <>
      <AppNavbar />
      {children}
    </>
  );
};

export default ProtectedRoute;