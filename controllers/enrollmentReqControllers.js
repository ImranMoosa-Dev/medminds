import db from "../config/MedMindsDB.js";

// CREATE ENROLLMENT REQUEST CONTROLLER
export const createEnrollmentRequestController = async (req, res) => {
  try {
    const userId = req.user.id;

    const { batch_id, father_name, district, status } = req.body;

    if (!batch_id) {
      return res.status(400).send({
        success: false,
        message: "Batch is required",
      });
    }

    if (!father_name || !district || !status) {
      return res.status(400).send({
        success: false,
        message: "All fields are required",
      });
    }

    // check existing pending request
    const [existing] = await db.execute(
      `
      SELECT id
      FROM enrollment_requests
      WHERE user_id = ?
      AND approval_status = 'pending'
      `,
      [userId],
    );

    if (existing.length) {
      return res.status(400).send({
        success: false,
        message: "You already have a pending enrollment request",
      });
    }

    await db.execute(
      `
      INSERT INTO enrollment_requests
      (
        user_id,
        batch_id,
        father_name,
        district,
        status
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [userId, batch_id, father_name, district, status],
    );

    res.status(201).send({
      success: true,
      message: "Enrollment request submitted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "Error creating enrollment request",
      error,
    });
  }
};

// GET MY ENROLLMENT REQUEST STATUS CONTROLLER
export const getMyEnrollmentRequestStatusController = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Check if user already has a batch (APPROVED)
    const [userRows] = await db.execute(
      `
      SELECT
        u.batch_id,
        b.name AS batch_name
      FROM users u
      LEFT JOIN batches b ON b.id = u.batch_id
      WHERE u.id = ?
      `,
      [userId],
    );

    if (userRows.length && userRows[0].batch_id) {
      return res.status(200).json({
        success: true,
        status: "approved",
        batch: {
          id: userRows[0].batch_id,
          name: userRows[0].batch_name,
        },
        request: null,
      });
    }

    // 2. Check latest enrollment request
    const [requests] = await db.execute(
      `
      SELECT
        er.*,
        b.name AS batch_name
      FROM enrollment_requests er
      JOIN batches b ON b.id = er.batch_id
      WHERE er.user_id = ?
      ORDER BY er.created_at DESC
      LIMIT 1
      `,
      [userId],
    );

    // 3. No request found
    if (!requests.length) {
      return res.status(200).json({
        success: true,
        status: "none",
        batch: null,
        request: null,
      });
    }

    // 4. Request exists (pending/rejected)
    return res.status(200).json({
      success: true,
      status: requests[0].approval_status,
      batch: null,
      request: {
        id: requests[0].id,
        batch_id: requests[0].batch_id,
        batch_name: requests[0].batch_name,
        status: requests[0].approval_status,
        created_at: requests[0].created_at,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error fetching enrollment status",
      error: error.message,
    });
  }
};

// admin
export const approveEnrollmentRequestController = async (req, res) => {
  try {
    const { requestId } = req.params;

    const [rows] = await db.execute(
      `
      SELECT *
      FROM enrollment_requests
      WHERE id = ?
      `,
      [requestId],
    );

    if (!rows.length) {
      return res.status(404).send({
        success: false,
        message: "Request not found",
      });
    }

    const request = rows[0];

    await db.execute(
      `
      UPDATE enrollment_requests
      SET approval_status = 'approved',
          reviewed_at = NOW()
      WHERE id = ?
      `,
      [requestId],
    );

    await db.execute(
      `
      UPDATE users
      SET batch_id = ?
      WHERE id = ?
      `,
      [request.batch_id, request.user_id],
    );

    return res.status(200).send({
      success: true,
      message: "Enrollment approved successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "Error approving request",
      error,
    });
  }
};

export const rejectEnrollmentRequestController = async (req, res) => {
  try {
    const { requestId } = req.params;

    await db.execute(
      `
      UPDATE enrollment_requests
      SET approval_status = 'rejected',
          reviewed_at = NOW()
      WHERE id = ?
      `,
      [requestId],
    );

    res.status(200).send({
      success: true,
      message: "Request rejected successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "Error rejecting request",
      error,
    });
  }
};
