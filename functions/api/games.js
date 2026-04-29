export async function onRequest(context) {
    const { request, env } = context;
    
    if (request.method !== 'GET') {
        return new Response('Method not allowed', { status: 405 });
    }
    
    try {
        const gamesData = await env.GAMES_KV.get('all_games', 'json');
        const games = gamesData || [];
        games.sort((a, b) => b.createdAt - a.createdAt);
        
        return new Response(JSON.stringify(games), {
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
