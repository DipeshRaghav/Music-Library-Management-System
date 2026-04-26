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

app.get("/api/artists", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT artist_id, name, country FROM Artists ORDER BY name");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch artists", error: error.message });
  }
});

app.post("/api/artists", async (req, res) => {
  const { name, country = null } = req.body;

  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }

  try {
    const [result] = await pool.query("INSERT INTO Artists (name, country) VALUES (?, ?)", [
      name.trim(),
      country ? country.trim() : null,
    ]);
    res.status(201).json({ id: result.insertId, message: "Artist created" });
  } catch (error) {
    res.status(500).json({ message: "Failed to create artist", error: error.message });
  }
});

app.put("/api/artists/:id", async (req, res) => {
  const artistId = Number(req.params.id);
  const { name, country = null } = req.body;

  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }

  try {
    const [result] = await pool.query("UPDATE Artists SET name = ?, country = ? WHERE artist_id = ?", [
      name.trim(),
      country ? country.trim() : null,
      artistId,
    ]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Artist not found" });
    }

    res.json({ message: "Artist updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update artist", error: error.message });
  }
});

app.delete("/api/artists/:id", async (req, res) => {
  const artistId = Number(req.params.id);

  try {
    const [result] = await pool.query("DELETE FROM Artists WHERE artist_id = ?", [artistId]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Artist not found" });
    }

    res.json({ message: "Artist deleted" });
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({ message: "Cannot delete artist linked to existing albums" });
    }
    res.status(500).json({ message: "Failed to delete artist", error: error.message });
  }
});

app.get("/api/albums", async (req, res) => {
  const { artistId = "" } = req.query;
  const params = [];
  let whereClause = "";

  if (artistId) {
    whereClause = "WHERE artist_id = ?";
    params.push(Number(artistId));
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT
        al.album_id,
        al.title,
        al.artist_id,
        al.release_year,
        ar.name AS artist_name
      FROM Albums al
      JOIN Artists ar ON al.artist_id = ar.artist_id
      ${whereClause ? whereClause.replace("artist_id", "al.artist_id") : ""}
      ORDER BY al.title
      `,
      params
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch albums", error: error.message });
  }
});

app.post("/api/albums", async (req, res) => {
  const { title, artistId, releaseYear = null } = req.body;

  if (!title || !artistId) {
    return res.status(400).json({ message: "title and artistId are required" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO Albums (title, artist_id, release_year) VALUES (?, ?, ?)",
      [title.trim(), Number(artistId), releaseYear ? Number(releaseYear) : null]
    );
    res.status(201).json({ id: result.insertId, message: "Album created" });
  } catch (error) {
    res.status(500).json({ message: "Failed to create album", error: error.message });
  }
});

app.put("/api/albums/:id", async (req, res) => {
  const albumId = Number(req.params.id);
  const { title, artistId, releaseYear = null } = req.body;

  if (!title || !artistId) {
    return res.status(400).json({ message: "title and artistId are required" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE Albums SET title = ?, artist_id = ?, release_year = ? WHERE album_id = ?",
      [title.trim(), Number(artistId), releaseYear ? Number(releaseYear) : null, albumId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Album not found" });
    }

    res.json({ message: "Album updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update album", error: error.message });
  }
});

app.delete("/api/albums/:id", async (req, res) => {
  const albumId = Number(req.params.id);

  try {
    const [result] = await pool.query("DELETE FROM Albums WHERE album_id = ?", [albumId]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Album not found" });
    }

    res.json({ message: "Album deleted" });
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({ message: "Cannot delete album linked to existing tracks" });
    }
    res.status(500).json({ message: "Failed to delete album", error: error.message });
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
      t.album_id AS albumId,
      t.genre_id AS genreId,
      ar.name AS artist,
      ar.artist_id AS artistId,
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

app.post("/api/tracks", async (req, res) => {
  const { title, albumId, genreId, duration } = req.body;

  if (!title || !albumId || !genreId || !duration) {
    return res.status(400).json({ message: "title, albumId, genreId and duration are required" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO Tracks (title, album_id, genre_id, duration) VALUES (?, ?, ?, ?)",
      [title.trim(), Number(albumId), Number(genreId), Number(duration)]
    );
    res.status(201).json({ id: result.insertId, message: "Track created" });
  } catch (error) {
    res.status(500).json({ message: "Failed to create track", error: error.message });
  }
});

app.put("/api/tracks/:id", async (req, res) => {
  const trackId = Number(req.params.id);
  const { title, albumId, genreId, duration } = req.body;

  if (!title || !albumId || !genreId || !duration) {
    return res.status(400).json({ message: "title, albumId, genreId and duration are required" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE Tracks SET title = ?, album_id = ?, genre_id = ?, duration = ? WHERE track_id = ?",
      [title.trim(), Number(albumId), Number(genreId), Number(duration), trackId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Track not found" });
    }

    res.json({ message: "Track updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update track", error: error.message });
  }
});

app.delete("/api/tracks/:id", async (req, res) => {
  const trackId = Number(req.params.id);

  try {
    const [result] = await pool.query("DELETE FROM Tracks WHERE track_id = ?", [trackId]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Track not found" });
    }

    res.json({ message: "Track deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete track", error: error.message });
  }
});

app.get("/api/playlists", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT playlist_id, name FROM Playlists ORDER BY name");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch playlists", error: error.message });
  }
});

app.post("/api/playlists", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }

  try {
    const [result] = await pool.query("INSERT INTO Playlists (name) VALUES (?)", [name.trim()]);
    res.status(201).json({ id: result.insertId, message: "Playlist created" });
  } catch (error) {
    res.status(500).json({ message: "Failed to create playlist", error: error.message });
  }
});

app.delete("/api/playlists/:id", async (req, res) => {
  const playlistId = Number(req.params.id);

  try {
    const [result] = await pool.query("DELETE FROM Playlists WHERE playlist_id = ?", [playlistId]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    res.json({ message: "Playlist deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete playlist", error: error.message });
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
        t.duration,
        ar.name AS artist,
        al.title AS album,
        g.genre_name AS genre
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
      ON DUPLICATE KEY UPDATE added_at = CURRENT_TIMESTAMP
      `,
      [playlistId, Number(trackId)]
    );
    res.status(201).json({ message: "Track added to playlist" });
  } catch (error) {
    res.status(500).json({ message: "Failed to add track to playlist", error: error.message });
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
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Track not found in playlist" });
    }
    res.json({ message: "Track removed from playlist" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove track from playlist", error: error.message });
  }
});

app.get("/api/playlists/:id/stats", async (req, res) => {
  const playlistId = Number(req.params.id);

  try {
    const [rows] = await pool.query(
      `
      SELECT g.genre_name AS genre, COUNT(*) AS total
      FROM Playlist_Tracks pt
      JOIN Tracks t ON pt.track_id = t.track_id
      JOIN Genres g ON t.genre_id = g.genre_id
      WHERE pt.playlist_id = ?
      GROUP BY g.genre_name
      ORDER BY total DESC
      `,
      [playlistId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch playlist stats", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
