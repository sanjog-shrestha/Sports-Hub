# Sports Hub 🏆

A minimal Node/Express sports application built with Docker, PostgreSQL, and Redis.

## Features

- Mock sports scores dashboard
- PostgreSQL-backed teams database
- Redis cache-aside layer
- Team search and filtering
- Favorite teams with Redis persistence
- Redis Commander integration
- Dockerized development environment

## Tech Stack

- Node.js + Express
- PostgreSQL
- Redis
- Vanilla HTML/CSS/JavaScript
- Docker & Docker Compose

## API Endpoints

| Method | Route | Description |
|----------|----------|----------|
| GET | `/api/health` | Application health |
| GET | `/api/db-health` | PostgreSQL health |
| GET | `/api/cache-health` | Redis health |
| GET | `/api/teams` | Get all teams |
| GET | `/api/teams/search?q=<query>` | Search teams |
| GET | `/api/favorites` | Get favorite teams |
| POST | `/api/favorites/:id` | Add favorite team |
| DELETE | `/api/favorites/:id` | Remove favorite team |
| GET | `/api/scores` | Get scores |

## Team Search

Search teams by:

- Team name
- City
- League

Example:

GET /api/teams/search?q=lakers

Redis search cache keys:

- teams:search:lakers
- teams:search:nba
- teams:search:boston

## Favorite Teams

Store and manage favorite teams using Redis Sets.

Endpoints:

- GET /api/favorites
- POST /api/favorites/:id
- DELETE /api/favorites/:id

Redis commands used:

- SADD
- SREM
- SMEMBERS

Redis key:

- favorites

## Redis Commander

Available at:

http://localhost:8081

Example keys:

- teams:all
- scores:all
- teams:search:*
- favorites

## Roadmap

- Team Details Page
- Player Rosters
- Live WebSocket Scores
- Prometheus Metrics
- Authentication

## License

MIT
