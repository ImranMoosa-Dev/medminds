import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/auth";
import "../../styles/profile.css";
import StudentLayout from "../../components/layout/StudentLayout";
import axios from "../../utils/AxiosConfig";

const Profile = () => {
  const [auth, setAuth] = useAuth();
  // const [currentUser, setCurrentUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: null, message: "" });

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    fatherName: "",
    email: "",
    whatsapp: "",
    district: "",
    status: "fresher",
    academyJoined: "",
  });

  const [hero, setHero] = useState({
    initial: "",
    fullName: "",
    email: "",
    status: "fresher",
    district: "",
  });
  const [stats, setStats] = useState({ attempts: "—", best: "—", avg: "—" });
  const [historyRows, setHistoryRows] = useState(null); // null = loading, [] = empty, [...] = data
  const [profileLoaded, setProfileLoaded] = useState(false);
  const alertTimeout = useRef(null);

  // fetch profile data on mount
  const loadUserProfile = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_BASEURL}/api/v1/student/profile`,
      );

      if (data?.success) {
        // Split fullName into firstName and lastName
        const fullName = data.user?.fullName?.trim() || "";
        const nameParts = fullName.split(/\s+/);

        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        setProfile({
          firstName,
          lastName,
          fatherName: data.user.fatherName || "",
          email: data.user.email || "",
          whatsapp: data.user.whatsapp || "",
          district: data.user.district || "",
          status: data.user.status || "fresher",
          academyJoined: data.user.academyJoined || "",
        });
      }
      const first = (data.user.fullName?.split(" ")[0] || "").trim();
      const last = (
        data.user.fullName?.split(" ").slice(1).join(" ") || ""
      ).trim();
      const fullName =
        [first, last].filter(Boolean).join(" ") || "Unknown User";

      setHero({
        initial: (first.charAt(0) || "?").toUpperCase(),
        name: fullName,
        email: data.email || data.email || "—",
        status: data.status || "fresher",
        district: data.district || "",
      });
      setProfileLoaded(true);
    } catch (e) {
      console.error("loadUserProfile error:", e);

      setProfileLoaded(true);
      showAlert(
        "error",
        "Could not load profile data. Check your database connection.",
      );
    }
  };

  useEffect(() => {
    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetch quiz stats
  // const loadQuizStats = async (user) => {

  //   try {
  //     const { data: attempts, error } = await supabase
  //       .from("quiz_attempts")
  //       .select("score, total, quiz_id, created_at")
  //       .eq("user_id", u.id)
  //       .order("created_at", { ascending: false });
  //     if (error) throw error;

  //     const count = attempts?.length || 0;
  //     if (count === 0) {
  //       setStats({ attempts: "0", best: "—", avg: "—" });
  //       setHistoryRows([]);
  //       return;
  //     }

  //     let best = 0,
  //       totalPct = 0;
  //     attempts.forEach((a) => {
  //       const p = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
  //       if (p > best) best = p;
  //       totalPct += p;
  //     });
  //     const avg = Math.round(totalPct / count);
  //     setStats({ attempts: count, best: best + "%", avg: avg + "%" });

  //     let quizNames = {};
  //     try {
  //       const ids = [
  //         ...new Set(attempts.map((a) => a.quiz_id).filter(Boolean)),
  //       ];
  //       if (ids.length) {
  //         const { data: quizzes } = await supabase
  //           .from("quizzes")
  //           .select("id, name")
  //           .in("id", ids);
  //         (quizzes || []).forEach((q) => {
  //           quizNames[q.id] = q.name;
  //         });
  //       }
  //     } catch (_) {}

  //     const rows = attempts.map((a, i) => {
  //       const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
  //       const cls =
  //         pct >= 70 ? "pct-green" : pct >= 50 ? "pct-amber" : "pct-red";
  //       const name =
  //         quizNames[a.quiz_id] ||
  //         (a.quiz_id ? `Quiz #${a.quiz_id}` : "General Quiz");
  //       const date = a.created_at
  //         ? new Date(a.created_at).toLocaleDateString("en-PK", {
  //             day: "numeric",
  //             month: "short",
  //             year: "numeric",
  //           })
  //         : "—";
  //       return {
  //         i: i + 1,
  //         name,
  //         score: a.score,
  //         total: a.total,
  //         pct,
  //         cls,
  //         date,
  //       };
  //     });
  //     setHistoryRows(rows);
  //   } catch (e) {
  //     console.error("loadQuizStats error:", e);
  //     setHistoryRows("error");
  //   }
  // };

  const enableEditMode = (e) => {
    if (e) e.preventDefault();
    console.log("enableEditMode called");
    setEditing(true);
  };
  const disableEditMode = (e) => {
    if (e) e.preventDefault();
    setEditing(false);
    // if (currentUser) loadUserProfile(currentUser);
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    console.log("handle profile update called");
    setSaving(true);
    try {
      const updates = {
        fullName: `${profile.firstName || ""} ${profile.lastName || ""}`.trim(),
        whatsapp: profile.whatsapp.trim(),
        district: profile.district.trim(),
        fatherName: profile.fatherName.trim(),
        // academy_joined: profile.academy_joined.trim(),
        status: profile.status,
      };

      console.log("💾 Saving profile for user:");

      const { data } = await axios.put(
        `${process.env.REACT_APP_BASEURL}/api/v1/student/update-profile`,
        updates,
      );
      if (data?.success) {
        console.log(data);
        console.log("✅ Profile saved successfully");
        showAlert("success", "Profile updated successfully!");
        setTimeout(() => {
          setEditing(false);
          loadUserProfile(data.user);
        }, 1200);
      } else {
        console.error("UPDATE error:", data?.message);
        throw new Error(data?.message || JSON.stringify(data));
      }
    } catch (e) {
      console.error("Save error:", e);
      showAlert(
        "error",
        e.message || "Failed to save. Check console for details.",
      );
    } finally {
      setSaving(false);
    }
  };

  //   const changePassword = async () => {
  //     const pwd = window.prompt("Enter your new password (min. 6 characters):");
  //     if (!pwd) return;
  //     if (pwd.length < 6) {
  //       showAlert("error", "Password must be at least 6 characters.");
  //       return;
  //     }
  //     try {
  //       const { error } = await supabase.auth.updateUser({ password: pwd });
  //       if (error) showAlert("error", error.message);
  //       else showAlert("success", "Password updated successfully!");
  //     } catch (e) {
  //       showAlert("error", e.message);
  //     }
  //   };

  const deleteAccount = async () => {
    if (!window.confirm("⚠️ Delete your account? This cannot be undone."))
      return;
    if (
      !window.confirm("🚨 All quiz data will be permanently removed. Confirm?")
    )
      return;

    const { data } = await axios.delete(
      `${process.env.REACT_APP_BASEURL}/api/v1/student/delete-account`,
    );
    if (data?.success) {
      localStorage.clear();
      setAuth({ user: null, token: "" });
      window.location.href = "/"; // Redirect to homepage or login page
    }
  };

  const showAlert = (type, message) => {
    const icons = { success: "✅", error: "❌", info: "ℹ️" };
    setAlert({ type, message: `${icons[type]} ${message}` });
    if (alertTimeout.current) clearTimeout(alertTimeout.current);
    alertTimeout.current = setTimeout(
      () => setAlert({ type: null, message: "" }),
      5000,
    );
  };

  const isImprover = hero.status === "improver";

  return (
    <StudentLayout>
      <div
        className={`alert${alert.type ? " " + alert.type : ""}`}
        id="alertSuccess"
        style={{ display: alert.type ? "block" : "none" }}
      >
        {alert.message}
      </div>
      {/* Hero section */}
      <div className="profile-hero">
        <div className="avatar" id="avatar">
          {profileLoaded ? (
            hero.initial
          ) : (
            <span
              className="skel"
              style={{ width: 76, height: 76, borderRadius: "50%" }}
            ></span>
          )}
        </div>
        <div className="hero-info">
          <div className="hero-name" id="heroName">
            {profileLoaded ? (
              hero.name
            ) : (
              <span className="skel" style={{ width: 160, height: 18 }}></span>
            )}
          </div>
          <div className="hero-email" id="heroEmail">
            {profileLoaded ? (
              hero.email
            ) : (
              <span
                className="skel"
                style={{ width: 200, height: 13, margin: "6px 0" }}
              ></span>
            )}
          </div>
          <div className="hero-meta" id="heroMeta">
            {profileLoaded ? (
              <>
                <span
                  className={`status-pill ${isImprover ? "pill-amber" : "pill-blue"}`}
                >
                  {isImprover ? "Improver" : "Fresher"}
                </span>
                {hero.district && (
                  <span className="status-pill pill-district">
                    📍 {hero.district}
                  </span>
                )}
              </>
            ) : (
              <span
                className="skel"
                style={{ width: 70, height: 22, borderRadius: 20 }}
              ></span>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-row">
        <div className="mini-stat">
          <div className="mini-stat-val" id="statAttempts">
            {stats.attempts}
          </div>
          <div className="mini-stat-label">Quizzes Taken</div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-val" id="statBest">
            {stats.best}
          </div>
          <div className="mini-stat-label">Best Score</div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-val" id="statAvg">
            {stats.avg}
          </div>
          <div className="mini-stat-label">Avg. Score</div>
        </div>
      </div>
      {/* Basic Information */}
      <div className="card">
        <div className="card-header">
          <h2>👤 Basic Information</h2>
        </div>
        <div className="card-body">
          <div
            className={`edit-banner${editing ? " show" : ""}`}
            id="editBanner"
          >
            ✏️ Edit mode active — click Save to apply changes.
          </div>

          <form
            id="profileForm"
            onSubmit={(e) => {
              if (!editing) {
                e.preventDefault();
                return;
              }
              handleProfileUpdate(e);
            }}
          >
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  disabled={!editing}
                  required
                  placeholder="—"
                  value={profile.firstName}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, firstName: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  disabled={!editing}
                  required
                  placeholder="—"
                  value={profile.lastName}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, lastName: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                disabled
                readOnly
                placeholder="—"
                value={profile.email}
                onChange={() => {}}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                disabled={!editing}
                placeholder="+92 3XX XXXXXXX"
                value={profile.whatsapp}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, whatsapp: e.target.value }))
                }
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="district">District</label>
                <input
                  type="text"
                  id="district"
                  disabled={!editing}
                  placeholder="—"
                  value={profile.district}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, district: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="fatherName">Father's Name</label>
                <input
                  type="text"
                  id="fatherName"
                  disabled={!editing}
                  placeholder="—"
                  value={profile.fatherName}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, fatherName: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="academy">Academy / Institution</label>
              <input
                type="text"
                id="academy"
                disabled={!editing}
                placeholder="e.g., ABC Medical Institute"
                value={profile.academyJoined}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    academyJoined: e.target.value,
                  }))
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                disabled={!editing}
                value={profile.status}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, status: e.target.value }))
                }
              >
                <option value="fresher">Fresher</option>
                <option value="improver">Improver</option>
              </select>
            </div>

            <div className="btn-row" id="btnRow">
              {!editing ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={(e) => enableEditMode(e)}
                >
                  ✏️ Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    id="saveBtn"
                    disabled={saving}
                  >
                    {saving ? "⏳ Saving…" : "💾 Save Changes"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={(e) => disableEditMode(e)}
                  >
                    ✕ Cancel
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
      {/* Quiz History */}
      <div className="card">
        <div className="card-header">
          <h2>📋 Quiz History</h2>
        </div>
        <div id="quizHistoryContainer">
          {historyRows === null ? (
            <div className="empty-state">
              <div className="icon">⏳</div>
              <p>Loading…</p>
            </div>
          ) : historyRows === "error" ? (
            <div className="empty-state">
              <div className="icon">❌</div>
              <p>Could not load quiz history.</p>
            </div>
          ) : historyRows.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📝</div>
              <p>No quizzes taken yet.</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="quiz-history-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Quiz</th>
                    <th>Score</th>
                    <th>Result</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRows.map((r) => (
                    <tr key={r.i}>
                      <td style={{ color: "var(--muted)", fontSize: 12 }}>
                        {r.i}
                      </td>
                      <td style={{ fontWeight: 600 }}>{r.name}</td>
                      <td style={{ color: "var(--muted)" }}>
                        {r.score}/{r.total}
                      </td>
                      <td>
                        <span className={`pct-pill ${r.cls}`}>{r.pct}%</span>
                      </td>
                      <td
                        style={{
                          color: "var(--muted)",
                          fontSize: 12,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Account Settings */}
      <div className="card">
        <div className="card-header">
          <h2>🔐 Account Settings</h2>
        </div>
        <div className="card-body">
          <div className="info-note">
            ℹ️ Your email address is verified and cannot be changed here. For
            help, contact support.
          </div>
          <button type="button" className="btn btn-primary btn-full">
            🔑 Change Password
          </button>
          <button
            type="button"
            className="btn btn-danger btn-full"
            onClick={deleteAccount}
          >
            🗑️ Delete Account
          </button>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Profile;
