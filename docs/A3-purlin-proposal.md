# A3 — Purlin & Overhang Framing Proposal

This document describes the wood framing that sits on top of the insulated Zip roof deck. It assumes the Zip sheathing and 2" polyiso foam are already installed per A2.

**Assembly order**: Zip roof deck → 2" polyiso (A2) → **this document** → metal roofing

---

## Coordinate System & Key Dimensions

| Reference | Value |
|-----------|-------|
| Shed length (E-W) | 192" (16') |
| Shed width (N-S) | 144" (12') |
| Roof pitch | 6/12 (26.57°) |
| Rafter slope length (wall face to ridge) | 80.5" |
| Truss spacing | 24" o.c., 9 trusses at x = 0", 24", 48", …, 192" |
| Truss top chord | 2×4 (1.5" × 3.5") |
| Target overhang (all sides) | 12" horizontal |
| Slope overhang | 12" / cos(26.57°) = 13.4" along slope |

---

## Framing Components

### 1. Purlins (E-W, parallel to ridge)

Purlins are the primary metal roofing attachment. They run E-W across the full shed length plus gable overhangs.

| Parameter | Value |
|-----------|-------|
| Material | 2×4 SPF (1.5" × 3.5"), installed **flat** (1.5" tall) |
| Orientation | E-W (parallel to ridge) |
| Length | 192" + 12" east + 12" west = **216" (18')** |
| Alternative | Butt-join 10' + 8' over an interior truss (splice must not fall in the 12" cantilever zone) |

#### Purlin Spacing (per slope)

Metal roofing manufacturers typically require support at ≤24" o.c. With 80.5" of slope plus 13.4" of overhang = 93.9" total run per slope, the layout is:

| Purlin # | Position (along slope, from ridge) | Role |
|----------|-----------------------------------|------|
| P1 | 0" (at ridge) | Ridge attachment for panels & ridge cap |
| P2 | 24" | Field support |
| P3 | 48" | Field support |
| P4 | 72" | Field support (near wall face at 80.5") |
| P5 | 93.9" (at fascia line) | Eave attachment — panel bottom & gutter support |

**5 purlins per slope × 2 slopes = 10 purlins total**

Note: P5 (eave purlin) is positioned 13.4" past the wall face along the slope (12" horizontal). It sits on top of the eave brackets, not on foam — see section 2 below.

#### Purlin Attachment (field, P1–P4)

Each purlin is screwed through the foam into the truss rafter below at every crossing:

- **Fastener**: #10 × 6" structural screws (e.g., GRK RSS)
- **Penetration**: 1.5" (purlin) + 2" (foam) + 7/16" (Zip) + **2.0" bite into rafter** = 6.0"
- **Pattern**: 2 screws per purlin-rafter crossing
- **Count**: 4 field purlins × 9 trusses × 2 screws × 2 slopes = **144 screws**

Purlins align with truss positions for direct rafter bearing. At each crossing, the screw passes through: purlin → foam → Zip → rafter top chord.

---

### 2. Eave Brackets (N/S overhang support)

Triangular brackets at each truss position support the eave overhang. They carry the eave purlin (P5), sub-fascia, fascia, and gutter loads.

#### Geometry

```
Section at eave (looking east, south slope):

    P4 (last field purlin)              P5 (eave purlin)
    ══════════════════════════           ═══════
    ▓▓▓▓▓▓▓▓ 2" polyiso ▓▓▓▓ ╲
    ═══════ Zip roof deck ═══ ║ ╲ ── outrigger (2×4 on edge, follows slope)
    ────── rafter ──────────  ║    ╲
                               ║     ╗ ← eave purlin (P5) sits here
    ═══ Zip wall sheathing ══ ║     ║
                               ║     ║ ← vertical drop (2×4 or fascia)
                               ║     ╚═══ sub-fascia (1×8)
                              wall   12"
                              face   out
```

Each bracket consists of:

| Component | Material | Dimension | Notes |
|-----------|----------|-----------|-------|
| **Outrigger** | 2×4 on edge | ~18" long (13.4" slope run + bearing) | Follows roof slope; top edge flush with purlin field plane |
| **Sub-fascia** | 1×8 | 7.25" tall | Vertical, at outrigger tip; continuous E-W connecting all brackets |

The outrigger sits on top of the foam at the wall line and cantilevers out. Its inboard end is screwed through foam and Zip into the rafter tail and/or wall top plate.

#### Bracket Attachment

- **Inboard end**: 2× #10 × 6" structural screws through outrigger → foam → Zip → rafter/top plate
- **Sub-fascia to outrigger tip**: 3× 3" exterior screws (or 16d galv nails), toe-screwed

#### Count

- 9 brackets per eave × 2 eaves (N and S) = **18 brackets**
- Sub-fascia: 2 pieces × 216" (18') each, running full length including gable overhangs

#### Eave Purlin (P5) Attachment

P5 sits on top of the outrigger tips (no foam underneath — it's outboard of the foam). Screw down into each outrigger:

- **Fastener**: 2× 3" exterior screws per bracket
- P5 runs the full 216" E-W (same length as field purlins), supported by an outrigger every 24"

---

### 3. Fly Rafters (gable overhang, E/W)

At each gable end, a fly rafter runs up the slope at the purlin tips, 12" out from the end truss. It connects all purlin ends and carries the barge board.

| Parameter | Value |
|-----------|-------|
| Material | 2×4 on edge (3.5" tall × 1.5" wide) |
| Length | Full slope including eave overhang: ~93.9" per slope |
| Count | 2 per gable end × 2 gable ends = **4 fly rafters** |

#### Fly Rafter Attachment

Each fly rafter is face-nailed or screwed to the end of every purlin it crosses:

- **Fastener**: 2× 3" exterior screws (or 16d galv nails) per purlin crossing
- **Crossings**: 5 purlins per slope = 5 attachment points per fly rafter

```
Section at gable end (looking south):

    Metal roofing
    ──────────────────────────────────
    purlin ═══╗     ═══╗     ═══╗     ═══╗     ═══╗
              ║        ║        ║        ║        ║
              ╠════════╩════════╩════════╩════════╝
              fly rafter (2×4 on edge, running up slope)
              |
              12" out from end truss
              |
         Barge board (1×8)
```

The fly rafter's bottom edge aligns with the bottom of the purlins so the barge board has a flat nailing surface.

---

### 4. Fascia & Barge Boards (trim)

| Component | Material | Size | Qty | Notes |
|-----------|----------|------|-----|-------|
| Eave fascia | 1×8 cedar or primed | 216" (18') | 2 | Nailed to sub-fascia; N and S eaves |
| Barge boards | 1×8 cedar or primed | ~94" (~8') | 4 | Nailed to fly rafters; 2 per gable end |

The eave fascia and barge boards meet at each corner with a miter or butt joint. The fascia top edge should sit flush with or slightly above the purlin top surface so drip edge can lap over it.

---

## Flashing

### Drip Edge

| Location | Type | Length | Qty | Installation |
|----------|------|--------|-----|-------------|
| Eave (N/S) | Type D/F (gutter-compatible) | 18' | 2 | Over sub-fascia/fascia, **under** metal roofing. Install before roofing panels. |
| Rake (E/W) | Standard drip edge | ~8' | 4 | Over barge board, **over** metal roofing edge. Install after roofing panels. |

### Ridge Cap

- Metal ridge cap over the ridge purlin (P1) after both slopes' panels are installed
- Panels overlap ~1" under the ridge cap
- Closure strips (foam or rubber) between panel profile and ridge cap to seal gaps

### Eave Closure

- Foam closure strips between metal panel profile and the eave purlin (P5) to prevent wind-driven rain and insects from entering under the panels

---

## Plan View — Purlin Layout (one slope)

```
                        EAST                                    WEST
                        ←── 12" ──→←──────── 192" (16') ────────→←── 12" ──→

Ridge (P1)              ══════════════════════════════════════════════════════
                        |    |    |    |    |    |    |    |    |    |
24" down slope (P2)     ══════════════════════════════════════════════════════
                        |    |    |    |    |    |    |    |    |    |
48" down slope (P3)     ══════════════════════════════════════════════════════
                        |    |    |    |    |    |    |    |    |    |
72" down slope (P4)     ══════════════════════════════════════════════════════
                        |    |    |    |    |    |    |    |    |    |
- - - - - - - - - - - - wall face (80.5" down slope) - - - - - - - - - - - -
                        |    |    |    |    |    |    |    |    |    |
Eave (P5, 93.9")        ══════════════════════════════════════════════════════
                        ↑    ↑                                  ↑    ↑
                      fly  end                               end  fly
                     rafter truss                           truss rafter

                        ║ at each ║ (vertical lines = truss positions, 24" o.c.)
```

---

## Section View — Full Assembly at Eave

```
Looking east at south eave:

                    ↑ ridge direction
                   /
    P3 ═══════════/═══════════
    ▓▓▓▓▓▓▓▓▓▓▓▓/▓▓▓▓▓▓▓▓▓▓  (2" polyiso)
    ═══════════/══════════════  (Zip roof deck)
    ──────────/────────────────  (rafter / truss top chord)
             /
    P4 ════/════════════════
    ▓▓▓▓▓/▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    ════/═══════════════════╗
    ───/────────────────────╫──── outrigger (2×4 on edge)
                            ╫        follows roof slope
    ═══ Zip wall ══════════ ╫
                            P5 ════  (eave purlin, 2×4 flat)
                            ║
                            ║  sub-fascia (1×8)
                            ║  ← drip edge (Type D/F)
                            ╚  ← gutter
                         12" out
```

---

## Section View — Full Assembly at Gable

```
Looking south at east gable end:

    ←── 12" ──→
               ║
    ═══════════╬══ P2 (purlin, 2×4 flat, extends 12" past end truss)
    ▓▓▓▓▓▓▓▓▓▓║▓▓  (2" polyiso — stops at end truss, does NOT extend)
    ═══════════║══  (Zip roof deck — stops at end truss)
    ───────────╫    (end truss rafter)
               ║
          fly rafter (2×4 on edge)
               ║
          barge board (1×8)
               ║
               ╚── drip edge (rake)
```

Note: The gable overhang purlins cantilever 12" past the last truss with no foam or Zip underneath — just the purlin and metal roofing.

---

## Materials Summary

| Component | Material | Size | Qty | Notes |
|-----------|----------|------|-----|-------|
| Purlins | 2×4 SPF | 18' (or 10'+8' spliced) | 10 | 5 per slope; P1–P5 |
| Eave outriggers | 2×4 SPF | 18" | 18 | 9 per eave, on edge |
| Fly rafters | 2×4 SPF | 8' | 4 | On edge, 2 per gable |
| Sub-fascia | 1×8 | 18' | 2 | N and S eaves |
| Eave fascia | 1×8 cedar/primed | 18' | 2 | Over sub-fascia |
| Barge boards | 1×8 cedar/primed | 8' | 4 | 2 per gable |
| Drip edge (eave) | Type D/F | 18' | 2 | Gutter-compatible |
| Drip edge (rake) | Standard | 8' | 4 | Over panel edges |
| Structural screws | #10 × 6" | ~160 | — | Purlins + outriggers into rafters |
| Exterior screws | #10 × 3" | ~120 | — | P5 to outriggers, fly rafter connections |
| Closure strips (eave) | Foam | 18' | 2 | Match metal panel profile |
| Closure strips (ridge) | Foam | 16' | 2 | Under ridge cap |
| Ridge cap | Metal (match panels) | 16' | ~2 pcs | Overlapping at center |

---

## Installation Sequence

1. **Mark truss positions** on foam surface (transfer from below or measure 24" o.c. from east end)
2. **Install eave outriggers** — screw through foam/Zip into each rafter tail and top plate; 9 per eave
3. **Install purlins P1–P4** (field) — start at ridge, work down. 2 screws at each truss crossing through foam into rafter. Extend 12" past each gable end.
4. **Install eave purlin P5** — screw down into outrigger tips
5. **Install fly rafters** — 2×4 on edge at purlin tips, face-screwed at each crossing
6. **Install sub-fascia** — 1×8 at outrigger tips / P5 location, running full E-W length
7. **Install fascia and barge boards** — 1×8 over sub-fascia and fly rafters
8. **Install eave drip edge** (Type D/F) — over fascia, under future roofing
9. **Install metal roofing** — panels run ridge to eave, screw into purlins
10. **Install rake drip edge** — over barge boards and over panel edges
11. **Install ridge cap** with closure strips

---

## Open Questions

1. **Purlin stock length** — 18' single pieces vs. spliced? 18' 2×4s are available but unwieldy on a roof.
2. **Metal roofing profile** — exposed fastener vs. standing seam determines the exact purlin spacing requirements and closure strip profile.
3. **Outrigger blocking** — should a horizontal block tie the outrigger back to the wall top plate for additional rigidity, or is the screwed connection to the rafter sufficient?
