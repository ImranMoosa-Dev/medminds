import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// import supabase from "../utils/SupabaseClient";
import { useAuth } from "../../context/auth";
import "../../styles/admin-enrollment.css";

const AdminEnrollment = () => {
  const navigate = useNavigate();
  const [auth] = useAuth();

  const allEnrollmentsRef = useRef([]);
  const selectedEnrollmentRef = useRef(null);

  useEffect(() => {
    document.title = "Enrollment Admin - MedMinds";

    // Mirror QBank auth pattern, then also do admin email check (original logic)
    // if (!auth?.user) {
    //   navigate("/login");
    //   return;
    // }

    // Expose handlers for inline onclick used in dynamically-injected table HTML
    window.__ea_openDetailModal = (id) => openDetailModal(id);
    window.__ea_applyFilters = () => applyFilters();

    // Close modal on outside click
    const modal = document.getElementById("detailModal");
    const onModalClick = (e) => {
      if (e.target.id === "detailModal") closeModal();
    };
    modal?.addEventListener("click", onModalClick);

    // checkAdmin();

    return () => {
      modal?.removeEventListener("click", onModalClick);
      delete window.__ea_openDetailModal;
      delete window.__ea_applyFilters;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Send a single email via Edge Function
  //   async function sendEmail(toEmail, toName, subject, template, extras = {}) {
  //     try {
  //       const payload = { to: toEmail, toName, subject, template, ...extras };
  //       const res = await fetch(EMAIL_ENDPOINT, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${SUPABASE_KEY}`,
  //         },
  //         body: JSON.stringify(payload),
  //       });
  //       const data = await res.json();
  //       if (!data.success) console.error("Email error:", data.error);
  //       else console.log("Email sent to:", toEmail);
  //     } catch (e) {
  //       console.error("sendEmail failed:", e.message);
  //     }
  //   }

  // Check admin access
  //   async function checkAdmin() {
  //     try {
  //       const adminEmails = ["admin@medminds.com", "service.medminds@gmail.com"];

  //       const { data: sessionData } = await supabase.auth.getSession();
  //       let email = sessionData?.session?.user?.email || null;

  //       if (!email) {
  //         const { data: userData } = await supabase.auth.getUser();
  //         email = userData?.user?.email || null;
  //       }

  //       console.log("[MedMinds] checkAdmin — detected email:", email);

  //       if (!email) {
  //         console.warn("[MedMinds] No session — redirecting to login");
  //         window.location.replace("index.html");
  //         return;
  //       }

  //       const normalised = email.trim().toLowerCase();
  //       const isAdmin = adminEmails
  //         .map((e) => e.toLowerCase())
  //         .includes(normalised);

  //       console.log(
  //         "[MedMinds] isAdmin:",
  //         isAdmin,
  //         "| normalised email:",
  //         normalised,
  //       );

  //       if (!isAdmin) {
  //         const gate = document.getElementById("authGate");
  //         if (gate) {
  //           gate.innerHTML =
  //             '<p style="color:#c0392b;font-size:15px;font-weight:700;">Access Denied - Admins Only</p>' +
  //             '<p style="color:#666;font-size:13px;">Signed in as: ' +
  //             email +
  //             "</p>" +
  //             '<p style="color:#666;font-size:13px;">Redirecting...</p>';
  //         }
  //         setTimeout(() => window.location.replace("index.html"), 2500);
  //         return;
  //       }

  //       const brand = document.querySelector("header.main-header .brand");
  //       if (brand)
  //         brand.textContent = "MedMinds - Enrollment Admin (" + email + ")";
  //       document.body.classList.add("auth-ready");
  //       await loadEnrollments();
  //     } catch (error) {
  //       console.error("[MedMinds] Auth error:", error);
  //       window.location.replace("index.html");
  //     }
  //   }

  //   async function loadEnrollments() {
  //     try {
  //       const { data: enrollments, error } = await supabase
  //         .from("enrollment_requests")
  //         .select(
  //           "id, user_id, batch_id, father_name, district, status, approval_status, created_at, admin_notes",
  //         )
  //         .order("created_at", { ascending: false });

  //       if (error) throw error;
  //       if (!enrollments || enrollments.length === 0) {
  //         allEnrollmentsRef.current = [];
  //         updateStats();
  //         renderTable([]);
  //         return;
  //       }

  //       const userIds = [...new Set(enrollments.map((e) => e.user_id))];
  //       const { data: users } = await supabase
  //         .from("users")
  //         .select("id, first_name, last_name, email, phone")
  //         .in("id", userIds);

  //       const batchIds = [
  //         ...new Set(enrollments.map((e) => e.batch_id).filter(Boolean)),
  //       ];
  //       const { data: batches } = await supabase
  //         .from("batches")
  //         .select("id, name")
  //         .in("id", batchIds);

  //       const userMap = {};
  //       (users || []).forEach((u) => {
  //         userMap[u.id] = u;
  //       });
  //       const batchMap = {};
  //       (batches || []).forEach((b) => {
  //         batchMap[b.id] = b;
  //       });

  //       allEnrollmentsRef.current = enrollments.map((e) => ({
  //         ...e,
  //         user: userMap[e.user_id] || {
  //           first_name: "Unknown",
  //           last_name: "",
  //           email: "-",
  //           phone: null,
  //         },
  //         batch: batchMap[e.batch_id] || { name: "Unknown Batch" },
  //       }));

  //       updateStats();
  //       renderTable(allEnrollmentsRef.current);
  //     } catch (error) {
  //       console.error("Load error:", error);
  //       showAlert(
  //         "Failed to load enrollment requests: " + error.message,
  //         "error",
  //       );
  //     }
  //   }

  function updateStats() {
    const allEnrollments = allEnrollmentsRef.current;
    const pending = allEnrollments.filter(
      (e) => e.approval_status === "pending",
    ).length;
    const approved = allEnrollments.filter(
      (e) => e.approval_status === "approved",
    ).length;
    const rejected = allEnrollments.filter(
      (e) => e.approval_status === "rejected",
    ).length;

    document.getElementById("statPending").textContent = pending;
    document.getElementById("statApproved").textContent = approved;
    document.getElementById("statRejected").textContent = rejected;
    document.getElementById("statTotal").textContent = allEnrollments.length;
  }

  function applyFilters() {
    const statusFilter = document.getElementById("filterStatus").value;
    const enrollmentFilter = document.getElementById(
      "filterEnrollmentStatus",
    ).value;
    const searchTerm = document
      .getElementById("searchInput")
      .value.toLowerCase();

    let filtered = allEnrollmentsRef.current.filter((e) => {
      const matchStatus = !statusFilter || e.approval_status === statusFilter;
      const matchEnrollment =
        !enrollmentFilter || e.status === enrollmentFilter;
      const userFullName =
        `${e.user.first_name} ${e.user.last_name}`.toLowerCase();
      const matchSearch =
        !searchTerm ||
        userFullName.includes(searchTerm) ||
        e.user.email.toLowerCase().includes(searchTerm) ||
        e.batch.name.toLowerCase().includes(searchTerm);

      return matchStatus && matchEnrollment && matchSearch;
    });

    renderTable(filtered);
  }

  function renderTable(enrollments) {
    const tbody = document.getElementById("tableBody");
    if (!tbody) return;

    if (enrollments.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10">
            <div class="empty-state">
              <div class="empty-state-icon">📭</div>
              <p>No enrollment requests found</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = enrollments
      .map((enrollment) => {
        const user = enrollment.user;
        const batch = enrollment.batch;
        const date = new Date(enrollment.created_at).toLocaleDateString();

        return `
        <tr>
          <td>${user.first_name} ${user.last_name}</td>
          <td>${user.email}</td>
          <td>${user.phone || "-"}</td>
          <td>${batch.name}</td>
          <td><span class="status-badge status-${enrollment.status}">${enrollment.status}</span></td>
          <td>${enrollment.father_name}</td>
          <td>${enrollment.district}</td>
          <td><span class="status-badge status-${enrollment.approval_status}">${enrollment.approval_status}</span></td>
          <td>${date}</td>
          <td>
            <div class="action-buttons">
              <button class="btn-small ${enrollment.approval_status !== "pending" ? "disabled" : ""}"
                      onclick="window.__ea_openDetailModal('${enrollment.id}')"
                      ${enrollment.approval_status !== "pending" ? "disabled" : ""}>
                👁️ View
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  }

  function openDetailModal(enrollmentId) {
    selectedEnrollmentRef.current = allEnrollmentsRef.current.find(
      (e) => e.id === enrollmentId,
    );
    if (!selectedEnrollmentRef.current) return;
    const selectedEnrollment = selectedEnrollmentRef.current;

    const user = selectedEnrollment.user;
    const batch = selectedEnrollment.batch;
    const date = new Date(selectedEnrollment.created_at).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );

    const details = `
      <div class="detail-row">
        <span class="detail-label">Name:</span>
        <span class="detail-value">${user.first_name} ${user.last_name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Email:</span>
        <span class="detail-value">${user.email}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Phone:</span>
        <span class="detail-value">${user.phone || "N/A"}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Batch:</span>
        <span class="detail-value">${batch.name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Father Name:</span>
        <span class="detail-value">${selectedEnrollment.father_name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">District:</span>
        <span class="detail-value">${selectedEnrollment.district}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span class="detail-value">${selectedEnrollment.status}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Applied:</span>
        <span class="detail-value">${date}</span>
      </div>
    `;

    document.getElementById("modalDetails").innerHTML = details;

    const isApproved = selectedEnrollment.approval_status !== "pending";
    document.getElementById("approveBtn").disabled = isApproved;
    document.getElementById("rejectBtn").disabled = isApproved;

    document.getElementById("detailModal").classList.add("show");
  }

  function closeModal() {
    document.getElementById("detailModal").classList.remove("show");
    document.getElementById("rejectReasonBox").style.display = "none";
    document.getElementById("modalActionBtns").style.display = "flex";
    document.getElementById("rejectReasonInput").value = "";
    selectedEnrollmentRef.current = null;
  }

  async function approveEnrollment() {
    const selectedEnrollment = selectedEnrollmentRef.current;
    if (!selectedEnrollment) return;

    const btn = document.getElementById("approveBtn");
    btn.disabled = true;
    btn.textContent = "Approving…";

    // try {
    //   const { error: userError } = await supabase
    //     .from("users")
    //     .update({ batch_id: selectedEnrollment.batch_id })
    //     .eq("id", selectedEnrollment.user_id);

    //   if (userError)
    //     throw new Error("Failed to assign batch: " + userError.message);

    //   const { error: enrollError } = await supabase
    //     .from("enrollment_requests")
    //     .update({ approval_status: "approved" })
    //     .eq("id", selectedEnrollment.id);

    //   if (enrollError)
    //     throw new Error(
    //       "Batch assigned but status update failed: " + enrollError.message,
    //     );

    //   const fullName = `${selectedEnrollment.user.first_name} ${selectedEnrollment.user.last_name}`;
    //   showAlert(`✅ Approved & batch assigned for ${fullName}!`, "success");

    //   const batchName =
    //     selectedEnrollment.batch?.name ||
    //     selectedEnrollment.batch_id ||
    //     "your batch";
    //   sendEmail(
    //     selectedEnrollment.user.email,
    //     selectedEnrollment.user.first_name || "Student",
    //     "Your MedMinds Enrollment has been Approved!",
    //     "approval",
    //     { batchName },
    //   );

    //   closeModal();
    //   await loadEnrollments();
    // } catch (error) {
    //   console.error("Approval error:", error);
    //   showAlert(
    //     "❌ " + (error.message || "Failed to approve enrollment"),
    //     "error",
    //   );
    //   btn.disabled = false;
    //   btn.textContent = "✅ Approve";
    // }
  }

  function showRejectInput() {
    document.getElementById("rejectReasonBox").style.display = "block";
    document.getElementById("modalActionBtns").style.display = "none";
    document.getElementById("rejectReasonInput").value = "";
    document.getElementById("rejectReasonInput").focus();
  }

  function cancelRejectInput() {
    document.getElementById("rejectReasonBox").style.display = "none";
    document.getElementById("modalActionBtns").style.display = "flex";
  }

  async function confirmReject() {
    const selectedEnrollment = selectedEnrollmentRef.current;
    if (!selectedEnrollment) return;

    const reason = document.getElementById("rejectReasonInput").value.trim();
    const btn = document.getElementById("confirmRejectBtn");
    btn.disabled = true;
    btn.textContent = "Rejecting…";

    // try {
    //   const { error } = await supabase
    //     .from("enrollment_requests")
    //     .update({
    //       approval_status: "rejected",
    //       admin_notes: reason || null,
    //     })
    //     .eq("id", selectedEnrollment.id);

    //   if (error) throw error;

    //   showAlert(
    //     `Enrollment rejected for ${selectedEnrollment.user.first_name} ${selectedEnrollment.user.last_name}`,
    //     "success",
    //   );

    //   const rejBatchName =
    //     selectedEnrollment.batch?.name ||
    //     selectedEnrollment.batch_id ||
    //     "requested batch";
    //   sendEmail(
    //     selectedEnrollment.user.email,
    //     selectedEnrollment.user.first_name || "Student",
    //     "Update on Your MedMinds Enrollment Request",
    //     "rejection",
    //     { batchName: rejBatchName, reason },
    //   );

    //   closeModal();
    //   await loadEnrollments();
    // } catch (error) {
    //   console.error("Rejection error:", error);
    //   showAlert("Failed to reject enrollment", "error");
    //   btn.disabled = false;
    //   btn.textContent = "Confirm Reject";
    // }
  }

  function showAlert(message, type = "error") {
    const alert = document.getElementById("alertBox");
    if (!alert) return;
    alert.textContent = message;
    alert.className = `alert ${type}`;
    alert.style.display = "block";
    setTimeout(() => {
      alert.style.display = "none";
    }, 5000);
  }

  //   function logout() {
  //     supabase.auth.signOut();
  //     window.location.replace("index.html");
  //   }

  return (
    <>
      {/* Auth gate: hidden once admin check passes */}
      <div id="authGate">
        <div className="gate-spinner"></div>
        <p>Verifying admin access…</p>
      </div>

      <header className="main-header">
        <div className="brand">📋 MedMinds - Enrollment Admin</div>
        <div className="nav-links">
          <a href="admin.html">← Back to Admin</a>
          <button>Logout</button>
        </div>
      </header>

      <div className="container">
        <div className="page-header">
          <h1>Enrollment Requests</h1>
          <p>Review and approve new batch enrollment requests from users</p>
        </div>

        <div id="alertBox" className="alert" style={{ display: "none" }}></div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Pending</div>
            <div className="stat-value" id="statPending">
              0
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Approved</div>
            <div className="stat-value" id="statApproved">
              0
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Rejected</div>
            <div className="stat-value" id="statRejected">
              0
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total</div>
            <div className="stat-value" id="statTotal">
              0
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="filter-group">
            <label>Filter by Status:</label>
            <select id="filterStatus" onChange={applyFilters} defaultValue="">
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Filter by Status Type:</label>
            <select
              id="filterEnrollmentStatus"
              onChange={applyFilters}
              defaultValue=""
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
              id="searchInput"
              placeholder="Search by name, email, or batch..."
              onKeyUp={applyFilters}
            />
          </div>
        </div>

        {/* Table */}
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
            <tbody id="tableBody">
              <tr>
                <td
                  colSpan="10"
                  style={{ textAlign: "center", padding: "40px" }}
                >
                  <span className="loading"></span> Loading...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <div id="detailModal" className="modal">
        <div className="modal-content">
          <div className="modal-header">👤 Enrollment Details</div>

          <div className="modal-details" id="modalDetails"></div>

          <div
            id="rejectReasonBox"
            style={{ display: "none", margin: "12px 0 4px" }}
          >
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
              id="rejectReasonInput"
              rows="3"
              placeholder="Enter reason..."
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
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              <button
                className="btn-reject"
                onClick={confirmReject}
                id="confirmRejectBtn"
              >
                Confirm Reject
              </button>
              <button className="btn-cancel" onClick={cancelRejectInput}>
                Cancel
              </button>
            </div>
          </div>

          <div className="modal-actions" id="modalActionBtns">
            <button
              className="btn-reject"
              onClick={showRejectInput}
              id="rejectBtn"
            >
              Reject
            </button>
            <button className="btn-cancel" onClick={closeModal}>
              Cancel
            </button>
            <button
              className="btn-approve"
              onClick={approveEnrollment}
              id="approveBtn"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminEnrollment;
