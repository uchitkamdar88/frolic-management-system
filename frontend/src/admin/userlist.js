import React, { useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

export default function UserList() {
  const admin = JSON.parse(localStorage.getItem("user"));
  
  /* ================= CONSTANTS ================= */
  const API_BASE_URL = "http://localhost:8000";
  
  /* ================= STATES ================= */
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('edit'); // 'edit' or 'view'
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // 'all', 'admin', 'user'
  const [apiError, setApiError] = useState('');
  const [usingDummyData, setUsingDummyData] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    regular: 0
  });
  
  /* ================= FORM STATE ================= */
  const [formData, setFormData] = useState({
    user_id: '',
    userName: '',
    email: '',
    phone: '',
    isAdmin: false
  });

  /* ================= DUMMY DATA ================= */
  const dummyUsers = [
    {
      _id: "u1",
      user_id: "U001",
      userName: "Dhawik Zala",
      email: "dhawik@frolic.com",
      phone: "9876543210",
      isAdmin: true,
      createdAt: "2026-01-01T10:00:00.000Z"
    },
    {
      _id: "u2",
      user_id: "U002",
      userName: "Uchit Kamdar",
      email: "uchit@example.com",
      phone: "9876543211",
      isAdmin: false,
      createdAt: "2026-01-15T11:30:00.000Z"
    },
    {
      _id: "u3",
      user_id: "U003",
      userName: "Dhruv Machhchar",
      email: "dhruv@example.com",
      phone: "9876543212",
      isAdmin: false,
      createdAt: "2026-02-01T09:15:00.000Z"
    },
    {
      _id: "u4",
      user_id: "U004",
      userName: "Jane Smith",
      email: "jane@example.com",
      phone: "9876543213",
      isAdmin: false,
      createdAt: "2026-02-10T14:20:00.000Z"
    },
    {
      _id: "u5",
      user_id: "U005",
      userName: "John Doe",
      email: "john@example.com",
      phone: "9876543214",
      isAdmin: false,
      createdAt: "2026-02-15T16:45:00.000Z"
    }
  ];

  /* ================= INITIALIZATION ================= */
  useEffect(() => {
    AOS.init({ duration: 700, once: true });
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    setLoading(true);
    setApiError('');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
      calculateStats(response.data);
      setUsingDummyData(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      
      // Use dummy data for preview
      setUsers(dummyUsers);
      calculateStats(dummyUsers);
      setUsingDummyData(true);
      setApiError("Unable to connect to server. Showing preview data.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CALCULATE STATS ================= */
  const calculateStats = (userData) => {
    const total = userData.length;
    const admins = userData.filter(u => u.isAdmin).length;
    const regular = total - admins;
    
    setStats({ total, admins, regular });
  };

  /* ================= HANDLE INPUT CHANGE ================= */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  /* ================= RESET FORM ================= */
  const resetForm = () => {
    setFormData({
      user_id: '',
      userName: '',
      email: '',
      phone: '',
      isAdmin: false
    });
    setSelectedUser(null);
  };

  /* ================= OPEN VIEW MODAL ================= */
  const openViewModal = (user) => {
    setSelectedUser(user);
    setFormData({
      user_id: user.user_id,
      userName: user.userName,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin
    });
    setModalMode('view');
    setShowModal(true);
  };

  /* ================= OPEN EDIT MODAL ================= */
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      user_id: user.user_id,
      userName: user.userName,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin
    });
    setModalMode('edit');
    setShowModal(true);
  };

  /* ================= TOGGLE ADMIN STATUS ================= */
  const toggleAdminStatus = async (user) => {
    // Prevent self-demotion
    if (user._id === admin?._id) {
      alert("You cannot change your own admin status");
      return;
    }

    const action = user.isAdmin ? "remove admin rights from" : "make";
    if (!window.confirm(`Are you sure you want to ${action} ${user.userName} as admin?`)) {
      return;
    }

    try {
      // eslint-disable-next-line no-unused-vars
      const updatedUser = { ...user, isAdmin: !user.isAdmin };
      
      // Try API first
      try {
        await axios.put(`${API_BASE_URL}/users/${user._id}`, {
          ...user,
          isAdmin: !user.isAdmin
        });
        
        // Update local state
        const updatedUsers = users.map(u => 
          u._id === user._id ? { ...u, isAdmin: !u.isAdmin } : u
        );
        setUsers(updatedUsers);
        calculateStats(updatedUsers);
        
        alert(`Successfully ${!user.isAdmin ? 'made' : 'removed'} ${user.userName} ${!user.isAdmin ? 'an admin' : 'as admin'}`);
      } catch (error) {
        // Update locally for demo
        const updatedUsers = users.map(u => 
          u._id === user._id ? { ...u, isAdmin: !u.isAdmin } : u
        );
        setUsers(updatedUsers);
        calculateStats(updatedUsers);
        
        alert(`Demo Mode: ${user.userName} ${!user.isAdmin ? 'is now' : 'is no longer'} an admin`);
      }
    } catch (error) {
      console.error("Error toggling admin status:", error);
      alert("Failed to update admin status");
    }
  };

  /* ================= HANDLE UPDATE ================= */
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!formData.userName || !formData.email || !formData.phone) {
      alert("Please fill all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    // Phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      // Try API first
      try {
        await axios.put(`${API_BASE_URL}/users/${selectedUser._id}`, formData);
        alert("User updated successfully!");
      } catch (error) {
        console.warn("API error, updating locally:", error);
        
        // Update locally for demo
        const updatedUsers = users.map(u => 
          u._id === selectedUser._id ? { ...u, ...formData } : u
        );
        setUsers(updatedUsers);
        calculateStats(updatedUsers);
        alert("User updated locally (API not available)!");
      }
      
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      alert(`Failed to update: ${error.response?.data?.error || "Check console for details"}`);
    }
  };

  /* ================= HANDLE DELETE ================= */
  const handleDelete = async (user) => {
    // Prevent self-deletion
    if (user._id === admin?._id) {
      alert("You cannot delete your own account");
      return;
    }

    if (user.isAdmin) {
      if (!window.confirm(`WARNING: ${user.userName} is an admin. Are you sure you want to delete this admin account?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete user ${user.userName}? This action cannot be undone.`)) {
        return;
      }
    }

    try {
      // Try API first
      try {
        await axios.delete(`${API_BASE_URL}/users/${user._id}`);
        alert("User deleted successfully!");
      } catch (error) {
        console.warn("API error, deleting locally:", error);
        
        // Delete locally for demo
        const updatedUsers = users.filter(u => u._id !== user._id);
        setUsers(updatedUsers);
        calculateStats(updatedUsers);
        alert("User deleted locally (API not available)!");
        return;
      }
      
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  /* ================= FILTER USERS ================= */
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = user.user_id.toLowerCase().includes(searchLower) ||
                         user.userName.toLowerCase().includes(searchLower) ||
                         user.email.toLowerCase().includes(searchLower) ||
                         user.phone.includes(searchTerm);
    
    if (filterRole === 'admin') return matchesSearch && user.isAdmin === true;
    if (filterRole === 'user') return matchesSearch && user.isAdmin === false;
    return matchesSearch; // 'all'
  }).sort((a, b) => {
    // Sort admins first, then by name
    if (a.isAdmin === b.isAdmin) {
      return a.userName.localeCompare(b.userName);
    }
    return a.isAdmin ? -1 : 1;
  });

  /* ================= FORMAT DATE ================= */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /* ================= RETRY CONNECTION ================= */
  const retryConnection = () => {
    setApiError('');
    setUsingDummyData(false);
    fetchUsers();
  };

  return (
    <div className="users-page">
      {/* ================= HEADER ================= */}
      <div className="page-header">
        <div>
          <h2 className="page-title">User Management</h2>
          <p className="page-subtitle">Manage all users and admin privileges</p>
        </div>
        <div className="header-stats">
          <div className="stat-card total">
            <i className="bi bi-people-fill"></i>
            <div>
              <span className="stat-label">Total Users</span>
              <span className="stat-value">{stats.total}</span>
            </div>
          </div>
          <div className="stat-card admins">
            <i className="bi bi-shield-fill"></i>
            <div>
              <span className="stat-label">Admins</span>
              <span className="stat-value">{stats.admins}</span>
            </div>
          </div>
          <div className="stat-card users">
            <i className="bi bi-person-fill"></i>
            <div>
              <span className="stat-label">Regular</span>
              <span className="stat-value">{stats.regular}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= API ERROR MESSAGE ================= */}
      {apiError && (
        <div className="api-error" data-aos="fade-down">
          <div className="error-content">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div className="error-text">
              <strong>Connection Error:</strong> {apiError}
              <p className="error-note">Showing preview data. Changes will be saved locally.</p>
            </div>
            <button className="btn-retry" onClick={retryConnection}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* ================= DEMO MODE BANNER ================= */}
      {usingDummyData && !apiError && (
        <div className="demo-banner" data-aos="fade-down">
          <i className="bi bi-info-circle-fill me-2"></i>
          <span>Demo Mode: Using sample data. Changes will be saved locally.</span>
        </div>
      )}

      {/* ================= FILTERS ================= */}
      <div className="filters-section">
        <div className="search-box">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by ID, name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm('')}>
              <i className="bi bi-x-circle-fill"></i>
            </button>
          )}
        </div>
        
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterRole === 'all' ? 'active' : ''}`}
            onClick={() => setFilterRole('all')}
          >
            All Users
          </button>
          <button 
            className={`filter-btn ${filterRole === 'admin' ? 'active' : ''}`}
            onClick={() => setFilterRole('admin')}
          >
            <i className="bi bi-shield-fill me-1"></i> Admins
          </button>
          <button 
            className={`filter-btn ${filterRole === 'user' ? 'active' : ''}`}
            onClick={() => setFilterRole('user')}
          >
            <i className="bi bi-person-fill me-1"></i> Regular Users
          </button>
        </div>
      </div>

      {/* ================= USERS TABLE ================= */}
      {loading ? (
        <div className="loader-container">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="table-container">
          {filteredUsers.length > 0 ? (
            <table className="users-table" data-aos="fade-up">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Registered On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} data-aos="fade-up" data-aos-delay="50">
                    <td>
                      <span className="id-badge">{user.user_id}</span>
                    </td>
                    <td>
                      <div className="user-name-cell">
                        <strong>{user.userName}</strong>
                        {user._id === admin?._id && (
                          <span className="you-badge">You</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <a href={`mailto:${user.email}`} className="email-link">
                        <i className="bi bi-envelope me-1"></i>
                        {user.email}
                      </a>
                    </td>
                    <td>
                      <a href={`tel:${user.phone}`} className="phone-link">
                        <i className="bi bi-telephone me-1"></i>
                        {user.phone}
                      </a>
                    </td>
                    <td>
                      <span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                        <i className={`bi ${user.isAdmin ? 'bi-shield-fill' : 'bi-person-fill'} me-1`}></i>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td>
                      <span className="registration-date">
                        <i className="bi bi-calendar3 me-1"></i>
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon btn-view" 
                          onClick={() => openViewModal(user)}
                          title="View Details"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button 
                          className="btn-icon btn-edit" 
                          onClick={() => openEditModal(user)}
                          title="Edit User"
                          disabled={user._id === admin?._id && !user.isAdmin}
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button 
                          className={`btn-icon ${user.isAdmin ? 'btn-admin-toggle' : 'btn-admin-make'}`}
                          onClick={() => toggleAdminStatus(user)}
                          title={user.isAdmin ? 'Remove Admin Rights' : 'Make Admin'}
                          disabled={user._id === admin?._id}
                        >
                          <i className={`bi ${user.isAdmin ? 'bi-shield-x' : 'bi-shield-plus'}`}></i>
                        </button>
                        <button 
                          className="btn-icon btn-delete" 
                          onClick={() => handleDelete(user)}
                          title="Delete User"
                          disabled={user._id === admin?._id}
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-results">
              <i className="bi bi-people fs-1"></i>
              <p>No users found matching your search</p>
              {searchTerm && (
                <button className="btn-clear" onClick={() => setSearchTerm('')}>
                  <i className="bi bi-x-circle me-2"></i>
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW/EDIT USER MODAL ================= */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content user-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>
                <i className={`bi ${modalMode === 'view' ? 'bi-eye' : 'bi-pencil-square'} me-2`}></i>
                {modalMode === 'view' ? 'User Details' : 'Edit User'}
              </h4>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={modalMode === 'edit' ? handleUpdate : (e) => e.preventDefault()}>
              <div className="modal-body">
                {/* User ID (Read-only) */}
                <div className="form-group">
                  <label className="form-label">User ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.user_id}
                    disabled
                  />
                </div>

                {/* User Name */}
                <div className="form-group">
                  <label className="form-label">
                    Full Name {modalMode === 'edit' && <span className="required">*</span>}
                  </label>
                  <input
                    type="text"
                    name="userName"
                    className="form-control"
                    value={formData.userName}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    required={modalMode === 'edit'}
                    placeholder="Enter full name"
                  />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label">
                    Email Address {modalMode === 'edit' && <span className="required">*</span>}
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    required={modalMode === 'edit'}
                    placeholder="Enter email address"
                  />
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label className="form-label">
                    Phone Number {modalMode === 'edit' && <span className="required">*</span>}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    required={modalMode === 'edit'}
                    maxLength="10"
                    pattern="[0-9]{10}"
                    placeholder="Enter 10-digit mobile number"
                  />
                  {modalMode === 'edit' && (
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Enter 10-digit mobile number
                    </small>
                  )}
                </div>

                {/* Admin Status */}
                <div className="form-group">
                  <label className="form-label">Account Type</label>
                  <div className="role-selector">
                    <label className="role-option">
                      <input
                        type="radio"
                        name="isAdmin"
                        checked={formData.isAdmin === true}
                        onChange={() => setFormData({...formData, isAdmin: true})}
                        disabled={modalMode === 'view' || selectedUser?._id === admin?._id}
                      />
                      <span className={`role-badge admin ${formData.isAdmin ? 'active' : ''}`}>
                        <i className="bi bi-shield-fill me-1"></i>
                        Admin
                      </span>
                    </label>
                    <label className="role-option">
                      <input
                        type="radio"
                        name="isAdmin"
                        checked={formData.isAdmin === false}
                        onChange={() => setFormData({...formData, isAdmin: false})}
                        disabled={modalMode === 'view' || selectedUser?._id === admin?._id}
                      />
                      <span className={`role-badge user ${!formData.isAdmin ? 'active' : ''}`}>
                        <i className="bi bi-person-fill me-1"></i>
                        Regular User
                      </span>
                    </label>
                  </div>
                  {selectedUser?._id === admin?._id && (
                    <small className="text-warning">
                      <i className="bi bi-exclamation-triangle-fill me-1"></i>
                      You cannot change your own role
                    </small>
                  )}
                </div>

                {/* Registration Date (View only) */}
                {selectedUser?.createdAt && (
                  <div className="info-row">
                    <i className="bi bi-calendar3"></i>
                    <span>Registered on: {formatDate(selectedUser.createdAt)}</span>
                  </div>
                )}

                {usingDummyData && (
                  <div className="demo-note">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    <span>Demo Mode: Changes will be saved locally</span>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  <i className="bi bi-x-lg me-2"></i>
                  Close
                </button>
                {modalMode === 'edit' && (
                  <button type="submit" className="btn-save">
                    <i className="bi bi-check-lg me-2"></i>
                    Update User
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .users-page {
          padding: 20px;
        }

        /* Header Styles */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          color: #0f172a;
        }

        .page-subtitle {
          margin: 5px 0 0;
          color: #64748b;
        }

        .header-stats {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 15px 25px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          border: 1px solid #f1f5f9;
          min-width: 150px;
        }

        .stat-card.total i { color: #2563eb; background: #dbeafe; }
        .stat-card.admins i { color: #7c3aed; background: #ede9fe; }
        .stat-card.users i { color: #059669; background: #d1fae5; }

        .stat-card i {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .stat-card div {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
        }

        /* API Error Message */
        .api-error {
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 20px;
        }

        .error-content {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .error-content i {
          color: #dc2626;
          font-size: 24px;
        }

        .error-text {
          flex: 1;
        }

        .error-text strong {
          color: #991b1b;
          display: block;
          margin-bottom: 4px;
        }

        .error-note {
          color: #b91c1c;
          font-size: 13px;
          margin: 4px 0 0;
        }

        .btn-retry {
          background: white;
          border: 1px solid #dc2626;
          color: #dc2626;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
        }

        .btn-retry:hover {
          background: #dc2626;
          color: white;
        }

        /* Demo Banner */
        .demo-banner {
          background: #dbeafe;
          border: 1px solid #93c5fd;
          border-radius: 12px;
          padding: 12px 20px;
          margin-bottom: 20px;
          color: #1e40af;
          display: flex;
          align-items: center;
          font-size: 14px;
        }

        .demo-banner i {
          font-size: 18px;
        }

        /* Filters Section */
        .filters-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          z-index: 1;
        }

        .search-input {
          width: 100%;
          padding: 14px 45px 14px 45px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.3s;
        }

        .search-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .search-clear {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          z-index: 1;
        }

        .search-clear:hover {
          color: #64748b;
        }

        .filter-buttons {
          display: flex;
          gap: 10px;
        }

        .filter-btn {
          padding: 10px 20px;
          border: 2px solid #e2e8f0;
          background: white;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
        }

        .filter-btn:hover {
          background: #f8fafc;
          color: #2563eb;
        }

        .filter-btn.active {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }

        /* Table Styles */
        .table-container {
          background: white;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          border: 1px solid #f1f5f9;
          overflow-x: auto;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1000px;
        }

        .users-table th {
          text-align: left;
          padding: 16px;
          background: #f8fafc;
          color: #475569;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e2e8f0;
        }

        .users-table td {
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
          vertical-align: middle;
        }

        .users-table tr:hover {
          background: #f8fafc;
        }

        .id-badge {
          background: #e2e8f0;
          color: #475569;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          font-family: monospace;
        }

        .user-name-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .you-badge {
          background: #dbeafe;
          color: #1e40af;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .email-link, .phone-link {
          color: #2563eb;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
        }

        .email-link:hover, .phone-link:hover {
          text-decoration: underline;
        }

        .role-badge {
          padding: 6px 12px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
        }

        .role-badge.admin {
          background: #ede9fe;
          color: #5b21b6;
        }

        .role-badge.user {
          background: #dbeafe;
          color: #1e40af;
        }

        .registration-date {
          font-size: 12px;
          color: #64748b;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .action-buttons {
          display: flex;
          gap: 6px;
        }

        .btn-icon {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          background: #f1f5f9;
          color: #475569;
        }

        .btn-icon:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .btn-icon:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-view:hover { background: #2563eb; color: white; }
        .btn-edit:hover { background: #059669; color: white; }
        .btn-admin-toggle:hover { background: #7c3aed; color: white; }
        .btn-admin-make:hover { background: #2563eb; color: white; }
        .btn-delete:hover { background: #dc2626; color: white; }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          backdrop-filter: blur(5px);
        }

        .user-modal {
          width: 95%;
          max-width: 550px;
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .modal-header {
          padding: 24px 30px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #f8fafc, #ffffff);
          border-radius: 24px 24px 0 0;
        }

        .modal-header h4 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          display: flex;
          align-items: center;
        }

        .modal-header h4 i {
          color: #2563eb;
        }

        .modal-close {
          background: #f1f5f9;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #64748b;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: #ef4444;
          color: white;
        }

        .modal-body {
          padding: 30px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #334155;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .required {
          color: #ef4444;
          margin-left: 4px;
        }

        .form-control {
          width: 100%;
          padding: 14px 18px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.2s;
          background: white;
        }

        .form-control:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .form-control:disabled {
          background: #f1f5f9;
          color: #64748b;
          cursor: not-allowed;
        }

        .role-selector {
          display: flex;
          gap: 15px;
          margin-top: 5px;
        }

        .role-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .role-option input[type="radio"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #2563eb;
        }

        .role-option .role-badge {
          padding: 8px 16px;
          opacity: 0.6;
          transition: all 0.2s;
        }

        .role-option .role-badge.active {
          opacity: 1;
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 10px;
          color: #64748b;
          font-size: 13px;
          margin-top: 20px;
        }

        .info-row i {
          color: #2563eb;
        }

        .text-warning {
          color: #d97706;
          display: block;
          margin-top: 5px;
          font-size: 12px;
        }

        .demo-note {
          background: #dbeafe;
          border: 1px solid #93c5fd;
          border-radius: 8px;
          padding: 10px 15px;
          margin-top: 15px;
          color: #1e40af;
          font-size: 13px;
          display: flex;
          align-items: center;
        }

        .modal-footer {
          padding: 20px 30px 30px;
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          border-top: 1px solid #e2e8f0;
          background: white;
          border-radius: 0 0 24px 24px;
        }

        .btn-cancel {
          background: #f1f5f9;
          color: #475569;
          border: none;
          padding: 12px 30px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
        }

        .btn-cancel:hover {
          background: #e2e8f0;
          transform: translateY(-2px);
        }

        .btn-save {
          background: #2563eb;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
        }

        .btn-save:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.3);
        }

        .btn-clear {
          background: transparent;
          border: 2px solid #e2e8f0;
          color: #64748b;
          padding: 8px 20px;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 15px;
          display: inline-flex;
          align-items: center;
        }

        .btn-clear:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        .loader-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .no-results {
          text-align: center;
          padding: 60px;
          color: #94a3b8;
        }

        .no-results i {
          font-size: 48px;
          margin-bottom: 15px;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-stats {
            width: 100%;
            flex-direction: column;
          }

          .stat-card {
            width: 100%;
          }

          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            max-width: 100%;
          }

          .filter-buttons {
            justify-content: space-between;
          }

          .filter-btn {
            flex: 1;
            justify-content: center;
          }

          .users-table {
            min-width: 900px;
          }

          .modal-footer {
            flex-direction: column-reverse;
          }

          .btn-cancel, .btn-save {
            width: 100%;
            justify-content: center;
          }

          .error-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .btn-retry {
            width: 100%;
            justify-content: center;
          }

          .role-selector {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}