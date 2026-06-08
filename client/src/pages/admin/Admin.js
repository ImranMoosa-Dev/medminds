/* eslint-disable no-restricted-globals, no-unused-vars */
import React, { useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { useNavigate } from "react-router-dom";
// import supabase from "../utils/SupabaseClient";
import { useAuth } from "../../context/auth";

import "../../styles/admin.css";

// Reusable inline helpers for window-bound script handlers
const call = (name, ...args) => {
  if (typeof window !== "undefined" && typeof window[name] === "function") {
    return window[name](...args);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN SCRIPT LOGIC — converted verbatim from admin.html <script> blocks.
// All functions are attached to `window` so JSX onClick handlers can call them
// (matching the original inline onclick="funcName()" idiom). The supabase
// client is aliased as `supabaseClient` to match the original variable name.
// ═════════════════════════════════════════════════════════════════════════════
// const supabaseClient = supabase;

// Module-level state (matches original `let` declarations)
let _parsedCsvQuestions = [];
let _allAttemptsRaw = [];
let _quizNamesMap = {};
let currentEditingQuizId = null;
let currentQuizDetails = null;
let _adminTopics = [];
let _adminSubtopics = [];
let _parsedTopicCsvRows = [];
let _subjectsList = [];
let _scheduleRows = [];

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

// ── USERS ────────────────────────────────────────────────────────────────────
// async function loadAllUsers() {
//   const el = document.getElementById("usersList");
//   el.innerHTML = '<div class="no-data">Loading…</div>';
//   try {
//     const { data, error } = await supabaseClient
//       .from("users")
//       .select("*")
//       .order("created_at", { ascending: false });
//     if (error) throw error;
//     if (!data?.length) {
//       el.innerHTML = '<div class="no-data">No users yet</div>';
//       return;
//     }
//     const [{ data: attempts }, { data: batches }] = await Promise.all([
//       supabaseClient
//         .from("quiz_attempts")
//         .select("user_id,score,total,quiz_id,completed")
//         .eq("completed", true),
//       supabaseClient.from("batches").select("id,name"),
//     ]);
//     const batchMap = {};
//     (batches || []).forEach((b) => {
//       batchMap[b.id] = b.name;
//     });
//     el.innerHTML = data
//       .map((u) => {
//         const name =
//           ((u.first_name || "") + " " + (u.last_name || "")).trim() || "N/A";
//         const userAttempts = (attempts || []).filter((a) => a.user_id === u.id);
//         const totalAttempts = userAttempts.length;
//         const avgScore =
//           totalAttempts > 0
//             ? Math.round(
//                 userAttempts.reduce(
//                   (s, a) => s + (a.total > 0 ? (a.score / a.total) * 100 : 0),
//                   0,
//                 ) / totalAttempts,
//               )
//             : null;
//         const batchName = u.batch_id
//           ? batchMap[u.batch_id] || u.batch_id
//           : "Not enrolled";
//         const scoreColor =
//           avgScore === null
//             ? "var(--muted)"
//             : avgScore >= 70
//               ? "var(--green)"
//               : avgScore >= 50
//                 ? "var(--amber)"
//                 : "var(--red)";
//         return `<div class="user-card">
//         <div class="user-top">
//           <div>
//             <div class="user-name">${name}</div>
//             <div class="user-email">${u.email}</div>
//           </div>
//           <div style="text-align:right;flex-shrink:0">
//             <div style="font-size:18px;font-weight:800;color:${scoreColor}">${avgScore !== null ? avgScore + "%" : "—"}</div>
//             <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Avg Score</div>
//           </div>
//         </div>
//         <div class="user-meta">
//           <div><div class="meta-lbl">Batch</div><div class="meta-val">${batchName}</div></div>
//           <div><div class="meta-lbl">Phone</div><div class="meta-val">${u.phone || u.whatsapp || "N/A"}</div></div>
//           <div><div class="meta-lbl">Quizzes Done</div><div class="meta-val">${totalAttempts}</div></div>
//           <div><div class="meta-lbl">Joined</div><div class="meta-val">${new Date(u.created_at).toLocaleDateString()}</div></div>
//         </div>
//         <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">
//           <button class="btn btn-blue btn-sm" onclick="viewUserPerformance('${u.id}','${name.replace(/'/g, "\\'")}')">📊 Performance</button>
//           <button class="btn btn-gray btn-sm" onclick="viewUserResults('${u.id}','${name.replace(/'/g, "\\'")}')">📋 Results</button>
//           <button class="btn btn-red btn-sm" onclick="deleteUser('${u.id}','${u.email}')">🗑 Delete</button>
//         </div>
//       </div>`;
//       })
//       .join("");
//   } catch (e) {
//     el.innerHTML = `<div class="no-data">Error: ${e.message}</div>`;
//   }
// }

// async function viewUserPerformance(userId, userName) {
//   showUserModal(
//     userName,
//     '<div style="text-align:center;padding:20px;color:var(--muted)">Loading…</div>',
//   );
//   try {
//     const [{ data: attempts }, { data: quizzes }] = await Promise.all([
//       supabaseClient
//         .from("quiz_attempts")
//         .select("*")
//         .eq("user_id", userId)
//         .eq("completed", true)
//         .order("created_at", { ascending: true }),
//       supabaseClient.from("quizzes").select("id,name,quiz_order"),
//     ]);
//     const qMap = {};
//     (quizzes || []).forEach((q) => {
//       qMap[q.id] = q;
//     });
//     if (!attempts?.length) {
//       setUserModalBody('<div class="no-data">No completed quizzes yet.</div>');
//       return;
//     }
//     const total = attempts.length;
//     const avgPct = Math.round(
//       attempts.reduce(
//         (s, a) => s + (a.total > 0 ? (a.score / a.total) * 100 : 0),
//         0,
//       ) / total,
//     );
//     const best = attempts.reduce((b, a) =>
//       (a.total > 0 ? a.score / a.total : 0) >
//       (b.total > 0 ? b.score / b.total : 0)
//         ? a
//         : b,
//     );
//     const bestPct =
//       best.total > 0 ? Math.round((best.score / best.total) * 100) : 0;
//     const rows = attempts
//       .map((a) => {
//         const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
//         const col =
//           pct >= 70
//             ? "var(--green)"
//             : pct >= 50
//               ? "var(--amber)"
//               : "var(--red)";
//         const quiz = qMap[a.quiz_id];
//         const bar = `<div style="height:6px;background:var(--border);border-radius:3px;margin-top:4px"><div style="height:6px;width:${pct}%;background:${col};border-radius:3px;transition:width .6s"></div></div>`;
//         return `<tr>
//         <td style="padding:10px 12px;font-size:13px;color:var(--text)">${quiz ? quiz.name : "Quiz #" + a.quiz_id}</td>
//         <td style="padding:10px 12px;font-size:13px;color:var(--muted)">${a.score}/${a.total}</td>
//         <td style="padding:10px 12px;font-weight:700;color:${col}">${pct}%${bar}</td>
//         <td style="padding:10px 12px;font-size:12px;color:var(--muted)">${new Date(a.created_at).toLocaleDateString()}</td>
//         <td style="padding:10px 12px">
//           <button class="btn btn-blue btn-sm" onclick="adminViewResult('${userId}','${a.quiz_id}')">View</button>
//         </td>
//       </tr>`;
//       })
//       .join("");
//     setUserModalBody(`
//       <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">
//         <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px;text-align:center">
//           <div style="font-size:22px;font-weight:800;color:var(--blue-main)">${total}</div>
//           <div style="font-size:11px;color:var(--muted);text-transform:uppercase;margin-top:3px">Quizzes</div>
//         </div>
//         <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px;text-align:center">
//           <div style="font-size:22px;font-weight:800;color:${avgPct >= 70 ? "var(--green)" : avgPct >= 50 ? "var(--amber)" : "var(--red)"}">${avgPct}%</div>
//           <div style="font-size:11px;color:var(--muted);text-transform:uppercase;margin-top:3px">Avg Score</div>
//         </div>
//         <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px;text-align:center">
//           <div style="font-size:22px;font-weight:800;color:var(--green)">${bestPct}%</div>
//           <div style="font-size:11px;color:var(--muted);text-transform:uppercase;margin-top:3px">Best</div>
//         </div>
//       </div>
//       <div style="overflow-x:auto">
//         <table style="width:100%;border-collapse:collapse">
//           <thead><tr style="background:linear-gradient(135deg,var(--blue-main),var(--blue-mid));color:#fff">
//             <th style="padding:10px 12px;text-align:left;font-size:12px">Quiz</th>
//             <th style="padding:10px 12px;text-align:left;font-size:12px">Score</th>
//             <th style="padding:10px 12px;text-align:left;font-size:12px">%</th>
//             <th style="padding:10px 12px;text-align:left;font-size:12px">Date</th>
//             <th style="padding:10px 12px;text-align:left;font-size:12px">Detail</th>
//           </tr></thead>
//           <tbody>${rows}</tbody>
//         </table>
//       </div>`);
//   } catch (e) {
//     setUserModalBody(
//       `<div class="no-data" style="color:var(--red)">Error: ${e.message}</div>`,
//     );
//   }
// }

// async function viewUserResults(userId, userName) {
//   showUserModal(
//     userName + " — Quiz Results",
//     '<div style="text-align:center;padding:20px;color:var(--muted)">Loading…</div>',
//   );
//   try {
//     const [{ data: quizzes }, { data: attempts }] = await Promise.all([
//       supabaseClient
//         .from("quizzes")
//         .select("id,name,quiz_order,is_published")
//         .order("quiz_order", { ascending: true }),
//       supabaseClient
//         .from("quiz_attempts")
//         .select("*")
//         .eq("user_id", userId)
//         .eq("completed", true),
//     ]);
//     const attemptMap = {};
//     (attempts || []).forEach((a) => {
//       attemptMap[a.quiz_id] = a;
//     });
//     if (!quizzes?.length) {
//       setUserModalBody('<div class="no-data">No quizzes created yet.</div>');
//       return;
//     }
//     const rows = quizzes
//       .map((q) => {
//         const a = attemptMap[q.id];
//         if (a) {
//           const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
//           const col =
//             pct >= 70
//               ? "var(--green)"
//               : pct >= 50
//                 ? "var(--amber)"
//                 : "var(--red)";
//           return `<tr style="border-bottom:1px solid var(--border)">
//           <td style="padding:11px 12px;font-size:13px">${q.name}</td>
//           <td style="padding:11px 12px"><span style="background:var(--green-bg);color:var(--green);padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">✅ Done</span></td>
//           <td style="padding:11px 12px;font-weight:700;color:${col}">${pct}% (${a.score}/${a.total})</td>
//           <td style="padding:11px 12px;font-size:12px;color:var(--muted)">${new Date(a.created_at).toLocaleDateString()}</td>
//           <td style="padding:11px 12px"><button class="btn btn-blue btn-sm" onclick="adminViewResult('${userId}','${q.id}')">📋 View</button></td>
//         </tr>`;
//         } else {
//           return `<tr style="border-bottom:1px solid var(--border);opacity:.65">
//           <td style="padding:11px 12px;font-size:13px">${q.name}</td>
//           <td style="padding:11px 12px"><span style="background:var(--amber-bg);color:var(--amber);padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">⏳ Not Taken</span></td>
//           <td style="padding:11px 12px;color:var(--muted);font-size:13px">—</td>
//           <td style="padding:11px 12px;color:var(--muted);font-size:12px">—</td>
//           <td style="padding:11px 12px;color:var(--muted);font-size:12px">—</td>
//         </tr>`;
//         }
//       })
//       .join("");
//     setUserModalBody(`<div style="overflow-x:auto">
//       <table style="width:100%;border-collapse:collapse">
//         <thead><tr style="background:linear-gradient(135deg,var(--blue-main),var(--blue-mid));color:#fff">
//           <th style="padding:10px 12px;text-align:left;font-size:12px">Quiz</th>
//           <th style="padding:10px 12px;text-align:left;font-size:12px">Status</th>
//           <th style="padding:10px 12px;text-align:left;font-size:12px">Score</th>
//           <th style="padding:10px 12px;text-align:left;font-size:12px">Date</th>
//           <th style="padding:10px 12px;text-align:left;font-size:12px">Detail</th>
//         </tr></thead>
//         <tbody>${rows}</tbody>
//       </table>
//     </div>`);
//   } catch (e) {
//     setUserModalBody(
//       `<div class="no-data" style="color:var(--red)">Error: ${e.message}</div>`,
//     );
//   }
// }

function adminViewResult(userId, quizId) {
  const url = `result.html?adminUserId=${userId}&quizId=${quizId}`;
  window.open(url, "_blank");
}

// function showUserModal(title, bodyHtml) {
//   let modal = document.getElementById("userPerfModal");
//   if (!modal) {
//     modal = document.createElement("div");
//     modal.id = "userPerfModal";
//     modal.style.cssText =
//       "position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px";
//     modal.innerHTML = `<div style="background:var(--card);border-radius:16px;width:100%;max-width:720px;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.3)">
//       <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid var(--border);flex-shrink:0">
//         <h3 id="userModalTitle" style="font-size:16px;font-weight:700;color:var(--text)"></h3>
//         <button onclick="closeUserModal()" style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:6px 12px;cursor:pointer;font-size:13px;font-weight:600;color:var(--muted)">✕ Close</button>
//       </div>
//       <div id="userModalBody" style="padding:22px;overflow-y:auto;flex:1"></div>
//     </div>`;
//     modal.addEventListener("click", (e) => {
//       if (e.target === modal) closeUserModal();
//     });
//     document.body.appendChild(modal);
//   }
//   document.getElementById("userModalTitle").textContent = title;
//   document.getElementById("userModalBody").innerHTML = bodyHtml;
//   modal.style.display = "flex";
// }
// function setUserModalBody(html) {
//   const el = document.getElementById("userModalBody");
//   if (el) el.innerHTML = html;
// }
function closeUserModal() {
  const modal = document.getElementById("userPerfModal");
  if (modal) modal.style.display = "none";
}

function toggleAddUserForm() {
  const f = document.getElementById("addUserForm");
  f.style.display = f.style.display === "none" ? "block" : "none";
}

// async function submitNewUser(event) {
//   event.preventDefault();
//   try {
//     const email = document.getElementById("newUserEmail").value;
//     const password = document.getElementById("newUserPassword").value;
//     const { data: authData, error: authErr } = await supabaseClient.auth.signUp(
//       {
//         email,
//         password,
//         options: {
//           data: {
//             first_name: document.getElementById("newUserFirstName").value,
//             last_name: document.getElementById("newUserLastName").value,
//           },
//         },
//       },
//     );
//     if (authErr) throw authErr;
//     const uid = authData.user?.id;
//     if (!uid) throw new Error("No user ID returned");
//     await supabaseClient.from("users").insert([
//       {
//         id: uid,
//         email,
//         first_name: document.getElementById("newUserFirstName").value,
//         last_name: document.getElementById("newUserLastName").value,
//         district: document.getElementById("newUserDistrict").value,
//         phone: document.getElementById("newUserWhatsapp").value,
//       },
//     ]);
//     alert("User created! You may need to log back in as admin.");
//     window.location.href = "index.html";
//   } catch (e) {
//     alert("Error: " + e.message);
//   }
// }

// async function deleteUser(id, email) {
//   if (!confirm(`Delete user ${email}?`)) return;
//   try {
//     const { error } = await supabaseClient.from("users").delete().eq("id", id);
//     if (error) throw error;
//     alert(
//       "User removed from students list.\nTo delete their login, use Supabase Dashboard → Auth → Users.",
//     );
//     await loadAllUsers();
//   } catch (e) {
//     alert("Error: " + e.message);
//   }
// }

// ── QUIZZES — CREATE FORM ────────────────────────────────────────────────────
// function toggleAddQuizForm() {
//   const box = document.getElementById("addQuizFormContainer");
//   const open = box.style.display !== "none" && box.style.display !== "";
//   box.style.display = open ? "none" : "block";
//   if (!open) {
//     loadBatchesForQuizForm();
//     loadSubjectsForQuizForm();
//     document.getElementById("quizName").focus();
//   }
// }

// async function loadBatchesForQuizForm(preselectedIds = []) {
//   try {
//     const { data } = await supabaseClient
//       .from("batches")
//       .select("id,name")
//       .order("name", { ascending: true });
//     const batches = data || [];
//     const createBox = document.getElementById("quizBatchCheckboxes");
//     if (createBox) {
//       createBox.innerHTML =
//         batches.length === 0
//           ? '<span style="color:var(--muted);font-size:13px">No batches yet — create one first</span>'
//           : batches
//               .map(
//                 (b) => `
//             <label style="display:flex;align-items:center;gap:6px;padding:5px 10px;border:1.5px solid var(--border);border-radius:7px;cursor:pointer;font-size:13px;background:#fff;white-space:nowrap">
//               <input type="checkbox" name="createBatch" value="${b.id}" style="cursor:pointer"> ${b.name}
//             </label>`,
//               )
//               .join("");
//     }
//     const editBox = document.getElementById("editQuizBatchCheckboxes");
//     if (editBox) {
//       editBox.innerHTML =
//         batches.length === 0
//           ? '<span style="color:var(--muted);font-size:13px">No batches yet</span>'
//           : batches
//               .map(
//                 (b) => `
//             <label style="display:flex;align-items:center;gap:6px;padding:5px 10px;border:1.5px solid var(--border);border-radius:7px;cursor:pointer;font-size:13px;background:#fff;white-space:nowrap">
//               <input type="checkbox" name="editBatch" value="${b.id}" ${preselectedIds.includes(String(b.id)) ? "checked" : ""} style="cursor:pointer"> ${b.name}
//             </label>`,
//               )
//               .join("");
//     }
//     const copyFrom = document.getElementById("copyFromQuizSelect");
//     if (copyFrom) {
//       const { data: quizzes } = await supabaseClient
//         .from("quizzes")
//         .select("id,name")
//         .order("quiz_order", { ascending: true });
//       copyFrom.innerHTML =
//         '<option value="">— Pick a quiz to copy from —</option>';
//       (quizzes || [])
//         .filter((q) => q.id !== currentEditingQuizId)
//         .forEach((q) =>
//           copyFrom.insertAdjacentHTML(
//             "beforeend",
//             `<option value="${q.id}">${q.name}</option>`,
//           ),
//         );
//     }
//   } catch (e) {
//     console.warn("loadBatchesForQuizForm:", e);
//   }
// }

function handleCsvPreview(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.name.endsWith(".csv")) {
    alert("Please select a .csv file");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = parseCsvToQuestions(e.target.result);
      if (parsed.length === 0) {
        alert("No valid questions found in CSV. Check the format.");
        return;
      }
      _parsedCsvQuestions = parsed;
      document.getElementById("csvCount").textContent =
        parsed.length + " questions detected";
      document.getElementById("csvFileName").textContent = file.name;
      document.getElementById("csvPreview").classList.add("show");
      document.getElementById("subjectRangeSection").classList.add("show");
    } catch (err) {
      alert("CSV parse error: " + err.message);
    }
  };
  reader.readAsText(file);
}

function clearCsvUpload() {
  _parsedCsvQuestions = [];
  document.getElementById("csvFileInput").value = "";
  document.getElementById("csvPreview").classList.remove("show");
  document.getElementById("csvProgress").classList.remove("show");
  document.getElementById("subjectRangeSection").classList.remove("show");
  document.querySelectorAll(".subject-check-label input").forEach((cb) => {
    cb.checked = false;
  });
  document
    .querySelectorAll(".subject-row")
    .forEach((row) => row.classList.remove("show"));
  document.querySelectorAll(".subject-row-count").forEach((el) => {
    el.textContent = "— MCQs";
    el.style.color = "var(--muted)";
  });
  document
    .querySelectorAll(".subject-row input[type=number]")
    .forEach((inp) => {
      inp.value = "";
    });
}

// async function loadSubjectsForQuizForm() {
//   try {
//     const { data, error } = await supabaseClient
//       .from("subjects")
//       .select("name, icon, color")
//       .order("name", { ascending: true });
//     if (error) throw error;
//     _subjectsList = data || [];
//     _buildSubjectFormUI(_subjectsList);
//   } catch (e) {
//     console.warn("loadSubjectsForQuizForm:", e.message);
//     _subjectsList = [
//       { name: "Biology", icon: "🧬", color: "#16a34a" },
//       { name: "Chemistry", icon: "⚗️", color: "#0b63b7" },
//       { name: "Physics", icon: "⚡", color: "#7c3aed" },
//       { name: "English", icon: "📖", color: "#d97706" },
//       { name: "Logical Reasoning", icon: "🧠", color: "#dc2626" },
//     ];
//     _buildSubjectFormUI(_subjectsList);
//   }
// }

function _buildSubjectFormUI(list) {
  const checkboxesEl = document.getElementById("subjectCheckboxes");
  const rowsEl = document.getElementById("subjectRows");
  if (!checkboxesEl || !rowsEl) return;
  if (!list.length) {
    checkboxesEl.innerHTML =
      '<span style="font-size:12px;color:var(--muted)">No subjects found. Add subjects in the 📚 Subjects tab first.</span>';
    rowsEl.innerHTML = "";
    return;
  }
  checkboxesEl.innerHTML = list
    .map(
      (s) => `
    <label class="subject-check-label">
      <input type="checkbox" value="${s.name}" onchange="toggleSubjectRow(this.value, this.checked)">
      ${s.icon} ${s.name}
    </label>`,
    )
    .join("");
  rowsEl.innerHTML = list
    .map(
      (s) => `
    <div id="subjectRow_${s.name}" class="subject-row">
      <span class="subject-row-label">${s.icon} ${s.name}</span>
      <span style="font-size:12px;color:var(--muted);">Q</span>
      <input type="number" id="subj_${s.name}_from" min="1" placeholder="from"
        oninput="updateSubjectCount(this.dataset.subj)" data-subj="${s.name}">
      <span style="font-size:12px;color:var(--muted);">to Q</span>
      <input type="number" id="subj_${s.name}_to" min="1" placeholder="to"
        oninput="updateSubjectCount(this.dataset.subj)" data-subj="${s.name}">
      <span class="subject-row-count" id="subj_${s.name}_count">— MCQs</span>
    </div>`,
    )
    .join("");
}

function toggleSubjectRow(subject, checked) {
  const row = document.getElementById("subjectRow_" + subject);
  if (row) {
    row.classList.toggle("show", checked);
    if (!checked) {
      const fromEl = document.getElementById("subj_" + subject + "_from");
      const toEl = document.getElementById("subj_" + subject + "_to");
      const countEl = document.getElementById("subj_" + subject + "_count");
      if (fromEl) fromEl.value = "";
      if (toEl) toEl.value = "";
      if (countEl) {
        countEl.textContent = "— MCQs";
        countEl.style.color = "var(--muted)";
      }
    }
  }
}

function updateSubjectCount(subject) {
  const total = _parsedCsvQuestions.length;
  const from =
    parseInt(document.getElementById("subj_" + subject + "_from")?.value) || 0;
  const to =
    parseInt(document.getElementById("subj_" + subject + "_to")?.value) || 0;
  const el = document.getElementById("subj_" + subject + "_count");
  if (!el) return;
  if (from > 0 && to >= from) {
    const count = Math.min(to, total) - from + 1;
    el.textContent = count + " MCQs";
    el.style.color = count > 0 ? "var(--green)" : "var(--red)";
  } else {
    el.textContent = "— MCQs";
    el.style.color = "var(--muted)";
  }
}

function getSubjectRanges() {
  const ranges = [];
  const total = _parsedCsvQuestions.length;
  _subjectsList.forEach((s) => {
    const cb = document.querySelector(
      `.subject-check-label input[value="${s.name}"]`,
    );
    if (!cb?.checked) return;
    const from = parseInt(
      document.getElementById("subj_" + s.name + "_from")?.value,
    );
    const to = parseInt(
      document.getElementById("subj_" + s.name + "_to")?.value,
    );
    if (from > 0 && to >= from) {
      ranges.push({
        subject: s.name,
        from: Math.min(from, total),
        to: Math.min(to, total),
      });
    }
  });
  return ranges;
}

function applySubjectRanges(questions, ranges) {
  return questions.map((q, i) => {
    const qNo = i + 1;
    const found = ranges.find((r) => qNo >= r.from && qNo <= r.to);
    return { ...q, subject: found ? found.subject : null };
  });
}

function getSelectedSubjects() {
  return _subjectsList
    .map((s) => s.name)
    .filter(
      (name) =>
        document.querySelector(`.subject-check-label input[value="${name}"]`)
          ?.checked,
    );
}

// async function submitNewQuiz(event) {
//   event.preventDefault();
//   const btn = document.getElementById("createQuizBtn");
//   btn.disabled = true;
//   btn.textContent = "Creating…";
//   try {
//     const { data: ud } = await supabaseClient.auth.getUser();
//     const createChecked = Array.from(
//       document.querySelectorAll('input[name="createBatch"]:checked'),
//     ).map((cb) => cb.value);
//     const selectedSubjects = getSelectedSubjects();
//     const quizData = {
//       name: document.getElementById("quizName").value.trim(),
//       description: document.getElementById("quizDescription").value.trim(),
//       quiz_order: parseInt(document.getElementById("quizOrder").value),
//       type: document.getElementById("quizType").value || null,
//       syllabus: document.getElementById("quizSyllabus").value || null,
//       subjects: selectedSubjects.length > 0 ? selectedSubjects : null,
//       batch_id: createChecked.length === 1 ? createChecked[0] : null,
//       scheduled_date: document.getElementById("scheduledDate").value || null,
//       is_published: false,
//       created_by: ud.user.id,
//     };
//     const { data: newQuiz, error } = await supabaseClient
//       .from("quizzes")
//       .insert([quizData])
//       .select()
//       .single();
//     if (error) throw error;
//     if (createChecked.length > 0) {
//       const jRows = createChecked.map((bId) => ({
//         quiz_id: newQuiz.id,
//         batch_id: bId,
//       }));
//       const { error: jErr } = await supabaseClient
//         .from("quiz_batches")
//         .upsert(jRows, { onConflict: "quiz_id,batch_id" });
//       if (jErr)
//         console.warn("quiz_batches insert (non-critical):", jErr.message);
//     }
//     if (_parsedCsvQuestions.length > 0) {
//       const prog = document.getElementById("csvProgress");
//       const bar = document.getElementById("csvProgressBar");
//       const lbl = document.getElementById("csvProgressLabel");
//       prog.classList.add("show");
//       const subjectRanges = getSubjectRanges();
//       const taggedQuestions =
//         subjectRanges.length > 0
//           ? applySubjectRanges(_parsedCsvQuestions, subjectRanges)
//           : _parsedCsvQuestions;
//       const toInsert = taggedQuestions.map((q) => ({
//         ...q,
//         quiz_id: newQuiz.id,
//       }));
//       const CHUNK = 50;
//       let done = 0;
//       for (let i = 0; i < toInsert.length; i += CHUNK) {
//         const chunk = toInsert.slice(i, i + CHUNK);
//         const { error: qErr } = await supabaseClient
//           .from("questions")
//           .insert(chunk);
//         if (qErr) throw qErr;
//         done += chunk.length;
//         const pct = Math.round((done / toInsert.length) * 100);
//         bar.style.width = pct + "%";
//         lbl.textContent = `Uploading questions… ${done}/${toInsert.length}`;
//       }
//       alert(
//         `✅ Quiz "${quizData.name}" created with ${_parsedCsvQuestions.length} questions!`,
//       );
//     } else {
//       alert(
//         `✅ Quiz "${quizData.name}" created! Use the Edit button to add questions.`,
//       );
//     }
//     document.getElementById("addQuizForm").reset();
//     clearCsvUpload();
//     document.getElementById("addQuizFormContainer").style.display = "none";
//     await loadAllQuizzes();
//     await loadDashboardStats();
//   } catch (e) {
//     console.error("Create quiz error:", e);
//     alert("Error creating quiz: " + e.message);
//   } finally {
//     btn.disabled = false;
//     btn.textContent = "Create Quiz";
//   }
// }

// async function loadAllQuizzes() {
//   const el = document.getElementById("quizzesList");
//   if (!el) return;
//   el.innerHTML = '<div class="no-data">Loading…</div>';
//   try {
//     const { data: quizzes, error } = await supabaseClient
//       .from("quizzes")
//       .select("*")
//       .order("quiz_order", { ascending: true });
//     if (error) throw error;
//     if (!quizzes?.length) {
//       el.innerHTML =
//         '<div class="no-data">No quizzes yet. Create one above!</div>';
//       return;
//     }
//     const [{ data: allJRows }, { data: allBatches }] = await Promise.all([
//       supabaseClient.from("quiz_batches").select("quiz_id,batch_id"),
//       supabaseClient.from("batches").select("id,name"),
//     ]);
//     const batchNameMap = {};
//     (allBatches || []).forEach((b) => {
//       batchNameMap[b.id] = b.name;
//     });
//     const quizBatchesMap = {};
//     (allJRows || []).forEach((r) => {
//       if (!quizBatchesMap[r.quiz_id]) quizBatchesMap[r.quiz_id] = [];
//       quizBatchesMap[r.quiz_id].push(batchNameMap[r.batch_id] || r.batch_id);
//     });
//     let html = "";
//     for (const q of quizzes) {
//       const { count } = await supabaseClient
//         .from("questions")
//         .select("id", { count: "exact" })
//         .eq("quiz_id", q.id);
//       const pub = q.is_published;
//       const batchNames = (quizBatchesMap[q.id] || []).slice();
//       if (!batchNames.length && q.batch_id && batchNameMap[q.batch_id])
//         batchNames.push(batchNameMap[q.batch_id]);
//       const batchTag =
//         batchNames.length > 0
//           ? batchNames
//               .map(
//                 (n) =>
//                   `<span class="tag" style="background:#e0f2fe;color:#0369a1">🗂 ${n}</span>`,
//               )
//               .join("")
//           : '<span class="tag" style="background:#f3f4f6;color:#6b7280">🌐 All Students</span>';
//       html += `<div class="quiz-card">
//         <div class="quiz-card-top">
//           <div style="flex:1;min-width:0">
//             <div class="quiz-card-name">${q.quiz_order}. ${q.name}</div>
//             <div class="quiz-card-desc">${q.description || "No description"}</div>
//             <div class="quiz-tags">
//               <span class="tag tag-blue">${q.type || "No type"}</span>
//               <span class="tag tag-purple">${q.syllabus || "No syllabus"}</span>
//               <span class="tag tag-green">📚 ${count || 0} questions</span>
//               ${batchTag}
//               ${
//                 q.subjects && q.subjects.length
//                   ? q.subjects
//                       .map((s) => {
//                         const sc = {
//                           Biology: "#16a34a",
//                           Chemistry: "#0b63b7",
//                           Physics: "#7c3aed",
//                           English: "#d97706",
//                           "Logical Reasoning": "#dc2626",
//                         };
//                         const c = sc[s] || "#666";
//                         return `<span class="tag" style="background:${c}22;color:${c};border:1px solid ${c}44">${s}</span>`;
//                       })
//                       .join("")
//                   : ""
//               }
//             </div>
//           </div>
//           <span class="pill ${pub ? "pill-green" : "pill-orange"}">${pub ? "✅ Published" : "⏳ Draft"}</span>
//         </div>
//         <div style="display:flex;gap:8px;flex-wrap:wrap">
//           <button class="btn btn-sm" style="background:#0284c7;color:#fff" onclick="openQuizSummary(${q.id},'${q.name.replace(/'/g, "\\'")}')">📊 Summary</button>
//           <button class="btn btn-sm" style="background:#7b1fa2;color:#fff" onclick="openQuizDetails(${q.id})">Details</button>
//           <button class="btn btn-sm" style="background:#00897b;color:#fff" onclick="shareQuizLink(${q.id},'${q.name.replace(/'/g, "\\'")}')">Share</button>
//           <button class="btn btn-blue btn-sm" onclick="openEditQuizModal(${q.id})">✏️ Edit</button>
//           <button class="btn btn-sm" style="background:#5c6bc0;color:#fff" onclick="exportQuizAsWord(${q.id},'${q.name.replace(/'/g, "\\'")}')" title="Download all questions as Word document">📄 Export .docx</button>
//           ${
//             pub
//               ? `<button class="btn btn-orange btn-sm" onclick="unpublishQuiz(${q.id})">⬇️ Unpublish</button>`
//               : `<button class="btn btn-green btn-sm" onclick="publishQuiz(${q.id},'${q.name.replace(/'/g, "\\'")}')">📤 Publish</button>`
//           }
//           <button class="btn btn-red btn-sm" onclick="deleteQuiz(${q.id},'${q.name.replace(/'/g, "\\'")}')">🗑 Delete</button>
//         </div>
//       </div>`;
//     }
//     el.innerHTML = html;
//   } catch (e) {
//     el.innerHTML = `<div class="no-data" style="color:var(--red)">Error: ${e.message}</div>`;
//   }
// }

// async function loadQuizzesForDropdown() {
//   try {
//     const { data } = await supabaseClient
//       .from("quizzes")
//       .select("id,name")
//       .order("quiz_order", { ascending: true });
//     const sel = document.getElementById("quizForQuestions");
//     if (!sel) return;
//     sel.innerHTML = '<option value="">— Select a quiz —</option>';
//     data?.forEach((q) =>
//       sel.insertAdjacentHTML(
//         "beforeend",
//         `<option value="${q.id}">${q.name}</option>`,
//       ),
//     );
//   } catch (e) {
//     console.warn(e);
//   }
// }

// async function publishQuiz(id, name) {
//   if (
//     !confirm(`Publish "${name}"? Users not yet notified will receive an email.`)
//   )
//     return;
//   try {
//     const { error } = await supabaseClient
//       .from("quizzes")
//       .update({ is_published: true })
//       .eq("id", id);
//     if (error) throw error;
//     const { data: us } = await supabaseClient
//       .from("users")
//       .select("id,email,first_name");
//     if (!us?.length) {
//       alert("✅ Published! No users to notify.");
//       await loadAllQuizzes();
//       return;
//     }
//     const { data: already } = await supabaseClient
//       .from("quiz_notifications")
//       .select("user_id")
//       .eq("quiz_id", id);
//     const notifiedSet = new Set((already || []).map((r) => r.user_id));
//     const newUsers = us.filter((u) => !notifiedSet.has(u.id));
//     let sent = 0;
//     if (newUsers.length > 0) {
//       sent = await (window.sendEmailBulk
//         ? window.sendEmailBulk(
//             newUsers,
//             `New Quiz Available: ${name}`,
//             (u) => "",
//             "new_quiz",
//             (u) => ({ quizName: name }),
//           )
//         : 0);
//       const rows = newUsers.map((u) => ({
//         quiz_id: Number(id),
//         user_id: u.id,
//       }));
//       const { error: ne } = await supabaseClient
//         .from("quiz_notifications")
//         .upsert(rows, { onConflict: "quiz_id,user_id" });
//       if (ne) console.warn("quiz_notifications upsert:", ne.message);
//     }
//     const skip = us.length - newUsers.length;
//     alert(
//       `✅ Published!\n📧 Emails sent: ${sent}${skip > 0 ? ` (${skip} already notified)` : ""}`,
//     );
//     await loadAllQuizzes();
//   } catch (e) {
//     alert("Error: " + e.message);
//   }
// }

// async function unpublishQuiz(id) {
//   if (!confirm("Unpublish this quiz? Students will not see it.")) return;
//   try {
//     const { error } = await supabaseClient
//       .from("quizzes")
//       .update({ is_published: false })
//       .eq("id", id);
//     if (error) throw error;
//     await loadAllQuizzes();
//   } catch (e) {
//     alert("Error: " + e.message);
//   }
// }

// async function deleteQuiz(id, name) {
//   if (!confirm(`Delete "${name}" and all its questions?`)) return;
//   if (!confirm("This also deletes all student attempts. Continue?")) return;
//   try {
//     const { error } = await supabaseClient
//       .from("quizzes")
//       .delete()
//       .eq("id", id);
//     if (error) throw error;
//     alert("✅ Quiz deleted");
//     await loadAllQuizzes();
//   } catch (e) {
//     alert("Error: " + e.message);
//   }
// }

// async function loadQuestionsForQuiz() {
//   const quizId = document.getElementById("quizForQuestions").value;
//   const el = document.getElementById("questionsListForQuiz");
//   if (!quizId) {
//     el.innerHTML =
//       '<div class="no-data">Select a quiz to view its questions</div>';
//     return;
//   }
//   el.innerHTML = '<div class="no-data">Loading…</div>';
//   try {
//     const { data, error } = await supabaseClient
//       .from("questions")
//       .select("*")
//       .eq("quiz_id", quizId)
//       .order("id", { ascending: true });
//     if (error) throw error;
//     if (!data?.length) {
//       el.innerHTML =
//         '<div class="no-data">No questions for this quiz yet</div>';
//       return;
//     }
//     el.innerHTML = data
//       .map(
//         (q, i) => `
//       <div style="background:#f9f9f9;border:1px solid var(--border);border-left:3px solid var(--blue);padding:12px;border-radius:8px;margin-bottom:10px">
//         <strong style="font-size:13px">Q${i + 1}: ${q.question}</strong>
//         <div style="margin-top:8px;font-size:12px;color:var(--muted)">
//           <div>A) ${q.option_a}${q.correct_answer === "a" ? " ✅" : ""}</div>
//           <div>B) ${q.option_b}${q.correct_answer === "b" ? " ✅" : ""}</div>
//           <div>C) ${q.option_c}${q.correct_answer === "c" ? " ✅" : ""}</div>
//           <div>D) ${q.option_d}${q.correct_answer === "d" ? " ✅" : ""}</div>
//         </div>
//         ${q.explanation ? `<div style="font-size:11px;color:var(--green);margin-top:6px">💡 ${q.explanation}</div>` : ""}
//       </div>`,
//       )
//       .join("");
//   } catch (e) {
//     el.innerHTML = `<div class="no-data" style="color:var(--red)">Error: ${e.message}</div>`;
//   }
// }

// ── EDIT QUIZ MODAL ──────────────────────────────────────────────────────────
// function openEditQuizModal(id) {
//   currentEditingQuizId = id;
//   document.getElementById("editQuizModal").classList.add("open");
//   loadEditQuizForm(id);
//   loadQuizQuestions(id);
// }

// async function copyQuestionsFromQuiz(btn) {
//   const sourceId = document.getElementById("copyFromQuizSelect").value;
//   const msgEl = document.getElementById("copyQuizMsg");
//   msgEl.style.display = "none";
//   if (!sourceId) {
//     msgEl.style.display = "block";
//     msgEl.style.color = "#d97706";
//     msgEl.textContent = "⚠️ Select a source quiz first.";
//     return;
//   }
//   if (!currentEditingQuizId) return;
//   btn.disabled = true;
//   btn.textContent = "⏳ Copying…";
//   try {
//     const { data: srcQs, error } = await supabaseClient
//       .from("questions")
//       .select("*")
//       .eq("quiz_id", sourceId)
//       .order("id", { ascending: true });
//     if (error) throw error;
//     if (!srcQs?.length) {
//       msgEl.style.display = "block";
//       msgEl.style.color = "#d97706";
//       msgEl.textContent = "⚠️ That quiz has no questions to copy.";
//       return;
//     }
//     const toInsert = srcQs.map((q) => ({
//       question: q.question,
//       option_a: q.option_a,
//       option_b: q.option_b,
//       option_c: q.option_c,
//       option_d: q.option_d,
//       correct_answer: q.correct_answer,
//       explanation: q.explanation || null,
//       quiz_id: currentEditingQuizId,
//     }));
//     const CHUNK = 50;
//     for (let i = 0; i < toInsert.length; i += CHUNK) {
//       const { error: ie } = await supabaseClient
//         .from("questions")
//         .insert(toInsert.slice(i, i + CHUNK));
//       if (ie) throw ie;
//     }
//     msgEl.style.display = "block";
//     msgEl.style.color = "#16a34a";
//     msgEl.textContent = `✅ ${srcQs.length} questions copied successfully!`;
//     await loadQuizQuestions(currentEditingQuizId);
//     await loadDashboardStats();
//   } catch (e) {
//     msgEl.style.display = "block";
//     msgEl.style.color = "#c62828";
//     msgEl.textContent = "Error: " + e.message;
//   } finally {
//     btn.disabled = false;
//     btn.textContent = "📋 Copy All Questions";
//   }
// }

function closeEditQuizModal() {
  document.getElementById("editQuizModal").classList.remove("open");
  currentEditingQuizId = null;
}

// async function loadEditQuizForm(id) {
//   try {
//     const [{ data: q }, { data: jRows }] = await Promise.all([
//       supabaseClient.from("quizzes").select("*").eq("id", id).single(),
//       supabaseClient.from("quiz_batches").select("batch_id").eq("quiz_id", id),
//     ]);
//     if (!q) return;
//     document.getElementById("editQuizName").value = q.name || "";
//     document.getElementById("editQuizDescription").value = q.description || "";
//     document.getElementById("editQuizOrder").value = q.quiz_order || 1;
//     document.getElementById("editQuizType").value = q.type || "";
//     document.getElementById("editQuizSyllabus").value = q.syllabus || "";
//     const assigned = new Set((jRows || []).map((r) => String(r.batch_id)));
//     if (q.batch_id) assigned.add(String(q.batch_id));
//     await loadBatchesForQuizForm(Array.from(assigned));
//   } catch (e) {
//     console.error(e);
//   }
// }

// async function submitEditQuiz(event) {
//   event.preventDefault();
//   if (!currentEditingQuizId) return;
//   try {
//     const editChecked = Array.from(
//       document.querySelectorAll('input[name="editBatch"]:checked'),
//     ).map((cb) => cb.value);
//     const { error } = await supabaseClient
//       .from("quizzes")
//       .update({
//         name: document.getElementById("editQuizName").value,
//         description: document.getElementById("editQuizDescription").value,
//         quiz_order: parseInt(document.getElementById("editQuizOrder").value),
//         type: document.getElementById("editQuizType").value || null,
//         syllabus: document.getElementById("editQuizSyllabus").value || null,
//         batch_id: editChecked.length === 1 ? editChecked[0] : null,
//       })
//       .eq("id", currentEditingQuizId);
//     if (error) throw error;
//     await supabaseClient
//       .from("quiz_batches")
//       .delete()
//       .eq("quiz_id", currentEditingQuizId);
//     if (editChecked.length > 0) {
//       const jRows = editChecked.map((bId) => ({
//         quiz_id: currentEditingQuizId,
//         batch_id: bId,
//       }));
//       const { error: jErr } = await supabaseClient
//         .from("quiz_batches")
//         .insert(jRows);
//       if (jErr) console.warn("quiz_batches sync:", jErr.message);
//     }
//     alert("✅ Quiz updated!");
//     closeEditQuizModal();
//     await loadAllQuizzes();
//   } catch (e) {
//     alert("Error: " + e.message);
//   }
// }

// async function loadQuizQuestions(id) {
//   const el = document.getElementById("editQuizQuestionsList");
//   el.innerHTML = '<div class="no-data">Loading…</div>';
//   try {
//     const { data, error } = await supabaseClient
//       .from("questions")
//       .select("*")
//       .eq("quiz_id", id)
//       .order("id", { ascending: true });
//     if (error) throw error;
//     if (!data?.length) {
//       el.innerHTML =
//         '<div class="no-data">No questions yet. Add one above.</div>';
//       return;
//     }
//     el.innerHTML = data
//       .map(
//         (q, i) => `
//       <div style="background:#fff;border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
//         <div style="flex:1;min-width:0">
//           <div style="font-size:13px;font-weight:600;color:var(--text)">Q${i + 1}: ${q.question.substring(0, 80)}${q.question.length > 80 ? "…" : ""}
//             ${q.img ? `<span style="margin-left:6px;background:#dbeafe;color:#1d4ed8;font-size:10px;padding:2px 7px;border-radius:20px;font-weight:700;">🖼️ image</span>` : ""}
//           </div>
//           <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;font-size:11px;color:var(--muted);margin-top:6px">
//             <div>A: ${q.option_a.substring(0, 30)}</div><div>B: ${q.option_b.substring(0, 30)}</div>
//             <div>C: ${q.option_c.substring(0, 30)}</div><div>D: ${q.option_d.substring(0, 30)}</div>
//           </div>
//           <div style="margin-top:5px;font-size:12px;color:var(--green);font-weight:700">✓ Answer: ${q.correct_answer.toUpperCase()}</div>
//         </div>
//         <button class="btn btn-red btn-xs" onclick="deleteQuestionFromModal(${q.id})">Delete</button>
//       </div>`,
//       )
//       .join("");
//   } catch (e) {
//     el.innerHTML = `<div class="no-data" style="color:var(--red)">Error: ${e.message}</div>`;
//   }
// }

// async function uploadToImgbb(file) {
//   const ext = file.name.split(".").pop().toLowerCase();
//   const fileName = `questions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
//   const { error } = await supabaseClient.storage
//     .from("images")
//     .upload(fileName, file, { cacheControl: "3600", upsert: false });
//   if (error) throw new Error(error.message || "Supabase upload failed");
//   const { data: urlData } = supabaseClient.storage
//     .from("images")
//     .getPublicUrl(fileName);
//   return urlData.publicUrl;
// }

function previewQuestionImage(input) {
  const file = input.files[0];
  if (!file) return;
  const statusEl = document.getElementById("editImageStatus");
  const previewEl = document.getElementById("editImagePreview");
  const imgEl = document.getElementById("editImagePreviewImg");
  const clearBtn = document.getElementById("editImageClearBtn");
  statusEl.textContent = file.name + " (will upload on Add)";
  imgEl.src = URL.createObjectURL(file);
  previewEl.style.display = "block";
  clearBtn.style.display = "inline";
  document.getElementById("editQuestionImageUrl").value = "";
}

function clearQuestionImage() {
  document.getElementById("editQuestionImage").value = "";
  document.getElementById("editQuestionImageUrl").value = "";
  document.getElementById("editImageStatus").textContent = "";
  document.getElementById("editImagePreview").style.display = "none";
  document.getElementById("editImageClearBtn").style.display = "none";
}

// async function submitQuestionToQuiz(event) {
//   event.preventDefault();
//   if (!currentEditingQuizId) {
//     alert("No quiz selected");
//     return;
//   }
//   const btn = event.target.querySelector('button[type="submit"]');
//   const orig = btn.textContent;
//   try {
//     btn.disabled = true;
//     btn.textContent = "Saving…";
//     let imgUrl = null;
//     const fileInput = document.getElementById("editQuestionImage");
//     if (fileInput.files[0]) {
//       btn.textContent = "Uploading image…";
//       try {
//         imgUrl = await uploadToImgbb(fileInput.files[0]);
//         document.getElementById("editQuestionImageUrl").value = imgUrl;
//       } catch (uploadErr) {
//         if (
//           !confirm(
//             `Image upload failed: ${uploadErr.message}\n\nSave question without image?`,
//           )
//         ) {
//           btn.disabled = false;
//           btn.textContent = orig;
//           return;
//         }
//       }
//     }
//     const { error } = await supabaseClient.from("questions").insert([
//       {
//         quiz_id: currentEditingQuizId,
//         question: document.getElementById("editQuestionText").value.trim(),
//         option_a: document.getElementById("editOptionA").value.trim(),
//         option_b: document.getElementById("editOptionB").value.trim(),
//         option_c: document.getElementById("editOptionC").value.trim(),
//         option_d: document.getElementById("editOptionD").value.trim(),
//         correct_answer: document.getElementById("editCorrectAnswer").value,
//         explanation: document.getElementById("editExplanation").value || null,
//         img: imgUrl,
//       },
//     ]);
//     if (error) throw error;
//     event.target.reset();
//     clearQuestionImage();
//     await loadQuizQuestions(currentEditingQuizId);
//     await loadDashboardStats();
//   } catch (e) {
//     alert("Error adding question: " + e.message);
//   } finally {
//     btn.disabled = false;
//     btn.textContent = orig;
//   }
// }

// async function deleteQuestionFromModal(qid) {
//   if (!confirm("Delete this question?")) return;
//   try {
//     const { error } = await supabaseClient
//       .from("questions")
//       .delete()
//       .eq("id", qid);
//     if (error) throw error;
//     await loadQuizQuestions(currentEditingQuizId);
//     await loadDashboardStats();
//   } catch (e) {
//     alert("Error: " + e.message);
//   }
// }

// async function deleteQuestion(qid) {
//   await deleteQuestionFromModal(qid);
// }

// ── QUIZ SUMMARY MODAL ───────────────────────────────────────────────────────
const SUBJ_META_ADMIN = {
  Biology: { icon: "🧬", color: "#16a34a", bg: "#dcfce7", border: "#86efac" },
  Chemistry: { icon: "⚗️", color: "#0b63b7", bg: "#dbeafe", border: "#93c5fd" },
  Physics: { icon: "⚡", color: "#7c3aed", bg: "#f3e8ff", border: "#c4b5fd" },
  English: { icon: "📖", color: "#d97706", bg: "#fef3c7", border: "#fde68a" },
  "Logical Reasoning": {
    icon: "🧠",
    color: "#dc2626",
    bg: "#fee2e2",
    border: "#fca5a5",
  },
};
let _summaryQuizId = null;
let _summaryQuizName = "";

// async function openQuizSummary(quizId, quizName) {
//   _summaryQuizId = quizId;
//   _summaryQuizName = quizName;
//   document.getElementById("qsSummaryTitle").textContent = quizName;
//   document.getElementById("qsSummarySubtitle").textContent = "Loading…";
//   document.getElementById("qsStatQuestions").textContent = "—";
//   document.getElementById("qsStatAttempts").textContent = "—";
//   document.getElementById("qsStatAvg").textContent = "—";
//   document.getElementById("qsStatTop").textContent = "—";
//   document.getElementById("qsSummaryBody").innerHTML =
//     '<div class="qs-loading">⏳ Loading questions…</div>';
//   document.getElementById("qsExportBtn").onclick = () =>
//     exportQuizAsWord(quizId, quizName);
//   document.getElementById("quizSummaryModal").classList.add("open");
//   try {
//     const [{ data: questions, error: qErr }, { data: attempts }] =
//       await Promise.all([
//         supabaseClient
//           .from("questions")
//           .select("*")
//           .eq("quiz_id", quizId)
//           .order("id", { ascending: true }),
//         supabaseClient
//           .from("quiz_attempts")
//           .select("score, total, answers")
//           .eq("quiz_id", quizId),
//       ]);
//     if (qErr) throw qErr;
//     const qs = questions || [];
//     const atts = attempts || [];
//     const total = qs.length;
//     const nAtts = atts.length;
//     document.getElementById("qsStatQuestions").textContent = total;
//     document.getElementById("qsStatAttempts").textContent = nAtts;
//     if (nAtts > 0) {
//       const pcts = atts.map((a) =>
//         a.total > 0 ? Math.round((a.score / a.total) * 100) : 0,
//       );
//       const avgPct = Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length);
//       const topPct = Math.max(...pcts);
//       document.getElementById("qsStatAvg").textContent = avgPct + "%";
//       document.getElementById("qsStatTop").textContent = topPct + "%";
//     } else {
//       document.getElementById("qsStatAvg").textContent = "—";
//       document.getElementById("qsStatTop").textContent = "—";
//     }
//     const qFreq = {};
//     qs.forEach((_, i) => {
//       qFreq[i] = { A: 0, B: 0, C: 0, D: 0 };
//     });
//     atts.forEach((att) => {
//       if (!att.answers || typeof att.answers !== "object") return;
//       Object.entries(att.answers).forEach(([k, v]) => {
//         const idx = parseInt(k);
//         if (!isNaN(idx) && qFreq[idx] && v) {
//           const letter = String(v).toUpperCase();
//           if (qFreq[idx][letter] !== undefined) qFreq[idx][letter]++;
//         }
//       });
//     });
//     const subjects = [...new Set(qs.map((q) => q.subject).filter(Boolean))];
//     document.getElementById("qsSummarySubtitle").textContent = subjects.length
//       ? subjects.join(" · ")
//       : qs[0]?.subject || "All Questions";
//     if (!total) {
//       document.getElementById("qsSummaryBody").innerHTML =
//         '<div class="qs-no-attempts">No questions found for this quiz.</div>';
//       return;
//     }
//     const grouped = {};
//     qs.forEach((q, i) => {
//       const subj = q.subject || "__none__";
//       if (!grouped[subj]) grouped[subj] = [];
//       grouped[subj].push({ q, idx: i });
//     });
//     let bodyHTML = "";
//     const subjectKeys = Object.keys(grouped);
//     const useSubjectHeaders =
//       subjectKeys.length > 1 ||
//       (subjectKeys[0] && subjectKeys[0] !== "__none__");
//     let globalIdx = 1;
//     for (const subjKey of subjectKeys) {
//       const meta = SUBJ_META_ADMIN[subjKey] || {
//         icon: "📚",
//         color: "#6b7280",
//         bg: "#f3f4f6",
//         border: "#d1d5db",
//       };
//       const subjLabel = subjKey === "__none__" ? "General" : subjKey;
//       if (useSubjectHeaders) {
//         bodyHTML += `
//           <div class="qs-subject-block">
//             <div class="qs-subject-title" style="background:${meta.bg};color:${meta.color};border-color:${meta.border}">
//               ${meta.icon} ${subjLabel}
//               <span style="margin-left:auto;font-size:11px;opacity:.75">${grouped[subjKey].length} questions</span>
//             </div>
//             <div class="qs-question-list" style="border-color:${meta.border}">`;
//       } else {
//         bodyHTML += `<div class="qs-subject-block"><div class="qs-question-list" style="border:1.5px solid var(--border);border-radius:8px;">`;
//       }
//       for (const { q, idx } of grouped[subjKey]) {
//         const freq = qFreq[idx] || { A: 0, B: 0, C: 0, D: 0 };
//         const correct = String(q.correct_answer || "").toUpperCase();
//         const optData = [
//           { letter: "A", text: q.option_a },
//           { letter: "B", text: q.option_b },
//           { letter: "C", text: q.option_c },
//           { letter: "D", text: q.option_d },
//         ].filter((o) => o.text);
//         let rateHTML = "";
//         if (nAtts > 0) {
//           const correctCount = freq[correct] || 0;
//           const correctRate = Math.round((correctCount / nAtts) * 100);
//           const rateClass =
//             correctRate >= 70
//               ? "qs-rate-high"
//               : correctRate >= 40
//                 ? "qs-rate-mid"
//                 : "qs-rate-low";
//           rateHTML = `<span class="qs-correct-rate ${rateClass}">✓ ${correctRate}% got it right (${correctCount}/${nAtts})</span>`;
//         }
//         let barsHTML = "";
//         if (nAtts > 0) {
//           barsHTML = '<div style="margin-top:8px;">';
//           for (const opt of optData) {
//             const cnt = freq[opt.letter] || 0;
//             const pct = Math.round((cnt / nAtts) * 100);
//             const isRight = opt.letter === correct;
//             barsHTML += `
//               <div class="qs-bar-row ${isRight ? "correct" : "wrong"}">
//                 <span class="qs-bar-label">${opt.letter}</span>
//                 <div class="qs-bar-track"><div class="qs-bar-fill" style="width:${pct}%"></div></div>
//                 <span class="qs-bar-count">${cnt} (${pct}%)</span>
//               </div>`;
//           }
//           barsHTML += "</div>";
//         }
//         const optsHTML = optData
//           .map(
//             (o) => `
//           <div class="qs-opt ${o.letter === correct ? "correct" : ""}">
//             <span class="qs-opt-letter">${o.letter})</span>
//             <span>${o.text}</span>
//             ${o.letter === correct ? '<span style="margin-left:auto">✓</span>' : ""}
//           </div>`,
//           )
//           .join("");
//         const imgHTML = q.img
//           ? `<img src="${q.img}" class="qs-img" alt="Question image" onerror="this.style.display='none'">`
//           : "";
//         const explHTML = q.explanation
//           ? `<div class="qs-explanation">💡 ${q.explanation}</div>`
//           : "";
//         const numBg = useSubjectHeaders ? meta.bg : "#f0f6ff";
//         const numClr = useSubjectHeaders ? meta.color : "var(--blue)";
//         bodyHTML += `
//           <div class="qs-q-row">
//             <div class="qs-q-num" style="background:${numBg};color:${numClr}">${globalIdx}</div>
//             <div class="qs-q-body">
//               ${imgHTML}
//               <div class="qs-q-text">${q.question || "(no question text)"}</div>
//               <div class="qs-stats-inline">${rateHTML}</div>
//               <div class="qs-options">${optsHTML}</div>
//               ${barsHTML}
//               ${explHTML}
//             </div>
//           </div>`;
//         globalIdx++;
//       }
//       bodyHTML += `</div></div>`;
//     }
//     if (!nAtts) {
//       bodyHTML =
//         '<div class="qs-no-attempts">📭 No attempts yet — response bars will appear once students take this quiz.</div>' +
//         bodyHTML;
//     }
//     document.getElementById("qsSummaryBody").innerHTML = bodyHTML;
//   } catch (e) {
//     console.error("Quiz summary error:", e);
//     document.getElementById("qsSummaryBody").innerHTML =
//       `<div class="qs-no-attempts">❌ Error loading: ${e.message}</div>`;
//   }
// }

function closeQuizSummary() {
  document.getElementById("quizSummaryModal").classList.remove("open");
}

function handleSummaryOverlayClick(e) {
  if (e.target === document.getElementById("quizSummaryModal"))
    closeQuizSummary();
}

// ── QUIZ DETAILS MODAL ───────────────────────────────────────────────────────
// async function openQuizDetails(id) {
//   try {
//     const [{ data: q }, { count }] = await Promise.all([
//       supabaseClient.from("quizzes").select("*").eq("id", id).single(),
//       supabaseClient
//         .from("questions")
//         .select("id", { count: "exact" })
//         .eq("quiz_id", id),
//     ]);
//     let batchName = "All Batches";
//     if (q.batch_id) {
//       const { data: b } = await supabaseClient
//         .from("batches")
//         .select("name")
//         .eq("id", q.batch_id)
//         .single();
//       if (b) batchName = b.name;
//     }
//     const link = `${window.location.origin}/quiz-details.html?quiz_id=${id}`;
//     currentQuizDetails = { ...q, questionCount: count, shareLink: link };
//     document.getElementById("quizDetailsContent").innerHTML = `
//       <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin-bottom:14px">
//         <div style="font-size:18px;font-weight:800;color:var(--text);margin-bottom:12px">${q.name}</div>
//         <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;font-size:13px">
//           <div><div class="stat-label">Type</div><strong>${q.type || "N/A"}</strong></div>
//           <div><div class="stat-label">Syllabus</div><strong>${q.syllabus || "N/A"}</strong></div>
//           <div><div class="stat-label">Questions</div><strong style="color:var(--green)">${count || 0}</strong></div>
//           <div><div class="stat-label">Batch</div><strong>${batchName}</strong></div>
//           <div><div class="stat-label">Status</div><span class="pill ${q.is_published ? "pill-green" : "pill-orange"}">${q.is_published ? "Published" : "Draft"}</span></div>
//           <div><div class="stat-label">Order</div><strong>#${q.quiz_order}</strong></div>
//         </div>
//       </div>
//       <div style="background:#fff3e0;border-left:4px solid var(--orange);padding:12px;border-radius:6px">
//         <div style="font-size:12px;font-weight:700;color:#e65100;margin-bottom:6px">Share Link</div>
//         <div style="font-family:monospace;font-size:11px;word-break:break-all;color:#333;background:#fff;padding:8px;border-radius:4px">${link}</div>
//       </div>`;
//     document.getElementById("quizDetailsModal").classList.add("open");
//   } catch (e) {
//     alert("Error: " + e.message);
//   }
// }
function closeQuizDetailsModal() {
  document.getElementById("quizDetailsModal").classList.remove("open");
  currentQuizDetails = null;
}
function copyQuizShareLink() {
  if (currentQuizDetails?.shareLink) {
    navigator.clipboard
      .writeText(currentQuizDetails.shareLink)
      .then(() => alert("✅ Link copied!"));
  }
}
async function shareQuizLink(id, name) {
  const link = `${window.location.origin}/quiz-details.html?quiz_id=${id}`;
  document.getElementById("quizShareLink").value = link;
  document.getElementById("shareModal").classList.add("open");
}
function closeShareModal() {
  document.getElementById("shareModal").classList.remove("open");
}
function copyShareLink() {
  const inp = document.getElementById("quizShareLink");
  inp.select();
  document.execCommand("copy");
  alert("✅ Copied!");
}

// ── ATTEMPTS & RESULTS ───────────────────────────────────────────────────────
// async function loadAllAttempts() {
//   try {
//     const { data: attempts, error } = await supabaseClient
//       .from("quiz_attempts")
//       .select("*")
//       .order("created_at", { ascending: false });
//     if (error) throw error;
//     const [{ data: us }, { data: qs }] = await Promise.all([
//       supabaseClient.from("users").select("id,first_name,last_name,district"),
//       supabaseClient
//         .from("quizzes")
//         .select("id,name")
//         .order("quiz_order", { ascending: true }),
//     ]);
//     const uMap = {};
//     us?.forEach(
//       (u) =>
//         (uMap[u.id] = {
//           name:
//             ((u.first_name || "") + " " + (u.last_name || "")).trim() || "N/A",
//           district: u.district || "N/A",
//           email: u.email || "N/A",
//         }),
//     );
//     const qMap = {};
//     qs?.forEach((q) => (qMap[q.id] = q.name));
//     window._adminUserMap = uMap;
//     _allAttemptsRaw = attempts || [];
//     _quizNamesMap = qMap;
//     populateQuizFilter(qMap);
//     renderAttemptsTable(attempts || [], qMap);
//     await loadPublishQuizPanel();
//   } catch (e) {
//     console.error("Attempts error:", e);
//   }
// }

function populateQuizFilter(qMap) {
  const sel = document.getElementById("filterByQuiz");
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = '<option value="">All Quizzes</option>';
  Object.entries(qMap).forEach(([id, name]) =>
    sel.insertAdjacentHTML(
      "beforeend",
      `<option value="${id}">${name}</option>`,
    ),
  );
  if (cur) sel.value = cur;
}

function filterAttemptsTable() {
  const qf = document.getElementById("filterByQuiz")?.value || "";
  const sf = document.getElementById("filterByStatus")?.value || "";
  let data = _allAttemptsRaw;
  if (qf) data = data.filter((a) => String(a.quiz_id) === String(qf));
  if (sf === "published") data = data.filter((a) => a.is_published);
  if (sf === "unpublished") data = data.filter((a) => !a.is_published);
  renderAttemptsTable(data, _quizNamesMap);
}

function renderAttemptsTable(data, qMap) {
  const el = document.getElementById("attemptsTable");
  if (!data?.length) {
    el.innerHTML =
      '<div class="no-data">No attempts match the selected filters.</div>';
    return;
  }
  const uMap = window._adminUserMap || {};
  el.innerHTML = `<table class="tbl">
    <thead><tr>
      <th>Name</th><th>Quiz</th><th>District</th>
      <th>Score</th><th>%</th><th>Status</th><th>Date</th>
    </tr></thead>
    <tbody>
    ${data
      .map((a) => {
        const u = uMap[a.user_id] || {};
        const pct = Math.round((a.score / a.total) * 100);
        const col = pct >= 70 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#ef4444";
        const pub = a.is_published || false;
        return `<tr>
        <td><strong>${u.name || "Unknown"}</strong></td>
        <td style="color:var(--blue);font-weight:600">${qMap[a.quiz_id] || "Unknown"}</td>
        <td>${u.district || "N/A"}</td>
        <td>${a.score}/${a.total}</td>
        <td style="color:${col};font-weight:700">${pct}%</td>
        <td><button class="pub-btn ${pub ? "pub-yes" : "pub-no"}" onclick="togglePublishStatus('${a.id}',${pub},'${a.quiz_id}')">${pub ? "✅ Published" : "⬜ Publish"}</button></td>
        <td style="font-size:12px;color:var(--muted)">${new Date(a.created_at).toLocaleString()}</td>
      </tr>`;
      })
      .join("")}
    </tbody></table>`;
}

// async function togglePublishStatus(attemptId, current, quizId) {
//   try {
//     const newStatus = !current;
//     const { error } = await supabaseClient
//       .from("quiz_attempts")
//       .update({ is_published: newStatus })
//       .eq("id", attemptId);
//     if (error) throw error;
//     if (newStatus) {
//       try {
//         const { data: attempt } = await supabaseClient
//           .from("quiz_attempts")
//           .select("user_id,score,total")
//           .eq("id", attemptId)
//           .single();
//         const { data: userData } = await supabaseClient
//           .from("users")
//           .select("email,first_name,last_name")
//           .eq("id", attempt.user_id)
//           .single();
//         const { data: quiz } = await supabaseClient
//           .from("quizzes")
//           .select("name")
//           .eq("id", quizId)
//           .single();
//         if (userData?.email && attempt && quiz) {
//           const pct = Math.round((attempt.score / attempt.total) * 100);
//           const name =
//             (
//               (userData.first_name || "") +
//               " " +
//               (userData.last_name || "")
//             ).trim() || "Student";
//           if (window.sendEmail) {
//             await window.sendEmail(
//               userData.email,
//               name,
//               `Your result for "${quiz.name}" is now available`,
//               `Hi ${name},\n\nYour result for the quiz "${quiz.name}" has been published on MedMinds!\n\nYour Score: ${attempt.score}/${attempt.total} (${pct}%)\n\nLog in to view your detailed result and review your answers.\n\nhttps://medminds-mdcat.netlify.app/result.html`,
//             );
//           }
//           await supabaseClient
//             .from("quiz_notifications")
//             .upsert([{ quiz_id: Number(quizId), user_id: attempt.user_id }], {
//               onConflict: "quiz_id,user_id",
//             });
//         }
//       } catch (emailErr) {
//         console.warn("Email/notification (non-critical):", emailErr.message);
//       }
//     }
//     await loadAllAttempts();
//   } catch (e) {
//     alert("Error: " + e.message);
//   }
// }

// async function loadPublishQuizPanel() {
//   const panel = document.getElementById("publishQuizCards");
//   if (!panel) return;
//   try {
//     const [{ data: quizzes }, { data: attempts }] = await Promise.all([
//       supabaseClient
//         .from("quizzes")
//         .select("id,name,quiz_order")
//         .order("quiz_order", { ascending: true }),
//       supabaseClient.from("quiz_attempts").select("quiz_id,is_published"),
//     ]);
//     if (!quizzes?.length) {
//       panel.innerHTML =
//         '<p style="color:var(--muted);font-size:13px">No quizzes.</p>';
//       return;
//     }
//     const stats = {};
//     (attempts || []).forEach((a) => {
//       if (!stats[a.quiz_id]) stats[a.quiz_id] = { total: 0, pub: 0 };
//       stats[a.quiz_id].total++;
//       if (a.is_published) stats[a.quiz_id].pub++;
//     });
//     panel.innerHTML = quizzes
//       .map((q) => {
//         const s = stats[q.id] || { total: 0, pub: 0 };
//         const pending = s.total - s.pub;
//         const allDone = s.total > 0 && pending === 0;
//         return `<div class="pub-card" style="background:${allDone ? "#f0fdf4" : "#fff"};border-color:${allDone ? "#86efac" : "#e0e0e0"}">
//         <div style="font-weight:700;font-size:13px;margin-bottom:4px">${q.name}</div>
//         <div style="font-size:12px;color:var(--muted);margin-bottom:10px">${s.pub}/${s.total} published · <span style="color:${allDone ? "#16a34a" : "#f59e0b"};font-weight:700">${allDone ? "✅ All done" : `${pending} pending`}</span></div>
//         <div style="display:flex;gap:6px">
//           <button onclick="publishAllForQuiz('${q.id}','${q.name.replace(/'/g, "\\'")}','${JSON.stringify({}).replace(/'/g, "\\'")}', event)" ${!s.total || allDone ? "disabled" : ""} class="btn btn-blue btn-xs" style="flex:1">📤 Publish All</button>
//           <button onclick="unpublishAllForQuiz('${q.id}','${q.name.replace(/'/g, "\\'")}', event)" ${!s.pub ? "disabled" : ""} class="btn btn-xs" style="flex:1;background:white;color:var(--orange);border:1px solid var(--orange)">↩️ Unpublish</button>
//         </div>
//       </div>`;
//       })
//       .join("");
//   } catch (e) {
//     panel.innerHTML = `<p style="color:var(--red);font-size:13px">Error: ${e.message}</p>`;
//   }
// }

// async function publishAllForQuiz(quizId, quizName, _, ev) {
//   if (
//     !confirm(
//       `Publish ALL results for "${quizName}"?\n\nStudents not yet notified will receive an email.`,
//     )
//   )
//     return;
//   const btn = ev?.target || event.target;
//   btn.disabled = true;
//   btn.textContent = "⏳…";
//   try {
//     const { error } = await supabaseClient
//       .from("quiz_attempts")
//       .update({ is_published: true })
//       .eq("quiz_id", quizId)
//       .eq("is_published", false);
//     if (error) throw error;
//     const { data: already } = await supabaseClient
//       .from("quiz_notifications")
//       .select("user_id")
//       .eq("quiz_id", quizId);
//     const notifiedSet = new Set((already || []).map((r) => r.user_id));
//     const { data: allAttempts } = await supabaseClient
//       .from("quiz_attempts")
//       .select("user_id,score,total")
//       .eq("quiz_id", quizId);
//     let sent = 0;
//     if (allAttempts?.length) {
//       const userIds = [...new Set(allAttempts.map((a) => a.user_id))];
//       const { data: usersData } = await supabaseClient
//         .from("users")
//         .select("id,email,first_name,last_name")
//         .in("id", userIds);
//       const uMap = {};
//       (usersData || []).forEach((u) => {
//         uMap[u.id] = u;
//       });
//       const ranked = [...allAttempts].sort(
//         (a, b) => b.score / b.total - a.score / a.total,
//       );
//       const emailList = ranked
//         .map((attempt, i) => {
//           const u = uMap[attempt.user_id];
//           if (!u?.email || notifiedSet.has(u.id)) return null;
//           const pct = Math.round((attempt.score / attempt.total) * 100);
//           const name =
//             ((u.first_name || "") + " " + (u.last_name || "")).trim() ||
//             "Student";
//           return {
//             email: u.email,
//             first_name: name,
//             score: attempt.score,
//             total: attempt.total,
//             pct,
//             rank: i + 1,
//           };
//         })
//         .filter(Boolean);
//       if (emailList.length > 0 && window.sendEmailBulk) {
//         sent = await window.sendEmailBulk(
//           emailList,
//           `Your result for "${quizName}" is now available`,
//           (u) => "",
//           "result",
//           (u) => ({
//             quizName,
//             score: u.score,
//             total: u.total,
//             pct: u.pct,
//             rank: u.rank,
//           }),
//         );
//         const rows = userIds.map((uid) => ({
//           quiz_id: Number(quizId),
//           user_id: uid,
//         }));
//         const { error: ne } = await supabaseClient
//           .from("quiz_notifications")
//           .upsert(rows, { onConflict: "quiz_id,user_id" });
//         if (ne) console.warn("quiz_notifications upsert:", ne.message);
//       }
//     }
//     const skip = notifiedSet.size;
//     alert(
//       `✅ All results for "${quizName}" published!\n📧 Emails sent: ${sent}${skip > 0 ? ` (${skip} already notified)` : ""}`,
//     );
//     await loadAllAttempts();
//   } catch (e) {
//     alert("Error: " + e.message);
//     btn.disabled = false;
//     btn.textContent = "📤 Publish All";
//   }
// }

// async function unpublishAllForQuiz(quizId, quizName, ev) {
//   if (!confirm(`Unpublish ALL results for "${quizName}"?`)) return;
//   const btn = ev?.target || event.target;
//   btn.disabled = true;
//   btn.textContent = "⏳…";
//   try {
//     const { error } = await supabaseClient
//       .from("quiz_attempts")
//       .update({ is_published: false })
//       .eq("quiz_id", quizId)
//       .eq("is_published", true);
//     if (error) throw error;
//     alert(`↩️ All results unpublished.`);
//     await loadAllAttempts();
//   } catch (e) {
//     alert("Error: " + e.message);
//     btn.disabled = false;
//     btn.textContent = "↩️ Unpublish";
//   }
// }

// ── LEADERBOARD ──────────────────────────────────────────────────────────────
// async function loadLeaderboard() {
//   const el = document.getElementById("leaderboardContent");
//   el.innerHTML = '<div class="no-data">Loading…</div>';
//   try {
//     const batchFilter = document.getElementById(
//       "leaderboardBatchFilter",
//     )?.value;
//     const [{ data: attempts }, { data: users }, { data: batches }] =
//       await Promise.all([
//         supabaseClient.from("quiz_attempts").select("user_id,score,total"),
//         supabaseClient.from("users").select("*"),
//         supabaseClient.from("batches").select("id,name"),
//       ]);
//     const batchMap = {};
//     batches?.forEach((b) => (batchMap[b.id] = b.name));
//     const sel = document.getElementById("leaderboardBatchFilter");
//     if (sel && batches?.length) {
//       batches.forEach((b) => {
//         if (!sel.querySelector(`option[value="${b.id}"]`))
//           sel.insertAdjacentHTML(
//             "beforeend",
//             `<option value="${b.id}">${b.name}</option>`,
//           );
//       });
//     }
//     const scores = {};
//     attempts?.forEach((a) => {
//       const u = users?.find((u) => u.id === a.user_id);
//       if (!u) return;
//       if (!scores[u.id])
//         scores[u.id] = {
//           name:
//             ((u.first_name || "") + " " + (u.last_name || "")).trim() ||
//             "Student",
//           email: u.email,
//           batch_id: u.batch_id,
//           vals: [],
//         };
//       scores[u.id].vals.push(Math.round((a.score / a.total) * 100));
//     });
//     let rows = Object.values(scores)
//       .map((u) => ({
//         ...u,
//         avg: u.vals.length
//           ? Math.round(u.vals.reduce((a, b) => a + b) / u.vals.length)
//           : 0,
//         count: u.vals.length,
//       }))
//       .sort((a, b) => b.avg - a.avg);
//     if (batchFilter) rows = rows.filter((u) => u.batch_id === batchFilter);
//     if (!rows.length) {
//       el.innerHTML = '<div class="no-data">No data</div>';
//       return;
//     }
//     el.innerHTML = `<table class="tbl">
//       <thead><tr><th>Rank</th><th>Name</th><th>Batch</th><th>Avg Score</th><th>Attempts</th><th>Email</th></tr></thead>
//       <tbody>
//       ${rows
//         .map(
//           (u, i) => `<tr>
//         <td style="font-weight:800">${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : ""} #${i + 1}</td>
//         <td><strong>${u.name}</strong></td>
//         <td>${batchMap[u.batch_id] || "—"}</td>
//         <td style="color:${u.avg >= 70 ? "#16a34a" : "#ef4444"};font-weight:700">${u.avg}%</td>
//         <td>${u.count}</td>
//         <td style="font-size:12px;color:var(--muted)">${u.email}</td>
//       </tr>`,
//         )
//         .join("")}
//       </tbody></table>`;
//   } catch (e) {
//     el.innerHTML = `<div class="no-data" style="color:var(--red)">Error: ${e.message}</div>`;
//   }
// }

// ── STATISTICS ───────────────────────────────────────────────────────────────
// async function loadStatistics() {
//   try {
//     const [{ data: us }, { data: qs }, { data: qq }, { data: at }] =
//       await Promise.all([
//         supabaseClient.from("users").select("*"),
//         supabaseClient.from("questions").select("id"),
//         supabaseClient.from("quizzes").select("id"),
//         supabaseClient.from("quiz_attempts").select("score,total,created_at"),
//       ]);
//     document.getElementById("statTotalUsers").textContent = us?.length || 0;
//     document.getElementById("statTotalQuestions").textContent = qs?.length || 0;
//     document.getElementById("statActiveQuizzes").textContent = qq?.length || 0;
//     document.getElementById("statTotalAttempts").textContent = at?.length || 0;
//     const week = Date.now() - 7 * 24 * 3600 * 1000;
//     document.getElementById("statActiveUsers").textContent =
//       us?.filter((u) => new Date(u.created_at) > week).length || 0;
//     if (at?.length) {
//       const avg = Math.round(
//         at.reduce((s, a) => s + (a.score / a.total) * 100, 0) / at.length,
//       );
//       document.getElementById("statAvgScore").textContent = avg + "%";
//     }
//     if (qq?.length)
//       document.getElementById("statQuestionsPerQuiz").textContent = Math.round(
//         (qs?.length || 0) / qq.length,
//       );
//     if (us?.length && qq?.length) {
//       const rate = Math.round(
//         ((at?.length || 0) / (us.length * (qq?.length || 1))) * 100,
//       );
//       document.getElementById("statCompletionRate").textContent = rate + "%";
//     }
//   } catch (e) {
//     console.error(e);
//   }
// }

// ── BATCHES ──────────────────────────────────────────────────────────────────
function toggleAddBatchForm() {
  const f = document.getElementById("addBatchForm");
  f.style.display = f.style.display === "none" ? "block" : "none";
  if (f.style.display === "block") document.getElementById("batchName").focus();
}

// async function submitNewBatch(event) {
//   event.preventDefault();
//   try {
//     const { error } = await supabaseClient.from("batches").insert([
//       {
//         name: document.getElementById("batchName").value,
//         description: document.getElementById("batchDescription").value,
//         academic_year:
//           document.getElementById("batchAcademicYear").value || null,
//         start_date: document.getElementById("batchStartDate").value || null,
//         end_date: document.getElementById("batchEndDate").value || null,
//         is_open: true,
//       },
//     ]);
//     if (error) throw error;
//     alert("✅ Batch created!");
//     document.getElementById("addBatchForm").style.display = "none";
//     event.target.reset();
//     await loadAllBatches();
//   } catch (e) {
//     alert("Error: " + e.message);
//   }
// }

// async function loadAllBatches() {
//   const el = document.getElementById("batchesList");
//   el.innerHTML = '<div class="no-data">Loading…</div>';
//   try {
//     const { data, error } = await supabaseClient
//       .from("batches")
//       .select("*")
//       .order("created_at", { ascending: false });
//     if (error) throw error;
//     if (!data?.length) {
//       el.innerHTML = '<div class="no-data">No batches yet</div>';
//       return;
//     }
//     const withCounts = await Promise.all(
//       data.map(async (b) => {
//         const { count } = await supabaseClient
//           .from("users")
//           .select("id", { count: "exact", head: true })
//           .eq("batch_id", b.id);
//         return { ...b, student_count: count || 0 };
//       }),
//     );
//     el.innerHTML = `<div class="batch-grid">${withCounts
//       .map((b) => {
//         const sc = b.is_open ? "#16a34a" : "#dc2626";
//         const st = b.is_open ? "✅ Open" : "🔒 Closed";
//         return `<div class="batch-card">
//         <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;gap:8px">
//           <div>
//             <div style="font-size:16px;font-weight:700">${b.name}</div>
//             <span class="pill" style="background:${sc}18;color:${sc};font-size:11px;margin-top:4px;display:inline-block">${st}${b.academic_year ? " · " + b.academic_year : ""}</span>
//           </div>
//           <div style="display:flex;gap:6px;flex-shrink:0">
//             <button class="btn btn-xs" style="background:${b.is_open ? "var(--orange)" : "var(--green)"};color:#fff" onclick="toggleBatchOpen('${b.id}',${b.is_open},'${b.name.replace(/'/g, "\\'")}')">
//               ${b.is_open ? "🔒" : "✅"}
//             </button>
//             <button class="btn btn-red btn-xs" onclick="deleteBatch('${b.id}','${b.name.replace(/'/g, "\\'")}')">🗑</button>
//           </div>
//         </div>
//         <p style="font-size:13px;color:var(--muted);margin-bottom:12px">${b.description || "No description"}</p>
//         <div style="background:#f9f9f9;padding:10px;border-radius:8px;margin-bottom:12px">
//           <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px">
//             <span>Students</span><span style="font-weight:700;color:var(--blue)">${b.student_count}</span>
//           </div>
//           <div style="height:5px;background:#e0e0e0;border-radius:3px;overflow:hidden">
//             <div style="height:100%;width:${Math.min(b.student_count * 4, 100)}%;background:linear-gradient(90deg,var(--blue),var(--blue-mid))"></div>
//           </div>
//         </div>
//         <button class="btn btn-gray btn-sm" onclick="expandBatchDetails('${b.id}')">👥 View Students</button>
//         <div id="bdet-${b.id}" style="display:none;margin-top:12px;border-top:1px solid var(--border);padding-top:10px">
//           <div id="bstu-${b.id}" style="max-height:250px;overflow-y:auto"><div class="no-data">Loading…</div></div>
//         </div>
//       </div>`;
//       })
//       .join("")}</div>`;
//   } catch (e) {
//     el.innerHTML = `<div class="no-data" style="color:var(--red)">Error: ${e.message}</div>`;
//   }
// }

// async function expandBatchDetails(id) {
//   const wrap = document.getElementById(`bdet-${id}`);
//   if (wrap.style.display === "block") {
//     wrap.style.display = "none";
//     return;
//   }
//   wrap.style.display = "block";
//   const el = document.getElementById(`bstu-${id}`);
//   try {
//     const { data, error } = await supabaseClient
//       .from("users")
//       .select("*")
//       .eq("batch_id", id);
//     if (error) throw error;
//     if (!data?.length) {
//       el.innerHTML = '<div class="no-data">No students enrolled</div>';
//       return;
//     }
//     el.innerHTML = data
//       .map(
//         (u) => `
//       <div style="background:#f9f9f9;padding:8px 10px;border-radius:6px;border-left:3px solid var(--blue);font-size:12px;margin-bottom:6px">
//         <strong>${((u.first_name || "") + " " + (u.last_name || "")).trim() || "N/A"}</strong>
//         <div style="color:var(--muted)">${u.email}</div>
//         <div style="color:#9ca3af;font-size:11px">${u.district || "N/A"}</div>
//       </div>`,
//       )
//       .join("");
//   } catch (e) {
//     el.innerHTML = `<div class="no-data" style="color:var(--red)">${e.message}</div>`;
//   }
// }

// async function deleteBatch(id, name) {
//   if (!confirm(`Delete batch "${name}"? Students will be unassigned.`)) return;
//   try {
//     await supabaseClient
//       .from("users")
//       .update({ batch_id: null })
//       .eq("batch_id", id);
//     const { error } = await supabaseClient
//       .from("batches")
//       .delete()
//       .eq("id", id);
//     if (error) throw error;
//     alert("✅ Batch deleted");
//     await loadAllBatches();
//   } catch (e) {
//     alert("Error: " + e.message);
//   }
// }

// async function toggleBatchOpen(id, current, name) {
//   const newState = !current;
//   if (!confirm(`${newState ? "Open" : "Close"} batch "${name}"?`)) return;
//   try {
//     const { error } = await supabaseClient
//       .from("batches")
//       .update({ is_open: newState })
//       .eq("id", id);
//     if (error) throw error;
//     await loadAllBatches();
//   } catch (e) {
//     alert("Error: " + e.message);
//   }
// }

// ── BATCH SCHEDULE UPLOAD ────────────────────────────────────────────────────
// async function loadScheduleBatchSelect() {
//   const sel = document.getElementById("scheduleBatchSelect");
//   if (!sel) return;
//   try {
//     const { data } = await supabaseClient
//       .from("batches")
//       .select("id, name")
//       .order("name");
//     sel.innerHTML =
//       '<option value="">— Choose a batch —</option>' +
//       (data || [])
//         .map((b) => `<option value="${b.id}">${b.name}</option>`)
//         .join("");
//   } catch (e) {
//     console.error("loadScheduleBatchSelect:", e);
//   }
// }

function parseScheduleCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) =>
    h
      .trim()
      .toLowerCase()
      .replace(/[^a-z_]/g, "_"),
  );
  return lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const row = {};
      headers.forEach((h, i) => {
        row[h] = vals[i] || "";
      });
      return row;
    });
}

function handleSchedulePreview(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  readScheduleFile(file);
}

function handleScheduleDrop(event) {
  event.preventDefault();
  document.getElementById("scheduleDropZone").style.borderColor =
    "var(--border)";
  const file = event.dataTransfer.files?.[0];
  if (file) readScheduleFile(file);
}

function readScheduleFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    _scheduleRows = parseScheduleCsv(e.target.result);
    document.getElementById("scheduleRowCount").textContent =
      _scheduleRows.length + " rows";
    document.getElementById("scheduleCsvName").textContent = file.name;
    document.getElementById("schedulePreviewInfo").style.display = "flex";
    document.getElementById("scheduleUploadBtn").disabled =
      _scheduleRows.length === 0;
    document.getElementById("scheduleUploadStatus").textContent = "";
    renderSchedulePreviewTable();
  };
  reader.readAsText(file);
}

function renderSchedulePreviewTable() {
  const wrap = document.getElementById("schedulePreviewTable");
  if (!_scheduleRows.length) {
    wrap.style.display = "none";
    return;
  }
  const preview = _scheduleRows.slice(0, 8);
  const cols = ["test_no", "date", "day", "subject", "chapter"];
  wrap.style.display = "block";
  wrap.innerHTML = `
    <p style="font-size:11px;color:var(--muted);margin-bottom:8px;">Preview (first ${preview.length} of ${_scheduleRows.length} rows)</p>
    <table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead><tr style="background:var(--blue);color:#fff;">${cols.map((c) => `<th style="padding:8px 10px;text-align:left;white-space:nowrap;">${c}</th>`).join("")}</tr></thead>
      <tbody>${preview.map((r, i) => `<tr style="background:${i % 2 === 0 ? "var(--bg)" : "var(--card)"};border-bottom:1px solid var(--border);">${cols.map((c) => `<td style="padding:7px 10px;">${r[c] || "—"}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>`;
}

// function clearScheduleCsv() {
//   _scheduleRows = [];
//   document.getElementById("scheduleCsvInput").value = "";
//   document.getElementById("schedulePreviewInfo").style.display = "none";
//   document.getElementById("schedulePreviewTable").style.display = "none";
//   document.getElementById("scheduleUploadBtn").disabled = true;
//   document.getElementById("scheduleUploadStatus").textContent = "";
// }

// async function uploadSchedule() {
//   const batchId = document.getElementById("scheduleBatchSelect").value;
//   if (!batchId) {
//     alert("Please select a batch first.");
//     return;
//   }
//   if (!_scheduleRows.length) {
//     alert("No rows to upload.");
//     return;
//   }
//   const btn = document.getElementById("scheduleUploadBtn");
//   const status = document.getElementById("scheduleUploadStatus");
//   btn.disabled = true;
//   btn.textContent = "Uploading…";
//   status.textContent = "";
//   try {
//     await supabaseClient
//       .from("batch_schedules")
//       .delete()
//       .eq("batch_id", batchId);
//     const rows = _scheduleRows.map((r) => ({
//       batch_id: batchId,
//       test_no: r.test_no || r["test no"] || null,
//       date: r.date || null,
//       day: r.day || null,
//       subject: r.subject || null,
//       chapter:
//         r.chapter || r["chapter / test type"] || r["chapter_test_type"] || null,
//     }));
//     const chunkSize = 50;
//     for (let i = 0; i < rows.length; i += chunkSize) {
//       const chunk = rows.slice(i, i + chunkSize);
//       const { error } = await supabaseClient
//         .from("batch_schedules")
//         .insert(chunk);
//       if (error) throw error;
//     }
//     status.textContent = `✅ ${rows.length} rows uploaded successfully!`;
//     status.style.color = "var(--green)";
//     clearScheduleCsv();
//   } catch (e) {
//     console.error("uploadSchedule error:", e);
//     status.textContent = "❌ Error: " + e.message;
//     status.style.color = "var(--red)";
//   } finally {
//     btn.disabled = false;
//     btn.textContent = "⬆ Upload Schedule";
//   }
// }

function downloadScheduleTemplate() {
  const csv = `test_no,date,day,subject,chapter
1,19-Jan-26,Monday,Biology,Homeostasis
2,26-Jan-26,Monday,Chemistry,Atomic Structure
3,02-Feb-26,Monday,Physics,Kinematics
4,09-Feb-26,Monday,Biology,Digestion
5,16-Feb-26,Monday,Mock,Full Syllabus Mock Test`;
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "batch_schedule_template.csv";
  a.click();
}

// ── NOTIFICATIONS ────────────────────────────────────────────────────────────
// function toggleNotificationForm() {
//   const f = document.getElementById("notificationForm");
//   f.style.display = f.style.display === "none" ? "block" : "none";
// }
// function updateRecipientOptions() {
//   const type = document.getElementById("recipientType").value;
//   document.getElementById("batchSelectorWrap").style.display =
//     type === "batch" ? "block" : "none";
//   if (type === "batch") loadBatchesForNotification();
// }
// async function loadBatchesForNotification() {
//   const sel = document.getElementById("notificationBatch");
//   const { data } = await supabaseClient.from("batches").select("id,name");
//   sel.innerHTML = '<option value="">— Choose Batch —</option>';
//   data?.forEach((b) =>
//     sel.insertAdjacentHTML(
//       "beforeend",
//       `<option value="${b.id}">${b.name}</option>`,
//     ),
//   );
// }
function toggleScheduleTime() {
  const cb = document.getElementById("scheduleNotification");
  document.getElementById("notificationScheduleTime").style.display = cb.checked
    ? "block"
    : "none";
}
// async function sendBulkNotification(event) {
//   event.preventDefault();
//   try {
//     const type = document.getElementById("recipientType").value;
//     const subject = document.getElementById("notificationSubject").value;
//     const message = document.getElementById("notificationMessage").value;
//     const sched = document.getElementById("scheduleNotification").checked;
//     const schedAt = sched
//       ? document.getElementById("notificationScheduleTime").value
//       : null;
//     if (!type) {
//       alert("Choose recipients");
//       return;
//     }
//     let users = [];
//     if (type === "all") {
//       const { data } = await supabaseClient
//         .from("users")
//         .select("email,first_name");
//       users = data || [];
//     } else {
//       const batchId = document.getElementById("notificationBatch").value;
//       if (!batchId) {
//         alert("Select a batch");
//         return;
//       }
//       const { data } = await supabaseClient
//         .from("users")
//         .select("email,first_name")
//         .eq("batch_id", batchId);
//       users = data || [];
//     }
//     if (!users.length) {
//       alert("No users found");
//       return;
//     }
//     try {
//       const { error: dbErr } = await supabaseClient
//         .from("notifications")
//         .insert([
//           {
//             subject,
//             message,
//             recipient_type: type,
//             recipient_count: users.length,
//             scheduled_at: schedAt,
//             status: sched ? "scheduled" : "sent",
//             sent_at: sched ? null : new Date().toISOString(),
//           },
//         ]);
//       if (dbErr)
//         console.warn(
//           "notifications table insert failed (run SQL to create it):",
//           dbErr.message,
//         );
//     } catch (dbEx) {
//       console.warn("notifications table not found:", dbEx.message);
//     }
//     let sent = 0;
//     if (!sched) {
//       if (window.sendEmailBulk) {
//         sent = await window.sendEmailBulk(
//           users,
//           subject,
//           (u) => message,
//           "notification",
//         );
//       }
//       alert(`Notification sent!\nEmails delivered: ${sent}/${users.length}`);
//     } else {
//       alert(
//         `📅 Notification scheduled for ${schedAt}.\n${users.length} users will be notified.`,
//       );
//     }
//     event.target.reset();
//     toggleNotificationForm();
//     await loadNotificationHistory();
//   } catch (e) {
//     alert("Error: " + e.message);
//   }
// }
// async function loadNotificationHistory() {
//   const el = document.getElementById("notificationHistory");
//   try {
//     const { data, error } = await supabaseClient
//       .from("notifications")
//       .select("*")
//       .order("created_at", { ascending: false })
//       .limit(15);
//     el.innerHTML =
//       '<h3 style="font-size:15px;font-weight:700;margin-bottom:14px">Recent Notifications</h3>';
//     if (error) {
//       el.innerHTML += `<div class="no-data" style="font-size:12px;">
//         Notification history unavailable. Run this SQL in Supabase to enable it:<br><br>
//         <code style="background:#f3f4f6;padding:4px 8px;border-radius:4px;font-size:11px;">
//           CREATE TABLE IF NOT EXISTS public.notifications (id bigserial PRIMARY KEY, subject text, message text, recipient_type text, recipient_count int, scheduled_at timestamptz, sent_at timestamptz, status text, created_at timestamptz DEFAULT now());
//         </code>
//       </div>`;
//       return;
//     }
//     if (!data?.length) {
//       el.innerHTML += '<div class="no-data">No notifications yet</div>';
//       return;
//     }
//     el.innerHTML += data
//       .map(
//         (n) => `
//       <div class="card" style="margin-bottom:10px">
//         <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:14px;gap:12px;flex-wrap:wrap">
//           <div style="flex:1;min-width:0">
//             <div style="font-weight:700;font-size:14px">${n.subject}</div>
//             <div style="font-size:12px;color:var(--muted);margin-top:3px">${n.message.substring(0, 100)}…</div>
//             <div style="font-size:11px;color:#9ca3af;margin-top:4px">To ${n.recipient_count} users · ${new Date(n.created_at).toLocaleString()}</div>
//           </div>
//           <span class="pill ${n.status === "sent" ? "pill-green" : "pill-orange"}">${n.status.toUpperCase()}</span>
//         </div>
//       </div>`,
//       )
//       .join("");
//   } catch (e) {
//     el.innerHTML = `<div class="no-data">Could not load history: ${e.message}</div>`;
//   }
// }

// ── PROFILE ──────────────────────────────────────────────────────────────────
// async function loadAdminProfile() {
//   try {
//     const { data: ud } = await supabaseClient.auth.getUser();
//     document.getElementById("profileEmail").textContent = ud.user?.email || "—";
//     document.getElementById("profileLastLogin").textContent = ud.user
//       ?.last_sign_in_at
//       ? new Date(ud.user.last_sign_in_at).toLocaleString()
//       : "N/A";
//     const [{ data: qs }, { data: us }, { data: ns }, { data: bs }] =
//       await Promise.all([
//         supabaseClient.from("quizzes").select("id"),
//         supabaseClient.from("users").select("id"),
//         supabaseClient.from("notifications").select("id"),
//         supabaseClient.from("batches").select("id"),
//       ]);
//     document.getElementById("profileQuizzesCreated").textContent =
//       qs?.length || 0;
//     document.getElementById("profileUsersManaged").textContent =
//       us?.length || 0;
//     document.getElementById("profileNotificationsSent").textContent =
//       ns?.length || 0;
//     document.getElementById("profileBatchCount").textContent = bs?.length || 0;
//   } catch (e) {
//     console.error(e);
//   }
// }

// ── CSV HELPERS ──────────────────────────────────────────────────────────────
function parseCsvToQuestions(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2)
    throw new Error("CSV must have a header row and at least one data row");
  const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
  const required = [
    "question",
    "option_a",
    "option_b",
    "option_c",
    "option_d",
    "correct_answer",
  ];
  const missing = required.filter((r) => !headers.includes(r));
  if (missing.length) throw new Error(`Missing columns: ${missing.join(", ")}`);
  const questions = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((h, j) => (row[h] = (vals[j] || "").trim()));
    if (
      !row.question ||
      !row.option_a ||
      !row.option_b ||
      !row.option_c ||
      !row.option_d ||
      !row.correct_answer
    )
      continue;
    const ans = row.correct_answer.toLowerCase();
    if (!["a", "b", "c", "d"].includes(ans)) continue;
    questions.push({
      question: row.question,
      option_a: row.option_a,
      option_b: row.option_b,
      option_c: row.option_c,
      option_d: row.option_d,
      correct_answer: ans,
      explanation: row.explanation || null,
    });
  }
  return questions;
}

function parseCSVLine(line) {
  const res = [];
  let cur = "",
    inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i],
      n = line[i + 1];
    if (c === '"') {
      if (inQ && n === '"') {
        cur += '"';
        i++;
      } else {
        inQ = !inQ;
      }
    } else if (c === "," && !inQ) {
      res.push(cur);
      cur = "";
    } else cur += c;
  }
  res.push(cur);
  return res;
}

function downloadCSVTemplate() {
  const rows = [
    [
      "question",
      "option_a",
      "option_b",
      "option_c",
      "option_d",
      "correct_answer",
      "explanation",
    ],
    [
      "What is the powerhouse of the cell?",
      "Nucleus",
      "Mitochondria",
      "Ribosome",
      "Golgi Body",
      "b",
      "Mitochondria produce ATP via cellular respiration",
    ],
    [
      "Which blood group is universal donor?",
      "A",
      "B",
      "AB",
      "O",
      "d",
      "O negative blood can be given to all patients in emergencies",
    ],
  ];
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: "questions_template.csv",
  });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

// ── EXPORT — RESULTS CSV ─────────────────────────────────────────────────────
function exportResultsCSV() {
  const qf = document.getElementById("filterByQuiz")?.value || "";
  const sf = document.getElementById("filterByStatus")?.value || "";
  let data = _allAttemptsRaw;
  if (qf) data = data.filter((a) => String(a.quiz_id) === String(qf));
  if (sf === "published") data = data.filter((a) => a.is_published);
  if (sf === "unpublished") data = data.filter((a) => !a.is_published);
  if (!data.length) {
    alert("No data to export with current filters.");
    return;
  }
  const uMap = window._adminUserMap || {};
  const dateStr = new Date().toISOString().slice(0, 10);
  const qLabel = qf ? _quizNamesMap[qf] || "Quiz" : "All_Quizzes";
  const rows = [
    [
      "#",
      "Student Name",
      "Email",
      "Quiz",
      "District",
      "Score",
      "Total",
      "Percentage",
      "Status",
      "Date Attempted",
    ],
  ];
  data.forEach((a, i) => {
    const u = uMap[a.user_id] || {};
    const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
    rows.push([
      i + 1,
      u.name || "Unknown",
      u.email || "N/A",
      _quizNamesMap[String(a.quiz_id)] || String(a.quiz_id),
      u.district || "N/A",
      a.score,
      a.total,
      pct + "%",
      a.is_published ? "Published" : "Unpublished",
      new Date(a.created_at).toLocaleString(),
    ]);
  });
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const link = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: `MedMinds_Results_${qLabel.replace(/[^a-z0-9]/gi, "_")}_${dateStr}.csv`,
  });
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// ── EXPORT — QUIZ AS WORD (.docx) ─────────────────────────────────────────────
// async function exportQuizAsWord(quizId, quizName) {
//   const btn = typeof event !== "undefined" ? event?.target : null;
//   if (btn) {
//     btn.disabled = true;
//     btn.textContent = "⏳ Generating…";
//   }
//   try {
//     const JSZip = window.JSZip;
//     if (typeof JSZip === "undefined")
//       throw new Error(
//         "JSZip library not loaded — check your internet connection.",
//       );
//     const [{ data: quiz }, { data: questions }] = await Promise.all([
//       supabaseClient.from("quizzes").select("*").eq("id", quizId).single(),
//       supabaseClient
//         .from("questions")
//         .select("*")
//         .eq("quiz_id", quizId)
//         .order("id", { ascending: true }),
//     ]);
//     if (!questions?.length) {
//       alert("No questions found for this quiz.");
//       return;
//     }
//     let batchName = "All Batches";
//     if (quiz?.batch_id) {
//       const { data: b } = await supabaseClient
//         .from("batches")
//         .select("name")
//         .eq("id", quiz.batch_id)
//         .single();
//       if (b) batchName = b.name;
//     }
//     const esc = (s) =>
//       String(s || "")
//         .replace(/&/g, "&amp;")
//         .replace(/</g, "&lt;")
//         .replace(/>/g, "&gt;")
//         .replace(/"/g, "&quot;");
//     const bold = (text, sz = 22, color = "000000") =>
//       `<w:r><w:rPr><w:b/><w:color w:val="${color}"/><w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
//     const run = (text, sz = 22, color = "000000", italic = false) =>
//       `<w:r><w:rPr>${italic ? "<w:i/>" : ""}<w:color w:val="${color}"/><w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
//     const para = (children, align = "left", shade = "") =>
//       `<w:p><w:pPr><w:jc w:val="${align}"/>${shade ? `<w:shd w:val="clear" w:color="auto" w:fill="${shade}"/>` : ""}
//         <w:spacing w:before="40" w:after="40"/>
//       </w:pPr>${children}</w:p>`;
//     const cell = (content, shade = "") =>
//       `<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/>${shade ? `<w:shd w:val="clear" w:color="auto" w:fill="${shade}"/>` : ""}
//         <w:tcMar><w:top w:w="60" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar>
//       </w:tcPr>${content}</w:tc>`;
//     const tblRow = (...cells) => `<w:tr>${cells.join("")}</w:tr>`;
//     const tbl = (rows, widthPct = 100) =>
//       `<w:tbl><w:tblPr><w:tblW w:w="${widthPct * 50}" w:type="pct"/>
//         <w:tblBorders>
//           <w:top    w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
//           <w:left   w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
//           <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
//           <w:right  w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
//           <w:insideH w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
//           <w:insideV w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
//         </w:tblBorders>
//       </w:tblPr>${rows.join("")}</w:tbl>`;
//     const metaRows = [
//       tblRow(
//         cell(para(bold("Quiz Name", "20", "0B63B7")), "EFF6FF"),
//         cell(para(run(quiz?.name || quizName))),
//         cell(para(bold("Type", "20", "0B63B7")), "EFF6FF"),
//         cell(para(run(quiz?.type || "N/A"))),
//       ),
//       tblRow(
//         cell(para(bold("Syllabus", "20", "0B63B7")), "EFF6FF"),
//         cell(para(run(quiz?.syllabus || "N/A"))),
//         cell(para(bold("Batch", "20", "0B63B7")), "EFF6FF"),
//         cell(para(run(batchName))),
//       ),
//       tblRow(
//         cell(para(bold("Questions", "20", "0B63B7")), "EFF6FF"),
//         cell(para(run(String(questions.length)))),
//         cell(para(bold("Status", "20", "0B63B7")), "EFF6FF"),
//         cell(para(run(quiz?.is_published ? "Published" : "Draft"))),
//       ),
//       tblRow(
//         cell(para(bold("Exported", "20", "0B63B7")), "EFF6FF"),
//         cell(para(run(new Date().toLocaleString()))),
//         cell(para(bold("Description", "20", "0B63B7")), "EFF6FF"),
//         cell(para(run(quiz?.description || "—"))),
//       ),
//     ];
//     const qBlocks = [];
//     const optKeys = ["a", "b", "c", "d"];
//     const optFields = ["option_a", "option_b", "option_c", "option_d"];
//     questions.forEach((q, i) => {
//       const isCorrect = (k) => q.correct_answer === k;
//       const opts = optKeys.map((k, j) => ({
//         key: k,
//         text: q[optFields[j]] || "",
//       }));
//       const qRows = [
//         tblRow(
//           cell(
//             para(
//               `${bold(`Q${i + 1}.  `, "24", "0B63B7")}${run(q.question, "24")}`,
//               "left",
//             ),
//             "EFF6FF",
//           ) +
//             `<w:tcPr><w:gridSpan w:val="2"/><w:shd w:val="clear" w:color="auto" w:fill="EFF6FF"/></w:tcPr>`,
//         ),
//         tblRow(
//           ...opts
//             .slice(0, 2)
//             .map((o) =>
//               cell(
//                 para(
//                   bold(
//                     `${o.key.toUpperCase()})  `,
//                     "22",
//                     isCorrect(o.key) ? "16A34A" : "374151",
//                   ) +
//                     run(o.text, "22", isCorrect(o.key) ? "16A34A" : "000000") +
//                     (isCorrect(o.key) ? bold("  ✓", "22", "16A34A") : ""),
//                 ),
//                 isCorrect(o.key) ? "DCFCE7" : "",
//               ),
//             ),
//         ),
//         tblRow(
//           ...opts
//             .slice(2, 4)
//             .map((o) =>
//               cell(
//                 para(
//                   bold(
//                     `${o.key.toUpperCase()})  `,
//                     "22",
//                     isCorrect(o.key) ? "16A34A" : "374151",
//                   ) +
//                     run(o.text, "22", isCorrect(o.key) ? "16A34A" : "000000") +
//                     (isCorrect(o.key) ? bold("  ✓", "22", "16A34A") : ""),
//                 ),
//                 isCorrect(o.key) ? "DCFCE7" : "",
//               ),
//             ),
//         ),
//       ];
//       if (q.explanation) {
//         qRows.push(
//           tblRow(
//             cell(
//               para(
//                 bold("Explanation: ", "20", "D97706") +
//                   run(q.explanation, "20", "92400E", true),
//               ),
//               "FFF7ED",
//             ) +
//               `<w:tcPr><w:gridSpan w:val="2"/><w:shd w:val="clear" w:color="auto" w:fill="FFF7ED"/></w:tcPr>`,
//           ),
//         );
//       }
//       qBlocks.push(para(""), tbl(qRows));
//     });
//     const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
// <w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
//   xmlns:cx="http://schemas.microsoft.com/office/drawing/2014/chartex"
//   xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
//   xmlns:aink="http://schemas.microsoft.com/office/drawing/2016/ink"
//   xmlns:am3d="http://schemas.microsoft.com/office/drawing/2017/model3d"
//   xmlns:o="urn:schemas-microsoft-com:office:office"
//   xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
//   xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
//   xmlns:v="urn:schemas-microsoft-com:vml"
//   xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
//   xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
//   xmlns:w10="urn:schemas-microsoft-com:office:word"
//   xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
//   xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
//   xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml"
//   xmlns:w16cex="http://schemas.microsoft.com/office/word/2018/wordml/cex"
//   xmlns:w16cid="http://schemas.microsoft.com/office/word/2016/wordml/cid"
//   xmlns:w16="http://schemas.microsoft.com/office/word/2018/wordml"
//   xmlns:w16sdtdh="http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash"
//   xmlns:w16se="http://schemas.microsoft.com/office/word/2015/wordml/symex"
//   xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
//   xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
//   xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
//   xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
//   mc:Ignorable="w14 w15 w16se w16cid w16 w16cex w16sdtdh wp14">
// <w:body>
//   <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="80"/></w:pPr>
//     ${bold("MedMinds — " + (quiz?.name || quizName), "36", "0B63B7")}
//   </w:p>
//   <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="160"/></w:pPr>
//     ${run(`${questions.length} Questions  ·  ${quiz?.syllabus || ""}  ·  ${quiz?.type || ""}`, "22", "6B7280")}
//   </w:p>
//   ${tbl(metaRows)}
//   <w:p><w:pPr><w:spacing w:before="160" w:after="80"/></w:pPr>
//     ${bold("Questions & Answer Key", "28", "072F6B")}
//   </w:p>
//   ${qBlocks.join("\n")}
//   <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="240" w:after="0"/></w:pPr>
//     ${run("Generated by MedMinds Admin Panel · " + new Date().toLocaleDateString(), "18", "9CA3AF", true)}
//   </w:p>
//   <w:sectPr>
//     <w:pgMar w:top="720" w:right="900" w:bottom="720" w:left="900" w:header="0" w:footer="0" w:gutter="0"/>
//   </w:sectPr>
// </w:body></w:document>`;
//     const zip = new JSZip();
//     zip.file(
//       "[Content_Types].xml",
//       `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
// <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
//   <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
//   <Default Extension="xml"  ContentType="application/xml"/>
//   <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
// </Types>`,
//     );
//     zip.folder("_rels").file(
//       ".rels",
//       `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
// <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
//   <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
// </Relationships>`,
//     );
//     zip.folder("word").file("document.xml", docXml);
//     zip.folder("word/_rels").file(
//       "document.xml.rels",
//       `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
// <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
// </Relationships>`,
//     );
//     const blob = await zip.generateAsync({
//       type: "blob",
//       mimeType:
//         "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     });
//     const safe =
//       quizName
//         .replace(/[^a-z0-9 _-]/gi, "")
//         .trim()
//         .replace(/\s+/g, "_") || "quiz";
//     const link = Object.assign(document.createElement("a"), {
//       href: URL.createObjectURL(blob),
//       download: `MedMinds_${safe}.docx`,
//     });
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);
//   } catch (e) {
//     console.error("Word export error:", e);
//     alert("Export failed: " + e.message);
//   } finally {
//     if (btn) {
//       btn.disabled = false;
//       btn.textContent = "📄 Export .docx";
//     }
//   }
// }

// ── DRAG-AND-DROP ON CSV ZONE ────────────────────────────────────────────────
function setupCsvDragDrop() {
  const zone = document.querySelector(".csv-zone");
  if (!zone) return;
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.style.borderColor = "var(--blue)";
  });
  zone.addEventListener("dragleave", () => {
    zone.style.borderColor = "#b3d4f5";
  });
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.style.borderColor = "#b3d4f5";
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      alert("Please drop a .csv file");
      return;
    }
    const dt = new DataTransfer();
    dt.items.add(file);
    const inp = document.getElementById("csvFileInput");
    inp.files = dt.files;
    inp.dispatchEvent(new Event("change"));
  });
}

// ── SUBJECTS TAB ─────────────────────────────────────────────────────────────
// async function loadSubjectsTab() {
//   const tbody = document.getElementById("subjectsTbody");
//   tbody.innerHTML =
//     '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:32px">Loading…</td></tr>';
//   try {
//     const { data: subjects, error } = await supabaseClient
//       .from("subjects")
//       .select("*")
//       .order("name", { ascending: true });
//     if (error) throw error;
//     const { data: qCounts } = await supabaseClient
//       .from("questions")
//       .select("subject")
//       .not("subject", "is", null);
//     const countMap = {};
//     (qCounts || []).forEach((q) => {
//       countMap[q.subject] = (countMap[q.subject] || 0) + 1;
//     });
//     const { count: totalQs } = await supabaseClient
//       .from("questions")
//       .select("*", { count: "exact", head: true });
//     const totalTagged = Object.values(countMap).reduce((a, b) => a + b, 0);
//     const untagged = (totalQs || 0) - totalTagged;
//     document.getElementById("subjTotalCount").textContent = subjects.length;
//     document.getElementById("subjTotalTagged").textContent = totalTagged;
//     document.getElementById("subjUntagged").textContent = untagged;
//     if (!subjects.length) {
//       tbody.innerHTML =
//         '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:40px">No subjects yet. Click "+ Add Subject" to create one.</td></tr>';
//       return;
//     }
//     tbody.innerHTML = subjects
//       .map((s, i) => {
//         const count = countMap[s.name] || 0;
//         const color = s.color || "#6b7280";
//         const icon = s.icon || "📚";
//         return `
//         <tr>
//           <td style="color:var(--muted);font-size:13px">${i + 1}</td>
//           <td>
//             <div style="display:flex;align-items:center;gap:10px">
//               <span style="font-size:20px">${icon}</span>
//               <span style="font-weight:700;font-size:14px">${s.name}</span>
//             </div>
//           </td>
//           <td style="text-align:center">
//             <span style="display:inline-block;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:700;background:${color}22;color:${color};">${count} questions</span>
//           </td>
//           <td style="text-align:center">
//             <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.15);" title="${color}"></span>
//           </td>
//           <td style="text-align:center">
//             <div style="display:flex;gap:6px;justify-content:center">
//               <button class="btn btn-gray btn-sm" onclick='openEditSubjectModal(${JSON.stringify(s)})'>✏️ Edit</button>
//               <button class="btn btn-sm" style="background:#fee2e2;color:#dc2626;border:none" onclick="deleteSubject(${s.id}, '${s.name.replace(/'/g, "\\'")}')">🗑 Delete</button>
//             </div>
//           </td>
//         </tr>`;
//       })
//       .join("");
//   } catch (e) {
//     console.error("loadSubjectsTab:", e);
//     tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#dc2626;padding:32px">Error: ${e.message}</td></tr>`;
//   }
// }

function openAddSubjectModal() {
  document.getElementById("subjectModalTitle").textContent = "＋ Add Subject";
  document.getElementById("subjectEditId").value = "";
  document.getElementById("subjectNameInput").value = "";
  document.getElementById("subjectIconInput").value = "";
  document.getElementById("subjectColorInput").value = "#16a34a";
  document.getElementById("subjectModalAlert").style.display = "none";
  document.getElementById("subjectModal").classList.add("open");
}

function openEditSubjectModal(s) {
  document.getElementById("subjectModalTitle").textContent = "✏️ Edit Subject";
  document.getElementById("subjectEditId").value = s.id;
  document.getElementById("subjectNameInput").value = s.name;
  document.getElementById("subjectIconInput").value = s.icon || "";
  document.getElementById("subjectColorInput").value = s.color || "#16a34a";
  document.getElementById("subjectModalAlert").style.display = "none";
  document.getElementById("subjectModal").classList.add("open");
}

function closeSubjectModal() {
  document.getElementById("subjectModal").classList.remove("open");
}

function showSubjectAlert(msg, type = "error") {
  const el = document.getElementById("subjectModalAlert");
  el.textContent = msg;
  el.style.display = "block";
  el.style.background = type === "error" ? "#fee2e2" : "#dcfce7";
  el.style.color = type === "error" ? "#7f1d1d" : "#14532d";
  el.style.borderLeft = `4px solid ${type === "error" ? "#dc2626" : "#16a34a"}`;
}

// async function saveSubject() {
//   const id = document.getElementById("subjectEditId").value;
//   const name = document.getElementById("subjectNameInput").value.trim();
//   const icon = document.getElementById("subjectIconInput").value.trim() || "📚";
//   const color = document.getElementById("subjectColorInput").value;
//   if (!name) return showSubjectAlert("Subject name is required.");
//   const btn = document.getElementById("saveSubjectBtn");
//   btn.disabled = true;
//   btn.textContent = "Saving…";
//   try {
//     if (id) {
//       const { error } = await supabaseClient
//         .from("subjects")
//         .update({ name, icon, color, updated_at: new Date().toISOString() })
//         .eq("id", id);
//       if (error) throw error;
//     } else {
//       const { data: existing } = await supabaseClient
//         .from("subjects")
//         .select("id")
//         .eq("name", name)
//         .maybeSingle();
//       if (existing)
//         return showSubjectAlert(`Subject "${name}" already exists.`);
//       const { error } = await supabaseClient
//         .from("subjects")
//         .insert({ name, icon, color });
//       if (error) throw error;
//     }
//     closeSubjectModal();
//     await loadSubjectsTab();
//   } catch (e) {
//     showSubjectAlert(e.message || "Save failed.");
//   } finally {
//     btn.disabled = false;
//     btn.textContent = "Save Subject";
//   }
// }

// async function deleteSubject(id, name) {
//   if (
//     !confirm(
//       `Delete subject "${name}"?\n\nThis will NOT delete questions — they will just become untagged.`,
//     )
//   )
//     return;
//   try {
//     await supabaseClient
//       .from("questions")
//       .update({ subject: null })
//       .eq("subject", name);
//     const { error } = await supabaseClient
//       .from("subjects")
//       .delete()
//       .eq("id", id);
//     if (error) throw error;
//     await loadSubjectsTab();
//   } catch (e) {
//     alert("Delete failed: " + e.message);
//   }
// }

// ── TOPICS & SUBTOPICS ADMIN ─────────────────────────────────────────────────
// async function loadSubjectsTabEnhanced() {
//   try {
//     const [
//       { data: subjects },
//       { data: qCounts },
//       { data: topicsAll },
//       { data: subtopicsAll },
//     ] = await Promise.all([
//       supabaseClient.from("subjects").select("*").order("name"),
//       supabaseClient
//         .from("questions")
//         .select("subject,topic,subtopic")
//         .not("subject", "is", null),
//       supabaseClient.from("topics").select("*"),
//       supabaseClient.from("subtopics").select("*"),
//     ]);
//     const totalQ = qCounts?.length || 0;
//     const totalTopics = topicsAll?.length || 0;
//     const totalSubtopics = subtopicsAll?.length || 0;
//     const totalSubjects = subjects?.length || 0;
//     const statsEl = document.getElementById("subjectStatsCards");
//     if (statsEl) {
//       statsEl.innerHTML = [
//         {
//           icon: "📚",
//           label: "Subjects",
//           val: totalSubjects,
//           color: "var(--blue-main)",
//         },
//         {
//           icon: "📖",
//           label: "Topics",
//           val: totalTopics,
//           color: "var(--purple)",
//         },
//         {
//           icon: "🔬",
//           label: "Subtopics",
//           val: totalSubtopics,
//           color: "var(--green)",
//         },
//         {
//           icon: "❓",
//           label: "Total MCQs",
//           val: totalQ.toLocaleString(),
//           color: "var(--amber)",
//         },
//       ]
//         .map(
//           (s) => `
//         <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px;box-shadow:0 2px 10px rgba(0,0,0,.04);">
//           <div style="font-size:24px;margin-bottom:6px;">${s.icon}</div>
//           <div style="font-size:22px;font-weight:800;color:${s.color};">${s.val}</div>
//           <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-top:2px;">${s.label}</div>
//         </div>`,
//         )
//         .join("");
//     }
//     const subjectNames = (subjects || []).map((s) => s.name);
//     ["topicSubjectFilter", "topicSubject", "qbSubject"].forEach((id) => {
//       const el = document.getElementById(id);
//       if (!el) return;
//       const first = el.options[0].outerHTML;
//       el.innerHTML =
//         first +
//         subjectNames.map((n) => `<option value="${n}">${n}</option>`).join("");
//     });
//     _adminTopics = topicsAll || [];
//     _adminSubtopics = subtopicsAll || [];
//     await loadTopicsAdmin();
//     await loadQbTopics();
//     await populateTopicCsvQuizSelect();
//   } catch (e) {
//     console.error("loadSubjectsTabEnhanced:", e);
//   }
// }

// async function loadTopicsAdmin() {
//   const el = document.getElementById("topicsAdminList");
//   if (!el) return;
//   el.innerHTML =
//     '<div style="text-align:center;padding:20px;color:var(--muted);">Loading…</div>';
//   try {
//     const filterSubj =
//       document.getElementById("topicSubjectFilter")?.value || "";
//     let q = supabaseClient
//       .from("topics")
//       .select("*")
//       .order("subject_name")
//       .order("name");
//     if (filterSubj) q = q.eq("subject_name", filterSubj);
//     const { data: topics } = await q;
//     const { data: qCounts } = await supabaseClient
//       .from("questions")
//       .select("topic,subtopic")
//       .not("topic", "is", null);
//     const tCountMap = {},
//       stCountMap = {};
//     (qCounts || []).forEach((q) => {
//       if (q.topic) tCountMap[q.topic] = (tCountMap[q.topic] || 0) + 1;
//       if (q.subtopic)
//         stCountMap[q.subtopic] = (stCountMap[q.subtopic] || 0) + 1;
//     });
//     const { data: subtopics } = await supabaseClient
//       .from("subtopics")
//       .select("*")
//       .order("topic_name")
//       .order("name");
//     if (!topics?.length) {
//       el.innerHTML =
//         '<div style="text-align:center;padding:20px;color:var(--muted);">No topics yet. Add topics above.</div>';
//       return;
//     }
//     const bySubj = {};
//     (topics || []).forEach((t) => {
//       if (!bySubj[t.subject_name]) bySubj[t.subject_name] = [];
//       bySubj[t.subject_name].push(t);
//     });
//     let html = "";
//     Object.entries(bySubj).forEach(([subj, tList]) => {
//       html += `<div style="margin-bottom:20px;">
//         <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.7px;color:var(--blue-main);margin-bottom:10px;padding:6px 0;border-bottom:2px solid var(--border);">${subj}</div>
//         <div style="display:grid;gap:8px;">`;
//       tList.forEach((t) => {
//         const tCount = tCountMap[t.name] || 0;
//         const subs = (subtopics || []).filter((s) => s.topic_name === t.name);
//         const subsHtml = subs.length
//           ? subs
//               .map(
//                 (s) => `
//           <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 12px;background:var(--bg);border-radius:7px;font-size:12px;">
//             <span style="font-weight:600;color:var(--text);">↳ ${s.name}</span>
//             <div style="display:flex;align-items:center;gap:8px;">
//               <span style="font-size:11px;color:var(--muted);">${stCountMap[s.name] || 0} MCQs</span>
//               <button onclick="editSubtopic(${s.id},'${s.name.replace(/'/g, "\\'")}','${s.topic_name.replace(/'/g, "\\'")}','${s.subject_name.replace(/'/g, "\\'")}'); event.stopPropagation();" style="background:none;border:1px solid var(--border);border-radius:5px;padding:2px 8px;font-size:11px;cursor:pointer;color:var(--muted);">Edit</button>
//               <button onclick="deleteSubtopic(${s.id},'${s.name.replace(/'/g, "\\'")}'); event.stopPropagation();" style="background:none;border:1px solid var(--red-bg);border-radius:5px;padding:2px 8px;font-size:11px;cursor:pointer;color:var(--red);">Del</button>
//             </div>
//           </div>`,
//               )
//               .join("")
//           : '<div style="font-size:12px;color:var(--muted);padding:6px 12px;">No subtopics yet.</div>';
//         html += `<div style="border:1.5px solid var(--border);border-radius:10px;overflow:hidden;">
//           <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(11,99,183,.04);cursor:pointer;" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'">
//             <div>
//               <span style="font-size:13px;font-weight:700;color:var(--text);">${t.name}</span>
//               <span style="font-size:11px;color:var(--muted);margin-left:8px;">${tCount} MCQs · ${subs.length} subtopics</span>
//             </div>
//             <div style="display:flex;gap:6px;">
//               <button onclick="openAddSubtopicModal('${t.subject_name.replace(/'/g, "\\'")}','${t.name.replace(/'/g, "\\'")}');event.stopPropagation();" style="background:var(--blue-main);color:white;border:none;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;">+ Subtopic</button>
//               <button onclick="editTopic(${t.id},'${t.name.replace(/'/g, "\\'")}','${t.subject_name.replace(/'/g, "\\'")}');event.stopPropagation();" style="background:var(--bg);border:1px solid var(--border);padding:4px 10px;border-radius:6px;font-size:11px;cursor:pointer;color:var(--muted);">Edit</button>
//               <button onclick="deleteTopic(${t.id},'${t.name.replace(/'/g, "\\'")}');event.stopPropagation();" style="background:var(--red-bg);border:none;padding:4px 10px;border-radius:6px;font-size:11px;cursor:pointer;color:var(--red);">Del</button>
//             </div>
//           </div>
//           <div style="display:none;padding:10px;display:grid;gap:5px;">${subsHtml}</div>
//         </div>`;
//       });
//       html += "</div></div>";
//     });
//     el.innerHTML = html;
//   } catch (e) {
//     el.innerHTML = `<div style="color:var(--red);">Error: ${e.message}</div>`;
//   }
// }

function openAddTopicModal() {
  document.getElementById("topicEditId").value = "";
  document.getElementById("topicModalTitle").textContent = "+ Add Topic";
  document.getElementById("topicName").value = "";
  document.getElementById("topicSubject").value = "";
  document.getElementById("topicModalAlert").style.display = "none";
  document.getElementById("topicModal").style.display = "flex";
}
function editTopic(id, name, subject) {
  document.getElementById("topicEditId").value = id;
  document.getElementById("topicModalTitle").textContent = "Edit Topic";
  document.getElementById("topicName").value = name;
  document.getElementById("topicSubject").value = subject;
  document.getElementById("topicModalAlert").style.display = "none";
  document.getElementById("topicModal").style.display = "flex";
}
function closeTopicModal() {
  document.getElementById("topicModal").style.display = "none";
}

// async function saveTopic() {
//   const id = document.getElementById("topicEditId").value;
//   const name = document.getElementById("topicName").value.trim();
//   const subject = document.getElementById("topicSubject").value;
//   const alertEl = document.getElementById("topicModalAlert");
//   if (!name) {
//     alertEl.textContent = "Topic name is required.";
//     alertEl.style.display = "block";
//     return;
//   }
//   if (!subject) {
//     alertEl.textContent = "Subject is required.";
//     alertEl.style.display = "block";
//     return;
//   }
//   const btn = document.getElementById("saveTopicBtn");
//   btn.disabled = true;
//   btn.textContent = "Saving…";
//   try {
//     if (id) {
//       const { error } = await supabaseClient
//         .from("topics")
//         .update({
//           name,
//           subject_name: subject,
//           updated_at: new Date().toISOString(),
//         })
//         .eq("id", id);
//       if (error) throw error;
//     } else {
//       const { error } = await supabaseClient
//         .from("topics")
//         .insert({ name, subject_name: subject });
//       if (error) throw error;
//     }
//     closeTopicModal();
//     await loadTopicsAdmin();
//   } catch (e) {
//     alertEl.textContent = e.message;
//     alertEl.style.display = "block";
//   } finally {
//     btn.disabled = false;
//     btn.textContent = "Save Topic";
//   }
// }

// async function deleteTopic(id, name) {
//   if (
//     !confirm(
//       `Delete topic "${name}"?\n\nThis will NOT delete questions, but they will lose their topic tag.`,
//     )
//   )
//     return;
//   try {
//     await supabaseClient
//       .from("questions")
//       .update({ topic: null, subtopic: null })
//       .eq("topic", name);
//     await supabaseClient.from("subtopics").delete().eq("topic_name", name);
//     const { error } = await supabaseClient.from("topics").delete().eq("id", id);
//     if (error) throw error;
//     await loadTopicsAdmin();
//   } catch (e) {
//     alert("Error: " + e.message);
//   }
// }

function openAddSubtopicModal(subject, topic) {
  document.getElementById("subtopicEditId").value = "";
  document.getElementById("subtopicModalTitle").textContent = "+ Add Subtopic";
  document.getElementById("subtopicName").value = "";
  document.getElementById("subtopicModalAlert").style.display = "none";
  const el = document.getElementById("subtopicTopic");
  const filtered = _adminTopics.filter(
    (t) => t.subject_name === subject || !subject,
  );
  el.innerHTML =
    '<option value="">Select topic…</option>' +
    filtered
      .map(
        (t) =>
          `<option value="${t.name}|${t.subject_name}" ${t.name === topic ? "selected" : ""}>${t.subject_name} → ${t.name}</option>`,
      )
      .join("");
  document.getElementById("subtopicModal").style.display = "flex";
}
function editSubtopic(id, name, topicName, subjectName) {
  document.getElementById("subtopicEditId").value = id;
  document.getElementById("subtopicModalTitle").textContent = "Edit Subtopic";
  document.getElementById("subtopicName").value = name;
  const el = document.getElementById("subtopicTopic");
  el.innerHTML = `<option value="${topicName}|${subjectName}" selected>${subjectName} → ${topicName}</option>`;
  document.getElementById("subtopicModalAlert").style.display = "none";
  document.getElementById("subtopicModal").style.display = "flex";
}
function closeSubtopicModal() {
  document.getElementById("subtopicModal").style.display = "none";
}

// async function saveSubtopic() {
//   const id = document.getElementById("subtopicEditId").value;
//   const name = document.getElementById("subtopicName").value.trim();
//   const topicVal = document.getElementById("subtopicTopic").value;
//   const alertEl = document.getElementById("subtopicModalAlert");
//   if (!name) {
//     alertEl.textContent = "Subtopic name is required.";
//     alertEl.style.display = "block";
//     return;
//   }
//   if (!topicVal) {
//     alertEl.textContent = "Topic is required.";
//     alertEl.style.display = "block";
//     return;
//   }
//   const [topicName, subjectName] = topicVal.split("|");
//   const btn = document.getElementById("saveSubtopicBtn");
//   btn.disabled = true;
//   btn.textContent = "Saving…";
//   try {
//     if (id) {
//       const { error } = await supabaseClient
//         .from("subtopics")
//         .update({
//           name,
//           topic_name: topicName,
//           subject_name: subjectName,
//           updated_at: new Date().toISOString(),
//         })
//         .eq("id", id);
//       if (error) throw error;
//     } else {
//       const { error } = await supabaseClient
//         .from("subtopics")
//         .insert({ name, topic_name: topicName, subject_name: subjectName });
//       if (error) throw error;
//     }
//     closeSubtopicModal();
//     await loadTopicsAdmin();
//   } catch (e) {
//     alertEl.textContent = e.message;
//     alertEl.style.display = "block";
//   } finally {
//     btn.disabled = false;
//     btn.textContent = "Save Subtopic";
//   }
// }

// async function deleteSubtopic(id, name) {
//   if (
//     !confirm(
//       `Delete subtopic "${name}"?\n\nThis will NOT delete questions, they'll just lose the subtopic tag.`,
//     )
//   )
//     return;
//   try {
//     await supabaseClient
//       .from("questions")
//       .update({ subtopic: null })
//       .eq("subtopic", name);
//     const { error } = await supabaseClient
//       .from("subtopics")
//       .delete()
//       .eq("id", id);
//     if (error) throw error;
//     await loadTopicsAdmin();
//   } catch (e) {
//     alert("Error: " + e.message);
//   }
// }

function handleTopicCsvDrop(e) {
  e.preventDefault();
  document.getElementById("topicCsvDropzone").style.borderColor =
    "var(--border)";
  const file = e.dataTransfer.files[0];
  if (file) handleTopicCsvFile(file);
}

function handleTopicCsvFile(file) {
  if (!file || !file.name.endsWith(".csv")) {
    alert("Please upload a .csv file.");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const headers = parseCSVLine(lines[0]).map((h) =>
      h
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_"),
    );
    _parsedTopicCsvRows = lines
      .slice(1)
      .map((line) => {
        const vals = parseCSVLine(line);
        const obj = {};
        headers.forEach((h, i) => (obj[h] = (vals[i] || "").trim()));
        return obj;
      })
      .filter((r) => r.question || r.question_text);
    document.getElementById("topicCsvInfo").textContent =
      `✅ ${_parsedTopicCsvRows.length} questions parsed`;
    const required = [
      "question",
      "option_a",
      "option_b",
      "option_c",
      "option_d",
      "correct_answer",
    ];
    const missing = required.filter((k) => !headers.includes(k));
    if (missing.length) {
      document.getElementById("topicCsvInfo").textContent =
        `❌ Missing columns: ${missing.join(", ")}`;
      document.getElementById("topicCsvInfo").style.color = "var(--red)";
    } else {
      document.getElementById("topicCsvInfo").style.color = "var(--green)";
      const sample = _parsedTopicCsvRows.slice(0, 4);
      const cols = [
        "question",
        "subject",
        "topic",
        "subtopic",
        "correct_answer",
      ];
      document.getElementById("topicCsvTable").innerHTML = `
        <table style="width:100%;border-collapse:collapse;font-size:11px;">
          <thead><tr>${cols.map((c) => `<th style="text-align:left;padding:6px 10px;background:var(--bg);border-bottom:1px solid var(--border);font-weight:700;">${c}</th>`).join("")}</tr></thead>
          <tbody>${sample.map((r) => `<tr>${cols.map((c) => `<td style="padding:5px 10px;border-bottom:1px solid var(--border);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r[c] || "—"}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>`;
    }
    document.getElementById("topicCsvPreview").style.display = "block";
  };
  reader.readAsText(file);
}

function clearTopicCsv() {
  _parsedTopicCsvRows = [];
  document.getElementById("topicCsvPreview").style.display = "none";
  document.getElementById("topicCsvInput").value = "";
  document.getElementById("topicCsvStatus").textContent = "";
}

// async function populateTopicCsvQuizSelect() {
//   try {
//     const { data: quizzes } = await supabaseClient
//       .from("quizzes")
//       .select("id,name")
//       .order("name");
//     const el = document.getElementById("topicCsvQuizId");
//     if (el && quizzes) {
//       el.innerHTML =
//         '<option value="">— No quiz (question bank only) —</option>' +
//         quizzes
//           .map((q) => `<option value="${q.id}">${q.name}</option>`)
//           .join("");
//     }
//   } catch (_) {}
// }

// async function uploadTopicCsv() {
//   if (!_parsedTopicCsvRows.length) {
//     alert("No questions to upload.");
//     return;
//   }
//   const btn = document.getElementById("uploadTopicCsvBtn");
//   btn.disabled = true;
//   btn.textContent = "Uploading…";
//   const statusEl = document.getElementById("topicCsvStatus");
//   statusEl.style.color = "var(--text)";
//   statusEl.textContent = "Uploading…";
//   try {
//     const quizId = document.getElementById("topicCsvQuizId").value || null;
//     const rows = _parsedTopicCsvRows.map((r) => ({
//       question: r.question || r.question_text || "",
//       option_a: r.option_a,
//       option_b: r.option_b,
//       option_c: r.option_c,
//       option_d: r.option_d,
//       correct_answer: r.correct_answer,
//       explanation: r.explanation || null,
//       subject: r.subject || null,
//       topic: r.topic || null,
//       subtopic: r.subtopic || null,
//       quiz_id: quizId ? parseInt(quizId) : null,
//     }));
//     const CHUNK = 50;
//     let done = 0;
//     for (let i = 0; i < rows.length; i += CHUNK) {
//       const { error } = await supabaseClient
//         .from("questions")
//         .insert(rows.slice(i, i + CHUNK));
//       if (error) throw error;
//       done += Math.min(CHUNK, rows.length - i);
//       statusEl.textContent = `Uploaded ${done}/${rows.length}…`;
//     }
//     statusEl.textContent = `✅ ${rows.length} questions uploaded successfully!`;
//     statusEl.style.color = "var(--green)";
//     clearTopicCsv();
//     await loadSubjectsTabEnhanced();
//   } catch (e) {
//     statusEl.textContent = "❌ Error: " + e.message;
//     statusEl.style.color = "var(--red)";
//   } finally {
//     btn.disabled = false;
//     btn.textContent = "⬆️ Upload Questions";
//   }
// }

async function loadQbTopics() {
  const subj = document.getElementById("qbSubject")?.value;
  const el = document.getElementById("qbTopic");
  if (!el) return;
  el.innerHTML = '<option value="">All Topics</option>';
  if (!subj) {
    document.getElementById("qbSubtopic").innerHTML =
      '<option value="">All Subtopics</option>';
    return;
  }
  const filtered = _adminTopics.filter((t) => t.subject_name === subj);
  el.innerHTML += filtered
    .map((t) => `<option value="${t.name}">${t.name}</option>`)
    .join("");
  document.getElementById("qbSubtopic").innerHTML =
    '<option value="">All Subtopics</option>';
}

async function loadQbSubtopics() {
  const topic = document.getElementById("qbTopic")?.value;
  const el = document.getElementById("qbSubtopic");
  if (!el) return;
  el.innerHTML = '<option value="">All Subtopics</option>';
  if (!topic) return;
  const filtered = _adminSubtopics.filter((s) => s.topic_name === topic);
  el.innerHTML += filtered
    .map((s) => `<option value="${s.name}">${s.name}</option>`)
    .join("");
}

// async function loadQbQuestions() {
//   const subj = document.getElementById("qbSubject")?.value;
//   const topic = document.getElementById("qbTopic")?.value;
//   const subtopic = document.getElementById("qbSubtopic")?.value;
//   const el = document.getElementById("qbResults");
//   const statsEl = document.getElementById("qbStats");
//   if (!el) return;
//   el.innerHTML = '<div style="color:var(--muted);">Loading…</div>';
//   try {
//     let q = supabaseClient
//       .from("questions")
//       .select("*", { count: "exact" })
//       .order("id", { ascending: false })
//       .limit(50);
//     if (subj) q = q.eq("subject", subj);
//     if (topic) q = q.eq("topic", topic);
//     if (subtopic) q = q.eq("subtopic", subtopic);
//     const { data: questions, count, error } = await q;
//     if (error) throw error;
//     if (statsEl) {
//       statsEl.innerHTML = [
//         { label: "Total", val: count || 0, color: "var(--blue-main)" },
//       ]
//         .map(
//           (s) =>
//             `<div style="display:inline-flex;align-items:center;gap:5px;background:rgba(11,99,183,.08);color:${s.color};padding:5px 12px;border-radius:20px;font-size:12px;font-weight:700;">${s.label}: ${s.val}</div>`,
//         )
//         .join("");
//     }
//     if (!questions?.length) {
//       el.innerHTML =
//         '<div style="color:var(--muted);text-align:center;padding:20px;">No questions found for this selection.</div>';
//       return;
//     }
//     el.innerHTML = `
//       <div style="font-size:12px;color:var(--muted);margin-bottom:10px;">Showing ${questions.length} of ${count} questions</div>
//       <div style="display:grid;gap:8px;">
//         ${questions
//           .map(
//             (q, i) => `
//         <div style="border:1px solid var(--border);border-radius:9px;padding:12px 14px;background:var(--bg);">
//           <div style="font-size:12px;color:var(--muted);margin-bottom:5px;display:flex;gap:6px;flex-wrap:wrap;">
//             ${q.subject ? `<span style="background:rgba(11,99,183,.1);color:var(--blue-main);padding:2px 8px;border-radius:12px;font-weight:700;">${q.subject}</span>` : ""}
//             ${q.topic ? `<span style="background:rgba(124,58,237,.1);color:var(--purple);padding:2px 8px;border-radius:12px;font-weight:700;">${q.topic}</span>` : ""}
//             ${q.subtopic ? `<span style="background:rgba(22,163,74,.1);color:var(--green);padding:2px 8px;border-radius:12px;font-weight:700;">${q.subtopic}</span>` : ""}
//           </div>
//           <div style="font-size:13px;font-weight:600;color:var(--text);">${i + 1}. ${q.question?.substring(0, 180)}${q.question?.length > 180 ? "…" : ""}</div>
//           <div style="font-size:11px;color:var(--green);margin-top:4px;">✓ ${q.correct_answer?.toUpperCase()}</div>
//         </div>`,
//           )
//           .join("")}
//       </div>`;
//   } catch (e) {
//     el.innerHTML = `<div style="color:var(--red);">Error: ${e.message}</div>`;
//   }
// }

function loadSubtopicSubjectSelect() {
  /* placeholder used by topicSubject onchange — kept for compatibility */
}

// ── Attach all admin functions to window so inline onclick="…" handlers work ─
// function attachAdminGlobals() {
//   const fns = {
//     loadAdminDashboard,
//     loadDashboardStats,
//     loadRecentAttempts,
//     switchTab,
//     loadAllUsers,
//     viewUserPerformance,
//     viewUserResults,
//     adminViewResult,
//     showUserModal,
//     setUserModalBody,
//     closeUserModal,
//     toggleAddUserForm,
//     submitNewUser,
//     deleteUser,
//     toggleAddQuizForm,
//     loadBatchesForQuizForm,
//     handleCsvPreview,
//     clearCsvUpload,
//     loadSubjectsForQuizForm,
//     toggleSubjectRow,
//     updateSubjectCount,
//     getSubjectRanges,
//     applySubjectRanges,
//     getSelectedSubjects,
//     submitNewQuiz,
//     loadAllQuizzes,
//     loadQuizzesForDropdown,
//     publishQuiz,
//     unpublishQuiz,
//     deleteQuiz,
//     loadQuestionsForQuiz,
//     openEditQuizModal,
//     copyQuestionsFromQuiz,
//     closeEditQuizModal,
//     loadEditQuizForm,
//     submitEditQuiz,
//     loadQuizQuestions,
//     uploadToImgbb,
//     previewQuestionImage,
//     clearQuestionImage,
//     submitQuestionToQuiz,
//     deleteQuestionFromModal,
//     deleteQuestion,
//     openQuizSummary,
//     closeQuizSummary,
//     handleSummaryOverlayClick,
//     openQuizDetails,
//     closeQuizDetailsModal,
//     copyQuizShareLink,
//     shareQuizLink,
//     closeShareModal,
//     copyShareLink,
//     loadAllAttempts,
//     populateQuizFilter,
//     filterAttemptsTable,
//     renderAttemptsTable,
//     togglePublishStatus,
//     loadPublishQuizPanel,
//     publishAllForQuiz,
//     unpublishAllForQuiz,
//     loadLeaderboard,
//     loadStatistics,
//     toggleAddBatchForm,
//     submitNewBatch,
//     loadAllBatches,
//     expandBatchDetails,
//     deleteBatch,
//     toggleBatchOpen,
//     loadScheduleBatchSelect,
//     parseScheduleCsv,
//     handleSchedulePreview,
//     handleScheduleDrop,
//     readScheduleFile,
//     renderSchedulePreviewTable,
//     clearScheduleCsv,
//     uploadSchedule,
//     downloadScheduleTemplate,
//     toggleNotificationForm,
//     updateRecipientOptions,
//     loadBatchesForNotification,
//     toggleScheduleTime,
//     sendBulkNotification,
//     loadNotificationHistory,
//     loadAdminProfile,
//     parseCsvToQuestions,
//     parseCSVLine,
//     downloadCSVTemplate,
//     exportResultsCSV,
//     exportQuizAsWord,
//     loadSubjectsTab,
//     openAddSubjectModal,
//     openEditSubjectModal,
//     closeSubjectModal,
//     showSubjectAlert,
//     saveSubject,
//     deleteSubject,
//     loadSubjectsTabEnhanced,
//     loadTopicsAdmin,
//     openAddTopicModal,
//     editTopic,
//     closeTopicModal,
//     saveTopic,
//     deleteTopic,
//     openAddSubtopicModal,
//     editSubtopic,
//     closeSubtopicModal,
//     saveSubtopic,
//     deleteSubtopic,
//     handleTopicCsvDrop,
//     handleTopicCsvFile,
//     clearTopicCsv,
//     populateTopicCsvQuizSelect,
//     uploadTopicCsv,
//     loadQbTopics,
//     loadQbSubtopics,
//     loadQbQuestions,
//     loadSubtopicSubjectSelect,
//   };
//   Object.entries(fns).forEach(([k, v]) => {
//     window[k] = v;
//   });
// }

const Admin = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [auth] = useAuth();

  useEffect(() => {
    document.title = "MedMinds | Admin Dashboard";
  }, []);

  // Early auth guard (mirrors original behavior)
  // useEffect(() => {
  //   try {
  //     const raw = localStorage.getItem("sb-dvxqkouoyqouwwuvfdui-auth-token");
  //     if (!raw) {
  //       window.location.href = "index.html";
  //       return;
  //     }
  //     const session = JSON.parse(raw);
  //     const user = session?.user ?? session?.session?.user;
  //     if (!user) {
  //       window.location.href = "index.html";
  //     }
  //   } catch (e) {
  //     window.location.href = "index.html";
  //   }
  // }, []);

  // Expose supabase as supabaseClient (script uses that name) and inject JSZip + admin script
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     window.supabaseClient = supabase;
  //   }

  //   // Load JSZip from CDN for .docx export
  //   let jszipScript;
  //   if (!window.JSZip) {
  //     jszipScript = document.createElement("script");
  //     jszipScript.src =
  //       "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
  //     jszipScript.async = false;
  //     document.head.appendChild(jszipScript);
  //   }

  //   // Attach all admin functions to window (mirrors the global-script pattern
  //   // used by the original admin.html, so inline-style onClick handlers work).
  //   attachAdminGlobals();

  //   // Drag-and-drop on CSV zone (from original DOMContentLoaded handler)
  //   setupCsvDragDrop();

  //   // Kick off the loader (replaces body onload="loadAdminDashboard()")
  //   loadAdminDashboard();
  // }, []);

  return (
    <AdminLayout title="Admin Dashboard - Medminds">
      <div className="medminds-admin-root">
        {/* External CDN: Font Awesome (from original <head>) */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />

        {/* ═══════ HEADER ═══════ */}
        {/* <header className="hdr">
        <div className="hdr-inner">
          <div className="hdr-brand">
            <div className="hdr-logo">🏥 MedMinds Admin</div>
            <div className="hdr-sub">Dashboard & Management</div>
          </div>
          <div className="hdr-right">
            <span id="adminEmail" className="hdr-email">
              Loading…
            </span>
            <button className="btn-logout" onClick={() => call("logout")}>
              Logout
            </button>
          </div>
        </div>
      </header> */}

        {/* ═══════ NAV TABS ═══════
      <nav className="tabs-nav" id="adminTabs">
        <button
          className="tab-btn active"
          data-tab="dashboard"
          onClick={() => call("switchTab", "dashboard")}
        >
          📊 Dashboard
        </button>
        <button
          className="tab-btn"
          data-tab="users"
          onClick={() => call("switchTab", "users")}
        >
          👥 Users
        </button>
        <button
          className="tab-btn"
          data-tab="quizzes"
          onClick={() => call("switchTab", "quizzes")}
        >
          📝 Quizzes
        </button>
        <button
          className="tab-btn"
          data-tab="batches"
          onClick={() => call("switchTab", "batches")}
        >
          🗂 Batches
        </button>
        <button
          className="tab-btn"
          data-tab="attempts"
          onClick={() => call("switchTab", "attempts")}
        >
          📋 Results
        </button>
        <button
          className="tab-btn"
          data-tab="leadership"
          onClick={() => call("switchTab", "leadership")}
        >
          🏆 Leaderboard
        </button>
        <button
          className="tab-btn"
          data-tab="statistics"
          onClick={() => call("switchTab", "statistics")}
        >
          📈 Statistics
        </button>
        <button
          className="tab-btn"
          data-tab="notifications"
          onClick={() => call("switchTab", "notifications")}
        >
          🔔 Notifications
        </button>
        <button
          className="tab-btn"
          data-tab="subjects"
          onClick={() => call("switchTab", "subjects")}
        >
          📚 Subjects
        </button>
        <button
          className="tab-btn"
          data-tab="profile"
          onClick={() => call("switchTab", "profile")}
        >
          👤 Profile
        </button>
        <button
          className="tab-btn tab-btn-enroll"
          onClick={() => {
            navigate("/enrollment-admin");
          }}
        >
          📋 Enrollments
        </button>
      </nav> */}

        {/* MAIN CONTENT */}

        <main className="main-wrap">
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

          {/* ══ USERS ══ */}
          <div id="users" className="tab-panel">
            <div className="sec-hdr">
              <h2 className="sec-title">👥 Manage Users</h2>
              <button
                className="btn btn-blue"
                onClick={() => call("toggleAddUserForm")}
              >
                + Add User
              </button>
            </div>
            <div
              id="addUserForm"
              className="form-box"
              style={{ display: "none" }}
            >
              <h3>➕ Add New User</h3>
              <form onSubmit={(e) => call("submitNewUser", e)}>
                <div className="form-row">
                  <div className="fg">
                    <label>First Name *</label>
                    <input
                      type="text"
                      id="newUserFirstName"
                      placeholder="First name"
                      required
                    />
                  </div>
                  <div className="fg">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      id="newUserLastName"
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="fg">
                    <label>Email *</label>
                    <input
                      type="email"
                      id="newUserEmail"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                  <div className="fg">
                    <label>WhatsApp Number *</label>
                    <input
                      type="tel"
                      id="newUserWhatsapp"
                      placeholder="+92 3XX XXXXXXX"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="fg">
                    <label>District *</label>
                    <input
                      type="text"
                      id="newUserDistrict"
                      placeholder="District"
                      required
                    />
                  </div>
                  <div className="fg">
                    <label>Password *</label>
                    <input
                      type="password"
                      id="newUserPassword"
                      placeholder="Min 6 characters"
                      required
                      minLength="6"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-gray"
                    onClick={() => call("toggleAddUserForm")}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-blue">
                    Create User
                  </button>
                </div>
              </form>
            </div>
            <div id="usersList"></div>
          </div>

          {/* ══ QUIZZES ══ */}
          <div id="quizzes" className="tab-panel">
            <div className="sec-hdr">
              <h2 className="sec-title">📝 Manage Quizzes</h2>
              <button
                className="btn btn-blue"
                onClick={() => call("toggleAddQuizForm")}
              >
                + Create Quiz
              </button>
            </div>

            {/* CREATE QUIZ FORM */}
            <div
              id="addQuizFormContainer"
              className="form-box"
              style={{ display: "none" }}
            >
              <h3>➕ Create New Quiz</h3>
              <form id="addQuizForm" onSubmit={(e) => call("submitNewQuiz", e)}>
                <div className="form-row">
                  <div className="fg">
                    <label>Quiz Name *</label>
                    <input
                      type="text"
                      id="quizName"
                      placeholder="e.g. Anatomy Week 3"
                      required
                    />
                  </div>
                  <div className="fg">
                    <label>Quiz Order *</label>
                    <input
                      type="number"
                      id="quizOrder"
                      placeholder="1"
                      min="1"
                      defaultValue="1"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="fg">
                    <label>Quiz Type *</label>
                    <select id="quizType" required defaultValue="">
                      <option value="">— Select Type —</option>
                      <option value="Chapter-wise">Chapter-wise</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Mock">Mock Test</option>
                      <option value="Full-length">Full-length</option>
                    </select>
                  </div>
                  <div className="fg">
                    <label>Syllabus *</label>
                    <select id="quizSyllabus" required defaultValue="">
                      <option value="">— Select Syllabus —</option>
                      <option value="Biology">Biology</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="English">English</option>
                      <option value="Logical Reasoning">
                        Logical Reasoning
                      </option>
                      <option value="Biology + Chemistry">
                        Biology + Chemistry
                      </option>
                      <option value="Physics + Chemistry">
                        Physics + Chemistry
                      </option>
                      <option value="Full Syllabus">
                        Full Syllabus (All Subjects)
                      </option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="fg">
                    <label>
                      Assign to Batches
                      <span
                        style={{
                          fontWeight: 400,
                          fontSize: "11px",
                          color: "var(--muted)",
                          textTransform: "none",
                          letterSpacing: 0,
                        }}
                      >
                        &nbsp;(tick one or more — leave all unticked for all
                        students)
                      </span>
                    </label>
                    <div
                      id="quizBatchCheckboxes"
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        padding: "10px 12px",
                        border: "1.5px solid #e5e7eb",
                        borderRadius: "8px",
                        minHeight: "44px",
                        background: "#fafafa",
                      }}
                    >
                      <span style={{ color: "var(--muted)", fontSize: "13px" }}>
                        Loading batches…
                      </span>
                    </div>
                  </div>
                  <div className="fg">
                    <label>Schedule Date</label>
                    <input type="datetime-local" id="scheduledDate" />
                  </div>
                </div>

                <div className="fg">
                  <label>Description</label>
                  <textarea
                    id="quizDescription"
                    placeholder="Short description (optional)"
                  ></textarea>
                </div>

                {/* CSV UPLOAD */}
                <div className="csv-zone">
                  <div className="csv-zone-header">
                    <span className="csv-zone-label">
                      📂 Upload Questions via CSV
                    </span>
                    <button
                      type="button"
                      className="btn btn-gray btn-sm"
                      onClick={() => call("downloadCSVTemplate")}
                    >
                      ⬇ Download Template
                    </button>
                  </div>

                  <div
                    className="csv-drop-area"
                    onClick={() =>
                      document.getElementById("csvFileInput").click()
                    }
                  >
                    <input
                      type="file"
                      id="csvFileInput"
                      className="csv-file-input"
                      accept=".csv"
                      onChange={(e) => call("handleCsvPreview", e)}
                    />
                    <div className="csv-drop-icon">📄</div>
                    <div className="csv-drop-text">
                      <strong>Click to browse</strong> or drag & drop a CSV file
                    </div>
                    <div className="csv-hint">
                      Columns required: question, option_a, option_b, option_c,
                      option_d, correct_answer, explanation (optional)
                    </div>
                  </div>

                  <div id="csvPreview" className="csv-preview">
                    <div className="csv-preview-icon">✅</div>
                    <div className="csv-preview-info">
                      <div id="csvCount" className="csv-count">
                        0 questions
                      </div>
                      <div id="csvFileName" className="csv-fname"></div>
                    </div>
                    <button
                      type="button"
                      className="csv-clear"
                      onClick={() => call("clearCsvUpload")}
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>

                  <div id="csvProgress" className="csv-progress">
                    <div className="progress-track">
                      <div id="csvProgressBar" className="progress-fill"></div>
                    </div>
                    <div id="csvProgressLabel" className="progress-label">
                      Uploading questions…
                    </div>
                  </div>

                  <div
                    id="subjectRangeSection"
                    className="subject-range-section"
                  >
                    <div className="subject-range-title">
                      🧪 Define Subject Ranges (optional)
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--muted)",
                        marginBottom: "12px",
                      }}
                    >
                      Select subjects included in this quiz, then define which
                      question numbers belong to each subject.
                    </p>
                    <div className="subject-checkboxes" id="subjectCheckboxes">
                      <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                        Loading subjects…
                      </span>
                    </div>
                    <div className="subject-rows" id="subjectRows"></div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-gray"
                    onClick={() => call("toggleAddQuizForm")}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="createQuizBtn"
                    className="btn btn-blue"
                  >
                    Create Quiz
                  </button>
                </div>
              </form>
            </div>

            <div id="quizzesList"></div>

            <div className="card" style={{ marginTop: "28px" }}>
              <div className="card-hdr">
                <span className="card-title">🔍 View Questions by Quiz</span>
              </div>
              <div className="card-body">
                <div className="fg">
                  <label>Select Quiz</label>
                  <select
                    id="quizForQuestions"
                    onChange={() => call("loadQuestionsForQuiz")}
                    style={{ maxWidth: "400px" }}
                    defaultValue=""
                  >
                    <option value="">— Select a quiz —</option>
                  </select>
                </div>
                <div
                  id="questionsListForQuiz"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <div className="no-data">
                    Select a quiz to view its questions
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══ BATCHES ══ */}
          <div id="batches" className="tab-panel">
            <div className="sec-hdr">
              <h2 className="sec-title">🗂 Batch Management</h2>
              <button
                className="btn btn-blue"
                onClick={() => call("toggleAddBatchForm")}
              >
                + Create Batch
              </button>
            </div>
            <div
              id="addBatchForm"
              className="form-box"
              style={{ display: "none" }}
            >
              <h3>➕ Create New Batch</h3>
              <form onSubmit={(e) => call("submitNewBatch", e)}>
                <div className="form-row">
                  <div className="fg">
                    <label>Batch Name *</label>
                    <input
                      type="text"
                      id="batchName"
                      placeholder="e.g. MDCAT 2026 Batch A"
                      required
                    />
                  </div>
                  <div className="fg">
                    <label>Academic Year *</label>
                    <input
                      type="text"
                      id="batchAcademicYear"
                      placeholder="2025-2026"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="fg">
                    <label>Start Date</label>
                    <input type="date" id="batchStartDate" />
                  </div>
                  <div className="fg">
                    <label>End Date</label>
                    <input type="date" id="batchEndDate" />
                  </div>
                </div>
                <div className="fg">
                  <label>Description</label>
                  <textarea
                    id="batchDescription"
                    placeholder="Brief description"
                  ></textarea>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-gray"
                    onClick={() => call("toggleAddBatchForm")}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-blue">
                    Create Batch
                  </button>
                </div>
              </form>
            </div>
            <div id="batchesList"></div>

            <div className="sec-hdr" style={{ marginTop: "32px" }}>
              <h2 className="sec-title">📅 Batch Test Schedule</h2>
            </div>
            <div className="form-box" style={{ marginBottom: 0 }}>
              <h3>📂 Upload Schedule via CSV</h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--muted)",
                  margin: "8px 0 18px",
                }}
              >
                Upload a CSV with columns:{" "}
                <strong>test_no, date, day, subject, chapter</strong>. This will
                replace the existing schedule for the selected batch.
              </p>
              <div className="form-row">
                <div className="fg">
                  <label>Select Batch *</label>
                  <select id="scheduleBatchSelect" defaultValue="">
                    <option value="">— Choose a batch —</option>
                  </select>
                </div>
              </div>
              <div
                id="scheduleDropZone"
                style={{
                  border: "2px dashed var(--border)",
                  borderRadius: "10px",
                  padding: "28px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                  marginBottom: "14px",
                }}
                onClick={() =>
                  document.getElementById("scheduleCsvInput").click()
                }
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = "var(--blue)";
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
                onDrop={(e) => call("handleScheduleDrop", e)}
              >
                <input
                  type="file"
                  id="scheduleCsvInput"
                  accept=".csv"
                  style={{ display: "none" }}
                  onChange={(e) => call("handleSchedulePreview", e)}
                />
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📄</div>
                <div style={{ fontSize: "13px", color: "var(--muted)" }}>
                  <strong style={{ color: "var(--blue)" }}>
                    Click to browse
                  </strong>{" "}
                  or drag &amp; drop a CSV file
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    marginTop: "6px",
                  }}
                >
                  Columns: test_no · date · day · subject · chapter
                </div>
              </div>
              <div
                id="schedulePreviewInfo"
                style={{
                  display: "none",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  marginBottom: "14px",
                  alignItems: "center",
                  gap: "12px",
                  flexDirection: "row",
                }}
              >
                <span style={{ fontSize: "20px" }}>✅</span>
                <div style={{ flex: 1 }}>
                  <div
                    id="scheduleRowCount"
                    style={{
                      fontSize: "15px",
                      fontWeight: 800,
                      color: "var(--green)",
                    }}
                  >
                    0 rows
                  </div>
                  <div
                    id="scheduleCsvName"
                    style={{ fontSize: "11px", color: "var(--muted)" }}
                  ></div>
                </div>
                <button
                  onClick={() => call("clearScheduleCsv")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9ca3af",
                    fontSize: "20px",
                    padding: "2px",
                  }}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  className="btn btn-gray btn-sm"
                  onClick={() => call("downloadScheduleTemplate")}
                >
                  ⬇ Download Template
                </button>
                <button
                  id="scheduleUploadBtn"
                  className="btn btn-blue"
                  onClick={() => call("uploadSchedule")}
                  disabled
                >
                  ⬆ Upload Schedule
                </button>
                <span
                  id="scheduleUploadStatus"
                  style={{ fontSize: "12px", color: "var(--muted)" }}
                ></span>
              </div>
              <div
                id="schedulePreviewTable"
                style={{
                  marginTop: "18px",
                  display: "none",
                  overflowX: "auto",
                  maxHeight: "300px",
                }}
              ></div>
            </div>
          </div>

          {/* ══ RESULTS / ATTEMPTS ══ */}
          <div id="attempts" className="tab-panel">
            <h2 className="sec-title" style={{ marginBottom: "20px" }}>
              📋 Quiz Attempts & Results
            </h2>

            <div className="pub-panel">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <div className="pub-panel-title">
                    🚀 Publish Results by Quiz
                  </div>
                  <div className="pub-panel-sub">
                    One click publishes all attempts for a quiz
                  </div>
                </div>
                <button
                  className="btn btn-gray btn-sm"
                  onClick={() => call("loadPublishQuizPanel")}
                >
                  🔄 Refresh
                </button>
              </div>
              <div id="publishQuizCards" className="pub-cards">
                <div className="shimmer"></div>
                <div className="shimmer"></div>
                <div className="shimmer"></div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              <strong style={{ fontSize: "15px" }}>📊 All Attempts</strong>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <div className="filter-row" style={{ margin: 0 }}>
                  <select
                    id="filterByQuiz"
                    onChange={() => call("filterAttemptsTable")}
                    defaultValue=""
                  >
                    <option value="">All Quizzes</option>
                  </select>
                  <select
                    id="filterByStatus"
                    onChange={() => call("filterAttemptsTable")}
                    defaultValue=""
                  >
                    <option value="">All Status</option>
                    <option value="published">Published</option>
                    <option value="unpublished">Unpublished</option>
                  </select>
                </div>
                <button
                  className="btn btn-green btn-sm"
                  onClick={() => call("exportResultsCSV")}
                  title="Download current filtered view as CSV"
                >
                  📥 Export CSV
                </button>
              </div>
            </div>
            <div className="card">
              <div className="tbl-wrap">
                <div id="attemptsTable"></div>
              </div>
            </div>
          </div>

          {/* ══ LEADERBOARD ══ */}
          <div id="leadership" className="tab-panel">
            <div className="sec-hdr">
              <h2 className="sec-title">🏆 Leaderboard</h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <label style={{ fontSize: "13px", fontWeight: 600 }}>
                  Batch:
                </label>
                <select
                  id="leaderboardBatchFilter"
                  onChange={() => call("loadLeaderboard")}
                  style={{
                    padding: "8px 12px",
                    border: "1.5px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "13px",
                    background: "#fff",
                  }}
                  defaultValue=""
                >
                  <option value="">All Batches</option>
                </select>
              </div>
            </div>
            <div className="card">
              <div className="tbl-wrap">
                <div id="leaderboardContent"></div>
              </div>
            </div>
          </div>

          {/* ══ STATISTICS ══ */}
          <div id="statistics" className="tab-panel">
            <h2 className="sec-title" style={{ marginBottom: "20px" }}>
              📈 System Statistics
            </h2>
            <div className="card" style={{ marginBottom: "20px" }}>
              <div className="card-hdr">
                <span className="card-title">👥 Users</span>
              </div>
              <div className="card-body">
                <div className="stats-grid">
                  <div className="stat-box">
                    <div className="stat-label">Total Users</div>
                    <div id="statTotalUsers" className="stat-num">
                      0
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Active (7d)</div>
                    <div id="statActiveUsers" className="stat-num">
                      0
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Avg Score</div>
                    <div id="statAvgScore" className="stat-num">
                      0%
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Completion Rate</div>
                    <div id="statCompletionRate" className="stat-num">
                      0%
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-hdr">
                <span className="card-title">📚 Question Bank</span>
              </div>
              <div className="card-body">
                <div className="stats-grid">
                  <div className="stat-box">
                    <div className="stat-label">Total Questions</div>
                    <div id="statTotalQuestions" className="stat-num">
                      0
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Active Quizzes</div>
                    <div id="statActiveQuizzes" className="stat-num">
                      0
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Qs per Quiz</div>
                    <div id="statQuestionsPerQuiz" className="stat-num">
                      0
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Total Attempts</div>
                    <div id="statTotalAttempts" className="stat-num">
                      0
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══ NOTIFICATIONS ══ */}
          <div id="notifications" className="tab-panel">
            <div className="sec-hdr">
              <h2 className="sec-title">🔔 Notifications</h2>
              <button
                className="btn btn-blue"
                onClick={() => call("toggleNotificationForm")}
              >
                + New Notification
              </button>
            </div>
            <div
              id="notificationForm"
              className="form-box"
              style={{ display: "none" }}
            >
              <h3>📢 Send Update to Students</h3>
              <form onSubmit={(e) => call("sendBulkNotification", e)}>
                <div className="form-row">
                  <div className="fg">
                    <label>Recipients *</label>
                    <select
                      id="recipientType"
                      onChange={() => call("updateRecipientOptions")}
                      required
                      defaultValue=""
                    >
                      <option value="">— Choose —</option>
                      <option value="all">All Students</option>
                      <option value="batch">Specific Batch</option>
                    </select>
                  </div>
                  <div
                    className="fg"
                    id="batchSelectorWrap"
                    style={{ display: "none" }}
                  >
                    <label>Batch *</label>
                    <select id="notificationBatch" defaultValue="">
                      <option value="">— Choose Batch —</option>
                    </select>
                  </div>
                </div>
                <div className="fg">
                  <label>Subject *</label>
                  <input
                    type="text"
                    id="notificationSubject"
                    placeholder="e.g. New Quiz Available"
                    required
                  />
                </div>
                <div className="fg">
                  <label>Message *</label>
                  <textarea
                    id="notificationMessage"
                    placeholder="Enter message…"
                    required
                    style={{ minHeight: "120px" }}
                  ></textarea>
                </div>
                <div className="fg">
                  <label>
                    <input
                      type="checkbox"
                      id="scheduleNotification"
                      onChange={() => call("toggleScheduleTime")}
                    />{" "}
                    Schedule for later
                  </label>
                  <input
                    type="datetime-local"
                    id="notificationScheduleTime"
                    style={{ display: "none", marginTop: "8px" }}
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-gray"
                    onClick={() => call("toggleNotificationForm")}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-blue">
                    Send Notification
                  </button>
                </div>
              </form>
            </div>
            <div id="notificationHistory"></div>
          </div>

          {/* ══ PROFILE ══ */}
          <div id="profile" className="tab-panel">
            <h2 className="sec-title" style={{ marginBottom: "20px" }}>
              👤 Admin Profile
            </h2>
            <div className="card" style={{ marginBottom: "20px" }}>
              <div className="card-hdr">
                <span className="card-title">Account Information</span>
              </div>
              <div className="card-body">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
                    gap: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <div>
                    <div className="stat-label">Email</div>
                    <div
                      id="profileEmail"
                      style={{
                        fontWeight: 700,
                        fontSize: "14px",
                        wordBreak: "break-all",
                      }}
                    >
                      —
                    </div>
                  </div>
                  <div>
                    <div className="stat-label">Role</div>
                    <div style={{ fontWeight: 700, fontSize: "14px" }}>
                      System Administrator
                    </div>
                  </div>
                  <div>
                    <div className="stat-label">Last Login</div>
                    <div
                      id="profileLastLogin"
                      style={{ fontWeight: 700, fontSize: "14px" }}
                    >
                      —
                    </div>
                  </div>
                  <div>
                    <div className="stat-label">Status</div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "14px",
                        color: "#16a34a",
                      }}
                    >
                      ✅ Active
                    </div>
                  </div>
                </div>
                <div className="stats-grid">
                  <div className="stat-box">
                    <div className="stat-label">Quizzes Created</div>
                    <div id="profileQuizzesCreated" className="stat-num">
                      0
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Users Managed</div>
                    <div id="profileUsersManaged" className="stat-num">
                      0
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Notifications</div>
                    <div id="profileNotificationsSent" className="stat-num">
                      0
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Batches</div>
                    <div id="profileBatchCount" className="stat-num">
                      0
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-hdr">
                <span className="card-title">🔒 Security</span>
              </div>
              <div
                className="card-body"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <button className="btn btn-gray" style={{ maxWidth: "300px" }}>
                  Change Password
                </button>
                <button className="btn btn-gray" style={{ maxWidth: "300px" }}>
                  Enable 2-Factor Auth
                </button>
                <button className="btn btn-gray" style={{ maxWidth: "300px" }}>
                  View Login History
                </button>
              </div>
            </div>
          </div>

          {/* ══ SUBJECTS ══ */}
          <div id="subjects" className="tab-panel">
            <div className="sec-hdr">
              <h2 className="sec-title">📚 Subjects</h2>
              <button
                className="btn btn-blue btn-sm"
                onClick={() => call("openAddSubjectModal")}
              >
                ＋ Add Subject
              </button>
            </div>

            <div
              className="stats-grid"
              style={{ marginBottom: "20px" }}
              id="subjectStatsGrid"
            >
              <div className="stat-box">
                <div className="stat-label">Total Subjects</div>
                <div id="subjTotalCount" className="stat-num">
                  —
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Total Questions Tagged</div>
                <div id="subjTotalTagged" className="stat-num">
                  —
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Untagged Questions</div>
                <div id="subjUntagged" className="stat-num">
                  —
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
                gap: "14px",
                marginBottom: "24px",
              }}
              id="subjectStatsCards"
            ></div>

            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "24px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontFamily: "'Merriweather',serif",
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "var(--text)",
                    }}
                  >
                    📖 Topics & Subtopics Manager
                  </h3>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--muted)",
                      marginTop: "3px",
                    }}
                  >
                    Manage topics and subtopics for each subject
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <select
                    id="topicSubjectFilter"
                    onChange={() => call("loadTopicsAdmin")}
                    style={{
                      padding: "8px 12px",
                      border: "1.5px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "13px",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                    defaultValue=""
                  >
                    <option value="">All Subjects</option>
                  </select>
                  <button
                    onClick={() => call("openAddTopicModal")}
                    style={{
                      background: "var(--blue-main)",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    + Add Topic
                  </button>
                </div>
              </div>

              <div id="topicsAdminList">
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "var(--muted)",
                  }}
                >
                  Loading topics…
                </div>
              </div>
            </div>

            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "24px",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Merriweather',serif",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: "6px",
                }}
              >
                📥 Upload Questions with Topics/Subtopics
              </h3>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--muted)",
                  marginBottom: "16px",
                }}
              >
                CSV columns:{" "}
                <strong>
                  question, option_a, option_b, option_c, option_d,
                  correct_answer, explanation, subject, topic, subtopic
                </strong>
              </p>

              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--text)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Assign to Quiz (optional)
                </label>
                <select
                  id="topicCsvQuizId"
                  style={{
                    width: "100%",
                    maxWidth: "340px",
                    padding: "9px 12px",
                    border: "1.5px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "13px",
                    background: "var(--bg)",
                    color: "var(--text)",
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                  defaultValue=""
                >
                  <option value="">— No quiz (question bank only) —</option>
                </select>
              </div>

              <div
                id="topicCsvDropzone"
                style={{
                  border: "2px dashed var(--border)",
                  borderRadius: "10px",
                  padding: "28px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "border-color .2s",
                  background: "var(--bg)",
                }}
                onClick={() => document.getElementById("topicCsvInput").click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = "var(--blue-main)";
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
                onDrop={(e) => call("handleTopicCsvDrop", e)}
              >
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>📄</div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  Drop CSV here or click to browse
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--muted)",
                    marginTop: "4px",
                  }}
                >
                  Columns: question · option_a–d · correct_answer · explanation
                  · subject · topic · subtopic
                </div>
              </div>
              <input
                type="file"
                id="topicCsvInput"
                accept=".csv"
                style={{ display: "none" }}
                onChange={(e) => call("handleTopicCsvFile", e.target.files[0])}
              />

              <div
                id="topicCsvPreview"
                style={{ display: "none", marginTop: "14px" }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: "8px",
                  }}
                  id="topicCsvInfo"
                ></div>
                <div
                  id="topicCsvTable"
                  style={{
                    overflowX: "auto",
                    maxHeight: "240px",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                ></div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() => call("uploadTopicCsv")}
                    id="uploadTopicCsvBtn"
                    style={{
                      background: "var(--green)",
                      color: "white",
                      border: "none",
                      padding: "9px 20px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    ⬆️ Upload Questions
                  </button>
                  <button
                    onClick={() => call("clearTopicCsv")}
                    style={{
                      background: "var(--bg)",
                      color: "var(--muted)",
                      border: "1.5px solid var(--border)",
                      padding: "9px 16px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    Clear
                  </button>
                </div>
                <div
                  id="topicCsvStatus"
                  style={{
                    marginTop: "10px",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                ></div>
              </div>
            </div>

            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontFamily: "'Merriweather',serif",
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "var(--text)",
                    }}
                  >
                    🔍 Question Bank Browser
                  </h3>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--muted)",
                      marginTop: "3px",
                    }}
                  >
                    Browse questions by subject, topic, and subtopic
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <select
                    id="qbSubject"
                    onChange={() => call("loadQbTopics")}
                    style={{
                      padding: "7px 10px",
                      border: "1.5px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                    defaultValue=""
                  >
                    <option value="">All Subjects</option>
                  </select>
                  <select
                    id="qbTopic"
                    onChange={() => call("loadQbSubtopics")}
                    style={{
                      padding: "7px 10px",
                      border: "1.5px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                    defaultValue=""
                  >
                    <option value="">All Topics</option>
                  </select>
                  <select
                    id="qbSubtopic"
                    onChange={() => call("loadQbQuestions")}
                    style={{
                      padding: "7px 10px",
                      border: "1.5px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                    defaultValue=""
                  >
                    <option value="">All Subtopics</option>
                  </select>
                  <button
                    onClick={() => call("loadQbQuestions")}
                    style={{
                      background: "var(--blue-main)",
                      color: "white",
                      border: "none",
                      padding: "7px 14px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    Browse
                  </button>
                </div>
              </div>

              <div
                id="qbStats"
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginBottom: "14px",
                }}
              ></div>
              <div
                id="qbResults"
                style={{ fontSize: "13px", color: "var(--muted)" }}
              >
                Select filters above to browse questions.
              </div>
            </div>

            {/* TOPIC MODAL */}
            <div
              id="topicModal"
              style={{
                display: "none",
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.5)",
                zIndex: 1000,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  background: "var(--card)",
                  borderRadius: "var(--radius)",
                  padding: "28px",
                  width: "100%",
                  maxWidth: "440px",
                  margin: "20px",
                  boxShadow: "0 20px 60px rgba(0,0,0,.2)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Merriweather',serif",
                      fontSize: "16px",
                      fontWeight: 700,
                    }}
                    id="topicModalTitle"
                  >
                    Add Topic
                  </h3>
                  <button
                    onClick={() => call("closeTopicModal")}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "20px",
                      cursor: "pointer",
                      color: "var(--muted)",
                    }}
                  >
                    ✕
                  </button>
                </div>
                <input type="hidden" id="topicEditId" />
                <div style={{ marginBottom: "14px" }}>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: ".5px",
                    }}
                  >
                    Subject *
                  </label>
                  <select
                    id="topicSubject"
                    style={{
                      width: "100%",
                      marginTop: "5px",
                      padding: "9px 12px",
                      border: "1.5px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "13px",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                    onChange={() => call("loadSubtopicSubjectSelect")}
                    defaultValue=""
                  >
                    <option value="">Select subject…</option>
                  </select>
                </div>
                <div style={{ marginBottom: "14px" }}>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: ".5px",
                    }}
                  >
                    Topic Name *
                  </label>
                  <input
                    type="text"
                    id="topicName"
                    placeholder="e.g. Bioenergetics"
                    style={{
                      width: "100%",
                      marginTop: "5px",
                      padding: "9px 12px",
                      border: "1.5px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "13px",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  />
                </div>
                <div
                  id="topicModalAlert"
                  style={{
                    display: "none",
                    background: "var(--red-bg)",
                    color: "var(--red)",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    marginBottom: "12px",
                  }}
                ></div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => call("closeTopicModal")}
                    style={{
                      background: "var(--bg)",
                      color: "var(--muted)",
                      border: "1.5px solid var(--border)",
                      padding: "9px 18px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    id="saveTopicBtn"
                    onClick={() => call("saveTopic")}
                    style={{
                      background: "var(--blue-main)",
                      color: "white",
                      border: "none",
                      padding: "9px 20px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    Save Topic
                  </button>
                </div>
              </div>
            </div>

            {/* SUBTOPIC MODAL */}
            <div
              id="subtopicModal"
              style={{
                display: "none",
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.5)",
                zIndex: 1000,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  background: "var(--card)",
                  borderRadius: "var(--radius)",
                  padding: "28px",
                  width: "100%",
                  maxWidth: "440px",
                  margin: "20px",
                  boxShadow: "0 20px 60px rgba(0,0,0,.2)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Merriweather',serif",
                      fontSize: "16px",
                      fontWeight: 700,
                    }}
                    id="subtopicModalTitle"
                  >
                    Add Subtopic
                  </h3>
                  <button
                    onClick={() => call("closeSubtopicModal")}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "20px",
                      cursor: "pointer",
                      color: "var(--muted)",
                    }}
                  >
                    ✕
                  </button>
                </div>
                <input type="hidden" id="subtopicEditId" />
                <div style={{ marginBottom: "14px" }}>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: ".5px",
                    }}
                  >
                    Topic *
                  </label>
                  <select
                    id="subtopicTopic"
                    style={{
                      width: "100%",
                      marginTop: "5px",
                      padding: "9px 12px",
                      border: "1.5px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "13px",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                    defaultValue=""
                  >
                    <option value="">Select topic…</option>
                  </select>
                </div>
                <div style={{ marginBottom: "14px" }}>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: ".5px",
                    }}
                  >
                    Subtopic Name *
                  </label>
                  <input
                    type="text"
                    id="subtopicName"
                    placeholder="e.g. Krebs Cycle"
                    style={{
                      width: "100%",
                      marginTop: "5px",
                      padding: "9px 12px",
                      border: "1.5px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "13px",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  />
                </div>
                <div
                  id="subtopicModalAlert"
                  style={{
                    display: "none",
                    background: "var(--red-bg)",
                    color: "var(--red)",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    marginBottom: "12px",
                  }}
                ></div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => call("closeSubtopicModal")}
                    style={{
                      background: "var(--bg)",
                      color: "var(--muted)",
                      border: "1.5px solid var(--border)",
                      padding: "9px 18px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    id="saveSubtopicBtn"
                    onClick={() => call("saveSubtopic")}
                    style={{
                      background: "var(--blue-main)",
                      color: "white",
                      border: "none",
                      padding: "9px 20px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    Save Subtopic
                  </button>
                </div>
              </div>
            </div>

            {/* Subject Table */}
            <div className="card">
              <div className="card-hdr">
                <span className="card-title">📋 Subject List</span>
                <button
                  className="btn btn-gray btn-sm"
                  onClick={() => call("loadSubjectsTab")}
                >
                  🔄 Refresh
                </button>
              </div>
              <div className="card-body">
                <div className="tbl-wrap">
                  <table className="tbl" id="subjectsTable">
                    <thead>
                      <tr>
                        <th style={{ width: "50px" }}>#</th>
                        <th>Subject Name</th>
                        <th style={{ textAlign: "center" }}>Total Questions</th>
                        <th style={{ textAlign: "center" }}>Color</th>
                        <th style={{ textAlign: "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody id="subjectsTbody">
                      <tr>
                        <td
                          colSpan="5"
                          style={{
                            textAlign: "center",
                            color: "var(--muted)",
                            padding: "32px",
                          }}
                        >
                          Loading…
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* QUIZ SUMMARY MODAL */}
        <div
          id="quizSummaryModal"
          className="modal"
          onClick={(e) => call("handleSummaryOverlayClick", e)}
        >
          <div className="modal-box">
            <div className="qs-header">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <div>
                  <h2 id="qsSummaryTitle">Quiz Summary</h2>
                  <p id="qsSummarySubtitle">Loading…</p>
                </div>
                <button
                  className="modal-close"
                  onClick={() => call("closeQuizSummary")}
                  style={{
                    color: "rgba(255,255,255,.8)",
                    fontSize: "28px",
                    marginTop: "-4px",
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            <div className="qs-stats-row">
              <div className="qs-stat">
                <div className="qs-stat-num" id="qsStatQuestions">
                  —
                </div>
                <div className="qs-stat-label">Questions</div>
              </div>
              <div className="qs-stat">
                <div className="qs-stat-num" id="qsStatAttempts">
                  —
                </div>
                <div className="qs-stat-label">Attempts</div>
              </div>
              <div className="qs-stat">
                <div className="qs-stat-num" id="qsStatAvg">
                  —
                </div>
                <div className="qs-stat-label">Avg Score</div>
              </div>
              <div className="qs-stat">
                <div className="qs-stat-num" id="qsStatTop">
                  —
                </div>
                <div className="qs-stat-label">Top Score</div>
              </div>
            </div>
            <div className="qs-body" id="qsSummaryBody">
              <div className="qs-loading">⏳ Loading questions…</div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-gray"
                onClick={() => call("closeQuizSummary")}
              >
                Close
              </button>
              <button
                className="btn btn-sm"
                style={{ background: "#5c6bc0", color: "#fff" }}
                id="qsExportBtn"
              >
                📄 Export .docx
              </button>
            </div>
          </div>
        </div>

        {/* Subject Modal */}
        <div id="subjectModal" className="modal">
          <div className="modal-box" style={{ maxWidth: "460px" }}>
            <div className="modal-hdr">
              <span className="modal-title" id="subjectModalTitle">
                ＋ Add Subject
              </span>
              <button
                className="modal-close"
                onClick={() => call("closeSubjectModal")}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <input type="hidden" id="subjectEditId" />
              <div className="fg" style={{ marginBottom: "16px" }}>
                <label>Subject Name *</label>
                <input
                  type="text"
                  id="subjectNameInput"
                  placeholder="e.g. Biology"
                  maxLength="60"
                  required
                />
              </div>
              <div className="fg" style={{ marginBottom: "16px" }}>
                <label>Icon (emoji)</label>
                <input
                  type="text"
                  id="subjectIconInput"
                  placeholder="e.g. 🧬"
                  maxLength="4"
                />
              </div>
              <div className="fg" style={{ marginBottom: "20px" }}>
                <label>Color</label>
                <input
                  type="color"
                  id="subjectColorInput"
                  defaultValue="#16a34a"
                  style={{
                    width: "60px",
                    height: "36px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
              </div>
              <div
                id="subjectModalAlert"
                style={{
                  display: "none",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  marginBottom: "14px",
                }}
              ></div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  className="btn btn-gray"
                  onClick={() => call("closeSubjectModal")}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-blue"
                  id="saveSubjectBtn"
                  onClick={() => call("saveSubject")}
                >
                  Save Subject
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Quiz Modal */}
        <div id="editQuizModal" className="modal">
          <div className="modal-box" style={{ maxWidth: "740px" }}>
            <div className="modal-hdr">
              <span className="modal-title">✏️ Edit Quiz</span>
              <button
                className="modal-close"
                onClick={() => call("closeEditQuizModal")}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form
                id="editQuizForm"
                onSubmit={(e) => call("submitEditQuiz", e)}
                style={{ marginBottom: "24px" }}
              >
                <div className="form-row">
                  <div className="fg">
                    <label>Quiz Name *</label>
                    <input type="text" id="editQuizName" required />
                  </div>
                  <div className="fg">
                    <label>Quiz Order *</label>
                    <input type="number" id="editQuizOrder" min="1" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="fg">
                    <label>Type *</label>
                    <select id="editQuizType" required defaultValue="">
                      <option value="">— Select —</option>
                      <option value="Chapter-wise">Chapter-wise</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Mock">Mock Test</option>
                      <option value="Full-length">Full-length</option>
                    </select>
                  </div>
                  <div className="fg">
                    <label>Syllabus *</label>
                    <select id="editQuizSyllabus" required defaultValue="">
                      <option value="">— Select —</option>
                      <option value="Biology">Biology</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="English">English</option>
                      <option value="Logical Reasoning">
                        Logical Reasoning
                      </option>
                      <option value="Biology + Chemistry">
                        Biology + Chemistry
                      </option>
                      <option value="Physics + Chemistry">
                        Physics + Chemistry
                      </option>
                      <option value="Full Syllabus">Full Syllabus</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="fg">
                    <label>
                      Assign to Batches
                      <span
                        style={{
                          fontWeight: 400,
                          fontSize: "11px",
                          color: "var(--muted)",
                          textTransform: "none",
                          letterSpacing: 0,
                        }}
                      >
                        &nbsp;(tick one or more — leave all unticked for all
                        students)
                      </span>
                    </label>
                    <div
                      id="editQuizBatchCheckboxes"
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        padding: "10px 12px",
                        border: "1.5px solid #e5e7eb",
                        borderRadius: "8px",
                        minHeight: "44px",
                        background: "#fafafa",
                      }}
                    >
                      <span style={{ color: "var(--muted)", fontSize: "13px" }}>
                        Loading batches…
                      </span>
                    </div>
                  </div>
                  <div className="fg">
                    <label>Description</label>
                    <input
                      type="text"
                      id="editQuizDescription"
                      placeholder="Short description"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-gray"
                    onClick={() => call("closeEditQuizModal")}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-blue">
                    Update Quiz
                  </button>
                </div>
              </form>

              <div
                style={{ borderTop: "2px solid #f0f0f0", paddingTop: "22px" }}
              >
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    marginBottom: "14px",
                  }}
                >
                  Manage Questions
                </h3>

                <div
                  style={{
                    background: "#fff8f0",
                    border: "1.5px solid #fbbf24",
                    borderRadius: "8px",
                    padding: "14px",
                    marginBottom: "14px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      marginBottom: "10px",
                      color: "#92400e",
                    }}
                  >
                    ♻️ Reuse Questions from Another Quiz
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                      alignItems: "flex-end",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: "180px" }}>
                      <label
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#6b7280",
                          display: "block",
                          marginBottom: "5px",
                          textTransform: "uppercase",
                          letterSpacing: ".4px",
                        }}
                      >
                        Source Quiz
                      </label>
                      <select
                        id="copyFromQuizSelect"
                        style={{
                          width: "100%",
                          padding: "9px 10px",
                          border: "1.5px solid #e5e7eb",
                          borderRadius: "7px",
                          fontFamily: "inherit",
                          fontSize: "13px",
                        }}
                        defaultValue=""
                      >
                        <option value="">— Pick a quiz to copy from —</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{
                        background: "#d97706",
                        color: "#fff",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                      onClick={(e) =>
                        call("copyQuestionsFromQuiz", e.currentTarget)
                      }
                    >
                      📋 Copy All Questions
                    </button>
                  </div>
                  <div
                    id="copyQuizMsg"
                    style={{
                      marginTop: "8px",
                      fontSize: "12px",
                      display: "none",
                    }}
                  ></div>
                </div>

                <div
                  style={{
                    background: "#f8fbff",
                    padding: "16px",
                    borderRadius: "8px",
                    marginBottom: "14px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      marginBottom: "12px",
                    }}
                  >
                    ➕ Add Question Manually
                  </h4>
                  <form
                    onSubmit={(e) => call("submitQuestionToQuiz", e)}
                    style={{ display: "grid", gap: "10px" }}
                  >
                    <textarea
                      id="editQuestionText"
                      placeholder="Question text"
                      required
                      style={{
                        padding: "10px",
                        border: "1.5px solid #e5e7eb",
                        borderRadius: "8px",
                        minHeight: "60px",
                        fontFamily: "inherit",
                        resize: "vertical",
                      }}
                    ></textarea>

                    <div
                      style={{
                        border: "1.5px dashed #bfdbfe",
                        borderRadius: "8px",
                        padding: "12px",
                        background: "#f0f7ff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#1d4ed8",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            background: "#dbeafe",
                            border: "1px solid #93c5fd",
                            borderRadius: "6px",
                            padding: "6px 12px",
                          }}
                        >
                          🖼️ Attach Image (optional)
                          <input
                            type="file"
                            id="editQuestionImage"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) =>
                              call("previewQuestionImage", e.currentTarget)
                            }
                          />
                        </label>
                        <span
                          id="editImageStatus"
                          style={{ fontSize: "11px", color: "#6b7280" }}
                        ></span>
                        <button
                          type="button"
                          id="editImageClearBtn"
                          onClick={() => call("clearQuestionImage")}
                          style={{
                            display: "none",
                            fontSize: "11px",
                            color: "#dc2626",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          ✕ Remove
                        </button>
                      </div>
                      <div
                        id="editImagePreview"
                        style={{ display: "none", marginTop: "10px" }}
                      >
                        <img
                          id="editImagePreviewImg"
                          src=""
                          alt="preview"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "160px",
                            borderRadius: "6px",
                            border: "1px solid #bfdbfe",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    </div>
                    <input
                      type="hidden"
                      id="editQuestionImageUrl"
                      defaultValue=""
                    />

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                      }}
                    >
                      <input
                        type="text"
                        id="editOptionA"
                        placeholder="Option A"
                        required
                        style={{
                          padding: "8px",
                          border: "1.5px solid #e5e7eb",
                          borderRadius: "7px",
                          fontFamily: "inherit",
                        }}
                      />
                      <input
                        type="text"
                        id="editOptionB"
                        placeholder="Option B"
                        required
                        style={{
                          padding: "8px",
                          border: "1.5px solid #e5e7eb",
                          borderRadius: "7px",
                          fontFamily: "inherit",
                        }}
                      />
                      <input
                        type="text"
                        id="editOptionC"
                        placeholder="Option C"
                        required
                        style={{
                          padding: "8px",
                          border: "1.5px solid #e5e7eb",
                          borderRadius: "7px",
                          fontFamily: "inherit",
                        }}
                      />
                      <input
                        type="text"
                        id="editOptionD"
                        placeholder="Option D"
                        required
                        style={{
                          padding: "8px",
                          border: "1.5px solid #e5e7eb",
                          borderRadius: "7px",
                          fontFamily: "inherit",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <select
                        id="editCorrectAnswer"
                        required
                        style={{
                          flex: 1,
                          padding: "8px",
                          border: "1.5px solid #e5e7eb",
                          borderRadius: "7px",
                          fontFamily: "inherit",
                        }}
                        defaultValue=""
                      >
                        <option value="">Correct answer…</option>
                        <option value="a">A</option>
                        <option value="b">B</option>
                        <option value="c">C</option>
                        <option value="d">D</option>
                      </select>
                      <textarea
                        id="editExplanation"
                        placeholder="Explanation (optional)"
                        style={{
                          flex: 2,
                          padding: "8px",
                          border: "1.5px solid #e5e7eb",
                          borderRadius: "7px",
                          fontFamily: "inherit",
                          resize: "vertical",
                          minHeight: "38px",
                        }}
                      ></textarea>
                      <button type="submit" className="btn btn-green btn-sm">
                        Add
                      </button>
                    </div>
                  </form>
                </div>
                <div
                  id="editQuizQuestionsList"
                  style={{ maxHeight: "360px", overflowY: "auto" }}
                >
                  <div className="no-data">Loading questions…</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Details Modal */}
        <div id="quizDetailsModal" className="modal">
          <div className="modal-box">
            <div className="modal-hdr">
              <span className="modal-title">Quiz Details</span>
              <button
                className="modal-close"
                onClick={() => call("closeQuizDetailsModal")}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div id="quizDetailsContent"></div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-gray"
                onClick={() => call("closeQuizDetailsModal")}
              >
                Close
              </button>
              <button
                className="btn btn-teal"
                onClick={() => call("copyQuizShareLink")}
              >
                📋 Copy Share Link
              </button>
            </div>
          </div>
        </div>

        {/* Share Link Modal */}
        <div id="shareModal" className="modal">
          <div className="modal-box" style={{ maxWidth: "480px" }}>
            <div className="modal-hdr">
              <span className="modal-title">Share Quiz Link</span>
              <button
                className="modal-close"
                onClick={() => call("closeShareModal")}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--muted)",
                  marginBottom: "12px",
                }}
              >
                Share this link with students:
              </p>
              <input
                type="text"
                id="quizShareLink"
                readOnly
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid var(--blue)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  marginBottom: "12px",
                }}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn btn-teal"
                  style={{ flex: 1 }}
                  onClick={() => call("copyShareLink")}
                >
                  📋 Copy
                </button>
                <button
                  className="btn btn-gray"
                  style={{ flex: 1 }}
                  onClick={() => call("closeShareModal")}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Admin;
