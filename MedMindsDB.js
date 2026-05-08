require("dotenv").config();
const mysql = require("mysql2/promise");

module.exports = mysql
  .createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "medminds",
  })
  .then((connection) => {
    console.log("MySQL Connected");
    return connection;
  })
  .catch((err) => {
    console.error("MySQL Connection Error:", err);
    throw err;
  });
