# Website tracking render check — 2026-10-24

This Task changes the shared analytics script, not markup or styles.
Inspected the home page at 1440×900 and 390×844 and v2 at 1440×900.
The existing page layout, buttons, wrapping and illustrations render without a new
visible analytics element. The v2 header “Sign up” button opens the waitlist, which
is deliberately not treated as an account registration action.

`tracelayer-screenshot` was attempted first but its Chromium process did not finish
the animated homepage. That owned local process was stopped. The saved PNGs were
captured with Playwright/Chromium after DOM load and 1.2 seconds, with external
requests blocked. Production-style analytics payloads were verified separately in
`docs/analytics/verify.cjs`, using intercepted requests from the real SDK.

No visual redesign was made. Light/dark variants and new loading/error states were
not introduced by this analytics-only change. Keyboard signup-link activation and
blocked/slow SDK download behavior are covered by the browser suite.
