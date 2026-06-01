import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCustomQuizResult } from "../../api/customQuizApi";
import { getQuizResult } from "../../api/quizApi";
import { useSearchParams } from "react-router-dom";
import "../../styles/result.css";

const Result = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading your results…");
  const [awaiting, setAwaiting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [adminView, setAdminView] = useState(false);

  // get attempt id from URL
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get("attempt_id");
  const type = searchParams.get("type");

  const [hero, setHero] = useState({
    avatar: "?",
    name: "Student",
    quiz: "Quiz",
    pct: 0,
    fraction: "0 / 0 marks obtained",
    correct: 0,
    wrong: 0,
    skipped: 0,
  });
  const [allReviewData, setAllReviewData] = useState([]);
  const [reviewFilter, setReviewFilter] = useState("all");
  const [isReviewMode, setIsReviewMode] = useState(false);

  const [lightbox, setLightbox] = useState({ open: false, src: "" });
  const ringFillRef = useRef(null);
  const ringPctRef = useRef(null);

  useEffect(() => {
    // initResult();

    const escHandler = (e) => {
      if (e.key === "Escape") closeImgLightbox();
    };
    document.addEventListener("keydown", escHandler);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyTheme = (t) => {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("medminds-theme", t);
    setTheme(t);
  };

  const animateRing = (pct) => {
    setTimeout(() => {
      const circ = 2 * Math.PI * 60;
      const offset = circ - (pct / 100) * circ;
      const ring = ringFillRef.current;
      if (ring) {
        ring.style.strokeDashoffset = offset;
        const col = pct >= 80 ? "#16a34a" : pct >= 60 ? "#d97706" : "#dc2626";
        ring.style.stroke = col;
        if (ringPctRef.current) ringPctRef.current.style.color = col;
      }
    }, 150);
  };

  useEffect(() => {
    if (!attemptId) return;

    const fetchResult = async () => {
      try {
        setLoading(true);

        // get custom quiz result
        let data;
        if (type === "custom") {
          data = await getCustomQuizResult(attemptId);
        } else {
          data = await getQuizResult(attemptId);
        }

        setHero(data.hero);
        setAllReviewData(data.reviewData);

        setLoading(false);
        setShowResult(true);

        animateRing(data.hero.pct);
      } catch (err) {
        console.error(err);
        setLoadingText("Failed to load result");
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);
  // const initCustomResult = async (user) => {
  //   try {
  //     const questions = JSON.parse(localStorage.getItem("questions") || "[]");
  //     const savedAnswers = JSON.parse(localStorage.getItem("answers") || "{}");
  //     const score = parseInt(localStorage.getItem("customTestScore") || "0");
  //     const total = parseInt(
  //       localStorage.getItem("customTestTotal") || questions.length,
  //     );
  //     const isReview = localStorage.getItem("customTestReview") === "1";

  //     if (!questions.length) {
  //       window.location.href = "quiz-selection.html";
  //       return;
  //     }

  //     const { data: uRows } = await supabase
  //       .from("users")
  //       .select("first_name, last_name")
  //       .eq("id", user.id);
  //     const u = uRows?.[0];
  //     const fullName =
  //       [u?.first_name, u?.last_name].filter(Boolean).join(" ") ||
  //       user.email ||
  //       "Student";

  //     let quizName = "Custom Test";
  //     try {
  //       const meta = JSON.parse(localStorage.getItem("customTestMeta") || "{}");
  //       const topics = meta.topics || [];
  //       if (topics.length > 3) quizName = "Grand Test";
  //       else if (topics.length > 0) quizName = topics.join(" + ");
  //     } catch (_) {}

  //     if (isReview) quizName = "🔍 Review: " + quizName;

  //     const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  //     let correct = 0,
  //       wrong = 0,
  //       skipped = 0;
  //     questions.forEach((q, i) => {
  //       const g = savedAnswers[String(i)];
  //       if (!g) skipped++;
  //       else if (g === q.correct_answer) correct++;
  //       else wrong++;
  //     });

  // setHero({
  //   avatar: fullName.charAt(0).toUpperCase(),
  //   name: fullName,
  //   quiz: quizName,
  //   pct,
  //   fraction: `${score} / ${total} marks obtained`,
  //   correct,
  //   wrong,
  //   skipped,
  // });

  //     animateRing(pct);

  //     const reviewData = questions.map((q, i) => {
  //       const g = savedAnswers[String(i)] || null;
  //       let status = "unattempted";
  //       if (g && g === q.correct_answer) status = "correct";
  //       else if (g) status = "wrong";
  //       return { q, i, given: g, status };
  //     });
  //     setAllReviewData(reviewData);
  //     setIsReviewMode(isReview);

  //     setLoading(false);
  //     setShowResult(true);

  //     if (isReview) localStorage.removeItem("customTestReview");
  //   } catch (e) {
  //     console.error("initCustomResult:", e);
  //     setLoading(false);
  //     setLoadingText("Error loading results: " + e.message);
  //   }
  // };

  // const initResult = async () => {
  //   try {
  //     const {
  //       data: { user },
  //     } = await supabase.auth.getUser();
  //     if (!user) {
  //       navigate("/");
  //       return;
  //     }

  //     const isCustomTest = localStorage.getItem("isCustomTest") === "1";
  //     if (isCustomTest) {
  //       await initCustomResult(user);
  //       return;
  //     }

  //     const params = new URLSearchParams(window.location.search);
  //     const adminUserId = params.get("adminUserId");
  //     const paramQuizId = params.get("quizId");
  //     const isAdminView = !!(adminUserId && paramQuizId);

  //     const adminEmails = ["admin@medminds.com", "service.medminds@gmail.com"];
  //     const isAdmin = adminEmails.includes(user.email);

  //     if (isAdminView && !isAdmin) {
  //       setLoading(false);
  //       setLoadingText("Access denied.");
  //       return;
  //     }

  //     const targetUserId = isAdminView ? adminUserId : user.id;
  //     const quizId = isAdminView
  //       ? paramQuizId
  //       : localStorage.getItem("selectedQuizId");

  //     if (!quizId) {
  //       window.location.href = "quiz-selection.html";
  //       return;
  //     }

  //     if (isAdminView) setAdminView(true);

  //     const { data: attempts } = await supabase
  //       .from("quiz_attempts")
  //       .select("*")
  //       .eq("user_id", targetUserId)
  //       .eq("quiz_id", quizId)
  //       .order("created_at", { ascending: false })
  //       .limit(1);

  //     const attempt = attempts?.[0];

  //     if (!attempt || !attempt.completed) {
  //       if (isAdminView) {
  //         setLoading(false);
  //         setLoadingText("This student has not completed this quiz yet.");
  //         return;
  //       }
  //       window.location.href = "quiz.html";
  //       return;
  //     }

  //     if (!attempt.is_published && !isAdminView) {
  //       setLoading(false);
  //       setAwaiting(true);
  //       return;
  //     }

  //     const { data: quizRow } = await supabase
  //       .from("quizzes")
  //       .select("name")
  //       .eq("id", quizId)
  //       .single();
  //     const quizName = quizRow?.name || "Assessment";

  //     const { data: uRows } = await supabase
  //       .from("users")
  //       .select("first_name, last_name")
  //       .eq("id", targetUserId);
  //     const u = uRows?.[0];
  //     const fullName =
  //       [u?.first_name, u?.last_name].filter(Boolean).join(" ") ||
  //       user.email ||
  //       "Student";

  //     const { data: qs } = await supabase
  //       .from("questions")
  //       .select("*")
  //       .eq("quiz_id", quizId)
  //       .order("id", { ascending: true });
  //     const questions = qs || [];

  //     const savedAnswers = attempt.answers || {};
  //     const score = attempt.score || 0;
  //     const total = attempt.total || questions.length;
  //     const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  //     let correct = 0,
  //       wrong = 0,
  //       skipped = 0;
  //     questions.forEach((q, i) => {
  //       const g = savedAnswers[String(i)];
  //       if (!g) skipped++;
  //       else if (g === q.correct_answer) correct++;
  //       else wrong++;
  //     });

  //     setHero({
  //       avatar: fullName.charAt(0).toUpperCase(),
  //       name: fullName,
  //       quiz: quizName,
  //       pct,
  //       fraction: `${score} / ${total} marks obtained`,
  //       correct,
  //       wrong,
  //       skipped,
  //     });

  //     animateRing(pct);

  //     const reviewData = questions.map((q, i) => {
  //       const g = savedAnswers[String(i)] || null;
  //       let status = "unattempted";
  //       if (g && g === q.correct_answer) status = "correct";
  //       else if (g) status = "wrong";
  //       return { q, i, given: g, status };
  //     });
  //     setAllReviewData(reviewData);

  //     setLoading(false);
  //     setShowResult(true);
  //   } catch (e) {
  //     console.error("initResult:", e);
  //     setLoading(false);
  //     setLoadingText("Error loading results: " + e.message);
  //   }
  // };

  const filterReview = (type) => setReviewFilter(type);

  const openImgLightbox = (src) => {
    setLightbox({ open: true, src });
    document.body.style.overflow = "hidden";
  };
  const closeImgLightbox = () => {
    setLightbox({ open: false, src: "" });
    document.body.style.overflow = "";
  };

  const filteredReview =
    reviewFilter === "all"
      ? allReviewData
      : allReviewData.filter((r) => r.status === reviewFilter);
  const optKeys = ["option_a", "option_b", "option_c", "option_d"];
  const labels = ["A", "B", "C", "D"];
  const vals = ["a", "b", "c", "d"];

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a href="quiz-selection.html" className="brand">
            <span className="brand-name">MedMinds</span>
          </a>
          <div className="hdr-right">
            <button
              className="theme-btn"
              id="themeBtn"
              onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <a href="quiz-selection.html" className="hdr-link">
              ← Quizzes
            </a>
            <a href="leaderboard.html" className="hdr-link">
              🏆 Leaderboard
            </a>
          </div>
        </div>
      </header>

      {adminView && (
        <div
          style={{
            background: "#072f6b",
            color: "#fff",
            padding: "10px 24px",
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          🔒 <span>Admin View — Viewing student result</span>
          <button
            onClick={() => window.close()}
            style={{
              marginLeft: "auto",
              background: "rgba(255,255,255,.2)",
              border: "none",
              color: "#fff",
              padding: "4px 12px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Close
          </button>
        </div>
      )}

      {loading && (
        <div id="loadingState" className="loading-overlay">
          <div className="spinner"></div>
          <p id="loadingText">{loadingText}</p>
        </div>
      )}

      {awaiting && (
        <div id="awaitingScreen">
          <div className="awaiting-wrap">
            <div className="awaiting-card">
              <div className="icon">⏳</div>
              <h2>Quiz Submitted!</h2>
              <p>
                Your answers have been saved. Results will be visible once your
                instructor publishes them.
              </p>
              <div className="score-locked">🔒 Results Pending Publication</div>
              <br />
              <a href="quiz-selection.html" className="btn-primary-full">
                ← Back to Quizzes
              </a>
            </div>
          </div>
        </div>
      )}

      {showResult && (
        <div id="resultScreen">
          <div className="result-page">
            <div className="result-hero">
              <div className="result-avatar" id="resultAvatar">
                {hero.avatar}
              </div>
              <div className="result-name" id="resultName">
                {hero.name}
              </div>
              <div className="result-quiz" id="resultQuiz">
                {hero.quiz}
              </div>

              <div className="score-ring">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle
                    className="ring-bg"
                    cx="70"
                    cy="70"
                    r="60"
                    strokeDasharray="377"
                    strokeDashoffset="0"
                  />
                  <circle
                    className="ring-fill"
                    id="ringFill"
                    ref={ringFillRef}
                    cx="70"
                    cy="70"
                    r="60"
                    strokeDasharray="377"
                    strokeDashoffset="377"
                  />
                </svg>
                <div className="ring-text">
                  <span className="ring-pct" id="ringPct" ref={ringPctRef}>
                    {hero.pct}%
                  </span>
                  <span className="ring-lbl">Score</span>
                </div>
              </div>

              <div className="result-fraction" id="resultFraction">
                {hero.fraction}
              </div>

              <div className="stat-row">
                <div className="stat-box">
                  <div className="stat-val val-green" id="resCorrect">
                    {hero.correct}
                  </div>
                  <div className="stat-lbl">Correct</div>
                </div>
                <div className="stat-box">
                  <div className="stat-val val-red" id="resWrong">
                    {hero.wrong}
                  </div>
                  <div className="stat-lbl">Wrong</div>
                </div>
                <div className="stat-box">
                  <div className="stat-val val-amber" id="resSkipped">
                    {hero.skipped}
                  </div>
                  <div className="stat-lbl">Skipped</div>
                </div>
              </div>

              <div className="result-actions">
                <a
                  href={
                    isReviewMode ? "custom-history.html" : "quiz-selection.html"
                  }
                  className="btn-action ghost"
                >
                  {isReviewMode ? "← My Tests" : "📚 Back to Quizzes"}
                </a>
                <a href="leaderboard.html" className="btn-action primary">
                  🏆 View Leaderboard
                </a>
              </div>
            </div>

            <div className="review-section">
              <div className="review-header">
                <h2>📋 Full Review</h2>
                <div className="filter-row">
                  <button
                    className={`filter-btn${reviewFilter === "all" ? " active" : ""}`}
                    onClick={() => filterReview("all")}
                  >
                    All
                  </button>
                  <button
                    className={`filter-btn${reviewFilter === "correct" ? " active" : ""}`}
                    onClick={() => filterReview("correct")}
                  >
                    ✅ Correct
                  </button>
                  <button
                    className={`filter-btn${reviewFilter === "wrong" ? " active" : ""}`}
                    onClick={() => filterReview("wrong")}
                  >
                    ❌ Wrong
                  </button>
                  <button
                    className={`filter-btn${reviewFilter === "unattempted" ? " active" : ""}`}
                    onClick={() => filterReview("unattempted")}
                  >
                    ⚠️ Skipped
                  </button>
                </div>
              </div>
              <div className="review-cards" id="reviewCards">
                {filteredReview.length === 0 ? (
                  <p
                    style={{
                      color: "var(--muted)",
                      padding: 20,
                      textAlign: "center",
                    }}
                  >
                    No questions to show.
                  </p>
                ) : (
                  filteredReview.map(({ q, i, given, status }) => {
                    const bCls = {
                      correct: "badge-correct",
                      wrong: "badge-wrong",
                      unattempted: "badge-unattempted",
                    }[status];
                    const bTxt = {
                      correct: "✅ Correct",
                      wrong: "❌ Wrong",
                      unattempted: "⚠️ Skipped",
                    }[status];
                    return (
                      <div key={i} className={`review-card ${status}`}>
                        <div className="rc-head">
                          <span className="rc-qnum">Q{i + 1}</span>
                          <span className="rc-qtext">{q.question}</span>
                          <span className={`rc-badge ${bCls}`}>{bTxt}</span>
                        </div>
                        {q.img && (
                          <div className="q-image-frame">
                            <span className="q-image-badge">Image</span>
                            <img
                              src={q.img}
                              alt="Question"
                              onClick={(e) => openImgLightbox(e.target.src)}
                              onError={(e) => {
                                e.target.parentElement.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                        <div className="rc-options">
                          {optKeys.map((key, idx) => {
                            if (!q[key]) return null;
                            const v = vals[idx];
                            const isCorrect = v === q.correct_answer;
                            const isUserPick = v === given;
                            const cls = isCorrect
                              ? "opt-correct"
                              : isUserPick && !isCorrect
                                ? "opt-wrong-pick"
                                : "";
                            const icon = isCorrect
                              ? " ✓"
                              : isUserPick && !isCorrect
                                ? " ✗"
                                : "";
                            return (
                              <div key={idx} className={`rc-opt ${cls}`}>
                                <div className="rc-opt-letter">
                                  {labels[idx]}
                                </div>
                                <div className="rc-opt-text">
                                  {q[key]}
                                  {icon && <strong>{icon}</strong>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {q.explanation && (
                          <div className="rc-explanation">
                            <strong>💡 Explanation</strong>
                            <p>{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        id="qImgLightbox"
        className={lightbox.open ? "open" : ""}
        onClick={closeImgLightbox}
      >
        <span className="lb-close" onClick={closeImgLightbox}>
          ✕
        </span>
        <img id="qImgLightboxImg" src={lightbox.src} alt="Question enlarged" />
      </div>
    </>
  );
};

export default Result;
