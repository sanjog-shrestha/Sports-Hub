const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Health check — useful once you add docker-compose healthchecks
// or orchestration later on.
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Mock sports data endpoint. Replace this later with a real
// data source (a sports API, a database, etc).
app.get('/api/scores', (req, res) => {
    res.json([
        { id: 1, league: 'NBA', home: 'Lakers', away: 'Celtics', homeScore: 102, awayScore: 98, status: 'Final' },
        { id: 2, league: 'NFL', home: 'Chiefs', away: '49ers', homeScore: 24, awayScore: 21, status: 'Final' },
        { id: 3, league: 'EPL', home: 'Arsenal', away: 'Chelsea', homeScore: 1, awayScore: 1, status: 'Live - 67\'' },
        { id: 4, league: 'MLB', home: 'Yankees', away: 'Red Sox', homeScore: 0, awayScore: 0, status: 'Scheduled - 7:05 PM' }
    ]);
});

app.listen(PORT, () => {
    console.log(`Sports app listening on port ${PORT}`);
});