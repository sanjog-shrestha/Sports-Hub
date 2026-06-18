# Sports Hub 🏆

A minimal Node/Express sports app, built as a starting point for a larger
project centered on open-source tools running in Docker.

This is intentionally bare-bones right now — a working app with a mock
scores section and a Postgres-backed teams section — so that more pieces
(caching, real data sources, etc.) can be layered in incrementally.

## Tech stack

- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Frontend:** Static HTML/CSS/JS (no framework, no build step)
- **Containerization:** Docker + Docker Compose

## Project structure

```
sports-docker-app/
├── public/
│   ├── index.html      # Main page
│   ├── style.css        # Styling
│   └── app.js            # Fetches and renders scores
├── db/
│   └── init.sql           # Creates and seeds the teams table on first run
├── server.js              # Express app and routes
├── package.json
├── package-lock.json
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .dockerignore
├── .gitignore
└── README.md
```

## Getting started

### Option 1: Run with Docker (recommended)

```bash
docker compose up --build
```

Then open [http://localhost:3000](http://localhost:3000).

This starts both the app and a Postgres database. On first run, Postgres
executes `db/init.sql`, which creates a `teams` table and seeds it with
some sample data. The database persists between restarts in a named
Docker volume (`pg_data`).

The compose setup bind-mounts the project directory, so changes to the
code are reflected without rebuilding the image (restart the container to
pick up server-side changes).

### Option 2: Run locally without Docker

Requires Node.js 18+ and a running PostgreSQL instance.

```bash
cp .env.example .env   # adjust DATABASE_URL if needed
npm install
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

## API endpoints

| Method | Route           | Description                              |
|--------|-----------------|--------------------------------------------|
| GET    | `/api/health`   | Basic health check (status + uptime)        |
| GET    | `/api/db-health`| Confirms the app can reach Postgres          |
| GET    | `/api/teams`    | Teams stored in Postgres (seeded by init.sql); rendered in the Teams section on the homepage |
| GET    | `/api/scores`   | Mock sports scores (still hardcoded for now); rendered in the Today's Games section |

## License

MIT
