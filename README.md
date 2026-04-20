# 🎵 Music Library Management System

A full-stack SQL project using **MySQL + Node.js + Express + HTML/CSS/JS**.

## Features
- Manage core entities: artists, albums, tracks, genres, and playlists
- Search tracks by title/artist
- Filter tracks by genre
- Add/remove tracks from a playlist
- View playlist genre analytics with Chart.js

## Tech Stack
- **Database:** MySQL
- **Backend:** Node.js, Express, mysql2
- **Frontend:** Vanilla JavaScript, HTML, CSS

## Project Structure
- `schema.sql` -> database schema
- `data.sql` -> sample seed data
- `server.js` -> Express API + static file hosting
- `db.js` -> MySQL connection pool
- `public/` -> website files

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in project root:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=MusicLibrary
   PORT=5000
   ```

3. In MySQL, run:
   ```sql
   SOURCE schema.sql;
   SOURCE data.sql;
   ```

4. Start the app:
   ```bash
   npm run dev
   ```

5. Open:
   - [http://localhost:5000](http://localhost:5000)

## API Endpoints
- `GET /api/health`
- `GET /api/genres`
- `GET /api/tracks?search=&genre=`
- `GET /api/playlists/:id/tracks`
- `POST /api/playlists/:id/tracks`
- `DELETE /api/playlists/:id/tracks/:trackId`
