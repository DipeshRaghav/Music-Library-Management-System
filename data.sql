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

INSERT INTO Tracks (title, album_id, genre_id, duration) VALUES
("Tum Hi Ho", 1, 1, 250),
("Raabta", 2, 1, 240),
("Doorie", 3, 3, 230),
("Jeene Laga Hoon", 1, 2, 260);
