USE MusicLibrary;

INSERT INTO Artists (name, country) VALUES
("Arijit Singh", "India"),
("Shreya Ghoshal", "India"),
("Atif Aslam", "Pakistan");

INSERT INTO Genres (genre_name) VALUES
("Romantic"),
("Pop"),
("Sad");

INSERT INTO Albums (title, artist_id, release_year) VALUES
("Aashiqui 2", 1, 2013),
("Raabta", 2, 2017),
("Doorie", 3, 2006);

INSERT INTO Albums (title, artist_id, release_year) VALUES
("Shershaah", 1, 2021),
("Melodies", 3, 2022),
("Romance Reloaded", 2, 2020);

INSERT INTO Tracks (title, album_id, genre_id, duration) VALUES
("Tum Hi Ho", 1, 1, 250),
("Raabta", 2, 1, 240),
("Doorie", 3, 3, 230),
("Jeene Laga Hoon", 1, 2, 260);

INSERT INTO Tracks (title, album_id, genre_id, duration) VALUES
("Chahun Main Ya Naa", 1, 1, 231),
("Sun Raha Hai", 1, 3, 221),
("Hamari Adhuri Kahani", 1, 1, 246),
("Phir Bhi Tumko Chaahunga", 2, 1, 279),
("Raat Bhar", 2, 2, 255),
("Piya O Re Piya", 2, 1, 248),
("Tere Bin", 3, 3, 236),
("Aadat", 3, 3, 263),
("Tera Hua", 4, 1, 242),
("Ranjha", 4, 1, 253),
("Tu Hai Kahan", 5, 3, 228),
("Pehli Dafa", 5, 2, 245),
("Agar Tum Mil Jao", 6, 1, 238),
("Mere Dholna Reimagined", 6, 2, 234);

INSERT INTO Playlists (name) VALUES
("Favorites"),
("Chill Mix");

INSERT INTO Playlist_Tracks (playlist_id, track_id) VALUES
(1, 1),
(1, 4),
(2, 2);
