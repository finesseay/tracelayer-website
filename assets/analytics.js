/* Public website page views only. The project token is intentionally public. */
(function () {
  'use strict';
  if (window.__tracelayerAnalytics) return;
  window.__tracelayerAnalytics = true;

  var redirect = document.currentScript.getAttribute('data-download-url');
  var redirected = false;
  function finish() {
    if (redirect && !redirected) {
      redirected = true;
      window.location.replace(redirect);
    }
  }
  // Downloads still work when analytics is blocked or slow.
  if (redirect) window.setTimeout(finish, 1500);

  var sdk = document.createElement('script');
  sdk.src = 'https://eu-assets.i.posthog.com/static/array.js';
  sdk.async = true;
  sdk.referrerPolicy = 'no-referrer';
  sdk.onerror = finish;
  sdk.onload = function () {
    try {
      window.posthog.init('phc_mqJFJHdmmkM5Bi9CBJkPSuB2DRiceBqFXxE7hLwixThQ', {
        api_host: 'https://eu.i.posthog.com',
        person_profiles: 'identified_only',
        // Keep the default persistent anonymous identity, isolated from app
        // identification and app-only super properties on sibling subdomains.
        persistence_name: 'tracelayer_website',
        cross_subdomain_cookie: false,
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
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
        // An allowlist prevents SDK enrichment, stored attribution, query
        // strings, fragments, page titles and form contents leaving the page.
        before_send: function (event) {
          if (event.event !== '$pageview') return null;
          var original = event.properties;
          var properties = {};
          ['token', 'distinct_id', '$device_id', '$session_id', '$window_id',
            '$lib', '$lib_version', '$browser', '$browser_version', '$os',
            '$os_version', '$device_type', '$screen_height', '$screen_width',
            '$viewport_height', '$viewport_width', '$is_identified',
            '$process_person_profile'].forEach(function (key) {
            if (original[key] !== undefined) properties[key] = original[key];
          });
          properties.$current_url = location.origin + location.pathname;
          properties.$host = location.host;
          properties.$pathname = location.pathname;
          properties.tracelayer_surface = 'website';
          // Local tests and hosted previews must never count as real traffic.
          if (!/^(www\.)?tracelayer\.com$/.test(location.hostname)) {
            properties.tracelayer_test = true;
          }
          properties.$geoip_disable = true;
          event.properties = properties;
          return event;
        },
        loaded: function (posthog) {
          posthog.register({ tracelayer_surface: 'website' });
          posthog.capture('$pageview', {}, { transport: 'sendBeacon', send_instantly: true });
          finish();
        }
      });
    } catch (_) {
      finish();
    }
  };
  document.head.appendChild(sdk);
}());
