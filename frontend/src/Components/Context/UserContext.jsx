import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { setToken, getToken } from '../../api';

const UserContext = createContext();

// Flag to track if CSRF has been initialized (outside component to persist across re-mounts)
let csrfInitialized = false;

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Try to restore user from localStorage on mount
    const savedUser = localStorage.getItem('user_data');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // Check if user is authenticated on app load
  const checkAuthStatus = async () => {
    if (isCheckingAuth) {
      return; // Prevent multiple simultaneous auth checks
    }
    
    setIsCheckingAuth(true);
    console.log('🔍 Checking authentication status...');
    
    // First check if we have a saved user in localStorage
    const savedUser = localStorage.getItem('user_data');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('📦 Found saved user data:', userData);
        
        // Ensure profile picture URL is properly constructed
        if (userData.profilePicture && !userData.profilePicture.startsWith('http')) {
          userData.profilePicture = `http://localhost:8080/storage/${userData.profilePicture}`;
        }
        
        setUser(userData);
      } catch (e) {
        console.error('Failed to parse saved user data:', e);
        localStorage.removeItem('user_data');
      }
    }
    
    // If we have neither a saved user nor a bearer token, skip calling profile
    // This avoids unnecessary 401s before login
    const hasBearerToken = !!getToken();
    if (!savedUser && !hasBearerToken) {
      setLoading(false);
      setIsCheckingAuth(false);
      return;
    }

    try {
      // Verify with backend - cookies are automatically sent with withCredentials: true
      const response = await api.get('/auth/profile', {
        withCredentials: true
      });
      console.log('✅ Authentication successful:', response.data);
      
      // Construct full profile picture URL if it exists
      const userData = { ...response.data };
      if (userData.profilePicture) {
        userData.profilePicture = `http://localhost:8080/storage/${userData.profilePicture}`;
      }
      
      // Save user data to localStorage for persistence
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('❌ Authentication check failed:', error);
      
      // Only clear user if we get a definite 401 (Unauthorized) AND we don't have a saved user
      if (error.response?.status === 401) {
        if (savedUser) {
          // We have saved user data, so keep it - the user might have just logged in
          // and the session is still being established
          console.log('⚠️ 401 but keeping saved user - session may be establishing');
        } else {
          // No saved user and 401 - definitely not authenticated
          console.log('🚫 401 Unauthorized - clearing user data');
          setUser(null);
          localStorage.removeItem('user_data');
          setToken(null);
        }
      } else {
        // For network errors or other issues, keep the saved user
        console.log('⚠️ Network/Server error, keeping saved user if exists');
        if (!savedUser) {
          setUser(null);
        }
      }
    } finally {
      setLoading(false);
      setIsCheckingAuth(false);
    }
  };

  // Login function
const login = async (credentials) => {
  try {
    // Clear any existing auth data
    localStorage.removeItem('user_data');
    sessionStorage.clear();
    
    const response = await api.post('/auth/login', credentials, {
      withCredentials: true
    });
    const { user: userData, userType, redirectTo, expires_at, token } = response.data;
    
    // For cookie-based auth, we don't need to manually set tokens
    // The backend sets httpOnly cookies automatically
    // Only set token if provided (for backward compatibility)
    if (token) {
      setToken(token);
    }
    
    // Construct full profile picture URL if it exists
    if (userData.profilePicture) {
      userData.profilePicture = `http://localhost:8080/storage/${userData.profilePicture}`;
    }
    
    // Save user data to localStorage for persistence across reloads
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
    
    console.log('✅ Login successful, user data saved:', userData);
    
    return { success: true, userType: userType, redirectTo: redirectTo, expires_at: expires_at };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint - cookies will be cleared automatically
      await api.post('/auth/logout', {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user state and all stored data
      setUser(null);
      setToken(null);
      localStorage.removeItem('user_data');
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear CSRF token
      sessionStorage.removeItem('csrf_token');
      
      console.log('✅ User logged out successfully - all auth data cleared');
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      console.log('📝 Attempting registration with data:', userData);
      
      const response = await api.post('/auth/register', userData, {
        withCredentials: true
      });
      
      console.log('✅ Registration successful:', response.data);
      
      // For OTP flow, just return the success response
      // Tokens will be set in httpOnly cookies after OTP verification
      return { ...response.data, success: true };
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  };

  // Verify OTP function
  const verifyOtp = async (otpData) => {
    try {
      const response = await api.post('/auth/verify-otp', otpData, {
        withCredentials: true
      });
      const { user: userData, expires_at, token } = response.data;
      
      // For cookie-based auth, we don't need to manually set tokens
      // The backend sets httpOnly cookies automatically
      // Only set token if provided (for backward compatibility)
      if (token) {
        setToken(token);
      }
      
      // Construct full profile picture URL if it exists
      if (userData.profilePicture) {
        userData.profilePicture = `http://localhost:8080/storage/${userData.profilePicture}`;
      }
      
      // Save user data to localStorage for persistence
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      
      console.log('✅ OTP verified, user data saved:', userData);
      
      return { ...response.data, success: true, expires_at: expires_at };
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
    // Also update localStorage when user data changes
    if (userData) {
      localStorage.setItem('user_data', JSON.stringify(userData));
    }
  };

  useEffect(() => {
    // Initialize CSRF token and check auth status
    const initializeAuth = async () => {
      try {
        // Only initialize CSRF once per session
        if (!csrfInitialized) {
          console.log('🔐 Initializing CSRF token...');
          const response = await api.get('/sanctum/csrf-cookie', {
            withCredentials: true
          });
          
          if (response.data.csrf_token) {
            sessionStorage.setItem('csrf_token', response.data.csrf_token);
            console.log('✅ CSRF token initialized:', response.data.csrf_token);
          }
          
          csrfInitialized = true;
          console.log('✅ CSRF initialization complete');
        } else {
          console.log('ℹ️ CSRF already initialized, skipping...');
        }
        
        // Check authentication status
        await checkAuthStatus();
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
        // Reset flag on error so it can retry later
        if (error.response?.status === 429) {
          console.warn('⚠️ Rate limit hit - will retry on next mount');
        } else {
          csrfInitialized = false; // Allow retry for non-rate-limit errors
        }
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    verifyOtp,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export { UserContext };
