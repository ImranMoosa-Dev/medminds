import db from "../config/MedMindsDB.js";

const initDB = async () => {
  // =========================
  // Users Table
  // =========================
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fullName VARCHAR(255),
      fatherName VARCHAR(255),
      district VARCHAR(255),
      whatsapp VARCHAR(255),
      status VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      loggedIn BOOLEAN DEFAULT FALSE,
      approved BOOLEAN DEFAULT FALSE,
      isVerified BOOLEAN DEFAULT FALSE,
      verificationToken VARCHAR(255) NULL,
      verificationTokenExpires DATETIME NULL
    )
  `);

  // =========================
  // Questions Table
  // =========================
  await db.execute(`
    CREATE TABLE IF NOT EXISTS questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      testName VARCHAR(255),
      testType VARCHAR(255),
      subject VARCHAR(255),
      chapter VARCHAR(255),
      question TEXT,
      opt1 TEXT,
      opt2 TEXT,
      opt3 TEXT,
      opt4 TEXT,
      correct INT,
      published BOOLEAN DEFAULT FALSE,
      image VARCHAR(255),
      explanation TEXT,
      quiz_only BOOLEAN DEFAULT FALSE
    )
  `);

  // =========================
  // Quizzes Table
  // =========================
  await db.execute(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255),
      date DATETIME,
      results JSON,
      quiz_id INT
    )
  `);

  // =========================
  // Quiz Definitions Table
  // =========================
  await db.execute(`
    CREATE TABLE IF NOT EXISTS quiz_definitions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    subject VARCHAR(255),
    topics TEXT,
    testType VARCHAR(255),
    duration INT,
    totalMcqs INT,

    start_time DATETIME,
    end_time DATETIME,

    is_published BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
  `);

  // =========================
  // Password Resets Table
  // =========================
  await db.execute(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255),
      token VARCHAR(255),
      expires DATETIME
    )
  `);

  // =========================
  // Updates Table
  // =========================
  await db.execute(`
    CREATE TABLE IF NOT EXISTS updates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      image VARCHAR(255),
      published BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // =========================
  // Mistakes Table
  // =========================
  await db.execute(`
    CREATE TABLE IF NOT EXISTS mistakes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255),
      question TEXT,
      options JSON,
      correct INT,
      userAnswer INT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // =========================
  // Question Bank Attempts Table
  // =========================
  await db.execute(`
    CREATE TABLE IF NOT EXISTS q_bank_attempts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255),
      date DATE,
      UNIQUE KEY unique_attempt (email, date)
    )
  `);

  // =========================
  // Login Dates Table
  // =========================
  await db.execute(`
    CREATE TABLE IF NOT EXISTS login_dates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255),
      date DATE,
      UNIQUE KEY unique_login (email, date)
    )
  `);

  // =========================
  // Settings Table
  // =========================
  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      key_name VARCHAR(255) UNIQUE,
      value TEXT
    )
  `);

  // =========================
  // Notes Table
  // =========================
  await db.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      subject VARCHAR(255),
      title VARCHAR(255),
      filename VARCHAR(255),
      originalname VARCHAR(255),
      mimetype VARCHAR(255),
      size INT,
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // =========================
  // Question Bank Answers Table
  // =========================
  await db.execute(`
    CREATE TABLE IF NOT EXISTS q_bank_answers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255),
      question_id INT,
      user_answer INT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_answer (email, question_id)
    )
  `);

  // =========================
  // Default Settings
  // =========================
  await db.execute(
    `INSERT IGNORE INTO settings (key_name, value)
     VALUES (?, ?)`,
    ["syllabus_file", "sample-test.pdf"],
  );

  console.log("Database initialized successfully.");
};

// =========================
// Quiz attempts table
// =========================

await db.execute(`
  CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    percentage DECIMAL(5,2),
    time_taken INT,
    results JSON,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
export default initDB;
