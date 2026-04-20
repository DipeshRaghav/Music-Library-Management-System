-- Delete if already exists (safe reset)
DROP DATABASE IF EXISTS MusicLibrary;

-- Create fresh database
CREATE DATABASE MusicLibrary;
USE MusicLibrary;

-- Artists Table
CREATE TABLE Artists (
    artist_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(50)
);

-- Genres Table
CREATE TABLE Genres (
    genre_id INT PRIMARY KEY AUTO_INCREMENT,
    genre_name VARCHAR(50) NOT NULL UNIQUE
);

-- Albums Table
CREATE TABLE Albums (
    album_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    artist_id INT NOT NULL,
    release_year INT,
    FOREIGN KEY (artist_id) REFERENCES Artists(artist_id)
);

-- Tracks Table
CREATE TABLE Tracks (
    track_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    album_id INT NOT NULL,
    genre_id INT NOT NULL,
    duration INT,
    FOREIGN KEY (album_id) REFERENCES Albums(album_id),
    FOREIGN KEY (genre_id) REFERENCES Genres(genre_id)
);

-- Playlists Table
CREATE TABLE Playlists (
    playlist_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL
);

-- Playlist Tracks (Many-to-Many)
CREATE TABLE Playlist_Tracks (
    playlist_id INT,
    track_id INT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (playlist_id, track_id),
    FOREIGN KEY (playlist_id) REFERENCES Playlists(playlist_id),
    FOREIGN KEY (track_id) REFERENCES Tracks(track_id)
);