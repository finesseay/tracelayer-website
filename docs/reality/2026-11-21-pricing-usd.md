# Homepage pricing in US dollars, 1 Task at once (not deployed)

Task: tsk_d2c38088-3922-44d2-9b0c-255426b4c259
Repository: finesseay/tracelayer-website

Follows the operator's 21 Nov 2026 decision on the P7 pricing section. Prices are now
$0, $49 a month or $490 a year, $199 a month or $1,990 a year, and "Talk to us". Team's
extra-person line reads $35 monthly and $350 yearly. The section never had VAT or tax
wording, so none was removed.

Free, Pro and Team all allow 1 Task at once. Free's card keeps "1 Task at once". Pro's
"3 Tasks at once" and Team's "6 Tasks at once" card lines are removed, and the comparison
table's "Tasks at once" row reads 1, 1, 1. Enterprise stays "6+", as the brief did not
change it.

Only `index.html` changed on the page. `assets/pricing.css` and `assets/pricing.js` are
unchanged, so no pinned hashes moved. `docs/website/verify.cjs` now checks the dollar
prices, the absence of `€`, VAT and tax wording, and the Tasks-at-once values. All 10
website, 16 analytics and 1 waitlist checks passed in Chromium. Loading and scrolling the
page made no external requests before or after. Before/after renders are in
`docs/design/render/pricing-usd/`.

Not deployed.
