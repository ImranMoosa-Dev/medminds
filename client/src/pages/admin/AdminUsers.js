import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import axios from "../../utils/AxiosConfig";
import { getAllUsers } from "../../api/userApi";
import { getAllQuizzes } from "../../api/quizApi";
import "../../styles/admin.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addUserFormVisible, setAddUserFormVisible] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    whatsapp: "",
    district: "",
    password: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalError, setModalError] = useState("");
  const [performanceData, setPerformanceData] = useState(null);
  const [resultsData, setResultsData] = useState(null);

  const quizMap = useMemo(() => {
    return new Map((allQuizzes || []).map((quiz) => [quiz.id, quiz]));
  }, [allQuizzes]);

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllUsers();
      const payload = response?.data || response;
      setUsers(payload?.users || []);
      setAttempts(payload?.attempts || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Error fetching users",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadQuizzes = async () => {
    try {
      const response = await getAllQuizzes();
      const quizzes = response?.quizzes || response?.data?.quizzes || response;
      setAllQuizzes(quizzes || []);
    } catch (err) {
      // Keep the user page working if quiz names cannot load
      console.error("Failed to load quizzes", err);
      setAllQuizzes([]);
    }
  };

  useEffect(() => {
    loadUsers();
    loadQuizzes();
  }, []);

  const getUserName = (user) => {
    const firstName = user?.first_name || "";
    const lastName = user?.last_name || "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    return fullName || "N/A";
  };

  const getBatchName = (user) => {
    if (user?.batch_name) return user.batch_name;
    if (user?.batch_id) return String(user.batch_id);
    return "Not enrolled";
  };

  const getPhone = (user) => {
    return user?.whatsapp || user?.phone || "N/A";
  };

  const handleToggleAddUserForm = () => {
    setAddUserFormVisible((prev) => !prev);
    setFormError("");
  };

  const handleNewUserChange = (field) => (event) => {
    setNewUser((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmitNewUser = async (event) => {
    event.preventDefault();
    setFormLoading(true);
    setFormError("");

    const fullName = [newUser.firstName, newUser.lastName]
      .filter(Boolean)
      .join(" ");

    try {
      await axios.post("/api/v1/auth/register", {
        fullName,
        fatherName: "",
        district: newUser.district,
        whatsapp: newUser.whatsapp,
        status: "active",
        email: newUser.email,
        password: newUser.password,
        confirmPassword: newUser.password,
      });
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        whatsapp: "",
        district: "",
        password: "",
      });
      setAddUserFormVisible(false);
      await loadUsers();
      alert(
        "User created! You may need to refresh the page to see all changes.",
      );
    } catch (err) {
      setFormError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Error creating user",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete user ${user.email}?`)) return;

    try {
      await axios.delete(`/api/v1/admin/users/${user.id}`);
      alert(
        "User removed from students list.\nTo delete their login, use Supabase Dashboard → Auth → Users.",
      );
      await loadUsers();
    } catch (err) {
      console.warn("Delete user failed, removing locally", err);
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
      alert(
        "User removed from students list. To delete their login, use Supabase Dashboard → Auth → Users.",
      );
    }
  };

  const openPerformanceModal = (user) => {
    const userAttempts = (attempts || []).filter(
      (attempt) => attempt.user_id === user.id,
    );
    setSelectedUser(user);
    setModalMode("performance");
    setModalError("");

    if (!userAttempts.length) {
      setPerformanceData(null);
      setModalError("No completed quizzes yet.");
      setModalOpen(true);
      return;
    }

    const rows = userAttempts.map((attempt) => {
      const pct = attempt.total_questions
        ? Math.round((attempt.score / attempt.total_questions) * 100)
        : 0;
      const color =
        pct >= 70 ? "var(--green)" : pct >= 50 ? "var(--amber)" : "var(--red)";
      const quiz = quizMap.get(attempt.quiz_id);
      return {
        quizName: quiz?.name || `Quiz #${attempt.quiz_id}`,
        score: `${attempt.score}/${attempt.total_questions}`,
        percentage: pct,
        color,
        quizId: attempt.quiz_id,
      };
    });

    const total = rows.length;
    const avgPct = Math.round(
      rows.reduce((sum, row) => sum + row.percentage, 0) / total,
    );
    const bestPct = Math.max(...rows.map((row) => row.percentage));

    setPerformanceData({
      total,
      avgPct,
      bestPct,
      rows,
    });
    setModalOpen(true);
  };

  const openResultsModal = (user) => {
    const userAttempts = (attempts || []).filter(
      (attempt) => attempt.user_id === user.id,
    );
    const attemptMap = new Map(
      userAttempts.map((attempt) => [attempt.quiz_id, attempt]),
    );
    setSelectedUser(user);
    setModalMode("results");
    setModalError("");

    if (!allQuizzes.length) {
      setResultsData(null);
      setModalError("No quizzes created yet.");
      setModalOpen(true);
      return;
    }

    const rows = allQuizzes.map((quiz) => {
      const attempt = attemptMap.get(quiz.id);
      if (attempt) {
        const pct = attempt.total_questions
          ? Math.round((attempt.score / attempt.total_questions) * 100)
          : 0;
        const color =
          pct >= 70
            ? "var(--green)"
            : pct >= 50
              ? "var(--amber)"
              : "var(--red)";
        return {
          quizId: quiz.id,
          quizName: quiz.name,
          taken: true,
          score: `${attempt.score}/${attempt.total_questions}`,
          percentage: pct,
          color,
          submittedAt: attempt.created_at || "—",
        };
      }
      return {
        quizId: quiz.id,
        quizName: quiz.name,
        taken: false,
      };
    });

    const totalAttempts = userAttempts.length;
    const best = totalAttempts
      ? Math.max(
          ...userAttempts.map((attempt) =>
            attempt.total_questions
              ? Math.round((attempt.score / attempt.total_questions) * 100)
              : 0,
          ),
        )
      : 0;
    const avg = totalAttempts
      ? Math.round(
          userAttempts.reduce(
            (sum, attempt) =>
              sum +
              (attempt.total_questions
                ? Math.round((attempt.score / attempt.total_questions) * 100)
                : 0),
            0,
          ) / totalAttempts,
        )
      : 0;

    setResultsData({ rows, totalAttempts, best, avg });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMode("");
    setSelectedUser(null);
    setModalError("");
    setPerformanceData(null);
    setResultsData(null);
  };

  const adminViewResult = (userId, quizId) => {
    const url = `result.html?adminUserId=${userId}&quizId=${quizId}`;
    window.open(url, "_blank");
  };

  const renderUserCards = () => {
    if (loading) {
      return <div className="no-data">Loading…</div>;
    }

    if (error) {
      return (
        <div className="no-data" style={{ color: "var(--red)" }}>
          Error: {error}
        </div>
      );
    }

    if (!users.length) {
      return <div className="no-data">No users yet</div>;
    }

    return users.map((user) => {
      const name = getUserName(user);
      const userAttempts = (attempts || []).filter(
        (attempt) => attempt.user_id === user.id,
      );
      const totalAttempts = userAttempts.length;
      const avgScore = totalAttempts
        ? Math.round(
            userAttempts.reduce(
              (sum, attempt) =>
                sum +
                (attempt.total_questions
                  ? (attempt.score / attempt.total_questions) * 100
                  : 0),
              0,
            ) / totalAttempts,
          )
        : null;
      const batchName = getBatchName(user);
      const scoreColor =
        avgScore === null
          ? "var(--muted)"
          : avgScore >= 70
            ? "var(--green)"
            : avgScore >= 50
              ? "var(--amber)"
              : "var(--red)";

      return (
        <div className="user-card" key={user.id}>
          <div className="user-top">
            <div>
              <div className="user-name">{name}</div>
              <div className="user-email">{user.email}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: scoreColor,
                }}
              >
                {avgScore !== null ? `${avgScore}%` : "—"}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: ".5px",
                }}
              >
                Avg Score
              </div>
            </div>
          </div>
          <div className="user-meta">
            <div>
              <div className="meta-lbl">Batch</div>
              <div className="meta-val">{batchName}</div>
            </div>
            <div>
              <div className="meta-lbl">Phone</div>
              <div className="meta-val">{getPhone(user)}</div>
            </div>
            <div>
              <div className="meta-lbl">Quizzes Done</div>
              <div className="meta-val">{totalAttempts}</div>
            </div>
            <div>
              <div className="meta-lbl">Joined</div>
              <div className="meta-val">
                {new Date(user.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginTop: "4px",
            }}
          >
            <button
              type="button"
              className="btn btn-blue btn-sm"
              onClick={() => openPerformanceModal(user)}
            >
              📊 Performance
            </button>
            <button
              type="button"
              className="btn btn-gray btn-sm"
              onClick={() => openResultsModal(user)}
            >
              📋 Results
            </button>
            <button
              type="button"
              className="btn btn-red btn-sm"
              onClick={() => handleDeleteUser(user)}
            >
              🗑 Delete
            </button>
          </div>
        </div>
      );
    });
  };

  const renderPerformanceBody = () => {
    if (modalError) {
      return <div className="no-data">{modalError}</div>;
    }

    if (!performanceData) {
      return <div className="no-data">Loading…</div>;
    }

    return (
      <>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "14px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "var(--blue-main)",
              }}
            >
              {performanceData.total}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--muted)",
                textTransform: "uppercase",
                marginTop: "3px",
              }}
            >
              Quizzes
            </div>
          </div>
          <div
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "14px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color:
                  performanceData.avgPct >= 70
                    ? "var(--green)"
                    : performanceData.avgPct >= 50
                      ? "var(--amber)"
                      : "var(--red)",
              }}
            >
              {performanceData.avgPct}%
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--muted)",
                textTransform: "uppercase",
                marginTop: "3px",
              }}
            >
              Avg Score
            </div>
          </div>
          <div
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "14px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "var(--green)",
              }}
            >
              {performanceData.best}%
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--muted)",
                textTransform: "uppercase",
                marginTop: "3px",
              }}
            >
              Best
            </div>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background:
                    "linear-gradient(135deg,var(--blue-main),var(--blue-mid))",
                  color: "#fff",
                }}
              >
                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontSize: "12px",
                  }}
                >
                  Quiz
                </th>
                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontSize: "12px",
                  }}
                >
                  Score
                </th>
                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontSize: "12px",
                  }}
                >
                  %
                </th>
                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontSize: "12px",
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontSize: "12px",
                  }}
                >
                  Detail
                </th>
              </tr>
            </thead>
            <tbody>
              {performanceData.rows.map((row, index) => (
                <tr
                  key={index}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: "13px",
                      color: "var(--text)",
                    }}
                  >
                    {row.quizName}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: "13px",
                      color: "var(--muted)",
                    }}
                  >
                    {row.score}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontWeight: 700,
                      color: row.color,
                    }}
                  >
                    {row.percentage}%
                    <div
                      style={{
                        height: "6px",
                        background: "var(--border)",
                        borderRadius: "3px",
                        marginTop: "4px",
                      }}
                    >
                      <div
                        style={{
                          height: "6px",
                          width: `${row.percentage}%`,
                          background: row.color,
                          borderRadius: "3px",
                          transition: "width .6s",
                        }}
                      />
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: "12px",
                      color: "var(--muted)",
                    }}
                  >
                    —
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <button
                      type="button"
                      className="btn btn-blue btn-sm"
                      onClick={() =>
                        adminViewResult(selectedUser?.id, row.quizId)
                      }
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const renderResultsBody = () => {
    if (modalError) {
      return <div className="no-data">{modalError}</div>;
    }

    if (!resultsData) {
      return <div className="no-data">Loading…</div>;
    }

    return (
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background:
                  "linear-gradient(135deg,var(--blue-main),var(--blue-mid))",
                color: "#fff",
              }}
            >
              <th
                style={{
                  padding: "10px 12px",
                  textAlign: "left",
                  fontSize: "12px",
                }}
              >
                Quiz
              </th>
              <th
                style={{
                  padding: "10px 12px",
                  textAlign: "left",
                  fontSize: "12px",
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: "10px 12px",
                  textAlign: "left",
                  fontSize: "12px",
                }}
              >
                Score
              </th>
              <th
                style={{
                  padding: "10px 12px",
                  textAlign: "left",
                  fontSize: "12px",
                }}
              >
                Date
              </th>
              <th
                style={{
                  padding: "10px 12px",
                  textAlign: "left",
                  fontSize: "12px",
                }}
              >
                Detail
              </th>
            </tr>
          </thead>
          <tbody>
            {resultsData.rows.map((row) => (
              <tr
                key={row.quizId}
                style={{
                  borderBottom: "1px solid var(--border)",
                  opacity: row.taken ? 1 : 0.65,
                }}
              >
                <td style={{ padding: "11px 12px", fontSize: "13px" }}>
                  {row.quizName}
                </td>
                <td style={{ padding: "11px 12px" }}>
                  {row.taken ? (
                    <span
                      style={{
                        background: "var(--green-bg)",
                        color: "var(--green)",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      ✅ Done
                    </span>
                  ) : (
                    <span
                      style={{
                        background: "var(--amber-bg)",
                        color: "var(--amber)",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      ⏳ Not Taken
                    </span>
                  )}
                </td>
                <td
                  style={{
                    padding: "11px 12px",
                    fontWeight: row.taken ? 700 : 400,
                    color: row.taken ? row.color : "var(--muted)",
                  }}
                >
                  {row.taken ? `${row.percentage}% (${row.score})` : "—"}
                </td>
                <td
                  style={{
                    padding: "11px 12px",
                    fontSize: "12px",
                    color: "var(--muted)",
                  }}
                >
                  {row.taken ? row.submittedAt : "—"}
                </td>
                <td style={{ padding: "11px 12px" }}>
                  {row.taken ? (
                    <button
                      type="button"
                      className="btn btn-blue btn-sm"
                      onClick={() =>
                        adminViewResult(selectedUser?.id, row.quizId)
                      }
                    >
                      📋 View
                    </button>
                  ) : (
                    <span style={{ color: "var(--muted)", fontSize: "12px" }}>
                      —
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <AdminLayout title="Admin Users - Medminds">
      <div id="users" className="tab-panel">
        <div className="sec-hdr">
          <h2 className="sec-title">👥 Manage Users</h2>
          <button className="btn btn-blue" onClick={handleToggleAddUserForm}>
            + Add User
          </button>
        </div>
        <div
          id="addUserForm"
          className="form-box"
          style={{ display: addUserFormVisible ? "block" : "none" }}
        >
          <h3>➕ Add New User</h3>
          <form onSubmit={handleSubmitNewUser}>
            <div className="form-row">
              <div className="fg">
                <label>First Name *</label>
                <input
                  type="text"
                  id="newUserFirstName"
                  placeholder="First name"
                  value={newUser.firstName}
                  onChange={handleNewUserChange("firstName")}
                  required
                />
              </div>
              <div className="fg">
                <label>Last Name *</label>
                <input
                  type="text"
                  id="newUserLastName"
                  placeholder="Last name"
                  value={newUser.lastName}
                  onChange={handleNewUserChange("lastName")}
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
                  value={newUser.email}
                  onChange={handleNewUserChange("email")}
                  required
                />
              </div>
              <div className="fg">
                <label>WhatsApp Number *</label>
                <input
                  type="tel"
                  id="newUserWhatsapp"
                  placeholder="+92 3XX XXXXXXX"
                  value={newUser.whatsapp}
                  onChange={handleNewUserChange("whatsapp")}
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
                  value={newUser.district}
                  onChange={handleNewUserChange("district")}
                  required
                />
              </div>
              <div className="fg">
                <label>Password *</label>
                <input
                  type="password"
                  id="newUserPassword"
                  placeholder="Min 6 characters"
                  value={newUser.password}
                  onChange={handleNewUserChange("password")}
                  required
                  minLength={6}
                />
              </div>
            </div>
            {formError && (
              <div className="no-data" style={{ color: "var(--red)" }}>
                {formError}
              </div>
            )}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-gray"
                onClick={handleToggleAddUserForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-blue"
                disabled={formLoading}
              >
                {formLoading ? "Creating…" : "Create User"}
              </button>
            </div>
          </form>
        </div>
        <div id="usersList">{renderUserCards()}</div>
      </div>

      {modalOpen && (
        <div
          id="userPerfModal"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            style={{
              background: "var(--card)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "720px",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 60px rgba(0,0,0,.3)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 22px",
                borderBottom: "1px solid var(--border)",
                flexShrink: 0,
              }}
            >
              <h3
                id="userModalTitle"
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--text)",
                }}
              >
                {selectedUser
                  ? modalMode === "performance"
                    ? getUserName(selectedUser)
                    : `${getUserName(selectedUser)} — Quiz Results`
                  : modalMode === "performance"
                    ? "Performance"
                    : "Quiz Results"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--muted)",
                }}
              >
                ✕ Close
              </button>
            </div>
            <div
              id="userModalBody"
              style={{ padding: "22px", overflowY: "auto", flex: 1 }}
            >
              {modalMode === "performance"
                ? renderPerformanceBody()
                : renderResultsBody()}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
