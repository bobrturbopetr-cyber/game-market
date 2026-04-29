export async function onRequest(context) {
    const { request, env } = context;
    
    if (request.method !== 'PUT') {
        return new Response('Method not allowed', { status: 405 });
    }
    
    try {
        const body = await request.json();
        const { adminKey, gameId, title, description, price, gameUrl, iconUrl } = body;
        
        const ADMIN_KEY = 'GameMarketSuperSecret2026';
        
        if (adminKey !== ADMIN_KEY) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const gamesData = await env.GAMES_KV.get('all_games', 'json');
        const games = gamesData || [];
        const gameIndex = games.findIndex(g => g.id === gameId);
        
        if (gameIndex === -1) {
            return new Response(JSON.stringify({ error: 'Game not found' }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        games[gameIndex] = {
            ...games[gameIndex],
            title: title || games[gameIndex].title,
            description: description || games[gameIndex].description,
            price: price !== undefined ? parseFloat(price) : games[gameIndex].price,
            gameUrl: gameUrl || games[gameIndex].gameUrl,
            iconUrl: iconUrl || games[gameIndex].iconUrl
        };
        
        await env.GAMES_KV.put('all_games', JSON.stringify(games));
        
        return new Response(JSON.stringify({ success: true, game: games[gameIndex] }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
