# PostHog dashboard verification — 2026-10-24

Used the granted **tracelayer** browser identity with Act access, EU project **312428**.
No production event was fabricated or ingested. No paid addon, replay, identity join,
billing connection, deployment or gateway configuration was enabled in this turn.

The product dashboard was reloaded at 2026-10-24T13:00:45.453Z.
All seven report names were observed after scrolling through its lazy-loaded cards.
The website dashboard was reloaded at 2026-10-24T13:02:10.049Z.
Both new website report names were observed after scrolling to the lower cards.
Every insight was separately confirmed as referenced by its intended dashboard.

- Product: https://eu.posthog.com/project/312428/dashboard/1051591
- Website: https://eu.posthog.com/project/312428/dashboard/1051338

| Saved insight | Verified URL |
| --- | --- |
| TraceLayer | Delivery coverage | https://eu.posthog.com/project/312428/insights/jW6qywks |
| TraceLayer | Signup and onboarding events | https://eu.posthog.com/project/312428/insights/jTnxJ4N5 |
| TraceLayer | Signup cohort activation funnel | https://eu.posthog.com/project/312428/insights/MlJsSBfv |
| TraceLayer | Active accounts and workspaces | https://eu.posthog.com/project/312428/insights/IV8iTjgu |
| TraceLayer | Week-two signup retention | https://eu.posthog.com/project/312428/insights/jt4wQo7X |
| TraceLayer | Task outcomes and elapsed time | https://eu.posthog.com/project/312428/insights/JNoIScLz |
| TraceLayer | Observed engine tokens and cost | https://eu.posthog.com/project/312428/insights/u58b32m8 |
| TraceLayer | Website conversion and engagement events | https://eu.posthog.com/project/312428/insights/PAo8eImt |
| TraceLayer | Sanitized website campaign and referrer | https://eu.posthog.com/project/312428/insights/MhAAjTNK |

Each final SQL query ran successfully in the project's SQL editor before saving.
Queries use the implemented schema and explicit production/internal/test filters.
Product event and coverage queries returned no observations; cohort queries returned
null values for empty cohorts. This is pre-deployment evidence of query validity,
not proof of zero registrations or complete instrumentation.

The product dashboard description documents coverage, the pending rollout,
activation, active-use and cost definitions, unavailable billing, and privacy limits.
Each insight has its own definition and observation limits. SQL reporting windows
are the last 30 complete UTC days; DAU/WAU/MAU and eligible week-two retention use
their documented windows. Dashboard date controls do not rewrite these fixed SQL
windows. The app Overview retains its 7/30/90-day selection and full coverage logic.

The first page read truncated the website action description at 400 characters.
It was shortened and reloaded; the complete final text was verified.
Existing website dashboard filters and existing insights were preserved.

Exact final SQL, descriptions and links are in `posthog-reports.json`.
The browser was used through the governed TraceLayer tools, without raw browser
JavaScript, API credential extraction or alternate browser identities.

