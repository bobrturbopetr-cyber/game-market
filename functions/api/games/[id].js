export async function onRequest(context) {
    const { request, env, params } = context;
    
    if (request.method !== 'GET') {
        return new Response('Method not allowed', { status: 405 });
    }
    
    try {
        const gameId = params.id;
        const gamesData = await env.GAMES_KV.get('all_games', 'json');
        const games = gamesData || [];
        const game = games.find(g => g.id === gameId);
        
        if (!game) {
            return new Response(JSON.stringify({ error: 'Game not found' }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        return new Response(JSON.stringify(game), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
