import React, { useEffect, useState, useMemo } from "react";
import axios from "../../utils/AxiosConfig";
import "../../styles/admin.css";

const AdminResults = () => {
  const [attempts, setAttempts] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filterQuiz, setFilterQuiz] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [publishQuizzes, setPublishQuizzes] = useState([]);

  const BASE_URL = process.env.REACT_APP_BASEURL;

  const userMap = useMemo(() => {
    const map = {};
    (allUsers || []).forEach((u) => {
      const name =
        u.name ||
        ((u.first_name || "") + " " + (u.last_name || "")).trim() ||
        "Unknown";
      map[u.id] = {
        name,
        district: u.district || "N/A",
        email: u.email || "",
      };
    });
    return map;
  }, [allUsers]);

  const quizMap = useMemo(() => {
    const map = {};
    (quizzes || []).forEach((q) => {
      map[q.id] = q.name;
    });
    return map;
  }, [quizzes]);

  const computePublishStats = (attemptsData, quizzesData) => {
    const stats = {};
    (attemptsData || []).forEach((a) => {
      if (!stats[a.quiz_id]) stats[a.quiz_id] = { total: 0, pub: 0 };
      stats[a.quiz_id].total++;
      if (a.is_published) stats[a.quiz_id].pub++;
    });
    return (quizzesData || [])
      .filter((q) => stats[q.id])
      .map((q) => ({
        id: q.id,
        name: q.name,
        total: stats[q.id].total,
        pub: stats[q.id].pub,
        pending: stats[q.id].total - stats[q.id].pub,
        allDone: stats[q.id].total > 0 && stats[q.id].pub === stats[q.id].total,
      }));
  };

  const filteredAttempts = useMemo(() => {
    let data = [...attempts];
    if (filterQuiz) {
      data = data.filter((a) => String(a.quiz_id) === String(filterQuiz));
    }
    if (filterStatus === "published") {
      data = data.filter((a) => a.is_published);
    }
    if (filterStatus === "unpublished") {
      data = data.filter((a) => !a.is_published);
    }
    return data;
  }, [attempts, filterQuiz, filterStatus]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [attemptsRes, quizzesRes, usersRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/v1/quiz-attempts`),
        axios.get(`${BASE_URL}/api/v1/quizzes`),
        axios.get(`${BASE_URL}/api/v1/admin/users/all-users`),
      ]);

      const attemptsData =
        attemptsRes?.data?.attempts || attemptsRes?.data || attemptsRes || [];
      const quizzesData =
        quizzesRes?.data?.quizzes || quizzesRes?.data || quizzesRes || [];
      const usersData =
        usersRes?.data?.users || usersRes?.data || usersRes || [];

      const attemptsArr = Array.isArray(attemptsData) ? attemptsData : [];
      const quizzesArr = Array.isArray(quizzesData) ? quizzesData : [];
      const usersArr = Array.isArray(usersData) ? usersData : [];

      setAttempts(attemptsArr);
      setQuizzes(quizzesArr);
      setAllUsers(usersArr);
      setPublishQuizzes(computePublishStats(attemptsArr, quizzesArr));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Error loading results",
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshPublishStats = (updatedAttempts) => {
    setPublishQuizzes(computePublishStats(updatedAttempts, quizzes));
  };

  const handleTogglePublish = async (attemptId) => {
    const attempt = attempts.find((a) => String(a.id) === String(attemptId));
    if (!attempt) return;
    const newStatus = !attempt.is_published;
    try {
      try {
        await axios.post(
          `${BASE_URL}/api/v1/quiz-attempts/toggle-publish/${attemptId}`,
        );
      } catch {
        // fallback to local
      }
      const updated = attempts.map((a) =>
        String(a.id) === String(attemptId)
          ? { ...a, is_published: newStatus }
          : a,
      );
      setAttempts(updated);
      refreshPublishStats(updated);
    } catch (err) {
      alert(
        "Error: " + (err?.response?.data?.message || err?.message),
      );
    }
  };

  const handlePublishAllForQuiz = async (quizId, quizName) => {
    if (!window.confirm(`Publish ALL results for "${quizName}"?`)) return;
    try {
      try {
        await axios.post(`${BASE_URL}/api/v1/quiz-attempts/publish/${quizId}`);
      } catch {
        // fallback to local
      }
      const updated = attempts.map((a) =>
        String(a.quiz_id) === String(quizId)
          ? { ...a, is_published: true }
          : a,
      );
      setAttempts(updated);
      refreshPublishStats(updated);
    } catch (err) {
      alert(
        "Error: " + (err?.response?.data?.message || err?.message),
      );
    }
  };

  const handleUnpublishAllForQuiz = async (quizId, quizName) => {
    if (!window.confirm(`Unpublish ALL results for "${quizName}"?`)) return;
    try {
      try {
        await axios.post(
          `${BASE_URL}/api/v1/quiz-attempts/unpublish/${quizId}`,
        );
      } catch {
        // fallback to local
      }
      const updated = attempts.map((a) =>
        String(a.quiz_id) === String(quizId)
          ? { ...a, is_published: false }
          : a,
      );
      setAttempts(updated);
      refreshPublishStats(updated);
    } catch (err) {
      alert(
        "Error: " + (err?.response?.data?.message || err?.message),
      );
    }
  };

  const exportResultsCSV = () => {
    if (!filteredAttempts.length) {
      alert("No data to export.");
      return;
    }
    const headers = [
      "Name",
      "Quiz",
      "District",
      "Score",
      "Total",
      "Percentage",
      "Status",
      "Date",
    ];
    const rows = filteredAttempts.map((a) => {
      const u = userMap[a.user_id] || {};
      const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
      return [
        `"${(u.name || "Unknown").replace(/"/g, '""')}"`,
        `"${(quizMap[a.quiz_id] || "Unknown").replace(/"/g, '""')}"`,
        `"${(u.district || "N/A").replace(/"/g, '""')}"`,
        a.score,
        a.total,
        pct,
        a.is_published ? "Published" : "Unpublished",
        a.created_at ? new Date(a.created_at).toLocaleString() : "N/A",
      ].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attempts.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPctColor = (pct) => {
    if (pct >= 70) return "#16a34a";
    if (pct >= 50) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <main>
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
              <div className="pub-panel-title">🚀 Publish Results by Quiz</div>
              <div className="pub-panel-sub">
                One click publishes all attempts for a quiz
              </div>
            </div>
            <button className="btn btn-gray btn-sm" onClick={loadData}>
              🔄 Refresh
            </button>
          </div>
          <div id="publishQuizCards" className="pub-cards">
            {loading ? (
              <>
                <div className="shimmer"></div>
                <div className="shimmer"></div>
                <div className="shimmer"></div>
              </>
            ) : publishQuizzes.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "13px" }}>
                No quizzes with attempts.
              </p>
            ) : (
              publishQuizzes.map((q) => (
                <div
                  key={q.id}
                  className="pub-card"
                  style={{
                    background: q.allDone ? "#f0fdf4" : "#fff",
                    borderColor: q.allDone ? "#86efac" : "#e0e0e0",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "13px",
                      marginBottom: "4px",
                    }}
                  >
                    {q.name}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--muted)",
                      marginBottom: "10px",
                    }}
                  >
                    {q.pub}/{q.total} published ·{" "}
                    <span
                      style={{
                        color: q.allDone ? "#16a34a" : "#f59e0b",
                        fontWeight: 700,
                      }}
                    >
                      {q.allDone ? "✅ All done" : `${q.pending} pending`}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      className="btn btn-blue btn-xs"
                      style={{ flex: 1 }}
                      disabled={!q.total || q.allDone}
                      onClick={() => handlePublishAllForQuiz(q.id, q.name)}
                    >
                      📤 Publish All
                    </button>
                    <button
                      className="btn btn-xs"
                      style={{
                        flex: 1,
                        background: "white",
                        color: "var(--orange)",
                        border: "1px solid var(--orange)",
                      }}
                      disabled={!q.pub}
                      onClick={() => handleUnpublishAllForQuiz(q.id, q.name)}
                    >
                      ↩️ Unpublish
                    </button>
                  </div>
                </div>
              ))
            )}
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
                value={filterQuiz}
                onChange={(e) => setFilterQuiz(e.target.value)}
              >
                <option value="">All Quizzes</option>
                {quizzes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.name}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
            <button
              className="btn btn-green btn-sm"
              onClick={exportResultsCSV}
              title="Download current filtered view as CSV"
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        <div className="card">
          <div className="tbl-wrap">
            {loading ? (
              <div className="no-data">Loading attempts…</div>
            ) : error ? (
              <div className="no-data" style={{ color: "var(--red)" }}>
                Error: {error}
              </div>
            ) : filteredAttempts.length === 0 ? (
              <div className="no-data">
                No attempts match the selected filters.
              </div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Quiz</th>
                    <th>District</th>
                    <th>Score</th>
                    <th>%</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttempts.map((a) => {
                    const u = userMap[a.user_id] || {};
                    const pct =
                      a.total > 0
                        ? Math.round((a.score / a.total) * 100)
                        : 0;
                    return (
                      <tr key={a.id}>
                        <td>
                          <strong>{u.name || "Unknown"}</strong>
                        </td>
                        <td
                          style={{
                            color: "var(--blue)",
                            fontWeight: 600,
                          }}
                        >
                          {quizMap[a.quiz_id] || "Unknown"}
                        </td>
                        <td>{u.district || "N/A"}</td>
                        <td>
                          {a.score}/{a.total}
                        </td>
                        <td
                          style={{
                            color: getPctColor(pct),
                            fontWeight: 700,
                          }}
                        >
                          {pct}%
                        </td>
                        <td>
                          <button
                            className={`pub-btn ${a.is_published ? "pub-yes" : "pub-no"}`}
                            onClick={() => handleTogglePublish(a.id)}
                          >
                            {a.is_published ? "✅ Published" : "⬜ Publish"}
                          </button>
                        </td>
                        <td
                          style={{
                            fontSize: "12px",
                            color: "var(--muted)",
                          }}
                        >
                          {a.created_at
                            ? new Date(a.created_at).toLocaleString()
                            : "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminResults;
