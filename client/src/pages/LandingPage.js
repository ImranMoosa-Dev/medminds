import "../styles/global.css";
import "../styles/landing.css";
function Home() {
  return (
    <div>
      <meta charSet="utf-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <meta
        name="description"
        content="MedMinds — MDCAT and medical entry-test prep platform with a question bank, timed quizzes, mistake review, and progress tracking."
      />
      <meta name="author" content="MedMinds" />
      <title>MedMinds — MDCAT Prep Platform</title>
      <link rel="icon" href="favicon.ico" />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <header className="site-header">
        <a href="index.html" className="logo">
          MedMinds
        </a>
        <button
          className="menu-trigger"
          aria-label="Toggle menu"
          onclick="
    document
      .querySelector('header.site-header nav')
      .classList.toggle('show')
  "
        >
          <span />
          <span />
          <span />
        </button>
        <nav>
          <ul>
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#courses">Courses</a>
            </li>
            <li>
              <a href="#reviews">Reviews</a>
            </li>
            <li>
              <a href="#mentor">Mentor</a>
            </li>
            <li>
              <a href="/login">Login</a>
            </li>
            <li>
              <a href="/register" className="cta">
                Get Started
              </a>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <section className="hero" id="top">
          <video autoPlay muted loop playsInline>
            <source src="assets/images/course-video.mp4" type="video/mp4" />
          </video>
          <div className="hero-content">
            <span className="hero-eyebrow">MDCAT · Medical Entry Prep</span>
            <h1>Master your medical entry test with MedMinds</h1>
            <p className="lead">
              A focused MDCAT prep platform — practice from a curated question
              bank, take timed quizzes, review your mistakes, and track your
              progress in one place.
            </p>
            <div className="hero-actions">
              <a href="/register" className="btn-primary">
                Get started <i className="fa-solid fa-arrow-right" />
              </a>
              <a href="/login" className="btn-outline">
                Sign in
              </a>
            </div>
          </div>
        </section>
        <section id="features">
          <div className="section-heading">
            <h2>Everything you need to prepare</h2>
            <p>
              Tools designed for the way medical-entry students actually study —
              not generic e-learning.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="icon-wrap">
                <i className="fa-solid fa-book-open" />
              </div>
              <h4>Question Bank</h4>
              <p>
                Subject- and chapter-wise MCQs with explanations, drawn from
                past papers and curated practice sets.
              </p>
            </div>
            <div className="feature-card">
              <div className="icon-wrap">
                <i className="fa-solid fa-clipboard-check" />
              </div>
              <h4>Timed Quizzes</h4>
              <p>
                Full-length and topic quizzes that match real exam timing, with
                instant scoring on submit.
              </p>
            </div>
            <div className="feature-card">
              <div className="icon-wrap">
                <i className="fa-solid fa-rotate-left" />
              </div>
              <h4>Mistake Corner</h4>
              <p>
                Every wrong answer is saved automatically so you can come back,
                review, and stop repeating the same mistakes.
              </p>
            </div>
            <div className="feature-card">
              <div className="icon-wrap">
                <i className="fa-solid fa-chart-line" />
              </div>
              <h4>Stats &amp; Leaderboard</h4>
              <p>
                Track accuracy, daily activity, and progress against your peers
                — see exactly where to focus next.
              </p>
            </div>
          </div>
        </section>
        <section id="courses">
          <div className="section-heading">
            <h2>Choose your prep plan</h2>
            <p>Start free, upgrade when you're ready for the full toolkit.</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Free</h3>
              <div className="price">PKR 0</div>
              <div className="price-cycle">Forever</div>
              <ul>
                <li>
                  <i className="fa-solid fa-check" /> Limited Q-Bank access
                </li>
                <li>
                  <i className="fa-solid fa-check" /> Sample quizzes
                </li>
                <li>
                  <i className="fa-solid fa-check" /> Basic activity stats
                </li>
                <li>
                  <i className="fa-solid fa-check" /> Community leaderboard
                </li>
              </ul>
              <a href="signup.html" className="pricing-cta">
                Get started
              </a>
            </div>
            <div className="pricing-card featured">
              <span className="badge">Most Popular</span>
              <h3>Standard</h3>
              <div className="price">PKR 999</div>
              <div className="price-cycle">per month</div>
              <ul>
                <li>
                  <i className="fa-solid fa-check" /> Full Q-Bank with
                  explanations
                </li>
                <li>
                  <i className="fa-solid fa-check" /> Unlimited timed quizzes
                </li>
                <li>
                  <i className="fa-solid fa-check" /> Mistake Corner &amp; smart
                  review
                </li>
                <li>
                  <i className="fa-solid fa-check" /> Detailed accuracy stats
                </li>
                <li>
                  <i className="fa-solid fa-check" /> Subject-wise notes
                </li>
              </ul>
              <a href="signup.html" className="pricing-cta">
                Choose Standard
              </a>
            </div>
            <div className="pricing-card">
              <h3>Premium</h3>
              <div className="price">PKR 1,999</div>
              <div className="price-cycle">per month</div>
              <ul>
                <li>
                  <i className="fa-solid fa-check" /> Everything in Standard
                </li>
                <li>
                  <i className="fa-solid fa-check" /> 1-on-1 mentor sessions
                </li>
                <li>
                  <i className="fa-solid fa-check" /> Full-length mock exams
                </li>
                <li>
                  <i className="fa-solid fa-check" /> Priority support
                </li>
                <li>
                  <i className="fa-solid fa-check" /> Early access to new
                  content
                </li>
              </ul>
              <a href="signup.html" className="pricing-cta">
                Go Premium
              </a>
            </div>
          </div>
        </section>
        <section className="reviews-section" id="reviews">
          <div className="reviews-inner">
            <div className="section-heading">
              <h2>What our students say</h2>
              <p>Real feedback from students preparing on MedMinds.</p>
            </div>
            <div className="reviews-grid">
              <div className="review-card">
                <div className="stars">★★★★★</div>
                <blockquote>
                  "The Mistake Corner is honestly the most useful feature I've
                  used. I used to repeat the same mistakes — now I see them
                  every time I log in."
                </blockquote>
                <div className="review-author">
                  <div className="review-avatar">AH</div>
                  <div>
                    <div className="name">Ayesha Hassan</div>
                    <div className="role">MDCAT 2025 aspirant</div>
                  </div>
                </div>
              </div>
              <div className="review-card">
                <div className="stars">★★★★★</div>
                <blockquote>
                  "Timed quizzes feel exactly like the real exam. The stats
                  showed me Bio was my weakest subject — I focused there and
                  pulled my mock score up by 30 points."
                </blockquote>
                <div className="review-author">
                  <div className="review-avatar">UK</div>
                  <div>
                    <div className="name">Usman Khan</div>
                    <div className="role">First-year medical student</div>
                  </div>
                </div>
              </div>
              <div className="review-card">
                <div className="stars">★★★★★</div>
                <blockquote>
                  "The question bank is huge and the explanations actually teach
                  you. I'd recommend MedMinds to anyone serious about MDCAT."
                </blockquote>
                <div className="review-author">
                  <div className="review-avatar">SI</div>
                  <div>
                    <div className="name">Sara Iqbal</div>
                    <div className="role">MDCAT 2024 — top 5%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="why-section" id="why">
          <div className="why-inner">
            <div>
              <h2>Built for serious MDCAT aspirants</h2>
              <p>
                MedMinds focuses on the things that actually move scores: more
                reps, smarter review, honest feedback. No fluff, no padding.
              </p>
              <ul className="why-list">
                <li>
                  <i className="fa-solid fa-circle-check" /> Curated MCQs
                  aligned to the MDCAT syllabus
                </li>
                <li>
                  <i className="fa-solid fa-circle-check" /> Detailed
                  explanations on every question
                </li>
                <li>
                  <i className="fa-solid fa-circle-check" /> Auto-tracked
                  mistake review so weak topics don't slip through
                </li>
                <li>
                  <i className="fa-solid fa-circle-check" /> Daily activity and
                  accuracy stats to keep you on track
                </li>
                <li>
                  <i className="fa-solid fa-circle-check" /> Notes and updates
                  curated by instructors
                </li>
              </ul>
            </div>
            <div className="why-visual">
              <div className="big-stat">100%</div>
              <p>focus on MDCAT — nothing else, no distractions</p>
            </div>
          </div>
        </section>
        <section id="stats">
          <div className="section-heading">
            <h2>A growing community</h2>
            <p>Students preparing together, one question at a time.</p>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="digit">2,300+</div>
              <div className="label">Active Students</div>
            </div>
            <div className="stat-item">
              <div className="digit">10k+</div>
              <div className="label">Questions Bank</div>
            </div>
            <div className="stat-item">
              <div className="digit">120+</div>
              <div className="label">Practice Quizzes</div>
            </div>
            <div className="stat-item">
              <div className="digit">94%</div>
              <div className="label">Retention Rate</div>
            </div>
          </div>
        </section>
        <div className="mentor-wrap" id="mentor">
          <div className="mentor-card">
            <div>
              <h2>Join MedMinds as a mentor</h2>
              <p>
                Are you a doctor, medical student, or top MDCAT performer? Help
                the next batch of aspirants prep smarter — and get paid for it.
              </p>
              <ul className="mentor-perks">
                <li>
                  <i className="fa-solid fa-circle-check" /> Flexible hours,
                  work from anywhere
                </li>
                <li>
                  <i className="fa-solid fa-circle-check" /> Competitive
                  per-session compensation
                </li>
                <li>
                  <i className="fa-solid fa-circle-check" /> Build a profile,
                  earn ratings, grow your reach
                </li>
                <li>
                  <i className="fa-solid fa-circle-check" /> Full content tools
                  — quizzes, notes, MCQs
                </li>
              </ul>
              <a href="mailto:mentor@medminds.online" className="mentor-cta">
                Apply to mentor <i className="fa-solid fa-arrow-right" />
              </a>
            </div>
            <div className="mentor-visual">
              <i className="fa-solid fa-user-graduate" />
              <h4>120+ active mentors</h4>
              <p>
                Doctors, top scorers, and educators teaching on MedMinds today.
              </p>
            </div>
          </div>
        </div>
        <section>
          <div className="cta-banner">
            <h2>Ready to start your MDCAT prep?</h2>
            <p>
              Create a free account and jump straight into the question bank.
            </p>
            <a href="signup.html" className="btn-primary">
              Create your account <i className="fa-solid fa-arrow-right" />
            </a>
          </div>
        </section>
        <section id="contact">
          <div className="section-heading">
            <h2>Get in touch</h2>
            <p>
              Questions, feedback, or partnership inquiries — we'd love to hear
              from you.
            </p>
          </div>
          <div className="contact-section">
            <form
              className="contact-form"
              action
              method="post"
              onsubmit="
        event.preventDefault();
        alert('Thanks — we\'ll be in touch.');
      "
            >
              <h2>Send a message</h2>
              <div className="form-row">
                <input
                  name="name"
                  type="text"
                  placeholder="Your name"
                  required
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Your email"
                  required
                />
              </div>
              <input
                name="subject"
                type="text"
                placeholder="Subject"
                required
                style={{ marginBottom: 16 }}
              />
              <textarea
                name="message"
                placeholder="Your message"
                required
                defaultValue={""}
              />
              <button type="submit" className="button">
                Send message
              </button>
            </form>
            <div className="contact-info">
              <h3>Reach us</h3>
              <ul>
                <li>
                  <i className="fa-solid fa-envelope" />
                  <span>info@medminds.online</span>
                </li>
                <li>
                  <i className="fa-solid fa-phone" />
                  <span>+92 300 0000000</span>
                </li>
                <li>
                  <i className="fa-solid fa-globe" />
                  <span>www.medminds.online</span>
                </li>
                <li>
                  <i className="fa-solid fa-location-dot" />
                  <span>Pakistan</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <p>
          © <span id="year" /> MedMinds. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
export default Home;
