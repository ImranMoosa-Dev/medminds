import db from "../config/MedMindsDB.js";
import {
  createUsersTable,
  createLoginDatesTable,
} from "./tables/userTables.js";
import {
  createBatchesTable,
  createBatchSchedulesTable,
  createEnrollmentRequestsTable,
} from "./tables/batchTables.js";
import {
  createSubjectTable,
  createTopicTable,
  createSubtopicTable,
  createQuestionTable,
} from "./tables/subjectTables.js";
import {
  createQuizTable,
  createQuizAttempts,
  createCustomTestAttempts,
} from "./tables/quizTables.js";

const initDB = async () => {
  // Create users table
  await createUsersTable();

  // Create login dates table
  await createLoginDatesTable();

  // Create batches table
  await createBatchesTable();

  // Create batch schedules table
  await createBatchSchedulesTable();

  // Create enrollment_requests table
  await createEnrollmentRequestsTable();

  // Create subjects, topics, and subtopics tables
  await createSubjectTable();
  await createTopicTable();
  await createSubtopicTable();

  // Quizzes Table
  await createQuizTable();

  // Quiz attempts table
  await createQuizAttempts();

  // Custom test attempts table
  await createCustomTestAttempts();

  // Questions Table
  await createQuestionTable;

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

  // seeding batch_schedules

  // await db.execute(`INSERT INTO batch_schedules (batch_id, test_no, date, day, subject, chapter)
  // VALUES
  // (5, 1, '2026-06-01', 'Monday', 'Biology', 'Cell Structure'),
  // (5, 2, '2026-06-03', 'Wednesday', 'Physics', 'Motion'),
  // (5, 3, '2026-06-05', 'Friday', 'Chemistry', 'Atoms and Molecules'),
  // (5, 4, '2026-06-07', 'Sunday', 'Biology', 'Enzymes');`);

  // =========================
  // Seed Batches
  // =========================

  //   await db.execute(`
  //   INSERT INTO batches
  //     (name, description, duration_months, start_date, end_date, is_active, is_featured, image)
  //   VALUES
  //     (
  //       'JST Preparation Batch 2026',
  //       'Complete Junior Science Teacher preparation with tests, notes, and MCQs.',
  //       12,
  //       '2026-01-01',
  //       '2026-12-31',
  //       TRUE,
  //       TRUE,
  //       'jst-batch.jpg'
  //     ),

  //     (
  //       'Matric Science Batch',
  //       'Science preparation batch for matric students with chapter-wise quizzes.',
  //       10,
  //       '2026-03-01',
  //       '2026-12-31',
  //       TRUE,
  //       FALSE,
  //       'matric-science.jpg'
  //     ),

  //     (
  //       'Intermediate Pre-Medical Batch',
  //       'Preparation batch for FSC Pre-Medical students.',
  //       24,
  //       '2026-02-15',
  //       '2027-02-15',
  //       TRUE,
  //       TRUE,
  //       'premedical.jpg'
  //     ),

  //     (
  //       'Entry Test Crash Course',
  //       'Short duration crash course for MDCAT and engineering entry tests.',
  //       3,
  //       '2026-06-01',
  //       '2026-08-31',
  //       TRUE,
  //       TRUE,
  //       'entry-test.jpg'
  //     ),

  //     (
  //       'Computer Science Fundamentals',
  //       'Programming and computer science basics for beginners.',
  //       6,
  //       '2026-04-01',
  //       '2026-10-01',
  //       TRUE,
  //       FALSE,
  //       'cs-fundamentals.jpg'
  //     )
  // `);

  console.log("Database initialized successfully.");
};
export default initDB;
