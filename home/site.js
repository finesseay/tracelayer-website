/* Homepage behaviour: header state, platform list and the newsletter popup. */
(() => {
  'use strict';
  const header = document.getElementById('tl-header-bar');

  // The bar is clear over the first screen and solid once the page moves.
  function updateHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('resize', updateHeader);
  updateHeader();

  // Platform list: the open item shows its description and its picture.
  const items = [...document.querySelectorAll('.platform-item')];
  function selectItem(selected) {
    for (const item of items) {
      const active = item === selected;
      item.classList.toggle('is-active', active);
      item.querySelector('button').setAttribute('aria-expanded', String(active));
      item.querySelector('.platform-tagline').hidden = active;
      item.querySelector('.platform-desc').hidden = !active;
      document.getElementById(item.dataset.view).hidden = !active;
    }
  }
  for (const item of items) item.querySelector('button').addEventListener('click', () => selectItem(item));
  if (items.length) selectItem(items[0]);

  // Newsletter popup, kept from waitlist/signup.js. It joins the waitlist service, not account signup.
  const dock = document.getElementById('tl2Dock');
  const form = document.getElementById('waitlist-form');
  const input = document.getElementById('dockEmail');
  const send = document.getElementById('dockSend');
  const back = document.getElementById('dockBack');
  const message = document.getElementById('waitlist-message');
  const status = document.getElementById('waitlist-status');
  const live = document.getElementById('waitlist-live');
  const inviteInput = document.getElementById('waitlist-invite');
  const triggers = [...document.querySelectorAll('.newsletter-trigger')];
  const continueLink = document.getElementById('dockContinue');
  // Account creation is handled by the dedicated signup page on every host.
  const canSubmitHere = true;
  const storageKey = 'tl-waitlist';
  const inviteRef = new URLSearchParams(location.search).get('invite');
  if (inviteRef) {
    for (const link of [live, continueLink]) {
      const url = new URL(link.href);
      url.searchParams.set('invite', inviteRef);
      link.href = url.href;
    }
  }
  let saved = null, submitting = false, opener = null, pulseTimer, waitlistRequested = false;
  try {
    const record = JSON.parse(localStorage.getItem(storageKey) || 'null');
    // Older reference versions also saved failed requests. Only restore confirmed signups.
    if (record?.real === true && Number.isFinite(record.num)) saved = record;
  } catch { /* Storage may be unavailable. Signup still works. */ }

  function updateDockVisibility() {
    dock.hidden = !waitlistRequested;
    triggers.forEach(button => button.setAttribute('aria-expanded', String(!dock.hidden)));
  }
  function clearMessage() {
    message.hidden = true;
    status.textContent = '';
    live.hidden = true;
    inviteInput.hidden = true;
  }
  function setState(state) {
    dock.dataset.state = state;
    updateDockVisibility();
    clearMessage();
  }
  function showMessage(text, showLive = false) {
    status.textContent = text;
    live.hidden = !showLive;
    message.hidden = false;
  }
  function openWaitlist(event) {
    if (!dock.contains(event.currentTarget)) opener = event.currentTarget;
    waitlistRequested = true;
    setState(saved ? 'done' : (canSubmitHere ? 'form' : 'handoff'));
    if (!saved && !canSubmitHere) {
      showMessage('Join the waitlist on tracelayer.com.');
      continueLink.focus({ preventScroll: true });
    } else if (!saved) input.focus({ preventScroll: true });
    else document.getElementById('dockCopy').focus({ preventScroll: true });
    dock.classList.add('waitlist-pulse');
    clearTimeout(pulseTimer);
    pulseTimer = setTimeout(() => dock.classList.remove('waitlist-pulse'), 900);
  }
  function closeWaitlist() {
    if (submitting) return;
    waitlistRequested = false;
    setState(saved ? 'done' : 'idle');
    dock.classList.remove('invalid', 'shake');
    input.removeAttribute('aria-invalid');
    const focusTarget = opener && !dock.contains(opener) ? opener :
      (dock.hidden || saved ? header.querySelector('.tl-header-join') : document.getElementById('dockJoin'));
    focusTarget.focus({ preventScroll: true });
  }
  triggers.forEach(button => button.addEventListener('click', event => {
    opener = event.currentTarget;
    waitlistRequested = true;
    setState(saved ? 'done' : 'idle');
    document.getElementById(saved ? 'dockCopy' : 'dockJoin').focus({ preventScroll: true });
  }));
  document.getElementById('dockJoin').addEventListener('click', openWaitlist);
  back.addEventListener('click', closeWaitlist);
  document.getElementById('dockHandoffBack').addEventListener('click', closeWaitlist);
  dock.addEventListener('keydown', event => {
    if (event.key === 'Escape' && waitlistRequested) closeWaitlist();
  });
  input.addEventListener('input', () => {
    dock.classList.remove('invalid', 'shake');
    input.removeAttribute('aria-invalid');
    clearMessage();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting) return;
    if (!canSubmitHere) {
      setState('handoff');
      continueLink.focus({ preventScroll: true });
      return;
    }
    input.value = input.value.trim().toLowerCase();
    if (!input.checkValidity() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      dock.classList.remove('shake');
      void dock.offsetWidth;
      dock.classList.add('invalid', 'shake');
      input.setAttribute('aria-invalid', 'true');
      showMessage('Enter a valid email address.');
      input.focus();
      return;
    }
    submitting = true;
    send.disabled = back.disabled = input.disabled = true;
    send.textContent = '…';
    form.setAttribute('aria-busy', 'true');
    clearMessage();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('https://api.tracelayer.com/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: input.value, ref: inviteRef }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Signup not confirmed');
      const result = await response.json();
      if (!Number.isFinite(result.number)) throw new Error('Invalid signup response');
      saved = { num: result.number, ahead: result.ahead, ref: typeof result.ref === 'string' ? result.ref : '', real: true };
      try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch { /* Optional persistence. */ }
      setState('done');
      document.getElementById('dockCopy').focus({ preventScroll: true });
    } catch {
      // The service only permits the live site's origins. Never pretend a failed request joined.
      showMessage('We couldn’t confirm your signup here. Please finish on tracelayer.com.', true);
    } finally {
      clearTimeout(timeout);
      submitting = false;
      send.disabled = back.disabled = input.disabled = false;
      send.textContent = 'Join';
      form.removeAttribute('aria-busy');
      if (!saved) input.focus({ preventScroll: true });
    }
  });
  document.getElementById('dockCopy').addEventListener('click', async () => {
    if (!saved) return;
    const url = new URL('https://tracelayer.com/signup');
    if (saved.ref) url.searchParams.set('invite', saved.ref);
    try {
      await navigator.clipboard.writeText(url.href);
      showMessage('Invite link copied. Bring someone with you.');
    } catch {
      showMessage('Copy your invite link below.');
      inviteInput.value = url.href;
      inviteInput.hidden = false;
      inviteInput.focus();
      inviteInput.select();
    }
  });
  if (saved) setState('done');
})();
