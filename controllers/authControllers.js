// Signup controller
export const signupController = async (req, res) => {
  const {
    fullName,
    fatherName,
    district,
    whatsappNumber,
    status,
    email,
    password,
    confirmPassword,
  } = req.body;
  if (password !== confirmPassword) {
    return res.json({ error: "Passwords do not match." });
  }
  if (
    password.length < 8 ||
    !/\d/.test(password) ||
    !/[a-zA-Z]/.test(password)
  ) {
    return res.json({
      error:
        "Password must be at least 8 characters and contain at least one number and one letter.",
    });
  }
  try {
    await db.execute(
      "INSERT INTO users (fullName, fatherName, district, whatsapp, status, email, password, loggedIn, approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        fullName,
        fatherName,
        district,
        whatsappNumber,
        status,
        email,
        password,
        false,
        false,
      ],
    );
    res.json({
      success: true,
      message: "Signup successful. Your account is pending admin approval.",
      redirect: "/dashboard.html",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error signing up" });
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
      return res.json({ error: "Invalid credentials" });
    }

    const user = rows[0];

    if (user.password !== password) {
      return res.json({ error: "Invalid credentials" });
    }

    if (
      user.email !== "biologia.info1@gmail.com" &&
      user.email !== "admin@medminds.com"
    ) {
      if (!user.approved) {
        return res.json({ error: "Your account is pending admin approval." });
      }
    }

    await db.execute("UPDATE users SET loggedIn=? WHERE email=?", [
      true,
      user.email,
    ]);

    req.session.user = user.email;

    const tokenPayload = {
      email: user.email,
      role:
        user.email === "biologia.info1@gmail.com" ||
        user.email === "admin@medminds.com"
          ? "admin"
          : "student",
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.cookie(JWT_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: NODE_ENV === "production",
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

    let redirectUrl = "/home.html";
    if (
      user.email === "biologia.info1@gmail.com" ||
      user.email === "admin@medminds.com"
    ) {
      redirectUrl = "/admin-menu.html";
    }
    // Use returnUrl if provided and valid
    if (returnUrl && returnUrl.startsWith("/")) {
      redirectUrl = returnUrl;
    }

    res.json({
      success: true,
      message: "Login successful",
      redirect: redirectUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error logging in" });
  }
};

export const forgotPasswordController = async (req, res) => {
  const { email } = req.body;
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.json({
        success: true,
        message:
          "If an account with that email exists, a reset link has been sent.",
      });
    }
    const token = Math.random().toString(36).substr(2, 9);
    const expires = new Date(Date.now() + 3600000); // 1 hour
    await db.execute(
      "INSERT INTO password_resets (email, token, expires) VALUES (?, ?, ?)",
      [email, token, expires],
    );
    const resetLink = `http://localhost:3000/reset-password/${token}`;
    console.log(`Reset link for ${email}: ${resetLink}`);
    res.json({
      success: true,
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Error processing request" });
  }
};
