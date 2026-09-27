import { createWebsiteAuthFlow, attachWebsiteAuthFlow } from '/_test-auth/index.js';
const auth = createWebsiteAuthFlow({
  authBaseUrl: '/api/auth', storageKey: 'test-owner-access', requestIdPrefix: 'test-owner', persistSession: false,
  googleClientId: '810305245079-cpjl4gh73pd5u6gglidvlnk388ebn0rp.apps.googleusercontent.com',
  getOAuthCallbackUrl: () => `${location.origin}/test-access/`,
  getSuccessUrl: () => '/', oauthFailureUrl: '/test-access/', signedOutUrl: '/test-access/',
  isProtectedRoute: () => false,
  isAuthRoute: url => /^\/test-access\/?$/.test(url.pathname),
});
attachWebsiteAuthFlow(auth);
const status = document.querySelector('#status');
const report = error => { status.textContent = error.message || 'Connexion indisponible.'; };
auth.subscribe(state => {
  for (const button of document.querySelectorAll('button')) button.disabled = state.busy || state.phase === 'checking';
  status.textContent = state.error?.message || (state.busy ? 'Connexion en cours…' : 'Accès réservé au compte autorisé.');
});
document.querySelector('#login').addEventListener('submit', event => {
  event.preventDefault();
  const password = document.querySelector('#password');
  void auth.login('a44238587@gmail.com', password.value).then(() => { password.value = ''; }).catch(report);
});
document.querySelector('#google').addEventListener('click', () => { void auth.oauth('google').catch(report); });
void auth.start().catch(report);
