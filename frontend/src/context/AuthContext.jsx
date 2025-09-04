import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  refreshToken: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Set up axios interceptor for token
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      const storedRefreshToken = localStorage.getItem('refresh_token');
      
      if (storedToken) {
        try {
          setToken(storedToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Get user profile
          const response = await api.get('/auth/profile/');
          setUser(response.data);
        } catch (error) {
          // Token might be expired, try to refresh
          if (storedRefreshToken) {
            try {
              await refreshToken();
            } catch (refreshError) {
              // Refresh failed, clear tokens
              clearAuth();
            }
          } else {
            clearAuth();
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login/', { email, password });
      const { access, refresh, user: userData } = response.data;
      
      setToken(access);
      setUser(userData);
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      return { success: true, user: userData };
    } catch (error) {
      const data = error.response?.data;
      let message = 'Login failed';
      if (typeof data === 'string') {
        message = data;
      } else if (data) {
        message = data.error || data.detail || (Array.isArray(data.non_field_errors) && data.non_field_errors[0]);
        if (!message) {
          // Aggregate first field error if available
          const firstKey = Object.keys(data)[0];
          const firstVal = firstKey ? data[firstKey] : null;
          if (Array.isArray(firstVal) && firstVal.length > 0) message = firstVal[0];
        }
      }
      return { success: false, error: message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  const refreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refresh_token');
      if (!storedRefreshToken) {
        throw new Error('No refresh token');
      }

      const response = await api.post('/auth/token/refresh/', {
        refresh: storedRefreshToken
      });
      
      const { access } = response.data;
      setToken(access);
      localStorage.setItem('access_token', access);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      return access;
    } catch (error) {
      clearAuth();
      throw error;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
