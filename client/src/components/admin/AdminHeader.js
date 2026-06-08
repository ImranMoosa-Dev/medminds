import React from "react";
import "../../styles/admin-header.css";

const AdminHeader = () => {
  // ── TAB SWITCHER ─────────────────────────────────────────────────────────────
  function switchTab(name) {
    document
      .querySelectorAll(".tab-panel")
      .forEach((p) => p.classList.remove("active"));
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document.getElementById(name).classList.add("active");
    document.querySelector(`[data-tab="${name}"]`)?.classList.add("active");
    //   const loaders = {
    //     users: loadAllUsers,
    //     quizzes: () => {
    //       loadAllQuizzes();
    //       loadQuizzesForDropdown();
    //     },
    //     batches: () => {
    //       loadAllBatches();
    //       loadScheduleBatchSelect();
    //     },
    //     attempts: loadAllAttempts,
    //     leadership: loadLeaderboard,
    //     statistics: loadStatistics,
    //     notifications: loadNotificationHistory,
    //     subjects: () => {
    //       loadSubjectsTab();
    //       loadSubjectsTabEnhanced();
    //     },
    //     profile: loadAdminProfile,
    //   };
    //   loaders[name]?.();
  }
  return (
    <>
      {/* ═══════ HEADER ═══════ */}
      <header className="hdr">
        <div className="hdr-inner">
          <div className="hdr-brand">
            <div className="hdr-logo">🏥 MedMinds Admin</div>
            <div className="hdr-sub">Dashboard & Management</div>
          </div>
          <div className="hdr-right">
            <span id="adminEmail" className="hdr-email">
              Loading…
            </span>
            <button className="btn-logout">Logout</button>
          </div>
        </div>
      </header>

      {/* ═══════ NAV TABS ═══════ */}
      <nav className="tabs-nav" id="adminTabs">
        <button
          className="tab-btn active"
          data-tab="dashboard"
          onClick={() => switchTab("dashboard")}
        >
          📊 Dashboard
        </button>
        <button
          className="tab-btn"
          data-tab="users"
          onClick={() => switchTab("users")}
        >
          👥 Users
        </button>
        <button
          className="tab-btn"
          data-tab="quizzes"
          onClick={() => switchTab("quizzes")}
        >
          📝 Quizzes
        </button>
        <button
          className="tab-btn"
          data-tab="batches"
          onClick={() => switchTab("batches")}
        >
          🗂 Batches
        </button>
        <button
          className="tab-btn"
          data-tab="attempts"
          onClick={() => switchTab("attempts")}
        >
          📋 Results
        </button>
        <button
          className="tab-btn"
          data-tab="leadership"
          onClick={() => switchTab("leadership")}
        >
          🏆 Leaderboard
        </button>
        <button
          className="tab-btn"
          data-tab="statistics"
          onClick={() => switchTab("statistics")}
        >
          📈 Statistics
        </button>
        <button
          className="tab-btn"
          data-tab="notifications"
          onClick={() => switchTab("notifications")}
        >
          🔔 Notifications
        </button>
        <button
          className="tab-btn"
          data-tab="subjects"
          onClick={() => switchTab("subjects")}
        >
          📚 Subjects
        </button>
        <button
          className="tab-btn"
          data-tab="profile"
          onClick={() => switchTab("profile")}
        >
          👤 Profile
        </button>
        <button
          className="tab-btn tab-btn-enroll"
          onClick={() => {
            // navigate("/enrollment-admin");
          }}
        >
          📋 Enrollments
        </button>
      </nav>
    </>
  );
};

export default AdminHeader;
