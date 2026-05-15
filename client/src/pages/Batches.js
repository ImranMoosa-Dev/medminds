import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/SupabaseClient";
import { useAuth } from "../context/auth";
import "../styles/batches.css";

const GRADIENTS = [
  ["#0b63b7", "#0a4a8f"],
  ["#1565c0", "#0d47a1"],
  ["#0277bd", "#01579b"],
  ["#283593", "#1a237e"],
  ["#1976d2", "#1565c0"],
  ["#0288d1", "#006064"],
];

const Batches = () => {
  const navigate = useNavigate();
  const [auth] = useAuth();

  const currentUserRef = useRef(null);
  const userDataRef = useRef(null);
  const selectedBatchIdRef = useRef(null);
  const selectedBatchNameRef = useRef(null);

  const toastTimerRef = useRef(null);

  useEffect(() => {
    document.title = "Batch Enrollment — MedMinds";

    if (!auth?.user) {
      navigate("/login");
      return;
    }

    // Listen to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (evt, session) => {
        if (evt === "SIGNED_IN" && session && !currentUserRef.current) init();
      },
    );

    init();

    // Expose selectBatch on window for inline onclick in dynamic HTML
    window.__batches_selectBatch = (id, name) => selectBatch(id, name);

    return () => {
      authListener?.subscription?.unsubscribe?.();
      delete window.__batches_selectBatch;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function init() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        currentUserRef.current = user;
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        userDataRef.current = error
          ? {
              id: user.id,
              email: user.email,
              first_name: "",
              last_name: "",
              phone: null,
            }
          : data;
      } else {
        window.location.href = "index.html";
        return;
      }

      const userData = userDataRef.current;
      const name =
        (
          (userData.first_name || "") +
          " " +
          (userData.last_name || "")
        ).trim() || "Student";
      const hdrName = document.getElementById("hdrName");
      const hdrEmail = document.getElementById("hdrEmail");
      const hdrUser = document.getElementById("hdrUser");
      if (hdrName) hdrName.textContent = name;
      if (hdrEmail) hdrEmail.textContent = userData.email || user.email;
      if (hdrUser) hdrUser.style.display = "flex";

      await checkEnrollmentStatus(name);
    } catch (e) {
      console.error(e);
      showToast("Error loading page. Please refresh.", "error");
      hideLoader();
    }
  }

  async function checkEnrollmentStatus(displayName) {
    try {
      const { data: userRow } = await supabase
        .from("users")
        .select("batch_id")
        .eq("id", currentUserRef.current.id)
        .single();

      if (userRow?.batch_id) {
        const { data: batch } = await supabase
          .from("batches")
          .select("name")
          .eq("id", userRow.batch_id)
          .single();
        const batchName = batch?.name || "Your Batch";

        const approvedName = document.getElementById("approvedName");
        const approvedBatchTitle =
          document.getElementById("approvedBatchTitle");
        const approvedBatchName = document.getElementById("approvedBatchName");
        if (approvedName) approvedName.textContent = displayName;
        if (approvedBatchTitle) approvedBatchTitle.textContent = batchName;
        if (approvedBatchName) approvedBatchName.textContent = batchName;
        showScreen("screenApproved");
        return;
      }

      const { data: req } = await supabase
        .from("enrollment_requests")
        .select("*")
        .eq("user_id", currentUserRef.current.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (req) {
        if (req.approval_status === "pending") {
          const { data: batch } = await supabase
            .from("batches")
            .select("name")
            .eq("id", req.batch_id)
            .single();
          const batchName = batch?.name || "Selected Batch";
          const submittedDate = new Date(req.created_at).toLocaleDateString(
            "en-GB",
            { day: "numeric", month: "short", year: "numeric" },
          );

          const pendingName = document.getElementById("pendingName");
          const pendingBatch = document.getElementById("pendingBatch");
          const pendingBatchPill = document.getElementById("pendingBatchPill");
          const pendingDate = document.getElementById("pendingDate");
          if (pendingName) pendingName.textContent = displayName;
          if (pendingBatch) pendingBatch.textContent = batchName;
          if (pendingBatchPill) pendingBatchPill.textContent = batchName;
          if (pendingDate)
            pendingDate.textContent = "Submitted " + submittedDate;
          showScreen("screenPending");
          return;
        }

        if (
          req.approval_status === "denied" ||
          req.approval_status === "rejected"
        ) {
          const deniedName = document.getElementById("deniedName");
          if (deniedName) deniedName.textContent = displayName;
          showScreen("screenDenied");
          return;
        }
      }

      hideLoader();
      const step1 = document.getElementById("step1");
      if (step1) step1.style.display = "block";
      await loadBatches();
    } catch (e) {
      hideLoader();
      const step1 = document.getElementById("step1");
      if (step1) step1.style.display = "block";
      await loadBatches();
    }
  }

  async function loadBatches() {
    const grid = document.getElementById("batchesGrid");
    if (!grid) return;
    try {
      const { data, error } = await supabase
        .from("batches")
        .select("id, name, description, start_date, end_date")
        .order("name", { ascending: true });
      if (error) throw error;

      if (!data?.length) {
        grid.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--muted)">
            <div style="font-size:52px;margin-bottom:16px">📭</div>
            <p style="font-size:16px;font-weight:600;color:var(--text)">No batches available yet</p>
            <p style="font-size:13px;margin-top:6px">Please contact admin to set up batches.</p>
          </div>`;
        return;
      }

      grid.innerHTML = data
        .map((b, i) => {
          const [from, to] = GRADIENTS[i % GRADIENTS.length];
          const desc = (
            b.description ||
            "Join this batch to access all MDCAT preparation quizzes, performance tracking, and leaderboard rankings."
          ).substring(0, 140);
          const safeName = (b.name || "").replace(/'/g, "\\'");
          let dateLine = "";
          if (b.start_date) {
            dateLine = `<li><span class="perk-dot"></span>${formatDate(b.start_date)}${b.end_date ? " – " + formatDate(b.end_date) : ""}</li>`;
          }
          return `
          <div class="batch-card" onclick="window.__batches_selectBatch('${b.id}','${safeName}')">
            <div class="batch-card-hdr" style="background:linear-gradient(135deg,${from},${to})">
              <span class="batch-icon">🎓</span>
              <h3>${b.name}</h3>
              <span class="batch-chip">📚 MDCAT Prep</span>
            </div>
            <div class="batch-card-body">
              <p class="batch-desc">${desc}</p>
              <ul class="batch-perks">
                <li><span class="perk-dot"></span>Access to all published quizzes</li>
                <li><span class="perk-dot"></span>Performance tracking & analytics</li>
                <li><span class="perk-dot"></span>Leaderboard ranking</li>
                ${dateLine}
                <li><span class="perk-dot"></span>Admin-reviewed enrollment</li>
              </ul>
              <button class="btn-join">
                Enroll Now
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>`;
        })
        .join("");
    } catch (e) {
      console.error(e);
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">Failed to load batches. Please refresh.</div>`;
    }
  }

  function selectBatch(id, name) {
    selectedBatchIdRef.current = id;
    selectedBatchNameRef.current = name;
    const sbn = document.getElementById("selectedBatchName");
    if (sbn) sbn.textContent = name;

    pill("sPill1", "done", "✓");
    line("sLine1", true);
    pill("sPill2", "active");
    const sPill2 = document.getElementById("sPill2");
    if (sPill2) {
      sPill2.style.opacity = "1";
      sPill2.style.pointerEvents = "auto";
    }

    show("step1", false);
    show("step2", true);
    scrollTop();
  }

  function goBack() {
    selectedBatchIdRef.current = null;
    selectedBatchNameRef.current = null;
    pill("sPill1", "active", "1");
    line("sLine1", false);
    pill("sPill2", "", "2");
    const sPill2 = document.getElementById("sPill2");
    if (sPill2) {
      sPill2.style.opacity = ".45";
      sPill2.style.pointerEvents = "none";
    }
    const enrollForm = document.getElementById("enrollForm");
    if (enrollForm) enrollForm.reset();

    show("step2", false);
    show("step1", true);
    scrollTop();
  }

  async function submitEnrollment() {
    const fatherName = document.getElementById("fatherName").value.trim();
    const district = document.getElementById("district").value.trim();
    const status = document.getElementById("status").value;

    if (!fatherName) return showToast("Please enter father's name", "error");
    if (!district) return showToast("Please enter your district", "error");
    if (!status) return showToast("Please select your status", "error");

    const btn = document.getElementById("submitBtn");
    btn.disabled = true;
    document.getElementById("submitText").textContent = "Submitting…";
    document.getElementById("submitSpin").style.display = "inline-block";

    try {
      const { data: existing } = await supabase
        .from("enrollment_requests")
        .select("id")
        .eq("user_id", currentUserRef.current.id)
        .limit(1);
      if (existing?.length) {
        showToast("You already have a pending enrollment request.", "info");
        btn.disabled = false;
        document.getElementById("submitText").textContent = "Submit Request";
        document.getElementById("submitSpin").style.display = "none";
        return;
      }

      const { error } = await supabase.from("enrollment_requests").insert([
        {
          user_id: currentUserRef.current.id,
          batch_id: selectedBatchIdRef.current,
          father_name: fatherName,
          district,
          status,
          approval_status: "pending",
          created_at: new Date().toISOString(),
        },
      ]);
      if (error) throw error;

      pill("sPill2", "done", "✓");
      line("sLine2", true);
      pill("sPill3", "active");
      const sPill3 = document.getElementById("sPill3");
      if (sPill3) sPill3.style.opacity = "1";

      show("step2", false);
      show("stepsBar", false);
      show("pageHero", false);

      const userData = userDataRef.current;
      const name =
        (
          (userData.first_name || "") +
          " " +
          (userData.last_name || "")
        ).trim() || "there";
      document.getElementById("pendingName").textContent = name;
      document.getElementById("pendingBatch").textContent =
        selectedBatchNameRef.current;
      document.getElementById("pendingBatchPill").textContent =
        selectedBatchNameRef.current;
      document.getElementById("pendingDate").textContent = "Submitted today";

      showScreen("screenPending");
      showToast("✅ Request submitted successfully!", "success");
      scrollTop();
    } catch (e) {
      console.error(e);
      showToast(e.message || "Failed to submit. Please try again.", "error");
      btn.disabled = false;
      document.getElementById("submitText").textContent = "Submit Request";
      document.getElementById("submitSpin").style.display = "none";
    }
  }

  function showScreen(id) {
    hideLoader();
    show("step1", false);
    show("step2", false);
    show("stepsBar", false);
    show("pageHero", false);
    const el = document.getElementById(id);
    if (el) el.classList.add("show");
    scrollTop();
  }

  function hideLoader() {
    const lo = document.getElementById("loadingOverlay");
    if (lo) lo.style.display = "none";
  }

  function show(id, visible) {
    const el = document.getElementById(id);
    if (el) el.style.display = visible ? "block" : "none";
  }

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function pill(id, cls, num) {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = "step " + cls;
    if (num !== undefined) el.querySelector(".step-num").textContent = num;
  }

  function line(id, done) {
    const el = document.getElementById(id);
    if (el) {
      el.className = "step-line" + (done ? " done" : "");
    }
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function showToast(msg, type = "info") {
    const t = document.getElementById("toast");
    if (!t) return;
    const icons = { success: "✅", error: "❌", info: "ℹ️" };
    t.innerHTML = `<span>${icons[type] || ""}</span><span>${msg}</span>`;
    t.className = `toast ${type} show`;
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => t.classList.remove("show"), 5000);
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,700;0,900;1,300&family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* ══ HEADER ══ */}
      <header className="hdr">
        <div className="hdr-inner">
          <div className="hdr-brand">
            🏥 MedMinds
            <span>Batch Enrollment</span>
          </div>
          <div className="hdr-user" id="hdrUser" style={{ display: "none" }}>
            <div className="hdr-avatar">👤</div>
            <span id="hdrName">Loading…</span>
            <span
              id="hdrEmail"
              className="hdr-user-email"
              style={{ opacity: 0.65, fontWeight: 500 }}
            ></span>
          </div>
        </div>
      </header>

      {/* ══ TOAST ══ */}
      <div id="toast" className="toast"></div>

      {/* ══ MAIN ══ */}
      <div className="wrap">
        {/* HERO */}
        <div className="page-hero" id="pageHero">
          <div className="page-hero-eyebrow">📚 MDCAT Preparation 2026</div>
          <h1>
            Join Your <em>Batch</em>
          </h1>
          <p>
            Select a batch, fill your details, and get admin approval to unlock
            quizzes, performance tracking, and leaderboard.
          </p>
        </div>

        {/* STEPS */}
        <div className="steps-bar" id="stepsBar">
          <div className="step active" id="sPill1">
            <div className="step-num">1</div>
            Choose Batch
          </div>
          <div className="step-line" id="sLine1"></div>
          <div
            className="step active"
            id="sPill2"
            style={{ opacity: ".45", pointerEvents: "none" }}
          >
            <div className="step-num">2</div>
            Fill Details
          </div>
          <div className="step-line" id="sLine2"></div>
          <div
            className="step"
            id="sPill3"
            style={{ opacity: ".45", pointerEvents: "none" }}
          >
            <div className="step-num">3</div>
            Approval
          </div>
        </div>

        {/* Loading overlay */}
        <div id="loadingOverlay">
          <div className="loader-ring"></div>
          <div
            style={{ fontSize: "14px", color: "var(--muted)", fontWeight: 600 }}
          >
            Loading batches…
          </div>
        </div>

        {/* ══ STEP 1: Pick a batch ══ */}
        <div id="step1" style={{ display: "none" }}>
          <div className="batches-grid" id="batchesGrid"></div>
        </div>

        {/* ══ STEP 2: Enrollment form ══ */}
        <div id="step2" style={{ display: "none" }}>
          <div className="enroll-card">
            <div className="selected-badge">
              <div className="selected-badge-icon">📋</div>
              <div className="selected-badge-info">
                <div className="selected-badge-label">Selected Batch</div>
                <div className="selected-badge-name" id="selectedBatchName">
                  —
                </div>
              </div>
              <button className="btn-change" onClick={goBack}>
                ← Change
              </button>
            </div>

            <form
              id="enrollForm"
              onSubmit={(e) => {
                e.preventDefault();
                submitEnrollment();
              }}
            >
              <div className="fg">
                <label>Father's Name *</label>
                <input
                  type="text"
                  id="fatherName"
                  placeholder="e.g. Ahmed Khan"
                  required
                />
              </div>
              <div className="fg">
                <label>District *</label>
                <input
                  type="text"
                  id="district"
                  placeholder="e.g. Karachi"
                  required
                />
              </div>
              <div className="fg">
                <label>Status *</label>
                <select id="status" required defaultValue="">
                  <option value="">— Select your status —</option>
                  <option value="fresher">🎓 Fresher (First attempt)</option>
                  <option value="improver">🔄 Improver (Retaking MDCAT)</option>
                </select>
              </div>
              <div className="form-btns">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={goBack}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  id="submitBtn"
                >
                  <span id="submitText">Submit Request</span>
                  <div className="spin" id="submitSpin"></div>
                </button>
              </div>
            </form>
            <div className="form-note">
              🔒 Your request will be reviewed by admin. You'll be notified once
              approved.
            </div>
          </div>
        </div>

        {/* ══ STATE: Pending ══ */}
        <div className="state-screen" id="screenPending">
          <div className="state-card">
            <div className="pending-pulse">⏳</div>
            <div className="state-label pending">⏳ Approval Pending</div>
            <h2 className="state-title">
              Your Request is
              <br />
              Under Review
            </h2>
            <p className="state-body">
              Hi <strong id="pendingName">there</strong>! We've received your
              enrollment request for
              <strong id="pendingBatch">your selected batch</strong>. Our admin
              team will review it shortly — usually within{" "}
              <strong>24 hours</strong>.
            </p>

            <div className="pending-timeline">
              <div className="tl-dot done">✓</div>
              <div className="tl-line done"></div>
              <div className="tl-dot done">✓</div>
              <div className="tl-line done"></div>
              <div className="tl-dot active">👀</div>
              <div className="tl-line"></div>
              <div className="tl-dot wait">🎓</div>
            </div>

            <div className="info-pills">
              <div className="info-pill">
                <span className="info-pill-icon">📋</span>
                <span id="pendingBatchPill">Batch pending</span>
              </div>
              <div className="info-pill">
                <span className="info-pill-icon">📅</span>
                <span id="pendingDate">Submitted today</span>
              </div>
              <div className="info-pill">
                <span className="info-pill-icon">📧</span>
                <span>Email notification on approval</span>
              </div>
            </div>

            <div className="state-btns">
              <a href="quiz-selection.html" className="btn-cta-ghost">
                ← Back to Quizzes
              </a>
            </div>
          </div>
        </div>

        {/* ══ STATE: Approved ══ */}
        <div className="state-screen" id="screenApproved">
          <div className="state-card">
            <div className="confetti-row">
              <div
                className="confetti-dot"
                style={{ background: "#f59e0b", animationDelay: ".0s" }}
              ></div>
              <div
                className="confetti-dot"
                style={{ background: "#0b63b7", animationDelay: ".1s" }}
              ></div>
              <div
                className="confetti-dot"
                style={{ background: "#16a34a", animationDelay: ".2s" }}
              ></div>
              <div
                className="confetti-dot"
                style={{ background: "#dc2626", animationDelay: ".15s" }}
              ></div>
              <div
                className="confetti-dot"
                style={{ background: "#7c3aed", animationDelay: ".05s" }}
              ></div>
              <div
                className="confetti-dot"
                style={{ background: "#f59e0b", animationDelay: ".25s" }}
              ></div>
              <div
                className="confetti-dot"
                style={{ background: "#0b63b7", animationDelay: ".08s" }}
              ></div>
            </div>
            <div className="approved-burst">🎉</div>
            <div className="state-label approved">✅ Enrollment Approved</div>
            <h2 className="state-title">
              Welcome to
              <br />
              <em
                style={{ fontStyle: "italic", color: "var(--blue)" }}
                id="approvedBatchTitle"
              >
                Your Batch
              </em>
              !
            </h2>
            <p className="state-body">
              Congratulations <strong id="approvedName">there</strong>! Your
              enrollment has been approved. You're now an official member of
              your batch — quizzes, leaderboard, and performance tracking are
              all unlocked.
            </p>

            <div className="approved-batch-hero">
              <div className="abh-icon">🎓</div>
              <div>
                <div className="abh-label">Your Batch</div>
                <div className="abh-name" id="approvedBatchName">
                  —
                </div>
              </div>
            </div>

            <div className="state-btns">
              <a href="quiz-selection.html" className="btn-cta">
                Start Quizzes
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a href="my-batch.html" className="btn-cta-ghost">
                📅 My Batch Schedule
              </a>
            </div>
          </div>
        </div>

        {/* ══ STATE: Denied ══ */}
        <div className="state-screen" id="screenDenied">
          <div className="state-card">
            <div className="denied-icon">❌</div>
            <div className="state-label denied">❌ Request Declined</div>
            <h2 className="state-title">
              Enrollment Not
              <br />
              Approved
            </h2>
            <p className="state-body">
              Hi <strong id="deniedName">there</strong>, unfortunately your
              enrollment request was not approved at this time. Please contact
              admin on WhatsApp for more information or to reapply.
            </p>
            <div className="state-btns">
              <a
                href="https://wa.me/923421371257"
                target="_blank"
                rel="noreferrer"
                className="btn-cta"
                style={{
                  background: "linear-gradient(135deg,#25d366,#128c7e)",
                }}
              >
                💬 Contact on WhatsApp
              </a>
              <a href="quiz-selection.html" className="btn-cta-ghost">
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* /wrap */}
    </>
  );
};

export default Batches;
