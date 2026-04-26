# Music Library Management System

Fresh restart using MySQL + Node.js + Express + vanilla frontend.

## Setup

1. Install dependencies:
   - npm install
2. Create .env from .env.example with valid MySQL credentials.
3. Run SQL scripts in MySQL Workbench:
   - schema.sql
   - data.sql
4. Start app:
   - npm run dev
5. Open:
   - http://localhost:5000

## API

- GET /api/health
- GET /api/genres
- GET /api/tracks?search=&genre=