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

loadScores();
