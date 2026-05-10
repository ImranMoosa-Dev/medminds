import React from "react";

const Home = () => {
  function resetPassword() {
    fetch("/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
      .then((response) => response.text())
      .then((text) => alert(text))
      .catch((err) => {
        console.error(err);
        alert("An error occurred. Please try again.");
      });
  }

  function toggleNav() {
    document.querySelector("header nav").classList.toggle("show");
    document.querySelector(".hamburger").classList.toggle("active");
  }

  // MDCAT Countdown Timer
  let mdcatDate;

  fetch("/api/settings")
    .then((res) => res.json())
    .then((data) => {
      mdcatDate = new Date(data.mdcatDate);
      if (data.syllabusFile) {
        document.querySelector('a[href="/syllabus"]').href =
          "/uploads/" + data.syllabusFile;
      } else {
        const link = document.querySelector('a[href="/syllabus"]');
        const p = document.createElement("p");
        p.textContent = "Syllabus not uploaded yet.";
        p.style.marginTop = "20px";
        p.style.fontSize = "0.9rem";
        link.parentNode.replaceChild(p, link);
      }
      updateTimer();
    })
    .catch((err) => console.error("Error fetching settings:", err));

  function updateTimer() {
    if (!mdcatDate || isNaN(mdcatDate.getTime())) {
      document.getElementById("days").textContent = "00";
      document.getElementById("hours").textContent = "00";
      document.getElementById("mins").textContent = "00";
      document.getElementById("secs").textContent = "00";
      return;
    }
    const now = new Date();
    let diff = mdcatDate - now;

    if (diff <= 0) {
      document.getElementById("mdcat-timer").textContent = "MDCAT has started!";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);
    const seconds = Math.floor(diff / 1000);

    document.getElementById("days").textContent = days;
    document.getElementById("hours").textContent = hours;
    document.getElementById("mins").textContent = minutes;
    document.getElementById("secs").textContent = seconds;
  }

  setInterval(updateTimer, 1000); // update every second

  window.addEventListener("load", function () {
    setTimeout(function () {
      document.getElementById("loading-overlay").style.display = "none";
    }, 3000);
  });

  return (
    <div>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>MedMinds MDCAT</title>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <style
        dangerouslySetInnerHTML={{
          __html:
            "\n\n:root {\n    --blue-main: #3b82f6;\n    --blue-dark: #1e3a8a;\n    --blue-soft: #dbeafe;\n    --bg: #f8fafc;\n    --text-main: #1e293b;\n    --text-muted: #64748b;\n    --radius: 16px;\n    --shadow-soft: 0 10px 30px rgba(0,0,0,0.08);\n    --shadow-hover: 0 20px 45px rgba(59,130,246,0.25);\n}\n\n\n* {\n    box-sizing: border-box;\n    margin: 0;\n    padding: 0;\n}\n\nbody {\n    font-family: 'Segoe UI', system-ui, -apple-system;\n    background: radial-gradient(circle at top, #eaf2ff, var(--bg));\n    color: var(--text-main);\n    line-height: 1.7;\n}\n\n/* ===============================\n   HEADER\n=============================== */\nheader {\n    position: sticky;\n    top: 0;\n    z-index: 1000;\n    background: rgba(255,255,255,0.95);\n    backdrop-filter: blur(14px);\n    padding: 18px 50px;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    border-bottom: 1px solid rgba(0,0,0,0.08);\n    position: relative; /* allow absolute logo */\n}\n\n/* ===============================\n   LOGO\n=============================== */\n.logo-text {\n    display: flex;\n    align-items: center;\n    gap: 15px;\n    position: absolute; /* absolute left alignment */\n    left: 50px;\n    top: 50%;\n    transform: translateY(-50%);\n}\n\n.logo-text img {\n    height: 3.2em; /* match heading + tagline height */\n    width: auto;\n    object-fit: contain;\n}\n\n.logo-text h1 {\n    font-size: clamp(1.6rem, 5vw, 1.8rem);\n    font-weight: 800;\n    background: linear-gradient(135deg, var(--blue-main), var(--blue-dark));\n    -webkit-background-clip: text;  /* gradient text */\n    -webkit-text-fill-color: transparent;\n    background-clip: text;\n    color: transparent;\n}\n\n.logo-text p {\n    font-size: 0.75rem;\n    color: var(--text-muted);\n}\n\n/* ===============================\n   NAVIGATION\n=============================== */\nheader nav {\n    margin-left: 280px; /* offset nav to avoid overlapping logo */\n}\n\nheader nav ul {\n    list-style: none;\n    display: flex;\n    gap: 28px;\n}\n\nheader nav a {\n    text-decoration: none;\n    color: var(--text-main);\n    font-weight: 600;\n    padding: 10px 22px;\n    border-radius: 999px;\n    transition: all 0.35s ease;\n}\n\nheader nav a:hover {\n    background: linear-gradient(135deg, var(--blue-main), var(--blue-dark));\n    color: white;\n    box-shadow: var(--shadow-hover);\n}\n\nheader nav a i {\n    margin-right: 8px;\n}\n\n/* HAMBURGER */\n.hamburger {\n    display: none;\n    flex-direction: column;\n    cursor: pointer;\n    padding: 5px;\n}\n\n.hamburger div {\n    width: 25px;\n    height: 3px;\n    background-color: var(--blue-dark);\n    margin: 4px 0;\n    transition: 0.3s;\n}\n\n.hamburger.active div:nth-child(1) {\n    transform: rotate(-45deg) translate(-5px, 6px);\n}\n\n.hamburger.active div:nth-child(2) {\n    opacity: 0;\n}\n\n.hamburger.active div:nth-child(3) {\n    transform: rotate(45deg) translate(-5px, -6px);\n}\n\n/* ===============================\n   HERO\n=============================== */\n.hero {\n    padding: 110px 20px;\n    text-align: center;\n    background:\n        radial-gradient(circle at top right, rgba(26,115,232,0.25), transparent 40%),\n        radial-gradient(circle at bottom left, rgba(26,115,232,0.18), transparent 40%);\n}\n\n.hero h2 {\n    font-size: clamp(2.4rem, 5vw, 3.4rem);\n    font-weight: 800;\n    margin-bottom: 15px;\n}\n\n.hero p {\n    font-size: 1.15rem;\n    max-width: 650px;\n    margin: auto;\n    color: var(--text-muted);\n}\n\n/* ===============================\n   SECTIONS\n=============================== */\n.section {\n    max-width: 1000px;\n    margin: 90px auto;\n    padding: 0 25px;\n}\n\n.section h2 {\n    font-size: 2rem;\n    margin-bottom: 20px;\n    color: var(--blue-dark);\n}\n\n.section p {\n    font-size: 1rem;\n    color: var(--text-main);\n}\n\n/* ===============================\n   COURSES\n=============================== */\n.courses {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));\n    gap: 35px;\n    margin-bottom: 60px;\n}\n\n.course {\n    background: linear-gradient(180deg, white, var(--blue-soft));\n    padding: 40px 25px;\n    border-radius: var(--radius);\n    text-align: center;\n    box-shadow: var(--shadow-soft);\n    transition: all 0.45s ease;\n}\n\n.course:hover {\n    transform: translateY(-12px);\n    box-shadow: var(--shadow-hover);\n}\n\n.course h3 {\n    color: var(--blue-dark);\n    margin-top: 12px;\n}\n\n.course-icon {\n    font-size: 2.6rem;\n    margin-bottom: 15px;\n    background: linear-gradient(135deg, var(--blue-main), var(--blue-dark));\n    -webkit-background-clip: text;\n    -webkit-text-fill-color: transparent;\n    background-clip: text;\n    color: transparent;\n}\n\n.course p {\n    font-size: 0.95rem;\n    color: var(--text-muted);\n    margin-top: 10px;\n}\n\n.course:hover .course-icon {\n    transform: scale(1.15);\n    transition: transform 0.4s ease;\n}\n\n/* Syllabus Download Link */\n.download-link {\n    display: inline-block;\n    padding: 12px 24px;\n    background: linear-gradient(135deg, var(--blue-main), var(--blue-dark));\n    color: white;\n    text-decoration: none;\n    border-radius: 8px;\n    font-weight: 600;\n    transition: all 0.3s ease;\n}\n\n.download-link:hover {\n    transform: translateY(-2px);\n    box-shadow: var(--shadow-hover);\n}\n\n/* ===============================\n    MDCAT TIMER CARD\n=============================== */\n.mdcattimer-card {\n    max-width: 500px;\n    margin: 40px auto;\n    padding: 30px;\n    border-radius: var(--radius);\n    text-align: center;\n    background: linear-gradient(180deg, white, var(--blue-soft));\n    box-shadow: var(--shadow-soft);\n    transition: all 0.4s ease;\n}\n\n.mdcattimer-card:hover {\n    transform: translateY(-10px);\n    box-shadow: var(--shadow-hover);\n}\n\n.mdcattimer-card h3 {\n    font-size: 1.5rem;\n    color: var(--blue-dark);\n    margin-bottom: 20px;\n}\n\n.timer-display {\n    font-size: 1.5rem;\n    font-weight: 700;\n    background: linear-gradient(135deg, var(--blue-main), var(--blue-dark));\n    -webkit-background-clip: text;\n    -webkit-text-fill-color: transparent;\n    background-clip: text;\n    color: transparent;\n}\n\n/* ===============================\n    ABOUT & RESOURCES\n=============================== */\n.about,\n.resources {\n    background: linear-gradient(145deg, white, #f1f6ff);\n    border-radius: var(--radius);\n    padding: 50px;\n    box-shadow: var(--shadow-soft);\n    margin-bottom: 60px;\n}\n\n.resources h3 i {\n    margin-right: 10px;\n    color: var(--blue-main);\n}\n\n/* ===============================\n   FOOTER\n=============================== */\nfooter {\n    background: linear-gradient(135deg, var(--blue-dark), var(--blue-main));\n    color: white;\n    text-align: center;\n    padding: 35px 20px;\n}\n\nfooter a {\n    color: white;\n    text-decoration: none;\n}\n\n/* ===============================\n   MOBILE\n=============================== */\n@media (max-width: 768px) {\n    header {\n        padding: 20px;\n        flex-direction: column;\n        gap: 15px;\n    }\n\n    .logo-text {\n        position: static;\n        transform: none;\n        justify-content: center;\n        margin-bottom: 10px;\n    }\n\n    header nav {\n        margin-left: 0;\n        display: none;\n        width: 100%;\n    }\n\n    header nav.show {\n        display: block;\n    }\n\n    .hamburger {\n        display: flex;\n    }\n\n    header nav ul {\n        flex-direction: column;\n        align-items: center;\n    }\n\n    .courses {\n        gap: 25px;\n    }\n\n    .section, .about, .resources, .mdcattimer-card {\n        padding: 30px 20px;\n    }\n\n    .mdcattimer-card {\n        width: 90%;\n        margin: 30px auto;\n    }\n}\n\n.loading-overlay {\n    position: fixed;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    background: linear-gradient(135deg, #1a73e8, #ffffff);\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n    align-items: center;\n    z-index: 9999;\n}\n\n.loading-container {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n}\n\n.progress-bar {\n    width: 250px;\n    height: 6px;\n    background: rgba(255,255,255,0.2);\n    border-radius: 3px;\n    overflow: hidden;\n    margin-top: 20px;\n    box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);\n}\n\n.progress-fill {\n    height: 100%;\n    background: linear-gradient(90deg, #ffffff, #e8f1ff);\n    animation: fill 3s ease-in-out forwards;\n    border-radius: 3px;\n}\n\n@keyframes fill {\n    0% { width: 0%; }\n    100% { width: 100%; }\n}\n\n.loading-logo {\n    width: 200px;\n    height: 200px;\n    filter: drop-shadow(0 10px 20px rgba(26,115,232,0.3));\n    animation: fadeIn 3s ease-in-out forwards;\n}\n\n@keyframes fadeIn {\n    0% { opacity: 0; }\n    100% { opacity: 1; }\n}\n\n.loading-text {\n    margin-top: 20px;\n    font-size: 1.5rem;\n    color: var(--blue-main);\n    font-weight: 600;\n    animation: pulse 1.5s ease-in-out infinite;\n}\n\n\n@keyframes pulse {\n    0%, 100% { opacity: 1; }\n    50% { opacity: 0.5; }\n}\n\n.update-item {\n    margin: 20px 0;\n    padding: 20px;\n    background: white;\n    border-radius: var(--radius);\n    box-shadow: var(--shadow-soft);\n}\n\n\n\n",
        }}
      />
      <div id="loading-overlay" className="loading-overlay">
        <div className="loading-container">
          <img src="medminds.jpeg" alt="Loading" className="loading-logo" />
          <p className="loading-text">Welcome to MedMinds...</p>
          <div className="progress-bar">
            <div className="progress-fill" />
          </div>
        </div>
      </div>
      <header>
        <div className="logo-text">
          <div>
            <h1>MedMinds MDCAT</h1>
            <p>Your future begins here</p>
          </div>
        </div>
        <nav>
          <ul>
            <li>
              <a href="home.html">
                <i className="fas fa-home" /> Home
              </a>
            </li>
            <li>
              <a href="statics.html">
                <i className="fas fa-chart-bar" /> Statistics
              </a>
            </li>
            <li>
              <a href="quiz.html">
                <i className="fas fa-brain" /> Quiz
              </a>
            </li>
            <li>
              <a href="Q-Bank.html">
                <i className="fas fa-book" /> Q-Bank
              </a>
            </li>
            <li>
              <a href="student-notes.html">
                <i className="fas fa-file-alt" /> Notes
              </a>
            </li>
            <li>
              <a href="MistakeCorner.html">
                <i className="fas fa-exclamation-triangle" /> Mistake Corner
              </a>
            </li>
            <li>
              <a href="/logout">
                <i className="fas fa-sign-out-alt" /> Logout
              </a>
            </li>
          </ul>
        </nav>
        <div className="hamburger" onclick="toggleNav()">
          <div />
          <div />
          <div />
        </div>
      </header>
      <section className="hero">
        <h2>Welcome to MedMinds MDCAT</h2>
        <p>
          Empowering future healthcare professionals with comprehensive medical
          education.
        </p>
      </section>
      {/* MDCAT Timer Card */}
      <section className="mdcattimer-card">
        <h3>MDCAT Countdown</h3>
        <div className="timer-display" id="mdcat-timer">
          Days: <span id="days" /> Hours: <span id="hours" /> Mins:{" "}
          <span id="mins" /> Sec: <span id="secs" />
        </div>
        <p style={{ marginTop: 20, fontSize: "0.9rem" }}>
          Download the official MDCAT syllabus:
        </p>
        <a
          href="/syllabus"
          download
          className="download-link"
          style={{ fontSize: "0.9rem", padding: "8px 16px" }}
        >
          Download Syllabus (PDF/DOCX)
        </a>
      </section>
      <section className="section about">
        <h2>About Us</h2>
        <p>
          MedMinds MDCAT provides high-quality education in medical sciences.
        </p>
      </section>
      <section className="section courses">
        <div className="course">
          <i className="fas fa-dna course-icon" />
          <h3>Biology</h3>
          <p>Human physiology, genetics, and high-yield MDCAT biology.</p>
        </div>
        <div className="course">
          <i className="fas fa-flask course-icon" />
          <h3>Chemistry</h3>
          <p>Organic, inorganic, and physical chemistry made easy.</p>
        </div>
        <div className="course">
          <i className="fas fa-atom course-icon" />
          <h3>Physics</h3>
          <p>Concept-based mechanics, waves, and electricity.</p>
        </div>
        <div className="course">
          <i className="fas fa-book course-icon" />
          <h3>English</h3>
          <p>Grammar, comprehension, and vocabulary for MDCAT.</p>
        </div>
        <div className="course">
          <i className="fas fa-brain course-icon" />
          <h3>Logical Reasoning</h3>
          <p>Critical thinking and analytical reasoning skills.</p>
        </div>
      </section>
      <section className="section updates">
        <h2>Latest Updates</h2>
        <div id="updates-list">{/* Updates will be inserted here */}</div>
      </section>
      <section className="resources">
        <h2>Student Resources</h2>
        <div className="resource">
          <h3>
            <i className="fas fa-book-medical" /> Study Guides
          </h3>
          <p>
            Access comprehensive study guides for all subjects to enhance your
            learning.
          </p>
        </div>
        <div className="resource">
          <h3>
            <i className="fas fa-clipboard-check" /> Practice Tests
          </h3>
          <p>
            Take timed practice tests to assess your knowledge and track
            progress.
          </p>
        </div>
        <div className="resource">
          <h3>
            <i className="fas fa-comments" /> Discussion Forums
          </h3>
          <p>
            Connect with fellow students and instructors for support and
            collaboration.
          </p>
        </div>
      </section>
      <footer>
        <p>© 2025 MedMinds MDCAT.</p>
        <p>
          <i className="fas fa-envelope" />
          <a href="mailto:admin@medminds.com">admin@medminds.com</a> |
          <i className="fab fa-whatsapp" />
          <a
            href="https://whatsapp.com/channel/0029VbAO9hc7IUYXO5QyIu1E"
            target="_blank"
          >
            MedMinds MDCAT Test Session
          </a>{" "}
          |
          <i className="fab fa-instagram" />
          <a href="https://www.instagram.com/medminds_mdcat/" target="_blank">
            MedMinds MDCAT
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Home;
