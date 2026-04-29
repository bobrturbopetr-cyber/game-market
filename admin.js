let currentAdminKey = '';

// Запрос пароля при загрузке админки
function authenticate() {
    const savedKey = localStorage.getItem('admin_key');
    if(savedKey) {
        currentAdminKey = savedKey;
        loadGamesData();
    } else {
        const key = prompt('Введите админ-ключ для доступа к панели:');
        if(key) {
            currentAdminKey = key;
            localStorage.setItem('admin_key', key);
            loadGamesData();
        } else {
            document.getElementById('admin-games-list').innerHTML = '<p>Доступ запрещен. Обновите страницу и введите ключ.</p>';
        }
    }
}

async function loadGamesData() {
    try {
        const response = await fetch('/api/games');
        const games = await response.json();
        renderAdminList(games);
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

function renderAdminList(games) {
    const container = document.getElementById('admin-games-list');
    if(!container) return;
    
    if(games.length === 0) {
        container.innerHTML = '<p>Игр пока нет. Добавь первую!</p>';
        return;
    }
    
    container.innerHTML = games.map(game => `
        <div class="admin-item">
            <span><strong>${game.title}</strong> — ${game.price == 0 ? 'Бесплатно' : `$${game.price}`}</span>
            <div>
                <button class="edit-game" data-id="${game.id}">✏️</button>
                <button class="delete-game" data-id="${game.id}">🗑️</button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.edit-game').forEach(btn => {
        btn.addEventListener('click', () => editGame(btn.getAttribute('data-id'), games));
    });
    
    document.querySelectorAll('.delete-game').forEach(btn => {
        btn.addEventListener('click', () => deleteGame(btn.getAttribute('data-id')));
    });
}

async function editGame(id, games) {
    const game = games.find(g => g.id === id);
    if(game) {
        document.getElementById('game-id').value = game.id;
        document.getElementById('title').value = game.title;
        document.getElementById('description').value = game.description;
        document.getElementById('price').value = game.price;
        document.getElementById('game-url').value = game.gameUrl;
        document.getElementById('icon-url').value = game.iconUrl;
        document.getElementById('game-form-container').style.display = 'block';
    }
}

async function deleteGame(id) {
    if(confirm('Удалить игру навсегда?')) {
        try {
            const response = await fetch('/api/admin/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminKey: currentAdminKey, gameId: id })
            });
            
            const result = await response.json();
            
            if(result.success) {
                alert('Игра удалена!');
                loadGamesData();
            } else {
                alert('Ошибка: ' + result.error);
                if(result.error === 'Unauthorized') {
                    localStorage.removeItem('admin_key');
                    authenticate();
                }
            }
        } catch (error) {
            alert('Ошибка удаления: ' + error.message);
        }
    }
}

document.getElementById('add-game-btn')?.addEventListener('click', () => {
    document.getElementById('game-id').value = '';
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('price').value = '0';
    document.getElementById('game-url').value = '';
    document.getElementById('icon-url').value = '/default-icon.png';
    document.getElementById('game-form-container').style.display = 'block';
});

document.getElementById('cancel-form')?.addEventListener('click', () => {
    document.getElementById('game-form-container').style.display = 'none';
});

document.getElementById('game-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('game-id').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const price = parseFloat(document.getElementById('price').value);
    const gameUrl = document.getElementById('game-url').value;
    const iconUrl = document.getElementById('icon-url').value;
    
    const endpoint = id ? '/api/admin/edit' : '/api/admin/add';
    const method = id ? 'PUT' : 'POST';
    
    const body = id ? {
        adminKey: currentAdminKey,
        gameId: id,
        title,
        description,
        price,
        gameUrl,
        iconUrl
    } : {
        adminKey: currentAdminKey,
        title,
        description,
        price,
        gameUrl,
        iconUrl
    };
    
    try {
        const response = await fetch(endpoint, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        const result = await response.json();
        
        if(result.success) {
            alert(id ? 'Игра обновлена!' : 'Игра добавлена!');
            document.getElementById('game-form-container').style.display = 'none';
            document.getElementById('game-form').reset();
            loadGamesData();
        } else {
            alert('Ошибка: ' + result.error);
            if(result.error === 'Unauthorized') {
                localStorage.removeItem('admin_key');
                authenticate();
            }
        }
    } catch (error) {
        alert('Ошибка сохранения: ' + error.message);
    }
});

// Запуск админки
authenticate();
