export async function onRequest(context) {
    const { request, env } = context;
    
    if (request.method !== 'DELETE') {
        return new Response('Method not allowed', { status: 405 });
    }
    
    try {
        const body = await request.json();
        const { adminKey, gameId } = body;
        
        const ADMIN_KEY = 'GameMarketSuperSecret2026';
        
        if (adminKey !== ADMIN_KEY) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const gamesData = await env.GAMES_KV.get('all_games', 'json');
        let games = gamesData || [];
        const initialLength = games.length;
        games = games.filter(g => g.id !== gameId);
        
        if (games.length === initialLength) {
            return new Response(JSON.stringify({ error: 'Game not found' }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        await env.GAMES_KV.put('all_games', JSON.stringify(games));
        
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
