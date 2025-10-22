import React, { createContext, useState, useContext, useEffect } from 'react';
import secureApi from '../../api/secureApi';

const SecureUserContext = createContext();

export const SecureUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app load
  const checkAuthStatus = async () => {
    try {
      // Fetch user profile - cookies are automatically sent
      const response = await secureApi.get('/auth/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Authentication check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      const response = await secureApi.post('/auth/login', credentials);
      const { user: userData, userType, redirectTo, expires_at } = response.data;
      
      setUser(userData);
      
      return { 
        success: true, 
        userType: userType, 
        redirectTo: redirectTo,
        expires_at: expires_at
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint - cookies will be cleared automatically
      await secureApi.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state
      setUser(null);
      console.log('User logged out successfully - all auth data cleared');
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await secureApi.post('/auth/register', userData);
      return { ...response.data, success: true };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Verify OTP function
  const verifyOtp = async (otpData) => {
    try {
      const response = await secureApi.post('/auth/verify-otp', otpData);
      const { user: userData, redirectTo, expires_at } = response.data;
      
      setUser(userData);
      
      return { 
        ...response.data, 
        success: true,
        expires_at: expires_at
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Token refresh function
  const refreshToken = async () => {
    try {
      const response = await secureApi.post('/auth/refresh-token');
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    verifyOtp,
    updateUser,
    refreshToken,
    isAuthenticated: !!user,
  };

  return (
    <SecureUserContext.Provider value={value}>
      {children}
    </SecureUserContext.Provider>
  );
};

export const useSecureUser = () => {
  const context = useContext(SecureUserContext);
  if (!context) {
    throw new Error('useSecureUser must be used within a SecureUserProvider');
  }
  return context;
};

export { SecureUserContext };
