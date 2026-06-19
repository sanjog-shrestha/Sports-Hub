# Sports Hub 🏆

A minimal Node.js + Express sports application built with Docker, PostgreSQL, and Redis.

## Features

### Core Features
- Live sports scores dashboard (mock data)
- PostgreSQL-backed teams database
- Redis cache-aside layer
- Dockerized deployment

### Team Search
- Search teams by name, city, or league
- Redis-cached search results
- Debounced frontend search

### Favorite Teams
- Add teams to favorites
- Remove teams from favorites
- Persist favorites in Redis
- Uses Redis Sets (SADD, SREM, SMEMBERS)

### Team Details
- Team details endpoint: `/api/teams/:id`
- Individual team caching in Redis
- Team details modal UI

## Tech Stack

- Node.js + Express
- PostgreSQL
- Redis
- HTML, CSS, JavaScript
- Docker & Docker Compose

## API Endpoints

| Method | Endpoint | Description |
|----------|----------|----------|
| GET | /api/health | Application health |
| GET | /api/db-health | PostgreSQL health |
| GET | /api/cache-health | Redis health |
| GET | /api/teams | Get all teams |
| GET | /api/teams/search?q=query | Search teams |
| GET | /api/teams/:id | Get team details |
| GET | /api/favorites | Get favorites |
| POST | /api/favorites/:id | Add favorite |
| DELETE | /api/favorites/:id | Remove favorite |
| GET | /api/scores | Get scores |

## Redis Keys

- teams:all
- scores:all
- teams:search:*
- team:*
- favorites

## Verification

### Team Search

GET /api/teams/search?q=lakers

### Team Details

GET /api/teams/1

### Favorites

POST /api/favorites/1

GET /api/favorites

DELETE /api/favorites/1

## Redis Commander

http://localhost:8081

Expected keys:

- teams:all
- scores:all
- teams:search:*
- team:*
- favorites

## Roadmap

- Player Rosters
- Live Score Updates (WebSockets)
- Prometheus Metrics
- Authentication
- Admin Dashboard

## License

MIT
