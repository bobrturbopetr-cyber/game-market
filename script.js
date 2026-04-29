// Хранилище (localStorage как база для демонстрации, но при желании заменишь на Cloudflare KV)
let games = [];

function loadGames() {
    const stored = localStorage.getItem('game_market_games');
    if(stored) {
        games = JSON.parse(stored);
    } else {
        // Пример: пустой массив — ты сам добавишь игры через админку
        games = [];
        saveGames();
    }
    renderGames();
}

function saveGames() {
    localStorage.setItem('game_market_games', JSON.stringify(games));
}

function renderGames() {
    const grid = document.getElementById('games-grid');
    if(grid) {
        const featured = games.slice(0, 6);
        grid.innerHTML = featured.map(game => createGameCard(game)).join('');
        attachCardEvents();
    }

    const allGrid = document.getElementById('all-games-grid');
    if(allGrid) {
        const urlParams = new URLSearchParams(window.location.search);
        const filter = urlParams.get('filter') || 'all';
        let filtered = games;
        if(filter === 'free') filtered = games.filter(g => g.price == 0);
        if(filter === 'paid') filtered = games.filter(g => g.price > 0);
        allGrid.innerHTML = filtered.map(game => createGameCard(game)).join('');
        attachCardEvents();
    }

    // game-detail
    const detailContainer = document.getElementById('game-detail');
    if(detailContainer) {
        const params = new URLSearchParams(window.location.search);
        const gameId = params.get('id');
        const game = games.find(g => g.id == gameId);
        if(game) {
            detailContainer.innerHTML = `
                <div class="game-detail-card">
                    <img src="${game.iconUrl}" class="game-icon-large">
                    <h2>${game.title}</h2>
                    <p>${game.description}</p>
                    <div class="game-price">${game.price == 0 ? 'Бесплатно' : `$${game.price}`}</div>
                    <button id="play-game-btn" class="btn-primary">Играть</button>
                </div>
                <div id="game-iframe-container" style="display:none; margin-top:2rem;">
                    <iframe src="" width="100%" height="500" frameborder="0" allowfullscreen></iframe>
                </div>
            `;
            document.getElementById('play-game-btn').addEventListener('click', () => {
                const container = document.getElementById('game-iframe-container');
                const iframe = container.querySelector('iframe');
                iframe.src = game.gameUrl;
                container.style.display = 'block';
            });
        } else {
            detailContainer.innerHTML = '<p>Игра не найдена</p>';
        }
    }
}

function createGameCard(game) {
    const priceText = game.price == 0 ? '<span class="free-badge">Бесплатно</span>' : `$${game.price}`;
    return `
        <div class="game-card" data-id="${game.id}">
            <img class="game-icon" src="${game.iconUrl}" alt="${game.title}">
            <div class="game-title">${game.title}</div>
            <div class="game-price">${priceText}</div>
        </div>
    `;
}

function attachCardEvents() {
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-id');
            window.location.href = `game-detail.html?id=${id}`;
        });
    });
}

// Фильтры на games.html
if(document.querySelector('.filters')) {
    document.querySelectorAll('.filters button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.getAttribute('data-filter');
            window.location.href = `games.html?filter=${filter}`;
        });
    });
}

loadGames();
