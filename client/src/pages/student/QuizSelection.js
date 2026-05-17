import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import "../../styles/quiz-selection.css";
import StudentLayout from "../../components/layout/StudentLayout";
import axios from "../../utils/AxiosConfig";

const SUBJ_COLORS = {
  Biology: { bg: "#dcfce7", color: "#16a34a" },
  Chemistry: { bg: "#dbeafe", color: "#0b63b7" },
  Physics: { bg: "#ede9fe", color: "#7c3aed" },
  English: { bg: "#fef3c7", color: "#d97706" },
  "Logical Reasoning": { bg: "#fee2e2", color: "#dc2626" },
};

const QuizSelection = () => {
  const navigate = useNavigate();
  const [auth] = useAuth();
  const [welcomeName, setWelcomeName] = useState("");
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [completionMap, setCompletionMap] = useState({});
  const [filteredQuizzes, setFilteredQuizzes] = useState(null);
  const [searchVal, setSearchVal] = useState("");
  const [resultsCount, setResultsCount] = useState("");
  const [loading, setLoading] = useState(true);
  const [unauthenticated, setUnauthenticated] = useState(false);
  const [previewQuizzes, setPreviewQuizzes] = useState([]);
  const [stats, setStats] = useState({ completed: "—", total: "—", avg: "—" });
  const [progressPct, setProgressPct] = useState(0);

  // load quizzes on mount
  useEffect(() => {
    setWelcomeName(auth.user ? auth.user.fullName || auth.user.email : "");

    loadQuizzes();
  }, []);

  // load quizzes
  const loadQuizzes = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        `${process.env.REACT_APP_BASEURL}/api/v1/quizzes`,
      );

      setAllQuizzes(data.quizzes || []);
      setLoading(false);
    } catch (e) {
      console.error("loadQuizzes error:", e);
      setAllQuizzes([]);
      setLoading(false);
    }
  };

  // const loadQuizzes = async (user) => {
  //   try {
  //     const { data: userRows } = await supabase
  //       .from("users")
  //       .select("batch_id")
  //       .eq("id", user.id);
  //     const batchId = userRows?.[0]?.batch_id || null;

  //     const { data: allQ, error: qErr } = await supabase
  //       .from("quizzes")
  //       .select("*")
  //       .eq("is_published", true)
  //       .order("quiz_order", { ascending: true });
  //     if (qErr) throw qErr;

  //     const { data: jRows } = await supabase
  //       .from("quiz_batches")
  //       .select("quiz_id, batch_id");

  //     const quizBatchMap = {};
  //     (jRows || []).forEach((r) => {
  //       if (!quizBatchMap[r.quiz_id]) quizBatchMap[r.quiz_id] = new Set();
  //       quizBatchMap[r.quiz_id].add(String(r.batch_id));
  //     });

  //     const quizzes = (allQ || []).filter((quiz) => {
  //       const jBatches = quizBatchMap[quiz.id];
  //       const hasJRows = jBatches && jBatches.size > 0;
  //       const legacyBatch = quiz.batch_id ? String(quiz.batch_id) : null;
  //       if (!hasJRows && !legacyBatch) return true;
  //       if (!batchId) return false;
  //       if (hasJRows) return jBatches.has(String(batchId));
  //       return legacyBatch === String(batchId);
  //     });

  //     const { data: attempts, error: aErr } = await supabase
  //       .from("quiz_attempts")
  //       .select("quiz_id, score, total")
  //       .eq("user_id", user.id);
  //     if (aErr) console.warn("Attempts fetch error:", aErr);

  //     const completedIds = new Set((attempts || []).map((a) => a.quiz_id));
  //     const cMap = {};
  //     (attempts || []).forEach((a) => {
  //       cMap[a.quiz_id] = a;
  //     });

  //     const quizzesWithStatus = (quizzes || []).map((q) => ({
  //       ...q,
  //       status: completedIds.has(q.id) ? "COMPLETED" : "AVAILABLE",
  //     }));

  //     setAllQuizzes(quizzesWithStatus);
  //     setCompletionMap(cMap);
  //     updateProgress(quizzesWithStatus, cMap);
  //     setLoading(false);
  //   } catch (e) {
  //     console.error("loadQuizzes error:", e);
  //     setAllQuizzes([]);
  //     setLoading(false);
  //   }
  // };

  const updateProgress = (quizzes, cMap) => {
    const completed = quizzes.filter((q) => q.status === "COMPLETED").length;
    const total = quizzes.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const pcts = Object.values(cMap)
      .filter((c) => c.score !== null && c.total > 0)
      .map((c) => Math.round((c.score / c.total) * 100));
    const avg =
      pcts.length > 0
        ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) + "%"
        : "—";

    setStats({ completed, total, avg });
    setTimeout(() => setProgressPct(pct), 100);
  };

  // ── Search ──
  const handleSearch = (val) => {
    setSearchVal(val);
    const q = val.trim().toLowerCase();
    if (!q) {
      setFilteredQuizzes(null);
      setResultsCount("");
      return;
    }
    const filtered = allQuizzes.filter(
      (quiz) =>
        quiz.name.toLowerCase().includes(q) ||
        (quiz.description || "").toLowerCase().includes(q) ||
        (quiz.syllabus || "").toLowerCase().includes(q) ||
        (quiz.type || "").toLowerCase().includes(q) ||
        (quiz.subjects || []).some((s) => s.toLowerCase().includes(q)),
    );
    setFilteredQuizzes(filtered);
    setResultsCount(
      `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${val.trim()}"`,
    );
  };

  const clearSearch = () => {
    setSearchVal("");
    setFilteredQuizzes(null);
    setResultsCount("");
  };

  const startQuiz = (quizId) => {
    navigate(`/quiz-details/${quizId}`);
  };

  const reviewQuiz = (quizId) => {
    localStorage.setItem("selectedQuizId", quizId);
    navigate("/review");
  };

  // ── Render ──
  const displayQuizzes =
    filteredQuizzes !== null ? filteredQuizzes : allQuizzes;

  // render quize cards
  const renderQuizCard = (quiz) => {
    const comp = completionMap[quiz.id];
    const pct =
      comp && comp.total > 0
        ? Math.round((comp.score / comp.total) * 100)
        : null;
    const isDone = quiz.status === "COMPLETED";

    const tags =
      quiz.subjects && quiz.subjects.length > 0
        ? quiz.subjects
        : quiz.syllabus
          ? [quiz.syllabus]
          : [];

    return (
      <div className="quiz-card" key={quiz.id}>
        <div className="quiz-card-head">
          <h3>{quiz.name}</h3>
          <span className="quiz-order-badge">Quiz {quiz.quiz_order}</span>
        </div>
        <div className="quiz-card-body">
          {isDone ? (
            <span className="quiz-status-badge status-completed">
              ✅ Completed
            </span>
          ) : (
            <span className="quiz-status-badge status-available">
              ▶️ Available
            </span>
          )}
          {tags.length > 0 && (
            <div className="subject-tags">
              {tags.map((s, i) => {
                const c = SUBJ_COLORS[s] || {
                  bg: "#f0f4f8",
                  color: "var(--muted)",
                };
                return (
                  <span
                    key={i}
                    className="subject-tag"
                    style={{ background: c.bg, color: c.color }}
                  >
                    {s}
                  </span>
                );
              })}
            </div>
          )}
          <p className="quiz-desc">
            {quiz.description || "No description available."}
          </p>
          {isDone && pct !== null && (
            <div className="score-strip">
              <span className="score-strip-label">Your Score</span>
              <div className="score-bar">
                <div className="score-bar-fill" style={{ width: pct + "%" }} />
              </div>
              <span className="score-strip-val">
                {comp.score}/{comp.total} &nbsp;·&nbsp; {pct}%
              </span>
            </div>
          )}
          <button
            className={`quiz-btn ${isDone ? "quiz-btn-review" : "quiz-btn-go"}`}
            onClick={() => (isDone ? reviewQuiz(quiz.id) : startQuiz(quiz.id))}
          >
            {isDone ? "📝 View Results" : "▶️ Start Quiz"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ═══ MAIN ═══ */}
      <StudentLayout>
        {/* Welcome banner */}
        <div className="welcome-banner">
          <div className="welcome-left">
            <h1>📚 Quiz Selection</h1>
            <p>
              Complete each quiz in sequence to progress in your learning
              journey
            </p>
          </div>
          <div className="welcome-user" id="welcomeUser">
            {welcomeName ? (
              <>👤 {welcomeName}</>
            ) : (
              <span className="skel" style={{ width: 140, height: 14 }}></span>
            )}
          </div>
        </div>

        {/* Progress card */}
        <div className="progress-card">
          <h2>📊 Your Progress</h2>
          <div className="progress-track">
            <div
              className="progress-fill"
              id="progressFill"
              style={{ width: progressPct + "%" }}
            />
          </div>
          <div className="progress-stats">
            <div className="pstat">
              <div className="pstat-label">Completed</div>
              <div className="pstat-value" id="statCompleted">
                {stats.completed}
              </div>
            </div>
            <div className="pstat">
              <div className="pstat-label">Total Quizzes</div>
              <div className="pstat-value" id="statTotal">
                {stats.total}
              </div>
            </div>
            <div className="pstat">
              <div className="pstat-label">Avg. Score</div>
              <div className="pstat-value" id="statAvg">
                {stats.avg}
              </div>
            </div>
          </div>
        </div>

        {/* Section header + Search */}
        <div className="section-header">
          <div className="section-title" style={{ marginBottom: 0 }}>
            Available Quizzes
          </div>
          <span className="results-count" id="resultsCount">
            {resultsCount}
          </span>
        </div>

        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            id="quizSearch"
            className="search-input"
            placeholder="Search by quiz name or description…"
            value={searchVal}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <button
            className={`search-clear ${searchVal ? "show" : ""}`}
            id="searchClearBtn"
            onClick={clearSearch}
          >
            ✕
          </button>
        </div>

        {/* Quiz grid */}
        <div className="quizzes-grid" id="quizzesGrid">
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div
                  className="quiz-card"
                  key={i}
                  style={{ animation: "none" }}
                >
                  <div
                    className="quiz-card-head"
                    style={{ background: "var(--border)", minHeight: 78 }}
                  ></div>
                  <div className="quiz-card-body">
                    <span
                      className="skel"
                      style={{ width: 90, height: 26, borderRadius: 20 }}
                    ></span>
                    <span
                      className="skel"
                      style={{ width: "100%", height: 14, marginTop: 4 }}
                    ></span>
                    <span
                      className="skel"
                      style={{ width: "80%", height: 14 }}
                    ></span>
                    <span
                      className="skel"
                      style={{
                        width: "100%",
                        height: 42,
                        borderRadius: 50,
                        marginTop: 4,
                      }}
                    ></span>
                  </div>
                </div>
              ))}
            </>
          ) : unauthenticated ? (
            <>
              <div className="register-cta">
                <h2>🔒 Sign In to Start Learning</h2>
                <p>
                  Log in or create an account to access all quizzes and track
                  your progress.
                </p>
                <a href="/">Sign Up / Log In →</a>
              </div>
              {previewQuizzes.map((q) => (
                <div className="quiz-card locked" key={q.id}>
                  <div className="quiz-card-head">
                    <h3>{q.name}</h3>
                    <span className="quiz-order-badge">
                      Quiz {q.quiz_order}
                    </span>
                  </div>
                  <div className="quiz-card-body">
                    <span className="quiz-status-badge status-locked">
                      🔒 Locked
                    </span>
                    <p className="quiz-desc">
                      {q.description || "No description available."}
                    </p>
                    <button className="quiz-btn quiz-btn-locked" disabled>
                      🔒 Login to Unlock
                    </button>
                  </div>
                </div>
              ))}
            </>
          ) : displayQuizzes.length === 0 ? (
            <div className="empty-state">
              <div className="icon">{searchVal ? "🔍" : "📋"}</div>
              <p>
                {searchVal
                  ? "No quizzes match your search."
                  : "No quizzes available yet."}
              </p>
            </div>
          ) : (
            displayQuizzes.map(renderQuizCard)
          )}
        </div>
      </StudentLayout>
    </>
  );
};

export default QuizSelection;
