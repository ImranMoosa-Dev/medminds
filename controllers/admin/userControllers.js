import db from "../../config/MedMindsDB.js";

export const getAllUsersController = async (req, res) => {
  try {
    // 1️⃣ USERS + BATCH
    const [users] = await db.execute(`
      SELECT
        u.id,
        u.fullName,
        u.email,
        u.whatsapp,
        u.batch_id,
        u.created_at,
        b.name AS batch_name
      FROM users u
      LEFT JOIN batches b ON u.batch_id = b.id
      ORDER BY u.created_at DESC
    `);

    // 2️⃣ QUIZ ATTEMPTS (for stats like avg score)
    const [attempts] = await db.execute(`
      SELECT
        user_id,
        score,
        total_questions,
        quiz_id,
        attempt_status
      FROM quiz_attempts
      WHERE attempt_status ="submitted"
    `);

    // 3️⃣ BATCHES (optional but useful for mapping/filtering)
    const [batches] = await db.execute(`
      SELECT id, name FROM batches
    `);

    // 4️⃣ FINAL RESPONSE SHAPE (CLEAN & FRONTEND FRIENDLY)
    return res.status(200).json({
      success: true,
      data: {
        users,
        attempts,
        batches,
      },
    });
  } catch (error) {
    console.error("Get All Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};
