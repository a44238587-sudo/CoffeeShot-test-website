import { createWebsiteAuthFlow, attachWebsiteAuthFlow } from '/_test-auth/index.js';
const auth = createWebsiteAuthFlow({
  authBaseUrl: '/api/auth', persistSession: false, storageKey: 'test-application-account', requestIdPrefix: 'test-google',
  googleClientId: '810305245079-cpjl4gh73pd5u6gglidvlnk388ebn0rp.apps.googleusercontent.com',
  getOAuthCallbackUrl: () => `${location.origin}/account-access/`, getSuccessUrl: () => '/',
  oauthFailureUrl: '/account-access/', signedOutUrl: '/', isProtectedRoute: () => false,
  isAuthRoute: url => /^\/account-access\/?$/.test(url.pathname),
});
attachWebsiteAuthFlow(auth);
const status = document.querySelector('#status');
const button = document.querySelector('#google');
auth.subscribe(state => {
  button.disabled = state.busy || state.phase === 'checking';
  status.textContent = state.error?.message || (state.busy ? 'Connexion en cours…' : 'Google sert uniquement aux tests nécessitant un compte.');
});
button.addEventListener('click', () => { void auth.oauth('google').catch(error => { status.textContent = error.message; }); });
void auth.start().catch(error => { status.textContent = error.message; });
