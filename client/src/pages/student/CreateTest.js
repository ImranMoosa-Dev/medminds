import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import "../../styles/create-test.css";

const CreateTest = () => {
  const navigate = useNavigate();
  const [auth] = useAuth();

  const [theme, setTheme] = useState("light");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [pageLoading, setPageLoading] = useState(true);
  const [showStepper, setShowStepper] = useState(false);
  const [showTrialBanner, setShowTrialBanner] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  // User state
  const currentUserRef = useRef(null);
  const [isTrialUser, setIsTrialUser] = useState(false);
  const trialMax = 60;

  // Data
  const [allSubjects, setAllSubjects] = useState([]);
  const [allTopics, setAllTopics] = useState([]);
  const [allSubtopics, setAllSubtopics] = useState([]);

  // Selections
  const [selectedSubjects, setSelectedSubjects] = useState(new Set());
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [selectedSubtopics, setSelectedSubtopics] = useState(new Set());
  const [mcqCount, setMcqCount] = useState(30);
  const [maxAvailable, setMaxAvailable] = useState(0);
  const [sliderMax, setSliderMax] = useState(100);

  // Loading-per-step
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingSubtopics, setLoadingSubtopics] = useState(false);
  const [errorMsg, setErrorMsg] = useState({
    subjects: "",
    topics: "",
    subtopics: "",
  });

  // Create button state
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    document.title = "Create Custom Test – MedMinds";
    // Theme init
    const saved = localStorage.getItem("medminds-theme");
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const t = saved || (dark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", t);
    setTheme(t);

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("medminds-theme", next);
    setTheme(next);
  };

  const toggleMobileNav = () => setMobileNavOpen((o) => !o);

  const init = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) {
        navigate("/");
        return;
      }
      currentUserRef.current = user;

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      const adminEmails = ["admin@medminds.com", "service.medminds@gmail.com"];
      let _isBatchUser = false;
      let _isTrialUser = false;
      let _trialUsed = false;
      if (adminEmails.includes(user.email)) {
        _isBatchUser = true;
      } else if (profile?.batch_id) {
        _isBatchUser = true;
      } else {
        _isTrialUser = true;
        const { count } = await supabase
          .from("custom_test_attempts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);
        _trialUsed = (count || 0) > 0;
      }

      setIsTrialUser(_isTrialUser);
      setPageLoading(false);

      if (_isTrialUser && _trialUsed) {
        setShowBlocked(true);
        return;
      }

      if (_isTrialUser) setShowTrialBanner(true);

      setShowStepper(true);
      await loadSubjectsStep();
    } catch (e) {
      console.error("Init error:", e);
      setPageLoading(false);
      setAlertMsg("Error loading page. Please refresh.");
    }
  };

  // ── Step navigation ──
  const goStep = async (n) => {
    if (n > currentStep) {
      if (currentStep === 1 && selectedSubjects.size === 0) {
        showAlert("Please select at least one subject.");
        return;
      }
      if (currentStep === 2 && selectedTopics.size === 0) {
        showAlert("Please select at least one topic.");
        return;
      }
      if (currentStep === 3 && selectedSubtopics.size === 0) {
        showAlert("Please select at least one subtopic.");
        return;
      }
    }
    if (n === 2) await loadTopicsStep();
    if (n === 3) await loadSubtopicsStep();
    if (n === 4) await loadMcqStep();
    setCurrentStep(n);
    setAlertMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Step 1: Subjects ──
  const loadSubjectsStep = async () => {
    setLoadingSubjects(true);
    setErrorMsg((e) => ({ ...e, subjects: "" }));
    try {
      const { data: subjects } = await supabase
        .from("subjects")
        .select("*")
        .order("name");
      const { data: qBySubj } = await supabase
        .from("questions")
        .select("subject")
        .not("subject", "is", null);
      const countMap = {};
      (qBySubj || []).forEach((q) => {
        countMap[q.subject] = (countMap[q.subject] || 0) + 1;
      });
      const subjectsWithCount = (subjects || []).map((s) => ({
        ...s,
        q_count: countMap[s.name] || 0,
      }));
      setAllSubjects(subjectsWithCount);
    } catch (e) {
      setErrorMsg((er) => ({ ...er, subjects: e.message }));
    } finally {
      setLoadingSubjects(false);
    }
  };

  const onSubjectToggle = (id) => {
    const numId = Number(id);
    setSelectedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(numId)) next.delete(numId);
      else next.add(numId);
      return next;
    });
    setSelectedTopics(new Set());
    setSelectedSubtopics(new Set());
  };

  const toggleSelectAllSubjects = () => {
    const anyUnchecked = allSubjects.some((s) => !selectedSubjects.has(s.id));
    setSelectedSubjects(
      anyUnchecked ? new Set(allSubjects.map((s) => s.id)) : new Set(),
    );
    setSelectedTopics(new Set());
    setSelectedSubtopics(new Set());
  };

  // ── Step 2: Topics ──
  const loadTopicsStep = async () => {
    setLoadingTopics(true);
    setErrorMsg((e) => ({ ...e, topics: "" }));
    setSelectedTopics(new Set());
    try {
      const selSubjIds = [...selectedSubjects];
      const selSubjNames = allSubjects
        .filter((s) => selSubjIds.includes(s.id))
        .map((s) => s.name);
      const { data: topics } = await supabase
        .from("topics")
        .select("*")
        .in("subject_name", selSubjNames)
        .order("name");
      const { data: qByTopic } = await supabase
        .from("questions")
        .select("topic")
        .in("subject", selSubjNames)
        .not("topic", "is", null);
      const countMap = {};
      (qByTopic || []).forEach((q) => {
        countMap[q.topic] = (countMap[q.topic] || 0) + 1;
      });
      setAllTopics(
        (topics || []).map((t) => ({ ...t, q_count: countMap[t.name] || 0 })),
      );
    } catch (e) {
      setErrorMsg((er) => ({ ...er, topics: e.message }));
    } finally {
      setLoadingTopics(false);
    }
  };

  const onTopicToggle = (id) => {
    const numId = Number(id);
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(numId)) next.delete(numId);
      else next.add(numId);
      return next;
    });
    setSelectedSubtopics(new Set());
  };

  const toggleSelectAllTopics = () => {
    const anyUnchecked = allTopics.some((t) => !selectedTopics.has(t.id));
    setSelectedTopics(
      anyUnchecked ? new Set(allTopics.map((t) => t.id)) : new Set(),
    );
    setSelectedSubtopics(new Set());
  };

  // ── Step 3: Subtopics ──
  const loadSubtopicsStep = async () => {
    setLoadingSubtopics(true);
    setErrorMsg((e) => ({ ...e, subtopics: "" }));
    setSelectedSubtopics(new Set());
    try {
      const selTopicIds = [...selectedTopics];
      const selTopicNames = allTopics
        .filter((t) => selTopicIds.includes(t.id))
        .map((t) => t.name);
      const { data: subtopics } = await supabase
        .from("subtopics")
        .select("*")
        .in("topic_name", selTopicNames)
        .order("name");
      const { data: qBySub } = await supabase
        .from("questions")
        .select("subtopic")
        .in("topic", selTopicNames)
        .not("subtopic", "is", null);
      const countMap = {};
      (qBySub || []).forEach((q) => {
        countMap[q.subtopic] = (countMap[q.subtopic] || 0) + 1;
      });

      let solvedMap = {};
      try {
        const { data: myAttempts } = await supabase
          .from("custom_test_attempts")
          .select("answers, questions_json")
          .eq("user_id", currentUserRef.current.id);
        (myAttempts || []).forEach((attempt) => {
          const answers = attempt.answers || {};
          const questions = attempt.questions_json || [];
          Object.keys(answers).forEach((idx) => {
            const q = questions[parseInt(idx)];
            if (q?.subtopic)
              solvedMap[q.subtopic] = (solvedMap[q.subtopic] || 0) + 1;
          });
        });
      } catch (_) {}

      setAllSubtopics(
        (subtopics || []).map((st) => ({
          ...st,
          q_count: countMap[st.name] || 0,
          solved_count: solvedMap[st.name] || 0,
        })),
      );
    } catch (e) {
      setErrorMsg((er) => ({ ...er, subtopics: e.message }));
    } finally {
      setLoadingSubtopics(false);
    }
  };

  const onSubtopicToggle = (id) => {
    const numId = Number(id);
    setSelectedSubtopics((prev) => {
      const next = new Set(prev);
      if (next.has(numId)) next.delete(numId);
      else next.add(numId);
      return next;
    });
  };

  const toggleSelectAllSubtopics = () => {
    const anyUnchecked = allSubtopics.some(
      (st) => !selectedSubtopics.has(st.id),
    );
    setSelectedSubtopics(
      anyUnchecked ? new Set(allSubtopics.map((st) => st.id)) : new Set(),
    );
  };

  // ── Step 4: MCQ count ──
  const loadMcqStep = async () => {
    const selSubIds = [...selectedSubtopics];
    const selSubNames = allSubtopics
      .filter((st) => selSubIds.includes(Number(st.id)))
      .map((st) => st.name);
    let _maxAvailable = 0;
    try {
      const { count } = await supabase
        .from("questions")
        .select("id", { count: "exact", head: true })
        .in("subtopic", selSubNames);
      _maxAvailable = count || 0;
    } catch (_) {
      _maxAvailable = allSubtopics
        .filter((st) => selSubIds.includes(st.id))
        .reduce((s, st) => s + st.q_count, 0);
    }
    setMaxAvailable(_maxAvailable);
    let _sliderMax = isTrialUser
      ? Math.min(_maxAvailable, trialMax)
      : Math.min(_maxAvailable, 200);
    if (_sliderMax < 5) _sliderMax = 5;
    setSliderMax(_sliderMax);
    setMcqCount(Math.min(30, _sliderMax));
  };

  const updateMcqSlider = (val) => {
    setMcqCount(parseInt(val));
  };

  const durationText = () => {
    const mins = mcqCount;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}min` : `${m} min`;
  };

  // ── Step 5: Confirm/Create ──
  const createAndStart = async () => {
    setCreating(true);
    try {
      const selSubNames = allSubtopics
        .filter((st) => selectedSubtopics.has(st.id))
        .map((st) => st.name);
      const { data: pool, error } = await supabase
        .from("questions")
        .select("*")
        .in("subtopic", selSubNames);
      if (error) throw error;
      if (!pool || pool.length === 0)
        throw new Error("No questions found for selected subtopics.");

      const shuffled = [...pool];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const selected = shuffled.slice(0, mcqCount);

      const selSubjNames = allSubjects
        .filter((s) => selectedSubjects.has(s.id))
        .map((s) => s.name);
      const selTopicNames = allTopics
        .filter((t) => selectedTopics.has(t.id))
        .map((t) => t.name);
      const mins = mcqCount;
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const durText = h > 0 ? `${h}h ${m}min` : `${m} min`;

      const meta = {
        subjects: selSubjNames,
        topics: selTopicNames,
        subtopics: selSubNames,
        mcq_count: mcqCount,
        duration_seconds: mcqCount * 60,
        duration_text: durText,
        is_custom: true,
        created_at: new Date().toISOString(),
      };

      const { data: attemptRow, error: aErr } = await supabase
        .from("custom_test_attempts")
        .insert({
          user_id: currentUserRef.current.id,
          questions_json: selected,
          answers: null,
          score: null,
          total: mcqCount,
          subjects: selSubjNames,
          topics: selTopicNames,
          subtopics: selSubNames,
          duration_seconds: meta.duration_seconds,
          status: "pending",
        })
        .select()
        .single();
      if (aErr) throw aErr;

      localStorage.setItem("customTestMeta", JSON.stringify(meta));
      localStorage.setItem("customTestAttemptId", attemptRow.id);
      localStorage.setItem("questions", JSON.stringify(selected));
      localStorage.setItem("isCustomTest", "1");
      localStorage.removeItem("selectedQuizId");

      navigate(`/quiz-details?custom=1&attempt_id=${attemptRow.id}`);
    } catch (e) {
      console.error("createAndStart error:", e);
      showAlert("Error creating test: " + e.message);
      setCreating(false);
    }
  };

  const showAlert = (msg) => setAlertMsg(msg);

  // ── Helpers for grouped rendering ──
  const groupedTopics = () => {
    const g = {};
    allTopics.forEach((t) => {
      if (!g[t.subject_name]) g[t.subject_name] = [];
      g[t.subject_name].push(t);
    });
    return g;
  };

  const groupedSubtopics = () => {
    const g = {};
    allSubtopics.forEach((st) => {
      const key = st.subject_name + "|||" + st.topic_name;
      if (!g[key]) g[key] = [];
      g[key].push(st);
    });
    return g;
  };

  // ── Stepper helper ──
  const stepCircle = (i) => {
    let cls = "step-circle";
    let content;
    if (i < currentStep) {
      cls += " done";
      content = "✓";
    } else if (i === currentStep) {
      cls += " active";
      content = i;
    } else {
      content = i;
    }
    return (
      <div className={cls} id={`sc${i}`}>
        {content}
      </div>
    );
  };

  const selSubjNamesArr = allSubjects
    .filter((s) => selectedSubjects.has(s.id))
    .map((s) => s.name);
  const selTopicNamesArr = allTopics
    .filter((t) => selectedTopics.has(t.id))
    .map((t) => t.name);
  const selSubtopicNamesArr = allSubtopics
    .filter((st) => selectedSubtopics.has(st.id))
    .map((st) => st.name);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* ══ HEADER ══ */}
      <header className="site-header">
        <div className="header-inner">
          <a href="/quiz-selection" className="brand">
            <img
              src="logo.jpeg"
              className="brand-logo"
              alt="MedMinds"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <span className="brand-name">MedMinds</span>
          </a>
          <nav className="nav-links">
            <a href="/quiz-selection">🏠 Dashboard</a>
            <a href="/create-test">🧪 Create Test</a>
            <a href="/custom-history">Quiz History</a>
            <a href="/stats">📊 My Stats</a>
            <a href="/leaderboard">🏆 Leaderboard</a>
            <a href="/my-batch">My Batch</a>
            <a href="/profile">👤 Profile</a>
          </nav>
          <div className="header-right">
            <button className="theme-btn" id="themeBtn" onClick={toggleTheme}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button className="logout-btn-hdr" onClick={logout}>
              Logout
            </button>
            <button
              className={`hamburger ${mobileNavOpen ? "open" : ""}`}
              id="hamburger"
              onClick={toggleMobileNav}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
        <nav
          className={`mobile-nav ${mobileNavOpen ? "open" : ""}`}
          id="mobileNav"
        >
          <a href="/quiz-selection">🏠 Dashboard</a>
          <a href="/create-test">🧪 Create Test</a>
          <a href="/custom-history">Quiz History</a>
          <a href="/stats">📊 My Stats</a>
          <a href="/leaderboard">🏆 Leaderboard</a>
          <a href="/my-batch">My Batch</a>
          <a href="/profile">👤 Profile</a>
          <button className="mobile-nav-logout" onClick={logout}>
            🚪 Logout
          </button>
        </nav>
      </header>

      <main id="mainContent">
        {pageLoading && (
          <div id="pageLoader" className="loading-state">
            <div className="load-spinner"></div>
            <p>Checking access…</p>
          </div>
        )}

        {showBlocked && (
          <div id="blockedState">
            <div className="blocked-card">
              <div className="b-icon">🔒</div>
              <h2>Trial Limit Reached</h2>
              <p>
                You've used your free custom test (60 MCQs). Enroll in a batch
                to unlock unlimited custom practice tests and full access to all
                features.
              </p>
              <a href="/batches">View Batches & Enroll</a>
            </div>
          </div>
        )}

        {showTrialBanner && (
          <div
            id="trialBanner"
            className="trial-banner"
            style={{ display: "flex" }}
          >
            <div className="tb-icon">⚠️</div>
            <div className="tb-text">
              <strong>Trial Access:</strong> You can create{" "}
              <strong>one free custom test (max 60 MCQs)</strong>. Enroll in a
              batch for unlimited practice.
            </div>
          </div>
        )}

        {showStepper && (
          <div className="stepper" id="stepper" style={{ display: "flex" }}>
            <div className="step-item">
              <div className="step-wrap">
                {stepCircle(1)}
                <div className="step-label">Subjects</div>
              </div>
              <div
                className={`step-line ${currentStep > 1 ? "done" : ""}`}
                id="sl1"
              ></div>
            </div>
            <div className="step-item">
              <div className="step-wrap">
                {stepCircle(2)}
                <div className="step-label">Topics</div>
              </div>
              <div
                className={`step-line ${currentStep > 2 ? "done" : ""}`}
                id="sl2"
              ></div>
            </div>
            <div className="step-item">
              <div className="step-wrap">
                {stepCircle(3)}
                <div className="step-label">Subtopics</div>
              </div>
              <div
                className={`step-line ${currentStep > 3 ? "done" : ""}`}
                id="sl3"
              ></div>
            </div>
            <div className="step-item">
              <div className="step-wrap">
                {stepCircle(4)}
                <div className="step-label">MCQs</div>
              </div>
              <div
                className={`step-line ${currentStep > 4 ? "done" : ""}`}
                id="sl4"
              ></div>
            </div>
            <div className="step-item" style={{ flex: 0 }}>
              <div className="step-wrap">
                {stepCircle(5)}
                <div className="step-label">Confirm</div>
              </div>
            </div>
          </div>
        )}

        {/* Alert */}
        <div
          className={`alert alert-error ${alertMsg ? "show" : ""}`}
          id="alertBox"
        >
          {alertMsg}
        </div>

        {/* ══ STEP 1: SUBJECTS ══ */}
        {showStepper && (
          <div
            className={`step-panel ${currentStep === 1 ? "active" : ""}`}
            id="panel1"
            style={{ display: currentStep === 1 ? "block" : "none" }}
          >
            <div className="card">
              <div className="card-head">
                <h2>📚 Step 1: Select Subjects</h2>
                <p>
                  Choose one or more subjects you want to practice. MCQ counts
                  update in real time.
                </p>
              </div>
              <div className="select-all-row">
                <button
                  className="select-all-btn"
                  onClick={toggleSelectAllSubjects}
                >
                  Select All
                </button>
                <span className="selected-count" id="subjSelectedCount">
                  {selectedSubjects.size} selected
                </span>
              </div>
              <div className="check-grid" id="subjectsGrid">
                {loadingSubjects ? (
                  <div className="loading-state">
                    <div className="load-spinner"></div>
                    <p>Loading subjects…</p>
                  </div>
                ) : errorMsg.subjects ? (
                  <div className="empty-state">
                    <div className="e-icon">❌</div>
                    <p>Error: {errorMsg.subjects}</p>
                  </div>
                ) : allSubjects.length === 0 ? (
                  <div className="empty-state">
                    <div className="e-icon">📚</div>
                    <p>No subjects found. Ask your admin to add subjects.</p>
                  </div>
                ) : (
                  allSubjects.map((s) => (
                    <div className="check-item" key={s.id}>
                      <input
                        type="checkbox"
                        id={`subj_${s.id}`}
                        value={s.id}
                        checked={selectedSubjects.has(s.id)}
                        onChange={() => onSubjectToggle(s.id)}
                      />
                      <label className="check-label" htmlFor={`subj_${s.id}`}>
                        <span className="check-icon">{s.icon || "📚"}</span>
                        <div className="check-info">
                          <div className="check-name">{s.name}</div>
                          <div className="check-count">
                            {(s.q_count || 0).toLocaleString()} MCQs
                          </div>
                        </div>
                        <div className="check-tick"></div>
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="step-footer">
              <span></span>
              <button
                className="btn btn-primary"
                onClick={() => goStep(2)}
                id="btnStep1"
              >
                Next: Topics →
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 2: TOPICS ══ */}
        {showStepper && (
          <div
            className={`step-panel ${currentStep === 2 ? "active" : ""}`}
            id="panel2"
            style={{ display: currentStep === 2 ? "block" : "none" }}
          >
            <div className="card">
              <div className="card-head">
                <h2>📖 Step 2: Select Topics</h2>
                <p>
                  Choose topics from your selected subjects. You can see how
                  many MCQs are in each topic.
                </p>
              </div>
              <div className="select-all-row">
                <button
                  className="select-all-btn"
                  onClick={toggleSelectAllTopics}
                >
                  Select All
                </button>
                <span className="selected-count" id="topicSelectedCount">
                  {selectedTopics.size} selected
                </span>
              </div>
              <div id="topicsContainer">
                {loadingTopics ? (
                  <div className="loading-state">
                    <div className="load-spinner"></div>
                    <p>Loading topics…</p>
                  </div>
                ) : errorMsg.topics ? (
                  <div className="empty-state">
                    <div className="e-icon">❌</div>
                    <p>Error: {errorMsg.topics}</p>
                  </div>
                ) : allTopics.length === 0 ? (
                  <div className="empty-state">
                    <div className="e-icon">📖</div>
                    <p>
                      No topics found for selected subjects. Questions may not
                      have topics assigned yet.
                    </p>
                  </div>
                ) : (
                  Object.entries(groupedTopics()).map(([subj, topics]) => {
                    const subjObj = allSubjects.find((s) => s.name === subj);
                    const safe = subj.replace(/\s/g, "_");
                    return (
                      <div className="subtopic-section" key={subj}>
                        <div className="subtopic-section-title">
                          {subjObj?.icon || "📚"} {subj}
                        </div>
                        <div className="topic-grid" id={`topic_grid_${safe}`}>
                          {topics.map((t) => (
                            <div className="check-item" key={t.id}>
                              <input
                                type="checkbox"
                                id={`topic_${t.id}`}
                                value={t.id}
                                checked={selectedTopics.has(t.id)}
                                onChange={() => onTopicToggle(t.id)}
                              />
                              <label
                                className="check-label topic-label"
                                htmlFor={`topic_${t.id}`}
                              >
                                <div className="check-info" style={{ flex: 1 }}>
                                  <div className="check-name topic-name">
                                    {t.name}
                                  </div>
                                  <div className="check-count">
                                    {t.q_count} MCQs
                                  </div>
                                </div>
                                <div className="check-tick"></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div className="step-footer">
              <button className="btn btn-outline" onClick={() => goStep(1)}>
                ← Back
              </button>
              <button
                className="btn btn-primary"
                onClick={() => goStep(3)}
                id="btnStep2"
              >
                Next: Subtopics →
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 3: SUBTOPICS ══ */}
        {showStepper && (
          <div
            className={`step-panel ${currentStep === 3 ? "active" : ""}`}
            id="panel3"
            style={{ display: currentStep === 3 ? "block" : "none" }}
          >
            <div className="card">
              <div className="card-head">
                <h2>🔬 Step 3: Select Subtopics</h2>
                <p>
                  Pick specific subtopics. The badge shows solved ✅ vs unsolved
                  ⬜ questions for you.
                </p>
              </div>
              <div className="select-all-row">
                <button
                  className="select-all-btn"
                  onClick={toggleSelectAllSubtopics}
                >
                  Select All
                </button>
                <span className="selected-count" id="subtopicSelectedCount">
                  {selectedSubtopics.size} selected
                </span>
              </div>
              <div id="subtopicsContainer">
                {loadingSubtopics ? (
                  <div className="loading-state">
                    <div className="load-spinner"></div>
                    <p>Loading subtopics…</p>
                  </div>
                ) : errorMsg.subtopics ? (
                  <div className="empty-state">
                    <div className="e-icon">❌</div>
                    <p>Error: {errorMsg.subtopics}</p>
                  </div>
                ) : allSubtopics.length === 0 ? (
                  <div className="empty-state">
                    <div className="e-icon">🔬</div>
                    <p>
                      No subtopics found. They may not be assigned to questions
                      yet.
                    </p>
                  </div>
                ) : (
                  Object.entries(groupedSubtopics()).map(([key, subs]) => {
                    const [subj, topic] = key.split("|||");
                    const topicObj = allTopics.find((t) => t.name === topic);
                    return (
                      <div className="subtopic-section" key={key}>
                        <div className="subtopic-section-title">
                          {allSubjects.find((s) => s.name === subj)?.icon ||
                            "📚"}{" "}
                          {subj} → {topic}
                        </div>
                        <div
                          className="subtopic-grid"
                          id={`subgrid_${topicObj?.id}`}
                        >
                          {subs.map((st) => {
                            const pct =
                              st.q_count > 0
                                ? Math.round(
                                    (st.solved_count / st.q_count) * 100,
                                  )
                                : 0;
                            const pillClass =
                              pct === 0 ? "none" : pct < 100 ? "partial" : "";
                            const pillText =
                              pct === 100
                                ? `✅ ${st.solved_count}/${st.q_count}`
                                : pct > 0
                                  ? `⬜ ${st.solved_count}/${st.q_count}`
                                  : `⬜ 0/${st.q_count}`;
                            return (
                              <div className="check-item" key={st.id}>
                                <input
                                  type="checkbox"
                                  id={`sub_${st.id}`}
                                  value={st.id}
                                  checked={selectedSubtopics.has(st.id)}
                                  onChange={() => onSubtopicToggle(st.id)}
                                />
                                <label
                                  className="check-label subtopic-label"
                                  htmlFor={`sub_${st.id}`}
                                >
                                  <div
                                    className="check-info"
                                    style={{ flex: 1 }}
                                  >
                                    <div className="check-name subtopic-name">
                                      {st.name}
                                    </div>
                                    <div className="check-count">
                                      {st.q_count} MCQs
                                    </div>
                                    <div>
                                      <span
                                        className={`prog-pill ${pillClass}`}
                                      >
                                        {pillText}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="check-tick"></div>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div className="step-footer">
              <button className="btn btn-outline" onClick={() => goStep(2)}>
                ← Back
              </button>
              <button
                className="btn btn-primary"
                onClick={() => goStep(4)}
                id="btnStep3"
              >
                Next: MCQs →
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 4: MCQ COUNT ══ */}
        {showStepper && (
          <div
            className={`step-panel ${currentStep === 4 ? "active" : ""}`}
            id="panel4"
            style={{ display: currentStep === 4 ? "block" : "none" }}
          >
            <div className="card">
              <div className="card-head">
                <h2>🔢 Step 4: Number of MCQs</h2>
                <p>
                  Set how many questions you want in your test. Questions will
                  be randomly shuffled every time.
                </p>
              </div>
              <div className="mcq-row">
                <input
                  type="range"
                  className="mcq-slider"
                  id="mcqSlider"
                  min="5"
                  max={sliderMax}
                  value={mcqCount}
                  onChange={(e) => updateMcqSlider(e.target.value)}
                />
                <div className="mcq-value-box" id="mcqValueBox">
                  {mcqCount}
                </div>
              </div>
              <div className="mcq-limits">
                <span>Min: 5</span>
                <span id="mcqMaxLabel">Max: {sliderMax}</span>
              </div>
              <div
                style={{
                  marginTop: 16,
                  padding: "14px 16px",
                  background: "var(--bg)",
                  borderRadius: 10,
                  border: "1.5px solid var(--border)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".6px",
                    marginBottom: 8,
                  }}
                >
                  Available in selection
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "var(--blue-main)",
                  }}
                  id="availableCount"
                >
                  {maxAvailable.toLocaleString()}
                </div>
                <div
                  style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}
                >
                  questions across selected subtopics
                </div>
              </div>
              <div className="duration-pill" style={{ marginTop: 16 }}>
                ⏱️ Estimated duration:{" "}
                <strong id="durationText">{durationText()}</strong>
              </div>
            </div>
            <div className="step-footer">
              <button className="btn btn-outline" onClick={() => goStep(3)}>
                ← Back
              </button>
              <button
                className="btn btn-primary"
                onClick={() => goStep(5)}
                id="btnStep4"
              >
                Review & Create →
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 5: CONFIRM ══ */}
        {showStepper && (
          <div
            className={`step-panel ${currentStep === 5 ? "active" : ""}`}
            id="panel5"
            style={{ display: currentStep === 5 ? "block" : "none" }}
          >
            <div className="card">
              <div className="card-head">
                <h2>✅ Step 5: Confirm Your Test</h2>
                <p>
                  Review your selection before starting. Once you click Create,
                  a unique shuffled test is generated.
                </p>
              </div>

              <div className="summary-grid" id="summaryGrid">
                <div className="summary-item">
                  <div className="s-label">📚 Subjects</div>
                  <div className="s-val">{selSubjNamesArr.length}</div>
                  <div className="summary-tags">
                    {selSubjNamesArr.map((n, i) => (
                      <span className="tag" key={i}>
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="summary-item">
                  <div className="s-label">📖 Topics</div>
                  <div className="s-val">{selTopicNamesArr.length}</div>
                  <div className="summary-tags">
                    {selTopicNamesArr.slice(0, 6).map((n, i) => (
                      <span className="tag" key={i}>
                        {n}
                      </span>
                    ))}
                    {selTopicNamesArr.length > 6 && (
                      <span className="tag">
                        +{selTopicNamesArr.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="summary-item">
                  <div className="s-label">🔬 Subtopics</div>
                  <div className="s-val">{selSubtopicNamesArr.length}</div>
                  <div className="summary-tags">
                    {selSubtopicNamesArr.slice(0, 4).map((n, i) => (
                      <span className="tag" key={i}>
                        {n}
                      </span>
                    ))}
                    {selSubtopicNamesArr.length > 4 && (
                      <span className="tag">
                        +{selSubtopicNamesArr.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="summary-item">
                  <div className="s-label">🔢 MCQs</div>
                  <div className="s-val">{mcqCount} questions</div>
                </div>
                <div className="summary-item">
                  <div className="s-label">⏱️ Duration</div>
                  <div className="s-val">{durationText()}</div>
                </div>
                <div className="summary-item">
                  <div className="s-label">🎲 Mode</div>
                  <div className="s-val">Random & Shuffled</div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 20,
                  padding: 16,
                  background:
                    "linear-gradient(135deg,rgba(11,99,183,.06),rgba(11,99,183,.02))",
                  border: "1.5px solid rgba(11,99,183,.18)",
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--blue-main)",
                    textTransform: "uppercase",
                    letterSpacing: ".6px",
                    marginBottom: 8,
                  }}
                >
                  ⚠️ Important
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--muted)",
                    lineHeight: 1.6,
                  }}
                >
                  Questions are randomly selected and shuffled on every test.
                  You can retake different questions from the same subtopics
                  unlimited times.
                </div>
              </div>
            </div>
            <div className="step-footer">
              <button className="btn btn-outline" onClick={() => goStep(4)}>
                ← Back
              </button>
              <button
                className="btn btn-success"
                onClick={createAndStart}
                id="btnCreate"
                disabled={creating}
              >
                {creating ? (
                  <>
                    <span className="spinner"></span> Generating…
                  </>
                ) : (
                  "🚀 Create Test"
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default CreateTest;
