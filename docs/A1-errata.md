# A1 — Errata & Documentation Inconsistencies

Cross-referencing docs, receipts, cutlist, and code as of 2026-02-24.

---

---

---

---

---

## 8. Joist Lumber Quantities

| Source | 2×8 × 8' | 2×8 × 12' | 2×8 × 16' |
|--------|-----------|------------|------------|
| `cutlist.csv` | 5 | 13 | 2 |
| `receipts.csv` | 5 | 13 | 2 |
| `3-joists.md` cut list | — | 11 (field) | 2 (rim) |

**Findings**: Receipts match cutlist. The joist doc says 11 field joists × 12' + 2 rim joists × 16' = 13 boards. But the cutlist also has 5 extra 2×8-8' boards and 2 extra 12' boards (13 vs 11). The extra 2×8-8' boards may be for blocking stock, and the 2 extra 12' boards may be spares or also for blocking. This isn't an error — just not explicitly documented in the joist doc's cut list.

---

## 9. Pier Descriptions: "North" vs "South" Beam Position

| Source | P1 / P4 position |
|--------|-------------------|
| `1-piers.md` line 54 | "P1 = NE corner" (north beam) |
| `0-readme.md` line 50 | "Beam 1 (N)" — P1, P2, P3 on north beam |
| `dimensions.scad` lines 178–179 | P1 at y=126 (north), P4 at y=18 (south) |

These are all consistent. No issue found.

---

---

---

## 12. Connector Nail Quantities vs Need

| Source | SSA8D (2.5") | SSNA8D (1.5") |
|--------|-------------|---------------|
| `8-fasteners.md` §4 | Need: 130 long + 130 short | |
| `receipts.csv` line 79 | 2 × 1lb SSA8D (2.5") | ~94 nails/lb × 2 = ~188 |
| `receipts.csv` line 80 | 1 × 150ct SSNA8D (1.5") | 150 nails |

**Issue**: Need 130 of the 1.5" nails but only purchased 150ct (one tub). Need 130 of the 2.5" nails and purchased ~188. The `8-fasteners.md` §4 lists quantities of "(155 @ $23.36)" and "(94 @ $24.12)" which appear to be the per-tub counts and prices, not the quantities purchased. The receipt shows 2 tubs of SSA8D and 1 tub of SSNA8D — this should be sufficient but is confusing as written.

<leave this for now>
---

## 13. Wall Studs: Species Mismatch

| Source | Species |
|--------|---------|
| `4-walls.md` line 5 | "2×6 at 16" o.c., **Hem-Fir** #2" |
| `receipts.csv` line 30 | "**SPF** 2x6-96" Premium Framing Stud #2&Btr KD S4S, 48" |

**Reality**: SPF studs were purchased, not Hem-Fir. SPF has similar (slightly lower) design values to Hem-Fir for wall studs, so this is not a structural concern, but the documentation doesn't match what was bought. The 2×4 framing lumber is also SPF (receipts line 28–29).

**Fix needed**: Update `4-walls.md` to reflect SPF #2, or note the substitution.

<fix this: document the usage of SPF for framing and trusses. we shold re-run the truss.js tool with the updated load values for SPF to make sure we're still ok.>

---

## 14. Subfloor: Advantech vs CDX

| Source | Description |
|--------|-------------|
| `cutlist.csv` line 14 | "PT 3/4" plywood (or Avantek subfloor) x 4x8', 6" |
| `receipts.csv` line 40 | "**Advantech** 3/4" OSB Underlayment T&G 4'x8', 6" |
| `0-readme.md` line 180 | "3/4" T&G Advantech or CDX plywood" |

**Findings**: Advantech was purchased. The cutlist misspells it as "Avantek". Minor typo.

<fix please>
---

## Summary of Items Needing Updates

| Priority | File | Issue |
|----------|------|-------|
| **High** | `0-readme.md` | Beam fastener still says "structural screws (GRK RSS)" — should be bolts |
| **High** | `dimensions.scad` | Same — beam fastener comment references GRK RSS screws |
| **Medium** | `2-beam.md` | Says "carriage bolt" — purchased hex head bolts |
| **Medium** | `cutlist.csv` | Multiple discrepancies: 3×10 vs 3×12, 1×3 qty, missing H2.5AZ, Zip panels |
| **Medium** | `5-wall-layers.md` | Still says "OSB" — Zip System was purchased |
| **Medium** | `6-trusses.md` | Roof sheathing material/source unclear |
| **Low** | `4-walls.md` | Says Hem-Fir studs — SPF was purchased |
| **Low** | `2-beam.md` | ABU66SS price from FastenersPlus, not actual Dunn Lumber price |
| **Low** | `8-fasteners.md` §1 | Header says 6.5" Titen HD — 6" was purchased |
| **Low** | `cutlist.csv` | "Avantek" typo (should be "Advantech") |
