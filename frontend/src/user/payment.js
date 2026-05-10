import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user_id, event_id, eventName, eventFees } =
    location.state || {};

  const [paymentMode, setPaymentMode] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= SAFETY CHECK ================= */
  if (!eventName || !user_id || !event_id) {
    return (
      <div className="container py-5 text-center">
        <h4>No payment data found</h4>
        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate("/user/registerEvent")}
        >
          Go Back
        </button>
      </div>
    );
  }

  /* ================= HANDLE PAYMENT ================= */
  const handlePayment = async () => {
  if (!paymentMode) {
    alert("Please select payment mode");
    return;
  }

  try {
    setLoading(true);

    // Demo payment only (no backend call here)
    alert("Payment Successful (Demo Only)");

    navigate("/user/dashboard");

  } catch (err) {
    alert("Payment failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", background: "#f8f9fa" }}
    >
      <div className="card shadow-lg p-4 rounded-4" style={{ width: "400px" }}>
        <h4 className="fw-bold text-center mb-4">
          Payment Details
        </h4>

        <div className="mb-3">
          <strong>Event:</strong>
          <p>{eventName}</p>
        </div>

        <div className="mb-3">
          <strong>Event Fee:</strong>
          <p className="text-success fw-bold">₹{eventFees}</p>
        </div>

        <div className="mb-3">
          <label className="form-label">
            Select Payment Mode
          </label>

          <select
            className="form-select"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
          >
            <option value="">-- Choose Payment Mode --</option>
            <option value="upi">UPI</option>
            <option value="card">Credit / Debit Card</option>
            <option value="netbanking">Net Banking</option>
          </select>
        </div>

        <button
          className="btn btn-primary w-100"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? "Processing..." : "Make Payment"}
        </button>

        <button
          className="btn btn-outline-secondary w-100 mt-2"
          onClick={() => navigate("/user/registerEvent")}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
