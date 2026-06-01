import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// import supabase from "../utils/SupabaseClient";
import { useAuth } from "../../context/auth";
import StudentLayout from "../../components/layout/StudentLayout";
import "../../styles/leaderboard.css";

// Subject meta — icons & colors for pills (synced with subjects table seeds)
const SUBJ_META = {
  Biology: { icon: "🧬", color: "#16a34a", bg: "#dcfce7" },
  Chemistry: { icon: "⚗️", color: "#0b63b7", bg: "#dbeafe" },
  Physics: { icon: "⚡", color: "#7c3aed", bg: "#f3e8ff" },
  English: { icon: "📖", color: "#d97706", bg: "#fef3c7" },
  "Logical Reasoning": { icon: "🧠", color: "#dc2626", bg: "#fee2e2" },
};

const Leaderboard = () => {
  const navigate = useNavigate();
  const [auth] = useAuth();

  // refs to DOM (matches original IDs)
  const themeBtnRef = useRef(null);
  const hamburgerRef = useRef(null);
  const mobileNavRef = useRef(null);
  const filterPillsRef = useRef(null);
  const totalParticipantsRef = useRef(null);
  const topScoreRef = useRef(null);
  const avgScoreRef = useRef(null);
  const yourRankRef = useRef(null);
  const tableHeadersRef = useRef(null);
  const tbodyDesktopRef = useRef(null);
  const mobileListRef = useRef(null);
  const cardHeaderPRef = useRef(null);
  const certBannerRef = useRef(null);
  const certBannerSubRef = useRef(null);
  const certOverlayRef = useRef(null);
  const certCanvasRef = useRef(null);

  // State refs (these don't trigger re-renders since DOM is manipulated directly, mirroring original)
  const allAttemptsRef = useRef([]);
  const userMapRef = useRef({});
  const quizMapRef = useRef({});
  const currentUidRef = useRef(null);
  const activeQuizIdRef = useRef("overall");
  const subjectScoreMapRef = useRef({});
  const certDataRef = useRef({ name: "", quizName: "", score: "", date: "" });

  useEffect(() => {
    // init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- Helpers -----
  function pctClass(p) {
    if (p >= 70) return "pct-green";
    if (p >= 50) return "pct-amber";
    return "pct-red";
  }

  function rankBadgeHTML(i) {
    if (i === 0) return `<span class="rank-badge rank-1">🥇</span>`;
    if (i === 1) return `<span class="rank-badge rank-2">🥈</span>`;
    if (i === 2) return `<span class="rank-badge rank-3">🥉</span>`;
    return `<span class="rank-badge rank-n">${i + 1}</span>`;
  }

  function showEmpty(msg) {
    const empty = `<div class="empty-state"><div class="icon">📋</div><p>${msg}</p></div>`;
    if (tbodyDesktopRef.current)
      tbodyDesktopRef.current.innerHTML = `<tr><td colspan="7">${empty}</td></tr>`;
    if (mobileListRef.current) mobileListRef.current.innerHTML = empty;
  }

  function showError(msg) {
    const err = `<div class="empty-state"><div class="icon">❌</div><p>${msg}</p></div>`;
    if (tbodyDesktopRef.current)
      tbodyDesktopRef.current.innerHTML = `<tr><td colspan="7">${err}</td></tr>`;
    if (mobileListRef.current) mobileListRef.current.innerHTML = err;
  }

  function subjectPillsHTML(userId, quizIdOrOverall) {
    try {
      const userSubjects = subjectScoreMapRef.current[userId];
      if (!userSubjects) return "";

      let subjects;
      if (quizIdOrOverall === "overall") {
        const agg = {};
        Object.values(userSubjects).forEach((quizSubjects) => {
          Object.entries(quizSubjects).forEach(([subj, stat]) => {
            if (!agg[subj]) agg[subj] = { correct: 0, total: 0 };
            agg[subj].correct += stat.correct;
            agg[subj].total += stat.total;
          });
        });
        subjects = agg;
      } else {
        subjects = userSubjects[String(quizIdOrOverall)];
      }

      if (!subjects || !Object.keys(subjects).length) return "";

      return Object.entries(subjects)
        .map(([subj, stat]) => {
          const pct =
            stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
          const meta = SUBJ_META[subj] || {
            icon: "📚",
            color: "#6b7280",
            bg: "#f3f4f6",
          };
          return `<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700;background:${meta.bg};color:${meta.color};white-space:nowrap;">${meta.icon} ${subj.split(" ")[0]} ${pct}%</span>`;
        })
        .join(" ");
    } catch (e) {
      return "";
    }
  }

  // ----- Build filter pills -----
  function buildFilterPills() {
    const quizzes = Object.entries(quizMapRef.current).sort(
      (a, b) => (a[1].order || 0) - (b[1].order || 0),
    );

    let html = `<button class="filter-pill active" id="pill-overall">📊 Overall Average</button>`;
    quizzes.forEach(([qid, q]) => {
      html += `<button class="filter-pill" id="pill-${qid}" data-qid="${qid}">${q.name}</button>`;
    });

    if (filterPillsRef.current) {
      filterPillsRef.current.innerHTML = html;
      // attach delegated handler
      filterPillsRef.current.querySelectorAll(".filter-pill").forEach((btn) => {
        btn.addEventListener("click", () => {
          const qid =
            btn.id === "pill-overall"
              ? "overall"
              : btn.getAttribute("data-qid");
          selectFilter(qid);
        });
      });
    }
  }

  function selectFilter(quizId) {
    activeQuizIdRef.current = String(quizId);
    document
      .querySelectorAll(".filter-pill")
      .forEach((p) => p.classList.remove("active"));
    const active = document.getElementById(`pill-${quizId}`);
    if (active) {
      active.classList.add("active");
      active.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
    renderLeaderboard();
  }

  function renderLeaderboard() {
    if (activeQuizIdRef.current === "overall") {
      renderOverall();
    } else {
      renderQuiz(String(activeQuizIdRef.current));
    }
  }

  function renderOverall() {
    if (tableHeadersRef.current) {
      tableHeadersRef.current.innerHTML = `
        <th>Rank</th>
        <th>Name</th>
        <th>District</th>
        <th>Quizzes Taken</th>
        <th>Avg Score</th>
        <th>Average %</th>
        <th>Subjects</th>
      `;
    }

    if (cardHeaderPRef.current)
      cardHeaderPRef.current.textContent =
        "Overall average across all published quizzes";

    const allAttempts = allAttemptsRef.current;
    const userMap = userMapRef.current;
    const currentUid = currentUidRef.current;

    if (!allAttempts.length) {
      showEmpty("No published results yet. Check back soon!");
      return;
    }

    const userStats = {};
    allAttempts.forEach((a) => {
      if (!userStats[a.user_id]) {
        userStats[a.user_id] = {
          total_score: 0,
          total_max: 0,
          quiz_count: 0,
          pcts: [],
        };
      }
      const pct = Math.round((a.score / a.total) * 100);
      userStats[a.user_id].total_score += a.score;
      userStats[a.user_id].total_max += a.total;
      userStats[a.user_id].quiz_count += 1;
      userStats[a.user_id].pcts.push(pct);
    });

    const ranked = Object.entries(userStats)
      .map(([uid, s]) => {
        const avgPct = Math.round(
          s.pcts.reduce((a, b) => a + b, 0) / s.pcts.length,
        );
        return {
          uid,
          avgPct,
          quizCount: s.quiz_count,
          totalScore: s.total_score,
          totalMax: s.total_max,
        };
      })
      .sort((a, b) => b.avgPct - a.avgPct);

    const topPct = ranked[0]?.avgPct || 0;
    const avgAll = ranked.length
      ? Math.round(ranked.reduce((s, r) => s + r.avgPct, 0) / ranked.length)
      : 0;
    const myRank = ranked.findIndex((r) => r.uid === currentUid) + 1;
    if (totalParticipantsRef.current)
      totalParticipantsRef.current.textContent = ranked.length;
    if (topScoreRef.current) topScoreRef.current.textContent = topPct + "%";
    if (avgScoreRef.current) avgScoreRef.current.textContent = avgAll + "%";
    if (yourRankRef.current)
      yourRankRef.current.textContent = myRank > 0 ? `#${myRank}` : "—";

    if (myRank === 1 && currentUid) {
      const myInfo = userMap[currentUid] || { name: "Student" };
      const myStats = ranked[0];
      showCertBanner(myInfo.name, "Overall Leaderboard", myStats.avgPct + "%");
    } else {
      hideCertBanner();
    }

    let tbodyHTML = "",
      mobileHTML = "";

    ranked.forEach((r, i) => {
      const info = userMap[r.uid] || { name: "Anonymous", district: "—" };
      const isYou = r.uid === currentUid;
      const youBadge = isYou ? `<span class="you-badge">You</span>` : "";
      const rowCls = isYou ? "current-user" : "";

      const subjPills = subjectPillsHTML(r.uid, "overall");
      tbodyHTML += `
        <tr class="${rowCls}">
          <td>${rankBadgeHTML(i)}</td>
          <td class="name-cell">${info.name}${youBadge}</td>
          <td>${info.district}</td>
          <td style="color:var(--muted);font-size:13px;">${r.quizCount} quiz${r.quizCount !== 1 ? "zes" : ""}</td>
          <td style="font-size:13px;color:var(--muted);">${r.totalScore}/${r.totalMax}</td>
          <td><span class="pct-pill ${pctClass(r.avgPct)}">${r.avgPct}%</span></td>
          <td style="min-width:180px;">${subjPills || '<span style="color:var(--muted);font-size:11px;">—</span>'}</td>
        </tr>`;

      mobileHTML += `
        <div class="lb-mobile-item ${rowCls}">
          ${rankBadgeHTML(i)}
          <div class="lb-mobile-info">
            <div class="lb-mobile-name">${info.name}${youBadge}</div>
            <div class="lb-mobile-sub">${info.district} · ${r.quizCount} quiz${r.quizCount !== 1 ? "zes" : ""}</div>
            ${subjPills ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:5px;">${subjPills}</div>` : ""}
          </div>
          <div class="lb-mobile-right">
            <span class="pct-pill ${pctClass(r.avgPct)}">${r.avgPct}%</span>
            <div class="lb-mobile-score">${r.totalScore}/${r.totalMax} total</div>
          </div>
        </div>`;
    });

    if (tbodyDesktopRef.current)
      tbodyDesktopRef.current.innerHTML =
        tbodyHTML ||
        `<tr><td colspan="7"><div class="empty-state"><div class="icon">📋</div><p>No published results yet.</p></div></td></tr>`;
    if (mobileListRef.current) mobileListRef.current.innerHTML = mobileHTML;
  }

  function renderQuiz(quizId) {
    const quizName = quizMapRef.current[quizId]?.name || "Quiz";

    if (tableHeadersRef.current) {
      tableHeadersRef.current.innerHTML = `
        <th>Rank</th>
        <th>Name</th>
        <th>District</th>
        <th>Score</th>
        <th>Percentage</th>
        <th>Subject Accuracy</th>
      `;
    }

    if (cardHeaderPRef.current)
      cardHeaderPRef.current.textContent = `Results for: ${quizName}`;

    const allAttempts = allAttemptsRef.current;
    const userMap = userMapRef.current;
    const currentUid = currentUidRef.current;

    const quizAttempts = allAttempts
      .filter((a) => String(a.quiz_id) === String(quizId))
      .sort((a, b) => b.score / b.total - a.score / a.total);

    if (!quizAttempts.length) {
      showEmpty(`No published results for "${quizName}" yet.`);
      if (totalParticipantsRef.current)
        totalParticipantsRef.current.textContent = "0";
      if (topScoreRef.current) topScoreRef.current.textContent = "—";
      if (avgScoreRef.current) avgScoreRef.current.textContent = "—";
      if (yourRankRef.current) yourRankRef.current.textContent = "—";
      hideCertBanner();
      return;
    }

    const pcts = quizAttempts.map((a) => Math.round((a.score / a.total) * 100));
    const topPct = pcts[0];
    const avgPct = Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length);
    const myIdx = quizAttempts.findIndex((a) => a.user_id === currentUid);
    if (totalParticipantsRef.current)
      totalParticipantsRef.current.textContent = quizAttempts.length;
    if (topScoreRef.current) topScoreRef.current.textContent = topPct + "%";
    if (avgScoreRef.current) avgScoreRef.current.textContent = avgPct + "%";
    if (yourRankRef.current)
      yourRankRef.current.textContent = myIdx >= 0 ? `#${myIdx + 1}` : "—";

    if (myIdx === 0 && currentUid) {
      const myInfo = userMap[currentUid] || { name: "Student" };
      showCertBanner(myInfo.name, quizName, pcts[0] + "%");
    } else {
      hideCertBanner();
    }

    let tbodyHTML = "",
      mobileHTML = "";

    quizAttempts.forEach((a, i) => {
      const info = userMap[a.user_id] || { name: "Anonymous", district: "—" };
      const p = pcts[i];
      const isYou = a.user_id === currentUid;
      const youBadge = isYou ? `<span class="you-badge">You</span>` : "";
      const rowCls = isYou ? "current-user" : "";

      const subjPillsQ = subjectPillsHTML(a.user_id, quizId);
      tbodyHTML += `
        <tr class="${rowCls}">
          <td>${rankBadgeHTML(i)}</td>
          <td class="name-cell">${info.name}${youBadge}</td>
          <td>${info.district}</td>
          <td style="font-size:13px;color:var(--muted);">${a.score}/${a.total}</td>
          <td><span class="pct-pill ${pctClass(p)}">${p}%</span></td>
          <td style="min-width:180px;">${subjPillsQ || '<span style="color:var(--muted);font-size:11px;">—</span>'}</td>
        </tr>`;

      mobileHTML += `
        <div class="lb-mobile-item ${rowCls}">
          ${rankBadgeHTML(i)}
          <div class="lb-mobile-info">
            <div class="lb-mobile-name">${info.name}${youBadge}</div>
            <div class="lb-mobile-sub">${info.district}</div>
            ${subjPillsQ ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:5px;">${subjPillsQ}</div>` : ""}
          </div>
          <div class="lb-mobile-right">
            <span class="pct-pill ${pctClass(p)}">${p}%</span>
            <div class="lb-mobile-score">${a.score}/${a.total}</div>
          </div>
        </div>`;
    });

    if (tbodyDesktopRef.current) tbodyDesktopRef.current.innerHTML = tbodyHTML;
    if (mobileListRef.current) mobileListRef.current.innerHTML = mobileHTML;
  }

  // ----- INIT -----
  //   async function init() {
  //     try {
  //       const { data: authData } = await supabase.auth.getUser();
  //       currentUidRef.current = authData?.user?.id || null;

  //       // Load all published attempts
  //       let allAttempts = [];
  //       const { data: attempts, error: aErr } = await supabase
  //         .from("quiz_attempts")
  //         .select("id, user_id, quiz_id, score, total, answers, created_at")
  //         .eq("is_published", true);

  //       if (aErr) {
  //         if (aErr.message && aErr.message.includes("is_published")) {
  //           const { data: fallback } = await supabase
  //             .from("quiz_attempts")
  //             .select("id, user_id, quiz_id, score, total, answers, created_at");
  //           allAttempts = fallback || [];
  //         } else {
  //           throw aErr;
  //         }
  //       } else {
  //         allAttempts = attempts || [];
  //       }
  //       allAttemptsRef.current = allAttempts;

  //       // Load users
  //       try {
  //         const { data: usersData } = await supabase
  //           .from("users")
  //           .select("id, first_name, last_name, district");
  //         (usersData || []).forEach((u) => {
  //           userMapRef.current[u.id] = {
  //             name:
  //               [u.first_name, u.last_name].filter(Boolean).join(" ") ||
  //               "Anonymous",
  //             district: u.district || "—",
  //           };
  //         });
  //       } catch {}

  //       // Load quizzes
  //       try {
  //         const { data: quizzesData } = await supabase
  //           .from("quizzes")
  //           .select("id, name, quiz_order")
  //           .order("quiz_order", { ascending: true });

  //         const attemptedQuizIds = new Set(
  //           allAttempts.map((a) => String(a.quiz_id)),
  //         );
  //         (quizzesData || []).forEach((q) => {
  //           if (attemptedQuizIds.has(String(q.id))) {
  //             quizMapRef.current[String(q.id)] = {
  //               name: q.name,
  //               order: q.quiz_order || 0,
  //             };
  //           }
  //         });
  //       } catch {}

  //       // Build subject score map
  //       try {
  //         const quizIds = [
  //           ...new Set(allAttempts.map((a) => a.quiz_id).filter(Boolean)),
  //         ];
  //         if (quizIds.length > 0) {
  //           const { data: questionsData } = await supabase
  //             .from("questions")
  //             .select("id, quiz_id, subject, correct_answer")
  //             .in("quiz_id", quizIds)
  //             .not("subject", "is", null);

  //           if (questionsData?.length) {
  //             const quizQMap = {};
  //             questionsData.forEach((q) => {
  //               const qid = String(q.quiz_id);
  //               if (!quizQMap[qid]) quizQMap[qid] = [];
  //               quizQMap[qid].push(q);
  //             });

  //             allAttempts.forEach((a) => {
  //               if (!a.answers || typeof a.answers !== "object") return;
  //               const uid = a.user_id;
  //               const qid = String(a.quiz_id);
  //               const qs = quizQMap[qid];
  //               if (!qs?.length) return;

  //               if (!subjectScoreMapRef.current[uid])
  //                 subjectScoreMapRef.current[uid] = {};
  //               if (!subjectScoreMapRef.current[uid][qid])
  //                 subjectScoreMapRef.current[uid][qid] = {};

  //               qs.forEach((q, idx) => {
  //                 const subj = q.subject;
  //                 if (!subj) return;
  //                 const userAns =
  //                   a.answers[idx] ??
  //                   a.answers[idx + 1] ??
  //                   a.answers[String(idx)] ??
  //                   a.answers[String(idx + 1)];
  //                 if (userAns === undefined) return;

  //                 if (!subjectScoreMapRef.current[uid][qid][subj])
  //                   subjectScoreMapRef.current[uid][qid][subj] = {
  //                     correct: 0,
  //                     total: 0,
  //                   };
  //                 subjectScoreMapRef.current[uid][qid][subj].total++;
  //                 if (userAns === q.correct_answer)
  //                   subjectScoreMapRef.current[uid][qid][subj].correct++;
  //               });
  //             });
  //           }
  //         }
  //       } catch (e) {
  //         console.warn("Subject score map build (non-critical):", e.message);
  //       }

  //       buildFilterPills();
  //       renderLeaderboard();
  //     } catch (e) {
  //       console.error(e);
  //       showError("Error loading leaderboard. Please refresh the page.");
  //     }
  //   }

  // ===== CERTIFICATE SYSTEM =====
  function showCertBanner(name, quizLabel, scoreText) {
    certDataRef.current.name = name;
    certDataRef.current.quizName = quizLabel;
    certDataRef.current.score = scoreText;
    certDataRef.current.date = new Date().toLocaleDateString("en-PK", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    if (certBannerRef.current) certBannerRef.current.style.display = "block";
    if (certBannerSubRef.current)
      certBannerSubRef.current.textContent = `Ranked #1 in ${quizLabel} — Download your certificate of excellence!`;
  }

  function hideCertBanner() {
    if (certBannerRef.current) certBannerRef.current.style.display = "none";
  }

  const openCertificate = () => {
    certOverlayRef.current?.classList.add("open");
    drawCertificate();
  };

  const closeCertificate = () => {
    certOverlayRef.current?.classList.remove("open");
  };

  const handleOverlayClick = (e) => {
    if (e.target === certOverlayRef.current) closeCertificate();
  };

  const downloadCertificate = () => {
    const canvas = certCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "MedMinds-Certificate.png";
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
  };

  function drawCertificate() {
    const canvas = certCanvasRef.current;
    if (!canvas) return;
    const W = 1200,
      H = 840;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    const headerGrad = ctx.createLinearGradient(0, 0, W, 0);
    headerGrad.addColorStop(0, "#072f6b");
    headerGrad.addColorStop(0.4, "#0a4a8f");
    headerGrad.addColorStop(0.7, "#0b63b7");
    headerGrad.addColorStop(1, "#3b82f6");
    ctx.fillStyle = headerGrad;
    ctx.fillRect(0, 0, W, 130);

    ctx.fillStyle = headerGrad;
    ctx.fillRect(0, H - 80, W, 80);

    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    for (let x = 10; x < W; x += 28) {
      for (let y = 10; y < 130; y += 28) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    ctx.strokeStyle = "#0b63b7";
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, W - 32, H - 32);

    ctx.strokeStyle = "rgba(11,99,183,0.2)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(26, 26, W - 52, H - 52);

    function drawMedCorner(cx, cy) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = "rgba(11,99,183,0.12)";
      ctx.fillRect(-3, -14, 6, 28);
      ctx.fillRect(-14, -3, 28, 6);
      ctx.strokeStyle = "rgba(11,99,183,0.4)";
      ctx.lineWidth = 1;
      ctx.strokeRect(-3, -14, 6, 28);
      ctx.strokeRect(-14, -3, 28, 6);
      ctx.restore();
    }
    drawMedCorner(55, 55);
    drawMedCorner(W - 55, 55);
    drawMedCorner(55, H - 55);
    drawMedCorner(W - 55, H - 55);

    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";

    function renderCertContent() {
      if (logoImg.complete && logoImg.naturalWidth > 0) {
        const lh = 90,
          lw = 90;
        ctx.drawImage(logoImg, 36, 20, lw, lh);
      } else {
        ctx.fillStyle = "#fff";
        ctx.font = "bold 40px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("+", 48, 88);
      }

      ctx.textAlign = "center";
      ctx.font = 'bold 36px "Merriweather", "Georgia", serif';
      ctx.fillStyle = "#ffffff";
      ctx.fillText("MedMinds", W / 2, 72);
      ctx.font = '14px "DM Sans", Arial, sans-serif';
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.letterSpacing = "4px";
      ctx.fillText("YOUR FUTURE BEGINS HERE", W / 2, 100);
      ctx.letterSpacing = "0px";

      ctx.font = 'bold 13px "DM Sans", Arial, sans-serif';
      ctx.fillStyle = "#0b63b7";
      ctx.letterSpacing = "5px";
      ctx.fillText("CERTIFICATE", W / 2, 175);
      ctx.letterSpacing = "0px";

      ctx.font = 'bold 48px "Merriweather", "Georgia", serif';
      const titleGrad = ctx.createLinearGradient(
        W / 2 - 260,
        0,
        W / 2 + 260,
        0,
      );
      titleGrad.addColorStop(0, "#072f6b");
      titleGrad.addColorStop(0.4, "#0b63b7");
      titleGrad.addColorStop(0.6, "#3b82f6");
      titleGrad.addColorStop(1, "#072f6b");
      ctx.fillStyle = titleGrad;
      ctx.fillText("of Excellence", W / 2, 230);

      const divGrad = ctx.createLinearGradient(W / 2 - 320, 0, W / 2 + 320, 0);
      divGrad.addColorStop(0, "transparent");
      divGrad.addColorStop(0.2, "rgba(11,99,183,0.4)");
      divGrad.addColorStop(0.5, "#0b63b7");
      divGrad.addColorStop(0.8, "rgba(11,99,183,0.4)");
      divGrad.addColorStop(1, "transparent");

      ctx.strokeStyle = divGrad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 320, 258);
      ctx.lineTo(W / 2 + 320, 258);
      ctx.stroke();

      ctx.font = 'italic 18px "Georgia", serif';
      ctx.fillStyle = "#5a6b82";
      ctx.fillText("This is to certify that", W / 2, 308);

      ctx.font = 'bold 56px "Merriweather", "Georgia", serif';
      ctx.fillStyle = "#0d1f3c";
      ctx.shadowColor = "rgba(11,99,183,0.15)";
      ctx.shadowBlur = 16;
      ctx.fillText(certDataRef.current.name || "Student Name", W / 2, 390);
      ctx.shadowBlur = 0;

      const nameW = ctx.measureText(
        certDataRef.current.name || "Student Name",
      ).width;
      ctx.strokeStyle = "#0b63b7";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2 - nameW / 2, 402);
      ctx.lineTo(W / 2 + nameW / 2, 402);
      ctx.stroke();

      ctx.font = 'italic 18px "Georgia", serif';
      ctx.fillStyle = "#5a6b82";
      ctx.fillText("has achieved", W / 2, 446);

      ctx.save();
      ctx.beginPath();
      const bx = W / 2,
        by = 510;
      ctx.roundRect(bx - 150, by - 34, 300, 58, 30);
      const badgeGrad = ctx.createLinearGradient(bx - 150, 0, bx + 150, 0);
      badgeGrad.addColorStop(0, "#072f6b");
      badgeGrad.addColorStop(0.4, "#0a4a8f");
      badgeGrad.addColorStop(0.6, "#0b63b7");
      badgeGrad.addColorStop(1, "#3b82f6");
      ctx.fillStyle = badgeGrad;
      ctx.fill();
      ctx.restore();
      ctx.font = 'bold 26px "Georgia", serif';
      ctx.fillStyle = "#ffffff";
      ctx.fillText("🥇  RANK #1  🥇", W / 2, by + 10);

      ctx.font = 'italic 17px "Georgia", serif';
      ctx.fillStyle = "#5a6b82";
      ctx.fillText("in", W / 2, 574);

      ctx.font = 'bold 22px "Merriweather", "Georgia", serif';
      ctx.fillStyle = "#0b63b7";
      const quizLabel =
        (certDataRef.current.quizName || "Overall Leaderboard").length > 52
          ? (certDataRef.current.quizName || "Overall Leaderboard").slice(
              0,
              49,
            ) + "..."
          : certDataRef.current.quizName || "Overall Leaderboard";
      ctx.fillText(quizLabel, W / 2, 610);

      const scoreText = `Score: ${certDataRef.current.score}`;
      const dateText = `Date: ${certDataRef.current.date}`;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(W / 2 - 280, 640, 240, 40, 20);
      ctx.fillStyle = "rgba(11,99,183,0.08)";
      ctx.fill();
      ctx.strokeStyle = "rgba(11,99,183,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
      ctx.font = '14px "DM Sans", Arial, sans-serif';
      ctx.fillStyle = "#0a4a8f";
      ctx.fillText(scoreText, W / 2 - 160, 665);

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(W / 2 + 40, 640, 240, 40, 20);
      ctx.fillStyle = "rgba(11,99,183,0.08)";
      ctx.fill();
      ctx.strokeStyle = "rgba(11,99,183,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
      ctx.font = '14px "DM Sans", Arial, sans-serif';
      ctx.fillStyle = "#0a4a8f";
      ctx.fillText(dateText, W / 2 + 160, 665);

      ctx.strokeStyle = divGrad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 320, 700);
      ctx.lineTo(W / 2 + 320, 700);
      ctx.stroke();

      ctx.font = 'bold 13px "DM Sans", Arial, sans-serif';
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.letterSpacing = "2px";
      ctx.fillText("OFFICIALLY ISSUED BY MEDMINDS ACADEMY", W / 2, H - 42);
      ctx.letterSpacing = "0px";

      ctx.font = "12px Arial, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText(
        "🌐medminds.online  ·  Your Future Begins Here",
        W / 2,
        H - 20,
      );
    }

    logoImg.onload = () => renderCertContent();
    logoImg.onerror = () => renderCertContent();
    logoImg.src = "logo.jpeg";

    renderCertContent();
  }

  return (
    <>
      <StudentLayout title="Leadership Dashboard | MedMinds">
        {/* ===== MAIN ===== */}
        <main>
          <div className="page-title">
            <h1>🏅 Leadership Dashboard</h1>
            <p>Rankings based on published quiz results</p>
          </div>

          <div className="filter-bar">
            <div className="filter-label">Filter by Quiz</div>
            <div className="filter-pills-wrap">
              <div
                className="filter-pills"
                id="filterPills"
                ref={filterPillsRef}
              >
                <div className="filter-pill-skeleton"></div>
                <div
                  className="filter-pill-skeleton"
                  style={{ width: "120px" }}
                ></div>
                <div
                  className="filter-pill-skeleton"
                  style={{ width: "90px" }}
                ></div>
                <div
                  className="filter-pill-skeleton"
                  style={{ width: "110px" }}
                ></div>
                <div
                  className="filter-pill-skeleton"
                  style={{ width: "80px" }}
                ></div>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div>
                <div className="stat-label">Participants</div>
                <div
                  id="totalParticipants"
                  ref={totalParticipantsRef}
                  className="stat-number"
                >
                  —
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div>
                <div className="stat-label">Top Score</div>
                <div id="topScore" ref={topScoreRef} className="stat-number">
                  —
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div>
                <div className="stat-label">Average Score</div>
                <div id="avgScore" ref={avgScoreRef} className="stat-number">
                  —
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div>
                <div className="stat-label">Your Rank</div>
                <div id="yourRank" ref={yourRankRef} className="stat-number">
                  —
                </div>
              </div>
            </div>
          </div>

          {/* 🏆 Certificate Banner */}
          <div className="cert-banner" id="certBanner" ref={certBannerRef}>
            <div className="cert-banner-inner">
              <div className="cert-banner-left">
                <div className="cert-trophy">🏆</div>
                <div className="cert-banner-text">
                  <h3>Congratulations! You're #1 on the Leaderboard!</h3>
                  <p id="certBannerSubtext" ref={certBannerSubRef}>
                    You've earned a certificate of excellence from MedMinds.
                  </p>
                </div>
              </div>
              <button className="cert-download-btn" onClick={openCertificate}>
                🎖️ View Certificate
              </button>
            </div>
          </div>

          {/* Certificate Modal */}
          <div
            className="cert-overlay"
            id="certOverlay"
            ref={certOverlayRef}
            onClick={handleOverlayClick}
          >
            <div className="cert-modal">
              <canvas
                id="certCanvas"
                ref={certCanvasRef}
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  display: "block",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                }}
              ></canvas>
              <div className="cert-modal-actions">
                <button className="cert-close-btn" onClick={closeCertificate}>
                  ✕ Close
                </button>
                <button className="cert-save-btn" onClick={downloadCertificate}>
                  ⬇️ Download PNG
                </button>
              </div>
            </div>
          </div>

          {/* Leaderboard card */}
          <div className="lb-card">
            <div className="lb-card-header">
              <div>
                <h2>🏅 Top Performers</h2>
                <p ref={cardHeaderPRef}>Rankings based on published results</p>
              </div>
            </div>

            <div className="table-scroll" id="tableWrapper">
              <table>
                <thead>
                  <tr id="tableHeaders" ref={tableHeadersRef}>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>District</th>
                    <th>Score</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody id="tbodyDesktop" ref={tbodyDesktopRef}>
                  <tr className="loading-rows">
                    <td>
                      <div
                        className="skeleton"
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                        }}
                      ></div>
                    </td>
                    <td>
                      <div
                        className="skeleton"
                        style={{ width: "120px" }}
                      ></div>
                    </td>
                    <td>
                      <div className="skeleton" style={{ width: "80px" }}></div>
                    </td>
                    <td>
                      <div className="skeleton" style={{ width: "60px" }}></div>
                    </td>
                    <td>
                      <div className="skeleton" style={{ width: "50px" }}></div>
                    </td>
                  </tr>
                  <tr className="loading-rows">
                    <td>
                      <div
                        className="skeleton"
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                        }}
                      ></div>
                    </td>
                    <td>
                      <div
                        className="skeleton"
                        style={{ width: "100px" }}
                      ></div>
                    </td>
                    <td>
                      <div className="skeleton" style={{ width: "70px" }}></div>
                    </td>
                    <td>
                      <div className="skeleton" style={{ width: "60px" }}></div>
                    </td>
                    <td>
                      <div className="skeleton" style={{ width: "50px" }}></div>
                    </td>
                  </tr>
                  <tr className="loading-rows">
                    <td>
                      <div
                        className="skeleton"
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                        }}
                      ></div>
                    </td>
                    <td>
                      <div
                        className="skeleton"
                        style={{ width: "110px" }}
                      ></div>
                    </td>
                    <td>
                      <div className="skeleton" style={{ width: "90px" }}></div>
                    </td>
                    <td>
                      <div className="skeleton" style={{ width: "60px" }}></div>
                    </td>
                    <td>
                      <div className="skeleton" style={{ width: "50px" }}></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              className="lb-mobile-list"
              id="mobileList"
              ref={mobileListRef}
            ></div>
          </div>

          <div className="actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                window.location.href = "/result";
              }}
            >
              📋 View My Results
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                window.location.href = "/quiz";
              }}
            >
              ← Back to Quiz
            </button>
          </div>
        </main>
      </StudentLayout>
    </>
  );
};

export default Leaderboard;
