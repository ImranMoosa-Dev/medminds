import { Router } from "express";
import { submitQuizController } from "../controllers/studentControllers";

const studentRoutes = Router();

// Submit Quiz
studentRoutes.post("/submit-quiz", submitQuizController);

studentRoutes.get("/student-notes.html", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/dashboard.html");
  }
  res.sendFile(path.join(__dirname, "student-notes.html"));
});

// API endpoint for dynamic statistics
studentRoutes.get("/statistics", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const [userQuizzes] = await db.execute(
      "SELECT * FROM quizzes WHERE email = ?",
      [req.session.user],
    );
    const totalQuizzes = userQuizzes.length;
    let totalQuestions = 0;
    let totalCorrect = 0;
    const subjects = [
      "Biology",
      "Chemistry",
      "Physics",
      "English",
      "Logical Reasoning",
    ];
    const subjectStats = {};
    subjects.forEach((s) => (subjectStats[s] = { correct: 0, total: 0 }));
    userQuizzes.forEach((quiz) => {
      const results = JSON.parse(quiz.results);
      Object.keys(results).forEach((subject) => {
        subjectStats[subject].correct += results[subject].correct;
        subjectStats[subject].total += results[subject].total;
      });
      totalQuestions += Object.values(results).reduce(
        (sum, s) => sum + s.total,
        0,
      );
      totalCorrect += Object.values(results).reduce(
        (sum, s) => sum + s.correct,
        0,
      );
    });
    const averageAccuracy =
      totalQuestions > 0
        ? ((totalCorrect / totalQuestions) * 100).toFixed(2)
        : 0;

    // Calculate login streak
    const [loginDates] = await db.execute(
      "SELECT date FROM login_dates WHERE email = ? ORDER BY date DESC",
      [req.session.user],
    );
    const loginDateStrings = [...new Set(loginDates.map((l) => l.date))].sort();
    let streak = 0;
    let currentDate = new Date().toISOString().split("T")[0];
    while (loginDateStrings.includes(currentDate)) {
      streak++;
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      currentDate = d.toISOString().split("T")[0];
    }

    // Calculate Q-Bank stats
    const [qBankAnswers] = await db.execute(
      "SELECT qa.question_id, qa.user_answer, q.subject, q.correct FROM q_bank_answers qa JOIN questions q ON qa.question_id = q.id WHERE qa.email = ?",
      [req.session.user],
    );
    const subjectAttempted = {};
    const subjectCorrect = {};
    qBankAnswers.forEach((answer) => {
      const subject = answer.subject;
      if (!subjectAttempted[subject]) subjectAttempted[subject] = 0;
      if (!subjectCorrect[subject]) subjectCorrect[subject] = 0;
      subjectAttempted[subject]++;
      if (answer.user_answer == answer.correct) subjectCorrect[subject]++;
    });
    const totalQBankAttempted = qBankAnswers.length;

    // Calculate leaderboard data
    const [allQuizzes] = await db.execute("SELECT email, results FROM quizzes");
    const userScores = {};
    allQuizzes.forEach((quiz) => {
      const results = JSON.parse(quiz.results);
      let totalCorrectQuiz = 0;
      let totalQuestionsQuiz = 0;
      Object.values(results).forEach((subject) => {
        totalCorrectQuiz += subject.correct;
        totalQuestionsQuiz += subject.total;
      });
      const quizScore =
        totalQuestionsQuiz > 0
          ? Math.round((totalCorrectQuiz / totalQuestionsQuiz) * 10000) / 100
          : 0;

      if (!userScores[quiz.email]) {
        userScores[quiz.email] = {
          bestScore: quizScore,
          totalCorrect: totalCorrectQuiz,
          totalQuestions: totalQuestionsQuiz,
          quizzes: 1,
        };
      } else {
        if (quizScore > userScores[quiz.email].bestScore) {
          userScores[quiz.email].bestScore = quizScore;
          userScores[quiz.email].totalCorrect = totalCorrectQuiz;
          userScores[quiz.email].totalQuestions = totalQuestionsQuiz;
        }
        userScores[quiz.email].quizzes += 1;
      }
    });

    const [users] = await db.execute(
      "SELECT * FROM users WHERE email NOT IN (?, ?)",
      ["biologia.info1@gmail.com", "admin@medminds.com"],
    );
    const userMap = {};
    users.forEach((u) => (userMap[u.email] = u));
    const attemptedUsers = users.filter(
      (user) => userScores[user.email] && userScores[user.email].quizzes > 0,
    );
    const fullLeaderboard = attemptedUsers
      .map((user) => ({
        email: user.email,
        name: user.fullName,
        district: user.district || "N/A",
        quizzes: userScores[user.email]?.quizzes || 0,
        totalMcqs: userScores[user.email]?.totalQuestions || 0,
        correctMcqs: userScores[user.email]?.totalCorrect || 0,
        score: userScores[user.email]?.bestScore || 0,
      }))
      .sort((a, b) => b.score - a.score);

    fullLeaderboard.forEach((entry, index) => {
      entry.overallRank = index + 1;
    });

    const districtGroups = {};
    fullLeaderboard.forEach((entry) => {
      if (!districtGroups[entry.district]) districtGroups[entry.district] = [];
      districtGroups[entry.district].push(entry);
    });
    Object.keys(districtGroups).forEach((district) => {
      districtGroups[district].sort((a, b) => b.score - a.score);
      districtGroups[district].forEach((entry, index) => {
        entry.districtRank = index + 1;
      });
    });

    const leaderboard = fullLeaderboard.slice(0, 10);

    res.json({
      streak: streak,
      totalQuizzes: totalQuizzes,
      totalQuestions: totalQuestions,
      totalCorrect: totalCorrect,
      averageAccuracy: averageAccuracy,
      totalQBankAttempted: totalQBankAttempted,
      subjectStats: subjectStats,
      subjectAttempted: subjectAttempted,
      subjectCorrect: subjectCorrect,
      leaderboard: leaderboard,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Error fetching statistics" });
  }
});
// logout user
app.get("/logout", async (req, res) => {
  const email = req.session.user;
  if (email) {
    await db.execute("UPDATE users SET loggedIn = ? WHERE email = ?", [
      false,
      email,
    ]);
  }
  req.session.destroy();
  res.redirect("/dashboard.html");
});
export default studentRoutes;
