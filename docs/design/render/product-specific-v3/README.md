# Website refinement preview — 29 October 2026

Applied the registry's product-specific-design v3 after reading it in full.
Scope: isolated copies in design-preview; the root homepage and shared assets are unchanged.
Baseline: repository homepage at 5c12e343c972e2340f486e99f7008dc0f91f0fd4 (source available in before.html).

Kept the existing font, mint emphasis, dark gradient, tool orbit, agent demonstration,
feature illustrations, video, landscape footer and desktop composition. Shortened the
hero and section headings, removed redundant feature kickers and detail captions,
trimmed explanatory paragraphs, and moved the product example before the orbit on phones.
Added a fictional-persona disclosure. This is a design hypothesis for operator review,
not a measured conversion improvement. Earlier app comparisons remain in their original
repository checkpoint and are linked from the comparison.

Captured full pages at 1440×1000 and 390×1000 with reduced motion for equivalent states.
Inspected the comparison, desktop hero and mobile hero at native resolution and the full
mobile page for section rhythm. No horizontal overflow or browser exceptions in the four
captures. The interactive pages retain original scripts and relative shared assets.
The original analytics loader is omitted in both isolated copies.

Repository checks: 27 passed, 0 failed across docs/website/verify.cjs,
docs/analytics/verify.cjs and infra/waitlist.test.mjs. Test service submissions are intercepted.
No production deployment performed.

Hosted comparison inspected after show: mobile selector loaded both captures, the
Open proposal link resolved, and its heading and images loaded successfully.
