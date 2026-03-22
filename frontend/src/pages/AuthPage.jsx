import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import "./AuthPage.css";
import logo from "../assets/logo.png";

function AuthPage() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔥 VALIDATE EMAIL
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 🔥 VALIDATE PASSWORD
  const validatePassword = (pwd) => {
    return pwd.length >= 6;
  };

  // 🔥 VALIDATE FORM
  const validateForm = () => {
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!password) {
      setError("Password is required");
      return false;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    const url = isLogin
      ? "http://localhost:8000/api/auth/login"
      : "http://localhost:8000/api/auth/register";

    setLoading(true);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Auth response:", data);

      if (!res.ok) {
        // Handle different error messages
        const errorMessage = 
          data?.detail || 
          data?.message || 
          (Array.isArray(data?.detail) ? data.detail[0]?.msg : "Something went wrong");
        
        setError(String(errorMessage));
        return;
      }

      // ✅ SUCCESS
      if (data?.token) {
        localStorage.setItem("token", data.token);
        setSuccess(isLogin ? "Login successful! Redirecting..." : "Account created! Redirecting...");
        
        // Redirect after 1 second
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } else {
        setError("No token received from server");
      }

    } catch (err) {
      console.error("Auth error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-box">
          {/* Logo */}
          <div className="auth-logo-section">
            <img src={logo} alt="LEGISAID Logo" className="auth-logo" />
            <h1>LEGISAID</h1>
            <p className="auth-subtitle">AI Legal Document Analysis</p>
          </div>

          {/* Heading */}
          <div className="auth-header">
            <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
            <p className="auth-description">
              {isLogin
                ? "Login to access your documents"
                : "Sign up to get started"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-alert">
              <span>❌</span>
              <p>{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="success-alert">
              <span>✅</span>
              <p>{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  disabled={loading}
                  className={error.includes("email") ? "input-error" : ""}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  disabled={loading}
                  className={error.includes("password") || error.includes("Password") ? "input-error" : ""}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {!isLogin && (
                <small className="password-hint">
                  At least 6 characters
                </small>
              )}
            </div>

            {/* Confirm Password Input (Sign Up Only) */}
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    disabled={loading}
                    className={error.includes("match") ? "input-error" : ""}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="spinner" />
                  <span>{isLogin ? "Logging in..." : "Creating account..."}</span>
                </>
              ) : (
                <span>{isLogin ? "Login" : "Sign Up"}</span>
              )}
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="auth-toggle">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                className="toggle-link"
                onClick={toggleMode}
                disabled={loading}
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>

          {/* Footer */}
          <div className="auth-footer">
            <p className="terms-text">
              By continuing, you agree to our{" "}
              <a href="#terms">Terms of Service</a> and{" "}
              <a href="#privacy">Privacy Policy</a>
            </p>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="auth-decoration">
          <div className="decoration-blob decoration-blob-1"></div>
          <div className="decoration-blob decoration-blob-2"></div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;