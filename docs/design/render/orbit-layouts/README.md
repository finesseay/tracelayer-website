# Two centered-headline orbit layouts — 24 October 2026

Added standalone `orbit-focus.html` and `orbit-balanced.html`, linked by a two-option header switch. Both remove the introductory paragraph and center the existing headline. The focus layout gives the new stack more width and reduces the old-tools orbit. The balanced layout gives the two sections equal widths and places the raised logo above the chat. Existing orbit, portraits, story, floating card and original pages are preserved.

Verification: each variant passed the existing orbit browser suite, reused in its respective folder, at 1440, 1280, 1024, 768, 390 and 320 pixels. JSON evidence and full-page screenshots are alongside each check. Checks include local assets, no overflow or tool overlap, drag and keyboard swap, reset, story stages, pause/replay and reduced motion. Desktop and responsive screenshots were visually inspected. `node --check animation-variants/orbit.js` and `git diff --check` passed.

Initial file-URL screenshots used tracelayer-screenshot; CSS masks require HTTP, so final captures use the browser suite through the local static server. A concurrent Chromium capture hit the container process limit; sequential browser suites completed successfully. No build script exists in this static repository. Analytics code is unchanged.
