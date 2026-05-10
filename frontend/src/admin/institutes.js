import React, { useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Institutes() {
  // eslint-disable-next-line no-unused-vars
  const admin = JSON.parse(localStorage.getItem("user"));
  
  /* ================= CONSTANTS ================= */
  const API_BASE_URL = "http://localhost:8000";
  const API_ENDPOINT = "/institute"; 
  
  /* ================= STATES ================= */
  const [loading, setLoading] = useState(true);
  const [institutes, setInstitutes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [apiError, setApiError] = useState('');
  const [usingDummyData, setUsingDummyData] = useState(false);
  
  /* ================= FORM STATE ================= */
  const [formData, setFormData] = useState({
    institute_id: '',
    instituteName: '',
    instituteAddress: '',
    instituteEmail: '',
    institutePhone: ''
  });

  /* ================= DUMMY DATA ================= */
  const dummyInstitutes = [
    {
      _id: "1",
      institute_id: "I001",
      instituteName: "Darshan University",
      instituteAddress: "Hadala, Rajkot, Gujarat",
      instituteEmail: "info@darshan.ac.in",
      institutePhone: "9727747310",
      createdAt: "2026-02-09T17:16:02.555Z"
    },
    {
      _id: "2",
      institute_id: "I002",
      instituteName: "Marwadi University",
      instituteAddress: "Bedi, Rajkot, Gujarat",
      instituteEmail: "info@marwadiuniversity.ac.in",
      institutePhone: "8980030090",
      createdAt: "2026-02-10T15:02:39.697Z"
    },
    {
      _id: "3",
      institute_id: "I003",
      instituteName: "RK University",
      instituteAddress: "Bhavnagar Road, Rajkot, Gujarat",
      instituteEmail: "info@rku.ac.in",
      institutePhone: "9876543210",
      createdAt: "2026-02-15T10:30:00.000Z"
    }
  ];

  /* ================= INITIALIZATION ================= */
  useEffect(() => {
    AOS.init({ duration: 700, once: true });
    fetchInstitutes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= FETCH INSTITUTES ================= */
  const fetchInstitutes = async () => {
    setLoading(true);
    setApiError('');
    try {
      // Using singular endpoint as per your working GET request
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINT}`);
      console.log("Institutes fetched:", response.data);
      setInstitutes(response.data);
      setUsingDummyData(false);
    } catch (error) {
      console.error("Error fetching institutes:", error);
      
      // More descriptive error message
      if (error.response) {
        if (error.response.status === 404) {
          setApiError(`API endpoint '${API_BASE_URL}${API_ENDPOINT}' not found. Please check if the server is running and the route is correct.`);
        } else {
          setApiError(`Server error: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}`);
        }
      } else if (error.request) {
        setApiError("Cannot connect to server. Please check if the backend server is running on port 8000.");
      } else {
        setApiError(`Error: ${error.message}`);
      }
      
      // Use dummy data for testing UI
      console.log("Using dummy data for testing");
      setInstitutes(dummyInstitutes);
      setUsingDummyData(true);
    } finally {
      setLoading(false);
    }
  };

  /* ================= GENERATE INSTITUTE ID ================= */
  const generateInstituteId = async () => {
    try {
      const existingIds = institutes.map(inst => inst.institute_id);
      
      let nextNumber = 1;
      while (existingIds.includes(`I${String(nextNumber).padStart(3, '0')}`)) {
        nextNumber++;
      }
      return `I${String(nextNumber).padStart(3, '0')}`;
    } catch (error) {
      console.error("Error generating ID:", error);
      return `I${String(Date.now()).slice(-3)}`;
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
      institute_id: '',
      instituteName: '',
      instituteAddress: '',
      instituteEmail: '',
      institutePhone: ''
    });
    setSelectedInstitute(null);
  };

  /* ================= OPEN ADD MODAL ================= */
  const openAddModal = async () => {
    resetForm();
    const newId = await generateInstituteId();
    setFormData(prev => ({
      ...prev,
      institute_id: newId
    }));
    setModalMode('add');
    setShowModal(true);
  };

  /* ================= OPEN EDIT MODAL ================= */
  const openEditModal = (institute) => {
    setSelectedInstitute(institute);
    setFormData({
      institute_id: institute.institute_id,
      instituteName: institute.instituteName,
      instituteAddress: institute.instituteAddress,
      instituteEmail: institute.instituteEmail,
      institutePhone: institute.institutePhone
    });
    setModalMode('edit');
    setShowModal(true);
  };

  /* ================= HANDLE SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.institute_id || !formData.instituteName || !formData.instituteAddress || 
        !formData.instituteEmail || !formData.institutePhone) {
      alert("Please fill all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.instituteEmail)) {
      alert("Please enter a valid email address");
      return;
    }

    // Phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.institutePhone)) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      if (modalMode === 'add') {
        // Try API first, fallback to local
        try {
          // Using consistent endpoint
          await axios.post(`${API_BASE_URL}${API_ENDPOINT}/add`, formData);
          alert("Institute added successfully!");
        } catch (error) {
          console.warn("API error, updating locally:", error);
          // Add to local state
          const newInstitute = {
            ...formData,
            _id: Date.now().toString(),
            createdAt: new Date().toISOString()
          };
          setInstitutes([...institutes, newInstitute]);
          alert("Institute added locally (API not available)!");
        }
      } else {
        // Update mode
        try {
          await axios.put(`${API_BASE_URL}${API_ENDPOINT}/${selectedInstitute.institute_id}`, formData);
          alert("Institute updated successfully!");
        } catch (error) {
          console.warn("API error, updating locally:", error);
          // Update local state
          const updatedInstitutes = institutes.map(inst => 
            inst.institute_id === selectedInstitute.institute_id ? { ...inst, ...formData } : inst
          );
          setInstitutes(updatedInstitutes);
          alert("Institute updated locally (API not available)!");
        }
      }
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving institute:", error);
      alert(`Failed to save: ${error.response?.data?.error || "Check console for details"}`);
    }
  };

  /* ================= HANDLE DELETE ================= */
  const handleDelete = async (instituteId) => {
    if (window.confirm("Are you sure you want to delete this institute? This action cannot be undone.")) {
      try {
        await axios.delete(`${API_BASE_URL}${API_ENDPOINT}/${instituteId}`);
        alert("Institute deleted successfully!");
        fetchInstitutes();
      } catch (error) {
        console.error("Error deleting institute:", error);
        
        // Delete locally
        const updatedInstitutes = institutes.filter(inst => inst.institute_id !== instituteId);
        setInstitutes(updatedInstitutes);
        alert("Institute deleted locally (API not available)!");
      }
    }
  };

  /* ================= FILTER INSTITUTES ================= */
  const filteredInstitutes = institutes.filter(institute => {
    const searchLower = searchTerm.toLowerCase();
    return institute.institute_id.toLowerCase().includes(searchLower) ||
           institute.instituteName.toLowerCase().includes(searchLower) ||
           institute.instituteAddress.toLowerCase().includes(searchLower) ||
           institute.instituteEmail.toLowerCase().includes(searchLower) ||
           institute.institutePhone.includes(searchTerm);
  });

  /* ================= FORMAT PHONE ================= */
  const formatPhone = (phone) => {
    if (phone && phone.length === 10) {
      return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    return phone;
  };

  /* ================= RETRY CONNECTION ================= */
  const retryConnection = () => {
    setApiError('');
    setUsingDummyData(false);
    fetchInstitutes();
  };

  return (
    <div className="institutes-page">
      {/* ================= HEADER ================= */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Institutes Management</h2>
          <p className="page-subtitle">Manage all educational institutes</p>
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          <i className="bi bi-plus-circle me-2"></i>
          Add New Institute
        </button>
      </div>

      {/* ================= API ERROR MESSAGE ================= */}
      {apiError && (
        <div className="api-error" data-aos="fade-down">
          <div className="error-content">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div className="error-text">
              <strong>Connection Error:</strong> {apiError}
              <p className="error-note">
                {usingDummyData 
                  ? "Showing dummy data for preview. Your changes will be saved locally."
                  : "Please check your backend server."}
              </p>
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

      {/* ================= SEARCH ================= */}
      <div className="search-section">
        <div className="search-box">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by ID, name, address, email, or phone..."
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
        <div className="stats-badge">
          <i className="bi bi-building"></i>
          <span>Total Institutes: {institutes.length}</span>
        </div>
      </div>

      {/* ================= INSTITUTES GRID ================= */}
      {loading ? (
        <div className="loader-container">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="institutes-grid">
          {filteredInstitutes.length > 0 ? (
            filteredInstitutes.map((institute) => (
              <div className="institute-card" key={institute._id} data-aos="fade-up">
                <div className="card-header">
                  <div className="institute-id-badge">{institute.institute_id}</div>
                  <div className="card-actions">
                    <button 
                      className="btn-icon btn-edit" 
                      onClick={() => openEditModal(institute)}
                      title="Edit Institute"
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button 
                      className="btn-icon btn-delete" 
                      onClick={() => handleDelete(institute.institute_id)}
                      title="Delete Institute"
                    >
                      <i className="bi bi-trash3"></i>
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  <h3 className="institute-name">{institute.instituteName}</h3>
                  
                  <div className="info-list">
                    <div className="info-item">
                      <div className="info-icon">
                        <i className="bi bi-geo-alt-fill"></i>
                      </div>
                      <div className="info-content">
                        <span className="info-label">Address</span>
                        <span className="info-value">{institute.instituteAddress}</span>
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-icon">
                        <i className="bi bi-envelope-fill"></i>
                      </div>
                      <div className="info-content">
                        <span className="info-label">Email</span>
                        <a href={`mailto:${institute.instituteEmail}`} className="info-value email">
                          {institute.instituteEmail}
                        </a>
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-icon">
                        <i className="bi bi-telephone-fill"></i>
                      </div>
                      <div className="info-content">
                        <span className="info-label">Phone</span>
                        <a href={`tel:${institute.institutePhone}`} className="info-value phone">
                          {formatPhone(institute.institutePhone)}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="card-footer">
                    <small className="text-muted">
                      <i className="bi bi-calendar3 me-1"></i>
                      Added: {new Date(institute.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </small>
                    {usingDummyData && (
                      <small className="text-warning ms-2" title="Demo Mode">
                        <i className="bi bi-info-circle"></i>
                      </small>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <i className="bi bi-building fs-1"></i>
              <p>No institutes found matching your search</p>
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

      {/* ================= ADD/EDIT INSTITUTE MODAL ================= */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content institute-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>
                <i className={`bi ${modalMode === 'add' ? 'bi-plus-circle' : 'bi-pencil-square'} me-2`}></i>
                {modalMode === 'add' ? 'Add New Institute' : 'Edit Institute'}
              </h4>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Institute ID */}
                <div className="form-group">
                  <label className="form-label">
                    Institute ID <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="institute_id"
                    className="form-control"
                    value={formData.institute_id}
                    onChange={handleInputChange}
                    readOnly={modalMode === 'edit'}
                    disabled={modalMode === 'edit'}
                    placeholder="Auto-generated"
                  />
                  {modalMode === 'add' && (
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      ID will be auto-generated
                    </small>
                  )}
                </div>

                {/* Institute Name */}
                <div className="form-group">
                  <label className="form-label">
                    Institute Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="instituteName"
                    className="form-control"
                    value={formData.instituteName}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Darshan University"
                  />
                </div>

                {/* Institute Address */}
                <div className="form-group">
                  <label className="form-label">
                    Address <span className="required">*</span>
                  </label>
                  <textarea
                    name="instituteAddress"
                    className="form-control"
                    rows="3"
                    value={formData.instituteAddress}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Hadala, Rajkot, Gujarat"
                  ></textarea>
                </div>

                {/* Institute Email */}
                <div className="form-group">
                  <label className="form-label">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    name="instituteEmail"
                    className="form-control"
                    value={formData.instituteEmail}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., info@institute.ac.in"
                  />
                </div>

                {/* Institute Phone */}
                <div className="form-group">
                  <label className="form-label">
                    Phone Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    name="institutePhone"
                    className="form-control"
                    value={formData.institutePhone}
                    onChange={handleInputChange}
                    required
                    maxLength="10"
                    pattern="[0-9]{10}"
                    placeholder="e.g., 9727747310"
                  />
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Enter 10-digit mobile number
                  </small>
                </div>

                {usingDummyData && (
                  <div className="demo-note">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    <span>Demo Mode: Institute will be saved locally</span>
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
                  {modalMode === 'add' ? 'Add Institute' : 'Update Institute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .institutes-page {
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

        /* Search Section */
        .search-section {
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
          max-width: 500px;
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

        .stats-badge {
          background: linear-gradient(135deg, #059669, #047857);
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 20px -5px rgba(5, 150, 105, 0.3);
        }

        .stats-badge i {
          font-size: 20px;
        }

        /* Institutes Grid */
        .institutes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 25px;
        }

        .institute-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          transition: all 0.3s;
          border: 1px solid #f1f5f9;
        }

        .institute-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        }

        .card-header {
          padding: 20px 20px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .institute-id-badge {
          background: #e2e8f0;
          color: #475569;
          padding: 6px 12px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 700;
          font-family: monospace;
          letter-spacing: 0.5px;
        }

        .card-actions {
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

        .card-body {
          padding: 20px;
        }

        .institute-name {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 20px;
          color: #0f172a;
          line-height: 1.3;
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 20px;
        }

        .info-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .info-icon {
          width: 36px;
          height: 36px;
          background: #f1f5f9;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2563eb;
          font-size: 16px;
          flex-shrink: 0;
        }

        .info-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-label {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .info-value {
          font-size: 14px;
          color: #1e293b;
          word-break: break-word;
        }

        .info-value.email, .info-value.phone {
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
        }

        .info-value.email:hover, .info-value.phone:hover {
          text-decoration: underline;
        }

        .card-footer {
          padding-top: 15px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
        }

        .text-muted {
          color: #94a3b8;
          font-size: 12px;
        }

        .text-warning {
          color: #d97706;
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

        .institute-modal {
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

        .form-control:read-only, .form-control:disabled {
          background: #f1f5f9;
          color: #64748b;
          cursor: not-allowed;
        }

        textarea.form-control {
          resize: vertical;
          min-height: 100px;
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
            align-items: flex-start;
          }

          .search-section {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            max-width: 100%;
          }

          .stats-badge {
            width: 100%;
            justify-content: center;
          }

          .institutes-grid {
            grid-template-columns: 1fr;
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