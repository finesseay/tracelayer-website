# Website conversion measurement — 2026-10-24

Task: `tsk_ebcf37ba-8760-4850-a49d-3875d370b64b`.
This implements the website part of the authorized signup and product-metrics work.
No deployment or gateway configuration was performed.

## Website event contract

All collected events use `tracelayer_surface=website`, `tracelayer_schema=1`,
`tracelayer_internal=false` and `tracelayer_test=false`. Non-production hosts,
mockups, private/unknown paths, explicit preview/sample/test query flags and browsers
locally marked internal/test are excluded before the SDK is loaded.

| Event | Meaning | Additional data |
| --- | --- | --- |
| `$pageview` | A known public page was viewed, including a bfcache restoration | Anonymous browser, session and pageview IDs; both action-handler capabilities |
| `website_signup_click` | A trusted, uncancelled mouse/middle/keyboard click on an HTTPS `tracelayer.com/signup` or `www.tracelayer.com/signup` link | `link_target=signup` |
| `website_download` | A trusted click on the Android download page or the exact app APK destination | `link_target=android-page` or `android-apk`, `platform=android` |
| `website_engaged` | At least ten seconds of foreground time for this pageview, once | Cumulative `visible_seconds`, maximum `scroll_percent` |
| `$pageleave` | Exit or hidden-tab checkpoint, deduplicated across exit hooks until resumed | Same pageview/session; foreground seconds and scroll percent |

An automatic APK redirect is not a download click or proof of an install. The direct
fallback link is measured when clicked. There are no reliable install/uninstall facts
in this website. The redirect still proceeds after SDK error/opt-out or the existing
1.5-second deadline; its two-second meta refresh remains the no-JavaScript fallback.

Pageviews advertise `tracelayer_signup_tracking=true` and
`tracelayer_download_tracking=true` only after both delegated handlers are installed.
The main app's report uses first-seen capability and coverage across pageviews to
separate measured zero from unavailable history. Browser collection is best effort:
ad blockers, offline delivery and killed browser processes can still lose events.
There is no durable browser outbox or claim of full visitor coverage.

## Current public entry limitations

The homepage has placeholder `#` links and no real registration CTA. The v2 header's
“Sign up” and “Join the waitlist” buttons open its existing waitlist dock. Those are
not account-signup clicks. The old waitlist UI can show locally stored provisional
success after API failure, so it must not be used as proof of registration.
This change sends no `website_waitlist_joined` event or capability.

A real link to the separately implemented customer `/signup` route is recognized
when present. The `app.tracelayer.com` operator login is not a customer signup route.
No CTA destination or signup availability was changed by this analytics Task.

## Privacy and attribution

A send-boundary allowlist reconstructs both the event envelope and its properties.
It drops unrecognized events, person updates, form values, titles, raw links, arbitrary
properties, URLs with queries/fragments and all app/account identifiers. Only known
public page categories are sent. The app's identity namespace is never joined.

Allowed attribution consists of `utm_source`, `utm_medium`, `utm_campaign` tags and
`$referring_domain` (host only). Tags start with a letter, contain only letters,
digits, underscores or hyphens, are at most 64 characters, and reject long numeric
or hexadecimal identifiers. Invalid values are omitted, not partially redacted.
Campaign names must remain non-personal. No `utm_term`, `utm_content`, click IDs,
invite codes, referrer paths, referrer queries or historical attribution are sent.
GeoIP enrichment is off; unknown geography remains unknown.

DNT and Global Privacy Control stop SDK loading and collection. The existing
PostHog opt-out is honored. Setting any of these localStorage flags to `1` suppresses
collection; changes are rechecked for every event:

- `tracelayer_analytics_opt_out`
- `tracelayer_internal`
- `tracelayer_test`

No account is identified, and `person_profiles=never` prevents person processing.
Autocapture, replay, surveys, performance and exception capture remain off. Anonymous
persistence stays in the existing website namespace, separate from app storage.
This implements privacy controls without changing the site's existing consent policy.

## Product metrics and rollout

The matching main application result is commit
`129d391deb26a158f46e15b9c7b42f7a59de2765` in `finesseay/tracelayer`.
Its `docs/POSTHOG.md` is the server contract and gateway configuration reference.
It implements durable registration, email verification, provisioning, first verified
activation, Task/turn outcomes and existing usage observations. IDs are pseudonymous;
retry delivery and hourly per-family coverage survive restarts.

Overview reports signups, cohort activation, active accounts/workspaces, DAU/WAU/MAU,
week-two retention, Task reliability/duration and observed token/cost amounts. It
checks certificates against queryable PostHog events and uses measured/partial/
unavailable values. No signup denominator means N/A. A previous period cannot be
retroactively declared measured. Billing and paid customers remain unavailable.

Both reviewed repository results need authorized deployment. The isolated gateway
also needs its explicit product-analytics enablement, ingestion token, stable private
identity key and exact internal-address exclusions. Saving a Space secret does not
configure that gateway. Production activation and an eligible customer journey must
be verified after rollout; local tests are not live-ingestion evidence.

The existing saved PostHog website dashboard is
https://eu.posthog.com/project/312428/dashboard/1051338.
The separate product dashboard is
https://eu.posthog.com/project/312428/dashboard/1051591.
Server events have no website URL, so a website Host filter must not be applied to
product reports. Saved SQL, links and verification evidence live beside this record.
Observed charts use actual event rows; coverage must be consulted before treating
an empty chart as zero. The app Overview performs the full per-metric coverage check.

## Verification

`node --check assets/analytics.js`, `git diff --check`, and all **15 browser scenarios**
passed (Node test runner reports 16 tests including the parent suite).
`conversion-browser-evidence.json` records the tested SDK hash and successful checks.
No test event was ingested into the live project.

The real SDK was fetched from its public CDN and run in Chromium. The fixture served
actual repository pages under intercepted production origins and intercepted every
ingestion and external-service request. It verifies identity continuity, capability
flags, real keyboard/mouse/middle clicks, excluded destinations, cancellation,
duplicate inclusion, strict property filtering, opt-out/revocation, visibility/
engagement, bfcache and blocked/slow SDK download navigation. Exit capture uses an
early beforeunload fallback plus pagehide and visibility hooks; these are deduplicated.
The automated browser's pagehide behavior originally exposed a dropped exit event,
which the final full test run covers.

The Task API separately confirms the main application's exact checkpoint passed
platform verification with PostgreSQL 16: 7,215 tests passed and 7 skipped.
That is evidence for the application result, not this website's test count.

Home desktop/mobile and v2 desktop renders were inspected. See
`../design/render/posthog-conversions/README.md` for method and limits.

SDK references: https://posthog.com/docs/libraries/js/config and
https://posthog.com/docs/libraries/js/features. The implementation uses custom captures,
a `before_send` allowlist, manual page exits, and beacon transport.
