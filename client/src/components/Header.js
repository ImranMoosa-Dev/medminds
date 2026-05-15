import React from "react";
import "../styles/header.css";
const Header = () => {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a href="quiz-selection" className="brand">
          <svg
            className="brand-logo"
            viewBox="0 0 120 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 72 Q60 96 100 72"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx={100} cy={72} r="5.5" fill="rgba(255,255,255,0.8)" />
            <circle cx={20} cy={72} r={3} fill="rgba(255,255,255,0.6)" />
            <rect
              x={22}
              y={18}
              width={22}
              height={48}
              rx={4}
              fill="rgba(255,255,255,0.95)"
            />
            <rect
              x={10}
              y={30}
              width={46}
              height={22}
              rx={4}
              fill="rgba(255,255,255,0.95)"
            />
            <path
              d="M56 22 C62 16 72 18 82 20 C90 26 92 36 94 44 C90 52 86 56 82 60 C76 64 68 64 62 64 C56 60 56 56 56 56 Z"
              fill="rgba(255,255,255,0.92)"
            />
            <line
              x1={68}
              y1={20}
              x2={68}
              y2={62}
              stroke="#0a4a8f"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <line
              x1={56}
              y1={38}
              x2={90}
              y2={38}
              stroke="#0a4a8f"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx={68} cy={26} r={3} fill="#0a4a8f" />
            <circle cx={68} cy={38} r={3} fill="#0a4a8f" />
            <circle cx={68} cy={50} r={3} fill="#0a4a8f" />
            <circle cx={78} cy={38} r={3} fill="#0a4a8f" />
            <circle cx={88} cy={38} r="2.5" fill="#0a4a8f" />
            <circle cx={60} cy={38} r="2.5" fill="#0a4a8f" />
            <line
              x1={68}
              y1={26}
              x2={78}
              y2={22}
              stroke="#0a4a8f"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1={68}
              y1={50}
              x2={78}
              y2={54}
              stroke="#0a4a8f"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx={78} cy={22} r="2.5" fill="#0a4a8f" />
            <circle cx={78} cy={54} r="2.5" fill="#0a4a8f" />
          </svg>
          <span className="brand-name">MedMinds</span>
        </a>
        <div className="header-right">
          <nav className="nav-links">
            <a href="quiz-selection">🏠 Dashboard</a>
            <a href="create-test">🧪 Create Test</a>
            <a href="custom-history">Quiz History</a>
            <a href="stats">📊 My Stats</a>
            <a href="leaderboard">🏆 Leaderboard</a>
            <a href="my-batch">My Batch</a>
            <a href="profile">👤 Profile</a>
          </nav>
          <button className="theme-btn" id="themeBtn" title="Toggle theme">
            🌙
          </button>
          <button className="logout-btn-hdr">Logout</button>
          <button className="hamburger" id="hamburger" aria-label="Menu">
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      <nav className="mobile-nav" id="mobileNav">
        <a href="quiz-selection.html">🏠 Dashboard</a>
        <a href="create-test.html">🧪 Create Test</a>
        <a href="custom-history.html">Quiz History</a>
        <a href="stats.html">📊 My Stats</a>
        <a href="leaderboard.html">🏆 Leaderboard</a>
        <a href="my-batch.html">My Batch</a>
        <a href="profile.html">👤 Profile</a>
        <button className="mobile-nav-logout">🚪 Logout</button>
      </nav>
    </header>
  );
};

export default Header;
