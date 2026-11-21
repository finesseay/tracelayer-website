# Homepage pricing: no trial, Pro renamed Start, Team renamed Professional (not deployed)

Task: tsk_26384375-11ee-4dcb-bce7-e9655eba254f
Repository: finesseay/tracelayer-website

Follows the operator's 21 Nov 2026 decision and builds on the US-dollar pricing change
(tsk_d2c38088). The pricing cards and comparison table header now read Free, Start,
Professional and Enterprise. "Most popular" stays on Start. The only trial promises on the
homepage were the lead line "Every new account gets Pro free for 14 days." and the two
"Start 14-day trial" buttons. The sentence is removed and both buttons now say "Start free".
Enterprise keeps its email link.

Sign-up links are unchanged: Free and Start use `signup?plan=pro`, Professional uses
`signup?plan=team`, because analytics count them. The cards' hidden `data-plan="pro"` and
`data-plan="team"` attributes are also unchanged; nothing on the page shows them.

Only `index.html` changed on the page. `assets/pricing.css` and `assets/pricing.js` are
unchanged, so no pinned hashes moved. `docs/website/verify.cjs` now checks the new names
on cards and table, "Most popular" on Start, the button wording, and that the homepage has
no trial wording. All 10 website, 16 analytics and 1 waitlist checks passed in Chromium.
No horizontal scroll at 390 wide and no external requests before or after. Before/after
renders are in `docs/design/render/pricing-names/`.

Not deployed.
