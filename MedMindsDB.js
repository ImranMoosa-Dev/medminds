const mysql = require("mysql2/promise");

module.exports = mysql
  .createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "medminds",
  })
  .then((connection) => {
    console.log("MySQL Connected");
    return connection;
  })
  .catch((err) => {
    console.error("MySQL Connection Error:", err);
    throw err;
  });
