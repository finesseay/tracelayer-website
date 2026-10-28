/* A non-modal disclosure: links remain available if JavaScript is unavailable. */
(() => {
  'use strict';
  const header = document.getElementById('tl-header-bar');
  const toggle = header?.querySelector('.tl-menu-toggle');
  const signup = header?.querySelector('.tl-header-join');
  const links = document.getElementById('tl-header-links');
  if (!header || !toggle || !signup || !links) return;

  const mobile = window.matchMedia('(max-width: 760px)');
  let open = false;
  document.documentElement.classList.add('has-mobile-menu');

  function setOpen(value, restoreFocus = false) {
    open = mobile.matches && value;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    header.classList.toggle('is-menu-open', open);
    links.hidden = mobile.matches && !open;
    if (restoreFocus) toggle.focus({ preventScroll: true });
  }

  toggle.addEventListener('click', () => setOpen(!open));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false, true);
    }
  });
  document.addEventListener('pointerdown', event => {
    if (open && !header.contains(event.target)) {
      setOpen(false, links.contains(document.activeElement));
    }
  });
  header.addEventListener('focusout', event => {
    if (open && !header.contains(event.relatedTarget)) setOpen(false);
  });
  header.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!open || !link) return;
    setOpen(false);
    const href = link.getAttribute('href');
    const target = href.startsWith('#') ? document.getElementById(href.slice(1)) : null;
    if (target) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    } else {
      toggle.focus({ preventScroll: true });
    }
  });
  function syncLayout() {
    const active = document.activeElement;
    // Keep keyboard order aligned with each layout, using the same signup link.
    if (mobile.matches) header.insertBefore(signup, toggle);
    else header.append(signup);
    setOpen(false);
    if (active === signup) signup.focus({ preventScroll: true });
    if (mobile.matches && links.contains(active)) toggle.focus({ preventScroll: true });
    if (!mobile.matches && active === toggle) links.querySelector('a').focus({ preventScroll: true });
  }
  mobile.addEventListener('change', syncLayout);
  syncLayout();
})();
