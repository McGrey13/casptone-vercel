import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import api from "../../api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    // Check for capital letter
    if (!/[A-Z]/.test(formData.password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(formData.password)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }

    // Check for number
    if (!/[0-9]/.test(formData.password)) {
      setError("Password must contain at least one number.");
      return;
    }

    // Check for special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      setError("Password must contain at least one special character (!@#$%^&* etc.).");
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/reset-password", {
        email: email,
        token: token,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#5c3d28] mb-4">
              Password Reset Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset. You can now log in with
              your new password.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white font-medium py-3 rounded-md transition-all hover:from-[#8f674a] hover:to-[#6a4c34]"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#5c3d28] mb-4">
              Invalid Reset Link
            </h2>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request
              a new password reset.
            </p>
            <button
              onClick={() => navigate("/forgot-password")}
              className="w-full bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white font-medium py-3 rounded-md transition-all hover:from-[#8f674a] hover:to-[#6a4c34]"
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-lg p-2">
            <img
              src="/logo/_CraftConnect_logo.png"
              alt="CraftConnect Logo"
              className="h-20 w-20 object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-[#5c3d28]">
            Reset Your Password
          </h2>
          <p className="text-center text-gray-600 text-sm">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-[#5c3d28] font-medium mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-[#a4785a] h-5 w-5" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="w-full pl-10 pr-10 py-3 border border-[#d5bfae] rounded-md focus:border-[#a4785a] focus:outline-none focus:ring-2 focus:ring-[#a4785a]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-[#a4785a] hover:text-[#8f674a] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Must contain: 8+ characters, uppercase, lowercase, number, and symbol
            </p>
          </div>

          <div>
            <label
              htmlFor="password_confirmation"
              className="block text-[#5c3d28] font-medium mb-2"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-[#a4785a] h-5 w-5" />
              <input
                id="password_confirmation"
                type={showPasswordConfirmation ? "text" : "password"}
                placeholder="Confirm new password"
                value={formData.password_confirmation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password_confirmation: e.target.value,
                  })
                }
                required
                className="w-full pl-10 pr-10 py-3 border border-[#d5bfae] rounded-md focus:border-[#a4785a] focus:outline-none focus:ring-2 focus:ring-[#a4785a]/20"
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-[#a4785a] hover:text-[#8f674a] transition-colors"
              >
                {showPasswordConfirmation ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white font-medium py-3 rounded-md transition-all hover:from-[#8f674a] hover:to-[#6a4c34] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
