# TraceLayer public website

Static source for **https://tracelayer.com**. No build step is required.

| Path | Purpose |
| --- | --- |
| `index.html` | Accepted Final Website Version, snapshot `fe13630279ebd592ab847e81cbf2eacafe239030440e231cae2a618e4bb82281`. |
| `hero/`, `features/`, `platform/`, `waitlist/`, `footer-options/` | Website animations, styles, fonts and newsletter popup. |
| `assets/` | Current images/video plus preserved legacy assets and privacy-aware analytics. |
| `archive1/` | Previous production homepage, preserved from commit `8793369`. |
| `archive2/` | Previous `/v2/` page, preserved from the same production commit. |
| `v2/` | Redirect to `/archive2/`, preserving query and fragment in JavaScript. |
| `legal/` | Existing approved terms/privacy pages and downloads. |
| `download/android/` | Existing Android download redirect. |

The homepage uses the selected native video player, without the later demo cover.
Archive HTML is excluded from indexing. Its `/assets/harness/`, `/assets/brand/`,
`/assets/vendor/` and analytics dependencies are retained. The legacy animation
loader resolves its library relative to its script so saved previews work too.
The live `/login` and `/signup` routes remain owned by the application repository.
Newsletter capture uses the existing `api.tracelayer.com/waitlist` service.

## Local checks

```sh
npm install --no-save --package-lock=false playwright
node --test docs/website/verify.cjs
node --test docs/analytics/verify.cjs
node --test infra/waitlist.test.mjs
```

Chromium must be available at `/usr/bin/chromium` (or set `CHROMIUM_PATH`).
Browser tests intercept external requests and never submit production registrations.
For manual browsing: `python3 -m http.server 8000`.

## Deployment

GitHub Pages builds the root of `main` with CNAME `tracelayer.com`.
Use the governed Task command from this repository's worker:

```sh
TRACELAYER_TASK_ID=<actual-task-id> bash /context/tracelayer/ops/vps/bin/deploy-task-from-worker.sh <accepted-git-checkpoint>
```

The funnel validates acceptance, integrates with the latest production branch,
verifies and pushes the combined commit. The existing GitHub Pages build publishes
that push; no separate publisher is required. Verify its exact build commit and live
homepage, archives, auth destinations and video range response before calling it live.
Do not substitute a direct production push or lower-level deployment command.

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

The homepage links directly to account signup. Its newsletter popup is a waitlist
subscription, which is not reported as an account signup click. Archive paths are
excluded from collection; `/v2/` redirects without loading analytics.
The live customer routes are `https://tracelayer.com/signup` and
`https://tracelayer.com/login`. The handler recognizes signup links when present;
login links never count as signups. These routes are served by the application,
not by this static website repository.
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
