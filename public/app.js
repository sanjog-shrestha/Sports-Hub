let favoriteTeams = [];

async function loadScores() {
    const container = document.getElementById('scoreboard');

    try {
        const res = await fetch('/api/scores');
        if (!res.ok) throw new Error('Request failed: ' + res.status)

        const games = await res.json();

        if (!games.length) {
            container.innerHTML = '<p class="loading">No games right now.</p>';
            return;
        }

        container.innerHTML = games.map(renderGameCard).join('');
    } catch (err) {
        container.innerHTML = `<p class="error">Couldn't load scores: ${err.message}</p>`;
    }
}

async function loadTeams(query = '') {
    const container = document.getElementById('teamsList');

    try {

        const url = query ? `/api/teams/search?q=${encodeURIComponent(query)}` : '/api/teams';

        const res = await fetch(url);
        if (!res.ok) { throw new Error('Request failed: ' + res.status) }

        const teams = await res.json();

        if (!teams.length) {
            container.innerHTML = '<p class="loading">No teams found.</p>';
            return;
        }

        container.innerHTML = teams.map(renderTeamCard).join('');
    } catch (err) {
        container.innerHTML = `<p class="error">Couldn't load teams: ${err.message}</p>`;
    }
}

async function loadFavorites() {
    const res = await fetch('/api/favorites');
    favoriteTeams = await res.json();
}

async function toggleFavorite(id) {
    const isFavorite = favoriteTeams.includes(id);
    const method = isFavorite ? 'DELETE' : 'POST';

    await fetch(
        `/api/favorites/${id}`,
        { method }
    );

    await loadFavorites();
    await loadTeams();
}

function renderGameCard(game) {
    return `
        <div class="game-card">
            <div class="game-league">${game.league}</div>
            <div class="game-teams">
                <div class="team-row">
                    <span>${game.home}</span>
                    <span class="score">${game.homeScore}</span>
                </div>
                <div class="team-row">
                    <span>${game.away}</span>
                    <span class="score">${game.awayScore}</span>
                </div>
            </div>
            <div class="game-status">${game.status}</div>
        </div>
    `;
}

function renderTeamCard(team) {
    const isFavorite = favoriteTeams.includes(team.id);

    return `
        <div class="team-card">
          <button class="favorite-btn" onclick="toggleFavorite(${team.id})">${isFavorite ? '⭐' : '☆'}</button>

          <span class="team-league-tag">${team.league}</span>
          <p class="team-name">${team.name}</p>
          <p class="team-city">${team.city || ''}</p>
        </div>
    `;
}
let searchTimeout;

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('teamSearch');

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
            loadTeams(e.target.value.trim());
        }, 300);
    });
});

(async () => {
    await loadFavorites();
    await loadTeams();
    await loadScores();
})();