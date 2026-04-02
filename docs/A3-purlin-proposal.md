# A3 — Batten & Purlin Grid

This document describes the two-layer roof grid that sits on top of the insulated Zip roof deck. It assumes the Zip sheathing and 2" polyiso foam are already installed per A2.

**Assembly order**: Zip roof deck → 2" polyiso (A2) → **battens → purlins** → metal roofing

---

## Coordinate System & Key Dimensions

| Reference | Value |
|-----------|-------|
| Shed length (E-W) | 192" (16') |
| Shed width (N-S) | 144" (12') |
| Roof pitch | 6/12 (26.57°) |
| Rafter slope length (wall face to ridge) | 80.5" |
| Truss spacing | 24" o.c., 9 trusses |
| Target overhang (all sides) | 12" horizontal |

---

## Layer 1: Battens (up the slope, aligned with trusses)

Battens are the vertical members running from near the ridge down past the wall. They sit directly on the foam.

| Parameter | Value |
|-----------|-------|
| Material | 2×4 SPF, installed **flat** (3.5" wide, 1.5" tall) |
| Orientation | Up the slope (parallel to rafters) |
| Spacing | 24" o.c., aligned with truss X positions |
| Ridge end | Stops **3" short of peak** (horizontal), ~3.4" along slope |
| Eave end | Extends **12" past wall** (horizontal), ~13.4" along slope |
| End battens | Inset so outer edge aligns with outer wall edge |
| Count | 9 per slope × 2 slopes = **18 battens** |

### Batten Length

```
slope_length = 72" / cos(26.57°) = 80.5"
ridge_gap_slope = 3" / cos(26.57°) = 3.4"
overhang_slope = 12" / cos(26.57°) = 13.4"
batten_length = 80.5" - 3.4" + 13.4" = 90.5"
```

~90.5" per batten — fits in 8' stock.

### Batten Attachment

- **Fastener**: #10 × 6" structural screws (e.g., GRK RSS)
- **Penetration**: 1.5" (batten) + 2" (foam) + 7/16" (Zip) + 2.0" (rafter bite) = 6.0"
- **Pattern**: 2 screws per batten where it crosses the rafter below (one crossing per batten, since they're aligned)
- **Count**: 9 battens × 2 screws × 2 slopes = **36 screws**

---

## Layer 2: Purlins (E-W, over battens)

Purlins are the horizontal members running E-W across the battens. Metal roofing screws into these.

| Parameter | Value |
|-----------|-------|
| Material | 2×4 SPF, installed **flat** (3.5" wide, 1.5" tall) |
| Orientation | E-W (parallel to ridge) |
| Length | Two boards per row, butt-joined at center truss (96" from west end) |
| E-W extension | 12" past each gable end (configurable) |
| Total span | 192" + 24" = **216"** per row (two ~108" boards) |

### Purlin Row Positions (5 per slope)

The 5 rows are positioned relative to the ridge along the slope:

| Row | Position | Role |
|-----|----------|------|
| P1 (ridge) | 3.4" from peak | Flush with top of battens; ridge cap attachment |
| P2 | ridge + 1/3 span | Field support |
| P3 | ridge + 2/3 span | Field support |
| P4 (wall) | 80.5" (at wall edge) | Transition point; overlaps roof/wall junction |
| P5 (eave) | 93.9" (at batten ends) | Flush with bottom of battens; eave attachment |

Where **span** = wall_pos − ridge_pos = 80.5" − 3.4" = 77.1", so:
- P2 = 3.4" + 25.7" = **29.1"** from peak
- P3 = 3.4" + 51.4" = **54.8"** from peak

**5 rows per slope × 2 slopes = 10 purlin rows = 20 boards**

### Purlin Attachment

Purlins sit on top of battens and are screwed down at each crossing:

- **Fastener**: #10 × 3" exterior screws
- **Pattern**: 2 screws per purlin-batten crossing
- **Crossings**: 5 rows × 9 battens × 2 slopes = 90 crossings
- **Count**: 90 × 2 = **180 screws**

---

## Plan View — One Slope

```
                    WEST                                          EAST
                    ←12"→←──────────── 192" (16') ──────────────→←12"→

Ridge (P1)          ════════════════════════════════════════════════════
                    |    |    |    |    |    |    |    |    |    |
P2 (29.1")          ════════════════════════════════════════════════════
                    |    |    |    |    |    |    |    |    |    |
P3 (54.8")          ════════════════════════════════════════════════════
                    |    |    |    |    |    |    |    |    |    |
- - - - - - - - - - wall face (80.5" down slope) - - - - - - - - - - -
P4 (wall, 80.5")    ════════════════════════════════════════════════════
                    |    |    |    |    |    |    |    |    |    |
Eave (P5, 93.9")    ════════════════════════════════════════════════════
                    ↑    ↑                                  ↑    ↑
                  end  T2                                T8  end
                 batten                                    batten

═══ = purlins (E-W, horizontal)
 |  = battens (up slope, vertical)
```

---

## Section View — Full Assembly at Eave

```
Looking east at south eave:

                ↑ ridge direction
               /
    P3 ═══════/═══════════   (purlin, over battens)
    ║║║║║║║║║/║║║║║║║║║║║   (batten, 2×4 flat on foam)
    ▓▓▓▓▓▓▓/▓▓▓▓▓▓▓▓▓▓▓▓   (2" polyiso)
    ══════/═══════════════   (Zip roof deck)
    ─────/─────────────────   (rafter)
         /
    P4 ═/═══════════════     (purlin at wall line)
    ║║║/║║║║║║║║║║║║║║║║║
    ▓▓/▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╗
    ═/════════════════════╗
    /──────────────────────
                           ║ wall face
    P5 ════════════════    ║ (eave purlin, on batten tips)
    ║║║║║║║║║║║║║║║║║║    ║ (batten extends 12" past wall)
                        12" out
```

---

## Materials Summary

| Component | Material | Size | Qty | Notes |
|-----------|----------|------|-----|-------|
| Battens | 2×4 SPF | 8' | 18 | 9 per slope, ~90.5" each |
| Purlins | 2×4 SPF | 9' (butt-joined at center) | 20 | 5 rows × 2 slopes × 2 halves |
| Structural screws | #10 × 6" | — | 36 | Battens into rafters through foam |
| Exterior screws | #10 × 3" | — | 180 | Purlins into battens |
| Closure strips (eave) | Foam | 18' | 2 | Match metal panel profile |
| Closure strips (ridge) | Foam | 16' | 2 | Under ridge cap |
| Ridge cap | Metal (match panels) | 16' | ~2 pcs | Overlapping at center |

---

## Installation Sequence

1. **Mark truss positions** on foam surface (24" o.c. from east end)
2. **Install battens** — 2×4 flat on foam, aligned with each truss, screwed through foam into rafter with #10 × 6" screws. Stop 3" short of peak, extend 12" past wall.
3. **Install purlins P1–P5** — 2×4 flat over battens, running E-W. Two boards per row, butt-joined at center truss. Extend 12" past each gable end. Screw into battens with #10 × 3" screws.
4. **Install drip edge** (Type D/F at eaves for gutters)
5. **Install metal roofing** — panels run ridge to eave, screw into purlins
6. **Install rake drip edge** — over panel edges
7. **Install ridge cap** with closure strips

---

## Open Questions

1. **Metal roofing profile** — exposed fastener vs. standing seam determines exact purlin spacing requirements and closure strip profile.
