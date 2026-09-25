# KAN-33 — run 36105632777 mobile visual RCA

Date: 2026-09-25  
Run: `36105632777`  
Exact staging SHA: `4f872d52a89058909a4a50e92286278b1f09cf7f`  
Diagnostics artifact: `10851710162`  
Artifact digest: `sha256:818c2a08202355cd9c598029c8c7e9afe037e0029584df1b1f54d87ad45811ce`

## Finding

The four mobile failures share a mixed presentation delta against snapshots
created by `0781bfd` on 2026-09-04. Later commits intentionally moved the price
above the description (`8235e63`) and standardized money to two fraction digits
(`6df18f6`, KAN-29). Commit `3f1d634` also introduced unsupported plain-text
shipping and returns promises. KAN-33 merge `4f872d52` changed tests/governance,
not app or CSS code.

| Width | Expected | Actual | Logged delta |
| --- | --- | --- | --- |
| 320 | 320×2649 | 320×2649 | 8,661 pixels; ratio 0.02 |
| 360 | 360×2609 | 360×2630 | +21 px; 61,450 pixels; ratio 0.07 |
| 390 | 390×2614 | 390×2635 | +21 px; 64,767 pixels; ratio 0.07 |
| 430 | 430×2617 | 430×2638 | +21 px; 70,044 pixels; ratio 0.07 |

Expected/actual/diff images show the same price position, money format, and
support-copy change at every failing width. Product media, controls, S/M/L,
gallery, and lower content remain structurally aligned. The +21 px displacement
is downstream reflow, not an independent CSS spacer defect. Wider snapshots
passed only because the same stale-content delta stayed below the one-percent
threshold.

## Governed disposition

Pushpa approved the responsive layout and `$128.00`, but rejected the composite
as a new baseline because `Free shipping on eligible orders · Returns accepted —
see policy` asserts unsupported policy promises. With no approved targets
evidenced, Sushma approved the minimal repair: remove only that copy, leaving the
purchase-support region and Size guide intact. Baselines remain unchanged.
