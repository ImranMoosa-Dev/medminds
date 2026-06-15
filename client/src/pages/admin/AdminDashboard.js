import React from "react";
import AdminLayout from "../../components/layout/AdminLayout";

const AdminDashboard = () => {
  // ── ADMIN BOOTSTRAP ──────────────────────────────────────────────────────────
  // async function loadAdminDashboard() {
  //   try {
  //     const { data: ud } = await supabaseClient.auth.getUser();
  //     if (!ud?.user) {
  //       window.location.href = "index.html";
  //       return;
  //     }
  //     const adminEmails = ["admin@medminds.com", "service.medminds@gmail.com"];
  //     if (!adminEmails.includes(ud.user.email)) {
  //       alert("Access Denied: Admins only.");
  //       window.location.href = "index.html";
  //       return;
  //     }
  //     document.getElementById("adminEmail").textContent = ud.user.email;
  //     await Promise.all([
  //       loadDashboardStats(),
  //       loadRecentAttempts(),
  //       loadAllAttempts(),
  //       loadBatchesForQuizForm(),
  //     ]);
  //   } catch (e) {
  //     console.error("Dashboard init error:", e);
  //     alert("Error loading dashboard: " + e.message);
  //   }
  // }

  // async function loadDashboardStats() {
  //   try {
  //     const [{ data: qs }, { data: as }, { data: us }] = await Promise.all([
  //       supabaseClient.from("questions").select("id"),
  //       supabaseClient.from("quiz_attempts").select("score,total"),
  //       supabaseClient.from("users").select("id"),
  //     ]);
  //     document.getElementById("dashTotalQuestions").textContent = qs?.length || 0;
  //     document.getElementById("dashTotalAttempts").textContent = as?.length || 0;
  //     document.getElementById("dashTotalUsers").textContent = us?.length || 0;
  //     if (as?.length) {
  //       const avg = Math.round(
  //         as.reduce((s, a) => s + (a.score / a.total) * 100, 0) / as.length,
  //       );
  //       document.getElementById("dashAvgScore").textContent = avg + "%";
  //     }
  //   } catch (e) {
  //     console.error("Stats error:", e);
  //   }
  // }

  // async function loadRecentAttempts() {
  //   const el = document.getElementById("recentAttempts");
  //   try {
  //     const { data } = await supabaseClient
  //       .from("quiz_attempts")
  //       .select("id,user_id,score,total,created_at")
  //       .order("created_at", { ascending: false })
  //       .limit(5);
  //     if (!data?.length) {
  //       el.innerHTML = '<div class="no-data">No attempts yet</div>';
  //       return;
  //     }
  //     const { data: us } = await supabaseClient
  //       .from("users")
  //       .select("id,first_name,last_name");
  //     const uMap = {};
  //     us?.forEach(
  //       (u) => (uMap[u.id] = (u.first_name || "") + " " + (u.last_name || "")),
  //     );
  //     el.innerHTML = data
  //       .map((a) => {
  //         const pct = Math.round((a.score / a.total) * 100);
  //         return `<div class="recent-item">
  //         <div><div class="recent-name">${uMap[a.user_id]?.trim() || "Unknown"}</div><div class="recent-date">${new Date(a.created_at).toLocaleString()}</div></div>
  //         <div class="recent-score" style="color:${pct >= 70 ? "#16a34a" : "#ef4444"}">${a.score}/${a.total} (${pct}%)</div>
  //       </div>`;
  //       })
  //       .join("");
  //   } catch (e) {
  //     el.innerHTML = '<div class="no-data">Error loading attempts</div>';
  //   }
  // }

  // ── TAB SWITCHER ─────────────────────────────────────────────────────────────
  // function switchTab(name) {
  //   document
  //     .querySelectorAll(".tab-panel")
  //     .forEach((p) => p.classList.remove("active"));
  //   document
  //     .querySelectorAll(".tab-btn")
  //     .forEach((b) => b.classList.remove("active"));
  //   document.getElementById(name).classList.add("active");
  //   document.querySelector(`[data-tab="${name}"]`)?.classList.add("active");
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
  // }

  return (
    <AdminLayout>
      {/* ══ DASHBOARD ══ */}
      <div id="dashboard" className="tab-panel active">
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-label">Total Questions</div>
            <div id="dashTotalQuestions" className="stat-num">
              0
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Total Attempts</div>
            <div id="dashTotalAttempts" className="stat-num">
              0
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Average Score</div>
            <div id="dashAvgScore" className="stat-num">
              0%
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Total Users</div>
            <div id="dashTotalUsers" className="stat-num">
              0
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-hdr">
            <span className="card-title">🕐 Recent Quiz Attempts</span>
          </div>
          <div className="card-body">
            <div id="recentAttempts"></div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
