import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import AOS from "aos";
import { useNavigate } from "react-router-dom";
import "aos/dist/aos.css";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const observerRef = useRef(null);
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);

  /* ================= LOGGED IN USER (FROM LOCAL STORAGE) ================= */
  const storedUser = JSON.parse(localStorage.getItem("user"));

  /* ================= PROFILE STATES ================= */
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  /* ================= CONTACT STATE ================= */
  const [contact, setContact] = useState({
    name: storedUser?.userName || "",
    email: storedUser?.email || "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  /* ================= INIT AOS ================= */
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  /* ================= CHECK LOGIN ================= */
  useEffect(() => {
    if (!storedUser) {
      window.location.href = "/login";
    }
  }, [storedUser]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [eventsRes, winnersRes, groupsRes, usersRes] = await Promise.all([
          axios.get("http://localhost:8000/events"),
          axios.get("http://localhost:8000/event-winners"),
          axios.get("http://localhost:8000/groups"),
          axios.get("http://localhost:8000/users"),
        ]);

        setEvents(eventsRes.data);
        setWinners(winnersRes.data);
        setGroups(groupsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Backend fetch failed");
      } finally {
        setLoading(false);
        setTimeout(() => AOS.refresh(), 500);
      }
    };

    loadAll();
  }, []);

  /* ================= SCROLL SPY ================= */
  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const options = {
      root: null,
      rootMargin: "-40% 0px -40% 0px",
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, options);

    sections.forEach((section) => observerRef.current.observe(section));

    return () => {
      sections.forEach((section) => observerRef.current.unobserve(section));
    };
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ================= CHANGE PASSWORD ================= */
  const handleChangePassword = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert("All fields required");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const res = await axios.get(`http://localhost:8000/users/${storedUser._id}`);
      if (res.data.password !== passwordData.oldPassword) {
        alert("Old password incorrect");
        return;
      }
      await axios.put(`http://localhost:8000/users/${storedUser._id}`, { password: passwordData.newPassword });
      alert("Password updated successfully");
      setShowModal(false);
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      alert("Error updating password");
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const validateContact = () => {
    const err = {};
    if (!contact.subject.trim()) err.subject = "Subject required";
    if (contact.message.trim().length < 10) err.message = "Minimum 10 characters required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const submitContact = async (e) => {
    e.preventDefault();
    if (!validateContact()) return;
    try {
      setSending(true);
      const payload = {
        contact_id: "C" + Date.now(),
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
      };
      await axios.post("http://localhost:8000/contact/add", payload);
      alert("Message sent successfully!");
      setContact({
        name: storedUser?.userName || "",
        email: storedUser?.email || "",
        subject: "",
        message: "",
      });
    } catch (err) {
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const techEvents = events.filter((e) => e.isTechnical);
  const nonTechEvents = events.filter((e) => !e.isTechnical);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "events", label: "Events" },
    { id: "winners", label: "Winners" },
    { id: "facilities", label: "Facilities" },
    { id: "faq", label: "FAQs" },
    { id: "contact", label: "Contact Us" },
  ];

  const getEventName = (event_id) => {
    const event = events.find((e) => e.event_id === event_id);
    return event ? event.eventName : event_id;
  };

  const getGroupName = (group_id) => {
    const group = groups.find((g) => g.group_id === group_id);
    return group ? group.groupName : group_id;
  };

  const getLeaderName = (group_id) => {
    const group = groups.find((g) => g.group_id === group_id);
    if (!group) return "N/A";
    const leader = users.find((u) => u.user_id === group.leader_id);
    return leader ? leader.userName : group.leader_id;
  };

  return (
    <div className="bg-white text-dark">
      {/* Bootstrap Icons */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />

      {/* Custom CSS */}
      <style>{`
        .navbar-custom {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          padding: 0.75rem 0;
          transition: all 0.3s ease;
        }
        
        .nav-link-custom {
          position: relative;
          padding: 0.5rem 1rem !important;
          font-weight: 600;
          transition: all 0.3s ease;
          border-radius: 8px;
        }
        
        .nav-link-custom:hover {
          background: rgba(13, 110, 253, 0.05);
          color: #0d6efd !important;
        }
        
        .nav-link-custom.active {
          color: #0d6efd !important;
          background: rgba(13, 110, 253, 0.1);
        }
        
        .nav-link-custom.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 3px;
          background: linear-gradient(90deg, #0d6efd, #0b5ed7);
          border-radius: 3px;
          transition: width 0.3s ease;
        }
        
        .event-card {
          border: none;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px -15px rgba(0, 0, 0, 0.2);
        }
        
        .event-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px -15px rgba(13, 110, 253, 0.3);
        }
        
        .event-card-img {
          height: 200px;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        
        .event-card:hover .event-card-img {
          transform: scale(1.1);
        }
        
        .event-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          padding: 0.5rem 1rem;
          border-radius: 30px;
          font-size: 0.8rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.95);
          color: #0d6efd;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          z-index: 2;
        }
        
        .winner-card {
          background: white;
          border-radius: 24px;
          padding: 1.5rem;
          box-shadow: 0 10px 30px -15px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.03);
          position: relative;
          overflow: hidden;
        }
        
        .winner-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: linear-gradient(90deg, #0d6efd, #0b5ed7);
        }
        
        .winner-card:hover {
          transform: scale(1.02);
          box-shadow: 0 25px 50px -20px rgba(13, 110, 253, 0.3);
        }
        
        .position-badge {
          background: linear-gradient(135deg, #0d6efd, #0b5ed7);
          color: white;
          padding: 0.35rem 1.2rem;
          border-radius: 30px;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-block;
          box-shadow: 0 5px 15px rgba(13, 110, 253, 0.2);
        }
        
        .facility-card {
          background: linear-gradient(145deg, #ffffff, #f8fafc);
          border-radius: 30px;
          padding: 2.5rem 1.5rem;
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.02);
          box-shadow: 0 15px 35px -20px rgba(0, 0, 0, 0.2);
        }
        
        .facility-card:hover {
          background: linear-gradient(135deg, #0d6efd, #0b5ed7);
          color: white;
          transform: translateY(-8px);
        }
        
        .facility-card:hover p {
          color: rgba(255, 255, 255, 0.9) !important;
        }
        
        .facility-card:hover i {
          color: white !important;
        }
        
        .faq-item {
          background: white;
          border-radius: 16px;
          padding: 1rem 1.5rem;
          margin-bottom: 1rem;
          box-shadow: 0 5px 15px -10px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #0d6efd;
          transition: all 0.3s ease;
        }
        
        .faq-item:hover {
          transform: translateX(5px);
          box-shadow: 0 10px 25px -15px #0d6efd;
        }
        
        .form-custom {
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          padding: 0.75rem 1rem;
          transition: all 0.3s ease;
        }
        
        .form-custom:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
        }
        
        .modal-custom {
          border-radius: 28px;
          border: none;
          overflow: hidden;
        }
        
        .modal-backdrop-custom {
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
        }
        
        .dropdown-custom {
          border-radius: 16px;
          border: none;
          box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.2);
          animation: slideDown 0.2s ease;
          overflow: hidden;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .btn-gradient {
          background: linear-gradient(135deg, #0d6efd, #0b5ed7);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 0.6rem 1.5rem;
          transition: all 0.3s ease;
        }
        
        .btn-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -10px #0d6efd;
        }
        
        .btn-outline-gradient {
          background: transparent;
          border: 2px solid #0d6efd;
          color: #0d6efd;
          border-radius: 12px;
          padding: 0.6rem 1.5rem;
          transition: all 0.3s ease;
        }
        
        .btn-outline-gradient:hover {
          background: #0d6efd;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -10px #0d6efd;
        }
        
        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #1e293b, #0d6efd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1rem;
        }
        
        .section-subtitle {
          color: #6c757d;
          font-size: 1rem;
          margin-bottom: 3rem;
          position: relative;
        }
        
        .section-subtitle::after {
          content: '';
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 4px;
          background: linear-gradient(90deg, #0d6efd, #0b5ed7);
          border-radius: 2px;
        }
        
        .home-overlay {
          background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%);
        }
        
        .footer-link {
          color: #adb5bd;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .footer-link:hover {
          color: white;
          padding-left: 5px;
        }
        
        .scroll-to-top {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #0d6efd;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 5px 15px rgba(13, 110, 253, 0.3);
          transition: all 0.3s ease;
          z-index: 1000;
        }
        
        .scroll-to-top:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(13, 110, 253, 0.4);
        }
      `}</style>

      {/* ================= NAVBAR ================= */}
      <nav className="navbar navbar-expand-lg fixed-top navbar-custom px-4">
        <div className="container-fluid">
          <button
            className="navbar-brand d-flex align-items-center gap-3 border-0 bg-transparent p-0"
            onClick={() => scrollTo("home")}
          >
            <div className="bg-white p-2 rounded-3 shadow-sm">
              <img
                src="/assets/images/frolic_logo.png"
                height="45"
                alt="Frolic Logo"
              />
            </div>
            <div className="d-flex flex-column align-items-start">
              <span className="fw-bold fs-4" style={{
                background: "linear-gradient(135deg, #0d6efd, #0b5ed7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>FROLIC</span>
              <small className="text-muted fw-semibold" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>
                CHALLENGE YOUR POTENTIAL
              </small>
            </div>
          </button>

          <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
            <ul className="navbar-nav gap-1">
              {navItems.map((item) => (
                <li key={item.id} className="nav-item">
                  <button
                    className={`nav-link btn btn-link px-3 nav-link-custom ${
                      activeSection === item.id ? "active" : "text-dark"
                    }`}
                    onClick={() => scrollTo(item.id)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-gradient btn-sm fw-semibold rounded-pill px-4 py-2"
              onClick={() => navigate("/user/registerEvent")}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Register Event
            </button>

            <div className="position-relative">
              <button
                className="btn btn-light rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: "45px", height: "45px" }}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <i className="bi bi-person-fill fs-5 text-primary"></i>
              </button>

              {showDropdown && (
                <div className="position-absolute dropdown-custom bg-white py-2" style={{ right: 0, top: "120%", width: "250px", zIndex: 1000 }}>
                  <div className="px-4 py-3 border-bottom">
                    <small className="text-muted d-block">Signed in as</small>
                    <span className="fw-bold text-dark">{storedUser?.userName}</span>
                    <small className="text-muted d-block mt-1">{storedUser?.email}</small>
                  </div>
                  <button
                    className="btn btn-link w-100 text-start px-4 py-2 text-decoration-none"
                    onClick={() => {
                      setShowModal(true);
                      setShowDropdown(false);
                    }}
                  >
                    <i className="bi bi-shield-lock me-2 text-primary"></i>
                    Change Password
                  </button>
                  <hr className="my-1 mx-3" />
                  <button
                    className="btn btn-link w-100 text-start px-4 py-2 text-decoration-none text-danger"
                    onClick={logout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ================= HOME ================= */}
      <section
        id="home"
        style={{
          minHeight: "100vh",
          paddingTop: "80px",
          background: "url('/assets/images/frolic_26.jpg') center/cover fixed",
        }}
        className="d-flex align-items-center text-center position-relative"
      >
        <div className="position-absolute top-0 start-0 w-100 h-100 home-overlay"></div>
        <div className="container position-relative" data-aos="fade-up">
          <span className="badge bg-primary bg-opacity-25 text-white px-4 py-2 rounded-pill mb-4 fs-6">
            <i className="bi bi-stars me-2"></i>
            DARSHAN UNIVERSITY PRESENTS
          </span>
          <h1 className="display-1 fw-bolder text-white mb-3" style={{ textShadow: "0 4px 30px rgba(0,0,0,0.3)" }}>
            FROLIC <span className="text-primary">2026</span>
          </h1>
          <p className="lead text-white-50 fs-3 mb-5">
            Where Innovation Meets Celebration. Unleash your inner genius.
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <button
              className="btn btn-gradient btn-lg px-5 py-3 fw-semibold rounded-pill shadow-lg"
              onClick={() => scrollTo("events")}
            >
              Explore Events
              <i className="bi bi-arrow-right ms-2"></i>
            </button>
            <button
              className="btn btn-outline-light btn-lg px-5 py-3 fw-semibold rounded-pill"
              onClick={() => scrollTo("winners")}
            >
              Our Winners
            </button>
          </div>
        </div>
      </section>

      {/* ================= EVENTS ================= */}
      <section id="events" className="py-5" style={{ minHeight: "100vh", padding: "100px 0" }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">The <span className="text-primary">Arena</span></h2>
            <p className="section-subtitle">Choose your battlefield and showcase your skills</p>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" style={{ width: "4rem", height: "4rem" }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-4 fw-medium">Loading Events...</p>
            </div>
          ) : (
            <>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-primary bg-opacity-10 p-3 rounded-3">
                  <i className="bi bi-cpu fs-3 text-primary"></i>
                </div>
                <h3 className="fw-bold m-0">Technical Challenges</h3>
              </div>
              
              <div className="row g-4 mb-5">
                {techEvents.map((e) => (
                  <div key={e._id} className="col-lg-3 col-md-6" data-aos="zoom-in">
                    <div className="event-card card h-100">
                      <div className="position-relative overflow-hidden">
                        <img
                          src={`/assets/images/${e.eventImage}`}
                          className="event-card-img card-img-top"
                          alt={e.eventName}
                        />
                        <span className="event-badge">
                          <i className="bi bi-people-fill me-1"></i>
                          {e.groupMinParticipants}-{e.groupMaxParticipants} Members
                        </span>
                      </div>
                      <div className="card-body text-center p-4">
                        <h5 className="fw-bold mb-3">{e.eventName}</h5>
                        <p className="small text-muted mb-3" style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}>
                          {e.eventDescription}
                        </p>
                        <button
                          className="btn btn-outline-gradient btn-sm w-100 rounded-pill"
                          onClick={() => setSelectedEvent(e)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="d-flex align-items-center gap-3 mb-4 mt-5">
                <div className="bg-danger bg-opacity-10 p-3 rounded-3">
                  <i className="bi bi-palette fs-3 text-danger"></i>
                </div>
                <h3 className="fw-bold m-0">Cultural & Fun</h3>
              </div>
              
              <div className="row g-4">
                {nonTechEvents.map((e) => (
                  <div key={e._id} className="col-lg-3 col-md-6" data-aos="zoom-in">
                    <div className="event-card card h-100">
                      <div className="position-relative overflow-hidden">
                        <img
                          src={`/assets/images/${e.eventImage}`}
                          className="event-card-img card-img-top"
                          alt={e.eventName}
                        />
                        <span className="event-badge" style={{ color: "#dc3545" }}>
                          <i className="bi bi-tag-fill me-1"></i>
                          ₹{e.eventFees}
                        </span>
                      </div>
                      <div className="card-body text-center p-4">
                        <h5 className="fw-bold mb-3">{e.eventName}</h5>
                        <p className="small text-muted mb-3" style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}>
                          {e.eventDescription}
                        </p>
                        <button
                          className="btn btn-outline-danger btn-sm w-100 rounded-pill"
                          onClick={() => setSelectedEvent(e)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ================= WINNERS ================= */}
      <section id="winners" className="py-5 bg-light" style={{ minHeight: "100vh", padding: "100px 0" }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Wall of <span className="text-primary">Fame</span></h2>
            <p className="section-subtitle">Celebrating our champion performers</p>
          </div>

          <div className="row g-4">
            {winners.map((w) => (
              <div key={w._id} className="col-md-4" data-aos="fade-up">
                <div className="winner-card">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">{getEventName(w.event_id)}</h5>
                    <span className="position-badge">
                      <i className="bi bi-trophy-fill me-1"></i>
                      Rank #{w.position}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-people-fill text-primary me-2"></i>
                      <span className="text-muted">Team:</span>
                      <span className="fw-semibold ms-2">{getGroupName(w.group_id)}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-person-badge text-primary me-2"></i>
                      <span className="text-muted">Leader:</span>
                      <span className="fw-semibold ms-2">{getLeaderName(w.group_id)}</span>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <span className="text-muted">Prize Amount</span>
                    <span className="fw-bold text-success fs-5">
                      <i className="bi bi-currency-rupee"></i>
                      {w.prizeAmount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FACILITIES ================= */}
      <section id="facilities" className="py-5" style={{ minHeight: "100vh", padding: "100px 0" }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Event <span className="text-primary">Facilities</span></h2>
            <p className="section-subtitle">Everything you need for a memorable experience</p>
          </div>

          <div className="row g-4">
            {[
              { icon: "bi-building", title: "Accommodation", desc: "Comfortable stay for all participants", color: "text-primary" },
              { icon: "bi-bus-front", title: "Transport", desc: "24/7 shuttle service available", color: "text-success" },
              { icon: "bi-cup-hot", title: "Food Court", desc: "Multi-cuisine food stalls", color: "text-warning" },
              { icon: "bi-heart-pulse", title: "Medical Support", desc: "24/7 emergency medical facility", color: "text-danger" },
            ].map((f, i) => (
              <div key={i} className="col-md-3" data-aos="fade-up" data-aos-delay={i * 100}>
                <div className="facility-card h-100 text-center">
                  <i className={`bi ${f.icon} fs-1 ${f.color} mb-3 d-block`}></i>
                  <h5 className="fw-bold mb-3">{f.title}</h5>
                  <p className="small text-muted mb-0">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section id="faq" className="py-5 bg-light" style={{ minHeight: "100vh", padding: "100px 0" }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">General <span className="text-primary">Guidelines</span></h2>
            <p className="section-subtitle">Important information for all participants</p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="faq-item">
                <div className="d-flex align-items-center">
                  <i className="bi bi-card-text text-primary me-3 fs-4"></i>
                  <span className="fw-medium">Valid college ID card is mandatory for all participants at entry.</span>
                </div>
              </div>
              <div className="faq-item">
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-octagon text-primary me-3 fs-4"></i>
                  <span className="fw-medium">Specific rules for each event will be briefed 30 minutes before the start.</span>
                </div>
              </div>
              <div className="faq-item">
                <div className="d-flex align-items-center">
                  <i className="bi bi-hammer text-primary me-3 fs-4"></i>
                  <span className="fw-medium">The final decision rests with the judging panel; no disputes will be entertained.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section id="contact" className="py-5" style={{ minHeight: "100vh", padding: "100px 0" }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Get In <span className="text-primary">Touch</span></h2>
            <p className="section-subtitle">Have questions? We're here to help</p>
          </div>

          <div className="row g-5 align-items-center">
            <div className="col-lg-5" data-aos="fade-right">
              <div className="bg-primary bg-opacity-10 p-4 rounded-4 mb-4">
                <i className="bi bi-envelope-paper fs-1 text-primary mb-3"></i>
                <h3 className="fw-bold mb-3">Have Questions?</h3>
                <p className="text-muted mb-4">Feel free to reach out to our organizing team for any event-related queries or technical support.</p>
              </div>
              
              <div className="d-flex align-items-center gap-3 mb-3 p-3 bg-light rounded-3">
                <div className="bg-primary text-white rounded-circle p-3">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Visit Us</small>
                  <span className="fw-semibold">Darshan University, Rajkot</span>
                </div>
              </div>
              
              <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                <div className="bg-primary text-white rounded-circle p-3">
                  <i className="bi bi-envelope-at-fill"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Email Us</small>
                  <span className="fw-semibold">frolic2026@darshan.ac.in</span>
                </div>
              </div>
            </div>

            <div className="col-lg-7" data-aos="fade-left">
              <form onSubmit={submitContact} className="bg-white p-5 shadow-lg rounded-4 border-0">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold text-secondary">Full Name</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">
                        <i className="bi bi-person-fill text-primary"></i>
                      </span>
                      <input className="form-control bg-light border-0" value={contact.name} disabled />
                    </div>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold text-secondary">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">
                        <i className="bi bi-envelope-fill text-primary"></i>
                      </span>
                      <input className="form-control bg-light border-0" value={contact.email} disabled />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Subject</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-chat-text text-primary"></i>
                    </span>
                    <input 
                      className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                      placeholder="What is this about?" 
                      value={contact.subject} 
                      onChange={(e) => setContact({ ...contact, subject: e.target.value })} 
                    />
                  </div>
                  {errors.subject && <small className="text-danger">{errors.subject}</small>}
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Message</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-pencil-square text-primary"></i>
                    </span>
                    <textarea 
                      className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                      rows="4" 
                      placeholder="Type your message here..." 
                      value={contact.message} 
                      onChange={(e) => setContact({ ...contact, message: e.target.value })}
                    ></textarea>
                  </div>
                  {errors.message && <small className="text-danger">{errors.message}</small>}
                </div>

                <button className="btn btn-gradient w-100 py-3 fw-bold rounded-pill shadow-sm mt-3" disabled={sending}>
                  {sending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-dark text-white-50 py-5">
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-4 mb-md-0">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="bg-white p-2 rounded-3">
                  <img
                    src="/assets/images/frolic_logo.png"
                    height="40"
                    alt="Frolic Logo"
                    style={{ filter: "brightness(0)" }}
                  />
                </div>
                <div>
                  <h5 className="text-white mb-0 fs-4">FROLIC 2026</h5>
                  <small>Challenge Your Potential</small>
                </div>
              </div>
              <p className="small text-white-50">Empowering students through technical excellence and cultural diversity.</p>
            </div>
            
            <div className="col-md-4 mb-4 mb-md-0">
              <h6 className="text-white mb-3">Quick Links</h6>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <button className="btn btn-link footer-link p-0" onClick={() => scrollTo("events")}>
                    <i className="bi bi-chevron-right me-1"></i>
                    Events
                  </button>
                </li>
                <li className="mb-2">
                  <button className="btn btn-link footer-link p-0" onClick={() => scrollTo("winners")}>
                    <i className="bi bi-chevron-right me-1"></i>
                    Winners
                  </button>
                </li>
                <li className="mb-2">
                  <button className="btn btn-link footer-link p-0" onClick={() => scrollTo("facilities")}>
                    <i className="bi bi-chevron-right me-1"></i>
                    Facilities
                  </button>
                </li>
                <li className="mb-2">
                  <button className="btn btn-link footer-link p-0" onClick={() => scrollTo("contact")}>
                    <i className="bi bi-chevron-right me-1"></i>
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            
            <div className="col-md-4">
              <h6 className="text-white mb-3">Connect With Us</h6>
              <div className="d-flex gap-3 fs-4">
                <i className="bi bi-instagram cursor-pointer text-white-50 hover:text-white transition"></i>
                <i className="bi bi-facebook cursor-pointer text-white-50 hover:text-white transition"></i>
                <i className="bi bi-linkedin cursor-pointer text-white-50 hover:text-white transition"></i>
              </div>
            </div>
          </div>
          
          <hr className="my-4 border-white-10" />
          
          <div className="text-center small text-white-50">
            © 2026 Frolic – Darshan University. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* ================= EVENT DETAILS MODAL ================= */}
      
      {selectedEvent && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 overflow-hidden shadow-lg">
              {/* Header */}
              <div className="modal-header border-0 pb-0 px-4 pt-4">
                <h4 className="fw-bold m-0" style={{ color: "#1e293b" }}>{selectedEvent.eventName}</h4>
                <button className="btn-close" onClick={() => setSelectedEvent(null)}></button>
              </div>

              <div className="modal-body p-4">
                {/* IMAGE FIX: Removed fixed height, used w-100 and rounded corners */}
                <div className="position-relative mb-4 rounded-4 overflow-hidden shadow-sm border">
                  <img 
                    src={`/assets/images/${selectedEvent.eventImage}`} 
                    className="w-100 d-block" 
                    style={{ 
                      height: "auto", 
                      maxHeight: "450px", // Prevents the modal from becoming too tall on large screens
                      objectFit: "contain", // Ensures no cropping occurs
                      backgroundColor: "#f8f9fa" // Fills any tiny gaps if aspect ratios differ slightly
                    }} 
                    alt={selectedEvent.eventName} 
                  />
                  {selectedEvent.isTechnical && (
                    <span className="position-absolute top-0 end-0 m-3 badge bg-white text-primary px-3 py-2 rounded-pill shadow-sm">
                      <i className="bi bi-tag-fill me-1"></i> Technical
                    </span>
                  )}
                </div>

                <p className="text-muted mb-4 px-1">{selectedEvent.eventDescription}</p>

                <div className="row g-4">
                  {/* Event Details Card */}
                  <div className="col-md-6">
                    <div className="bg-light p-4 rounded-4 h-100 border-0 shadow-sm">
                      <h6 className="fw-bold mb-3 text-dark">Event Details</h6>
                      <div className="d-flex align-items-center mb-3">
                        <i className="bi bi-geo-alt-fill text-primary me-3 fs-5"></i>
                        <span className="text-secondary">{selectedEvent.eventLocation}</span>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <i className="bi bi-people-fill text-primary me-3 fs-5"></i>
                        <span className="text-secondary">Team Size: {selectedEvent.groupMinParticipants} - {selectedEvent.groupMaxParticipants}</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-currency-rupee text-primary me-3 fs-5"></i>
                        <span className="text-secondary">Fees: ₹{selectedEvent.eventFees}</span>
                      </div>
                    </div>
                  </div>

                  {/* Prize Money Card */}
                  <div className="col-md-6">
                    <div className="bg-light p-4 rounded-4 h-100 border-0 shadow-sm">
                      <h6 className="fw-bold mb-3 text-dark">Prize Money</h6>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-secondary">🏆 1st Prize:</span>
                        <span className="fw-bold text-dark">₹{selectedEvent.eventFirstPrize}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-secondary">🥈 2nd Prize:</span>
                        <span className="fw-bold text-dark">₹{selectedEvent.eventSecondPrize}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-secondary">🥉 3rd Prize:</span>
                        <span className="fw-bold text-dark">₹{selectedEvent.eventThirdPrize}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer border-0 p-4 pt-0 gap-3">
                <button 
                  className="btn btn-light border px-4 py-2 rounded-3 fw-bold text-secondary" 
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </button>
                <button 
                  className="btn btn-gradient px-4 py-2 rounded-3 fw-bold flex-grow-1"
                  onClick={() => {
                    setSelectedEvent(null);
                    navigate("/user/registerEvent", { state: { event_id: selectedEvent.event_id } });
                  }}
                >
                  Register Now <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= CHANGE PASSWORD MODAL ================= */}
      {showModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(5px)", zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "400px" }}>
            <div className="modal-content border-0 p-4 shadow-lg rounded-4">
              <div className="text-center mb-4">
                <div className="bg-primary text-white rounded-circle d-inline-flex p-3 mb-2">
                  <i className="bi bi-key fs-3"></i>
                </div>
                <h5 className="fw-bold">Change Password</h5>
                <p className="text-muted small">Update your account security</p>
              </div>

              <div className="mb-3">
                <label className="small fw-bold text-secondary mb-1">Current Password</label>
                <input 
                  type="password" 
                  placeholder="Enter current password" 
                  className="form-control rounded-3"
                  value={passwordData.oldPassword} 
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })} 
                />
              </div>

              <div className="mb-3">
                <label className="small fw-bold text-secondary mb-1">New Password</label>
                <input 
                  type="password" 
                  placeholder="Enter new password" 
                  className="form-control rounded-3"
                  value={passwordData.newPassword} 
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
                />
              </div>

              <div className="mb-4">
                <label className="small fw-bold text-secondary mb-1">Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="Confirm new password" 
                  className="form-control rounded-3"
                  value={passwordData.confirmPassword} 
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} 
                />
              </div>

              <div className="d-flex gap-2">
                <button 
                  className="btn btn-light w-100 py-2 fw-bold rounded-3 border" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-gradient w-100 py-2 fw-bold rounded-3" 
                  onClick={handleChangePassword}
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SCROLL TO TOP BUTTON ================= */}
      <div className="scroll-to-top" onClick={() => scrollTo("home")}>
        <i className="bi bi-arrow-up"></i>
      </div>
    </div>
  );
}