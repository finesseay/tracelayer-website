# Website PostHog tracking — 2026-10-22

Historical pageview-only evidence. See [CONVERSIONS.md](CONVERSIONS.md) for the
2026-10-24 implementation, exclusions and current test command.

## Scope and project verification

All ten existing public HTML documents include one shared `assets/analytics.js`.
The mockup1–7 and v2 pages are publicly reachable, so they are included even though
some are older designs. There are no HTML pages under docs/ or vendor/. No existing
CSP meta tags were found; no CSP was added or loosened. There is no repository build
or existing test suite.

The public project token was read from the live app bundle
`https://app.tracelayer.com/assets/index-CJ5SAr5m.js` on 2026-10-22. The granted
tracelayer browser identity opened PostHog project settings and confirmed project
**312428**, **EU Cloud**, and the matching 48-character public token ending **xThQ**.
No project settings were changed.

## Verification

`node --check assets/analytics.js` and `git diff --check` passed.
`node docs/analytics/verify.cjs` uses real Chromium and the real PostHog CDN and
collector. Decoded gzip request payloads are saved in `browser-evidence.json`.
All ten pages sent exactly one `$pageview` to `https://eu.i.posthog.com/e/`, with
`tracelayer_surface: website`, a persistent anonymous ID and no query/fragment
sentinels. The nine ordinary pages received HTTP 200. The download page dispatched
a beacon before navigation; its response is not observable after the redirect.
The APK destination was intercepted in this local test to avoid downloading the APK.
Reload and cross-page IDs match. Duplicate script inclusion sends no extra event.
A synthetic form event is discarded. Blocking the SDK still permits downloading.
The browser fixture supplies a normal Chrome user agent and disables the webdriver
flag because PostHog suppresses automated visitors. All events are marked as tests.

Screenshots of all ten pages, before and after, are under
`docs/design/render/posthog/`. `tracelayer-screenshot` uses 1440×900 and a 1000ms
virtual-time budget. The local `render-server.py` serves original HTML from HEAD
and current HTML, with the download redirects removed only in its screenshot
fixture so its unchanged fallback page can be inspected. Animated mockups naturally
vary in animation frame. The tracking change alters no styles or visible content.

## Review decisions and limitations

- This checkpoint is not deployed. Publishing requires the operator's deployment action.
- EU consent remains an operator decision before deployment. The implementation uses
  persistent analytics storage. No banner was added and no legal exemption is assumed.
- Ad blockers, disabled JavaScript and SDK/network failures can prevent collection.
  The download has a bounded wait, so a very slow SDK may miss that pageview.
- Visitor statistics begin only after deployment and real traffic. The Overview's
  complete-day window may not show today's traffic until the following UTC day.
- Signup/activation conversion needs app lifecycle events and verified attribution.
  The separate app Task `tsk_d928d457-3c37-498a-b2d1-34494b9bf0d3` was created and
  started for that work; the server queued it behind this subscription's active turn.
  It must explicitly handle the separate website identity namespace.
- Revenue/Paid is still dependent on Stripe being connected. This Task changes
  neither billing, the app, the Overview nor PostHog settings.
