# MedMinds

A web-based MDCAT/medical-entry-test prep platform. Students sign up, take timed quizzes, browse a question bank, review their mistakes, and track stats. Admins manage students, questions, quizzes, notes, and announcements.

The app is a classic server-rendered + static HTML stack: an Express API talking to MySQL, with HTML pages served from the project root.

## Tech stack

- **Backend:** Node.js, Express 5, `express-session` for auth, `multer` for file uploads, `cors`
- **Database:** MySQL (via `mysql2/promise`)
- **Frontend:** Plain HTML/CSS/JS pages served as static files. Bundled vendor copies of Bootstrap and jQuery live in [vendor/](vendor/).
- **Storage:** Uploaded images, syllabi, and notes are written to [uploads/](uploads/).

## Repository layout

| Path | Purpose |
| --- | --- |
| [server.js](server.js) | Express app — all routes, table bootstrapping, session config |
| [MedMindsDB.js](MedMindsDB.js) | MySQL connection (exports a promise) |
| [script.js](script.js) | Shared client-side script |
| [newquizfunction.js](newquizfunction.js), [clean_functions.js](clean_functions.js) | Quiz helpers |
| `*.html` (root) | Page templates served directly (login, dashboard, admin, quiz, etc.) |
| [global.css](global.css), [style.css](style.css) | Stylesheets |
| [assets/](assets/) | Images and static assets used by the pages |
| [vendor/](vendor/) | Vendored Bootstrap + jQuery |
| [uploads/](uploads/) | Runtime upload destination (images, PDFs, notes) |
| [reviews/](reviews/) | Review-related assets |

## Prerequisites

- **Node.js** 18+ (tested with v22)
- **MySQL** 8.x (or MariaDB) running locally
- A POSIX-like shell (Linux/macOS) — Windows works too with adjusted commands

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the database and a user

The app connects with the credentials hard-coded in [MedMindsDB.js](MedMindsDB.js). The default config expects:

- host: `localhost`
- user: `medminds`
- password: `medminds123`
- database: `medminds`

Create them once:

```bash
sudo mysql <<'SQL'
CREATE DATABASE IF NOT EXISTS medminds;
CREATE USER IF NOT EXISTS 'medminds'@'localhost' IDENTIFIED BY 'medminds123';
GRANT ALL PRIVILEGES ON medminds.* TO 'medminds'@'localhost';
FLUSH PRIVILEGES;
SQL
```

Pick different credentials if you prefer — just update [MedMindsDB.js](MedMindsDB.js) to match.

You don't need to run any migrations. On first boot, [server.js](server.js) calls `CREATE TABLE IF NOT EXISTS` for every table it needs and runs idempotent `ALTER TABLE` statements to add later columns.

### 3. Run the server

```bash
node server.js
```

Output you should see:

```
MySQL Connected
Server running at http://localhost:5502
```

Open [http://localhost:5502](http://localhost:5502) in a browser.

## Default accounts

The bootstrap code in [server.js:181-216](server.js#L181-L216) seeds three accounts on first run:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `biologia.info1@gmail.com` | `1234567B` |
| Admin | `admin@medminds.com` | `1234567B` |
| Guest | `guest@gmail.com` | `Guest123` |

Change the admin password in production by editing the row in the `users` table.

## How it works

### Auth & sessions

- Sign-up writes to `users` with `approved = false`. An admin must approve students before they can log in (see [admin-students.html](admin-students.html) and the `/api/students/approve` route).
- Login uses `express-session` with cookie-based sessions. The session secret is hard-coded as `medminds-secret` in [server.js:20-26](server.js#L20-L26) — replace it before deploying.
- Password reset goes through `/forgot-password` → tokenized link → `/reset-password/:token`. Tokens are stored in the `password_resets` table.

### Question bank & quizzes

- Admins add questions via [admin-questions.html](admin-questions.html). Each question has subject, chapter, four options, a correct answer, optional image and explanation, and `published` / `quiz_only` flags.
- Quizzes are defined in `quiz_definitions` (name, subject, topics, duration, totalMcqs, optional `start_time`/`end_time`, `testType`). Quiz attempts go into `quizzes` with results JSON.
- Wrong answers are mirrored into the `mistakes` table so students see them in [MistakeCorner.html](MistakeCorner.html).
- Daily Q-Bank attempts and login dates are tracked in `q_bank_attempts` and `login_dates` to power [statics.html](statics.html).

### File uploads

- `multer` writes to [uploads/](uploads/) with random filenames; the route handlers store the filename in MySQL.
- The directory is exposed at `/uploads/...` via `express.static` ([server.js:3158](server.js#L3158)).

### Static page serving

- All HTML files in the project root are served as static files ([server.js:3157](server.js#L3157)).
- Some routes (e.g. `/admin-menu.html`, `/Q-Bank.html`) are intercepted before the static handler to gate access by session.

## Key pages

| Page | Audience | Purpose |
| --- | --- | --- |
| [index.html](index.html) | Public | Landing page |
| [Login.html](Login.html), [signup.html](signup.html) | Public | Auth |
| [forgot-password.html](forgot-password.html) | Public | Password reset request |
| [home.html](home.html), [dashboard.html](dashboard.html) | Student | Student home & dashboard |
| [Q-Bank.html](Q-Bank.html), [quiz-selection.html](quiz-selection.html), [quiz.html](quiz.html) | Student | Practice & quiz attempts |
| [MistakeCorner.html](MistakeCorner.html), [review.html](review.html) | Student | Wrong-answer review |
| [statics.html](statics.html), [stats.html](stats.html), [leaderboard.html](leaderboard.html) | Student | Stats & ranking |
| [student-notes.html](student-notes.html) | Student | Browse uploaded notes |
| [admin.html](admin.html), [admin-menu.html](admin-menu.html) | Admin | Admin home |
| [admin-students.html](admin-students.html) | Admin | Approve / manage students |
| [admin-questions.html](admin-questions.html) | Admin | CRUD questions |
| [admin-quizzes.html](admin-quizzes.html), [create-test.html](create-test.html) | Admin | Define quizzes |
| [admin-notes.html](admin-notes.html) | Admin | Upload notes / syllabi |
| [admin-updates.html](admin-updates.html) | Admin | Post announcements |

## API surface (selected)

Roughly 70 routes are defined in [server.js](server.js). Highlights:

- **Auth:** `POST /signup`, `POST /login`, `GET /logout`, `GET /check-session`, `POST /forgot-password`, `GET|POST /reset-password[/:token]`
- **Student data:** `GET /api/dashboard`, `GET /api/q-bank`, `GET /api/quizzes`, `GET /api/quiz/:id`, `POST /submit-quiz`, `POST /submit-answer`, `GET /api/mistake-corner`, `GET /api/user-stats`, `GET /api/statics`
- **Admin students:** `GET /api/students`, `GET /api/approved-students`, `POST /api/students/approve`, `POST /approve`
- **Admin content:** `POST /add-question`, `POST /publish-question`, `POST /unpublish-question`, `POST /delete-question`, `POST /create-quiz`, `POST /delete-quiz`, `POST /add-update`, `POST /upload-notes`, `POST /upload-syllabus`
- **Settings:** `GET /api/settings`, `POST /update-mdcat-date`

Search [server.js](server.js) for the exact handler — they're grouped roughly by feature.

## Database schema

Created at boot in [server.js:32-171](server.js#L32-L171):

- `users` — account, profile, `approved` flag
- `questions` — bank of MCQs (with `published`, `quiz_only`, optional image and explanation)
- `quiz_definitions` — configured quizzes
- `quizzes` — submitted attempts (JSON results)
- `mistakes` — per-student wrong answers
- `q_bank_attempts`, `login_dates` — daily activity tracking
- `q_bank_answers` — per-question history (one row per `(email, question_id)`)
- `notes` — uploaded note files
- `updates` — announcements/news
- `password_resets` — reset tokens
- `settings` — key/value config (e.g. `syllabus_file`, MDCAT date)

## Configuration knobs

Currently hard-coded in source — change here if you need to:

- DB credentials → [MedMindsDB.js](MedMindsDB.js)
- Session secret → [server.js:20-26](server.js#L20-L26)
- Port (`5502`) → [server.js:29](server.js#L29)
- Admin emails / default password → [server.js:181-193](server.js#L181-L193)

For anything beyond local dev, move these to environment variables (`process.env.*`) before deploying.

## Development tips

- **Restart on change:** `node server.js` doesn't watch files. Use `nodemon` if you want auto-reload: `npx nodemon server.js`.
- **Reset the DB:** `mysql -umedminds -pmedminds123 -e 'DROP DATABASE medminds; CREATE DATABASE medminds;'` then restart the server — tables get recreated empty.
- **Clearing uploads:** files in [uploads/](uploads/) are not garbage-collected. Delete manually if needed; DB rows referencing them will 404.
- **Static caching:** Express serves the HTML from disk on each request, so edits show up after a hard refresh.

## Known limitations

- Passwords are stored in plaintext in the `users` table. Hash with `bcrypt` before any real deployment.
- Session secret and DB password are committed in source. Move to env vars + `.env`.
- No CSRF protection on the form posts.
- `cors` is set to `origin: true` (reflect any origin) for development convenience — tighten this for prod.
- No automated tests.

## License

ISC (per [package.json](package.json)).
# medminds
