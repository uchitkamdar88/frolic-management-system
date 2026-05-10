import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Save user session
      localStorage.setItem("user", JSON.stringify(data.user));

      // Extract first name
      const firstName = data.user.userName
        ? data.user.userName.split(" ")[0]
        : "User";

      // Save role message for dashboard
      localStorage.setItem(
        "loginRoleMessage",
        data.user.isAdmin
          ? "You’re logged in as Admin."
          : "You’re logged in as User."
      );

      // Show only welcome message here
      setSuccess(`Welcome back, ${firstName}.`);

      // Redirect after short delay
      setTimeout(() => {
        navigate(
          data.user.isAdmin ? "/admin/dashboard" : "/user/dashboard"
        );
      }, 1200);

    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4 position-relative">

      {/* SUCCESS TOAST - Enhanced */}
      {success && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x mt-4"
          style={{ zIndex: 1050, animation: "slideDown 0.3s ease" }}
        >
          <div
            className="d-flex align-items-center gap-2 shadow px-4 py-3"
            style={{
              borderRadius: "50px",
              background: "linear-gradient(135deg, #198754, #157347)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 10px 20px -5px rgba(25, 135, 84, 0.3)"
            }}
          >
            <i className="bi bi-check-circle-fill fs-5"></i>
            <span className="fw-medium">{success}</span>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-lg rounded-4 w-100 overflow-hidden" style={{ maxWidth: "420px" }}>
        
        {/* Top Accent Bar */}
        <div style={{ 
          height: "4px", 
          background: "linear-gradient(90deg, #0d6efd, #0b5ed7, #0d6efd)",
          backgroundSize: "200% 100%",
          animation: "gradientMove 3s ease infinite"
        }}></div>

        <div className="card-body p-4 p-md-5">

          {/* Logo with subtle animation */}
          <div className="text-center mb-4">
            <div className="d-inline-block p-3 rounded-3" 
                 style={{ 
                   background: "rgba(13, 110, 253, 0.05)",
                   animation: "float 3s ease infinite"
                 }}>
              <img src="/frolic_logo.png" alt="Frolic Logo" style={{ height: "55px" }} />
            </div>
          </div>

          {/* Title Section */}
          <div className="text-center mb-4">
            <h4 className="fw-bold text-dark mb-1">Welcome Back</h4>
            <p className="text-muted small d-flex align-items-center justify-content-center gap-1">
              <i className="bi bi-shield-lock-check"></i>
              Login to Frolic Portal
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Error Alert - Enhanced */}
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-4 border-0" 
                   style={{ 
                     borderRadius: "10px",
                     backgroundColor: "rgba(220, 53, 69, 0.1)",
                     color: "#b02a37",
                     borderLeft: "4px solid #dc3545"
                   }}>
                <i className="bi bi-exclamation-triangle-fill"></i>
                <span className="small fw-medium">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary mb-2">
                <i className="bi bi-envelope me-1"></i>
                Email Address
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0 rounded-start-3">
                  <i className="bi bi-envelope-fill text-muted"></i>
                </span>
                <input
                  type="email"
                  className="form-control bg-light border-0 py-2"
                  style={{ 
                    height: "48px",
                    fontSize: "0.95rem"
                  }}
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-2">
              <label className="form-label small fw-semibold text-secondary mb-2">
                <i className="bi bi-lock me-1"></i>
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0 rounded-start-3">
                  <i className="bi bi-lock-fill text-muted"></i>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control bg-light border-0 py-2"
                  style={{ 
                    height: "48px",
                    fontSize: "0.95rem",
                    borderRight: "none"
                  }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btn-light border-0 rounded-end-3"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  style={{ 
                    height: "48px",
                    backgroundColor: "#f8f9fa"
                  }}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="d-flex justify-content-end mb-4">
              <Link to="/forgot-password" 
                    className="text-decoration-none small"
                    style={{ color: "#0d6efd" }}>
                Forgot password?
                <i className="bi bi-chevron-right ms-1 small"></i>
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="btn btn-primary w-100 rounded-3 fw-semibold py-3 mb-3"
              disabled={loading || !!success}
              style={{
                backgroundColor: "#0d6efd",
                border: "none",
                transition: "all 0.2s ease",
                height: "52px"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#0b5ed7";
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 5px 15px rgba(13, 110, 253, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#0d6efd";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              {loading ? (
                <span className="d-flex align-items-center justify-content-center gap-2">
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Logging in...
                </span>
              ) : (
                <span className="d-flex align-items-center justify-content-center gap-2">
                  Login
                  <i className="bi bi-box-arrow-in-right"></i>
                </span>
              )}
            </button>

            {/* Register Link */}
            <p className="text-center text-muted small mt-4 mb-0">
              Don't have an account?{" "}
              <Link to="/register" 
                    className="fw-semibold text-decoration-none"
                    style={{ color: "#0d6efd" }}>
                Create Account
                <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </p>

          </form>
        </div>
      </div>

      {/* Footer */}
      <p className="position-absolute bottom-0 text-muted small mb-3">
        <i className="bi bi-shield-check me-1"></i>
        Secured by Frolic • © 2026
      </p>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .form-control:focus {
          background-color: #fff !important;
          border-color: #86b7fe !important;
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1) !important;
        }

        .input-group:focus-within .input-group-text {
          background-color: #fff !important;
        }

        .btn-primary {
          position: relative;
          overflow: hidden;
        }

        .btn-primary::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.3s, height 0.3s;
        }

        .btn-primary:active::after {
          width: 200px;
          height: 200px;
        }
      `}</style>

      {/* Bootstrap Icons */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
    </div>
  );
}