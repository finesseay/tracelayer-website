# Static orbit and How it works captions

Checked in Chromium on 2026-10-29. Screenshots inspected at desktop (1440px)
and phone (390px) widths. All three How it works sections retain their main copy
and visuals with the detail/caption rows removed.

The eight logo positions remain unchanged with normal motion enabled. A CDP touch
swipe starting over a logo scrolled the mobile page by 135px. Logos are plain divs,
not focusable controls, with native touch behavior and no pointer handlers.
The workspace story animation remains active and respects reduced motion.

`website-check.log`: 10 tests passed, including existing navigation, video,
newsletter and archive checks. `regression-check.log`: analytics/waitlist checks.
`checks.json`: static-position, touch-scroll, overflow and page-error evidence.
Screenshots were captured with `capture.cjs` against a local server on port 8000;
`render-desktop.png` was also captured using tracelayer-screenshot.

Original imported orbit assets remain preserved for historical source integrity;
the homepage loads static-orbit.js and static-orbit.css instead of orbit.js.
No production deployment was performed. Touch evidence is Chromium emulation.
