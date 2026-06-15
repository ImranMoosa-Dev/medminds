import db from "../../config/MedMindsDB.js";

// ==========================
// GET ADMIN PROFILE
// ==========================
export const getAdminProfileController = async (req, res) => {
  try {
    const adminId = req.user?.id; // assuming JWT middleware

    // Admin basic info
    const [adminRows] = await db.execute(
      `SELECT id, email, last_login FROM users WHERE id = ? AND role = 'admin'`,
      [adminId],
    );

    if (!adminRows.length) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const admin = adminRows[0];

    // Stats queries (parallel-like)
    const [[quizzes], [users], [notifications], [batches]] = await Promise.all([
      db.execute(`SELECT COUNT(*) as count FROM quizzes`),
      db.execute(`SELECT COUNT(*) as count FROM users`),
      db.execute(`SELECT COUNT(*) as count FROM notifications`),
      db.execute(`SELECT COUNT(*) as count FROM batches`),
    ]);

    return res.json({
      success: true,
      data: {
        email: admin.email,
        lastLogin: admin.last_login,
        quizzesCreated: quizzes[0].count,
        usersManaged: users[0].count,
        notifications: notifications[0].count,
        batches: batches[0].count,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
