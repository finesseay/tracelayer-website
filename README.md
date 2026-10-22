# tracelayer — coming soon

A single-page "coming soon" site for **tracelayer**, built around a WebGL
volumetric fractal orb rendered with a teal → indigo gradient to match the
brand.

![preview](docs/preview.png)

## What's here

| Path | Purpose |
| --- | --- |
| `index.html` | The entire site — markup, styles, and the orb (three.js module). |
| `vendor/three/` | three.js r160 core + the addons used (OrbitControls, EffectComposer, RenderPass, ShaderPass, and their deps). Vendored so the site has **no runtime CDN dependency**. |
| `vendor/fonts/` | Self-hosted Quicksand woff2 (the rounded wordmark). |

## The orb

The orb is a ray-marched fractal volume (adapted from the "Magical AI Orb"
shader) tuned to the tracelayer palette:

- **Primary / core:** teal `#2ff0c8` (brand color)
- **Secondary / wisps:** indigo `#4f46e5`
- A soft teal atmosphere halo + subtle chromatic aberration for the glow.

You can drag to rotate it. All the look-and-feel knobs live in the `params`
object near the top of the `<script type="module">` block in `index.html`
(colors, density, rotation speed, fractal iterations, etc.) — the original
tuning GUI was removed for production.

Accessibility & robustness:
- Falls back to a static CSS orb if WebGL is unavailable.
- Honors `prefers-reduced-motion` by calming the animation.

## Running locally

It's static — serve the folder with any static server (ES modules need
`http://`, not `file://`):

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open the printed URL.

## Deploying

Upload the repository contents as-is to any static host (Netlify, Vercel,
GitHub Pages, S3/CloudFront, Cloudflare Pages, …). No build step. Just make
sure the `vendor/` directory ships alongside `index.html`.

## Website analytics

Every public HTML page includes `/assets/analytics.js`. This is the single place
for the EU PostHog project configuration and privacy controls. Include it once,
with `defer`, when adding a page. `docs/` currently contains assets/evidence, not
an HTML documentation site. The reachable `v2/` and `mockup1/`–`mockup7/` pages
are public and are tracked too.

Only `$pageview` is sent. Autocapture, recordings, surveys, performance and error
capture are off. An event-property allowlist removes query strings, fragments,
referrers, titles, attribution and form contents. Anonymous IDs persist using
PostHog's default storage, in a website-specific namespace separate from the app.
No user is identified and no person profile is created. Test/preview hosts set
`tracelayer_test: true`. Ad blockers are respected.

The Android redirect waits up to 1.5 seconds for the SDK and sends its pageview
using a beacon before navigating. A two-second meta refresh is the no-JavaScript
fallback. An SDK failure never prevents the download.

Before deployment, the operator must resolve the EU analytics consent requirement.
No banner or consent policy is introduced by this change. Pageviews cannot recover
past visitors or supply signup, activation or revenue events.

Browser verification: install local-only tooling with `npm install --no-save
playwright`, serve this directory on port 8000, then run
`node docs/analytics/verify.cjs`. It sends test-marked events to the real project.
See `docs/analytics/REVIEW.md` for evidence and remaining dependencies.
