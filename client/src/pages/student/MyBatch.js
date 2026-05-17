import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/SupabaseClient";
import "../styles/my-batch.css";

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
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [navOpen, setNavOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [batch, setBatch] = useState(null);
  const [userRow, setUserRow] = useState(null);
  const [allRows, setAllRows] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.title = "My Batch – MedMinds";
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initial = prefersDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", initial);
    setTheme(initial);

    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&family=DM+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(fontLink);

    init();

    return () => {
      if (fontLink.parentNode) fontLink.parentNode.removeChild(fontLink);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyTheme = (t) => {
    document.documentElement.setAttribute("data-theme", t);
    setTheme(t);
  };

  const init = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }

      const { data: userRows } = await supabase
        .from("users")
        .select("first_name, last_name, batch_id")
        .eq("id", user.id);
      const uRow = userRows?.[0];

      if (!uRow?.batch_id) {
        window.location.href = "batches.html";
        return;
      }

      const batchId = uRow.batch_id;

      const { data: batchData } = await supabase
        .from("batches")
        .select("*")
        .eq("id", batchId)
        .single();

      const { data: schedule } = await supabase
        .from("batch_schedules")
        .select("*")
        .eq("batch_id", batchId)
        .order("test_no", { ascending: true });

      const sortedRows = (schedule || []).sort(
        (a, b) => Number(a.test_no) - Number(b.test_no),
      );

      setBatch(batchData);
      setUserRow(uRow);
      setAllRows(sortedRows);
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
  const userName = userRow
    ? [userRow.first_name, userRow.last_name].filter(Boolean).join(" ") ||
      "Student"
    : "Student";

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&family=DM+Sans:wght@400;500;600;700&display=swap"
      />

      <header className="site-header">
        <div className="header-inner">
          <a href="quiz-selection.html" className="brand">
            <span className="brand-name">MedMinds</span>
          </a>
          <div className="header-right">
            <nav className="nav-links">
              <a href="quiz-selection.html">🏠 Dashboard</a>
              <a href="create-test.html">🧪 Create Test</a>
              <a href="custom-history.html">Quiz History</a>
              <a href="stats.html">📊 My Stats</a>
              <a href="leaderboard.html">🏆 Leaderboard</a>
              <a href="my-batch.html">My Batch</a>
              <a href="profile.html">👤 Profile</a>
            </nav>
            <button
              className="theme-btn"
              id="themeBtn"
              title="Toggle theme"
              onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button
              className={`hamburger${navOpen ? " open" : ""}`}
              id="hamburger"
              aria-label="Menu"
              onClick={() => setNavOpen(!navOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
        <nav className={`mobile-nav${navOpen ? " open" : ""}`} id="mobileNav">
          <a href="quiz-selection.html">🏠 Dashboard</a>
          <a href="create-test.html">🧪 Create Test</a>
          <a href="custom-history.html">Quiz History</a>
          <a href="stats.html">📊 My Stats</a>
          <a href="leaderboard.html">🏆 Leaderboard</a>
          <a href="my-batch.html">My Batch</a>
          <a href="profile.html">👤 Profile</a>
        </nav>
      </header>

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
                        {new Date(batch.end_date).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
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

            {total === 0 ? (
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
    </>
  );
};

export default MyBatch;
