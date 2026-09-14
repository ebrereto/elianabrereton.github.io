export function bindInput({ canvas, button, action, isActive, pause }) {
  button.addEventListener('click', action);
  canvas.addEventListener('click', action);
  document.addEventListener('keydown', event => {
    if (!isActive()) return;
    const target = event.target;
    // Menus and form controls keep their native keyboard behavior.
    const typing = target.closest('input,select,textarea,summary,dialog,a');
    const otherButton = target.closest('button') && target !== button;
    if (event.code === 'Space' && !typing && !otherButton) {
      event.preventDefault();
      if (!event.repeat) action();
    }
    if (event.code === 'Escape' && !target.closest('dialog')) pause();
  });
}
