import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Registration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    institute_id: "",
    department_id: "",
  });

  const [institutes, setInstitutes] = useState([]);
  const [departments, setDepartments] = useState([]); // All departments (common for all institutes)
  const [loadingInstitutes, setLoadingInstitutes] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [instituteError, setInstituteError] = useState("");
  const [departmentError, setDepartmentError] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ================= FETCH INSTITUTES FROM DB =================
  useEffect(() => {
    fetchInstitutes();
    fetchAllDepartments(); // Fetch all departments (common for all institutes)
  }, []);

  const fetchInstitutes = async () => {
    setLoadingInstitutes(true);
    setInstituteError("");
    try {
      const response = await axios.get("http://localhost:8000/institute");
      console.log("Institutes fetched:", response.data);
      setInstitutes(response.data);
    } catch (error) {
      console.error("Error fetching institutes:", error);
      setInstituteError("Failed to load institutes. Please refresh the page.");
    } finally {
      setLoadingInstitutes(false);
    }
  };

  // ================= FETCH ALL DEPARTMENTS (COMMON FOR ALL INSTITUTES) =================
  const fetchAllDepartments = async () => {
    setLoadingDepartments(true);
    setDepartmentError("");
    try {
      const response = await axios.get("http://localhost:8000/department");
      console.log("All departments fetched:", response.data);
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartmentError("Failed to load departments. Please refresh the page.");
    } finally {
      setLoadingDepartments(false);
    }
  };

  // ---------------- HANDLE INPUT ----------------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { userName, email, phone, password, confirmPassword, institute_id, department_id } = formData;

    // -------- VALIDATION --------
    if (!userName || !email || !phone || !password || !confirmPassword || !institute_id || !department_id) {
      setError("All fields are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const payload = {
      userName,
      email,
      phone,
      password,
      institute_id,
      department_id,
    };

    try {
      const response = await fetch("http://localhost:8000/users/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed.");
        setLoading(false);
        return;
      }

      // ✅ SUCCESS MESSAGE
      setSuccess("Registration successful. Redirecting to login...");

      // ✅ DELAYED REDIRECT
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Get institute name by ID
  const getInstituteName = (instituteId) => {
    const institute = institutes.find(inst => inst.institute_id === instituteId);
    return institute ? institute.instituteName : '';
  };

  // Get department name by ID
  const getDepartmentName = (departmentId) => {
    const department = departments.find(dept => dept.department_id === departmentId);
    return department ? department.departmentName : '';
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4 position-relative">

      {/* Bootstrap Icons */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />

      {/* ✅ SUCCESS TOAST */}
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

      <div className="card border-0 shadow-lg rounded-4 w-100 overflow-hidden" style={{ maxWidth: "1100px" }}>
        
        {/* Top Accent Bar */}
        <div style={{ 
          height: "4px", 
          background: "linear-gradient(90deg, #0d6efd, #0b5ed7, #0d6efd)",
          backgroundSize: "200% 100%",
          animation: "gradientMove 3s ease infinite"
        }}></div>

        <div className="row g-0">

          {/* LEFT PANEL */}
          <div className="col-md-5 d-none d-md-flex bg-primary text-white p-5 rounded-start-4" 
               style={{
                 background: "linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)",
                 position: "relative",
                 overflow: "hidden"
               }}>
            
            {/* Decorative Elements */}
            <div style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "150px",
              height: "150px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
              transform: "translate(50%, -50%)"
            }}></div>
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100px",
              height: "100px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
              transform: "translate(-30%, 30%)"
            }}></div>
            
            <div className="my-auto position-relative">
              <div className="mb-4">
                <div className="d-inline-block bg-white bg-opacity-20 p-3 rounded-3 mb-4"
                     style={{ backdropFilter: "blur(5px)" }}>
                  <img src="/frolic_logo.png" alt="Frolic Logo" style={{ height: "40px", filter: "brightness(0) invert(1)" }} />
                </div>
              </div>
              
              <h2 className="fw-bold mb-4 display-6">Join Frolic 2026</h2>
              <p className="opacity-75 mb-4 lead small">
                Create your account to participate in institute events,
                manage teams, and track results in real-time.
              </p>
              
              <div className="mt-5">
                <h6 className="fw-semibold mb-3">Why register with us?</h6>
                <ul className="list-unstyled">
                  <li className="mb-3 d-flex align-items-center gap-2">
                    <div className="bg-white bg-opacity-20 p-1 rounded-2">
                      <i className="bi bi-calendar-check fs-6"></i>
                    </div>
                    <span className="small">Easy Event Registration</span>
                  </li>
                  <li className="mb-3 d-flex align-items-center gap-2">
                    <div className="bg-white bg-opacity-20 p-1 rounded-2">
                      <i className="bi bi-people fs-6"></i>
                    </div>
                    <span className="small">Group & Team Management</span>
                  </li>
                  <li className="mb-3 d-flex align-items-center gap-2">
                    <div className="bg-white bg-opacity-20 p-1 rounded-2">
                      <i className="bi bi-bell fs-6"></i>
                    </div>
                    <span className="small">Real-time Updates</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="col-md-7 p-4 p-md-5">
            
            {/* Header */}
            <div className="text-center text-md-start mb-4">
              <h4 className="fw-bold text-dark mb-1">Create Account</h4>
              <p className="text-muted small d-flex align-items-center gap-1 justify-content-center justify-content-md-start">
                <i className="bi bi-person-plus"></i>
                Fill in your details to get started
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {/* Error Alert */}
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

              {/* Institute Error */}
              {instituteError && (
                <div className="alert alert-warning py-2 mb-3 small">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {instituteError}
                </div>
              )}

              {/* Department Error */}
              {departmentError && (
                <div className="alert alert-warning py-2 mb-3 small">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {departmentError}
                </div>
              )}

              {/* Full Name */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary mb-2">
                  <i className="bi bi-person me-1"></i>
                  Full Name <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0 rounded-start-3">
                    <i className="bi bi-person-fill text-muted"></i>
                  </span>
                  <input 
                    type="text" 
                    name="userName" 
                    placeholder="Enter your full name" 
                    className="form-control bg-light border-0 py-2" 
                    style={{ height: "48px" }}
                    value={formData.userName} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary mb-2">
                  <i className="bi bi-envelope me-1"></i>
                  Email Address <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0 rounded-start-3">
                    <i className="bi bi-envelope-fill text-muted"></i>
                  </span>
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="your@email.com" 
                    className="form-control bg-light border-0 py-2" 
                    style={{ height: "48px" }}
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary mb-2">
                  <i className="bi bi-phone me-1"></i>
                  Phone Number <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0 rounded-start-3">
                    <i className="bi bi-telephone-fill text-muted"></i>
                  </span>
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="Enter your 10-digit phone number" 
                    className="form-control bg-light border-0 py-2" 
                    style={{ height: "48px" }}
                    value={formData.phone} 
                    onChange={handleChange} 
                    required 
                    maxLength="10"
                    pattern="[0-9]{10}"
                  />
                </div>
                <small className="text-muted d-block mt-1">
                  <i className="bi bi-info-circle me-1"></i>
                  Enter 10-digit mobile number
                </small>
              </div>

              {/* Institute Dropdown - Dynamic from DB */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary mb-2">
                  <i className="bi bi-building me-1"></i>
                  Institute <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0 rounded-start-3">
                    <i className="bi bi-mortarboard-fill text-muted"></i>
                  </span>
                  <select
                    name="institute_id"
                    className="form-control bg-light border-0 py-2"
                    style={{ height: "48px" }}
                    value={formData.institute_id}
                    onChange={handleChange}
                    required
                    disabled={loadingInstitutes}
                  >
                    <option value="">
                      {loadingInstitutes ? "Loading institutes..." : "Select your institute"}
                    </option>
                    {institutes.map((inst) => (
                      <option key={inst._id} value={inst.institute_id}>
                        {inst.instituteName}
                      </option>
                    ))}
                  </select>
                  {loadingInstitutes && (
                    <span className="input-group-text bg-light border-0">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </span>
                  )}
                </div>
              </div>

              {/* Department Dropdown - Common for all institutes */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary mb-2">
                  <i className="bi bi-diagram-3 me-1"></i>
                  Department <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0 rounded-start-3">
                    <i className="bi bi-grid-3x3-gap-fill text-muted"></i>
                  </span>
                  <select
                    name="department_id"
                    className="form-control bg-light border-0 py-2"
                    style={{ height: "48px" }}
                    value={formData.department_id}
                    onChange={handleChange}
                    required
                    disabled={loadingDepartments}
                  >
                    <option value="">
                      {loadingDepartments ? "Loading departments..." : "Select your department"}
                    </option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept.department_id}>
                        {dept.departmentName}
                      </option>
                    ))}
                  </select>
                  {loadingDepartments && (
                    <span className="input-group-text bg-light border-0">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </span>
                  )}
                </div>
                {departments.length === 0 && !loadingDepartments && (
                  <small className="text-danger mt-1 d-block">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                    No departments available
                  </small>
                )}
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary mb-2">
                  <i className="bi bi-lock me-1"></i>
                  Password <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0 rounded-start-3">
                    <i className="bi bi-lock-fill text-muted"></i>
                  </span>
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password" 
                    placeholder="Create a password" 
                    className="form-control bg-light border-0 py-2" 
                    style={{ height: "48px" }}
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                  />
                  <button
                    type="button"
                    className="btn btn-light border-0 rounded-end-3"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ height: "48px", backgroundColor: "#f8f9fa" }}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                  </button>
                </div>
                <small className="text-muted d-block mt-1">
                  <i className="bi bi-info-circle me-1"></i>
                  Minimum 8 characters
                </small>
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary mb-2">
                  <i className="bi bi-shield-lock me-1"></i>
                  Confirm Password <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0 rounded-start-3">
                    <i className="bi bi-shield-fill-check text-muted"></i>
                  </span>
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword" 
                    placeholder="Re-enter your password" 
                    className="form-control bg-light border-0 py-2" 
                    style={{ height: "48px" }}
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    required 
                  />
                  <button
                    type="button"
                    className="btn btn-light border-0 rounded-end-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ height: "48px", backgroundColor: "#f8f9fa" }}
                  >
                    <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                  </button>
                </div>
              </div>

              {/* Selected Institute/Department Summary */}
              {formData.institute_id && formData.department_id && (
                <div className="mb-4 p-3 bg-light rounded-3">
                  <small className="text-muted d-block mb-2">You're registering as:</small>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <i className="bi bi-building text-primary"></i>
                    <span className="fw-medium">{getInstituteName(formData.institute_id)}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-diagram-3 text-primary"></i>
                    <span className="fw-medium">
                      {getDepartmentName(formData.department_id)}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-100 rounded-3 fw-semibold py-3 mb-3"
                disabled={loading || !!success || loadingInstitutes || loadingDepartments}
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
                    Creating Account...
                  </span>
                ) : (
                  <span className="d-flex align-items-center justify-content-center gap-2">
                    Create Account
                    <i className="bi bi-arrow-right"></i>
                  </span>
                )}
              </button>

              {/* Login Link */}
              <p className="text-center text-muted small mt-3 mb-0">
                Already have an account?{" "}
                <Link to="/login" 
                      className="fw-semibold text-decoration-none"
                      style={{ color: "#0d6efd" }}>
                  Sign In
                  <i className="bi bi-chevron-right ms-1 small"></i>
                </Link>
              </p>

            </form>
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

        .bg-opacity-20 {
          --bs-bg-opacity: 0.2;
        }

        select.form-control {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 15px center;
          background-size: 16px;
          padding-right: 45px;
        }

        select.form-control:disabled {
          background-color: #e9ecef;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}