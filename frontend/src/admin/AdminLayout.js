import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = JSON.parse(localStorage.getItem("user"));
  const profileRef = useRef(null);
  const passwordModalRef = useRef(null);
  const [showProfile, setShowProfile] = useState(false);
  
  /* ================= MODAL STATES ================= */
  const [showDBStatus, setShowDBStatus] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  /* ================= DB STATUS STATE ================= */
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    host: 'localhost:8000',
    database: 'frolic_db',
    responseTime: '0ms',
    lastChecked: null,
    collections: {
      users: 0,
      events: 0,
      groups: 0,
      institutes: 0,
      departments: 0,
      participants: 0,
      winners: 0,
      feedback: 0
    }
  });
  
  /* ================= PASSWORD STATE ================= */
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    step: 'old'
  });
  
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [validatingOldPassword, setValidatingOldPassword] = useState(false);

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    if (!admin || !admin.isAdmin) {
      navigate("/login");
    }
  }, [admin, navigate]);

  useEffect(() => {
    AOS.init({ duration: 700, once: true });
    
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= DB CONNECTION CHECK ================= */
  const checkDBConnection = async () => {
    const startTime = Date.now();
    try {
      await axios.get("http://localhost:8000/users/stats/non-admin-count", { timeout: 5000 });
      const responseTime = Date.now() - startTime;
      
      // Fetch all collection counts
      let userCount = 0, eventsCount = 0, groupsCount = 0, institutesCount = 0, 
          departmentsCount = 0, participantsCount = 0, winnersCount = 0, feedbackCount = 0;
      
      try {
        const userStatsRes = await axios.get("http://localhost:8000/users/stats/non-admin-count");
        userCount = userStatsRes.data.count;
      } catch (e) {}
      
      try {
        const eventsRes = await axios.get("http://localhost:8000/events");
        eventsCount = eventsRes.data.length;
      } catch (e) {}
      
      try {
        const groupsRes = await axios.get("http://localhost:8000/groups");
        groupsCount = groupsRes.data.length;
      } catch (e) {}
      
      try {
        const institutesRes = await axios.get("http://localhost:8000/institute");
        institutesCount = institutesRes.data.length;
      } catch (e) {}
      
      try {
        const departmentsRes = await axios.get("http://localhost:8000/department");
        departmentsCount = departmentsRes.data.length;
      } catch (e) {}
      
      try {
        const participantsRes = await axios.get("http://localhost:8000/participants");
        participantsCount = participantsRes.data.length;
      } catch (e) {}

      try {
        const winnersRes = await axios.get("http://localhost:8000/event-winners");
        winnersCount = winnersRes.data.length;
      } catch (e) {}

      try {
        const feedbackRes = await axios.get("http://localhost:8000/contact");
        feedbackCount = feedbackRes.data.length;
      } catch (e) {}
      
      setDbStatus({
        connected: true,
        host: 'localhost:8000',
        database: 'frolic_db',
        responseTime: `${responseTime}ms`,
        lastChecked: new Date().toLocaleTimeString(),
        collections: {
          users: userCount,
          events: eventsCount,
          groups: groupsCount,
          institutes: institutesCount,
          departments: departmentsCount,
          participants: participantsCount,
          winners: winnersCount,
          feedback: feedbackCount
        }
      });
    } catch (error) {
      if (error.response) {
        setDbStatus(prev => ({
          ...prev,
          connected: true,
          responseTime: `${Date.now() - startTime}ms`,
          lastChecked: new Date().toLocaleTimeString()
        }));
      } else {
        setDbStatus(prev => ({
          ...prev,
          connected: false,
          responseTime: 'Timeout',
          lastChecked: new Date().toLocaleTimeString()
        }));
      }
    }
  };

  /* ================= PASSWORD MANAGEMENT ================= */
  const resetPasswordFlow = () => {
    setShowPasswordModal(false);
    setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "", step: 'old' });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const validateOldPassword = async () => {
    if (!passwordData.oldPassword) {
      setPasswordError('Current password is required');
      return;
    }

    setValidatingOldPassword(true);
    setPasswordError('');

    try {
      const res = await axios.get(`http://localhost:8000/users/${admin._id}`);
      
      if (res.data.password !== passwordData.oldPassword) {
        setPasswordError('Current password is incorrect');
        setValidatingOldPassword(false);
        return;
      }

      setPasswordData({ ...passwordData, step: 'new' });
    } catch (err) {
      console.error("Validation Error:", err);
      setPasswordError('Error validating password. Please try again.');
    } finally {
      setValidatingOldPassword(false);
    }
  };

  const updatePassword = () => {
    if (!passwordData.newPassword) {
      setPasswordError('New password is required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    setPasswordError('');
    setPasswordData({ ...passwordData, step: 'confirm' });
  };

  const confirmPasswordUpdate = async () => {
    if (!passwordData.confirmPassword) {
      setPasswordError('Please confirm your password');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setValidatingOldPassword(true);
    setPasswordError('');

    try {
      await axios.put(`http://localhost:8000/users/${admin._id}`, { 
        password: passwordData.newPassword 
      });

      setPasswordSuccess('Password updated successfully!');
      
      setTimeout(() => {
        resetPasswordFlow();
      }, 2000);
      
    } catch (err) {
      console.error("Update Error:", err);
      setPasswordError('Error updating password. Please try again.');
    } finally {
      setValidatingOldPassword(false);
    }
  };

  const logout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout from the Admin Panel?");
    if (confirmLogout) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const menuItems = [
    { label: "Dashboard", icon: "bi-speedometer2", path: "/admin/dashboard" },
    { label: "Events Management", icon: "bi-calendar-event", path: "/admin/events" },
    { label: "Group Settings", icon: "bi-grid-3x3-gap", path: "/admin/groups" },
    { label: "Departments", icon: "bi-building", path: "/admin/departments" },
    { label: "Institutes", icon: "bi-mortarboard", path: "/admin/institutes" },
    { label: "Winners", icon: "bi-trophy", path: "/admin/winners" },
    { label: "Participants", icon: "bi-people", path: "/admin/participants" },
    { label: "Feedback", icon: "bi-chat-dots", path: "/admin/feedback" },
    { label: "User Control", icon: "bi-shield-lock", path: "/admin/users" },
  ];

  return (
    <div className="admin-layout">
      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        <div className="brand" onClick={() => navigate("/admin/dashboard")}>
          <div className="logo-box">
            <img src="/assets/images/frolic_logo.png" alt="Frolic" />
          </div>
          <h3>Frolic <span>2026</span></h3>
        </div>

        <div className="sidebar-separator"></div>

        <nav className="nav-links">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className={location.pathname === item.path ? "active" : ""}
            >
              <i className={`bi ${item.icon} me-3`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            <i className="bi bi-box-arrow-left me-2"></i> Sign Out
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <section className="main">
        <header className="header">
          <div className="header-left">
            <h2 className="m-0 fw-bold">Admin Panel</h2>
            <p>Welcome, <strong>{admin?.userName}</strong></p>
          </div>

          <div className="profile-area" ref={profileRef}>
            <div className="profile-trigger" onClick={() => setShowProfile(!showProfile)}>
              <div className="avatar">{admin?.userName?.charAt(0)}</div>
              <div className="admin-info d-none d-md-block text-start">
                <strong>{admin?.userName}</strong>
                <span className="extra-small d-block text-muted">Frolic Administrator</span>
              </div>
              <i className="bi bi-chevron-down ms-2 small"></i>
            </div>

            {showProfile && (
              <div className="profile-card animate__animated animate__fadeIn">
                <div className="p-3 border-bottom">
                  <p className="small text-muted mb-1">Signed in as</p>
                  <strong className="d-block text-truncate">{admin?.email}</strong>
                  <div className="admin-badge mt-2">Verified Admin</div>
                </div>
                <div className="p-2">
                  <button className="menu-btn" onClick={() => { 
                    setShowDBStatus(true); 
                    setShowProfile(false);
                    checkDBConnection();
                  }}>
                    <i className="bi bi-database me-2"></i> DB Status & Connection
                  </button>
                  <button className="menu-btn" onClick={() => { 
                    setShowPasswordModal(true); 
                    setShowProfile(false);
                  }}>
                    <i className="bi bi-gear me-2"></i> Change Password
                  </button>
                  <div className="divider my-1"></div>
                  <button className="menu-btn logout text-danger" onClick={logout}>
                    <i className="bi bi-power me-2"></i> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>

        <footer className="footer">
          <span>&copy; 2026 Frolic Event Management System</span>
          <span className="mx-2">|</span>
          <span className="fw-bold text-primary">Admin Control Center</span>
        </footer>
      </section>

      {/* ================= DB STATUS MODAL ================= */}
      {showDBStatus && (
        <div className="modal-overlay" onClick={() => setShowDBStatus(false)}>
          <div className="modal-content db-status-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4><i className="bi bi-database me-2"></i>Database Connection Status</h4>
              <button className="modal-close" onClick={() => setShowDBStatus(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="status-grid">
                <div className="status-item">
                  <span className="status-label">Connection:</span>
                  <span className={`status-value ${dbStatus.connected ? 'text-success' : 'text-danger'}`}>
                    {dbStatus.connected ? '🟢 Connected' : '🔴 Disconnected'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Host:</span>
                  <span className="status-value">{dbStatus.host}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Database:</span>
                  <span className="status-value">{dbStatus.database}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Response Time:</span>
                  <span className="status-value">{dbStatus.responseTime}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Last Checked:</span>
                  <span className="status-value">{dbStatus.lastChecked || 'Never'}</span>
                </div>
              </div>
              
              <div className="collections-section mt-4">
                <h5 className="mb-3"><i className="bi bi-collection me-2"></i>Collection Stats</h5>
                <div className="collections-grid">
                  <div className="collection-item">
                    <span className="collection-name">Users:</span>
                    <span className="collection-count">{dbStatus.collections.users}</span>
                  </div>
                  <div className="collection-item">
                    <span className="collection-name">Events:</span>
                    <span className="collection-count">{dbStatus.collections.events}</span>
                  </div>
                  <div className="collection-item">
                    <span className="collection-name">Groups:</span>
                    <span className="collection-count">{dbStatus.collections.groups}</span>
                  </div>
                  <div className="collection-item">
                    <span className="collection-name">Institutes:</span>
                    <span className="collection-count">{dbStatus.collections.institutes}</span>
                  </div>
                  <div className="collection-item">
                    <span className="collection-name">Departments:</span>
                    <span className="collection-count">{dbStatus.collections.departments}</span>
                  </div>
                  <div className="collection-item">
                    <span className="collection-name">Participants:</span>
                    <span className="collection-count">{dbStatus.collections.participants}</span>
                  </div>
                  <div className="collection-item">
                    <span className="collection-name">Winners:</span>
                    <span className="collection-count">{dbStatus.collections.winners}</span>
                  </div>
                  <div className="collection-item">
                    <span className="collection-name">Feedback:</span>
                    <span className="collection-count">{dbStatus.collections.feedback}</span>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn-refresh" onClick={checkDBConnection}>
                  <i className="bi bi-arrow-repeat me-2"></i>Refresh Status
                </button>
                <button className="btn-close-modal" onClick={() => setShowDBStatus(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= PASSWORD CHANGE MODAL ================= */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={resetPasswordFlow}>
          <div className="modal-content password-modal" ref={passwordModalRef} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4><i className="bi bi-key me-2"></i>Change Password</h4>
              <button className="modal-close" onClick={resetPasswordFlow}>×</button>
            </div>
            
            <div className="modal-body">
              {passwordSuccess ? (
                <div className="success-message">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  {passwordSuccess}
                </div>
              ) : (
                <>
                  {passwordData.step === 'old' && (
                    <div className="password-step">
                      <div className="step-indicator">
                        <span className="step active">1</span>
                        <span className="step-line"></span>
                        <span className="step">2</span>
                        <span className="step-line"></span>
                        <span className="step">3</span>
                      </div>
                      
                      <div className="form-group mt-4">
                        <label className="form-label">
                          <i className="bi bi-shield-lock me-2"></i>
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Enter your current password"
                          value={passwordData.oldPassword}
                          onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                          onKeyPress={(e) => e.key === 'Enter' && validateOldPassword()}
                          autoFocus
                        />
                        {passwordError && (
                          <div className="error-message mt-2">
                            <i className="bi bi-exclamation-triangle-fill me-1"></i>
                            {passwordError}
                          </div>
                        )}
                      </div>
                      
                      <div className="modal-footer mt-4">
                        <button className="btn-cancel" onClick={resetPasswordFlow}>Cancel</button>
                        <button 
                          className="btn-next" 
                          onClick={validateOldPassword}
                          disabled={validatingOldPassword}
                        >
                          {validatingOldPassword ? (
                            <><span className="spinner-border spinner-border-sm me-2"></span>Validating...</>
                          ) : 'Next'}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {passwordData.step === 'new' && (
                    <div className="password-step">
                      <div className="step-indicator">
                        <span className="step completed">✓</span>
                        <span className="step-line"></span>
                        <span className="step active">2</span>
                        <span className="step-line"></span>
                        <span className="step">3</span>
                      </div>
                      
                      <div className="form-group mt-4">
                        <label className="form-label">
                          <i className="bi bi-key me-2"></i>
                          New Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Enter new password (min. 6 characters)"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          onKeyPress={(e) => e.key === 'Enter' && updatePassword()}
                          autoFocus
                        />
                        <small className="text-muted d-block mt-1">
                          Password must be at least 6 characters long
                        </small>
                        {passwordError && (
                          <div className="error-message mt-2">
                            <i className="bi bi-exclamation-triangle-fill me-1"></i>
                            {passwordError}
                          </div>
                        )}
                      </div>
                      
                      <div className="modal-footer mt-4">
                        <button 
                          className="btn-cancel" 
                          onClick={() => setPasswordData({...passwordData, step: 'old', oldPassword: ''})}
                        >
                          Back
                        </button>
                        <button className="btn-next" onClick={updatePassword}>Next</button>
                      </div>
                    </div>
                  )}
                  
                  {passwordData.step === 'confirm' && (
                    <div className="password-step">
                      <div className="step-indicator">
                        <span className="step completed">✓</span>
                        <span className="step-line"></span>
                        <span className="step completed">✓</span>
                        <span className="step-line"></span>
                        <span className="step active">3</span>
                      </div>
                      
                      <div className="form-group mt-4">
                        <label className="form-label">
                          <i className="bi bi-check-circle me-2"></i>
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Re-enter your new password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          onKeyPress={(e) => e.key === 'Enter' && confirmPasswordUpdate()}
                          autoFocus
                        />
                        {passwordError && (
                          <div className="error-message mt-2">
                            <i className="bi bi-exclamation-triangle-fill me-1"></i>
                            {passwordError}
                          </div>
                        )}
                      </div>
                      
                      <div className="modal-footer mt-4">
                        <button 
                          className="btn-cancel" 
                          onClick={() => setPasswordData({...passwordData, step: 'new', confirmPassword: ''})}
                        >
                          Back
                        </button>
                        <button 
                          className="btn-update" 
                          onClick={confirmPasswordUpdate}
                          disabled={validatingOldPassword}
                        >
                          {validatingOldPassword ? (
                            <><span className="spinner-border spinner-border-sm me-2"></span>Updating...</>
                          ) : 'Update Password'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        :root {
          --sidebar-width: 280px;
          --primary-blue: #2563eb;
          --bg-body: #f8fafc;
          --success-green: #10b981;
          --danger-red: #ef4444;
          --dark-bg: #0f172a;
        }

        .admin-layout {
          display: grid;
          grid-template-columns: var(--sidebar-width) 1fr;
          min-height: 100vh;
          background: var(--bg-body);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        /* SIDEBAR */
        .sidebar {
          background: #0f172a;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          color: white;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }

        .sidebar::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
        }

        .sidebar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 4px;
        }

        .brand { display: flex; align-items: center; gap: 12px; padding: 0 10px; cursor: pointer; }
        .logo-box { background: white; padding: 6px; border-radius: 12px; }
        .brand img { height: 38px; }
        .brand h3 { font-size: 22px; margin: 0; font-weight: 800; color: white; }
        .brand h3 span { color: var(--primary-blue); }

        .sidebar-separator { height: 1px; background: rgba(255,255,255,0.05); margin: 25px 10px; }

        .nav-links {
          flex: 1;
          overflow-y: auto;
          padding-right: 5px;
        }

        .nav-links button {
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 6px;
          border: none;
          background: transparent;
          color: #94a3b8;
          text-align: left;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          font-size: 14.5px;
          font-weight: 500;
        }

        .nav-links button:hover { background: rgba(255,255,255,0.08); color: white; }
        .nav-links button.active {
          background: var(--primary-blue);
          color: white;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        .sidebar-footer { margin-top: auto; padding-top: 20px; }
        .logout-btn { 
          background: #ef4444; 
          border: none; 
          color: white; 
          width: 100%; 
          padding: 12px; 
          border-radius: 12px; 
          font-weight: 600; 
          cursor: pointer; 
          transition: 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .logout-btn:hover { background: #dc2626; transform: translateY(-2px); }

        /* HEADER & PROFILE */
        .header {
          background: white;
          padding: 16px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .profile-area { position: relative; }

        .profile-trigger {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          padding: 6px 14px;
          border-radius: 50px;
          transition: 0.2s;
          border: 1px solid transparent;
        }
        .profile-trigger:hover { background: #f1f5f9; border-color: #e2e8f0; }
        
        .avatar {
          width: 40px; height: 40px;
          background: var(--primary-blue);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
        }

        .admin-info strong { font-size: 14px; display: block; color: #1e293b; }
        .extra-small { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }

        .profile-card {
          position: absolute;
          right: 0;
          top: 60px;
          width: 280px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.12);
          border: 1px solid #e2e8f0;
          overflow: hidden;
          z-index: 1000;
        }

        .admin-badge {
          background: #dcfce7;
          color: #166534;
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .menu-btn {
          width: 100%; 
          border: none; 
          background: none;
          padding: 12px 16px; 
          text-align: left;
          font-size: 14px; 
          color: #475569;
          transition: 0.2s;
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 8px;
          cursor: pointer;
        }
        .menu-btn:hover { background: #f8fafc; color: var(--primary-blue); }
        .menu-btn.logout:hover { background: #fef2f2; color: #dc2626; }

        .divider { height: 1px; background: #e2e8f0; margin: 8px 0; }
        .text-danger { color: #dc2626; }

        /* CONTENT AREA */
        .content { padding: 40px; flex: 1; }
        .main { display: flex; flex-direction: column; min-height: 100vh; }

        /* FOOTER */
        .footer {
          padding: 24px 40px;
          color: #94a3b8;
          font-size: 13px;
          border-top: 1px solid #e2e8f0;
          background: white;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 15px;
          margin-top: auto;
        }

        /* MODAL STYLES */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalSlideIn 0.3s ease;
        }

        @keyframes modalSlideIn {
          from { transform: translateY(-30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h4 { margin: 0; font-size: 18px; font-weight: 600; color: #0f172a; }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #64748b;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }
        .modal-close:hover { background: #f1f5f9; color: #0f172a; }

        .modal-body { padding: 24px; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }

        /* DB Status Modal */
        .status-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          background: #f8fafc;
          padding: 16px;
          border-radius: 12px;
        }

        .status-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .status-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-value {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
        }

        .collections-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .collection-item {
          background: #f8fafc;
          padding: 12px;
          border-radius: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .collection-name { font-size: 14px; color: #475569; }
        .collection-count { font-size: 18px; font-weight: 700; color: var(--primary-blue); }

        .btn-refresh {
          background: var(--primary-blue);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-refresh:hover { background: #1d4ed8; transform: translateY(-2px); }

        .btn-close-modal {
          background: #f1f5f9;
          color: #475569;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-close-modal:hover { background: #e2e8f0; }

        /* Password Modal */
        .password-modal { max-width: 450px; }

        .step-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 20px 0;
        }

        .step {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
        }

        .step.active { background: var(--primary-blue); color: white; }
        .step.completed { background: var(--success-green); color: white; }

        .step-line {
          flex: 1;
          height: 2px;
          background: #e2e8f0;
          margin: 0 8px;
        }

        .form-group { margin-bottom: 16px; }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #475569;
          font-size: 14px;
        }

        .form-control {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.2s;
        }
        .form-control:focus {
          outline: none;
          border-color: var(--primary-blue);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .error-message {
          color: var(--danger-red);
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          background: #fef2f2;
          border-radius: 8px;
        }

        .success-message {
          color: var(--success-green);
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: #f0fdf4;
          border-radius: 12px;
          text-align: center;
          justify-content: center;
        }

        .btn-cancel {
          background: #f1f5f9;
          color: #475569;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-cancel:hover { background: #e2e8f0; }

        .btn-next {
          background: var(--primary-blue);
          color: white;
          border: none;
          padding: 10px 30px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-next:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-2px); }
        .btn-next:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-update {
          background: var(--success-green);
          color: white;
          border: none;
          padding: 10px 30px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-update:hover:not(:disabled) { background: #059669; transform: translateY(-2px); }
        .btn-update:disabled { opacity: 0.5; cursor: not-allowed; }

        .text-success { color: var(--success-green); }
        .mt-4 { margin-top: 24px; }
        .mb-3 { margin-bottom: 16px; }
        .me-2 { margin-right: 8px; }
        .ms-2 { margin-left: 8px; }
        .my-1 { margin: 4px 0; }

        @media (max-width: 1024px) {
          .admin-layout { grid-template-columns: 80px 1fr; }
          .sidebar h3, .sidebar span, .sidebar-footer button span { display: none; }
          .nav-links button i { margin: 0 !important; font-size: 22px; }
        }
      `}</style>
    </div>
  );
}