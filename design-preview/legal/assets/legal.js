(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  const setTheme = (theme) => {
    root.dataset.theme = theme;
    toggle.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
    toggle.setAttribute('aria-label', `${toggle.textContent}: switch appearance`);
  };
  let saved;
  try { saved = localStorage.getItem('tracelayer-legal-theme'); } catch {}
  setTheme(saved === 'dark' ? 'dark' : 'light');
  toggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('tracelayer-legal-theme', next); } catch {}
  });
  document.querySelectorAll('.mobile-toc a').forEach(link => link.addEventListener('click', () => {
    document.querySelector('.mobile-nav details').open = false;
  }));
  const sections = [...document.querySelectorAll('article section')];
  const updateContents = () => {
    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= 140) active = section;
    }
    document.querySelectorAll('.toc a').forEach(link => {
      if (active && link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) requestAnimationFrame(() => { updateContents(); ticking = false; });
    ticking = true;
  }, { passive: true });
  updateContents();
})();
