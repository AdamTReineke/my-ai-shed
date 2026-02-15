# 6 — Trusses (Queen-Post Design)

## Configuration

| Parameter | Value |
|-----------|-------|
| **Type** | Queen-post (simplified — no diagonal web members) |
| **Pitch** | 6/12 (26.57°) |
| **Span** | 12' (144") between walls |
| **Rise at peak** | 36" above bottom chord |
| **Spacing** | 24" o.c. (9 trusses total) |
| **Eave overhang** | 1' (12") past N/S walls (rafter tails) |
| **Lumber** | All 2×4 (1.5" × 3.5" actual) |
| **Count** | 9 trusses (at 0", 24", 48", …, 192") |

## Truss Anatomy

```
                        Peak
                         /\
                        /  \
                       /    \
            Rafter →  /      \  ← Rafter
                     /   SB   \
                    /    ══    \      SB = Straining Beam (48")
                   /     ||     \     QP = Queen Post
                  /      ||QP    \
                 /    QP ||      \
                /        ||       \
    ═══════════════════════════════════  ← Bottom Chord (144")
    ↑          ↑         ↑         ↑
  Eave    Queen Post  Queen Post  Eave
  (y=0)    (y=48")    (y=96")   (y=144")
```

## Member Dimensions and Functions

| Component | Location | Stress Type | Function |
|-----------|----------|-------------|----------|
| Bottom chord | Horizontal, full span (144") | Tension + bending | Ties rafter ends together, supports attic storage |
| Rafters | Angled, eave to peak (~84" each) | Compression + bending | Supports roof sheathing and loads |
| Queen posts | Vertical at 46.25" and 97.75" from south | Compression | Supports rafters mid-span, transfers load to bottom chord |
| Straining beam | Horizontal between QP tops (48") | Compression | Keeps queen posts from tilting inward |

**Key dimensions (from `dimensions.scad`):**
- Queen post inset: 46.25" from each wall
- Queen post height: 23.125"
- Straining beam width: 48"
- Straining beam sits 24" above bottom chord top

## Gable End Overhang (Ladder Framing)

- **Overhang:** 1' (12") past E/W walls
- **Lookouts:** 2×4s at 24" o.c., extending from second truss to fly rafter
- **Fly rafters:** Full-length rafters at outer edge of lookouts
- Lookouts lie in roof plane (angled to match slope)

Ladder framing attaches to the second truss inboard (at x=24" for west, x=168" for east) and extends out to the fly rafter position (x=−12" for west, x=204" for east).

## Construction Method — Plywood Gussets

**Recommended for DIY construction:**
- Cut 1/2" or 3/4" structural plywood into gusset plates
- Sandwich each joint between gussets on both sides
- Glue (construction adhesive) + 8d nails or #8 screws at 3" o.c.
- Build trusses flat on shed floor deck (use as assembly jig)

**Typical gusset sizes:**
| Joint | Minimum Size |
|-------|-------------|
| Peak | 12" × 12" |
| Queen post tops | 10" × 8" |
| Queen post bottoms | 8" × 8" |
| Eave joints | 8" × 10" |

## Load Analysis

### Design Loads (City of Redmond)

| Load Type | Value | Notes |
|-----------|-------|-------|
| Dead load (roofing) | 10 psf | Metal roofing + sheathing |
| Ground snow load | 15 psf | Per ASCE 7-10 |
| Rain-on-snow surcharge | 5 psf | Per ASCE 7-10 7.10 |
| **Total roof load** | **30 psf** | Conservative design value |

### Per-Truss Loading (at 24" o.c.)

```
Tributary width: 2'
Roof area per truss: 2' × 14' (with overhangs) = 28 sf
Total load per truss: 28 sf × 30 psf = 840 lbs
Load per rafter: 420 lbs (split between two sides)
```

### Rafter Check (2×4 SPF #2 — conservative)

Queen posts at 1/3 points break each rafter into supported segments:
- Wall to queen post: 48" (4') — **governs**
- Queen post to peak: 24" (2')
- Overhang cantilever: 12" (trivial)

```
Fb = 875 psi, S = 3.06 in³ (SPF #2 — lower Fc/Ft than Hem-Fir, similar Fb)
Distributed load: 420 lbs over 7' = 60 plf

Max moment (48" span): M = wL²/8 = 60 × 4² / 8 = 120 ft-lbs = 1,440 in-lbs
Allowable moment: Mr = Fb × S = 875 × 3.06 = 2,678 in-lbs
Utilization: 1,440 / 2,678 = 54% ✓ OK

Axial compression: braced by roof sheathing (no buckling reduction needed)
Combined bending + compression: both well under capacity — interaction passes
```

**2×4 rafters are adequate.** Full structural analysis in `shed/truss.js`.

## Attic Storage Capacity

The queen-post design creates usable storage voids on each side of the straining beam.

### Bottom Chord Storage Loading

```
Queen posts divide bottom chord into three ~4' segments
2×4 SPF/Hem-Fir properties:
  - Section modulus: S = 3.06 in³
  - Allowable bending: Fb = 875 psi (with Cr factor)
  - Allowable moment: M = 875 × 3.06 = 2,678 in-lb = 223 ft-lb

For 4' span with uniform load:
  w = 8M / L² = 8 × 223 / 16 = 111 plf

At 24" truss spacing:
  Storage capacity = 111 plf / 2' = 55 psf per bay
```

### Storage Capacity Summary

| Location | Span | Capacity | Notes |
|----------|------|----------|-------|
| Between queen posts | 4' | 55 psf | Light storage (boxes, seasonal items) |
| Center bay | 4' | 55 psf | Same — straining beam doesn't support floor |

**55 psf** is adequate for boxes of holiday decorations, light furniture, and seasonal gear.

**To increase capacity:**
- Sister additional 2×4 to bottom chord (doubles capacity)
- Add plywood flooring across bottom chords (distributes point loads)
- Keep heavy items near queen posts (shorter effective span)

## Materials Summary

| Component | Size | Quantity | Material |
|-----------|------|----------|----------|
| Trusses | 2×4 members | 9 | SPF or Hem-Fir #2 |
| Gusset plates | 1/2" plywood | ~2 sheets | Structural plywood |
| Lookouts | 2×4 × 36" | 16 | SPF (8 per gable end) |
| Fly rafters | 2×4 × 14' | 2 | SPF |
| Roof sheathing | 1/2" × 4×8 | 10 sheets | CDX or OSB |
| Metal roofing | (TBD) | ~200 sf | Standing seam or corrugated |
| Fascia | 1×6 or 1×8 | 32 lf | Cedar or primed pine |
| Barge boards | 1×6 or 1×8 | 32 lf | Cedar or primed pine |
