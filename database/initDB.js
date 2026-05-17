import db from "../config/MedMindsDB.js";

const initDB = async () => {
  // =========================
  // Batches Table
  // =========================
  await db.execute(`
  CREATE TABLE IF NOT EXISTS batches (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(255) NOT NULL,
    description TEXT,

    duration_months INT DEFAULT 12,

    start_date DATE NULL,
    end_date DATE NULL,

    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT TRUE,

    image VARCHAR(255) NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ON UPDATE CURRENT_TIMESTAMP
  )
`);

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
  // Subjects Table
  // =========================
  await db.execute(`
  CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(255) NOT NULL UNIQUE,
    standard VARCHAR(50) NOT NULL,
    icon VARCHAR(50) DEFAULT '📚',
    color VARCHAR(50) DEFAULT '#0b63b7',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

  // =========================
  // Topics Table
  // =========================
  await db.execute(`
  CREATE TABLE IF NOT EXISTS topics (
    id INT AUTO_INCREMENT PRIMARY KEY,

    subject_id INT NOT NULL,

    name VARCHAR(255) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (subject_id)
      REFERENCES subjects(id)
      ON DELETE CASCADE
  )
`);

  // =========================
  // Subtopics Table
  // =========================
  await db.execute(`
  CREATE TABLE IF NOT EXISTS subtopics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,

    topic_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (topic_id)
      REFERENCES topics(id)
      ON DELETE CASCADE
  )
`);

  // =========================
  // Quizzes Table
  // =========================
  await db.execute(`
   CREATE TABLE IF NOT EXISTS quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    subject_id INT NOT NULL,
    topic_id INT NULL,

    testType VARCHAR(100),

    duration INT DEFAULT 0,
    totalMcqs INT DEFAULT 0,
    passing_marks INT DEFAULT 0,

    quiz_order INT DEFAULT 0,

    start_time DATETIME NULL,
    end_time DATETIME NULL,

    is_published BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
  
    );
    `);
  // =========================
  // Questions Table
  // =========================
  await db.execute(`
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,

  subject_id INT NOT NULL,
  topic_id INT NOT NULL,
  subtopic_id INT NULL,

  question TEXT NOT NULL,

  opt1 TEXT NOT NULL,
  opt2 TEXT NOT NULL,
  opt3 TEXT NOT NULL,
  opt4 TEXT NOT NULL,

  correct INT NOT NULL,

  explanation TEXT,
  image VARCHAR(255),

  is_published BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
  FOREIGN KEY (subtopic_id) REFERENCES subtopics(id) ON DELETE SET NULL
);
  `);

  // =========================
  // Add batch_id to Quizzes Table
  // =========================
  //   await db.execute(`
  //   ALTER TABLE quizzes
  //   ADD COLUMN IF NOT EXISTS batch_id INT NULL,
  //   ADD CONSTRAINT fk_quizzes_batch
  //     FOREIGN KEY (batch_id)
  //     REFERENCES batches(id)
  //     ON DELETE SET NULL
  // `);

  // =========================
  // Question Bank Attempts Table
  // =========================
  // await db.execute(`
  //   CREATE TABLE IF NOT EXISTS q_bank_attempts (
  //     id INT AUTO_INCREMENT PRIMARY KEY,
  //     email VARCHAR(255),
  //     date DATE,
  //     UNIQUE KEY unique_attempt (email, date)
  //   )
  // `);

  // =========================
  // Quiz attempts table
  // =========================

  //   await db.execute(`
  //   CREATE TABLE IF NOT EXISTS quiz_attempts (
  //   id INT AUTO_INCREMENT PRIMARY KEY,

  //   user_id INT NOT NULL,
  //   quiz_id INT NOT NULL,

  //   score INT NOT NULL,
  //   total_questions INT NOT NULL,

  //   percentage DECIMAL(5,2),

  //   time_taken INT,

  //   results JSON,

  //   submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  // );
  // `);
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
  // await db.execute(`
  //   CREATE TABLE IF NOT EXISTS settings (
  //     id INT AUTO_INCREMENT PRIMARY KEY,
  //     key_name VARCHAR(255) UNIQUE,
  //     value TEXT
  //   )
  // `);

  // =========================
  // Notes Table
  // =========================
  // await db.execute(`
  //   CREATE TABLE IF NOT EXISTS notes (
  //     id INT AUTO_INCREMENT PRIMARY KEY,
  //     subject VARCHAR(255),
  //     title VARCHAR(255),
  //     filename VARCHAR(255),
  //     originalname VARCHAR(255),
  //     mimetype VARCHAR(255),
  //     size INT,
  //     uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  //   )
  // `);

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
  //   await db.execute(
  //     `INSERT IGNORE INTO settings (key_name, value)
  //      VALUES (?, ?)`,
  //     ["syllabus_file", "sample-test.pdf"],
  //   );

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
  // await db.execute(`
  //     CREATE TABLE IF NOT EXISTS updates (
  //       id INT AUTO_INCREMENT PRIMARY KEY,
  //       title VARCHAR(255) NOT NULL,
  //       content TEXT NOT NULL,
  //       image VARCHAR(255),
  //       published BOOLEAN DEFAULT TRUE,
  //       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  //     )
  //   `);

  // =========================
  // Mistakes Table
  // =========================
  // await db.execute(`
  //   CREATE TABLE IF NOT EXISTS mistakes (
  //     id INT AUTO_INCREMENT PRIMARY KEY,
  //     email VARCHAR(255),
  //     question TEXT,
  //     options JSON,
  //     correct INT,
  //     userAnswer INT,
  //     date DATETIME DEFAULT CURRENT_TIMESTAMP
  //   )
  // `);
  console.log("Database initialized successfully.");
};
export default initDB;
