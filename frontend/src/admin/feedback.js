import React, { useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Feedback() {
  // eslint-disable-next-line no-unused-vars
  const admin = JSON.parse(localStorage.getItem("user"));
  
  /* ================= CONSTANTS ================= */
  const API_BASE_URL = "http://localhost:8000";
  
  /* ================= STATES ================= */
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view' or 'reply'
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'new', 'read', 'replied'
  const [apiError, setApiError] = useState('');
  const [usingDummyData, setUsingDummyData] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    read: 0,
    replied: 0
  });

  /* ================= DUMMY DATA ================= */
  const dummyFeedbacks = [
    {
      _id: "1",
      contact_id: "C1771049635085",
      name: "Elvish Patel",
      email: "elvishpatel@gmail.com",
      subject: "Can't Register in Event",
      message: "Hey, there can you solve this my bugg that I can not register in Event.",
      status: "new",
      createdAt: "2026-02-14T06:13:55.106Z",
      updatedAt: "2026-02-14T06:13:55.106Z"
    },
    {
      _id: "2",
      contact_id: "C1770999696617",
      name: "Uchit Kamdar",
      email: "uchitkamdar88@gmail.com",
      subject: "Events",
      message: "It was truly mind-blowing, and we had so much fun together.",
      status: "new",
      createdAt: "2026-02-13T16:21:36.628Z",
      updatedAt: "2026-02-13T16:21:36.628Z"
    },
    {
      _id: "3",
      contact_id: "C001",
      name: "Uchit Kamdar",
      email: "uchit@gmail.com",
      subject: "Event Registration",
      message: "I need help with Frolic registration",
      status: "replied",
      createdAt: "2026-02-13T13:30:20.128Z",
      updatedAt: "2026-02-13T13:30:20.128Z"
    }
  ];

  /* ================= INITIALIZATION ================= */
  useEffect(() => {
    AOS.init({ duration: 700, once: true });
    fetchFeedbacks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= FETCH FEEDBACKS ================= */
  const fetchFeedbacks = async () => {
    setLoading(true);
    setApiError('');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/contact`);
      console.log("Feedbacks fetched:", response.data);
      setFeedbacks(response.data);
      calculateStats(response.data);
      setUsingDummyData(false);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      
      // Use dummy data for preview
      setFeedbacks(dummyFeedbacks);
      calculateStats(dummyFeedbacks);
      setUsingDummyData(true);
      setApiError("Unable to connect to server. Showing preview data.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CALCULATE STATS ================= */
  const calculateStats = (feedbackData) => {
    const total = feedbackData.length;
    const newCount = feedbackData.filter(f => f.status === 'new').length;
    const readCount = feedbackData.filter(f => f.status === 'read').length;
    const repliedCount = feedbackData.filter(f => f.status === 'replied').length;
    
    setStats({ total, new: newCount, read: readCount, replied: repliedCount });
  };

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (feedback, newStatus) => {
    try {
      // Try API first
      try {
        await axios.put(`${API_BASE_URL}/contact/${feedback.contact_id}`, {
          ...feedback,
          status: newStatus
        });
        
        // Update local state
        const updatedFeedbacks = feedbacks.map(f => 
          f._id === feedback._id ? { ...f, status: newStatus } : f
        );
        setFeedbacks(updatedFeedbacks);
        calculateStats(updatedFeedbacks);
        
        if (newStatus === 'read') {
          alert(`Marked as read`);
        }
      } catch (error) {
        // Update locally for demo
        const updatedFeedbacks = feedbacks.map(f => 
          f._id === feedback._id ? { ...f, status: newStatus } : f
        );
        setFeedbacks(updatedFeedbacks);
        calculateStats(updatedFeedbacks);
        
        alert(`Demo Mode: Marked as ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  /* ================= HANDLE REPLY ================= */
  const handleReply = async () => {
    if (!replyText.trim()) {
      alert("Please enter a reply message");
      return;
    }

    try {
      // In a real application, you would send an email here
      // For now, just update the status
      await updateStatus(selectedFeedback, 'replied');
      
      // You could also store the reply in a separate field
      alert(`Reply sent to ${selectedFeedback.email}`);
      
      setShowModal(false);
      setReplyText('');
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Failed to send reply");
    }
  };

  /* ================= HANDLE DELETE ================= */
  const handleDelete = async (feedback) => {
    if (window.confirm(`Are you sure you want to delete this message from ${feedback.name}?`)) {
      try {
        // Try API first
        try {
          await axios.delete(`${API_BASE_URL}/contact/${feedback.contact_id}`);
          alert("Message deleted successfully!");
        } catch (error) {
          console.warn("API error, deleting locally:", error);
          
          // Delete locally for demo
          const updatedFeedbacks = feedbacks.filter(f => f._id !== feedback._id);
          setFeedbacks(updatedFeedbacks);
          calculateStats(updatedFeedbacks);
          alert("Message deleted locally (API not available)!");
          return;
        }
        
        fetchFeedbacks();
      } catch (error) {
        console.error("Error deleting feedback:", error);
        alert("Failed to delete message");
      }
    }
  };

  /* ================= OPEN VIEW MODAL ================= */
  const openViewModal = (feedback) => {
    setSelectedFeedback(feedback);
    setModalMode('view');
    setShowModal(true);
    
    // Auto-mark as read when viewed
    if (feedback.status === 'new') {
      updateStatus(feedback, 'read');
    }
  };

  /* ================= OPEN REPLY MODAL ================= */
  const openReplyModal = (feedback) => {
    setSelectedFeedback(feedback);
    setModalMode('reply');
    setReplyText('');
    setShowModal(true);
  };

  /* ================= FILTER FEEDBACKS ================= */
  const filteredFeedbacks = feedbacks.filter(feedback => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = feedback.name.toLowerCase().includes(searchLower) ||
                         feedback.email.toLowerCase().includes(searchLower) ||
                         feedback.subject.toLowerCase().includes(searchLower) ||
                         feedback.message.toLowerCase().includes(searchLower) ||
                         feedback.contact_id.toLowerCase().includes(searchLower);
    
    if (filterStatus !== 'all') {
      return matchesSearch && feedback.status === filterStatus;
    }
    return matchesSearch;
  }).sort((a, b) => {
    // Sort by newest first
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  /* ================= FORMAT DATE ================= */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  /* ================= GET STATUS BADGE ================= */
  const getStatusBadge = (status) => {
    switch(status) {
      case 'new':
        return { class: 'new', icon: 'bi-envelope-fill', text: 'New' };
      case 'read':
        return { class: 'read', icon: 'bi-check2-circle', text: 'Read' };
      case 'replied':
        return { class: 'replied', icon: 'bi-reply-fill', text: 'Replied' };
      default:
        return { class: 'new', icon: 'bi-envelope', text: status };
    }
  };

  /* ================= RETRY CONNECTION ================= */
  const retryConnection = () => {
    setApiError('');
    setUsingDummyData(false);
    fetchFeedbacks();
  };

  return (
    <div className="feedback-page">
      {/* ================= HEADER ================= */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Feedback & Contact Messages</h2>
          <p className="page-subtitle">Manage user inquiries and feedback</p>
        </div>
      </div>

      {/* ================= STATS CARDS ================= */}
      <div className="stats-grid" data-aos="fade-down">
        <div className="stat-card total">
          <div className="stat-icon">
            <i className="bi bi-chat-dots-fill"></i>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Messages</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        
        <div className="stat-card new">
          <div className="stat-icon">
            <i className="bi bi-envelope-fill"></i>
          </div>
          <div className="stat-info">
            <span className="stat-label">New</span>
            <span className="stat-value">{stats.new}</span>
          </div>
        </div>
        
        <div className="stat-card read">
          <div className="stat-icon">
            <i className="bi bi-check2-circle"></i>
          </div>
          <div className="stat-info">
            <span className="stat-label">Read</span>
            <span className="stat-value">{stats.read}</span>
          </div>
        </div>
        
        <div className="stat-card replied">
          <div className="stat-icon">
            <i className="bi bi-reply-fill"></i>
          </div>
          <div className="stat-info">
            <span className="stat-label">Replied</span>
            <span className="stat-value">{stats.replied}</span>
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
            placeholder="Search by name, email, subject, or message..."
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
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All Messages
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'new' ? 'active' : ''}`}
            onClick={() => setFilterStatus('new')}
          >
            <i className="bi bi-envelope-fill me-1"></i> New
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'read' ? 'active' : ''}`}
            onClick={() => setFilterStatus('read')}
          >
            <i className="bi bi-check2-circle me-1"></i> Read
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'replied' ? 'active' : ''}`}
            onClick={() => setFilterStatus('replied')}
          >
            <i className="bi bi-reply-fill me-1"></i> Replied
          </button>
        </div>
      </div>

      {/* ================= FEEDBACK GRID ================= */}
      {loading ? (
        <div className="loader-container">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="feedback-container">
          {filteredFeedbacks.length > 0 ? (
            <div className="feedback-grid">
              {filteredFeedbacks.map((feedback) => {
                const statusBadge = getStatusBadge(feedback.status);
                
                return (
                  <div className="feedback-card" key={feedback._id} data-aos="fade-up">
                    <div className="card-header">
                      <div className="contact-id">
                        <span className="id-badge">{feedback.contact_id}</span>
                      </div>
                      <div className="card-actions">
                        <button 
                          className="btn-icon btn-view" 
                          onClick={() => openViewModal(feedback)}
                          title="View Message"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button 
                          className="btn-icon btn-reply" 
                          onClick={() => openReplyModal(feedback)}
                          title="Reply"
                        >
                          <i className="bi bi-reply"></i>
                        </button>
                        <button 
                          className="btn-icon btn-delete" 
                          onClick={() => handleDelete(feedback)}
                          title="Delete"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="sender-info">
                        <div className="avatar">
                          {feedback.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="sender-details">
                          <h4 className="sender-name">{feedback.name}</h4>
                          <a href={`mailto:${feedback.email}`} className="sender-email">
                            <i className="bi bi-envelope me-1"></i>
                            {feedback.email}
                          </a>
                        </div>
                      </div>

                      <div className="message-preview">
                        <h5 className="subject">
                          <i className="bi bi-quote me-2"></i>
                          {feedback.subject}
                        </h5>
                        <p className="message-text">
                          {feedback.message.length > 150 
                            ? `${feedback.message.substring(0, 150)}...` 
                            : feedback.message}
                        </p>
                      </div>

                      <div className="card-footer">
                        <span className={`status-badge ${statusBadge.class}`}>
                          <i className={`bi ${statusBadge.icon} me-1`}></i>
                          {statusBadge.text}
                        </span>
                        <span className="timestamp">
                          <i className="bi bi-clock me-1"></i>
                          {formatDate(feedback.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-results">
              <i className="bi bi-chat-dots fs-1"></i>
              <p>No messages found matching your search</p>
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

      {/* ================= VIEW MESSAGE MODAL ================= */}
      {showModal && selectedFeedback && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content feedback-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>
                <i className={`bi ${modalMode === 'view' ? 'bi-envelope-open' : 'bi-reply'} me-2`}></i>
                {modalMode === 'view' ? 'Message Details' : 'Reply to Message'}
              </h4>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-body">
              {/* Message Details */}
              <div className="message-details">
                <div className="detail-row">
                  <span className="detail-label">From:</span>
                  <span className="detail-value">{selectedFeedback.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <a href={`mailto:${selectedFeedback.email}`} className="detail-value email">
                    {selectedFeedback.email}
                  </a>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Contact ID:</span>
                  <span className="detail-value id">{selectedFeedback.contact_id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Received:</span>
                  <span className="detail-value">{formatDate(selectedFeedback.createdAt)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge ${getStatusBadge(selectedFeedback.status).class}`}>
                    {getStatusBadge(selectedFeedback.status).text}
                  </span>
                </div>
              </div>

              <div className="message-content">
                <h5 className="subject-line">
                  <i className="bi bi-quote me-2"></i>
                  {selectedFeedback.subject}
                </h5>
                <div className="message-box">
                  <p>{selectedFeedback.message}</p>
                </div>
              </div>

              {/* Reply Section */}
              {modalMode === 'reply' && (
                <div className="reply-section">
                  <h5 className="reply-title">
                    <i className="bi bi-reply-fill me-2"></i>
                    Compose Reply
                  </h5>
                  <textarea
                    className="reply-textarea"
                    rows="5"
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  ></textarea>
                  <div className="reply-actions">
                    <button 
                      className="btn-cancel" 
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn-send" 
                      onClick={handleReply}
                      disabled={!replyText.trim()}
                    >
                      <i className="bi bi-send me-2"></i>
                      Send Reply
                    </button>
                  </div>
                </div>
              )}

              {modalMode === 'view' && (
                <div className="modal-actions">
                  <button 
                    className="btn-reply-action" 
                    onClick={() => {
                      setModalMode('reply');
                      setReplyText('');
                    }}
                  >
                    <i className="bi bi-reply me-2"></i>
                    Reply to this message
                  </button>
                  <button 
                    className="btn-close-action" 
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .feedback-page {
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

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          border: 1px solid #f1f5f9;
          transition: all 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1);
        }

        .stat-card.total .stat-icon { background: #dbeafe; color: #2563eb; }
        .stat-card.new .stat-icon { background: #fee2e2; color: #dc2626; }
        .stat-card.read .stat-icon { background: #d1fae5; color: #059669; }
        .stat-card.replied .stat-icon { background: #ede9fe; color: #7c3aed; }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .stat-info {
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
          font-size: 28px;
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

        .filter-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
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

        /* Feedback Grid */
        .feedback-container {
          margin-top: 20px;
        }

        .feedback-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 25px;
        }

        .feedback-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          transition: all 0.3s;
          border: 1px solid #f1f5f9;
        }

        .feedback-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        }

        .card-header {
          padding: 15px 20px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
        }

        .id-badge {
          background: #e2e8f0;
          color: #475569;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          font-family: monospace;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .btn-icon {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          background: white;
          color: #64748b;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .btn-icon:hover {
          transform: translateY(-2px);
        }

        .btn-view:hover { background: #2563eb; color: white; }
        .btn-reply:hover { background: #059669; color: white; }
        .btn-delete:hover { background: #dc2626; color: white; }

        .card-body {
          padding: 20px;
        }

        .sender-info {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }

        .avatar {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .sender-details {
          flex: 1;
        }

        .sender-name {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px;
          color: #0f172a;
        }

        .sender-email {
          color: #2563eb;
          text-decoration: none;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
        }

        .sender-email:hover {
          text-decoration: underline;
        }

        .message-preview {
          background: #f8fafc;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 15px;
        }

        .subject {
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 8px;
          color: #0f172a;
          display: flex;
          align-items: center;
        }

        .subject i {
          color: #2563eb;
        }

        .message-text {
          font-size: 13px;
          color: #475569;
          line-height: 1.6;
          margin: 0;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 15px;
          border-top: 1px solid #f1f5f9;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 30px;
          font-size: 11px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
        }

        .status-badge.new { background: #fee2e2; color: #dc2626; }
        .status-badge.read { background: #d1fae5; color: #059669; }
        .status-badge.replied { background: #ede9fe; color: #7c3aed; }

        .timestamp {
          font-size: 11px;
          color: #94a3b8;
          display: flex;
          align-items: center;
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

        .feedback-modal {
          width: 95%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .modal-header {
          padding: 20px 30px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #f8fafc, #ffffff);
          border-radius: 24px 24px 0 0;
        }

        .modal-header h4 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
        }

        .modal-close {
          background: #f1f5f9;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #64748b;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: #ef4444;
          color: white;
        }

        .modal-body {
          padding: 30px;
        }

        .message-details {
          background: #f8fafc;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 20px;
        }

        .detail-row {
          display: flex;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .detail-label {
          width: 100px;
          color: #64748b;
          font-weight: 500;
        }

        .detail-value {
          color: #0f172a;
          font-weight: 500;
        }

        .detail-value.email {
          color: #2563eb;
          text-decoration: none;
        }

        .detail-value.email:hover {
          text-decoration: underline;
        }

        .detail-value.id {
          font-family: monospace;
          background: #e2e8f0;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .message-content {
          margin-bottom: 20px;
        }

        .subject-line {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 15px;
          color: #0f172a;
          display: flex;
          align-items: center;
        }

        .subject-line i {
          color: #2563eb;
        }

        .message-box {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          border-left: 4px solid #2563eb;
        }

        .message-box p {
          margin: 0;
          line-height: 1.8;
          color: #1e293b;
        }

        .reply-section {
          margin-top: 20px;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
        }

        .reply-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 15px;
          color: #0f172a;
          display: flex;
          align-items: center;
        }

        .reply-title i {
          color: #2563eb;
        }

        .reply-textarea {
          width: 100%;
          padding: 15px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.6;
          resize: vertical;
          margin-bottom: 15px;
        }

        .reply-textarea:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .reply-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
        }

        .btn-send {
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

        .btn-send:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.3);
        }

        .btn-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .btn-reply-action {
          background: #059669;
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

        .btn-reply-action:hover {
          background: #047857;
          transform: translateY(-2px);
        }

        .btn-close-action {
          background: #f1f5f9;
          color: #475569;
          border: none;
          padding: 12px 30px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-close-action:hover {
          background: #e2e8f0;
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
        }

        .btn-cancel:hover {
          background: #e2e8f0;
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

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .stats-grid {
            grid-template-columns: 1fr;
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

          .feedback-grid {
            grid-template-columns: 1fr;
          }

          .modal-footer {
            flex-direction: column-reverse;
          }

          .btn-cancel, .btn-send {
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

          .reply-actions {
            flex-direction: column;
          }

          .modal-actions {
            flex-direction: column;
          }

          .btn-reply-action, .btn-close-action {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}