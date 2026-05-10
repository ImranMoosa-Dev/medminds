import dotenv from "dotenv";
import mysql from "mysql2/promise";
import colors from "colors";

dotenv.config();

const db = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "medminds",
});

console.log("MySQL Connected".bgGreen.white);

export default db;
