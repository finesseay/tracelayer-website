# Remove animation pause controls

2026-10-30: Removed both homepage pause buttons and the empty How it works footer row. Animation scripts retain reduced-motion and offscreen/background pausing without requiring button elements. Updated source manifest hashes for the two changed scripts.

Validation: `node --test docs/website/verify.cjs` passed all 10 tests. Chromium checks at 390px and 1440px confirmed no pause buttons, no page errors, and platform reduced-motion pausing. Boundary screenshots were inspected at both widths. The desktop page was also rendered with tracelayer-screenshot. No deployment performed.
