# Sports Hub 🏆

A minimal Node/Express sports app, built as a starting point for a larger
project centered on open-source tools running in Docker.

This is intentionally bare-bones right now — a working app with a mock
scores section, a Postgres-backed teams section, and a Redis cache-aside
layer in front of both — so that more pieces (real data sources, auth,
etc.) can be layered in incrementally.

## Tech stack

- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Cache:** Redis (cache-aside layer for `/api/teams` and `/api/scores`), with a Redis Commander GUI for inspecting cached keys
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

```bash
docker compose up --build
```

Then open [http://localhost:3000](http://localhost:3000).

This starts the app, a Postgres database, a Redis cache, and a Redis
Commander GUI. On first run, Postgres executes `db/init.sql`, which
creates a `teams` table and seeds it with some sample data. The database
persists between restarts in a named Docker volume (`pg_data`). Redis
needs no setup — it starts empty and just fills in as requests come
through.

Once the stack is up, open [http://localhost:8081](http://localhost:8081)
to browse the Redis cache visually — you'll see `teams:all` and
`scores:all` appear (with their TTL countdown) after hitting those
endpoints at least once.

The compose setup bind-mounts the project directory, so changes to the
code are reflected without rebuilding the image (restart the container to
pick up server-side changes).

## API endpoints

| Method | Route              | Description                              |
|--------|--------------------|--------------------------------------------|
| GET    | `/api/health`      | Basic health check (status + uptime)        |
| GET    | `/api/db-health`   | Confirms the app can reach Postgres          |
| GET    | `/api/cache-health`| Confirms the app can reach Redis (returns 503 if Redis isn't connected) |
| GET    | `/api/teams`       | Teams stored in Postgres (seeded by init.sql), cached in Redis for 5 minutes; rendered in the Teams section on the homepage |
| GET    | `/api/scores`      | Mock sports scores (still hardcoded for now), cached in Redis for 30 seconds; rendered in the Today's Games section |

Both cached routes return an `X-Cache` response header (`HIT`, `MISS`,
`BYPASS`, or `SKIP`) so you can see caching behavior directly, e.g.:

```bash
curl -i http://localhost:3000/api/teams | grep -i x-cache
```

## Redis Commander (cache GUI)

The stack includes [Redis Commander](https://github.com/joeferner/redis-commander),
a browser-based GUI for inspecting the cache. It runs as its own service in
`docker-compose.yml`:

```yaml
redis-commander:
  image: rediscommander/redis-commander:latest
  container_name: sports-redis-commander
  environment:
    # Format is label:host:port — "cache" is the Redis service name.
    - REDIS_HOSTS=local:cache:6379
  ports:
    - "8081:8081"
  depends_on:
    cache:
      condition: service_healthy
  restart: unless-stopped
```

After `docker compose up`, open [http://localhost:8081](http://localhost:8081).
Hit `/api/teams` and `/api/scores` at least once, then you'll see the
`teams:all` and `scores:all` keys, their values, and their TTLs counting
down. You can also delete keys here to force a fresh cache miss without
using `redis-cli`.

## License

MIT
