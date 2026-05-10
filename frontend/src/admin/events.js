import React, { useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Events() {
  const admin = JSON.parse(localStorage.getItem("user"));
  
  /* ================= STATES ================= */
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'technical', 'non-technical'
  // eslint-disable-next-line no-unused-vars
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  /* ================= FORM STATE ================= */
  const [formData, setFormData] = useState({
    eventName: '',
    eventTagline: '',
    eventImage: '',
    eventDescription: '',
    groupMinParticipants: '',
    groupMaxParticipants: '',
    eventFees: '',
    eventFirstPrize: '',
    eventSecondPrize: '',
    eventThirdPrize: '',
    isTechnical: false,
    eventCoordinator_id: admin?._id || 'U001',
    eventLocation: '',
    maxGroupsAllowed: ''
  });

  /* ================= INITIALIZATION ================= */
  useEffect(() => {
    AOS.init({ duration: 700, once: true });
    fetchEvents();
  }, []);

  /* ================= FETCH EVENTS ================= */
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
      alert("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLE INPUT CHANGE ================= */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  /* ================= HANDLE IMAGE CHANGE ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const fileType = file.type.toLowerCase();
      if (fileType === 'image/jpeg' || fileType === 'image/jpg' || fileType === 'image/png') {
        setSelectedImage(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        
        // Set the filename in formData
        setFormData({
          ...formData,
          eventImage: file.name
        });
      } else {
        alert('Please select only JPG or PNG images');
        e.target.value = null;
      }
    }
  };

  /* ================= RESET FORM ================= */
  const resetForm = () => {
    setFormData({
      eventName: '',
      eventTagline: '',
      eventImage: '',
      eventDescription: '',
      groupMinParticipants: '',
      groupMaxParticipants: '',
      eventFees: '',
      eventFirstPrize: '',
      eventSecondPrize: '',
      eventThirdPrize: '',
      isTechnical: false,
      eventCoordinator_id: admin?._id || 'U001',
      eventLocation: '',
      maxGroupsAllowed: ''
    });
    setSelectedEvent(null);
    setSelectedImage(null);
    setImagePreview(null);
  };

  /* ================= OPEN ADD MODAL ================= */
  const openAddModal = () => {
    resetForm();
    setModalMode('add');
    setShowModal(true);
  };

  /* ================= OPEN EDIT MODAL ================= */
  const openEditModal = (event) => {
    setSelectedEvent(event);
    setFormData({
      eventName: event.eventName,
      eventTagline: event.eventTagline,
      eventImage: event.eventImage,
      eventDescription: event.eventDescription,
      groupMinParticipants: event.groupMinParticipants,
      groupMaxParticipants: event.groupMaxParticipants,
      eventFees: event.eventFees,
      eventFirstPrize: event.eventFirstPrize || '',
      eventSecondPrize: event.eventSecondPrize || '',
      eventThirdPrize: event.eventThirdPrize || '',
      isTechnical: event.isTechnical,
      eventCoordinator_id: event.eventCoordinator_id,
      eventLocation: event.eventLocation,
      maxGroupsAllowed: event.maxGroupsAllowed || ''
    });
    
    // Set image preview if exists
    if (event.eventImage) {
      try {
        setImagePreview(require(`../../assets/images/${event.eventImage}`));
      } catch (error) {
        setImagePreview(null);
      }
    }
    
    setModalMode('edit');
    setShowModal(true);
  };

  /* ================= HANDLE SUBMIT ================= */
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // 1. Validation check (Keep your existing checks)
  if (!formData.eventName || !formData.eventTagline || !formData.eventImage || 
      !formData.eventDescription || !formData.groupMinParticipants || 
      !formData.groupMaxParticipants || !formData.eventFees || !formData.eventLocation) {
    alert("Please fill all required fields");
    return;
  }

  try {
    // 2. Prepare Data: Convert strings to Numbers to match your Schema requirements
    const submissionData = {
      ...formData,
      groupMinParticipants: Number(formData.groupMinParticipants),
      groupMaxParticipants: Number(formData.groupMaxParticipants),
      eventFees: Number(formData.eventFees),
      maxGroupsAllowed: formData.maxGroupsAllowed ? Number(formData.maxGroupsAllowed) : 0
    };

    if (modalMode === 'add') {
      // 3. Generate the missing event_id required by your backend
      submissionData.event_id = "EVT-" + Date.now(); 

      await axios.post("http://localhost:8000/events/add", submissionData);
      alert("Event added successfully!");
    } else {
      // For updates, use the existing event_id
      await axios.put(`http://localhost:8000/events/${selectedEvent.event_id}`, submissionData);
      alert("Event updated successfully!");
    }
    
    setShowModal(false);
    resetForm();
    fetchEvents();
  } catch (error) {
    // Better error logging to see exactly why the backend is failing
    console.error("Backend Error Response:", error.response?.data);
    alert(`Failed to save: ${error.response?.data?.error || "Check console for details"}`);
  }
};

  /* ================= HANDLE DELETE ================= */
  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`http://localhost:8000/events/${eventId}`);
        alert("Event deleted successfully!");
        fetchEvents();
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Failed to delete event");
      }
    }
  };

  /* ================= FILTER EVENTS ================= */
  const filteredEvents = events.filter(event => {
    // Search filter
    const matchesSearch = event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.eventTagline.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Technical/Non-technical filter
    if (filter === 'technical') return matchesSearch && event.isTechnical === true;
    if (filter === 'non-technical') return matchesSearch && event.isTechnical === false;
    return matchesSearch; // 'all'
  });

  /* ================= FORMAT CURRENCY ================= */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="events-page">
      {/* ================= HEADER ================= */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Events Management</h2>
          <p className="page-subtitle">Manage all technical and non-technical events</p>
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          <i className="bi bi-plus-circle me-2"></i>
          Add New Event
        </button>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="filters-section">
        <div className="search-box">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Events
          </button>
          <button 
            className={`filter-btn ${filter === 'technical' ? 'active' : ''}`}
            onClick={() => setFilter('technical')}
          >
            <i className="bi bi-cpu me-1"></i> Technical
          </button>
          <button 
            className={`filter-btn ${filter === 'non-technical' ? 'active' : ''}`}
            onClick={() => setFilter('non-technical')}
          >
            <i className="bi bi-mic me-1"></i> Non-Technical
          </button>
        </div>
      </div>

      {/* ================= EVENTS GRID ================= */}
      {loading ? (
        <div className="loader-container">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div className="event-card" key={event._id} data-aos="fade-up">
                <div className="event-image">
                  <img 
                    src={require(`../../assets/images/${event.eventImage}`)} 
                    alt={event.eventName} 
                  />
                  <div className={`event-type-badge ${event.isTechnical ? 'technical' : 'non-technical'}`}>
                    {event.isTechnical ? 'Technical' : 'Non-Technical'}
                  </div>
                </div>
                
                <div className="event-content">
                  <h3 className="event-name">{event.eventName}</h3>
                  <p className="event-tagline">{event.eventTagline}</p>
                  
                  <div className="event-details">
                    <div className="detail-item">
                      <i className="bi bi-people-fill"></i>
                      <span>{event.groupMinParticipants} - {event.groupMaxParticipants} members</span>
                    </div>
                    <div className="detail-item">
                      <i className="bi bi-cash-stack"></i>
                      <span>{formatCurrency(event.eventFees)}</span>
                    </div>
                    <div className="detail-item">
                      <i className="bi bi-geo-alt-fill"></i>
                      <span>{event.eventLocation}</span>
                    </div>
                    {event.maxGroupsAllowed && (
                      <div className="detail-item">
                        <i className="bi bi-grid-3x3-gap-fill"></i>
                        <span>Max {event.maxGroupsAllowed} groups</span>
                      </div>
                    )}
                  </div>

                  {(event.eventFirstPrize || event.eventSecondPrize || event.eventThirdPrize) && (
                    <div className="prizes-section">
                      <p className="prizes-title">Prizes:</p>
                      <div className="prizes">
                        {event.eventFirstPrize && (
                          <span className="prize first" title="First Prize">
                            <i className="bi bi-trophy-fill"></i> ₹{event.eventFirstPrize}
                          </span>
                        )}
                        {event.eventSecondPrize && (
                          <span className="prize second" title="Second Prize">
                            <i className="bi bi-trophy-fill"></i> ₹{event.eventSecondPrize}
                          </span>
                        )}
                        {event.eventThirdPrize && (
                          <span className="prize third" title="Third Prize">
                            <i className="bi bi-trophy-fill"></i> ₹{event.eventThirdPrize}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="event-actions">
                    <button className="btn-edit" onClick={() => openEditModal(event)}>
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(event.event_id)}>
                      <i className="bi bi-trash3"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <i className="bi bi-calendar-x fs-1"></i>
              <p>No events found matching your criteria</p>
            </div>
          )}
        </div>
      )}

      {/* ================= ADD/EDIT EVENT MODAL ================= */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content event-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>
                <i className={`bi ${modalMode === 'add' ? 'bi-plus-circle' : 'bi-pencil-square'} me-2`}></i>
                {modalMode === 'add' ? 'Add New Event' : 'Edit Event'}
              </h4>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Basic Information Section */}
                <div className="form-section">
                  <h5 className="section-title">
                    <i className="bi bi-info-circle me-2"></i>
                    Basic Information
                  </h5>
                  <div className="section-content">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">
                            Event Name <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            name="eventName"
                            className="form-control"
                            value={formData.eventName}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g., The Filmy Paglu"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">
                            Event Tagline <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            name="eventTagline"
                            className="form-control"
                            value={formData.eventTagline}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g., Entertainment Ka Overdose"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Event Description <span className="required">*</span>
                      </label>
                      <textarea
                        name="eventDescription"
                        className="form-control"
                        rows="3"
                        value={formData.eventDescription}
                        onChange={handleInputChange}
                        required
                        placeholder="Describe the event in detail..."
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Media & Location Section */}
                <div className="form-section">
                  <h5 className="section-title">
                    <i className="bi bi-image me-2"></i>
                    Media & Location
                  </h5>
                  <div className="section-content">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">
                            Event Image <span className="required">*</span>
                          </label>
                          <div className="file-input-wrapper">
                            <input
                              type="file"
                              id="eventImage"
                              accept=".jpg,.jpeg,.png"
                              onChange={handleImageChange}
                              className="file-input"
                            />
                            <label htmlFor="eventImage" className="file-input-label">
                              <i className="bi bi-cloud-upload me-2"></i>
                              Choose Image
                            </label>
                            {formData.eventImage && (
                              <span className="file-name">
                                <i className="bi bi-check-circle-fill text-success me-1"></i>
                                {formData.eventImage}
                              </span>
                            )}
                          </div>
                          {imagePreview && (
                            <div className="image-preview">
                              <img src={imagePreview} alt="Preview" />
                            </div>
                          )}
                          <small className="text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            Accepted formats: JPG, PNG only. Image will be saved to src/assets/images/
                          </small>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">
                            Event Location <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            name="eventLocation"
                            className="form-control"
                            value={formData.eventLocation}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g., Auditorium 10, Cricket Ground"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Participants & Fees Section */}
                <div className="form-section">
                  <h5 className="section-title">
                    <i className="bi bi-people me-2"></i>
                    Participants & Fees
                  </h5>
                  <div className="section-content">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="form-label">
                            Min Participants <span className="required">*</span>
                          </label>
                          <input
                            type="number"
                            name="groupMinParticipants"
                            className="form-control"
                            value={formData.groupMinParticipants}
                            onChange={handleInputChange}
                            required
                            min="1"
                            placeholder="4"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="form-label">
                            Max Participants <span className="required">*</span>
                          </label>
                          <input
                            type="number"
                            name="groupMaxParticipants"
                            className="form-control"
                            value={formData.groupMaxParticipants}
                            onChange={handleInputChange}
                            required
                            min="1"
                            placeholder="4"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="form-label">
                            Event Fees (₹) <span className="required">*</span>
                          </label>
                          <input
                            type="number"
                            name="eventFees"
                            className="form-control"
                            value={formData.eventFees}
                            onChange={handleInputChange}
                            required
                            min="0"
                            placeholder="200"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Max Groups Allowed</label>
                          <input
                            type="number"
                            name="maxGroupsAllowed"
                            className="form-control"
                            value={formData.maxGroupsAllowed}
                            onChange={handleInputChange}
                            min="1"
                            placeholder="25"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check-group">
                          <label className="form-label">Event Type</label>
                          <div className="form-check">
                            <input
                              type="checkbox"
                              name="isTechnical"
                              className="form-check-input"
                              checked={formData.isTechnical}
                              onChange={handleInputChange}
                              id="isTechnical"
                            />
                            <label className="form-check-label" htmlFor="isTechnical">
                              <i className="bi bi-cpu me-1"></i> Technical Event
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prizes Section */}
                <div className="form-section">
                  <h5 className="section-title">
                    <i className="bi bi-trophy me-2"></i>
                    Prize Money
                  </h5>
                  <div className="section-content">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="form-label">First Prize (₹)</label>
                          <input
                            type="text"
                            name="eventFirstPrize"
                            className="form-control"
                            value={formData.eventFirstPrize}
                            onChange={handleInputChange}
                            placeholder="7000"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="form-label">Second Prize (₹)</label>
                          <input
                            type="text"
                            name="eventSecondPrize"
                            className="form-control"
                            value={formData.eventSecondPrize}
                            onChange={handleInputChange}
                            placeholder="5000"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label className="form-label">Third Prize (₹)</label>
                          <input
                            type="text"
                            name="eventThirdPrize"
                            className="form-control"
                            value={formData.eventThirdPrize}
                            onChange={handleInputChange}
                            placeholder="3000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  <i className="bi bi-x-lg me-2"></i>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  <i className={`bi ${modalMode === 'add' ? 'bi-plus-lg' : 'bi-check-lg'} me-2`}></i>
                  {modalMode === 'add' ? 'Add Event' : 'Update Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .events-page {
          padding: 20px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
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

        .filter-buttons {
          display: flex;
          gap: 10px;
        }

        .filter-btn {
          padding: 8px 16px;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s;
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

        /* Events Grid */
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 25px;
        }

        .event-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          transition: all 0.3s;
          border: 1px solid #f1f5f9;
        }

        .event-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        }

        .event-image {
          position: relative;
          height: 200px;
          overflow: hidden;
          background: #f1f5f9;
        }

        .event-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.5s;
        }

        .event-card:hover .event-image img {
          transform: scale(1.05);
        }

        .event-type-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          padding: 5px 12px;
          border-radius: 30px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .event-type-badge.technical {
          background: #dbeafe;
          color: #1e40af;
        }

        .event-type-badge.non-technical {
          background: #fce7f3;
          color: #9d174d;
        }

        .event-content {
          padding: 20px;
        }

        .event-name {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 5px;
          color: #0f172a;
        }

        .event-tagline {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 15px;
        }

        .event-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 15px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #475569;
        }

        .detail-item i {
          color: #2563eb;
          font-size: 14px;
        }

        .prizes-section {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #f1f5f9;
        }

        .prizes-title {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #475569;
        }

        .prizes {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .prize {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 600;
        }

        .prize.first {
          background: #fef9c3;
          color: #854d0e;
        }

        .prize.second {
          background: #e2e8f0;
          color: #334155;
        }

        .prize.third {
          background: #f1f5f9;
          color: #475569;
        }

        .event-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
          justify-content: flex-end;
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

        /* Modal Styles - Improved */
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

        .event-modal {
          width: 95%;
          max-width: 1200px; /* Increased from 1000px to 1200px */
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

        .form-section {
          background: #f8fafc;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
        }

        .form-section:last-child {
          margin-bottom: 0;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 20px 0;
          padding-bottom: 12px;
          border-bottom: 2px solid #e2e8f0;
          display: flex;
          align-items: center;
        }

        .section-title i {
          color: #2563eb;
          font-size: 18px;
        }

        .section-content {
          padding: 0 5px;
        }

        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .row:last-child {
          margin-bottom: 0;
        }

        .form-group {
          margin-bottom: 0;
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

        textarea.form-control {
          resize: vertical;
          min-height: 100px;
        }

        /* File Input Styles */
        .file-input-wrapper {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .file-input {
          width: 0.1px;
          height: 0.1px;
          opacity: 0;
          overflow: hidden;
          position: absolute;
          z-index: -1;
        }

        .file-input-label {
          display: inline-flex;
          align-items: center;
          padding: 12px 24px;
          background: #2563eb;
          color: white;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          border: 2px solid #2563eb;
        }

        .file-input-label:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.3);
        }

        .file-name {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          background: white;
          border-radius: 8px;
          font-size: 13px;
          color: #334155;
          border: 1px solid #e2e8f0;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .image-preview {
          margin-top: 15px;
          border-radius: 12px;
          overflow: hidden;
          max-width: 200px;
          border: 2px solid #e2e8f0;
          background: white;
        }

        .image-preview img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          display: block;
        }

        .form-check-group {
          background: white;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          height: calc(100% - 28px);
          margin-top: 28px;
        }

        .form-check {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .form-check-input {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #2563eb;
        }

        .form-check-label {
          font-size: 14px;
          color: #1e293b;
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
        }

        .form-check-label i {
          color: #2563eb;
        }

        .text-muted {
          color: #64748b;
          font-size: 12px;
          margin-top: 8px;
          display: block;
        }

        .text-muted i {
          font-size: 12px;
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
          grid-column: 1 / -1;
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
            gap: 15px;
            align-items: flex-start;
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

          .events-grid {
            grid-template-columns: 1fr;
          }

          .row {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .file-input-wrapper {
            flex-direction: column;
            align-items: flex-start;
          }

          .file-name {
            max-width: 100%;
            width: 100%;
          }

          .form-check-group {
            margin-top: 0;
          }

          .modal-body {
            padding: 20px;
          }

          .form-section {
            padding: 15px;
          }

          .modal-footer {
            padding: 20px;
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