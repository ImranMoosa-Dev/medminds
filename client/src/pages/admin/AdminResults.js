import React from "react";

const AdminResults = () => {
  return (
    <main>
      {/* ══ RESULTS / ATTEMPTS ══ */}
      <div id="attempts" className="tab-panel">
        <h2 className="sec-title" style={{ marginBottom: "20px" }}>
          📋 Quiz Attempts & Results
        </h2>

        <div className="pub-panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div>
              <div className="pub-panel-title">🚀 Publish Results by Quiz</div>
              <div className="pub-panel-sub">
                One click publishes all attempts for a quiz
              </div>
            </div>
            <button
              className="btn btn-gray btn-sm"
              onClick={() => call("loadPublishQuizPanel")}
            >
              🔄 Refresh
            </button>
          </div>
          <div id="publishQuizCards" className="pub-cards">
            <div className="shimmer"></div>
            <div className="shimmer"></div>
            <div className="shimmer"></div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <strong style={{ fontSize: "15px" }}>📊 All Attempts</strong>
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div className="filter-row" style={{ margin: 0 }}>
              <select
                id="filterByQuiz"
                onChange={() => call("filterAttemptsTable")}
                defaultValue=""
              >
                <option value="">All Quizzes</option>
              </select>
              <select
                id="filterByStatus"
                onChange={() => call("filterAttemptsTable")}
                defaultValue=""
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
            <button
              className="btn btn-green btn-sm"
              onClick={() => call("exportResultsCSV")}
              title="Download current filtered view as CSV"
            >
              📥 Export CSV
            </button>
          </div>
        </div>
        <div className="card">
          <div className="tbl-wrap">
            <div id="attemptsTable"></div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminResults;
