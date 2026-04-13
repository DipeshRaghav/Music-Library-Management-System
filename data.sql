USE MusicLibrary;
-- Artists
INSERT INTO Artists (name, country) VALUES
('Arijit Singh', 'India'),
('Shreya Ghoshal', 'India'),
('Atif Aslam', 'Pakistan');
-- Genres
INSERT INTO Genres (genre_name) VALUES
('Romantic'),
('Pop'),
('Sad');
-- Albums
INSERT INTO Albums (title, artist_id, release_year) VALUES
('Aashiqui 2', 1, 2013),
('Raabta', 2, 2017),
('Doorie', 3, 2006);
-- Tracks
INSERT INTO Tracks (title, album_id, genre_id, duration) VALUES
('Tum Hi Ho', 1, 1, 250),
('Raabta', 2, 1, 240),
('Doorie', 3, 3, 230),
('Jeene Laga Hoon', 1, 2, 260);
-- Playlists
INSERT INTO Playlists (name) VALUES
('My Favorites'),
('Chill Songs');
-- Playlist Tracks
INSERT INTO Playlist_Tracks (playlist_id, track_id) VALUES
(1,1),
(1,2),
(2,3),
(2,4);