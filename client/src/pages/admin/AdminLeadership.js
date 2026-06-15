import React from "react";

const AdminLeadership = () => {
  return (
    <main>
      {/* ══ LEADERBOARD ══ */}
      <div id="leadership" className="tab-panel">
        <div className="sec-hdr">
          <h2 className="sec-title">🏆 Leaderboard</h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <label style={{ fontSize: "13px", fontWeight: 600 }}>Batch:</label>
            <select
              id="leaderboardBatchFilter"
              onChange={() => call("loadLeaderboard")}
              style={{
                padding: "8px 12px",
                border: "1.5px solid var(--border)",
                borderRadius: "8px",
                fontSize: "13px",
                background: "#fff",
              }}
              defaultValue=""
            >
              <option value="">All Batches</option>
            </select>
          </div>
        </div>
        <div className="card">
          <div className="tbl-wrap">
            <div id="leaderboardContent"></div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminLeadership;
