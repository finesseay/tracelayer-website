# Homepage pricing section (P7, not deployed)

Task: tsk_c0f8baf3-e73b-4788-98f9-9603a87bca9a
Repository: finesseay/tracelayer-website

Added the approved pricing section from the Pricing Journey preview (steps 2 to 6 and 50).
The header has a Pricing link between Platform and Log In; it also appears in the
existing phone menu. The `#pricing` section sits between the explainer video and the
closing Sign Up panel, as in the preview. It has the Monthly/Yearly switch, the Free,
Pro, Team and Enterprise cards, Compare plans and Questions, both opened in place.

Prices follow the final decisions: €0, €49 a month or €490 a year, €199 a month or
€1,990 a year, and "Talk to us". Team's extra-person line reads €35 monthly and €350
yearly. Free and Pro link to `https://tracelayer.com/signup?plan=pro`, Team to
`?plan=team`, and Enterprise to `mailto:hello@tracelayer.com`. These are plain links.
`assets/analytics.js` already matched sign-up clicks by path, so `?plan=` links count;
it is unchanged and the analytics test now clicks both plan links.

Departures from the preview: the yellow "New" marks and "Prices are proposals" note are
gone. The SOC 2 table row is left out, and the Enterprise card says "Security review"
instead of "Security review and SOC 2 report", until an audit exists. Compare plans uses an SVG
chevron, because the preview's "⌄" character had no glyph in the site fonts. Without
JavaScript, the table and answers stay open.

The homepage alone loads `assets/pricing.css` and `assets/pricing.js`; their hashes are
in `docs/website/source-manifest.json`. All 10 website, 16 analytics and 1 waitlist checks
passed in Chromium. No horizontal scroll at 320 to 1440 pixels. Loading and scrolling the
page made no external requests before or after the change. Side-by-side renders and logs
are in `docs/design/render/pricing-section/`.

Not deployed. Prices go public only after Pro can be bought (P2, P3 and the Stripe key).
