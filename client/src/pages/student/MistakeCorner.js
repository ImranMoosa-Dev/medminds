import React, { useEffect, useState } from "react";
import "../styles/mistake-corner.css";

const MistakeCorner = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    document.title = "Mistake Corner - MedMinds MDCAT";
    loadMistakes();
  }, []);

  const confirmLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      window.location.href = "/logout"; // Make sure this exists on your server
    }
  };

  const toggleNav = () => setNavOpen((v) => !v);

  const loadMistakes = async () => {
    try {
      const response = await fetch("/api/mistake-corner");
      const result = await response.json();
      setData(result);
      setError(false);
    } catch (err) {
      console.error("Error loading mistakes:", err);
      setError(true);
    }
  };

  const renderMistakes = () => {
    if (error) {
      return <p>Error loading mistakes.</p>;
    }
    if (!data) return null;

    const entries = Object.entries(data.subjects || {});
    const hasAny = entries.some(([, qs]) => qs && qs.length > 0);
    if (!hasAny) {
      return <p>No mistakes found. Great job!</p>;
    }

    return entries.map(([subject, questions]) => (
      <React.Fragment key={subject}>
        <h3>{subject}</h3>
        {questions.map((q, qi) => (
          <div className="mistake-item" key={qi}>
            <h4>{q.question}</h4>
            {q.image && (
              <>
                <img
                  src={`/uploads/${q.image}`}
                  alt="Question image"
                  style={{ maxWidth: "100%" }}
                />
                <br />
              </>
            )}
            {[1, 2, 3, 4].map((i) => {
              const isCorrect = i === q.correct;
              const isUserAnswer = i === q.userAnswer;
              let className = "";
              if (isCorrect) className = "correct";
              else if (isUserAnswer) className = "wrong";
              return (
                <p key={i} className={className}>
                  {String.fromCharCode(64 + i)}. {q["opt" + i]}
                </p>
              );
            })}
            {q.explanation && (
              <p>
                <strong>Explanation:</strong> {q.explanation}
              </p>
            )}
          </div>
        ))}
      </React.Fragment>
    ));
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <header>
        <div className="logo-text">
          <div>
            <h1>MedMinds MDCAT</h1>
            <p>Your future begins here</p>
          </div>
        </div>

        <nav className={navOpen ? "show" : ""}>
          <ul>
            <li>
              <a href="home.html">
                <i className="fas fa-home"></i> Home
              </a>
            </li>
            <li>
              <a href="statics.html">
                <i className="fas fa-chart-bar"></i> Statistics
              </a>
            </li>
            <li>
              <a href="quiz.html">
                <i className="fas fa-brain"></i> Quiz
              </a>
            </li>
            <li>
              <a href="Q-Bank.html">
                <i className="fas fa-book"></i> Q-Bank
              </a>
            </li>
            <li>
              <a href="student-notes.html">
                <i className="fas fa-file-alt"></i> Notes
              </a>
            </li>
            <li>
              <a href="MistakeCorner.html">
                <i className="fas fa-exclamation-triangle"></i> Mistake Corner
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  confirmLogout();
                }}
              >
                <i className="fas fa-sign-out-alt"></i> Logout
              </a>
            </li>
          </ul>
        </nav>

        <div className="hamburger" onClick={toggleNav}>
          <i className="fas fa-heartbeat"></i>
        </div>
      </header>

      <section className="section">
        <h2>Mistake Corner</h2>
        <p>
          Review your mistakes here. This page shows questions you got wrong in
          the Q-Bank, helping you learn from errors.
        </p>
        <div id="mistake-content">{renderMistakes()}</div>
      </section>

      <footer>
        <p>&copy; 2025 MedMinds MDCAT.</p>
        <p>
          <i className="fas fa-envelope"></i>
          <a href="mailto:admin@medminds.com">admin@medminds.com</a> |
          <i className="fab fa-whatsapp"></i>
          <a
            href="https://whatsapp.com/channel/0029VbAO9hc7IUYXO5QyIu1E"
            target="_blank"
            rel="noreferrer"
          >
            MedMinds MDCAT Test Session
          </a>{" "}
          |<i className="fab fa-instagram"></i>
          <a
            href="https://www.instagram.com/medminds_mdcat/"
            target="_blank"
            rel="noreferrer"
          >
            MedMinds MDCAT
          </a>
        </p>
      </footer>
    </>
  );
};

export default MistakeCorner;
