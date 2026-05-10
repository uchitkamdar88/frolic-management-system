import React, { useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AdminDashboard() {
  /* ================= DASHBOARD STATES ================= */
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    events: 0,
    groups: 0,
    institutes: 0,
    departments: 0,
    participants: 0,
  });

  /* ================= INITIALIZATION ================= */
  useEffect(() => {
    AOS.init({ duration: 700, once: true });
  }, []);

  /* ================= FETCH DYNAMIC DATA FROM BACKEND ================= */
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      
      let userCount = 0;
      let eventsCount = 0;
      let groupsCount = 0;
      let institutesCount = 0;
      let departmentsCount = 0;
      let participantsCount = 0;
      
      try {
        // Fetch user count
        try {
          const userStatsRes = await axios.get("http://localhost:8000/users/stats/non-admin-count");
          userCount = userStatsRes.data.count;
        } catch (userErr) {
          console.error("Error fetching user count:", userErr);
        }

        // Fetch events count
        try {
          const eventsRes = await axios.get("http://localhost:8000/events");
          eventsCount = eventsRes.data.length;
        } catch (err) {
          console.error("Events endpoint not available yet");
        }

        // Fetch groups count
        try {
          const groupsRes = await axios.get("http://localhost:8000/groups");
          groupsCount = groupsRes.data.length;
        } catch (err) {
          console.error("Groups endpoint not available yet");
        }

        // Fetch institutes count
        try {
          const institutesRes = await axios.get("http://localhost:8000/institute");
          institutesCount = institutesRes.data.length;
        } catch (err) {
          console.error("Institutes endpoint not available yet");
        }

        // Fetch departments count
        try {
          const departmentsRes = await axios.get("http://localhost:8000/department");
          departmentsCount = departmentsRes.data.length;
        } catch (err) {
          console.error("Departments endpoint not available yet");
        }

        // Fetch participants count
        try {
          const participantsRes = await axios.get("http://localhost:8000/participants");
          participantsCount = participantsRes.data.length;
        } catch (err) {
          console.error("Participants endpoint not available yet");
        }

        // Update all stats
        setStats({
          users: userCount,
          events: eventsCount,
          groups: groupsCount,
          institutes: institutesCount,
          departments: departmentsCount,
          participants: participantsCount,
        });

      } catch (err) {
        console.error("Error in loadStats:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  /* ================= UI CONFIGURATIONS ================= */
  const statCards = [
    { label: "Registered Users", value: stats.users, icon: "bi-person-badge", color: "#2563eb" },
    { label: "Total Events", value: stats.events, icon: "bi-calendar-check", color: "#10b981" },
    { label: "Active Groups", value: stats.groups, icon: "bi-collection", color: "#8b5cf6" },
    { label: "Institutes", value: stats.institutes, icon: "bi-geo-alt", color: "#f59e0b" },
    { label: "Departments", value: stats.departments, icon: "bi-diagram-3", color: "#06b6d4" },
    { label: "Total Participants", value: stats.participants, icon: "bi-award", color: "#ec4899" },
  ];

  return (
    <div className="dashboard-content">
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="cards-grid">
          {statCards.map((item, i) => (
            <div className="stat-card" key={i} data-aos="fade-up" data-aos-delay={i * 100}>
              <div className="stat-icon" style={{ background: `${item.color}15`, color: item.color }}>
                <i className={`bi ${item.icon}`}></i>
              </div>
              <div className="stat-details">
                <h3>{item.value}</h3>
                <p className="m-0 text-muted">{item.label}</p>
              </div>
              <div className="stat-progress" style={{ background: item.color }}></div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
        }

        .stat-card {
          background: white;
          border-radius: 20px;
          padding: 28px;
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #f1f5f9;
        }

        .stat-card:hover { 
          transform: translateY(-5px); 
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); 
        }

        .stat-icon {
          width: 60px; 
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
        }

        .stat-details h3 { 
          font-size: 28px; 
          font-weight: 800; 
          margin: 0; 
          color: #0f172a; 
        }
        
        .stat-details p { 
          font-size: 14px; 
          font-weight: 500; 
          margin: 0;
        }

        .stat-progress {
          position: absolute; 
          bottom: 0; 
          left: 0;
          height: 5px; 
          width: 100%;
          opacity: 0.5;
        }

        .text-muted { color: #64748b; }
        .m-0 { margin: 0; }
      `}</style>
    </div>
  );
}