/* Pricing: Monthly/Yearly switch and in-place disclosures. Without JavaScript everything stays open. */
(() => {
  'use strict';
  const section = document.getElementById('pricing');
  if (!section) return;

  const billing = section.querySelectorAll('[data-set-billing]');
  billing.forEach(button => button.addEventListener('click', () => {
    section.dataset.billing = button.dataset.setBilling;
    billing.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
  }));

  // Each disclosure button controls the element named by aria-controls, opened in place.
  section.querySelectorAll('button[aria-controls]').forEach(button => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;
    const set = open => {
      button.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
    };
    set(false);
    button.addEventListener('click', () => set(button.getAttribute('aria-expanded') !== 'true'));
  });
})();
