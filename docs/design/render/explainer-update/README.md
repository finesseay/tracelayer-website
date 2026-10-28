# Updated website explainer — 28 October 2026

The homepage uses the operator-supplied video from snapshot
`b4404469ddadc613ec9d1611de597e4be71a636fc9f603a53d1f8c003470d61f`.
The MP4 is byte-identical to the download. The poster is its embedded JPEG cover,
extracted with stream copy. Both asset URLs include content-derived cache versions.
The existing native player, page layout and archived pages are retained.

## Verification

- `node --test docs/website/verify.cjs`: 5 tests passed. Covers source hashes,
  unchanged archives, desktop/tablet/mobile layout, playback, seeking, video
  dimensions/duration, byte ranges, navigation and isolated newsletter submission.
- `node --test docs/analytics/verify.cjs infra/waitlist.test.mjs`: 17 tests passed.
  Requests to production ingestion/registration services were intercepted.
- Full FFmpeg decode of the H.264 video and AAC audio completed with exit 0 and no errors.
- Chromium click-to-play passed at 1440, 768 and 390px with no media errors or
  horizontal overflow. Measurements are in `playback-check.json`.
- `tracelayer-screenshot` rendered the page. Playwright captured the video section
  before playback and after five seconds at all three sizes. Cover and playback
  images were visually inspected.
- Video: 1920×1080, 134.8 seconds, 40,279,532 bytes.
- SHA-256: `55f26724476b7d092ba511c88ae0b773dd7a603163b73eefc4f45c6a464e5447`.

These checks establish the local saved result, not production deployment.
