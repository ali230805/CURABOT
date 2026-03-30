import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = true; // later connect with login

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;