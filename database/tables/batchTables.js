import db from "../../config/MedMindsDB.js";

export const createBatchesTable = async () => {
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
  console.log("Batches Table Ready");
};

// Batch Schedules table creation
export const createBatchSchedulesTable = async () => {
  await db.execute(`
  CREATE TABLE IF NOT EXISTS batch_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,

  batch_id INT NOT NULL,

  test_no INT NOT NULL,
  date DATE NOT NULL,
  day VARCHAR(20),
  subject VARCHAR(100),
  chapter TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (batch_id)
    REFERENCES batches(id)
    ON DELETE CASCADE
);`);
  console.log("Batch schedules table ready");
};

// Enrollment Requests table creation
export const createEnrollmentRequestsTable = async () => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS enrollment_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,
    batch_id INT NOT NULL,

    father_name VARCHAR(255),
    district VARCHAR(255),
    status ENUM('fresher', 'improver')
    DEFAULT 'fresher',

    approval_status ENUM('pending', 'approved', 'denied')
    DEFAULT 'pending',

    reviewed_by INT NULL,        
    reviewed_at DATETIME NULL,  

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_enroll_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_enroll_batch
    FOREIGN KEY (batch_id) REFERENCES batches(id)
    ON DELETE CASCADE
);`);
  console.log("Enrollment requests table ready");
};
