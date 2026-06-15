import React, { useEffect, useState, useMemo } from "react";
import axios from "../../utils/AxiosConfig";
import "../../styles/admin.css";

const BASE_URL = process.env.REACT_APP_BASEURL;

const AdminLeadership = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/v1/batches/all`);
        if (data?.success && Array.isArray(data.batches)) {
          setBatches(data.batches);
        }
      } catch (err) {
        console.error("Failed to load batches", err);
      }
    };
    fetchBatches();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError("");
      try {
        const url = `${BASE_URL}/api/v1/leaderboard${selectedBatch ? `?batchId=${selectedBatch}` : ""}`;
        const { data } = await axios.get(url);
        if (data?.success && Array.isArray(data.attempts)) {
          const scores = {};
          data.attempts.forEach((a) => {
            const uid = a.user_id;
            if (!scores[uid]) {
              const userInfo = data.users?.[uid] || {};
              scores[uid] = {
                user_id: uid,
                name: userInfo.name || "Anonymous",
                district: userInfo.district || "—",
                vals: [],
              };
            }
            if (a.total_questions > 0) {
              scores[uid].vals.push(Math.round((a.score / a.total_questions) * 100));
            }
          });
          const rows = Object.values(scores)
            .map((u) => ({
              ...u,
              avg: u.vals.length
                ? Math.round(u.vals.reduce((a, b) => a + b, 0) / u.vals.length)
                : 0,
              count: u.vals.length,
            }))
            .sort((a, b) => b.avg - a.avg);
          setLeaderboard(rows);
        } else {
          setLeaderboard([]);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Failed to load leaderboard",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [selectedBatch]);

  const batchMap = useMemo(() => {
    const map = {};
    batches.forEach((b) => {
      map[b.id] = b.name;
    });
    return map;
  }, [batches]);

  return (
    <main>
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
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1.5px solid var(--border)",
                borderRadius: "8px",
                fontSize: "13px",
                background: "#fff",
              }}
            >
              <option value="">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="card">
          <div className="tbl-wrap">
            {loading ? (
              <div className="no-data">Loading...</div>
            ) : error ? (
              <div className="no-data" style={{ color: "var(--red)" }}>
                Error: {error}
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="no-data">No data</div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>District</th>
                    <th>Quizzes Taken</th>
                    <th>Avg Score</th>
                    <th>Best Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr key={entry.user_id}>
                      <td style={{ fontWeight: 800 }}>
                        {index === 0
                          ? "🥇"
                          : index === 1
                            ? "🥈"
                            : index === 2
                              ? "🥉"
                              : ""}{" "}
                        #{index + 1}
                      </td>
                      <td>
                        <strong>{entry.name}</strong>
                      </td>
                      <td>{entry.district}</td>
                      <td>{entry.count}</td>
                      <td
                        style={{
                          color: entry.avg >= 70 ? "#16a34a" : "#ef4444",
                          fontWeight: 700,
                        }}
                      >
                        {entry.avg}%
                      </td>
                      <td>
                        {entry.vals.length
                          ? `${Math.max(...entry.vals)}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminLeadership;
