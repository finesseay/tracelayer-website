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

`assets/analytics.js` configures the EU PostHog project and the website privacy
boundary. Public pages include it once with `defer`. Production collection is limited
to the known `/`, `/v2/` and `/download/android/` page categories on `tracelayer.com`
and `www.tracelayer.com`. Mockups, unknown/private paths, local/preview hosts and
explicit internal/test visits are excluded.

The script records anonymous pageviews, session IDs, page exits, a ten-second
foreground engagement event, signup-link clicks and Android download-link clicks.
It sends bounded campaign tags and host-only referrers. It never sends query strings,
fragments, emails, form contents, page titles, raw link targets or person profiles.
Autocapture, replay, surveys, exception capture and performance capture remain off.
DNT, Global Privacy Control, PostHog opt-out and local opt-out flags are respected.
Anonymous browser storage remains separate from the app.

Downloads remain independent of analytics. The Android page retains its bounded
SDK wait and no-JavaScript redirect. An automatic redirect is not a download click
or proof of installation. A waitlist button is not an account signup.

The homepage currently has placeholder links and no live signup CTA. The v2 page's
“Sign up” button opens its waitlist. Neither is reported as an account signup click.
The handler recognizes real links to the customer `/signup` route when present.
Completed registrations, verification and activation come from the separately
implemented server events, not the public website.

Run `npm install --no-save --package-lock=false playwright`, then
`node --test docs/analytics/verify.cjs`. Chromium is required. Tests fetch the public
SDK but intercept ingestion and external service requests locally. They never add
synthetic data to the production project. `POSTHOG_SDK_PATH` can point to a downloaded
SDK for repeatable runs; its SHA-256 is recorded with the evidence.

See [the current contract and rollout record](docs/analytics/CONVERSIONS.md).
The earlier pageview-only work is retained in `docs/analytics/REVIEW.md` as historical
evidence. This change does not deploy the website or change its existing consent policy.
