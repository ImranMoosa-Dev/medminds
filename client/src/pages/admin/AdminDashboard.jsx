import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { getAllUsers } from "../../api/userApi";
import { getAllQuizzes } from "../../api/quizApi";
import axios from "../../utils/AxiosConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import "../../styles/admin.css";

const AdminDashboard = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();

  const [questionsCount, setQuestionsCount] = useState(0);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [usersRes, quizzesRes] = await Promise.all([
          getAllUsers(),
          getAllQuizzes(),
        ]);

        const users = usersRes?.data?.users || [];
        setUsersCount(users.length);

        const attempts = usersRes?.data?.attempts || [];
        setAttemptsCount(attempts.length);
        if (attempts.length > 0) {
          const totalPct = attempts.reduce((sum, a) => {
            const pct =
              a.total_questions > 0
                ? (a.score / a.total_questions) * 100
                : 0;
            return sum + pct;
          }, 0);
          setAvgScore(Math.round(totalPct / attempts.length));
        }

        const quizzes = quizzesRes?.quizzes || [];
        const totalQs = quizzes.reduce(
          (sum, q) => sum + (q.totalMcqs || 0),
          0,
        );
        setQuestionsCount(totalQs);

        try {
          const lbRes = await axios.get("/api/v1/leaderboard");
          const allAttempts = lbRes?.data?.attempts || [];
          const sorted = [...allAttempts].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at),
          );
          setRecentAttempts(
            sorted.slice(0, 5).map((a) => ({
              id: a.id,
              userName: a.fullName || "Anonymous",
              score: a.score,
              total: a.total_questions,
              percentage:
                a.total_questions > 0
                  ? Math.round((a.score / a.total_questions) * 100)
                  : 0,
              date: a.created_at,
            })),
          );
        } catch {
          setRecentAttempts([]);
        }
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load dashboard data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <AdminLayout>
      <div id="dashboard" className="tab-panel active">
        {error && <div className="info-tip" style={{ color: "#c62828", borderLeftColor: "#c62828" }}>{error}</div>}
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-label">Total Questions</div>
            <div className="stat-num">
              {loading ? "..." : questionsCount}
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Total Attempts</div>
            <div className="stat-num">
              {loading ? "..." : attemptsCount}
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Average Score</div>
            <div className="stat-num">
              {loading ? "..." : `${avgScore}%`}
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Total Users</div>
            <div className="stat-num">
              {loading ? "..." : usersCount}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-hdr">
            <span className="card-title">🕐 Recent Quiz Attempts</span>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="no-data">Loading...</div>
            ) : recentAttempts.length === 0 ? (
              <div className="no-data">No attempts yet</div>
            ) : (
              recentAttempts.map((a) => (
                <div key={a.id} className="recent-item">
                  <div>
                    <div className="recent-name">{a.userName}</div>
                    <div className="recent-date">
                      {new Date(a.date).toLocaleString()}
                    </div>
                  </div>
                  <div
                    className="recent-score"
                    style={{
                      color: a.percentage >= 70 ? "#16a34a" : "#ef4444",
                    }}
                  >
                    {a.score}/{a.total} ({a.percentage}%)
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
