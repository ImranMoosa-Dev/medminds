import db from "../config/MedMindsDB.js";

export const getLeaderboardInfoController = async (req, res) => {
  try {
    // =========================
    // 1. Get quiz attempts
    // =========================
    const [attempts] = await db.execute(`
      SELECT
        qa.id,
        qa.user_id,
        qa.quiz_id,
        qa.score,
        qa.total_questions,
        qa.answers,
        qa.questions_json,
        qa.created_at,

        u.fullName,
        u.district,

        q.name AS quiz_name,
        q.quiz_order

      FROM quiz_attempts qa
      LEFT JOIN users u ON u.id = qa.user_id
      LEFT JOIN quizzes q ON q.id = qa.quiz_id

      WHERE qa.completed = TRUE
      ORDER BY qa.created_at DESC
    `);

    // =========================
    // 2. Extract quiz IDs
    // =========================
    const quizIds = [
      ...new Set(attempts.map((a) => a.quiz_id).filter(Boolean)),
    ];

    let questions = [];

    // =========================
    // 3. Get questions (with subject name)
    // =========================
    if (quizIds.length > 0) {
      const placeholders = quizIds.map(() => "?").join(",");

      const [questionRows] = await db.execute(
        `
        SELECT
          q.*,
          s.name AS subject_name
        FROM questions q
        LEFT JOIN subjects s ON s.id = q.subject_id
        WHERE q.quiz_id IN (${placeholders})
        `,
        quizIds,
      );

      questions = questionRows;
    }

    // =========================
    // 4. User + Quiz maps
    // =========================
    const users = {};
    const quizzes = {};

    attempts.forEach((row) => {
      users[row.user_id] = {
        name: row.fullName || "Anonymous",
        district: row.district || "—",
      };

      quizzes[row.quiz_id] = {
        name: row.quiz_name || "Quiz",
        order: row.quiz_order || 0,
      };
    });

    // =========================
    // 5. Build quiz-question map
    // =========================
    const quizQuestionMap = {};

    questions.forEach((q) => {
      const quizId = String(q.quiz_id);

      if (!quizQuestionMap[quizId]) {
        quizQuestionMap[quizId] = [];
      }

      quizQuestionMap[quizId].push(q);
    });

    // =========================
    // 6. Subject score calculation
    // =========================
    const subjectScores = {};

    attempts.forEach((attempt) => {
      let answers = attempt.answers;
      let quizQuestions = attempt.questions_json;

      // parse JSON safely
      try {
        if (typeof answers === "string") answers = JSON.parse(answers);
      } catch {
        answers = {};
      }

      try {
        if (typeof quizQuestions === "string") {
          quizQuestions = JSON.parse(quizQuestions);
        }
      } catch {
        quizQuestions = [];
      }

      if (!answers || !quizQuestions?.length) return;

      const uid = attempt.user_id;
      const quizId = String(attempt.quiz_id);

      if (!subjectScores[uid]) subjectScores[uid] = {};
      if (!subjectScores[uid][quizId]) subjectScores[uid][quizId] = {};

      // =========================
      // 7. Compare attempt questions
      // =========================
      quizQuestions.forEach((question, index) => {
        const subject = question.subject_name || "Unknown";

        const userAnswer = answers[String(index)] ?? answers[index];

        if (userAnswer === undefined) return;

        if (!subjectScores[uid][quizId][subject]) {
          subjectScores[uid][quizId][subject] = {
            correct: 0,
            total: 0,
          };
        }

        subjectScores[uid][quizId][subject].total++;

        if (Number(userAnswer) === Number(question.correct)) {
          subjectScores[uid][quizId][subject].correct++;
        }
      });
    });

    // =========================
    // 8. Response
    // =========================
    return res.status(200).send({
      success: true,
      currentUserId: req.user?.id || null,
      attempts,
      users,
      quizzes,
      subjectScores,
    });
  } catch (error) {
    console.error("Leaderboard Error:", error);

    return res.status(500).send({
      success: false,
      message: "Error loading leaderboard",
      error: error.message,
    });
  }
};
