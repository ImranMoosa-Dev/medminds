import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import axios from "../../utils/AxiosConfig";
import "../../styles/admin-enrollment.css";

const AdminEnrollment = () => {
  const navigate = useNavigate();
  const [auth] = useAuth();
  const BASE_URL = process.env.REACT_APP_BASEURL;

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterEnrollmentStatus, setFilterEnrollmentStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processingAction, setProcessingAction] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    document.title = "Enrollment Admin - MedMinds";
    loadEnrollments();
  }, []);

  useEffect(() => {
    if (!showAlert) return;
    const timer = setTimeout(() => {
      setShowAlert(false);
      setAlertMessage("");
    }, 5000);
    return () => clearTimeout(timer);
  }, [showAlert]);

  const stats = useMemo(() => {
    const pending = enrollments.filter(
      (e) => e.approval_status === "pending",
    ).length;
    const approved = enrollments.filter(
      (e) => e.approval_status === "approved",
    ).length;
    const rejected = enrollments.filter(
      (e) => e.approval_status === "rejected",
    ).length;
    return { pending, approved, rejected, total: enrollments.length };
  }, [enrollments]);

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((e) => {
      const matchStatus = !filterStatus || e.approval_status === filterStatus;
      const matchEnrollment =
        !filterEnrollmentStatus || e.status === filterEnrollmentStatus;
      const userFullName =
        `${e.user?.first_name || ""} ${e.user?.last_name || ""}`.toLowerCase();
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        userFullName.includes(term) ||
        (e.user?.email || "").toLowerCase().includes(term) ||
        (e.batch?.name || "").toLowerCase().includes(term);
      return matchStatus && matchEnrollment && matchSearch;
    });
  }, [enrollments, filterStatus, filterEnrollmentStatus, searchTerm]);

  const loadEnrollments = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(
        `${BASE_URL}/api/v1/admin/enrollment-requests`,
      );
      const list = data?.enrollments || data || [];
      setEnrollments(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load enrollment requests",
      );
    } finally {
      setLoading(false);
    }
  };

  const triggerAlert = (message, type = "error") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
  };

  const openDetailModal = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowDetailModal(true);
    setShowRejectInput(false);
    setRejectReason("");
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedEnrollment(null);
    setShowRejectInput(false);
    setRejectReason("");
  };

  const handleOverlayClick = (e) => {
    if (e.target.id === "detailModal") closeDetailModal();
  };

  const handleShowRejectInput = () => {
    setShowRejectInput(true);
    setRejectReason("");
  };

  const handleCancelReject = () => {
    setShowRejectInput(false);
    setRejectReason("");
  };

  const handleApprove = async () => {
    if (!selectedEnrollment) return;
    setProcessingAction(true);
    try {
      await axios.post(
        `${BASE_URL}/api/v1/admin/enrollment-requests/${selectedEnrollment.id}/approve`,
      );
      const fullName = `${selectedEnrollment.user?.first_name || ""} ${selectedEnrollment.user?.last_name || ""}`.trim();
      triggerAlert(`Approved & batch assigned for ${fullName}!`, "success");
      closeDetailModal();
      await loadEnrollments();
    } catch (err) {
      triggerAlert(
        err.response?.data?.message || err.message || "Failed to approve enrollment",
        "error",
      );
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReject = async () => {
    if (!selectedEnrollment) return;
    setProcessingAction(true);
    try {
      await axios.post(
        `${BASE_URL}/api/v1/admin/enrollment-requests/${selectedEnrollment.id}/reject`,
        { reason: rejectReason || null },
      );
      const fullName = `${selectedEnrollment.user?.first_name || ""} ${selectedEnrollment.user?.last_name || ""}`.trim();
      triggerAlert(`Enrollment rejected for ${fullName}`, "success");
      closeDetailModal();
      await loadEnrollments();
    } catch (err) {
      triggerAlert(
        err.response?.data?.message || err.message || "Failed to reject enrollment",
        "error",
      );
    } finally {
      setProcessingAction(false);
    }
  };

  return (
    <>
      <header className="main-header">
        <div className="brand"> MedMinds - Enrollment Admin</div>
        <div className="nav-links">
          <a href="admin.html">← Back to Admin</a>
          <button>Logout</button>
        </div>
      </header>

      {showAlert && (
        <div
          style={{
            position: "fixed",
            top: "16px",
            right: "16px",
            zIndex: 9999,
            padding: "14px 20px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#fff",
            background: alertType === "success" ? "#16a34a" : "#dc2626",
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            maxWidth: "420px",
            animation: "slideIn 0.3s ease",
          }}
        >
          {alertMessage}
        </div>
      )}

      <div className="container">
        <div className="page-header">
          <h1>Enrollment Requests</h1>
          <p>Review and approve new batch enrollment requests from users</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{stats.pending}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Approved</div>
            <div className="stat-value">{stats.approved}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Rejected</div>
            <div className="stat-value">{stats.rejected}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Filter by Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Filter by Status Type:</label>
            <select
              value={filterEnrollmentStatus}
              onChange={(e) => setFilterEnrollmentStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="fresher">Fresher</option>
              <option value="improver">Improver</option>
            </select>
          </div>

          <div className="filter-group" style={{ flex: 1 }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, email, or batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table id="enrollmentTable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Batch</th>
                <th>Status</th>
                <th>Father Name</th>
                <th>District</th>
                <th>Approval</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="10"
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    <span className="loading"></span> Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan="10"
                    style={{ textAlign: "center", padding: "40px", color: "#dc2626" }}
                  >
                    {error}
                  </td>
                </tr>
              ) : filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan="10">
                    <div className="empty-state">
                      <div className="empty-state-icon">📭</div>
                      <p>No enrollment requests found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((enrollment) => {
                  const user = enrollment.user || {};
                  const batch = enrollment.batch || {};
                  const date = enrollment.created_at
                    ? new Date(enrollment.created_at).toLocaleDateString()
                    : "";
                  return (
                    <tr key={enrollment.id}>
                      <td>
                        {user.first_name || ""} {user.last_name || ""}
                      </td>
                      <td>{user.email || ""}</td>
                      <td>{user.phone || "-"}</td>
                      <td>{batch.name || ""}</td>
                      <td>
                        <span
                          className={`status-badge status-${enrollment.status}`}
                        >
                          {enrollment.status}
                        </span>
                      </td>
                      <td>{enrollment.father_name}</td>
                      <td>{enrollment.district}</td>
                      <td>
                        <span
                          className={`status-badge status-${enrollment.approval_status}`}
                        >
                          {enrollment.approval_status}
                        </span>
                      </td>
                      <td>{date}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className={`btn-small ${enrollment.approval_status !== "pending" ? "disabled" : ""}`}
                            disabled={enrollment.approval_status !== "pending"}
                            onClick={() => openDetailModal(enrollment)}
                          >
                            👁️ View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDetailModal && selectedEnrollment && (
        <div
          id="detailModal"
          className="modal show"
          onClick={handleOverlayClick}
        >
          <div className="modal-content">
            <div className="modal-header">👤 Enrollment Details</div>

            <div className="modal-details">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">
                  {selectedEnrollment.user?.first_name || ""}{" "}
                  {selectedEnrollment.user?.last_name || ""}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">
                  {selectedEnrollment.user?.email || ""}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">
                  {selectedEnrollment.user?.phone || "N/A"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Batch:</span>
                <span className="detail-value">
                  {selectedEnrollment.batch?.name || ""}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Father Name:</span>
                <span className="detail-value">
                  {selectedEnrollment.father_name}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">District:</span>
                <span className="detail-value">
                  {selectedEnrollment.district}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value">
                  {selectedEnrollment.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Applied:</span>
                <span className="detail-value">
                  {selectedEnrollment.created_at
                    ? new Date(
                        selectedEnrollment.created_at,
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
            </div>

            {showRejectInput ? (
              <div style={{ margin: "12px 0 4px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#555",
                    marginBottom: "6px",
                  }}
                >
                  Reason for Rejection (optional)
                </label>
                <textarea
                  rows="3"
                  placeholder="Enter reason..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1.5px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontFamily: "inherit",
                    resize: "vertical",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#0b63b7";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0";
                  }}
                ></textarea>
                <div
                  style={{ display: "flex", gap: "8px", marginTop: "10px" }}
                >
                  <button
                    className="btn-reject"
                    onClick={handleReject}
                    disabled={processingAction}
                  >
                    {processingAction ? "Rejecting…" : "Confirm Reject"}
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={handleCancelReject}
                    disabled={processingAction}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="modal-actions">
                <button
                  className="btn-reject"
                  onClick={handleShowRejectInput}
                  disabled={
                    processingAction ||
                    selectedEnrollment.approval_status !== "pending"
                  }
                >
                  Reject
                </button>
                <button
                  className="btn-cancel"
                  onClick={closeDetailModal}
                  disabled={processingAction}
                >
                  Cancel
                </button>
                <button
                  className="btn-approve"
                  onClick={handleApprove}
                  disabled={
                    processingAction ||
                    selectedEnrollment.approval_status !== "pending"
                  }
                >
                  {processingAction ? "Approving…" : "Approve"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminEnrollment;
