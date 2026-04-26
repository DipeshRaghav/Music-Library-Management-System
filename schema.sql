DROP DATABASE IF EXISTS MusicLibrary;
CREATE DATABASE MusicLibrary;
USE MusicLibrary;

CREATE TABLE Artists (
  artist_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(50)
);

CREATE TABLE Genres (
  genre_id INT PRIMARY KEY AUTO_INCREMENT,
  genre_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Albums (
  album_id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  artist_id INT NOT NULL,
  release_year INT,
  FOREIGN KEY (artist_id) REFERENCES Artists(artist_id)
);

CREATE TABLE Tracks (
  track_id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  album_id INT NOT NULL,
  genre_id INT NOT NULL,
  duration INT NOT NULL,
  FOREIGN KEY (album_id) REFERENCES Albums(album_id),
  FOREIGN KEY (genre_id) REFERENCES Genres(genre_id)
);
