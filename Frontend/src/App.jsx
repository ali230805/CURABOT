import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';
import './App.css';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import Dashboard from './components/dashboard/Dashboard';
import PredictionResult from './components/dashboard/PredictionResult';
import ChatPage from './components/chat/ChatPage';
import HistoryPage from './components/history/HistoryPage';
import PrivateRoute from './components/common/PrivateRoute';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="app-loading">Loading CURABOT...</div>;
  }

  return (
    <div className="app-shell">
      <Toaster position="top-right" />
      <div className="app-navbar">
        <Navbar />
      </div>

      <main className="app-main">
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPassword />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/history"
            element={
              <PrivateRoute>
                <HistoryPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/prediction-result"
            element={
              <PrivateRoute>
                <PredictionResult />
              </PrivateRoute>
            }
          />

          <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
        </Routes>
      </main>

      <div className="app-footer">
        <Footer />
      </div>
    </div>
  );
}

export default App;
