import React, { useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Groups() {
  // eslint-disable-next-line no-unused-vars
  const admin = JSON.parse(localStorage.getItem("user"));
  
  /* ================= STATES ================= */
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvent, setFilterEvent] = useState('all');
  
  /* ================= FORM STATE ================= */
  const [formData, setFormData] = useState({
    groupName: '',
    event_id: '',
    leader_id: '',
    totalMembers: ''
  });

  /* ================= INITIALIZATION ================= */
  useEffect(() => {
    AOS.init({ duration: 700, once: true });
    fetchGroups();
    fetchEvents();
    fetchUsers();
  }, []);

  /* ================= FETCH GROUPS ================= */
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/groups");
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      alert("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH EVENTS ================= */
  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:8000/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  /* ================= HANDLE INPUT CHANGE ================= */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  /* ================= RESET FORM ================= */
  const resetForm = () => {
    setFormData({
      groupName: '',
      event_id: '',
      leader_id: '',
      totalMembers: ''
    });
    setSelectedGroup(null);
  };

  /* ================= OPEN EDIT MODAL ================= */
  const openEditModal = (group) => {
    setSelectedGroup(group);
    setFormData({
      groupName: group.groupName,
      event_id: group.event_id,
      leader_id: group.leader_id,
      totalMembers: group.totalMembers
    });
    setShowModal(true);
  };

  /* ================= HANDLE UPDATE ================= */
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!formData.groupName || !formData.event_id || !formData.leader_id || !formData.totalMembers) {
      alert("Please fill all required fields");
      return;
    }

    try {
      await axios.put(`http://localhost:8000/groups/${selectedGroup.group_id}`, {
        ...formData,
        totalMembers: Number(formData.totalMembers)
      });
      
      alert("Group updated successfully!");
      setShowModal(false);
      resetForm();
      fetchGroups();
    } catch (error) {
      console.error("Error updating group:", error);
      alert(`Failed to update: ${error.response?.data?.error || "Check console for details"}`);
    }
  };

  /* ================= HANDLE DELETE ================= */
  const handleDelete = async (groupId) => {
    if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:8000/groups/${groupId}`);
        alert("Group deleted successfully!");
        fetchGroups();
      } catch (error) {
        console.error("Error deleting group:", error);
        alert("Failed to delete group");
      }
    }
  };

  /* ================= GET EVENT NAME ================= */
  const getEventName = (eventId) => {
    const event = events.find(e => e.event_id === eventId);
    return event ? event.eventName : 'Unknown Event';
  };

  /* ================= GET EVENT FEE ================= */
  const getEventFee = (eventId) => {
    const event = events.find(e => e.event_id === eventId);
    return event ? event.eventFees : 0;
  };

  /* ================= GET LEADER NAME ================= */
  const getLeaderName = (leaderId) => {
    const user = users.find(u => u.user_id === leaderId);
    return user ? user.userName : 'Unknown User';
  };

  /* ================= FILTER GROUPS ================= */
  const filteredGroups = groups.filter(group => {
    // Search filter
    const matchesSearch = group.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getLeaderName(group.leader_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.group_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getEventName(group.event_id).toLowerCase().includes(searchTerm.toLowerCase());
    
    // Event filter
    if (filterEvent !== 'all') {
      return matchesSearch && group.event_id === filterEvent;
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
      month: 'short'
    });
  };

  return (
    <div className="groups-page">
      {/* ================= HEADER ================= */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Groups Management</h2>
          <p className="page-subtitle">View and manage all registered groups</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <i className="bi bi-people-fill"></i>
            <span>Total Groups: {groups.length}</span>
          </div>
          <div className="stat-badge success">
            <i className="bi bi-check-circle-fill"></i>
            <span>All Payments Completed</span>
          </div>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="filters-section">
        <div className="search-box">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by group name, leader, event, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
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

      {/* ================= GROUPS TABLE ================= */}
      {loading ? (
        <div className="loader-container">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="table-container">
          {filteredGroups.length > 0 ? (
            <table className="groups-table" data-aos="fade-up">
              <thead>
                <tr>
                  <th>Group ID</th>
                  <th>Group Name</th>
                  <th>Event</th>
                  <th>Team Leader</th>
                  <th>Members</th>
                  <th>Payment Status</th>
                  <th>Amount Paid</th>
                  <th>Registered On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map((group) => {
                  const eventFee = getEventFee(group.event_id);
                  
                  return (
                    <tr key={group._id} data-aos="fade-up" data-aos-delay="50">
                      <td>
                        <span className="group-id-badge">{group.group_id}</span>
                      </td>
                      <td>
                        <div className="group-name-cell">
                          <strong>{group.groupName}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="event-info">
                          <span className="event-name">{getEventName(group.event_id)}</span>
                          <small className="event-id">{group.event_id}</small>
                        </div>
                      </td>
                      <td>
                        <div className="leader-info">
                          <span className="leader-name">{getLeaderName(group.leader_id)}</span>
                          <small className="leader-id">{group.leader_id}</small>
                        </div>
                      </td>
                      <td>
                        <span className="members-badge">
                          <i className="bi bi-people-fill me-1"></i>
                          {group.totalMembers}
                        </span>
                      </td>
                      <td>
                        <span className="payment-badge paid">
                          <i className="bi bi-check-circle-fill me-1"></i>
                          Paid
                        </span>
                      </td>
                      <td>
                        <span className="amount-paid">{formatCurrency(eventFee)}</span>
                      </td>
                      <td>
                        <span className="registration-date">
                          {formatDate(group.createdAt)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-edit" 
                            onClick={() => openEditModal(group)}
                            title="Edit Group"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button 
                            className="btn-delete" 
                            onClick={() => handleDelete(group.group_id)}
                            title="Delete Group"
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
              <p>No groups found matching your criteria</p>
            </div>
          )}
        </div>
      )}

      {/* ================= EDIT GROUP MODAL ================= */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content group-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>
                <i className="bi bi-pencil-square me-2"></i>
                Edit Group
              </h4>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">
                    Group Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="groupName"
                    className="form-control"
                    value={formData.groupName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter group name"
                  />
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
                        {event.eventName} (Fee: {formatCurrency(event.eventFees)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Team Leader <span className="required">*</span>
                  </label>
                  <select
                    name="leader_id"
                    className="form-control"
                    value={formData.leader_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Team Leader</option>
                    {users.map(user => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.userName} ({user.user_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Total Members <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalMembers"
                    className="form-control"
                    value={formData.totalMembers}
                    onChange={handleInputChange}
                    required
                    min="1"
                    placeholder="Enter total members"
                  />
                </div>

                <div className="info-box">
                  <i className="bi bi-check-circle-fill me-2" style={{ color: '#059669' }}></i>
                  <span>Payment Status: <strong>Paid</strong> - {formatCurrency(getEventFee(formData.event_id))}</span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  <i className="bi bi-x-lg me-2"></i>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  <i className="bi bi-check-lg me-2"></i>
                  Update Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .groups-page {
          padding: 20px;
        }

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

        .stat-badge.success {
          background: linear-gradient(135deg, #059669, #047857);
        }

        .stat-badge i {
          font-size: 20px;
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
        }

        .search-input {
          width: 100%;
          padding: 12px 20px 12px 45px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.3s;
        }

        .search-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .filter-dropdown {
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0 15px;
          min-width: 250px;
        }

        .filter-dropdown i {
          color: #64748b;
        }

        .filter-select {
          width: 100%;
          padding: 12px 15px 12px 5px;
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

        .groups-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1200px;
        }

        .groups-table th {
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

        .groups-table td {
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
        }

        .groups-table tr:hover {
          background: #f8fafc;
        }

        .group-id-badge {
          background: #e2e8f0;
          color: #475569;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          font-family: monospace;
        }

        .group-name-cell {
          font-weight: 500;
        }

        .event-info, .leader-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .event-name, .leader-name {
          font-weight: 500;
          color: #0f172a;
        }

        .event-id, .leader-id {
          font-size: 11px;
          color: #94a3b8;
          font-family: monospace;
        }

        .members-badge {
          background: #dbeafe;
          color: #1e40af;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
        }

        .payment-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
        }

        .payment-badge.paid {
          background: #dcfce7;
          color: #166534;
        }

        .amount-paid {
          font-weight: 600;
          color: #059669;
        }

        .registration-date {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-edit, .btn-delete {
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

        .group-modal {
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

        .form-control::placeholder {
          color: #94a3b8;
          font-size: 13px;
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

        .info-box {
          background: #dcfce7;
          border: 1px solid #86efac;
          border-radius: 12px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
        }

        .info-box i {
          color: #059669;
          font-size: 20px;
        }

        .info-box span {
          color: #166534;
          font-size: 14px;
          line-height: 1.5;
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
            flex-direction: column;
            width: 100%;
          }

          .stat-badge {
            width: 100%;
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

          .groups-table {
            min-width: 1000px;
          }

          .modal-footer {
            flex-direction: column-reverse;
          }

          .btn-cancel, .btn-save {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}