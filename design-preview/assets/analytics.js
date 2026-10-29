/* Anonymous website analytics. The project ingestion token is intentionally public. */
(function () {
  'use strict';
  if (window.__tracelayerAnalytics) return;
  window.__tracelayerAnalytics = true;

  var token = 'phc_mqJFJHdmmkM5Bi9CBJkPSuB2DRiceBqFXxE7hLwixThQ';
  var redirect = document.currentScript && document.currentScript.getAttribute('data-download-url');
  var redirected = false;
  function finish() {
    if (redirect && !redirected) {
      redirected = true;
      window.location.replace(redirect);
    }
  }
  // Analytics must never block a download, including when storage or the SDK fails.
  if (redirect) window.setTimeout(finish, 1500);

  function storedFlag(name) {
    try { return window.localStorage.getItem(name) === '1'; } catch (_) { return false; }
  }
  function optedOut() {
    return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' ||
      navigator.doNotTrack === 'yes' || window.doNotTrack === '1' ||
      storedFlag('tracelayer_analytics_opt_out') || storedFlag('tracelayer_internal') ||
      storedFlag('tracelayer_test');
  }
  // A closed set of public page categories prevents IDs or signed paths leaking.
  var path = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
  var pages = { '/': '/', '/v2': '/v2/', '/download/android': '/download/android/' };
  var params = new URLSearchParams(location.search);
  var excluded = ['preview', 'sample', 'test', 'tracelayer_test', 'tracelayer_internal']
    .some(function (key) { return params.has(key); });
  if (!/^(www\.)?tracelayer\.com$/.test(location.hostname) || !pages[path] || excluded || optedOut()) {
    finish();
    return;
  }
  var pagePath = pages[path];

  // Campaign names are short, non-personal tags. Never send arbitrary URL values.
  function campaign(key) {
    var value = params.get(key) || '';
    return /^[a-z][a-z0-9_-]{0,63}$/i.test(value) &&
      !/[a-f0-9]{24}|\d{9}/i.test(value) ? value.toLowerCase() : undefined;
  }
  var attribution = {};
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (key) {
    var value = campaign(key);
    if (value) attribution[key] = value;
  });
  try {
    var referrer = new URL(document.referrer);
    if (/^https?:$/.test(referrer.protocol) && referrer.hostname !== location.hostname &&
        /^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(referrer.hostname) &&
        referrer.hostname.length <= 253 && !/[a-f0-9]{24}/i.test(referrer.hostname)) {
      attribution.$referring_domain = referrer.hostname.toLowerCase();
    }
  } catch (_) { /* No referrer, or not a web URL. */ }

  var client;
  var queue = [];
  var sessionId;
  var pageviewId;
  var viewed = false;
  var visibleSince = null;
  var visibleMs = 0;
  var maxScroll = 0;
  var left = false;
  var engaged = false;
  var engagementTimer;
  var handlersReady = false;
  function capture(name, properties) {
    if (optedOut()) return;
    if (!client) {
      if (queue.length < 20) queue.push([name, properties]);
      return;
    }
    try {
      client.capture(name, Object.assign({ $session_id: sessionId, $pageview_id: pageviewId }, properties),
        { transport: 'sendBeacon', send_instantly: true });
    } catch (_) { /* Collection is best effort. Navigation must continue. */ }
  }
  function visibleSeconds() {
    var ms = visibleMs + (visibleSince === null ? 0 : performance.now() - visibleSince);
    return Math.min(86400, Math.max(0, Math.round(ms / 1000)));
  }
  function engagement() {
    if (!viewed || engaged || document.visibilityState === 'hidden') return;
    if (visibleSeconds() >= 10) {
      engaged = true;
      capture('website_engaged', { visible_seconds: visibleSeconds(), scroll_percent: maxScroll });
    }
  }
  function resume() {
    if (!viewed || document.visibilityState === 'hidden' || visibleSince !== null) return;
    visibleSince = performance.now();
    left = false;
    if (!engaged) engagementTimer = window.setTimeout(engagement, Math.max(0, 10000 - visibleMs));
  }
  function leave() {
    if (!viewed || left) return;
    left = true;
    window.clearTimeout(engagementTimer);
    if (visibleSince !== null) visibleMs += performance.now() - visibleSince;
    visibleSince = null;
    capture('$pageleave', { visible_seconds: visibleSeconds(), scroll_percent: maxScroll });
  }
  function pageview() {
    visibleMs = 0;
    visibleSince = null;
    maxScroll = 0;
    engaged = false;
    left = false;
    try { sessionId = client.get_session_id(); } catch (_) { sessionId = undefined; }
    pageviewId = window.crypto.randomUUID();
    viewed = true;
    capture('$pageview', {});
    resume();
  }
  function linkClick(event) {
    if (!event.isTrusted || event.defaultPrevented ||
        (event.type === 'click' && event.button !== 0) ||
        (event.type === 'auxclick' && event.button !== 1)) return;
    var link = event.target && event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    var url;
    try { url = new URL(link.href, location.href); } catch (_) { return; }
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return;
    if (/^(www\.)?tracelayer\.com$/.test(url.hostname) && /^\/signup\/?$/.test(url.pathname)) {
      capture('website_signup_click', { link_target: 'signup' });
    } else if (/^(www\.)?tracelayer\.com$/.test(url.hostname) && /^\/download\/android(?:\/index\.html|\/)?$/.test(url.pathname)) {
      capture('website_download', { link_target: 'android-page', platform: 'android' });
    } else if (url.hostname === 'app.tracelayer.com' && url.pathname === '/download/tracelayer.apk') {
      capture('website_download', { link_target: 'android-apk', platform: 'android' });
    }
  }
  document.addEventListener('click', linkClick);
  document.addEventListener('auxclick', linkClick);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') leave(); else resume();
  });
  window.addEventListener('pagehide', leave);
  window.addEventListener('beforeunload', leave);
  window.addEventListener('pageshow', function (event) { if (event.persisted && client) pageview(); });
  window.addEventListener('scroll', function () {
    var height = document.documentElement.scrollHeight - window.innerHeight;
    if (height > 0) maxScroll = Math.max(maxScroll, Math.min(100, Math.max(0, Math.round(window.scrollY / height * 100))));
  }, { passive: true });
  handlersReady = true;

  var sdk = document.createElement('script');
  sdk.src = 'https://eu-assets.i.posthog.com/static/array.js';
  sdk.async = true;
  sdk.referrerPolicy = 'no-referrer';
  sdk.onerror = finish;
  sdk.onload = function () {
    if (optedOut()) { finish(); return; }
    try {
      window.posthog.init(token, {
        api_host: 'https://eu.i.posthog.com',
        person_profiles: 'never',
        persistence_name: 'tracelayer_website',
        cross_subdomain_cookie: false,
        respect_dnt: true,
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        save_campaign_params: false,
        capture_dead_clicks: false,
        capture_heatmaps: false,
        capture_performance: false,
        capture_exceptions: false,
        disable_session_recording: true,
        disable_surveys: true,
        advanced_disable_flags: true,
        advanced_disable_decide: true,
        save_referrer: false,
        store_google: false,
        ip: false,
        request_batching: false,
        before_send: function (event) {
          if (optedOut() || ['$pageview', '$pageleave', 'website_signup_click', 'website_download', 'website_engaged'].indexOf(event.event) === -1) return null;
          var original = event.properties || {};
          var properties = {};
          ['token', 'distinct_id', '$device_id', '$session_id', '$window_id', '$pageview_id',
            '$lib', '$lib_version', '$browser', '$browser_version', '$os', '$os_version',
            '$device_type', '$screen_height', '$screen_width', '$viewport_height', '$viewport_width'].forEach(function (key) {
            if (typeof original[key] === 'string' || typeof original[key] === 'number') properties[key] = original[key];
          });
          Object.assign(properties, attribution, {
            $current_url: location.origin + pagePath, $host: location.hostname, $pathname: pagePath,
            $is_identified: false, $process_person_profile: false, $geoip_disable: true,
            tracelayer_surface: 'website', tracelayer_schema: 1,
            tracelayer_internal: false, tracelayer_test: false,
            tracelayer_signup_tracking: handlersReady, tracelayer_download_tracking: handlersReady
          });
          if (event.event === 'website_signup_click') properties.link_target = 'signup';
          if (event.event === 'website_download') {
            if (['android-page', 'android-apk'].indexOf(original.link_target) === -1) return null;
            properties.link_target = original.link_target;
            properties.platform = 'android';
          }
          if (event.event === '$pageleave' || event.event === 'website_engaged') {
            properties.visible_seconds = visibleSeconds();
            properties.scroll_percent = maxScroll;
          }
          // Rebuild the envelope too: no $set, $set_once, form values or URL enrichment.
          return { event: event.event, properties: properties, timestamp: event.timestamp, uuid: event.uuid };
        },
        loaded: function (posthog) {
          client = posthog;
          pageview();
          queue.forEach(function (item) { capture(item[0], item[1]); });
          queue = [];
          finish();
        }
      });
    } catch (_) { finish(); }
  };
  document.head.appendChild(sdk);
}());
