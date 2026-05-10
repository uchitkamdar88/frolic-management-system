import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function RegisterEvent() {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [technicalEvents, setTechnicalEvents] = useState([]);
  const [nonTechnicalEvents, setNonTechnicalEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(location.state?.event_id || "");
  const [selectedEventObj, setSelectedEventObj] = useState(null);

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // Step 1: Select Event, Step 2: Group Details, Step 3: Payment

  // Group Details State
  const [groupDetails, setGroupDetails] = useState({
    groupName: "",
    totalMembers: 1
  });

  const [groupError, setGroupError] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [existingGroup, setExistingGroup] = useState(null);

  /* ================= CHECK LOGIN ================= */
  useEffect(() => {
    if (!storedUser) {
      navigate("/login");
    }
  }, [storedUser, navigate]);

  /* ================= FETCH EVENTS ================= */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:8000/events");

        const tech = res.data.filter((e) => e.isTechnical);
        const nonTech = res.data.filter((e) => !e.isTechnical);

        setTechnicalEvents(tech);
        setNonTechnicalEvents(nonTech);
      } catch (err) {
        alert("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  /* ================= CHECK EXISTING GROUP ================= */
  useEffect(() => {
    const checkExistingGroup = async () => {
      if (!storedUser || !selectedEvent) return;

      try {
        // Check if user already has a group for this event
        const groupsRes = await axios.get("http://localhost:8000/groups");
        const userGroups = groupsRes.data.filter(
          g => g.leader_id === storedUser.user_id && g.event_id === selectedEvent
        );

        if (userGroups.length > 0) {
          setExistingGroup(userGroups[0]);
          setGroupDetails({
            groupName: userGroups[0].groupName,
            totalMembers: userGroups[0].totalMembers
          });
        } else {
          setExistingGroup(null);
        }
      } catch (err) {
        console.error("Error checking existing group:", err);
      }
    };

    checkExistingGroup();
  }, [selectedEvent, storedUser]);

  /* ================= UPDATE SELECTED EVENT OBJECT ================= */
  useEffect(() => {
    const allEvents = [...technicalEvents, ...nonTechnicalEvents];
    const eventObj = allEvents.find(ev => ev.event_id === selectedEvent);
    setSelectedEventObj(eventObj);
  }, [selectedEvent, technicalEvents, nonTechnicalEvents]);

  /* ================= GENERATE GROUP ID ================= */
  const generateGroupId = async () => {
    try {
      const response = await axios.get("http://localhost:8000/groups");
      const existingGroups = response.data;
      
      // Find the highest group number
      let maxNum = 0;
      existingGroups.forEach(group => {
        const num = parseInt(group.group_id.replace("G", ""));
        if (num > maxNum) maxNum = num;
      });
      
      const nextNumber = maxNum + 1;
      return `G${String(nextNumber).padStart(3, "0")}`;
    } catch (err) {
      console.error("Error generating group ID:", err);
      // Fallback: use timestamp
      return `G${String(Date.now()).slice(-3)}`;
    }
  };

  /* ================= HANDLE GROUP INPUT CHANGE ================= */
  const handleGroupChange = (e) => {
    const { name, value } = e.target;
    
    // Validate total members
    if (name === "totalMembers") {
      const numValue = parseInt(value) || 1;
      if (numValue < 1) return;
      if (selectedEventObj && numValue > selectedEventObj.groupMaxParticipants) {
        setGroupError(`Maximum ${selectedEventObj.groupMaxParticipants} members allowed for this event`);
        return;
      }
      if (selectedEventObj && numValue < selectedEventObj.groupMinParticipants) {
        setGroupError(`Minimum ${selectedEventObj.groupMinParticipants} members required for this event`);
        return;
      }
      setGroupError("");
    }

    setGroupDetails({
      ...groupDetails,
      [name]: name === "totalMembers" ? parseInt(value) || 1 : value
    });
  };

  /* ================= CREATE GROUP ================= */
  const createGroup = async () => {
    if (!groupDetails.groupName.trim()) {
      setGroupError("Please enter a group name");
      return;
    }

    if (groupDetails.totalMembers < 1) {
      setGroupError("Total members must be at least 1");
      return;
    }

    if (selectedEventObj) {
      if (groupDetails.totalMembers < selectedEventObj.groupMinParticipants) {
        setGroupError(`Minimum ${selectedEventObj.groupMinParticipants} members required for this event`);
        return;
      }
      if (groupDetails.totalMembers > selectedEventObj.groupMaxParticipants) {
        setGroupError(`Maximum ${selectedEventObj.groupMaxParticipants} members allowed for this event`);
        return;
      }
    }

    setCreatingGroup(true);
    setGroupError("");

    try {
      if (existingGroup) {
        // Update existing group
        await axios.put(`http://localhost:8000/groups/${existingGroup.group_id}`, {
          groupName: groupDetails.groupName,
          totalMembers: groupDetails.totalMembers,
          event_id: selectedEvent,
          leader_id: storedUser.user_id
        });
        console.log("Group updated successfully");
      } else {
        // Generate new group_id
        const group_id = await generateGroupId();
        
        // Create new group with group_id
        await axios.post("http://localhost:8000/groups/add", {
          group_id: group_id,
          groupName: groupDetails.groupName,
          totalMembers: groupDetails.totalMembers,
          event_id: selectedEvent,
          leader_id: storedUser.user_id
        });
        console.log("Group created successfully with ID:", group_id);
      }

      // Move to payment step
      setStep(3);
    } catch (err) {
      console.error("Error creating group:", err);
      setGroupError(err.response?.data?.error || "Failed to create group. Please try again.");
    } finally {
      setCreatingGroup(false);
    }
  };

  /* ================= HANDLE REGISTRATION ================= */
  const handleRegistration = async () => {
    if (!selectedEvent) {
      alert("Please select an event");
      return;
    }

    try {
      // Save registration in backend
      await axios.post("http://localhost:8000/registration/add", {
        user_id: storedUser.user_id,
        event_id: selectedEvent,
      });

      // Navigate to payment page
      navigate("/user/payment", {
        state: {
          user_id: storedUser.user_id,
          event_id: selectedEvent,
          eventName: selectedEventObj.eventName,
          eventFees: selectedEventObj.eventFees,
          groupName: groupDetails.groupName,
          totalMembers: groupDetails.totalMembers
        },
      });

    } catch (err) {
      console.error("Registration error:", err);
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  /* ================= RENDER STEP INDICATOR ================= */
  const renderStepIndicator = () => {
    return (
      <div className="step-indicator mb-5">
        <div className={`step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Select Event</div>
        </div>
        <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
        <div className={`step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Group Details</div>
        </div>
        <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
        <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Payment</div>
        </div>
      </div>
    );
  };

  /* ================= RENDER EVENT SELECTION STEP ================= */
  const renderEventSelection = () => {
    return (
      <>
        <div className="col-12">
          <label className="form-label fw-semibold">
            Select Event <span className="text-danger">*</span>
          </label>
          <select
            className="form-select form-select-lg"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            required
          >
            <option value="" disabled>
              -- Choose Event --
            </option>

            {technicalEvents.length > 0 && (
              <optgroup label="🔧 Technical Events">
                {technicalEvents.map((event) => (
                  <option key={event._id} value={event.event_id}>
                    {event.eventName} - ₹{event.eventFees} ({event.groupMinParticipants}-{event.groupMaxParticipants} members)
                  </option>
                ))}
              </optgroup>
            )}

            {nonTechnicalEvents.length > 0 && (
              <optgroup label="🎉 Non-Technical Events">
                {nonTechnicalEvents.map((event) => (
                  <option key={event._id} value={event.event_id}>
                    {event.eventName} - ₹{event.eventFees} ({event.groupMinParticipants}-{event.groupMaxParticipants} members)
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          {selectedEventObj && (
            <div className="mt-2 p-3 bg-light rounded-3">
              <small className="text-muted d-block mb-2">Event Details:</small>
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className="bi bi-tag text-primary"></i>
                <span className="fw-medium">Fees: ₹{selectedEventObj.eventFees}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-people text-primary"></i>
                <span className="fw-medium">Group Size: {selectedEventObj.groupMinParticipants} - {selectedEventObj.groupMaxParticipants} members</span>
              </div>
            </div>
          )}
        </div>

        <div className="col-12 mt-4 d-flex gap-3">
          <button
            type="button"
            className="btn btn-outline-secondary w-50 py-3"
            onClick={() => navigate("/user/dashboard")}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary w-50 py-3"
            onClick={() => setStep(2)}
            disabled={!selectedEvent}
          >
            Next: Group Details
            <i className="bi bi-arrow-right ms-2"></i>
          </button>
        </div>
      </>
    );
  };

  /* ================= RENDER GROUP DETAILS STEP ================= */
  const renderGroupDetails = () => {
    return (
      <>
        {/* User Info (Read-only) */}
        <div className="col-md-6">
          <label className="form-label fw-semibold">Team Leader</label>
          <input
            type="text"
            className="form-control"
            value={storedUser?.userName}
            disabled
          />
          <small className="text-muted">You are the group leader</small>
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Leader Email</label>
          <input
            type="email"
            className="form-control"
            value={storedUser?.email}
            disabled
          />
        </div>

        {/* Group Name */}
        <div className="col-12">
          <label className="form-label fw-semibold">
            Group Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="groupName"
            className="form-control form-control-lg"
            placeholder="Enter your group name (e.g., Filmy Fauj)"
            value={groupDetails.groupName}
            onChange={handleGroupChange}
            required
          />
        </div>

        {/* Total Members */}
        <div className="col-12">
          <label className="form-label fw-semibold">
            Total Members in Group <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            name="totalMembers"
            className="form-control form-control-lg"
            min={selectedEventObj?.groupMinParticipants || 1}
            max={selectedEventObj?.groupMaxParticipants}
            value={groupDetails.totalMembers}
            onChange={handleGroupChange}
            required
          />
          {selectedEventObj && (
            <small className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              Allowed: {selectedEventObj.groupMinParticipants} - {selectedEventObj.groupMaxParticipants} members
            </small>
          )}
        </div>

        {/* Group Summary */}
        {groupDetails.groupName && groupDetails.totalMembers > 0 && (
          <div className="col-12">
            <div className="p-3 bg-light rounded-3">
              <small className="text-muted d-block mb-2">Group Summary:</small>
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className="bi bi-people-fill text-primary"></i>
                <span className="fw-medium">{groupDetails.groupName}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-person-badge text-primary"></i>
                <span className="fw-medium">Leader: {storedUser?.userName}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-people text-primary"></i>
                <span className="fw-medium">Total Members: {groupDetails.totalMembers}</span>
              </div>
            </div>
          </div>
        )}

        {groupError && (
          <div className="col-12">
            <div className="alert alert-danger py-2">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {groupError}
            </div>
          </div>
        )}

        <div className="col-12 mt-4 d-flex gap-3">
          <button
            type="button"
            className="btn btn-outline-secondary w-50 py-3"
            onClick={() => setStep(1)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back
          </button>

          <button
            type="button"
            className="btn btn-primary w-50 py-3"
            onClick={createGroup}
            disabled={creatingGroup || !groupDetails.groupName || groupDetails.totalMembers < 1}
          >
            {creatingGroup ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Creating Group...
              </>
            ) : existingGroup ? (
              <>
                Update & Continue
                <i className="bi bi-arrow-right ms-2"></i>
              </>
            ) : (
              <>
                Create Group & Continue
                <i className="bi bi-arrow-right ms-2"></i>
              </>
            )}
          </button>
        </div>
      </>
    );
  };

  /* ================= RENDER PAYMENT STEP ================= */
  const renderPaymentStep = () => {
    return (
      <>
        {/* Registration Summary */}
        <div className="col-12">
          <div className="card bg-primary text-white border-0 rounded-4">
            <div className="card-body p-4">
              <h5 className="mb-3">Registration Summary</h5>
              
              <div className="d-flex align-items-center gap-3 mb-3">
                <i className="bi bi-calendar-event fs-1"></i>
                <div>
                  <h6 className="mb-1">Event</h6>
                  <p className="mb-0">{selectedEventObj?.eventName}</p>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 mb-3">
                <i className="bi bi-people-fill fs-1"></i>
                <div>
                  <h6 className="mb-1">Group</h6>
                  <p className="mb-0">{groupDetails.groupName}</p>
                  <small>{groupDetails.totalMembers} members (You as leader)</small>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <i className="bi bi-cash-stack fs-1"></i>
                <div>
                  <h6 className="mb-1">Amount to Pay</h6>
                  <p className="mb-0 fs-3 fw-bold">₹{selectedEventObj?.eventFees}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 mt-4 d-flex gap-3">
          <button
            type="button"
            className="btn btn-outline-secondary w-50 py-3"
            onClick={() => setStep(2)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back
          </button>

          <button
            type="button"
            className="btn btn-success w-50 py-3"
            onClick={handleRegistration}
          >
            Proceed to Payment
            <i className="bi bi-credit-card ms-2"></i>
          </button>
        </div>
      </>
    );
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="navbar navbar-expand-lg fixed-top bg-white shadow-sm">
        <div className="container">
          <button
            className="navbar-brand d-flex align-items-center border-0 bg-transparent"
            onClick={() => navigate("/user/dashboard")}
          >
            <img
              src="/assets/images/frolic_logo.png"
              alt="Frolic Logo"
              height="40"
              className="me-2"
            />
            <span className="fw-bold text-primary">FROLIC</span>
          </button>

          <div className="ms-auto">
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate("/user/dashboard")}
            >
              Home
            </button>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <header
        className="py-5"
        style={{
          background:
            "linear-gradient(rgba(13,110,253,0.05), rgba(13,110,253,0.05))",
          minHeight: "100vh",
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="container text-center py-5">
          <h1 className="fw-bold">
            <span className="text-secondary">Event </span>
            <span className="text-primary">Registration</span>
          </h1>

          <nav>
            <ol className="breadcrumb justify-content-center">
              <li className="breadcrumb-item">
                <button
                  className="btn btn-link p-0"
                  onClick={() => navigate("/user/dashboard")}
                >
                  Home
                </button>
              </li>
              <li className="breadcrumb-item active">
                Register
              </li>
            </ol>
          </nav>
        </div>
      </header>

      {/* ================= FORM SECTION ================= */}
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card border-0 shadow-lg rounded-4">
                <div className="card-body p-4 p-md-5">
                  
                  {/* Step Indicator */}
                  {renderStepIndicator()}

                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary mb-3" style={{width: "3rem", height: "3rem"}}></div>
                      <p>Loading events...</p>
                    </div>
                  ) : (
                    <form onSubmit={(e) => e.preventDefault()} className="row g-4">

                      {/* User Info - Always visible but disabled */}
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={storedUser?.userName}
                          disabled
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={storedUser?.email}
                          disabled
                        />
                      </div>

                      {/* Render current step */}
                      {step === 1 && renderEventSelection()}
                      {step === 2 && renderGroupDetails()}
                      {step === 3 && renderPaymentStep()}

                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-light py-4 text-center">
        © 2026 Frolic – Darshan University
      </footer>

      {/* Step Indicator Styles */}
      <style jsx>{`
        .step-indicator {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .step-item {
          flex: 1;
          text-align: center;
          position: relative;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e9ecef;
          color: #6c757d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin: 0 auto 10px;
          transition: all 0.3s;
        }

        .step-item.active .step-number {
          background: #0d6efd;
          color: white;
          transform: scale(1.1);
        }

        .step-item.completed .step-number {
          background: #198754;
          color: white;
        }

        .step-label {
          font-size: 14px;
          font-weight: 500;
          color: #6c757d;
        }

        .step-item.active .step-label {
          color: #0d6efd;
          font-weight: 600;
        }

        .step-item.completed .step-label {
          color: #198754;
        }

        .step-line {
          flex: 0.5;
          height: 2px;
          background: #e9ecef;
          margin: 0 10px;
          position: relative;
          top: -15px;
        }

        .step-line.active {
          background: #0d6efd;
        }

        @media (max-width: 768px) {
          .step-label {
            font-size: 12px;
          }
          
          .step-number {
            width: 35px;
            height: 35px;
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
}