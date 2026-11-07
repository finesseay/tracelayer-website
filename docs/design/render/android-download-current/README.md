# Android download route — 7 November 2026

The three download destinations are now the unversioned application APK URL.
No layout, visible text, styling, redirect timing or analytics code changed.

## Visual check

Rendered with `tracelayer-screenshot` and inspected both PNGs at full resolution:

- `desktop.png`: 1440×900, centered text and fallback link readable.
- `mobile.png`: 390×844, text and link readable without clipping.

The existing `docs/analytics/render-server.py` fixture was run at port 8001.
It serves `http://127.0.0.1:8001/__after/download/android/index.html` with the meta
refresh and `data-download-url` stripped only for screenshots, keeping the
fallback visible. The live HTML used for behavioral checks was unmodified.
Both screenshots used a 1000 ms virtual-time budget. The first parallel desktop
capture encountered the screenshot helper's shared Chromium profile lock; a
sequential retry succeeded (`render.log`).

## Browser and repository checks

`checks.log`: the repository's three documented suites passed, 27 tests total,
zero failures or skips. Command:

```sh
node --test docs/website/verify.cjs docs/analytics/verify.cjs infra/waitlist.test.mjs
```

`analytics-browser-evidence.json` records this run's real PostHog SDK hash and
15 analytics checks. The suite-generated historical evidence file was preserved
unchanged; this run's copy is stored here. Browser ingestion is intercepted.

`fallback-checks.json` records additional Chromium checks using the unchanged
download HTML and intercepted synthetic attachment responses. Download completed
at the exact canonical URL with JavaScript disabled, with the analytics script
blocked, and via the direct link. Each check also asserted all three destination
attributes. No APK was installed and no external download was triggered by those
checks.

`live-before.json` contains read-only HTTP observations from before publication.
The live APK hash matches the existing production 0.2.3/code 6 package. The
Companion entry records manifest declarations only. No website or package was
published in this run.
