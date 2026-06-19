const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const { createClient } = require('redis');
const app = express();
const PORT = process.env.PORT || 3000;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://sports:sports@localhost:5432/sports'
});
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = createClient({ url: REDIS_URL });
const FAVORITES_KEY = 'favorites';

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


const CACHE_TTL_SECONDS = {
    scores: 30,
    teams: 300
};


function withCache(cacheKey, ttlSeconds, handler) {
    return async (req, res) => {
        // Redis down — skip the cache, don't block on a dead connection.
        if (!redisReady) {
            res.set('X-Cache', 'BYPASS');
            return handler(req, res);
        }


        try {
            const hit = await redisClient.get(cacheKey);
            if (hit) {
                res.set('X-Cache', 'HIT');
                return res.json(JSON.parse(hit));
            }
        } catch (err) {
            console.warn(`Redis read failed for "${cacheKey}":`, err.message);
        }


        const originalJson = res.json.bind(res);
        res.json = (body) => {

            if (res.statusCode >= 200 && res.statusCode < 300) {
                res.set('X-Cache', 'MISS');

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

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});


app.get('/api/db-health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as now');
        res.json({ status: 'ok', dbTime: result.rows[0].now });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});


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


app.get('/api/teams', withCache('teams:all', CACHE_TTL_SECONDS.teams, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, league, city FROM teams ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
}));

app.get('/api/teams/search', async (req, res) => {
    const query = (req.query.q || '').trim();
    const cacheKey = `teams:search:${query.toLowerCase()}`;

    // Redis cache lookup
    if (redisReady) {
        try {
            const cached = await redisClient.get(cacheKey);

            if (cached) {
                res.set('X-Cache', 'HIT');
                return res.json(JSON.parse(cached));
            }
        } catch (err) {
            console.warn('Redis search cache read failed:', err.message);
        }
    }

    try {
        const result = await pool.query(
            ` 
            SELECT
                id,
                name,
                league,
                city
            FROM teams
            WHERE 
                LOWER(name) LIKE LOWER($1)
                OR LOWER(city) LIKE LOWER($1)
                OR LOWER(league) LIKE LOWER($1)
            ORDER BY name    
            `,
            [`%${query}%`]
        );

        // Cache result
        if (redisReady) {
            redisClient
                .setEx(
                    cacheKey,
                    CACHE_TTL_SECONDS.teamsm,
                    JSON.stringify(result.rows)
                )
                .catch(err =>
                    console.warn('Redis search cache write failed:', err.message));
        }

        res.set('X-Cache', 'MISS');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
});


app.get('/api/scores', withCache('scores:all', CACHE_TTL_SECONDS.scores, (req, res) => {
    res.json([
        { id: 1, league: 'NBA', home: 'Lakers', away: 'Celtics', homeScore: 102, awayScore: 98, status: 'Final' },
        { id: 2, league: 'NFL', home: 'Chiefs', away: '49ers', homeScore: 24, awayScore: 21, status: 'Final' },
        { id: 3, league: 'EPL', home: 'Arsenal', away: 'Chelsea', homeScore: 1, awayScore: 1, status: 'Live - 67\'' },
        { id: 4, league: 'MLB', home: 'Yankees', away: 'Red Sox', homeScore: 0, awayScore: 0, status: 'Scheduled - 7:05 PM' }
    ]);
}));

app.get('/api/favorites', async (req, res) => {
    try {
        const ids = await redisClient.sMembers(FAVORITES_KEY);

        res.json(ids.map(Number));
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        })
    }
});

app.post('/api/favorites/:id', async (req, res) => {
    try {
        await redisClient.sAdd(
            FAVORITES_KEY,
            req.params.id
        );

        res.json({
            message: "Team added to favorites"
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        })
    }
});

app.delete('/api/favorites/:id', async (req, res) => {
    try {
        await redisClient.sRem(
            FAVORITES_KEY,
            req.params.id
        );

        res.json({
            message: "Team removed to favorites"
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        })
    }
});

app.listen(PORT, () => {
    console.log(`Sports app listening on port ${PORT}`);
});