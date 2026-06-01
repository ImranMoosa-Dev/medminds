// controllers/questionController.js
import db from "../config/MedMindsDB.js";

// Count questions by selected subtopic IDs
export const getQuestionsCountBySubtopicsController = async (req, res) => {
  try {
    const { selectedsubtopicIds } = req.body;

    // Validate input
    if (
      !Array.isArray(selectedsubtopicIds) ||
      selectedsubtopicIds.length === 0
    ) {
      return res.status(400).send({
        success: false,
        message: "subtopicIds must be a non-empty array",
      });
    }

    // Convert all IDs to numbers and remove invalid values
    const validIds = selectedsubtopicIds
      .map((id) => Number(id))
      .filter((id) => !isNaN(id));

    if (validIds.length === 0) {
      return res.status(400).send({
        success: false,
        message: "No valid subtopic IDs provided",
      });
    }

    // Create placeholders (?, ?, ?)
    const placeholders = validIds.map(() => "?").join(",");

    // Count questions belonging to selected subtopics
    const [questions] = await db.execute(
      `
      SELECT *
      FROM questions
      WHERE subtopic_id IN (${placeholders})
      ORDER BY id ASC
      `,
      validIds,
    );

    return res.status(200).send({
      success: true,
      totalQuestions: questions.length,
      questions: questions,
    });
  } catch (error) {
    console.error("Error counting questions:", error);
    return res.status(500).send({
      success: false,
      message: "Error while counting questions",
      error: error.message,
    });
  }
};
