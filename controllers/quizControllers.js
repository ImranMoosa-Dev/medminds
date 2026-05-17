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

    res.status(200).send({
      success: true,
      message: "Quiz fetched successfully",
      quiz: rows,
    });
  } catch (error) {
    console.error("get Single Quiz error:", error);
    res.status(500).send({
      success: false,
      message: "Error fetching Single quiz",
    });
  }
};
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
