import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import {
  startCustomQuiz,
  submitCustomQuiz,
  saveCustomQuizProgress,
} from "../../api/customQuizApi";
import { submitQuiz, saveQuizProgress, startQuiz } from "../../api/quizApi";
import "../../styles/quiz.css";

const Quiz = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading your quiz...");
  const [quizName, setQuizName] = useState("");
  const [showPause, setShowPause] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const isCustom = localStorage.getItem("isCustomTest") === "1";

    if (isCustom) {
      const attemptId =
        localStorage.getItem("customTestAttemptId") ||
        localStorage.getItem("customAttemptId");

      if (!attemptId) {
        navigate("/quiz-selection");
        return;
      }

      initCustomQuiz(attemptId);
    } else {
      initQuiz();
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("medminds-theme", newTheme);
  };

  const initQuiz = async () => {
    try {
      setLoading(true);

      const quizId = localStorage.getItem("selectedQuizId");

      if (!quizId) {
        navigate("/quiz-selection");
        return;
      }

      const data = await startQuiz(quizId);

      if (!data.success) {
        setLoading(false);
        setLoadingText("Unable to load quiz");
        return;
      }

      setQuizName(data.quiz.name);

      setQuestions(data.questions || []);

      setAttemptId(data.attempt.id);

      setAnswers(data.attempt.answers || {});

      setCurrentQuestion(data.attempt.current_question || 0);

      setTimeLeft(data.attempt.time_left || 0);

      setLoading(false);

      startTimer();
    } catch (error) {
      console.error(error);

      setLoading(false);
      setLoadingText(error?.response?.data?.message || "Error loading quiz");
    }
  };

  const initCustomQuiz = async (customAttemptId) => {
    try {
      setLoading(true);

      // start custom quiz
      const data = await startCustomQuiz(customAttemptId);

      if (!data.success) {
        setLoading(false);
        setLoadingText("Custom test not found");
        return;
      }

      // Transform questions from backend format (opt1-4) to expected format (option_a-d)
      const transformedQuestions = (data.questions || []).map((q) => ({
        ...q,
        option_a: q.opt1,
        option_b: q.opt2,
        option_c: q.opt3,
        option_d: q.opt4,
      }));

      const attempt = data.attempt;

      setQuestions(transformedQuestions);
      setAttemptId(attempt.id);
      setQuizName(data.quiz?.name || "Custom Practice Test");

      setTimeLeft(
        attempt.time_left > 0 ? attempt.time_left : attempt.duration_seconds,
      );

      setAnswers(attempt.answers || {});
      setCurrentQuestion(attempt.current_question || 0);

      setLoading(false);

      startTimer();
    } catch (error) {
      console.error(error);
      setLoading(false);
      setLoadingText("Error loading custom test");
    }
  };
  const startTimer = () => {
    const iv = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(iv);
          submitQuiz();
          return 0;
        }

        saveProgress(answers, currentQuestion, prev - 1);

        return prev - 1;
      });
    }, 1000);

    setTimerInterval(iv);
  };

  const saveProgress = async (
    updatedAnswers = answers,
    updatedQuestion = currentQuestion,
    updatedTime = timeLeft,
  ) => {
    try {
      if (!attemptId) return;

      const isCustom = localStorage.getItem("isCustomTest") === "1";

      const payload = {
        answers: updatedAnswers,
        current_question: updatedQuestion,
        time_left: updatedTime,
      };
      const apiCall = isCustom
        ? saveCustomQuizProgress(attemptId, payload)
        : saveQuizProgress(attemptId, payload);

      await apiCall;
    } catch (error) {
      console.error("Progress save failed", error);
    }
  };

  const selectAnswer = async (option) => {
    const newAnswers = {
      ...answers,
      [currentQuestion]: option,
    };

    setAnswers(newAnswers);

    await saveProgress(newAnswers, currentQuestion, timeLeft);
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion((prev) => prev - 1);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1)
      setCurrentQuestion((prev) => prev + 1);
  };

  const confirmSubmit = () => {
    if (
      window.confirm(
        "Are you sure you want to submit? You cannot change answers after submission.",
      )
    ) {
      handleSubmitQuiz();
    }
  };

  const togglePause = () => setShowPause(!showPause);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleSubmitQuiz = async () => {
    try {
      if (timerInterval) clearInterval(timerInterval);

      setLoadingText("Submitting...");
      setLoading(true);

      const isCustom = localStorage.getItem("isCustomTest") === "1";

      // submit quiz on condition
      const apiCall = isCustom
        ? submitCustomQuiz(attemptId, answers)
        : submitQuiz(attemptId, answers);
      const typeFlag = isCustom ? "custom" : "quiz";

      const data = await apiCall;

      if (data?.success) {
        localStorage.setItem("quizResult", JSON.stringify(data.result));
        console.log(data);

        navigate(`/result?attempt_id=${attemptId}&type=${typeFlag}`);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Submission failed");
    }
  };

  const answeredCount = Object.keys(answers).length;
  const remainingCount = questions.length - answeredCount;
  const progress =
    questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  const q = questions[currentQuestion];
  const optKeys = ["option_a", "option_b", "option_c", "option_d"];
  const optLabels = ["A", "B", "C", "D"];

  const timerClass = timeLeft < 60 ? "danger" : timeLeft < 300 ? "warning" : "";

  if (loading) {
    return (
      <div className="quiz-page text-center">
        <div style={{ textAlign: "center", paddingTop: 80 }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "4px solid var(--border, #dde8f5)",
              borderTopColor: "#0b63b7",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 14px",
            }}
          />
          <p>{loadingText}</p>
        </div>
      </div>
    );
  }

  if (!auth?.user?.batchId && !localStorage.getItem("isCustomTest")) {
    return (
      <div className="quiz-page" style={{ padding: 24 }}>
        <div
          className="text-center"
          style={{ maxWidth: 440, margin: "0 auto" }}
        >
          <div
            className="pause-icon"
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: "#fef3c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              margin: "0 auto 20px",
            }}
          >
            🔒
          </div>
          <h2
            className="brand-name"
            style={{ fontSize: 22, marginBottom: 12, color: "var(--text)" }}
          >
            Quizzes are Batch-Only
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            You need to be enrolled in a batch and approved by admin before you
            can take quizzes.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => navigate("/batches")}
              className="btn-resume"
              style={{ padding: "13px 28px" }}
            >
              📋 Request Enrollment
            </button>
            <button
              onClick={() => navigate("/quiz-selection")}
              className="btn-quit-pause"
              style={{
                background: "none",
                color: "#0b63b7",
                border: "2px solid var(--border)",
                padding: "12px 24px",
              }}
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      {/* Styles moved to ./quiz.css */}

      <header className="site-header">
        <a href="/quiz-selection" className="brand">
          <svg width="28" height="28" viewBox="0 0 120 100" fill="none">
            <path
              d="M20 72 Q60 96 100 72"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="100" cy="72" r="5.5" fill="rgba(255,255,255,0.8)" />
            <circle cx="20" cy="72" r="3" fill="rgba(255,255,255,0.6)" />
            <rect
              x="22"
              y="18"
              width="22"
              height="48"
              rx="4"
              fill="rgba(255,255,255,0.95)"
            />
            <rect
              x="10"
              y="30"
              width="46"
              height="22"
              rx="4"
              fill="rgba(255,255,255,0.95)"
            />
          </svg>
          <span className="brand-name">MedMinds</span>
        </a>

        <div className="hdr-pw">
          <div className="hdr-pt">
            <div className="hdr-pf" style={{ width: `${progress}%` }} />
          </div>
          <div className="hdr-ptx">
            {answeredCount} / {questions.length} answered
          </div>
        </div>

        <div className="hdr-right">
          <div className={"timer-widget " + timerClass}>
            <span>⏱</span>
            <span className="timer-display">{formatTime(timeLeft)}</span>
          </div>
          <button className="hdr-btn pause-btn" onClick={togglePause}>
            ⏸ <span className="hdr-btn-text">Pause</span>
          </button>
          <button className="theme-btn hdr-btn" onClick={toggleTheme}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <a href="/quiz-selection" className="hdr-btn back-btn">
            ← <span className="hdr-btn-text">Quit</span>
          </a>
        </div>
      </header>

      <div className="quiz-layout">
        <div className="question-panel">
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              boxShadow: "0 4px 24px rgba(10,74,143,0.1)",
              overflow: "hidden",
              animation: "fadeUp 0.3s ease both",
            }}
          >
            <div
              style={{
                background:
                  "linear-gradient(135deg, var(--blue-main), var(--blue-mid))",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    background: "rgba(255,255,255,0.22)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontFamily: "'Merriweather', serif",
                  }}
                >
                  Q{currentQuestion + 1}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  {currentQuestion + 1} of {questions.length}
                </span>
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 7,
                    padding: "4px 9px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.85)",
                    cursor: currentQuestion === 0 ? "not-allowed" : "pointer",
                    opacity: currentQuestion === 0 ? 0.5 : 1,
                  }}
                >
                  ← Prev
                </button>
                <button
                  onClick={nextQuestion}
                  disabled={currentQuestion === questions.length - 1}
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 7,
                    padding: "4px 9px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.85)",
                    cursor:
                      currentQuestion === questions.length - 1
                        ? "not-allowed"
                        : "pointer",
                    opacity: currentQuestion === questions.length - 1 ? 0.5 : 1,
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
            <div style={{ padding: "20px 16px" }}>
              {q && (
                <h2
                  style={{
                    fontFamily: "'Merriweather', serif",
                    fontSize: 15,
                    fontWeight: 700,
                    lineHeight: 1.65,
                    marginBottom: 18,
                  }}
                >
                  {q.question}
                </h2>
              )}
              {q?.img && (
                <div
                  style={{
                    margin: "14px 0 4px",
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "2px solid var(--border)",
                    background: "var(--bg)",
                  }}
                >
                  <img
                    src={q.img}
                    alt="Question"
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                  />
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 9,
                  marginTop: 18,
                }}
              >
                {optKeys.map(
                  (key, i) =>
                    q[key] && (
                      <div
                        key={i}
                        onClick={() => selectAnswer(optLabels[i].toLowerCase())}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          background:
                            answers[String(currentQuestion)] ===
                            optLabels[i].toLowerCase()
                              ? "rgba(11,99,183,0.08)"
                              : "var(--bg)",
                          border: `2px solid ${answers[String(currentQuestion)] === optLabels[i].toLowerCase() ? "var(--blue-main)" : "var(--border)"}`,
                          borderRadius: 12,
                          padding: "12px 14px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 7,
                            flexShrink: 0,
                            background:
                              answers[String(currentQuestion)] ===
                              optLabels[i].toLowerCase()
                                ? "var(--blue-main)"
                                : "var(--border)",
                            color:
                              answers[String(currentQuestion)] ===
                              optLabels[i].toLowerCase()
                                ? "#fff"
                                : "var(--muted)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 800,
                            marginTop: 1,
                          }}
                        >
                          {optLabels[i]}
                        </div>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: "var(--text)",
                          }}
                        >
                          {q[key]}
                        </span>
                      </div>
                    ),
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "var(--card)",
                border: "2px solid var(--border)",
                borderRadius: 10,
                padding: "9px 14px",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text)",
                cursor: currentQuestion === 0 ? "not-allowed" : "pointer",
                opacity: currentQuestion === 0 ? 0.5 : 1,
              }}
            >
              ← Previous
            </button>
            <button
              onClick={nextQuestion}
              disabled={currentQuestion === questions.length - 1}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "var(--card)",
                border: "2px solid var(--border)",
                borderRadius: 10,
                padding: "9px 14px",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text)",
                cursor:
                  currentQuestion === questions.length - 1
                    ? "not-allowed"
                    : "pointer",
                opacity: currentQuestion === questions.length - 1 ? 0.5 : 1,
              }}
            >
              Next →
            </button>
            <button
              onClick={confirmSubmit}
              style={{
                background:
                  "linear-gradient(135deg, var(--blue-main), var(--blue-mid))",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                marginLeft: "auto",
                boxShadow: "0 4px 16px rgba(11,99,183,0.3)",
              }}
            >
              📋 Submit Quiz
            </button>
          </div>
        </div>

        <aside className="sidebar">
          <div className="sidebar-head">
            <span className="sidebar-title">Questions</span>
            <span className="sidebar-count">
              {currentQuestion + 1}/{questions.length}
            </span>
          </div>
          <div className="question-palette">
            {questions.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentQuestion(i)}
                className={`palette-item ${i === currentQuestion ? "active" : answers[String(i)] ? "done" : ""}`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <div className="sidebar-stats">
            <div className="sstat">
              <div className="sstat-val">{answeredCount}</div>
              <div className="sstat-lbl">Answered</div>
            </div>
            <div className="sstat">
              <div className="sstat-val">{remainingCount}</div>
              <div className="sstat-lbl">Remaining</div>
            </div>
          </div>
        </aside>
      </div>

      {showPause && (
        <div className="pause-overlay">
          <div className="pause-card">
            <div className="pause-emoji">⏸️</div>
            <h2 className="pause-title">Quiz Paused</h2>
            <p className="pause-desc">
              Your progress and remaining time are saved to the server.
            </p>
            <div className="pause-saved">✅ Progress saved to server</div>
            <div className="pause-grid">
              <div className="pause-grid-item">
                <div className="pause-grid-val">{answeredCount}</div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "var(--muted)",
                    marginTop: 3,
                  }}
                >
                  Answered
                </div>
              </div>
              <div
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "10px 6px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Merriweather', serif",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--blue-main)",
                  }}
                >
                  {remainingCount}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "var(--muted)",
                    marginTop: 3,
                  }}
                >
                  Remaining
                </div>
              </div>
              <div
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "10px 6px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Merriweather', serif",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--blue-main)",
                  }}
                >
                  {formatTime(timeLeft)}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "var(--muted)",
                    marginTop: 3,
                  }}
                >
                  Time Left
                </div>
              </div>
            </div>
            <button
              onClick={togglePause}
              style={{
                width: "100%",
                background:
                  "linear-gradient(135deg, var(--blue-main), var(--blue-mid))",
                color: "#fff",
                border: "none",
                borderRadius: 11,
                padding: 13,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: 9,
              }}
            >
              ▶ Resume Quiz
            </button>
            <button
              onClick={() => navigate("/quiz-selection")}
              style={{
                width: "100%",
                background: "var(--red-bg)",
                color: "var(--red)",
                border: "2px solid var(--red)",
                borderRadius: 11,
                padding: 11,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              🚪 Save & Exit
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

export default Quiz;
