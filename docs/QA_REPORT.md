# Interactive essay QA

## Existing features audited

The opening already had a shared term count, playback controls, and a collapsed exact-sums table. The distance lab already included the suffix comparison, example pairs, factorization, and prediction. The residue explorer already supported comparison, tracing, closed balls, and convergence. The last chapter had a proof and a collapsed explanation of the all-ones expansion, including the eight-bit congruence. The update reuses the existing arithmetic, controls, and tree renderer and puts the final experiment and all-ones explanation directly in the reading path.

The eight-stage expansion retained the binary bridge, tree guide, ball controls, and synchronized convergence lab. It shares the explorer’s ball readout with the prediction lesson. The carry experiment replaces the static eight-bit figure with the same arithmetic displayed one step at a time. The browser DOM contains 2,426 words of main prose, excluding figure labels, callouts within the carry figure, collapsed answers, and source notes.

## Checks run

| Check | Result |
| --- | --- |
| `node --test Two_Adic_Codex_Build_Kit/two-adic-build-kit/starter/twoadic.test.mjs` from the workspace | Seven groups passed before UI work. |
| `npm.cmd test` from the app | Seven groups passed, including 5,000 seeded triples with seed `20261119`, large integers, modular roots checked against a brute-force oracle, and the finite carry invariant. The engine, declarations, and tests match the kit files byte for byte. |
| `npm.cmd run build` from the app | TypeScript and the Vite production build passed. JavaScript is approximately 168 kB gzip across the app and KaTeX chunks. CSS is approximately 14 kB gzip. Fonts are bundled separately. |
| `$env:ADIC_BROWSER_CHANNEL = 'msedge'` followed by `npm.cmd run test:browser` from the app | All 33 Playwright checks passed against the production build in Edge on Windows. |
| SHA‑256 of `original/SPEC.original.md` | Matches the kit manifest. |

Browser coverage included the 1 and 9 split at depth 4, a hidden split with separately labeled resolution and exact distance, equality, invalid and oversized input, trace of −1, bit-reversal order, the full depth-7 node and edge counts, keyboard node selection with retained focus, recentering at 9, and convergence at terms 5 and 20. The opening playback passed pause, reset, and scroll-away checks. The static proof rendered with JavaScript disabled.

At 320 px the ball mode and full-tree view kept horizontal scrolling inside the diagram. The browser check used reduced motion and verified a 44 px table control, keyboard selection, and no axe WCAG 2.x A/AA findings in that state. A separate test exercised tree controls with text enlarged to 200% via the root font size.

The distance lab checks covered all five presets, the ranking reversal and ties, tabbing into the optional neighbor field, invalid drafts, and both endpoints of the input range. The factorization tests covered the full 1000 and −12 quotient sequences, reset after a change, the notation and disabled step control for zero, and bounded nonzero random input. Keyboard controls gave exact feedback for the 48 versus 80 prediction. At 320 px, opening both drawers with large inputs and reduced motion caused no page overflow or axe WCAG 2.x A/AA findings in the Distance chapter.

The new checks verified that 1 and 9 agree modulo 2, 4, and 8 and first disagree modulo 16. The guide revealed the root and three further levels, supported keyboard navigation in both directions, and kept the explorer settings across transitions. At five terms, the final lab showed sum 31, binary `11111`, and errors 32 and 1/32. The chart axes and curves stayed fixed while both markers moved. At 20 terms the 2-adic error was still positive at 1/1048576. The five-bit window agreed at term 5, and the eight-bit window was checked both before and after agreement. Playback stopped at 20, on Pause, during a precision change, and on a simulated hidden-tab event. Reset restored one term and five-bit precision with no deferred tick. The main reading path showed `255 + 1 = 256`, a carry at bit 8, and the distinct congruence `256 ≡ 0 (mod 256)`.

At 320 px, all three new figures fit the viewport with reduced motion, keyboard controls, and the longest binary sum. That state produced no page errors or axe WCAG 2.x A/AA findings.

The expansion verified twelve successive doublings and reset, prediction before recentering at 9, unchanged highlighted membership, both largest distances among 1, 9, and 3, negative and repeated points, all eight successful fraction extensions, and the rejected sibling at each level. The final candidate gives `3 × 171 = 513` and `513 ≡ 1 (mod 256)`. The carry remained exact after each checked step and completed automatically. Pause, reset, changing width, and a simulated hidden-tab event each canceled playback. At 320 px with reduced motion, the sixteen-bit carry window scrolled locally and the whole page passed the checked axe rules.

## Reviewed screenshots

| Viewport width | Opening | Tree |
| --- | --- | --- |
| 375 px | [Opening](screenshots/opening-375.png) | [Tree](screenshots/tree-375.png) |
| 768 px | [Opening](screenshots/opening-768.png) | [Tree](screenshots/tree-768.png) |
| 1,280 px | [Opening](screenshots/opening-1280.png) | [Tree](screenshots/tree-1280.png) |
| 1,440 px | [Opening](screenshots/opening-1440.png) | [Tree](screenshots/tree-1440.png) |

The first 320 px check exposed overflow in the ball table. Removing the match column from ball mode kept all selection buttons visible. The responsive opening now keeps a space between the two sentences in the graphic title and enlarges the highlighted residue labels on mobile.

The distance lab was inspected at [375 px with two neighbors](screenshots/distance-375.png) and [1,440 px with the factorization of 1000 expanded](screenshots/distance-1440.png). The first browser pass caught extra TeX escapes in the zero-valuation equation. The regression check verifies the rendered infinity symbol.

| New figure | 375 px | 1,440 px |
| --- | --- | --- |
| Low-bit comparison at k = 4 | [Mobile](screenshots/bridge-375.png) | [Desktop](screenshots/bridge-1440.png) |
| Guided tree at the modulo-8 step | [Mobile](screenshots/guide-375.png) | [Desktop](screenshots/guide-1440.png) |
| Convergence at five terms | [Mobile](screenshots/convergence-375.png) | [Desktop](screenshots/convergence-1440.png) |
| Eight-bit carry | [Mobile](screenshots/carry-375.png) | [Desktop](screenshots/carry-1440.png) |

The desktop expansion captures show the [three-point tree](screenshots/geometry-1440.png) and the [fraction builder](screenshots/fraction-1440.png).

## Pending review

Safari, Firefox, physical touch devices, manual screen-reader testing, and real-reader timing are pending.
