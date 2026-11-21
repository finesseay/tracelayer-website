# Section 01 wording

Changed the homepage section "01 SHARED UNDERSTANDING" in `index.html` (inside the `#team-benefits` template) to the wording John chose on 29 October:

- Heading: “Give agents your<br>company context.” (was “Your company,<br>in every agent.”)
- Paragraph: “Keep company decisions and working methods in shared guidance. Agents read it before each task.”

The label, the `context-title` id, the picture and its animation are unchanged. No stylesheet, script or pricing changes. Baseline is `af01319` (pricing section).

Verified on 2026-11-21:

- `node --test docs/website/verify.cjs`: 10 passing (`website-check.log`). No check asserted the old wording, so none was changed.
- `node --test docs/analytics/verify.cjs`: 16 passing (`analytics-check.log`). Its regenerated `docs/analytics/conversion-browser-evidence.json` was restored, as it is unrelated to this change.
- `node --test infra/waitlist.test.mjs`: 1 passing (`waitlist-check.log`).
- `node capture.cjs af01319` renders section 01 before and after at 1440 × 900 and 390 × 844 (`before-*.png`, `after-*.png`), asserts the new copy, and asserts the page's visible text outside section 01 is identical to the baseline at both widths (`checks.json`). The screenshots were inspected: the new heading and paragraph sit in the same place and type, the picture is unchanged, and nothing is clipped.
- `tracelayer-screenshot` rendered the page at both widths. It captures only the first screen (the unchanged hero), so those images were not kept.

Not verified: real phones and browsers other than Chromium. No production deployment performed.
