// Seller Authentication Helper
// This file provides utilities for managing seller authentication tokens
import { setGlobalAuthToken, getGlobalAuthToken, clearGlobalAuthToken } from './globalAuthHelper';

export const setSellerAuthToken = (token) => {
  setGlobalAuthToken(token);
  console.log('🔑 Seller authentication token set');
};

export const getSellerAuthToken = () => {
  return getGlobalAuthToken();
};

export const clearSellerAuthToken = () => {
  clearGlobalAuthToken();
  console.log('🗑️ Seller authentication token cleared');
};

export const isSellerAuthenticated = () => {
  const token = getGlobalAuthToken();
  return !!token;
};

// Test seller authentication with the provided token
export const testSellerAuthentication = async () => {
  const token = getGlobalAuthToken();
  
  if (!token) {
    console.error('❌ No seller token available for testing');
    return false;
  }

  try {
    const response = await fetch('http://localhost:8080/api/seller/4/dashboard', {
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
      console.log('✅ Seller authentication test successful!');
      return true;
    } else if (response.status === 401) {
      console.error('❌ Seller authentication failed - token expired or invalid');
      return false;
    } else {
      console.error(`❌ Seller authentication test failed with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Seller authentication test error:', error);
    return false;
  }
};

// Quick setup function for testing
export const setupTestSellerAuth = () => {
  // Use the latest token from our test (Alex Manalo's Shop - User ID 4)
  const testToken = '38|LjCfchmIHZSWh8NSd4IVrAKJlkfhlbq4QttMi4mT2eac6453';
  setSellerAuthToken(testToken);
  console.log('🚀 Test seller authentication token set!');
  console.log('💡 You can now test the seller dashboard');
  
  // Test the authentication
  testSellerAuthentication().then(success => {
    if (success) {
      console.log('🎉 Seller authentication is working! Seller dashboard should load now.');
    } else {
      console.log('⚠️ Seller authentication test failed. Please check your setup.');
    }
  });
};

// Auto-setup for development (uncomment the line below to auto-set the test token)
// setupTestSellerAuth();
