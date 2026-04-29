export async function onRequest(context) {
    const { request, env } = context;
    
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }
    
    try {
        const body = await request.json();
        const { adminKey, title, description, price, gameUrl, iconUrl } = body;
        
        // Простая защита админки (измени пароль!)
        const ADMIN_KEY = 'GameMarketSuperSecret2026';
        
        if (adminKey !== ADMIN_KEY) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        if (!title || !description || !gameUrl) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const gamesData = await env.GAMES_KV.get('all_games', 'json');
        const games = gamesData || [];
        
        const newGame = {
            id: Date.now().toString(),
            title,
            description,
            price: parseFloat(price) || 0,
            gameUrl,
            iconUrl: iconUrl || '/default-icon.png',
            createdAt: Date.now()
        };
        
        games.push(newGame);
        await env.GAMES_KV.put('all_games', JSON.stringify(games));
        
        return new Response(JSON.stringify({ success: true, game: newGame }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
