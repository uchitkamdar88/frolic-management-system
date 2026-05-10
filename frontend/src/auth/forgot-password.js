import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    // -------- VALIDATION --------
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8000/users/forgot-password",
        { email: trimmedEmail }
      );

      if (res.status === 200) {
        setIsSubmitted(true);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError("This email is not registered.");
      } else {
        setError("Unable to process your request. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4 position-relative">

      {/* Bootstrap Icons */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />

      <div className="card border-0 shadow-lg rounded-4 w-100 overflow-hidden" style={{ maxWidth: "440px" }}>
        
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
              <img
                src="/frolic_logo.png"
                alt="Frolic Logo"
                style={{ height: "55px" }}
              />
            </div>
          </div>

          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-4">
                <h4 className="fw-bold text-dark mb-2">Reset Password</h4>
                <p className="text-muted small d-flex align-items-center justify-content-center gap-1">
                  <i className="bi bi-shield-lock"></i>
                  Enter your email to receive reset instructions
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>

                {/* Error Alert - Enhanced */}
                {error && (
                  <div className="d-flex align-items-center gap-2 alert border-0 py-2 px-3 mb-4" 
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
                <div className="mb-4">
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
                      style={{ height: "50px" }}
                      placeholder="your.email@university.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      disabled={loading}
                      required
                    />
                  </div>
                  <small className="text-muted d-block mt-2">
                    <i className="bi bi-info-circle me-1"></i>
                    We'll send a reset link to this email
                  </small>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 rounded-3 fw-semibold py-3 mb-3"
                  disabled={loading}
                  style={{
                    background: "linear-gradient(135deg, #0d6efd, #0b5ed7)",
                    border: "none",
                    transition: "all 0.2s ease",
                    height: "52px"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = "0 5px 15px rgba(13, 110, 253, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  {loading ? (
                    <span className="d-flex align-items-center justify-content-center gap-2">
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Processing...
                    </span>
                  ) : (
                    <span className="d-flex align-items-center justify-content-center gap-2">
                      Send Reset Link
                      <i className="bi bi-send"></i>
                    </span>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State - Enhanced */
            <div className="text-center py-3">
              {/* Animated Success Icon */}
              <div className="mb-4 position-relative">
                <div className="d-inline-block p-4 rounded-circle" 
                     style={{ 
                       background: "rgba(25, 135, 84, 0.1)",
                       animation: "pulse 2s infinite"
                     }}>
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "4rem" }}></i>
                </div>
              </div>
              
              <h4 className="fw-bold text-dark mb-2">Check Your Email</h4>
              <p className="text-muted mb-4">
                We've sent a password reset link to:
              </p>
              
              {/* Email Display */}
              <div className="bg-light p-3 rounded-3 mb-4" 
                   style={{ 
                     background: "rgba(13, 110, 253, 0.05)",
                     border: "1px dashed rgba(13, 110, 253, 0.2)"
                   }}>
                <span className="fw-semibold text-primary">{email}</span>
              </div>
              
              <p className="small text-muted mb-4">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
                className="btn btn-outline-primary rounded-3 px-4 py-2 fw-semibold"
                style={{ transition: "all 0.2s ease" }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#0d6efd";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#0d6efd";
                }}
              >
                <i className="bi bi-arrow-repeat me-2"></i>
                Try Again
              </button>
            </div>
          )}

          {/* Back to Login Link */}
          <div className="text-center mt-4 pt-3 border-top">
            <Link
              to="/login"
              className="text-decoration-none d-inline-flex align-items-center gap-1"
              style={{ color: "#0d6efd" }}
            >
              <i className="bi bi-arrow-left"></i>
              <span className="fw-medium">Back to Login</span>
            </Link>
          </div>

        </div>
      </div>

      {/* Footer */}
      <p className="position-absolute bottom-0 text-muted small mb-3">
        <i className="bi bi-shield-check me-1"></i>
        Secured by Frolic • © 2026
      </p>

      {/* Animation Styles */}
      <style jsx>{`
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

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
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

        .btn-outline-primary {
          border: 2px solid #0d6efd;
          color: #0d6efd;
        }

        .btn-outline-primary:hover {
          background-color: #0d6efd;
          color: white;
        }
      `}</style>
    </div>
  );
}