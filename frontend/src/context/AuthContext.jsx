import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) { setLoading(false); return; }
      try {
        const res = await api.get('/auth/me');
        const { _id, username, email, createdAt } = res.data;
        const freshUser = { _id, username, email, createdAt };
        localStorage.setItem('user', JSON.stringify(freshUser));
        setUser(freshUser);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, _id, username, email: userEmail } = res.data;
      const userData = { _id, username, email: userEmail };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast.success(`Welcome back, ${username}`, { icon: '🛡️' });
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed');
      return false;
    }
  };

  const signup = async (username, email, password) => {
    try {
      const res = await api.post('/auth/register', { username, email, password });
      const { token, _id, username: newUsername, email: newEmail } = res.data;
      const userData = { _id, username: newUsername, email: newEmail };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast.success(`Account created — Welcome, ${newUsername}`, { icon: '⚡' });
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
      return false;
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success('Reset Link Sent');
      return { success: true, data: res.data };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
      return { success: false };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      toast.success('PASSWORD RESET SUCCESSFUL');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed — token may have expired');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, changePassword, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
