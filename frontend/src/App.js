import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Authentication Routes
import Login from "../src/auth/login";
import Registration from "../src/auth/registration";
import ForgotPassword from "../src/auth/forgot-password";

// User Panel Routes
import Dashboard from "../src/user/dashboard"; 
import RegisterEvent from "../src/user/registerEvent";
import Payment from "../src/user/payment";

// Layouts
import AdminLayout from "../src/admin/AdminLayout"; // The "Frame"

// Admin Panel Routes
import AdminDashboard from "../src/admin/dashboard";
import Events from "../src/admin/events";
import Groups from "../src/admin/groups";
import Departments from "../src/admin/departments";
import Institutes from "../src/admin/institutes";
import Participants from "../src/admin/participants";
import Winners from "../src/admin/winners";
import Users from "../src/admin/userlist";
import Feedback from "../src/admin/feedback";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* User Dashboard */}
        <Route path="/user/dashboard" element={<Dashboard />} />
        <Route path="/user/registerEvent" element={<RegisterEvent />} />
        <Route path="/user/payment" element={<Payment />} />

        {/* ================= ADMIN PANEL (PROPER NESTING) ================= */}
        {/* The AdminLayout contains your Sidebar, Header, and Footer.
            The <Outlet /> inside AdminLayout will render the child routes below.
        */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* This makes /admin automatically go to /admin/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="events" element={<Events />} />
          <Route path="groups" element={<Groups />} />
          <Route path="departments" element={<Departments />} />
          <Route path="institutes" element={<Institutes />} />
          <Route path="participants" element={<Participants />} />
          <Route path="winners" element={<Winners />} />
          <Route path="users" element={<Users />} />
          <Route path="feedback" element={<Feedback />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;