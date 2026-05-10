/* eslint-disable no-template-curly-in-string */
import React, { useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Winners() {
  // eslint-disable-next-line no-unused-vars
  const admin = JSON.parse(localStorage.getItem("user"));
  
  /* ================= CONSTANTS ================= */
  const API_BASE_URL = "http://localhost:8000";
  
  /* ================= STATES ================= */
  const [loading, setLoading] = useState(true);
  const [winners, setWinners] = useState([]);
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvent, setFilterEvent] = useState('all');
  const [apiError, setApiError] = useState('');
  const [usingDummyData, setUsingDummyData] = useState(false);
  
  /* ================= FORM STATE ================= */
  const [formData, setFormData] = useState({
    event_id: '',
    group_id: '',
    position: '',
    prizeAmount: ''
  });

  /* ================= DUMMY DATA ================= */
  const dummyEvents = [
    { _id: "e1", event_id: "E001", eventName: "The Filmy Paglu", eventFirstPrize: "7000", eventSecondPrize: "5000", eventThirdPrize: "3000" },
    { _id: "e2", event_id: "E002", eventName: "Gully Cricket", eventFirstPrize: "5000", eventSecondPrize: "3000", eventThirdPrize: "2000" },
    { _id: "e3", event_id: "E003", eventName: "Code Wars", eventFirstPrize: "10000", eventSecondPrize: "7000", eventThirdPrize: "4000" }
  ];

  const dummyGroups = [
    { _id: "g1", group_id: "G001", groupName: "Filmy Fauj", event_id: "E001", leader_id: "U002" },
    { _id: "g2", group_id: "G002", groupName: "Royal Titens", event_id: "E002", leader_id: "U003" },
    { _id: "g3", group_id: "G003", groupName: "Code Crushers", event_id: "E003", leader_id: "U004" },
    { _id: "g4", group_id: "G004", groupName: "Debuggers", event_id: "E003", leader_id: "U005" }
  ];

  const dummyWinners = [
    {
      _id: "w1",
      event_id: "E001",
      group_id: "G001",
      position: 1,
      prizeAmount: "7000",
      createdAt: "2026-02-09T17:15:25.089Z"
    },
    {
      _id: "w2",
      event_id: "E002",
      group_id: "G002",
      position: 2,
      prizeAmount: "5000",
      createdAt: "2026-02-10T15:01:57.041Z"
    },
    {
      _id: "w3",
      event_id: "E003",
      group_id: "G003",
      position: 1,
      prizeAmount: "10000",
      createdAt: "2026-02-11T10:30:00.000Z"
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
      await Promise.all([
        fetchWinners(),
        fetchEvents(),
        fetchGroups()
      ]);
      setUsingDummyData(false);
    } catch (error) {
      console.log("Using dummy data for preview");
      setWinners(dummyWinners);
      setEvents(dummyEvents);
      setGroups(dummyGroups);
      setUsingDummyData(true);
      setApiError("Unable to connect to server. Showing preview data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWinners = async () => {
    try {
      // Try both possible endpoints
      let response;
      try {
        response = await axios.get(`${API_BASE_URL}/eventwinners`);
      } catch (error) {
        // If eventwinners fails, try event-winners
        response = await axios.get(`${API_BASE_URL}/event-winners`);
      }
      setWinners(response.data);
    } catch (error) {
      console.error("Error fetching winners:", error);
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
  const getEventName = (eventId) => {
    const event = events.find(e => e.event_id === eventId);
    return event ? event.eventName : 'Unknown Event';
  };

  const getGroupName = (groupId) => {
    const group = groups.find(g => g.group_id === groupId);
    return group ? group.groupName : 'Unknown Group';
  };

  const getPositionLabel = (position) => {
    switch(position) {
      case 1: return { label: '1st Place', icon: '🥇', class: 'first' };
      case 2: return { label: '2nd Place', icon: '🥈', class: 'second' };
      case 3: return { label: '3rd Place', icon: '🥉', class: 'third' };
      default: return { label: `${position}th Place`, icon: '🏆', class: 'other' };
    }
  };

  const getPrizeForPosition = (eventId, position) => {
    const event = events.find(e => e.event_id === eventId);
    if (!event) return '';
    
    switch(position) {
      case 1: return event.eventFirstPrize || '';
      case 2: return event.eventSecondPrize || '';
      case 3: return event.eventThirdPrize || '';
      default: return '';
    }
  };

  /* ================= RESET FORM ================= */
  const resetForm = () => {
    setFormData({
      event_id: '',
      group_id: '',
      position: '',
      prizeAmount: ''
    });
    setSelectedWinner(null);
  };

  /* ================= OPEN ADD MODAL ================= */
  const openAddModal = () => {
    resetForm();
    setModalMode('add');
    setShowModal(true);
  };

  /* ================= OPEN EDIT MODAL ================= */
  const openEditModal = (winner) => {
    setSelectedWinner(winner);
    setFormData({
      event_id: winner.event_id,
      group_id: winner.group_id,
      position: winner.position,
      prizeAmount: winner.prizeAmount || ''
    });
    setModalMode('edit');
    setShowModal(true);
  };

  /* ================= HANDLE INPUT CHANGE ================= */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'event_id') {
      // Reset group when event changes
      setFormData({
        ...formData,
        event_id: value,
        group_id: '',
        prizeAmount: getPrizeForPosition(value, formData.position)
      });
    } else if (name === 'position') {
      // Auto-fill prize amount based on event and position
      setFormData({
        ...formData,
        position: value,
        prizeAmount: getPrizeForPosition(formData.event_id, parseInt(value))
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  /* ================= HANDLE SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.event_id || !formData.group_id || !formData.position) {
      alert("Please fill all required fields");
      return;
    }

    // Check if position already taken for this event (except when editing same winner)
    const existingWinner = winners.find(w => 
      w.event_id === formData.event_id && 
      w.position === parseInt(formData.position) &&
      (modalMode === 'add' || w._id !== selectedWinner?._id)
    );

    if (existingWinner) {
      alert(`Position ${formData.position} is already taken for this event by ${getGroupName(existingWinner.group_id)}`);
      return;
    }

    try {
      // Try both possible endpoints
      let url;
      if (modalMode === 'add') {
        url = `${API_BASE_URL}/eventwinners/add`;
      } else {
        url = `${API_BASE_URL}/eventwinners/${selectedWinner.event_id}`;
      }
      
      try {
        await axios.post(url, {
          ...formData,
          position: parseInt(formData.position)
        });
        alert("Winner added successfully!");
      } catch (error) {
        // If eventwinners fails, try event-winners
        if (modalMode === 'add') {
          url = `${API_BASE_URL}/event-winners/add`;
        } else {
          url = `${API_BASE_URL}/event-winners/${selectedWinner.event_id}`;
        }
        await axios.post(url, {
          ...formData,
          position: parseInt(formData.position)
        });
        alert("Winner added successfully!");
      }
      
      setShowModal(false);
      resetForm();
      fetchAllData();
    } catch (error) {
      console.error("Error saving winner:", error);
      
      // Update locally for demo
      if (modalMode === 'add') {
        const newWinner = {
          _id: Date.now().toString(),
          ...formData,
          position: parseInt(formData.position),
          createdAt: new Date().toISOString()
        };
        setWinners([...winners, newWinner]);
        alert("Winner added locally (API not available)!");
      } else {
        const updatedWinners = winners.map(w => 
          w._id === selectedWinner._id ? { ...w, ...formData, position: parseInt(formData.position) } : w
        );
        setWinners(updatedWinners);
        alert("Winner updated locally (API not available)!");
      }
      setShowModal(false);
    }
  };

  /* ================= HANDLE DELETE ================= */
  const handleDelete = async (winner) => {
    if (window.confirm(`Are you sure you want to remove ${getGroupName(winner.group_id)} from ${getPositionLabel(winner.position).label}?`)) {
      try {
        // Try both possible endpoints
        try {
          await axios.delete(`${API_BASE_URL}/eventwinners/${winner.event_id}`);
        } catch (error) {
          await axios.delete(`${API_BASE_URL}/event-winners/${winner.event_id}`);
        }
        alert("Winner removed successfully!");
        fetchAllData();
      } catch (error) {
        console.error("Error deleting winner:", error);
        
        // Delete locally
        const updatedWinners = winners.filter(w => w._id !== winner._id);
        setWinners(updatedWinners);
        alert("Winner removed locally (API not available)!");
      }
    }
  };

  /* ================= FILTER WINNERS ================= */
  const filteredWinners = winners.filter(winner => {
    const searchLower = searchTerm.toLowerCase();
    const eventName = getEventName(winner.event_id).toLowerCase();
    const groupName = getGroupName(winner.group_id).toLowerCase();
    const positionLabel = getPositionLabel(winner.position).label.toLowerCase();
    
    return eventName.includes(searchLower) ||
           groupName.includes(searchLower) ||
           positionLabel.includes(searchLower) ||
           winner.event_id.toLowerCase().includes(searchLower) ||
           winner.group_id.toLowerCase().includes(searchLower);
  }).filter(winner => {
    if (filterEvent !== 'all') {
      return winner.event_id === filterEvent;
    }
    return true;
  }).sort((a, b) => {
    // Sort by event name then position
    if (a.event_id === b.event_id) {
      return a.position - b.position;
    }
    return getEventName(a.event_id).localeCompare(getEventName(b.event_id));
  });

  /* ================= FORMAT CURRENCY ================= */
  const formatCurrency = (amount) => {
    if (!amount) return '—';
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
    <div className="winners-page">
      {/* ================= HEADER ================= */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Event Winners Management</h2>
          <p className="page-subtitle">Manage winners for all events</p>
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          <i className="bi bi-plus-circle me-2"></i>
          Add New Winner
        </button>
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
            placeholder="Search by event, group, or position..."
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

      {/* ================= WINNERS GRID ================= */}
      {loading ? (
        <div className="loader-container">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="winners-container">
          {filteredWinners.length > 0 ? (
            <div className="winners-grid">
              {filteredWinners.map((winner) => {
                const positionInfo = getPositionLabel(winner.position);
                const eventName = getEventName(winner.event_id);
                const groupName = getGroupName(winner.group_id);
                const positionClass = positionInfo.class;
                
                return (
                  <div className="winner-card" key={winner._id} data-aos="fade-up">
                    <div className={`winner-position-badge ${positionClass}`}>
                      <span className="position-icon">{positionInfo.icon}</span>
                      <span className="position-text">{positionInfo.label}</span>
                    </div>
                    
                    <div className="winner-content">
                      <div className="winner-event">
                        <i className="bi bi-calendar-event"></i>
                        <div>
                          <span className="event-name">{eventName}</span>
                          <small className="event-id">{winner.event_id}</small>
                        </div>
                      </div>
                      
                      <div className="winner-group">
                        <i className="bi bi-people-fill"></i>
                        <div>
                          <span className="group-name">{groupName}</span>
                          <small className="group-id">{winner.group_id}</small>
                        </div>
                      </div>
                      
                      <div className="winner-prize">
                        <i className="bi bi-trophy-fill"></i>
                        <span className="prize-amount">{formatCurrency(winner.prizeAmount)}</span>
                      </div>
                      
                      <div className="winner-date">
                        <i className="bi bi-clock"></i>
                        <span>{formatDate(winner.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="winner-actions">
                      <button 
                        className="btn-icon btn-edit" 
                        onClick={() => openEditModal(winner)}
                        title="Edit Winner"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button 
                        className="btn-icon btn-delete" 
                        onClick={() => handleDelete(winner)}
                        title="Remove Winner"
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-results">
              <i className="bi bi-trophy fs-1"></i>
              <p>No winners found matching your search</p>
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

      {/* ================= ADD/EDIT WINNER MODAL ================= */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content winner-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>
                <i className={`bi ${modalMode === 'add' ? 'bi-plus-circle' : 'bi-pencil-square'} me-2`}></i>
                {modalMode === 'add' ? 'Add New Winner' : 'Edit Winner'}
              </h4>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Event Selection */}
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
                        {event.eventName} ({event.event_id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Group Selection - Filtered by selected event */}
                <div className="form-group">
                  <label className="form-label">
                    Group <span className="required">*</span>
                  </label>
                  <select
                    name="group_id"
                    className="form-control"
                    value={formData.group_id}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.event_id}
                  >
                    <option value="">Select Group</option>
                    {groups
                      .filter(group => group.event_id === formData.event_id)
                      .map(group => (
                        <option key={group.group_id} value={group.group_id}>
                          {group.groupName} ({group.group_id})
                        </option>
                      ))}
                  </select>
                  {!formData.event_id && (
                    <small className="text-muted">Please select an event first</small>
                  )}
                </div>

                {/* Position Selection */}
                <div className="form-group">
                  <label className="form-label">
                    Position <span className="required">*</span>
                  </label>
                  <select
                    name="position"
                    className="form-control"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Position</option>
                    <option value="1">1st Place 🥇</option>
                    <option value="2">2nd Place 🥈</option>
                    <option value="3">3rd Place 🥉</option>
                  </select>
                </div>

                {/* Prize Amount (Auto-filled but editable) */}
                <div className="form-group">
                  <label className="form-label">Prize Amount</label>
                  <input
                    type="text"
                    name="prizeAmount"
                    className="form-control"
                    value={formData.prizeAmount}
                    onChange={handleInputChange}
                    placeholder="Auto-filled from event"
                  />
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Prize amount is auto-filled from event settings but can be modified
                  </small>
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
                  <i className={`bi ${modalMode === 'add' ? 'bi-plus-lg' : 'bi-check-lg'} me-2`}></i>
                  {modalMode === 'add' ? 'Add Winner' : 'Update Winner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .winners-page {
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

        .btn-primary {
          background: #2563eb;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.3);
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

        /* Winners Grid */
        .winners-container {
          margin-top: 20px;
        }

        .winners-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 25px;
        }

        .winner-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          transition: all 0.3s;
          border: 1px solid #f1f5f9;
          position: relative;
        }

        .winner-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        }

        .winner-position-badge {
          padding: 15px 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid #f1f5f9;
        }

        .winner-position-badge.first {
          background: linear-gradient(135deg, #fef9c3, #fef08a);
          color: #854d0e;
        }

        .winner-position-badge.second {
          background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
          color: #334155;
        }

        .winner-position-badge.third {
          background: linear-gradient(135deg, #fff7ed, #ffedd5);
          color: #9a3412;
        }

        .position-icon {
          font-size: 24px;
        }

        .position-text {
          font-size: 16px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .winner-content {
          padding: 20px;
        }

        .winner-event, .winner-group, .winner-prize, .winner-date {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
        }

        .winner-event i, .winner-group i, .winner-prize i, .winner-date i {
          width: 24px;
          height: 24px;
          background: #f1f5f9;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2563eb;
          font-size: 13px;
        }

        .winner-event div, .winner-group div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .event-name, .group-name {
          font-weight: 600;
          color: #0f172a;
          font-size: 15px;
        }

        .event-id, .group-id {
          font-size: 11px;
          color: #94a3b8;
        }

        .prize-amount {
          font-size: 18px;
          font-weight: 700;
          color: #059669;
        }

        .winner-date {
          color: #64748b;
          font-size: 13px;
        }

        .winner-actions {
          position: absolute;
          top: 15px;
          right: 15px;
          display: flex;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .winner-card:hover .winner-actions {
          opacity: 1;
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
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .btn-edit {
          color: #2563eb;
        }

        .btn-edit:hover {
          background: #2563eb;
          color: white;
        }

        .btn-delete {
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

        .winner-modal {
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

        .text-muted {
          color: #64748b;
          font-size: 12px;
          margin-top: 6px;
          display: block;
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

          .winners-grid {
            grid-template-columns: 1fr;
          }

          .winner-actions {
            opacity: 1;
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