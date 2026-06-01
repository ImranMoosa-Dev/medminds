import db from "../config/MedMindsDB.js";

// =========================
// GET ALL SUBTOPICS
// =========================
export const getSubtopics = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        st.id,
        st.name,
        st.topic_id,
        t.name AS topic_name,
        s.name AS subject_name,
        st.created_at
      FROM subtopics st
      JOIN topics t ON t.id = st.topic_id
      JOIN subjects s ON s.id = t.subject_id
      ORDER BY st.id DESC
    `);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get Subtopics Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subtopics",
    });
  }
};

// =========================
// GET SUBTOPICS BY TOPIC ID
// =========================
export const getSubtopicsByTopic = async (req, res) => {
  try {
    const { selectedTopicIds } = req.body;

    // Validate input
    if (!Array.isArray(selectedTopicIds) || selectedTopicIds.length === 0) {
      return res.status(400).send({
        success: false,
        message: "selected Topics ids must be a non-empty array",
      });
    }
    // Create placeholders (?, ?, ?, ...)
    const placeholders = selectedTopicIds.map(() => "?").join(",");

    const [rows] = await db.execute(
      `
      SELECT * FROM subtopics
      WHERE topic_id IN (${placeholders})
      ORDER BY id DESC
      `,
      selectedTopicIds,
    );

    return res.status(200).send({
      success: true,
      message: "Subtopics By Topic fetched successfully",
      subtopics: rows,
    });
  } catch (error) {
    console.error("Get Subtopics By Topic Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subtopics",
    });
  }
};

// =========================
// GET SINGLE SUBTOPIC
// =========================
export const getSubtopicById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      `
      SELECT 
        st.id,
        st.name,
        st.topic_id,
        t.name AS topic_name,
        s.name AS subject_name,
        st.created_at
      FROM subtopics st
      JOIN topics t ON t.id = st.topic_id
      JOIN subjects s ON s.id = t.subject_id
      WHERE st.id = ?
      `,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subtopic not found",
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Get Subtopic Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subtopic",
    });
  }
};

// =========================
// CREATE SUBTOPIC
// =========================
export const createSubtopic = async (req, res) => {
  try {
    const { topic_id, name } = req.body;

    if (!topic_id || !name) {
      return res.status(400).json({
        success: false,
        message: "topic_id and name are required",
      });
    }

    // check topic exists
    const [topic] = await db.execute(`SELECT id FROM topics WHERE id = ?`, [
      topic_id,
    ]);

    if (topic.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    await db.execute(
      `
      INSERT INTO subtopics (topic_id, name)
      VALUES (?, ?)
      `,
      [topic_id, name],
    );

    res.status(201).json({
      success: true,
      message: "Subtopic created successfully",
    });
  } catch (error) {
    console.error("Create Subtopic Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create subtopic",
    });
  }
};

// =========================
// UPDATE SUBTOPIC
// =========================
export const updateSubtopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { topic_id, name } = req.body;

    const [result] = await db.execute(
      `
      UPDATE subtopics
      SET topic_id = ?, name = ?
      WHERE id = ?
      `,
      [topic_id, name, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Subtopic not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subtopic updated successfully",
    });
  } catch (error) {
    console.error("Update Subtopic Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update subtopic",
    });
  }
};

// =========================
// DELETE SUBTOPIC
// =========================
export const deleteSubtopic = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(`DELETE FROM subtopics WHERE id = ?`, [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Subtopic not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subtopic deleted successfully",
    });
  } catch (error) {
    console.error("Delete Subtopic Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete subtopic",
    });
  }
};
