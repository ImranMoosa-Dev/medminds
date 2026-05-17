import dotenv from "dotenv";
import express from "express";
import path from "path";
import fs from "fs";
import session from "express-session";
import multer from "multer";
import cors from "cors";
import jwt from "jsonwebtoken";
import authRoutes from "./routes/authRoutes.js";
import initDB from "./database/initDB.js";
import studentRoutes from "./routes/studentRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";

// import adminRoutes from "./routes/adminRoutes.js";
// import questionRoutes from "./routes/questionRoutes.js";
// import notesRoutes from "./routes/notesRoutes.js";

// seeding files imports
// import seedSubjects from "./database/seedSubject.js";
// import seedTopics from "./database/seedTopics.js";
// import seedSubtopics from "./database/seedSubTopics.js";
// import seedQuestions from "./database/seedQuestions.js";
// import seedQuizzes from "./database/seedQuizzes.js";
const app = express();
const upload = multer({ dest: "uploads/" });

// Initialize the database and create tables if they don't exist
await initDB();
// config dotenv
dotenv.config();
// // ================================
// // ENVIRONMENT VARIABLES
// // ================================
const PORT = process.env.PORT || 5502;
const NODE_ENV = process.env.NODE_ENV || "development";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_KEY;
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim());
const JWT_SECRET = process.env.JWT_SECRET || "medminds-jwt-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || "medminds_token";

app.use(
  cors({
    origin: true, // Allow all origins for development
    credentials: true,
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "medminds-secret",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, sameSite: "lax" },
  }),
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/quizzes", quizRoutes);
// app.use("/api/v1/admin", adminRoutes);
// app.use("/api/v1/question", questionRoutes);
// app.use("/api/v1/notes", notesRoutes);
// Static file serving should come after API routes
// app.use(express.static(path.join(__dirname)));
// app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}.`.bgYellow);
});
// function parseCookies(req) {
//   const header = req.headers.cookie || "";
//   return header.split(";").reduce((cookies, pair) => {
//     const [name, ...rest] = pair.trim().split("=");
//     if (!name) return cookies;
//     cookies[name] = decodeURIComponent(rest.join("="));
//     return cookies;
//   }, {});
// }

// function attachUser(req, res, next) {
//   req.user = null;
//   const authHeader = req.headers.authorization;
//   let token = authHeader?.startsWith("Bearer ")
//     ? authHeader.split(" ")[1]
//     : null;

//   if (!token) {
//     const cookies = parseCookies(req);
//     token = cookies[JWT_COOKIE_NAME];
//   }

//   if (token) {
//     try {
//       req.user = jwt.verify(token, JWT_SECRET);
//     } catch (err) {
//       req.user = null;
//     }
//   }

//   if (!req.user && req.session?.user) {
//     req.user = { email: req.session.user };
//   }

//   next();
// }

// app.use(attachUser);

// // ================================
// // CONFIG ENDPOINT (for frontend)
// // ================================
// app.get("/api/config", (req, res) => {
//   res.json({
//     adminEmails: ADMIN_EMAILS,
//   });
// });

//   // Ensure admin users exist
//   const adminEmails = ["biologia.info1@gmail.com", "admin@medminds.com"];
//   const adminPassword = "1234567B";
//   for (const adminEmail of adminEmails) {
//     const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
//       adminEmail,
//     ]);
//     if (rows.length === 0) {
//       await db.execute(
//         "INSERT INTO users (fullName, email, password, loggedIn, approved) VALUES (?, ?, ?, ?, ?)",
//         ["Admin", adminEmail, adminPassword, false, true],
//       );
//     }
//   }

//   // Ensure guest user exists
//   const guestEmail = "guest@gmail.com";
//   const guestPassword = "Guest123";
//   const [guestRows] = await db.execute("SELECT * FROM users WHERE email = ?", [
//     guestEmail,
//   ]);
//   if (guestRows.length === 0) {
//     await db.execute(
//       "INSERT INTO users (fullName, email, password, loggedIn, approved, fatherName, district, whatsapp, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
//       [
//         "Guest",
//         guestEmail,
//         guestPassword,
//         false,
//         true,
//         "N/A",
//         "Badin",
//         "12345678910",
//         "fresher",
//       ],
//     );
//   }

//   app.post("/auth/logout", async (req, res) => {
//     try {
//       req.session.destroy(() => {});
//       res.clearCookie(JWT_COOKIE_NAME);
//       res.json({ success: true, message: "Logged out" });
//     } catch (err) {
//       console.error("Logout error:", err);
//       res.status(500).json({ error: "Error logging out" });
//     }
//   });

//   app.get("/admin-updates.html", (req, res) => {
//     if (
//       req.session.user === "biologia.info1@gmail.com" ||
//       req.session.user === "admin@medminds.com"
//     ) {
//       res.sendFile(path.join(__dirname, "admin-updates.html"));
//     } else {
//       res.redirect("/dashboard.html");
//     }
//   });

//   app.get("/admin-notes.html", (req, res) => {
//     if (
//       req.session.user === "biologia.info1@gmail.com" ||
//       req.session.user === "admin@medminds.com"
//     ) {
//       res.sendFile(path.join(__dirname, "admin-notes.html"));
//     } else {
//       res.redirect("/dashboard.html");
//     }
//   });

//   app.get("/admin/students", async (req, res) => {
//     if (req.session.user === "biologia.info1@gmail.com") {
//       try {
//         const [users] = await db.execute("SELECT * FROM users");
//         let html = fs.readFileSync(
//           path.join(__dirname, "admin-students.html"),
//           "utf8",
//         );
//         let studentsHtml = "";
//         users.forEach((user) => {
//           if (
//             user.email !== "biologia.info1@gmail.com" &&
//             user.email !== "admin@medminds.com"
//           ) {
//             studentsHtml += `<div class="student">
//                             <div class="student-info">
//                                 <p>Name: ${user.fullName}</p>
//                                 <p>Email: ${user.email}</p>
//                                 <p>Password: ${user.password}</p>
//                             </div>
//                             <div class="student-approval">
//                                 <form method="post" action="/approve">
//                                     <input type="hidden" name="email" value="${user.email}">
//                                     <input type="radio" name="status" value="approved" ${user.approved ? "checked" : ""}> Login Approved<br>
//                                     <input type="radio" name="status" value="disapproved" ${!user.approved ? "checked" : ""}> Login Disapproved<br>
//                                     <button type="submit">Update</button>
//                                 </form>
//                             </div>
//                         </div>`;
//           }
//         });
//         html = html.replace(
//           "<!-- Students will be inserted here -->",
//           studentsHtml,
//         );
//         res.send(html);
//       } catch (err) {
//         res.status(500).send("Error loading students");
//       }
//     } else {
//       res.redirect("/dashboard.html");
//     }
//   });

//   app.get("/admin/quizzes", async (req, res) => {
//     if (
//       req.session.user === "biologia.info1@gmail.com" ||
//       req.session.user === "admin@medminds.com"
//     ) {
//       try {
//         const [quizDefs] = await db.execute("SELECT * FROM quiz_definitions");
//         const [quizzes] = await db.execute(
//           "SELECT * FROM quizzes ORDER BY date DESC",
//         );
//         const [users] = await db.execute("SELECT email, fullName FROM users");
//         const userMap = {};
//         users.forEach((u) => (userMap[u.email] = u.fullName));
//         let html = fs.readFileSync(
//           path.join(__dirname, "admin-quizzes.html"),
//           "utf8",
//         );
//         let quizDefsHtml =
//           '<table border="1" style="width:100%; border-collapse:collapse;"><tr><th>Name</th><th>Subject</th><th>Topics</th><th>Duration</th><th>MCQs</th><th>Test Type</th><th>Actions</th></tr>';
//         quizDefs.forEach((q) => {
//           quizDefsHtml += `<tr><td>${q.name}</td><td>${q.subject}</td><td>${q.topics}</td><td>${q.duration} min</td><td>${q.totalMcqs}</td><td>${q.testType || "N/A"}</td><td><a href="/edit-quiz/${q.id}">Edit</a> | <a href="/view-quiz-results/${q.id}">View Results</a> | <form method="post" action="/delete-quiz" style="display:inline;"><button type="submit" name="id" value="${q.id}">Delete</button></form></td></tr>`;
//         });
//         quizDefsHtml += "</table>";
//         html = html.replace(
//           "<!-- Existing quizzes will be inserted here -->",
//           quizDefsHtml,
//         );
//         // Calculate ranks
//         const studentAverages = {};
//         quizzes.forEach((quiz) => {
//           const results = JSON.parse(quiz.results);
//           let totalCorrect = 0;
//           let totalQuestions = 0;
//           Object.values(results).forEach((subject) => {
//             totalCorrect += subject.correct;
//             totalQuestions += subject.total;
//           });
//           if (!studentAverages[quiz.email]) {
//             studentAverages[quiz.email] = { correct: 0, total: 0 };
//           }
//           studentAverages[quiz.email].correct += totalCorrect;
//           studentAverages[quiz.email].total += totalQuestions;
//         });
//         const averages = Object.entries(studentAverages)
//           .map(([email, data]) => ({
//             email,
//             average: data.total > 0 ? (data.correct / data.total) * 100 : 0,
//           }))
//           .sort((a, b) => b.average - a.average);
//         const ranks = {};
//         averages.forEach((student, index) => {
//           ranks[student.email] = index + 1;
//         });
//         let quizzesHtml = "";
//         quizzes.forEach((quiz) => {
//           const results = JSON.parse(quiz.results);
//           const name = userMap[quiz.email] || quiz.email;
//           let resultStr = Object.keys(results)
//             .map(
//               (subject) =>
//                 `${subject}: ${results[subject].correct}/${results[subject].total}`,
//             )
//             .join(", ");
//           quizzesHtml += `<li>${name} (Rank: ${ranks[quiz.email] || "N/A"}) - ${new Date(quiz.date).toLocaleString()} - ${resultStr}</li>`;
//         });
//         html = html.replace(
//           "<!-- Quiz submissions will be inserted here -->",
//           quizzesHtml,
//         );
//         res.send(html);
//       } catch (err) {
//         res.status(500).send("Error loading quizzes");
//       }
//     } else {
//       res.redirect("/dashboard.html");
//     }
//   });

//   app.get("/view-quiz-results/:id", async (req, res) => {
//     if (
//       req.session.user === "biologia.info1@gmail.com" ||
//       req.session.user === "admin@medminds.com"
//     ) {
//       const quizId = req.params.id;
//       const [quizResults] = await db.execute(
//         "SELECT * FROM quizzes WHERE quiz_id = ? ORDER BY date DESC",
//         [quizId],
//       );
//       const [users] = await db.execute("SELECT email, fullName FROM users");
//       const userMap = {};
//       users.forEach((u) => (userMap[u.email] = u.fullName));
//       const studentAverages = {};
//       quizResults.forEach((quiz) => {
//         const results = JSON.parse(quiz.results);
//         let totalCorrect = 0;
//         let totalQuestions = 0;
//         Object.values(results).forEach((subject) => {
//           totalCorrect += subject.correct;
//           totalQuestions += subject.total;
//         });
//         if (!studentAverages[quiz.email]) {
//           studentAverages[quiz.email] = { correct: 0, total: 0 };
//         }
//         studentAverages[quiz.email].correct += totalCorrect;
//         studentAverages[quiz.email].total += totalQuestions;
//       });
//       const averages = Object.entries(studentAverages)
//         .map(([email, data]) => ({
//           email,
//           average: data.total > 0 ? (data.correct / data.total) * 100 : 0,
//         }))
//         .sort((a, b) => b.average - a.average);
//       const ranks = {};
//       averages.forEach((student, index) => {
//         ranks[student.email] = index + 1;
//       });
//       let html = `<h1>Results for Quiz ID ${quizId}</h1><ul>`;
//       quizResults.forEach((quiz) => {
//         const results = JSON.parse(quiz.results);
//         const name = userMap[quiz.email] || quiz.email;
//         let totalCorrect = 0;
//         let totalQuestions = 0;
//         Object.values(results).forEach((subject) => {
//           totalCorrect += subject.correct;
//           totalQuestions += subject.total;
//         });
//         const score =
//           totalQuestions > 0
//             ? Math.round((totalCorrect / totalQuestions) * 10000) / 100
//             : 0;
//         let resultStr = Object.keys(results)
//           .map(
//             (subject) =>
//               `${subject}: ${results[subject].correct}/${results[subject].total}`,
//           )
//           .join(", ");
//         html += `<li>${name} (Score: ${score}%) - ${new Date(quiz.date).toLocaleString()} - ${resultStr}</li>`;
//       });
//       html += '</ul><a href="/admin">Back</a>';
//       res.send(html);
//     } else {
//       res.redirect("/dashboard.html");
//     }
//   });

//   app.get("/admin/updates", async (req, res) => {
//     if (
//       req.session.user === "biologia.info1@gmail.com" ||
//       req.session.user === "admin@medminds.com"
//     ) {
//       try {
//         console.log("Fetching updates from database...");
//         const [updates] = await db.execute(
//           `SELECT id, title, content, image, created_at
//                  FROM updates
//                  ORDER BY created_at DESC`,
//         );
//         console.log("Updates fetched successfully:", updates.length, "records");

//         let html = fs.readFileSync(
//           path.join(__dirname, "admin-updates.html"),
//           "utf8",
//         );

//         let updatesHtml = "";
//         updates.forEach((u) => {
//           updatesHtml += `
//                     <li>
//                         <strong>${u.title}</strong> – ${u.content}
//                         <br>
//                         <small>${new Date(u.created_at).toLocaleString()}</small>
//                         <form method="post" action="/delete-update" style="display:inline;">
//                             <button type="submit" name="id" value="${u.id}">Delete</button>
//                         </form>
//                     </li>
//                 `;
//         });

//         html = html.replace(
//           "<!-- Updates will be inserted here -->",
//           updatesHtml,
//         );

//         let message = "";
//         if (req.query.success)
//           message = '<p style="color:green;font-weight:bold">Update added!</p>';
//         if (req.query.error)
//           message =
//             '<p style="color:red;font-weight:bold">' + req.query.error + "</p>";

//         html = html.replace("<h2>Updates</h2>", "<h2>Updates</h2>" + message);

//         res.send(html);
//       } catch (err) {
//         console.error("Error loading updates:", err);
//         res.status(500).send("Error loading updates");
//       }
//     } else {
//       res.redirect("/dashboard.html");
//     }
//   });

//   app.get("/admin/notes", async (req, res) => {
//     if (
//       req.session.user === "biologia.info1@gmail.com" ||
//       req.session.user === "admin@medminds.com"
//     ) {
//       try {
//         const [notes] = await db.execute(
//           "SELECT * FROM notes ORDER BY uploaded_at DESC",
//         );
//         let html = fs.readFileSync(
//           path.join(__dirname, "admin-notes.html"),
//           "utf8",
//         );
//         let notesHtml = "";
//         notes.forEach((n) => {
//           notesHtml += `<li>${n.subject} - ${n.title} <a href="/uploads/${n.filename}" target="_blank">View</a> <form method="post" action="/delete-note" style="display:inline;"><button type="submit" name="id" value="${n.id}">Delete</button></form></li>`;
//         });
//         html = html.replace("<!-- Notes will be inserted here -->", notesHtml);
//         res.send(html);
//       } catch (err) {
//         res.status(500).send("Error loading notes");
//       }
//     } else {
//       res.redirect("/dashboard.html");
//     }
//   });

//   app.post("/update-mdcat-date", async (req, res) => {
//     if (
//       req.session.user === "biologia.info1@gmail.com" ||
//       req.session.user === "admin@medminds.com"
//     ) {
//       const { mdcat_date } = req.body;
//       try {
//         await db.execute(
//           "INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?",
//           ["mdcat_date", mdcat_date, mdcat_date],
//         );
//         res.redirect("/admin-menu.html?success=mdcat");
//       } catch (err) {
//         res.status(500).send("Error updating MDCAT date");
//       }
//     } else {
//       res.redirect("/dashboard.html");
//     }
//   });

//   app.post("/upload-syllabus", upload.single("syllabus"), async (req, res) => {
//     if (
//       req.session.user === "biologia.info1@gmail.com" ||
//       req.session.user === "admin@medminds.com"
//     ) {
//       if (!req.file) {
//         return res.redirect("/admin-menu.html?error=No file uploaded");
//       }
//       const filename = req.file.filename;
//       try {
//         await db.execute(
//           "INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?",
//           ["syllabus_file", filename, filename],
//         );
//         res.redirect("/admin-menu.html?success=syllabus");
//       } catch (err) {
//         res.redirect(
//           "/admin-menu.html?error=" + encodeURIComponent(err.message),
//         );
//       }
//     } else {
//       res.redirect("/dashboard.html");
//     }
//   });

//   function formatFileSize(bytes) {
//     if (bytes === 0) return "0 Bytes";
//     const k = 1024;
//     const sizes = ["Bytes", "KB", "MB", "GB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
//   }

//   app.get("/api/approved-students", async (req, res) => {
//     if (
//       req.session.user !== "biologia.info1@gmail.com" &&
//       req.session.user !== "admin@medminds.com"
//     ) {
//       return res.status(403).json({ error: "Unauthorized" });
//     }
//     try {
//       const [approvedUsers] = await db.execute(
//         "SELECT id, fullName, fatherName, district, whatsapp, status, email FROM users WHERE approved = ? AND email NOT IN (?, ?)",
//         [true, "biologia.info1@gmail.com", "admin@medminds.com"],
//       );
//       // Calculate scores
//       const [allQuizzes] = await db.execute(
//         "SELECT email, results FROM quizzes",
//       );
//       const userScores = {};
//       allQuizzes.forEach((quiz) => {
//         const results = JSON.parse(quiz.results);
//         let totalCorrect = 0;
//         let totalQuestions = 0;
//         Object.values(results).forEach((subject) => {
//           totalCorrect += subject.correct;
//           totalQuestions += subject.total;
//         });
//         if (!userScores[quiz.email])
//           userScores[quiz.email] = { correct: 0, total: 0 };
//         userScores[quiz.email].correct += totalCorrect;
//         userScores[quiz.email].total += totalQuestions;
//       });
//       const leaderboard = approvedUsers
//         .map((user) => ({
//           id: user.id,
//           fullName: user.fullName,
//           fatherName: user.fatherName,
//           district: user.district,
//           whatsapp: user.whatsapp,
//           status: user.status,
//           email: user.email,
//           score: userScores[user.email]
//             ? Math.round(
//                 (userScores[user.email].correct /
//                   userScores[user.email].total) *
//                   10000,
//               ) / 100
//             : 0,
//         }))
//         .sort((a, b) => b.score - a.score);
//       // Assign ranks
//       leaderboard.forEach((student, index) => {
//         student.rank = index + 1;
//       });
//       res.json(leaderboard);
//     } catch (err) {
//       res.status(500).json({ error: "Error fetching approved students" });
//     }
//   });

//   app.get("/api/settings", async (req, res) => {
//     try {
//       const [mdcatDateSetting] = await db.execute(
//         "SELECT value FROM settings WHERE key_name = ?",
//         ["mdcat_date"],
//       );
//       const [syllabusSetting] = await db.execute(
//         "SELECT value FROM settings WHERE key_name = ?",
//         ["syllabus_file"],
//       );
//       const mdcatDate = mdcatDateSetting[0]?.value || "";
//       const syllabusFile = syllabusSetting[0]?.value || "";
//       res.json({ mdcatDate, syllabusFile });
//     } catch (err) {
//       res.status(500).json({ error: "Error fetching settings" });
//     }
//   });

//   app.get("/api/dashboard", async (req, res) => {
//     try {
//       const [signedUpUsers] = await db.execute(
//         "SELECT COUNT(*) as count FROM users WHERE email NOT IN (?, ?)",
//         ["biologia.info1@gmail.com", "admin@medminds.com"],
//       );
//       const signedUpCount = signedUpUsers[0].count;
//       const [quizzes] = await db.execute("SELECT results FROM quizzes");
//       let totalScore = 0;
//       let totalQuizzes = 0;
//       quizzes.forEach((quiz) => {
//         const results = JSON.parse(quiz.results);
//         Object.values(results).forEach((subject) => {
//           totalScore += (subject.correct / subject.total) * 100;
//           totalQuizzes++;
//         });
//       });
//       const averageScore =
//         totalQuizzes > 0 ? (totalScore / totalQuizzes).toFixed(2) : 0;
//       const [updates] = await db.execute(
//         "SELECT * FROM updates ORDER BY created_at DESC LIMIT 5",
//       );
//       const updatesData = updates.map((u) => ({
//         title: u.title,
//         content: u.content,
//         date: u.created_at,
//         image: u.image,
//       }));
//       const [mdcatDateSetting] = await db.execute(
//         "SELECT value FROM settings WHERE key_name = ?",
//         ["mdcat_date"],
//       );
//       const [syllabusSetting] = await db.execute(
//         "SELECT value FROM settings WHERE key_name = ?",
//         ["syllabus_file"],
//       );
//       const mdcatDate = mdcatDateSetting[0]?.value || "";
//       const syllabusFile = syllabusSetting[0]?.value || "";
//       res.json({
//         signedUpCount,
//         averageScore,
//         updates: updatesData,
//         mdcatDate,
//         syllabusFile,
//       });
//     } catch (err) {
//       res.status(500).json({ error: "Error fetching dashboard data" });
//     }
//   });

//   app.get("/api/q-bank", async (req, res) => {
//     if (!req.session.user) {
//       return res.status(401).json({ error: "Not logged in" });
//     }

//     try {
//       const email = req.session.user;

//       // Load only published questions
//       const [questions] = await db.execute(
//         "SELECT id, subject, question, opt1, opt2, opt3, opt4, correct, image FROM questions WHERE published = 1 AND (quiz_only IS NULL OR quiz_only = 0)",
//       );

//       // Load user's answers
//       const [answers] = await db.execute(
//         "SELECT question_id, user_answer FROM q_bank_answers WHERE email = ?",
//         [email],
//       );

//       const answerMap = {};
//       answers.forEach((a) => {
//         answerMap[a.question_id] = a.user_answer;
//       });

//       const subjects = {};

//       questions.forEach((q) => {
//         if (!subjects[q.subject]) subjects[q.subject] = [];

//         const userAnswer = answerMap[q.id];
//         const status =
//           userAnswer === undefined
//             ? "unattempted"
//             : userAnswer == q.correct
//               ? "correct"
//               : "wrong";

//         // Only include questions that are not wrong
//         if (status !== "wrong") {
//           subjects[q.subject].push({
//             id: q.id,
//             question: q.question,
//             opt1: q.opt1,
//             opt2: q.opt2,
//             opt3: q.opt3,
//             opt4: q.opt4,
//             image: q.image,
//             status: status,
//           });
//         }
//       });

//       // Sort inside each subject:
//       // Unattempted → Wrong → Correct
//       Object.keys(subjects).forEach((subject) => {
//         const order = { unattempted: 0, wrong: 1, correct: 2 };
//         subjects[subject].sort((a, b) => order[a.status] - order[b.status]);
//       });

//       res.json({
//         subjects,
//         userEmail: email,
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: "Error fetching Q-Bank data" });
//     }
//   });

//   app.get("/api/mistake-corner", async (req, res) => {
//     if (!req.session.user) {
//       return res.status(401).json({ error: "Not logged in" });
//     }

//     try {
//       const email = req.session.user;

//       // Load only published questions that the user got wrong
//       const [questions] = await db.execute(
//         `SELECT q.id, q.subject, q.question, q.opt1, q.opt2, q.opt3, q.opt4, q.correct, q.image, q.explanation, qa.user_answer
//              FROM questions q
//              JOIN q_bank_answers qa ON q.id = qa.question_id
//              WHERE q.published = 1 AND qa.email = ? AND qa.user_answer != q.correct`,
//         [email],
//       );

//       const subjects = {};

//       questions.forEach((q) => {
//         if (!subjects[q.subject]) subjects[q.subject] = [];

//         subjects[q.subject].push({
//           id: q.id,
//           question: q.question,
//           opt1: q.opt1,
//           opt2: q.opt2,
//           opt3: q.opt3,
//           opt4: q.opt4,
//           correct: q.correct,
//           image: q.image,
//           explanation: q.explanation,
//           userAnswer: q.user_answer,
//         });
//       });

//       res.json({
//         subjects,
//         userEmail: email,
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: "Error fetching Mistake Corner data" });
//     }
//   });

//   app.get("/api/quizzes", async (req, res) => {
//     if (!req.session.user) {
//       return res.status(401).json({ error: "Not logged in" });
//     }
//     // Check if user is approved (except admins)
//     if (
//       req.session.user !== "biologia.info1@gmail.com" &&
//       req.session.user !== "admin@medminds.com"
//     ) {
//       const [user] = await db.execute(
//         "SELECT approved FROM users WHERE email = ?",
//         [req.session.user],
//       );
//       if (!user.length || !user[0].approved) {
//         return res
//           .status(403)
//           .json({ error: "Your account is not approved by admin." });
//       }
//     }
//     try {
//       const [quizzes] = await db.execute(
//         "SELECT * FROM quiz_definitions WHERE start_time <= NOW() AND (end_time IS NULL OR end_time >= NOW())",
//       );
//       res.json(quizzes);
//     } catch (err) {
//       res.status(500).json({ error: "Error fetching quizzes" });
//     }
//   });

//   // Public route to get quiz details for shared links
//   app.get("/api/public/quiz/:id", async (req, res) => {
//     const quizId = req.params.id;
//     try {
//       const [quizDef] = await db.execute(
//         "SELECT id, name, subject, topics, duration, totalMcqs, questions, start_time, end_time, testType FROM quiz_definitions WHERE id = ?",
//         [quizId],
//       );

//       if (!quizDef.length) {
//         return res.status(404).json({ error: "Quiz not found" });
//       }

//       const questionIds = JSON.parse(quizDef[0].questions || "[]");

//       if (!questionIds.length) {
//         return res.status(404).json({ error: "This quiz has no questions." });
//       }

//       const placeholders = questionIds.map(() => "?").join(",");

//       // Fetch questions
//       const [questions] = await db.execute(
//         `SELECT * FROM questions
//              WHERE id IN (${placeholders}) AND (published = TRUE OR quiz_only = TRUE)`,
//         questionIds,
//       );

//       const quizData = {
//         id: quizDef[0].id,
//         name: quizDef[0].name,
//         subject: quizDef[0].subject,
//         topics: quizDef[0].topics,
//         duration: quizDef[0].duration,
//         totalMcqs: quizDef[0].totalMcqs,
//         start_time: quizDef[0].start_time,
//         end_time: quizDef[0].end_time,
//         testType: quizDef[0].testType,
//         questions: questions,
//       };

//       res.json(quizData);
//     } catch (err) {
//       res.status(500).json({ error: "Error fetching quiz" });
//     }
//   });

//   app.get("/api/quiz/:id", async (req, res) => {
//     if (!req.session.user) {
//       return res.status(401).json({ error: "Not logged in" });
//     }

//     // Check if user is approved (except admins)
//     if (
//       req.session.user !== "biologia.info1@gmail.com" &&
//       req.session.user !== "admin@medminds.com"
//     ) {
//       const [user] = await db.execute(
//         "SELECT approved FROM users WHERE email = ?",
//         [req.session.user],
//       );
//       if (!user.length || !user[0].approved) {
//         return res
//           .status(403)
//           .json({ error: "Your account is not approved by admin." });
//       }
//     }

//     const quizId = req.params.id;

//     try {
//       // Check if user has already attempted this quiz
//       const [existingAttempt] = await db.execute(
//         "SELECT * FROM quizzes WHERE email = ? AND quiz_id = ?",
//         [req.session.user, quizId],
//       );

//       if (existingAttempt.length > 0) {
//         return res.json({
//           error:
//             "You have already attempted this quiz. Only one attempt is allowed.",
//           attempted: true,
//           results: existingAttempt[0],
//         });
//       }

//       // Only allow ACTIVE quizzes
//       const [quizDef] = await db.execute(
//         `SELECT * FROM quiz_definitions
//              WHERE id = ?
//               AND start_time <= NOW()
//               AND (end_time IS NULL OR end_time >= NOW())`,
//         [quizId],
//       );

//       if (!quizDef.length) {
//         return res.status(404).json({ error: "Quiz not active or not found" });
//       }

//       const questionIds = JSON.parse(quizDef[0].questions || "[]");

//       if (!questionIds.length) {
//         // Check if user is admin
//         if (
//           req.session.user === "biologia.info1@gmail.com" ||
//           req.session.user === "admin@medminds.com"
//         ) {
//           return res.json({
//             error:
//               "This quiz has no questions assigned. Please add questions to this quiz from the admin panel.",
//           });
//         } else {
//           return res.json({
//             error: "This quiz is not available yet. Please try again later.",
//           });
//         }
//       }

//       const placeholders = questionIds.map(() => "?").join(",");

//       // Fetch questions
//       const [questions] = await db.execute(
//         `SELECT * FROM questions
//              WHERE id IN (${placeholders}) AND (published = TRUE OR quiz_only = TRUE)`,
//         questionIds,
//       );

//       const quizData = {
//         name: quizDef[0].name,
//         topics: quizDef[0].topics,
//         totalMcqs: quizDef[0].totalMcqs,
//         duration: quizDef[0].duration,
//         questions: questions.map((q) => ({
//           id: q.id,
//           question: q.question,
//           opt1: q.opt1,
//           opt2: q.opt2,
//           opt3: q.opt3,
//           opt4: q.opt4,
//           image: q.image,
//           correct: q.correct + 1, // Convert from 0-based to 1-based
//         })),
//       };

//       res.json(quizData);
//     } catch (err) {
//       console.error("Quiz load error:", err);
//       res.status(500).json({ error: "Error fetching quiz" });
//     }
//   });

//   app.get("/api/mistakes", async (req, res) => {
//     if (!req.session.user) {
//       return res.status(401).json({ error: "Not logged in" });
//     }
//     try {
//       const [mistakes] = await db.execute(
//         "SELECT * FROM mistakes WHERE email = ? ORDER BY date DESC",
//         [req.session.user],
//       );
//       const mistakesData = mistakes.map((m) => ({
//         question: m.question,
//         options: JSON.parse(m.options),
//         correct: m.correct,
//         userAnswer: m.userAnswer,
//         date: m.date,
//       }));
//       res.json(mistakesData);
//     } catch (err) {
//       res.status(500).json({ error: "Error fetching mistakes" });
//     }
//   });

//   app.get("/api/statics", async (req, res) => {
//     if (!req.session.user) {
//       return res.status(401).json({ error: "Not logged in" });
//     }
//     try {
//       const [userQuizzes] = await db.execute(
//         "SELECT * FROM quizzes WHERE email = ?",
//         [req.session.user],
//       );
//       const totalQuizzes = userQuizzes.length;
//       let totalQuestions = 0;
//       let totalCorrect = 0;
//       const subjects = [
//         "Biology",
//         "Chemistry",
//         "Physics",
//         "English",
//         "Logical Reasoning",
//       ];
//       const subjectStats = {};
//       subjects.forEach((s) => (subjectStats[s] = { correct: 0, total: 0 }));
//       userQuizzes.forEach((quiz) => {
//         const results = JSON.parse(quiz.results);
//         Object.keys(results).forEach((subject) => {
//           subjectStats[subject].correct += results[subject].correct;
//           subjectStats[subject].total += results[subject].total;
//         });
//         totalQuestions += Object.values(results).reduce(
//           (sum, s) => sum + s.total,
//           0,
//         );
//         totalCorrect += Object.values(results).reduce(
//           (sum, s) => sum + s.correct,
//           0,
//         );
//       });
//       const averageAccuracy =
//         totalQuestions > 0
//           ? ((totalCorrect / totalQuestions) * 100).toFixed(2)
//           : 0;

//       // Calculate login streak
//       const [loginDates] = await db.execute(
//         "SELECT date FROM login_dates WHERE email = ? ORDER BY date DESC",
//         [req.session.user],
//       );
//       const loginDateStrings = [
//         ...new Set(loginDates.map((l) => l.date)),
//       ].sort();
//       let streak = 0;
//       let currentDate = new Date().toISOString().split("T")[0];
//       while (loginDateStrings.includes(currentDate)) {
//         streak++;
//         const d = new Date(currentDate);
//         d.setDate(d.getDate() - 1);
//         currentDate = d.toISOString().split("T")[0];
//       }

//       // Q-Bank streak
//       const [qBankAttempts] = await db.execute(
//         "SELECT date FROM q_bank_attempts WHERE email = ? ORDER BY date DESC",
//         [req.session.user],
//       );
//       const qDates = [...new Set(qBankAttempts.map((a) => a.date))].sort();
//       let qBankStreak = 0;
//       let currentDateQBank = new Date().toISOString().split("T")[0];
//       while (qDates.includes(currentDateQBank)) {
//         qBankStreak++;
//         const d = new Date(currentDateQBank);
//         d.setDate(d.getDate() - 1);
//         currentDateQBank = d.toISOString().split("T")[0];
//       }

//       // Weak areas
//       const weakAreas = [];
//       subjects.forEach((subject) => {
//         const acc =
//           subjectStats[subject].total > 0
//             ? (subjectStats[subject].correct / subjectStats[subject].total) *
//               100
//             : 0;
//         if (acc < 60 && subjectStats[subject].total > 0) {
//           weakAreas.push(`${subject}: ${acc.toFixed(2)}%`);
//         }
//       });

//       // Q-Bank stats
//       const [qBankAnswers] = await db.execute(
//         "SELECT qa.question_id, qa.user_answer, q.subject, q.correct FROM q_bank_answers qa JOIN questions q ON qa.question_id = q.id WHERE qa.email = ?",
//         [req.session.user],
//       );
//       const subjectAttempted = {};
//       const subjectCorrect = {};
//       qBankAnswers.forEach((answer) => {
//         const subject = answer.subject;
//         if (!subjectAttempted[subject]) subjectAttempted[subject] = 0;
//         if (!subjectCorrect[subject]) subjectCorrect[subject] = 0;
//         subjectAttempted[subject]++;
//         if (answer.user_answer == answer.correct) subjectCorrect[subject]++;
//       });
//       const totalQBankAttempted = qBankAnswers.length;

//       // Leaderboard
//       const [allQuizzes] = await db.execute(
//         "SELECT email, results FROM quizzes",
//       );
//       const userScores = {};
//       allQuizzes.forEach((quiz) => {
//         const results = JSON.parse(quiz.results);
//         let totalCorrect = 0;
//         let totalQuestions = 0;
//         Object.values(results).forEach((subject) => {
//           totalCorrect += subject.correct;
//           totalQuestions += subject.total;
//         });
//         if (!userScores[quiz.email])
//           userScores[quiz.email] = { correct: 0, total: 0, quizzes: 0 };
//         userScores[quiz.email].correct += totalCorrect;
//         userScores[quiz.email].total += totalQuestions;
//         userScores[quiz.email].quizzes += 1;
//       });
//       const [users] = await db.execute(
//         "SELECT * FROM users WHERE email NOT IN (?, ?)",
//         ["biologia.info1@gmail.com", "admin@medminds.com"],
//       );
//       const userMap = {};
//       users.forEach((u) => (userMap[u.email] = u));
//       const attemptedUsers = users.filter(
//         (user) => userScores[user.email] && userScores[user.email].quizzes > 0,
//       );
//       const fullLeaderboard = attemptedUsers
//         .map((user) => ({
//           email: user.email,
//           name: user.fullName,
//           district: user.district || "N/A",
//           quizzes: userScores[user.email]?.quizzes || 0,
//           totalMcqs: userScores[user.email]?.total || 0,
//           correctMcqs: userScores[user.email]?.correct || 0,
//           score: userScores[user.email]
//             ? Math.round(
//                 (userScores[user.email].correct /
//                   userScores[user.email].total) *
//                   10000,
//               ) / 100
//             : 0,
//         }))
//         .sort((a, b) => b.quizzes - a.quizzes);

//       fullLeaderboard.forEach((entry, index) => {
//         entry.overallRank = index + 1;
//       });

//       const districtGroups = {};
//       fullLeaderboard.forEach((entry) => {
//         if (!districtGroups[entry.district])
//           districtGroups[entry.district] = [];
//         districtGroups[entry.district].push(entry);
//       });
//       Object.keys(districtGroups).forEach((district) => {
//         districtGroups[district].sort((a, b) => b.quizzes - a.quizzes);
//         districtGroups[district].forEach((entry, index) => {
//           entry.districtRank = index + 1;
//         });
//       });

//       const leaderboard = fullLeaderboard.slice(0, 10);

//       const user = userMap[req.session.user];
//       const userEntry = fullLeaderboard.find(
//         (entry) => entry.email === req.session.user,
//       );
//       const userRank = userEntry ? userEntry.overallRank : "N/A";
//       const userDistrictRank = userEntry ? userEntry.districtRank : "N/A";

//       res.json({
//         totalQuizzes,
//         totalQuestions,
//         totalCorrect,
//         averageAccuracy,
//         streak,
//         qBankStreak,
//         weakAreas,
//         subjectAttempted,
//         subjectCorrect,
//         totalQBankAttempted,
//         subjectStats,
//         leaderboard,
//         userProfile: {
//           name: user.fullName,
//           fatherName: user.fatherName || "N/A",
//           district: user.district || "N/A",
//           overallRank: userRank,
//           districtRank: userDistrictRank,
//         },
//       });
//     } catch (err) {
//       res.status(500).json({ error: "Error fetching statics" });
//     }
//   });

//   app.get("/api/admin/students", async (req, res) => {
//     if (req.session.user !== "biologia.info1@gmail.com") {
//       return res.status(403).json({ error: "Unauthorized" });
//     }
//     try {
//       const [users] = await db.execute("SELECT * FROM users");
//       const students = users
//         .filter(
//           (u) =>
//             u.email !== "biologia.info1@gmail.com" &&
//             u.email !== "admin@medminds.com",
//         )
//         .map((u) => ({
//           fullName: u.fullName,
//           email: u.email,
//           password: u.password,
//           approved: u.approved,
//         }));
//       res.json(students);
//     } catch (err) {
//       res.status(500).json({ error: "Error fetching students" });
//     }
//   });

//   app.get("/api/admin/questions", async (req, res) => {
//     if (
//       req.session.user !== "biologia.info1@gmail.com" &&
//       req.session.user !== "admin@medminds.com"
//     ) {
//       return res.status(403).json({ error: "Unauthorized" });
//     }
//     try {
//       const [questions] = await db.execute("SELECT * FROM questions");
//       res.json(questions);
//     } catch (err) {
//       res.status(500).json({ error: "Error fetching questions" });
//     }
//   });

//   app.get("/api/admin/quizzes", async (req, res) => {
//     if (
//       req.session.user !== "biologia.info1@gmail.com" &&
//       req.session.user !== "admin@medminds.com"
//     ) {
//       return res.status(403).json({ error: "Unauthorized" });
//     }
//     try {
//       const [quizDefs] = await db.execute("SELECT * FROM quiz_definitions");
//       const [quizzes] = await db.execute(
//         "SELECT * FROM quizzes ORDER BY date DESC",
//       );
//       const [users] = await db.execute("SELECT email, fullName FROM users");
//       const userMap = {};
//       users.forEach((u) => (userMap[u.email] = u.fullName));
//       // Calculate ranks
//       const studentAverages = {};
//       quizzes.forEach((quiz) => {
//         const results = JSON.parse(quiz.results);
//         let totalCorrect = 0;
//         let totalQuestions = 0;
//         Object.values(results).forEach((subject) => {
//           totalCorrect += subject.correct;
//           totalQuestions += subject.total;
//         });
//         if (!studentAverages[quiz.email]) {
//           studentAverages[quiz.email] = { correct: 0, total: 0 };
//         }
//         studentAverages[quiz.email].correct += totalCorrect;
//         studentAverages[quiz.email].total += totalQuestions;
//       });
//       const averages = Object.entries(studentAverages)
//         .map(([email, data]) => ({
//           email,
//           average: data.total > 0 ? (data.correct / data.total) * 100 : 0,
//         }))
//         .sort((a, b) => b.average - a.average);
//       const ranks = {};
//       averages.forEach((student, index) => {
//         ranks[student.email] = index + 1;
//       });
//       const quizSubmissions = quizzes.map((quiz) => {
//         const results = JSON.parse(quiz.results);
//         const name = userMap[quiz.email] || quiz.email;
//         let resultStr = Object.keys(results)
//           .map(
//             (subject) =>
//               `${subject}: ${results[subject].correct}/${results[subject].total}`,
//           )
//           .join(", ");
//         return {
//           name,
//           rank: ranks[quiz.email] || "N/A",
//           date: quiz.date,
//           resultStr,
//           quizId: quiz.quiz_id,
//         };
//       });
//       res.json({ quizDefs, quizSubmissions });
//     } catch (err) {
//       res.status(500).json({ error: "Error fetching admin quizzes" });
//     }
//   });

//   app.get("/api/admin/quiz-list", async (req, res) => {
//     if (
//       req.session.user !== "biologia.info1@gmail.com" &&
//       req.session.user !== "admin@medminds.com"
//     ) {
//       return res.status(403).json({ error: "Unauthorized" });
//     }
//     try {
//       const [quizzes] = await db.execute(
//         "SELECT * FROM quiz_definitions ORDER BY id DESC",
//       );
//       res.json(quizzes);
//     } catch (err) {
//       res.status(500).json({ error: "Error fetching quizzes" });
//     }
//   });

//   app.get("/api/quiz-submissions/:quizId", async (req, res) => {
//     if (
//       req.session.user !== "biologia.info1@gmail.com" &&
//       req.session.user !== "admin@medminds.com"
//     ) {
//       return res.status(403).json({ error: "Unauthorized" });
//     }
//     const quizId = req.params.quizId;
//     try {
//       const [submissions] = await db.execute(
//         "SELECT q.email, q.score, q.total, q.date, u.fullName FROM quizzes q JOIN users u ON q.email = u.email WHERE q.quiz_id = ? ORDER BY q.date DESC",
//         [quizId],
//       );
//       res.json(submissions);
//     } catch (err) {
//       res.status(500).json({ error: "Error fetching submissions" });
//     }
//   });

//   app.get("/statics.html", async (req, res) => {
//     if (!req.session.user) {
//       return res.redirect("/dashboard.html");
//     }
//     let html = fs.readFileSync(path.join(__dirname, "statics.html"), "utf8");
//     const [userQuizzes] = await db.execute(
//       "SELECT * FROM quizzes WHERE email = ?",
//       [req.session.user],
//     );
//     const totalQuizzes = userQuizzes.length;
//     let totalQuestions = 0;
//     let totalCorrect = 0;
//     const subjects = [
//       "Biology",
//       "Chemistry",
//       "Physics",
//       "English",
//       "Logical Reasoning",
//     ];
//     const subjectStats = {};
//     subjects.forEach((s) => (subjectStats[s] = { correct: 0, total: 0 }));
//     userQuizzes.forEach((quiz) => {
//       const results = JSON.parse(quiz.results);
//       Object.keys(results).forEach((subject) => {
//         subjectStats[subject].correct += results[subject].correct;
//         subjectStats[subject].total += results[subject].total;
//       });
//       totalQuestions += Object.values(results).reduce(
//         (sum, s) => sum + s.total,
//         0,
//       );
//       totalCorrect += Object.values(results).reduce(
//         (sum, s) => sum + s.correct,
//         0,
//       );
//     });
//     const averageAccuracy =
//       totalQuestions > 0
//         ? ((totalCorrect / totalQuestions) * 100).toFixed(2)
//         : 0;

//     // Calculate streak
//     const dates = [
//       ...new Set(
//         userQuizzes.map((q) => new Date(q.date).toISOString().split("T")[0]),
//       ),
//     ].sort();
//     let streak = 0;
//     let currentDate = new Date().toISOString().split("T")[0];
//     while (dates.includes(currentDate)) {
//       streak++;
//       const d = new Date(currentDate);
//       d.setDate(d.getDate() - 1);
//       currentDate = d.toISOString().split("T")[0];
//     }

//     // Calculate Q-Bank streak
//     const [qBankAttempts] = await db.execute(
//       "SELECT date FROM q_bank_attempts WHERE email = ? ORDER BY date DESC",
//       [req.session.user],
//     );
//     const qDates = [...new Set(qBankAttempts.map((a) => a.date))].sort();
//     let qBankStreak = 0;
//     let currentDateQBank = new Date().toISOString().split("T")[0];
//     while (qDates.includes(currentDateQBank)) {
//       qBankStreak++;
//       const d = new Date(currentDateQBank);
//       d.setDate(d.getDate() - 1);
//       currentDateQBank = d.toISOString().split("T")[0];
//     }

//     // Calculate longest Q-Bank streak
//     let longestQBankStreak = 0;
//     if (qDates.length > 0) {
//       let tempStreak = 1;
//       for (let i = 1; i < qDates.length; i++) {
//         const prev = new Date(qDates[i - 1]);
//         const curr = new Date(qDates[i]);
//         const diff = (prev - curr) / (1000 * 60 * 60 * 24);
//         if (diff === 1) {
//           tempStreak++;
//           longestQBankStreak = Math.max(longestQBankStreak, tempStreak);
//         } else {
//           tempStreak = 1;
//         }
//       }
//       longestQBankStreak = Math.max(longestQBankStreak, 1); // at least 1 if any
//     }

//     // Weak areas: subjects with accuracy < 60%
//     const weakAreas = [];
//     subjects.forEach((subject) => {
//       const acc =
//         subjectStats[subject].total > 0
//           ? (subjectStats[subject].correct / subjectStats[subject].total) * 100
//           : 0;
//       if (acc < 60 && subjectStats[subject].total > 0) {
//         weakAreas.push(`${subject}: ${acc.toFixed(2)}%`);
//       }
//     });

//     // Calculate Q-Bank stats
//     const [qBankAnswers] = await db.execute(
//       "SELECT qa.question_id, qa.user_answer, q.subject, q.correct FROM q_bank_answers qa JOIN questions q ON qa.question_id = q.id WHERE qa.email = ?",
//       [req.session.user],
//     );
//     const subjectAttempted = {};
//     const subjectCorrect = {};
//     qBankAnswers.forEach((answer) => {
//       const subject = answer.subject;
//       if (!subjectAttempted[subject]) subjectAttempted[subject] = 0;
//       if (!subjectCorrect[subject]) subjectCorrect[subject] = 0;
//       subjectAttempted[subject]++;
//       if (answer.user_answer == answer.correct) subjectCorrect[subject]++;
//     });
//     const totalQBankAttempted = qBankAnswers.length;
//     const overallAverage = averageAccuracy;
//     const totalCorrectAnswers = totalCorrect;

//     let statsHtml = `<p>Total Quizzes Attempted: ${totalQuizzes}</p>
//             <p>Total Questions Attempted: ${totalQuestions}</p>
//             <p>Average Accuracy: ${averageAccuracy}%</p>
//             <p>Current Streak: ${streak} days</p>
//             <p>Current Q-Bank Streak: ${qBankStreak} days</p>
//             <p>Total Q-Bank Questions Attempted: ${totalQBankAttempted}</p>
//             <p>Overall Average Accuracy: ${overallAverage}%</p>
//             <p>Total Correct Answers: ${totalCorrectAnswers}</p>
//             <p>Subject-wise Q-Bank Attempts:</p>`;
//     Object.keys(subjectAttempted).forEach((subject) => {
//       const attempted = subjectAttempted[subject];
//       const bar = "|".repeat(Math.min(attempted, 20));
//       statsHtml += `<p>${subject}: [${bar}] ${attempted}</p>`;
//     });
//     statsHtml += "<p>Q-Bank Weak Areas:</p><ul>";
//     Object.keys(subjectAttempted).forEach((subject) => {
//       const acc = subjectCorrect[subject]
//         ? (subjectCorrect[subject] / subjectAttempted[subject]) * 100
//         : 0;
//       if (acc < 60) {
//         statsHtml += `<li>${subject}: ${acc.toFixed(2)}%</li>`;
//       }
//     });
//     statsHtml += "</ul><p>Weak Areas:</p><ul>";
//     if (weakAreas.length > 0) {
//       weakAreas.forEach((area) => (statsHtml += `<li>${area}</li>`));
//     } else {
//       statsHtml += `<li>No weak areas detected.</li>`;
//     }
//     statsHtml += "</ul>";
//     subjects.forEach((subject) => {
//       const acc =
//         subjectStats[subject].total > 0
//           ? (
//               (subjectStats[subject].correct / subjectStats[subject].total) *
//               100
//             ).toFixed(2)
//           : 0;
//       statsHtml += `<p>${subject} Accuracy: ${acc}% (${subjectStats[subject].correct}/${subjectStats[subject].total})</p>`;
//     });

//     // Generate combined subject performance bar chart
//     let totalSubjectQuestions = subjects.reduce(
//       (sum, subject) => sum + subjectStats[subject].total,
//       0,
//     );
//     let combinedBarHtml = '<div class="combined-bar-container">';
//     combinedBarHtml += '<div class="combined-progress-bar">';

//     const subjectColors = {
//       Biology: "#10b981",
//       Chemistry: "#f59e0b",
//       Physics: "#ef4444",
//       English: "#8b5cf6",
//       "Logical Reasoning": "#06b6d4",
//     };

//     subjects.forEach((subject) => {
//       if (subjectStats[subject].total > 0) {
//         const percentage =
//           (subjectStats[subject].total / totalSubjectQuestions) * 100;
//         const accuracy = (
//           (subjectStats[subject].correct / subjectStats[subject].total) *
//           100
//         ).toFixed(1);
//         combinedBarHtml += `<div class="subject-segment" style="width: ${percentage}%; background: ${subjectColors[subject] || "#6b7280"};" title="${subject}: ${accuracy}%"></div>`;
//       }
//     });

//     combinedBarHtml += '</div><div class="legend">';

//     subjects.forEach((subject) => {
//       if (subjectStats[subject].total > 0) {
//         const accuracy = (
//           (subjectStats[subject].correct / subjectStats[subject].total) *
//           100
//         ).toFixed(1);
//         combinedBarHtml += `<div class="legend-item">
//                     <span class="legend-color" style="background: ${subjectColors[subject] || "#6b7280"};"></span>
//                     <span>${subject}: ${accuracy}%</span>
//                 </div>`;
//       }
//     });

//     combinedBarHtml += "</div></div>";

//     // Calculate leaderboard based on best individual quiz score
//     const [allQuizzes] = await db.execute("SELECT email, results FROM quizzes");
//     const userScores = {};
//     allQuizzes.forEach((quiz) => {
//       const results = JSON.parse(quiz.results);
//       let totalCorrect = 0;
//       let totalQuestions = 0;
//       Object.values(results).forEach((subject) => {
//         totalCorrect += subject.correct;
//         totalQuestions += subject.total;
//       });
//       const quizScore =
//         totalQuestions > 0
//           ? Math.round((totalCorrect / totalQuestions) * 10000) / 100
//           : 0;

//       if (!userScores[quiz.email]) {
//         userScores[quiz.email] = {
//           bestScore: quizScore,
//           totalCorrect: totalCorrect,
//           totalQuestions: totalQuestions,
//           quizzes: 1,
//         };
//       } else {
//         // Update if this quiz score is better
//         if (quizScore > userScores[quiz.email].bestScore) {
//           userScores[quiz.email].bestScore = quizScore;
//           userScores[quiz.email].totalCorrect = totalCorrect;
//           userScores[quiz.email].totalQuestions = totalQuestions;
//         }
//         userScores[quiz.email].quizzes += 1;
//       }
//     });
//     const [users] = await db.execute(
//       "SELECT * FROM users WHERE email NOT IN (?, ?)",
//       ["biologia.info1@gmail.com", "admin@medminds.com"],
//     );
//     const userMap = {};
//     users.forEach((u) => (userMap[u.email] = u));
//     const attemptedUsers = users.filter(
//       (user) => userScores[user.email] && userScores[user.email].quizzes > 0,
//     );
//     const fullLeaderboard = attemptedUsers
//       .map((user) => ({
//         email: user.email,
//         name: user.fullName,
//         district: user.district || "N/A",
//         quizzes: userScores[user.email]?.quizzes || 0,
//         totalMcqs: userScores[user.email]?.totalQuestions || 0,
//         correctMcqs: userScores[user.email]?.totalCorrect || 0,
//         score: userScores[user.email]?.bestScore || 0,
//       }))
//       .sort((a, b) => b.score - a.score);

//     // Assign overall ranks
//     fullLeaderboard.forEach((entry, index) => {
//       entry.overallRank = index + 1;
//     });

//     // Calculate district ranks
//     const districtGroups = {};
//     fullLeaderboard.forEach((entry) => {
//       if (!districtGroups[entry.district]) districtGroups[entry.district] = [];
//       districtGroups[entry.district].push(entry);
//     });
//     Object.keys(districtGroups).forEach((district) => {
//       districtGroups[district].sort((a, b) => b.score - a.score);
//       districtGroups[district].forEach((entry, index) => {
//         entry.districtRank = index + 1;
//       });
//     });

//     const leaderboard = fullLeaderboard.slice(0, 10); // Top 10 for display

//     let leadershipHtml = "";
//     leaderboard.forEach((entry, index) => {
//       leadershipHtml += `<tr>
//                 <td style="padding: 10px; border: 1px solid #ddd;">${index + 1}</td>
//                 <td style="padding: 10px; border: 1px solid #ddd;">${entry.name}</td>
//                 <td style="padding: 10px; border: 1px solid #ddd;">${entry.district}</td>
//                 <td style="padding: 10px; border: 1px solid #ddd;">${entry.districtRank}</td>
//                 <td style="padding: 10px; border: 1px solid #ddd;">${entry.score}%</td>
//                 <td style="padding: 10px; border: 1px solid #ddd;">${entry.quizzes}</td>
//                 <td style="padding: 10px; border: 1px solid #ddd;">${entry.totalMcqs}</td>
//             </tr>`;
//     });

//     let leaderboardHtml = "";
//     leaderboard.forEach((entry, index) => {
//       leaderboardHtml += `<div class="leaderboard-card">
//                 <h3>${entry.name}</h3>
//                 <p class="rank">Rank: ${index + 1}</p>
//                 <p>District: ${entry.district}</p>
//                 <p>Quizzes Attempted: <span class="count" data-target="${entry.quizzes}">0</span></p>
//                 <p>Total MCQs: <span class="count" data-target="${entry.totalMcqs}">0</span></p>
//                 <p>Correct MCQs: <span class="count" data-target="${entry.correctMcqs}">0</span></p>
//                 <p>Average Score: <span class="count" data-target="${entry.score}">0</span>%</p>
//             </div>`;
//     });
//     html = html.replace(
//       '<div id="stats-content">\n        <!-- Stats will be inserted here -->\n    </div>',
//       `<div id="stats-content">${statsHtml}</div>`,
//     );
//     const user = userMap[req.session.user];
//     const userEntry = fullLeaderboard.find(
//       (entry) => entry.email === req.session.user,
//     );
//     const userRank = userEntry ? userEntry.overallRank : "N/A";
//     const userDistrictRank = userEntry ? userEntry.districtRank : "N/A";
//     html = html.replace(
//       "<body>",
//       '<body><section class="profile"><h2>Your Profile</h2><p>Name: ' +
//         user.fullName +
//         "</p><p>Father Name: " +
//         (user.fatherName || "N/A") +
//         "</p><p>District: " +
//         (user.district || "N/A") +
//         "</p><p>Overall Rank: " +
//         userRank +
//         "</p><p>District Rank: " +
//         userDistrictRank +
//         "</p></section>",
//     );
//     html = html.replace(
//       "<!-- Leadership chart will be dynamically inserted here -->",
//       leadershipHtml,
//     );
//     html = html.replace(
//       "<!-- Detailed stats cards will be dynamically inserted here -->",
//       leaderboardHtml,
//     );
//     // Update streak data
//     html = html.replace('data-target="7"', `data-target="${qBankStreak}"`);
//     html = html.replace(
//       'data-target="14"',
//       `data-target="${longestQBankStreak}"`,
//     );
//     html = html.replace(
//       '7-day streak: <span class="achievement">✓</span>',
//       `7-day streak: <span class="achievement">${longestQBankStreak >= 7 ? "✓" : "✗"}</span>`,
//     );
//     html = html.replace(
//       '14-day streak: <span class="achievement">✗</span>',
//       `14-day streak: <span class="achievement">${longestQBankStreak >= 14 ? "✓" : "✗"}</span>`,
//     );
//     html = html.replace(
//       '30-day streak: <span class="achievement">✗</span>',
//       `30-day streak: <span class="achievement">${longestQBankStreak >= 30 ? "✓" : "✗"}</span>`,
//     );

//     // Replace subject performance section with dynamic combined bar chart
//     const subjectPerformancePattern =
//       /<h2>Subject Performance<\/h2>\s*<div id="subject-performance">[\s\S]*?<\/div>/;
//     html = html.replace(
//       subjectPerformancePattern,
//       `<h2>Subject Performance</h2>\n    <div id="subject-performance">\n        ${combinedBarHtml}\n    </div>`,
//     );

//     res.send(html);
//   });

// })();
