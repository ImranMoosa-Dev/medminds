import db from "../../config/MedMindsDB.js";

// create users table
export const createUsersTable = async () => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      batch_id INT NULL,


      fullName VARCHAR(255),
      fatherName VARCHAR(255),
      district VARCHAR(255),
      whatsapp VARCHAR(255),
      status ENUM("fresher","improver")
      DEFAULT "fresher",

      email VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      
      loggedIn BOOLEAN DEFAULT FALSE,
      approved BOOLEAN DEFAULT FALSE,
      isVerified BOOLEAN DEFAULT FALSE,
     
      verificationToken VARCHAR(255) NULL,
      verificationTokenExpires DATETIME NULL,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     

      CONSTRAINT fk_users_batch
      FOREIGN KEY (batch_id)
      REFERENCES batches(id)
      ON DELETE SET NULL
    )
  `);
  console.log("Users table ready");
};

export const createLoginDatesTable = async () => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS login_dates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255),
      date DATE,
      UNIQUE KEY unique_login (email, date)
    )
  `);
  console.log("Login Dates Table Ready");
};
