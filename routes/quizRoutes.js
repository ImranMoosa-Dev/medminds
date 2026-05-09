import { Router } from "express";
import { createQuizController } from "../controllers/quizControllers.js";

const quizRoutes = Router();

// get quiz
quizRoutes.get("/quiz.html", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/dashboard.html");
  }
  res.sendFile(path.join(__dirname, "quiz.html"));
});

// get single quiz
quizRoutes.get("/quiz/:id", (req, res) => {
  // Allow access to quiz page even if not logged in for shared links
  // Access control will be handled by the API
  res.sendFile(path.join(__dirname, "quiz.html"));
});

quizRoutes.delete("/delete-quiz/:qid", async (req, res) => {
  if (
    req.session.user === "biologia.info1@gmail.com" ||
    req.session.user === "admin@medminds.com"
  ) {
    const { id } = req.body;
    try {
      await db.execute("DELETE FROM quiz_definitions WHERE id = ?", [id]);
      res.redirect("/admin/quizzes");
    } catch (err) {
      res.status(500).send("Error deleting quiz");
    }
  } else {
    res.redirect("/dashboard.html");
  }
});

// quiz review
quizRoutes.get("/quiz-review", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/dashboard.html");
  }
  // Fetch the latest quiz result for the user
  const [latestQuiz] = await db.execute(
    "SELECT * FROM quizzes WHERE email = ? ORDER BY date DESC LIMIT 1",
    [req.session.user],
  );
  let results = {};
  let timeTaken = 0;
  let totalCorrect = 0;
  let totalQuestions = 0;
  if (latestQuiz.length > 0) {
    results = JSON.parse(latestQuiz[0].results);
    timeTaken = results.timeTaken || 0;
    Object.values(results).forEach((subject) => {
      if (typeof subject === "object" && subject.correct !== undefined) {
        totalCorrect += subject.correct;
        totalQuestions += subject.total;
      }
    });
  }
  const wrongQuestions = req.session.wrongQuestions || [];
  let html = `<html><head><title>Quiz Review</title><style>body{font-family:Arial,sans-serif;margin:20px;}.correct{color:green;}.wrong{color:red;}</style></head><body><h1>Quiz Results</h1>`;
  html += `<p><strong>Total Questions:</strong> ${totalQuestions}</p>`;
  html += `<p><strong>Correct Answers:</strong> ${totalCorrect}</p>`;
  html += `<p><strong>Score:</strong> ${totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0}%</p>`;
  html += `<p><strong>Time Taken:</strong> ${Math.floor(timeTaken / 60)}:${(timeTaken % 60).toString().padStart(2, "0")}</p>`;
  html += "<h2>Wrong Questions</h2>";
  if (wrongQuestions.length === 0) {
    html += "<p>Congratulations! You got all questions correct.</p>";
  } else {
    wrongQuestions.forEach((q, index) => {
      html += `<div style="margin-bottom:20px;"><h3>${index + 1}. ${q.question}</h3>`;
      q.options.forEach((opt, i) => {
        let className = "";
        if (i === q.correct) className = "correct";
        else if (q.userAnswer !== null && i === q.userAnswer)
          className = "wrong";
        html += `<p class="${className}">${String.fromCharCode(65 + i)}. ${opt}</p>`;
      });
      html += "</div>";
    });
  }
  html += '<a href="/statics.html">View Statistics</a></body></html>';
  res.send(html);
});

// create quiz
quizRoutes.post("/create", createQuizController);
export default quizRoutes;
