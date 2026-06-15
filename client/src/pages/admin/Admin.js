import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";

const TABS = [
  { path: "/admin/dashboard", label: "📊 Dashboard" },
  { path: "/admin/users", label: "👥 Users" },
  { path: "/admin/quizzes", label: "📝 Quizzes" },
  { path: "/admin/batches", label: "🗂 Batches" },
  { path: "/admin/results", label: "📋 Results" },
  { path: "/admin/leaderboard", label: "🏆 Leaderboard" },
  { path: "/admin/statistics", label: "📈 Statistics" },
  { path: "/admin/notifications", label: "🔔 Notifications" },
  { path: "/admin/subjects", label: "📚 Subjects" },
  { path: "/admin/profile", label: "👤 Profile" },
];

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AdminLayout>
      <div className="medminds-admin-root">
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <nav className="tabs-nav" id="adminTabs">
          {TABS.map((tab) => (
            <button
              key={tab.path}
              className={`tab-btn ${location.pathname === tab.path ? "active" : ""}`}
              data-tab={tab.path.replace("/admin/", "")}
              onClick={() => navigate(tab.path)}
            >
              {tab.label}
            </button>
          ))}
          <button
            className="tab-btn tab-btn-enroll"
            onClick={() => navigate("/enrollment-admin")}
          >
            📋 Enrollments
          </button>
        </nav>
      </div>
    </AdminLayout>
  );
};

export default Admin;
