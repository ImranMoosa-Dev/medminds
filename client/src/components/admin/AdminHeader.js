import React from "react";
import { NavLink } from "react-router-dom";
import "../../styles/admin-header.css";

const AdminHeader = () => {
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
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => `tab-btn ${isActive ? "active" : ""}`}
        >
          📊 Dashboard
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) => `tab-btn ${isActive ? "active" : ""}`}
        >
          👥 Users
        </NavLink>

        <NavLink
          to="/admin/quizzes"
          className={({ isActive }) => `tab-btn ${isActive ? "active" : ""}`}
        >
          📝 Quizzes
        </NavLink>

        <NavLink
          to="/admin/batches"
          className={({ isActive }) => `tab-btn ${isActive ? "active" : ""}`}
        >
          🗂 Batches
        </NavLink>

        <NavLink
          to="/admin/results"
          className={({ isActive }) => `tab-btn ${isActive ? "active" : ""}`}
        >
          📋 Results
        </NavLink>

        <NavLink
          to="/admin/leaderboard"
          className={({ isActive }) => `tab-btn ${isActive ? "active" : ""}`}
        >
          🏆 Leaderboard
        </NavLink>

        <NavLink
          to="/admin/statistics"
          className={({ isActive }) => `tab-btn ${isActive ? "active" : ""}`}
        >
          📈 Statistics
        </NavLink>

        <NavLink
          to="/admin/notifications"
          className={({ isActive }) => `tab-btn ${isActive ? "active" : ""}`}
        >
          🔔 Notifications
        </NavLink>

        <NavLink
          to="/admin/subjects"
          className={({ isActive }) => `tab-btn ${isActive ? "active" : ""}`}
        >
          📚 Subjects
        </NavLink>

        <NavLink
          to="/admin/profile"
          className={({ isActive }) => `tab-btn ${isActive ? "active" : ""}`}
        >
          👤 Profile
        </NavLink>

        <NavLink
          to="/admin/enrollments"
          className={({ isActive }) =>
            `tab-btn tab-btn-enroll ${isActive ? "active" : ""}`
          }
        >
          📋 Enrollments
        </NavLink>
      </nav>
    </>
  );
};

export default AdminHeader;
