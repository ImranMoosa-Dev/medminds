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
        academic_year,
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
      return res.status(404).send({
        success: false,
        message: "No batch assigned",
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
      return res.status(404).send({
        success: false,
        message: "Batch not found",
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

      batch: batchRows[0],

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
