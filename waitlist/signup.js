/* Floating menu and waitlist adapted from https://tracelayer.com/signup. */
(() => {
  'use strict';
  const header = document.getElementById('tl-header-bar');
  const hero = document.getElementById('orbit-hero');
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
  function updateHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    updateDockVisibility();
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('resize', updateHeader);
  new ResizeObserver(updateDockVisibility).observe(hero);
  updateHeader();
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

  // The reference's subtle ambient particles, paused when offscreen or motion is reduced.
  const canvas = document.getElementById('tl-eco-particles');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const palette = ['45,212,191', '99,102,241', '255,255,255'];
  let width = 0, height = 0, particles = [], frame = 0, visible = false, time = 0, last = 0;
  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth; height = canvas.clientHeight;
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * width, y: Math.random() * height, r: .6 + Math.random() * 1.4,
      vx: (Math.random() - .5) * .12, vy: -.06 - Math.random() * .22,
      color: Math.random() < .55 ? 0 : (Math.random() < .5 ? 1 : 2),
      alpha: .15 + Math.random() * .5, phase: Math.random() * Math.PI * 2,
    }));
    draw(0);
  }
  function draw(delta) {
    context.clearRect(0, 0, width, height);
    time += delta / 60;
    for (const particle of particles) {
      particle.x += particle.vx * delta; particle.y += particle.vy * delta;
      if (particle.y < -4) { particle.y = height + 4; particle.x = Math.random() * width; }
      if (particle.x < -4) particle.x = width + 4;
      else if (particle.x > width + 4) particle.x = -4;
      const alpha = particle.alpha * (.55 + .45 * Math.sin(time * 1.4 + particle.phase));
      context.beginPath();context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      context.fillStyle = `rgba(${palette[particle.color]},${alpha})`;context.fill();
    }
  }
  function tick(timestamp) {
    draw(last ? Math.min((timestamp - last) / 16.67, 3) : 0);last = timestamp;
    frame = requestAnimationFrame(tick);
  }
  function updateAnimation() {
    cancelAnimationFrame(frame);last = 0;
    if (visible && !motion.matches && !document.hidden) frame = requestAnimationFrame(tick);
  }
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting;updateAnimation(); }).observe(document.getElementById('waitlist'));
  motion.addEventListener('change', updateAnimation);
  document.addEventListener('visibilitychange', updateAnimation);
})();
