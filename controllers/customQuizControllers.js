import db from "../config/MedMindsDB.js";

// =====================================================
// CREATE CUSTOM TEST
// =====================================================
export const createCustomTest = async (req, res) => {
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

// =====================================================
// GET SINGLE CUSTOM TEST
// ====================================================

export const getCustomTestDetails = async (req, res) => {
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

// =====================================================
// GET MY CUSTOM TESTS
// =====================================================
export const getMyCustomTests = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [rows] = await db.execute(
      `
      SELECT
        id,
        score,
        total_questions,
        percentage,
        status,
        duration_seconds,
        time_taken_seconds,
        submitted_at,
        created_at
      FROM custom_test_attempts
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [user_id],
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get My Custom Tests Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch custom test history.",
    });
  }
};

// =====================================================
// SUBMIT CUSTOM TEST
// =====================================================
export const submitCustomTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers = {}, time_taken_seconds = 0 } = req.body;
    const user_id = req.user.id;

    const [rows] = await db.execute(
      `
      SELECT questions_json
      FROM custom_test_attempts
      WHERE id = ? AND user_id = ?
      `,
      [id, user_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Custom test not found.",
      });
    }

    const questions = JSON.parse(rows[0].questions_json);

    let score = 0;

    questions.forEach((q, index) => {
      const userAnswer = answers[index];
      if (Number(userAnswer) === Number(q.correct)) {
        score++;
      }
    });

    const total_questions = questions.length;
    const percentage =
      total_questions > 0 ? ((score / total_questions) * 100).toFixed(2) : 0;

    await db.execute(
      `
      UPDATE custom_test_attempts
      SET
        answers = ?,
        score = ?,
        total_questions = ?,
        percentage = ?,
        time_taken_seconds = ?,
        status = 'submitted',
        submitted_at = NOW()
      WHERE id = ? AND user_id = ?
      `,
      [
        JSON.stringify(answers),
        score,
        total_questions,
        percentage,
        time_taken_seconds,
        id,
        user_id,
      ],
    );

    return res.status(200).json({
      success: true,
      message: "Custom test submitted successfully.",
      result: {
        score,
        total_questions,
        percentage,
      },
    });
  } catch (error) {
    console.error("Submit Custom Test Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit custom test.",
    });
  }
};

//  ==================
// ==============START CUSTOM TEST CONTROLLERS
// ==============================

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

// save custom progress
export const saveCustomProgressController = async (req, res) => {
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

// get custom quiz result controller

export const getCustomResultController = async (req, res) => {
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
      const given = answers[index] || null;

      const correctAnswer =
        optionMap[q.correct] ||
        optionMap[Number(q.correct)] ||
        String(q.correct).toLowerCase();

      let status = "unattempted";

      if (!given) {
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

          options: [
            {
              key: "a",
              text: q.opt1,
            },
            {
              key: "b",
              text: q.opt2,
            },
            {
              key: "c",
              text: q.opt3,
            },
            {
              key: "d",
              text: q.opt4,
            },
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

// submit custom quiz controller
export const submitCustomQuizController = async (req, res) => {
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
    const answers = JSON.parse(attempt.answers || "{}");

    // 2. calculate score
    let score = 0;

    questions.forEach((q, i) => {
      if (answers[String(i)] === q.correct_answer) {
        score++;
      }
    });

    // 3. update DB
    await db.execute(
      `UPDATE custom_test_attempts 
       SET status = 'completed',
           score = ?,
           answers = ?,
           time_left = 0
       WHERE id = ? AND user_id = ?`,
      [score, JSON.stringify(answers), attemptId, userId],
    );

    return res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      score,
      total: questions.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Submission failed",
    });
  }
};
