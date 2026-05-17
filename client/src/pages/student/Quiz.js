import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Quiz = () => {
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
  const [currentUser, setCurrentUser] = useState("haresh");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("medminds-theme") || "light";
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const t = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    // initQuiz();
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("medminds-theme", newTheme);
  };

  // const initQuiz = async () => {
  //   try {
  //     const {
  //       data: { user },
  //     } = await supabase.auth.getUser();
  //     if (!user) {
  //       navigate("/");
  //       return;
  //     }
  //     setCurrentUser(user);

  //     const isCustom = localStorage.getItem("isCustomTest") === "1";
  //     const customAttemptId = localStorage.getItem("customTestAttemptId");
  //     if (isCustom && customAttemptId) {
  //       await initCustomQuiz(user, customAttemptId);
  //       return;
  //     }

  //     const { data: userRow } = await supabase
  //       .from("users")
  //       .select("batch_id")
  //       .eq("id", user.id)
  //       .single();
  //     if (!userRow?.batch_id) {
  //       setLoading(false);
  //       setLoadingText("");
  //       return;
  //     }

  //     const quizId = localStorage.getItem("selectedQuizId");
  //     if (!quizId) {
  //       navigate("/quiz-selection");
  //       return;
  //     }

  //     const { data: qRow } = await supabase
  //       .from("quizzes")
  //       .select("name")
  //       .eq("id", quizId)
  //       .single();
  //     setQuizName(qRow?.name || "Assessment");

  //     const { data: attempts } = await supabase
  //       .from("quiz_attempts")
  //       .select("*")
  //       .eq("user_id", user.id)
  //       .eq("quiz_id", quizId)
  //       .order("created_at", { ascending: false })
  //       .limit(1);
  //     const existing = attempts?.[0] || null;

  //     if (existing) {
  //       if (existing.completed) {
  //         navigate("/result");
  //         return;
  //       }
  //       setAttemptId(existing.id);
  //       setAnswers(existing.answers || {});
  //       setCurrentQuestion(existing.current_question || 0);
  //       setTimeLeft(existing.time_left || 0);
  //     }

  //     const { data: qs } = await supabase
  //       .from("questions")
  //       .select("*")
  //       .eq("quiz_id", quizId)
  //       .order("id", { ascending: true });
  //     setQuestions(qs || []);

  //     if (!qs?.length) {
  //       setLoading(false);
  //       setLoadingText("No questions found.");
  //       return;
  //     }

  //     if (!attemptId) {
  //       setTimeLeft(qs.length * 60);
  //       const { data: newRow } = await supabase
  //         .from("quiz_attempts")
  //         .insert({
  //           user_id: user.id,
  //           quiz_id: quizId,
  //           score: 0,
  //           total: qs.length,
  //           answers: {},
  //           current_question: 0,
  //           time_left: qs.length * 60,
  //           completed: false,
  //         })
  //         .select()
  //         .single();
  //       setAttemptId(newRow.id);
  //     } else if (timeLeft <= 0) {
  //       setTimeLeft(1);
  //     }

  //     setLoading(false);
  //     startTimer();
  //   } catch (e) {
  //     setLoading(false);
  //     setLoadingText("Error: " + e.message);
  //   }
  // };

  // const initCustomQuiz = async (user, customAttemptId) => {
  //   try {
  //     const { data: attempt } = await supabase
  //       .from("custom_test_attempts")
  //       .select("*")
  //       .eq("id", customAttemptId)
  //       .eq("user_id", user.id)
  //       .single();
  //     if (!attempt) {
  //       navigate("/quiz-selection");
  //       return;
  //     }

  //     if (attempt.status === "completed") {
  //       navigate("/result");
  //       return;
  //     }

  //     setQuestions(attempt.questions_json || []);
  //     setAttemptId(attempt.id);
  //     setQuizName("Custom Practice Test");
  //     setTimeLeft(
  //       attempt.time_left && attempt.time_left > 0
  //         ? attempt.time_left
  //         : attempt.duration_seconds || 1,
  //     );
  //     if (attempt.answers && Object.keys(attempt.answers).length > 0) {
  //       setAnswers(attempt.answers);
  //       setCurrentQuestion(attempt.current_question || 0);
  //     }
  //     setLoading(false);
  //     startTimer();
  //   } catch (e) {
  //     setLoading(false);
  //     setLoadingText("Error loading custom test: " + e.message);
  //   }
  // };

  // const startTimer = () => {
  //   const iv = setInterval(() => {
  //     setTimeLeft((prev) => {
  //       if (prev <= 1) {
  //         clearInterval(iv);
  //         submitQuiz();
  //         return 0;
  //       }
  //       saveProgress(prev - 1);
  //       return prev - 1;
  //     });
  //   }, 1000);
  //   setTimerInterval(iv);
  // };

  // const saveProgress = async (time) => {
  //   if (!attemptId) return;
  //   await supabase
  //     .from("quiz_attempts")
  //     .update({
  //       answers: answers,
  //       current_question: currentQuestion,
  //       time_left: time,
  //     })
  //     .eq("id", attemptId);
  // };

  // const selectAnswer = (option) => {
  //   const newAnswers = { ...answers, [currentQuestion]: option };
  //   setAnswers(newAnswers);
  //   if (attemptId) {
  //     supabase
  //       .from("quiz_attempts")
  //       .update({
  //         answers: newAnswers,
  //         current_question: currentQuestion,
  //         time_left: timeLeft,
  //       })
  //       .eq("id", attemptId);
  //   }
  // };

  const prevQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion((prev) => prev - 1);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1)
      setCurrentQuestion((prev) => prev + 1);
  };

  const submitQuiz = async () => {
    if (timerInterval) clearInterval(timerInterval);
    setLoadingText("Submitting...");

    const isCustom = localStorage.getItem("isCustomTest") === "1";
    let score = 0;
    questions.forEach((q, i) => {
      if (answers[String(i)] === q.correct_answer) score++;
    });

    // if (isCustom) {
    //   await supabase
    //     .from("custom_test_attempts")
    //     .update({
    //       status: "completed",
    //       score,
    //       answers,
    //       time_left: 0,
    //     })
    //     .eq("id", attemptId);
    //   localStorage.setItem("customTestScore", score);
    //   localStorage.setItem("customTestTotal", questions.length);
    //   localStorage.setItem("questions", JSON.stringify(questions));
    //   localStorage.setItem("answers", JSON.stringify(answers));
    //   navigate("/result");
    //   // } else {
    //   //   await supabase
    //   //     .from("quiz_attempts")
    //   //     .update({
    //   //       completed: true,
    //   //       score,
    //   //       total: questions.length,
    //   //       answers,
    //   //     })
    //   //     .eq("id", attemptId);
    //   //   navigate("/result");
    //   // }
    // }

    const confirmSubmit = () => {
      if (
        window.confirm(
          "Are you sure you want to submit? You cannot change answers after submission.",
        )
      ) {
        submitQuiz();
      }
    };

    const togglePause = () => setShowPause(!showPause);

    const formatTime = (seconds) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    const answeredCount = Object.keys(answers).length;
    const remainingCount = questions.length - answeredCount;
    const progress =
      questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

    const q = questions[currentQuestion];
    const optKeys = ["option_a", "option_b", "option_c", "option_d"];
    const optLabels = ["A", "B", "C", "D"];

    const timerClass =
      timeLeft < 60 ? "danger" : timeLeft < 300 ? "warning" : "";

    if (loading) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "var(--bg, #eef3fa)",
            color: "var(--muted, #5a6b82)",
          }}
        >
          <div style={{ textAlign: "center" }}>
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
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p>{loadingText}</p>
          </div>
        </div>
      );
    }

    if (!currentUser?.batch_id && !localStorage.getItem("isCustomTest")) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "var(--bg, #eef3fa)",
            padding: 24,
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 440 }}>
            <div
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
              style={{
                fontFamily: "Merriweather, serif",
                fontSize: 22,
                marginBottom: 12,
                color: "var(--text, #0d1f3c)",
              }}
            >
              Quizzes are Batch-Only
            </h2>
            <p style={{ color: "var(--muted, #5a6b82)", marginBottom: 24 }}>
              You need to be enrolled in a batch and approved by admin before
              you can take quizzes.
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
                style={{
                  padding: "13px 28px",
                  background: "linear-gradient(135deg, #0b63b7, #0a4a8f)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                📋 Request Enrollment
              </button>
              <button
                onClick={() => navigate("/quiz-selection")}
                style={{
                  padding: "12px 24px",
                  background: "none",
                  color: "#0b63b7",
                  border: "2px solid var(--border, #dde8f5)",
                  borderRadius: 10,
                  fontWeight: 700,
                  cursor: "pointer",
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
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          background: "var(--bg, #eef3fa)",
          color: "var(--text, #0d1f3c)",
          minHeight: "100vh",
        }}
      >
        <style>{`
        :root { --blue-dark: #072f6b; --blue-mid: #0a4a8f; --blue-main: #0b63b7; --bg: #eef3fa; --card: #ffffff; --border: #dde8f5; --text: #0d1f3c; --muted: #5a6b82; --green: #16a34a; --green-bg: #dcfce7; --amber: #d97706; --amber-bg: #fef3c7; --red: #dc2626; --red-bg: #fee2e2; --radius: 14px; }
        [data-theme="dark"] { --bg: #0d1623; --card: #132039; --border: #1e3a5f; --text: #e8f0fe; --muted: #7fa4cc; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media print { body * { display: none !important; } }
      `}</style>

        <header
          style={{
            background:
              "linear-gradient(135deg, var(--blue-main) 0%, var(--blue-mid) 60%, var(--blue-dark) 100%)",
            position: "sticky",
            top: 0,
            zIndex: 200,
            boxShadow: "0 4px 20px rgba(11,99,183,0.3)",
            height: 56,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 12,
          }}
        >
          <a
            href="/quiz-selection"
            style={{
              color: "#fff",
              textDecoration: "none",
              fontFamily: "'Merriweather', serif",
              fontSize: 17,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
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
            <span
              style={{
                fontFamily: "'Merriweather', serif",
                fontSize: 17,
                fontWeight: 900,
                color: "#fff",
              }}
            >
              MedMinds
            </span>
          </a>

          <div
            style={{
              flex: 1,
              minWidth: 0,
              maxWidth: 280,
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <div
              style={{
                height: 5,
                background: "rgba(255,255,255,0.25)",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: "#fff",
                  borderRadius: 10,
                  transition: "width 0.5s ease",
                  width: `${progress}%`,
                }}
              />
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "rgba(255,255,255,0.85)",
                textAlign: "center",
              }}
            >
              {answeredCount} / {questions.length} answered
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 50,
                padding: "5px 10px",
                ...(timerClass === "warning"
                  ? {
                      background: "rgba(217,119,6,0.35)",
                      borderColor: "rgba(217,119,6,0.6)",
                      animation: "pulse 1s infinite",
                    }
                  : {}),
                ...(timerClass === "danger"
                  ? {
                      background: "rgba(220,38,38,0.4)",
                      borderColor: "rgba(220,38,38,0.7)",
                      animation: "pulse 0.6s infinite",
                    }
                  : {}),
              }}
            >
              <span>⏱</span>
              <span
                style={{
                  fontFamily: "'Merriweather', serif",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
            <button
              onClick={togglePause}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 8,
                padding: "5px 10px",
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(255,255,255,0.9)",
                cursor: "pointer",
              }}
            >
              ⏸ Pause
            </button>
            <button
              onClick={toggleTheme}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 8,
                padding: "5px 8px",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <a
              href="/quiz-selection"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 8,
                padding: "5px 14px",
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(255,255,255,0.9)",
                textDecoration: "none",
              }}
            >
              ← Quit
            </a>
          </div>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 240px",
            minHeight: "calc(100vh - 56px)",
          }}
        >
          <div
            style={{
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
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
                      opacity:
                        currentQuestion === questions.length - 1 ? 0.5 : 1,
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
                  {/* {optKeys.map(
                    (key, i) =>
                      q[key] && (
                        <div
                          key={i}
                          onClick={() =>
                            selectAnswer(optLabels[i].toLowerCase())
                          }
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
                  )} */}
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

          <aside
            style={{
              background: "var(--card)",
              borderLeft: "1px solid var(--border)",
              position: "sticky",
              top: 56,
              height: "calc(100vh - 56px)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "14px 16px 10px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: "'Merriweather', serif",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--text)",
                }}
              >
                Questions
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--muted)",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  padding: "2px 9px",
                  borderRadius: 20,
                }}
              >
                {currentQuestion + 1}/{questions.length}
              </span>
            </div>
            <div
              style={{
                padding: 12,
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                flex: 1,
                overflowY: "auto",
                alignContent: "start",
              }}
            >
              {questions.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentQuestion(i)}
                  style={{
                    width: "calc(20% - 5px)",
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 7,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    background:
                      i === currentQuestion
                        ? "var(--blue-main)"
                        : answers[String(i)]
                          ? "var(--green-bg)"
                          : "var(--bg)",
                    color:
                      i === currentQuestion
                        ? "#fff"
                        : answers[String(i)]
                          ? "var(--green)"
                          : "var(--muted)",
                    border: `2px solid ${i === currentQuestion ? "var(--blue-mid)" : answers[String(i)] ? "var(--green)" : "var(--border)"}`,
                    transition: "all 0.15s",
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <div
              style={{
                padding: "10px 16px",
                borderTop: "1px solid var(--border)",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 7,
              }}
            >
              <div
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "7px 8px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Merriweather', serif",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--blue-main)",
                  }}
                >
                  {answeredCount}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    letterSpacing: "0.4px",
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
                  borderRadius: 8,
                  padding: "7px 8px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Merriweather', serif",
                    fontSize: 17,
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
                    color: "var(--muted)",
                    letterSpacing: "0.4px",
                    marginTop: 3,
                  }}
                >
                  Remaining
                </div>
              </div>
            </div>
          </aside>
        </div>

        {showPause && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              background: "rgba(7,47,107,0.82)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: 36,
                maxWidth: 400,
                width: "100%",
                textAlign: "center",
                boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                animation: "scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both",
              }}
            >
              <style>{`@keyframes scaleIn { from { opacity: 0; transform: scale(0.88); } to { opacity: 1; transform: scale(1); } } @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.65; } }`}</style>
              <div style={{ fontSize: 48, marginBottom: 14 }}>⏸️</div>
              <h2
                style={{
                  fontFamily: "'Merriweather', serif",
                  fontSize: 20,
                  fontWeight: 900,
                  marginBottom: 7,
                }}
              >
                Quiz Paused
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--muted)",
                  lineHeight: 1.6,
                  marginBottom: 10,
                }}
              >
                Your progress and remaining time are saved to the server.
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--green-bg)",
                  color: "var(--green)",
                  padding: "5px 13px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 18,
                }}
              >
                ✅ Progress saved to server
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
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
                    {answeredCount}
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
};

export default Quiz;
