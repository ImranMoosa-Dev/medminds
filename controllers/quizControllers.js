import db from "../config/MedMindsDB.js";

// GET ALL QUIZZES
export const getAllQuizzesController = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT *
      FROM quizzes
      WHERE is_published = 1
      ORDER BY quiz_order ASC
    `);

    res.status(200).send({
      success: true,
      message: "Quizzes fetched successfully",
      quizzes: rows,
    });
  } catch (error) {
    console.error("getAllQuizzes error:", error);
    res.status(500).send({
      success: false,
      message: "Error fetching quizzes",
    });
  }
};

// GET SINGLE QUIZ BY ID CONTROLLER
export const getQuizByIdController = async (req, res) => {
  const { qId } = req.params;
  try {
    const [rows] = await db.execute(`
      SELECT *
      FROM quizzes
      WHERE id = ${qId}
    `);

    return res.status(200).send({
      success: true,
      message: "Quiz fetched successfully",
      quiz: rows[0] || null,
    });
  } catch (error) {
    console.error("get Single Quiz error:", error);
    return res.status(500).send({
      success: false,
      message: "Error fetching Single quiz",
    });
  }
};

// create quiz
export const createQuizController = async (req, res) => {
  if (req.session.user) {
    let {
      name,
      subject,
      topics,
      duration,
      totalMcqs,
      questions: selectedQuestions,
      startTime,
      endTime,
      testType,
    } = req.body;

    // Normalize questions array
    let questionsArray = [];
    if (Array.isArray(selectedQuestions)) {
      questionsArray = selectedQuestions.map(Number);
    } else if (selectedQuestions) {
      questionsArray = [Number(selectedQuestions)];
    }

    // Safety defaults (PREVENT undefined crash)
    name = name || "";
    subject = subject || "";
    topics = topics || "";
    duration = parseInt(duration) || 0;
    totalMcqs = parseInt(totalMcqs) || questionsArray.length;
    startTime = startTime || new Date();
    endTime = endTime || new Date(Date.now() + 24 * 60 * 60 * 1000); // +1 day
    testType = testType || "General";

    if (!questionsArray.length) {
      return res
        .status(400)
        .json({ success: false, message: "No questions selected" });
    }

    if (questionsArray.length !== totalMcqs) {
      return res.status(400).json({
        success: false,
        message: `You selected ${questionsArray.length} questions but total MCQs is ${totalMcqs}`,
      });
    }

    try {
      await db.execute(
        `INSERT INTO quiz_definitions 
                 (name, subject, topics, duration, totalMcqs, questions, start_time, end_time, testType) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          subject,
          topics,
          duration,
          totalMcqs,
          JSON.stringify(questionsArray),
          startTime,
          endTime,
          testType,
        ],
      );

      res.json({ success: true, message: "Quiz created successfully" });
    } catch (err) {
      console.error("Error creating quiz:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  } else {
    res.status(403).json({ success: false, message: "Unauthorized" });
  }
};

// get quiz and other required details for starting custom quiz

export const startQuizController = async (req, res) => {
  try {
    const { quizId } = req.params;

    // Assuming auth middleware attaches user
    const userId = req.user.id;

    // ============================
    // 1. Get Quiz
    // ============================
    const [quizRows] = await db.execute(
      `
      SELECT 
        id,
        name,
        description,
        duration,
        totalMcqs,
        passing_marks
      FROM quizzes
      WHERE id = ?
      LIMIT 1
      `,
      [quizId],
    );

    if (quizRows.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Quiz not found",
      });
    }

    const quiz = quizRows[0];

    // ============================
    // 2. Get Questions
    // ============================
    const [questionRows] = await db.execute(
      `
      SELECT
        id,
        question,
        opt1 AS option_a,
        opt2 AS option_b,
        opt3 AS option_c,
        opt4 AS option_d,
        correct,
        explanation,
        image
      FROM questions
      WHERE quiz_id = ?
      ORDER BY id ASC
      `,
      [quizId],
    );

    if (questionRows.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No questions found for this quiz",
      });
    }

    // ============================
    // 3. Check Existing Attempt
    // ============================
    const [attemptRows] = await db.execute(
      `
      SELECT *
      FROM quiz_attempts
      WHERE user_id = ?
      AND quiz_id = ?
      AND completed = 0
      ORDER BY id DESC
      LIMIT 1
      `,
      [userId, quizId],
    );

    let attempt;

    // ============================
    // 4. Create Attempt If Needed
    // ============================
    if (attemptRows.length === 0) {
      const initialTime =
        quiz.duration > 0 ? quiz.duration * 60 : questionRows.length * 60;

      const [insertResult] = await db.execute(
        `
  INSERT INTO quiz_attempts (
    user_id,
    quiz_id,
    questions_json,
    score,
    total_questions,
    answers,
    current_question,
    time_left,
    completed
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
        [
          userId,
          quizId,
          JSON.stringify(questionRows), // ✅ FIXED
          0,
          questionRows.length, // ✅ FIXED
          JSON.stringify({}),
          0,
          initialTime, // ✅ FIXED
          false,
        ],
      );

      attempt = {
        id: insertResult.insertId,
        answers: {},
        current_question: 0,
        time_left: initialTime,
        completed: 0,
      };
    } else {
      attempt = {
        ...attemptRows[0],
        answers: attemptRows[0].answers
          ? JSON.parse(attemptRows[0].answers)
          : {},
      };
    }

    // ============================
    // 5. Response
    // ============================
    return res.status(200).send({
      success: true,
      message: "Quiz loaded successfully",

      quiz: {
        id: quiz.id,
        name: quiz.name,
        description: quiz.description,
        duration: quiz.duration,
        totalMcqs: quiz.totalMcqs,
        passingMarks: quiz.passing_marks,
      },

      questions: questionRows,

      attempt: {
        id: attempt.id,
        answers: attempt.answers,
        current_question: attempt.current_question,
        time_left: attempt.time_left,
      },
    });
  } catch (error) {
    console.error("Start Quiz Error:", error);

    return res.status(500).send({
      success: false,
      message: "Error loading quiz",
      error: error.message,
    });
  }
};

// save quiz progress
export const saveQuizProgressController = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const {
      answers = {},
      current_question = 0,
      time_left = 0,
    } = req.body || {};

    const safeAnswers = answers ? JSON.stringify(answers) : JSON.stringify({});
    const safeQuestion = current_question ?? 0;
    const safeTime = time_left ?? 0;

    const [result] = await db.execute(
      `
      UPDATE quiz_attempts 
      SET answers = ?, current_question = ?, time_left = ?
      WHERE id = ? AND user_id = ?
      `,
      [safeAnswers, safeQuestion, safeTime, quizId, userId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found or access denied",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Progress saved",
    });
  } catch (error) {
    console.error("Save Quiz Progress Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save progress",
    });
  }
};

// submit quiz controller
export const submitQuizController = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers = {}, time_taken_seconds = 0 } = req.body || {};
    const userId = req.user.id;

    const [rows] = await db.execute(
      `SELECT questions_json FROM quiz_attempts WHERE id = ? AND user_id = ?`,
      [attemptId, userId],
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Attempt not found" });
    }

    const questions = JSON.parse(rows[0].questions_json || "[]");

    // collect question ids and fetch correct answers from questions table
    const qIds = questions.map((q) => q.id).filter(Boolean);
    let correctMap = {};

    if (qIds.length) {
      const placeholders = qIds.map(() => "?").join(",");
      const [qrows] = await db.execute(
        `SELECT id, correct FROM questions WHERE id IN (${placeholders})`,
        qIds,
      );

      qrows.forEach((r) => {
        correctMap[r.id] = Number(r.correct);
      });
    }

    const optToNum = { a: 1, b: 2, c: 3, d: 4 };

    let score = 0;

    questions.forEach((q, i) => {
      const given = answers[String(i)];
      const givenNum = given ? optToNum[String(given).toLowerCase()] : null;
      const correctNum = correctMap[q.id] || null;

      if (givenNum && correctNum && givenNum === correctNum) score++;
    });

    const total = questions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    await db.execute(
      `UPDATE quiz_attempts SET answers = ?, score = ?, total_questions = ?, percentage = ?, time_left = 0, completed = 1, attempt_status = 'submitted', submitted_at = NOW() WHERE id = ? AND user_id = ?`,
      [JSON.stringify(answers), score, total, percentage, attemptId, userId],
    );

    return res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      result: { score, total, percentage },
    });
  } catch (error) {
    console.error("Submit Quiz Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Submission failed" });
  }
};

// get quiz attempt result
export const getQuizResultController = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const [rows] = await db.execute(
      `
      SELECT qa.*, u.fullName
      FROM quiz_attempts qa
      JOIN users u ON u.id = qa.user_id
      WHERE qa.id = ? AND qa.user_id = ?
      LIMIT 1
      `,
      [attemptId, userId],
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found",
      });
    }

    const attempt = rows[0];
    const questions = JSON.parse(attempt.questions_json || "[]");
    const answers = JSON.parse(attempt.answers || "{}");
    console.log("questions_json:", questions);
    console.log("answers:", answers);

    const optionMap = {
      1: "a",
      2: "b",
      3: "c",
      4: "d",
    };

    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    const reviewData = questions.map((q, index) => {
      const given = answers[String(index)] || null;
      const correctAnswer =
        q.correct != null
          ? optionMap[q.correct] || String(q.correct).toLowerCase()
          : q.correct_answer
            ? String(q.correct_answer).toLowerCase()
            : null;
      let status = "unattempted";

      if (!given) {
        skipped++;
      } else if (
        correctAnswer &&
        String(given).toLowerCase() === String(correctAnswer).toLowerCase()
      ) {
        correct++;
        status = "correct";
      } else {
        wrong++;
        status = "wrong";
      }

      return {
        i: index,
        given,
        status,
        q: {
          id: q.id,
          question: q.question,
          image: q.image || null,
          explanation: q.explanation || "",
          correct_answer: correctAnswer,
          option_a: q.option_a || q.opt1 || null,
          option_b: q.option_b || q.opt2 || null,
          option_c: q.option_c || q.opt3 || null,
          option_d: q.option_d || q.opt4 || null,
          options: [
            { key: "a", text: q.option_a || q.opt1 || null },
            { key: "b", text: q.option_b || q.opt2 || null },
            { key: "c", text: q.option_c || q.opt3 || null },
            { key: "d", text: q.option_d || q.opt4 || null },
          ],
        },
      };
    });

    const total = questions.length;
    const pct =
      attempt.percentage != null
        ? Number(attempt.percentage)
        : total > 0
          ? Math.round(((attempt.score || 0) / total) * 100)
          : 0;

    return res.status(200).json({
      success: true,
      message: "Quiz result fetched successfully",
      hero: {
        avatar: attempt.fullName?.charAt(0)?.toUpperCase() || "?",
        name: attempt.fullName || "Student",
        quiz: "Quiz",
        pct,
        fraction: `${attempt.score || 0} / ${attempt.total_questions || total} marks obtained`,
        correct,
        wrong,
        skipped,
      },
      result: {
        id: attempt.id,
        score: attempt.score || 0,
        total: attempt.total_questions || total,
        percentage: pct,
        status:
          attempt.attempt_status ||
          (attempt.completed ? "submitted" : "pending"),
        duration_seconds: attempt.duration_seconds,
        time_taken_seconds: attempt.duration_seconds - (attempt.time_left || 0),
        started_at: attempt.started_at,
        submitted_at: attempt.submitted_at,
      },
      reviewData,
    });
  } catch (error) {
    console.error("Get Quiz Result Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching result" });
  }
};
