import db from "../../config/MedMindsDB.js";
export const createQuizTable = async () => {
  await db.execute(`
   CREATE TABLE IF NOT EXISTS quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    subject_id INT NOT NULL,
    topic_id INT NULL,
    batch_id INT NULL,

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
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL
  
    );
    `);
  console.log("Quiz table ready");
};

// Quiz Attempts table
export const createQuizAttempts = async () => {
  await db.execute(`
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,

  user_id INT NOT NULL,
  quiz_id INT NOT NULL,

  questions_json JSON NULL,
  answers JSON NULL,

  current_question INT DEFAULT 0,
  duration_seconds INT DEFAULT 0,
  time_left INT DEFAULT 0,

  score INT DEFAULT 0,
  total_questions INT DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,

  attempt_status ENUM('pending','in_progress','submitted','expired')
    DEFAULT 'pending',

  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);
`);
  console.log("Quiz Attempts Table ready");
};

// Custom Test Attempts Table
export const createCustomTestAttempts = async () => {
  await db.execute(`
  CREATE TABLE IF NOT EXISTS custom_test_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,

  user_id INT NOT NULL,

  selected_subject_ids JSON NOT NULL,
  selected_topic_ids JSON NOT NULL,
  selected_subtopic_ids JSON NOT NULL,

  questions_json JSON NOT NULL,

  answers JSON NULL,

  score INT DEFAULT 0,
  total_questions INT NOT NULL,
  percentage DECIMAL(5,2) DEFAULT 0.00,

  duration_seconds INT NOT NULL,
  time_taken_seconds INT DEFAULT 0,

  status ENUM('pending', 'in_progress', 'submitted', 'expired')
    DEFAULT 'pending',

  current_question INT DEFAULT 0,
  time_left INT DEFAULT 0,

  started_at DATETIME NULL,
  submitted_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
)`);
  console.log("Custom test attemps table ready");
};
