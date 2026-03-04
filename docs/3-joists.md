# Floor Joists

## Configuration

- **Member:** 2×8 PT Hem-Fir #2 Incised
- **Span:** 9' (108") between beams
- **Cantilever:** 1.5' (18") past each beam (supports exterior walls)
- **Total length:** 12' (144") — matches shed N-S width
- **Spacing:** 16" o.c.
- **Count:** 13 joists (including rim joists at E/W ends)
- **Direction:** N-S (perpendicular to beams)

```
    ←────────────── 16' (192") E-W ──────────────→

    Rim                                         Rim
    ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║
    ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ← 13 joists @ 16" o.c.
    ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║
    ════════════════════════════════════════  ← Beam (south, y=18")
    ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║
    ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ← 9' main span
    ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║
    ════════════════════════════════════════  ← Beam (north, y=126")
    ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║
    ↑                                     ↑
   y=0 (south wall)                    y=144" (north wall)
```

### Joist Positions (from east edge)

| # | Position | Type |
|---|----------|------|
| 1 | 0" (0') | Rim joist |
| 2 | 16" | Field joist |
| 3 | 32" | Field joist |
| 4 | 48" (4') | Field joist |
| 5 | 64" | Field joist |
| 6 | 80" | Field joist |
| 7 | 96" (8') | Field joist |
| 8 | 112" | Field joist |
| 9 | 128" | Field joist |
| 10 | 144" (12') | Field joist |
| 11 | 160" | Field joist |
| 12 | 176" | Field joist |
| 13 | 192" (16') | Rim joist |

---

## Loading

### Uniform Floor Load
- Dead load: 10 psf (structure)
- Live load: 60 psf (storage)
- Total: 70 psf
- Per joist (16" o.c. tributary): 70 × 16/12 = **93.3 plf**

### Point Loads at Cantilever Tips (Wall + Roof)
- Wall dead load: 8' × 7 psf = 56 plf
- Roof tributary: 6' × 30 psf = 180 plf
- Total line load: 236 plf
- Per joist: 236 × 16/12 = **315 lbs** at each tip

### Load Diagram
```
 315 lbs                                        315 lbs
    ↓                                              ↓
    ←─ 1.5' ─→←────────── 9' ───────────→←─ 1.5' ─→
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ← 93.3 plf
              △                           △
           Beam S                       Beam N
```

### Beam Reaction
Each joist delivers **875 lbs** to each beam.

---

## Material Properties (Hem-Fir #2 PT Incised)

All joists are pressure-treated and incised for ground-proximity outdoor use.

### NDS Adjustment Factors for 2×8

| Factor | Symbol | Value | Basis |
|--------|--------|-------|-------|
| Base Fb | — | 850 psi | NDS Table 4A, Hem-Fir #2 |
| Load duration | CD | 1.0 | Normal (storage) |
| Size factor | CF | 1.2 | NDS Table 4A for 2×8 depth |
| Incising factor | Ci | 0.80 | NDS 4.3.8 for Fb |
| Repetitive member | Cr | 1.15 | NDS 4.3.9 (≤24" o.c. with sheathing) |
| **Adjusted Fb'** | — | **938 psi** | 850 × 1.0 × 1.2 × 0.80 × 1.15 |

| Factor | Symbol | Value | Basis |
|--------|--------|-------|-------|
| Base E | — | 1,300,000 psi | NDS Table 4A |
| Incising factor | Ci | 0.95 | NDS 4.3.8 for E |
| **Adjusted E'** | — | **1,235,000 psi** | 1,300,000 × 0.95 |

### 2×8 Section Properties
- Width (b): 1.5"
- Depth (d): 7.25"
- Section modulus (S): 13.14 in³
- Moment of inertia (I): 47.63 in⁴

---

## Structural Checks

Run `node shed/joist.js` for full output. Results for 2×8:

### Bending
```
Design moment (cantilever governs): 577 ft-lbs = 6,924 in-lbs
Allowable moment: Fb' × S = 938 × 13.14 = 12,325 in-lbs
Utilization: 6,924 / 12,325 = 56%  ✓
```

### Deflection (live load only, L/360)
```
Simple span deflection with 0.85 cantilever reduction:
δ = 5wL⁴/(384·E'·I) × 0.85 = 0.171"
Allowable: L/360 = 108/360 = 0.300"
Utilization: 57%  ✓
```

### Cantilever Ratio
1.5' / 9' = 17% (well under 25–33% maximum)

### Summary

| Check | Actual | Allowable | Utilization |
|-------|--------|-----------|-------------|
| Bending | 577 ft-lbs | 1,027 ft-lbs | **56%** |
| Deflection | 0.171" | 0.300" | **57%** |
| Cantilever ratio | 17% | 33% | **OK** |

**2×8 PT Hem-Fir #2 Incised at 16" o.c. passes all checks with comfortable margin.**

---

## Joist-to-Beam Connection

### Bearing on Beam
- Joists sit directly on top of beams (joist-over-beam framing)
- Beam width: 5.5" (2×10 + 3×10 + 2×10 built-up, per [2-beam.md](2-beam.md))
- Full 5.5" bearing width available

### Hurricane Ties (Uplift Restraint)
- **Hardware:** Simpson H2.5ASS (18-gauge, 316 stainless steel)
- **Quantity:** 26 (13 joists × 2 beams)
- **Fasteners:** (5) 0.131" × 1½" SS ring-shank nails to joist face, (5) 0.131" × 2½" SS ring-shank nails to beam top
- **Installation:** Single-sided L-shaped tie; nails to joist face and beam top. Symmetrical design — no left/right distinction.

**Allowable Loads (SPF/HF, 160% load duration):**

| Load | Value | Notes |
|------|-------|-------|
| Uplift | 380 lbs | With 2½" nails |
| Lateral F₁ | 75 lbs | Along joist |
| Lateral F₂ | 70 lbs | Across joist |
| Uplift (1½" nails) | 310 lbs | Reduced capacity |

*Note: Primary lateral resistance is provided by blocking toe-nails (see below), not by hurricane ties. The H2.5ASS primarily prevents joist uplift under wind loading.*

### Rim Joist Connection
- Rim joists at x=0" and x=192" (east and west ends)
- Toe-nailed to beam top: 3-16d nails per connection
- End-nailed through rim into field joists: 3-16d nails per joist end

---

## Blocking at Beam Lines

Blocking transfers diaphragm shear from the plywood floor to the beams — critical for the lateral load path (see [0-readme.md](0-readme.md) for full lateral system description).

- **Material:** 2×8 PT (matches joists)
- **Length:** 14.5" each (16" o.c. minus 1.5" joist thickness)
- **Quantity:** 12 blocks per beam line × 2 beams = **24 blocks**
- **Location:** Between each joist pair, directly over each beam
- **Installation:** Toe-nail 3-8d per end, or Simpson A35 framing angles

---

## Cut List

| Component | Size | Length | Qty | Notes |
|-----------|------|--------|-----|-------|
| Field joists | 2×8 PT | 12' (144") | 11 | Purchase 12' stock |
| Rim joists | 2×8 PT | 16' (192") | 2 | Purchase 16' stock |
| Blocking | 2×8 PT | 14.5" | 24 | Cut from 2×8 stock (3 per 4' offcut) |

### Blocking Stock Calculation
24 blocks × 14.5" = 348" needed. Each 12' board yields 9 blocks (9 × 14.5" = 130.5" < 144"). Need 3 boards, with some waste. Alternatively, cut from joist offcuts if any are available.

---

## Nailing Schedule (Floor Diaphragm)

| Connection | Fastener | Spacing |
|------------|----------|---------|
| Plywood to joists (edges) | 8d ring-shank | 6" o.c. |
| Plywood to joists (field) | 8d ring-shank | 12" o.c. |
| Plywood to blocking | 8d ring-shank | 6" o.c. |
| Blocking to beam (toe-nail) | 3-8d | Each end |

---

## Notes

- Joists run N-S, beams run E-W — joists bear directly on top of beams, secured with H2.5ASS hurricane ties
- The 12' joist length exactly matches the shed's N-S width (1.5' cantilever + 9' span + 1.5' cantilever = 12')
- Cantilevers support exterior wall loads (wall DL + roof tributary)
- All PT lumber is incised — Ci factors are applied to Fb (0.80) and E (0.95)
- Cr = 1.15 (repetitive member factor) applies because joists are at 16" o.c. with plywood sheathing
- Calculator: `node shed/joist.js --live=60` (or just `node shed/joist.js` for defaults)
