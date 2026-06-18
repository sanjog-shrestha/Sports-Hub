# Sports Hub 🏆

A minimal Node/Express sports app, built as a starting point for a larger
project centered on open-source tools running in Docker.

This is intentionally bare-bones right now — a working app with a mock
scores section, a Postgres-backed teams section, a Redis cache-aside
layer in front of both, and a searchable teams dashboard — so that more
pieces (real data sources, auth, live updates, etc.) can be layered in
incrementally.

## Tech stack

- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Cache:** Redis (cache-aside layer for `/api/teams` and `/api/scores`), with a Redis Commander GUI for inspecting cached keys
- **Frontend:** Static HTML/CSS/JS (no framework, no build step)
- **Features:** Team search and filtering (name, city, or league)
- **Containerization:** Docker + Docker Compose

## Project structure

```text
sports-docker-app/
├── public/
│   ├── index.html      # Main page
│   ├── style.css       # Styling
│   └── app.js          # Fetches and renders scores
├── db/
│   └── init.sql        # Creates and seeds the teams table on first run
├── server.js           # Express app and routes
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

```bash
docker compose up --build
```

Then open http://localhost:3000.

This starts the app, a Postgres database, a Redis cache, and a Redis
Commander GUI. On first run, Postgres executes `db/init.sql`, which
creates a `teams` table and seeds it with some sample data. The database
persists between restarts in a named Docker volume (`pg_data`). Redis
needs no setup — it starts empty and just fills in as requests come
through.

Once the stack is up, open http://localhost:8081 to browse the Redis
cache visually.

The compose setup bind-mounts the project directory, so changes to the
code are reflected without rebuilding the image (restart the container to
pick up server-side changes).

## API endpoints

| Method | Route | Description |
|----------|----------|----------|
| GET | `/api/health` | Basic health check (status + uptime) |
| GET | `/api/db-health` | Confirms the app can reach Postgres |
| GET | `/api/cache-health` | Confirms the app can reach Redis (returns 503 if Redis isn't connected) |
| GET | `/api/teams` | Teams stored in Postgres, cached in Redis for 5 minutes |
| GET | `/api/teams/search?q=<query>` | Search teams by name, city, or league; results are cached in Redis |
| GET | `/api/scores` | Mock sports scores, cached in Redis for 30 seconds |

Both cached routes return an `X-Cache` response header (`HIT`, `MISS`,
`BYPASS`, or `SKIP`) so you can see caching behavior directly:

```bash
curl -i http://localhost:3000/api/teams | grep -i x-cache
```

## Team Search

The Teams dashboard includes a real-time search feature that allows users
to filter teams by:

- Team name
- City
- League

### Examples

```text
Lakers      -> Lakers
NBA         -> NBA teams
Boston      -> Teams from Boston
EPL         -> Premier League teams
```

### Search Endpoint

```text
GET /api/teams/search?q=<query>
```

### Redis Cache Keys

```text
teams:search:lakers
teams:search:nba
teams:search:boston
```

The frontend uses a debounced search input to reduce unnecessary API
requests while typing.

## Redis Commander (cache GUI)

The stack includes Redis Commander, a browser-based GUI for inspecting
the cache.

After `docker compose up`, open:

http://localhost:8081

Hit `/api/teams`, `/api/scores`, or perform a team search. You'll see:

```text
teams:all
scores:all
teams:search:*
```

along with their values and TTL countdowns.

## License

MIT
