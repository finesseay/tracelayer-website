# Final Website Version: replacement explainer

Task: tsk_3a32ca0a-d2c1-4211-9ef8-b6b1d1135891
Status: updated and locally verified; production deployment remains pending.

The operator supplied a replacement MP4 in the latest turn. The selected homepage
now bundles that exact file (snapshot `b4404469ddadc613ec9d1611de597e4be71a636fc9f603a53d1f8c003470d61f`).
Its embedded Mars hotel JPEG is the native player's poster. Cache versions on the
video, poster and fallback link prevent reuse of the older cached assets.

The source manifest records the exact origin, SHA-256, bytes, duration and dimensions.
Existing website checks use the replacement's measured metadata. The native player,
other page sections, account/newsletter flows and both archives are retained.

Evidence: `docs/design/render/explainer-update/`. All 5 website tests and all 17
analytics/waitlist tests passed. A full video/audio decode passed. Real Chromium
click playback, seeking and layouts passed at desktop, tablet and mobile widths.

No production action was repeated. The previous governed deployment stopped before
publication because the producing checkpoint lacked completed-Task acceptance,
as recorded in `2026-10-28-final-website-production.md`. This update is saved for
review; it does not assert that tracelayer.com has changed.
