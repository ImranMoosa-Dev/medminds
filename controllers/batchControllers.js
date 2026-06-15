import db from "../config/MedMindsDB.js";

/*
|--------------------------------------------------------------------------
| GET ALL BATCHES
|--------------------------------------------------------------------------
*/

export const getAllBatchesController = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        id,
        name,
        description,
        start_date,
        end_date,
        created_at
      FROM batches
      ORDER BY created_at DESC
    `);

    return res.status(200).send({
      success: true,
      total: rows.length,
      batches: rows,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).send({
      success: false,
      message: "Error while fetching batches",
      error,
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE BATCH WITH SCHEDULE
|--------------------------------------------------------------------------
*/

export const getSingleBatchController = async (req, res) => {
  try {
    const { id } = req.params;

    // Batch details
    const [batchRows] = await db.execute(
      `
      SELECT *
      FROM batches
      WHERE id = ?
      LIMIT 1
    `,
      [id],
    );

    if (batchRows.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Batch not found",
      });
    }

    // Batch schedule
    const [scheduleRows] = await db.execute(
      `
      SELECT
        id,
        test_no,
        date,
        day,
        subject,
        chapter
      FROM batch_schedules
      WHERE batch_id = ?
      ORDER BY test_no ASC
    `,
      [id],
    );

    return res.status(200).send({
      success: true,
      batch: batchRows[0],
      schedule: scheduleRows,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).send({
      success: false,
      message: "Error while fetching batch",
      error,
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET MY BATCH (LOGGED-IN STUDENT)
|--------------------------------------------------------------------------
*/

export const getMyBatchController = async (req, res) => {
  try {
    const userId = req.user.id;

    /*
    |--------------------------------------------------------------------------
    | GET USER
    |--------------------------------------------------------------------------
    */

    const [userRows] = await db.execute(
      `
      SELECT
        id,
        fullName,
        batch_id
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
      [userId],
    );

    if (userRows.length === 0) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const user = userRows[0];

    if (!user.batch_id) {
      return res.status(200).send({
        success: true,
        batch: null,
        user: {
          id: user.id,
          fullName: user.fullName,
          batch_id: null,
        },
        schedule: [],
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GET BATCH
    |--------------------------------------------------------------------------
    */

    const [batchRows] = await db.execute(
      `
      SELECT
        id,
        name,
        description,
        start_date,
        end_date
      FROM batches
      WHERE id = ?
      LIMIT 1
    `,
      [user.batch_id],
    );

    if (batchRows.length === 0) {
      return res.status(200).send({
        success: true,
        batch: null,
        user: {
          id: user.id,
          fullName: user.fullName,
          batch_id: null,
        },
        schedule: [],
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GET BATCH SCHEDULE
    |--------------------------------------------------------------------------
    */

    const [scheduleRows] = await db.execute(
      `
      SELECT
        id,
        test_no,
        date,
        day,
        subject,
        chapter
      FROM batch_schedules
      WHERE batch_id = ?
      ORDER BY test_no ASC
    `,
      [user.batch_id],
    );

    return res.status(200).send({
      success: true,

      batch: {
        id: batchRows[0].id,
        name: batchRows[0].name,
        description: batchRows[0].description,
        start_date: batchRows[0].start_date,
        end_date: batchRows[0].end_date,
      },

      user: {
        id: user.id,
        fullName: user.fullName,
        batch_id: user.batch_id,
      },

      schedule: scheduleRows,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).send({
      success: false,
      message: "Error while fetching my batch",
      error,
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE BATCH
|--------------------------------------------------------------------------
*/
export const createBatchController = async (req, res) => {
  try {
    const { name, description, start_date, end_date } = req.body;
    if (!name) {
      return res.status(400).send({ success: false, message: "Name is required" });
    }
    const [result] = await db.execute(
      `INSERT INTO batches (name, description, start_date, end_date, is_active) VALUES (?, ?, ?, ?, TRUE)`,
      [name, description || "", start_date || null, end_date || null]
    );
    return res.status(201).send({
      success: true,
      message: "Batch created successfully",
      batch: {
        id: result.insertId,
        name,
        description,
        start_date,
        end_date,
        is_active: true
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error creating batch",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE BATCH
|--------------------------------------------------------------------------
*/
export const deleteBatchController = async (req, res) => {
  try {
    const { id } = req.params;
    // Unassign students from this batch first
    await db.execute(`UPDATE users SET batch_id = NULL WHERE batch_id = ?`, [id]);
    // Delete batch
    const [result] = await db.execute(`DELETE FROM batches WHERE id = ?`, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).send({ success: false, message: "Batch not found" });
    }
    return res.status(200).send({
      success: true,
      message: "Batch deleted successfully"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error deleting batch",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| TOGGLE BATCH STATUS
|--------------------------------------------------------------------------
*/
export const toggleBatchStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const [result] = await db.execute(`UPDATE batches SET is_active = ? WHERE id = ?`, [
      is_active ? 1 : 0,
      id
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).send({ success: false, message: "Batch not found" });
    }
    return res.status(200).send({
      success: true,
      message: "Batch status updated successfully"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error updating batch status",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPLOAD BATCH SCHEDULE
|--------------------------------------------------------------------------
*/
export const uploadBatchScheduleController = async (req, res) => {
  try {
    const { id } = req.params; // batch_id
    const { schedule } = req.body; // array of { test_no, date, day, subject, chapter }

    if (!Array.isArray(schedule)) {
      return res.status(400).send({ success: false, message: "Schedule must be an array" });
    }

    // Delete existing schedules for this batch
    await db.execute(`DELETE FROM batch_schedules WHERE batch_id = ?`, [id]);

    // Insert new schedules
    for (const r of schedule) {
      await db.execute(
        `INSERT INTO batch_schedules (batch_id, test_no, date, day, subject, chapter) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, r.test_no, r.date, r.day, r.subject, r.chapter]
      );
    }

    return res.status(200).send({
      success: true,
      message: "Schedule uploaded successfully"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error uploading schedule",
      error: error.message
    });
  }
};

