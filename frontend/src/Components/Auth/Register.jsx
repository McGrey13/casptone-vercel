import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, ArrowRight, Mail } from "lucide-react";
import api from "../../api";
import "./Register.css";
import { useUser } from "../Context/UserContext";

const Register = () => {
  const [form, setForm] = useState({
    userName: "",
    userEmail: "",
    userPassword: "",
    userPassword_confirmation: "",
    userContactNumber: "",
    role: "",
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { register } = useUser();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRole = (type) => {
    setForm({ ...form, role: type });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Ensure all required fields are filled
    if (!form.role) {
      setError("Please select a role");
      return;
    }

    try {
      // Reset errors
      setError("");
      setFieldErrors({});
      
      // Call the register function from UserContext
      const result = await register({
        userName: form.userName,
        userEmail: form.userEmail,
        userPassword: form.userPassword,
        userPassword_confirmation: form.userPassword_confirmation,
        userContactNumber: form.userContactNumber,
        role: form.role,
      });

      console.log("Registration result:", result);
      
      // Navigate to OTP verification page with the email and next destination
      navigate("/verify-otp", { 
        state: { 
          email: result.userEmail || form.userEmail,
          registrationSuccess: true,
          redirectTo: form.role === 'seller' ? '/create-store' : undefined
        } 
      });
      
    } catch (err) {
      console.error("Registration error:", err);
      
      if (err.response) {
        // Handle validation errors from the server
        if (err.response.status === 422 && err.response.data?.errors) {
          // Set field-specific errors
          setFieldErrors(err.response.data.errors);
          // Set a general error message if available, or use a default
          setError(err.response.data.message || 'Please correct the errors below.');
          return;
        } else if (err.response.data?.message) {
          // For other types of errors with a message
          setError(err.response.data.message);
          return;
        }
      }
      
      // Fallback error message
      setError('Registration failed. Please try again later.');
    }
  };
  

  return (
    <div className="register-bg">
      {error && (
        <div className="error-message mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
          {Object.keys(fieldErrors).length > 0 && (
            <ul className="mt-2 list-disc list-inside">
              {Object.entries(fieldErrors).map(([field, messages]) => (
                <li key={field}>
                  {messages.map((message, index) => (
                    <div key={index}>{message}</div>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="register-card register-card-large">
        <div className="register-header">
          <div className="register-avatar">
            <User className="h-8 w-8 text-white" />
          </div>
          <div className="register-title">Create Account</div>
          <div className="register-subtitle">Sign up for CraftConnect</div>
        </div>
        <div className="register-tabs">
          <button
            type="button"
            className={`register-tab${form.role === "customer" ? " active" : ""}`}
            onClick={() => handleRole("customer")}
          >
            Customer
          </button>
          <button
            type="button"
            className={`register-tab${form.role === "seller" ? " active" : ""}`}
            onClick={() => handleRole("seller")}
          >
            Seller
          </button>
          <button
            type="button"
            className={`register-tab${form.role === "administrator" ? " active" : ""}`}
            onClick={() => handleRole("administrator")}
          >
            Admin
          </button>
        </div>
        <form onSubmit={handleSubmit} className="register-form">
          <label htmlFor="userName">Name</label>
          <input
            id="userName"
            name="userName" // Corrected name to match state and model
            placeholder="Your name"
            type="text"
            value={form.userName}
            onChange={handleChange}
            required
          />
          <label htmlFor="userEmail">Email</label>
          <div className="input-wrapper">
            <Mail className="input-icon" />
            <input
              id="userEmail"
              name="userEmail" // Corrected name to match state and model
              type="email"
              value={form.userEmail}
              onChange={handleChange}
              placeholder="Email"
              required
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.userEmail ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {fieldErrors.userEmail && (
            <div className="text-red-500 text-sm mt-1">
              {fieldErrors.userEmail[0]}
            </div>
          )}
          <label htmlFor="userPassword">Password</label>
          <input
            id="userPassword"
            name="userPassword" // Corrected name to match state and model
            placeholder="Password"
            type="password"
            value={form.userPassword}
            onChange={handleChange}
            required
          />
          <label htmlFor="userPassword_confirmation">Confirm Password</label>
          <input
            id="userPassword_confirmation"
            name="userPassword_confirmation" // This name is standard for Laravel's 'confirmed' rule
            placeholder="Confirm Password"
            type="password"
            value={form.userPassword_confirmation}
            onChange={handleChange}
            required
          />
          <label htmlFor="userContactNumber">Contact Number</label>
          <input
            id="userContactNumber"
            name="userContactNumber" // Corrected name to match state and model
            placeholder="+63XXXXXXXXXX"
            type="text"
            value={form.userContactNumber}
            onChange={handleChange}
            required
          />
          {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
          <button type="submit" className="submit-btn">
            Register <ArrowRight className="h-4 w-4" />
          </button>
          <div className="register-footer">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;