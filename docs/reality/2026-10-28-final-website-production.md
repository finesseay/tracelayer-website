# Final Website Version: selected homepage and archives

Task: tsk_3a32ca0a-d2c1-4211-9ef8-b6b1d1135891
Repository: finesseay/tracelayer-website
Status: implemented and locally verified; production deployment pending.

## Authorized outcome

The operator selected standalone snapshot
`fe13630279ebd592ab847e81cbf2eacafe239030440e231cae2a618e4bb82281`
for `https://tracelayer.com/`, with the current homepage at `/archive1/` and
current `/v2/` at `/archive2/`. The later `245be8de…` demo cover was not selected.

## Changes

- Imported selected HTML, fonts, avatars, eight dynamically referenced tool icons,
  animations, Mars/Ares landscape and native demo video (44,461,507 bytes).
  Source URL and per-file hashes are in `docs/website/source-manifest.json`.
- Removed homepage noindex, restored real mailto links from Cloudflare transport
  markup, added canonical/description and the unchanged production analytics script.
- Preserved current production root/v2 HTML from `8793369bb3fdac3a5944ecf4fe45d2b5a6de89ad`
  in archive folders. Added noindex/canonicals and adjusted the archived v2 home link.
  All legacy asset directories remain unchanged. `/v2/` redirects to `/archive2/`.
- Preserved existing approved legal pages/downloads and licensed font. They match
  the accepted source content and already correct its email obfuscation/missing font.
- Kept account links absolute. Added the existing exact brand SVG at
  `/auth-design/logo.svg`, the missing GitHub Pages path requested by both live forms.
  No application routing or account behavior was changed.
- Newsletter retains existing popup and waitlist API contract. No mailing provider
  integration or live service restart is included in this static website release.
- Updated test scenario for newsletter vs account signup and archive exclusions.

## Evidence

`docs/design/render/final-website/README.md`, browser PNGs and test logs record
5 website checks, 16 analytics checks and the isolated waitlist service check passing.
Desktop (1440), tablet (768), mobile (390), video playback/seeking/ranges, newsletter,
archive navigation, legal links/downloads, preserved source assets and privacy verified.
Read-only live auth forms load. The live logo URL is still 404; serving the release SVG
at that URL in an isolated browser fixes both forms (`auth-logo-fix-check.json`).

## Hosting and deployment boundary

GitHub Pages API reports legacy branch deployment from `main` at `/`, CNAME
`tracelayer.com`; latest successful build at inspection was production commit `8793369`.
The infra README's old `master` instruction was corrected. A governed verified
integration push should trigger the existing Pages build. A push alone is not proof
of publication. The one-command Task funnel is provided read-only at
`/context/tracelayer/ops/vps/bin/deploy-task-from-worker.sh` and is invoked from this
website worktree. Current worker's suffixed workspace Task env must be set to the
actual Task ID for that command. No raw production push or host operation is allowed.
