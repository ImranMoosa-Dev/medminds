import { Router } from "express";

const adminRoutes = Router();
adminRoutes.get("/api/admin/notes", async (req, res) => {
  if (
    req.session.user !== "biologia.info1@gmail.com" &&
    req.session.user !== "admin@medminds.com"
  ) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  try {
    const [notes] = await db.execute(
      "SELECT * FROM notes ORDER BY uploaded_at DESC",
    );
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: "Error fetching notes" });
  }
});

app.get("/get-question/:id", async (req, res) => {
  if (
    req.session.user === "biologia.info1@gmail.com" ||
    req.session.user === "admin@medminds.com"
  ) {
    const { id } = req.params;
    try {
      const [questions] = await db.execute(
        "SELECT * FROM questions WHERE id = ?",
        [id],
      );
      if (questions.length > 0) {
        res.json({ success: true, question: questions[0] });
      } else {
        res.status(404).json({ success: false, message: "Question not found" });
      }
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Error fetching question" });
    }
  } else {
    res.status(403).json({
      success: false,
      message: "Unauthorized",
      sessionUser: req.session.user,
    });
  }
});

adminRoutes.get("/api/admin/updates", async (req, res) => {
  if (
    req.session.user !== "biologia.info1@gmail.com" &&
    req.session.user !== "admin@medminds.com"
  ) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const [updates] = await db.execute(
      `SELECT id, title, content, image, published, created_at
             FROM updates
             ORDER BY created_at DESC`,
    );

    res.json(updates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching updates" });
  }
});

// admin menu
adminRoutes.get("/admin-menu.html", async (req, res) => {
  if (
    req.session.user === "biologia.info1@gmail.com" ||
    req.session.user === "admin@medminds.com"
  ) {
    let html = fs.readFileSync(path.join(__dirname, "admin-menu.html"), "utf8");
    if (req.session.user !== "biologia.info1@gmail.com") {
      html = html.replace(
        '<li><a href="/admin/students">Manage Students</a></li>',
        "",
      );
    }
    let message = "";
    if (req.query.success === "mdcat") {
      message =
        '<p style="color: green; font-weight: bold;">MDCAT date updated successfully!</p>';
    } else if (req.query.success === "syllabus") {
      message =
        '<p style="color: green; font-weight: bold;">Syllabus uploaded successfully!</p>';
    } else if (req.query.error) {
      message =
        '<p style="color: red; font-weight: bold;">Error: ' +
        req.query.error +
        "</p>";
    }
    html = html.replace("<h2>Admin Menu</h2>", "<h2>Admin Menu</h2>" + message);
    res.send(html);
  } else {
    res.redirect("/dashboard.html");
  }
});

// admin questions
adminRoutes.get("/admin-questions.html", (req, res) => {
  if (
    req.session.user === "biologia.info1@gmail.com" ||
    req.session.user === "admin@medminds.com"
  ) {
    res.sendFile(path.join(__dirname, "admin-questions.html"));
  } else {
    res.redirect("/dashboard.html");
  }
});

// admin quizzes
adminRoutes.get("/admin-quizzes.html", (req, res) => {
  if (
    req.session.user === "biologia.info1@gmail.com" ||
    req.session.user === "admin@medminds.com"
  ) {
    res.sendFile(path.join(__dirname, "admin-quizzes.html"));
  } else {
    res.redirect("/dashboard.html");
  }
});

// admin quiz-results
adminRoutes.get("/api/admin/quiz-results/:id", async (req, res) => {
  if (
    req.session.user !== "biologia.info1@gmail.com" &&
    req.session.user !== "admin@medminds.com"
  ) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  const quizId = req.params.id;
  try {
    const [quizResults] = await db.execute(
      "SELECT * FROM quizzes WHERE quiz_id = ? ORDER BY date DESC",
      [quizId],
    );
    const [users] = await db.execute("SELECT email, fullName FROM users");
    const userMap = {};
    users.forEach((u) => (userMap[u.email] = u.fullName));
    const studentAverages = {};
    quizResults.forEach((quiz) => {
      const results = JSON.parse(quiz.results);
      let totalCorrect = 0;
      let totalQuestions = 0;
      Object.values(results).forEach((subject) => {
        totalCorrect += subject.correct;
        totalQuestions += subject.total;
      });
      if (!studentAverages[quiz.email]) {
        studentAverages[quiz.email] = { correct: 0, total: 0 };
      }
      studentAverages[quiz.email].correct += totalCorrect;
      studentAverages[quiz.email].total += totalQuestions;
    });
    const averages = Object.entries(studentAverages)
      .map(([email, data]) => ({
        email,
        average: data.total > 0 ? (data.correct / data.total) * 100 : 0,
      }))
      .sort((a, b) => b.average - a.average);
    const ranks = {};
    averages.forEach((student, index) => {
      ranks[student.email] = index + 1;
    });
    const results = quizResults.map((quiz) => {
      const resultsParsed = JSON.parse(quiz.results);
      const name = userMap[quiz.email] || quiz.email;
      let totalCorrect = 0;
      let totalQuestions = 0;
      Object.values(resultsParsed).forEach((subject) => {
        totalCorrect += subject.correct;
        totalQuestions += subject.total;
      });
      const score =
        totalQuestions > 0
          ? Math.round((totalCorrect / totalQuestions) * 10000) / 100
          : 0;
      let resultStr = Object.keys(resultsParsed)
        .map(
          (subject) =>
            `${subject}: ${resultsParsed[subject].correct}/${resultsParsed[subject].total}`,
        )
        .join(", ");
      return {
        name,
        score,
        date: quiz.date,
        resultStr,
      };
    });
    res.json({ quizId, results });
  } catch (err) {
    res.status(500).json({ error: "Error fetching quiz results" });
  }
});
export default adminRoutes;
