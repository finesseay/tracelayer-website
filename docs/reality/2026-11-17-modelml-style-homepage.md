# Homepage redesigned in the style of modelml.com

Task: tsk_e4554fd0-9a15-4621-8cb7-6fb360b30980
Repository: finesseay/tracelayer-website
Status: implemented and locally verified as a Task preview. Not deployed. Awaiting operator review.

## Authorized outcome

The operator asked for the website to be redone emulating the style and emphasis of
https://modelml.com/. No deployment was requested.

## What changed

- `index.html` is rewritten. Order: navy early-access bar, full-screen Mars hotel image
  with a serif headline, one line and one Sign Up button, a strip of four product facts,
  three benefit cards, the platform list beside one large panel, four example-work
  cards, a data row, the explainer film on a navy band, a closing band and a dark footer.
- New `home/` folder: `style.css`, `site.js`, self-hosted Newsreader and Inter (latin
  subsets, SIL OFL; licence texts are `home/fonts/Newsreader-OFL.txt` and
  `legal/assets/Inter-LICENSE.txt`) and `mars-hotel.webp`, a 206 KB re-encode of
  `assets/6ef15091167b26d0.png`.
- Headline is now "Your AI team. One workspace." The operator's positioning line, "The
  easiest way to integrate AI agents into your team.", is the one line under it. Page
  title and description are unchanged.
- Copy uses only claims already on the previous homepage. No customers, quotes,
  certificates or numbers were added.
- The header and popup now use the canonical brand mark. The previous header drew the
  short angular pulse that the brand guide lists as not to be used.
- The popup's close buttons use a cross in place of the arrow glyph.
- The named public figures and their photographs are carried over from the previous
  homepage unchanged in substance. The team card now shows the line "Illustrative AI
  agents, not the people themselves." in view, where before it was only in the
  accessible label. Whether to keep them is the operator's decision.

## What did not change

- Sign Up and Log In destinations, the newsletter popup behaviour and its waitlist API
  contract, the mobile menu script, the analytics include, the explainer video, the legal
  pages, the archives and the Android download page.
- The previous homepage's folders (`hero/`, `features/`, `platform/`, `waitlist/`,
  `footer-options/`) are kept and no longer loaded, apart from avatar images.

## Contract change in the checks

`docs/website/verify.cjs` asserted the previous first screen: the old headline in the
`h1` and eight tool logos in `#orbit-hero`. The redesign removes the orbit, so those
assertions now describe the new first screen: the new `h1`, the positioning line, exactly
one Sign Up button that sits within the first screen, four facts and no orbit. A check of
the platform list was added. Every other assertion is unchanged and passes unmodified,
including navigation order, mobile menu, tap sizes, footer height, newsletter, video,
archives and no horizontal overflow.

## Evidence

`docs/design/render/modelml-redesign/` holds the renders and logs. Website checks: 10 of
10 pass. Analytics checks: 16 of 16 pass. Waitlist service check: 1 of 1 passes.

## Not verified

- Real phones and Safari. Checks ran in Linux Chromium only.
- Dark mode. The page is light only, as before.
- Production. Nothing was deployed.
