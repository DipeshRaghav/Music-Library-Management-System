# Deploy on Railway (Safest + Easiest)

This project can be deployed as one service (Express serves API + frontend) with a managed MySQL database on Railway.

## 1) Push latest code

Make sure your latest code is on GitHub.

## 2) Create Railway project

1. Go to https://railway.app
2. Click **New Project**
3. Choose **Deploy from GitHub repo**
4. Select your `Music-Library-Management-System` repository

## 3) Add MySQL database

1. Inside the same Railway project, click **New**
2. Select **Database** -> **MySQL**
3. Railway will create DB credentials automatically

## 4) Set app environment variables

In your app service -> **Variables**, set:

- `DB_HOST` = MySQL host from Railway
- `DB_PORT` = MySQL port from Railway
- `DB_USER` = MySQL user from Railway
- `DB_PASSWORD` = MySQL password from Railway
- `DB_NAME` = MySQL database name from Railway
- `PORT` = `5000` (or leave default; Railway can inject this)

## 5) Initialize database schema/data

Open Railway MySQL Query console (or connect with MySQL Workbench using Railway credentials) and run:

1. `schema.sql`
2. `data.sql`

## 6) Deploy and verify

1. Railway auto-builds/redeploys after push
2. Open your generated Railway domain
3. Test:
   - `/api/health` should return `{"status":"ok","db":"connected"}`

## Notes

- Do not upload your local `.env` file to GitHub.
- Keep `.env.example` as template only.
- For production, consider creating a low-privilege DB user.
