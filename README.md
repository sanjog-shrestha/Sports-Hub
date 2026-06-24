# Sports Hub 🏆

A Dockerized sports application built with Node.js, Express, PostgreSQL, and Redis.

## Features

- Live sports scores dashboard
- PostgreSQL-backed teams database
- Redis cache-aside caching
- Team search
- Favorite teams
- Team details modal
- Player rosters
- Redis Commander integration
- Docker deployment

## API Endpoints

| Method | Endpoint |
|----------|----------|
| GET | /api/health |
| GET | /api/db-health |
| GET | /api/cache-health |
| GET | /api/teams |
| GET | /api/teams/search?q=query |
| GET | /api/teams/:id |
| GET | /api/teams/:id/players |
| GET | /api/favorites |
| POST | /api/favorites/:id |
| DELETE | /api/favorites/:id |
| GET | /api/scores |

## Redis Keys

- teams:all
- scores:all
- teams:search:*
- team:*
- roster:*
- favorites

## Roadmap

- Live Score Updates (WebSockets)
- Prometheus Metrics
- Authentication
- Admin Dashboard

## License

MIT
