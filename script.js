// ================================
// APP CONFIG
// ================================
let supabaseClient = null;
let ADMIN_EMAILS = [];

async function initializeConfig() {
  try {
    const response = await fetch("/api/config");
    const config = await response.json();
    ADMIN_EMAILS = config.adminEmails || [];
  } catch (error) {
    console.error("Failed to load config:", error);
  }
}

initializeConfig();

// Send a single email
// templateOrBody: template name OR plain text body string (legacy)
// extras: { batchName, reason, quizName, score, total, pct, rank }
async function sendEmail(
  toEmail,
  toName,
  subject,
  templateOrBody,
  extras = {},
) {
  try {
    const knownTemplates = [
      "approval",
      "rejection",
      "notification",
      "new_quiz",
      "result",
    ];
    const isTemplate = knownTemplates.includes(templateOrBody);
    const payload = isTemplate
      ? { to: toEmail, toName, subject, template: templateOrBody, ...extras }
      : { to: toEmail, toName, subject, body: templateOrBody };

    const res = await fetch(EMAIL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success)
      console.warn("Email failed for", toEmail, ":", data.error);
    else console.log("Email sent to", toEmail);
    return data;
  } catch (e) {
    console.error("sendEmail error:", e.message);
    return { success: false, error: e.message };
  }
}

// Send bulk emails via Edge Function
// template: 'notification' | 'new_quiz' | 'result'
// bodyFn(u): returns body string per user
// extrasFn(u): optional — returns extra per-user fields
async function sendEmailBulk(
  recipients,
  subject,
  bodyFn,
  template = "notification",
  extrasFn = null,
) {
  if (!recipients || recipients.length === 0) return 0;
  try {
    const to = recipients.map((u) => ({
      email: u.email,
      name: u.first_name || "Student",
      body: bodyFn(u),
      ...(extrasFn ? extrasFn(u) : {}),
    }));

    console.log("Bulk email to", to.length, "recipients | template:", template);

    const res = await fetch(EMAIL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ type: "bulk", to, subject, template }),
    });

    const text = await res.text();
    console.log("Edge fn status:", res.status, "body:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }

    if (!res.ok || !data.success) {
      console.error("Bulk email failed:", data.error || text);
      return 0;
    }
    if (data.errors?.length) console.warn("Some emails failed:", data.errors);
    console.log(`Bulk done: ${data.sent}/${data.total}`);
    return data.sent || 0;
  } catch (e) {
    console.error("sendEmailBulk error:", e.message);
    return 0;
  }
}

// Legacy wrapper
async function sendEmailNotification(
  toEmail,
  subject,
  templateType,
  data = {},
) {
  const name = data.name || "Student";
  const body = data.message || data.body || subject;
  return await sendEmail(toEmail, name, subject, body);
}
// ================================
// GLOBAL
// ================================

let questions = [];
let currentQuestion = 0;
let answers = {};
let timerInterval;
let timeLeft = 600; // seconds

function formatTime(s) {
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

// ================================
// ROLE HELPER
// Fetches role from users table — single source of truth.
// Returns 'admin' | 'student' | null (not in users table)
// ================================

async function getUserRole(userId) {
  try {
    const { data, error } = await supabaseClient
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();
    if (error || !data) return null;
    return data.role || "student";
  } catch (e) {
    console.warn("getUserRole error:", e);
    return null;
  }
}

// Redirect to the correct home page based on role
async function redirectByRole(userId) {
  const role = await getUserRole(userId);
  window.location.href =
    role === "admin" ? "admin.html" : "quiz-selection.html";
}

// ================================
// AUTH / SESSION
// ================================

async function checkUser() {
  try {
    const { data } = await supabaseClient.auth.getUser();
    if (!data.user) {
      window.location.href = "index.html";
      return;
    }

    const role = await getUserRole(data.user.id);

    // Admins bypass batch gate
    if (role === "admin") return;

    // Students must have an approved batch_id
    const { data: userRow } = await supabaseClient
      .from("users")
      .select("batch_id")
      .eq("id", data.user.id)
      .single();
    if (!userRow?.batch_id) {
      window.location.href = "batches.html";
    }
  } catch (e) {
    console.warn(e);
  }
}

// Helper: use page-level showAlert if available, else fall back to alert()
function _pageAlert(msg, type = "error") {
  if (typeof showAlert === "function") showAlert(msg, type);
  else alert(msg);
}

async function login() {
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;
  if (!email || !password) {
    _pageAlert("Please enter email and password");
    return;
  }

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json();

    if (!result.success) {
      _pageAlert(result.error || "Invalid credentials");
      return;
    }

    window.location.href = result.redirect || "/home.html";
  } catch (e) {
    console.error("Login error:", e);
    _pageAlert("Login failed. Please try again.");
  }
}

// ================================
// LOAD QUESTIONS
// ================================

async function loadQuestions() {
  await checkUser();

  // Get the selected quiz ID from localStorage
  const selectedQuizId = localStorage.getItem("selectedQuizId");

  if (!selectedQuizId) {
    document.getElementById("question").innerText =
      "No quiz selected. Please select a quiz from the dashboard.";
    return;
  }

  // Check if user has already attempted this quiz
  try {
    const { data: userData } = await supabaseClient.auth.getUser();
    const user = userData?.user;
    if (user) {
      const { data: attempts, error: attemptsError } = await supabaseClient
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", user.id)
        .eq("quiz_id", selectedQuizId);

      if (!attemptsError && attempts && attempts.length > 0) {
        // User has already attempted this quiz
        document.body.innerHTML = `
          <div style="display:flex; align-items:center; justify-content:center; min-height:100vh; background:linear-gradient(180deg, #f7fbff 0%, #eef4fb 100%); padding:20px;">
            <div style="background:white; border-radius:14px; padding:40px; max-width:500px; text-align:center; box-shadow:0 10px 30px rgba(11,78,153,0.08);">
              <h1 style="color:#0b63b7; margin:0 0 12px 0;">Quiz Already Completed</h1>
              <p style="color:#6b7280; font-size:15px; line-height:1.6; margin:0 0 24px 0;">You have already completed this assessment. Each user is allowed only one attempt per quiz.</p>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                <button onclick="window.location.href='quiz-selection.html'" style="background:#eef6ff; color:#0b63b7; border:none; padding:10px 18px; border-radius:10px; cursor:pointer; font-weight:600; transition:all 0.12s ease;" onmouseover="this.style.background='#d1e0f1'" onmouseout="this.style.background='#eef6ff'">Back to Quizzes</button>
                <button onclick="logout()" style="background:#0b63b7; color:white; border:none; padding:10px 18px; border-radius:10px; cursor:pointer; font-weight:600; transition:all 0.12s ease;" onmouseover="this.style.background='#084a86'" onmouseout="this.style.background='#0b63b7'">Logout</button>
              </div>
            </div>
          </div>
        `;
        return;
      }
    }
  } catch (e) {
    console.warn("Error checking quiz attempts:", e);
  }

  // Load questions for the selected quiz
  try {
    // First try to get quiz name
    const { data: quizData } = await supabaseClient
      .from("quizzes")
      .select("name, description")
      .eq("id", selectedQuizId)
      .single();

    if (quizData) {
      localStorage.setItem("currentQuizName", quizData.name);
      localStorage.setItem(
        "currentQuizDescription",
        quizData.description || "",
      );
    }

    // Load questions for this specific quiz (assuming quiz_id field exists in questions table)
    const { data, error } = await supabaseClient
      .from("questions")
      .select("*")
      .eq("quiz_id", selectedQuizId)
      .order("id", { ascending: true });

    if (error) {
      console.warn("Error with quiz_id filter, trying fallback:", error);
      // Fallback: load all questions if quiz_id column doesn't exist
      const { data: allQuestions, error: fallbackError } = await supabaseClient
        .from("questions")
        .select("*")
        .order("id", { ascending: true });

      if (fallbackError) throw fallbackError;
      questions = allQuestions || [];
    } else {
      questions = data || [];
    }
  } catch (e) {
    console.warn("Failed to load from supabase, using fallback.", e);
    questions = JSON.parse(localStorage.getItem("questions")) || [];
  }

  if (!questions.length) {
    document.getElementById("question").innerText =
      "No questions available for this quiz.";
    return;
  }

  createSidePanel();
  updateSmallTotals();
  displayQuestion();
  startTimer();
}

// ================================
// RENDER / INTERACTIONS
// ================================

function displayQuestion() {
  const q = questions[currentQuestion];
  document.getElementById("question").innerText =
    `Q${currentQuestion + 1}. ${q.question}`;

  // Update badge and counter for new layout
  const questionBadge = document.getElementById("questionNumber");
  const questionCounter = document.getElementById("questionCounter");
  if (questionBadge) questionBadge.textContent = `Q${currentQuestion + 1}`;
  if (questionCounter)
    questionCounter.textContent = `${currentQuestion + 1} of ${questions.length}`;

  const opts = [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean);
  const values = ["a", "b", "c", "d"].slice(0, opts.length);

  const optionsEl = document.getElementById("options");
  optionsEl.innerHTML = "";
  optionsEl.setAttribute("role", "listbox");

  opts.forEach((opt, i) => {
    const val = values[i];
    const label = document.createElement("label");
    label.className = "option-item";
    label.setAttribute("data-value", val);
    label.setAttribute("role", "option");
    label.setAttribute("tabindex", "0");

    label.innerHTML = `
      <input type="radio" name="option" value="${val}" aria-label="Option ${val.toUpperCase()}" />
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="font-weight:700;color:var(--primary);min-width:28px">${val.toUpperCase()}</div>
        <div class=\"opt-text\">${opt}</div>
      </div>
    `;

    label.addEventListener("click", () => selectOption(label, val));
    label.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectOption(label, val);
      }
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        focusNextOption(label);
      }
      if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        focusPrevOption(label);
      }
    });

    optionsEl.appendChild(label);
  });

  // restore previous answer
  if (answers[currentQuestion]) {
    const prev = optionsEl.querySelector(
      `.option-item[data-value="${answers[currentQuestion]}"]`,
    );
    if (prev) {
      prev.classList.add("selected");
      prev.querySelector("input").checked = true;
    }
  }

  // focus first option for keyboard users
  const firstOpt = optionsEl.querySelector(".option-item");
  if (firstOpt) firstOpt.focus();

  // show explanation if present
  const explanationEl = document.getElementById("explanationText");
  if (explanationEl)
    explanationEl.textContent = q.explanation || "No explanation provided.";

  // update palette highlight and totals
  highlightCurrent();
  updateProgress();
  updateSmallTotals();
}

function nextQuestion() {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    displayQuestion();
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    displayQuestion();
  }
}

function jumpTo(index) {
  currentQuestion = index;
  displayQuestion();
}

// ================================
// PROGRESS + PALETTE
// ================================

function updateProgress() {
  const count = Object.keys(answers).length;
  const total = questions.length || 1;
  const percent = Math.round((count / total) * 100);
  const el = document.getElementById("progress");
  if (el) el.style.width = percent + "%";
  const txt = document.getElementById("progressText");
  if (txt) txt.textContent = `${count} / ${total} answered`;
}

function createSidePanel() {
  const container = document.getElementById("sidePanel");
  container.innerHTML = "";
  for (let i = 0; i < questions.length; i++) {
    const btn = document.createElement("div");
    btn.className = "palette-item";
    btn.id = `nav${i}`;
    btn.setAttribute("role", "button");
    btn.setAttribute("tabindex", "0");
    btn.setAttribute("aria-label", `Question ${i + 1}`);
    btn.textContent = i + 1;
    btn.addEventListener("click", () => jumpTo(i));
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") jumpTo(i);
    });
    container.appendChild(btn);
  }
  updateSidePanel();
}

// update small total count used in quiz mock
function updateSmallTotals() {
  const totalSmall = document.getElementById("totalCountSmall");
  if (totalSmall) totalSmall.textContent = questions.length || 0;
}

function updateSidePanel() {
  for (let i = 0; i < questions.length; i++) {
    const el = document.getElementById(`nav${i}`);
    if (!el) continue;
    el.classList.remove("done", "active");
    if (answers[i]) el.classList.add("done");
    if (i === currentQuestion) el.classList.add("active");
  }
}

function highlightCurrent() {
  updateSidePanel();
}

function selectOption(labelEl, val) {
  const optionsEl = document.getElementById("options");
  optionsEl
    .querySelectorAll(".option-item")
    .forEach((o) => o.classList.remove("selected"));
  labelEl.classList.add("selected");
  const input = labelEl.querySelector("input");
  if (input) input.checked = true;
  answers[currentQuestion] = val;
  updateProgress();
  updateSidePanel();
}

function focusNextOption(current) {
  const all = Array.from(document.querySelectorAll(".option-item"));
  const idx = all.indexOf(current);
  if (idx >= 0 && idx < all.length - 1) all[idx + 1].focus();
}

function focusPrevOption(current) {
  const all = Array.from(document.querySelectorAll(".option-item"));
  const idx = all.indexOf(current);
  if (idx > 0) all[idx - 1].focus();
}

// ================================
// TIMER
// ================================

function startTimer() {
  const timerEl = document.getElementById("timer");
  if (timerEl) timerEl.textContent = formatTime(timeLeft);
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timerEl) timerEl.textContent = formatTime(timeLeft);
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      submitQuiz();
    }
  }, 1000);
}

// ================================
// REVIEW & SUBMIT
// ================================

function goToReview() {
  localStorage.setItem("answers", JSON.stringify(answers));
  localStorage.setItem("questions", JSON.stringify(questions));
  window.location.href = "review.html";
}

function submitQuiz() {
  goToReview();
}

// ================================
// RESULT CALCULATION (review.html)
// ================================

async function calculateResult() {
  const answersStored = JSON.parse(localStorage.getItem("answers") || "{}");
  const questionsStored = JSON.parse(localStorage.getItem("questions") || "[]");
  const selectedQuizId = localStorage.getItem("selectedQuizId");

  let score = 0;
  questionsStored.forEach((q, idx) => {
    if (answersStored[idx] === q.correct_answer) score++;
  });

  const { data } = await supabaseClient.auth.getUser();
  const user = data?.user;

  if (user && selectedQuizId) {
    try {
      const { error } = await supabaseClient.from("quiz_attempts").insert([
        {
          user_id: user.id,
          quiz_id: selectedQuizId,
          score,
          total: questionsStored.length,
        },
      ]);

      if (error) {
        console.warn(
          "Error saving attempt (quiz_id might not exist in schema):",
          error,
        );
        // Fallback without quiz_id
        await supabaseClient.from("quiz_attempts").insert([
          {
            user_id: user.id,
            score,
            total: questionsStored.length,
          },
        ]);
      }
    } catch (e) {
      console.error("Error saving quiz attempt:", e);
    }
  }

  const resultEl = document.getElementById("result");
  if (resultEl)
    resultEl.textContent = `Your Score: ${score} / ${questionsStored.length}`;
}

// ================================
// LOGOUT
// ================================

async function logout() {
  try {
    await fetch("/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (e) {
    console.error("Logout error:", e);
  }
  window.location.href = "index.html";
}

// ============================================================
// MULTI-DEVICE SESSION MANAGEMENT
// Max 2 devices allowed — 3rd login = all previous logged out
// ============================================================

const MAX_DEVICES = 2; // Students: max 2 devices
const MAX_DEVICES_ADMIN = 10; // Admins: max 10 devices
const ADMIN_EMAILS = ["admin@medminds.com", "service.medminds@gmail.com"];
const SESSION_KEY = "mm_session_token";

// Generate unique token for this device/tab
function generateSessionToken() {
  return "sess_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
}

// Get or create session token for this device
function getLocalSessionToken() {
  let token = localStorage.getItem(SESSION_KEY);
  if (!token) {
    token = generateSessionToken();
    localStorage.setItem(SESSION_KEY, token);
  }
  return token;
}

// Get basic device info
function getDeviceInfo() {
  const ua = navigator.userAgent;
  let device = "Unknown Device";
  if (/mobile/i.test(ua)) device = "Mobile";
  else if (/tablet/i.test(ua)) device = "Tablet";
  else device = "Desktop";
  const browser = /chrome/i.test(ua)
    ? "Chrome"
    : /firefox/i.test(ua)
      ? "Firefox"
      : /safari/i.test(ua)
        ? "Safari"
        : /edge/i.test(ua)
          ? "Edge"
          : "Browser";
  return `${device} / ${browser}`;
}

// Register this device session after login
async function registerSession(userId) {
  // Device/session tracking is now managed by the backend via JWT/session cookies.
  return false;
}

// Remove current device session on logout
async function removeCurrentSession() {
  // No client-side Supabase session cleanup required for JWT-based auth.
  return;
}

// Validate that this session is still active (run on every page load)
async function validateSession() {
  try {
    // Skip on password recovery pages — ?code= is PKCE recovery token
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(
      window.location.hash.replace("#", ""),
    );
    if (urlParams.get("code") || hashParams.get("type") === "recovery") return;
    if (window.location.pathname.includes("device-limit")) return;

    // admin.html does its own full auth check in loadAdminDashboard()
    // Skip validateSession there to avoid racing for the auth lock
    if (window.location.pathname.includes("admin")) return;

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) return; // not logged in, skip

    const token = localStorage.getItem(SESSION_KEY);
    if (!token) {
      // No local token — could be fresh device-limit redirect, just go to login
      await supabaseClient.auth.signOut();
      window.location.href = "index.html";
      return;
    }

    // Check if this session token still exists in DB
    const { data: session } = await supabaseClient
      .from("user_sessions")
      .select("id")
      .eq("session_token", token)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!session) {
      // Session was wiped by a 3rd device login — force logout
      console.warn("Session invalidated by another device login");
      localStorage.removeItem(SESSION_KEY);
      await supabaseClient.auth.signOut();
      sessionStorage.setItem("mm_kicked", "1");
      window.location.href = "device-limit.html";
      return;
    }

    // Update last_active ping every 2 minutes
    await supabaseClient
      .from("user_sessions")
      .update({ last_active: new Date().toISOString() })
      .eq("session_token", token);
  } catch (e) {
    console.error("validateSession error:", e);
  }
}

// Auto-validate every 2 minutes while user is on any page
setInterval(validateSession, 2 * 60 * 1000);

// Run once on page load
document.addEventListener("DOMContentLoaded", validateSession);

// (Quiz management is handled entirely inside admin.html)

// ============================================================
// CONTENT PROTECTION
// Blocks: print, screenshot shortcuts, right-click,
//         text selection, dev tools, copy/paste
// ============================================================

(function initContentProtection() {
  // ── 1. Block Right Click ──────────────────────────────────
  // document.addEventListener('contextmenu', function(e) {
  //   e.preventDefault();
  //   return false;
  // });

  // ── 2. Block Keyboard Shortcuts ──────────────────────────
  document.addEventListener("keydown", function (e) {
    const key = e.key ? e.key.toLowerCase() : "";
    const ctrl = e.ctrlKey || e.metaKey; // metaKey = Mac CMD

    // Print: Ctrl+P
    if (ctrl && key === "p") {
      e.preventDefault();
      return false;
    }

    // Save page: Ctrl+S
    if (ctrl && key === "s") {
      e.preventDefault();
      return false;
    }

    // Dev Tools: F12
    if (e.keyCode === 123) {
      e.preventDefault();
      return false;
    }

    // Dev Tools: Ctrl+Shift+I
    if (ctrl && e.shiftKey && key === "i") {
      e.preventDefault();
      return false;
    }

    // Dev Tools: Ctrl+Shift+J
    if (ctrl && e.shiftKey && key === "j") {
      e.preventDefault();
      return false;
    }

    // Dev Tools: Ctrl+Shift+C
    if (ctrl && e.shiftKey && key === "c") {
      e.preventDefault();
      return false;
    }

    // View Source: Ctrl+U
    if (ctrl && key === "u") {
      e.preventDefault();
      return false;
    }

    // Copy: Ctrl+C
    if (ctrl && key === "c") {
      e.preventDefault();
      return false;
    }

    // Select All: Ctrl+A
    if (ctrl && key === "a") {
      e.preventDefault();
      return false;
    }

    // Print Screen key
    if (e.keyCode === 44) {
      e.preventDefault();
      return false;
    }

    // Screenshot: Windows+Shift+S (keyCode 83 with metaKey+shift on some browsers)
    if (e.metaKey && e.shiftKey && key === "s") {
      e.preventDefault();
      return false;
    }
  });

  // ── 3. Block Copy/Cut via clipboard events ────────────────
  document.addEventListener("copy", function (e) {
    e.preventDefault();
  });
  document.addEventListener("cut", function (e) {
    e.preventDefault();
  });

  // ── 4. Block Drag (prevents dragging images out) ──────────
  document.addEventListener("dragstart", function (e) {
    e.preventDefault();
  });

  // ── 5. Disable Text Selection via JS ─────────────────────
  document.addEventListener("selectstart", function (e) {
    // Allow selection in input/textarea fields only
    const tag = e.target.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea") return true;
    e.preventDefault();
    return false;
  });

  // ── 6. Watermark overlay (visible on screenshot) ─────────
  // Creates a semi-transparent repeating watermark across the page
  function createWatermark() {
    const existing = document.getElementById("mm-watermark");
    if (existing) existing.remove();

    const wm = document.createElement("div");
    wm.id = "mm-watermark";

    // Get logged in user email for personalized watermark
    let label = "MedMinds — Confidential";
    try {
      const session = JSON.parse(
        localStorage.getItem("sb-dvxqkouoyqouwwuvfdui-auth-token") || "{}",
      );
      if (session?.user?.email) label = session.user.email + " — MedMinds";
    } catch (_) {}

    wm.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      pointer-events: none;
      z-index: 99999;
      overflow: hidden;
    `;

    // Build repeating diagonal text grid
    let html = "";
    for (let y = -100; y < window.innerHeight + 200; y += 120) {
      for (let x = -100; x < window.innerWidth + 200; x += 280) {
        html += `<span style="
          position:absolute;
          left:${x}px; top:${y}px;
          transform:rotate(-30deg);
          font-size:14px;
          font-family:Arial,sans-serif;
          font-weight:700;
          color:rgba(0,0,0,0.018);
          white-space:nowrap;
          letter-spacing:2px;
          user-select:none;
          mix-blend-mode:multiply;
        ">${label}</span>`;
      }
    }
    wm.innerHTML = html;
    document.body.appendChild(wm);
  }

  // Build watermark after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createWatermark);
  } else {
    createWatermark();
  }

  // Rebuild watermark if someone tries to remove it via dev tools
  const wmObserver = new MutationObserver(function () {
    if (!document.getElementById("mm-watermark")) {
      createWatermark();
    }
  });
  wmObserver.observe(document.body, { childList: true, subtree: false });
})();
