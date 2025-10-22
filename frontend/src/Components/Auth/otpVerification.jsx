import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../Context/UserContext";
import api from "../../api";

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, verifyOtp } = useUser();

  // Email passed from Register.jsx redirect
  const email = location.state?.email;

  useEffect(() => {
    // If user is already logged in and no email is provided, redirect to home
    if (user && !email) {
      navigate("/home");
    }
  }, [user, email, navigate]);

  if (!email) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-red-500 font-medium">No email provided. Please register first.</p>
          <button
            onClick={() => navigate('/register')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Go to Registration
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await verifyOtp({ userEmail: email, otp });

      if (result.success) {
        // Handle redirection logic
        const nextDestination = location.state?.redirectTo || result.redirectTo;
        if (nextDestination) {
          // Special redirect (e.g., to create store for sellers)
          navigate(nextDestination);
        } else if (result.user?.role) {
          // Role-based redirect
          const redirectMap = {
            administrator: "/admin",
            seller: "/seller",
            customer: "/home"
          };
          navigate(redirectMap[result.user.role] || "/home");
        } else {
          // Default redirect
          navigate("/home");
        }
      } else {
        setError(result.message || "OTP verification failed. Please try again.");
      }
    } catch (err) {
      console.error("OTP Verification Error:", err);
      setError(
        err.response?.data?.message || 
        "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Verify Your Email</h2>
        <p className="text-gray-600 text-center mb-6">
          We sent a verification code to <span className="font-semibold">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter verification code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            required
          />

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-black py-2 rounded-lg font-medium transition
              ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification;
