import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import api from "../../api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", {
        userEmail: email,
      });

      setSuccess(true);
    } catch (err) {
      // Handle different error formats
      let errorMessage = "Failed to send reset link. Please try again.";
      
      console.error('Forgot password error:', err.response?.data || err.message);
      
      if (err.response?.data) {
        // Check for validation errors
        if (err.response.data.errors?.userEmail) {
          errorMessage = err.response.data.errors.userEmail[0] || "This email address is not registered.";
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      }
      
      setError(errorMessage);
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
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-2">
              We've sent a password reset link to:
            </p>
            <p className="font-medium text-[#5c3d28] mb-6">{email}</p>
            <p className="text-sm text-gray-600 mb-6">
              Click the link in the email to reset your password. The link will
              expire in 1 hour.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white font-medium py-3 rounded-md transition-all hover:from-[#8f674a] hover:to-[#6a4c34]"
              >
                Back to Login
              </button>
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                }}
                className="w-full bg-gray-100 text-[#5c3d28] font-medium py-3 rounded-md hover:bg-gray-200 transition-all"
              >
                Resend Email
              </button>
            </div>
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
            Forgot Password?
          </h2>
          <p className="text-center text-gray-600 text-sm">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-[#5c3d28] font-medium mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 -translate-y-1/2 text-[#a4785a] h-5 w-5" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-[#d5bfae] rounded-md focus:border-[#a4785a] focus:outline-none focus:ring-2 focus:ring-[#a4785a]/20"
              />
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
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-[#a4785a] hover:text-[#8f674a] font-medium text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
