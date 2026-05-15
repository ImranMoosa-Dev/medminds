import db from "../config/MedMindsDB.js";
import JWT from "jsonwebtoken";
import nodemailer from "nodemailer";

// Signup controller
export const signupController = async (req, res) => {
  const {
    fullName,
    fatherName,
    district,
    whatsapp,
    status,
    email,
    password,
    confirmPassword,
  } = req.body;
  if (password !== confirmPassword) {
    return res
      .status(400)
      .send({ success: false, error: "Passwords do not match." });
  }
  if (
    password.length < 8 ||
    !/\d/.test(password) ||
    !/[a-zA-Z]/.test(password)
  ) {
    return res.status(400).send({
      success: false,
      error:
        "Password must be at least 8 characters and contain at least one number and one letter.",
    });
  }
  // generating email verification token for students
  const token = Math.random().toString(36).substr(2, 9);
  const expires = new Date(Date.now() + 3600000); // 1 hour

  try {
    await db.execute(
      "INSERT INTO users (fullName, fatherName, district, whatsapp, status, email, password, loggedIn, approved, isVerified, verificationToken, verificationTokenExpires) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        fullName,
        fatherName,
        district,
        whatsapp,
        status,
        email,
        password,
        false,
        true,
        false,
        token,
        expires,
      ],
    );

    // sending confirmation email to student
    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: process.env.MY_GMAIL,
        pass: process.env.MY_PASSWORD,
      },
    });

    // Compose email
    const reciever = {
      from: process.env.MEDMINDS_SERVICE_EMAIL,
      to: email,
      subject: "Email Verification",
      html: `
        <p>Hello ${fullName},</p>
        <p>You requested to verify your email. Click below to Verify your email:</p>
        <a href="${process.env.CLIENT_URL}/verify-email/${token}" 
          style="background:#0d6efd;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;">
          Verify Email
        </a>
        <p>This link will expire in 15 minutes.</p>
      `,
    };
    await transporter.sendMail(reciever);
    return res.status(201).send({
      success: true,
      message:
        "Signup successful. Please check your email to verify your account.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, error: "Error signing up" });
  }
};

// Login controller
export const loginController = async (req, res) => {
  const { email, password, returnUrl } = req.body;
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email.trim(),
    ]);

    if (rows.length === 0) {
      return res
        .status(400)
        .send({ success: false, error: "Invalid credentials" });
    }
    const user = rows[0];
    if (!user.isVerified) {
      return res.status(403).send({
        success: false,
        error: "Please verify your email before logging in.",
      });
    }

    if (user.password !== password) {
      return res
        .status(400)
        .send({ success: false, error: "Invalid credentials" });
    }

    await db.execute("UPDATE users SET loggedIn=? WHERE email=?", [
      true,
      user.email,
    ]);

    req.session.user = user.email;

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role:
        user.email === "biologia.info1@gmail.com" ||
        user.email === "admin@medminds.com"
          ? "admin"
          : "student",
    };
    // generate JWT token
    const token = JWT.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.cookie(process.env.JWT_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Record login date for streak calculation
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    try {
      await db.execute(
        "INSERT IGNORE INTO login_dates (email, date) VALUES (?, ?)",
        [user.email, today],
      );
    } catch (err) {
      console.error("Error recording login date:", err);
    }

    return res.status(200).send({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        fatherName: user.fatherName,
        district: user.district,
        whatsappNumber: user.whatsapp,
        status: user.status,
        email: user.email,
        role: tokenPayload.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, error: "Error logging in" });
  }
};

// forgot password controller
export const forgotPasswordController = async (req, res) => {
  const { email } = req.body;
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(200).send({
        success: true,
        message:
          "If an account with that email exists, a reset link has been sent.",
      });
    }
    const user = rows[0];

    const token = Math.random().toString(36).substr(2, 9);
    const expires = new Date(Date.now() + 3600000); // 1 hour
    await db.execute(
      "INSERT INTO password_resets (email, token, expires) VALUES (?, ?, ?)",
      [email, token, expires],
    );

    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: process.env.MY_GMAIL,
        pass: process.env.MY_PASSWORD,
      },
    });

    // Compose email
    const reciever = {
      from: process.env.MEDMINDS_SERVICE_EMAIL,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.fullName},</p>
        <p>You requested to reset your password. Click below to reset it:</p>
        <a href="${process.env.CLIENT_URL}/reset-password/${token}" 
          style="background:#0d6efd;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;">
          Reset Password
        </a>
        <p>This link will expire in 15 minutes.</p>
      `,
    };
    await transporter.sendMail(reciever);
    return res.status(200).send({
      success: true,
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).send({ success: false, error: "Error processing request" });
  }
};

// reset password controller
export const resetPasswordController = async (req, res) => {
  const { token, password } = req.body;
  if (!password) {
    return res.send("Please provide New Password.");
  }
  if (
    password.length < 8 ||
    !/\d/.test(password) ||
    !/[a-zA-Z]/.test(password)
  ) {
    return res.send(
      "Password must be at least 8 characters and contain at least one number and one letter.",
    );
  }
  try {
    const [rows] = await db.execute(
      "SELECT * FROM password_resets WHERE token = ? AND expires > NOW()",
      [token],
    );
    if (rows.length === 0) {
      return res.send("Invalid or expired token.");
    }
    const email = rows[0].email;
    await db.execute("UPDATE users SET password = ? WHERE email = ?", [
      password,
      email,
    ]);
    await db.execute("DELETE FROM password_resets WHERE token = ?", [token]);
    res.send(
      'Password reset successfully. <a href="/dashboard.html">Login</a>',
    );
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).send("Error resetting password");
  }
};

// Email verification controller for students
export const verifyEmailController = async (req, res) => {
  const { token } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT * FROM users 
       WHERE verificationToken = ? 
       AND verificationTokenExpires > NOW()`,
      [token],
    );

    if (rows.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired verification link",
      });
    }

    const user = rows[0];

    await db.execute(
      `UPDATE users 
       SET isVerified = TRUE,
           verificationToken = NULL,
           verificationTokenExpires = NULL
       WHERE id = ?`,
      [user.id],
    );

    res.json({
      message: "Email verified successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};
