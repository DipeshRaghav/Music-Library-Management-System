USE MusicLibrary;
-- CRUD OPERATIONS
-- CREATE (already done in data.sql)
-- READ
SELECT * FROM Tracks;

SELECT t.title, a.name AS artist
FROM Tracks t
JOIN Albums al ON t.album_id = al.album_id
JOIN Artists a ON al.artist_id = a.artist_id;

-- UPDATE
UPDATE Tracks
SET duration = 260
WHERE track_id = 1;

-- DELETE (keep at end when executing)
-- DELETE FROM Tracks WHERE track_id = 1;
-- =========================
-- SEARCH QUERIES
-- =========================
-- Search by Title
SELECT * FROM Tracks
WHERE title LIKE '%Ho%';

-- Search by Artist
SELECT t.title, a.name
FROM Tracks t
JOIN Albums al ON t.album_id = al.album_id
JOIN Artists a ON al.artist_id = a.artist_id
WHERE a.name = 'Arijit Singh';
-- Search by Genre
SELECT t.title, g.genre_name
FROM Tracks t
JOIN Genres g ON t.genre_id = g.genre_id
WHERE g.genre_name = 'Romantic';

-- =========================
-- PLAYLIST OPERATIONS
-- =========================

-- View Playlist Songs
SELECT p.name AS playlist, t.title
FROM Playlist_Tracks pt
JOIN Playlists p ON pt.playlist_id = p.playlist_id
JOIN Tracks t ON pt.track_id = t.track_id;

-- =========================
-- ANALYSIS QUERIES
-- =========================
-- Count Songs per Genre
SELECT g.genre_name, COUNT(t.track_id) AS total_songs
FROM Tracks t
JOIN Genres g ON t.genre_id = g.genre_id
GROUP BY g.genre_name;
-- Total Duration per Artist
SELECT a.name, SUM(t.duration) AS total_duration
FROM Tracks t
JOIN Albums al ON t.album_id = al.album_id
JOIN Artists a ON al.artist_id = a.artist_id
GROUP BY a.name;
-- Most Popular Genre
SELECT g.genre_name, COUNT(*) AS count
FROM Tracks t
JOIN Genres g ON t.genre_id = g.genre_id
GROUP BY g.genre_name
ORDER BY count DESC
LIMIT 1;