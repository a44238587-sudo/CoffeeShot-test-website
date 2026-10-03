const form = document.querySelector('#login');
const status = document.querySelector('#status');
form.addEventListener('submit', async event => {
  event.preventDefault();
  const button = form.querySelector('button');
  button.disabled = true;
  status.textContent = 'Ouverture…';
  try {
    const response = await fetch('/api/test-access', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: document.querySelector('#password').value }),
    });
    const result = await response.json();
    if (!response.ok || result.admitted !== true) throw new Error(result.message || 'Accès indisponible.');
    location.assign('/');
  } catch (error) {
    status.textContent = error.message;
    button.disabled = false;
  }
});
