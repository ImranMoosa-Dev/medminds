import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../../components/layout/StudentLayout";
import "../../styles/review.css";

const Review = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    if (typeof document === "undefined") return "light";
    return (
      document.documentElement.getAttribute("data-theme") ||
      localStorage.getItem("medminds-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
    );
  });
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading your progress…");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [attemptId, setAttemptId] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitBtnText, setSubmitBtnText] = useState("✅ Confirm & Submit");

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState("");

  // Pre-init theme on document
  useEffect(() => {
    const s = localStorage.getItem("medminds-theme");
    const d = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute(
      "data-theme",
      s || (d ? "dark" : "light"),
    );
  }, []);

  const applyTheme = (t) => {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("medminds-theme", t);
    setTheme(t);
  };

  useEffect(() => {
    document.title = "Review – MedMinds";
    applyTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Theme button click ──
  //   const onThemeClick = () => applyTheme(theme === "dark" ? "light" : "dark");

  //   useEffect(() => {
  //     const loadReview = async () => {
  //       try {
  //         const {
  //           data: { user },
  //         } = await supabase.auth.getUser();
  //         if (!user) {
  //           window.location.href = "index.html";
  //           return;
  //         }

  //         const quizId = localStorage.getItem("selectedQuizId");
  //         if (!quizId) {
  //           window.location.href = "quiz-selection.html";
  //           return;
  //         }

  //         // Fetch the in-progress (not completed) attempt
  //         const { data: attempts } = await supabase
  //           .from("quiz_attempts")
  //           .select("*")
  //           .eq("user_id", user.id)
  //           .eq("quiz_id", quizId)
  //           .eq("completed", false)
  //           .order("created_at", { ascending: false })
  //           .limit(1);

  //         const attempt = attempts?.[0];
  //         if (!attempt) {
  //           // No in-progress attempt — might already be submitted, go to result
  //           window.location.href = "result.html";
  //           return;
  //         }

  //         setAttemptId(attempt.id);
  //         setAnswers(attempt.answers || {});

  //         // Fetch questions
  //         const { data: qs } = await supabase
  //           .from("questions")
  //           .select("*")
  //           .eq("quiz_id", quizId)
  //           .order("id", { ascending: true });
  //         setQuestions(qs || []);

  //         setLoading(false);
  //       } catch (e) {
  //         console.error("loadReview:", e);
  //         setLoadingText("Error loading review: " + e.message);
  //         setLoading(true);
  //       }
  //     };
  //     loadReview();
  //   }, []);

  //   const goBackTo = async (idx) => {
  // Store which question to jump to, then navigate freshly to quiz.html
  // history.back() uses bfcache so DOMContentLoaded never fires — use location.href instead
  // sessionStorage.setItem("jumpToQuestion", String(idx));

  // Save the jump target to the attempt row so it survives a fresh page load
  //     try {
  //       if (attemptId) {
  //         await supabase
  //           .from("quiz_attempts")
  //           .update({ current_question: idx })
  //           .eq("id", attemptId);
  //       }
  //     } catch (e) {
  //       console.warn("goBackTo save failed:", e);
  //     }

  //     window.location.href = "quiz.html";
  //   };

  //   const finalSubmit = async () => {
  //     setSubmitting(true);
  //     setSubmitBtnText("Submitting…");
  //     try {
  //       // user not needed beyond auth check above, but mirror original
  //       await supabase.auth.getUser();

  //       // Re-fetch latest answers from backend (in case user edited after opening review)
  //       const { data: fresh } = await supabase
  //         .from("quiz_attempts")
  //         .select("answers, total")
  //         .eq("id", attemptId)
  //         .single();

  //       const latestAnswers = fresh?.answers || answers;
  //       const total = fresh?.total || questions.length;

  //       // Calculate score
  //       let score = 0;
  //       questions.forEach((q, i) => {
  //         if (latestAnswers[String(i)] === q.correct_answer) score++;
  //       });

  //       const { error } = await supabase
  //         .from("quiz_attempts")
  //         .update({ completed: true, score, total, answers: latestAnswers })
  //         .eq("id", attemptId);

  //       if (error) throw error;
  //       window.location.href = "result.html";
  //     } catch (e) {
  //       console.error("finalSubmit:", e);
  //       setSubmitting(false);
  //       setSubmitBtnText("✅ Confirm & Submit");
  //       window.alert("Error submitting: " + e.message);
  //     }
  //   };

  const openImgLightbox = (src) => {
    setLightboxSrc(src);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeImgLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeImgLightbox();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const remaining = total - answeredCount;
  const actionMsg =
    remaining > 0
      ? `You have ${remaining} unanswered question(s). You can go back and answer them, or submit now.`
      : "Review your answers above. You can go back and change any answer before final submission.";

  const optMap = { a: "option_a", b: "option_b", c: "option_c", d: "option_d" };
  const labels = { a: "A", b: "B", c: "C", d: "D" };

  return (
    <StudentLayout>
      {/* <header className="site-header">
        <div className="header-inner">
          <a href="quiz-selection.html" className="brand">
            <span className="brand-name">MedMinds</span>
          </a>
          <div className="hdr-right">
            <button className="theme-btn" id="themeBtn">
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button
              className="back-btn"
              onClick={() => {
                window.location.href = "quiz.html";
              }}
              style={{ cursor: "pointer" }}
            >
              ← Back to Quiz
            </button>
          </div>
        </div>
      </header> */}

      <div
        id="loadingState"
        className="loading-overlay"
        style={{ display: loading ? "flex" : "none" }}
      >
        <div className="spinner"></div>
        <p id="loadingText">{loadingText}</p>
      </div>

      <div id="pageContent" style={{ display: loading ? "none" : "block" }}>
        <div className="page">
          {/* Summary */}
          <div className="summary-banner">
            <div className="sstat">
              <div className="sstat-val" id="totalCount">
                {total}
              </div>
              <div className="sstat-lbl">Total</div>
            </div>
            <div className="sstat">
              <div
                className="sstat-val"
                id="answeredCount"
                style={{ color: "var(--green)" }}
              >
                {answeredCount}
              </div>
              <div className="sstat-lbl">Answered</div>
            </div>
            <div className="sstat">
              <div
                className="sstat-val"
                id="unansweredCount"
                style={{ color: "var(--amber)" }}
              >
                {remaining}
              </div>
              <div className="sstat-lbl">Unanswered</div>
            </div>
          </div>

          {/* Question list */}
          <div className="section-head">
            <h2>📋 Review Your Answers</h2>
            <div className="legend">
              <div className="legend-item">
                <div
                  className="leg-dot"
                  style={{ background: "var(--green)" }}
                ></div>
                Answered
              </div>
              <div className="legend-item">
                <div
                  className="leg-dot"
                  style={{ background: "var(--amber)" }}
                ></div>
                Unanswered
              </div>
            </div>
          </div>
          <div className="review-list" id="reviewList">
            {questions.map((q, i) => {
              const given = answers[String(i)] || null;
              const cls = given ? "answered" : "unanswered";
              const pillCls = given ? "answered" : "unanswered";
              const pillTxt = given
                ? `✓ ${labels[given]}: ${q[optMap[given]] || ""}`
                : "○ Not Answered";

              return (
                <div className={`review-card ${cls}`} key={i}>
                  <div className="q-num">{i + 1}</div>
                  <div className="review-card-body">
                    <div className="review-q-text">{q.question}</div>
                    {q.img && (
                      <div className="q-image-frame">
                        <span className="q-image-badge">Image</span>
                        <img
                          src={q.img}
                          alt="Question"
                          onClick={(e) => openImgLightbox(e.currentTarget.src)}
                          onError={(e) => {
                            e.currentTarget.parentElement.style.display =
                              "none";
                          }}
                        />
                      </div>
                    )}
                    <span className={`answer-pill ${pillCls}`}>{pillTxt}</span>
                  </div>
                  <div className="review-card-action">
                    <button className="btn-edit">✏️ Edit</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action bar */}
          <div className="action-bar">
            <p id="actionMsg">{actionMsg}</p>
            <div className="action-btns">
              <button
                className="btn-back"
                onClick={() => {
                  window.location.href = "quiz.html";
                }}
              >
                ← Edit Answers
              </button>
              <button
                className="btn-submit-final"
                id="submitFinalBtn"
                disabled={submitting}
              >
                {submitBtnText}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      <div
        id="qImgLightbox"
        className={lightboxOpen ? "open" : ""}
        onClick={closeImgLightbox}
      >
        <span className="lb-close" onClick={closeImgLightbox}>
          ✕
        </span>
        <img id="qImgLightboxImg" src={lightboxSrc} alt="Question enlarged" />
      </div>
    </StudentLayout>
  );
};

export default Review;
