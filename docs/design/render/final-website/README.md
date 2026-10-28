# Final Website Version: production preparation

Checked 2026-10-28 with Node v22.23.4 and system Chromium.

- The exact selected standalone snapshot is recorded in `docs/website/source-manifest.json`.
- Homepage and archive entrypoints rendered with `tracelayer-screenshot`; features,
  video and footer also captured with Playwright. Desktop/mobile PNGs were visually inspected.
- `node --test docs/website/verify.cjs`: 5 passed. Covers immutable source assets,
  preserved production archive HTML, desktop/tablet/mobile layouts, loaded images,
  no page errors/local missing requests, auth links, newsletter validation and isolated
  success, video playback and seeking, byte ranges, legal downloads and `/v2/` redirect.
- `node --test docs/analytics/verify.cjs`: 16 passed. Existing EU analytics script is
  unchanged. The newsletter is not counted as an account signup. Archives remain excluded.
- `node --check infra/waitlist.mjs` and `node --test infra/waitlist.test.mjs`: passed.
- `node --check` for imported animation/newsletter scripts and `git diff --check`: passed.
- External submissions and analytics ingestion were intercepted in local tests.
- Read-only production checks: both auth forms render, waitlist OPTIONS returns 204
  for the production origin. No account or newsletter registration was submitted.
- Live auth pages currently reference missing `/auth-design/logo.svg` on GitHub Pages.
  With the release's exact existing brand SVG intercepted at that URL, both forms render
  without broken images. This is a verified local fix, not evidence of live publication.

Full live auth/preflight evidence is in `docs/website/`. Local tests do not prove
GitHub Pages has deployed the new release; deployment evidence is recorded separately.
