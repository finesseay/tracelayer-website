# Standalone orbit comparison — 24 October 2026

Entry: `animation-variants/orbit.html`. The four earlier comparison studies are preserved at `animation-variants/index.html`.

The old-tools orbit is a self-contained left-hand section, separated by a quiet “vs” from the new stack. The right-hand group restores the dimensional TraceLayer logo from the supplied reference, including the gradient block, lower layers, wordmark and tagline, alongside the approved task chat. There is no line from the old tools to the new stack. Copy distinguishes “It used to be like this” from “The future is now.”

The old tools follow a coherent elliptical track with a moving trail and keep their brand colours. Pointer dragging and keyboard/tap selection can rearrange them. A custom arrangement stays put until Reset orbit or Replay. The chat preserves Elon’s portrait and brief, Rebecca’s immediate invitation bubble with MrBeast, Spielberg and Jony Ive, the four story stages, saved result and floating update card. At tablet and mobile sizes the logo moves above the chat. Existing local artwork, shared styles and portrait credits are reused; no additional remote assets or analytics are added.

## Verification

- The repository analytics contract also passed: `node --test docs/analytics/verify.cjs` (16 tests, zero failures). Its evidence is in `analytics-evidence.json`; live ingestion was intercepted. An initial concurrent browser launch hit the container thread limit, so this check ran successfully in sequence.
- `node --check animation-variants/orbit.js` passed.
- `node docs/design/render/orbit/check.cjs` passed. Exact results are in `evidence.json`.
- Chromium captures at 1440, 1280, 1024, 768, 390 and 320 pixels check assets, viewport overflow, tool overlap and group placement. Screenshots are alongside this record. Desktop, tablet and mobile renders were visually inspected.
- Interaction checks cover automatic orbit motion, pausing orbit/logo/trails/story, keyboard swapping and Escape, pointer dragging without a subsequent selection, persistence of custom positions, Reset orbit, all four story stages, Replay, automatic progression, and reduced-motion behavior including Replay.
- First render also used `tracelayer-screenshot`. Final captures use Playwright with the same system Chromium.
- A tablet overflow found during checks came from the floating card’s horizontal entrance; its entrance is now vertical, keeping the hover effect. Tablet tool hit areas were tightened to avoid overlap.

Run locally with `python3 -m http.server 8000`, then run the browser check above. Playwright installation follows the repository README. This remains an illustrative concept, not an actual project or customer endorsement.
