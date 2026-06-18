# Sports Hub 🏆

A minimal Node/Express sports app, built as a starting point for a larger
project centered on open-source tools running in Docker.

This is intentionally bare-bones right now — a working app with a mock
scores API and a simple frontend — so that more pieces (databases, caching,
real data sources, etc.) can be layered in incrementally.

## Tech stack

- **Backend:** Node.js + Express
- **Frontend:** Static HTML/CSS/JS (no framework, no build step)
- **Containerization:** Docker + Docker Compose

## Project structure

```
sports-docker-app/
├── public/
│   ├── index.html      # Main page
│   ├── style.css        # Styling
│   └── app.js            # Fetches and renders scores
├── server.js              # Express app and routes
├── package.json
├── package-lock.json
├── Dockerfile
├── docker-compose.yml
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

The compose setup bind-mounts the project directory, so changes to the
code are reflected without rebuilding the image (restart the container to
pick up server-side changes).

### Option 2: Run locally without Docker

Requires Node.js 18+.

```bash
npm install
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

## API endpoints

| Method | Route          | Description                          |
|--------|----------------|---------------------------------------|
| GET    | `/api/health`  | Basic health check (status + uptime)  |
| GET    | `/api/scores`  | Mock sports scores (hardcoded for now)|

## License

MIT
