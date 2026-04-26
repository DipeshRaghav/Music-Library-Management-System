const mysql = require("mysql2/promise");
require("dotenv").config({ override: true });

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "MusicLibrary",
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
