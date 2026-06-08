import db from "../config/MedMindsDB.js";

// ============== CREATE CUSTOM QUIZ
export const createCustomQuizController = async (req, res) => {
  try {
    const { payload = {} } = req.body;
    const {
      selected_subject_ids = [],
      selected_topic_ids = [],
      selected_subtopic_ids = [],
      questions_json = [],
      total_questions,
      duration_seconds,
    } = payload;

    const user_id = req.user.id;

    if (!questions_json.length) {
      return res.status(400).json({
        success: false,
        message: "No questions provided.",
      });
    }

    const [result] = await db.execute(
      `
      INSERT INTO custom_test_attempts (
        user_id,
        selected_subject_ids,
        selected_topic_ids,
        selected_subtopic_ids,
        questions_json,
        total_questions,
        duration_seconds,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `,
      [
        user_id,
        JSON.stringify(selected_subject_ids),
        JSON.stringify(selected_topic_ids),
        JSON.stringify(selected_subtopic_ids),
        JSON.stringify(questions_json),
        total_questions,
        duration_seconds,
      ],
    );

    const [rows] = await db.execute(
      `SELECT * FROM custom_test_attempts WHERE id = ?`,
      [result.insertId],
    );

    return res.status(201).send({
      success: true,
      message: "Custom test created successfully.",
      quiz: rows[0],
    });
  } catch (error) {
    console.error("Create Custom Test Error:", error);
    return res.status(500).send({
      success: false,
      message: "Failed to create custom test.",
    });
  }
};

// ============== GET SINGLE CUSTOM QUIZ BY ATTEMPT ID

export const getCustomQuizDetailsController = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const [rows] = await db.execute(
      `
      SELECT *
      FROM custom_test_attempts
      WHERE id = ?
      AND user_id = ?
      LIMIT 1
      `,
      [attemptId, userId],
    );

    if (rows.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Custom test not found or access denied",
      });
    }

    const attempt = rows[0];

    // Parse JSON fields if stored as JSON strings
    // attempt.subjects = attempt.subjects ? JSON.parse(attempt.subjects) : [];

    // attempt.topics = attempt.topics ? JSON.parse(attempt.topics) : [];

    // attempt.subtopics = attempt.subtopics ? JSON.parse(attempt.subtopics) : [];

    // attempt.questions_json = attempt.questions_json
    //   ? JSON.parse(attempt.questions_json)
    //   : [];

    return res.status(200).send({
      success: true,
      message: "Costum test details fetched successfully",
      attempt,
    });
  } catch (error) {
    console.error("getCustomTestDetails error:", error);

    return res.status(500).send({
      success: false,
      message: "Error fetching custom test",
      error: error.message,
    });
  }
};

// ============== START CUSTOM QUIZ CONTROLLER

export const startCustomQuizController = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;
    // 1. Get attempt
    const [attemptRows] = await db.execute(
      `SELECT * FROM custom_test_attempts WHERE id = ? AND user_id = ?`,
      [attemptId, userId],
    );

    if (!attemptRows.length) {
      return res.status(404).json({
        success: false,
        message: "Custom attempt not found",
      });
    }

    const attempt = attemptRows[0];

    if (attempt.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Quiz already completed",
      });
    }

    // 2. Parse questions
    const questions = JSON.parse(attempt.questions_json || "[]");
    const answers = JSON.parse(attempt.answers || "{}");

    // 3. response
    return res.status(200).json({
      success: true,
      quiz: {
        name: "Custom Test",
      },
      questions,
      attempt: {
        id: attempt.id,
        answers,
        current_question: attempt.current_question,
        time_left: attempt.time_left || attempt.duration_seconds,
      },
      user: {
        id: userId,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error starting custom quiz",
    });
  }
};

// ============== SAVE CUSTOM QUIZ PROGRESS CONTROLLER
export const saveCustomQuizProgressController = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const { payload = {} } = req.body;
    const { answers, current_question, time_left } = payload;

    const [result] = await db.execute(
      `UPDATE custom_test_attempts 
       SET answers = ?, current_question = ?, time_left = ?
       WHERE id = ? AND user_id = ?`,
      [
        JSON.stringify(answers || {}),
        current_question,
        time_left,
        attemptId,
        userId,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Custom attempt not found or access denied",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Progress saved",
    });
  } catch (error) {
    console.error("Save Custom Progress Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save progress",
    });
  }
};

// ============== SUBMIT CUSTOM TEST AND CALCULATE RESULT
export const finalSubmitCustomQuizController = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    // 1. fetch attempt
    const [rows] = await db.execute(
      `SELECT * FROM custom_test_attempts WHERE id = ? AND user_id = ?`,
      [attemptId, userId],
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    const attempt = rows[0];

    const questions = JSON.parse(attempt.questions_json || "[]");

    // Prefer answers sent in request body (frontend) but fall back to stored answers
    const bodyAnswers = req.body?.answers || {};
    const answers = Object.keys(bodyAnswers || {}).length
      ? bodyAnswers
      : JSON.parse(attempt.answers || "{}");

    // 2. calculate score (normalize correct/given values)
    let score = 0;

    questions.forEach((q, i) => {
      const userAnswer = answers[String(i)];
      if (userAnswer === undefined || userAnswer === null) return;

      // const correctRaw = q.correct_answer ?? q.correct;
      const correct = String(q.correct_answer || "")
        .toLowerCase()
        .trim();

      const given = String(userAnswer || "")
        .toLowerCase()
        .trim();

      if (given === correct) {
        score++;
      }
    });

    const total_questions = questions.length;
    const percentage =
      total_questions > 0
        ? Number(((score / total_questions) * 100).toFixed(2))
        : 0;

    // compute time taken if available
    const bodyTimeTaken = req.body?.time_taken_seconds;
    const time_taken_seconds =
      typeof bodyTimeTaken === "number"
        ? bodyTimeTaken
        : attempt.duration_seconds && attempt.time_left != null
          ? Math.max(attempt.duration_seconds - (attempt.time_left || 0), 0)
          : attempt.time_taken_seconds || 0;

    // 3. update DB with full result fields
    await db.execute(
      `UPDATE custom_test_attempts 
         SET status = 'submitted',
             score = ?,
             answers = ?,
             total_questions = ?,
             percentage = ?,
             time_taken_seconds = ?,
             time_left = 0,
             submitted_at = NOW()
         WHERE id = ? AND user_id = ?`,
      [
        score,
        JSON.stringify(answers || {}),
        total_questions,
        percentage,
        time_taken_seconds,
        attemptId,
        userId,
      ],
    );

    return res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      result: {
        score,
        total_questions,
        percentage,
        time_taken_seconds,
      },
      score,
      total_questions,
      percentage,
      time_taken_seconds,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Submission failed",
    });
  }
};

// ============== GET CUSTOM QUIZ RESULT CONTROLLER

export const getCustomQuizResultController = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const [rows] = await db.execute(
      `
      SELECT
        cta.*,
        u.fullName
      FROM custom_test_attempts cta
      JOIN users u ON u.id = cta.user_id
      WHERE cta.id = ? AND cta.user_id = ?
      `,
      [attemptId, userId],
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    const attempt = rows[0];

    const questions = JSON.parse(attempt.questions_json || "[]");
    const answers = JSON.parse(attempt.answers || "{}");

    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    const reviewData = questions.map((q, index) => {
      const given = answers[index] || null;

      const correctAnswer = String(q.correct_answer || "").toLowerCase();

      let status = "unattempted";

      if (given === null || given === undefined) {
        skipped++;
      } else if (
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

          option_a: q.option_a || null,
          option_b: q.option_b || null,
          option_c: q.option_c || null,
          option_d: q.option_d || null,

          options: [
            { key: "a", text: q.option_a },
            { key: "b", text: q.option_b },
            { key: "c", text: q.option_c },
            { key: "d", text: q.option_d },
          ],
        },
      };
    });

    const total = questions.length;

    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    return res.status(200).json({
      success: true,
      message: "Custom Quiz Result Fetched Successfully",

      hero: {
        avatar: attempt.fullName?.charAt(0)?.toUpperCase() || "?",
        name: attempt.fullName,
        quiz: "Custom Practice Test",

        pct,

        fraction: `${correct} / ${total} marks obtained`,

        correct,
        wrong,
        skipped,
      },

      result: {
        id: attempt.id,
        score: correct,
        total,
        percentage: pct,

        status: attempt.status,

        duration_seconds: attempt.duration_seconds,
        time_taken_seconds: attempt.time_taken_seconds,

        started_at: attempt.started_at,
        submitted_at: attempt.submitted_at,
      },

      reviewData,
    });
  } catch (error) {
    console.error("getCustomResultController:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching result",
      error: error.message,
    });
  }
};

// ============== GET ALL CUSTOM QUIZ ATTMEPTS HISTORY CONTROLLER

export const getCustomQuizAttemptsHistoryController = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Fetch all attempts for user
    const [rows] = await db.execute(
      `
      SELECT *
      FROM custom_test_attempts
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId],
    );

    const attempts = rows || [];

    // 2️⃣ Calculate summary stats
    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalWrong = 0;

    const formatted = attempts.map((a) => {
      const answers = a.answers ? JSON.parse(a.answers) : {};
      const answered = Object.keys(answers).length;

      const score = a.score || 0;
      const total = a.total_questions || 0;

      const wrong = answered - score;
      const skipped = total - answered;

      // accumulate summary
      totalQuestions += answered;
      totalCorrect += score;
      totalWrong += wrong;

      return {
        id: a.id,
        subjects: JSON.parse(a.selected_subject_ids || "[]"),
        topics: JSON.parse(a.selected_topic_ids || "[]"),
        subtopics: JSON.parse(a.selected_subtopic_ids || "[]"),
        questions: JSON.parse(a.questions_json || "[]"),
        answers,
        score,
        total,
        percentage: a.percentage,
        status: a.status,
        created_at: a.created_at,
        started_at: a.started_at,
        submitted_at: a.submitted_at,
        current_question: a.current_question,
        time_left: a.time_left,
        duration_seconds: a.duration_seconds,

        // UI computed fields
        answered,
        wrong,
        skipped,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Custom quiz attempts history fetched successfully",

      attempts: formatted,

      summary: {
        totalTests: attempts.length,
        totalQuestions,
        totalCorrect,
        totalWrong,
      },

      meta: {
        completed: attempts.filter((a) => a.status === "submitted").length,
      },
    });
  } catch (error) {
    console.error("getCustomTestHistoryController error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load custom test history",
      error: error.message,
    });
  }
};
