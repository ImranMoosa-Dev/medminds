import db from "../config/MedMindsDB.js";

// =========================
// GET ALL TOPICS
// =========================
export const getTopics = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        t.id,
        t.name,
        t.subject_id,
        s.name AS subject_name,
        t.created_at
      FROM topics t
      JOIN subjects s ON s.id = t.subject_id
      ORDER BY t.id DESC
    `);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get Topics Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch topics",
    });
  }
};

// =========================
// GET TOPICS BY SUBJECT ID
// =========================
export const getTopicsBySubject = async (req, res) => {
  try {
    const { subject_id } = req.params;

    const [rows] = await db.execute(
      `
      SELECT * FROM topics
      WHERE subject_id = ?
      ORDER BY id DESC
      `,
      [subject_id],
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get Topics By Subject Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch topics",
    });
  }
};

// =========================
// GET SINGLE TOPIC
// =========================
export const getTopicById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      `
      SELECT 
        t.id,
        t.name,
        t.subject_id,
        s.name AS subject_name,
        t.created_at
      FROM topics t
      JOIN subjects s ON s.id = t.subject_id
      WHERE t.id = ?
      `,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Get Topic Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch topic",
    });
  }
};

// =========================
// CREATE TOPIC
// =========================
export const createTopic = async (req, res) => {
  try {
    const { subject_id, name } = req.body;

    if (!subject_id || !name) {
      return res.status(400).json({
        success: false,
        message: "subject_id and name are required",
      });
    }

    // check subject exists
    const [subject] = await db.execute(`SELECT id FROM subjects WHERE id = ?`, [
      subject_id,
    ]);

    if (subject.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    await db.execute(
      `
      INSERT INTO topics (subject_id, name)
      VALUES (?, ?)
      `,
      [subject_id, name],
    );

    res.status(201).json({
      success: true,
      message: "Topic created successfully",
    });
  } catch (error) {
    console.error("Create Topic Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create topic",
    });
  }
};

// =========================
// UPDATE TOPIC
// =========================
export const updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_id, name } = req.body;

    const [result] = await db.execute(
      `
      UPDATE topics
      SET subject_id = ?, name = ?
      WHERE id = ?
      `,
      [subject_id, name, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Topic updated successfully",
    });
  } catch (error) {
    console.error("Update Topic Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update topic",
    });
  }
};

// =========================
// DELETE TOPIC
// =========================
export const deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(`DELETE FROM topics WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Topic deleted successfully",
    });
  } catch (error) {
    console.error("Delete Topic Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete topic",
    });
  }
};
