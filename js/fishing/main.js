// Keep a useful message visible even if an asset or module cannot load.
import('./app.js').then(({ start }) => start()).catch(error => {
  document.querySelector('#game-status').textContent = 'the dock could not load. please refresh to try again.';
  const notice = document.querySelector('#save-warning');
  notice.textContent = error.message; notice.hidden = false;
  const button = document.querySelector('#action');button.textContent = 'refresh to retry';button.disabled = false;button.onclick = () => location.reload();
});
