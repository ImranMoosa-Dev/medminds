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
