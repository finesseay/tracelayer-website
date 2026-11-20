# Pricing section

Checked in Chromium on 2026-11-20 against the approved Pricing Journey preview.
`side-by-side-step-N.png` puts the preview (left) beside the built homepage (right):
steps 2 to 6 at 1440×900 and step 50 at 390×844. `preview-step-N.png` and
`site-step-N.png` are the single images. `site-phone-menu.png` shows the phone menu
opened with the new Pricing link. `render-desktop.png` is from tracelayer-screenshot.

Expected differences from the preview: no yellow preview marks or proposal note, no SOC 2
claim, and an SVG chevron on Compare plans. At 390 the header is the
existing one-row menu, not the preview's older two-row header.

`checks.json`: no horizontal scroll or page errors at any step, and no new external
requests (none before or after, page loaded and scrolled as tracelayer.com with analytics
excluded and every other host blocked). Logs: `website-check.log` (10 passed),
`analytics-check.log` (16 passed), `waitlist-check.log` (1 passed).

Re-run with `node docs/design/render/pricing-section/capture.cjs <pricing-journey.html>`.
No production deployment was performed.
