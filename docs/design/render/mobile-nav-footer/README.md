# Mobile navigation and footer

Checked on 2026-10-28 in Chromium with Node 22.23.4.

The homepage now has a single-row mobile header with a disclosure menu. Sign Up
stays visible. The menu supports keyboard navigation, Escape, outside dismissal,
section-link focus, and breakpoint changes. Its closed links leave the tab order.
Without JavaScript, the existing links remain visible. Desktop keyboard order
continues to follow the visible navigation.

The phone footer keeps Explore and Legal in two columns, reduces the brand and
section spacing, and removes the inherited minimum height and 100px gap. Contact,
social, legal, account and newsletter links remain available with 44px touch targets.
The existing landscape, fonts, colours and desktop layout are retained.

At 390px, the header changed from 94px to 58px and the footer from 942.875px to
733.719px. At 1440px, the header remains 54px and the footer 620px.

## Evidence

- `home-*.png`, `menu-*.png`, `footer-*.png`: real browser screenshots, inspected
  at phone, tablet and desktop sizes. Phone captures use touch/mobile emulation.
- `layout-check.json`: geometry, no horizontal overflow, and no page errors at
  320, 390, 600, 760, 768 and 1440px. The 760px case is a 360px-high landscape viewport.
- `render-desktop.png`: rendered with `tracelayer-screenshot` with normal motion.
  Other captures use reduced motion to make visual inspection reproducible.
- `website-check.log`: all 10 tests passed. Includes menu state, keyboard order,
  Escape/focus restoration, outside dismissal, anchor positions below the fixed
  header, resizing with focused links, no-JavaScript fallback, touch sizes, existing
  signup destinations, newsletter validation/submission, video playback/seeking,
  archives, asset integrity and legal downloads.
- `regression-check.log`: all 17 analytics and isolated waitlist tests passed.
- `node --check assets/mobile-navigation.js` and `git diff --check`: passed.

Tests intercept external submissions and analytics ingestion. No real account or
newsletter signup was submitted. Chromium emulation does not establish Safari or
physical-device behavior. No production deployment was requested or performed.

To reproduce screenshots, run `python3 -m http.server 8000` and then
`node docs/design/render/mobile-nav-footer/capture.cjs`.
