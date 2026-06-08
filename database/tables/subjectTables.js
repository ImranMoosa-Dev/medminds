import db from "../../config/MedMindsDB.js";

// Create Subject table
export const createSubjectTable = async () => {
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
  console.log("subject table ready");
};

export const createTopicTable = async () => {
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
  console.log("topic table ready");
};

export const createSubtopicTable = async () => {
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
  console.log("subtopic table ready");
};

// Create Question Table
export const createQuestionTable = async () => {
  await db.execute(`
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,

  quiz_id INT NOT NULL,

  subject_id INT NOT NULL,
  topic_id INT NULL,
  subtopic_id INT NULL,

  question TEXT NOT NULL,

  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,

  correct_answer ENUM('a','b','c','d') NOT NULL,

  explanation TEXT,
  image VARCHAR(255),

  is_published BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (quiz_id)
    REFERENCES quizzes(id)
    ON DELETE CASCADE,

  FOREIGN KEY (subject_id)
    REFERENCES subjects(id)
    ON DELETE CASCADE,

  FOREIGN KEY (topic_id)
    REFERENCES topics(id)
    ON DELETE CASCADE,

  FOREIGN KEY (subtopic_id)
    REFERENCES subtopics(id)
    ON DELETE SET NULL

);`);
  console.log("Question Table Ready");
};
