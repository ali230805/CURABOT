import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import Dashboard from './components/dashboard/Dashboard';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Loading...</h2>;
  }

  return (
    <>
      <Toaster position="top-right" />
      <Navbar />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* TEMP SAFE ROUTE */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;