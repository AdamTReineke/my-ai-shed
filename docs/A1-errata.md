# A1 — Errata & Documentation Inconsistencies

Cross-referencing docs, receipts, cutlist, and code as of 2026-02-24.

---

## 1. Beam Lamination Fastener: Bolts vs Screws vs Carriage Bolts

Three different fastener descriptions appear for the beam lamination:

| Source | Fastener |
|--------|----------|
| `0-readme.md` line 166 | "Connected with structural screws (GRK RSS) from both faces at 12" o.c. staggered" |
| `dimensions.scad` line 94 | Same — "structural screws (GRK RSS) from both faces at 12" o.c. staggered" |
| `2-beam.md` line 11–12 | "1/2" × 6.5" HDG carriage bolt + nut + 2 washers, staggered top/bottom at 24" o.c., 8 per beam" |
| `8-fasteners.md` §3 | "1/2" × 6.5" HDG carriage bolt + nut + 2 washers" — 16 sets purchased |
| `receipts.csv` line 61 | 16× HDG Hex Head Screw 1/2"-13 × 6-1/2" (McMaster 95373A247) |

**Reality**: Hex head bolts were purchased (not carriage bolts, not structural screws). `2-beam.md` says "carriage bolt" but the McMaster item is a hex head screw. `0-readme.md` and `dimensions.scad` still reference GRK RSS structural screws — an earlier design that was discarded. `2-beam.md` line 13 acknowledges screws were evaluated and discarded in favor of bolts.

**Fix needed**: Update `0-readme.md` line 166 and `dimensions.scad` line 94 to say "1/2" × 6-1/2" HDG hex bolt" instead of "structural screws (GRK RSS)". Update `2-beam.md` and `8-fasteners.md` to say "hex head bolt" instead of "carriage bolt" to match what was actually purchased.

<fix this, we are using the hex bolt>

---

## 2. Beam Center Ply: 3×10 vs 3×12 Trimmed

| Source | Description |
|--------|-------------|
| `2-beam.md` line 9 | "3x10 (or x12 trimmed)" |
| `cutlist.csv` line 9 | "PT 3x10 x 16', 2" |
| `receipts.csv` line 35 | "Pressure Treated Hem/Fir **3x12**-16'" — 2 purchased |

**Reality**: 3×12s were purchased, presumably to be ripped to 9.25" to match 2×10 depth. The cutlist says 3×10, but 3×10 isn't a standard PT lumber size at Dunn Lumber (their PT timber list goes 3×6, 3×8, 3×12). The `2-beam.md` parenthetical "(or x12 trimmed)" is the accurate plan.

**Fix needed**: Update `cutlist.csv` line 9 to "PT 3x12 x 16' (rip to 9.25"), 2". The structural analysis in `2-beam.md` is correct — it uses the 9.25" depth regardless of starting stock.


<fix this, we're ripping down to 3x10>

---

## 3. Beam Section Properties Note: Screws vs Bolts

`2-beam.md` lines 96–99 say "Structural screws prevent inter-ply slip" and reference a 75% composite stiffness factor "conservative for structural screws." The actual fastener is now bolts, not screws. The composite stiffness reasoning still applies (bolts are at least as good as screws for composite action), but the text is misleading.

**Fix needed**: Change "Structural screws" to "Through-bolts" in the section properties note.


<fix this, we're using through-bolts.>
---

## 4. Cutlist: 1×3 Furring Strips

| Source | Description |
|--------|-------------|
| `cutlist.csv` line 1 | "1x3 x 8', 50" |
| `5-wall-layers.md` line 140 | "58 strips (8' each)" |
| `receipts.csv` line 27 | "Pressure Treated Hem/Fir **1x6**-16' Utility Grade, 15" |

**Reality**: 15 pieces of 1×6-16' PT were purchased. If ripped in half, each 1×6 yields two 1×3 strips, so 15 boards → 30 strips of 16' = 60 strips of 8' equivalent. The cutlist says 50, the wall layers doc says 58, and the purchased material (if ripped) yields ~60.

**Fix needed**: Reconcile the cutlist quantity (50 vs 58). The purchase of 1×6 to be ripped should be noted somewhere — the cutlist currently says "1×3 × 8'" which doesn't match what was bought.

<fix this, we'll cut 60 strips from the PT stock we purchased, it may be more than we need, but that's ok>

---

## 5. Wall Sheathing: OSB vs Zip System

| Source | Description |
|--------|-------------|
| `5-wall-layers.md` §3 | "7/16" OSB" |
| `cutlist.csv` line 15 | "7/16" OSB (or zip?) x 4' x 8', 14" |
| `receipts.csv` line 41 | "Huber **Zip System** Zip Panel Roof/Wall Combo 4'x8'-7/16", **24**" |
| `8-fasteners.md` §10 | "24 sheets of 7/16" Zip System panels (per receipts.csv — substituted for plain OSB)" |

**Reality**: 24 Zip panels were purchased. The cutlist says 14, but that was the original OSB estimate for walls only. The Zip panels serve double duty — walls (14–15 sheets) plus roof sheathing (10 sheets). `8-fasteners.md` correctly notes the substitution.

**Fix needed**: Update cutlist to reflect 24 Zip panels. Update `5-wall-layers.md` to acknowledge Zip System instead of plain OSB. Note that Zip's integrated WRB may make the Tyvek layer optional (as `8-fasteners.md` already mentions).

<fix this, remove the Tyvek references. we'll need to buy zip tape and roller still.>
---

## 6. Roof Sheathing: CDX vs Zip

| Source | Description |
|--------|-------------|
| `6-trusses.md` line 159 | "Roof sheathing: 1/2" × 4×8, 10 sheets, CDX or OSB" |
| `8-fasteners.md` §13 | "1/2" CDX or OSB" |
| `cutlist.csv` line 20 | "CDX 1/2" Plywood Sheathing 4-ply 4'x8', 14" |

The cutlist says 14 sheets of 1/2" CDX were purchased (receipts.csv line 44 confirms). But these are listed as "wall interior" in the cutlist. The roof sheathing appears to be covered by the Zip panels (7/16"), not 1/2" CDX. The `6-trusses.md` still says "10 sheets CDX or OSB" for the roof.

**Fix needed**: Clarify whether roof uses Zip panels (7/16") or CDX (1/2"). The 14 sheets of CDX appear to be for interior wall finish (per cutlist line 20), not roof sheathing. Update `6-trusses.md` materials list accordingly.

<fix this, the roof sheeting will be zip, taped and rolled>

---

## 7. Hurricane Ties: H2.5ASS vs H2.5AZ (Two Different Products)

| Source | Description | Use |
|--------|-------------|-----|
| `receipts.csv` line 46 | "S.O. H2.5A**SS**, 26" (Dunn Lumber, stainless) | Joist-to-beam (floor) |
| `receipts.csv` line 77 | "Simpson H2.5A**Z**, 18" (Home Depot, galvanized) | Truss-to-top-plate (roof) |
| `8-fasteners.md` §4 | "H2.5ASS" — 26 for joists | ✓ Matches |
| `8-fasteners.md` §12 | "H2.5A" (HDG) — 18 for trusses | ✓ Matches |
| `cutlist.csv` line 17 | "Simpson H2.5ASS, 26" | Only lists the joist ties |

**Findings**: Two separate purchases of two different finishes — this is correct (SS for PT joist contact, HDG for non-PT truss contact). The cutlist only lists the 26 stainless ties and omits the 18 galvanized ones.

**Fix needed**: Add "Simpson H2.5AZ, 18" to the cutlist for truss-to-plate hurricane ties.

<fix this>

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

## 10. Titen HD Anchor Length: 6" vs 6.5"

| Source | Description |
|--------|-------------|
| `8-fasteners.md` §1 line 13 | "5/8" × 6-1/2" SS Titen HD screw anchor" |
| `8-fasteners.md` §1 line 24 | "Note on length: no 6.5" version... so selecting 6"" |
| `8-fasteners.md` §1 line 26 | "Purchased: THDB62**600**H4SS - 5/8" x **6"**" |

**Reality**: The spec calls for 6.5" but 6" was purchased because 6.5" doesn't exist. The header of §1 still says "6-1/2"" which is misleading.

**Fix needed**: Update the §1 header/description to say 6" to match what was purchased, or add a clearer note that the 6" version satisfies the requirement.

<fix to match the purchase>

---

## 11. ABU66SS Price Discrepancy

| Source | Price |
|--------|-------|
| `2-beam.md` line 139 | "$201.96" (FastenersPlus URL) |
| `receipts.csv` line 45 | "$241.25 each" (6 × $241.25 = $1,447.50, Dunn Lumber) |

**Reality**: The ABU66SS was purchased from Dunn Lumber at $241.25 each, not FastenersPlus at $201.96. The `2-beam.md` reference is to the FastenersPlus listing (which may have been the original price check) but the actual purchase was from Dunn Lumber at a higher price.

**Fix needed**: Update `2-beam.md` price to reflect actual purchase price, or note that the listed price is a reference and the actual purchase was from Dunn Lumber.

<fix, remove pricing from the markdown file>
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
