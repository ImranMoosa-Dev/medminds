import db from "../config/db.js";
// Create new user
export const createUser = async (userData) => {
  const {
    fullName,
    fatherName,
    district,
    whatsapp,
    status,
    email,
    password,
    verificationToken,
    verificationTokenExpires,
  } = userData;

  const [result] = await db.execute(
    `INSERT INTO users
    (
      fullName,
      fatherName,
      district,
      whatsapp,
      status,
      email,
      password,
      loggedIn,
      approved,
      isVerified,
      verificationToken,
      verificationTokenExpires
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      fullName,
      fatherName,
      district,
      whatsapp,
      status,
      email,
      password,
      false,
      false,
      verificationToken,
      verificationTokenExpires,
    ],
  );

  return result;
};

// Find user by email
export const findUserByEmail = async (email) => {
  const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
    email,
  ]);

  return rows[0];
};

// Find user by verification token
export const findUserByVerificationToken = async (token) => {
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE verificationToken = ?",
    [token],
  );

  return rows[0];
};

// Verify user email
export const verifyUserEmail = async (userId) => {
  await db.execute(
    `UPDATE users
     SET isVerified = TRUE,
         verificationToken = NULL,
         verificationTokenExpires = NULL
     WHERE id = ?`,
    [userId],
  );
};
