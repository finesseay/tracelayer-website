(() => {
  const section = document.querySelector('#platform');
  const button = section?.querySelector('.platform-motion');
  if (!button) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  let visible = false;
  const update = () => {
    section.classList.toggle('platform-paused', paused || !visible || document.hidden || reduced.matches);
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? 'Play animations' : 'Pause animations';
  };
  button.addEventListener('click', () => { paused = !paused; update(); });
  reduced.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    update();
  }, {rootMargin: '60px'}).observe(section);
  update();
})();
