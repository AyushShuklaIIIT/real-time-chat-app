/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error('Failed to parse user from localStorage', error);
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token'));
  
  // Since we read from localStorage synchronously, we don't need to start as loading
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login(email, password);
      
      // Update LocalStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Update State
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
        console.error('Login failed', err);
      throw err; // Re-throw so the component can handle the error message
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const { data } = await authAPI.register(username, email, password);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
        console.error('Registration failed', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);