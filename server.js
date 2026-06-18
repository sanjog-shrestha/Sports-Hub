const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const { createClient } = require('redis');

const app = express();
const PORT = process.env.PORT || 3000;

// Connection string is provided by docker-compose for the containerized setup; the fallback lets the app still boot for non-DB routes when running locally without Postgres.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://sports:sports@localhost:5432/sports'
});

// --- Redis cache layer ---------------------------------------------------
// Cache-aside in front of /api/teams and /api/scores. If Redis is
// unreachable, the app serves requests uncached instead of failing.

// In docker-compose REDIS_URL is redis://cache:6379 ("cache" = service name);
// the localhost fallback is for running outside Docker.
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// createClient() only builds the client — connection happens via .connect()
// below, fired in the background so a missing Redis never blocks startup.
// redisReady tracks usability (the client signals connection state through
// events, not exceptions); routes run in BYPASS mode until 'ready' fires.
const redisClient = createClient({ url: REDIS_URL });
let redisReady = false;

redisClient.on('error', (err) => {
    if (redisReady) {
        console.warn('Redis connection lost, falling back to no-cache mode:', err.message);
    }
    redisReady = false;
});

redisClient.on('ready', () => {
    redisReady = true;
    console.log('Connected to Redis cache at', REDIS_URL);
});

redisClient.connect().catch((err) => {
    console.warn(`Could not connect to Redis (${err.message}). Continuing without caching.`);
});

// TTL in seconds before Redis auto-deletes the key. Scores are "live" data
// (short TTL); teams are near-static reference data (long TTL).
const CACHE_TTL_SECONDS = {
    scores: 30,
    teams: 300
};

// Wraps a handler with cache-aside: serve from Redis on a hit, otherwise run
// the handler and store its response. Sets an X-Cache header
// (HIT/MISS/BYPASS/SKIP) so behavior is visible via `curl -i`.
function withCache(cacheKey, ttlSeconds, handler) {
    return async (req, res) => {
        // Redis down — skip the cache, don't block on a dead connection.
        if (!redisReady) {
            res.set('X-Cache', 'BYPASS');
            return handler(req, res);
        }

        // On a hit, return the cached JSON. A failed read just falls through
        // to the real handler rather than breaking the request.
        try {
            const hit = await redisClient.get(cacheKey);
            if (hit) {
                res.set('X-Cache', 'HIT');
                return res.json(JSON.parse(hit));
            }
        } catch (err) {
            console.warn(`Redis read failed for "${cacheKey}":`, err.message);
        }

        // Miss: wrap res.json so the handler's response is written to Redis
        // on its way out, keeping the handler itself cache-unaware.
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            // Only cache successful responses, never error bodies.
            if (res.statusCode >= 200 && res.statusCode < 300) {
                res.set('X-Cache', 'MISS');
                // setEx = SET with expiry; fire-and-forget so a failed write
                // can't break an otherwise-successful response.
                redisClient
                    .setEx(cacheKey, ttlSeconds, JSON.stringify(body))
                    .catch((err) => console.warn(`Redis write failed for "${cacheKey}":`, err.message));
            } else {
                res.set('X-Cache', 'SKIP');
            }
            return originalJson(body);
        };

        return handler(req, res);
    };
}

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Health check — useful once you add docker-compose healthchecks
// or orchestration later on.
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Confirms the app can actually reach Postgres, separate from the
// general health check above.
app.get('/api/db-health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as now');
        res.json({ status: 'ok', dbTime: result.rows[0].now });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Confirms the app can reach Redis, mirroring /api/db-health. Returns 503
// (not 500) when Redis is simply not connected, since that's a handled state.
app.get('/api/cache-health', async (req, res) => {
    if (!redisReady) {
        return res.status(503).json({ status: 'unavailable', message: 'Redis is not connected; running in no-cache mode.' });
    }
    try {
        await redisClient.ping();
        res.json({ status: 'ok' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Teams from Postgres, cached under 'teams:all' for 300s. The query below
// only runs on a cache miss.
app.get('/api/teams', withCache('teams:all', CACHE_TTL_SECONDS.teams, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, league, city FROM teams ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
}));

// Mock scores, cached under 'scores:all' for 30s. Replace with a real data
// source later; the caching pattern is already in place.
app.get('/api/scores', withCache('scores:all', CACHE_TTL_SECONDS.scores, (req, res) => {
    res.json([
        { id: 1, league: 'NBA', home: 'Lakers', away: 'Celtics', homeScore: 102, awayScore: 98, status: 'Final' },
        { id: 2, league: 'NFL', home: 'Chiefs', away: '49ers', homeScore: 24, awayScore: 21, status: 'Final' },
        { id: 3, league: 'EPL', home: 'Arsenal', away: 'Chelsea', homeScore: 1, awayScore: 1, status: 'Live - 67\'' },
        { id: 4, league: 'MLB', home: 'Yankees', away: 'Red Sox', homeScore: 0, awayScore: 0, status: 'Scheduled - 7:05 PM' }
    ]);
}));

app.listen(PORT, () => {
    console.log(`Sports app listening on port ${PORT}`);
});