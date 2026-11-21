# Pricing: no trial, Start and Professional

Checked in Chromium on 2026-11-21. `side-by-side-<shot>.png` puts the homepage before this
change (commit 93192ea, left) beside it after (right). `before-<shot>.png` and
`after-<shot>.png` are the single images.

- `desktop-monthly`, `desktop-yearly`, `desktop-compare`: 1440×900 viewport at the section.
- `phone-monthly`, `phone-yearly`: the whole pricing section at 390 wide (844 tall viewport).
- `phone-compare`, `phone-compare-right`: Compare plans opened at 390×844, with the table's
  own scroll box at the start and scrolled to the Professional and Enterprise columns.

Expected differences only: Pro is now Start and Team is now Professional, on the cards and
in the comparison table header. "Most popular" stays on Start. The lead line drops "Every new
account gets Pro free for 14 days." Start and Professional buttons say "Start free" instead of
"Start 14-day trial". Sign-up links are unchanged (`?plan=pro` for Free and Start,
`?plan=team` for Professional), as are prices, layout and every other section.

`checks.json`: no horizontal scroll or page errors in any shot, and no new external
requests (none before or after, page loaded and scrolled as tracelayer.com with analytics
excluded and every other host blocked). Logs: `website-check.log` (10 passed),
`analytics-check.log` (16 passed), `waitlist-check.log` (1 passed).

Re-run with `node docs/design/render/pricing-names/capture.cjs [baseline-commit]`.
No production deployment was performed.
