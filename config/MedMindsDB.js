import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const connectDB = mysql
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

export default connectDB;
