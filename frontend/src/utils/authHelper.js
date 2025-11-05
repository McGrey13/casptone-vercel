// Authentication Helper for Commission Dashboard
// This file provides utilities for managing authentication tokens
import { setGlobalAuthToken, getGlobalAuthToken, clearGlobalAuthToken } from './globalAuthHelper';

export const setAuthToken = (token) => {
  setGlobalAuthToken(token);
  console.log('🔑 Authentication token set');
};

export const getAuthToken = () => {
  return getGlobalAuthToken();
};

export const clearAuthToken = () => {
  clearGlobalAuthToken();
  console.log('🗑️ Authentication token cleared');
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

// Test authentication with the provided token
export const testAuthentication = async () => {
  const token = getAuthToken();
  
  if (!token) {
    console.error('❌ No token available for testing');
    return false;
  }

  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://craftconnect-laravel-backend-2.onrender.com/api';
    const response = await fetch(`${backendUrl}/admin/reports/system-commission?from_date=2025-09-01&to_date=2025-10-06`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'include'
    });

    if (response.status === 200) {
      console.log('✅ Authentication test successful!');
      return true;
    } else if (response.status === 401) {
      console.error('❌ Authentication failed - token expired or invalid');
      return false;
    } else {
      console.error(`❌ Authentication test failed with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Authentication test error:', error);
    return false;
  }
};

// Quick setup function for testing
export const setupTestAuth = () => {
  const testToken = '38|LjCfchmIHZSWh8NSd4IVrAKJlkfhlbq4QttMi4mT2eac6453';
  setAuthToken(testToken);
  console.log('🚀 Test authentication token set!');
  console.log('💡 You can now test the commission dashboard');
  
  // Test the authentication
  testAuthentication().then(success => {
    if (success) {
      console.log('🎉 Authentication is working! Commission dashboard should load now.');
    } else {
      console.log('⚠️ Authentication test failed. Please check your setup.');
    }
  });
};

// Auto-setup for development (uncomment the line below to auto-set the test token)
// setupTestAuth();
