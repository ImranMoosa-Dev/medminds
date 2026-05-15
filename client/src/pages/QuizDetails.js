import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function QuizDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [customAttempt, setCustomAttempt] = useState(null);
  const [existingAttempt, setExistingAttempt] = useState(null);
  const [batch, setBatch] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);

  const isCustom = searchParams.get("custom") === "1";
  const attemptId = searchParams.get("attempt_id");
  const quizId = searchParams.get("quiz_id");

  //   useEffect(() => {
  //     const init = async () => {
  //       try {
  //         const { data: { user } } = await supabase.auth.getUser();
  //         if (!user) { navigate('/login'); return; }

  //         applyTheme();

  //         if (isCustom && attemptId) {
  //           await loadCustomTest(attemptId, user.id);
  //         } else if (quizId) {
  //           await loadQuiz(quizId, user.id);
  //         } else {
  //           setError('No quiz ID found in the URL.');
  //         }
  //       } catch (err) {
  //         setError(err.message);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     init();
  //   }, []);

  //   const loadCustomTest = async (attemptId, userId) => {
  //     const { data: attempt, error } = await supabase
  //       .from('custom_test_attempts')
  //       .select('*')
  //       .eq('id', attemptId)
  //       .eq('user_id', userId)
  //       .single();

  //     if (error || !attempt) { setError('Custom test not found or access denied.'); return; }
  //     setCustomAttempt(attempt);
  //     setQuestionCount(attempt.questions_json?.length || 0);
  //   };

  //   const loadQuiz = async (quizId, userId) => {
  //     const { data: quizData, error: quizError } = await supabase
  //       .from('quizzes')
  //       .select('*')
  //       .eq('id', quizId)
  //       .single();

  //     if (quizError || !quizData) { setError('Quiz not found.'); return; }
  //     setQuiz(quizData);

  //     const { count } = await supabase
  //       .from('questions')
  //       .select('id', { count: 'exact', head: true })
  //       .eq('quiz_id', quizId);
  //     setQuestionCount(count || 0);

  //     if (quizData.batch_id) {
  //       const { data: batchData } = await supabase
  //         .from('batches')
  //         .select('name, description')
  //         .eq('id', quizData.batch_id)
  //         .single();
  //       setBatch(batchData);

  //       const { data: profile } = await supabase
  //         .from('users')
  //         .select('batch_id')
  //         .eq('id', userId)
  //         .single();

  //       if (profile && profile.batch_id !== quizData.batch_id) {
  //         setError('BATCH_RESTRICTED');
  //         return;
  //       }
  //     }

  //     const { data: existing } = await supabase
  //       .from('quiz_attempts')
  //       .select('id, score, total, created_at')
  //       .eq('quiz_id', quizId)
  //       .eq('user_id', userId)
  //       .maybeSingle();
  //     setExistingAttempt(existing);
  //   };

  const startQuiz = () => {
    localStorage.setItem("selectedQuizId", quiz.id);
    navigate("/quiz");
  };

  const startCustomTest = () => {
    localStorage.setItem("isCustomTest", "1");
    localStorage.setItem("customTestAttemptId", customAttempt.id);
    localStorage.removeItem("selectedQuizId");
    navigate("/quiz");
  };

  if (loading) {
    return (
      <div
        className="container"
        style={{ maxWidth: 900, margin: "0 auto", padding: "20px" }}
      >
        <div style={{ textAlign: "center", padding: 60 }}>
          <LoadingSpinner />
          <p style={{ color: "var(--muted)", marginTop: 16 }}>
            Loading quiz details...
          </p>
        </div>
      </div>
    );
  }

  if (error === "BATCH_RESTRICTED") {
    return (
      <div
        className="container"
        style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}
      >
        <Card style={{ textAlign: "center", padding: "48px 30px" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🔒</div>
          <h2 style={{ color: "#c62828", marginBottom: 12 }}>
            Access Restricted
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            <strong style={{ color: "var(--text)" }}>{quiz?.name}</strong> is
            only available to students enrolled in:
          </p>
          <div
            style={{
              display: "inline-block",
              background: "#ffebee",
              color: "#c62828",
              padding: "8px 20px",
              borderRadius: 20,
              fontWeight: 700,
              fontSize: 14,
              margin: "12px 0 24px",
            }}
          >
            📦 {batch?.name || "another batch"}
          </div>
          <br />
          <Button
            onClick={() => navigate("/quiz-selection")}
            style={{
              padding: "12px 28px",
              background: "linear-gradient(135deg,#0b63b7,#0a4a8f)",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            ← View Available Quizzes
          </Button>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="container"
        style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}
      >
        <Card style={{ textAlign: "center", padding: "48px 30px" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
          <h3 style={{ marginBottom: 8 }}>Error</h3>
          <p>{error}</p>
          <br />
          <Button
            onClick={() => navigate("/quiz-selection")}
            style={{
              padding: "10px 22px",
              background: "#c62828",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ← Back to Quizzes
          </Button>
        </Card>
      </div>
    );
  }

  if (isCustom && customAttempt) {
    return (
      <CustomTestView
        attempt={customAttempt}
        onStart={startCustomTest}
        onBack={() => navigate("/create-test")}
      />
    );
  }

  return (
    <QuizView
      quiz={quiz}
      questionCount={questionCount}
      batch={batch}
      existingAttempt={existingAttempt}
      onStart={startQuiz}
      onBack={() => navigate("/quiz-selection")}
    />
  );
}

function CustomTestView({ attempt, onStart, onBack }) {
  const mcqCount = attempt.total || attempt.questions_json?.length || 0;
  const durSecs = attempt.duration_seconds || mcqCount * 60;
  const durH = Math.floor(durSecs / 3600);
  const durM = Math.floor((durSecs % 3600) / 60);
  const durText = durH > 0 ? `${durH}h ${durM}min` : `${durM} min`;

  const subjects = (attempt.subjects || []).join(", ") || "—";
  const topics = attempt.topics || [];
  const subtopics = attempt.subtopics || [];

  const topicTags = topics
    .slice(0, 8)
    .map((t) => <span className="tag tag-blue">{t}</span>)
    .concat(
      topics.length > 8
        ? [
            <span key="more" className="tag tag-purple">
              +{topics.length - 8} more
            </span>,
          ]
        : [],
    );
  const subtopicTags = subtopics
    .slice(0, 6)
    .map((s) => <span className="tag tag-green">{s}</span>)
    .concat(
      subtopics.length > 6
        ? [
            <span key="more" className="tag tag-purple">
              +{subtopics.length - 6} more
            </span>,
          ]
        : [],
    );

  return (
    <div
      className="container"
      style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}
    >
      <Header
        title="📚 Quiz Details"
        subtitle="Review the quiz information before you start"
        backHref="/quiz-selection"
      />
      <Card>
        <div className="tag-row">
          <span className="tag tag-purple">🧪 Custom Practice Test</span>
          <span className="tag tag-blue">🎲 Random &amp; Shuffled</span>
        </div>
        <div className="quiz-title">Custom Test — {subjects}</div>
        <div className="quiz-subtitle">
          Generated on{" "}
          {new Date(attempt.created_at).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
        <div className="details-grid">
          <div className="detail-item">
            <div className="detail-label">❓ Questions</div>
            <div className="detail-value" style={{ color: "#2e7d32" }}>
              {mcqCount}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">⏱️ Duration</div>
            <div className="detail-value">{durText}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">📚 Subjects</div>
            <div className="detail-value sm">{subjects}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">📖 Topics</div>
            <div className="detail-value sm">{topics.length} selected</div>
          </div>
        </div>
        {topics.length > 0 && (
          <div className="info-box blue">
            <strong>📖 Topics</strong>
            <div className="tag-row" style={{ marginTop: 10 }}>
              {topicTags}
            </div>
          </div>
        )}
        {subtopics.length > 0 && (
          <div className="info-box green">
            <strong>🔬 Subtopics</strong>
            <div className="tag-row" style={{ marginTop: 10 }}>
              {subtopicTags}
            </div>
          </div>
        )}
        <div className="info-box blue" style={{ marginTop: 12 }}>
          <strong>📌 How it works</strong>
          <p>
            Questions are randomly selected &amp; shuffled from your chosen
            subtopics. Every attempt gives you a fresh set of questions. The
            timer auto-submits when time runs out.
          </p>
        </div>
        <div className="cta-row">
          <button className="btn-start" onClick={onStart}>
            🚀 Start Test
          </button>
          <button className="btn-back-2" onClick={onBack}>
            ← Create Another
          </button>
        </div>
      </Card>
    </div>
  );
}

function QuizView({
  quiz,
  questionCount,
  batch,
  existingAttempt,
  onStart,
  onBack,
}) {
  const publishedDate = quiz.scheduled_date
    ? new Date(quiz.scheduled_date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not scheduled";

  const estimatedMins = questionCount
    ? Math.ceil((questionCount / 40) * 60)
    : "--";

  return (
    <div
      className="container"
      style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}
    >
      <Header
        title="📚 Quiz Details"
        subtitle="Review the quiz information before you start"
        backHref="/quiz-selection"
      />
      <Card>
        <div className="quiz-title">{quiz.name}</div>
        <div className="quiz-subtitle">
          Quiz #{quiz.quiz_order} · {publishedDate}
        </div>
        <div className="tag-row">
          <span
            className={quiz.is_published ? "tag tag-green" : "tag tag-orange"}
          >
            {quiz.is_published ? "✅ Published" : "⏳ Draft"}
          </span>
          {quiz.type && <span className="tag tag-blue">📋 {quiz.type}</span>}
          {quiz.syllabus && (
            <span className="tag tag-purple">📚 {quiz.syllabus}</span>
          )}
          <span className={quiz.batch_id ? "tag tag-orange" : "tag tag-green"}>
            {quiz.batch_id ? "🔒 Batch Restricted" : "🌐 Open to All"}
          </span>
        </div>
        <div className="details-grid">
          <div className="detail-item">
            <div className="detail-label">❓ Questions</div>
            <div className="detail-value" style={{ color: "#2e7d32" }}>
              {questionCount}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">⏱️ Est. Duration</div>
            <div className="detail-value">
              {estimatedMins}
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                }}
              >
                {" "}
                min
              </span>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">📋 Type</div>
            <div className="detail-value sm">{quiz.type || "—"}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">📚 Syllabus</div>
            <div className="detail-value sm">{quiz.syllabus || "—"}</div>
          </div>
        </div>
        {quiz.description && (
          <div className="info-box blue">
            <strong>📖 Description</strong>
            <p>{quiz.description}</p>
          </div>
        )}
        {batch && (
          <div className="info-box green">
            <strong>📦 Assigned Batch: {batch.name}</strong>
            {batch.description && <p>{batch.description}</p>}
          </div>
        )}
        <div className="cta-row">
          {!quiz.is_published ? (
            <button className="btn-start" disabled>
              ⏳ Not Yet Published
            </button>
          ) : existingAttempt ? (
            <div
              className="info-box orange"
              style={{ textAlign: "center", width: "100%", marginBottom: 0 }}
            >
              <strong>✅ Already Attempted</strong>
              <p>
                You scored{" "}
                <strong>
                  {existingAttempt.score}/{existingAttempt.total} (
                  {Math.round(
                    (existingAttempt.score / existingAttempt.total) * 100,
                  )}
                  %)
                </strong>{" "}
                on {new Date(existingAttempt.created_at).toLocaleDateString()}.
                <br />
                Each quiz can only be attempted once.
              </p>
            </div>
          ) : (
            <button className="btn-start" onClick={onStart}>
              🚀 Start Quiz
            </button>
          )}
          <button className="btn-back-2" onClick={onBack}>
            ← Back to Quizzes
          </button>
        </div>
      </Card>
    </div>
  );
}

function Header({ title, subtitle, backHref }) {
  const navigate = useNavigate();
  return (
    <header
      style={{
        background: "linear-gradient(135deg, #0b63b7 0%, #0a4a8f 100%)",
        color: "white",
        padding: "24px 28px",
        borderRadius: 14,
        marginBottom: 28,
        boxShadow: "0 4px 20px rgba(11,99,183,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div>
        <h1 style={{ fontSize: 26, marginBottom: 4 }}>{title}</h1>
        <p style={{ opacity: 0.9, fontSize: 13 }}>{subtitle}</p>
      </div>
      <button className="back-btn" onClick={() => navigate(backHref)}>
        ← Back
      </button>
    </header>
  );
}

function Card({ children, style }) {
  return (
    <div
      style={{
        background: "var(--bg-primary, #fff)",
        borderRadius: 14,
        padding: 30,
        boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        marginBottom: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Button({ children, onClick, style }) {
  return (
    <button onClick={onClick} style={style}>
      {children}
    </button>
  );
}

function LoadingSpinner() {
  return (
    <div
      style={{
        display: "inline-block",
        width: 44,
        height: 44,
        border: "4px solid var(--border-color, #e0e0e0)",
        borderTopColor: "#0b63b7",
        borderRadius: "50%",
        animation: "spin 0.9s linear infinite",
      }}
    />
  );
}

const styles = `
  :root {
    --bg-primary: #ffffff;
    --bg-secondary: #f5f5f5;
    --text-primary: #1a1a1a;
    --text-secondary: #666666;
    --border-color: #e0e0e0;
  }
  [data-theme="dark"] {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    --text-primary: #ffffff;
    --text-secondary: #cccccc;
    --border-color: #404040;
  }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg-secondary); color: var(--text-primary); }
  @keyframes spin { to { transform: rotate(360deg); } }
  .tag { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
  .tag-blue { background: #e3f2fd; color: #0b63b7; }
  .tag-purple { background: #f3e5f5; color: #7b1fa2; }
  .tag-green { background: #e8f5e9; color: #2e7d32; }
  .tag-orange { background: #fff3e0; color: #e65100; }
  .quiz-title { font-size: 22px; font-weight: 700; color: #0b63b7; margin-bottom: 6px; }
  .quiz-subtitle { font-size: 13px; color: var(--text-secondary); margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid var(--border-color); }
  .tag-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
  .details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
  .detail-item { padding: 16px; background: var(--bg-secondary); border-radius: 10px; border-left: 4px solid #0b63b7; }
  .detail-label { font-size: 11px; font-weight: 700; color: #0b63b7; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px; }
  .detail-value { font-size: 20px; font-weight: 700; color: var(--text-primary); }
  .detail-value.sm { font-size: 14px; font-weight: 500; color: var(--text-secondary); }
  .info-box { padding: 16px; border-radius: 10px; margin-bottom: 16px; border-left: 4px solid; }
  .info-box.blue { background: #e3f2fd; border-color: #0b63b7; }
  .info-box.green { background: #e8f5e9; border-color: #2e7d32; }
  .info-box.orange { background: #fff3e0; border-color: #e65100; }
  .info-box strong { font-size: 13px; font-weight: 700; }
  .info-box p { margin-top: 6px; font-size: 13px; color: var(--text-secondary); }
  .cta-row { display: flex; gap: 12px; justify-content: center; margin-top: 28px; flex-wrap: wrap; }
  .btn-start { padding: 14px 36px; background: linear-gradient(135deg, #0b63b7, #0a4a8f); color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(11,99,183,0.3); }
  .btn-start:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(11,99,183,0.4); }
  .btn-start:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
  .btn-back-2 { padding: 14px 28px; background: var(--bg-secondary); color: #0b63b7; border: 2px solid var(--border-color); border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; }
  .btn-back-2:hover { border-color: #0b63b7; }
  .back-btn { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
  @media (max-width: 600px) { header { padding: 18px; } header h1 { font-size: 20px; } .card { padding: 20px; } .details-grid { grid-template-columns: 1fr 1fr; } }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
