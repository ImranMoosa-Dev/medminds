import React, { useEffect, useState } from "react";
import axios from "../../utils/AxiosConfig";
import "../../styles/admin.css";

const AdminStatistics = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [avgScore, setAvgScore] = useState("0%");
  const [completionRate, setCompletionRate] = useState("0%");
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [activeQuizzes, setActiveQuizzes] = useState(0);
  const [questionsPerQuiz, setQuestionsPerQuiz] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const [usersRes, questionsRes, quizzesRes, attemptsRes] = await Promise.all([
          axios.get("/api/v1/admin/users/all-users").catch(() => ({ data: { users: [] } })),
          axios.get("/api/v1/questions").catch(() => ({ data: [] })),
          axios.get("/api/v1/quizzes").catch(() => ({ data: { quizzes: [] } })),
          axios.get("/api/v1/quiz-attempts").catch(() => ({ data: [] })),
        ]);

        const users = usersRes.data?.users || [];
        const questions = Array.isArray(questionsRes.data) ? questionsRes.data : [];
        const quizzes = quizzesRes.data?.quizzes || quizzesRes.data || [];
        const attempts = Array.isArray(attemptsRes.data) ? attemptsRes.data : [];

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const active = users.filter((u) => {
          const lastActive = u.last_active || u.last_login || u.updated_at;
          return lastActive && new Date(lastActive) >= sevenDaysAgo;
        });

        const totalScorePct = attempts.reduce((sum, a) => {
          const score = a.score ?? 0;
          const total = a.total ?? 1;
          return sum + (score / total) * 100;
        }, 0);
        const avg = attempts.length ? Math.round(totalScorePct / attempts.length) : 0;

        const completed = attempts.filter((a) => {
          const score = a.score ?? 0;
          const total = a.total ?? 1;
          return total > 0 && score / total >= 0.8;
        });
        const rate = attempts.length
          ? Math.round((completed.length / attempts.length) * 100) + "%"
          : "0%";

        setTotalUsers(users.length);
        setActiveUsers(active.length);
        setAvgScore(avg + "%");
        setCompletionRate(rate);
        setTotalQuestions(questions.length);
        setActiveQuizzes(
          quizzes.filter((q) => q.is_published || q.published).length,
        );
        setQuestionsPerQuiz(
          quizzes.length ? Math.round(questions.length / quizzes.length) : 0,
        );
        setTotalAttempts(attempts.length);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div id="statistics" className="tab-panel">
      <h2 className="sec-title">📈 System Statistics</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="card">
        <div className="card-hdr">
          <span className="card-title">👥 Users</span>
        </div>
        <div className="card-body">
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-label">Total Users</div>
              <div className="stat-num">{loading ? "..." : totalUsers}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Active (7d)</div>
              <div className="stat-num">{loading ? "..." : activeUsers}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Avg Score</div>
              <div className="stat-num">{loading ? "..." : avgScore}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Completion Rate</div>
              <div className="stat-num">{loading ? "..." : completionRate}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr">
          <span className="card-title">📚 Question Bank</span>
        </div>
        <div className="card-body">
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-label">Total Questions</div>
              <div className="stat-num">{loading ? "..." : totalQuestions}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Active Quizzes</div>
              <div className="stat-num">{loading ? "..." : activeQuizzes}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Qs per Quiz</div>
              <div className="stat-num">{loading ? "..." : questionsPerQuiz}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Total Attempts</div>
              <div className="stat-num">{loading ? "..." : totalAttempts}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;
