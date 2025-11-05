import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  ArrowRight,
  ShoppingBag,
  Store,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";
import { useUser } from "../Context/UserContext";
import { setToken } from "../../api";
import api from "../../api";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [oauthRole, setOauthRole] = useState(null);
  const [oauthProvider, setOauthProvider] = useState(null); // 'google' or 'facebook'
  const [roleError, setRoleError] = useState("");
  const navigate = useNavigate();
  const { login } = useUser();

  // 🔹 Handle Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
    const result = await login({
      userEmail: email,
      userPassword: password,
      remember: rememberMe,
    });

    // Check if there's a specific redirect path (e.g., for sellers without stores)
    if (result.redirectTo) {
      navigate(result.redirectTo);
    } else if (result.userType === "admin") {
      navigate("/admin");
    } else if (result.userType === "seller") {
      navigate("/seller");
    } else {
      navigate("/home");
  }
    } catch (err) {
      // ✅ OTP handling
      if (
        err.response?.status === 403 &&
        err.response?.data?.message === "Please verify your account before logging in."
      ) {
        navigate("/verify-otp", { state: { email } });
      } else {
        setError(
          err.response?.data?.message ||
            "Login failed. Please check your credentials."
        );
      }
    }
  };

// 🔹 Handle OAuth (Google/Facebook) Login Redirect
useEffect(() => {
  // Remove Facebook's #_=_ hash fragment if present
  if (window.location.hash === '#_=_') {
    window.history.replaceState(null, null, window.location.pathname + window.location.search);
  }

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const userId = params.get("user_id");
  const userType = params.get("user_type");
  const redirectTo = params.get("redirect_to");
  const errorParam = params.get("error");
  const errorMessage = params.get("message");

  // Handle OAuth errors
  if (errorParam) {
    setError(decodeURIComponent(errorMessage || 'OAuth login failed. Please try again.'));
    // Clean URL
    window.history.replaceState(null, null, window.location.pathname);
    return;
  }

  if (token && userId) {
    const fetchUserDataAndLogin = async () => {
      try {
        // Clear any existing storage to prevent conflicts
        sessionStorage.clear();
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");

        // Store token in sessionStorage and set Authorization header
        setToken(token);

        // Fetch user profile data using the token
        const response = await api.get('/auth/profile');
        const userData = response.data;
        
        // Construct full profile picture URL if it exists
        if (userData.profilePicture && !userData.profilePicture.startsWith('http')) {
          const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'https://craftconnect-laravel-backend-2.onrender.com';
          userData.profilePicture = `${backendUrl}/storage/${userData.profilePicture}`;
        }

        // Save user data to localStorage and context
        localStorage.setItem('user_data', JSON.stringify(userData));

        // Navigate to appropriate dashboard
        // Use window.location for full page reload to ensure UserContext initializes
        const targetPath = redirectTo || (userType === "admin" ? "/admin" : userType === "seller" ? "/seller" : "/home");
        
        window.location.href = targetPath;
      } catch (e) {
        setError(`Login failed: ${e.response?.data?.message || e.message}. Please try again.`);
        // Clear token on error
        setToken(null);
        localStorage.clear();
        sessionStorage.clear();
      }
    };

    fetchUserDataAndLogin();
  }
}, [navigate]);

  // 🔹 Trigger Google OAuth
  const handleGoogleLogin = () => {
    setRoleError("");
    setOauthRole(null);
    setOauthProvider('google');
    setIsRoleModalOpen(true);
  };

  // 🔹 Trigger Facebook OAuth
  const handleFacebookLogin = () => {
    setRoleError("");
    setOauthRole(null);
    setOauthProvider('facebook');
    setIsRoleModalOpen(true);
  };

  const handleConfirmOAuthRole = () => {
    if (!oauthRole) {
      setRoleError(`Please select a role to continue with ${oauthProvider === 'google' ? 'Google' : 'Facebook'}.`);
      return;
    }
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://craftconnect-laravel-backend-2.onrender.com/api';
    const authUrl = oauthProvider === 'google' 
      ? `${backendUrl}/auth/google/redirect?role=${oauthRole}`
      : `${backendUrl}/auth/facebook/redirect?role=${oauthRole}`;
    
    window.location.href = authUrl;
  };

  const handleCancelOAuthRole = () => {
    setIsRoleModalOpen(false);
    setOauthProvider(null);
    setOauthRole(null);
  };

  return (
    <>
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-white font-sans">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-white rounded-xl shadow-2xl p-6 sm:p-8 md:p-12">
        <div className="flex flex-col items-center gap-2 pb-6">
          <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center shadow-lg p-2">
            <img src="/logo/_CraftConnect_logo.png" alt="CraftConnect Logo" className="h-24 w-24 object-contain" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#5c3d28] mt-4 text-center">
            Welcome Back
          </div>
          <div className="text-[#7b5a3b] text-center">
            Sign in to your CraftConnect account
          </div>
        </div>

        {/* Role Switch */}
        <div className="grid grid-cols-2 rounded-lg overflow-hidden mb-6 shadow-sm">
          <button
            type="button"
            className={`flex items-center justify-center gap-2 py-2 font-medium text-sm sm:text-base transition-all ${
              role === "customer"
                ? "bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white shadow-md"
                : "bg-white text-[#5c3d28]"
            }`}
            onClick={() => setRole("customer")}
          >
            <ShoppingBag className="h-4 w-4" /> Customer
          </button>
          <button
            type="button"
            className={`flex items-center justify-center gap-2 py-2 font-medium text-sm sm:text-base transition-all ${
              role === "seller"
                ? "bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white shadow-md"
                : "bg-white text-[#5c3d28]"
            }`}
            onClick={() => setRole("seller")}
          >
            <Store className="h-4 w-4" /> Seller
          </button>
        </div>

        {/* Email/Password Login */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-[#5c3d28] font-medium text-base"
            >
              Email
            </label>
            <div className="relative mt-1">
              <Mail className="absolute top-1/2 left-3 -translate-y-1/2 text-[#a4785a] h-4 w-4" />
              <input
                id="email"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-[#d5bfae] rounded-md text-base transition-all focus:border-[#a4785a] focus:outline-none focus:ring-2 focus:ring-[#a4785a]/20"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="password"
                className="block text-[#5c3d28] font-medium text-base"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-[#a4785a] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-[#a4785a] h-4 w-4" />
              <input
                id="password"
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2 border border-[#d5bfae] rounded-md text-base transition-all focus:border-[#a4785a] focus:outline-none focus:ring-2 focus:ring-[#a4785a]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-[#a4785a] hover:text-[#8f674a] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="text-[#a4785a] focus:ring-[#a4785a] h-4 w-4 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="text-sm text-[#5c3d28]">
              Remember me
            </label>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white font-medium py-3 rounded-md text-lg mt-2 shadow-md flex items-center justify-center gap-2 transition-all hover:from-[#8f674a] hover:to-[#6a4c34] hover:shadow-lg"
          >
            {role === "customer" ? "Sign in as Customer" : "Sign in as Seller"}
            <ArrowRight className="h-4 w-4" />
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-[#d5bfae]" />
            <span className="text-sm text-[#7b5a3b]">Or</span>
            <div className="flex-1 h-px bg-[#d5bfae]" />
          </div>

          {/* Social Sign-in Buttons */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white text-[#5c3d28] font-medium py-3 rounded-md text-lg shadow-md flex items-center justify-center gap-3 transition-all hover:bg-gray-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="#5c3d28"
                className="w-5 h-5"
              >
                <path d="M12.24 10.285V14.4H17.47C17.22 18.2 14.545 20.9 11.24 20.9C6.88 20.9 3.24 17.5 3.24 13.15C3.24 8.79 6.88 5.15 11.24 5.15C13.68 5.15 15.39 6.18 16.48 7.2L19.34 4.34C17.47 2.47 14.77 1 11.24 1C5.07 1 0 6.07 0 12.24C0 18.41 5.07 23.48 11.24 23.48C17.41 23.48 21.6 19.33 21.6 12.75C21.6 11.85 21.5 11.15 21.36 10.285H12.24Z" />
              </svg>
              Sign in with Google
            </button>

            <button
              type="button"
              onClick={handleFacebookLogin}
              className="w-full bg-white text-[#5c3d28] font-medium py-3 rounded-md text-lg shadow-md flex items-center justify-center gap-3 transition-all hover:bg-gray-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="#5c3d28"
                className="w-5 h-5"
              >
                <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.33v-9.394H9.412v-3.778h2.918V8.046c0-2.894 1.766-4.47 4.354-4.47.747 0 1.5.056 2.247.112v2.607h-1.55c-1.39 0-1.658.66-1.658 1.624v2.138h3.335l-.434 3.778h-2.901V24h6.587c.732 0 1.325-.593 1.325-1.325V1.325C24 .593 23.407 0 22.675 0z" />
              </svg>
              Sign in with Facebook
            </button>
          </div>

          <div className="text-center text-[#5c3d28] text-sm">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#a4785a] font-medium hover:underline"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>

    {/* Role selection modal for OAuth (Google/Facebook) */}
    {isRoleModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white w-11/12 max-w-md rounded-xl shadow-2xl p-6">
          <div className="text-xl font-semibold text-[#5c3d28] mb-4 text-center">
            Continue with {oauthProvider === 'google' ? 'Google' : 'Facebook'}
          </div>
          <div className="text-sm text-[#7b5a3b] mb-4 text-center">Choose how you want to use CraftConnect</div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              className={`flex flex-col items-center gap-2 py-3 rounded-md border transition-all ${oauthRole === 'customer' ? 'bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white' : 'bg-white text-[#5c3d28] border-[#d5bfae]'}`}
              onClick={() => setOauthRole('customer')}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="text-sm font-medium">Customer</span>
            </button>
            <button
              type="button"
              className={`flex flex-col items-center gap-2 py-3 rounded-md border transition-all ${oauthRole === 'seller' ? 'bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white' : 'bg-white text-[#5c3d28] border-[#d5bfae]'}`}
              onClick={() => setOauthRole('seller')}
            >
              <Store className="h-5 w-5" />
              <span className="text-sm font-medium">Seller</span>
            </button>
          </div>

          {roleError && (
            <div className="text-red-500 text-sm text-center mb-3">{roleError}</div>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-md text-[#5c3d28] bg-gray-100 hover:bg-gray-200"
              onClick={handleCancelOAuthRole}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-md text-white bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34]"
              onClick={handleConfirmOAuthRole}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Login;
