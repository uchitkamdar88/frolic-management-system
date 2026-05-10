import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [coordinators, setCoordinators] = useState([]);

  const [formData, setFormData] = useState({
    dept_id: "",
    departmentName: "",
    departmentDescription: "",
    coordinator_id: "" 
  });

  const API = "http://localhost:8000/department";
  const USERS_API = "http://localhost:8000/users"; 

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      const [deptRes, userRes] = await Promise.all([
        axios.get(API),
        axios.get(USERS_API)
      ]);
      
      setDepartments(deptRes.data);

      // Filter: Only users where isAdmin is true can be coordinators
      const adminUsers = userRes.data.filter(user => user.isAdmin === true);
      setCoordinators(adminUsers); 
      
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper function to find name by ID
  const getCoordinatorName = (id) => {
    const coordinator = coordinators.find(u => u.user_id === id || u._id === id);
    return coordinator ? coordinator.userName : "Not Assigned";
  };

  // ================= AUTO-INCREMENT ID LOGIC =================
  const generateNextId = () => {
    if (departments.length === 0) return "D001";

    const ids = departments.map(dept => {
      // Handle cases where dept_id might not exist or be formatted differently
      const num = parseInt(dept.dept_id?.replace("D", ""));
      return isNaN(num) ? 0 : num;
    });

    const maxId = Math.max(...ids);
    const nextId = maxId + 1;

    return `D${String(nextId).padStart(3, "0")}`;
  };

  // ================= ADD / UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // WE ADD institute_id HERE to satisfy the backend "required" check
      // without asking the user for it.
      let payload = { 
        ...formData,
        institute_id: "I001" // Hardcoded to match your dummy data/backend requirement
      };

      if (editMode) {
        // Use dept_id for the URL parameter to match your backend route router.put('/:id')
        await axios.put(`${API}/${formData.dept_id}`, payload);
      } else {
        // Automatically generate the ID for new departments
        const nextId = generateNextId();
        payload.dept_id = nextId;
        
        await axios.post(`${API}/add`, payload);
      }
      
      closeModal();
      fetchData();
    } catch (err) {
      // Detailed error logging to see exactly what the backend is complaining about
      console.error("Save Error:", err.response?.data || err.message);
      alert(`Error saving department: ${err.response?.data?.error || "Check console"}`);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setFormData({ dept_id: "", departmentName: "", departmentDescription: "", coordinator_id: "" });
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete department ${id}?`)) return;
    try {
      await axios.delete(`${API}/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (dept) => {
    setFormData(dept);
    setEditMode(true);
    setShowModal(true);
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.departmentName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">Departments</h2>
        <button className="btn btn-primary px-4 shadow-sm" onClick={() => setShowModal(true)}>
          + Add New Department
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control border-0 bg-light"
            placeholder="🔍 Search by department name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive shadow-sm rounded">
        <table className="table table-hover align-middle bg-white mb-0">
          <thead className="table-primary">
            <tr>
              <th>ID</th>
              <th>Department Name</th>
              <th>Description</th>
              <th>Coordinator Name</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.map((dept) => (
              <tr key={dept._id}>
                <td className="fw-bold">{dept.dept_id}</td>
                <td>{dept.departmentName}</td>
                <td className="text-muted small">{dept.departmentDescription}</td>
                <td>
                   <span className="badge bg-info text-dark">
                     {getCoordinatorName(dept.coordinator_id)}
                   </span>
                </td>
                <td className="text-center">
                  <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleEdit(dept)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(dept.dept_id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <form onSubmit={handleSubmit}>
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">{editMode ? "📝 Edit Department" : "Add Department"}</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
                </div>

                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Department Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Computer Engineering"
                      required
                      value={formData.departmentName}
                      onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Enter department details..."
                      required
                      value={formData.departmentDescription}
                      onChange={(e) => setFormData({ ...formData, departmentDescription: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Assign Admin Coordinator</label>
                    <select 
                      className="form-select"
                      required
                      value={formData.coordinator_id}
                      onChange={(e) => setFormData({ ...formData, coordinator_id: e.target.value })}
                    >
                      <option value="">-- Choose Coordinator --</option>
                      {coordinators.map(user => (
                        <option key={user._id} value={user.user_id}>
                          {user.userName} ({user.user_id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">{editMode ? "Update Changes" : "Save Department"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}