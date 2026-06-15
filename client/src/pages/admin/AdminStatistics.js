import React from "react";

const StatisticsPage = () => {
  return (
    <div>
      {/* ══ STATISTICS ══ */}
      <div id="statistics" className="tab-panel">
        <h2 className="sec-title" style={{ marginBottom: "20px" }}>
          📈 System Statistics
        </h2>
        <div className="card" style={{ marginBottom: "20px" }}>
          <div className="card-hdr">
            <span className="card-title">👥 Users</span>
          </div>
          <div className="card-body">
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-label">Total Users</div>
                <div id="statTotalUsers" className="stat-num">
                  0
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Active (7d)</div>
                <div id="statActiveUsers" className="stat-num">
                  0
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Avg Score</div>
                <div id="statAvgScore" className="stat-num">
                  0%
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Completion Rate</div>
                <div id="statCompletionRate" className="stat-num">
                  0%
                </div>
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
                <div id="statTotalQuestions" className="stat-num">
                  0
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Active Quizzes</div>
                <div id="statActiveQuizzes" className="stat-num">
                  0
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Qs per Quiz</div>
                <div id="statQuestionsPerQuiz" className="stat-num">
                  0
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Total Attempts</div>
                <div id="statTotalAttempts" className="stat-num">
                  0
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
