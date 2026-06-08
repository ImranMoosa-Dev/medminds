import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { getMyBatch } from "../../api/batchApi";
import "../../styles/my-batch.css";
import StudentLayout from "../../components/layout/StudentLayout";

function parseRowDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (!isNaN(d)) return d;
  const m = dateStr.match(/^(\d{1,2})[\/\-]([A-Za-z]+)[\/\-](\d{2,4})$/);
  if (m) {
    const year = m[3].length === 2 ? "20" + m[3] : m[3];
    return new Date(`${m[2]} ${m[1]}, ${year}`);
  }
  return null;
}

function formatDate(dateStr) {
  const d = parseRowDate(dateStr);
  if (!d || isNaN(d)) return dateStr || "—";
  return d.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isToday(dateStr) {
  const d = parseRowDate(dateStr);
  if (!d || isNaN(d)) return false;
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function isPast(dateStr) {
  const d = parseRowDate(dateStr);
  if (!d || isNaN(d)) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dd = new Date(d);
  dd.setHours(0, 0, 0, 0);
  return dd < now;
}

function subjectChip(subject) {
  if (!subject) return <span className="subject-chip chip-other">—</span>;
  const s = subject.toLowerCase();
  let cls = "chip-other";
  if (s.includes("bio")) cls = "chip-bio";
  else if (s.includes("phy")) cls = "chip-phys";
  else if (s.includes("chem")) cls = "chip-chem";
  else if (s.includes("eng")) cls = "chip-eng";
  else if (s.includes("log") || s.includes("reason")) cls = "chip-logic";
  else if (s.includes("weekly") || s.includes("general")) cls = "chip-weekly";
  return <span className={`subject-chip ${cls}`}>{subject}</span>;
}

const MyBatch = () => {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const [batch, setBatch] = useState(null);
  const [userRow, setUserRow] = useState(null);
  const [allRows, setAllRows] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const init = async () => {
    try {
      setLoading(true);

      /*
    |--------------------------------------------------------------------------
    | FETCH MY BATCH
    |--------------------------------------------------------------------------
    */

      // get my batch api
      const data = await getMyBatch();

      if (data?.success) {
        setBatch(data.batch || null);

        setUserRow({
          full_name: data.user.fullName || "",
        });

        setAllRows(data?.schedule || []);
      }

      setLoading(false);
    } catch (e) {
      console.error("my-batch init error:", e);
      setErrored(true);
      setLoading(false);
    }
  };

  const onSearch = (val) => setSearchQuery(val.trim());

  const filteredRows = allRows.filter((r) => {
    if (activeFilter !== "all") {
      const sub = (r.subject || "").toLowerCase();
      if (!sub.includes(activeFilter)) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const haystack = [r.test_no, r.date, r.day, r.subject, r.chapter]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const total = allRows.length;
  const done = allRows.filter((r) => isPast(r.date)).length;
  const upcoming = allRows.filter(
    (r) => !isPast(r.date) && !isToday(r.date),
  ).length;
  const todayRow = allRows.find((r) => isToday(r.date));
  const userName = userRow?.full_name || "Student";

  return (
    <>
      <StudentLayout title="My Batch – MedMinds">
        <main id="mainContent">
          {loading && (
            <div className="loading-wrap" id="loadingState">
              <div className="spinner"></div>
              <p>Loading your batch…</p>
            </div>
          )}
          {errored && !loading && (
            <div className="loading-wrap" id="loadingState">
              <div className="empty-state">
                <div className="icon">❌</div>
                <p>Failed to load batch. Please refresh.</p>
              </div>
            </div>
          )}
          {!loading && !errored && (
            <div id="pageContent">
              <div className="batch-hero">
                <div className="batch-hero-inner">
                  <div className="batch-hero-left">
                    <h1>🗂 {batch?.name || "My Batch"}</h1>
                    <p>
                      {batch?.description ||
                        "Your enrolled batch — track your upcoming tests and schedule below."}
                    </p>
                    <div className="batch-meta-pills">
                      {batch?.academic_year && (
                        <span className="meta-pill">
                          📅 {batch.academic_year}
                        </span>
                      )}
                      {batch?.start_date && (
                        <span className="meta-pill">
                          🟢 Started{" "}
                          {new Date(batch.start_date).toLocaleDateString(
                            "en-PK",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </span>
                      )}
                      {batch?.end_date && (
                        <span className="meta-pill">
                          🔴 Ends{" "}
                          {new Date(batch.end_date).toLocaleDateString(
                            "en-PK",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      )}
                      <span className="meta-pill">👤 {userName}</span>
                    </div>
                  </div>
                  <div className="batch-hero-badge">
                    <div className="badge-val">{total}</div>
                    <div className="badge-lbl">Total Tests</div>
                  </div>
                </div>
              </div>

              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-val">{total}</div>
                  <div className="stat-lbl">Scheduled</div>
                </div>
                <div
                  className="stat-card"
                  style={{ borderLeftColor: "var(--green)" }}
                >
                  <div className="stat-val" style={{ color: "var(--green)" }}>
                    {done}
                  </div>
                  <div className="stat-lbl">Completed</div>
                </div>
                <div
                  className="stat-card"
                  style={{ borderLeftColor: "var(--amber)" }}
                >
                  <div className="stat-val" style={{ color: "var(--amber)" }}>
                    {upcoming}
                  </div>
                  <div className="stat-lbl">Upcoming</div>
                </div>
                <div
                  className="stat-card"
                  style={{ borderLeftColor: "var(--red)" }}
                >
                  <div className="stat-val" style={{ color: "var(--red)" }}>
                    {todayRow ? "1" : "0"}
                  </div>
                  <div className="stat-lbl">Today</div>
                </div>
              </div>

              <div className="section-head">
                <h2>📅 Test Schedule</h2>
                <div className="filter-row">
                  <button
                    className={`filter-btn${activeFilter === "all" ? " active" : ""}`}
                    onClick={() => setActiveFilter("all")}
                  >
                    All
                  </button>
                  <button
                    className={`filter-btn${activeFilter === "bio" ? " active" : ""}`}
                    onClick={() => setActiveFilter("bio")}
                  >
                    Biology
                  </button>
                  <button
                    className={`filter-btn${activeFilter === "phy" ? " active" : ""}`}
                    onClick={() => setActiveFilter("phy")}
                  >
                    Physics
                  </button>
                  <button
                    className={`filter-btn${activeFilter === "chem" ? " active" : ""}`}
                    onClick={() => setActiveFilter("chem")}
                  >
                    Chemistry
                  </button>
                  <button
                    className={`filter-btn${activeFilter === "weekly" ? " active" : ""}`}
                    onClick={() => setActiveFilter("weekly")}
                  >
                    Weekly
                  </button>
                </div>
              </div>

              <div className="search-bar">
                <span>🔍</span>
                <input
                  type="text"
                  id="scheduleSearch"
                  placeholder="Search by subject, chapter, date…"
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                />
              </div>

              {!batch ? (
                <div className="schedule-wrap">
                  <div className="empty-state">
                    <div className="icon">🎓</div>

                    <p>
                      You are not enrolled in any batch yet.
                      <br />
                      Please contact admin.
                    </p>
                  </div>
                </div>
              ) : total === 0 ? (
                <div className="schedule-wrap">
                  <div className="empty-state">
                    <div className="icon">📋</div>
                    <p>
                      No schedule uploaded yet for your batch.
                      <br />
                      Check back soon — your admin will upload the test schedule
                      shortly.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="schedule-wrap">
                  <table className="schedule-table">
                    <thead>
                      <tr>
                        <th style={{ textAlign: "center" }}>#</th>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Subject</th>
                        <th>Chapter / Test Type</th>
                      </tr>
                    </thead>
                    <tbody id="scheduleBody">
                      {filteredRows.length === 0 ? (
                        <tr>
                          <td colSpan="5">
                            <div className="empty-state">
                              <div className="icon">📋</div>
                              <p>No schedule entries match your filter.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredRows.map((r, idx) => {
                          const today = isToday(r.date);
                          const past = !today && isPast(r.date);
                          const rowCls = today
                            ? "row-today"
                            : past
                              ? "row-past"
                              : "";
                          return (
                            <tr key={idx} className={rowCls}>
                              <td>{r.test_no ?? "—"}</td>
                              <td>
                                {formatDate(r.date)}
                                {today && (
                                  <span className="today-badge">Today</span>
                                )}
                              </td>
                              <td>{r.day || "—"}</td>
                              <td>{subjectChip(r.subject)}</td>
                              <td>{r.chapter || "—"}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </StudentLayout>
    </>
  );
};

export default MyBatch;
