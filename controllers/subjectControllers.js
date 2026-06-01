import db from "../config/MedMindsDB.js";

// =========================
// GET ALL SUBJECTS
// =========================
export const getSubjects = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT * FROM subjects
      ORDER BY id DESC
    `);

    return res.status(200).send({
      success: true,
      message: "Subjects fetched Successfully",
      subjects: rows,
    });
  } catch (error) {
    console.error("Get Subjects Error:", error);
    return res.status(500).send({
      success: false,
      message: "Failed to fetch subjects",
    });
  }
};

// =========================
// GET SINGLE SUBJECT
// =========================
export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(`SELECT * FROM subjects WHERE id = ?`, [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Get Subject Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subject",
    });
  }
};

// =========================
// CREATE SUBJECT
// =========================
export const createSubject = async (req, res) => {
  try {
    const { name, standard, icon, color } = req.body;

    if (!name || !standard) {
      return res.status(400).json({
        success: false,
        message: "Name and standard are required",
      });
    }

    await db.execute(
      `
      INSERT INTO subjects (name, standard, icon, color)
      VALUES (?, ?, ?, ?)
      `,
      [name, standard, icon || "📚", color || "#0b63b7"],
    );

    res.status(201).json({
      success: true,
      message: "Subject created successfully",
    });
  } catch (error) {
    console.error("Create Subject Error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Subject already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create subject",
    });
  }
};

// =========================
// UPDATE SUBJECT
// =========================
export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, standard, icon, color } = req.body;

    const [result] = await db.execute(
      `
      UPDATE subjects
      SET
        name = ?,
        standard = ?,
        icon = ?,
        color = ?
      WHERE id = ?
      `,
      [name, standard, icon, color, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subject updated successfully",
    });
  } catch (error) {
    console.error("Update Subject Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update subject",
    });
  }
};

// =========================
// DELETE SUBJECT
// =========================
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(`DELETE FROM subjects WHERE id = ?`, [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error("Delete Subject Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete subject",
    });
  }
};
