import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const AUTH_TOKEN_KEY = 'curabot-auth-token';
const LEGACY_TOKEN_KEY = 'token';

const getStoredToken = () =>
  localStorage.getItem(AUTH_TOKEN_KEY) ||
  sessionStorage.getItem(AUTH_TOKEN_KEY) ||
  localStorage.getItem(LEGACY_TOKEN_KEY);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(getStoredToken);

  const storeToken = (nextToken, rememberMe = true) => {
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);

    if (nextToken) {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(AUTH_TOKEN_KEY, nextToken);
    }

    setToken(nextToken);
  };

  const clearAuthState = () => {
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  // Set axios default header
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/me`);
      setUser(res.data.user);
    } catch (error) {
      console.error('Load user error:', error);
      clearAuthState();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, options = {}) => {
    const { rememberMe = true } = options;

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      const { token, user } = res.data;
      storeToken(token, rememberMe);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      const { token, user } = res.data;
      storeToken(token, true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await axios.post(`${API_BASE_URL}/auth/logout`);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthState();
      toast.success('Logged out successfully');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
