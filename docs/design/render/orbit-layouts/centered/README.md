# Larger new stack with centered section headings — 24 October 2026

New standalone version: `animation-variants/orbit-focus-centered.html`.
Based on the first, larger-new-stack layout, with each heading pair centered over
its own visual: the old-tools orbit and the combined TraceLayer logo/chat group.
The new page uses a scoped centering class and links back to the original layout.
The existing versions, proportions, story, assets and animation code are preserved.

Verified using the existing focus browser suite with its URL and evidence output
redirected to this version. All checks passed at 1440, 1280, 1024, 768, 390 and
320 pixels. See `evidence.json` and the full-page screenshots. Desktop, tablet and
mobile renders were visually inspected. The suite covers assets, overflow, orbit
bounds, dragging, keyboard swap, reset, story progression, pause, replay and
reduced motion. There were no browser errors.

The initial `desktop-in-motion.png` was rendered through HTTP with
`tracelayer-screenshot` at 1440×1100. This capture shows the entry animation in
progress; `1440.png` shows the settled composition. `git diff --check` and
`node --check animation-variants/orbit.js` passed. This static repository has no
build step.

Reproduce the existing suite after starting the README's local server:

```sh
ORBIT_PREVIEW_URL=http://127.0.0.1:8000/animation-variants/orbit-focus-centered.html node - <<'JS'
const fs = require('node:fs');
const source = fs.readFileSync('docs/design/render/orbit-layouts/focus/check.cjs', 'utf8')
  .replace('const output = __dirname;', 'const output = path.resolve("docs/design/render/orbit-layouts/centered");');
eval(source);
JS
```
