const express = require("express");
const cors = require("cors");
const pool = require("./db");

require("dotenv").config({ override: true });

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (error) {
    res.status(500).json({ status: "error", db: "disconnected", error: error.message });
  }
});

app.get("/api/genres", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT genre_id, genre_name FROM Genres ORDER BY genre_name");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch genres", error: error.message });
  }
});

app.get("/api/tracks", async (req, res) => {
  const { search = "", genre = "" } = req.query;
  const conditions = [];
  const params = [];

  if (search.trim()) {
    conditions.push("(t.title LIKE ? OR ar.name LIKE ?)");
    params.push(`%${search.trim()}%`, `%${search.trim()}%`);
  }

  if (genre && genre !== "All") {
    conditions.push("g.genre_name = ?");
    params.push(genre);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `
    SELECT
      t.track_id AS id,
      t.title,
      ar.name AS artist,
      al.title AS album,
      g.genre_name AS genre,
      t.duration
    FROM Tracks t
    JOIN Albums al ON t.album_id = al.album_id
    JOIN Artists ar ON al.artist_id = ar.artist_id
    JOIN Genres g ON t.genre_id = g.genre_id
    ${whereClause}
    ORDER BY t.title
  `;

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tracks", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
