# Android download route and native release blockers

Task: `tsk_6bd3ad76-c3a8-4019-b6c2-3b57e2a0b2e4`
Repository: `finesseay/tracelayer-website`
Run: `run_3eb656ed-688d-438f-ab74-afda973159e6`
Baseline: `ff80e59c22a77e7b4a897569a22a9aa64fa06c21`
Status: website implementation locally verified; no publication or device upgrade.

## Website change

The meta refresh, analytics redirect attribute and fallback link in
`download/android/index.html` now use
`https://app.tracelayer.com/download/tracelayer.apk` without `?v=0.2.3`.
The query was a stale label, not verified package metadata. The application owns
the package at this stable URL. A live read on 7 November at 17:38 UTC confirmed
`Cache-Control: no-store`, so the page needs no per-release edit or cross-origin
manifest fetch. The website does not claim that newer source has been packaged.

The existing no-JavaScript refresh, direct link, privacy choices and bounded
analytics wait remain intact. Existing analytics tests now expect the exact
canonical URL. README documents the package publication boundary.

## Verification in this run

`node --test docs/website/verify.cjs docs/analytics/verify.cjs infra/waitlist.test.mjs`
passed: **27 tests, zero failures, zero skipped**. This includes normal, blocked
and slow analytics SDK redirects, all four opt-out paths, and the distinction
between a redirect and a download click. Collection and registration requests
were intercepted locally; no synthetic events or registrations were submitted.

Additional isolated Chromium checks completed synthetic attachment downloads
with JavaScript disabled, with `analytics.js` blocked, and by clicking the fallback
link. All three HTML destinations were checked against the canonical URL. These
are browser routing checks, not an APK installation test.

Desktop 1440×900 and mobile 390×844 captures were rendered and inspected. The text
and fallback link remain readable without clipping. Evidence, logs, SDK identity,
screenshots and live observations are in `docs/design/render/android-download-current/`.

## Earlier native work preserved

The native repository result remains at
`a9840f2573d3690adeaa67e281ee053ba0f67ac8` in `finesseay/tracelayer`, branch
`run/run_9b4f1842-f24a-48ca-9e12-2f1a9be2ea2a`. The Task API reports platform
`npm run verify` passed for that exact checkpoint, including PostgreSQL 16.
It contains Android 0.2.4/code 7 update detection and consent/signature checks,
APK publication metadata/retention, and Companion Authenticode and retry safeguards.
Its detailed test and signing evidence remains in that checkpoint's
`docs/tasks/android-companion-updates.md` and
`docs/reality/2026-11-07-native-app-updates-6bd3ad76.md`.

That run proved rejection of a debug-key code 7 APK over production code 6 on an
emulator, retaining 0.2.3/code 6. It did not prove a compatible production-key
upgrade. Its recorded device heartbeat evidence was Surface on the 22 October
build `c5f3ef0c40ab74a4594fe7705c7ee8ba97ae43c9` and S1_Max offline on the 19 October
build `ddf09cf44ba9279224029c35eef148cf38db1e60`. Those are prior observations,
not installation evidence from this website run. No physical Android version
was established.

## Live packages and remaining work

Read-only checks in this run still found:

- Android APK: 626,608 bytes, SHA-256
  `453b5f5ccd53f8fbd992e973ee247eef5ec74b9c9cdeae4e23df042a867d63c1`.
  This matches the previously verified 0.2.3/code 6 artifact. The live website
  still includes all three `?v=0.2.3` URLs.
- Companion manifest: version `0.1.0-build.20261104211711`, source
  `df3b8b3b0d1dde4c9413ea4fa53b08f73b2e1ef0`, built
  `2026-11-04T21:17:11.910Z`, installer size 385,076,584 bytes and declared SHA-256
  `d8255cdeb72d7dee72533497cf091838c90ac02d8fdd12d241d342cd5742a2da`.
  Signing is `development`, signer
  `704CA0F6719AC03761A6B01969A6FAC5853B06CE`.
  This run read the manifest; it did not download or execute the installer.

The original Android private signing inputs and Windows signing certificate
remain unavailable to this worker. The prior run already asked where the
existing keys are held. No replacement identity or unsigned release was used.

The outcome still requires compatible signed builds, governed publication of
both native packages and website code, and real upgrades from older Android and
installed Windows copies. Verify Android data retention and consent, and Windows
waiting for active browser work, signature validation, retry/status behavior,
pairing and profile retention. Portable Companion ZIPs do not self-update.
Record device versions before and after; a published download alone cannot prove
either operator device was updated. Deployment was not authorized in this turn.

The live follow-up read returned null. No schedule was created or changed.
