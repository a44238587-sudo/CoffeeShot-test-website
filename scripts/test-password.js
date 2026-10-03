// Simple test-site access; this cookie is not an application identity.
export const TEST_PASSWORD = 'allan44238587';
const COOKIE = '__Host-test-site-access';
const PUBLIC = new Set(['/test-access', '/test-access/', '/test-access/login.js', '/test-access/login.css']);

export function hasTestAccess(request) {
  return (request.headers.get('cookie') || '').split(';').some(value => value.trim() === `${COOKIE}=${TEST_PASSWORD}`);
}

export async function onTestRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  if (url.pathname === '/api/test-access') {
    if (request.method === 'GET') return Response.json({ admitted: hasTestAccess(request) }, { headers: { 'Cache-Control': 'no-store' } });
    if (request.method === 'DELETE') return Response.json({ admitted: false }, { headers: {
      'Cache-Control': 'no-store', 'Set-Cookie': `${COOKIE}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`,
    } });
    if (request.method !== 'POST') return new Response('Use POST, GET or DELETE.', { status: 405, headers: { Allow: 'POST, GET, DELETE' } });
    let payload;
    try { payload = await request.json(); } catch { return new Response('Invalid request.', { status: 400 }); }
    if (payload?.password !== TEST_PASSWORD) return Response.json({ admitted: false, message: 'Mot de passe incorrect.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
    return Response.json({ admitted: true }, { headers: {
      'Cache-Control': 'no-store', 'Set-Cookie': `${COOKIE}=${TEST_PASSWORD}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=604800`,
    } });
  }
  if (PUBLIC.has(url.pathname) || hasTestAccess(request)) return context.next();
  if (request.method === 'GET' && (request.headers.get('accept') || '').includes('text/html')) {
    return new Response(null, { status: 303, headers: { Location: '/test-access/', 'Cache-Control': 'no-store' } });
  }
  return Response.json({ admitted: false, message: 'Le mot de passe du site de test est requis.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
}
