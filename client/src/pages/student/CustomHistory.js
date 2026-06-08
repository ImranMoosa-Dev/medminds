import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudenLayout from "../../components/layout/StudentLayout";
import {
  getCustomQuizAttemptsHistory,
  getCustomQuizById,
} from "../../api/customQuizApi";
import "../../styles/custom-history.css";

const CustomHistory = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [navOpen, setNavOpen] = useState(false);
  const [loadingTable, setLoadingTable] = useState(true);
  const [errored, setErrored] = useState(false);
  const [list, setList] = useState([]);
  const [summary, setSummary] = useState({
    totalTests: "—",
    totalQuestions: "—",
    totalCorrect: "—",
    totalWrong: "—",
  });
  const [historyMeta, setHistoryMeta] = useState("");

  useEffect(() => {
    loadHistory();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadHistory = async () => {
    try {
      setLoadingTable(true);

      // GET CUSTOM QUIZ ATTEMPT HISTORY API

      const data = await getCustomQuizAttemptsHistory();
      if (data?.success) {
        const items = data?.attempts || [];
        // set list
        setList(items);

        // summary from backend (no need to calculate again)
        setSummary({
          totalTests: data?.summary?.totalTests,
          totalQuestions: data?.summary?.totalQuestions,
          totalCorrect: data?.summary?.totalCorrect,
          totalWrong: data?.summary?.totalWrong,
        });

        const completed = data?.meta?.completed;

        setHistoryMeta(`${items.length} total · ${completed} completed`);
      }
      setLoadingTable(false);
    } catch (err) {
      console.error("loadHistory error:", err);
      setErrored(true);
      setLoadingTable(false);
    }
  };

  const resumeTest = async (attemptId) => {
    try {
      const data = await getCustomQuizById(attemptId);

      if (!data?.success) {
        alert("Could not load test");
        return;
      }

      const attempt = data.attempt;
      localStorage.setItem(
        "questions",
        JSON.stringify(attempt.questions_json || []),
      );
      localStorage.setItem("customTestAttemptId", attempt.id);
      localStorage.setItem(
        "customTestMeta",
        JSON.stringify({
          subjects: attempt.subjects || [],
          topics: attempt.topics || [],
          subtopics: attempt.subtopics || [],
          mcq_count: attempt.total || 0,
          duration_seconds:
            attempt.duration_seconds || (attempt.total || 0) * 60,
          is_custom: true,
        }),
      );
      localStorage.setItem("isCustomTest", "1");
      localStorage.removeItem("selectedQuizId");
      localStorage.removeItem("customTestReview");

      navigate("/quiz");
    } catch (e) {
      console.error("resumeTest error:", e);
      window.alert("Error resuming test: " + e.message);
    }
  };

  const openReview = async (attemptId) => {
    try {
      const data = await getCustomQuizById(attemptId);

      if (!data?.success) {
        alert("Could not load review");
        return;
      }

      const attempt = data.attempt;

      localStorage.setItem(
        "questions",
        JSON.stringify(attempt.questions_json || []),
      );

      localStorage.setItem("answers", JSON.stringify(attempt.answers || {}));

      localStorage.setItem("customTestScore", attempt.score || 0);

      localStorage.setItem("customTestTotal", attempt.total_questions || 0);

      localStorage.setItem("customTestAttemptId", attempt.id);

      localStorage.setItem("isCustomTest", "1");

      localStorage.setItem("customTestReview", "1");

      localStorage.removeItem("selectedQuizId");

      navigate(`/student/custom-test-result/${attempt.id}`);
    } catch (e) {
      console.error("openReview error:", e);
      alert("Error loading review: " + e.message);
    }
  };
  const buildRowData = (a) => {
    const topics = a.topics || [];
    const subjects = a.subjects || [];
    const total = a.total || 0;

    let quizName, topicSubline;
    if (topics.length === 0) {
      quizName = "Custom Test";
      topicSubline = subjects.join(", ") || "—";
    } else if (topics.length <= 3) {
      quizName = topics.join(" + ");
      topicSubline = topics.length + " topic" + (topics.length > 1 ? "s" : "");
    } else {
      quizName = "Grand Test";
      topicSubline = topics.length + " topics selected";
    }

    const isCompleted = a.status === "completed";

    const date = a.created_at
      ? new Date(a.created_at).toLocaleDateString("en-PK", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

    let pct = 0,
      fillCls = "",
      pctCls = "",
      score = 0,
      wrong = 0,
      skipped = 0,
      answered = 0;
    if (isCompleted) {
      score = a.score || 0;
      answered = Object.keys(a.answers || {}).length;
      wrong = answered - score;
      skipped = total - answered;
      pct = total > 0 ? Math.round((score / total) * 100) : 0;
      fillCls =
        pct >= 80 ? "fill-green" : pct >= 60 ? "fill-amber" : "fill-red";
      pctCls = pct >= 80 ? "pct-green" : pct >= 60 ? "pct-amber" : "pct-red";
    }

    return {
      quizName,
      topicSubline,
      subjects,
      total,
      isCompleted,
      date,
      pct,
      fillCls,
      pctCls,
      score,
      wrong,
      skipped,
    };
  };

  return (
    <>
      <StudenLayout title="My Custom Tests – MedMinds">
        <div className="page-title">
          <h1>📋 My Custom Tests</h1>
          <p>All custom practice tests you've created and taken</p>
        </div>

        <div className="summary-grid" id="summaryGrid">
          <div className="summary-card">
            <div className="summary-icon icon-blue">🧪</div>
            <div className="summary-info">
              <div className="summary-val" id="totalTests">
                {summary.totalTests}
              </div>
              <div className="summary-label">Tests Created</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon icon-purple">❓</div>
            <div className="summary-info">
              <div className="summary-val" id="totalQuestions">
                {summary.totalQuestions}
              </div>
              <div className="summary-label">Questions Solved</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon icon-green">✅</div>
            <div className="summary-info">
              <div className="summary-val" id="totalCorrect">
                {summary.totalCorrect}
              </div>
              <div className="summary-label">Total Correct</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon icon-red">❌</div>
            <div className="summary-info">
              <div className="summary-val" id="totalWrong">
                {summary.totalWrong}
              </div>
              <div className="summary-label">Total Incorrect</div>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-head">
            <h2>🗂️ Test History</h2>
            <span className="section-meta" id="historyMeta">
              {historyMeta}
            </span>
          </div>
          <div id="tableContainer">
            {loadingTable ? (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Loading your test history…</p>
              </div>
            ) : errored ? (
              <div className="loading-overlay">
                <p style={{ color: "var(--red)" }}>
                  Failed to load history. Please refresh.
                </p>
              </div>
            ) : list.length === 0 ? (
              <div className="empty-state">
                <div className="e-icon">🧪</div>
                <p>
                  You haven't created any custom tests yet.
                  <br />
                  Start your first practice session now!
                </p>
                <a href="/create-test" className="btn-create">
                  🚀 Create a Test
                </a>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Test Name</th>
                      <th>Subjects</th>
                      <th>MCQs</th>
                      <th>Score</th>
                      <th>Correct / Wrong / Skipped</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((a, idx) => {
                      const r = buildRowData(a);
                      return (
                        <tr key={a.id || idx}>
                          <td
                            style={{
                              color: "var(--muted)",
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {idx + 1}
                          </td>
                          <td>
                            <div className="quiz-name-cell">
                              <div className="quiz-name-main">{r.quizName}</div>
                              <div className="quiz-name-topics">
                                {r.topicSubline}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="subject-tags">
                              {r.subjects.length ? (
                                r.subjects.map((s, si) => (
                                  <span key={si} className="subject-tag">
                                    {s}
                                  </span>
                                ))
                              ) : (
                                <span
                                  style={{
                                    color: "var(--muted)",
                                    fontSize: 12,
                                  }}
                                >
                                  —
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="mcq-count">{r.total}</span>
                          </td>
                          <td>
                            {r.isCompleted ? (
                              <div className="score-bar">
                                <div className="score-track">
                                  <div
                                    className={`score-fill ${r.fillCls}`}
                                    style={{ width: `${r.pct}%` }}
                                  ></div>
                                </div>
                                <span className={`score-pct ${r.pctCls}`}>
                                  {r.pct}%
                                </span>
                              </div>
                            ) : (
                              <span
                                style={{ color: "var(--muted)", fontSize: 12 }}
                              >
                                —
                              </span>
                            )}
                          </td>
                          <td>
                            {r.isCompleted ? (
                              <div className="mini-correct-wrong">
                                <span className="cw-correct">✅ {r.score}</span>
                                <span style={{ color: "var(--border)" }}>
                                  |
                                </span>
                                <span className="cw-wrong">❌ {r.wrong}</span>
                                <span style={{ color: "var(--border)" }}>
                                  |
                                </span>
                                <span className="cw-skipped">
                                  ⚠️ {r.skipped}
                                </span>
                              </div>
                            ) : (
                              <span
                                style={{ color: "var(--muted)", fontSize: 12 }}
                              >
                                —
                              </span>
                            )}
                          </td>
                          <td>
                            {r.isCompleted ? (
                              <span className="badge badge-completed">
                                ✅ Completed
                              </span>
                            ) : (
                              <span className="badge badge-pending">
                                ⏳ Pending
                              </span>
                            )}
                          </td>
                          <td className="date-cell">{r.date}</td>
                          <td>
                            {r.isCompleted ? (
                              <button
                                className="btn-review"
                                onClick={() => openReview(a.id)}
                              >
                                🔍 Review
                              </button>
                            ) : (
                              <button
                                className="btn-resume"
                                onClick={() => resumeTest(a.id)}
                              >
                                ▶ Resume
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </StudenLayout>
    </>
  );
};

export default CustomHistory;
