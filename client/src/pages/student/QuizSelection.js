import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import "../../styles/quiz-selection.css";
import StudentLayout from "../../components/layout/StudentLayout";

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
  const [theme, setTheme] = useState("light");
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

  // Password reset modal
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwAlert, setPwAlert] = useState({
    show: false,
    msg: "",
    type: "error",
  });
  const [pwBtnDisabled, setPwBtnDisabled] = useState(false);
  const [pwBtnText, setPwBtnText] = useState("Update Password");
  const pwNewRef = useRef(null);

  useEffect(() => {
    document.title = "Quiz Selection – MedMinds";
    // Theme init
    const saved = localStorage.getItem("medminds-theme");
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const t = saved || (dark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", t);
    setTheme(t);

    // Password recovery detection
    // const { data: authListener } = supabase.auth.onAuthStateChange(
    //   (event, session) => {
    //     if (event === "PASSWORD_RECOVERY") {
    //       window.history.replaceState(null, "", window.location.pathname);
    //       setPwModalOpen(true);
    //       setTimeout(() => pwNewRef.current?.focus(), 150);
    //     }
    //   },
    // );

    // const hashParams = new URLSearchParams(
    //   window.location.hash.replace("#", ""),
    // );
    // if (hashParams.get("type") === "recovery") {
    //   setTimeout(() => {
    //     setPwModalOpen(true);
    //     setTimeout(() => pwNewRef.current?.focus(), 100);
    //   }, 300);
    // }

    // initializeQuizSelection();

    // return () => {
    //   authListener?.subscription?.unsubscribe();
    // };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //   const logout = async () => {
  //     try {
  //       await supabase.auth.signOut();
  //     } catch (_) {}
  //     navigate("/");
  //   };

  // ══════════════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════════════
  //   const initializeQuizSelection = async () => {
  //     try {
  //       const {
  //         data: { user },
  //       } = await supabase.auth.getUser();

  //       if (!user) {
  //         showUnauthenticated();
  //         return;
  //       }
  //       setCurrentUser(user);
  //       await Promise.all([loadUserInfo(user), loadQuizzes(user)]);
  //     } catch (e) {
  //       console.error("Init error:", e);
  //       setLoading(false);
  //     }
  //   };

  //   const showUnauthenticated = async () => {
  //     setUnauthenticated(true);
  //     setLoading(false);
  //     setWelcomeName("Guest");
  //     try {
  //       const { data: quizzes } = await supabase
  //         .from("quizzes")
  //         .select("*")
  //         .eq("is_published", true)
  //         .order("quiz_order", { ascending: true });
  //       setPreviewQuizzes(quizzes || []);
  //     } catch (_) {
  //       setPreviewQuizzes([]);
  //     }
  //   };

  //   const loadUserInfo = async (user) => {
  //     try {
  //       const { data: rows } = await supabase
  //         .from("users")
  //         .select("first_name, last_name, email")
  //         .eq("id", user.id);
  //       const data = rows?.[0];
  //       if (data) {
  //         const name =
  //           [data.first_name, data.last_name].filter(Boolean).join(" ") ||
  //           data.email ||
  //           "Student";
  //         setWelcomeName(name);
  //       } else {
  //         setWelcomeName(user.email || "Student");
  //       }
  //     } catch (e) {
  //       setWelcomeName("Student");
  //     }
  //   };

  //   const loadQuizzes = async (user) => {
  //     try {
  //       const { data: userRows } = await supabase
  //         .from("users")
  //         .select("batch_id")
  //         .eq("id", user.id);
  //       const batchId = userRows?.[0]?.batch_id || null;

  //       const { data: allQ, error: qErr } = await supabase
  //         .from("quizzes")
  //         .select("*")
  //         .eq("is_published", true)
  //         .order("quiz_order", { ascending: true });
  //       if (qErr) throw qErr;

  //       const { data: jRows } = await supabase
  //         .from("quiz_batches")
  //         .select("quiz_id, batch_id");

  //       const quizBatchMap = {};
  //       (jRows || []).forEach((r) => {
  //         if (!quizBatchMap[r.quiz_id]) quizBatchMap[r.quiz_id] = new Set();
  //         quizBatchMap[r.quiz_id].add(String(r.batch_id));
  //       });

  //       const quizzes = (allQ || []).filter((quiz) => {
  //         const jBatches = quizBatchMap[quiz.id];
  //         const hasJRows = jBatches && jBatches.size > 0;
  //         const legacyBatch = quiz.batch_id ? String(quiz.batch_id) : null;
  //         if (!hasJRows && !legacyBatch) return true;
  //         if (!batchId) return false;
  //         if (hasJRows) return jBatches.has(String(batchId));
  //         return legacyBatch === String(batchId);
  //       });

  //       const { data: attempts, error: aErr } = await supabase
  //         .from("quiz_attempts")
  //         .select("quiz_id, score, total")
  //         .eq("user_id", user.id);
  //       if (aErr) console.warn("Attempts fetch error:", aErr);

  //       const completedIds = new Set((attempts || []).map((a) => a.quiz_id));
  //       const cMap = {};
  //       (attempts || []).forEach((a) => {
  //         cMap[a.quiz_id] = a;
  //       });

  //       const quizzesWithStatus = (quizzes || []).map((q) => ({
  //         ...q,
  //         status: completedIds.has(q.id) ? "COMPLETED" : "AVAILABLE",
  //       }));

  //       setAllQuizzes(quizzesWithStatus);
  //       setCompletionMap(cMap);
  //       updateProgress(quizzesWithStatus, cMap);
  //       setLoading(false);
  //     } catch (e) {
  //       console.error("loadQuizzes error:", e);
  //       setAllQuizzes([]);
  //       setLoading(false);
  //     }
  //   };

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
    localStorage.setItem("selectedQuizId", quizId);
    navigate("/quiz");
  };

  const reviewQuiz = (quizId) => {
    localStorage.setItem("selectedQuizId", quizId);
    navigate("/review");
  };

  // ── Password reset ──
  const showPwAlert = (msg, type = "error") => {
    setPwAlert({ show: true, msg, type });
  };

  //   const updatePassword = async () => {
  //     if (!pwNew || pwNew.length < 6) {
  //       showPwAlert("Password kam az kam 6 characters ka hona chahiye.");
  //       return;
  //     }
  //     if (pwNew !== pwConfirm) {
  //       showPwAlert("Passwords match nahi kar rahe!");
  //       return;
  //     }

  //     setPwBtnDisabled(true);
  //     setPwBtnText("Updating…");

  //     try {
  //       const { error } = await supabase.auth.updateUser({ password: pwNew });
  //       if (error) throw error;

  //       showPwAlert("✅ Password update ho gaya! Logging in...", "success");
  //       setTimeout(() => {
  //         setPwModalOpen(false);
  //         window.location.reload();
  //       }, 1800);
  //     } catch (e) {
  //       console.error("updatePassword error:", e);
  //       showPwAlert(e.message || "Password update failed. Please try again.");
  //       setPwBtnDisabled(false);
  //       setPwBtnText("Update Password");
  //     }
  //   };

  // ── Render ──
  const displayQuizzes =
    filteredQuizzes !== null ? filteredQuizzes : allQuizzes;

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

      {/* ============================================================ */}
      {/* PASSWORD RESET MODAL (shown when user arrives via reset link) */}
      {/* ============================================================ */}
      <div
        id="pwResetOverlay"
        style={{
          display: pwModalOpen ? "flex" : "none",
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 99999,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: 36,
            width: "100%",
            maxWidth: 420,
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            position: "relative",
          }}
        >
          {/* Lock icon */}
          <div
            style={{
              width: 64,
              height: 64,
              background: "linear-gradient(135deg,#0b63b7,#0a4a8f)",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: 28,
            }}
          >
            🔐
          </div>

          <h2
            style={{
              fontFamily: "'Merriweather',serif",
              fontSize: 20,
              fontWeight: 700,
              color: "#0b63b7",
              textAlign: "center",
              marginBottom: 6,
            }}
          >
            Set New Password
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "#666",
              textAlign: "center",
              marginBottom: 24,
              lineHeight: 1.5,
            }}
          >
            Aapka account verify ho gaya!
            <br />
            Naya password set karein.
          </p>

          <div
            id="pwResetAlert"
            style={{
              display: pwAlert.show ? "block" : "none",
              padding: "12px 14px",
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 16,
              background: pwAlert.type === "error" ? "#fee2e2" : "#dcfce7",
              color: pwAlert.type === "error" ? "#7f1d1d" : "#14532d",
              borderLeft:
                pwAlert.type === "error"
                  ? "4px solid #dc2626"
                  : "4px solid #16a34a",
            }}
          >
            {pwAlert.msg}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "#444",
                marginBottom: 8,
              }}
            >
              New Password
            </label>
            <input
              type="password"
              id="pwNew"
              ref={pwNewRef}
              placeholder="••••••••"
              minLength="6"
              value={pwNew}
              onChange={(e) => setPwNew(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1.5px solid #e0e0e0",
                borderRadius: 10,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#0b63b7";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e0e0";
              }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "#444",
                marginBottom: 8,
              }}
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="pwConfirm"
              placeholder="••••••••"
              minLength="6"
              value={pwConfirm}
              onChange={(e) => setPwConfirm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1.5px solid #e0e0e0",
                borderRadius: 10,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#0b63b7";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e0e0";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter");
              }}
            />
          </div>

          <button
            id="pwUpdateBtn"
            disabled={pwBtnDisabled}
            style={{
              width: "100%",
              padding: 14,
              background: "linear-gradient(135deg,#0b63b7,#0a4a8f)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(11,99,183,0.3)",
              transition: "opacity 0.2s,transform 0.1s",
            }}
            onMouseOver={(e) => {
              e.target.style.opacity = "0.9";
            }}
            onMouseOut={(e) => {
              e.target.style.opacity = "1";
            }}
          >
            {pwBtnText}
          </button>

          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "#999",
              marginTop: 16,
            }}
          >
            🔒 After updating, you'll be logged in automatically.
          </p>
        </div>
      </div>
    </>
  );
};

export default QuizSelection;
