# A2 — Eaves & Lookouts Proposal

## Current State

Zero overhang on all four sides:
- **N/S (eave)**: Rafters terminate flush with wall exterior
- **E/W (gable)**: End trusses sit flush with E/W wall stud faces (act as 2nd top plate)
- **Roof Zip sheathing**: Covers exactly `shed_length x slope_length`, no extensions

## Hard Constraint: Nothing Penetrates the Zip Envelope

The walls and roof are sheathed with Zip System panels, taped and rolled, forming a continuous air/water barrier. Rigid foam insulation goes above the roof Zip deck (hot roof). **No framing member can pass through the Zip plane** — extended rafter tails are a no-go because they'd penetrate the wall Zip at the top plate line.

All overhang structure must be **entirely outboard** of the sealed envelope.

---

## Proposed Approach: Purlins Over Foam, Extended as Overhangs

### Concept

The above-deck assembly is: **Zip deck -> rigid foam -> 2x4 purlins (flat) -> metal roofing**. The purlins are already needed to attach the metal roofing. By extending them past the wall face, they *become* the overhang — no separate outrigger layer needed.

```
Cross-section at eave (south side, looking east):

    Metal roofing
    ─────────────────────────────────────────────
    === purlin (2x4 flat) ============|=========  <- extends past wall
    ▓▓▓▓▓▓▓▓ rigid foam (2" polyiso) ▓|
    ═══════════ Zip roof deck ════════|
    ──────────── rafter ─────────────-|
                                      | Wall face
                                      |
              Zip wall sheathing ═══  |
                                      |
                                Fascia (1x8)
```

**Benefits:**
- **Zero thermal bridging** — purlins sit on top of the foam, not through it
- **No extra framing layer** — the purlins are needed anyway for metal roofing attachment
- **Total stack-up**: Zip (7/16") + foam (2") + purlin (1.5") = **~3.9"** — very reasonable
- **Long screws** (#10 x 6") go through purlin, foam, Zip, and bite into the truss rafter below

### Overhang Sized for 8' Metal Roofing Panels

The overhang depth is set so that **standard 8' (96") metal roofing panels fit without cutting**.

Each panel runs from the ridge down to past the fascia. Accounting for:
- ~1" overlap at the ridge (under ridge cap)
- ~1.5" drip past the fascia

```
Usable panel run along slope: 96" - 1" (ridge) - 1.5" (drip) = 93.5"
Slope from ridge to wall face: 72" / cos(26.57°) = 80.5"
Remaining slope for overhang: 93.5" - 80.5" = 13.0"
Horizontal overhang: 13.0" x cos(26.57°) = 11.6"
```

**Result: ~12" horizontal overhang** makes an 8' panel fit perfectly. Round to **12" even** — the ~0.4" difference is absorbed in the ridge cap overlap (which is adjustable).

This applies to both eave and gable overhangs.

---

## N/S Eave Overhangs (12")

Purlins run perpendicular to the ridge (i.e., up/down the slope, parallel to the rafters). They extend 12" past the N/S wall faces on both sides.

- **Purlin spacing**: 24" o.c. along the ridge (aligned with truss positions for screw-into-rafter grip)
- **Purlin length**: Full slope length + 12" overhang each side. Along the slope: 80.5" + 2 x 13.4" = **~107"** (fits in 10' stock, or 9' with tighter allowances)
- **Attachment**: Long structural screws through purlin -> foam -> Zip -> rafter at each crossing
- **Sub-fascia**: A 2x4 (flat) running E-W at the purlin tips, connecting them all. Fascia nails to this. (Or the fascia nails directly to the purlin ends if they're close enough together.)
- **Count**: 9 purlins per slope x 2 slopes = **18 purlins** (same as truss count per slope)

Wait — purlins typically run *perpendicular to the slope* (horizontal, parallel to the ridge) so the metal roofing panels can attach to them. Let me reconsider the orientation.

### Purlin Orientation

**Metal roofing panels** run from ridge to eave (down the slope). They need something *horizontal* (parallel to the ridge) to screw into at regular intervals. So:

- **Purlins run E-W** (parallel to ridge), spaced every 24" up the slope
- **Metal panels run N-S** (eave to ridge), screwed into purlins at each crossing

For N/S eave overhangs, the purlins extend 12" past the N/S walls. Each purlin is a 2x4 running the full E-W length, cantilevering 12" past the wall on each end (north and south).

```
Looking at roof from above (south slope):

    N (ridge)
    ─────────── purlin (E-W) ───────────
    |           |           |           |    <- 24" spacing up slope
    ─────────── purlin (E-W) ───────────
    |           |           |           |
    ─────────── purlin (E-W) ───────────
    |  metal    |  metal    |  metal    |    <- panels run N-S
    ─────────── purlin (E-W) ───────────
    S (eave)    |           |           |
    ============|===========|===========|==  <- wall face
    - - - 12" - purlin extends past wall
```

**Purlin count per slope**: slope_length / 24" spacing = 80.5" / 24" = ~3.4 -> **4 purlins per slope** (at eave, ~24", ~48", ~72" up the slope, plus one at or near the ridge).

Actually, for metal roofing, the first purlin should be right at the eave (for the panel bottom attachment) and the last near the ridge. With the overhang, the eave purlin is at the fascia line (12" past the wall).

**Purlin length**: Each purlin runs the full 16' E-W plus overhang on E/W gable ends (if gable overhangs also use extended purlins — see below). For now, at minimum 16' (192").

### Eave Overhang Detail

The bottom-most purlin on each slope cantilevers 12" past the wall. The sub-fascia/fascia attaches at its tips:

```
Section at eave (looking east):

    Metal roofing panel
    ─────────────────────────────────────
    ═══ purlin (2x4 flat, E-W) ════════╗ <- 12" past wall
    ▓▓▓▓▓ rigid foam ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ |
    ═══════ Zip roof deck ═════════════ |
    ────── rafter ──────────────────── |
                                       | wall face
                                       |
                                  Fascia board
```

The foam stops at the wall face (it doesn't cantilever). Only the purlin and the metal roofing extend past. The underside of the overhang is open — you see the bottom of the purlin and the Zip sheathing/wall face. Open soffit as decided.

---

## E/W Gable Overhangs (12")

For gable overhangs, the purlins already run E-W — they just need to extend 12" past each E/W wall. So the same purlins that create the eave overhang also create the gable overhang by being cut longer.

**Purlin length with both overhangs**: 192" (shed) + 2 x 12" (gable overhangs) = **216" (18')**

18' purlins are available but long. Alternative: butt-join two shorter pieces over a truss/rafter.

At the gable ends, the purlins cantilever past the end truss. A **fly rafter** (2x4 running up the slope at the purlin tips) connects them and provides a nailing surface for the barge board.

```
Section at gable end (looking south):

    Metal roofing
    ──────────────────────────────────
    purlin ═══╗     ═══╗     ═══╗     <- purlins extend 12" past gable wall
              ║  foam  ║  foam  ║
    ══════════ Zip ═════════════════
    end truss rafter ──────────────
              |                        gable wall face
              |
         Barge board / fly rafter
```

---

## Combined Overhang via Purlins — Summary

The purlins do triple duty:
1. **Metal roofing attachment** (primary purpose)
2. **Eave overhang** (cantilever 12" past N/S walls)
3. **Gable overhang** (cantilever 12" past E/W walls)

No separate outrigger or lookout framing needed.

### Corner Detail

At each corner, a purlin extends past both the eave and gable walls. The fascia (eave) and barge board (rake) meet at a miter or butt joint. The purlin tip is the structural support for both.

---

## Assembly Stack-Up (Ridge to Eave)

| Layer | Thickness | Notes |
|-------|-----------|-------|
| Metal roofing | ~1" (profile height) | Screwed to purlins |
| Purlins (2x4 flat) | 1.5" | 24" o.c., long-screwed through foam into rafters |
| Rigid foam (polyiso) | 2" | R-13.1, continuous, no thermal bridging |
| Zip roof sheathing | 7/16" | Sealed envelope |
| Rafter (truss top chord) | 3.5" | Structural |

**Total above rafter**: ~3.9" (foam + purlin) + roofing

### Fasteners

Purlins attach through the full stack into the rafter below:
- **Screw length**: 1.5" (purlin) + 2" (foam) + 7/16" (Zip) + 1.5" (min bite into rafter) = **5.4" minimum**
- **Use**: #10 x 6" structural screws (e.g., GRK RSS or similar)
- **Pattern**: 2 screws per purlin-rafter crossing

---

## Materials

| Component | Size | Qty | Notes |
|-----------|------|-----|-------|
| Purlins | 2x4 x 18' (or joined) | ~8-10 | ~4-5 per slope, full E-W span + gable overhangs |
| Fly rafters (gable) | 2x4 x ~8' | 4 | At purlin tips, 2 per gable |
| Sub-fascia (eave) | 2x4 x ~18' | 2 | At bottom purlin tips, N and S |
| Eave fascia | 1x8 x 18' | 2 | Cedar or primed; Type D/F drip edge for gutters |
| Barge boards | 1x8 x ~8' | 4 | Cedar or primed |
| Drip edge (eave) | 18' | 2 | Type D/F (gutter-compatible) |
| Drip edge (rake) | ~8' | 4 | Over metal roofing edge |
| Structural screws | #10 x 6" | ~100 | Purlins through foam into rafters |
| Rigid foam (polyiso) | 4x8 x 2" | ~8 sheets | R-13.1; covers roof deck; purlins sit on top |

---

## Impact on Existing Design

### Changes

| Item | Current | Proposed |
|------|---------|----------|
| Eave overhang (N/S) | 0" | 12" |
| Gable overhang (E/W) | 0" | 12" |
| Above-deck assembly | TBD | Foam + purlins + metal roofing (now defined) |
| Metal panel length | TBD | 8' standard (no cuts) |

### Unchanged

- All truss geometry (rafter length, queen posts, bottom chord)
- End truss design (still acts as 2nd top plate)
- Wall framing
- Zip sheathing layout (wall + roof panels)
- Zip envelope integrity (purlins screw through, nothing passes through)

---

## Implementation Sequence

1. Frame walls, set trusses, sheathe with Zip, tape all seams
2. Install rigid foam over Zip roof deck (continuous layer)
3. Install purlins (2x4 flat) on top of foam, long-screwed into rafters; extend 12" past all walls
4. Install fly rafters at purlin tips (gable ends)
5. Install sub-fascia at bottom purlin tips (eave ends)
6. Install fascia and barge boards
7. Install drip edge (Type D/F at eaves for gutters)
8. Install metal roofing panels (8' sheets, ridge to fascia, no cuts needed)
9. Install ridge cap

---

## Resolved Questions

| # | Question | Answer |
|---|----------|--------|
| 1 | Overhang depth | **12" horizontal** — sized so 8' metal panels fit without cutting |
| 3 | Gutters | **Yes** — use Type D/F drip edge |
| 4 | Outrigger orientation | **Moot** — purlins on top of foam replace separate outriggers; 2x4 flat |
| 5 | Soffit | **Open** |
| 6 | Foam thickness | **2" polyiso (R-13.1)** — unvented hot roof in zone 4C requires ≥40% of total R at the exterior (IRC R806.5). With R-15 cavity Rockwool, 2" foam = 47% exterior ratio, comfortably above the threshold. Single layer, seams taped. |

## Open Questions

1. **Fascia size — 1x8?** With a 2x4-flat purlin (1.5" tall) and foam (2") below it, the fascia needs to cover ~3.5" of stack-up plus hang below for appearance. A 1x8 (7.25") works well. A 1x6 (5.5") would be minimal but sufficient.

2. **Purlin length — 18' stock or joined?** 18' 2x4s are available but harder to handle. Alternatively, join two shorter pieces (e.g., 10' + 8') over a rafter with a scab splice. The splice just needs to not land in the overhang cantilever zone.

3. **Metal roofing profile?** Exposed fastener panels are the simplest for a shed and work great with purlins. Standing seam is more durable but harder to DIY. The 8' panel math works for either profile — just confirm the panel length before finalizing the overhang dimension.
