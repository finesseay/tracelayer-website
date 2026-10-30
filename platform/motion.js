(() => {
  const section = document.querySelector('#platform');
  if (!section) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  const update = () => {
    section.classList.toggle('platform-paused', !visible || document.hidden || reduced.matches);
  };
  reduced.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    update();
  }, {rootMargin: '60px'}).observe(section);
  update();
})();
