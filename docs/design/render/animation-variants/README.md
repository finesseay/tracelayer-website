# Hero animation comparison — 24 October 2026

Standalone prototype: `animation-variants/index.html`. Existing marketing pages are unchanged.

Four selectable versions: Connected (original rows), Orbit (pointer dragging and keyboard/tap swapping), Collections (four grouped cards), Flow (staggered floating tools). Query parameter `v=1` through `v=4` selects the initial version.

All versions share an illustrative Elon website brief, Rebecca/Maya/Sam story, four timed stages, saved website thumbnail, floating update card, and pause/replay/stage controls. This is a visual simulation, not an actual website creation or customer endorsement. Elon uses an EM monogram avatar; Rebecca uses the configured Space portrait, Sam and Maya use their corresponding app catalogue portraits. No earlier detailed Elon brief was available in the admitted conversation or this repository, so copy is based on the captured instruction.

Assets: TraceLayer logo and fonts from the repository. Portraits from the existing application team artwork. Tool glyphs from Simple Icons 11 (Claude from 15), distributed under CC0; logos remain their respective owners' trademarks. Assets are local; no CDN or analytics requests at runtime.

## Verification

- `node --check animation-variants/script.js` passed.
- `node docs/design/render/animation-variants/check.cjs` passed with system Chromium and Playwright.
- Four variants rendered at 1440px and 390px, with no horizontal overflow or asset/page errors.
- Pointer drag, keyboard swap, story stages, pause, replay, automatic progression, and reduced-motion behavior passed.
- Initial Connected capture rendered using `tracelayer-screenshot`; final captures use the same system Chromium through Playwright.
- Visual inspection caught paused entrance animations hiding content. Fixed so entrance finishes while ongoing motion pauses. Final screenshots preserve the floating card and conversation.

Reproduce: serve the repository on port 8000 (`python3 -m http.server 8000`), install Playwright as described in the repository README, then run the check above. Screenshots live beside this record.
- Existing repository analytics browser contract also passed: `node --test docs/analytics/verify.cjs` (16 tests, zero failures). Its generated evidence is copied into this folder to preserve the prior analytics record.
- Hosted preview inspection revealed the static host's `connect-src 'none'` policy and entry-folder asset boundary. Embedded tool SVGs in the local script and copied the existing brand/font assets into the prototype folder, so rendering requires no fetch calls or parent-directory assets.
- Final self-contained version passed the full prototype check again. Hosted Chromium smoke check loaded all eight logos, switched all four versions, and reported zero JavaScript, console, or HTTP errors.
