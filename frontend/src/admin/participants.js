import React, { useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Participants() {
  // eslint-disable-next-line no-unused-vars
  const admin = JSON.parse(localStorage.getItem("user"));
  
  /* ================= CONSTANTS ================= */
  const API_BASE_URL = "http://localhost:8000";
  
  /* ================= STATES ================= */
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvent, setFilterEvent] = useState('all');
  const [apiError, setApiError] = useState('');
  const [usingDummyData, setUsingDummyData] = useState(false);
  
  /* ================= FORM STATE ================= */
  const [formData, setFormData] = useState({
    registration_id: '',
    user_id: '',
    event_id: ''
  });

  /* ================= DUMMY DATA ================= */
  const dummyUsers = [
    { _id: "u1", user_id: "U001", userName: "John Doe", email: "john@example.com", phone: "9876543210" },
    { _id: "u2", user_id: "U002", userName: "Uchit Kamdar", email: "uchit@example.com", phone: "9876543211" },
    { _id: "u3", user_id: "U003", userName: "Dhruv Machhchar", email: "dhruv@example.com", phone: "9876543212" },
    { _id: "u4", user_id: "U004", userName: "Jane Smith", email: "jane@example.com", phone: "9876543213" },
    { _id: "u5", user_id: "U010", userName: "Elvish Patel", email: "elvish@example.com", phone: "9876543214" },
    { _id: "u6", user_id: "U011", userName: "Raj Kumar", email: "raj@example.com", phone: "9876543215" }
  ];

  const dummyEvents = [
    { _id: "e1", event_id: "E001", eventName: "The Filmy Paglu", eventFees: 200, isTechnical: false },
    { _id: "e2", event_id: "E002", eventName: "Gully Cricket", eventFees: 500, isTechnical: true },
    { _id: "e3", event_id: "E003", eventName: "Code Wars", eventFees: 300, isTechnical: true },
    { _id: "e4", event_id: "EVT-1771502772186", eventName: "Hackathon 2026", eventFees: 400, isTechnical: true }
  ];

  const dummyGroups = [
    { _id: "g1", group_id: "G001", groupName: "Filmy Fauj", event_id: "E001", leader_id: "U002", totalMembers: 4 },
    { _id: "g2", group_id: "G002", groupName: "Royal Titens", event_id: "E002", leader_id: "U003", totalMembers: 11 },
    { _id: "g3", group_id: "G003", groupName: "Code Crushers", event_id: "E003", leader_id: "U001", totalMembers: 3 }
  ];

  const dummyRegistrations = [
    {
      _id: "r1",
      registration_id: "R001",
      user_id: "U002",
      event_id: "E003",
      createdAt: "2026-02-13T15:34:42.010Z"
    },
    {
      _id: "r2",
      registration_id: "R002",
      user_id: "U002",
      event_id: "E001",
      createdAt: "2026-02-13T15:55:19.074Z"
    },
    {
      _id: "r3",
      registration_id: "R003",
      user_id: "U010",
      event_id: "E001",
      createdAt: "2026-02-14T06:12:16.987Z"
    },
    {
      _id: "r4",
      registration_id: "R004",
      user_id: "U002",
      event_id: "E002",
      createdAt: "2026-02-17T05:44:34.426Z"
    },
    {
      _id: "r5",
      registration_id: "R005",
      user_id: "U011",
      event_id: "EVT-1771502772186",
      createdAt: "2026-02-19T17:31:57.738Z"
    }
  ];

  /* ================= INITIALIZATION ================= */
  useEffect(() => {
    AOS.init({ duration: 700, once: true });
    fetchAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= FETCH ALL DATA ================= */
  const fetchAllData = async () => {
    setLoading(true);
    setApiError('');
    
    try {
      // Try to fetch real data with correct endpoints
      await Promise.all([
        fetchRegistrations(),
        fetchUsers(),
        fetchEvents(),
        fetchGroups()
      ]);
      setUsingDummyData(false);
      setApiError('');
    } catch (error) {
      console.log("Using dummy data for preview");
      setRegistrations(dummyRegistrations);
      setUsers(dummyUsers);
      setEvents(dummyEvents);
      setGroups(dummyGroups);
      setUsingDummyData(true);
      setApiError("Unable to connect to server. Showing preview data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      // Using singular 'registration' as per your backend route
      const response = await axios.get(`${API_BASE_URL}/registration`);
      console.log("Registrations fetched:", response.data);
      setRegistrations(response.data);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      throw error;
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/groups`);
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      throw error;
    }
  };

  /* ================= HELPER FUNCTIONS ================= */
  const getUserName = (userId) => {
    const user = users.find(u => u.user_id === userId);
    return user ? user.userName : 'Unknown User';
  };

  const getUserEmail = (userId) => {
    const user = users.find(u => u.user_id === userId);
    return user ? user.email : 'N/A';
  };

  const getUserPhone = (userId) => {
    const user = users.find(u => u.user_id === userId);
    return user ? user.phone : 'N/A';
  };

  const getEventName = (eventId) => {
    const event = events.find(e => e.event_id === eventId);
    return event ? event.eventName : 'Unknown Event';
  };

  const getEventFees = (eventId) => {
    const event = events.find(e => e.event_id === eventId);
    return event ? event.eventFees : 0;
  };

  const getEventType = (eventId) => {
    const event = events.find(e => e.event_id === eventId);
    return event ? (event.isTechnical ? 'Technical' : 'Non-Technical') : 'Unknown';
  };

  const getUserGroup = (userId, eventId) => {
    // Find if user is in any group for this event (as leader)
    const groupAsLeader = groups.find(g => 
      g.event_id === eventId && g.leader_id === userId
    );
    
    if (groupAsLeader) return groupAsLeader;
    
    // For members, we'd need a members array in groups schema
    // For now, return null if not leader
    return null;
  };

  const getGroupName = (userId, eventId) => {
    const group = getUserGroup(userId, eventId);
    return group ? group.groupName : '—';
  };

  const getGroupDetails = (userId, eventId) => {
    const group = getUserGroup(userId, eventId);
    return group;
  };

  const isGroupLeader = (userId, eventId) => {
    const group = groups.find(g => g.event_id === eventId && g.leader_id === userId);
    return !!group;
  };

  // eslint-disable-next-line no-unused-vars
  const getGroupMembers = (userId, eventId) => {
    const group = getUserGroup(userId, eventId);
    return group ? group.totalMembers : '—';
  };

  /* ================= OPEN EDIT MODAL ================= */
  const openEditModal = (registration) => {
    setSelectedRegistration(registration);
    setFormData({
      registration_id: registration.registration_id,
      user_id: registration.user_id,
      event_id: registration.event_id
    });
    setShowModal(true);
  };

  /* ================= HANDLE INPUT CHANGE ================= */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  /* ================= HANDLE UPDATE ================= */
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!formData.user_id || !formData.event_id) {
      alert("Please fill all required fields");
      return;
    }

    try {
      // Using singular 'registration' with MongoDB _id
      await axios.put(`${API_BASE_URL}/registration/${selectedRegistration._id}`, {
        user_id: formData.user_id,
        event_id: formData.event_id
      });
      alert("Registration updated successfully!");
      setShowModal(false);
      fetchAllData();
    } catch (error) {
      console.error("Error updating registration:", error);
      
      // Update locally for demo
      const updatedRegistrations = registrations.map(r => 
        r._id === selectedRegistration._id ? { 
          ...r, 
          user_id: formData.user_id, 
          event_id: formData.event_id 
        } : r
      );
      setRegistrations(updatedRegistrations);
      alert("Registration updated locally (API not available)!");
      setShowModal(false);
    }
  };

  /* ================= HANDLE DELETE ================= */
  const handleDelete = async (registrationId) => {
    if (window.confirm("Are you sure you want to remove this registration? This action cannot be undone.")) {
      try {
        // Using singular 'registration' with MongoDB _id
        await axios.delete(`${API_BASE_URL}/registration/${registrationId}`);
        alert("Registration removed successfully!");
        fetchAllData();
      } catch (error) {
        console.error("Error deleting registration:", error);
        
        // Delete locally
        const updatedRegistrations = registrations.filter(r => r._id !== registrationId);
        setRegistrations(updatedRegistrations);
        alert("Registration removed locally (API not available)!");
      }
    }
  };

  /* ================= FILTER REGISTRATIONS ================= */
  const filteredRegistrations = registrations.filter(registration => {
    const searchLower = searchTerm.toLowerCase();
    const userName = getUserName(registration.user_id).toLowerCase();
    const eventName = getEventName(registration.event_id).toLowerCase();
    const groupName = getGroupName(registration.user_id, registration.event_id).toLowerCase();
    
    const matchesSearch = registration.registration_id.toLowerCase().includes(searchLower) ||
                         userName.includes(searchLower) ||
                         eventName.includes(searchLower) ||
                         groupName.includes(searchLower) ||
                         registration.user_id.toLowerCase().includes(searchLower);
    
    if (filterEvent !== 'all') {
      return matchesSearch && registration.event_id === filterEvent;
    }
    return matchesSearch;
  });

  /* ================= FORMAT CURRENCY ================= */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  /* ================= FORMAT DATE ================= */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  /* ================= RETRY CONNECTION ================= */
  const retryConnection = () => {
    setApiError('');
    setUsingDummyData(false);
    fetchAllData();
  };

  return (
    <div className="participants-page">
      {/* ================= HEADER ================= */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Event Registrations</h2>
          <p className="page-subtitle">View and manage all event registrations</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <i className="bi bi-people-fill"></i>
            <span>Total Registrations: {registrations.length}</span>
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
            placeholder="Search by ID, name, event, or group..."
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
        
        <div className="filter-dropdown">
          <i className="bi bi-funnel me-2"></i>
          <select 
            value={filterEvent} 
            onChange={(e) => setFilterEvent(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Events</option>
            {events.map(event => (
              <option key={event.event_id} value={event.event_id}>
                {event.eventName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= REGISTRATIONS TABLE ================= */}
      {loading ? (
        <div className="loader-container">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="table-container">
          {filteredRegistrations.length > 0 ? (
            <table className="participants-table" data-aos="fade-up">
              <thead>
                <tr>
                  <th>Registration ID</th>
                  <th>Participant Name</th>
                  <th>Contact Info</th>
                  <th>Event</th>
                  <th>Group</th>
                  <th>Role</th>
                  <th>Payment</th>
                  <th>Registered On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((registration) => {
                  const userGroup = getGroupDetails(registration.user_id, registration.event_id);
                  const isLeader = isGroupLeader(registration.user_id, registration.event_id);
                  const eventFees = getEventFees(registration.event_id);
                  const groupName = userGroup ? userGroup.groupName : '—';
                  const groupMembers = userGroup ? userGroup.totalMembers : '—';
                  
                  return (
                    <tr key={registration._id} data-aos="fade-up" data-aos-delay="50">
                      <td>
                        <span className="id-badge">{registration.registration_id}</span>
                      </td>
                      <td>
                        <div className="user-info">
                          <span className="user-name">{getUserName(registration.user_id)}</span>
                          <small className="user-id">{registration.user_id}</small>
                        </div>
                      </td>
                      <td>
                        <div className="contact-info">
                          <small><i className="bi bi-envelope"></i> {getUserEmail(registration.user_id)}</small>
                          <small><i className="bi bi-telephone"></i> {getUserPhone(registration.user_id)}</small>
                        </div>
                      </td>
                      <td>
                        <div className="event-info">
                          <span className="event-name">{getEventName(registration.event_id)}</span>
                          <small className="event-type">{getEventType(registration.event_id)}</small>
                        </div>
                      </td>
                      <td>
                        {userGroup ? (
                          <div className="group-info">
                            <span className="group-name">{groupName}</span>
                            <small className="group-members">
                              <i className="bi bi-people"></i> {groupMembers} members
                            </small>
                          </div>
                        ) : (
                          <span className="no-group">—</span>
                        )}
                      </td>
                      <td>
                        {isLeader ? (
                          <span className="role-badge leader">
                            <i className="bi bi-star-fill me-1"></i>
                            Team Leader
                          </span>
                        ) : userGroup ? (
                          <span className="role-badge member">
                            <i className="bi bi-person-fill me-1"></i>
                            Member
                          </span>
                        ) : (
                          <span className="role-badge solo">
                            <i className="bi bi-person me-1"></i>
                            Solo
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="payment-badge paid">
                          <i className="bi bi-check-circle-fill me-1"></i>
                          {formatCurrency(eventFees)}
                        </span>
                      </td>
                      <td>
                        <span className="registration-date">
                          {formatDate(registration.createdAt)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-icon btn-edit" 
                            onClick={() => openEditModal(registration)}
                            title="Edit Registration"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button 
                            className="btn-icon btn-delete" 
                            onClick={() => handleDelete(registration._id)}
                            title="Remove Registration"
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="no-results">
              <i className="bi bi-people fs-1"></i>
              <p>No registrations found matching your search</p>
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

      {/* ================= EDIT REGISTRATION MODAL ================= */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content participant-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>
                <i className="bi bi-pencil-square me-2"></i>
                Edit Registration
              </h4>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Registration ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.registration_id}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    User <span className="required">*</span>
                  </label>
                  <select
                    name="user_id"
                    className="form-control"
                    value={formData.user_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.userName} ({user.user_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Event <span className="required">*</span>
                  </label>
                  <select
                    name="event_id"
                    className="form-control"
                    value={formData.event_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Event</option>
                    {events.map(event => (
                      <option key={event.event_id} value={event.event_id}>
                        {event.eventName} ({formatCurrency(event.eventFees)})
                      </option>
                    ))}
                  </select>
                </div>

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
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  <i className="bi bi-check-lg me-2"></i>
                  Update Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .participants-page {
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
        }

        .stat-badge {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.3);
        }

        .stat-badge i {
          font-size: 20px;
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

        .filter-dropdown {
          display: flex;
          align-items: center;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 0 15px;
          min-width: 250px;
        }

        .filter-dropdown i {
          color: #64748b;
        }

        .filter-select {
          width: 100%;
          padding: 14px 15px 14px 5px;
          border: none;
          background: transparent;
          font-size: 14px;
          color: #1e293b;
          cursor: pointer;
          outline: none;
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

        .participants-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1300px;
        }

        .participants-table th {
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

        .participants-table td {
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
          vertical-align: middle;
        }

        .participants-table tr:hover {
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

        .user-info, .event-info, .group-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .user-name, .event-name, .group-name {
          font-weight: 500;
          color: #0f172a;
        }

        .user-id, .event-type, .group-members {
          font-size: 11px;
          color: #94a3b8;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
        }

        .contact-info small {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #64748b;
        }

        .contact-info i {
          color: #2563eb;
          font-size: 11px;
        }

        .role-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
        }

        .role-badge.leader {
          background: #fef9c3;
          color: #854d0e;
        }

        .role-badge.member {
          background: #dbeafe;
          color: #1e40af;
        }

        .role-badge.solo {
          background: #e2e8f0;
          color: #475569;
        }

        .payment-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          background: #dcfce7;
          color: #166534;
        }

        .no-group {
          color: #94a3b8;
          font-style: italic;
          font-size: 12px;
        }

        .registration-date {
          font-size: 12px;
          color: #64748b;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-icon {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-edit {
          background: #e2e8f0;
          color: #2563eb;
        }

        .btn-edit:hover {
          background: #2563eb;
          color: white;
        }

        .btn-delete {
          background: #fee2e2;
          color: #dc2626;
        }

        .btn-delete:hover {
          background: #dc2626;
          color: white;
        }

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

        .participant-modal {
          width: 95%;
          max-width: 600px;
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

        select.form-control {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 15px center;
          background-size: 16px;
          padding-right: 45px;
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

          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            max-width: 100%;
          }

          .filter-dropdown {
            width: 100%;
          }

          .participants-table {
            min-width: 1200px;
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
        }
      `}</style>
    </div>
  );
}