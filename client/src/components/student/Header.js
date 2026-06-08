import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import "../../styles/header.css";
const Header = () => {
  const [auth, setAuth] = useAuth();
  const [theme, setTheme] = useState("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Load saved theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("medminds-theme") || "light";

    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);
  // Listen for theme changes from other tabs or manual localStorage edits
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "medminds-theme") {
        const newTheme = e.newValue || "light";
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
      }
    };

    // Listen for OS-level theme changes
    const mq =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    const onPrefChange = (ev) => {
      const prefers = ev.matches ? "dark" : "light";
      const saved = localStorage.getItem("medminds-theme");
      if (!saved) {
        setTheme(prefers);
        document.documentElement.setAttribute("data-theme", prefers);
      }
    };

    window.addEventListener("storage", onStorage);
    if (mq && mq.addEventListener) mq.addEventListener("change", onPrefChange);

    return () => {
      window.removeEventListener("storage", onStorage);
      if (mq && mq.removeEventListener)
        mq.removeEventListener("change", onPrefChange);
    };
  }, []);
  // Update theme whenever state changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("medminds-theme", theme);

    // Also apply inline CSS variable overrides so theme applies
    // even if some stylesheets redefine :root later.
    const root = document.documentElement;
    const lightVars = {
      "--bg": "#eef3fa",
      "--card": "#ffffff",
      "--border": "#dde8f5",
      "--text": "#0d1f3c",
      "--muted": "#5a6b82",
      "--blue-main": "#0b63b7",
      "--blue-mid": "#0a4a8f",
      "--blue-dark": "#072f6b",
    };
    const darkVars = {
      "--bg": "#0d1623",
      "--card": "#132039",
      "--border": "#1e3a5f",
      "--text": "#e8f0fe",
      "--muted": "#7fa4cc",
      "--blue-main": "#0b63b7",
      "--blue-mid": "#0a4a8f",
      "--blue-dark": "#072f6b",
    };

    const applyVars = theme === "dark" ? darkVars : lightVars;
    Object.keys(applyVars).forEach((k) => {
      root.style.setProperty(k, applyVars[k]);
    });
  }, [theme]);

  // Toggle theme
  const handleThemeToggle = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  // Close menu after clicking a link
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // handle logout
  const handleLogout = () => {
    if (window.confirm("Are you sure? want to logout!")) {
      closeMobileMenu();
      localStorage.clear();
      setAuth({ user: null, token: null });
      navigate("/login");
    }
  };
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/quiz-selection" className="brand">
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
        </Link>
        <div className="header-right">
          <nav className="nav-links">
            <Link to="/quiz-selection">🏠 Dashboard</Link>
            <Link to="/create-test">🧪 Create Test</Link>
            <Link to="/custom-history">📜 Quiz History</Link>
            <Link to="/stats">📊 My Stats</Link>
            <Link to="/leaderboard">🏆 Leaderboard</Link>
            <Link to="/my-batch">👥 My Batch</Link>
            <Link to="/batches">👥 Batches</Link>
            <Link to="/profile">👤 Profile</Link>
          </nav>
          <button
            className="theme-btn"
            id="themeBtn"
            title="Toggle theme"
            onClick={handleThemeToggle}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          {/* Desktop Logout */}

          <button className="logout-btn-hdr" onClick={handleLogout}>
            Logout
          </button>
          {/* Hamburger */}
          <button
            className={`hamburger ${mobileMenuOpen ? "open" : ""}`}
            onClick={toggleMobileMenu}
            id="hamburger"
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      {/* Mobile Navigation */}
      <nav className={`mobile-nav ${mobileMenuOpen ? "open" : ""}`}>
        <Link to="/quiz-selection" onClick={closeMobileMenu}>
          🏠 Dashboard
        </Link>
        <Link to="/create-test" onClick={closeMobileMenu}>
          🧪 Create Test
        </Link>
        <Link to="/custom-history" onClick={closeMobileMenu}>
          📜 Quiz History
        </Link>
        <Link to="/stats" onClick={closeMobileMenu}>
          📊 My Stats
        </Link>
        <Link to="/leaderboard" onClick={closeMobileMenu}>
          🏆 Leaderboard
        </Link>
        <Link to="/my-batch" onClick={closeMobileMenu}>
          👥 My Batch
        </Link>
        <Link to="/batches" onClick={closeMobileMenu}>
          👥 Batches
        </Link>
        <Link to="/profile" onClick={closeMobileMenu}>
          👤 Profile
        </Link>

        <button className="mobile-nav-logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </nav>
    </header>
  );
};

export default Header;
