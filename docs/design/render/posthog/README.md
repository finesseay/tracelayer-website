# Visual check — 2026-10-22

Rendered all ten changed pages before and after using `tracelayer-screenshot` at
1440×900 with 1000ms virtual time, and inspected all PNGs at their native size.
No layout, text or styling changes were observed. Animated particles, counters
and film frames differ naturally between captures. All nine ordinary HTML pages
are byte-identical to baseline after removing the new script include.
The Android fallback markup/styles are unchanged; only redirect timing changed.

Baseline: 454af6d95af141c7721bb6b943bcbc183a68ad04.
The screenshot fixture `docs/analytics/render-server.py` strips Android navigation
only while rendering so the fallback text remains visible. Browser network and
redirect checks use the unmodified served files instead. Two initial baseline
renders timed out and were rerun successfully. These are visual checks, not
pixel-identical assertions over animated pages.
