const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./db");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/api/genres", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT genre_id, genre_name FROM Genres ORDER BY genre_name"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch genres", error: error.message });
  }
});

app.get("/api/tracks", async (req, res) => {
  const { search, genre } = req.query;
  const where = [];
  const values = [];

  if (search) {
    where.push("(t.title LIKE ? OR ar.name LIKE ?)");
    values.push(`%${search}%`, `%${search}%`);
  }

  if (genre && genre !== "All") {
    where.push("g.genre_name = ?");
    values.push(genre);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const query = `
    SELECT
      t.track_id AS id,
      t.title,
      ar.name AS artist,
      g.genre_name AS genre,
      t.duration,
      al.title AS album
    FROM Tracks t
    JOIN Albums al ON t.album_id = al.album_id
    JOIN Artists ar ON al.artist_id = ar.artist_id
    JOIN Genres g ON t.genre_id = g.genre_id
    ${whereClause}
    ORDER BY t.title
  `;

  try {
    const [rows] = await pool.query(query, values);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tracks", error: error.message });
  }
});

app.get("/api/playlists/:id/tracks", async (req, res) => {
  const playlistId = Number(req.params.id);

  try {
    const [rows] = await pool.query(
      `
      SELECT
        t.track_id AS id,
        t.title,
        ar.name AS artist,
        g.genre_name AS genre,
        t.duration
      FROM Playlist_Tracks pt
      JOIN Tracks t ON pt.track_id = t.track_id
      JOIN Albums al ON t.album_id = al.album_id
      JOIN Artists ar ON al.artist_id = ar.artist_id
      JOIN Genres g ON t.genre_id = g.genre_id
      WHERE pt.playlist_id = ?
      ORDER BY pt.added_at DESC
      `,
      [playlistId]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch playlist tracks", error: error.message });
  }
});

app.post("/api/playlists/:id/tracks", async (req, res) => {
  const playlistId = Number(req.params.id);
  const { trackId } = req.body;

  if (!trackId) {
    return res.status(400).json({ message: "trackId is required" });
  }

  try {
    await pool.query(
      `
      INSERT INTO Playlist_Tracks (playlist_id, track_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE playlist_id = VALUES(playlist_id)
      `,
      [playlistId, trackId]
    );

    res.status(201).json({ message: "Track added to playlist" });
  } catch (error) {
    res.status(500).json({ message: "Failed to add track", error: error.message });
  }
});

app.delete("/api/playlists/:id/tracks/:trackId", async (req, res) => {
  const playlistId = Number(req.params.id);
  const trackId = Number(req.params.trackId);

  try {
    const [result] = await pool.query(
      "DELETE FROM Playlist_Tracks WHERE playlist_id = ? AND track_id = ?",
      [playlistId, trackId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Track not found in playlist" });
    }

    res.json({ message: "Track removed from playlist" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove track", error: error.message });
  }
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (error) {
    res.status(500).json({ status: "error", db: "disconnected", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
