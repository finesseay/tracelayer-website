# Homepage Legal link — 28 October 2026

The homepage footer now has one `Legal` link to `/legal`, replacing its two placeholder policy links. No other existing website page was edited.

`legal/` contains the approved Terms and Privacy pages and their linked assets and PDF/text downloads from the Task's immutable published version. `source-manifest.json` records the source URL and SHA-256 hashes. Cloudflare's transport-injected email obfuscation was decoded back to `hello@tracelayer.com` and `mailto:` links; its injected decoder was removed. Policy wording, the 2026 date, company identity, correspondence address, and download bytes are preserved.

## Verification

- Served the repository with `python3 -m http.server 8000 --bind 127.0.0.1`.
- Chromium/Playwright checked desktop (1440 × 900) and mobile (390 × 844): exactly one homepage Legal link, keyboard activation, `/legal` redirect to the directory index, both documents, company/contact/date, no drafting labels, no horizontal overflow, successful local assets and download responses, appearance toggle, and no page errors. Results: `checks.json`.
- Verified the PDF file signatures and the company/contact wording in editable downloads. Binary downloads match the immutable source hashes.
- Rendered all three pages. Inspected the homepage footer on desktop/mobile and the Terms and Privacy on desktop/mobile and in dark mode. Screenshots are alongside this record. The screenshot helper rendered both legal pages; Playwright also captured the homepage and footer.
- `node --test docs/analytics/verify.cjs` passed: 16 tests, 0 failures, 0 skipped. See `analytics-test.log`. The test-generated analytics evidence in the existing folder was restored so unrelated records are unchanged.
- `git diff --check` passed.

This change does not deploy the website.

## Hosted preview limitation

The static preview serves explicit files, including `legal/index.html`, but returns 404 for directory paths and root-relative `/legal`. The homepage link remains `/legal` as requested and works with the local static server, which resolves directory indexes. The hosted preview cannot demonstrate that click end to end. An application-preview request returned a platform internal error. No production routing was changed or deployment attempted.
