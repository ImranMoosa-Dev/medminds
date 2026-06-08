import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import "../../styles/stats.css";
import StudentLayout from "../../components/layout/StudentLayout";

const SUBJ_META = {
  Biology: { icon: "🧬", color: "#16a34a", bg: "#dcfce7" },
  Chemistry: { icon: "⚗️", color: "#0b63b7", bg: "#dbeafe" },
  Physics: { icon: "⚡", color: "#7c3aed", bg: "#ede9fe" },
  English: { icon: "📖", color: "#d97706", bg: "#fef3c7" },
  "Logical Reasoning": { icon: "🧠", color: "#dc2626", bg: "#fee2e2" },
};

const loadChartJs = () =>
  new Promise((resolve, reject) => {
    if (window.Chart) return resolve(window.Chart);
    const existing = document.querySelector("script[data-chartjs]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Chart));
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js";
    script.async = true;
    script.setAttribute("data-chartjs", "1");
    script.onload = () => resolve(window.Chart);
    script.onerror = reject;
    document.head.appendChild(script);
  });

const Stats = () => {
  const navigate = useNavigate();
  const [auth] = useAuth();

  const [theme, setTheme] = useState("light");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [statsData, setStatsData] = useState(null);
  const [tableRows, setTableRows] = useState({ loading: true, hasData: false });
  const [improvement, setImprovement] = useState({
    first: "—",
    latest: "—",
    change: "—",
    avgLast3: "—",
    badgeClass: "no-data",
    badgeText: "— No data yet",
    changeColor: "",
  });
  const [showSubjectStats, setShowSubjectStats] = useState(false);

  const perfChartRef = useRef(null);
  const improvementChartRef = useRef(null);
  const distChartRef = useRef(null);
  const radarChartRef = useRef(null);

  const perfChartInst = useRef(null);
  const distChartInst = useRef(null);
  const imprChartInst = useRef(null);
  const subjectChartInst = useRef(null);

  const themeRef = useRef("light");

  useEffect(() => {
    document.title = "Statistics – MedMinds";
    const saved = localStorage.getItem("medminds-theme");
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const t = saved || (dark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", t);
    setTheme(t);
    themeRef.current = t;

    (async () => {
      try {
        await loadChartJs();
      } catch (e) {
        console.error("Chart.js load error:", e);
      }
    })();

    return () => {
      perfChartInst.current?.destroy();
      distChartInst.current?.destroy();
      imprChartInst.current?.destroy();
      subjectChartInst.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    themeRef.current = theme;
    if (statsData && window.Chart) {
      buildCharts(statsData);
      buildSubjectStats(statsData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  const toggleMobileNav = () => setMobileNavOpen((o) => !o);

  const chartTextColor = () =>
    themeRef.current === "dark" ? "#7fa4cc" : "#666";
  const chartGridColor = () =>
    themeRef.current === "dark" ? "rgba(255,255,255,0.06)" : "#f0f0f0";

  const buildCharts = (s) => {
    const Chart = window.Chart;
    if (!Chart) return;

    // Bar chart
    const labels = s.attempts.map((a, i) => {
      const name = s.quizNames[a.quiz_id] || `Quiz ${i + 1}`;
      return name.length > 14 ? name.slice(0, 13) + "…" : name;
    });
    const data = s.pcts;
    const barColors = data.map((p) =>
      p >= 80
        ? "rgba(22,163,74,0.85)"
        : p >= 60
          ? "rgba(217,119,6,0.85)"
          : "rgba(220,38,38,0.85)",
    );
    const borderColors = data.map((p) =>
      p >= 80 ? "#16a34a" : p >= 60 ? "#d97706" : "#dc2626",
    );

    if (perfChartInst.current) {
      perfChartInst.current.destroy();
      perfChartInst.current = null;
    }
    if (perfChartRef.current) {
      const perfCtx = perfChartRef.current.getContext("2d");
      perfChartInst.current = new Chart(perfCtx, {
        type: "bar",
        data: {
          labels: labels.length ? labels : ["No data yet"],
          datasets: [
            {
              label: "Score %",
              data: data.length ? data : [0],
              backgroundColor: barColors.length
                ? barColors
                : ["rgba(11,99,183,0.3)"],
              borderColor: borderColors.length ? borderColors : ["#0b63b7"],
              borderWidth: 1,
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y}%` } },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: (v) => v + "%",
                color: chartTextColor(),
                font: { size: 11 },
              },
              grid: { color: chartGridColor() },
            },
            x: {
              ticks: { color: chartTextColor(), font: { size: 11 } },
              grid: { display: false },
            },
          },
        },
      });
    }

    // Doughnut chart
    if (distChartInst.current) {
      distChartInst.current.destroy();
      distChartInst.current = null;
    }
    if (distChartRef.current) {
      const distCtx = distChartRef.current.getContext("2d");
      const hasData = s.excellent + s.good + s.poor > 0;
      distChartInst.current = new Chart(distCtx, {
        type: "doughnut",
        data: {
          labels: ["Excellent (80%+)", "Good (60–79%)", "Needs Work (<60%)"],
          datasets: [
            {
              data: hasData ? [s.excellent, s.good, s.poor] : [1, 0, 0],
              backgroundColor: hasData
                ? [
                    "rgba(22,163,74,0.85)",
                    "rgba(217,119,6,0.85)",
                    "rgba(220,38,38,0.85)",
                  ]
                : ["rgba(200,215,235,0.4)"],
              borderColor: hasData
                ? ["#16a34a", "#d97706", "#dc2626"]
                : ["#dde8f5"],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "65%",
          plugins: {
            legend: { display: false },
            tooltip: { enabled: hasData },
          },
        },
      });
    }

    // Line chart: improvement
    if (imprChartInst.current) {
      imprChartInst.current.destroy();
      imprChartInst.current = null;
    }
    if (improvementChartRef.current) {
      const imprCtx = improvementChartRef.current.getContext("2d");
      const imprLabels = s.attempts.map((a, i) => {
        const name = s.quizNames[a.quiz_id] || "Quiz " + (i + 1);
        return name.length > 12 ? name.slice(0, 11) + "…" : name;
      });
      const imprData = s.pcts;
      const movingAvg = imprData.map((_, i) => {
        if (i === 0) return imprData[0];
        const w = imprData.slice(Math.max(0, i - 1), i + 1);
        return Math.round(w.reduce((a, b) => a + b, 0) / w.length);
      });

      // Trend
      let imp = { ...improvement };
      if (imprData.length >= 2) {
        const first = imprData[0];
        const last = imprData[imprData.length - 1];
        const diff = last - first;
        const last3 = imprData.slice(-3);
        const avgL3 = Math.round(
          last3.reduce((a, b) => a + b, 0) / last3.length,
        );
        imp.first = first + "%";
        imp.latest = last + "%";
        imp.change = (diff >= 0 ? "+" : "") + diff + "%";
        imp.avgLast3 = avgL3 + "%";
        imp.changeColor =
          diff > 0 ? "var(--green)" : diff < 0 ? "var(--red)" : "var(--amber)";
        if (diff > 5) {
          imp.badgeClass = "improving";
          imp.badgeText = "📈 Improving";
        } else if (diff < -5) {
          imp.badgeClass = "declining";
          imp.badgeText = "📉 Declining";
        } else {
          imp.badgeClass = "stable";
          imp.badgeText = "➡️ Stable";
        }
      } else if (imprData.length === 1) {
        imp.first = imprData[0] + "%";
        imp.latest = imprData[0] + "%";
        imp.change = "—";
        imp.avgLast3 = imprData[0] + "%";
        imp.badgeClass = "stable";
        imp.badgeText = "➡️ 1 Quiz Taken";
      }
      setImprovement(imp);

      const gradientFill = imprCtx.createLinearGradient(0, 0, 0, 300);
      gradientFill.addColorStop(0, "rgba(11,99,183,0.25)");
      gradientFill.addColorStop(1, "rgba(11,99,183,0.01)");

      imprChartInst.current = new Chart(imprCtx, {
        type: "line",
        data: {
          labels: imprLabels.length ? imprLabels : ["No data"],
          datasets: [
            {
              label: "Score %",
              data: imprData.length ? imprData : [0],
              borderColor: "#0b63b7",
              backgroundColor: gradientFill,
              borderWidth: 3,
              pointBackgroundColor: imprData.map((p) =>
                p >= 80 ? "#16a34a" : p >= 60 ? "#d97706" : "#dc2626",
              ),
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
              tension: 0.4,
              fill: true,
            },
            {
              label: "Trend",
              data: movingAvg.length ? movingAvg : [0],
              borderColor: "rgba(217,119,6,0.7)",
              borderWidth: 2,
              borderDash: [6, 4],
              pointRadius: 0,
              tension: 0.4,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: {
              display: true,
              labels: {
                color: chartTextColor(),
                font: { size: 11, weight: "600" },
                boxWidth: 14,
                padding: 16,
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  " " + ctx.dataset.label + ": " + ctx.parsed.y + "%",
              },
            },
          },
          scales: {
            y: {
              beginAtZero: false,
              min: Math.max(
                0,
                Math.min(...(imprData.length ? imprData : [0])) - 10,
              ),
              max: Math.min(
                100,
                Math.max(...(imprData.length ? imprData : [100])) + 10,
              ),
              ticks: {
                callback: (v) => v + "%",
                color: chartTextColor(),
                font: { size: 11 },
              },
              grid: { color: chartGridColor() },
            },
            x: {
              ticks: { color: chartTextColor(), font: { size: 11 } },
              grid: { display: false },
            },
          },
        },
      });
    }
  };

  const buildSubjectStats = (s) => {
    const Chart = window.Chart;
    const subjStats = s.subjectStats || {};
    const subjects = Object.keys(subjStats);
    if (!subjects.length) {
      setShowSubjectStats(false);
      return;
    }
    setShowSubjectStats(true);

    if (subjectChartInst.current) {
      subjectChartInst.current.destroy();
      subjectChartInst.current = null;
    }
    if (subjects.length < 2 || !Chart || !radarChartRef.current) return;

    const ctx = radarChartRef.current.getContext("2d");
    subjectChartInst.current = new Chart(ctx, {
      type: "radar",
      data: {
        labels: subjects.map(
          (sub) => (SUBJ_META[sub]?.icon || "📚") + " " + sub,
        ),
        datasets: [
          {
            label: "Your Score %",
            data: subjects.map((subj) => {
              const d = subjStats[subj];
              return d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
            }),
            backgroundColor: "rgba(11,99,183,0.15)",
            borderColor: "#0b63b7",
            borderWidth: 2,
            pointBackgroundColor: subjects.map((subj) => {
              const pct =
                subjStats[subj]?.total > 0
                  ? Math.round(
                      (subjStats[subj].correct / subjStats[subj].total) * 100,
                    )
                  : 0;
              return pct >= 80 ? "#16a34a" : pct >= 60 ? "#d97706" : "#dc2626";
            }),
            pointRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20,
              callback: (v) => v + "%",
              font: { size: 10 },
              color: chartTextColor(),
            },
            grid: { color: chartGridColor() },
            pointLabels: {
              font: { size: 12, weight: "600" },
              color: chartTextColor(),
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => " " + ctx.parsed.r + "%" } },
        },
      },
    });
  };

  const buildTable = (s) => {
    if (s.count === 0 && s.allQuizzes.length === 0) {
      setTableRows({ loading: false, hasData: false });
      return;
    }
    setTableRows({ loading: false, hasData: true, stats: s });
  };

  // Render table
  const renderTable = () => {
    if (tableRows.loading) {
      return (
        <tr>
          <td colSpan="6">
            <div className="empty-state">
              <div className="icon">⏳</div>
              <p>Loading…</p>
            </div>
          </td>
        </tr>
      );
    }
    if (tableRows.error) {
      return (
        <tr>
          <td colSpan="6">
            <div className="empty-state">
              <div className="icon">❌</div>
              <p>Failed to load data.</p>
            </div>
          </td>
        </tr>
      );
    }
    if (!tableRows.hasData) {
      return (
        <tr>
          <td colSpan="6">
            <div className="empty-state">
              <div className="icon">📝</div>
              <p>No quizzes taken yet. Start a quiz to see your stats!</p>
            </div>
          </td>
        </tr>
      );
    }
    const s = tableRows.stats;
    const takenIds = new Set(s.attempts.map((a) => a.quiz_id));
    const sorted = [...s.attempts].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );

    const rows = [];
    sorted.forEach((a, i) => {
      const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
      const name =
        s.quizNames[a.quiz_id] || (a.quiz_id ? `Quiz #${a.quiz_id}` : "Quiz");
      const date = a.created_at
        ? new Date(a.created_at).toLocaleDateString("en-PK", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "—";
      const trendClass =
        pct >= 80 ? "trend-up" : pct >= 60 ? "trend-mid" : "trend-down";
      const trendText =
        pct >= 80 ? "📈 Excellent" : pct >= 60 ? "➡️ Good" : "📉 Needs Work";
      rows.push(
        <tr key={`a${a.id}`}>
          <td style={{ color: "var(--muted)", fontSize: 12 }}>{i + 1}</td>
          <td style={{ fontWeight: 600 }}>{name}</td>
          <td>
            <span className="badge badge-done">✅ Completed</span>
          </td>
          <td>
            <div className="score-bar">
              <div className="score-track">
                <div className="score-fill" style={{ width: pct + "%" }} />
              </div>
              <span className="score-pct">{pct}%</span>
            </div>
          </td>
          <td>
            <span className={`trend ${trendClass}`}>{trendText}</span>
          </td>
          <td
            style={{
              color: "var(--muted)",
              fontSize: 12,
              whiteSpace: "nowrap",
            }}
          >
            {date}
          </td>
        </tr>,
      );
    });

    s.allQuizzes.forEach((q, idx) => {
      if (takenIds.has(q.id)) return;
      const isNext = idx === s.count;
      const badgeCls = isNext ? "badge-available" : "badge-locked";
      const badgeTxt = isNext ? "▶️ Available" : "🔒 Locked";
      rows.push(
        <tr className="locked" key={`q${q.id}`}>
          <td style={{ color: "var(--muted)", fontSize: 12 }}>—</td>
          <td style={{ fontWeight: 600 }}>{q.name}</td>
          <td>
            <span className={`badge ${badgeCls}`}>{badgeTxt}</span>
          </td>
          <td style={{ color: "var(--muted)" }}>—</td>
          <td style={{ color: "var(--muted)" }}>—</td>
          <td style={{ color: "var(--muted)" }}>—</td>
        </tr>,
      );
    });

    return rows.length ? (
      rows
    ) : (
      <tr>
        <td colSpan="6">
          <div className="empty-state">
            <div className="icon">📝</div>
            <p>No attempts yet.</p>
          </div>
        </td>
      </tr>
    );
  };

  const subjStats = statsData?.subjectStats || {};
  const subjects = Object.keys(subjStats);

  return (
    <>
      {/* ═══ MAIN ═══ */}
      <StudentLayout title="Statistics – MedMinds">
        {/* Page title */}
        <div className="page-title">
          <h1>📊 Your Statistics</h1>
          <p>Track your performance and progress across all quizzes</p>
        </div>

        {/* Stat cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div>
              <div className="stat-label">Overall Average</div>
              <div className="stat-value" id="statAvg">
                {statsData?.avg !== null && statsData?.avg !== undefined
                  ? statsData.avg + "%"
                  : "—"}
              </div>
              <div className="stat-unit">percent</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div>
              <div className="stat-label">Quizzes Taken</div>
              <div className="stat-value" id="statCount">
                {statsData?.count || "0"}
              </div>
              <div className="stat-unit">attempts</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div>
              <div className="stat-label">Highest Score</div>
              <div className="stat-value" id="statBest">
                {statsData?.best !== null && statsData?.best !== undefined
                  ? statsData.best + "%"
                  : "—"}
              </div>
              <div className="stat-unit">percent</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📉</div>
            <div>
              <div className="stat-label">Lowest Score</div>
              <div className="stat-value" id="statWorst">
                {statsData?.worst !== null && statsData?.worst !== undefined
                  ? statsData.worst + "%"
                  : "—"}
              </div>
              <div className="stat-unit">percent</div>
            </div>
          </div>
        </div>

        {/* Performance chart */}
        <div className="card">
          <div className="card-header">
            <h2>📈 Performance Per Quiz</h2>
          </div>
          <div className="card-body">
            <div className="chart-wrap">
              <canvas id="perfChart" ref={perfChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* Improvement Trend Graph */}
        <div className="card">
          <div className="card-header">
            <div className="improvement-header">
              <h2>🚀 Improvement Trend</h2>
              <span
                className={`trend-badge ${improvement.badgeClass}`}
                id="improvementBadge"
              >
                {improvement.badgeText}
              </span>
            </div>
          </div>
          <div className="card-body">
            <div className="chart-wrap">
              <canvas id="improvementChart" ref={improvementChartRef}></canvas>
            </div>
          </div>
          <div className="improvement-meta">
            <div className="impr-stat">
              <div className="impr-stat-val" id="imprFirst">
                {improvement.first}
              </div>
              <div className="impr-stat-lbl">First Quiz</div>
            </div>
            <div className="impr-stat">
              <div className="impr-stat-val" id="imprLatest">
                {improvement.latest}
              </div>
              <div className="impr-stat-lbl">Latest Quiz</div>
            </div>
            <div className="impr-stat">
              <div
                className="impr-stat-val"
                id="imprChange"
                style={{ color: improvement.changeColor }}
              >
                {improvement.change}
              </div>
              <div className="impr-stat-lbl">Total Change</div>
            </div>
            <div className="impr-stat">
              <div className="impr-stat-val" id="imprAvgLast3">
                {improvement.avgLast3}
              </div>
              <div className="impr-stat-lbl">Last 3 Avg</div>
            </div>
          </div>
        </div>

        {/* Score distribution */}
        <div className="card">
          <div className="card-header">
            <h2>📊 Score Distribution</h2>
          </div>
          <div className="card-body">
            <div className="dist-grid">
              <div className="chart-wrap-sm">
                <canvas id="distChart" ref={distChartRef}></canvas>
              </div>
              <div className="dist-legend">
                <div className="dist-legend-item">
                  <div className="dist-legend-label">
                    <div
                      className="dist-dot"
                      style={{ background: "#16a34a" }}
                    ></div>
                    Excellent (80%+)
                  </div>
                  <div className="dist-count" id="cntExcellent">
                    {statsData?.excellent ?? 0}
                  </div>
                </div>
                <div className="dist-legend-item">
                  <div className="dist-legend-label">
                    <div
                      className="dist-dot"
                      style={{ background: "#d97706" }}
                    ></div>
                    Good (60–79%)
                  </div>
                  <div className="dist-count" id="cntGood">
                    {statsData?.good ?? 0}
                  </div>
                </div>
                <div className="dist-legend-item">
                  <div className="dist-legend-label">
                    <div
                      className="dist-dot"
                      style={{ background: "#dc2626" }}
                    ></div>
                    Needs Work (&lt;60%)
                  </div>
                  <div className="dist-count" id="cntPoor">
                    {statsData?.poor ?? 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject-wise Stats */}
        <div
          className="card"
          id="subjectStatsCard"
          style={{ display: showSubjectStats ? "block" : "none" }}
        >
          <div className="card-header">
            <h2>🧪 Subject-wise Performance</h2>
          </div>
          <div
            id="subjectStatsGrid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
              gap: 14,
              padding: 20,
            }}
          >
            {subjects.map((subj) => {
              const data = subjStats[subj];
              const pct =
                data.total > 0
                  ? Math.round((data.correct / data.total) * 100)
                  : 0;
              const m = SUBJ_META[subj] || {
                icon: "📚",
                color: "#666",
                bg: "#f3f4f6",
              };
              const trendColor =
                pct >= 80 ? "#16a34a" : pct >= 60 ? "#d97706" : "#dc2626";
              return (
                <div
                  key={subj}
                  style={{
                    background: m.bg,
                    borderRadius: 14,
                    padding: 16,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{m.icon}</div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: m.color,
                      marginBottom: 8,
                    }}
                  >
                    {subj}
                  </div>
                  <div
                    style={{ fontSize: 26, fontWeight: 800, color: trendColor }}
                  >
                    {pct}%
                  </div>
                  <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                    {data.correct}/{data.total} correct
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      background: "rgba(0,0,0,0.08)",
                      borderRadius: 4,
                      height: 6,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: pct + "%",
                        height: "100%",
                        background: m.color,
                        borderRadius: 4,
                        transition: "width 0.8s",
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ padding: "0 20px 20px" }}>
            <canvas
              id="subjectRadarChart"
              ref={radarChartRef}
              style={{ maxHeight: 320 }}
            ></canvas>
          </div>
        </div>

        {/* Quiz details table */}
        <div className="card">
          <div className="card-header">
            <h2>📋 Quiz Details</h2>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Quiz</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Performance</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody id="quizTableBody">{renderTable()}</tbody>
            </table>
          </div>
        </div>
      </StudentLayout>
    </>
  );
};

export default Stats;
