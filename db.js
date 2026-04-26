const mysql = require("mysql2/promise");
require("dotenv").config({ override: true });

const baseOptions = {
  waitForConnections: true,
  connectionLimit: 10,
};

const pool = process.env.MYSQL_URL
  ? mysql.createPool({
      uri: process.env.MYSQL_URL,
      ...baseOptions,
    })
  : mysql.createPool({
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "MusicLibrary",
      ...baseOptions,
    });

module.exports = pool;
